/* Prop library. Every builder returns a THREE.Group standing on y = 0, facing +z. */
(function (MM) {
  'use strict';
  const T = THREE, G = MM.G;
  const P = (MM.Props = {});

  function grp() { return new T.Group(); }
  function bx(p, w, h, d, color, x, y, z, o) { return G.mesh(G.box(w, h, d), typeof color === 'string' || typeof color === 'number' ? G.mat(color, o) : color, x, y, z, p); }
  function cy(p, rt, rb, h, color, x, y, z, o, seg) { return G.mesh(G.cyl(rt, rb, h, seg), typeof color === 'string' || typeof color === 'number' ? G.mat(color, o) : color, x, y, z, p); }
  function sp(p, r, color, x, y, z, o) { return G.mesh(G.sphere(r, 16, 12), typeof color === 'string' || typeof color === 'number' ? G.mat(color, o) : color, x, y, z, p); }
  P.bx = bx; P.cy = cy; P.sp = sp;

  const glowMat = (c, i) => G.mat(c, { e: c, ei: i != null ? i : 1.4, r: 0.5 });

  /* ---------------- nature / general ---------------- */
  P.tree = function (h, color) {
    const g = grp(); h = h || 3;
    cy(g, 0.14, 0.2, h * 0.5, '#7a5236', 0, h * 0.25, 0);
    sp(g, h * 0.28, color || '#5fae6b', 0, h * 0.62, 0, { flat: true });
    sp(g, h * 0.2, color || '#6cc077', h * 0.16, h * 0.78, 0.05, { flat: true });
    sp(g, h * 0.18, color || '#58a463', -h * 0.15, h * 0.74, -0.05, { flat: true });
    return g;
  };
  P.palm = function (h) {
    const g = grp(); h = h || 4;
    const seg = 6;
    for (let i = 0; i < seg; i++) { const t = i / seg; cy(g, 0.13, 0.16, h / seg + 0.05, i % 2 ? '#a07a4f' : '#8d6a43', Math.sin(t * 1.2) * 0.5, (i + 0.5) * (h / seg), 0); }
    const top = new T.Vector3(Math.sin(1.2) * 0.5, h, 0);
    for (let i = 0; i < 7; i++) {
      const leaf = bx(g, 0.35, 0.05, 1.7, '#3f9b54', top.x, top.y, top.z, { flat: true });
      leaf.geometry = G.box(0.35, 0.05, 1.7);
      leaf.rotation.y = (i / 7) * Math.PI * 2; leaf.rotation.x = 0.45;
      leaf.position.add(new T.Vector3(Math.sin(leaf.rotation.y) * 0.75, -0.25, Math.cos(leaf.rotation.y) * 0.75));
    }
    sp(g, 0.16, '#6b4a2b', top.x, top.y - 0.1, top.z);
    return g;
  };
  P.cloud = function (s) {
    const g = grp(); s = s || 1;
    [[0, 0, 0, 1], [0.9, -0.15, 0, 0.75], [-0.9, -0.15, 0.1, 0.8], [0.35, 0.45, 0, 0.7]].forEach(([x, y, z, r]) => sp(g, r * s, '#ffffff', x * s, y * s, z * s, { r: 1 }));
    g.traverse((o) => { if (o.isMesh) o.castShadow = false; });
    return g;
  };
  P.plant = function (s) {
    const g = grp(); s = s || 1;
    cy(g, 0.22 * s, 0.17 * s, 0.4 * s, '#d27a52', 0, 0.2 * s, 0);
    sp(g, 0.32 * s, '#4fa462', 0, 0.62 * s, 0, { flat: true });
    sp(g, 0.22 * s, '#5cbb70', 0.15 * s, 0.85 * s, 0.05 * s, { flat: true });
    return g;
  };
  P.flower = function (color) {
    const g = grp();
    cy(g, 0.02, 0.02, 0.4, '#3f8a4b', 0, 0.2, 0);
    sp(g, 0.09, color || '#ff6f9c', 0, 0.42, 0);
    sp(g, 0.04, '#ffd34d', 0, 0.44, 0.07);
    return g;
  };
  P.lampPost = function (color) {
    const g = grp();
    cy(g, 0.07, 0.1, 3.2, '#2c2a33', 0, 1.6, 0, { m: 0.6, r: 0.4 });
    sp(g, 0.24, glowMat(color || '#ffd88a', 1.6), 0, 3.35, 0).castShadow = false;
    return g;
  };
  P.fence = function (len, color) {
    const g = grp(); color = color || '#f4efe7';
    for (let x = -len / 2; x <= len / 2 + 0.01; x += 0.6) bx(g, 0.09, 0.8, 0.09, color, x, 0.4, 0);
    bx(g, len, 0.08, 0.06, color, 0, 0.6, 0); bx(g, len, 0.08, 0.06, color, 0, 0.3, 0);
    return g;
  };
  P.heartBalloon = function (color) {
    const g = grp();
    const h = G.mesh(G.heartGeo(), G.mat(color || '#ff6f9c', { r: 0.35, m: 0.1 }), 0, 2.2, 0, g);
    h.rotation.z = Math.PI; h.scale.setScalar(0.8);
    cy(g, 0.008, 0.008, 1.8, '#ffffff', 0, 0.95, 0);
    return g;
  };

  /* ---------------- school ---------------- */
  P.desk = function () {
    const g = grp(), wood = G.mat('#c58e5a', { r: 0.6 });
    bx(g, 1.4, 0.08, 0.8, wood, 0, 0.78, 0);
    [[-0.62, -0.32], [0.62, -0.32], [-0.62, 0.32], [0.62, 0.32]].forEach(([x, z]) => cy(g, 0.03, 0.03, 0.76, '#5c6470', x, 0.38, z, { m: 0.6, r: 0.4 }));
    bx(g, 1.3, 0.25, 0.04, '#aa7748', 0, 0.62, -0.34);
    return g;
  };
  P.schoolChair = function () {
    const g = grp(), wood = G.mat('#b8834f', { r: 0.6 });
    bx(g, 0.5, 0.06, 0.5, wood, 0, 0.46, 0);
    bx(g, 0.5, 0.42, 0.05, wood, 0, 0.78, -0.24);
    [[-0.21, -0.21], [0.21, -0.21], [-0.21, 0.21], [0.21, 0.21]].forEach(([x, z]) => cy(g, 0.02, 0.02, 0.46, '#5c6470', x, 0.23, z, { m: 0.6 }));
    return g;
  };
  P.chalkboard = function (w, text) {
    const g = grp(); w = w || 6;
    bx(g, w + 0.3, 2.7, 0.12, '#8a5a32', 0, 2.25, 0);
    bx(g, w, 2.4, 0.14, '#2f4a3c', 0, 2.25, 0.02, { r: 0.95 });
    bx(g, w, 0.08, 0.25, '#8a5a32', 0, 1.0, 0.12);
    if (text) { const t = G.textPlane(text, 0.32, { color: '#f3f1e8', font: '"Yellowtail",cursive', weight: 400, size: 90 }); t.position.set(0, 2.3, 0.1); g.add(t); }
    return g;
  };
  P.bookStack = function (n, seed) {
    const g = grp(), r = MM.rng(seed || 1);
    const cols = ['#e05d6f', '#5aa9ff', '#ffcf6e', '#7ee0c3', '#a979e8', '#ff9f5a'];
    let y = 0;
    for (let i = 0; i < n; i++) {
      const h = 0.12 + r() * 0.08;
      const b = bx(g, 0.75 + r() * 0.2, h, 0.55 + r() * 0.1, cols[Math.floor(r() * cols.length)], (r() - 0.5) * 0.08, y + h / 2, 0);
      b.rotation.y = (r() - 0.5) * 0.4; y += h;
    }
    return g;
  };
  P.pencil = function (len) {
    const g = grp(); len = len || 3;
    const body = cy(g, 0.12, 0.12, len, '#ffcf3d', 0, 0.12, 0, { r: 0.5 }, 6); body.rotation.z = Math.PI / 2;
    const tip = G.mesh(G.cone(0.12, 0.4, 6), G.mat('#f3d2a2'), len / 2 + 0.2, 0.12, 0, g); tip.rotation.z = -Math.PI / 2;
    const lead = G.mesh(G.cone(0.04, 0.13, 6), G.mat('#333'), len / 2 + 0.34, 0.12, 0, g); lead.rotation.z = -Math.PI / 2;
    const er = cy(g, 0.12, 0.12, 0.25, '#ff8fa8', -len / 2 - 0.12, 0.12, 0, null, 12); er.rotation.z = Math.PI / 2;
    return g;
  };
  P.globe = function () {
    const g = grp();
    cy(g, 0.25, 0.3, 0.08, '#7a5236', 0, 0.04, 0);
    cy(g, 0.03, 0.03, 0.5, '#c9a25a', 0, 0.3, 0, { m: 0.7 });
    sp(g, 0.42, '#5aa9ff', 0, 0.92, 0);
    sp(g, 0.2, '#6cc077', 0.2, 1.05, 0.25, { flat: true });
    sp(g, 0.18, '#6cc077', -0.25, 0.8, 0.22, { flat: true });
    return g;
  };
  P.locker = function (color) {
    const g = grp();
    bx(g, 0.7, 2.2, 0.6, color || '#5aa0c8', 0, 1.1, 0, { m: 0.3, r: 0.5 });
    for (let i = 0; i < 3; i++) bx(g, 0.4, 0.03, 0.02, '#2b3a45', 0, 1.8 + i * 0.08, 0.31);
    return g;
  };
  P.bigWindow = function (w, h, glow) {
    const g = grp();
    bx(g, w, h, 0.1, G.mat(glow || '#cfe9ff', { e: glow || '#cfe9ff', ei: 0.7 }), 0, h / 2, 0);
    const frame = G.mat('#ffffff', { r: 0.5 });
    bx(g, w + 0.2, 0.15, 0.2, frame, 0, 0, 0.02); bx(g, w + 0.2, 0.15, 0.2, frame, 0, h, 0.02);
    bx(g, 0.15, h, 0.2, frame, -w / 2, h / 2, 0.02); bx(g, 0.15, h, 0.2, frame, w / 2, h / 2, 0.02);
    bx(g, 0.1, h, 0.18, frame, 0, h / 2, 0.02); bx(g, w, 0.1, 0.18, frame, 0, h / 2, 0.02);
    return g;
  };

  /* ---------------- the grind ---------------- */
  P.laptop = function (s) {
    const g = grp(); s = s || 1;
    bx(g, 2.4 * s, 0.12 * s, 1.6 * s, '#b8bcc8', 0, 0.06 * s, 0, { m: 0.6, r: 0.35 });
    const scr = grp(); scr.position.set(0, 0.12 * s, -0.78 * s); g.add(scr);
    bx(scr, 2.4 * s, 1.55 * s, 0.08 * s, '#9da2ae', 0, 0.78 * s, 0, { m: 0.6, r: 0.35 });
    const sm = new T.MeshBasicMaterial({ map: G.codeTex() });
    G.mesh(new T.PlaneGeometry(2.2 * s, 1.35 * s), sm, 0, 0.8 * s, 0.045 * s, scr).castShadow = false;
    scr.rotation.x = -0.25;
    return g;
  };
  P.mug = function (color, s) {
    const g = grp(); s = s || 1;
    cy(g, 0.3 * s, 0.26 * s, 0.6 * s, color || '#ffffff', 0, 0.3 * s, 0, { r: 0.4 });
    cy(g, 0.27 * s, 0.27 * s, 0.02 * s, '#5b3a26', 0, 0.58 * s, 0);
    const h = G.mesh(G.torus(0.14 * s, 0.04 * s), G.mat(color || '#ffffff'), 0.32 * s, 0.32 * s, 0, g); h.rotation.y = 0;
    return g;
  };
  P.deskLamp = function (s) {
    const g = grp(); s = s || 1;
    cy(g, 0.6 * s, 0.7 * s, 0.15 * s, '#2c2a33', 0, 0.08 * s, 0, { m: 0.5 });
    const a = cy(g, 0.06 * s, 0.06 * s, 3 * s, '#2c2a33', 0.4 * s, 1.5 * s, 0, { m: 0.5 }); a.rotation.z = -0.3;
    const head = G.mesh(G.cone(0.6 * s, 0.8 * s, 18, true), G.mat('#ff6f9c', { r: 0.5 }), 1.0 * s, 2.9 * s, 0, g); head.rotation.z = 0.9;
    sp(g, 0.22 * s, glowMat('#fff2c4', 2), 1.15 * s, 2.7 * s, 0).castShadow = false;
    return g;
  };
  P.moon = function (r) {
    const g = grp();
    const m = sp(g, r || 6, G.mat('#fff5d6', { e: '#fff5d6', ei: 0.9 }), 0, 0, 0); m.castShadow = false;
    return g;
  };

  /* ---------------- USA + Egypt ---------------- */
  P.skyscraper = function (w, h, d, color, seed) {
    const g = grp();
    const tex = G.windowsTex(color || '#3a3f5c', '#ffe7a8', seed).clone(); tex.needsUpdate = true;
    tex.repeat.set(Math.max(1, Math.round(w / 2)), Math.max(1, Math.round(h / 4)));
    const mat = new T.MeshStandardMaterial({ map: tex, roughness: 0.6, emissive: new T.Color('#ffffff'), emissiveMap: tex, emissiveIntensity: 0.35 });
    G.mesh(G.box(w, h, d), mat, 0, h / 2, 0, g).castShadow = false;
    bx(g, w * 0.6, 1, d * 0.6, color || '#3a3f5c', 0, h + 0.5, 0);
    return g;
  };
  P.liberty = function () {
    const g = grp(), green = G.mat('#6fbfa6', { r: 0.6, flat: true });
    bx(g, 3, 3, 3, '#cdb48d', 0, 1.5, 0);
    bx(g, 2.2, 1.2, 2.2, '#bfa47b', 0, 3.6, 0);
    G.mesh(G.cone(1.1, 5, 10), green, 0, 6.6, 0, g);
    sp(g, 0.55, green, 0, 9.4, 0);
    for (let i = 0; i < 7; i++) { const s = G.mesh(G.cone(0.1, 0.6, 4), green, 0, 9.9, 0, g); s.rotation.z = (i - 3) * 0.32; s.position.x = Math.sin((i - 3) * 0.32) * 0.45; }
    const arm = cy(g, 0.18, 0.18, 2.4, green, 0.7, 9.6, 0); arm.rotation.z = -0.25;
    cy(g, 0.25, 0.15, 0.4, '#d6b25a', 1.0, 10.9, 0, { m: 0.7 });
    sp(g, 0.32, glowMat('#ffb347', 2), 1.0, 11.3, 0);
    bx(g, 0.5, 0.8, 0.12, green, -0.6, 7, 0.9);
    return g;
  };
  P.taxi = function () {
    const g = grp();
    bx(g, 2.2, 0.55, 1.1, '#ffd23f', 0, 0.45, 0, { r: 0.4 });
    bx(g, 1.2, 0.45, 1.0, '#ffd23f', -0.1, 0.95, 0, { r: 0.4 });
    bx(g, 1.15, 0.36, 1.02, '#9fd3ff', -0.1, 0.95, 0, { r: 0.1, m: 0.3 });
    bx(g, 0.4, 0.14, 0.3, '#ffffff', -0.1, 1.25, 0);
    [[-0.7, 0.55], [0.7, 0.55], [-0.7, -0.55], [0.7, -0.55]].forEach(([x, z]) => { const w = cy(g, 0.22, 0.22, 0.16, '#222', x, 0.22, z); w.rotation.x = Math.PI / 2; });
    return g;
  };
  P.pyramid = function (s) {
    const g = grp(); s = s || 4;
    const p = G.mesh(new T.ConeGeometry(s, s * 0.95, 4, 1), G.mat('#e3c07e', { r: 0.9, flat: true }), 0, s * 0.475, 0, g);
    p.rotation.y = Math.PI / 4;
    return g;
  };
  P.obelisk = function (h) {
    const g = grp(); h = h || 5;
    cy(g, 0.35, 0.55, h, '#d9b77a', 0, h / 2, 0, { flat: true }, 4).rotation.y = Math.PI / 4;
    G.mesh(G.cone(0.38, 0.6, 4), G.mat('#ffd76e', { m: 0.6, r: 0.3 }), 0, h + 0.3, 0, g).rotation.y = Math.PI / 4;
    return g;
  };
  P.felucca = function () {
    const g = grp();
    const hull = bx(g, 3, 0.5, 1, '#8a5a32', 0, 0.25, 0); hull.scale.set(1, 1, 1);
    cy(g, 0.05, 0.05, 3.5, '#5d3a20', 0.2, 2, 0);
    const sail = G.mesh(new T.ConeGeometry(1.4, 3, 3, 1), G.mat('#fff8ec', { ds: true }), 0.8, 2.2, 0, g); sail.scale.z = 0.05; sail.rotation.z = -0.2;
    return g;
  };
  P.booth = function (color, label) {
    const g = grp();
    bx(g, 1.6, 0.12, 1.6, color, 0, 3, 0);
    [[-0.75, -0.75], [0.75, -0.75], [-0.75, 0.75], [0.75, 0.75]].forEach(([x, z]) => bx(g, 0.1, 3, 0.1, color, x, 1.5, z));
    if (label) { const t = G.textPlane(label, 0.3, { color: '#fff', bg: color, size: 60, pad: 16 }); t.position.set(0, 3.4, 0.82); g.add(t); }
    return g;
  };
  P.planeToy = function () {
    const g = grp(), w = G.mat('#ffffff', { r: 0.4 });
    const body = cy(g, 0.35, 0.3, 4, w, 0, 0, 0); body.rotation.z = Math.PI / 2;
    G.mesh(G.sphere(0.35, 12, 10), w, 2, 0, 0, g);
    bx(g, 1, 0.08, 4.2, w, 0, 0, 0);
    bx(g, 0.6, 1, 0.08, '#ff6f9c', -1.8, 0.5, 0);
    bx(g, 2.8, 0.1, 0.02, '#5aa9ff', 0, 0.1, 0.36);
    return g;
  };

  /* ---------------- tech HQ ---------------- */
  P.serverRack = function (h, ledColor) {
    const g = grp(); h = h || 2.4;
    bx(g, 1.2, h, 1.0, '#1c2030', 0, h / 2, 0, { m: 0.5, r: 0.4 });
    const led = glowMat(ledColor || '#7ee0c3', 1.6);
    for (let y = 0.3; y < h - 0.2; y += 0.28) { bx(g, 1.0, 0.04, 0.02, led, 0, y, 0.51).castShadow = false; bx(g, 0.08, 0.06, 0.02, glowMat('#ff6f9c', 2), 0.42, y + 0.1, 0.51).castShadow = false; }
    return g;
  };
  P.neon = function (text, color, h) {
    const g = grp();
    const t = G.textPlane(text, h || 1.2, { color: '#ffffff', glow: color || '#ff6f9c', size: 120, pad: 40, toneMapped: false });
    t.material.toneMapped = false;
    t.position.y = (h || 1.2) * 0.8; g.add(t);
    return g;
  };
  P.monitor = function (tex) {
    const g = grp();
    cy(g, 0.3, 0.35, 0.06, '#2a2d3a', 0, 0.03, 0, { m: 0.5 });
    bx(g, 0.08, 0.5, 0.08, '#2a2d3a', 0, 0.3, 0);
    bx(g, 1.4, 0.85, 0.08, '#2a2d3a', 0, 0.95, 0, { m: 0.5 });
    G.mesh(new T.PlaneGeometry(1.3, 0.75), new T.MeshBasicMaterial({ map: tex || G.codeTex() }), 0, 0.95, 0.045, g).castShadow = false;
    return g;
  };
  P.robot = function () {
    const g = grp(), w = G.mat('#e8ecf5', { r: 0.35, m: 0.2 });
    sp(g, 0.35, w, 0, 0.45, 0);
    sp(g, 0.28, w, 0, 0.95, 0);
    bx(g, 0.36, 0.16, 0.05, '#1c2030', 0, 0.97, 0.25);
    [-0.08, 0.08].forEach((x) => sp(g, 0.035, glowMat('#7ee0c3', 2), x, 0.97, 0.28).castShadow = false);
    cy(g, 0.015, 0.015, 0.2, '#888', 0, 1.3, 0); sp(g, 0.05, glowMat('#ff6f9c', 2), 0, 1.42, 0);
    return g;
  };

  /* ---------------- Nile boat (from their photos) ---------------- */
  P.diningTable = function (lit) {
    const g = grp();
    cy(g, 0.06, 0.08, 0.7, '#4a3324', 0, 0.35, 0);
    cy(g, 0.75, 0.75, 0.06, '#f5f1e8', 0, 0.75, 0, { r: 0.85 });
    cy(g, 0.78, 0.82, 0.32, '#f5f1e8', 0, 0.6, 0, { r: 0.85, ds: true }, 24);
    cy(g, 0.83, 0.83, 0.06, '#d6b25a', 0, 0.46, 0, { m: 0.6, r: 0.35 }, 24);
    cy(g, 0.15, 0.15, 0.02, '#f8f6f2', -0.3, 0.79, 0.2);
    cy(g, 0.15, 0.15, 0.02, '#f8f6f2', 0.3, 0.79, -0.2);
    cy(g, 0.05, 0.03, 0.28, '#e9fbff', 0.25, 0.92, 0.3, { t: true, o: 0.45 });
    if (lit !== false) { cy(g, 0.04, 0.04, 0.1, '#d6b25a', 0, 0.83, 0, { m: 0.7 }); sp(g, 0.035, glowMat('#ffc061', 3), 0, 0.92, 0).castShadow = false; }
    return g;
  };
  P.velvetChair = function () {
    const g = grp(), velvet = G.mat('#1f3fbf', { r: 0.95 }), wood = G.mat('#b98a56', { r: 0.5 });
    bx(g, 0.62, 0.14, 0.6, velvet, 0, 0.5, 0);
    bx(g, 0.62, 0.7, 0.14, velvet, 0, 0.92, -0.26);
    [-1, 1].forEach((s) => { bx(g, 0.07, 0.06, 0.6, wood, s * 0.33, 0.72, 0); bx(g, 0.06, 0.25, 0.06, wood, s * 0.33, 0.6, 0.25); });
    [[-0.26, -0.26], [0.26, -0.26], [-0.26, 0.26], [0.26, 0.26]].forEach(([x, z]) => bx(g, 0.06, 0.44, 0.06, wood, x, 0.22, z));
    const em = G.mesh(G.torus(0.13, 0.02), G.mat('#d6b25a', { m: 0.8, r: 0.3 }), 0, 0.97, -0.18, g); em.scale.y = 1.2;
    return g;
  };
  P.pillarSconces = function (h) {
    const g = grp(); h = h || 4;
    const wood = new T.MeshStandardMaterial({ map: G.woodTex('#8a4f2a', '#3b1d0c'), roughness: 0.35, metalness: 0.1 });
    G.mesh(G.box(0.9, h, 0.9), wood, 0, h / 2, 0, g);
    bx(g, 1.05, 0.3, 1.05, '#6e3b1d', 0, 0.15, 0, { r: 0.4 });
    bx(g, 1.05, 0.25, 1.05, '#6e3b1d', 0, h - 0.12, 0, { r: 0.4 });
    const brass = G.mat('#c9a04a', { m: 0.8, r: 0.3 });
    const shade = G.mat('#ffe2a6', { e: '#ffcf7a', ei: 1.3, r: 0.6, ds: true });
    [[0, 0.46, 0], [-0.46, 0, Math.PI / 2], [0.46, 0, -Math.PI / 2]].forEach(([x, z, ry]) => {
      const s = grp(); s.position.set(x, h * 0.72, z); s.rotation.y = ry === 0 ? 0 : ry; g.add(s);
      cy(s, 0.03, 0.03, 0.35, brass, 0, -0.1, 0.12).rotation.x = Math.PI / 2;
      cy(s, 0.03, 0.04, 0.2, '#f4ecdc', 0, 0.12, 0.28);
      G.mesh(new T.CylinderGeometry(0.1, 0.18, 0.24, 16, 1, true), shade, 0, 0.32, 0.28, s).castShadow = false;
    });
    return g;
  };
  P.valance = function (len) {
    const g = grp();
    bx(g, len, 0.7, 0.16, '#8f1d2c', 0, 0.35, 0, { r: 0.95 });
    for (let x = -len / 2 + 0.6; x < len / 2; x += 1.2) bx(g, 0.03, 0.68, 0.18, '#741624', x, 0.35, 0.01);
    const n = Math.floor(len / 0.12);
    const im = new T.InstancedMesh(G.cyl(0.018, 0.018, 0.22, 4), G.mat('#d7c7b0'), n);
    const mtx = new T.Matrix4();
    for (let i = 0; i < n; i++) { mtx.makeTranslation(-len / 2 + i * 0.12 + 0.06, -0.1, 0.07); im.setMatrixAt(i, mtx); }
    g.add(im);
    return g;
  };
  P.riverWindow = function (w, h) {
    const g = grp();
    const c = document.createElement('canvas'); c.width = 256; c.height = 128;
    const x = c.getContext('2d');
    const grd = x.createLinearGradient(0, 0, 0, 128); grd.addColorStop(0, '#0b1240'); grd.addColorStop(0.55, '#1a1150'); grd.addColorStop(1, '#0a2a5a');
    x.fillStyle = grd; x.fillRect(0, 0, 256, 128);
    const r = MM.rng(17);
    for (let i = 0; i < 70; i++) { x.fillStyle = r() < 0.6 ? 'rgba(255,214,140,.9)' : 'rgba(150,200,255,.9)'; const px = r() * 256, py = 55 + r() * 18; x.fillRect(px, py, 2, 2); x.fillStyle = 'rgba(255,214,140,.25)'; x.fillRect(px, py + 12, 2, 20); }
    const tex = new T.CanvasTexture(c); tex.colorSpace = T.SRGBColorSpace;
    G.mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ map: tex }), 0, h / 2, 0, g).castShadow = false;
    const fr = G.mat('#e9e4dc', { r: 0.4 });
    bx(g, w, 0.1, 0.12, fr, 0, 0, 0.03); bx(g, w, 0.1, 0.12, fr, 0, h, 0.03);
    bx(g, 0.1, h, 0.12, fr, -w / 2, h / 2, 0.03); bx(g, 0.1, h, 0.12, fr, w / 2, h / 2, 0.03);
    return g;
  };
  P.candle = function () {
    const g = grp();
    cy(g, 0.12, 0.14, 0.08, '#c9a04a', 0, 0.04, 0, { m: 0.8, r: 0.3 });
    cy(g, 0.07, 0.07, 0.4, '#fff6e6', 0, 0.28, 0, { r: 0.6 });
    const flame = G.mesh(G.cone(0.05, 0.16, 8), G.mat('#ffb347', { e: '#ffb347', ei: 3 }), 0, 0.56, 0, g);
    flame.castShadow = false; flame.visible = false;
    const glow = new T.Sprite(new T.SpriteMaterial({ map: G.tex('glow'), color: 0xffb347, transparent: true, depthWrite: false, blending: T.AdditiveBlending }));
    glow.scale.setScalar(0.9); glow.position.y = 0.56; glow.visible = false; g.add(glow);
    g.userData.light = (on) => { flame.visible = on; glow.visible = on; };
    return g;
  };
  P.rose = function (s) {
    const g = grp(); s = s || 1;
    cy(g, 0.015 * s, 0.015 * s, 0.5 * s, '#2f7a3d', 0, 0.25 * s, 0);
    sp(g, 0.09 * s, '#c8173b', 0, 0.52 * s, 0, { r: 0.7 });
    return g;
  };
  P.bouquet = function () {
    const g = grp();
    for (let i = 0; i < 9; i++) { const r = P.rose(1.1); r.position.set(Math.sin(i * 2.4) * 0.12, 0.05, Math.cos(i * 2.4) * 0.12); r.rotation.z = Math.sin(i) * 0.2; g.add(r); }
    cy(g, 0.12, 0.1, 0.3, '#f8e0e8', 0, 0.15, 0, { r: 0.5 });
    return g;
  };
  P.stringLights = function (len, h) {
    const g = grp(); h = h || 3;
    const cols = [0xffd88a, 0xff9cc0, 0xfff1d0];
    const n = Math.floor(len / 0.8);
    for (let i = 0; i <= n; i++) {
      const t = i / n, x = -len / 2 + t * len, y = h - Math.sin(t * Math.PI) * 0.6;
      const b = sp(g, 0.07, glowMat(cols[i % 3], 2.2), x, y, 0); b.castShadow = false;
    }
    return g;
  };

  /* ---------------- home ---------------- */
  P.sofa = function (color) {
    const g = grp(), c = G.mat(color || '#d9a7b4', { r: 0.95 });
    bx(g, 1.9, 0.45, 1.0, c, 0, 0.35, 0.05);
    bx(g, 1.9, 0.7, 0.3, c, 0, 0.8, -0.38);
    [-1, 1].forEach((s) => bx(g, 0.25, 0.6, 1.0, c, s * 0.92, 0.55, 0.05));
    [-0.45, 0.45].forEach((x) => bx(g, 0.8, 0.14, 0.75, G.mat('#f1d6dd', { r: 1 }), x, 0.64, 0.1));
    return g;
  };
  P.bed = function () {
    const g = grp();
    bx(g, 1.9, 0.5, 1.9, '#b98a56', 0, 0.25, 0, { r: 0.5 });
    bx(g, 1.8, 0.3, 1.8, '#f4efe7', 0, 0.62, 0.02, { r: 1 });
    bx(g, 1.82, 0.12, 1.2, '#7aa0d9', 0, 0.8, 0.3, { r: 1 });
    [-0.45, 0.45].forEach((x) => bx(g, 0.7, 0.16, 0.38, '#ffffff', x, 0.86, -0.6));
    bx(g, 1.9, 1.1, 0.12, '#8d6440', 0, 0.55, -0.96, { r: 0.5 });
    return g;
  };
  P.diningSet = function () {
    const g = grp(), wood = G.mat('#9b6b43', { r: 0.5 });
    bx(g, 1.8, 0.08, 1.0, wood, 0, 0.78, 0);
    [[-0.8, -0.42], [0.8, -0.42], [-0.8, 0.42], [0.8, 0.42]].forEach(([x, z]) => bx(g, 0.08, 0.76, 0.08, wood, x, 0.38, z));
    const v = P.plant(0.4); v.position.y = 0.82; g.add(v);
    return g;
  };
  P.rug = function (w, d, color) {
    const g = grp();
    const r = bx(g, w, 0.03, d, color || '#e8c6a8', 0, 0.015, 0, { r: 1 }); r.castShadow = false;
    const b = bx(g, w * 0.86, 0.035, d * 0.8, G.mat('#f6e6d6', { r: 1 }), 0, 0.02, 0); b.castShadow = false;
    return g;
  };
  P.fridge = function () {
    const g = grp();
    bx(g, 1.0, 2.2, 0.9, '#eef1f4', 0, 1.1, 0, { m: 0.3, r: 0.3 });
    bx(g, 0.06, 0.5, 0.06, '#9aa3ad', 0.35, 1.5, 0.47, { m: 0.8 });
    bx(g, 0.96, 0.02, 0.02, '#c8ced6', 0, 1.4, 0.46);
    return g;
  };
  P.tv = function () {
    const g = grp();
    bx(g, 2.4, 0.5, 0.5, '#6b4a34', 0, 0.25, 0);
    bx(g, 2.0, 1.15, 0.08, '#15161c', 0, 1.2, 0, { m: 0.4, r: 0.3 });
    return g;
  };
  P.bookshelf = function () {
    const g = grp(), wood = G.mat('#a87a50', { r: 0.6 });
    bx(g, 1.6, 2.2, 0.45, wood, 0, 1.1, 0);
    for (let i = 0; i < 4; i++) { const s = P.bookStack(1, i + 3); s.rotation.z = 0; s.scale.set(1.5, 2.2, 0.6); s.position.set(-0.3 + (i % 2) * 0.5, 0.25 + i * 0.5, 0.05); g.add(s); }
    return g;
  };
  P.house = function () {
    const g = grp();
    bx(g, 8, 4.5, 6, '#f7efe5', 0, 2.25, 0, { r: 0.8 });
    const roof = G.mesh(new T.ConeGeometry(6.2, 2.6, 4), G.mat('#c9665b', { r: 0.7, flat: true }), 0, 5.8, 0, g); roof.rotation.y = Math.PI / 4; roof.scale.set(1, 1, 0.8);
    bx(g, 1.4, 2.4, 0.15, '#8a5a32', 0, 1.2, 3.02);
    [-2.6, 2.6].forEach((x) => bx(g, 1.4, 1.2, 0.12, G.mat('#ffe6a6', { e: '#ffcf6e', ei: 0.8 }), x, 2.6, 3.02));
    const sign = G.textPlane('Our Home', 0.5, { color: '#fff', bg: '#ff6f9c', size: 70, pad: 18 }); sign.position.set(0, 3.2, 3.1); g.add(sign);
    return g;
  };
  P.car = function (color) {
    const g = grp(), body = G.mat(color || '#f2f4f7', { m: 0.55, r: 0.28 });
    bx(g, 2.1, 0.6, 4.2, body, 0, 0.62, 0);
    bx(g, 1.9, 0.18, 1.2, body, 0, 0.98, 1.4);
    const glass = G.mat('#a9d4ff', { m: 0.4, r: 0.1, t: true, o: 0.55 });
    const ws = bx(g, 1.9, 0.5, 0.06, glass, 0, 1.2, 0.85); ws.rotation.x = -0.45;
    // seats (open-top so both are visible)
    [-0.48, 0.48].forEach((x) => { bx(g, 0.75, 0.2, 0.7, '#2d1f1b', x, 0.95, -0.1); bx(g, 0.75, 0.42, 0.16, '#2d1f1b', x, 1.18, -0.5); });
    const wheelM = G.mat('#1d1d22', { r: 0.8 }), hub = G.mat('#c9ccd3', { m: 0.8, r: 0.3 });
    const wheels = [];
    [[-1.05, 1.4], [1.05, 1.4], [-1.05, -1.4], [1.05, -1.4]].forEach(([x, z]) => {
      const w = G.mesh(G.cyl(0.42, 0.42, 0.3, 18), wheelM, x, 0.42, z, g); w.rotation.z = Math.PI / 2;
      G.mesh(G.cyl(0.22, 0.22, 0.32, 12), hub, x, 0.42, z, g).rotation.z = Math.PI / 2;
      wheels.push(w);
    });
    [-0.7, 0.7].forEach((x) => { sp(g, 0.14, glowMat('#fff6d8', 2), x, 0.7, 2.1).castShadow = false; sp(g, 0.11, glowMat('#ff3b4e', 1.6), x, 0.75, -2.1).castShadow = false; });
    const steer = G.mesh(G.torus(0.17, 0.03), G.mat('#222'), 0.48, 1.32, 0.45, g); steer.rotation.x = -0.6;
    g.userData.wheels = wheels;
    return g;
  };

  /* ---------------- med school ---------------- */
  P.bigBook = function (color, title, w, h, d) {
    const g = grp(); w = w || 3; h = h || 0.8; d = d || 2.2;
    bx(g, w, h, d, color || '#5aa9ff', 0, h / 2, 0, { r: 0.6 });
    bx(g, w - 0.1, h - 0.16, d - 0.06, '#fbf6ec', 0.06, h / 2, 0.0, { r: 0.9 });
    if (title) { const t = G.textPlane(title, 0.22, { color: '#ffffff', size: 70, pad: 8 }); t.position.set(0, h / 2, d / 2 + 0.01); t.scale.setScalar(Math.min(1, (w - 0.3) / t.userData.w)); g.add(t); }
    return g;
  };
  P.pill = function (a, b, len) {
    const g = grp(); len = len || 2.4;
    const p1 = G.mesh(G.capsule(0.45, len / 2), G.mat(a || '#ff6f9c', { r: 0.3 }), -len / 4, 0.45, 0, g); p1.rotation.z = Math.PI / 2;
    const p2 = G.mesh(G.capsule(0.45, len / 2), G.mat(b || '#ffffff', { r: 0.3 }), len / 4, 0.45, 0, g); p2.rotation.z = Math.PI / 2;
    return g;
  };
  P.flask = function (color) {
    const g = grp();
    sp(g, 0.45, G.mat('#e9fbff', { t: true, o: 0.35, r: 0.1 }), 0, 0.45, 0);
    sp(g, 0.38, G.mat(color || '#7ee0c3', { e: color || '#7ee0c3', ei: 0.4, t: true, o: 0.8 }), 0, 0.38, 0);
    cy(g, 0.1, 0.12, 0.6, G.mat('#e9fbff', { t: true, o: 0.35 }), 0, 1.05, 0);
    return g;
  };
  P.stethoscope = function () {
    const g = grp(), tube = G.mat('#2c3e66', { r: 0.4 });
    const t = G.mesh(G.torus(1.1, 0.08, Math.PI * 1.3), tube, 0, 1.4, 0, g); t.rotation.z = -0.6;
    cy(g, 0.3, 0.3, 0.12, '#c9ccd3', 0.6, 0.06, 0.3, { m: 0.8, r: 0.25 });
    return g;
  };
  P.ecgMonitor = function () {
    const g = grp();
    bx(g, 2.2, 1.4, 0.2, '#e4ecef', 0, 2, 0, { r: 0.4 });
    const scr = G.mesh(new T.PlaneGeometry(1.9, 1.1), new T.MeshBasicMaterial({ map: G.ecgTex() }), 0, 2, 0.11, g); scr.castShadow = false;
    cy(g, 0.06, 0.06, 1.3, '#9aa3ad', 0, 0.65, 0, { m: 0.7 });
    return g;
  };
  P.gradCap = function () {
    const g = grp(), blk = G.mat('#16141c', { r: 0.6 });
    cy(g, 0.32, 0.36, 0.25, blk, 0, 0.12, 0);
    bx(g, 0.9, 0.05, 0.9, blk, 0, 0.27, 0).rotation.y = Math.PI / 4;
    sp(g, 0.04, '#ffcf6e', 0, 0.31, 0);
    bx(g, 0.02, 0.35, 0.02, '#ffcf6e', 0.3, 0.12, 0.3);
    return g;
  };

  /* ---------------- forever ---------------- */
  P.weddingArch = function () {
    const g = grp();
    const arch = G.mesh(G.torus(2, 0.14, Math.PI), G.mat('#ffffff', { r: 0.5 }), 0, 2.2, 0, g);
    [-2, 2].forEach((x) => cy(g, 0.14, 0.14, 2.2, '#ffffff', x, 1.1, 0));
    const cols = ['#ff9cc0', '#ffffff', '#ffd6e4', '#ff6f9c'];
    for (let i = 0; i <= 26; i++) {
      const a = (i / 26) * Math.PI, r = MM.rng(i + 5);
      sp(g, 0.16 + r() * 0.08, cols[i % 4], Math.cos(a) * 2, 2.2 + Math.sin(a) * 2, (r() - 0.5) * 0.2, { r: 0.8 });
      if (i % 3 === 0) sp(g, 0.13, '#6cc077', Math.cos(a) * 2.1, 2.2 + Math.sin(a) * 2.1, 0.1);
    }
    return g;
  };
  P.eiffel = function (s) {
    const g = grp(); s = s || 1;
    const m = G.mat('#8d6b4c', { r: 0.6, flat: true });
    const tiers = [[3.2, 2.0, 3.0], [2.0, 1.1, 3.4], [1.1, 0.35, 5.0]];
    let y = 0;
    tiers.forEach(([b, t, h], i) => {
      const c = G.mesh(new T.CylinderGeometry(t * s, b * s, h * s, 4, 1, true), G.mat('#8d6b4c', { r: 0.6, flat: true, ds: true }), 0, y + (h * s) / 2, 0, g);
      c.rotation.y = Math.PI / 4;
      y += h * s;
      bx(g, t * s * 1.55, 0.25 * s, t * s * 1.55, m, 0, y, 0);
    });
    cy(g, 0.05 * s, 0.1 * s, 1.5 * s, m, 0, y + 0.75 * s, 0);
    return g;
  };
  P.hotAirBalloon = function (color) {
    const g = grp();
    const env = sp(g, 1.6, color || '#ff6f9c', 0, 3.4, 0, { r: 0.6 }); env.scale.y = 1.2;
    bx(g, 0.8, 0.6, 0.8, '#a0703f', 0, 0.3, 0);
    [-1, 1].forEach((s) => [-1, 1].forEach((t) => cy(g, 0.01, 0.01, 1.6, '#555', s * 0.38, 1.3, t * 0.38)));
    return g;
  };
  P.beachHut = function () {
    const g = grp();
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([x, z]) => cy(g, 0.08, 0.08, 2.6, '#a0703f', x, 1.3, z));
    const roof = G.mesh(new T.ConeGeometry(2, 1.2, 4), G.mat('#e6c88a', { flat: true }), 0, 3.2, 0, g); roof.rotation.y = Math.PI / 4;
    return g;
  };
  P.cake = function () {
    const g = grp(), w = G.mat('#fffaf4', { r: 0.6 });
    cy(g, 0.6, 0.6, 0.45, w, 0, 0.22, 0); cy(g, 0.42, 0.42, 0.4, w, 0, 0.65, 0); cy(g, 0.26, 0.26, 0.35, w, 0, 1.02, 0);
    [0.45, 0.85, 1.2].forEach((y, i) => cy(g, [0.61, 0.43, 0.27][i], [0.61, 0.43, 0.27][i], 0.05, '#ff9cc0', 0, y, 0));
    const h = G.mesh(G.heartGeo(), G.mat('#ff6f9c'), 0, 1.4, 0, g); h.rotation.z = Math.PI; h.scale.setScalar(0.25);
    return g;
  };

  /* ---------------- collectibles ---------------- */
  P.collectible = function (kind, sub) {
    const g = grp();
    switch (kind) {
      case 'heart': {
        const h = G.mesh(G.heartGeo(), G.mat('#ff4f8b', { e: '#ff2f6f', ei: 0.35, r: 0.3, m: 0.1 }), 0, 0, 0, g);
        h.rotation.z = Math.PI; h.scale.setScalar(0.5);
        break;
      }
      case 'note': {
        bx(g, 0.5, 0.06, 0.38, '#fffdf6', 0, 0, 0, { r: 0.8 }).rotation.x = 0.4;
        const h = G.mesh(G.heartGeo(), G.mat('#ff6f9c'), 0, 0.04, 0.04, g); h.scale.setScalar(0.18); h.rotation.set(0.4 - Math.PI / 2, 0, Math.PI);
        break;
      }
      case 'book': {
        bx(g, 0.5, 0.65, 0.16, sub || '#5aa9ff', 0, 0, 0, { r: 0.5 });
        bx(g, 0.46, 0.6, 0.12, '#fbf6ec', 0.03, 0, 0);
        bx(g, 0.2, 0.06, 0.02, '#ffcf6e', 0, 0.12, 0.085);
        break;
      }
      case 'coin': {
        const c = cy(g, 0.3, 0.3, 0.07, '#ffcf3d', 0, 0, 0, { m: 0.85, r: 0.25 }, 22); c.rotation.x = Math.PI / 2;
        const t = G.textPlane('£', 0.2, { color: '#b9861b', size: 80, pad: 4 }); t.position.z = 0.04; g.add(t);
        break;
      }
      case 'contract': {
        bx(g, 0.55, 0.7, 0.04, '#fffdf6', 0, 0, 0);
        for (let i = 0; i < 4; i++) bx(g, 0.38, 0.03, 0.01, '#9aa3ad', 0, 0.2 - i * 0.1, 0.025);
        const s = cy(g, 0.09, 0.09, 0.02, '#e05d6f', 0.15, -0.22, 0.03); s.rotation.x = Math.PI / 2;
        break;
      }
      case 'petal': {
        const p = sp(g, 0.18, '#d0163e', 0, 0, 0, { r: 0.5, e: '#600014', ei: 0.4 }); p.scale.set(1, 0.35, 1.3);
        const p2 = sp(g, 0.14, '#e8355a', 0.08, 0.04, 0.05); p2.scale.set(1, 0.35, 1.2);
        break;
      }
      case 'ring': {
        const r = G.mesh(G.torus(0.2, 0.05), G.mat('#ffd36e', { m: 1, r: 0.15 }), 0, 0, 0, g); r.rotation.x = 0.3;
        G.mesh(new T.OctahedronGeometry(0.11), G.mat('#e8fbff', { m: 0.1, r: 0.05, e: '#9fe8ff', ei: 0.6 }), 0, 0.26, 0, g);
        break;
      }
      case 'flame': {
        const f = G.mesh(G.cone(0.16, 0.5, 10), G.mat('#ffb347', { e: '#ff9a2e', ei: 2.4 }), 0, 0, 0, g); f.castShadow = false;
        const core = G.mesh(G.cone(0.08, 0.26, 8), G.mat('#fff2c4', { e: '#fff2c4', ei: 3 }), 0, -0.08, 0.02, g); core.castShadow = false;
        const glow = new T.Sprite(new T.SpriteMaterial({ map: G.tex('glow'), color: 0xffb347, transparent: true, depthWrite: false, blending: T.AdditiveBlending }));
        glow.scale.setScalar(1.6); g.add(glow);
        break;
      }
      case 'coffee': {
        const m = P.mug('#ffffff', 0.55); m.position.y = -0.17; g.add(m);
        bx(g, 0.2, 0.12, 0.01, '#ff6f9c', 0, 0.02, 0.17);
        break;
      }
      case 'stamp': {
        bx(g, 0.62, 0.62, 0.04, '#fffdf6', 0, 0, 0);
        bx(g, 0.5, 0.5, 0.05, sub || '#5aa9ff', 0, 0, 0.005);
        const h = G.mesh(G.heartGeo(), G.mat('#ffffff'), 0, 0, 0.04, g); h.scale.setScalar(0.18); h.rotation.z = Math.PI;
        break;
      }
      case 'letter': {
        bx(g, 0.62, 0.42, 0.04, '#fffdf6', 0, 0, 0);
        const f = G.mesh(new T.ConeGeometry(0.33, 0.24, 3), G.mat('#f1e4d6'), 0, 0.09, 0.03, g); f.rotation.z = Math.PI; f.scale.z = 0.1;
        const h = G.mesh(G.heartGeo(), G.mat('#ff6f9c'), 0, -0.02, 0.05, g); h.scale.setScalar(0.12); h.rotation.z = Math.PI;
        break;
      }
      case 'decor': {
        const d = sub || 'plant';
        if (d === 'plant') { const p = P.plant(0.6); p.position.y = -0.35; g.add(p); }
        else if (d === 'frame') { bx(g, 0.6, 0.75, 0.06, '#d6b25a', 0, 0, 0, { m: 0.6 }); bx(g, 0.48, 0.62, 0.07, '#ffd3e2', 0, 0, 0.005); }
        else if (d === 'lamp') { cy(g, 0.05, 0.12, 0.5, '#d6b25a', 0, -0.15, 0, { m: 0.6 }); G.mesh(new T.CylinderGeometry(0.18, 0.28, 0.3, 14), G.mat('#fff2d0', { e: '#ffcf6e', ei: 0.6 }), 0, 0.2, 0, g); }
        else if (d === 'vase') { const v = sp(g, 0.22, '#7ec8e3', 0, -0.1, 0, { r: 0.3 }); v.scale.y = 1.3; const f = P.flower('#ff6f9c'); f.position.y = 0.05; g.add(f); }
        else if (d === 'clock') { const c = cy(g, 0.3, 0.3, 0.06, '#ffffff', 0, 0, 0); c.rotation.x = Math.PI / 2; bx(g, 0.03, 0.2, 0.02, '#333', 0, 0.08, 0.04); bx(g, 0.15, 0.03, 0.02, '#333', 0.06, 0, 0.04); }
        else if (d === 'cushion') { const c = bx(g, 0.5, 0.5, 0.18, '#ffb3c8', 0, 0, 0, { r: 1 }); c.rotation.z = 0.2; }
        break;
      }
      case 'memory': {
        bx(g, 0.78, 0.94, 0.05, '#fbf6f0', 0, 0, 0, { r: 0.8 });
        const ph = G.mesh(new T.PlaneGeometry(0.64, 0.66), new T.MeshBasicMaterial({ map: G.placeholderPhoto('') }), 0, 0.06, 0.03, g);
        ph.castShadow = false;
        g.userData.photo = ph;
        const glow = new T.Sprite(new T.SpriteMaterial({ map: G.tex('glow'), color: 0xffcf6e, transparent: true, depthWrite: false, blending: T.AdditiveBlending }));
        glow.scale.setScalar(2.2); glow.position.z = -0.1; g.add(glow);
        break;
      }
      default: sp(g, 0.25, '#ffcf6e');
    }
    return g;
  };
})(window.MM);
