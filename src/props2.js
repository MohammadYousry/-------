/* More props for the full story: Alexandria, buses and cars, the yacht, concerts, the garden, Sharm, Cairo. */
(function (MM) {
  'use strict';
  const T = THREE, G = MM.G, P = MM.Props;
  const bx = P.bx, cy = P.cy, sp = P.sp;
  const grp = () => new T.Group();
  const glow = (c, i) => G.mat(c, { e: c, ei: i != null ? i : 1.5, r: 0.5 });
  const txt = (g, text, h, x, y, z, o) => { const t = G.textPlane(text, h, Object.assign({ color: '#ffffff', size: 70, pad: 10 }, o || {})); t.position.set(x, y, z); g.add(t); return t; };

  /* ---------------- vehicles ---------------- */
  P.bus = function (color, label) {
    const g = grp(), c = G.mat(color || '#2f6fb3', { r: 0.45, m: 0.2 });
    bx(g, 2.5, 2.4, 9, c, 0, 1.6, 0);
    bx(g, 2.52, 0.3, 9.02, '#ffffff', 0, 1.05, 0);
    const glass = G.mat('#bfe3ff', { r: 0.1, m: 0.3, e: '#9fd0ff', ei: 0.25 });
    [-1, 1].forEach((s) => { for (let i = 0; i < 5; i++) bx(g, 0.04, 0.85, 1.4, glass, s * 1.27, 2.15, -3.4 + i * 1.65); });
    bx(g, 2.2, 1.0, 0.05, glass, 0, 2.2, 4.51);
    bx(g, 2.6, 0.12, 9.1, '#d8dde6', 0, 2.86, 0);
    if (label) txt(g, label, 0.32, 0, 2.6, 4.53, { color: '#ffcf6e', bg: '#1b1b22', pad: 14 });
    [[-1.25, 3], [1.25, 3], [-1.25, -3], [1.25, -3]].forEach(([x, z]) => { const w = cy(g, 0.5, 0.5, 0.36, '#1d1d22', x, 0.5, z); w.rotation.z = Math.PI / 2; });
    [-0.8, 0.8].forEach((x) => sp(g, 0.15, glow('#fff6d8', 2), x, 0.9, 4.52).castShadow = false);
    return g;
  };
  // Hossam's old maroon Chevrolet Lanos: a small three-box sedan.
  P.lanos = function () {
    const g = grp(), body = G.mat('#5e1626', { m: 0.45, r: 0.35 });
    bx(g, 1.75, 0.55, 4.0, body, 0, 0.6, 0);
    bx(g, 1.6, 0.5, 1.9, body, 0, 1.12, -0.15);
    const glass = G.mat('#9fc6e6', { m: 0.3, r: 0.15 });
    bx(g, 1.62, 0.36, 1.6, glass, 0, 1.14, -0.15);
    bx(g, 1.8, 0.12, 0.12, '#c9ccd3', 0, 0.42, 2.0, { m: 0.8 }); bx(g, 1.8, 0.12, 0.12, '#c9ccd3', 0, 0.42, -2.0, { m: 0.8 });
    [-0.6, 0.6].forEach((x) => { sp(g, 0.12, glow('#fff6d8', 1.6), x, 0.68, 2.0).castShadow = false; bx(g, 0.3, 0.12, 0.04, glow('#ff3b4e', 1.2), x, 0.72, -2.0); });
    [[-0.85, 1.25], [0.85, 1.25], [-0.85, -1.25], [0.85, -1.25]].forEach(([x, z]) => { const w = cy(g, 0.33, 0.33, 0.24, '#1d1d22', x, 0.33, z); w.rotation.z = Math.PI / 2; cy(g, 0.17, 0.17, 0.26, '#a5a9b2', x, 0.33, z, { m: 0.7 }).rotation.z = Math.PI / 2; });
    txt(g, 'LANOS', 0.09, 0, 0.62, -2.03, { color: '#c9ccd3' }).rotation.y = Math.PI;
    return g;
  };
  P.yacht = function () {
    const g = grp(), white = G.mat('#fbfbf8', { r: 0.35 });
    const hull = bx(g, 4.4, 1.6, 14, white, 0, 0.8, 0);
    const bow = G.mesh(new T.ConeGeometry(2.2, 3.4, 4, 1), white, 0, 0.8, 8.7, g); bow.rotation.set(Math.PI / 2, Math.PI / 4, 0); bow.scale.set(1, 1, 0.5);
    bx(g, 4.42, 0.18, 14.02, '#1f3fbf', 0, 0.45, 0);
    bx(g, 4.0, 0.12, 13.6, '#c7925a', 0, 1.66, 0, { r: 0.5 });
    bx(g, 3.0, 1.4, 4.5, white, 0, 2.4, -3.2);
    bx(g, 3.02, 0.5, 4.52, G.mat('#1c2a44', { r: 0.1, m: 0.4 }), 0, 2.6, -3.2);
    bx(g, 2.4, 0.15, 3.4, white, 0, 3.2, -3.6);
    for (let z = -6.5; z <= 6.5; z += 1.3) [-1, 1].forEach((s) => cy(g, 0.03, 0.03, 0.7, '#c9ccd3', s * 2.05, 2.05, z, { m: 0.8 }));
    [-1, 1].forEach((s) => bx(g, 0.05, 0.05, 13.2, '#c9ccd3', s * 2.05, 2.4, 0, { m: 0.8 }));
    return g;
  };

  /* ---------------- Alexandria ---------------- */
  P.qaitbay = function () {
    const g = grp(), stone = G.mat('#d9c08e', { r: 0.9, flat: true }), dark = G.mat('#bfa26c', { r: 0.9 });
    bx(g, 14, 4, 10, stone, 0, 2, 0);
    for (let x = -6.5; x <= 6.5; x += 1) bx(g, 0.5, 0.6, 0.5, stone, x, 4.3, 4.75);
    bx(g, 7, 7, 6, stone, 0, 7.5, -0.5);
    for (let x = -3.2; x <= 3.2; x += 0.8) bx(g, 0.4, 0.5, 0.4, stone, x, 11.25, 2.3);
    [[-7, 5], [7, 5], [-7, -5], [7, -5]].forEach(([x, z]) => { cy(g, 1.3, 1.5, 6, stone, x, 3, z, null, 12); cy(g, 1.45, 1.45, 0.5, dark, x, 6.2, z, null, 12); });
    [[-3.6, 2.6], [3.6, 2.6], [-3.6, -3.6], [3.6, -3.6]].forEach(([x, z]) => cy(g, 0.8, 0.9, 9, stone, x, 4.5, z, null, 12));
    cy(g, 0.5, 0.6, 3, stone, 0, 12.5, -0.5, null, 10); G.mesh(G.cone(0.6, 1.2, 10), dark, 0, 14.6, -0.5, g);
    bx(g, 1.4, 2.4, 0.3, G.mat('#5a4630'), 0, 1.2, 5.05);
    return g;
  };
  P.stanleyBridge = function (len) {
    const g = grp(); len = len || 40;
    bx(g, len, 0.8, 6, '#e8e1d4', 0, 6, 0, { r: 0.7 });
    for (let x = -len / 2 + 2; x < len / 2; x += 4) cy(g, 0.4, 0.5, 6, '#e8e1d4', x, 3, 0);
    [-6, 6].forEach((x) => [-2.7, 2.7].forEach((z) => {
      bx(g, 2, 7, 2, '#efe8db', x, 9.8, z, { r: 0.6 });
      G.mesh(G.cone(1.5, 2.2, 4), G.mat('#cfa760', { m: 0.4, r: 0.4 }), x, 14.4, z, g).rotation.y = Math.PI / 4;
      bx(g, 1.2, 1.6, 0.1, G.mat('#22264a'), x, 10.5, z + 1.01);
    }));
    for (let x = -len / 2; x < len / 2; x += 1.6) sp(g, 0.12, glow('#ffe2a0', 1.8), x, 6.7, 3).castShadow = false;
    return g;
  };
  P.alexBuilding = function (w, h, color, seed) {
    const g = grp(); const r = MM.rng(seed || 3);
    bx(g, w, h, 4, color || '#f1d9c4', 0, h / 2, 0, { r: 0.85 });
    const win = G.mat('#5d7fa8', { r: 0.2, m: 0.2 }), shut = G.mat(['#3d7a6b', '#7a4f3d', '#3d5a7a'][Math.floor(r() * 3)], { r: 0.7 });
    for (let y = 1.4; y < h - 0.6; y += 2.2) for (let x = -w / 2 + 1; x < w / 2 - 0.5; x += 1.6) {
      bx(g, 0.8, 1.1, 0.06, win, x, y, 2.02);
      bx(g, 0.18, 1.1, 0.08, shut, x - 0.5, y, 2.03); bx(g, 0.18, 1.1, 0.08, shut, x + 0.5, y, 2.03);
      if (r() < 0.5) bx(g, 1.2, 0.08, 0.5, '#e8e1d4', x, y - 0.6, 2.25);
    }
    bx(g, w + 0.2, 0.25, 4.2, '#ffffff', 0, h, 0);
    return g;
  };
  P.cornicheRail = function (len) {
    const g = grp();
    for (let x = -len / 2; x <= len / 2 + 0.01; x += 1.2) cy(g, 0.06, 0.06, 1, '#ffffff', x, 0.5, 0);
    bx(g, len, 0.1, 0.12, '#2f6fb3', 0, 1.0, 0); bx(g, len, 0.06, 0.08, '#2f6fb3', 0, 0.55, 0);
    return g;
  };
  P.facultyGate = function (title, sub) {
    const g = grp(), stone = G.mat('#efe6d6', { r: 0.8 });
    [-4, 4].forEach((x) => { bx(g, 1.4, 6, 1.4, stone, x, 3, 0); bx(g, 1.7, 0.4, 1.7, stone, x, 6.2, 0); });
    bx(g, 9.4, 1.2, 1.2, stone, 0, 6.8, 0);
    txt(g, title, 0.42, 0, 6.85, 0.62, { color: '#2c3e66' });
    if (sub) txt(g, sub, 0.3, 0, 5.8, 0.72, { color: '#ffffff', bg: '#2c3e66', pad: 12 });
    return g;
  };
  P.burgerBooth = function () {
    const g = grp();
    bx(g, 4, 2.6, 2.6, '#d9372f', 0, 1.3, 0, { r: 0.5 });
    bx(g, 4.2, 0.3, 3, '#ffcf3d', 0, 2.75, 0.1, { r: 0.4 });
    bx(g, 3.2, 1.0, 0.06, G.mat('#fff4cf', { e: '#ffe9a8', ei: 0.5 }), 0, 1.7, 1.31);
    txt(g, 'Fries · Burgers · Shakes', 0.22, 0, 2.75, 1.62, { color: '#d9372f' });
    bx(g, 3.6, 0.1, 0.6, '#f4efe7', 0, 1.0, 1.55);
    return g;
  };
  P.whiteboard = function (text, w) {
    const g = grp(); w = w || 5;
    bx(g, w + 0.2, 2.5, 0.1, '#c9ccd3', 0, 2.2, 0, { m: 0.6 });
    bx(g, w, 2.3, 0.12, '#ffffff', 0, 2.2, 0.01, { r: 0.3 });
    if (text) txt(g, text, 0.26, 0, 2.3, 0.09, { color: '#2c3e66', font: '"Yellowtail",cursive', weight: 400 });
    return g;
  };
  P.board = function (text, color, w, h) {
    const g = grp(); w = w || 4; h = h || 2.4;
    bx(g, w, h, 0.15, color || '#2c3e66', 0, h / 2 + 1, 0, { r: 0.5 });
    [-w / 2 + 0.3, w / 2 - 0.3].forEach((x) => cy(g, 0.07, 0.07, 1.2, '#5a4a40', x, 0.5, 0));
    txt(g, text, 0.3, 0, h / 2 + 1, 0.09, { color: '#ffffff' });
    return g;
  };
  P.phoneBig = function (glowColor) {
    const g = grp();
    bx(g, 0.9, 1.7, 0.12, '#1c1c22', 0, 0.85, 0, { r: 0.3, m: 0.4 });
    bx(g, 0.78, 1.5, 0.02, glow(glowColor || '#7fb8ff', 0.9), 0, 0.87, 0.07).castShadow = false;
    return g;
  };

  /* ---------------- trips: Sharm, Cairo ---------------- */
  P.mountain = function (s, color) {
    const g = grp(); s = s || 6;
    G.mesh(new T.ConeGeometry(s, s * 1.1, 6, 1), G.mat(color || '#b8693d', { r: 0.95, flat: true }), 0, s * 0.55, 0, g).rotation.y = 0.4;
    G.mesh(new T.ConeGeometry(s * 0.7, s * 0.8, 6, 1), G.mat(color || '#a35b33', { r: 0.95, flat: true }), s * 0.7, s * 0.4, -s * 0.2, g);
    return g;
  };
  P.coral = function (seed) {
    const g = grp(), r = MM.rng(seed || 2), cols = ['#ff7a6b', '#ffcf6e', '#c59cff', '#7ee0c3', '#ff6f9c'];
    for (let i = 0; i < 7; i++) { const s = sp(g, 0.2 + r() * 0.3, cols[i % cols.length], (r() - 0.5) * 1.6, r() * 0.6, (r() - 0.5) * 1.2, { flat: true }); s.scale.y = 1.4 + r(); }
    return g;
  };
  P.beachUmbrella = function (color) {
    const g = grp();
    cy(g, 0.04, 0.04, 2.6, '#f4efe7', 0, 1.3, 0);
    G.mesh(new T.ConeGeometry(1.4, 0.6, 12, 1, true), G.mat(color || '#ff6f9c', { ds: true, r: 0.7 }), 0, 2.55, 0, g);
    return g;
  };
  P.stadium = function () {
    const g = grp(), seat = ['#2f6fb3', '#e04a4a', '#f4efe7'];
    for (let row = 0; row < 8; row++) {
      const R = 18 + row * 1.4, y = row * 0.9;
      for (let i = 0; i < 40; i++) {
        const a = Math.PI * 0.15 + (i / 39) * Math.PI * 0.7;
        const b = bx(g, 2.9, 0.9, 1.3, seat[(row + i) % 3], Math.cos(a) * R, y + 0.45, -Math.sin(a) * R, { r: 0.7 });
        b.rotation.y = a - Math.PI / 2;
      }
    }
    return g;
  };
  P.crowd = function (n, w, d, seed) {
    const g = grp(), r = MM.rng(seed || 4);
    const body = new T.InstancedMesh(G.capsule(0.22, 0.4), new T.MeshStandardMaterial({ roughness: 0.8 }), n);
    const head = new T.InstancedMesh(G.sphere(0.2, 10, 8), G.mat('#d39b78'), n);
    const mtx = new T.Matrix4(), cols = ['#ff6f9c', '#5aa9ff', '#ffcf6e', '#7ee0c3', '#c59cff', '#f4efe7', '#2c3e66'].map((c) => new T.Color(c));
    for (let i = 0; i < n; i++) {
      const x = (r() - 0.5) * w, z = (r() - 0.5) * d;
      mtx.makeTranslation(x, 0.62, z); body.setMatrixAt(i, mtx); body.setColorAt(i, cols[i % cols.length]);
      mtx.makeTranslation(x, 1.22, z); head.setMatrixAt(i, mtx);
    }
    body.castShadow = head.castShadow = false;
    g.add(body); g.add(head);
    return g;
  };
  P.conferenceStage = function (title) {
    const g = grp();
    bx(g, 10, 1, 5, '#22264a', 0, 0.5, 0, { r: 0.6 });
    bx(g, 9, 4, 0.2, G.mat('#1b1f3a', { e: '#3a4fbf', ei: 0.35 }), 0, 3.4, -2.3);
    txt(g, title, 0.5, 0, 3.6, -2.15, { glow: '#7ee0c3' });
    return g;
  };

  /* ---------------- garden engagement ---------------- */
  P.flowerWall = function (text) {
    const g = grp(), r = MM.rng(16), cols = ['#ffffff', '#ffd6e4', '#ff9cc0', '#f7e3c4'];
    bx(g, 5, 3.4, 0.3, '#3f7a4b', 0, 1.7, 0, { r: 1 });
    for (let i = 0; i < 90; i++) sp(g, 0.13 + r() * 0.1, cols[i % 4], (r() - 0.5) * 4.8, 0.1 + r() * 3.3, 0.18, { r: 0.8 }).castShadow = false;
    if (text) txt(g, text, 0.42, 0, 2.1, 0.32, { color: '#ffffff', font: '"Yellowtail",cursive', weight: 400, stroke: 'rgba(120,40,70,.55)' });
    return g;
  };
  P.tripod = function () {
    const g = grp();
    [0, 2.1, 4.2].forEach((a) => { const l = cy(g, 0.025, 0.025, 1.5, '#2a2a2f', Math.sin(a) * 0.25, 0.72, Math.cos(a) * 0.25); l.rotation.set(Math.cos(a) * 0.3, 0, -Math.sin(a) * 0.3); });
    bx(g, 0.5, 0.32, 0.28, '#1c1c22', 0, 1.6, 0, { m: 0.4 });
    cy(g, 0.11, 0.11, 0.24, '#33333a', 0, 1.6, 0.24).rotation.x = Math.PI / 2;
    return g;
  };
  P.couch = function () {
    const g = grp(), c = G.mat('#5a6f99', { r: 0.95 });
    bx(g, 2.6, 0.5, 1.0, c, 0, 0.4, 0); bx(g, 2.6, 0.8, 0.3, c, 0, 0.9, -0.42);
    [-1, 1].forEach((s) => bx(g, 0.25, 0.65, 1.0, c, s * 1.3, 0.6, 0));
    bx(g, 0.9, 0.12, 0.7, '#f1d6dd', -0.6, 0.7, 0.05); bx(g, 0.9, 0.12, 0.7, '#f1d6dd', 0.6, 0.7, 0.05);
    return g;
  };
  P.bigTV = function (text) {
    const g = grp();
    bx(g, 3.2, 0.5, 0.6, '#3a2b24', 0, 0.25, 0);
    bx(g, 3.0, 1.75, 0.08, '#111116', 0, 1.6, 0, { m: 0.4 });
    bx(g, 2.85, 1.6, 0.02, glow('#c02035', 0.8), 0, 1.6, 0.05).castShadow = false;
    if (text) txt(g, text, 0.22, 0, 1.6, 0.07, { color: '#ffe0e0', glow: '#ff2a3a', toneMapped: false });
    return g;
  };
  P.concertStage = function (artist, color) {
    const g = grp(); color = color || '#ff6f9c';
    bx(g, 16, 1.4, 7, '#14141c', 0, 0.7, 0, { r: 0.5 });
    [-7.6, 7.6].forEach((x) => { bx(g, 0.4, 9, 0.4, '#3a3a44', x, 4.5, -2.8, { m: 0.6 }); bx(g, 2.2, 3.6, 1.6, '#1b1b22', x * 0.86, 3.2, 1.6); });
    bx(g, 15.6, 0.4, 0.4, '#3a3a44', 0, 9, -2.8, { m: 0.6 });
    bx(g, 12, 5.5, 0.2, G.mat('#0c0c14', { e: color, ei: 0.25 }), 0, 5.4, -3.2);
    txt(g, artist, 1.1, 0, 5.6, -3.05, { glow: color, toneMapped: false, size: 110 });
    for (let i = 0; i < 6; i++) { const l = G.mesh(new T.ConeGeometry(0.9, 6, 12, 1, true), new T.MeshBasicMaterial({ color, transparent: true, opacity: 0.12, depthWrite: false, side: T.DoubleSide, blending: T.AdditiveBlending }), -6 + i * 2.4, 6, -2.4, g); l.rotation.z = (i - 2.5) * 0.12; l.castShadow = false; l.userData.beam = true; }
    return g;
  };

  /* ---------------- collectibles ---------------- */
  const base = P.collectible;
  P.collectible = function (kind, sub) {
    const g = grp();
    switch (kind) {
      case 'koshari': {
        cy(g, 0.32, 0.22, 0.24, '#f4efe7', 0, -0.05, 0, { r: 0.4 });
        cy(g, 0.3, 0.3, 0.06, '#c9853a', 0, 0.09, 0, { r: 0.8 });
        sp(g, 0.08, '#a8322a', 0.1, 0.14, 0.05); sp(g, 0.07, '#d9a84a', -0.1, 0.13, -0.05);
        break;
      }
      case 'kebda': {
        const b = G.mesh(G.capsule(0.13, 0.42), G.mat('#e3b57a', { r: 0.8 }), 0, 0, 0, g); b.rotation.z = Math.PI / 2;
        bx(g, 0.5, 0.06, 0.18, '#7a3a24', 0, 0.06, 0.06);
        break;
      }
      case 'fries': {
        bx(g, 0.34, 0.36, 0.2, '#d9372f', 0, -0.05, 0);
        for (let i = 0; i < 7; i++) bx(g, 0.04, 0.32, 0.04, '#ffcf3d', -0.12 + i * 0.04, 0.2, (i % 2) * 0.05 - 0.02);
        break;
      }
      case 'calendar': {
        bx(g, 0.5, 0.6, 0.04, '#fffdf6', 0, 0, 0); bx(g, 0.5, 0.14, 0.05, '#e04a4a', 0, 0.23, 0.005);
        txt(g, String(sub || ''), 0.24, 0, -0.05, 0.03, { color: '#3b2340' });
        break;
      }
      case 'voice': {
        const b = sp(g, 0.32, '#7ee0c3', 0, 0, 0, { e: '#7ee0c3', ei: 0.4 }); b.scale.set(1.3, 1, 0.4);
        for (let i = 0; i < 5; i++) bx(g, 0.04, 0.08 + (i % 3) * 0.08, 0.02, '#ffffff', -0.16 + i * 0.08, 0, 0.13);
        break;
      }
      case 'badge': {
        bx(g, 0.42, 0.56, 0.03, '#ffffff', 0, -0.1, 0); bx(g, 0.42, 0.14, 0.035, '#2f6fb3', 0, 0.12, 0);
        const l = G.mesh(G.torus(0.22, 0.015, Math.PI), G.mat('#2f6fb3'), 0, 0.2, 0, g);
        break;
      }
      case 'gift': {
        bx(g, 0.5, 0.42, 0.5, sub || '#ff6f9c', 0, -0.05, 0, { r: 0.5 });
        bx(g, 0.52, 0.44, 0.08, '#ffcf6e', 0, -0.05, 0); bx(g, 0.08, 0.44, 0.52, '#ffcf6e', 0, -0.05, 0);
        [-1, 1].forEach((s) => { const k = G.mesh(G.torus(0.08, 0.025), G.mat('#ffcf6e'), s * 0.08, 0.22, 0, g); k.rotation.y = Math.PI / 2; });
        break;
      }
      case 'iphone': {
        bx(g, 0.36, 0.7, 0.1, '#f4f4f2', 0, 0, 0, { r: 0.3 });
        bx(g, 0.3, 0.6, 0.02, '#2a4a6a', 0, 0, 0.055, { r: 0.2, m: 0.4 });
        txt(g, '13 Pro', 0.07, 0, -0.2, 0.07, { color: '#ffffff' });
        break;
      }
      case 'sweets': {
        bx(g, 0.6, 0.22, 0.42, '#c9932d', 0, 0, 0, { m: 0.5, r: 0.4 });
        bx(g, 0.62, 0.05, 0.44, '#8f1d2c', 0, 0.1, 0);
        break;
      }
      case 'flowers': { const b = P.bouquet(); b.scale.setScalar(0.8); b.position.y = -0.3; g.add(b); break; }
      case 'cup': {
        cy(g, 0.12, 0.09, 0.2, '#ffffff', 0, 0, 0, { r: 0.3 });
        cy(g, 0.18, 0.18, 0.02, '#ffffff', 0, -0.1, 0);
        cy(g, 0.11, 0.11, 0.01, '#a8432a', 0, 0.09, 0);
        break;
      }
      case 'shell': {
        const s = G.mesh(new T.ConeGeometry(0.25, 0.14, 9, 1), G.mat('#ffd9c4', { r: 0.4, flat: true }), 0, 0, 0, g); s.rotation.x = Math.PI / 2;
        break;
      }
      case 'popcorn': {
        cy(g, 0.22, 0.16, 0.42, '#ffffff', 0, -0.05, 0, null, 12);
        for (let i = 0; i < 4; i++) bx(g, 0.05, 0.42, 0.02, '#e04a4a', Math.sin(i * 1.57) * 0.19, -0.05, Math.cos(i * 1.57) * 0.19).rotation.y = i * 1.57;
        for (let i = 0; i < 6; i++) sp(g, 0.08, '#fff2c4', (Math.random() - 0.5) * 0.25, 0.2 + Math.random() * 0.1, (Math.random() - 0.5) * 0.25);
        break;
      }
      case 'necklace': {
        const c = G.mesh(G.torus(0.26, 0.012), G.mat('#ffd36e', { m: 1, r: 0.2 }), 0, 0.05, 0, g); c.scale.y = 1.25;
        const name = G.textPlane('مريم', 0.18, { color: '#ffd36e', font: '"Aref Ruqaa","Baloo Bhaijaan 2",serif', size: 90, pad: 4, stroke: '#9a6a12', strokeW: 6 });
        name.position.set(0, -0.28, 0.01); g.add(name);
        break;
      }
      case 'coat': {
        bx(g, 0.6, 0.75, 0.12, '#ffffff', 0, 0, 0, { r: 0.6 });
        const st = G.mesh(G.torus(0.14, 0.02, Math.PI * 1.3), G.mat('#2c3e66'), 0, 0.15, 0.08, g); st.rotation.z = Math.PI;
        break;
      }
      case 'cake': { const c = P.cake(); c.scale.setScalar(0.4); c.position.y = -0.3; g.add(c); break; }
      case 'goldstar': {
        const sh = new T.Shape();
        for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 0.14 : 0.34; if (i) sh.lineTo(Math.cos(a) * r, Math.sin(a) * r); else sh.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
        const geo = new T.ExtrudeGeometry(sh, { depth: 0.1, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 2 }); geo.translate(0, 0, -0.05);
        G.mesh(geo, G.mat('#ffd34d', { e: '#ffb800', ei: 0.35, m: 0.5, r: 0.3 }), 0, 0, 0, g);
        break;
      }
      case 'card': {
        bx(g, 0.62, 0.42, 0.03, '#fffdf6', 0, 0, 0);
        txt(g, sub || 'F = m·a', 0.12, 0, 0, 0.02, { color: '#2c3e66' });
        break;
      }
      case 'stetho': { const s = P.stethoscope(); s.scale.setScalar(0.7); s.position.y = -0.2; g.add(s); break; }
      case 'gradcap': { const c = P.gradCap(); c.scale.setScalar(0.8); g.add(c); break; }
      case 'paint': {
        cy(g, 0.22, 0.2, 0.34, '#d0d4dc', 0, 0, 0, { m: 0.6, r: 0.3 });
        cy(g, 0.2, 0.2, 0.02, sub || '#ff9cb5', 0, 0.17, 0);
        break;
      }
      default: return base(kind, sub);
    }
    return g;
  };
})(window.MM);
