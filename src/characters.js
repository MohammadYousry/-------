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
  MM.OUTFITS = OUTFITS;

  function m(color, o) { return G.mat(color, o); }
  function add(parent, geo, mat, x, y, z) { return G.mesh(geo, mat, x, y, z, parent); }

  function buildFace(head, r, o) {
    const eyeMat = m('#1a1018', { r: 0.3 });
    const white = G.basic('#ffffff');
    const eyes = [];
    [-1, 1].forEach((s) => {
      const e = add(head, G.sphere(o.eyeR, 14, 10), eyeMat, s * o.eyeX, o.eyeY, r * 0.9);
      e.scale.set(1, 1.15, 0.55); e.castShadow = false;
      const h = add(e, G.sphere(o.eyeR * 0.32, 8, 6), white, 0.012 * (r / 0.29), o.eyeR * 0.35, o.eyeR * 0.75);
      h.castShadow = false;
      eyes.push(e);
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
      const pick = (who) => (typeof outfit === 'string' ? OUTFITS[who][outfit] : OUTFITS[who][outfit || 0]) || OUTFITS[who][0];
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
      if (o.suit) {
        const shirt = add(b, G.box(0.22, 0.42, 0.04), m('#ffffff', { r: 0.6 }), 0, 1.28, 0.3); shirt.rotation.x = -0.12;
        if (o.bow) { add(b, G.box(0.16, 0.06, 0.04), m(o.tie), 0, 1.47, 0.32); }
        else { const tie = add(b, G.box(0.06, 0.32, 0.03), m(o.tie, { r: 0.5 }), 0, 1.3, 0.325); tie.rotation.x = -0.12; }
        [-1, 1].forEach((s) => { const lp = add(b, G.box(0.08, 0.42, 0.03), m(o.tee, { r: 0.5 }), s * 0.14, 1.28, 0.31); lp.rotation.set(-0.12, 0, s * 0.18); });
        if (o.flower) { add(b, G.sphere(0.05, 10, 8), m('#ffffff'), -0.2, 1.42, 0.3); }
      }
      this.armL = this.limb(b, -0.43, 1.42); this.armR = this.limb(b, 0.43, 1.42);
      [this.armL, this.armR].forEach((A) => {
        add(A, G.capsule(0.125, 0.2), m(o.sleeve, { r: 0.9 }), 0, -0.14, 0);
        add(A, o.suit ? G.capsule(0.1, 0.26) : G.capsule(0.095, 0.26), o.suit ? m(o.sleeve, { r: 0.6 }) : skin, 0, -0.44, 0);
        add(A, G.sphere(0.105, 12, 10), skin, 0, -0.62, 0.01);
      });
      this.head = this.limb(b, 0, 1.5);
      const r = 0.29, hc = 0.17;
      const hg = new T.Group(); hg.position.y = hc; this.head.add(hg); this.headInner = hg;
      add(hg, G.sphere(r, 26, 20), skin, 0, 0, 0);
      [-1, 1].forEach((s) => add(hg, G.sphere(0.065, 10, 8), skin, s * r * 0.98, -0.01, -0.02));
      const hairCol = o.hair;
      if (!o.bald) {
        const hair = add(hg, new T.SphereGeometry(r * 1.06, 26, 12, 0, Math.PI * 2, 0, Math.PI * 0.36), m(hairCol, { r: 0.95 }), 0, 0.01, -0.02);
        hair.rotation.x = -0.28;
      }
      add(hg, new T.SphereGeometry(r * 1.03, 26, 14, Math.PI * 0.78, Math.PI * 1.44, Math.PI * (o.bald ? 0.3 : 0.12), Math.PI * (o.bald ? 0.3 : 0.5)), m(hairCol, { r: 0.95 }), 0, 0, 0);
      const style = o.beardStyle || 'full';
      if (style === 'full') add(hg, new T.SphereGeometry(r * 1.035, 26, 14, Math.PI * 0.1, Math.PI * 0.8, Math.PI * 0.53, Math.PI * 0.4), m(o.beard, { r: 1 }), 0, 0, 0);
      if (style !== 'none') { const must = add(hg, G.capsule(0.024, 0.12), m(o.beard || hairCol, { r: 1 }), 0, -0.07, r * 1.0); must.rotation.z = Math.PI / 2; }
      const mouth = add(hg, new T.CircleGeometry(0.068, 20, Math.PI, Math.PI), m('#5a1f24', { r: 0.6 }), 0, -0.105, r * 1.035);
      mouth.scale.set(1, 0.85, 1); mouth.castShadow = false;
      add(mouth, new T.PlaneGeometry(0.1, 0.022), G.basic('#fffaf2'), 0, -0.012, 0.002).castShadow = false;
      add(hg, G.sphere(0.05, 10, 8), m('#b97c5b', { r: 0.6 }), 0, -0.02, r * 0.98);
      this.eyes = buildFace(hg, r, { eyeR: 0.04, eyeX: 0.1, eyeY: 0.045 });
      [-1, 1].forEach((s) => { const br = add(hg, G.box(0.12, 0.032, 0.03), m(o.brow || hairCol), s * 0.1, 0.13, r * 0.93); br.rotation.z = s * -0.12; });
      if (o.glasses) this.eyeGlasses(hg, r, 0.1, 0.045);
      this.height = 1.95;
    }

    eyeGlasses(hg, r, ex, ey) {
      const gm = m('#2b2228', { r: 0.3, m: 0.4 });
      [-1, 1].forEach((s) => add(hg, G.torus(0.06, 0.01), gm, s * ex, ey, r * 0.98));
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
      });
      const torso = add(b, G.capsule(0.17, 0.2), m(o.top, { r: 0.85 }), 0, 0.75, 0);
      torso.scale.set(1, 1, 0.85); this.torso = torso;
      if (o.dress) {
        const tex = G.glitterTex(o.dress, o.fleck || '#ffffff');
        const dm = new T.MeshStandardMaterial({ map: tex, roughness: 0.5, metalness: 0.25, color: '#ffffff' });
        add(b, G.cyl(0.16, 0.44, 0.88, 26), dm, 0, 0.5, 0);
        if (o.veil) { const v = add(b, G.cyl(0.2, 0.5, 0.9, 24), m('#ffffff', { t: true, o: 0.35, ds: true }), 0, 0.62, -0.08); v.castShadow = false; }
      } else if (o.coat) {
        const coat = m('#ffffff', { r: 0.7 });
        add(b, G.cyl(0.18, 0.31, 0.66, 22), coat, 0, 0.62, 0);
        const st = add(b, G.torus(0.13, 0.016, Math.PI * 1.4), m('#2c3e66', { r: 0.4 }), 0, 0.86, 0.12); st.rotation.set(-0.5, 0, Math.PI * 1.2);
        add(b, G.cyl(0.03, 0.03, 0.02, 10), m('#c9ccd3', { m: 0.8 }), 0.06, 0.74, 0.2).rotation.x = Math.PI / 2;
        const badge = G.textPlane('Dr. Mariem', 0.05, { color: '#2c3e66', bg: '#ffffff', size: 60, pad: 8 }); badge.position.set(-0.11, 0.86, 0.19); badge.rotation.y = -0.3; b.add(badge);
      } else if (o.tunic) {
        add(b, G.cyl(0.17, 0.3, 0.56, 20), m(o.tunic, { r: 0.85 }), 0, 0.66, 0);
      } else if (o.poncho) {
        const tex = G.glitterTex(o.poncho, o.fleck);
        const pm = new T.MeshStandardMaterial({ map: tex, roughness: 0.42, metalness: 0.45, color: '#ffffff' });
        add(b, G.cyl(0.16, 0.34, 0.34, 24), pm, 0, 0.8, 0);
      } else {
        add(b, G.cyl(0.16, 0.29, 0.5, 20), m(o.top, { r: 0.8 }), 0, 0.68, 0);
      }
      this.armL = this.limb(b, -0.21, 0.93); this.armR = this.limb(b, 0.21, 0.93);
      [this.armL, this.armR].forEach((A, i) => {
        add(A, G.capsule(0.058, 0.26), m(o.coat ? '#ffffff' : o.top, { r: 0.85 }), 0, -0.19, 0);
        add(A, G.sphere(0.064, 10, 8), skin, 0, -0.39, 0.01);
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
      if (o.tiara) { const ti = add(hg, G.torus(0.13, 0.014, Math.PI), m('#ffd36e', { m: 0.9, r: 0.2 }), 0, r * 0.95, 0.08); ti.rotation.x = -0.5; }
      if (o.glasses) {
        const gm = m('#151215', { r: 0.2, m: 0.4 });
        [-1, 1].forEach((s) => { const l = add(hg, G.torus(0.055, 0.014), gm, s * 0.07, r * 1.02, 0.11); l.rotation.x = -1.1; });
        add(hg, G.box(0.05, 0.012, 0.012), gm, 0, r * 1.03, 0.14);
      }
      if (o.eyeGlasses) this.eyeGlasses(hg, r, 0.083, 0.02);
      this.eyes = buildFace(hg, r, { eyeR: 0.042, eyeX: 0.083, eyeY: 0.02 });
      [-1, 1].forEach((s) => {
        const wing = add(hg, G.box(0.05, 0.012, 0.01), m('#1a1018'), s * 0.123, 0.042, r * 0.88);
        wing.rotation.z = s * 0.45; wing.castShadow = false;
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
      if (this.eyes) this.eyes.forEach((e) => { e.scale.y = closed ? 0.12 : 1.15; });
      if (this.flashT > 0) { this.flashT -= dt; this.root.visible = Math.floor(this.flashT * 14) % 2 === 0; }
      else this.root.visible = true;
    }
  }

  MM.Characters = {
    // outfit: index (Settings choice) or a chapter outfit key ('school', 'coat', 'suit', 'dress', 'groom', 'bride', 'summer')
    create(id, outfit, opts) {
      const c = new Character(id, outfit, opts);
      if (id === 'npc') c.body.userData.base = (opts && opts.scale) || (opts && opts.gender === 'f' ? 1.18 : 0.94);
      return c;
    },
  };
})(window.MM);
