import { Filter, GlProgram, defaultFilterVert, UniformGroup } from "pixi.js";

// WebGL1-compatible fragment shader (no #version 300 es).
// PixiJS v8 adds #define shims so `in`/`out`/`finalColor`/`texture` all work.
// uInputSize.zw = (1/width, 1/height) of the filter input texture — auto-injected
// by FilterSystem from the vertex shader uniform declaration in defaultFilterVert.
const frag = `
in vec2 vTextureCoord;
out vec4 finalColor;

uniform sampler2D uTexture;
uniform vec4 uInputSize;
uniform vec2 uSize;

void main(void) {
  vec2 block = uSize * uInputSize.zw;
  vec2 coord = floor(vTextureCoord / block) * block + block * 0.5;
  finalColor = texture(uTexture, coord);
}
`;

export class PixelateFilter extends Filter {
  constructor(size = 3) {
    const glProgram = GlProgram.from({
      vertex: defaultFilterVert,
      fragment: frag,
      name: "pixelate-filter",
      preferredFragmentPrecision: "highp",
    });

    super({
      glProgram,
      resources: {
        pixelateUniforms: new UniformGroup({
          uSize: { value: new Float32Array([size, size]), type: "vec2<f32>" },
        }),
      },
    });
  }

  get size(): number {
    return this.resources.pixelateUniforms.uniforms.uSize[0];
  }

  set size(value: number) {
    const u = this.resources.pixelateUniforms.uniforms;
    u.uSize[0] = value;
    u.uSize[1] = value;
  }
}
