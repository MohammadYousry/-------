// Injected into the page. Drives the real game simulation with scripted inputs.
window.T = {
  get g() { return window.__MM; },
  blank() { return { mx: 0, mz: 0, jump: false, jumpHeld: false, ability: false, love: false, swap: false, call: false, pause: false }; },
  step(inp) { const g = this.g; g.debugInput = inp; g.simulate(1 / 60, false); g.debugInput = null; },
  run(sec, o) {
    const n = Math.round(sec * 60);
    for (let i = 0; i < n; i++) {
      const inp = { mohamed: null, mariem: null };
      ['mohamed', 'mariem'].forEach((w) => {
        const src = o && o[w];
        if (!src) return;
        const a = Object.assign(this.blank(), typeof src === 'function' ? src(i, this.b(w)) : src);
        if (typeof src !== 'function' && i > 0) { a.jump = false; a.ability = false; a.love = false; }
        inp[w] = a;
      });
      this.step(inp);
    }
  },
  b(w) { return this.g.player(w).body; },
  P(w) { const b = this.b(w); return { x: +b.x.toFixed(2), y: +b.y.toFixed(2), z: +b.z.toFixed(2), gr: b.grounded }; },
  tp(w, x, y, z) { this.g.player(w).place(new THREE.Vector3(x, y, z)); this.run(0.25, {}); },
  sig(k) { return !!this.g.level.sig[k]; },
  // steer toward (tx,tz); auto-jump when blocked; Mariem double-jumps near the apex when still blocked
  goto(w, tx, tz, sec, opt) {
    opt = opt || {};
    let jumped = 0, doubled = false, dashT = -1;
    this.run(sec || 6, {
      [w]: (i, b) => {
        const dx = tx - b.x, dz = tz == null ? 0 : tz - b.z;
        const d = Math.hypot(dx, dz);
        const a = { mx: 0, mz: 0, jumpHeld: true };
        if (d > 0.12) { a.mx = dx / Math.max(d, 1); a.mz = dz / Math.max(d, 1); if (d < 1) { a.mx = dx; a.mz = dz; } }
        if (b.grounded) { doubled = false; }
        if (opt.autojump !== false && b.grounded && b.blocked && i - jumped > 12) { a.jump = true; jumped = i; }
        if (w === 'mariem' && !b.grounded && !doubled && b.vy < 1.5 && (b.blocked || (opt.double && !opt.edge)) && i - jumped > 6) { a.jump = true; doubled = true; }
        if (opt.jumpAtX != null && b.grounded && Math.abs(b.x - opt.jumpAtX) < 0.2 && i - jumped > 20) { a.jump = true; jumped = i; }
        if (opt.edge && b.grounded && i - jumped > 10) {
          const dir = Math.sign(a.mx) || 1;
          const ahead = MM.Physics.groundBelow(this.g.level.solids, b.x + dir * (b.r + 0.25), b.z, b.y + 0.1, 0.05);
          if (ahead < b.y - 0.6) { a.jump = true; jumped = i; }
        }
        if (opt.edge && opt.double && w === 'mariem' && !b.grounded && !doubled && b.vy < 0.5 && i - jumped > 6) {
          const below = MM.Physics.groundBelow(this.g.level.solids, b.x, b.z, b.y + 0.1, 0.1);
          if (below < b.y - 3) { a.jump = true; doubled = true; }
        }
        return a;
      },
    });
    return this.P(w);
  },
  takenCount(kind) { return this.g.level.items.filter((i) => i.kind === kind && i.taken).length; },
};
