/* Game orchestration: modes, cameras, simulation loop, story flow, cinematics and online sync. */
(function (MM) {
  'use strict';
  const T = THREE, G = MM.G, I = MM.Input;
  const STEP = 1 / 120;
  const other = (w) => (w === 'mohamed' ? 'mariem' : 'mohamed');

  class Game {
    constructor() {
      const r = (this.renderer = new T.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' }));
      r.outputColorSpace = T.SRGBColorSpace;
      r.toneMapping = T.ACESFilmicToneMapping; r.toneMappingExposure = 1.05;
      r.shadowMap.type = T.PCFSoftShadowMap;
      document.getElementById('stage').appendChild(r.domElement);
      this.scene = new T.Scene();
      this.cams = [new T.PerspectiveCamera(52, 1, 0.1, 1000), new T.PerspectiveCamera(52, 1, 0.1, 1000)];
      this.camSt = [{ pos: new T.Vector3(0, 6, 12), look: new T.Vector3() }, { pos: new T.Vector3(0, 6, 12), look: new T.Vector3() }];
      this.fx = new G.Particles(this.scene);
      this.net = MM.Net; this.ui = MM.UI;
      this.players = []; this.level = null; this.drive = null; this.concert = null; this.menu = null;
      this.kids = []; this.cut = null;
      this.state = 'boot'; this.mode = null; this.chapter = null;
      this.onlineChar = 'mohamed'; this.chapterMode = 'local'; this.lobbyCh = 1; this.myChar = 'mohamed';
      this.active = 0; this.shakeAmt = 0; this.acc = 0; this.netT = 0; this.hudT = 0; this.t = 0;
      this.ready = {}; this.stats = { hugs: 0 };
      this.cine = null;
      this.last = performance.now();
      this.applyQuality();
      this.resize();
      window.addEventListener('resize', () => this.resize());
      this.ui.init(this);
      this.bindNet();
      this.loop = this.loop.bind(this);
      window.__MM = this;
    }

    applyQuality() {
      this.quality = MM.save.settings.quality;
      const pr = Math.min(window.devicePixelRatio || 1, this.quality === 'high' ? 2 : 1.25);
      this.renderer.setPixelRatio(pr);
      this.renderer.shadowMap.enabled = this.quality === 'high';
      this.resize();
    }
    resize() { this.renderer.setSize(window.innerWidth, window.innerHeight, false); this.renderer.domElement.style.width = '100%'; this.renderer.domElement.style.height = '100%'; }

    ownsCrates() { return this.mode !== 'online' || this.myChar === 'mohamed'; }
    // the drive and the concert are full-screen mini-games with their own camera
    get mini() { return this.drive || this.concert; }
    split() { return this.mode === 'local' && MM.save.settings.camera !== 'shared' && this.state !== 'cinematic' && !this.mini && !this.cut; }
    player(who) { return this.players.find((p) => p.who === who); }

    /* ================= boot / menus ================= */
    boot() {
      this.buildMenu();
      this.state = 'title';
      this.ui.show('title');
      this.ui.fade(false);
      MM.Audio.playMusic('title');
      const m = location.search.match(/[?&]join=([A-Za-z0-9]{5})/);
      if (m) { this.ui.show('online'); this.ui.online.reset(); document.getElementById('join-code').value = m[1].toUpperCase(); }
      requestAnimationFrame(this.loop);
    }

    clearStage() {
      if (this.level) { this.level.dispose(); this.level = null; }
      if (this.drive) { this.drive.dispose(); this.drive = null; }
      if (this.concert) { this.concert.dispose(); this.concert = null; }
      this.kids.forEach((k) => this.scene.remove(k.m.root)); this.kids = [];
      this.cut = null; this.ui.cinemaText(null);
      if (this.menu) { this.scene.remove(this.menu.group); this.scene.remove(this.menu.sky); this.menu = null; }
      this.players.forEach((p) => p.removeFrom(this.scene));
      this.players = [];
      this.fx.clear();
      this.cams.forEach((c) => c.clearViewOffset());
      this.ui.clearSubs();
    }

    buildMenu(ending) {
      this.clearStage();
      const th = MM.THEMES.forever, sc = this.scene;
      sc.background = new T.Color(th.skyBottom);
      sc.fog = new T.Fog(th.fog, 30, 120);
      const sky = G.makeSky(ending ? '#2a1d55' : th.skyTop, ending ? '#ff9cc0' : th.skyBottom, { horizon: ending ? '#ffb3c8' : th.horizon, stars: ending ? 400 : 0 });
      sc.add(sky);
      const g = new T.Group(); sc.add(g);
      g.add(new T.HemisphereLight('#fff0f8', '#b3a0c8', 1.25));
      const sun = new T.DirectionalLight('#fff1e6', 2.2); sun.position.set(-8, 14, 10);
      if (this.quality === 'high') { sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); const c = sun.shadow.camera; c.left = -10; c.right = 10; c.top = 10; c.bottom = -10; }
      g.add(sun);
      const P = MM.Props;
      const top = G.mesh(new T.CylinderGeometry(7, 6.4, 1.2, 40), G.mat(ending ? '#b8e6a8' : '#9edc9a', { r: 0.95 }), 0, -0.6, 0, g);
      top.receiveShadow = true;
      const under = G.mesh(new T.ConeGeometry(6.3, 7, 10), G.mat('#c7a37a', { flat: true }), 0, -4.7, 0, g); under.rotation.x = Math.PI;
      const add = (o, x, y, z, ry, s) => { o.position.set(x, y, z); if (ry) o.rotation.y = ry; if (s) o.scale.setScalar(s); g.add(o); return o; };
      add(P.tree(4, '#ffb3d1'), -4, 0, -3); add(P.tree(3, '#ffc9de'), 4.5, 0, -2.8);
      add(P.lampPost('#ffd88a'), 3.2, 0, 1.8, 0, 0.8);
      add(P.heartBalloon('#ff6f9c'), -2.4, 0, 1.2); add(P.heartBalloon('#ffcf6e'), -2.9, 0.2, 0.6);
      for (let i = 0; i < 26; i++) { const a = (i / 26) * Math.PI * 2; add(P.flower(['#ff6f9c', '#ffffff', '#ffcf6e'][i % 3]), Math.cos(a) * 6.2, 0, Math.sin(a) * 6.2); }
      if (ending) { add(P.weddingArch(), 0, 0, -1.6, 0, 1); add(P.cake(), 3.6, 0, -1.2, 0, 0.9); }
      else { const bench = new T.Group(); P.bx(bench, 2.4, 0.12, 0.7, '#b98a56', 0, 0.5, 0); P.bx(bench, 2.4, 0.6, 0.1, '#b98a56', 0, 0.85, -0.32); [-1, 1].forEach((s) => P.bx(bench, 0.1, 0.5, 0.6, '#5c4636', s * 1.1, 0.25, 0)); add(bench, 0, 0, -2.4); }
      for (let i = 0; i < 9; i++) { const c = P.cloud(1 + (i % 3) * 0.5); add(c, Math.cos(i * 0.7) * 16, -6 + (i % 4) * 2.5, Math.sin(i * 0.7) * 16 - 4); }
      const o = MM.save.settings.outfit;
      const mo = MM.Characters.create('mohamed', o.mohamed), ma = MM.Characters.create('mariem', o.mariem);
      mo.root.position.set(-0.75, 0, 0.6); mo.root.rotation.y = 0.35; ma.root.position.set(0.7, 0, 0.6); ma.root.rotation.y = -0.4;
      g.add(mo.root); g.add(ma.root);
      const chars = [mo, ma];
      if (ending) {
        const girl = MM.Characters.create('girl'), boy = MM.Characters.create('boy');
        girl.root.position.set(-1.9, 0, 1.6); girl.root.rotation.y = 0.5; boy.root.position.set(1.9, 0, 1.7); boy.root.rotation.y = -0.5;
        g.add(girl.root); g.add(boy.root); chars.push(girl, boy);
      }
      chars.forEach((c) => c.root.traverse((q) => { if (q.isMesh) q.castShadow = true; }));
      this.menu = { group: g, sky, chars, t: 0, nextAct: 2, ending: !!ending, fwT: 1 };
    }
    refreshMenuChars() { if (this.menu && this.state === 'title') this.buildMenu(false); }

    updateMenu(dt) {
      const m = this.menu;
      m.t += dt;
      const a = m.t * 0.07;
      const cam = this.cams[0];
      const R = m.ending ? 10 : 12.5;
      cam.position.set(Math.sin(a) * R, 4.6 + Math.sin(m.t * 0.3) * 0.4, Math.cos(a) * R);
      cam.lookAt(0, 1.3, 0);
      const w = window.innerWidth, h = window.innerHeight;
      if (m.ending) cam.setViewOffset(w, h, 0, h * 0.3, w, h);
      else if (w / h > 1.15) cam.setViewOffset(w, h, -w * 0.2, 0, w, h); else cam.clearViewOffset();
      m.group.children.forEach((c) => { if (c.userData.cloud) c.position.y += Math.sin(m.t + c.position.x) * 0.002; });
      m.nextAct -= dt;
      if (m.nextAct <= 0) {
        m.nextAct = 2.5 + Math.random() * 2.5;
        const c = m.chars[Math.floor(Math.random() * m.chars.length)];
        c.play(['wave', 'love', 'celebrate', 'spin'][Math.floor(Math.random() * 4)], 1.2);
        if (Math.random() < 0.5) this.fx.emit('hearts', c.root.position.clone().add(new T.Vector3(0, 1.8, 0)), { n: 3 });
      }
      m.chars.forEach((c) => c.update(dt, { grounded: true, pose: 'idle-cute' }));
      if (m.ending) {
        m.fwT -= dt;
        if (m.fwT <= 0) { m.fwT = 0.7 + Math.random() * 0.9; this.fx.emit('firework', new T.Vector3((Math.random() - 0.5) * 16, 8 + Math.random() * 5, -6 - Math.random() * 6)); MM.Audio.sfx('firework'); }
      }
    }

    /* ================= actions from the UI ================= */
    action(act, el) {
      const ui = this.ui;
      switch (act) {
        case 'local': ui.show('local'); break;
        case 'solo': this.chapterMode = 'solo'; ui.show('chapters'); break;
        case 'online':
          ui.show('online'); ui.online.reset();
          if (!this.net.available()) ui.online.msg('Online play needs the website version of this game (see the README). Here you can play together on one screen, or solo.', 'err');
          break;
        case 'chapters': this.chapterMode = 'local'; ui.show('chapters'); break;
        case 'chapters-local': this.chapterMode = 'local'; ui.show('chapters'); break;
        case 'album': if (this.state === 'ending') { this.buildMenu(false); this.state = 'title'; MM.Audio.playMusic('title'); } ui.show('album'); break;
        case 'howto': ui.show('howto'); break;
        case 'timeline': if (this.state === 'ending') { this.buildMenu(false); this.state = 'title'; MM.Audio.playMusic('title'); } ui.show('timeline'); break;
        case 'settings': ui.show('settings'); break;
        case 'back': if (ui.current() === 'online') { this.net.close(); ui.online.reset(); } ui.back(); break;
        case 'start-local': this.startGame('local', this.firstUnfinished()); break;
        case 'host':
          ui.online.msg('Creating a room…');
          this.net.host((code) => {
            ui.online.lobby(code, true); ui.online.msg('');
            ui.online.status('Share the code with your partner. Waiting for them to join…');
            ui.online.roles(this.onlineChar, other(this.onlineChar), false);
            this.lobbyCh = this.firstUnfinished(); ui.online.chapters(this.lobbyCh);
          });
          break;
        case 'join': {
          const code = document.getElementById('join-code').value;
          ui.online.msg('Connecting…');
          this.net.join(code);
          break;
        }
        case 'copy-code': {
          const text = 'Play Mohamed & Mariem with me! Room code: ' + this.net.code + ' · ' + this.net.inviteLink();
          const done = () => ui.online.status('Invite copied. Send it to your partner.', 'ok');
          try { navigator.clipboard.writeText(text).then(done, () => ui.online.status('Your code is ' + this.net.code)); } catch (e) { ui.online.status('Your code is ' + this.net.code); }
          break;
        }
        case 'swap-roles': this.onlineChar = other(this.onlineChar); ui.renderWho(); ui.online.roles(this.onlineChar, other(this.onlineChar), this.net.connected); this.sendLobby(); break;
        case 'online-go': if (this.net.connected) { this.startGame('online', this.lobbyCh); } break;
        case 'pick-song': document.getElementById('song-file').click(); break;
        case 'clear-song': MM.media.set('song', null); MM.Audio.clearCustomSong(); document.getElementById('clear-song').hidden = true; break;
        case 'reset-progress':
          if (el.dataset.armed) { MM.resetSave(); el.textContent = 'Progress reset'; delete el.dataset.armed; }
          else { el.dataset.armed = '1'; el.textContent = 'Tap again to erase everything'; setTimeout(() => { if (el.dataset.armed) { delete el.dataset.armed; el.textContent = 'Reset progress'; } }, 4000); }
          break;
        case 'resume': this.resume(); break;
        case 'regroup': this.regroup(); this.net.sendEv({ e: 'regroup' }); this.resume(); break;
        case 'reset-crates': if (this.level) { this.level.resetCrates(); this.net.sendEv({ e: 'crates' }); } this.resume(); break;
        case 'restart': this.restartChapter(); break;
        case 'skip': this.resume(); this.onGoal(true); break;
        case 'quit': this.quitToTitle(true); break;
        case 'next': this.nextChapter(); break;
        default: break;
      }
    }

    firstUnfinished() {
      for (let i = 0; i < MM.CHAPTERS.length; i++) { const c = MM.CHAPTERS[i]; if (!(MM.save.chapters[c.id] && MM.save.chapters[c.id].done)) return Math.min(c.num, MM.save.unlocked); }
      return 1;
    }
    pickChapter(num) { this.startGame(this.chapterMode, num); }
    lobbyChapter(n) { this.lobbyCh = n; this.sendLobby(); }

    startGame(mode, num) {
      this.mode = mode;
      if (mode === 'online') {
        this.myChar = this.net.role === 'host' ? this.onlineChar : this.myChar;
        if (this.net.role === 'host') this.net.send({ t: 'start', ch: num, hostChar: this.onlineChar });
      }
      this.ui.clearHistory();
      this.startChapter(num);
    }

    /* ================= chapters ================= */
    startChapter(num) {
      MM.Audio.init();
      this.ui.fade(true);
      this.ui.hud(false); this.ui.divider(false); this.ui.touch(false);
      const def = MM.chapterByNum(num);
      setTimeout(() => {
        this.clearStage();
        this.chapter = def;
        this.chapterTime = 0;
        this.ready = {};
        this.active = 0;
        this.storyT = 0;
        this.cine = null;
        const o = Object.assign({}, MM.save.settings.outfit, def.outfit || {});
        if (def.type === 'drive') {
          this.drive = new MM.Drive(this, def);
          this.drive.camera(this.cams[0], 0, true);
        } else if (def.type === 'concert') {
          this.concert = new MM.Concert(this, def);
          this.concert.camera(this.cams[0], 0, true);
        } else {
          this.level = new MM.Level(this, def);
          ['mohamed', 'mariem'].forEach((w) => {
            const p = new MM.Player(this, w, o[w], { scale: def.scale });
            if (def.umbrella && w === 'mohamed') p.umbrella = true;
            p.local = this.mode !== 'online' || w === this.myChar;
            p.addTo(this.scene, this.level);
            p.place(this.level.respawnPoint(w));
            p.yaw = 0.4 * (w === 'mohamed' ? 1 : -1);
            this.players.push(p);
          });
          if (this.mode === 'solo') this.active = 0;
          if (this.mode === 'local') { const p1 = MM.save.lastLocal.p1; this.players.sort((a, b) => (a.who === p1 ? -1 : b.who === p1 ? 1 : 0)); }
          if (def.kids) this.spawnKids();
        }
        MM.Audio.playMusic(def.music);
        this.state = 'story';
        const roles = def.type === 'drive' ? { mohamed: 'drives', mariem: 'radio' } : def.type === 'concert' ? { mohamed: 'blue notes', mariem: 'pink notes' } : null;
        this.ui.story(def, this.mode, roles);
        this.ui.fade(false);
        I.capture = true;
        this.blur();
      }, 450);
    }

    blur() { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); }

    readyClick(who) {
      if (this.state !== 'story') return;
      if (this.mode === 'solo') { this.go(); return; }
      if (this.mode === 'online') { if (who === this.myChar) this.setReady(who, true, true); return; }
      this.setReady(who, !this.ready[who], false);
    }
    setReady(who, on, send) {
      if (this.state !== 'story') return;
      if (this.ready[who] === on) return;
      this.ready[who] = on;
      this.ui.setReady(who, on);
      if (on) MM.Audio.sfx('ready');
      if (send) this.net.send({ t: 'ready', who });
      if (this.ready.mohamed && this.ready.mariem) {
        if (this.mode !== 'online') this.go();
        else if (this.net.role === 'host') { this.net.send({ t: 'go', snap: this.level ? this.level.snapshot() : null }); this.go(); }
      }
    }

    go() {
      if (this.state !== 'story') return;
      this.ui.hideAll();
      this.state = 'play';
      this.ui.hud(true);
      this.ui.divider(this.split());
      this.ui.touch(I.isTouch() && this.mode !== 'local', this.mode === 'solo');
      this.updateChips();
      this.blur();
      if (this.drive) { this.drive.running = true; this.ui.driveHud(this.drive); }
      else { this.ui.meter(null); this.ui.counterChip(null); document.getElementById('hud-counter').style.color = ''; }
      if (this.concert) { this.concert.running = true; this.ui.counts(null); }
      this.snapCams();
      MM.Audio.resumeCustom();
    }

    restartChapter() {
      if (this.mode === 'online') { if (this.net.role !== 'host') return; this.net.send({ t: 'start', ch: this.chapter.num, hostChar: this.onlineChar }); }
      this.startChapter(this.chapter.num);
    }

    nextChapter() {
      if (this.mode === 'online' && this.net.role !== 'host') return;
      const n = this.chapter.num + 1;
      if (n > MM.CHAPTERS.length) { this.showEnding(); if (this.mode === 'online') this.net.send({ t: 'ending' }); return; }
      if (this.mode === 'online') this.net.send({ t: 'start', ch: n, hostChar: this.onlineChar });
      this.startChapter(n);
    }

    quitToTitle(send) {
      if (this.mode === 'online') { if (send) this.net.send({ t: 'quit' }); setTimeout(() => this.net.close(), 200); }
      this.mode = null; this.chapter = null;
      I.capture = false;
      this.ui.hud(false); this.ui.divider(false); this.ui.touch(false);
      this.ui.fade(true);
      setTimeout(() => {
        this.buildMenu(false);
        this.state = 'title';
        this.ui.clearHistory();
        this.ui.show('title');
        this.ui.fade(false);
        MM.Audio.playMusic('title');
      }, 400);
    }

    showEnding() {
      I.capture = false;
      this.ui.hud(false); this.ui.divider(false); this.ui.touch(false);
      this.ui.fade(true);
      setTimeout(() => {
        this.buildMenu(true);
        this.state = 'ending';
        this.ui.show('ending');
        this.ui.fade(false);
        MM.Audio.playMusic('ending');
      }, 500);
    }

    pause() {
      if (this.state !== 'play') return;
      this.state = 'paused';
      this.ui.pause(this.chapter, this.mode === 'online', this.net.role === 'host');
      I.capture = false;
    }
    resume() {
      if (this.state !== 'paused') return;
      this.ui.hideAll();
      this.state = 'play';
      I.capture = true;
      this.blur();
    }

    regroup() {
      if (!this.level) return;
      this.players.forEach((p) => { if (p.local) p.respawn(false); });
    }

    /* ================= gameplay hooks ================= */
    onTake(it, who, fromNet) {
      if (!fromNet) this.net.sendEv({ e: 'take', id: it.id, who });
      if (it.kind === 'memory') {
        const m = MM.MEMORIES.find((q) => q.id === it.mem);
        MM.unlockMemory(it.mem);
        if (m) this.ui.toast(m.title, m.text, false, true);
      }
      this.hudT = 0;
    }
    onBreak(id) { this.net.sendEv({ e: 'break', id }); }
    onCheckpoint(i) { this.net.sendEv({ e: 'cp', i }); this.ui.toast('', 'Checkpoint', true); }
    onFell() {}
    say(who, text, dur) { this.ui.say(who, text, dur); }
    shake(a) { this.shakeAmt = Math.max(this.shakeAmt, a); }
    slam(p) { if (this.level) this.level.slamAt(p.body.x, p.body.y, p.body.z); }
    fireworks(pos, n) {
      for (let i = 0; i < (n || 3); i++) setTimeout(() => { this.fx.emit('firework', pos.clone().add(new T.Vector3((Math.random() - 0.5) * 8, Math.random() * 3, (Math.random() - 0.5) * 4))); MM.Audio.sfx('firework'); }, i * 450);
    }
    toss(from, to, fx, fz) {
      this.fx.emit('sparkle', from.headPos(), { n: 8, color: 0x5aa9ff });
      if (to.local) to.receiveToss(fx, fz);
      else this.net.sendEv({ e: 'toss', fx, fz });
    }
    hug(a, b) {
      const face = (p, q) => { p.yaw = Math.atan2(q.body.x - p.body.x, q.body.z - p.body.z); };
      face(a, b); face(b, a);
      a.model.play('hug', 1.3); b.model.play('hug', 1.3);
      const mid = new T.Vector3((a.body.x + b.body.x) / 2, Math.max(a.body.y, b.body.y) + 1.8, (a.body.z + b.body.z) / 2);
      this.fx.emit('hearts', mid, { n: 12 });
      MM.Audio.sfx('love');
      this.stats.hugs++;
      if (!b.local) this.net.sendEv({ e: 'hug' });
    }

    // Solo convenience: bring the partner over when there is a clear, walkable path.
    callPartner() {
      const a = this.players[this.active], b = this.players[1 - this.active];
      if (!a || !b || !this.level) return;
      const A = a.body, B = b.body;
      const dist = Math.hypot(A.x - B.x, A.z - B.z);
      if (dist < 2.5) return;
      if (dist > 24 || Math.abs(A.y - B.y) > 1.2 || !A.grounded || !this.walkable(B, A)) { this.say(a.who, 'Hmm, ' + MM.CHARS[b.who].name + ' can\'t get here from there.', 2); return; }
      const off = new T.Vector3(-a.facing.x, 0, -a.facing.y).multiplyScalar(1.1);
      b.place(new T.Vector3(A.x + off.x, A.y + 0.05, A.z + off.z));
      MM.Audio.sfx('respawn'); this.fx.emit('hearts', b.headPos(), { n: 5 });
    }
    walkable(B, A) {
      const solids = this.level.solids;
      const n = Math.ceil(Math.hypot(A.x - B.x, A.z - B.z) / 0.4);
      const y = Math.max(A.y, B.y);
      for (let i = 1; i < n; i++) {
        const t = i / n, x = B.x + (A.x - B.x) * t, z = B.z + (A.z - B.z) * t;
        const gy = MM.Physics.groundBelow(solids, x, z, y + 0.3, 0.4);
        if (gy < y - 0.9) return false;
        for (let k = 0; k < solids.length; k++) {
          const s = solids[k];
          if (!s.active || s.oneWay || s.acc) continue;
          if (x > s.x0 && x < s.x1 && z > s.z0 && z < s.z1 && ((y + 0.5 > s.y0 && y + 0.5 < s.y1) || (y + 1.7 > s.y0 && y + 1.7 < s.y1))) return false;
        }
      }
      return true;
    }

    // Seesaw and similar launches: if the launched player lives on the other device, tell it.
    launch(q, vy, fx, fz) {
      if (q.local) q.receiveToss(fx, fz, vy);
      else this.net.sendEv({ e: 'launch', vy, fx, fz });
    }
    photoFlash() {
      const f = document.getElementById('flash');
      if (f) { f.classList.remove('go'); void f.offsetWidth; f.classList.add('go'); }
      MM.Audio.sfx('shutter');
    }

    // A short scripted moment inside a chapter: players freeze, the camera circles, lines play.
    cutscene(o) {
      if (this.cut || this.state !== 'play') return;
      const c = (this.cut = Object.assign({ t: 0, dur: 4, said: 0, dist: 6.5, h: 2.6, ang: 0 }, o));
      if (o.at) c.center = new T.Vector3().fromArray(o.at);
      else { const [a, b] = this.players; c.center = new T.Vector3((a.body.x + b.body.x) / 2, Math.max(a.body.y, b.body.y), (a.body.z + b.body.z) / 2); }
      this.players.forEach((p) => { p.body.vx = p.body.vz = 0; });
      this.ui.divider(false); this.ui.hud(false); this.ui.touch(false);
      if (o.title) this.ui.cinemaText(o.title, o.sub);
      if (o.start) o.start(this, c);
    }
    updateCut(dt) {
      const c = this.cut;
      c.t += dt;
      const lines = c.lines || [];
      while (c.said < lines.length && c.t >= lines[c.said][0]) { const ln = lines[c.said++]; this.say(ln[1], ln[2], ln[3]); }
      if (c.tick) c.tick(c.t, dt, this);
      const cam = this.cams[0], a = c.ang + c.t * 0.12;
      cam.position.set(c.center.x + Math.sin(a) * c.dist, c.center.y + c.h, c.center.z + Math.cos(a) * c.dist);
      cam.lookAt(c.center.x, c.center.y + 1.1, c.center.z);
      if (c.t >= c.dur) {
        this.cut = null;
        this.ui.cinemaText(null);
        if (c.end) c.end(this);
        this.ui.divider(this.split()); this.ui.hud(true); this.ui.touch(I.isTouch() && this.mode !== 'local', this.mode === 'solo');
        this.updateCams(0, true);
      }
    }

    // Their future kids follow them around in the last chapter.
    spawnKids() {
      this.kids = [['girl', 'mariem', 1], ['boy', 'mohamed', -1]].map(([k, follow, side]) => {
        const m = MM.Characters.create(k);
        const p = this.player(follow);
        m.root.position.set(p.body.x - 1.2, p.body.y, p.body.z + side * 0.9);
        m.root.traverse((q) => { if (q.isMesh) q.castShadow = true; });
        this.scene.add(m.root);
        return { m, follow, side, hop: 0 };
      });
    }
    updateKids(dt) {
      this.kids.forEach((k) => {
        const p = this.player(k.follow), r = k.m.root;
        if (!p) return;
        const tx = p.body.x - 1.3, tz = p.body.z + k.side * 0.8;
        const dx = tx - r.position.x, dz = tz - r.position.z, d = Math.hypot(dx, dz);
        let sp = 0;
        if (d > 9) { r.position.set(tx, p.body.y, tz); }
        else if (d > 0.35) { sp = Math.min(6.5, d * 3); r.position.x += (dx / d) * sp * dt; r.position.z += (dz / d) * sp * dt; r.rotation.y = MM.angleDamp(r.rotation.y, Math.atan2(dx, dz), 10, dt); }
        else r.rotation.y = MM.angleDamp(r.rotation.y, p.yaw, 4, dt);
        const gy = p.body.grounded ? p.body.y : r.position.y;
        r.position.y = MM.damp(r.position.y, gy, 8, dt);
        k.m.update(dt, { speed: sp, maxSpeed: 4, grounded: true });
      });
    }

    // End-of-chapter moments. Each chapter names its finale in levels.js.
    finale(f, cine) {
      const mo = this.player('mohamed'), ma = this.player('mariem');
      const face = (p, q) => { p.yaw = Math.atan2(q.body.x - p.body.x, q.body.z - p.body.z); };
      const stage = () => {
        if (!f.at) return;
        const [x, y, z] = f.at, gap = f.gap || 1.4;
        mo.place(new T.Vector3(x - gap / 2, y, z)); ma.place(new T.Vector3(x + gap / 2, y, z));
        cine.center.set(x, y, z);
      };
      const lines = f.lines || [];
      let said = 0;
      const sayLines = (t) => { while (said < lines.length && t >= lines[said][0]) { const ln = lines[said++]; this.say(ln[1], ln[2], ln[3]); } };
      cine.dur = f.dur || (lines.length ? Math.max(4, lines[lines.length - 1][0] + 2.6) : 4);
      if (f.title) this.ui.cinemaText(f.title, f.sub);
      const kind = f.kind || 'celebrate';
      if (kind === 'kneel') {
        stage(); face(mo, ma); face(ma, mo);
        mo.pose = null; mo.model.play('kneel', 99); ma.model.play('shy', 99);
        const ring = MM.Props.collectible('ring'); ring.scale.setScalar(0.9);
        ring.position.set(mo.body.x + Math.sin(mo.yaw) * 0.6, mo.body.y + 1.0, mo.body.z + Math.cos(mo.yaw) * 0.6);
        this.scene.add(ring); cine.extra = [ring];
        cine.tick = (t, dt) => {
          ring.rotation.y += dt * 2; sayLines(t);
          if (t > (f.yesAt || 3.6) && !cine.s2) { cine.s2 = 1; mo.model.play('celebrate', 3); ma.model.play('celebrate', 3); this.fireworks(new T.Vector3(cine.center.x, cine.center.y + 9, cine.center.z - 14), 6); this.fx.emit('hearts', cine.center.clone().add(new T.Vector3(0, 2, 0)), { n: 24 }); }
        };
      } else if (kind === 'cap') {
        stage();
        ma.model.play('celebrate', 4); mo.model.play('celebrate', 4);
        const cap = MM.Props.gradCap(); cap.position.set(ma.body.x, ma.body.y + 1.4, ma.body.z); this.scene.add(cap); cine.extra = [cap];
        let vy = 9;
        cine.tick = (t, dt) => { vy -= 12 * dt; cap.position.y = Math.max(ma.body.y + 1.35, cap.position.y + vy * dt); cap.rotation.y += dt * 6; cap.rotation.x += dt * 3; sayLines(t); if (t > 0.3 && !cine.s1) { cine.s1 = 1; this.fx.emit('confetti', cine.center.clone().add(new T.Vector3(0, 3, 0)), { n: 100, w: 8 }); } };
      } else if (kind === 'kids') {
        stage(); face(mo, ma); face(ma, mo); mo.model.play('hug', 99); ma.model.play('hug', 99);
        let girl, boy;
        if (this.kids.length) { girl = this.kids[0].m; boy = this.kids[1].m; this.kids = []; }
        else { girl = MM.Characters.create('girl'); boy = MM.Characters.create('boy'); this.scene.add(girl.root); this.scene.add(boy.root); }
        const start = cine.center.clone().add(new T.Vector3(-7, 0, 0));
        girl.root.position.copy(start).add(new T.Vector3(0, 0, -0.8)); boy.root.position.copy(start).add(new T.Vector3(-0.6, 0, 0.8));
        girl.root.rotation.y = boy.root.rotation.y = Math.PI / 2;
        cine.extra = [girl.root, boy.root];
        cine.tick = (t, dt) => {
          [girl, boy].forEach((k, i) => {
            const target = cine.center.x - 1.4 - i * 0.5;
            const moving = k.root.position.x < target;
            if (moving) k.root.position.x += dt * 3.2;
            k.update(dt, { speed: moving ? 3.2 : 0, maxSpeed: 4, grounded: true });
            if (!moving && !k.done) { k.done = true; k.play('celebrate', 3); }
          });
          sayLines(t);
          if (t > 3 && !cine.s2) { cine.s2 = 1; mo.model.play('celebrate', 4); ma.model.play('celebrate', 4); this.fireworks(cine.center.clone().add(new T.Vector3(0, 8, -8)), 7); this.fx.emit('confetti', cine.center.clone().add(new T.Vector3(0, 3, 0)), { n: 120, w: 10 }); }
        };
      } else if (kind === 'pose') {
        // seat her on the side his arm reaches toward (the arm points along the model's local +x)
        if (f.at && !f.place) {
          const [x, y, z] = f.at, g2 = (f.gap || 0.9) / 2, ax = Math.cos(f.yaw || 0), az = -Math.sin(f.yaw || 0);
          mo.place(new T.Vector3(x - ax * g2, y, z - az * g2)); ma.place(new T.Vector3(x + ax * g2, y, z + az * g2));
          cine.center.set(x, y, z);
        }
        mo.pose = f.poses.mohamed; ma.pose = f.poses.mariem;
        mo.yaw = ma.yaw = f.yaw || 0;
        if (f.place) { mo.place(new T.Vector3().fromArray(f.place.mohamed)); ma.place(new T.Vector3().fromArray(f.place.mariem)); }
        this.fx.emit('hearts', cine.center.clone().add(new T.Vector3(0, 2, 0)), { n: 14 });
        cine.tick = (t) => { sayLines(t); if (f.fireworks && t > 1.5 && !cine.s1) { cine.s1 = 1; this.fireworks(cine.center.clone().add(new T.Vector3(0, 8, -10)), 5); } };
      } else if (kind === 'hug' || kind === 'pray' || kind === 'kiss') {
        stage(); face(mo, ma); face(ma, mo);
        const act = kind === 'pray' ? null : kind;
        if (kind === 'pray') { mo.yaw = ma.yaw = f.yaw || 0; mo.pose = ma.pose = 'pray'; }
        else { mo.model.play(act, 99); ma.model.play(act, 99); }
        this.fx.emit('hearts', cine.center.clone().add(new T.Vector3(0, 2, 0)), { n: 18 });
        cine.tick = (t) => { sayLines(t); if (t > 1.6 && !cine.s1) { cine.s1 = 1; this.fx.emit('hearts', cine.center.clone().add(new T.Vector3(0, 2.2, 0)), { n: 14 }); if (f.fireworks) this.fireworks(cine.center.clone().add(new T.Vector3(0, 8, -8)), 4); } };
      } else {
        stage();
        mo.model.play('celebrate', 3); ma.model.play('celebrate', 3);
        this.fx.emit('confetti', cine.center.clone().add(new T.Vector3(0, 3, 0)), { n: 90, w: 7 });
        if (f.fireworks) this.fireworks(cine.center.clone().add(new T.Vector3(0, 7, -6)), 4);
        cine.tick = (t) => sayLines(t);
      }
    }

    onGoal(skip) {
      if (this.state !== 'play' && !skip) return;
      if (this.mode === 'online' && this.net.role !== 'host') { this.net.send({ t: 'goalReq' }); return; }
      if (this.mode === 'online') this.net.sendEv({ e: 'goal' });
      this.completeChapter();
    }

    completeChapter() {
      if (this.state === 'cinematic' || this.state === 'complete') return;
      if (this.state === 'paused') this.ui.hideAll();
      const def = this.chapter;
      this.state = 'cinematic';
      I.capture = false;
      this.ui.hud(false); this.ui.divider(false); this.ui.touch(false);
      MM.Audio.sfx('complete');
      this.ui.clearSubs();
      if (this.level && this.level.goal) this.level.goal.grp.visible = false;
      const cine = (this.cine = { t: 0, dur: 4, center: new T.Vector3() });
      if (this.mini) {
        const M = this.mini;
        if (this.drive) cine.center.set(this.drive.x, 1, this.drive.z); else cine.center.set(0, 1, 2.6);
        M.mo.play('celebrate', 3); M.ma.play('celebrate', 3);
        this.fx.emit('confetti', cine.center.clone().add(new T.Vector3(0, 2, -2)), { n: 90, w: 8 });
        if (this.concert) this.fireworks(new T.Vector3(0, 9, -10), 5);
        [].concat(def.memoryOnFinish || []).forEach((id) => { MM.unlockMemory(id); const m = MM.MEMORIES.find((q) => q.id === id); if (m) this.ui.toast(m.title, m.text, false, true); });
      } else {
        const [a, b] = this.players;
        a.frozen = b.frozen = true;
        cine.center.set((a.body.x + b.body.x) / 2, Math.max(a.body.y, b.body.y), (a.body.z + b.body.z) / 2);
        this.finale(def.finale || {}, cine);
      }
      // save progress
      const rec = MM.save.chapters[def.id] || {};
      const hearts = this.level ? this.level.items.filter((i) => i.kind === 'heart' && i.taken).length : 0;
      rec.done = true; rec.hearts = Math.max(rec.hearts || 0, hearts); rec.time = rec.time ? Math.min(rec.time, this.chapterTime) : this.chapterTime;
      MM.save.chapters[def.id] = rec;
      MM.save.unlocked = Math.max(MM.save.unlocked, Math.min(MM.CHAPTERS.length, def.num + 1));
      MM.writeSave();
    }

    finishCinematic() {
      const def = this.chapter, c = this.cine;
      if (c && c.extra) c.extra.forEach((o) => this.scene.remove(o));
      this.cine = null;
      this.ui.cinemaText(null);
      this.state = 'complete';
      const L = this.level;
      const hearts = L ? L.items.filter((i) => i.kind === 'heart' && i.taken).length + ' / ' + L.heartsTotal : this.drive ? this.drive.notesHit + ' notes' : this.concert ? this.concert.total().pct + '% on beat' : '-';
      const mems = L ? L.items.filter((i) => i.kind === 'memory' && i.taken).length + ' / ' + L.memTotal : '1 / 1';
      const host = this.mode !== 'online' || this.net.role === 'host';
      this.ui.complete(def, { hearts, mems, time: this.chapterTime }, host, host ? '' : 'Waiting for your partner to continue…');
    }

    /* ================= online ================= */
    sendLobby() { if (this.net.role === 'host') { this.net.send({ t: 'lobby', hostChar: this.onlineChar, ch: this.lobbyCh, title: (MM.chapterByNum(this.lobbyCh) || {}).title }); this.ui.online.roles(this.onlineChar, other(this.onlineChar), this.net.connected); } }

    bindNet() {
      const N = this.net, ui = this.ui;
      N.on('connected', () => {
        if (N.role === 'host') { ui.online.status('Your partner joined! Pick a chapter and press Start.', 'ok'); ui.online.canStart(true); this.sendLobby(); }
        else { ui.online.lobby(N.code, false); ui.online.msg(''); ui.online.status('Connected! Waiting for your partner to start…', 'ok'); N.send({ t: 'hello' }); }
      });
      N.on('lost', () => {
        if (this.mode === 'online' && this.state !== 'title') { ui.toast('', 'Connection to your partner was lost. Back to the title in a moment.', true); setTimeout(() => { if (this.mode === 'online') this.quitToTitle(false); }, 2500); }
        else { ui.online.status('Your partner disconnected.', 'err'); ui.online.canStart(false); }
      });
      N.on('error', (msg) => { if (ui.current() === 'online') { ui.online.msg(msg, 'err'); ui.online.status(msg, 'err'); } else ui.toast('', msg, true); });
      N.on('msg', (d) => this.onNet(d));
    }

    onNet(d) {
      const ui = this.ui;
      switch (d.t) {
        case 'hello': this.sendLobby(); break;
        case 'full': ui.online.msg('That room already has two players.', 'err'); this.net.close(); break;
        case 'lobby':
          this.myChar = other(d.hostChar);
          ui.online.roles(this.myChar, d.hostChar, true);
          ui.online.status('Connected! Your partner picked chapter ' + d.ch + (d.title ? ' · ' + d.title : '') + '. Waiting for them to start…', 'ok');
          break;
        case 'start':
          if (this.net.role === 'guest') { this.myChar = other(d.hostChar); this.mode = 'online'; this.ui.clearHistory(); this.startChapter(d.ch); }
          break;
        case 'ready': this.setReady(d.who, true, false); break;
        case 'go': if (this.state === 'story') { this.go(); if (d.snap && this.level) this.level.applySnapshot(d.snap); } else this.pendingGo = d; break;
        case 'goalReq': if (this.net.role === 'host' && (this.state === 'play' || this.state === 'paused')) this.onGoal(true); break;
        case 'ending': this.showEnding(); break;
        case 'quit': if (this.mode === 'online') { ui.toast('', 'Your partner went back to the title.', true); this.quitToTitle(false); } break;
        case 'st': this.applyRemoteState(d); break;
        case 'ev': this.onNetEvent(d); break;
        default: break;
      }
    }

    applyRemoteState(d) {
      if (this.level && d.p) {
        const rp = this.players.find((p) => !p.local);
        if (rp) rp.applyNet(d.p);
        if (d.lt != null && this.net.role === 'guest') { const diff = d.lt - this.level.time; if (Math.abs(diff) > 1) this.level.time = d.lt; else this.level.time += diff * 0.1; }
        if (d.cr && !this.ownsCrates()) d.cr.forEach((c, i) => { const cr = this.level.crates[i]; if (cr) cr.net = { x: c[0], y: c[1], z: c[2] }; });
      }
      if (this.drive && d.car && !this.ownsCrates()) this.drive.applyNet(d.car);
    }

    onNetEvent(d) {
      const L = this.level, D = this.drive;
      switch (d.e) {
        case 'take': if (L) L.take(d.id, d.who, true); break;
        case 'break': if (L) L.breakIt(d.id, true); break;
        case 'cp': if (L) L.setCheckpoint(d.i, true); break;
        case 'toss': { const me = this.player(this.myChar); if (me && me.local) me.receiveToss(d.fx, d.fz); break; }
        case 'hug': { const me = this.player(this.myChar), rp = this.player(other(this.myChar)); if (me && rp) { me.yaw = Math.atan2(rp.body.x - me.body.x, rp.body.z - me.body.z); me.model.play('hug', 1.3); this.fx.emit('hearts', me.headPos(), { n: 8 }); MM.Audio.sfx('love'); } break; }
        case 'fx': {
          const rp = d.who && this.player(d.who);
          if (d.k === 'love' && rp) { this.fx.emit('hearts', rp.headPos(), { n: 4 }); MM.Audio.sfx('love'); }
          if (d.k === 'dash') MM.Audio.sfx('dash');
          if (d.k === 'honk') MM.Audio.sfx('honk');
          break;
        }
        case 'goal': this.completeChapter(); break;
        case 'regroup': this.regroup(); break;
        case 'crates': if (L) L.resetCrates(); break;
        case 'station': if (D) D.setStation(d.i, true); break;
        case 'dhit': if (D) D.hitObstacle(d.i, true); break;
        case 'dnote': if (D) D.takeNote(d.i, true); break;
        case 'dfail': if (D && !this.ownsCrates()) D.fail(); break;
        case 'photo': if (L) L.takePhoto(d.id, true); break;
        case 'launch': { const me = this.player(this.myChar); if (me && me.local) me.receiveToss(d.fx, d.fz, d.vy); break; }
        case 'clove': if (this.concert) this.concert.loveIn(d.w, true); break;
        case 'rh': if (this.concert) this.concert.remote(d.w, d.j); break;
        default: break;
      }
    }

    sendState() {
      if (this.mode !== 'online' || !this.net.connected) return;
      if (this.level) {
        const me = this.players.find((p) => p.local);
        const msg = { t: 'st', p: me.netState() };
        if (this.net.role === 'host') msg.lt = Math.round(this.level.time * 1000) / 1000;
        if (this.ownsCrates() && this.level.crates.length) msg.cr = this.level.crates.map((c) => [Math.round(c.body.x * 100) / 100, Math.round(c.body.y * 100) / 100, Math.round(c.body.z * 100) / 100]);
        this.net.send(msg);
      } else if (this.drive && this.ownsCrates()) {
        this.net.send({ t: 'st', car: this.drive.netState() });
      }
    }

    /* ================= main loop ================= */
    loop(now) {
      requestAnimationFrame(this.loop);
      let dt = (now - this.last) / 1000; this.last = now;
      if (dt > 0.05) dt = 0.05; if (dt < 0) dt = 0;
      this.t += dt;
      I.update();
      try { this.update(dt); } catch (e) { console.error(e); }
      this.fx.update(dt);
      this.render();
      if (MM.DEBUG) this.debugFps(dt);
    }

    update(dt) {
      const st = this.state;
      if (st === 'title' || st === 'ending' || (this.menu && st !== 'story' && st !== 'play')) {
        if (this.menu) this.updateMenu(dt);
        this.ui.menuNav(I.menuNav());
        return;
      }
      if (st === 'story') { this.updateStory(dt); return; }
      if (st === 'paused') {
        this.ui.menuNav(I.menuNav());
        if (I.get('any').pause) this.resume();
        if (this.mode === 'online') this.simulate(dt, true);
        else this.visuals(dt);
        return;
      }
      if (st === 'complete') { this.ui.menuNav(I.menuNav()); this.visuals(dt); this.cinematicCam(dt); return; }
      if (st === 'cinematic') {
        const c = this.cine;
        c.t += dt;
        if (c.tick) c.tick(c.t, dt);
        if (this.mini) this.mini.update(dt, {}); else this.visuals(dt);
        this.cinematicCam(dt);
        if (c.t >= c.dur) this.finishCinematic();
        return;
      }
      if (st === 'play') {
        if (I.get('any').pause || I.get('p1').pause) { this.pause(); return; }
        this.chapterTime += dt;
        this.simulate(dt, false);
      }
    }

    inputs() {
      if (this.debugInput) return this.debugInput;
      const out = { mohamed: null, mariem: null };
      if (this.mode === 'solo') {
        const a = this.players[this.active];
        const inp = I.get('any');
        if (this.mini) { out.mohamed = inp; out.mariem = inp; }
        else if (a) out[a.who] = inp;
      } else if (this.mode === 'local') {
        const p1 = MM.save.lastLocal.p1;
        out[p1] = I.get('p1'); out[other(p1)] = I.get('p2');
      } else {
        out[this.myChar] = I.get('any');
      }
      return out;
    }

    simulate(dt, menuOpen) {
      const inp = menuOpen || this.cut ? { mohamed: null, mariem: null } : this.inputs();
      if (this.mini) {
        this.mini.update(dt, inp);
        this.mini.camera(this.cams[0], dt, false);
        this.netT -= dt; if (this.netT <= 0) { this.netT = 0.05; this.sendState(); }
        this.hudT -= dt; if (this.hudT <= 0) { this.hudT = 0.15; this.updateHud(); if (this.drive) this.ui.driveHud(this.drive); }
        return;
      }
      const L = this.level;
      // solo helpers
      if (this.mode === 'solo' && !menuOpen && !this.cut) {
        const a = I.get('any');
        if (a.swap) { this.active = 1 - this.active; const p = this.players[this.active]; MM.Audio.sfx('switch'); this.fx.emit('sparkle', p.headPos(), { n: 10, color: p.S.hex }); this.updateChips(); }
        if (a.call) this.callPartner();
      }
      this.players.forEach((p) => { if (p.local) p.control(dt, inp[p.who]); });
      this.acc += dt;
      let n = 0;
      while (this.acc >= STEP && n < 8) {
        L.preStep(STEP);
        this.players.forEach((p) => { if (p.local) p.step(STEP, L.solids); });
        L.stepCrates(STEP);
        L.postStep(STEP);
        this.acc -= STEP; n++;
      }
      if (n >= 8) this.acc = 0;
      this.players.forEach((p) => { if (!p.local) p.remoteUpdate(dt); });
      this.visuals(dt);
      if (this.cut) this.updateCut(dt); else this.updateCams(dt);
      this.netT -= dt; if (this.netT <= 0) { this.netT = 0.05; this.sendState(); }
      this.hudT -= dt; if (this.hudT <= 0) { this.hudT = 0.15; this.updateHud(); }
      if (MM.DEBUG && I.down.KeyN && !this._dbgN) { this._dbgN = true; this.onGoal(true); }
      if (!I.down.KeyN) this._dbgN = false;
    }

    visuals(dt) {
      const L = this.level;
      if (!L) return;
      L.frame(dt);
      this.players.forEach((p) => p.visual(dt, L.solids, this.state !== 'cinematic'));
      if (this.kids.length) this.updateKids(dt);
      if (this.players.length) {
        const a = this.players[0].body, b = this.players[1].body;
        const f = this.mode === 'online' ? this.player(this.myChar).body : this.mode === 'solo' ? this.players[this.active].body : { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, z: (a.z + b.z) / 2 };
        L.focus(f.x, f.y, f.z);
      }
      // together ring
      const g = L.goal;
      if (g && this.state === 'play' && !this.cut) {
        const show = g.anyInside || g.progress > 0;
        const text = !g.reqOk ? g.reqText : g.progress > 0 ? 'Together…' : 'Waiting for your partner';
        this.ui.together(g.progress, show, text);
      } else this.ui.together(0, false);
    }

    updateChips() {
      if (!this.chapter) return;
      const D = this.drive;
      const hint = (who) => {
        if (D) return who === 'mohamed' ? 'Left/right: steer · Jump: hop' : 'Left/right or Power: radio';
        if (this.concert) return 'Love: kiss · then left/right to the beat';
        return MM.CHARS[who].powerHint;
      };
      let list;
      if (this.mode === 'local') {
        const p1 = MM.save.lastLocal.p1;
        list = [{ who: p1, label: 'P1', hint: hint(p1) }, { who: other(p1), label: 'P2', hint: hint(other(p1)) }];
      } else if (this.mode === 'solo') {
        const act = D || this.concert ? null : this.players[this.active] && this.players[this.active].who;
        list = this.concert ? [{ who: 'mohamed', label: 'you', hint: 'Left/right to the beat' }, { who: 'mariem', label: 'you', hint: 'Both colours are yours' }]
          : D ? [{ who: 'mohamed', label: 'you', hint: 'Arrows: steer · Jump: hop' }, { who: 'mariem', label: 'you', hint: 'Power: change station' }]
          : ['mohamed', 'mariem'].map((w) => ({ who: w, label: w === act ? 'playing · Tab to switch' : 'C: call over', hint: hint(w), active: w === act }));
      } else {
        list = [{ who: this.myChar, label: 'you', hint: hint(this.myChar), active: true }, { who: other(this.myChar), label: 'partner', hint: hint(other(this.myChar)) }];
      }
      this.ui.setPlayerChips(list);
    }

    updateHud() {
      const def = this.chapter;
      if (!def) return;
      const L = this.level, D = this.mini;
      const rows = def.objectives.map((o) => {
        if (o.counter && L) {
          const c = L.counters[o.counter];
          if (o.money) return { label: o.label + ': ' + MM.fmtMoney(c.n), done: false };
          return { label: o.label, n: c.n + ' / ' + c.target, done: c.n >= c.target };
        }
        if (o.sig && L) return { label: o.label, done: !!L.sig[o.sig] };
        if (o.goal) return { label: o.label, done: L ? L.goal && L.goal.done : D && D.done };
        if (o.fn) { const [n, t] = o.fn(L || D); return { label: o.label, n: o.pct ? n + '%' : n + ' / ' + t, done: n >= t }; }
        return { label: o.label, done: false };
      });
      this.ui.objectives(def, rows);
      if (L) {
        const h = L.items.filter((i) => i.kind === 'heart' && i.taken).length;
        const m = L.items.filter((i) => i.kind === 'memory' && i.taken).length;
        this.ui.counts(h, L.heartsTotal, m, L.memTotal);
        if (def.money && L.counters[def.money]) this.ui.counterChip((def.money === 'revenue' ? 'Revenue ' : 'Savings ') + MM.fmtMoney(L.counters[def.money].n));
        if (def.warmth) this.ui.meter('Warmth · stay close to her', L.warmth, L.warmth < 0.3 ? 'linear-gradient(90deg,#9fc8ff,#5aa9ff)' : 'linear-gradient(90deg,#ffb36b,#ff6f9c)');
      } else if (D) {
        this.ui.counts(null);
        if (this.concert) this.ui.meter('Concert', this.concert.progress(), 'linear-gradient(90deg,#5aa9ff,#ff6f9c)');
      }
    }

    /* ================= cameras ================= */
    camCfg() {
      const c = (this.chapter && this.chapter.camera) || {};
      return { dist: c.dist || 9.2, height: c.height || 4.9 };
    }
    snapCams() {
      if (this.mini) { this.mini.camera(this.cams[0], 0, true); return; }
      this.updateCams(0, true);
    }
    followCam(i, target, vx, dt, snap, aspect, extra) {
      const cfg = this.camCfg(), cs = this.camSt[i], cam = this.cams[i];
      let dist = cfg.dist + (extra || 0), height = cfg.height + (extra || 0) * 0.45;
      if (aspect < 1.1) { dist *= 1.2; height *= 1.08; }
      const look = new T.Vector3(target.x + MM.clamp(vx, -6, 6) * 0.3, target.y + 1.1, target.z * 0.6);
      const pos = new T.Vector3(look.x, look.y + height, target.z + dist);
      if (snap) { cs.look.copy(look); cs.pos.copy(pos); }
      else {
        cs.look.x = MM.damp(cs.look.x, look.x, 5, dt); cs.look.y = MM.damp(cs.look.y, look.y, 4, dt); cs.look.z = MM.damp(cs.look.z, look.z, 4, dt);
        cs.pos.x = MM.damp(cs.pos.x, pos.x, 5, dt); cs.pos.y = MM.damp(cs.pos.y, pos.y, 3.5, dt); cs.pos.z = MM.damp(cs.pos.z, pos.z, 4, dt);
      }
      cam.position.copy(cs.pos);
      if (this.shakeAmt > 0) cam.position.add(new T.Vector3((Math.random() - 0.5) * this.shakeAmt, (Math.random() - 0.5) * this.shakeAmt, 0));
      cam.lookAt(cs.look);
    }
    updateCams(dt, snap) {
      if (!this.players.length) return;
      this.shakeAmt = Math.max(0, this.shakeAmt - dt * 1.6);
      const w = window.innerWidth, h = window.innerHeight;
      const pos = (p) => new T.Vector3(p.body.x, p.body.y, p.body.z);
      if (this.split()) {
        const p1 = MM.save.lastLocal.p1;
        [this.player(p1), this.player(other(p1))].forEach((p, i) => this.followCam(i, pos(p), p.body.vx, dt, snap, (w / 2) / h));
      } else if (this.mode === 'local') {
        const a = this.players[0].body, b = this.players[1].body;
        const mid = new T.Vector3((a.x + b.x) / 2, Math.min(a.y, b.y) + Math.abs(a.y - b.y) * 0.4, (a.z + b.z) / 2);
        const sep = Math.hypot(a.x - b.x, a.z - b.z);
        this.followCam(0, mid, (a.vx + b.vx) / 2, dt, snap, w / h, MM.clamp(sep * 0.55 - 2, 0, 14));
      } else {
        const p = this.mode === 'online' ? this.player(this.myChar) : this.players[this.active];
        this.followCam(0, pos(p), p.body.vx, dt, snap, w / h);
      }
    }
    updateStory(dt) {
      this.storyT += dt;
      // ready-ups
      if (this.mode === 'solo') { if (I.get('any').jump) this.go(); }
      else if (this.mode === 'local') {
        const p1 = MM.save.lastLocal.p1;
        if (I.get('p1').jump) this.setReady(p1, true, false);
        if (I.get('p2').jump) this.setReady(other(p1), true, false);
      } else if (I.get('any').jump) this.setReady(this.myChar, true, true);
      if (this.state !== 'story') return;
      if (this.pendingGo) { const d = this.pendingGo; this.pendingGo = null; this.onNet(d); return; }
      // establishing pan from the goal back to the start
      const cam = this.cams[0];
      if (this.drive) {
        const k = MM.ease.inOut(MM.clamp(this.storyT / 7, 0, 1));
        cam.position.set(MM.lerp(10, 0, k), MM.lerp(14, 5.2, k), MM.lerp(-60, 10.5, k));
        cam.lookAt(0, 1.2, MM.lerp(-90, -9, k));
        this.drive.update(dt, {});
        return;
      }
      if (this.concert) { this.concert.update(dt, {}); this.concert.camera(cam, dt); return; }
      const L = this.level;
      const sx = (this.players[0].body.x + this.players[1].body.x) / 2;
      const gx = L.goal ? (L.goal.zones[0].x0 + L.goal.zones[0].x1) / 2 : sx + 30;
      const k = MM.ease.inOut(MM.clamp(this.storyT / 9, 0, 1));
      const x = MM.lerp(Math.min(gx, sx + 60), sx, k);
      const cfg = this.camCfg();
      cam.position.set(x - 2, 3 + cfg.height * MM.lerp(1.6, 1, k), cfg.dist * MM.lerp(1.5, 1, k));
      cam.lookAt(x + 2, MM.lerp(2, 1.2, k), 0);
      this.visuals(dt);
      this.players.forEach((p) => { if (Math.random() < 0.003) p.model.play('wave', 1.2); });
    }
    cinematicCam(dt) {
      const c = this.cine;
      const cam = this.cams[0];
      if (this.mini) { this.mini.camera(cam, dt, false); return; }
      const center = c ? c.center : (this.players.length ? new T.Vector3((this.players[0].body.x + this.players[1].body.x) / 2, this.players[0].body.y, (this.players[0].body.z + this.players[1].body.z) / 2) : new T.Vector3());
      this._orbit = (this._orbit || 0) + dt * 0.25;
      const a = this._orbit;
      cam.position.set(center.x + Math.sin(a) * 6.5, center.y + 2.8, center.z + Math.cos(a) * 6.5);
      cam.lookAt(center.x, center.y + 1.1, center.z);
    }

    render() {
      const r = this.renderer, w = window.innerWidth, h = window.innerHeight;
      if (this.debugCam) { const c = this.cams[0]; c.clearViewOffset(); c.position.fromArray(this.debugCam[0]); c.lookAt(new T.Vector3().fromArray(this.debugCam[1])); c.aspect = w / h; c.updateProjectionMatrix(); r.setScissorTest(false); r.setViewport(0, 0, w, h); r.render(this.scene, c); return; }
      if (this.split() && (this.state === 'play' || this.state === 'paused')) {
        r.setScissorTest(true);
        for (let i = 0; i < 2; i++) {
          const cam = this.cams[i];
          cam.aspect = (w / 2) / h; cam.updateProjectionMatrix();
          r.setViewport(i * w / 2, 0, w / 2, h); r.setScissor(i * w / 2, 0, w / 2, h);
          r.render(this.scene, cam);
        }
        r.setScissorTest(false);
      } else {
        const cam = this.cams[0];
        cam.aspect = w / h; cam.updateProjectionMatrix();
        r.setViewport(0, 0, w, h);
        r.render(this.scene, cam);
      }
    }

    debugFps(dt) {
      if (!this._fpsEl) { this._fpsEl = document.createElement('div'); this._fpsEl.id = 'fps'; document.body.appendChild(this._fpsEl); this._fa = 0; this._fn = 0; }
      this._fa += dt; this._fn++;
      if (this._fa > 0.5) {
        const p = this.players[0];
        this._fpsEl.textContent = Math.round(this._fn / this._fa) + ' fps · calls ' + this.renderer.info.render.calls + (p ? ' · M ' + p.body.x.toFixed(1) + ',' + p.body.y.toFixed(1) + ',' + p.body.z.toFixed(1) : '') + (this.players[1] ? ' · F ' + this.players[1].body.x.toFixed(1) + ',' + this.players[1].body.y.toFixed(1) : '');
        this._fa = 0; this._fn = 0;
      }
    }
  }

  MM.Game = Game;
})(window.MM);
