import torch
import ldm_patched.modules.samplers
import ldm_patched.modules.model_management

from collections import namedtuple
from ldm_patched.contrib.external_align_your_steps import AlignYourStepsScheduler
from ldm_patched.contrib.external_custom_sampler import SDTurboScheduler
from ldm_patched.k_diffusion import sampling as k_diffusion_sampling
from ldm_patched.modules.samplers import normal_scheduler, simple_scheduler, ddim_scheduler
from ldm_patched.modules.model_base import SDXLRefiner, SDXL
from ldm_patched.modules.conds import CONDRegular
from ldm_patched.modules.sampler_helpers import get_additional_models, get_models_from_cond, cleanup_additional_models
from ldm_patched.modules.samplers import resolve_areas_and_cond_masks, calculate_start_end_timesteps, \
    create_cond_with_same_area_if_none, pre_run_control, apply_empty_x_to_equal_area, encode_model_conds, CFGGuider, \
    process_conds
from ldm_patched.modules.model_patcher import ModelPatcher
from modules.util import sys_dump_pythonobj

current_refiner = None
refiner_switch_step = -1


@torch.no_grad()
@torch.inference_mode()
def clip_separate_inner(c, p, target_model=None, target_clip=None):
    if target_model is None or isinstance(target_model, SDXLRefiner):
        c = c[..., -1280:].clone()
    elif isinstance(target_model, SDXL):
        c = c.clone()
    else:
        p = None
        c = c[..., :768].clone()

        final_layer_norm = target_clip.cond_stage_model.clip_l.transformer.text_model.final_layer_norm

        final_layer_norm_origin_device = final_layer_norm.weight.device
        final_layer_norm_origin_dtype = final_layer_norm.weight.dtype

        c_origin_device = c.device
        c_origin_dtype = c.dtype

        final_layer_norm.to(device='cpu', dtype=torch.float32)
        c = c.to(device='cpu', dtype=torch.float32)

        c = torch.chunk(c, int(c.size(1)) // 77, 1)
        c = [final_layer_norm(ci) for ci in c]
        c = torch.cat(c, dim=1)

        final_layer_norm.to(device=final_layer_norm_origin_device, dtype=final_layer_norm_origin_dtype)
        c = c.to(device=c_origin_device, dtype=c_origin_dtype)
    return c, p


@torch.no_grad()
@torch.inference_mode()
def clip_separate(cond, target_model=None, target_clip=None):
    results = []

    for c, px in cond:
        p = px.get('pooled_output', None)
        c, p = clip_separate_inner(c, p, target_model=target_model, target_clip=target_clip)
        p = {} if p is None else {'pooled_output': p.clone()}
        results.append([c, p])

    return results


@torch.no_grad()
@torch.inference_mode()
def clip_separate_after_preparation(cond, target_model=None, target_clip=None):
    results = []

    for x in cond:
        p = x.get('pooled_output', None)
        c = x['model_conds']['c_crossattn'].cond

        c, p = clip_separate_inner(c, p, target_model=target_model, target_clip=target_clip)

        result = {'model_conds': {'c_crossattn': CONDRegular(c)}}

        if p is not None:
            result['pooled_output'] = p.clone()

        results.append(result)

    return results

def sample_hacked(model, noise, positive, negative, cfg, device, sampler, sigmas, model_options={}, latent_image=None, denoise_mask=None, callback=None, disable_pbar=False, seed=None):
    cfg_guider = CFGGuiderHacked(model)
    cfg_guider.set_conds(positive, negative)
    # TODO cfg_guider.inner_set_conds({"positive": positive})  # negative is not necessary in Fooocus, 0.5s faster.
    cfg_guider.set_cfg(cfg)
    return cfg_guider.sample(noise, latent_image, sampler, sigmas, denoise_mask, callback, disable_pbar, seed)


class CFGGuiderHacked(CFGGuider):
    def inner_sample(self, noise, latent_image, device, sampler, sigmas, denoise_mask, callback, disable_pbar, seed):
        global current_refiner

        if latent_image is not None and torch.count_nonzero(latent_image) > 0: #Don't shift the empty latent image.
            latent_image = self.inner_model.process_latent_in(latent_image)

        self.conds = process_conds(self.inner_model, noise, self.conds, device, latent_image, denoise_mask, seed)

        extra_args = {"model_options": self.model_options, "seed":seed}

        if current_refiner is not None and hasattr(current_refiner.model, 'extra_conds'):
            positive_refiner = clip_separate_after_preparation(self.conds['positive'], target_model=current_refiner.model)
            negative_refiner = clip_separate_after_preparation(self.conds['negative'], target_model=current_refiner.model)

            positive_refiner = encode_model_conds(current_refiner.model.extra_conds, positive_refiner, noise, device,
                                                  "positive", latent_image=latent_image, denoise_mask=denoise_mask)
            negative_refiner = encode_model_conds(current_refiner.model.extra_conds, negative_refiner, noise, device,
                                                  "negative", latent_image=latent_image, denoise_mask=denoise_mask)

        def refiner_switch():
            cleanup_additional_models(
                set(get_models_from_cond(self.conds['positive'], "control") + get_models_from_cond(self.conds['negative'], "control")))

            # extra_args["cond"] = positive_refiner
            # extra_args["uncond"] = negative_refiner
            self.set_conds( [[None, positive_refiner[0]]], [[None, negative_refiner[0]]] )

            # clear ip-adapter for refiner
            extra_args['model_options'] = {k: {} if k == 'transformer_options' else v for k, v in
                                           extra_args['model_options'].items()}

            # current_refiner = SDXL object || ModelPatcher
            model_dtype = None
            if isinstance(current_refiner, ModelPatcher):
                model_dtype = current_refiner.model_dtype()
            else:
                model_dtype = current_refiner.get_dtype()
            # models, inference_memory = get_additional_models(positive_refiner, negative_refiner)
            models, inference_memory = get_additional_models(self.conds, model_dtype)
            ldm_patched.modules.model_management.load_models_gpu(
                [current_refiner] + models,
                self.model_patcher.memory_required([noise.shape[0] * 2] + list(noise.shape[1:])) + inference_memory)

            self.inner_model = current_refiner.model
            print('Refiner Swapped')
            return

        def callback_wrap(step, x0, x, total_steps):
            if step == refiner_switch_step and current_refiner is not None:
                refiner_switch()
            if callback is not None:
                # residual_noise_preview = x - x0
                # residual_noise_preview /= residual_noise_preview.std()
                # residual_noise_preview *= x0.std()
                callback(step, x0, x, total_steps)

        samples = sampler.sample(self, sigmas, extra_args, callback_wrap, noise, latent_image, denoise_mask, disable_pbar)
        return self.inner_model.process_latent_out(samples.to(torch.float32))


@torch.no_grad()
@torch.inference_mode()
def calculate_sigmas_scheduler_hacked(model, scheduler_name, steps):
    # model = SDXL object || ModelPatcher
    # sys_dump_pythonobj(model, False, "- calculate_sigmas_scheduler_hacked model")
    if isinstance(model, ModelPatcher):
        model_sampling = model.get_model_object("model_sampling")
    else:
        model_sampling = model.model_sampling
    if scheduler_name == "karras":
        sigmas = k_diffusion_sampling.get_sigmas_karras(n=steps, sigma_min=float(model_sampling.sigma_min), sigma_max=float(model_sampling.sigma_max))
    elif scheduler_name == "exponential":
        sigmas = k_diffusion_sampling.get_sigmas_exponential(n=steps, sigma_min=float(model_sampling.sigma_min), sigma_max=float(model_sampling.sigma_max))
    elif scheduler_name == "normal":
        sigmas = normal_scheduler(model_sampling, steps)
    elif scheduler_name == "simple":
        sigmas = simple_scheduler(model_sampling, steps)
    elif scheduler_name == "ddim_uniform":
        sigmas = ddim_scheduler(model_sampling, steps)
    elif scheduler_name == "sgm_uniform":
        sigmas = normal_scheduler(model_sampling, steps, sgm=True)
    elif scheduler_name == "turbo":
        sigmas = SDTurboScheduler().get_sigmas(model=model, steps=steps, denoise=1.0)[0]
    elif scheduler_name == "align_your_steps":
        model_type = 'SDXL' if isinstance(model.latent_format, ldm_patched.modules.latent_formats.SDXL) else 'SD1'
        sigmas = AlignYourStepsScheduler().get_sigmas(model_type=model_type, steps=steps, denoise=1.0)[0]
    else:
        raise TypeError("error invalid scheduler")
    return sigmas

# used-by-Fooocus
ldm_patched.modules.samplers.calculate_sigmas = calculate_sigmas_scheduler_hacked
ldm_patched.modules.samplers.sample = sample_hacked
