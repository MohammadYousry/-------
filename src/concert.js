/* Chapter "The Best Feeling": the couch on finale night, then two concerts played as a two-player rhythm game. */
(function (MM) {
  'use strict';
  const T = THREE, G = MM.G;

  const SONGS = [
    { id: 'concert1', artist: 'TUL8TE', title: 'Tul8te live', color: '#ff6f9c', bars: 16, seed: 7 },
    { id: 'concert2', artist: 'HAMAKI', title: 'Hamaki live', color: '#ffcf6e', bars: 16, seed: 11 },
  ];
  const LOOK = 2.0; // seconds a note is visible before the hit line

  class Concert {
    constructor(game, def) {
      this.game = game; this.def = def;
      this.group = new T.Group();
      this.phase = 'couch'; this.phaseT = 0; this.songIdx = -1;
      this.notes = []; this.judge = { mohamed: null, mariem: null };
      this.score = { mohamed: { p: 0, g: 0, m: 0, combo: 0, best: 0 }, mariem: { p: 0, g: 0, m: 0, combo: 0, best: 0 } };
      this.loves = {}; this.prevMx = {}; this.done = false; this.running = false;
      this.build();
      game.scene.add(this.group);
      this.canvas = document.getElementById('rhythm');
    }

    build() {
      const g = this.group, game = this.game;
      game.scene.background = new T.Color('#0b0716');
      game.scene.fog = new T.Fog('#0b0716', 30, 110);
      this.sky = G.makeSky('#05030c', '#2a1240', { horizon: '#4a1a5a', stars: 500 });
      game.scene.add(this.sky);
      g.add(new T.HemisphereLight('#b9a8ff', '#2a1030', 1.1));
      const sun = new T.DirectionalLight('#ffe2c4', 1.6); sun.position.set(-6, 14, 10); g.add(sun);
      // living room on finale night (far to the left)
      const room = new T.Group(); room.position.set(-80, 0, 0); g.add(room);
      room.add(new T.Mesh(new T.BoxGeometry(14, 0.2, 10), G.mat('#6b4a3a')));
      const wall = new T.Mesh(new T.BoxGeometry(14, 6, 0.3), G.mat('#3a2f4a')); wall.position.set(0, 3, -4.5); room.add(wall);
      const tv = MM.Props.bigTV('THE FINALE'); tv.position.set(0, 0.1, -3.9); room.add(tv);
      const couch = MM.Props.couch(); couch.position.set(0, 0.1, 1.6); couch.rotation.y = Math.PI; room.add(couch);
      const lamp = MM.Props.deskLamp(0.6); lamp.position.set(3.2, 0.1, 1.6); room.add(lamp);
      const tvGlow = new T.PointLight('#a9b8ff', 4, 9); tvGlow.position.set(0, 1.8, -2.5); room.add(tvGlow);
      this.tvGlow = tvGlow;
      // concert venue
      const floor = new T.Mesh(new T.BoxGeometry(60, 0.2, 40), G.mat('#1a1622', { r: 0.9 })); floor.position.y = -0.1; g.add(floor);
      this.stage = MM.Props.concertStage(SONGS[0].artist, SONGS[0].color); this.stage.position.set(0, 0, -12); g.add(this.stage);
      const crowd = MM.Props.crowd(160, 26, 12, 3); crowd.position.set(0, 0, -2); g.add(crowd); this.crowd = crowd;
      const crowd2 = MM.Props.crowd(120, 30, 8, 9); crowd2.position.set(0, 0, 7); g.add(crowd2); this.crowd2 = crowd2;
      this.spot = new T.SpotLight('#ffffff', 40, 30, 0.5, 0.6); this.spot.position.set(0, 12, -6); this.spot.target.position.set(0, 0, 2.5); g.add(this.spot); g.add(this.spot.target);
      // the two of them
      const o = Object.assign({}, MM.save.settings.outfit, this.def.outfit || {});
      this.mo = MM.Characters.create('mohamed', o.mohamed); this.ma = MM.Characters.create('mariem', o.mariem);
      g.add(this.mo.root); g.add(this.ma.root);
      this.placeCouch();
    }

    placeCouch() {
      this.mo.root.position.set(-79.5, 0.55, 1.5); this.ma.root.position.set(-80.5, 0.7, 1.5);
      this.mo.root.rotation.y = Math.PI; this.ma.root.rotation.y = Math.PI;
      this.pose = { mo: 'sit-arm', ma: 'sit' };
    }
    placeConcert() {
      this.mo.root.position.set(-0.7, 0, 2.6); this.ma.root.position.set(0.7, 0, 2.6);
      this.mo.root.rotation.y = Math.PI - 0.15; this.ma.root.rotation.y = Math.PI + 0.15;
      this.pose = { mo: 'dance', ma: 'dance' };
    }

    // which players are local and what they control
    roles() {
      const g = this.game;
      if (g.mode === 'solo') return { solo: true };
      return { solo: false };
    }

    startSong(i) {
      const sgn = SONGS[i];
      this.songIdx = i; this.phase = 'song'; this.phaseT = 0;
      this.group.remove(this.stage);
      this.stage = MM.Props.concertStage(sgn.artist, sgn.color); this.stage.position.set(0, 0, -12); this.group.add(this.stage);
      this.spot.color.set(sgn.color);
      MM.Audio.playMusic(sgn.id);
      // follow the music clock when audio is running; otherwise count frames (muted tabs, tests)
      const clk = MM.Audio.songClock();
      this.t0 = clk && MM.Audio.ctx && MM.Audio.ctx.state === 'running' ? clk.t0 : null;
      this.stepDur = clk ? clk.stepDur : 60 / 104 / 4;
      this.songT = 0;
      this.pw = 0.075 / this.stepDur; this.gw = 0.16 / this.stepDur; // timing windows, in steps
      // chart: eighth notes, seeded, each note belongs to one of them and is Left or Right
      const r = MM.rng(sgn.seed), notes = [];
      const total = sgn.bars * 16;
      for (let st = 16; st < total - 4; st += 2) {
        const strong = st % 8 === 0;
        if (r() < (strong ? 0.75 : 0.32)) notes.push({ step: st, who: r() < 0.5 ? 'mohamed' : 'mariem', dir: r() < 0.5 ? 'L' : 'R', state: 0 });
      }
      // in solo, one player taps every note, so thin the chart
      this.notes = this.game.mode === 'solo' ? notes.filter((n, k) => k % 2 === 0) : notes;
      this.songEnd = total;
      this.game.say(null, sgn.title + '. Left and right to the beat!', 2.4);
    }

    now() {
      const A = MM.Audio;
      if (A.ctx && this.t0 != null && A.ctx.state === 'running' && !MM.TEST_CLOCK) return (A.ctx.currentTime - this.t0) / this.stepDur;
      return this.songT / this.stepDur;
    }

    localWho() {
      const g = this.game;
      if (g.mode === 'online') return [g.myChar];
      return ['mohamed', 'mariem'];
    }

    update(dt, inputs) {
      this.phaseT += dt;
      const g = this.game;
      if (this.phase === 'couch') {
        this.tvGlow.intensity = 3.6 + Math.sin(this.phaseT * 9) * 0.8 + Math.sin(this.phaseT * 23) * 0.4;
        if (this.running) {
          ['mohamed', 'mariem'].forEach((w) => { const inp = inputs[w]; if (inp && (inp.love || inp.jump)) this.loveIn(w); });
          if (g.mode === 'solo' && (this.loves.mohamed || this.loves.mariem)) { this.loves.mohamed = this.loves.mariem = true; }
          if (this.loves.mohamed && this.loves.mariem && !this.kissT) this.kiss();
        }
        if (this.kissT != null) {
          this.kissT += dt;
          if (this.kissT > 4.8) { this.placeConcert(); this.phase = 'gap'; this.phaseT = 0; g.ui.cinemaText(null); }
        }
      } else if (this.phase === 'gap') {
        if (this.phaseT > 0.6) this.startSong(this.songIdx + 1);
      } else if (this.phase === 'song') {
        this.songT += dt;
        const now = this.now();
        const sim = this.localWho();
        sim.forEach((w) => {
          const inp = inputs[w] || (g.mode === 'solo' ? inputs.mohamed || inputs.mariem : null);
          if (!inp) return;
          const prev = this.prevMx[w] || 0;
          const L = inp.mx < -0.5 && prev >= -0.5, R = inp.mx > 0.5 && prev <= 0.5;
          this.prevMx[w] = inp.mx;
          if (L || R || inp.jump || inp.ability) this.tap(w, L ? 'L' : R ? 'R' : inp.jump ? 'R' : 'L', now);
        });
        // misses
        for (let i = 0; i < this.notes.length; i++) {
          const n = this.notes[i];
          if (n.state === 0 && now - n.step > this.gw && (g.mode === 'solo' || sim.indexOf(n.who) >= 0)) { n.state = -1; this.judgeIt(g.mode === 'solo' ? 'mariem' : n.who, 'm'); }
        }
        if (now > this.songEnd) {
          if (this.songIdx + 1 < SONGS.length) { this.phase = 'gap'; this.phaseT = -1.4; this.game.say('mariem', 'Hamaki next! I\'m not ready. I\'m SO ready.', 2.4); }
          else { this.phase = 'done'; this.finish(); }
        }
        // crowd bounce on the beat
        const beat = Math.abs(Math.sin(now / 4 * Math.PI));
        this.crowd.position.y = beat * 0.12; this.crowd2.position.y = beat * 0.1;
        this.stage.children.forEach((c) => { if (c.userData.beam) c.rotation.z = Math.sin(this.phaseT * 1.3 + c.position.x) * 0.35; });
      }
      const pm = this.pose.mo, pa = this.pose.ma;
      this.mo.update(dt, { grounded: true, pose: pm });
      this.ma.update(dt, { grounded: true, pose: pa });
      this.draw();
    }

    loveIn(w, fromNet) {
      if (this.loves[w]) return;
      this.loves[w] = true;
      MM.Audio.sfx('ready');
      const c = w === 'mohamed' ? this.mo : this.ma;
      this.game.fx.emit('hearts', c.root.position.clone().add(new T.Vector3(0, 1.6, 0)), { n: 5 });
      if (!fromNet) this.game.net.sendEv({ e: 'clove', w });
    }

    kiss() {
      this.kissT = 0;
      this.pose = { mo: 'sit', ma: 'sit' };
      this.mo.play('kiss', 3.5); this.ma.play('kiss', 3.5);
      this.mo.root.rotation.y = Math.PI + 0.6; this.ma.root.rotation.y = Math.PI - 0.6;
      MM.Audio.sfx('love');
      const mid = new T.Vector3(-80, 1.8, 1.5);
      this.game.fx.emit('hearts', mid, { n: 30 });
      setTimeout(() => this.game.fx.emit('hearts', mid, { n: 30 }), 700);
      this.game.ui.cinemaText('Their first kiss', 'The series finale · the best feeling of his life');
      MM.unlockMemory('firstkiss');
      const m = MM.MEMORIES.find((q) => q.id === 'firstkiss');
      if (m) this.game.ui.toast(m.title, m.text, false, true);
    }

    tap(w, dir, now, fromNet) {
      const g = this.game;
      let best = null, bd = 9;
      for (let i = 0; i < this.notes.length; i++) {
        const n = this.notes[i];
        if (n.state !== 0 || (g.mode !== 'solo' && n.who !== w)) continue;
        const d = Math.abs(n.step - now);
        if (d < bd) { bd = d; best = n; }
      }
      if (!best || bd > this.gw) return;
      if (best.dir !== dir) { best.state = -1; this.judgeIt(g.mode === 'solo' ? 'mariem' : w, 'm'); return; }
      best.state = 1;
      this.judgeIt(g.mode === 'solo' ? (best.who) : w, bd < this.pw ? 'p' : 'g');
    }

    judgeIt(w, j, fromNet) {
      const s = this.score[w];
      if (j === 'p') s.p++; else if (j === 'g') s.g++; else s.m++;
      if (j === 'm') s.combo = 0; else { s.combo++; s.best = Math.max(s.best, s.combo); }
      this.judge[w] = { j, t: performance.now() };
      const c = w === 'mohamed' ? this.mo : this.ma;
      if (j !== 'm') {
        if (j === 'p') this.game.fx.emit('notes', c.root.position.clone().add(new T.Vector3(0, 2, 0)), { color: w === 'mohamed' ? 0x5aa9ff : 0xff6f9c, n: 2 });
        if (s.combo && s.combo % 10 === 0) { c.play('spin', 0.6); this.game.fx.emit('hearts', c.root.position.clone().add(new T.Vector3(0, 1.8, 0)), { n: 6 }); }
      }
      if (!fromNet && this.game.mode === 'online') this.game.net.sendEv({ e: 'rh', w, j });
    }

    // the partner's tap result, judged on their device
    remote(w, j) {
      const now = this.now();
      let best = null, bd = this.gw + 1;
      this.notes.forEach((n) => { if (n.state === 0 && n.who === w && Math.abs(n.step - now) < bd) { bd = Math.abs(n.step - now); best = n; } });
      if (best) best.state = j === 'm' ? -1 : 1;
      this.judgeIt(w, j, true);
    }

    finish() {
      if (this.done) return;
      this.done = true;
      MM.unlockMemory('concerts');
      this.game.onGoal();
    }

    total() { const a = this.score.mohamed, b = this.score.mariem; const hit = a.p + a.g + b.p + b.g, all = hit + a.m + b.m; return { hit, all, pct: all ? Math.round((hit / all) * 100) : 0 }; }

    draw() {
      const cv = this.canvas;
      if (!cv) return;
      const show = this.phase === 'song' && this.running;
      cv.hidden = !show;
      if (!show) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = Math.min(window.innerWidth - 24, 560), H = Math.min(280, window.innerHeight * 0.42);
      if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); cv.style.width = W + 'px'; cv.style.height = H + 'px'; }
      const x = cv.getContext('2d');
      x.setTransform(dpr, 0, 0, dpr, 0, 0);
      x.clearRect(0, 0, W, H);
      const solo = this.game.mode === 'solo';
      const groups = solo ? [{ who: null, label: 'Both of you', col: '#ffcf6e' }] : [{ who: 'mohamed', label: 'Mohamed', col: '#5aa9ff' }, { who: 'mariem', label: 'Mariem', col: '#ff6f9c' }];
      const gw = W / groups.length, hitY = H - 46, now = this.now();
      const stepsVisible = LOOK / this.stepDur;
      groups.forEach((gr, gi) => {
        const ox = gi * gw;
        x.fillStyle = 'rgba(14,6,20,.72)'; roundRect(x, ox + 6, 0, gw - 12, H, 16); x.fill();
        ['L', 'R'].forEach((d, li) => {
          const lx = ox + gw * (li ? 0.68 : 0.32);
          x.strokeStyle = 'rgba(255,255,255,.12)'; x.lineWidth = 2; x.beginPath(); x.moveTo(lx, 12); x.lineTo(lx, hitY); x.stroke();
          x.strokeStyle = gr.col; x.lineWidth = 3; x.beginPath(); x.arc(lx, hitY, 20, 0, 7); x.stroke();
          x.fillStyle = 'rgba(255,255,255,.75)'; x.font = '800 15px ' + G.FONT; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(d === 'L' ? '◀' : '▶', lx, hitY);
          for (let i = 0; i < this.notes.length; i++) {
            const n = this.notes[i];
            if (n.state !== 0 || n.dir !== d || (gr.who && n.who !== gr.who)) continue;
            const k = (n.step - now) / stepsVisible;
            if (k > 1 || k < -0.2) continue;
            const y = hitY - k * (hitY - 14);
            x.fillStyle = solo ? (n.who === 'mohamed' ? '#5aa9ff' : '#ff6f9c') : gr.col;
            x.beginPath(); x.arc(lx, y, 15, 0, 7); x.fill();
            x.fillStyle = '#fff'; x.fillText(d === 'L' ? '◀' : '▶', lx, y + 1);
          }
        });
        const who = gr.who || 'mariem', s = gr.who ? this.score[gr.who] : { combo: this.score.mohamed.combo + this.score.mariem.combo };
        x.fillStyle = gr.col; x.font = '800 14px ' + G.FONT; x.textAlign = 'left'; x.fillText(gr.label, ox + 18, H - 14);
        x.textAlign = 'right'; x.fillStyle = '#fff'; x.fillText('combo ' + (s.combo || 0), ox + gw - 18, H - 14);
        const jd = this.judge[who] || (solo ? this.judge.mohamed : null);
        if (jd && performance.now() - jd.t < 600) {
          x.textAlign = 'center'; x.font = '800 22px ' + G.FONT;
          x.fillStyle = jd.j === 'p' ? '#ffcf6e' : jd.j === 'g' ? '#7ee0c3' : '#ff7a6b';
          x.fillText(jd.j === 'p' ? 'Perfect!' : jd.j === 'g' ? 'Good' : 'Miss', ox + gw / 2, hitY - 60);
        }
      });
    }

    progress() { if (this.phase === 'couch' || this.phase === 'gap' && this.songIdx < 0) return 0; const base = Math.max(0, this.songIdx) / SONGS.length; const now = this.phase === 'song' ? MM.clamp(this.now() / this.songEnd, 0, 1) : 1; return this.phase === 'done' ? 1 : base + now / SONGS.length; }

    camera(cam, dt, snap) {
      if (this.phase === 'couch') {
        const k = this.kissT != null ? MM.clamp(this.kissT / 3, 0, 1) : 0;
        cam.position.set(-80 + Math.sin(this.phaseT * 0.2) * 0.8, 2.7 - k * 0.7, -2.7 + k * 1.2);
        cam.lookAt(-80, 1.2 - k * 0.1, 1.5);
        return;
      }
      const a = Math.sin((this.phaseT || 0) * 0.25) * 0.35;
      cam.position.set(Math.sin(a) * 9, 4.2, 9.5 + Math.cos(a));
      cam.lookAt(0, 2.2, -4);
    }

    dispose() {
      this.game.scene.remove(this.group);
      this.game.scene.remove(this.sky);
      if (this.canvas) this.canvas.hidden = true;
    }
  }

  function roundRect(x, a, b, w, h, r) { x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); }

  MM.Concert = Concert;
  MM.CONCERT_SONGS = SONGS;
})(window.MM);
