/* Graphics helpers: cached materials, canvas textures, 3D text, heart geometry, sky and particles. */
(function (MM) {
  'use strict';
  const T = THREE;
  const G = (MM.G = {});
  const FONT = '"Baloo Bhaijaan 2","Trebuchet MS",sans-serif';
  G.FONT = FONT;

  /* ---------- materials ---------- */
  const matCache = {};
  G.mat = function (color, o) {
    o = o || {};
    const key = [color, o.r, o.m, o.e, o.ei, o.t, o.o, o.flat, o.ds].join('|');
    if (matCache[key]) return matCache[key];
    const m = new T.MeshStandardMaterial({
      color: color,
      roughness: o.r != null ? o.r : 0.75,
      metalness: o.m != null ? o.m : 0.0,
      flatShading: !!o.flat,
    });
    if (o.e != null) { m.emissive = new T.Color(o.e); m.emissiveIntensity = o.ei != null ? o.ei : 1; }
    if (o.t) { m.transparent = true; m.opacity = o.o != null ? o.o : 0.5; m.depthWrite = false; }
    if (o.ds) m.side = T.DoubleSide;
    matCache[key] = m;
    return m;
  };
  G.basic = function (color, o) {
    o = o || {};
    const key = 'b|' + color + '|' + o.o + '|' + o.add;
    if (matCache[key]) return matCache[key];
    const m = new T.MeshBasicMaterial({ color, transparent: o.o != null, opacity: o.o != null ? o.o : 1, depthWrite: o.o == null, fog: o.fog !== false });
    if (o.add) m.blending = T.AdditiveBlending;
    matCache[key] = m;
    return m;
  };

  /* ---------- geometry cache ---------- */
  const geoCache = {};
  G.box = (w, h, d) => geoCache['b' + w + h + d] || (geoCache['b' + w + h + d] = new T.BoxGeometry(w, h, d));
  G.sphere = (r, ws, hs) => { const k = 's' + r + ws + hs; return geoCache[k] || (geoCache[k] = new T.SphereGeometry(r, ws || 18, hs || 14)); };
  G.cyl = (rt, rb, h, s) => { const k = 'c' + rt + rb + h + s; return geoCache[k] || (geoCache[k] = new T.CylinderGeometry(rt, rb, h, s || 18)); };
  G.capsule = (r, l) => { const k = 'p' + r + l; return geoCache[k] || (geoCache[k] = new T.CapsuleGeometry(r, l, 6, 14)); };
  G.cone = (r, h, s) => { const k = 'k' + r + h + s; return geoCache[k] || (geoCache[k] = new T.ConeGeometry(r, h, s || 18)); };
  G.torus = (r, t, a) => { const k = 't' + r + t + a; return geoCache[k] || (geoCache[k] = new T.TorusGeometry(r, t, 10, 28, a || Math.PI * 2)); };

  G.mesh = function (geo, mat, x, y, z, parent) {
    const m = new T.Mesh(geo, mat);
    m.position.set(x || 0, y || 0, z || 0);
    m.castShadow = true; m.receiveShadow = true;
    if (parent) parent.add(m);
    return m;
  };

  /* ---------- heart ---------- */
  G.heartShape = function (s) {
    s = s || 1;
    const sh = new T.Shape();
    sh.moveTo(0, -0.9 * s);
    sh.bezierCurveTo(-0.15 * s, -0.75 * s, -1.0 * s, -0.25 * s, -1.0 * s, 0.25 * s);
    sh.bezierCurveTo(-1.0 * s, 0.75 * s, -0.4 * s, 0.95 * s, 0, 0.5 * s);
    sh.bezierCurveTo(0.4 * s, 0.95 * s, 1.0 * s, 0.75 * s, 1.0 * s, 0.25 * s);
    sh.bezierCurveTo(1.0 * s, -0.25 * s, 0.15 * s, -0.75 * s, 0, -0.9 * s);
    return sh;
  };
  G.heartGeo = function () {
    if (geoCache.heart) return geoCache.heart;
    const g = new T.ExtrudeGeometry(G.heartShape(0.5), { depth: 0.22, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.07, bevelSegments: 3, curveSegments: 16 });
    g.center();
    return (geoCache.heart = g);
  };

  /* ---------- canvas textures ---------- */
  function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  function toTex(c, srgb) { const t = new T.CanvasTexture(c); if (srgb !== false) t.colorSpace = T.SRGBColorSpace; t.anisotropy = 4; return t; }

  const texCache = {};
  G.tex = function (name) {
    if (texCache[name]) return texCache[name];
    const c = canvas(128, 128), x = c.getContext('2d');
    x.translate(64, 64);
    if (name === 'heart') {
      x.fillStyle = '#fff';
      x.beginPath(); x.moveTo(0, 40);
      x.bezierCurveTo(-8, 32, -54, 6, -54, -18); x.bezierCurveTo(-54, -46, -18, -54, 0, -28);
      x.bezierCurveTo(18, -54, 54, -46, 54, -18); x.bezierCurveTo(54, 6, 8, 32, 0, 40); x.fill();
    } else if (name === 'sparkle') {
      const g = x.createRadialGradient(0, 0, 0, 0, 0, 60); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.25, 'rgba(255,255,255,.6)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = g; x.fillRect(-64, -64, 128, 128);
      x.fillStyle = '#fff';
      for (let i = 0; i < 4; i++) { x.rotate(Math.PI / 2); x.beginPath(); x.moveTo(-5, 0); x.lineTo(0, -60); x.lineTo(5, 0); x.fill(); }
    } else if (name === 'dust') {
      const g = x.createRadialGradient(0, 0, 0, 0, 0, 60); g.addColorStop(0, 'rgba(255,255,255,.9)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = g; x.beginPath(); x.arc(0, 0, 60, 0, 7); x.fill();
    } else if (name === 'square') {
      x.fillStyle = '#fff'; x.fillRect(-40, -26, 80, 52);
    } else if (name === 'paw') {
      x.fillStyle = '#fff';
      x.beginPath(); x.ellipse(0, 18, 26, 22, 0, 0, 7); x.fill();
      [[-30, -14], [-11, -32], [11, -32], [30, -14]].forEach(([a, b]) => { x.beginPath(); x.ellipse(a, b, 11, 14, 0, 0, 7); x.fill(); });
    } else if (name === 'note') {
      x.fillStyle = '#fff'; x.font = 'bold 110px serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('♪', 0, 4);
    } else if (name === 'glow') {
      const g = x.createRadialGradient(0, 0, 0, 0, 0, 64); g.addColorStop(0, 'rgba(255,255,255,.85)'); g.addColorStop(0.4, 'rgba(255,255,255,.25)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = g; x.fillRect(-64, -64, 128, 128);
    }
    return (texCache[name] = toTex(c));
  };

  G.glitterTex = function (base, fleck) {
    const k = 'gl' + base + fleck;
    if (texCache[k]) return texCache[k];
    const c = canvas(256, 256), x = c.getContext('2d');
    x.fillStyle = base; x.fillRect(0, 0, 256, 256);
    const r = MM.rng(7);
    for (let i = 0; i < 1600; i++) {
      x.fillStyle = r() < 0.5 ? fleck : 'rgba(255,255,255,' + (0.2 + r() * 0.5) + ')';
      x.fillRect(r() * 256, r() * 256, 1 + r() * 2, 1 + r() * 2);
    }
    for (let y = 0; y < 256; y += 4) { x.fillStyle = 'rgba(0,0,0,.05)'; x.fillRect(0, y, 256, 1); }
    const t = toTex(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(2, 2);
    return (texCache[k] = t);
  };

  G.woodTex = function (base, dark) {
    const k = 'wd' + base + dark;
    if (texCache[k]) return texCache[k];
    const c = canvas(256, 256), x = c.getContext('2d');
    x.fillStyle = base; x.fillRect(0, 0, 256, 256);
    const r = MM.rng(3);
    for (let i = 0; i < 8; i++) { x.fillStyle = 'rgba(0,0,0,.12)'; x.fillRect(0, i * 32, 256, 1.5); }
    for (let i = 0; i < 140; i++) {
      x.strokeStyle = dark; x.globalAlpha = 0.08 + r() * 0.12; x.lineWidth = 1 + r() * 2;
      const y = r() * 256; x.beginPath(); x.moveTo(0, y); x.bezierCurveTo(80, y + r() * 6 - 3, 170, y + r() * 6 - 3, 256, y); x.stroke();
    }
    x.globalAlpha = 1;
    const t = toTex(c); t.wrapS = t.wrapT = T.RepeatWrapping;
    return (texCache[k] = t);
  };

  G.windowsTex = function (wall, lit, seed) {
    const k = 'wn' + wall + lit + seed;
    if (texCache[k]) return texCache[k];
    const c = canvas(128, 256), x = c.getContext('2d');
    x.fillStyle = wall; x.fillRect(0, 0, 128, 256);
    const r = MM.rng(seed || 5);
    for (let yy = 8; yy < 250; yy += 18) for (let xx = 8; xx < 124; xx += 20) {
      x.fillStyle = r() < 0.55 ? lit : 'rgba(0,0,0,.35)'; x.fillRect(xx, yy, 12, 10);
    }
    const t = toTex(c); t.wrapS = t.wrapT = T.RepeatWrapping;
    return (texCache[k] = t);
  };

  G.gridTex = function (base, line) {
    const k = 'grid' + base + line;
    if (texCache[k]) return texCache[k];
    const c = canvas(128, 128), x = c.getContext('2d');
    x.fillStyle = base; x.fillRect(0, 0, 128, 128);
    x.strokeStyle = line; x.globalAlpha = 0.55; x.lineWidth = 2; x.strokeRect(1, 1, 126, 126);
    x.globalAlpha = 0.3; x.beginPath(); x.moveTo(0, 64); x.lineTo(40, 64); x.lineTo(56, 48); x.lineTo(128, 48); x.stroke();
    x.beginPath(); x.arc(56, 48, 4, 0, 7); x.fillStyle = line; x.fill();
    const t = toTex(c); t.wrapS = t.wrapT = T.RepeatWrapping;
    return (texCache[k] = t);
  };

  G.codeTex = function () {
    if (texCache.code) return texCache.code;
    const c = canvas(256, 160), x = c.getContext('2d');
    x.fillStyle = '#10142a'; x.fillRect(0, 0, 256, 160);
    const r = MM.rng(9), cols = ['#7ee0c3', '#ff6f9c', '#ffcf6e', '#8fb6ff', '#cfd3ff'];
    for (let y = 12; y < 156; y += 11) {
      let xx = 10 + Math.floor(r() * 3) * 12;
      const n = 2 + Math.floor(r() * 4);
      for (let i = 0; i < n; i++) { const w = 12 + r() * 40; x.fillStyle = cols[Math.floor(r() * cols.length)]; x.fillRect(xx, y, w, 5); xx += w + 6; }
    }
    return (texCache.code = toTex(c));
  };

  G.ecgTex = function () {
    if (texCache.ecg) return texCache.ecg;
    const c = canvas(256, 128), x = c.getContext('2d');
    x.fillStyle = '#062421'; x.fillRect(0, 0, 256, 128);
    x.strokeStyle = 'rgba(126,224,195,.18)'; for (let i = 0; i < 256; i += 16) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 128); x.stroke(); }
    x.strokeStyle = '#7ee0c3'; x.lineWidth = 4; x.beginPath(); x.moveTo(0, 70);
    [[60, 70], [72, 60], [80, 70], [92, 70], [100, 20], [110, 110], [118, 70], [150, 70], [160, 58], [172, 70], [256, 70]].forEach(([a, b]) => x.lineTo(a, b));
    x.stroke();
    return (texCache.ecg = toTex(c));
  };

  /* ---------- text ---------- */
  // Renders text to a canvas texture; returns { tex, w, h } (w/h are canvas pixels).
  G.textTexture = function (text, o) {
    o = o || {};
    const size = o.size || 72, pad = o.pad != null ? o.pad : 28, weight = o.weight || 800;
    const font = (o.italic ? 'italic ' : '') + weight + ' ' + size + 'px ' + (o.font || FONT);
    const lines = String(text).split('\n');
    const meas = canvas(8, 8).getContext('2d'); meas.font = font;
    const lh = size * (o.lh || 1.12);
    let w = 0; lines.forEach((l) => { w = Math.max(w, meas.measureText(l).width); });
    const cw = Math.ceil(w + pad * 2), ch = Math.ceil(lh * lines.length + pad * 2 - (lh - size) );
    const c = canvas(Math.max(cw, 16), Math.max(ch, 16)), x = c.getContext('2d');
    if (o.bg) {
      x.fillStyle = o.bg;
      const r = Math.min(o.radius != null ? o.radius : 26, c.height / 2);
      x.beginPath(); x.moveTo(r, 0); x.arcTo(c.width, 0, c.width, c.height, r); x.arcTo(c.width, c.height, 0, c.height, r); x.arcTo(0, c.height, 0, 0, r); x.arcTo(0, 0, c.width, 0, r); x.fill();
      if (o.border) { x.lineWidth = 6; x.strokeStyle = o.border; x.stroke(); }
    }
    x.font = font; x.textAlign = 'center'; x.textBaseline = 'middle';
    lines.forEach((l, i) => {
      const y = pad + size / 2 + i * lh + 2;
      if (o.stroke) { x.lineWidth = o.strokeW || size / 7; x.strokeStyle = o.stroke; x.lineJoin = 'round'; x.strokeText(l, c.width / 2, y); }
      if (o.glow) { x.shadowColor = o.glow; x.shadowBlur = size / 3; }
      x.fillStyle = o.color || '#fff'; x.fillText(l, c.width / 2, y);
      x.shadowBlur = 0;
    });
    return { tex: toTex(c), w: c.width, h: c.height };
  };

  // A flat plane with text, `height` in world units. Faces +z.
  G.textPlane = function (text, height, o) {
    o = o || {};
    const tt = G.textTexture(text, o);
    // `height` is the world size of one line's font size.
    const h = height * (tt.h / (o.size || 72));
    const w = h * (tt.w / tt.h);
    const mat = new T.MeshBasicMaterial({ map: tt.tex, transparent: true, depthWrite: false, side: o.double ? T.DoubleSide : T.FrontSide, fog: o.fog !== false });
    mat.userData.ownMap = true;
    if (o.toneMapped === false) mat.toneMapped = false;
    const pg = new T.PlaneGeometry(w, h); pg.userData.own = true;
    const m = new T.Mesh(pg, mat);
    m.userData.w = w; m.userData.h = h;
    m.renderOrder = 5;
    return m;
  };

  /* ---------- photo frame texture (photo or illustrated placeholder) ---------- */
  G.placeholderPhoto = function (title, colors) {
    const c = canvas(256, 320), x = c.getContext('2d');
    const g = x.createLinearGradient(0, 0, 256, 320);
    g.addColorStop(0, colors ? colors[0] : '#ffc4d8'); g.addColorStop(1, colors ? colors[1] : '#bcd4ff');
    x.fillStyle = g; x.fillRect(0, 0, 256, 320);
    x.globalAlpha = 0.9; x.translate(128, 140); x.scale(1.4, 1.4);
    x.fillStyle = '#ff6f9c';
    x.beginPath(); x.moveTo(0, 40); x.bezierCurveTo(-8, 32, -54, 6, -54, -18); x.bezierCurveTo(-54, -46, -18, -54, 0, -28); x.bezierCurveTo(18, -54, 54, -46, 54, -18); x.bezierCurveTo(54, 6, 8, 32, 0, 40); x.fill();
    x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1;
    x.fillStyle = '#3b2340'; x.font = '700 26px ' + FONT; x.textAlign = 'center';
    x.fillText(title || '', 128, 290);
    return toTex(c);
  };
  G.photoTex = function (dataUrl, cb) {
    const img = new Image();
    img.onload = () => { const t = new T.Texture(img); t.colorSpace = T.SRGBColorSpace; t.needsUpdate = true; cb(t, img.width / img.height); };
    img.src = dataUrl;
  };

  /* ---------- sky ---------- */
  G.makeSky = function (top, bottom, opts) {
    opts = opts || {};
    const grp = new T.Group();
    const mat = new T.ShaderMaterial({
      side: T.BackSide, depthWrite: false, fog: false,
      uniforms: { top: { value: new T.Color(top) }, bottom: { value: new T.Color(bottom) }, horizon: { value: new T.Color(opts.horizon || bottom) } },
      vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: 'uniform vec3 top; uniform vec3 bottom; uniform vec3 horizon; varying vec3 vP; void main(){ float h = vP.y; vec3 c = h > 0.0 ? mix(horizon, top, pow(clamp(h,0.0,1.0),0.6)) : mix(horizon, bottom, clamp(-h*3.0,0.0,1.0)); gl_FragColor = vec4(c,1.0); }',
    });
    const sky = new T.Mesh(new T.SphereGeometry(450, 32, 16), mat);
    sky.renderOrder = -10;
    grp.add(sky);
    if (opts.stars) {
      const n = opts.stars, pos = new Float32Array(n * 3), r = MM.rng(42);
      for (let i = 0; i < n; i++) {
        const th = r() * Math.PI * 2, ph = Math.acos(0.15 + r() * 0.85);
        pos[i * 3] = 420 * Math.sin(ph) * Math.cos(th); pos[i * 3 + 1] = 420 * Math.cos(ph); pos[i * 3 + 2] = 420 * Math.sin(ph) * Math.sin(th);
      }
      const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(pos, 3));
      const pts = new T.Points(g, new T.PointsMaterial({ color: 0xffffff, size: 2.2, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.85, depthWrite: false }));
      grp.add(pts);
    }
    grp.userData.follow = true;
    return grp;
  };

  /* ---------- particles ---------- */
  class Particles {
    constructor(scene, max) {
      this.scene = scene; this.list = []; this.max = max || 420;
      this.group = new T.Group(); scene.add(this.group);
    }
    spawn(texName, pos, o) {
      let p = this.list.find((q) => !q.alive);
      if (!p) {
        if (this.list.length >= this.max) return null;
        const mat = new T.SpriteMaterial({ map: G.tex(texName), transparent: true, depthWrite: false });
        p = { sprite: new T.Sprite(mat), vel: new T.Vector3(), alive: false };
        this.group.add(p.sprite); this.list.push(p);
      }
      const s = p.sprite;
      if (s.material.map !== G.tex(texName)) { s.material.map = G.tex(texName); s.material.needsUpdate = true; }
      s.material.color.set(o.color != null ? o.color : 0xffffff);
      s.material.blending = o.add ? T.AdditiveBlending : T.NormalBlending;
      s.material.rotation = o.rot || 0;
      s.visible = true; s.position.copy(pos);
      p.vel.set(o.vx || 0, o.vy || 0, o.vz || 0);
      p.life = 0; p.max = o.life || 1; p.g = o.g || 0; p.drag = o.drag || 0;
      p.s0 = o.s0 != null ? o.s0 : 0.3; p.s1 = o.s1 != null ? o.s1 : 0; p.spin = o.spin || 0; p.alive = true; p.fadeIn = o.fadeIn || 0;
      s.scale.setScalar(p.s0);
      return p;
    }
    emit(kind, pos, o) {
      o = o || {};
      const r = Math.random, P = new T.Vector3();
      const n = o.n;
      switch (kind) {
        case 'hearts':
          for (let i = 0; i < (n || 7); i++) this.spawn('heart', P.copy(pos).add(new T.Vector3((r() - 0.5) * 0.6, r() * 0.4, (r() - 0.5) * 0.6)), { vx: (r() - 0.5) * 1.5, vy: 1.4 + r() * 1.6, vz: (r() - 0.5) * 1.5, life: 1.1 + r() * 0.5, s0: 0.22 + r() * 0.2, s1: 0.05, color: o.color || (r() < 0.5 ? 0xff6f9c : 0xff9cc0), drag: 1.2 });
          break;
        case 'sparkle':
          for (let i = 0; i < (n || 12); i++) { const a = r() * 6.28, sp = 1.5 + r() * 3; this.spawn('sparkle', pos, { vx: Math.cos(a) * sp, vy: 1 + r() * 3, vz: Math.sin(a) * sp, life: 0.5 + r() * 0.4, s0: 0.35, s1: 0, color: o.color || 0xffe08a, add: true, drag: 2.5, g: 4 }); }
          break;
        case 'dust':
          for (let i = 0; i < (n || 8); i++) { const a = (i / (n || 8)) * 6.28; this.spawn('dust', P.copy(pos).add(new T.Vector3(0, 0.1, 0)), { vx: Math.cos(a) * 2.2, vy: 0.4 + r() * 0.6, vz: Math.sin(a) * 2.2, life: 0.45, s0: 0.35, s1: 0.8, color: o.color || 0xf3e6e8, drag: 4 }); }
          break;
        case 'ring':
          for (let i = 0; i < 22; i++) { const a = (i / 22) * 6.28; this.spawn('dust', P.copy(pos).add(new T.Vector3(0, 0.15, 0)), { vx: Math.cos(a) * 7, vy: 0.6, vz: Math.sin(a) * 7, life: 0.55, s0: 0.6, s1: 1.4, color: o.color || 0xfff1e0, drag: 5 }); }
          break;
        case 'paw':
          this.spawn('paw', P.copy(pos), { vy: -0.2, life: 0.7, s0: 0.35, s1: 0.2, color: 0xff9cc0, rot: (r() - 0.5) });
          break;
        case 'trail':
          this.spawn('sparkle', P.copy(pos).add(new T.Vector3((r() - 0.5) * 0.3, r() * 0.8, (r() - 0.5) * 0.3)), { life: 0.4, s0: 0.25, s1: 0, color: o.color || 0xff9cc0, add: true });
          break;
        case 'confetti': {
          const cols = [0xff6f9c, 0xffcf6e, 0x5aa9ff, 0x7ee0c3, 0xffffff, 0xc59cff];
          for (let i = 0; i < (n || 70); i++) this.spawn('square', P.copy(pos).add(new T.Vector3((r() - 0.5) * (o.w || 6), r() * 2, (r() - 0.5) * (o.d || 4))), { vx: (r() - 0.5) * 3, vy: 2 + r() * 5, vz: (r() - 0.5) * 3, g: 6, drag: 1.8, life: 2.2 + r(), s0: 0.16, s1: 0.12, color: cols[i % cols.length], rot: r() * 6, spin: (r() - 0.5) * 10 });
          break;
        }
        case 'firework': {
          const col = o.color || [0xff6f9c, 0xffcf6e, 0x5aa9ff, 0x7ee0c3][Math.floor(r() * 4)];
          for (let i = 0; i < (n || 46); i++) {
            const a = r() * 6.28, b = Math.acos(2 * r() - 1), sp = 6 + r() * 3;
            this.spawn('sparkle', pos, { vx: Math.sin(b) * Math.cos(a) * sp, vy: Math.cos(b) * sp, vz: Math.sin(b) * Math.sin(a) * sp, g: 3, drag: 1.6, life: 1.2 + r() * 0.5, s0: 0.55, s1: 0, color: col, add: true });
          }
          break;
        }
        case 'notes':
          for (let i = 0; i < (n || 3); i++) this.spawn('note', P.copy(pos).add(new T.Vector3((r() - 0.5) * 0.8, r() * 0.5, 0)), { vx: (r() - 0.5), vy: 1.2 + r(), life: 1.2, s0: 0.35, s1: 0.2, color: o.color || 0xffcf6e });
          break;
        default: break;
      }
    }
    update(dt) {
      for (let i = 0; i < this.list.length; i++) {
        const p = this.list[i];
        if (!p.alive) continue;
        p.life += dt;
        const k = p.life / p.max;
        if (k >= 1) { p.alive = false; p.sprite.visible = false; continue; }
        p.vel.y -= p.g * dt;
        if (p.drag) p.vel.multiplyScalar(Math.max(0, 1 - p.drag * dt));
        p.sprite.position.addScaledVector(p.vel, dt);
        p.sprite.scale.setScalar(MM.lerp(p.s0, p.s1, k));
        p.sprite.material.opacity = k > 0.6 ? (1 - k) / 0.4 : 1;
        if (p.spin) p.sprite.material.rotation += p.spin * dt;
      }
    }
    clear() { this.list.forEach((p) => { p.alive = false; p.sprite.visible = false; }); }
  }
  G.Particles = Particles;
})(window.MM);
