/* "Home Sweet Home": their apartment in Alexandria, a free-play place with no mission and no timer.
   It fills up as the story does: every finished chapter adds something to the rooms, the memory wall shows
   their own photos (or the moment each chapter ended), the trophy shelf grows, the sky follows the real clock,
   and the mailbox by the door keeps their love letters. */
(function (MM) {
  'use strict';
  const G = MM.G, LV = MM.LV, T = THREE;
  const { frontRail, backWall } = LV;

  const done = (id) => !!(MM.save.chapters[id] && MM.save.chapters[id].done);
  const hour = () => new Date().getHours();
  // The sky outside their window follows the time of day where they are.
  const timeOfDay = () => { const h = hour(); return h >= 6 && h < 16 ? 'day' : h >= 16 && h < 19 ? 'sunset' : 'night'; };

  MM.THEMES.homeDay = Object.assign({}, MM.THEMES.alex, { cloudColor: '#ffffff', fogNear: 90, fogFar: 320, water: '#2f8fd8' });
  MM.THEMES.homeSunset = Object.assign({}, MM.THEMES.sunset, { fogNear: 90, fogFar: 320, water: '#3d7fc8', hemi: 1.2 });
  MM.THEMES.homeNight = Object.assign({}, MM.THEMES.yousr, { fogNear: 80, fogFar: 300, hemi: 1.25, sunI: 1.2, water: '#1a2a6a', stars: 900 });

  // A gold cup for the trophy shelf.
  function cup(color) {
    const g = new T.Group(), gold = G.mat(color || '#ffcf6e', { m: 0.85, r: 0.25, e: '#7a5200', ei: 0.25 });
    G.mesh(new T.BoxGeometry(0.34, 0.08, 0.26), G.mat('#3b2340'), 0, 0.04, 0, g);
    G.mesh(new T.CylinderGeometry(0.035, 0.05, 0.16, 10), gold, 0, 0.16, 0, g);
    G.mesh(new T.CylinderGeometry(0.16, 0.06, 0.24, 14, 1, true), gold, 0, 0.36, 0, g);
    [-1, 1].forEach((s) => { const h = G.mesh(new T.TorusGeometry(0.07, 0.018, 6, 12, Math.PI), gold, s * 0.16, 0.38, 0, g); h.rotation.z = -s * Math.PI / 2; });
    return g;
  }

  // The letter box by the front door. The little flag goes up when a letter is waiting.
  function mailbox() {
    const g = new T.Group();
    G.mesh(new T.CylinderGeometry(0.06, 0.06, 1.1, 8), G.mat('#6b4a3a'), 0, 0.55, 0, g);
    G.mesh(new T.BoxGeometry(0.62, 0.46, 0.42), G.mat('#ff6f9c', { r: 0.4 }), 0, 1.3, 0, g);
    G.mesh(new T.CylinderGeometry(0.21, 0.21, 0.62, 16, 1, false, 0, Math.PI), G.mat('#ff6f9c', { r: 0.4 }), 0, 1.53, 0, g).rotation.z = Math.PI / 2;
    const h = G.mesh(G.heartGeo(), G.mat('#ffffff', { e: '#ffffff', ei: 0.3 }), 0, 1.36, 0.215, g); h.rotation.z = Math.PI; h.scale.setScalar(0.14);
    const flag = new T.Group(); flag.position.set(0.33, 1.2, 0.05); g.add(flag);
    G.mesh(new T.BoxGeometry(0.03, 0.4, 0.03), G.mat('#d9534f'), 0, 0.2, 0, flag);
    G.mesh(new T.BoxGeometry(0.03, 0.14, 0.18), G.mat('#d9534f'), 0, 0.33, 0.08, flag);
    g.userData.flag = flag;
    return g;
  }

  // One framed photo on the memory wall. Their own album photo wins, then the picture taken when the chapter ended.
  function frame(L, c, x, y) {
    const W = 0.92, H = 1.15, z = -4.42;
    const open = done(c.id);
    L.box(x - W / 2 - 0.07, x + W / 2 + 0.07, y - H / 2 - 0.07, y + H / 2 + 0.07, z - 0.08, z, { top: G.mat('#6b4a3a'), side: G.mat(open ? '#8a5a3a' : '#9a8a80') }, { nosolid: true });
    const mat = new T.MeshBasicMaterial({ map: G.placeholderPhoto(open ? c.title : 'Chapter ' + c.num, open ? null : ['#d8d0dc', '#bfb6c6']), toneMapped: false });
    mat.userData.ownMap = true;
    const pg = new T.PlaneGeometry(W, H); pg.userData.own = true;
    const pic = new T.Mesh(pg, mat); pic.position.set(x, y, z + 0.01); L.add(pic);
    const lb = G.textPlane(open ? c.title : 'Chapter ' + c.num, 0.13, { color: '#3b2340', bg: 'rgba(255,248,240,.92)', size: 48, pad: 8 });
    if (lb.userData.w > W + 0.2) lb.scale.setScalar((W + 0.2) / lb.userData.w);
    lb.position.set(x, y - H / 2 - 0.17, z + 0.02); L.add(lb);
    if (!open) return;
    (async () => {
      let url = null;
      for (const m of MM.MEMORIES.filter((q) => q.ch === c.num)) { url = await MM.media.get('photo:' + m.id); if (url) break; }
      if (!url) url = await MM.media.get('shot:' + c.id);
      if (!url || !L.group.parent) return;
      G.photoTex(url, (tex, a) => {
        if (!L.group.parent) { tex.dispose(); return; }
        const f = W / H; // cover the frame, crop the rest
        if (a > f) { tex.repeat.set(f / a, 1); tex.offset.set((1 - f / a) / 2, 0); } else { tex.repeat.set(1, a / f); tex.offset.set(0, (1 - a / f) / 2); }
        mat.map.dispose(); mat.map = tex; mat.needsUpdate = true;
      });
    })();
  }

  MM.HUB = {
    id: 'ourhome', num: 99, hub: true, title: 'Home Sweet Home', music: 'home',
    get theme() { return { day: 'homeDay', sunset: 'homeSunset', night: 'homeNight' }[timeOfDay()]; },
    get ambience() { return timeOfDay() === 'night' ? 'night' : 'sea'; },
    get year() { return new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); },
    get kids() { return done('forever'); },
    get intro() {
      const n = MM.CHAPTERS.filter((c) => done(c.id)).length;
      const today = MM.Extras.today();
      const out = [today ? today.title + ' ' + today.sub + '.' : 'Our home in Alexandria. No mission, no timer. Just us.'];
      out.push(n >= MM.CHAPTERS.length ? 'Every room is full now. The story continues here.' : 'Every chapter we finish adds something to these rooms (' + n + ' of ' + MM.CHAPTERS.length + ' so far).');
      out.push(MM.Extras.counters().map((t) => t.replace(/^\S+\s/, '')).join(' · ') + '.');
      return out;
    },
    mission: 'Free play. Sit on the couch together, walk past our memory wall, watch the sea from the balcony, and leave each other letters in the mailbox. Pause for Photo mode.',
    objectives: [
      { label: 'Sit on our couch together', sig: 'couch' },
      { label: 'Walk past our memory wall', sig: 'wall' },
      { label: 'Watch the sea from the balcony', sig: 'balcony' },
      { label: 'A love letter in the mailbox', fn: () => [(MM.save.letters || []).length ? 1 : 0, 1] },
    ],
    outro: { title: 'Home', quote: 'Home is wherever the two of us are.' },
    camera: { dist: 9.6, height: 4.6 },
    killY: -20,
    build(L, P) {
      const tod = timeOfDay(), night = tod === 'night';
      L.spawn('mohamed', 0.2, 0, 1.2); L.spawn('mariem', 1.8, 0, 1.2);
      const floor = { top: LV.woodFloor('#e2b98c', '#9a6a40'), side: G.mat('#a97b52') };
      const wallMat = { top: G.mat('#ffffff'), side: new T.MeshStandardMaterial({ color: '#f3e3d6', roughness: 0.9 }) };
      // the apartment, and the building it sits in
      L.ground(-6, 32, -4.5, 4.5, 0, { mat: floor });
      L.box(32, 44, -0.4, 0, -4.5, 4.5, { top: G.mat('#e9dccb'), side: G.mat('#cdbba5') });
      L.box(-6, 44, -16, -0.4, -4.5, 4.5, { top: G.mat('#efe4d2'), side: G.mat('#e3d3bd') }, { nosolid: true });
      backWall(L, -6, 32, -4.5, 7, wallMat);
      L.wall(-6.6, -6, 0, 7, -4.5, 4.5, { mat: wallMat });
      frontRail(L, -6, 44, 4.5); L.invisible(44, 44.5, 0, 10, -5, 5); L.invisible(32, 44, 0, 8, -5, -4.3);
      // sliding doors to the balcony
      L.box(31.7, 32.3, 0, 7, -4.5, -3.9, wallMat); L.box(31.7, 32.3, 5.4, 7, -3.9, 4.5, wallMat, { nosolid: true });

      // ---- the sea, the corniche and the city outside ----
      L.water(-300, 400, -420, -12, -14.2);
      L.box(-120, 200, -14.6, -13.7, -12, -4.5, { top: G.mat('#d9cfbf'), side: G.mat('#b8ab95') }, { nosolid: true });
      L.prop('cornicheRail', 40, -13.7, -11.6, { args: [160] });
      for (let x = -30; x < 110; x += 12) L.prop('lampPost', x, -13.7, -11, { args: [night ? '#ffd88a' : '#fff4dc'] });
      L.prop('qaitbay', 96, -14.2, -150, { ry: 0.5, s: 1.8 });
      const rr = MM.rng(21);
      for (let x = -70; x < -16; x += 9) L.prop('alexBuilding', x, -16, -14, { args: [8, 18 + rr() * 12, ['#f1d9c4', '#e8c8b0', '#f4e6cf'][Math.floor(rr() * 3)], Math.floor(rr() * 50)] });
      for (let x = 66; x < 120; x += 9) L.prop('alexBuilding', x, -16, -30, { args: [8, 16 + rr() * 12, ['#f1d9c4', '#e8c8b0', '#f4e6cf'][Math.floor(rr() * 3)], Math.floor(rr() * 50)] });
      if (night) L.prop('moon', 20, 34, -160, { args: [8] });
      for (let i = 0; i < 4; i++) L.prop('cloud', -40 + i * 40 + rr() * 10, 14 + rr() * 10, -90 - rr() * 40, { args: [2 + rr() * 2], bob: 0.5 });
      L.talk(33, 'mariem', 'Our sea. Every single evening.');
      L.talk(35, 'mohamed', 'Every single evening.');
      L.trigger(33, 44, -4.5, 4.5, (lv) => { lv._balcony = true; }, { both: true });
      L.logic('balcony', (s, lv) => !!lv._balcony);

      // ---- entrance: door and the mailbox ----
      L.box(-5.2, -3.4, 0, 3.2, -4.5, -4.35, { top: G.mat('#7a4a32'), side: G.mat('#8a5a3a') }, { nosolid: true });
      G.mesh(new T.SphereGeometry(0.07, 8, 6), G.mat('#ffcf6e', { m: 0.9, r: 0.2 }), -3.75, 1.5, -4.3, L.group);
      L.prop('rug', -4.3, 0, -3.4, { args: [1.8, 1.0, '#c4566c'] });
      const box = mailbox(); box.position.set(-2.4, 0, -3.5); L.add(box);
      L.invisible(-2.75, -2.05, 0, 1.7, -3.75, -3.25);
      const unread = () => (MM.save.letters || []).some((l) => !l.read);
      L.anim.push((t, dt) => { const f = box.userData.flag; f.rotation.x = MM.damp(f.rotation.x, unread() ? 0 : Math.PI / 2, 6, dt); });
      const mlb = G.textPlane('Love letters · press Love here', 0.22, { color: '#fff', bg: 'rgba(30,14,40,.82)', size: 56, pad: 10 });
      mlb.position.set(-2.4, 2.3, -3.5); L.add(mlb); L.hints.push([mlb, null]);
      L.interact(-2.4, -3.0, 0, 1.9, (p) => L.game.openLetters());

      // ---- living room ----
      L.prop('rug', 4, 0, -1.4, { args: [5, 3.6, '#e8c6a8'] });
      L.prop('bigWindow', 4, 2.4, -4.55, { args: [3.4, 2.2, night ? '#2a3a7a' : '#cfe9ff'] });
      L.prop('couch', 4, 0, -3.0);
      L.invisible(2.7, 5.3, 0, 0.62, -3.5, -2.5); L.invisible(2.7, 5.3, 0, 1.3, -3.75, -3.4);
      L.box(3, 5, 0, 0.42, -0.6, 0.4, { top: G.mat('#8a5a3a'), side: G.mat('#6b4a3a') }); // coffee table
      L.prop('bookshelf', -0.6, 0, -4, { solid: true });
      L.prop('plant', 6.6, 0, -3.8); L.prop('plant', -5.2, 0, 3.6);
      const sl = G.textPlane('Jump on the couch, press Love to sit', 0.2, { color: '#fff', bg: 'rgba(30,14,40,.78)', size: 56, pad: 10 });
      sl.position.set(4, 2.1, -1.9); L.add(sl); L.hints.push([sl, null]);
      // sitting: press Love while standing on the couch; move to stand up
      const onCouch = (p) => p.body.x > 2.7 && p.body.x < 5.3 && p.body.z > -3.5 && p.body.z < -2.5 && p.body.y > 0.4;
      L.interact(4, -3.0, 0.62, 1.45, (p) => { if (onCouch(p) && !p.seated) { p.sitDown(Math.PI * 0); return true; } return false; });
      L.anim.push(() => {
        const ps = L.game.players;
        if (!L._couch && ps.length === 2 && ps.every((p) => onCouch(p) && p.pose === 'sit')) {
          L._couch = true; L.game.fx.emit('hearts', new T.Vector3(4, 2.2, -3), { n: 20 }); MM.Audio.sfx('love');
          L.game.ui.say('mariem', 'Our couch. Our show. Your shoulder.', 3); setTimeout(() => L.game.ui.say('mohamed', 'Best seat in the world.', 3), 2600);
        }
      });
      L.logic('couch', (s, lv) => !!lv._couch);
      // the sideboard: things from the story arrive here as chapters are finished
      L.box(7.2, 11.4, 0, 0.9, -4.5, -3.7, { top: G.mat('#f4efe7'), side: G.mat('#b98a56') });
      const top = 0.9;
      if (done('kids')) L.prop('globe', 7.6, top, -4.1, { s: 0.8 });
      if (done('physics')) L.prop('bookStack', 8.3, top, -4.1, { args: [4, 3] });
      if (done('whitecoat')) L.prop('stethoscope', 9.0, top, -4.05, { s: 0.9 });
      if (done('miles')) L.prop('planeToy', 9.7, top + 0.2, -4.1, { s: 0.7, bob: 0.06 });
      if (done('hard')) L.prop('candle', 10.3, top, -4.1);
      if (done('med')) L.prop('gradCap', 10.9, top, -4.1, { s: 0.7 });
      if (done('engaged')) { L.prop('bouquet', 4.35, 0.42, -0.2, { s: 0.8 }); L.prop('heartBalloon', 1.8, 0, -3.4, { bob: 0.2 }); L.prop('heartBalloon', 6.3, 0, -3.4, { args: ['#ffcf6e'], bob: 0.2 }); }
      if (done('calls')) L.prop('mug', 3.25, 0.42, -0.3, { args: ['#ff9cc0', 1] });
      if (done('agency')) { L.prop('laptop', 4.75, 0.42, 0.15, { s: 0.7 }); L.prop('neon', 9.3, 2.7, -4.42, { args: ['U3 AI', '#7ee0c3', 0.9] }); }
      if (done('concerts')) L.prop('neon', -1.2, 4.4, -4.42, { args: ['LIVE', '#ff6f9c', 0.8] });
      if (done('teta')) {
        const tp = G.textPlane('"Never, ever upset her."  Teta Yousr', 0.13, { color: '#3b2340', bg: 'rgba(255,248,240,.95)', size: 52, pad: 12 });
        tp.position.set(9.3, 1.9, -4.42); L.add(tp);
      }
      if (done('home')) { L.prop('plant', 11.9, 0, -3.8, { args: [1.3] }); L.prop('plant', 31, 0, -3.8, { args: [1.2] }); }
      if (night) {
        [1, 9, 18, 27].forEach((x) => { const b = G.mesh(G.sphere(0.3, 12, 10), G.mat('#fff5df', { e: '#ffd88a', ei: 2.2 }), x, 6.4, -1, L.group); b.castShadow = false; });
        L.hemi.intensity *= 1.15;
      }

      // ---- the memory wall: one frame per chapter ----
      const hdr = G.textPlane('Our story, on our wall', 0.34, { color: '#3b2340', size: 64, pad: 6 });
      hdr.position.set(18.2, 4.95, -4.42); L.add(hdr);
      const cnt = G.textPlane(MM.Extras.counters().map((t) => t.replace(/^\S+\s/, '')).join('   ·   '), 0.2, { color: '#8a3a5a', size: 52, pad: 6 });
      cnt.position.set(18.2, 4.4, -4.42); L.add(cnt);
      MM.CHAPTERS.forEach((c, i) => frame(L, c, 13.0 + (i % 10) * 1.15, i < 10 ? 2.95 : 1.4));
      L.trigger(12.5, 24, -4.5, 0, (lv, game) => { lv._wall = true; game.ui.say('mariem', 'Look how far we came.', 3); }, {});
      L.logic('wall', (s, lv) => !!lv._wall);

      // ---- the trophy shelf ----
      const got = (MM.save.trophies || []).length;
      [1.0, 2.0, 3.0].forEach((y) => L.box(24.8, 31, y - 0.06, y, -4.5, -4.0, { top: G.mat('#f4efe7'), side: G.mat('#b98a56') }, { nosolid: true }));
      MM.Extras.TROPHIES.forEach((tr, i) => {
        if ((MM.save.trophies || []).indexOf(tr.id) < 0) return;
        const c = cup(i % 5 === 4 ? '#e8e8f0' : '#ffcf6e'); c.position.set(25.3 + (i % 7) * 0.85, 1.0 + Math.floor(i / 7) * 1.0, -4.22); L.add(c);
      });
      const tl = G.textPlane('Our trophies · ' + got + ' of ' + MM.Extras.TROPHIES.length, 0.24, { color: '#3b2340', bg: 'rgba(255,248,240,.92)', size: 56, pad: 10 });
      tl.position.set(27.9, 3.75, -4.42); L.add(tl);

      // ---- the balcony ----
      L.prop('cornicheRail', 38, 0, -4.35, { args: [12] });
      L.prop('cornicheRail', 43.8, 0, 0, { args: [9], ry: Math.PI / 2 });
      L.prop('plant', 33, 0, 3.6); L.prop('plant', 43, 0, 3.6, { args: [1.2] });
      if (done('sharm')) L.prop('beachUmbrella', 41.5, 0, 2.2, { args: ['#ff7a6b'] });
      if (done('cairo')) L.prop('tripod', 36, 0, 3, { ry: Math.PI });
      if (done('anniversary')) L.prop('stringLights', 38, 0, -3.9, { args: [11, 3.4] });
      if (done('summer')) L.prop('yacht', 14, -14.2, -60, { ry: 0.3, s: 1.3, bob: 0.25 });
      if (done('exams')) L.prop('car', 30, -13.7, -8.5, { args: ['#e8e8f0'], ry: Math.PI / 2 });
      if (done('forever')) { L.prop('heartBalloon', 34, 0, -3.6, { bob: 0.25 }); L.prop('heartBalloon', 42.5, 0, -3.6, { args: ['#ffcf6e'], bob: 0.25 }); }

      // ---- special days: a cake, balloons, a banner and fireworks over the sea ----
      const today = MM.Extras.today();
      if (today) {
        L.prop('cake', 3.75, 0.42, 0.12, { s: 0.5 });
        const bn = G.textPlane(today.title, 0.34, { color: '#fff', bg: 'rgba(255,111,156,.92)', size: 72, pad: 14, toneMapped: false });
        bn.position.set(18.2, 5.6, -4.4); L.add(bn);
        ['#ff6f9c', '#ffcf6e', '#7ee0c3', '#5aa9ff'].forEach((c, i) => L.prop('heartBalloon', 13 + i * 3.4, 0, -3.8, { args: [c], bob: 0.25 }));
        let ft = 2;
        L.anim.push((t, dt) => { ft -= dt; if (ft <= 0) { ft = 3 + Math.random() * 3; L.game.fireworks(new T.Vector3(10 + Math.random() * 50, 14 + Math.random() * 10, -50 - Math.random() * 30), 3); } });
      }
    },
  };
})(window.MM);
