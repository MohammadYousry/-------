/* Chapter "The Open Road": Mohamed drives, Mariem runs the radio. Notes only count on the matching station. */
(function (MM) {
  'use strict';
  const T = THREE, G = MM.G;

  const LANES = [-2.6, 0, 2.6];
  const STATIONS = [
    { name: 'Pop', color: 0xff6f9c, css: '#ff6f9c', song: 'drive0' },
    { name: 'Oud', color: 0xffcf6e, css: '#ffcf6e', song: 'drive1' },
    { name: 'Lo-fi', color: 0x5aa9ff, css: '#5aa9ff', song: 'drive2' },
  ];
  const LENGTH = 1250;
  MM.DRIVE_STATIONS = STATIONS;

  class Drive {
    constructor(game, def) {
      this.game = game; this.def = def;
      this.group = new T.Group();
      this.theme = MM.THEMES[def.theme];
      this.rng = MM.rng(2026);
      this.time = 0;
      this.reset(true);
      this.build();
      game.scene.add(this.group);
    }

    reset(first) {
      this.z = 0; this.x = 0; this.lane = 1; this.y = 0; this.hopT = 0; this.hopCool = 0;
      this.speed = 15; this.vibe = 60; this.station = 0; this.done = false; this.failed = false;
      this.wobble = 0; this.notesHit = 0; this.notesTotal = 0; this.hits = 0;
      if (!first) {
        this.obstacles.forEach((o) => { o.hit = false; o.mesh.visible = true; o.mesh.position.set(o.x, 0, o.z); o.mesh.rotation.set(0, 0, 0); o.vy = 0; });
        this.notes.forEach((n) => { n.taken = false; n.mesh.visible = true; n.missed = false; });
      }
    }

    build() {
      const th = this.theme, game = this.game, g = this.group;
      game.scene.background = new T.Color(th.skyBottom);
      game.scene.fog = new T.Fog(th.fog || th.skyBottom, 40, 170);
      this.sky = G.makeSky(th.skyTop, th.skyBottom, { horizon: th.horizon });
      game.scene.add(this.sky);
      g.add(new T.HemisphereLight(th.hemiSky, th.hemiGround, th.hemi));
      const sun = (this.sun = new T.DirectionalLight(th.sun, th.sunI));
      sun.position.set(-10, 20, 10);
      if (game.quality === 'high') { sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); const c = sun.shadow.camera; c.left = -14; c.right = 14; c.top = 14; c.bottom = -14; c.far = 60; }
      g.add(sun); g.add(sun.target);

      // road
      const road = new T.Mesh(new T.BoxGeometry(9, 0.2, LENGTH + 200), G.mat('#3b3946', { r: 0.9 }));
      road.position.set(0, -0.1, -LENGTH / 2 + 60); road.receiveShadow = true; g.add(road);
      [-1, 1].forEach((s) => {
        const side = new T.Mesh(new T.BoxGeometry(4, 0.4, LENGTH + 200), G.mat('#e7d8c9', { r: 0.9 }));
        side.position.set(s * 6.5, 0, -LENGTH / 2 + 60); side.receiveShadow = true; g.add(side);
        const grass = new T.Mesh(new T.BoxGeometry(40, 0.3, LENGTH + 200), G.mat('#8cc084', { r: 1 }));
        grass.position.set(s * 28.5, -0.1, -LENGTH / 2 + 60); g.add(grass);
      });
      // lane dashes (instanced)
      const nd = Math.floor((LENGTH + 150) / 6);
      const dash = new T.InstancedMesh(new T.BoxGeometry(0.15, 0.02, 2.4), G.basic('#fff7e0'), nd * 2);
      const mtx = new T.Matrix4(); let k = 0;
      for (let i = 0; i < nd; i++) [-1.3, 1.3].forEach((x) => { mtx.makeTranslation(x, 0.01, 40 - i * 6); dash.setMatrixAt(k++, mtx); });
      g.add(dash);
      // palms + lamps + buildings along the road (instanced)
      const r = this.rng;
      const nP = Math.floor(LENGTH / 18);
      const trunk = new T.InstancedMesh(G.cyl(0.18, 0.24, 5, 8), G.mat('#9b7448'), nP * 2);
      const crown = new T.InstancedMesh(new T.SphereGeometry(1.4, 8, 6), G.mat('#4fa462', { flat: true }), nP * 2);
      const lampP = new T.InstancedMesh(G.cyl(0.07, 0.09, 4, 6), G.mat('#2c2a33'), nP * 2);
      const lampB = new T.InstancedMesh(new T.SphereGeometry(0.28, 8, 6), G.mat('#fff2c4', { e: '#ffd88a', ei: 1.6 }), nP * 2);
      const nB = Math.floor(LENGTH / 14) * 2;
      const bld = new T.InstancedMesh(new T.BoxGeometry(1, 1, 1), new T.MeshStandardMaterial({ roughness: 0.8 }), nB);
      const cols = ['#f3c7a5', '#e8b4b8', '#f7e1c0', '#c9d8e8', '#f0d0a0', '#d9c2e6'].map((c) => new T.Color(c));
      let pi = 0, li = 0, bi = 0;
      for (let i = 0; i < nP; i++) {
        const z = 20 - i * 18;
        [-1, 1].forEach((s) => {
          if ((i + (s > 0 ? 1 : 0)) % 2 === 0) {
            mtx.makeTranslation(s * 7.4, 2.5, z); trunk.setMatrixAt(pi, mtx);
            mtx.makeTranslation(s * 7.4, 5.3, z); crown.setMatrixAt(pi, mtx); pi++;
          } else {
            mtx.makeTranslation(s * 5.2, 2, z); lampP.setMatrixAt(li, mtx);
            mtx.makeTranslation(s * 5.0, 4.1, z); lampB.setMatrixAt(li, mtx); li++;
          }
        });
      }
      for (let i = 0; i < nB / 2; i++) {
        const z = 10 - i * 14 - r() * 4;
        [-1, 1].forEach((s) => {
          const h = 4 + r() * 12, w = 5 + r() * 4, d = 6 + r() * 4;
          mtx.compose(new T.Vector3(s * (14 + w / 2 + r() * 4), h / 2, z), new T.Quaternion(), new T.Vector3(w, h, d));
          bld.setMatrixAt(bi, mtx); bld.setColorAt(bi, cols[Math.floor(r() * cols.length)]); bi++;
        });
      }
      trunk.count = pi; crown.count = pi; lampP.count = li; lampB.count = li; bld.count = bi;
      [trunk, crown, lampP, lampB, bld].forEach((m) => { m.castShadow = false; g.add(m); });
      // Nile bridge section + finish: home
      const home = MM.Props.house(); home.position.set(0, 0, -LENGTH - 22); g.add(home);
      const arch = G.textPlane('Home sweet home', 0.9, { color: '#fff', bg: '#ff6f9c', size: 80, pad: 22 });
      arch.position.set(0, 6.5, -LENGTH - 6); g.add(arch);
      [-4.8, 4.8].forEach((x) => G.mesh(G.cyl(0.2, 0.2, 7, 10), G.mat('#ffffff'), x, 3.5, -LENGTH - 6, g));
      const startSign = G.textPlane('2026 · our car · our playlist', 0.6, { color: '#3b2340', bg: 'rgba(255,248,240,.95)', size: 70, pad: 18 });
      startSign.position.set(-7.5, 3.2, -14); startSign.rotation.y = 0.5; g.add(startSign);

      // the car with both of them
      const car = (this.car = MM.Props.car('#f5f6f8'));
      g.add(car);
      const o = MM.save.settings.outfit;
      this.mo = MM.Characters.create('mohamed', o.mohamed); this.ma = MM.Characters.create('mariem', o.mariem);
      // Car model faces +z; the pivot turns it to drive toward -z. Driver sits on the left (Egypt).
      this.mo.root.position.set(0.48, 0.81, -0.1); this.ma.root.position.set(-0.48, 0.91, -0.1);
      car.add(this.mo.root); car.add(this.ma.root);
      this.carPivot = new T.Group(); g.add(this.carPivot); this.carPivot.add(car); car.rotation.y = Math.PI;
      // underglow shows the radio station
      this.glow = new T.Mesh(new T.PlaneGeometry(2.6, 5), new T.MeshBasicMaterial({ color: STATIONS[0].color, transparent: true, opacity: 0.45, depthWrite: false, blending: T.AdditiveBlending }));
      this.glow.rotation.x = -Math.PI / 2; this.glow.position.y = 0.03; this.carPivot.add(this.glow);

      // obstacles and notes
      this.obstacles = []; this.notes = [];
      const coneGeo = G.cone(0.45, 1.0, 12), coneMat = G.mat('#ff7a2f', { r: 0.6 });
      const barMat = G.mat('#ffffff', { r: 0.6 }), barRed = G.mat('#e0414f', { r: 0.6 });
      let segColor = 0;
      for (let z = -60; z > -LENGTH + 30; z -= 21 + Math.floor(r() * 8)) {
        if (Math.floor(-z / 170) !== Math.floor((-z - 25) / 170)) segColor = (segColor + 1 + Math.floor(r() * 2)) % 3;
        const roll = r();
        let blocked = [];
        if (roll < 0.42) { blocked = [Math.floor(r() * 3)]; }
        else if (roll < 0.62) { const l = Math.floor(r() * 2); blocked = [l, l + 1]; }
        else if (roll < 0.75) { blocked = [0, 2]; }
        if (-z < 140 && blocked.length > 1) blocked = [blocked[0]];
        if (blocked.length === 2 && blocked[1] - blocked[0] === 1) {
          const m = new T.Group();
          const lx = (LANES[blocked[0]] + LANES[blocked[1]]) / 2;
          G.mesh(G.box(4.8, 0.5, 0.3), barMat, 0, 0.9, 0, m); G.mesh(G.box(1.2, 0.5, 0.32), barRed, -1.6, 0.9, 0, m); G.mesh(G.box(1.2, 0.5, 0.32), barRed, 1.6, 0.9, 0, m);
          [-2.1, 2.1].forEach((x) => G.mesh(G.box(0.15, 1.1, 0.15), barMat, x, 0.55, 0, m));
          m.position.set(lx, 0, z); g.add(m);
          this.obstacles.push({ z, x: lx, w: 4.8, lanes: blocked, mesh: m, hit: false, vy: 0, hoppable: false });
        } else {
          blocked.forEach((l) => {
            const m = new T.Group();
            G.mesh(coneGeo, coneMat, 0, 0.5, 0, m); G.mesh(G.box(1, 0.1, 1), coneMat, 0, 0.05, 0, m);
            G.mesh(G.cyl(0.27, 0.33, 0.14, 12), barMat, 0, 0.5, 0, m);
            m.position.set(LANES[l], 0, z); g.add(m);
            this.obstacles.push({ z, x: LANES[l], w: 1.2, lanes: [l], mesh: m, hit: false, vy: 0, hoppable: true });
          });
        }
        // notes in a free lane, in the current "song colour"
        const free = [0, 1, 2].filter((l) => blocked.indexOf(l) < 0);
        if (free.length) {
          const l = free[Math.floor(r() * free.length)];
          const col = r() < 0.85 ? segColor : Math.floor(r() * 3);
          for (let j = 0; j < 3; j++) {
            const nz = z + 6 + j * 3;
            const m = new T.Group();
            G.mesh(G.sphere(0.32, 12, 10), G.mat(STATIONS[col].color, { e: STATIONS[col].color, ei: 0.8, r: 0.3 }), 0, 0, 0, m);
            G.mesh(G.box(0.08, 0.8, 0.08), G.mat(STATIONS[col].color, { e: STATIONS[col].color, ei: 0.8 }), 0.28, 0.4, 0, m);
            G.mesh(G.box(0.36, 0.1, 0.08), G.mat(STATIONS[col].color, { e: STATIONS[col].color, ei: 0.8 }), 0.42, 0.76, 0, m);
            m.position.set(LANES[l], 1.4, nz); g.add(m);
            this.notes.push({ z: nz, x: LANES[l], lane: l, col, mesh: m, taken: false, missed: false });
          }
        }
      }
      this.notesTotal = this.notes.length;
    }

    setStation(i, fromNet) {
      i = ((i % 3) + 3) % 3;
      if (i === this.station && !fromNet) return;
      this.station = i;
      if (!fromNet) this.lastLocalStation = this.time;
      this.glow.material.color.set(STATIONS[i].color);
      MM.Audio.sfx('switch');
      MM.Audio.playMusic(STATIONS[i].song);
      this.game.fx.emit('notes', this.carWorld(new T.Vector3(0.5, 2, 0)), { color: STATIONS[i].color });
      this.ma.play('celebrate', 0.6);
      if (!fromNet) this.game.net.sendEv({ e: 'station', i });
      this.game.ui.driveHud(this);
    }

    carWorld(v) { return v.applyMatrix4(this.carPivot.matrixWorld); }

    // roles: who controls what this frame
    update(dt, inputs) {
      this.time += dt;
      const sim = this.game.ownsCrates(); // whoever controls Mohamed drives the car
      const drv = inputs.mohamed, dj = inputs.mariem;
      if (dj) {
        if (dj.ability || (dj !== drv && (dj.mx > 0.5 && !this.djR))) this.setStation(this.station + 1);
        if (dj !== drv && dj.mx < -0.5 && !this.djL) this.setStation(this.station - 1);
        if (dj !== drv && dj.jump) this.setStation(this.station + 1);
        if (dj.love) { MM.Audio.sfx('honk'); this.game.fx.emit('hearts', this.carWorld(new T.Vector3(0.5, 2.2, 0)), { n: 4 }); this.game.net.sendEv({ e: 'fx', k: 'honk' }); }
        this.djR = dj !== drv && dj.mx > 0.5; this.djL = dj !== drv && dj.mx < -0.5;
      }
      if (sim && this.running && !this.done && !this.failed) {
        if (drv) {
          if (drv.mx > 0.5 && !this.stR) this.lane = Math.min(2, this.lane + 1);
          if (drv.mx < -0.5 && !this.stL) this.lane = Math.max(0, this.lane - 1);
          this.stR = drv.mx > 0.5; this.stL = drv.mx < -0.5;
          if (drv.jump && this.hopT <= 0 && this.hopCool <= 0) { this.hopT = 0.62; this.hopCool = 0.9; MM.Audio.sfx('jump', { pitch: 0.8 }); }
          if (drv.love && dj !== drv) { MM.Audio.sfx('honk'); }
        }
        this.hopCool -= dt;
        this.speed = Math.min(25, this.speed + dt * 0.18);
        const slow = this.wobble > 0 ? 0.6 : 1;
        this.z -= this.speed * slow * dt;
        this.x = MM.damp(this.x, LANES[this.lane], 9, dt);
        if (this.hopT > 0) { this.hopT -= dt; this.y = Math.sin(Math.max(0, this.hopT) / 0.62 * Math.PI) * 1.3; } else this.y = 0;
        this.wobble -= dt;
        this.collide();
        if (this.z < -LENGTH) this.finish();
        if (this.vibe <= 0) this.fail();
      } else if (!sim && this.net) {
        const n = this.net;
        this.z = MM.damp(this.z, n.z, 12, dt); this.x = MM.damp(this.x, n.x, 12, dt); this.y = n.y; this.vibe = n.vibe;
        if (n.st !== this.station && this.time - (this.lastLocalStation || -9) > 0.8) this.setStation(n.st, true);
      }
      // visuals
      this.carPivot.position.set(this.x, this.y, this.z);
      this.carPivot.rotation.z = this.wobble > 0 ? Math.sin(this.time * 30) * 0.06 : 0;
      this.carPivot.rotation.y = (LANES[this.lane] - this.x) * -0.06;
      this.car.userData.wheels.forEach((w) => { w.rotation.x += this.speed * dt * 2.4; });
      this.mo.update(dt, { pose: 'drive', grounded: true });
      this.ma.update(dt, { pose: 'ride', grounded: true });
      this.notes.forEach((n) => { if (!n.taken) { n.mesh.rotation.y = this.time * 2 + n.z; } });
      this.obstacles.forEach((o) => { if (o.hit && o.mesh.visible) { o.vy -= 20 * dt; o.mesh.position.y += o.vy * dt; o.mesh.position.x += o.dxv * dt; o.mesh.rotation.x += dt * 6; if (o.mesh.position.y < -3) o.mesh.visible = false; } });
      this.sun.position.set(this.x - 10, 20, this.z + 10); this.sun.target.position.set(this.x, 0, this.z - 6);
      this.sky.position.set(0, 0, this.z);
    }

    collide() {
      const cz = this.z;
      for (let i = 0; i < this.obstacles.length; i++) {
        const o = this.obstacles[i];
        if (o.hit || o.z < cz - 3 || o.z > cz + 3) continue;
        if (Math.abs(o.z - cz) < 2.0 && Math.abs(o.x - this.x) < o.w / 2 + 0.9) {
          if (o.hoppable && this.y > 0.75) continue;
          this.hitObstacle(i);
        }
      }
      for (let i = 0; i < this.notes.length; i++) {
        const n = this.notes[i];
        if (n.taken || n.missed || n.z < cz - 3 || n.z > cz + 3) continue;
        if (Math.abs(n.z - cz) < 1.8 && Math.abs(n.x - this.x) < 1.3) {
          if (n.col === this.station) this.takeNote(i); else this.missNote(i);
        }
      }
    }

    hitObstacle(i, fromNet) {
      const o = this.obstacles[i];
      if (o.hit) return;
      o.hit = true; o.vy = 7; o.dxv = (o.x - this.x || 1) * 3;
      this.vibe = Math.max(0, this.vibe - 12); this.wobble = 0.5; this.hits++;
      MM.Audio.sfx('hit'); this.game.shake(0.3);
      this.mo.play('love', 0.5);
      if (!fromNet) this.game.net.sendEv({ e: 'dhit', i });
      this.game.ui.driveHud(this);
    }
    takeNote(i, fromNet) {
      const n = this.notes[i];
      if (n.taken) return;
      n.taken = true; n.mesh.visible = false;
      this.vibe = Math.min(100, this.vibe + 4); this.notesHit++;
      MM.Audio.sfx('note', { pitch: [1, 1.12, 1.26][i % 3] });
      this.game.fx.emit('notes', new T.Vector3(n.x, 1.6, n.z), { color: STATIONS[n.col].color });
      if (!fromNet) this.game.net.sendEv({ e: 'dnote', i });
      this.game.ui.driveHud(this);
    }
    missNote(i) {
      const n = this.notes[i];
      n.missed = true;
      n.mesh.traverse((q) => { if (q.isMesh) q.material = G.mat('#8a8494', { r: 0.8 }); });
      if (!this.missToastT || this.time - this.missToastT > 6) { this.missToastT = this.time; this.game.say('mariem', 'Wrong station! Switch to ' + STATIONS[n.col].name + '!', 2.2); }
    }

    finish() {
      if (this.done) return;
      this.done = true;
      this.game.net.sendEv({ e: 'dfin' });
      this.game.onGoal();
    }
    fail() {
      if (this.failed) return;
      this.failed = true;
      MM.Audio.sfx('fail');
      this.game.say('mohamed', 'Okay... the vibe died. Let\'s take that road again.', 2.5);
      setTimeout(() => { this.reset(false); this.setStation(0, true); this.game.ui.driveHud(this); }, 1600);
      this.game.net.sendEv({ e: 'dfail' });
    }

    netState() { return { z: Math.round(this.z * 100) / 100, x: Math.round(this.x * 100) / 100, y: Math.round(this.y * 100) / 100, vibe: this.vibe, st: this.station }; }
    applyNet(s) { this.net = s; }

    progress() { return MM.clamp(-this.z / LENGTH, 0, 1); }

    camera(cam, dt, snap) {
      const tx = this.x * 0.6, tz = this.z + 9.5, ty = 5.8 + this.y * 0.4;
      if (snap) cam.position.set(tx, ty, tz);
      else { cam.position.x = MM.damp(cam.position.x, tx, 6, dt); cam.position.y = MM.damp(cam.position.y, ty, 6, dt); cam.position.z = tz; }
      cam.lookAt(this.x * 0.8, 1.2, this.z - 9);
    }

    dispose() {
      this.game.scene.remove(this.group);
      this.game.scene.remove(this.sky);
    }
  }

  MM.Drive = Drive;
})(window.MM);
