# Fooocus4BL

* Fooocus4BL: [Fooocus](https://github.com/lllyasviel/Fooocus) with extra-CNs

* Extra ControNets:
  - ADepthF. Input: BW Depth map (black = far)
  - ARecolor. Input: Colored map
  - AShapeQ. Input: BW contrast map (QR-code like)
  - AShapeC. Input: BW contrast map (CPDS model)

  - ACanny. Input: BW edges/lines (PyraCanny model, 1px white lines)
  - ALineA. Input: BW edges/lines (MistoLine model, white lines)

* Extra ControNets specifics:
  - inputs are not preprocessed
  - in case of inpaint inputs automatically clipped to inpainting zone
