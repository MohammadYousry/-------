/* Procedural toy-style characters: Mohamed, Mariem, their families and (for the ending) a little girl and boy. */
(function (MM) {
  'use strict';
  const T = THREE, G = MM.G;

  // Numbered outfits are the ones you can pick in Settings; named ones are worn in specific chapters.
  const OUTFITS = {
    mohamed: [
      { name: 'Nile night', skin: '#c48a66', tee: '#2f221e', sleeve: '#2f221e', pants: '#eeece6', shoes: '#f4f4f2', sole: '#b9b9b9', hair: '#17110f', beard: '#1d1512' },
      { name: 'Café date', skin: '#c48a66', tee: '#6e4a34', sleeve: '#6e4a34', pants: '#3b3a43', shoes: '#f4f4f2', sole: '#a0a0a0', hair: '#17110f', beard: '#1d1512', print: true },
    ],
    mariem: [
      { name: 'Nile night', skin: '#ebb898', hijab: '#d3cdd0', top: '#1c1a20', poncho: '#a8916f', fleck: '#ffd98a', jeans: '#26324c', shoes: '#f1e6da', lips: '#c4566c', watch: true },
      { name: 'Café date', skin: '#ebb898', hijab: '#7b7a4f', top: '#e6a5ae', poncho: null, jeans: '#e6a5ae', shoes: '#f1e6da', lips: '#c4566c', glasses: true, pendant: true },
    ],
  };
  // chapter outfits
  OUTFITS.mohamed.school = { skin: '#c48a66', tee: '#9cc9ef', sleeve: '#9cc9ef', pants: '#26304d', shoes: '#1e1b20', sole: '#111', hair: '#17110f', beardStyle: 'none', collar: '#ffffff' };
  OUTFITS.mohamed.suit = { skin: '#c48a66', tee: '#1f2a44', sleeve: '#1f2a44', pants: '#1f2a44', shoes: '#2a1a12', sole: '#111', hair: '#17110f', beard: '#1d1512', suit: true, tie: '#8f1d3c' };
  OUTFITS.mohamed.groom = { skin: '#c48a66', tee: '#141318', sleeve: '#141318', pants: '#141318', shoes: '#0d0c10', sole: '#000', hair: '#17110f', beard: '#1d1512', suit: true, tie: '#141318', bow: true, flower: true };
  OUTFITS.mohamed.summer = { skin: '#c48a66', tee: '#f4efe6', sleeve: '#f4efe6', pants: '#5a7fa8', shoes: '#e9dccb', sole: '#b9a88f', hair: '#17110f', beard: '#1d1512' };
  OUTFITS.mariem.school = { skin: '#ebb898', hijab: '#f7f7f7', top: '#f7f7f7', tunic: '#26304d', jeans: '#26304d', shoes: '#1e1b20', lips: '#d06a7e' };
  OUTFITS.mariem.coat = { skin: '#ebb898', hijab: '#d3cdd0', top: '#ffffff', coat: true, jeans: '#26324c', shoes: '#f1e6da', lips: '#c4566c', watch: true };
  OUTFITS.mariem.dress = { skin: '#ebb898', hijab: '#f1d6dc', top: '#e7b7c3', dress: '#e7b7c3', fleck: '#fff2c4', shoes: '#f1e6da', lips: '#c4566c', pendant: true };
  OUTFITS.mariem.bride = { skin: '#ebb898', hijab: '#ffffff', top: '#ffffff', dress: '#ffffff', fleck: '#ffe9b0', shoes: '#ffffff', lips: '#c4566c', tiara: true, veil: true };
  OUTFITS.mariem.summer = { skin: '#ebb898', hijab: '#8fc6d9', top: '#f6f1ea', poncho: null, jeans: '#f6f1ea', shoes: '#f1e6da', lips: '#c4566c', glasses: true };
  OUTFITS.mohamed.forEach((o) => { o.free = true; }); OUTFITS.mariem.forEach((o) => { o.free = true; });
  MM.OUTFITS = OUTFITS;

  /* "Our looks": choices in the game that make the two of them look more like the real Mohamed and Mariem.
     Stored in MM.save.settings.look[who]; anything left unset keeps the original design. */
  const LOOKS = {
    skin: ['#f3cfb3', '#ebb898', '#d9a07c', '#c48a66', '#a86e4e', '#7e4f36'],
    hair: ['#17110f', '#3a261b', '#6b4a33', '#9a7a5a', '#8a8a8a'],
    iris: ['#2a1a12', '#5a3a22', '#7a6a3a', '#4f7a52', '#4a6a8a'],
    hijab: ['#d3cdd0', '#f1d6dc', '#e7b7c3', '#b98a9a', '#7b7a4f', '#8fc6d9', '#2c3e66', '#1c1a20', '#6a2a3a', '#c4a07a', '#ffffff'],
    hairStyle: [['classic', 'Classic'], ['quiff', 'Quiff'], ['side', 'Side part'], ['curly', 'Curly'], ['buzz', 'Buzz cut']],
    beardStyle: [['full', 'Full'], ['short', 'Short'], ['stubble', 'Stubble'], ['none', 'None']],
    glassesM: [['', 'None'], ['round', 'Round'], ['square', 'Square']],
    glassesF: [['', 'None'], ['round', 'Round']],
    build: [['big', 'Big'], ['fit', 'Fit']],
  };
  MM.LOOKS = LOOKS;
  function withLook(who, o) {
    const L = (MM.save && MM.save.settings.look && MM.save.settings.look[who]) || {};
    const r = Object.assign({}, o);
    if (L.skin) r.skin = L.skin;
    if (L.iris) r.iris = L.iris;
    if (who === 'mohamed') {
      if (L.hair) { r.hair = L.hair; r.beard = L.hair; r.brow = L.hair; }
      if (L.hairStyle) r.hairStyle = L.hairStyle;
      if (L.beardStyle && r.beardStyle !== 'none') r.beardStyle = L.beardStyle;
      if (L.glasses !== undefined) r.glasses = L.glasses || false;
      if (L.build === 'fit') r.slim = true;
    } else {
      if (L.glasses !== undefined) r.eyeGlasses = L.glasses || false;
      if (L.hijab && o.free) r.hijab = L.hijab;
    }
    return r;
  }
  const shade = (c, l) => '#' + new T.Color(c).offsetHSL(0, 0, l).getHexString();

  function m(color, o) { return G.mat(color, o); }
  // Characters get their own copies of materials with a gentle fresnel rim light.
  const rimCache = new Map();
  const RIM = { value: new T.Color('#fff0f6') };
  function rimmed(mat) {
    if (!mat || !mat.isMeshStandardMaterial) return mat;
    let r = rimCache.get(mat);
    if (r) return r;
    r = mat.clone();
    r.onBeforeCompile = (sh) => {
      sh.uniforms.uRim = RIM;
      sh.fragmentShader = 'uniform vec3 uRim;\n' + sh.fragmentShader.replace('#include <emissivemap_fragment>', [
        '#include <emissivemap_fragment>',
        'float rimF = 1.0 - clamp(dot(normalize(normal), normalize(vViewPosition)), 0.0, 1.0);',
        'totalEmissiveRadiance += uRim * pow(rimF, 2.6) * 0.32;',
      ].join('\n'));
    };
    r.customProgramCacheKey = () => 'rim';
    rimCache.set(mat, r);
    return r;
  }
  function add(parent, geo, mat, x, y, z) { return G.mesh(geo, mat, x, y, z, parent); }

  // Eyes with a white, a coloured iris, a pupil and two catch-lights, under a soft lid line (lashes for the girls).
  function buildFace(head, r, o) {
    const R = o.eyeR;
    const sclera = m('#fbf6f1', { r: 0.35 }), iris = m(o.iris || '#2a1a12', { r: 0.2 }), pupil = m('#0b0607', { r: 0.2 });
    const shine = G.basic('#ffffff'), lid = m(o.lid || '#1a1018', { r: 0.5 });
    const eyes = [];
    [-1, 1].forEach((s) => {
      const eg = new T.Group(); eg.position.set(s * o.eyeX, o.eyeY, r * 0.86); head.add(eg);
      const parts = [];
      const sc = add(eg, G.sphere(R * 1.05, 16, 12), sclera, 0, 0, 0); sc.scale.set(1, 1.2, 0.55); parts.push(sc);
      const ir = add(eg, G.sphere(R * 0.76, 16, 12), iris, s * R * 0.05, -R * 0.06, R * 0.3); ir.scale.set(1, 1.12, 0.45); parts.push(ir);
      const pu = add(eg, G.sphere(R * 0.42, 12, 10), pupil, s * R * 0.05, -R * 0.06, R * 0.43); pu.scale.set(1, 1.1, 0.4); parts.push(pu);
      parts.push(add(eg, G.sphere(R * 0.24, 8, 6), shine, R * 0.24, R * 0.28, R * 0.6));
      parts.push(add(eg, G.sphere(R * 0.11, 6, 5), shine, -R * 0.22, -R * 0.3, R * 0.56));
      const ln = add(eg, G.torus(R * 1.04, R * (o.lashes ? 0.2 : 0.14), Math.PI * 0.86), lid, 0, 0, R * 0.14);
      ln.rotation.z = Math.PI * 0.07; ln.scale.set(1, 1.22, 0.5); parts.push(ln);
      if (o.lashes) {
        [0, 1].forEach((k) => { const l = add(eg, G.box(R * 0.42, R * 0.12, R * 0.1), lid, s * R * (0.86 + k * 0.2), R * (0.86 - k * 0.32), R * 0.2); l.rotation.z = s * (0.55 + k * 0.35); parts.push(l); });
      }
      parts.forEach((q) => { q.castShadow = false; });
      eyes.push(eg);
    });
    return eyes;
  }

  // Floating name tag that always faces the camera.
  function nameTag(text, color) {
    const tt = G.textTexture(text, { color: '#ffffff', bg: color || 'rgba(30,14,40,.85)', size: 56, pad: 16 });
    const sp = new T.Sprite(new T.SpriteMaterial({ map: tt.tex, transparent: true, depthWrite: false }));
    const h = 0.32;
    sp.scale.set(h * tt.w / tt.h, h, 1);
    sp.renderOrder = 15;
    return sp;
  }
  MM.nameTag = nameTag;

  class Character {
    constructor(id, outfit, opts) {
      this.id = id;
      this.kind = id === 'npc' ? 'npc' : id;
      this.root = new T.Group();
      this.body = new T.Group();
      this.root.add(this.body);
      this.t = Math.random() * 10; this.phase = 0;
      this.joint = { legL: 0, legR: 0, armLx: 0, armRx: 0, armLz: 0.12, armRz: -0.12, lean: 0, bob: 0, head: 0, headZ: 0, sit: 0, roll: 0 };
      this.action = null; this.actionT = 0; this.actionDur = 0;
      this.squash = 1; this.squashV = 0;
      this.blinkT = 2 + Math.random() * 3;
      this.flashT = 0;
      const pick = (who) => withLook(who, (typeof outfit === 'string' ? OUTFITS[who][outfit] : OUTFITS[who][outfit || 0]) || OUTFITS[who][0]);
      if (id === 'mohamed') this.buildMohamed(pick('mohamed'));
      else if (id === 'mariem') this.buildMariem(pick('mariem'));
      else if (id === 'npc') this.buildNpc(opts || {});
      else this.buildKid(id);
      this.root.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = false; } });
    }

    limb(parent, x, y) { const p = new T.Group(); p.position.set(x, y, 0); parent.add(p); return p; }

    buildMohamed(o) {
      const b = this.body;
      const skin = m(o.skin, { r: 0.6 });
      this.sitDrop = 0.62;
      this.legL = this.limb(b, -0.17, 0.86); this.legR = this.limb(b, 0.17, 0.86);
      [this.legL, this.legR].forEach((L) => {
        add(L, G.cyl(0.15, 0.13, 0.76, 14), m(o.pants, { r: 0.8 }), 0, -0.38, 0);
        add(L, G.box(0.24, 0.13, 0.36), m(o.shoes, { r: 0.5 }), 0, -0.79, 0.05);
        add(L, G.box(0.25, 0.04, 0.37), m(o.sole), 0, -0.85, 0.05);
        add(L, G.box(0.2, 0.07, 0.1), m(shade(o.shoes, o.suit ? 0.08 : -0.06), { r: 0.4 }), 0, -0.78, 0.2);
        if (!o.suit) [0, 1].forEach((k) => add(L, G.box(0.13, 0.015, 0.025), m(shade(o.shoes, -0.25)), 0, -0.715, 0.04 + k * 0.06));
        add(L, G.cyl(0.152, 0.152, 0.04, 14), m(shade(o.pants, -0.08), { r: 0.8 }), 0, -0.7, 0);
      });
      add(b, G.cyl(0.32, 0.3, 0.26, 18), m(o.pants, { r: 0.8 }), 0, 0.84, 0);
      const torso = add(b, G.capsule(0.36, 0.26), m(o.tee, { r: o.suit ? 0.55 : 0.9 }), 0, 1.12, 0);
      torso.scale.set(o.slim ? 0.92 : 1.1, 1, 0.84);
      this.torso = torso;
      if (o.print) {
        const pr = G.textPlane('BE ND', 0.07, { color: '#f4efe8', size: 60, pad: 6 });
        pr.position.set(0, 1.0, 0.31); b.add(pr);
      }
      if (o.collar) { const c = add(b, G.box(0.36, 0.08, 0.06), m(o.collar), 0, 1.5, 0.22); c.rotation.x = -0.3; }
      else if (!o.suit) { const nk = add(b, G.torus(0.16, 0.026), m(shade(o.tee, -0.07), { r: 0.85 }), 0, 1.47, 0.02); nk.rotation.x = Math.PI / 2 - 0.25; nk.scale.set(1.1, 1, 0.8); }
      if (o.suit) {
        const shirt = add(b, G.box(0.22, 0.42, 0.04), m('#ffffff', { r: 0.6 }), 0, 1.28, 0.3); shirt.rotation.x = -0.12;
        if (o.bow) { add(b, G.box(0.16, 0.06, 0.04), m(o.tie), 0, 1.47, 0.32); }
        else { const tie = add(b, G.box(0.06, 0.32, 0.03), m(o.tie, { r: 0.5 }), 0, 1.3, 0.325); tie.rotation.x = -0.12; }
        [-1, 1].forEach((s) => { const lp = add(b, G.box(0.08, 0.42, 0.03), m(o.tee, { r: 0.5 }), s * 0.14, 1.28, 0.31); lp.rotation.set(-0.12, 0, s * 0.18); });
        if (o.flower) { add(b, G.sphere(0.05, 10, 8), m('#ffffff'), -0.2, 1.42, 0.3); }
        [1.02, 1.14].forEach((y) => add(b, G.sphere(0.022, 8, 6), m(shade(o.tee, -0.1), { r: 0.3, m: 0.3 }), 0.07, y, 0.3));
        if (!o.flower) { const sq = add(b, G.box(0.09, 0.05, 0.02), m('#ffffff', { r: 0.6 }), -0.24, 1.33, 0.26); sq.rotation.set(-0.15, -0.35, 0.12); }
      }
      this.armL = this.limb(b, -0.43, 1.42); this.armR = this.limb(b, 0.43, 1.42);
      [this.armL, this.armR].forEach((A) => {
        add(A, G.capsule(0.125, 0.2), m(o.sleeve, { r: 0.9 }), 0, -0.14, 0);
        add(A, o.suit ? G.capsule(0.1, 0.26) : G.capsule(0.095, 0.26), o.suit ? m(o.sleeve, { r: 0.6 }) : skin, 0, -0.44, 0);
        add(A, G.sphere(0.105, 12, 10), skin, 0, -0.62, 0.01);
        const cuff = add(A, G.torus(o.suit ? 0.1 : 0.125, 0.02), m(o.suit ? '#ffffff' : shade(o.sleeve, -0.07), { r: 0.7 }), 0, o.suit ? -0.55 : -0.3, 0); cuff.rotation.x = Math.PI / 2;
      });
      this.head = this.limb(b, 0, 1.5);
      const r = 0.29, hc = 0.17;
      const hg = new T.Group(); hg.position.y = hc; this.head.add(hg); this.headInner = hg;
      add(hg, G.sphere(r, 26, 20), skin, 0, 0, 0);
      [-1, 1].forEach((s) => add(hg, G.sphere(0.065, 10, 8), skin, s * r * 0.98, -0.01, -0.02));
      const hairCol = o.hair;
      const hs = o.bald ? 'bald' : o.hairStyle || 'classic', hm = m(hs === 'buzz' ? shade(hairCol, 0.06) : hairCol, { r: 0.95 });
      if (hs !== 'bald') {
        const hair = add(hg, new T.SphereGeometry(r * (hs === 'buzz' ? 1.015 : 1.06), 26, 12, 0, Math.PI * 2, 0, Math.PI * (hs === 'buzz' ? 0.33 : 0.36)), hm, 0, 0.01, -0.02);
        hair.rotation.x = -0.28;
      }
      if (hs === 'quiff') [[-0.05, 0.84, 0.55, 0.085], [0.05, 0.88, 0.5, 0.08], [0, 0.96, 0.3, 0.085]].forEach(([x, y, z, rr]) => { const t = add(hg, G.sphere(rr, 12, 10), hm, x, r * y, r * z); t.scale.set(1.25, 0.8, 1.1); t.rotation.x = -0.4; });
      if (hs === 'side') { const sw = add(hg, G.sphere(0.12, 14, 10), hm, -0.05, r * 0.8, r * 0.52); sw.scale.set(1.6, 0.55, 0.9); sw.rotation.set(-0.35, 0, 0.3); }
      if (hs === 'curly') for (let i = 0; i < 20; i++) { const a = i * 2.4, k = 0.2 + (i % 5) * 0.06; const cu = add(hg, G.sphere(0.07, 8, 6), hm, Math.sin(a) * r * (0.35 + k), r * (1.0 - k * 0.55), Math.cos(a) * r * (0.35 + k) - 0.02); cu.castShadow = false; }
      add(hg, new T.SphereGeometry(r * (hs === 'buzz' ? 1.012 : 1.03), 26, 14, Math.PI * 0.78, Math.PI * 1.44, Math.PI * (hs === 'bald' ? 0.3 : 0.12), Math.PI * (hs === 'bald' ? 0.3 : 0.5)), hm, 0, 0, 0);
      const style = o.beardStyle || 'full';
      const bm = m(style === 'stubble' ? '#' + new T.Color(o.skin).lerp(new T.Color(o.beard || hairCol), 0.55).getHexString() : o.beard, { r: 1 });
      if (style === 'full') add(hg, new T.SphereGeometry(r * 1.035, 26, 14, Math.PI * 0.1, Math.PI * 0.8, Math.PI * 0.53, Math.PI * 0.4), bm, 0, 0, 0);
      if (style === 'short') add(hg, new T.SphereGeometry(r * 1.02, 26, 14, Math.PI * 0.12, Math.PI * 0.76, Math.PI * 0.58, Math.PI * 0.33), bm, 0, 0, 0);
      if (style === 'stubble') add(hg, new T.SphereGeometry(r * 1.008, 26, 14, Math.PI * 0.1, Math.PI * 0.8, Math.PI * 0.55, Math.PI * 0.38), bm, 0, 0, 0);
      if (style === 'full' || style === 'short' || style === 'mustache') { const must = add(hg, G.capsule(0.024, 0.12), m(o.beard || hairCol, { r: 1 }), 0, -0.07, r * 1.0); must.rotation.z = Math.PI / 2; }
      const mouth = add(hg, new T.CircleGeometry(0.068, 20, Math.PI, Math.PI), m('#5a1f24', { r: 0.6 }), 0, -0.105, r * 1.035);
      mouth.scale.set(1, 0.85, 1); mouth.castShadow = false;
      add(mouth, new T.PlaneGeometry(0.1, 0.022), G.basic('#fffaf2'), 0, -0.012, 0.002).castShadow = false;
      add(hg, G.sphere(0.05, 10, 8), m('#b97c5b', { r: 0.6 }), 0, -0.02, r * 0.98);
      this.eyes = buildFace(hg, r, { eyeR: 0.042, eyeX: 0.1, eyeY: 0.045, iris: o.iris });
      [-1, 1].forEach((s) => { const br = add(hg, G.box(0.12, 0.034, 0.03), m(o.brow || hairCol), s * 0.1, 0.135, r * 0.93); br.rotation.z = s * -0.14; });
      if (o.glasses) this.eyeGlasses(hg, r, 0.1, 0.045, o.glasses);
      this.height = 1.95;
    }

    eyeGlasses(hg, r, ex, ey, shape) {
      const gm = m('#2b2228', { r: 0.3, m: 0.4 }), w = ex > 0.09 ? 0.064 : 0.055;
      [-1, 1].forEach((s) => {
        if (shape === 'square') { [[0, w * 0.85, w * 2.1, 0.014], [0, -w * 0.85, w * 2.1, 0.014]].forEach(([x, y, ww, hh]) => add(hg, G.box(ww, hh, 0.012), gm, s * ex + x, ey + y, r * 0.99)); [-1, 1].forEach((k) => add(hg, G.box(0.014, w * 1.7, 0.012), gm, s * ex + k * w, ey, r * 0.99)); }
        else add(hg, G.torus(w, 0.01), gm, s * ex, ey, r * 0.98);
        const arm = add(hg, G.box(0.012, 0.012, r * 0.9), gm, s * (ex + w + 0.005), ey + 0.005, r * 0.5); arm.rotation.y = s * 0.18;
      });
      add(hg, G.box(0.06, 0.012, 0.012), gm, 0, ey, r * 1.0);
    }

    buildMariem(o) {
      const b = this.body;
      const skin = m(o.skin, { r: 0.55 });
      this.sitDrop = 0.36;
      this.legL = this.limb(b, -0.1, 0.5); this.legR = this.limb(b, 0.1, 0.5);
      [this.legL, this.legR].forEach((L) => {
        add(L, G.cyl(0.085, 0.12, 0.46, 12), m(o.jeans || o.dress || '#26324c', { r: 0.85 }), 0, -0.23, 0);
        add(L, G.box(0.13, 0.06, 0.21), m(o.shoes, { r: 0.4 }), 0, -0.47, 0.04);
        if (!o.dress) add(L, G.cyl(0.088, 0.088, 0.03, 12), m(shade(o.jeans || '#26324c', -0.06), { r: 0.85 }), 0, -0.41, 0);
        add(L, G.sphere(0.022, 8, 6), m(shade(o.shoes, -0.2), { r: 0.4 }), 0, -0.44, 0.14);
      });
      const torso = add(b, G.capsule(0.17, 0.2), m(o.top, { r: 0.85 }), 0, 0.75, 0);
      torso.scale.set(1, 1, 0.85); this.torso = torso;
      if (o.dress) {
        const tex = G.glitterTex(o.dress, o.fleck || '#ffffff');
        const dm = new T.MeshStandardMaterial({ map: tex, roughness: 0.5, metalness: 0.25, color: '#ffffff' });
        add(b, G.cyl(0.16, 0.44, 0.88, 26), dm, 0, 0.5, 0);
        const sash = add(b, G.torus(0.235, 0.024), m(o.veil ? '#f3e2b8' : shade(o.dress, -0.12), { r: 0.4, m: o.veil ? 0.5 : 0.1 }), 0, 0.72, 0); sash.rotation.x = Math.PI / 2;
        [-1, 1].forEach((s) => { const bw = add(b, G.sphere(0.045, 10, 8), m(o.veil ? '#f3e2b8' : shade(o.dress, -0.16), { r: 0.4 }), 0.1 + s * 0.04, 0.73, 0.21); bw.scale.set(1.2, 0.7, 0.5); });
        if (o.veil) { const v = add(b, G.cyl(0.2, 0.5, 0.9, 24), m('#ffffff', { t: true, o: 0.35, ds: true }), 0, 0.62, -0.08); v.castShadow = false; }
      } else if (o.coat) {
        const coat = m('#ffffff', { r: 0.7 });
        add(b, G.cyl(0.18, 0.31, 0.66, 22), coat, 0, 0.62, 0);
        const st = add(b, G.torus(0.13, 0.016, Math.PI * 1.4), m('#2c3e66', { r: 0.4 }), 0, 0.86, 0.12); st.rotation.set(-0.5, 0, Math.PI * 1.2);
        add(b, G.cyl(0.03, 0.03, 0.02, 10), m('#c9ccd3', { m: 0.8 }), 0.06, 0.74, 0.2).rotation.x = Math.PI / 2;
        const badge = G.textPlane('Dr. Mariem', 0.05, { color: '#2c3e66', bg: '#ffffff', size: 60, pad: 8 }); badge.position.set(-0.11, 0.86, 0.19); badge.rotation.y = -0.3; b.add(badge);
        [-1, 1].forEach((s) => { const pk = add(b, G.box(0.1, 0.08, 0.02), m('#eef1f4', { r: 0.7 }), s * 0.17, 0.5, 0.2); pk.rotation.y = s * 0.45; });
        [0.78, 0.66, 0.54].forEach((y) => add(b, G.sphere(0.014, 8, 6), m('#c9ccd3', { r: 0.3 }), 0.03, y, 0.2 + (0.78 - y) * 0.35));
      } else if (o.tunic) {
        add(b, G.cyl(0.17, 0.3, 0.56, 20), m(o.tunic, { r: 0.85 }), 0, 0.66, 0);
      } else if (o.poncho) {
        const tex = G.glitterTex(o.poncho, o.fleck);
        const pm = new T.MeshStandardMaterial({ map: tex, roughness: 0.42, metalness: 0.45, color: '#ffffff' });
        add(b, G.cyl(0.16, 0.34, 0.34, 24), pm, 0, 0.8, 0);
      } else {
        add(b, G.cyl(0.16, 0.29, 0.5, 20), m(o.top, { r: 0.8 }), 0, 0.68, 0);
      }
      // a little cross-body bag for everyday outfits
      if (o.free) {
        const strapM = m(o.bag || '#6b4a3a', { r: 0.6 });
        [0.16, -0.155].forEach((z) => { const st = add(b, G.box(0.03, 0.56, 0.016), strapM, 0, 0.76, z); st.rotation.z = 0.62; st.castShadow = false; });
        add(b, G.box(0.16, 0.12, 0.06), strapM, 0.2, 0.5, 0.06);
        add(b, G.box(0.16, 0.05, 0.065), m(shade(o.bag || '#6b4a3a', 0.08), { r: 0.5 }), 0.2, 0.545, 0.062);
        add(b, G.sphere(0.012, 6, 5), m('#d9b45a', { m: 0.8, r: 0.3 }), 0.2, 0.52, 0.095);
      }
      this.armL = this.limb(b, -0.21, 0.93); this.armR = this.limb(b, 0.21, 0.93);
      [this.armL, this.armR].forEach((A, i) => {
        add(A, G.capsule(0.058, 0.26), m(o.coat ? '#ffffff' : o.top, { r: 0.85 }), 0, -0.19, 0);
        add(A, G.sphere(0.064, 10, 8), skin, 0, -0.39, 0.01);
        const cf = add(A, G.torus(0.06, 0.012), m(shade(o.coat ? '#ffffff' : o.top, -0.08), { r: 0.8 }), 0, -0.32, 0); cf.rotation.x = Math.PI / 2;
        if (o.watch && i === 0) add(A, G.cyl(0.066, 0.066, 0.04, 12), m('#d9b45a', { r: 0.3, m: 0.8 }), 0, -0.33, 0);
      });
      if (o.pendant) add(b, G.cyl(0.04, 0.04, 0.015, 14), m('#c9932d', { r: 0.3, m: 0.8 }), 0, 0.86, 0.2).rotation.x = Math.PI / 2;
      this.head = this.limb(b, 0, 0.97);
      const r = 0.24, hc = 0.14;
      const hg = new T.Group(); hg.position.y = hc; this.head.add(hg); this.headInner = hg;
      add(hg, G.sphere(r, 26, 20), skin, 0, 0, 0);
      const hj = m(o.hijab, { r: 0.92, ds: true });
      const open = 0.98;
      const shell = add(hg, new T.SphereGeometry(r * 1.12, 30, 22, Math.PI / 2 + open, Math.PI * 2 - open * 2, 0, Math.PI * 0.74), hj, 0, 0.01, -0.005);
      shell.castShadow = true;
      const frame = add(hg, G.torus(r * 0.92, 0.03, Math.PI * 2), hj, 0, 0.0, r * 0.62);
      frame.scale.set(0.9, 1.08, 1);
      add(hg, G.cyl(0.19, 0.3, 0.2, 22), hj, 0, -r - 0.05, -0.01);
      // the underscarf at the forehead, a soft drape over one shoulder, and a pearl pin
      const band = add(hg, G.torus(r * 0.86, 0.017, Math.PI * 0.8), m(shade(o.hijab, -0.12), { r: 0.9 }), 0, 0.005, r * 0.66);
      band.rotation.z = Math.PI * 0.1; band.scale.set(0.9, 1.08, 1);
      const drape = add(hg, G.box(0.19, 0.3, 0.035), hj, 0.1, -r - 0.17, 0.11); drape.rotation.set(0.28, 0.15, 0.32);
      add(hg, G.sphere(0.019, 10, 8), m('#f6efe6', { r: 0.25, m: 0.2 }), -r * 0.78, -0.05, r * 0.58);
      if (o.tiara) { const ti = add(hg, G.torus(0.13, 0.014, Math.PI), m('#ffd36e', { m: 0.9, r: 0.2 }), 0, r * 0.95, 0.08); ti.rotation.x = -0.5; }
      if (o.glasses) {
        const gm = m('#151215', { r: 0.2, m: 0.4 });
        [-1, 1].forEach((s) => { const l = add(hg, G.torus(0.055, 0.014), gm, s * 0.07, r * 1.02, 0.11); l.rotation.x = -1.1; });
        add(hg, G.box(0.05, 0.012, 0.012), gm, 0, r * 1.03, 0.14);
      }
      if (o.eyeGlasses) this.eyeGlasses(hg, r, 0.083, 0.02);
      this.eyes = buildFace(hg, r, { eyeR: 0.046, eyeX: 0.083, eyeY: 0.02, iris: o.iris, lashes: true });
      [-1, 1].forEach((s) => {
        const brow = add(hg, G.torus(0.045, 0.008, Math.PI * 0.7), m('#3a2418', { r: 0.8 }), s * 0.085, 0.072, r * 0.93);
        brow.rotation.z = Math.PI * 0.15 + s * 0.08; brow.scale.set(1, 0.55, 0.6); brow.castShadow = false;
        const blush = add(hg, new T.CircleGeometry(0.04, 16), G.basic('#ff8fa8', { o: 0.45 }), s * 0.125, -0.045, r * 0.93);
        blush.rotation.y = s * 0.45; blush.castShadow = false;
      });
      add(hg, G.sphere(0.028, 8, 6), m('#dfa384', { r: 0.6 }), 0, -0.02, r * 0.99);
      const smile = add(hg, G.torus(0.048, 0.014, Math.PI), m(o.lips, { r: 0.4 }), 0, -0.075, r * 0.96);
      smile.rotation.z = Math.PI; smile.scale.set(1, 0.8, 0.6);
      this.height = 1.36;
    }

    // Family members: a man built like Mohamed (slimmer), a woman built like Mariem (taller, long dress + hijab).
    buildNpc(o) {
      if (o.gender === 'f') {
        this.buildMariem({ skin: o.skin || '#e3ab88', hijab: o.hijab || '#8e7aa8', top: o.top || '#6d5a86', dress: o.top || '#6d5a86', fleck: o.fleck || '#d8cbe8', shoes: '#3a2f3f', lips: '#b45a6a', eyeGlasses: !!o.glasses });
        this.body.scale.setScalar(o.scale || 1.18);
        this.height = 1.36 * (o.scale || 1.18);
      } else {
        this.buildMohamed({ skin: o.skin || '#c08463', tee: o.top || '#3e5c7a', sleeve: o.top || '#3e5c7a', pants: o.bottom || '#2e2f38', shoes: '#2a1a12', sole: '#111', hair: o.hair || '#2a221e', beard: o.hair || '#2a221e', beardStyle: o.beardStyle || 'mustache', slim: true, suit: !!o.suit, tie: o.tie || '#5a2a3a', glasses: !!o.glasses, bald: !!o.bald, brow: o.brow });
        this.body.scale.setScalar(o.scale || 0.94);
        this.height = 1.95 * (o.scale || 0.94);
      }
      if (o.name) { const tag = nameTag(o.name, o.tagColor); tag.position.y = this.height + 0.45; this.root.add(tag); this.tag = tag; }
    }

    buildKid(kind) {
      const b = this.body, girl = kind === 'girl';
      const skin = m('#e2aa86', { r: 0.6 });
      this.sitDrop = 0.22;
      this.legL = this.limb(b, -0.07, 0.3); this.legR = this.limb(b, 0.07, 0.3);
      [this.legL, this.legR].forEach((L) => {
        add(L, G.cyl(0.05, 0.05, 0.28, 10), girl ? skin : m('#3a4f7a'), 0, -0.14, 0);
        add(L, G.box(0.08, 0.05, 0.13), m(girl ? '#ff8fb1' : '#f2f2f2'), 0, -0.29, 0.03);
      });
      if (girl) add(b, G.cone(0.24, 0.36, 18), m('#ff8fb1', { r: 0.7 }), 0, 0.42, 0);
      else add(b, G.capsule(0.13, 0.14), m('#5aa9ff', { r: 0.8 }), 0, 0.45, 0);
      this.armL = this.limb(b, -0.15, 0.55); this.armR = this.limb(b, 0.15, 0.55);
      [this.armL, this.armR].forEach((A) => { add(A, G.capsule(0.04, 0.14), girl ? skin : m('#5aa9ff'), 0, -0.1, 0); add(A, G.sphere(0.045, 8, 6), skin, 0, -0.2, 0); });
      this.head = this.limb(b, 0, 0.62);
      const r = 0.2, hg = new T.Group(); hg.position.y = 0.14; this.head.add(hg); this.headInner = hg;
      add(hg, G.sphere(r, 20, 16), skin, 0, 0, 0);
      const hair = add(hg, new T.SphereGeometry(r * 1.07, 20, 10, 0, Math.PI * 2, 0, Math.PI * 0.45), m('#1f1512'), 0, 0.01, -0.02);
      hair.rotation.x = -0.2;
      if (girl) [-1, 1].forEach((s) => add(hg, G.sphere(0.08, 10, 8), m('#1f1512'), s * 0.22, 0.05, -0.05));
      this.eyes = buildFace(hg, r, { eyeR: 0.038, eyeX: 0.07, eyeY: 0.0 });
      const smile = add(hg, G.torus(0.04, 0.012, Math.PI), m('#b5475f'), 0, -0.07, r * 0.96);
      smile.rotation.z = Math.PI;
      this.height = 0.9;
    }

    // An umbrella held up in the right hand (used in the rain).
    setUmbrella(on) {
      if (on && !this.umbrella) {
        const u = new T.Group();
        G.mesh(G.cyl(0.02, 0.02, 1.0, 8), G.mat('#3a2f3f'), 0, -0.25, 0, u);
        const can = G.mesh(new T.ConeGeometry(1.05, 0.42, 16, 1, true), G.mat('#ff6f9c', { r: 0.6, ds: true }), 0, -0.85, 0, u);
        can.rotation.x = Math.PI;
        u.position.set(0, -0.62, 0.05);
        this.armR.add(u);
        this.umbrella = u;
      }
      if (this.umbrella) this.umbrella.visible = !!on;
    }

    play(action, dur) { this.action = action; this.actionT = 0; this.actionDur = dur || 1; }
    stop() { this.action = null; }
    land(strength) { this.squash = 1 - MM.clamp(strength, 0.08, 0.3); this.squashV = 0; }
    flash(t) { this.flashT = t; }

    // s: { speed, maxSpeed, grounded, vy, pushing, pose, umbrella, swim }
    update(dt, s) {
      this.t += dt;
      const J = {}, sp = s.speed || 0;
      const mv = MM.clamp(sp / (s.maxSpeed || 6), 0, 1);
      const kitten = this.id === 'mariem';
      if (mv > 0.04 && (s.grounded || s.swim)) this.phase += dt * (5 + sp * 1.5);
      J.legL = 0; J.legR = 0; J.armLx = 0; J.armRx = 0; J.armLz = 0.13; J.armRz = -0.13; J.lean = 0; J.bob = 0; J.head = 0; J.headZ = 0; J.sit = 0; J.roll = 0;
      if (s.swim) {
        const sw = Math.sin(this.t * 7);
        J.lean = 1.15; J.legL = sw * 0.5; J.legR = -sw * 0.5;
        J.armLx = -2.4 + Math.sin(this.t * 4) * 0.9; J.armRx = -2.4 - Math.sin(this.t * 4) * 0.9; J.head = -0.9;
      } else if (s.grounded) {
        const sw = Math.sin(this.phase);
        J.legL = sw * 0.8 * mv; J.legR = -J.legL;
        J.armLx = -sw * 0.7 * mv; J.armRx = -J.armLx;
        J.bob = Math.abs(Math.cos(this.phase)) * (kitten ? 0.09 : 0.06) * mv;
        J.lean = 0.12 * mv;
        J.head = Math.sin(this.t * 1.6) * 0.04 * (1 - mv);
        J.headZ = kitten ? Math.sin(this.phase) * 0.06 * mv : 0;
      } else if (s.vy > 0) {
        J.legL = -0.7; J.legR = 0.3; J.armLz = 1.0; J.armRz = -1.0; J.armLx = -0.5; J.armRx = -0.5;
      } else {
        const fl = Math.sin(this.t * 16) * 0.12;
        J.legL = 0.3; J.legR = -0.25; J.armLz = 1.35 + fl; J.armRz = -1.35 - fl;
      }
      if (s.pushing) { J.armLx = -1.45; J.armRx = -1.45; J.armLz = 0.25; J.armRz = -0.25; J.lean = 0.35; }
      if (s.umbrella) { J.armRx = -2.75; J.armRz = 0.05; }
      if (!!s.umbrella !== !!(this.umbrella && this.umbrella.visible)) this.setUmbrella(!!s.umbrella);
      const pose = s.pose;
      if (pose === 'drive') { J.legL = -1.4; J.legR = -1.4; J.armLx = -1.1; J.armRx = -1.1; J.armLz = 0.25; J.armRz = -0.25; J.sit = 1; }
      if (pose === 'ride') { J.legL = -1.45; J.legR = -1.45; J.sit = 1; J.armLz = 0.5 + Math.sin(this.t * 6) * 0.4; J.armRz = -0.5 - Math.sin(this.t * 6 + 1) * 0.4; J.armLx = -2.2; J.armRx = -2.2; J.headZ = Math.sin(this.t * 3) * 0.15; }
      if (pose === 'sit') { J.legL = -1.45; J.legR = -1.45; J.sit = 1; J.armLx = -0.4; J.armRx = -0.4; }
      if (pose === 'sit-arm') { J.legL = -1.45; J.legR = -1.45; J.sit = 1; J.armLx = -0.4; J.armRz = -1.5; J.armRx = -0.6; }
      if (pose === 'sleep') { J.legL = -1.45; J.legR = -1.45; J.sit = 1; J.armLx = -0.5; J.armRx = -0.5; J.armLz = -0.3; J.armRz = 0.3; J.headZ = -0.55; J.head = 0.25; J.roll = -0.12; }
      if (pose === 'idle-cute') { J.headZ = Math.sin(this.t * 1.3) * 0.12; }
      if (pose === 'dance') { const d = Math.sin(this.t * 7); J.armLz = 1.2 + d * 0.6; J.armRz = -1.2 + d * 0.6; J.armLx = -0.6 - d * 0.4; J.armRx = -0.6 + d * 0.4; J.bob = Math.abs(Math.sin(this.t * 7)) * 0.12; J.headZ = d * 0.15; J.roll = d * 0.08; }
      if (pose === 'cheer') { J.armLz = 2.5 + Math.sin(this.t * 8) * 0.2; J.armRz = -2.5 - Math.sin(this.t * 8) * 0.2; J.bob = Math.abs(Math.sin(this.t * 6)) * 0.08; }
      if (pose === 'slowdance') {
        const sw = Math.sin(this.t * 1.7);
        if (kitten) { J.armLx = J.armRx = -2.15; J.armLz = -0.3; J.armRz = 0.3; J.head = -0.25; J.headZ = 0.2; }
        else { J.armLx = J.armRx = -1.0; J.armLz = -0.35; J.armRz = 0.35; J.head = 0.2; J.headZ = -0.08; }
        J.roll = sw * 0.05; J.bob = Math.abs(sw) * 0.025;
      }
      if (pose === 'gaze') { J.head = -0.55; J.armLx = -0.2; J.armRx = -0.2; J.headZ = kitten ? 0.18 : -0.1; }
      if (pose === 'pray') { J.armLx = -1.2; J.armRx = -1.2; J.armLz = -0.35; J.armRz = 0.35; J.head = 0.25; }

      if (this.action) {
        this.actionT += dt;
        const k = MM.clamp(this.actionT / this.actionDur, 0, 1);
        switch (this.action) {
          case 'toss': { const a = MM.ease.outCubic(k); J.armLx = J.armRx = MM.lerp(0.9, -2.8, a); J.armLz = 0.2; J.armRz = -0.2; J.lean = MM.lerp(0.4, -0.15, a); break; }
          case 'tossed': J.armLx = J.armRx = -2.9; J.armLz = 0.25; J.armRz = -0.25; J.legL = J.legR = 0.15; break;
          case 'slam': J.armLx = J.armRx = -2.9; J.legL = J.legR = -0.9; break;
          case 'dash': J.lean = 0.7; J.armLx = J.armRx = 1.0; J.legL = 0.6; J.legR = 0.4; break;
          case 'love': J.armLx = J.armRx = -1.25; J.armLz = -0.55; J.armRz = 0.55; J.head = 0.15; J.headZ = 0.2; break;
          case 'hug': J.armLx = J.armRx = -1.45; J.armLz = -0.7; J.armRz = 0.7; J.headZ = 0.25; break;
          case 'wave': J.armRz = -2.6 + Math.sin(this.actionT * 14) * 0.35; break;
          case 'celebrate': J.armLz = 2.7 + Math.sin(this.actionT * 12) * 0.2; J.armRz = -2.7 - Math.sin(this.actionT * 12) * 0.2; J.bob = Math.abs(Math.sin(this.actionT * 7)) * 0.25; break;
          case 'kneel': J.legL = -1.5; J.legR = 0.9; J.sit = 0.55; J.armRx = -1.4; J.armLx = -0.3; J.head = -0.1; break;
          case 'spin': this.body.rotation.y = k * Math.PI * 2; J.armLz = 1.4; J.armRz = -1.4; break;
          case 'flex': J.armLz = 1.6; J.armRz = -1.6; J.armLx = -0.2; J.armRx = -0.2; break;
          case 'nod': J.head = Math.sin(this.actionT * 10) * 0.25; break;
          case 'shy': J.armLx = J.armRx = -0.9; J.armLz = -0.5; J.armRz = 0.5; J.head = 0.35; J.headZ = 0.25; break;
          case 'kiss': J.lean = 0.25; J.headZ = 0.35; J.head = 0.1; J.armLx = J.armRx = -1.3; J.armLz = -0.6; J.armRz = 0.6; break;
          default: break;
        }
        if (k >= 1 && this.actionDur < 90) { this.action = null; this.body.rotation.y = 0; }
      }

      const L = 20;
      for (const key in J) this.joint[key] = MM.damp(this.joint[key], J[key], L, dt);
      const j = this.joint;
      this.legL.rotation.x = j.legL; this.legR.rotation.x = j.legR;
      this.armL.rotation.x = j.armLx; this.armR.rotation.x = j.armRx;
      // armLz/armRz: positive left / negative right = arm raised outward.
      this.armL.rotation.z = -j.armLz; this.armR.rotation.z = -j.armRz;
      this.body.rotation.x = j.lean;
      this.body.rotation.z = j.roll;
      this.head.rotation.x = j.head; this.head.rotation.z = j.headZ;
      this.squashV += (1 - this.squash) * 180 * dt; this.squashV *= Math.exp(-14 * dt); this.squash += this.squashV * dt;
      const sq = this.squash;
      const base = this.body.userData.base || 1;
      this.body.scale.set(base / Math.sqrt(sq), base * sq, base / Math.sqrt(sq));
      this.body.position.y = j.bob - j.sit * (this.sitDrop || 0.4) * base + (s.swim ? 0.35 : 0);
      if (this.torso) this.torso.scale.y = 1 + Math.sin(this.t * 2.2) * 0.015;
      this.blinkT -= dt;
      const closed = (this.blinkT < 0.11 && this.blinkT > 0) || pose === 'sleep';
      if (this.blinkT <= 0) this.blinkT = 2 + Math.random() * 3.5;
      if (this.eyes) this.eyes.forEach((e) => { e.scale.y = closed ? 0.1 : 1; });
      if (this.flashT > 0) { this.flashT -= dt; this.root.visible = Math.floor(this.flashT * 14) % 2 === 0; }
      else this.root.visible = true;
    }
  }

  MM.Characters = {
    // outfit: index (Settings choice) or a chapter outfit key ('school', 'coat', 'suit', 'dress', 'groom', 'bride', 'summer')
    create(id, outfit, opts) {
      const c = new Character(id, outfit, opts);
      c.root.traverse((q) => { if (q.isMesh && !q.userData.noRim) q.material = rimmed(q.material); });
      if (id === 'npc') c.body.userData.base = (opts && opts.scale) || (opts && opts.gender === 'f' ? 1.18 : 0.94);
      return c;
    },
  };
})(window.MM);
