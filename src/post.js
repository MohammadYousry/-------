/* Post-processing: the scene is drawn into an HDR buffer, bright parts (lamps, hearts, neon, sun) are blurred
   into a soft glow, then everything is tone-mapped to the screen in one pass. Used on the "Pretty" setting. */
(function (MM) {
  'use strict';
  const T = THREE;

  const VERT = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';

  class Post {
    constructor(renderer) {
      this.r = renderer;
      const ext = renderer.extensions;
      this.ok = !!(renderer.capabilities && renderer.capabilities.isWebGL2 && ext && (ext.has('EXT_color_buffer_float') || ext.has('EXT_color_buffer_half_float')));
      if (!this.ok) return;
      this.strength = 0.6;
      this.tilt = 0.7;
      const rt = (w, h, samples) => new T.WebGLRenderTarget(w, h, { type: T.HalfFloatType, samples: samples || 0, depthBuffer: !!samples });
      this.scene = rt(4, 4, 4);
      this.bright = rt(2, 2); this.a1 = rt(2, 2); this.b1 = rt(2, 2); this.a2 = rt(2, 2); this.b2 = rt(2, 2); this.sA = rt(2, 2); this.sB = rt(2, 2);
      [this.bright, this.a1, this.b1, this.a2, this.b2, this.sA, this.sB].forEach((t) => { t.texture.minFilter = t.texture.magFilter = T.LinearFilter; t.depthBuffer = false; });
      this.quadScene = new T.Scene();
      this.quadCam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      this.quad = new T.Mesh(new T.PlaneGeometry(2, 2), null);
      this.quad.frustumCulled = false;
      this.quadScene.add(this.quad);
      this.mBright = new T.ShaderMaterial({
        uniforms: { tMap: { value: null }, uTh: { value: 0.82 } }, vertexShader: VERT, depthTest: false, depthWrite: false,
        fragmentShader: 'uniform sampler2D tMap; uniform float uTh; varying vec2 vUv; void main(){ vec3 c = texture2D(tMap, vUv).rgb; float l = max(c.r, max(c.g, c.b)); float k = smoothstep(uTh, uTh + 0.6, l); gl_FragColor = vec4(c * k, 1.0); }',
      });
      this.mBlur = new T.ShaderMaterial({
        uniforms: { tMap: { value: null }, uDir: { value: new T.Vector2() } }, vertexShader: VERT, depthTest: false, depthWrite: false,
        fragmentShader: [
          'uniform sampler2D tMap; uniform vec2 uDir; varying vec2 vUv;',
          'void main(){',
          '  vec3 c = texture2D(tMap, vUv).rgb * 0.227027;',
          '  c += texture2D(tMap, vUv + uDir * 1.3846).rgb * 0.316216; c += texture2D(tMap, vUv - uDir * 1.3846).rgb * 0.316216;',
          '  c += texture2D(tMap, vUv + uDir * 3.2308).rgb * 0.070270; c += texture2D(tMap, vUv - uDir * 3.2308).rgb * 0.070270;',
          '  gl_FragColor = vec4(c, 1.0);',
          '}',
        ].join('\n'),
      });
      this.mOut = new T.ShaderMaterial({
        uniforms: { tScene: { value: null }, tB1: { value: null }, tB2: { value: null }, tSoft: { value: null }, uStr: { value: this.strength }, uTilt: { value: 0.75 }, uSat: { value: 1.07 }, uCon: { value: 1.07 }, uVig: { value: 0.42 }, uSeed: { value: 0 } }, vertexShader: VERT, depthTest: false, depthWrite: false,
        fragmentShader: [
          'uniform sampler2D tScene; uniform sampler2D tB1; uniform sampler2D tB2; uniform sampler2D tSoft; uniform float uStr; uniform float uTilt; uniform float uSat; uniform float uCon; uniform float uVig; uniform float uSeed; varying vec2 vUv;',
          'void main(){',
          '  vec3 c = texture2D(tScene, vUv).rgb;',
          // soft focus on the far background (the top of the frame) and a touch on the near foreground
          '  float tilt = (smoothstep(0.6, 0.98, vUv.y) + smoothstep(0.16, 0.0, vUv.y) * 0.45) * uTilt;',
          '  c = mix(c, texture2D(tSoft, vUv).rgb, tilt);',
          '  vec3 b = texture2D(tB1, vUv).rgb * 0.75 + texture2D(tB2, vUv).rgb * 1.0;',
          '  gl_FragColor = vec4(c + b * uStr, 1.0);',
          '  #include <tonemapping_fragment>',
          // grade: a little more colour, gentle contrast, warm highlights and cool shadows, a vignette
          '  vec3 g = max(gl_FragColor.rgb, 0.0);',
          '  float l = dot(g, vec3(0.2126, 0.7152, 0.0722));',
          '  g = max(mix(vec3(l), g, uSat), 0.0);',
          '  g *= 1.0 + vec3(0.03, 0.008, -0.025) * smoothstep(0.25, 0.9, l);',
          '  g += vec3(-0.006, 0.0, 0.014) * (1.0 - smoothstep(0.0, 0.3, l));',
          '  vec3 p = pow(max(g, 0.0), vec3(0.4545));',
          '  p = clamp((p - 0.5) * uCon + 0.5, 0.0, 1.0);',
          '  g = pow(p, vec3(2.2));',
          '  vec2 vv = vUv - 0.5; g *= clamp(1.0 - dot(vv, vv) * uVig, 0.0, 1.0);',
          '  gl_FragColor.rgb = g;',
          '  #include <colorspace_fragment>',
          '  float n = fract(sin(dot(gl_FragCoord.xy + uSeed, vec2(12.9898, 78.233))) * 43758.5453);',
          '  gl_FragColor.rgb += (n - 0.5) * 0.018;',
          '}',
        ].join('\n'),
      });
      this.mOut.toneMapped = true;
      this.size = new T.Vector2();
    }

    resize() {
      const s = this.r.getDrawingBufferSize(new T.Vector2());
      if (s.x === this.size.x && s.y === this.size.y) return;
      this.size.copy(s);
      const W = Math.max(2, s.x), H = Math.max(2, s.y);
      this.scene.setSize(W, H);
      this.bright.setSize(Math.ceil(W / 2), Math.ceil(H / 2));
      this.a1.setSize(Math.ceil(W / 4), Math.ceil(H / 4)); this.b1.setSize(Math.ceil(W / 4), Math.ceil(H / 4));
      this.a2.setSize(Math.ceil(W / 8), Math.ceil(H / 8)); this.b2.setSize(Math.ceil(W / 8), Math.ceil(H / 8));
      this.sA.setSize(Math.ceil(W / 3), Math.ceil(H / 3)); this.sB.setSize(Math.ceil(W / 3), Math.ceil(H / 3));
    }

    pass(mat, target) { this.quad.material = mat; this.r.setRenderTarget(target); this.r.render(this.quadScene, this.quadCam); }
    blur(src, tmp, dst) {
      const m = this.mBlur;
      m.uniforms.tMap.value = src.texture; m.uniforms.uDir.value.set(1 / tmp.width, 0); this.pass(m, tmp);
      m.uniforms.tMap.value = tmp.texture; m.uniforms.uDir.value.set(0, 1 / dst.height); this.pass(m, dst);
    }

    // Some phones list the extension but still can't draw into these buffers: check once, then fall back for good.
    verify() {
      const r = this.r, gl = r.getContext();
      for (const t of [this.scene, this.bright]) {
        r.setRenderTarget(t);
        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) { r.setRenderTarget(null); this.ok = false; return false; }
      }
      r.setRenderTarget(null);
      this.verified = true;
      return true;
    }

    // views: [{ cam, x, y, w, h }] in CSS pixels, y measured from the bottom like WebGL viewports.
    // Returns false when the glow can't run here (the caller then draws normally).
    render(scene, views) {
      const r = this.r, pr = r.getPixelRatio();
      this.resize();
      if (!this.verified && !this.verify()) return false;
      const rt = this.scene;
      r.setRenderTarget(rt);
      rt.scissorTest = views.length > 1;
      r.clear();
      views.forEach((v) => {
        rt.viewport.set(v.x * pr, v.y * pr, v.w * pr, v.h * pr);
        rt.scissor.set(v.x * pr, v.y * pr, v.w * pr, v.h * pr);
        r.setRenderTarget(rt);
        r.render(scene, v.cam);
      });
      rt.viewport.set(0, 0, rt.width, rt.height); rt.scissorTest = false;
      this.mBright.uniforms.tMap.value = rt.texture; this.pass(this.mBright, this.bright);
      this.blur(this.bright, this.a1, this.b1);
      this.blur(this.b1, this.a2, this.b2);
      if (this.tilt > 0) { this.blur(rt, this.sA, this.sB); this.blur(this.sB, this.sA, this.sB); }
      const o = this.mOut;
      o.uniforms.tScene.value = rt.texture; o.uniforms.tB1.value = this.b1.texture; o.uniforms.tB2.value = this.b2.texture; o.uniforms.uStr.value = this.strength;
      o.uniforms.tSoft.value = this.sB.texture; o.uniforms.uTilt.value = this.tilt; o.uniforms.uSeed.value = (o.uniforms.uSeed.value + 17.3) % 1000;
      r.setRenderTarget(null);
      r.setViewport(0, 0, this.size.x / pr, this.size.y / pr);
      this.quad.material = o;
      r.render(this.quadScene, this.quadCam);
    }
  }

  MM.Post = Post;
})(window.MM);
