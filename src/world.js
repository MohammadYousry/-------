/* Level: builds a chapter from its definition and runs every interactive object in it. */
(function (MM) {
  'use strict';
  const T = THREE, G = MM.G, Ph = MM.Physics;

  function evalSig(L, s) {
    if (s == null) return true;
    if (typeof s === 'function') return !!s(L.sig, L);
    if (Array.isArray(s)) return s.every((k) => evalSig(L, k));
    if (s[0] === '!') return !L.sig[s.slice(1)];
    if (s.indexOf('|') > 0) return s.split('|').some((k) => !!L.sig[k]);
    return !!L.sig[s];
  }

  function boxMesh(x0, x1, y0, y1, z0, z1, mat) {
    const w = x1 - x0, h = y1 - y0, d = z1 - z0;
    let mats = mat;
    if (mat && mat.top) mats = [mat.side, mat.side, mat.top, mat.bottom || mat.side, mat.front || mat.side, mat.side];
    const geo = new T.BoxGeometry(w, h, d); geo.userData.own = true;
    // world-space UVs: textures tile every 2 m whatever the block size
    const uv = geo.attributes.uv, dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
    for (let f = 0; f < 6; f++) for (let k = 0; k < 4; k++) { const i = f * 4 + k; uv.setXY(i, uv.getX(i) * dims[f][0] / 2, uv.getY(i) * dims[f][1] / 2); }
    const m = new T.Mesh(geo, mats);
    m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
    m.castShadow = true; m.receiveShadow = true;
    return m;
  }

  /* ======================================================================= */
  class Level {
    constructor(game, def) {
      this.game = game; this.def = def;
      this.theme = MM.THEMES[def.theme] || MM.THEMES.school;
      this.group = new T.Group();
      this.solids = []; this.objects = []; this.sig = {}; this.logics = [];
      this.counters = {}; this.counterOrder = [];
      this.items = []; this.itemById = {};
      this.checkpoints = []; this.cpIndex = -1;
      this.crates = []; this.breakables = {}; this.hazards = []; this.talks = []; this.triggers = [];
      this.spawns = {}; this.goal = null;
      this.time = 0; this.killY = def.killY != null ? def.killY : -12;
      this.anim = []; // per-frame decorative animations
      this.heartsTotal = 0; this.memTotal = 0;
      this.rng = MM.rng(def.num * 977 + 13);
      this.M = this.makeMaterials(this.theme);
      this.setupEnvironment();
      def.build(this, MM.Props);
      this.computeSignals();
      this.group.traverse((o) => { if (o.isMesh && o.userData.static !== false && !o.userData.dynamic) { o.updateMatrix(); } });
    }

    makeMaterials(th) {
      const M = {};
      M.ground = { top: G.mat(th.groundTop, { r: 0.9 }), side: G.mat(th.groundSide, { r: 0.95 }) };
      if (th.grid) {
        const tex = G.gridTex(th.groundTop, th.grid);
        M.ground.top = new T.MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: new T.Color('#ffffff'), emissiveIntensity: 0.35, roughness: 0.6 });
      }
      M.plat = { top: G.mat(th.platTop || th.groundTop, { r: 0.8 }), side: G.mat(th.platSide || th.groundSide, { r: 0.9 }) };
      M.wall = { top: G.mat(th.wallTop || th.wall, { r: 0.85 }), side: G.mat(th.wall, { r: 0.9 }) };
      M.accent = G.mat(th.accent, { r: 0.6 });
      M.dark = G.mat(th.dark || '#2a2030', { r: 0.9 });
      M.water = new T.MeshStandardMaterial({ color: th.water || '#2b6cb0', roughness: 0.15, metalness: 0.3, transparent: true, opacity: 0.85 });
      return M;
    }

    setupEnvironment() {
      const th = this.theme, game = this.game;
      game.scene.background = new T.Color(th.skyBottom);
      game.scene.fog = new T.Fog(th.fog || th.skyBottom, th.fogNear || 40, th.fogFar || 140);
      const sky = G.makeSky(th.skyTop, th.skyBottom, { horizon: th.horizon, stars: th.stars });
      this.sky = sky; game.scene.add(sky);
      this.hemi = new T.HemisphereLight(th.hemiSky || '#ffffff', th.hemiGround || '#6b5a70', th.hemi != null ? th.hemi : 1.0);
      this.group.add(this.hemi);
      const sun = (this.sun = new T.DirectionalLight(th.sun || '#fff4e0', th.sunI != null ? th.sunI : 2.2));
      sun.position.set(-12, 22, 14);
      if (game.quality === 'high') {
        sun.castShadow = true;
        sun.shadow.mapSize.set(2048, 2048);
        const c = sun.shadow.camera; c.left = -26; c.right = 26; c.top = 26; c.bottom = -26; c.near = 1; c.far = 80;
        sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.03;
      }
      this.group.add(sun); this.group.add(sun.target);
      game.scene.add(this.group);
    }

    // follow the action with the shadow camera
    focus(x, y, z) {
      this.sun.position.set(x - 12, y + 22, z + 14);
      this.sun.target.position.set(x, y, z);
      this.sky.position.set(x, 0, z);
    }

    /* ---------------- builder API ---------------- */
    add(obj) { this.group.add(obj); return obj; }
    addSolid(s) { this.solids.push(s); return s; }

    box(x0, x1, y0, y1, z0, z1, mat, o) {
      o = o || {};
      const m = boxMesh(x0, x1, y0, y1, z0, z1, mat || this.M.plat);
      if (o.noShadow) m.castShadow = false;
      this.add(m);
      let s = null;
      if (!o.nosolid) s = this.addSolid(Ph.solid(x0, x1, y0, y1, z0, z1, { oneWay: !!o.oneWay, only: o.only, except: o.except }));
      return { mesh: m, solid: s };
    }
    ground(x0, x1, z0, z1, top, o) {
      top = top || 0; o = o || {};
      return this.box(x0, x1, top - (o.depth || 3), top, z0, z1, o.mat || this.M.ground, o);
    }
    plat(x0, x1, z0, z1, top, thick, o) { return this.box(x0, x1, top - (thick || 0.5), top, z0, z1, (o && o.mat) || this.M.plat, o); }
    wall(x0, x1, y0, y1, z0, z1, o) { return this.box(x0, x1, y0, y1, z0, z1, (o && o.mat) || this.M.wall, o); }
    invisible(x0, x1, y0, y1, z0, z1, o) { return this.addSolid(Ph.solid(x0, x1, y0, y1, z0, z1, Object.assign({ noShadow: true }, o || {}))); }
    water(x0, x1, z0, z1, y) {
      const m = new T.Mesh(new T.PlaneGeometry(x1 - x0, z1 - z0), this.M.water);
      m.rotation.x = -Math.PI / 2; m.position.set((x0 + x1) / 2, y, (z0 + z1) / 2); m.receiveShadow = true;
      this.add(m); return m;
    }

    deco(obj, x, y, z, ry, s) {
      obj.position.set(x, y || 0, z);
      if (ry) obj.rotation.y = ry;
      if (s) obj.scale.setScalar(s);
      this.add(obj);
      return obj;
    }
    prop(name, x, y, z, o) {
      o = o || {};
      const obj = MM.Props[name].apply(null, o.args || []);
      this.deco(obj, x, y, z, o.ry, o.s);
      if (o.solid) {
        obj.updateMatrixWorld(true);
        const b = new T.Box3().setFromObject(obj);
        const sh = o.shrink || 0;
        this.addSolid(Ph.solid(b.min.x + sh, b.max.x - sh, b.min.y, o.top != null ? o.top : b.max.y, b.min.z + sh, b.max.z - sh));
      }
      if (o.spin) this.anim.push((t, dt) => { obj.rotation.y += o.spin * dt; });
      if (o.bob) { const y0 = obj.position.y; this.anim.push((t) => { obj.position.y = y0 + Math.sin(t * 1.5 + x) * o.bob; }); }
      return obj;
    }
    sign(text, x, y, z, o) {
      o = o || {};
      const p = G.textPlane(text, o.h || 0.36, { color: o.color || '#3b2340', bg: o.bg || 'rgba(255,248,240,0.94)', size: 64, pad: 22, border: o.border || null });
      p.position.set(x, y, z);
      if (o.ry) p.rotation.y = o.ry;
      if (o.post !== false && y > 0.8) {
        const post = G.mesh(G.cyl(0.05, 0.05, y - p.userData.h / 2, 8), G.mat('#7a5a40'), x, (y - p.userData.h / 2) / 2, z - 0.05, this.group);
        post.castShadow = false;
      }
      this.add(p);
      return p;
    }
    text3d(text, x, y, z, o) {
      o = o || {};
      const p = G.textPlane(text, o.h || 0.8, { color: o.color || '#ffffff', stroke: o.stroke, glow: o.glow, size: 90, pad: 20, font: o.font, weight: o.weight });
      p.position.set(x, y, z);
      if (o.ry) p.rotation.y = o.ry;
      if (o.toneMapped === false) p.material.toneMapped = false;
      this.add(p); return p;
    }

    spawn(who, x, y, z) { this.spawns[who] = new T.Vector3(x, y, z); }

    logic(id, fn) { this.logics.push({ id, fn }); }
    counter(key, label, target, o) {
      this.counters[key] = Object.assign({ key, label, target, n: 0 }, o || {});
      this.counterOrder.push(key);
    }

    /* ---- interactive objects ---- */
    plate(id, x, z, y, o) {
      o = o || {}; y = y || 0;
      const w = o.w || 1.6, d = o.d || 1.6;
      const heavy = !!o.heavy;
      const grp = new T.Group(); grp.position.set(x, y, z);
      const base = G.mesh(G.box(w + 0.24, 0.1, d + 0.24), G.mat('#3a2f3f', { r: 0.7 }), 0, 0.05, 0, grp);
      base.castShadow = false;
      const col = o.color || (heavy ? '#ffb300' : '#ff4f8b');
      const padMat = G.mat(col, { e: col, ei: 0.25, r: 0.4 }).clone();
      const pad = G.mesh(G.box(w, 0.12, d), padMat, 0, 0.14, 0, grp);
      const icon = G.textPlane(o.icon || (heavy ? 'M' : '♥'), 0.42, { color: '#ffffff', size: 90, pad: 6 });
      icon.rotation.x = -Math.PI / 2; icon.position.y = 0.205; pad.add(icon); icon.position.set(0, 0.065, 0);
      if (o.label) { const lb = G.textPlane(o.label, 0.22, { color: '#fff', bg: 'rgba(30,14,40,.8)', size: 56, pad: 12 }); lb.position.set(0, 0.9, d / 2 + 0.05); grp.add(lb); }
      this.add(grp);
      const solid = this.addSolid(Ph.solid(x - w / 2, x + w / 2, y, y + 0.2, z - d / 2, z + d / 2));
      const obj = { type: 'plate', id, x, z, y, w, d, heavy, latch: o.latch || 0, latchT: 0, on: false, pressed: false, pad, padMat, solid, top: y + 0.2, col, ring: null };
      if (obj.latch) {
        const ring = new T.Mesh(new T.RingGeometry(Math.max(w, d) * 0.62, Math.max(w, d) * 0.72, 40, 1, 0, Math.PI * 2), G.basic('#ffffff', { o: 0.85 }));
        ring.rotation.x = -Math.PI / 2; ring.position.y = 0.23; grp.add(ring); obj.ring = ring;
      }
      this.objects.push(obj);
      return obj;
    }

    door(sig, x0, x1, y0, y1, z0, z1, o) {
      o = o || {};
      const mat = o.mat || G.mat(o.color || this.theme.door || '#ff6f9c', { r: 0.5 });
      const m = boxMesh(x0, x1, y0, y1, z0, z1, mat);
      if (o.label) {
        const lbl = G.textPlane(o.label, 0.3, { color: '#fff', size: 64, pad: 10, stroke: 'rgba(0,0,0,.35)' });
        lbl.position.set(0, (y1 - y0) * 0.15, (z1 - z0) / 2 + 0.02);
        m.add(lbl);
      }
      // stripes so doors read as doors
      const stripe = G.mat('#ffffff', { r: 0.5 });
      [0.3, 0.7].forEach((k) => { const st = G.mesh(G.box(x1 - x0 + 0.02, 0.08, z1 - z0 + 0.02), stripe, 0, (k - 0.5) * (y1 - y0), 0, m); st.castShadow = false; });
      this.add(m);
      const solid = this.addSolid(Ph.solid(x0, x1, y0, y1, z0, z1));
      const obj = { type: 'door', sig, mesh: m, solid, x0, x1, y0, y1, z0, z1, h: y1 - y0, open: 0, mode: o.mode || 'down', moving: false, base: m.position.clone() };
      this.objects.push(obj);
      return obj;
    }

    bridge(sig, x0, x1, y0, y1, z0, z1, o) {
      o = o || {};
      const axis = o.axis || (x1 - x0 >= z1 - z0 ? 'x' : 'z');
      const mat = o.mat || { top: G.mat(o.color || this.theme.bridge || '#ffcf6e', { r: 0.5, e: o.glow ? o.color || '#ffcf6e' : null, ei: 0.4 }), side: G.mat(o.side || '#c99a3f', { r: 0.6 }) };
      const pivot = new T.Group();
      const len = axis === 'x' ? x1 - x0 : z1 - z0;
      const flip = !!o.fromEnd;
      if (axis === 'x') pivot.position.set(flip ? x1 : x0, 0, 0); else pivot.position.set(0, 0, flip ? z1 : z0);
      const m = boxMesh(x0, x1, y0, y1, z0, z1, mat);
      m.position.sub(pivot.position);
      pivot.add(m); this.add(pivot);
      const solid = this.addSolid(Ph.solid(x0, x1, y0, y1, z0, z1));
      solid.active = false;
      const obj = { type: 'bridge', sig, pivot, axis, solid, ext: 0, latch: o.latch !== false, latched: false, len };
      this.applyBridge(obj);
      this.objects.push(obj);
      return obj;
    }
    applyBridge(b) {
      const e = Math.max(0.001, b.ext);
      if (b.axis === 'x') b.pivot.scale.set(e, 1, 1); else b.pivot.scale.set(1, 1, e);
      b.pivot.visible = b.ext > 0.01;
    }

    elevator(sig, x0, x1, z0, z1, yLow, yHigh, o) {
      o = o || {};
      const th = o.thick || 0.4;
      const mat = o.mat || { top: G.mat(o.color || this.theme.lift || '#7ee0c3', { r: 0.5 }), side: G.mat('#3d5a63', { r: 0.6 }) };
      const m = boxMesh(x0, x1, -th, 0, z0, z1, mat);
      const grp = new T.Group(); grp.add(m); m.position.y -= 0; this.add(grp);
      // rails
      const railMat = G.mat('#cfd6dd', { m: 0.6, r: 0.3 });
      [[x0 - 0.12, z0 + 0.2], [x1 + 0.12, z0 + 0.2]].forEach(([x, z]) => {
        const r = G.mesh(G.box(0.12, yHigh - yLow + 1.2, 0.12), railMat, x, (yLow + yHigh) / 2, z0 - 0.15, this.group); r.castShadow = false;
      });
      if (o.label) { const lb = G.textPlane(o.label, 0.24, { color: '#fff', bg: 'rgba(30,14,40,.8)', size: 56, pad: 12 }); lb.position.set((x0 + x1) / 2, 0.45, z1 + 0.02); grp.add(lb); }
      const solid = this.addSolid(Ph.solid(x0, x1, yLow - th, yLow, z0, z1));
      const obj = { type: 'elevator', sig, grp, solid, x0, x1, z0, z1, yLow, yHigh, cur: yLow, th, speed: o.speed || 2.6 };
      grp.position.set(0, yLow, 0); m.position.set((x0 + x1) / 2, -th / 2, (z0 + z1) / 2);
      this.objects.push(obj);
      return obj;
    }

    mover(x0, x1, y0, y1, z0, z1, o) {
      o = o || {};
      const mat = o.mat || { top: G.mat(o.color || this.theme.mover || '#ffcf6e', { r: 0.5 }), side: G.mat(o.side || '#9b7a3a', { r: 0.6 }) };
      const m = o.mesh || boxMesh(x0, x1, y0, y1, z0, z1, mat);
      if (o.mesh) m.position.set((x0 + x1) / 2, y0, (z0 + z1) / 2);
      this.add(m);
      const solid = this.addSolid(Ph.solid(x0, x1, y0, y1, z0, z1));
      const obj = { type: 'mover', mesh: m, solid, base: { x0, x1, y0, y1, z0, z1 }, mbase: m.position.clone(), dx: o.dx || 0, dy: o.dy || 0, dz: o.dz || 0, period: o.period || 4, phase: o.phase || 0, sig: o.sig, clock: 0, off: new T.Vector3() };
      this.objects.push(obj);
      return obj;
    }

    crate(x, z, y, o) {
      o = o || {};
      const r = o.r || 0.8, h = o.h || 1.6;
      const vis = new T.Group();
      if (o.style && MM.Props[o.style]) {
        const p = MM.Props[o.style].apply(null, o.args || []);
        if (o.ps) p.scale.setScalar(o.ps);
        if (o.pry) p.rotation.y = o.pry;
        vis.add(p);
        if (o.box !== false) { const shell = G.mesh(G.box(r * 2, h, r * 2), G.mat('#ffffff', { t: true, o: 0.0 }), 0, h / 2, 0, vis); shell.visible = false; }
      } else {
        const wood = G.mat(o.color || '#d39a5c', { r: 0.8 });
        G.mesh(G.box(r * 2, h, r * 2), wood, 0, h / 2, 0, vis);
        const trim = G.mat(o.trim || '#9b6a3a', { r: 0.8 });
        [-1, 1].forEach((s) => { G.mesh(G.box(r * 2 + 0.04, 0.16, 0.16), trim, 0, s * (h / 2 - 0.08) + h / 2, r, vis); G.mesh(G.box(0.16, h, 0.16), trim, s * (r - 0.08), h / 2, r + 0.01, vis); });
        if (o.label) { const lb = G.textPlane(o.label, 0.26, { color: '#5b3a1e', size: 64, pad: 6 }); lb.position.set(0, h / 2, r + 0.03); vis.add(lb); }
      }
      vis.traverse((q) => { if (q.isMesh) { q.castShadow = true; q.receiveShadow = true; } });
      this.add(vis);
      const body = { x, y: y || 0, z, vx: 0, vy: 0, vz: 0, r, h, isCrate: true, heavy: true, grounded: false, ground: null };
      const solid = this.addSolid(Ph.solid(x - r, x + r, body.y, body.y + h, z - r, z + r, { acc: true }));
      body.self = solid;
      const L = this;
      const obj = {
        type: 'crate', body, solid, vis, home: { x, y: y || 0, z }, pushable: true, idx: this.crates.length, net: null,
        sync() { solid.x0 = body.x - r; solid.x1 = body.x + r; solid.z0 = body.z - r; solid.z1 = body.z + r; solid.y0 = body.y; solid.y1 = body.y + h; },
        push(ax, d, pusher, solids) {
          if (!L.game.ownsCrates()) return;
          const need = d > 0 ? (ax === 'x' ? pusher.x + pusher.r - solid.x0 : pusher.z + pusher.r - solid.z0) + 0.003
            : (ax === 'x' ? pusher.x - pusher.r - solid.x1 : pusher.z - pusher.r - solid.z1) - 0.003;
          const before = body[ax];
          body.ignoreBody = pusher;
          Ph.axis(solids, body, ax, need, true);
          const moved = body[ax] - before;
          this.sync();
          if (ax === 'x') solid.accDx += moved; else solid.accDz += moved;
          if (Math.abs(moved) > 0.0001) this.moving = 0.15;
        },
        reset() { body.x = this.home.x; body.y = this.home.y; body.z = this.home.z; body.vy = 0; this.locked = false; this.pushable = true; this.sync(); },
      };
      solid.owner = obj;
      obj.sync();
      vis.position.set(x, body.y, z);
      this.crates.push(obj);
      this.objects.push(obj);
      return obj;
    }

    breakable(id, x0, x1, y0, y1, z0, z1, o) {
      o = o || {};
      const m = boxMesh(x0, x1, y0, y1, z0, z1, G.mat(o.color || '#b9a7c9', { r: 0.9, flat: true }));
      // cracks
      const crack = G.mat('#3d2d4a');
      for (let i = 0; i < 4; i++) {
        const c = G.mesh(G.box(0.05, (y1 - y0) * 0.5, 0.02), crack, (this.rng() - 0.5) * (x1 - x0) * 0.6, (this.rng() - 0.5) * (y1 - y0) * 0.4, (z1 - z0) / 2 + 0.01, m);
        c.rotation.z = (this.rng() - 0.5) * 1.6; c.castShadow = false;
      }
      if (o.label) { const lb = G.textPlane(o.label, 0.34, { color: '#3d2d4a', size: 70, pad: 8 }); lb.position.set(0, 0, (z1 - z0) / 2 + 0.03); m.add(lb); }
      this.add(m);
      const solid = this.addSolid(Ph.solid(x0, x1, y0, y1, z0, z1));
      const obj = { type: 'breakable', id, mesh: m, solid, broken: false, x0, x1, y0, y1, z0, z1, color: o.color || '#b9a7c9' };
      this.breakables[id] = obj; this.sig['broken:' + id] = false;
      this.objects.push(obj);
      return obj;
    }

    hazard(x, y, z, o) {
      o = o || {};
      let mesh;
      const kind = o.kind || 'cloud';
      if (kind === 'cloud') {
        mesh = MM.Props.cloud(0.5);
        mesh.traverse((q) => { if (q.isMesh) q.material = G.mat('#6c5d7a', { r: 1 }); });
        const face = G.textPlane('>:(', 0.22, { color: '#ffffff', size: 64, pad: 4 }); face.position.set(0, 0, 0.55); mesh.add(face);
        if (o.label) { const lb = G.textPlane(o.label, 0.2, { color: '#fff', size: 56, pad: 4 }); lb.position.set(0, 0.6, 0.3); mesh.add(lb); }
      } else if (kind === 'bug') {
        mesh = new T.Group();
        G.mesh(G.sphere(0.4, 14, 10), G.mat('#ff4d6d', { e: '#ff1f4d', ei: 0.6 }), 0, 0, 0, mesh);
        [-1, 1].forEach((s) => { const w = G.mesh(G.box(0.5, 0.04, 0.25), G.mat('#ffd1dc', { t: true, o: 0.6 }), s * 0.4, 0.2, 0, mesh); w.rotation.z = s * 0.4; });
        [-0.13, 0.13].forEach((xx) => G.mesh(G.sphere(0.07, 8, 6), G.basic('#ffffff'), xx, 0.1, 0.34, mesh));
      } else if (kind === 'bar') {
        mesh = new T.Group();
        const bar = G.mesh(G.box(o.w || 0.3, o.h || 0.4, o.d || 6), G.mat('#7ee0c3', { e: '#7ee0c3', ei: 1.6 }), 0, 0, 0, mesh);
        bar.castShadow = false;
      }
      mesh.position.set(x, y, z);
      this.add(mesh);
      const obj = { type: 'hazard', mesh, kind, x, y, z, r: o.r || 0.6, box: kind === 'bar' ? { w: o.w || 0.3, h: o.h || 0.4, d: o.d || 6 } : null, dx: o.dx || 0, dy: o.dy || 0, dz: o.dz || 0, period: o.period || 3, phase: o.phase || 0, pos: new T.Vector3(x, y, z), linear: !!o.linear };
      this.hazards.push(obj); this.objects.push(obj);
      return obj;
    }

    spring(x, z, y, o) {
      o = o || {}; y = y || 0;
      const grp = new T.Group(); grp.position.set(x, y, z);
      // low enough (0.3 m) to walk straight onto
      G.mesh(G.cyl(0.75, 0.85, 0.12, 20), G.mat('#3a2f3f'), 0, 0.06, 0, grp);
      const coil = G.mesh(G.cyl(0.55, 0.55, 0.12, 12), G.mat('#cfd6dd', { m: 0.7, r: 0.3 }), 0, 0.16, 0, grp);
      const pad = G.mesh(G.cyl(0.8, 0.8, 0.1, 20), G.mat(o.color || '#7ee0c3', { e: o.color || '#7ee0c3', ei: 0.3 }), 0, 0.25, 0, grp);
      this.add(grp);
      const solid = this.addSolid(Ph.solid(x - 0.8, x + 0.8, y, y + 0.3, z - 0.8, z + 0.8));
      const obj = { type: 'spring', solid, pad, coil, power: o.power || 18, t: 1, x, z };
      this.objects.push(obj);
      return obj;
    }

    // kind: 'heart' | 'memory' | item kinds; o.counter increments a counter
    item(kind, x, y, z, o) {
      o = o || {};
      const id = o.id || kind + ':' + this.items.length;
      const mesh = MM.Props.collectible(kind, o.sub);
      mesh.position.set(x, y, z);
      if (o.s) mesh.scale.setScalar(o.s);
      this.add(mesh);
      const it = { id, kind, x, y, z, mesh, taken: false, counter: o.counter || null, value: o.value || 1, who: o.who || null, mem: o.mem || null, req: o.req || null, onTake: o.onTake || null, r: o.r || 0.85, phase: this.rng() * 6 };
      if (kind === 'heart') this.heartsTotal++;
      if (kind === 'memory') {
        this.memTotal++;
        MM.media.get('photo:' + it.mem).then((d) => { if (d && mesh.userData.photo) G.photoTex(d, (tex) => { mesh.userData.photo.material.map = tex; mesh.userData.photo.material.needsUpdate = true; }); });
        if (MM.save.memories.indexOf(it.mem) >= 0) { mesh.traverse((q) => { if (q.material && q.material.opacity !== undefined && q.isSprite) q.material.opacity = 0.35; }); }
      }
      this.items.push(it); this.itemById[id] = it;
      return it;
    }
    heart(x, y, z) { return this.item('heart', x, y, z); }
    hearts(x0, x1, y, z, n) { for (let i = 0; i < n; i++) this.heart(n === 1 ? x0 : x0 + ((x1 - x0) * i) / (n - 1), y, z); }
    memory(mem, x, y, z) { return this.item('memory', x, y, z, { mem, id: 'mem:' + mem, r: 1.0 }); }

    checkpoint(x, z, y, o) {
      o = o || {}; y = y || 0;
      const grp = new T.Group(); grp.position.set(x, y, z);
      G.mesh(G.cyl(0.05, 0.05, 2.2, 8), G.mat('#e9e4dc', { m: 0.4 }), 0, 1.1, 0, grp);
      const flag = G.mesh(G.box(0.8, 0.5, 0.04), G.mat('#9a8ca6', { r: 0.6 }).clone(), 0.42, 1.9, 0, grp);
      this.add(grp);
      const cp = { idx: this.checkpoints.length, x, y, z, flag, reached: false, m: o.m, f: o.f };
      this.checkpoints.push(cp);
      return cp;
    }

    goalZone(zones, o) {
      o = o || {};
      const grp = new T.Group();
      const ringMat = new T.MeshBasicMaterial({ color: 0xff6f9c, transparent: true, opacity: 0.55, depthWrite: false });
      zones.forEach((zn) => {
        const w = zn.x1 - zn.x0, d = zn.z1 - zn.z0, y = zn.y || 0;
        const disc = new T.Mesh(new T.PlaneGeometry(w, d), new T.MeshBasicMaterial({ color: 0xff9cc0, transparent: true, opacity: 0.28, depthWrite: false }));
        disc.rotation.x = -Math.PI / 2; disc.position.set((zn.x0 + zn.x1) / 2, y + 0.04, (zn.z0 + zn.z1) / 2); grp.add(disc);
        const edge = new T.Mesh(new T.RingGeometry(Math.min(w, d) * 0.42, Math.min(w, d) * 0.48, 48), ringMat);
        edge.rotation.x = -Math.PI / 2; edge.position.copy(disc.position); edge.position.y += 0.01; grp.add(edge);
        const hm = G.mesh(G.heartGeo(), G.mat('#ff6f9c', { e: '#ff2f6f', ei: 0.5, r: 0.3 }), disc.position.x, y + 2.6, disc.position.z, grp);
        hm.rotation.z = Math.PI; hm.scale.setScalar(0.9);
        this.anim.push((t) => { hm.rotation.y = t * 1.2; hm.position.y = y + 2.6 + Math.sin(t * 2) * 0.15; });
        const beam = new T.Mesh(new T.CylinderGeometry(Math.min(w, d) * 0.45, Math.min(w, d) * 0.45, 6, 32, 1, true), new T.MeshBasicMaterial({ color: 0xff9cc0, transparent: true, opacity: 0.12, depthWrite: false, side: T.DoubleSide }));
        beam.position.set(disc.position.x, y + 3, disc.position.z); grp.add(beam);
        if (zn.label) { const lb = G.textPlane(zn.label, 0.3, { color: '#fff', bg: 'rgba(255,79,139,.85)', size: 60, pad: 14 }); lb.position.set(disc.position.x, y + 1.4, zn.z1 + 0.05); grp.add(lb); }
      });
      this.add(grp);
      this.goal = { zones, req: o.req || null, reqText: o.reqText || 'Finish the mission first', progress: 0, grp, done: false, hold: o.hold || 1.4 };
      return this.goal;
    }

    talk(x, who, text, o) { this.talks.push(Object.assign({ x, who, text, done: false }, o || {})); }
    trigger(x0, x1, z0, z1, fn, o) { this.triggers.push(Object.assign({ x0, x1, z0, z1, fn, done: false }, o || {})); }

    /* ---------------- runtime ---------------- */
    respawnPoint(who) {
      const cp = this.checkpoints[this.cpIndex];
      if (cp) {
        if (cp[who === 'mohamed' ? 'm' : 'f']) { const a = cp[who === 'mohamed' ? 'm' : 'f']; return new T.Vector3(a[0], a[1], a[2]); }
        return new T.Vector3(cp.x + (who === 'mohamed' ? -0.9 : 0.9), cp.y + 0.05, cp.z + 0.8);
      }
      const s = this.spawns[who];
      return s ? s.clone() : new T.Vector3(0, 1, 0);
    }

    setCheckpoint(i, fromNet) {
      if (i <= this.cpIndex) return;
      for (let k = 0; k <= i; k++) {
        const cp = this.checkpoints[k];
        if (cp && !cp.reached) { cp.reached = true; cp.flag.material.color.set('#ff6f9c'); cp.flag.material.emissive = new T.Color('#ff2f6f'); cp.flag.material.emissiveIntensity = 0.4; }
      }
      this.cpIndex = i;
      if (!fromNet) { MM.Audio.sfx('check'); this.game.onCheckpoint(i); }
    }

    take(id, who, fromNet) {
      const it = this.itemById[id];
      if (!it || it.taken) return false;
      it.taken = true;
      it.mesh.visible = false;
      const pos = new T.Vector3(it.x, it.y, it.z);
      if (it.kind === 'heart') { MM.Audio.sfx('heart'); this.game.fx.emit('hearts', pos, { n: 5 }); }
      else if (it.kind === 'memory') { MM.Audio.sfx('memory'); this.game.fx.emit('sparkle', pos, { n: 18 }); }
      else if (it.kind === 'coin' || it.kind === 'contract') { MM.Audio.sfx('coin'); this.game.fx.emit('sparkle', pos, { n: 8, color: 0xffd34d }); }
      else { MM.Audio.sfx('item'); this.game.fx.emit('sparkle', pos, { n: 12 }); }
      if (it.counter && this.counters[it.counter]) this.counters[it.counter].n += it.value;
      if (it.onTake) it.onTake(this, it);
      this.game.onTake(it, who, fromNet);
      return true;
    }

    breakIt(id, fromNet) {
      const b = this.breakables[id];
      if (!b || b.broken) return;
      b.broken = true; b.solid.active = false; b.mesh.visible = false;
      this.sig['broken:' + id] = true;
      MM.Audio.sfx('break');
      const c = new T.Vector3((b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2, (b.z0 + b.z1) / 2);
      for (let i = 0; i < 3; i++) this.game.fx.emit('dust', c.clone().add(new T.Vector3(0, i * 0.4 - 0.4, 0)), { n: 10, color: 0xd8c8e8 });
      this.game.fx.emit('sparkle', c, { n: 14 });
      // chunks
      for (let i = 0; i < 8; i++) {
        const ch = G.mesh(G.box(0.35, 0.35, 0.35), G.mat(b.color, { r: 0.9, flat: true }), c.x, c.y, c.z, this.group);
        const v = new T.Vector3((Math.random() - 0.5) * 6, 3 + Math.random() * 4, (Math.random() - 0.5) * 6);
        let life = 0;
        const fn = (t, dt) => { life += dt; v.y -= 20 * dt; ch.position.addScaledVector(v, dt); ch.rotation.x += dt * 5; ch.scale.setScalar(Math.max(0.01, 1 - life / 1.2)); if (life > 1.2) { ch.visible = false; return true; } };
        this.anim.push(fn);
      }
      if (!fromNet) this.game.onBreak(id);
      this.game.shake(0.35);
    }

    // Slam shockwave from Mohamed landing at (x, y, z).
    slamAt(x, y, z) {
      Object.keys(this.breakables).forEach((id) => {
        const b = this.breakables[id];
        if (b.broken) return;
        const dx = Math.max(b.x0 - x, 0, x - b.x1), dz = Math.max(b.z0 - z, 0, z - b.z1);
        const near = Math.hypot(dx, dz) < 1.6;
        const vert = b.y1 >= y - 1.0 && b.y0 <= y + 2.2;
        if (near && vert) this.breakIt(id);
      });
    }

    countersComplete() { return this.counterOrder.every((k) => this.counters[k].n >= this.counters[k].target || this.counters[k].optional); }

    computeSignals() {
      this.counterOrder.forEach((k) => { const c = this.counters[k]; this.sig['count:' + k] = c.n >= c.target; });
      this.logics.forEach((l) => { this.sig[l.id] = !!l.fn(this.sig, this); });
    }

    // Movers & lifts first (so riders get carried this step).
    preStep(dt) {
      Ph.flushDeltas(this.solids);
      this.time += dt;
      const t = this.time;
      for (let i = 0; i < this.objects.length; i++) {
        const o = this.objects[i];
        if (o.type === 'mover') {
          if (o.sig == null || evalSig(this, o.sig)) o.clock += dt;
          const ph = o.sig == null ? t : o.clock;
          const k = (1 - Math.cos(((ph / o.period) + o.phase) * Math.PI * 2)) / 2;
          const nx = o.dx * k, ny = o.dy * k, nz = o.dz * k;
          const s = o.solid, b = o.base;
          s.dx = nx - o.off.x; s.dy = ny - o.off.y; s.dz = nz - o.off.z;
          o.off.set(nx, ny, nz);
          s.x0 = b.x0 + nx; s.x1 = b.x1 + nx; s.y0 = b.y0 + ny; s.y1 = b.y1 + ny; s.z0 = b.z0 + nz; s.z1 = b.z1 + nz;
          o.mesh.position.set(o.mbase.x + nx, o.mbase.y + ny, o.mbase.z + nz);
        } else if (o.type === 'elevator') {
          const target = evalSig(this, o.sig) ? o.yHigh : o.yLow;
          const prev = o.cur;
          if (o.cur < target) o.cur = Math.min(target, o.cur + o.speed * dt); else if (o.cur > target) o.cur = Math.max(target, o.cur - o.speed * dt);
          o.solid.dy = o.cur - prev; o.solid.y1 = o.cur; o.solid.y0 = o.cur - o.th;
          o.grp.position.y = o.cur;
        } else if (o.type === 'door') {
          let want = evalSig(this, o.sig) ? 1 : 0;
          if (!want && o.open > 0.05 && this.bodyIn(o)) want = 1;
          const prev = o.open;
          o.open = want ? Math.min(1, o.open + dt * 1.8) : Math.max(0, o.open - dt * 1.8);
          if ((prev === 0 && o.open > 0) || (prev === 1 && o.open < 1)) MM.Audio.sfx('door');
          const off = o.open * o.h * (o.mode === 'up' ? 1 : -1);
          o.solid.y0 = o.y0 + off; o.solid.y1 = o.y1 + off;
          o.solid.active = o.open < 0.97;
          o.mesh.position.y = o.base.y + off;
          o.mesh.visible = o.open < 0.995;
        } else if (o.type === 'bridge') {
          const on = o.latched || evalSig(this, o.sig);
          if (on && o.latch) o.latched = true;
          const prev = o.ext;
          o.ext = on ? Math.min(1, o.ext + dt * 1.4) : Math.max(0, o.ext - dt * 1.4);
          if (prev === 0 && o.ext > 0) MM.Audio.sfx('door');
          o.solid.active = o.ext > 0.97;
          this.applyBridge(o);
        } else if (o.type === 'hazard') {
          const k = o.linear ? ((t / o.period + o.phase) % 1) : (1 - Math.cos(((t / o.period) + o.phase) * Math.PI * 2)) / 2;
          o.pos.set(o.x + o.dx * k, o.y + o.dy * k, o.z + o.dz * k);
          o.mesh.position.copy(o.pos);
        }
      }
    }

    bodyIn(o) {
      const bodies = this.game.players.map((p) => p.body).concat(this.crates.map((c) => c.body));
      for (let i = 0; i < bodies.length; i++) {
        const b = bodies[i];
        if (b.x + b.r > o.x0 && b.x - b.r < o.x1 && b.z + b.r > o.z0 && b.z - b.r < o.z1 && b.y < o.y1 && b.y + b.h > o.y0) return true;
      }
      return false;
    }

    stepCrates(dt) {
      const own = this.game.ownsCrates();
      this.crates.forEach((c) => {
        const b = c.body;
        if (own) {
          const before = { x: b.x, y: b.y, z: b.z };
          b.vy -= MM.GRAVITY * dt; if (b.vy < -25) b.vy = -25;
          b.ground = null; b.grounded = false; b.prevY = b.y;
          Ph.axis(this.solids, b, 'y', b.vy * dt, false);
          if (c.locked) {
            const nx = MM.damp(b.x, c.lockTo.x, 10, dt), nz = MM.damp(b.z, c.lockTo.z, 10, dt);
            c.solid.accDx += nx - b.x; c.solid.accDz += nz - b.z; b.x = nx; b.z = nz;
          }
          if (b.y < this.killY) { c.reset(); }
          c.sync();
          c.solid.accDy += b.y - before.y;
        } else if (c.net) {
          const px = b.x, py = b.y, pz = b.z;
          b.x = MM.damp(b.x, c.net.x, 18, dt); b.y = MM.damp(b.y, c.net.y, 18, dt); b.z = MM.damp(b.z, c.net.z, 18, dt);
          c.sync(); c.solid.accDx += b.x - px; c.solid.accDy += b.y - py; c.solid.accDz += b.z - pz;
        }
      });
    }

    // Plates, signals, pickups, hazards, checkpoints, goal.
    postStep(dt) {
      const players = this.game.players;
      const plateIds = {};
      for (let i = 0; i < this.objects.length; i++) {
        const o = this.objects[i];
        if (o.type === 'plate') {
          let pressed = false;
          for (let k = 0; k < players.length && !pressed; k++) {
            const b = players[k].body;
            if (o.heavy && !b.heavy) continue;
            if (onPlate(o, b)) pressed = true;
          }
          if (!pressed) for (let k = 0; k < this.crates.length && !pressed; k++) {
            const c = this.crates[k];
            if (onPlate(o, c.body, true)) { pressed = true; if (!c.locked) this.lockCrate(c, o); }
          }
          if (pressed !== o.pressed) { MM.Audio.sfx(pressed ? 'plate' : 'unplate'); }
          o.pressed = pressed;
          if (pressed) o.latchT = o.latch; else o.latchT = Math.max(0, o.latchT - dt);
          o.on = pressed || o.latchT > 0;
          plateIds[o.id] = plateIds[o.id] || o.on;
        } else if (o.type === 'spring') {
          for (let k = 0; k < players.length; k++) {
            const p = players[k], b = p.body;
            if (p.local && b.grounded && b.ground === o.solid) { b.vy = o.power; b.grounded = false; b.ground = null; o.t = 0; p.onSpring(); }
          }
          o.t = Math.min(1, o.t + dt * 3);
          o.pad.position.y = 0.25 - Math.sin(o.t * Math.PI) * 0.1;
        }
      }
      Object.keys(plateIds).forEach((k) => { this.sig[k] = plateIds[k]; });
      this.computeSignals();

      // pickups (only local players pick things up; the result is synced)
      for (let k = 0; k < players.length; k++) {
        const p = players[k];
        if (!p.local) continue;
        const b = p.body, cy = b.y + b.h * 0.5;
        for (let i = 0; i < this.items.length; i++) {
          const it = this.items[i];
          if (it.taken || (it.who && it.who !== p.who) || (it.req && !evalSig(this, it.req))) continue;
          const dx = it.x - b.x, dz = it.z - b.z, dy = it.y - cy;
          if (dx * dx + dz * dz < (it.r + b.r) * (it.r + b.r) * 0.8 && Math.abs(dy) < b.h * 0.5 + it.r * 0.8) this.take(it.id, p.who);
        }
        // hazards
        if (p.invuln <= 0) {
          for (let i = 0; i < this.hazards.length; i++) {
            const h = this.hazards[i];
            if (h.box) {
              const hb = h.box;
              if (b.x + b.r > h.pos.x - hb.w / 2 && b.x - b.r < h.pos.x + hb.w / 2 && b.z + b.r > h.pos.z - hb.d / 2 && b.z - b.r < h.pos.z + hb.d / 2 && b.y < h.pos.y + hb.h / 2 && b.y + b.h > h.pos.y - hb.h / 2) { p.hurt(); break; }
            } else {
              const cx = MM.clamp(h.pos.x, b.x - b.r, b.x + b.r), cyy = MM.clamp(h.pos.y, b.y, b.y + b.h), cz = MM.clamp(h.pos.z, b.z - b.r, b.z + b.r);
              const d2 = (cx - h.pos.x) ** 2 + (cyy - h.pos.y) ** 2 + (cz - h.pos.z) ** 2;
              if (d2 < h.r * h.r) { p.hurt(); break; }
            }
          }
        }
        if (b.y < this.killY) p.respawn(true);
      }

      // checkpoints (any player reaching one moves both)
      for (let i = this.cpIndex + 1; i < this.checkpoints.length; i++) {
        const cp = this.checkpoints[i];
        for (let k = 0; k < players.length; k++) {
          const b = players[k].body;
          const lane = !!cp.m; // split-lane checkpoints only care about progress along x
          if (players[k].local && Math.abs(b.x - cp.x) < 1.6 && (lane || (Math.abs(b.z - cp.z) < 3.5 && Math.abs(b.y - cp.y) < 3))) { this.setCheckpoint(i); break; }
        }
      }

      // talk triggers
      for (let i = 0; i < this.talks.length; i++) {
        const tk = this.talks[i];
        if (tk.done) continue;
        if (players.some((p) => p.body.x >= tk.x && (!tk.by || tk.by === p.who))) { tk.done = true; this.game.say(tk.who, tk.text, tk.dur); }
      }
      for (let i = 0; i < this.triggers.length; i++) {
        const tr = this.triggers[i];
        if (tr.done) continue;
        if (players.some((p) => p.body.x > tr.x0 && p.body.x < tr.x1 && p.body.z > tr.z0 && p.body.z < tr.z1)) { tr.done = true; tr.fn(this, this.game); }
      }

      // goal
      const g = this.goal;
      if (g && !g.done) {
        const reqOk = !g.req || evalSig(this, g.req);
        const inside = players.length === 2 && players.every((p) => g.zones.some((zn) => (!zn.who || zn.who === p.who) && p.body.x > zn.x0 && p.body.x < zn.x1 && p.body.z > zn.z0 && p.body.z < zn.z1 && Math.abs(p.body.y - (zn.y || 0)) < 1.2));
        const anyInside = players.some((p) => g.zones.some((zn) => p.body.x > zn.x0 && p.body.x < zn.x1 && p.body.z > zn.z0 && p.body.z < zn.z1));
        g.anyInside = anyInside; g.reqOk = reqOk;
        if (inside && reqOk) g.progress = Math.min(1, g.progress + dt / g.hold);
        else g.progress = Math.max(0, g.progress - dt * 1.5);
        if (g.progress >= 1) { g.done = true; this.game.onGoal(); }
      }
    }

    // Per-frame visuals (not physics)
    frame(dt) {
      const t = this.time;
      for (let i = 0; i < this.items.length; i++) {
        const it = this.items[i];
        if (it.taken) continue;
        it.mesh.rotation.y = t * (it.kind === 'memory' ? 0.8 : 2) + it.phase;
        it.mesh.position.y = it.y + Math.sin(t * 2.4 + it.phase) * 0.12;
      }
      for (let i = 0; i < this.objects.length; i++) {
        const o = this.objects[i];
        if (o.type === 'plate') {
          o.pad.position.y = MM.damp(o.pad.position.y, o.on ? 0.08 : 0.14, 20, dt);
          o.padMat.emissiveIntensity = o.on ? 0.9 : 0.2;
          if (o.ring) { o.ring.visible = o.latchT > 0 && !o.pressed; const k = o.latch ? o.latchT / o.latch : 0; o.ring.scale.setScalar(0.4 + k * 0.6); }
        } else if (o.type === 'crate') {
          o.vis.position.set(o.body.x, o.body.y, o.body.z);
          if (o.moving > 0) o.moving -= dt;
        }
      }
      for (let i = this.anim.length - 1; i >= 0; i--) if (this.anim[i](t, dt) === true) this.anim.splice(i, 1);
    }

    resetCrates() { this.crates.forEach((c) => c.reset()); }

    // A crate that reaches a button snaps onto it and stays put, so nobody bumps it off by accident.
    lockCrate(c, plate) {
      c.locked = true; c.pushable = false; c.lockTo = { x: plate.x, z: plate.z };
      MM.Audio.sfx('item');
      this.game.fx.emit('sparkle', new T.Vector3(plate.x, plate.y + 1.6, plate.z), { n: 16, color: 0xffcf6e });
    }

    snapshot() {
      return {
        taken: this.items.filter((i) => i.taken).map((i) => i.id),
        broken: Object.keys(this.breakables).filter((k) => this.breakables[k].broken),
        cp: this.cpIndex,
      };
    }
    applySnapshot(s) {
      if (!s) return;
      (s.taken || []).forEach((id) => this.take(id, null, true));
      (s.broken || []).forEach((id) => this.breakIt(id, true));
      if (s.cp != null && s.cp > this.cpIndex) this.setCheckpoint(s.cp, true);
    }

    dispose() {
      this.game.scene.remove(this.group);
      this.game.scene.remove(this.sky);
      this.group.traverse((o) => {
        if (o.geometry && o.geometry.userData.own) o.geometry.dispose();
        const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
        mats.forEach((m) => { if (m.map && m.userData && m.userData.ownMap) m.map.dispose(); });
      });
    }
  }

  function onPlate(o, b, crate) {
    if (Math.abs(b.y - o.top) > 0.14) return false;
    const m = crate ? 0.1 : 0.15;
    return b.x > o.x - o.w / 2 - m && b.x < o.x + o.w / 2 + m && b.z > o.z - o.d / 2 - m && b.z < o.z + o.d / 2 + m;
  }

  MM.Level = Level;
  MM.evalSig = evalSig;
})(window.MM);
