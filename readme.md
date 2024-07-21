# Fooocus4BL

* Fooocus4BL: [Fooocus](https://github.com/lllyasviel/Fooocus) with extra features

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

* Photopea tab with buttons "Gallery->Pea", "Pea->Vary" etc
