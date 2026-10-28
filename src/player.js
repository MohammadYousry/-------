/* A playable character: controls, abilities, physics body and remote-player smoothing. */
(function (MM) {
  'use strict';
  const T = THREE, G = MM.G, Ph = MM.Physics;

  class Player {
    constructor(game, who, outfit) {
      this.game = game; this.who = who; this.S = MM.CHARS[who];
      this.model = MM.Characters.create(who, outfit);
      this.local = true;
      const S = this.S;
      this.body = { x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, r: S.radius, h: S.height, heavy: S.heavy, who, canPush: who === 'mohamed', grounded: false, ground: null };
      this.facing = new T.Vector2(0, 1);
      this.yaw = 0;
      this.coyote = 0; this.jumpBuf = 0; this.doubleUsed = false; this.jumpCut = false;
      this.dashT = 0; this.dashUsed = false; this.cool = 0; this.slamming = false; this.tossedT = 0;
      this.invuln = 0; this.pose = null; this.frozen = false;
      this.stats = { falls: 0 };
      // Mohamed's shoulders are a one-way platform Mariem can stand on.
      if (who === 'mohamed') {
        this.head = Ph.solid(0, 0, 0, 0, 0, 0, { oneWay: true, only: 'mariem', acc: true, noShadow: true });
      }
      // blob shadow
      const sh = new T.Mesh(new T.CircleGeometry(S.radius * 1.25, 24), new T.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.32, depthWrite: false }));
      sh.rotation.x = -Math.PI / 2; sh.renderOrder = 2;
      this.shadow = sh;
      // marker above head
      const mk = new T.Sprite(new T.SpriteMaterial({ map: G.tex('heart'), color: S.hex, transparent: true, depthWrite: false, depthTest: false }));
      mk.scale.setScalar(0.32); mk.renderOrder = 20;
      this.marker = mk;
      this.netT = null; // remote target state
    }

    addTo(scene, level) {
      scene.add(this.model.root); scene.add(this.shadow); scene.add(this.marker);
      if (this.head) level.addSolid(this.head);
    }
    removeFrom(scene) { scene.remove(this.model.root); scene.remove(this.shadow); scene.remove(this.marker); }

    place(v) {
      const b = this.body;
      b.x = v.x; b.y = v.y; b.z = v.z; b.vx = b.vy = b.vz = 0; b.grounded = false; b.ground = null;
      this.slamming = false; this.dashT = 0;
      this.syncHead(true);
      this.model.root.position.set(b.x, b.y, b.z);
    }

    syncHead(reset) {
      if (!this.head) return;
      const b = this.body, h = this.head, w = 0.36;
      const nx0 = b.x - w, ny1 = b.y + b.h - 0.02, nz0 = b.z - w;
      if (!reset) { h.accDx += nx0 - h.x0; h.accDy += ny1 - h.y1; h.accDz += nz0 - h.z0; }
      h.x0 = nx0; h.x1 = b.x + w; h.y0 = ny1 - 0.3; h.y1 = ny1; h.z0 = nz0; h.z1 = b.z + w;
    }

    partner() { return this.game.players.find((p) => p !== this); }

    /* -------- per-frame control (local only) -------- */
    control(dt, inp) {
      const S = this.S, b = this.body;
      this.cool -= dt; this.invuln -= dt; this.tossedT -= dt;
      if (this.frozen) { b.vx = MM.damp(b.vx, 0, 10, dt); b.vz = MM.damp(b.vz, 0, 10, dt); return; }
      const mx = inp ? inp.mx : 0, mz = inp ? inp.mz : 0;
      const mag = Math.hypot(mx, mz);
      if (mag > 0.15) this.facing.set(mx / mag, mz / mag);
      if (this.dashT <= 0) {
        const spd = S.speed * (b.pushing ? 0.6 : 1);
        const tx = mx * spd, tz = mz * spd;
        const acc = (b.grounded ? S.accel : S.airAccel) * dt;
        b.vx = approach(b.vx, tx, acc); b.vz = approach(b.vz, tz, acc);
      }
      if (b.grounded) { this.coyote = 0.11; this.doubleUsed = false; this.dashUsed = false; this.jumpCut = false; }
      else this.coyote -= dt;
      if (inp && inp.jump) this.jumpBuf = 0.14; else this.jumpBuf -= dt;
      if (this.jumpBuf > 0) {
        if (this.coyote > 0) {
          b.vy = S.jumpV; b.grounded = false; b.ground = null; this.coyote = 0; this.jumpBuf = 0; this.jumpCut = false;
          MM.Audio.sfx('jump', { pitch: this.who === 'mariem' ? 1.25 : 0.9 });
          this.game.fx.emit('dust', this.feet(), { n: 6 });
        } else if (S.canDouble && !this.doubleUsed && this.dashT <= 0) {
          b.vy = S.doubleJumpV; this.doubleUsed = true; this.jumpBuf = 0; this.jumpCut = true;
          MM.Audio.sfx('jump2');
          this.game.fx.emit('paw', this.feet()); this.game.fx.emit('sparkle', this.feet(), { n: 6, color: 0xff9cc0 });
          this.model.play('spin', 0.35);
        }
      }
      // short hop when jump released early
      if (inp && !inp.jumpHeld && b.vy > 4 && !this.jumpCut && this.tossedT <= 0 && !b.grounded) { b.vy *= 0.55; this.jumpCut = true; }
      if (inp && inp.ability && this.cool <= 0) this.ability();
      if (inp && inp.love) this.love();
    }

    ability() {
      const b = this.body;
      if (this.who === 'mohamed') {
        const p = this.partner();
        if (p) {
          const pb = p.body, dx = pb.x - b.x, dz = pb.z - b.z, dy = pb.y - b.y;
          if (dx * dx + dz * dz < 1.9 * 1.9 && dy > -0.6 && dy < 2.4) {
            this.cool = 0.6; this.model.play('toss', 0.45);
            this.game.toss(this, p, this.facing.x, this.facing.y);
            return;
          }
        }
        if (!b.grounded && !this.slamming) {
          this.slamming = true; this.cool = 0.3; b.vy = -26; b.vx *= 0.2; b.vz *= 0.2;
          this.model.play('slam', 0.6); MM.Audio.sfx('dash');
          return;
        }
        if (b.grounded) { this.cool = 0.8; this.model.play('flex', 0.7); this.game.fx.emit('sparkle', this.headPos(), { n: 6, color: 0x5aa9ff }); }
      } else {
        if (this.dashUsed && !b.grounded) return;
        this.dashT = this.S.dashTime; this.dashUsed = !b.grounded; this.cool = 0.45;
        this.model.play('dash', this.S.dashTime + 0.1);
        MM.Audio.sfx('dash');
        this.game.net.sendEv({ e: 'fx', k: 'dash', who: this.who });
      }
    }

    receiveToss(fx, fz) {
      const b = this.body;
      b.vy = MM.TOSS_V; b.vx = fx * 2.4; b.vz = fz * 2.4; b.grounded = false; b.ground = null;
      b.y += 0.05;
      this.doubleUsed = false; this.dashUsed = false; this.jumpCut = true; this.tossedT = 0.6; this.coyote = 0; this.jumpBuf = 0;
      this.model.play('tossed', 0.5);
      MM.Audio.sfx('toss');
      this.game.fx.emit('sparkle', this.feet(), { n: 14, color: 0xffcf6e });
    }

    love() {
      this.cool = Math.max(this.cool, 0.2);
      const p = this.partner();
      const near = p && Math.hypot(p.body.x - this.body.x, p.body.z - this.body.z) < 2.3 && Math.abs(p.body.y - this.body.y) < 1.5;
      if (near) this.game.hug(this, p);
      else { this.model.play('love', 1.0); this.game.fx.emit('hearts', this.headPos(), { n: 4 }); MM.Audio.sfx('love'); this.game.net.sendEv({ e: 'fx', k: 'love', who: this.who }); }
    }

    onSpring() { MM.Audio.sfx('spring'); this.doubleUsed = false; this.dashUsed = false; this.jumpCut = true; this.tossedT = 0.4; this.game.fx.emit('sparkle', this.feet(), { n: 10, color: 0x7ee0c3 }); }

    hurt() {
      if (this.invuln > 0) return;
      MM.Audio.sfx('pop');
      this.game.fx.emit('hearts', this.headPos(), { n: 6, color: 0x9a8ca6 });
      this.respawn(false);
    }

    respawn(fell) {
      const lv = this.game.level;
      if (!lv) return;
      this.stats.falls++;
      this.place(lv.respawnPoint(this.who));
      this.invuln = 1.4; this.model.flash(1.2);
      MM.Audio.sfx('respawn');
      this.game.fx.emit('sparkle', this.headPos(), { n: 12 });
      if (fell) this.game.onFell(this);
    }

    /* -------- fixed-step physics (local only) -------- */
    step(dt, solids) {
      const b = this.body;
      if (this.dashT > 0) {
        this.dashT -= dt;
        b.vx = this.facing.x * this.S.dashSpeed; b.vz = this.facing.y * this.S.dashSpeed; b.vy = 0;
        if (this.dashT <= 0) { b.vx *= 0.45; b.vz *= 0.45; }
        if (Math.random() < 0.5) this.game.fx.emit('trail', this.feet());
      } else {
        b.vy -= MM.GRAVITY * dt;
        if (this.slamming) b.vy = -26;
        if (b.vy < -28) b.vy = -28;
      }
      const wasAir = !b.grounded;
      Ph.move(solids, b, dt);
      if (b.grounded && wasAir) this.landed(b.impact || 0);
      if (this.slamming && b.grounded) this.slamming = false;
      this.syncHead(false);
    }

    landed(impact) {
      const v = -impact;
      if (this.slamming) {
        this.slamming = false;
        MM.Audio.sfx('slam');
        this.game.fx.emit('ring', this.feet());
        this.game.shake(0.45);
        this.game.slam(this);
        this.model.land(0.3);
        return;
      }
      if (v > 6) { this.model.land(MM.clamp(v / 40, 0.08, 0.25)); MM.Audio.sfx('land'); if (v > 12) this.game.fx.emit('dust', this.feet(), { n: 6 }); }
    }

    /* -------- remote -------- */
    applyNet(s) { this.netT = s; }
    remoteUpdate(dt) {
      const s = this.netT, b = this.body;
      if (!s) return;
      const px = b.x, py = b.y, pz = b.z;
      const ext = 0.05;
      const tx = s.x + s.vx * ext, ty = s.y, tz = s.z + s.vz * ext;
      if (Math.hypot(tx - b.x, ty - b.y, tz - b.z) > 5) { b.x = tx; b.y = ty; b.z = tz; }
      else { b.x = MM.damp(b.x, tx, 16, dt); b.y = MM.damp(b.y, ty, 16, dt); b.z = MM.damp(b.z, tz, 16, dt); }
      b.vx = s.vx; b.vy = s.vy; b.vz = s.vz;
      b.grounded = !!s.g; b.pushing = !!s.p;
      this.facing.set(Math.sin(s.yaw), Math.cos(s.yaw));
      this.syncHead(false);
      if (this.head) { /* carry riders by the smoothed movement */ }
      if (s.a && s.a !== this.lastNetAction) { this.model.play(s.a, s.ad || 0.6); }
      this.lastNetAction = s.a;
      this.pose = s.pose || null;
      return [b.x - px, b.y - py, b.z - pz];
    }
    netState() {
      const b = this.body, m = this.model;
      return { x: r3(b.x), y: r3(b.y), z: r3(b.z), vx: r3(b.vx), vy: r3(b.vy), vz: r3(b.vz), yaw: r3(this.yaw), g: b.grounded ? 1 : 0, p: b.pushing ? 1 : 0, a: m.action || null, ad: m.actionDur, pose: this.pose };
    }

    /* -------- visuals -------- */
    feet() { return new T.Vector3(this.body.x, this.body.y + 0.05, this.body.z); }
    headPos() { return new T.Vector3(this.body.x, this.body.y + this.body.h + 0.3, this.body.z); }

    visual(dt, solids, showMarker) {
      const b = this.body, m = this.model;
      const sp = Math.hypot(b.vx, b.vz);
      if (sp > 0.4 && this.dashT <= 0 && !this.pose) this.yaw = MM.angleDamp(this.yaw, Math.atan2(b.vx, b.vz), 14, dt);
      else if (this.dashT > 0) this.yaw = Math.atan2(this.facing.x, this.facing.y);
      m.root.position.set(b.x, b.y, b.z);
      m.root.rotation.y = this.yaw;
      m.update(dt, { speed: b.grounded ? sp : 0, maxSpeed: this.S.speed, grounded: b.grounded || !!this.pose, vy: b.vy, pushing: b.pushing && sp > 0.3, pose: this.pose });
      // blob shadow
      const gy = Ph.groundBelow(solids, b.x, b.z, b.y + 0.05, b.r);
      if (gy > -1e8) {
        const hgt = b.y - gy;
        this.shadow.visible = true;
        this.shadow.position.set(b.x, gy + 0.03, b.z);
        const k = MM.clamp(1 - hgt / 8, 0.35, 1);
        this.shadow.scale.setScalar(k);
        this.shadow.material.opacity = 0.32 * k;
      } else this.shadow.visible = false;
      this.marker.visible = !!showMarker;
      this.marker.position.set(b.x, b.y + m.height + 0.38 + Math.sin(m.t * 3) * 0.05, b.z);
    }
  }

  function approach(v, t, a) { return v < t ? Math.min(t, v + a) : Math.max(t, v - a); }
  function r3(v) { return Math.round(v * 1000) / 1000; }

  MM.Player = Player;
})(window.MM);
