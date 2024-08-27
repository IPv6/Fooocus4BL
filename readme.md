# Fooocus4BL

* Fooocus4BL: [Fooocus](https://github.com/lllyasviel/Fooocus) with some Extra Features

* Extra ControNets:
  - ADepthF. Input: BW Depth map (black = far)
  - ARecolor. Input: Colored map
  - ALightQ. Input: BW contrast map
  - AShapeC. Input: BW contrast map

  - ACanny. Input: BW edges/lines (PyraCanny model, 1px white lines)
  - ALineA. Input: BW edges/lines (MistoLine model, white lines)

  - **Extra ControNets specifics:**
  - inputs are not preprocessed at all. content must conform to controlnet behaviour
  - inpaint mode: inputs automatically clipped to inpainting zone

* Photopea Tab: Image editor with additional buttons 
  - convenience buttons like "Gallery->Pea", "Pea->Vary", "Pea->Image Prompt" etc

* Image Prompt Tab: Parameters auto-setup with smart file parsing
  - file drop named like "etcetc-CPDS-sa60-w100.png" will automatically set type to "CPDS", "Stop At" to 0.6 and "Weight" to 1.0

* Minor improvements
  - Alternative upscaler: https://openmodeldb.info/models/4x-realesrgan-x4plus-anime-6b
  - Alternative upscaler: https://openmodeldb.info/models/2x-realesrganv2-animevideo-xsx2
  - Safety checks
