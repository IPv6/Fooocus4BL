# Fooocus4BL

* Fooocus4BL: [Fooocus](https://github.com/lllyasviel/Fooocus) with some additions

* Extra ControNets:
  - ADepth. Input: BW Depth map (far = black)
  - ARecolor. Input: Color photo
  - ALight. Input: BW emissions map

  - ACanny. Input: BW edges/lines (PyraCanny model, 1px white lines)
  - ASketch. Input: BW scribble (white lines)
  - ASEdge. Input: BW edges/lines (MistoLine model, white lines)

* Extra ControNets specifics:
  - inputs are not preprocessed
  - in case of inpaint inputs automatically clipped to inpainting zone