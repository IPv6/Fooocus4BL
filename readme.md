# Fooocus4BL

* Fooocus4BL: [Fooocus](https://github.com/lllyasviel/Fooocus) with some additions

* Extra ControNets:
  - ADepth. Input: Depth map (BW)
  - ARecolor. Input: BW photo
  - ALight. Input: BW emissions map

  - ACanny. Input: BW 1px lines (PyraCanny model)
  - ASketch. Input: BW scribble
  - ASEdge. Input: BW edges/lines (MistoLine model)

* Extra ControNets specifics:
  - inputs are not preprocessed
  - in case of inpaint inputs automatically clipped to inpainting zone