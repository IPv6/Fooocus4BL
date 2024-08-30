from collections import OrderedDict

import modules.core as core
import torch
from ldm_patched.contrib.external_upscale_model import ImageUpscaleWithModel
from ldm_patched.pfn.architecture.RRDB import RRDBNet as ESRGAN
from modules.config import downloading_upscale_model

opImageUpscaleWithModel = ImageUpscaleWithModel()
model = None

from ldm_patched.pfn.architecture.SRVGG import SRVGGNetCompact as RealESRGANv2
from modules.config import downloading_upscale_model_anime6b, downloading_upscale_model_xsx2
model_anime6b = None
model_xsx2 = None

def perform_upscale(img):
    global model

    print(f'Upscaling image with shape {str(img.shape)} ...')

    if model is None:
        model_filename = downloading_upscale_model()
        sd = torch.load(model_filename, weights_only=True)
        sdo = OrderedDict()
        for k, v in sd.items():
            sdo[k.replace('residual_block_', 'RDB')] = v
        del sd
        model = ESRGAN(sdo)
        model.cpu()
        model.eval()

    img = core.numpy_to_pytorch(img)
    img = opImageUpscaleWithModel.upscale(model, img)[0]
    img = core.pytorch_to_numpy(img)[0]

    return img

def perform_upscale_anime6b(img): # Fooocus4BL
    global model_anime6b

    print(f'Upscaling image (Anime6b) with shape {str(img.shape)} ...')

    if model_anime6b is None:
        model_filename = downloading_upscale_model_anime6b()
        sd = torch.load(model_filename)
        sdo = OrderedDict()
        for k, v in sd.items():
            sdo[k.replace('residual_block_', 'RDB')] = v
        del sd
        model_anime6b = ESRGAN(sdo)
        model_anime6b.cpu()
        model_anime6b.eval()

    img = core.numpy_to_pytorch(img)
    img = opImageUpscaleWithModel.upscale(model_anime6b, img)[0]
    img = core.pytorch_to_numpy(img)[0]

    return img

def perform_upscale_xsx2(img): # Fooocus4BL
    global model_xsx2

    print(f'Upscaling (AnimeVideo_xsx2) image with shape {str(img.shape)} ...')

    if model_xsx2 is None:
        model_filename = downloading_upscale_model_xsx2()
        sd = torch.load(model_filename, map_location=torch.device('cpu'))
        sdo = OrderedDict()
        for k, v in sd.items():
            sdo[k.replace('residual_block_', 'RDB')] = v
        del sd
        model_xsx2 = RealESRGANv2(sdo)
        model_xsx2.cpu()
        model_xsx2.eval()

    img = core.numpy_to_pytorch(img)
    img = opImageUpscaleWithModel.upscale(model_xsx2, img)[0]
    img = core.pytorch_to_numpy(img)[0]

    return img