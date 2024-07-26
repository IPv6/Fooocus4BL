# Fooocus4BL

* Fooocus4BL: [Fooocus](https://github.com/lllyasviel/Fooocus) with some Extra Features

* Extra ControNets:
  - ADepthF. Input: BW Depth map (black = far)
  - ARecolor. Input: Colored map
  - AShapeQ. Input: BW contrast map (QR-code like)
  - AShapeC. Input: BW contrast map (CPDS model)

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
  - Safety checks
  - Proper handling of negative-only styles