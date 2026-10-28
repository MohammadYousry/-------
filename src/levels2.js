/* Chapters 8-14: the hard year, America, U3 AI, asking for her hand, the engagement, Teta Yousr, the best feeling. */
(function (MM) {
  'use strict';
  const G = MM.G, LV = MM.LV;
  const { frontRail, backWall, heartsArc } = LV;
  const T = THREE;

  // true while both players stand inside the x-range (used for logic signals)
  const bothIn = (lv, x0, x1, z0, z1, y1) => lv.game.players.length === 2 && lv.game.players.every((p) => p.body.x > x0 && p.body.x < x1 && p.body.z > z0 && p.body.z < z1 && (y1 == null || p.body.y < y1));

  MM.CHAPTERS.push(
    /* =================================================================== 8 */
    {
      id: 'hard', num: 8, year: '2023', title: 'The Hard Year', theme: 'rain', music: 'grind', rain: true, warmth: true, umbrella: true,
      outfit: { mohamed: 1, mariem: 0 },
      intro: ['She was scared of losing him. Scared her family would find out.', 'Then they did. They wanted to protect her, and for a while they kept her from him.', 'She cried alone, and she waited. He promised he would come back and ask for her hand, properly.', 'And then a letter came. A scholarship. In America.'],
      mission: 'Walk her home in the rain: stay close (Mohamed has the umbrella). When the world keeps you apart, open the way for each other. Find 5 promises.',
      objectives: [{ label: 'Promises', counter: 'promises' }, { label: 'The letter (Mohamed)', counter: 'letter' }, { label: 'Under the streetlight', goal: true }],
      outro: { title: 'I\'ll wait', quote: '"Go. I\'ll wait. I always wait for you." She did. Every single day of it.' },
      finale: { kind: 'hug', lines: [[0.6, 'mohamed', 'A scholarship. In America.'], [2.8, 'mariem', 'Go. I\'ll wait. I always wait for you.'], [5.2, 'mohamed', 'I\'ll come back and ask for your hand. Properly. I promise.']] },
      killY: -8,
      build(L, P) {
        L.spawn('mohamed', 0, 0, 0.2); L.spawn('mariem', 1.4, 0, 0.2);
        L.counter('promises', 'Promises', 5); L.counter('letter', 'Letter', 1);
        const wet = { top: new T.MeshStandardMaterial({ color: '#5d6476', roughness: 0.25, metalness: 0.3 }), side: G.mat('#454b5a') };
        L.ground(-6, 92, -4, 4, 0, { mat: wet });
        frontRail(L, -6, 92, 4); L.invisible(-6.5, -6, 0, 10, -4, 4); L.invisible(92, 92.5, 0, 12, -4, 4);
        backWall(L, -6, 92, -4.2, 7, { top: G.mat('#565c70'), side: G.mat('#3e4458') });
        for (let x = -2; x < 92; x += 8) { L.prop('lampPost', x, 0, -3.6, { args: ['#ffd88a'] }); }
        for (let x = 3; x < 92; x += 17) L.prop('bigWindow', x, 2.2, -4.25, { args: [2.4, 2, '#ffd9a0'] });
        const promise = (x, y, z) => L.item('letter', x, y, z, { counter: 'promises' });
        L.talk(1, 'mariem', 'Stay close. It\'s cold, and I\'m scared.');
        L.talk(3, 'mohamed', 'I\'m right here. Under the umbrella. Always.');
        L.sign('Stay close: the warmth meter drops when you drift apart', 5, 2.4, -2.8, { h: 0.26 });
        L.box(8, 10.5, 0, 0.55, -3.6, -2.6, { top: G.mat('#7a5a40'), side: G.mat('#5a4030') });
        promise(9.2, 1.2, -3.1);
        heartsArc(L, 4, 12, 1.3, 1.2, 4);
        L.box(14, 14.6, 0, 1.0, -4, 4, { top: G.mat('#8a90a0'), side: G.mat('#565c6c') });
        promise(17, 1.4, 1.6);
        // her family finds out
        L.trigger(20, 26, -4, 4, (lv, game) => {
          game.cutscene({
            title: 'Her family found out', sub: 'They wanted to protect her. For a while, they kept her from him.', dur: 6.5, dist: 7, at: [23.5, 0, 0],
            start: () => { const mo = game.player('mohamed'), ma = game.player('mariem'); mo.place(new T.Vector3(22.9, 0.05, 0)); ma.place(new T.Vector3(24.1, 0.05, 0)); mo.yaw = Math.PI / 2; ma.yaw = -Math.PI / 2; ma.model.play('shy', 6); },
            lines: [[1.4, 'mariem', '(If they see us together, they\'ll keep me away from him.)'], [3.9, 'mohamed', '(Then I\'ll do this properly. I\'ll come back and ask for her hand.)']],
            end: () => { const mo = game.player('mohamed'), ma = game.player('mariem'); mo.place(new T.Vector3(27.5, 0.05, -2.2)); ma.place(new T.Vector3(27.5, 0.05, 2.2)); },
          });
        });
        L.checkpoint(24, -3);
        // apart: a glass wall between them. They can see each other; they can't reach each other.
        L.logic('apart', (s, lv) => lv.game.players.some((p) => p.body.x > 26.5 && p.body.x < 61.5));
        L.box(26, 62, 0, 8, -0.4, 0.4, G.mat('#bfe6ff', { t: true, o: 0.22 }), { noShadow: true });
        L.sign('Apart for a while', 27, 3.4, -0.45, { h: 0.3, post: false });
        // his plate opens her way
        L.plate('h1', 31, -2.2, 0, { heavy: true, label: 'HOLD ON' });
        L.door('h1', 33, 34, 0, 4, 0.4, 4, { label: 'NOT YET', color: '#8f6fd8' });
        L.box(33, 34, 4, 8, 0.4, 4, L.M.wall);
        // her plate opens his way
        L.plate('f1', 38, 2.2, 0, { label: 'BE PATIENT' });
        L.door('f1', 40, 41, 0, 4, -4, -0.4, { label: 'NOT YET', color: '#8f6fd8' });
        L.box(40, 41, 4, 8, -4, -0.4, L.M.wall);
        L.talk(30, 'mohamed', 'I\'ll hold this side. Go, I\'ll find you.', { by: 'mohamed' });
        L.talk(36, 'mariem', 'Your turn. I\'m holding the door for you.', { by: 'mariem' });
        promise(36, 1.2, 2.6); promise(44, 1.2, -2.6);
        L.memory('waited', 47, 1.6, 2.4);
        // her timed plate lifts the bar on his side, his weight lowers the bar on hers
        L.plate('f2', 51, 2.2, 0, { latch: 5, label: '5 SEC' });
        L.door('f2', 54, 55, 0, 4, -4, -0.4, { label: 'WAIT', color: '#8f6fd8' });
        L.box(54, 55, 4, 8, -4, -0.4, L.M.wall);
        L.plate('h2', 57, -2.2, 0, { heavy: true, label: 'HOLD ON' });
        L.door('h2', 58.5, 59.5, 0, 4, 0.4, 4, { label: 'WAIT', color: '#8f6fd8' });
        L.box(58.5, 59.5, 4, 8, 0.4, 4, L.M.wall);
        heartsArc(L, 28, 60, 1.3, -2.8, 6, 0.3); heartsArc(L, 28, 60, 1.3, 2.8, 6, 0.3);
        L.checkpoint(63, -3);
        L.talk(64, 'mariem', 'You\'re here. You\'re really here.');
        // the letter
        const box = new T.Group(); P.bx(box, 0.7, 1.1, 0.5, '#2f6fb3', 0, 0.55, 0); P.bx(box, 0.74, 0.12, 0.54, '#e04a4a', 0, 1.14, 0); L.deco(box, 70, 0, -3.4);
        L.item('letter', 70, 1.8, -2.6, { counter: 'letter', who: 'mohamed', sub: 'scholarship' });
        L.memory('scholarship', 72.5, 1.6, 2.4);
        promise(76, 1.2, -2);
        L.talk(69, 'mohamed', 'A letter? For me? ...A scholarship. In the United States.', { by: 'mohamed' });
        const lamp = L.prop('lampPost', 84, 0, -1.6, { args: ['#ffe2a0'], s: 1.4 });
        L.goalZone([{ x0: 81, x1: 87, z0: -1, z1: 2.6, label: 'Under the streetlight' }], { req: ['count:promises', 'count:letter'], reqText: '5 promises, and Mohamed reads the letter' });
      },
    },

    /* =================================================================== 9 */
    {
      id: 'miles', num: 9, year: '2023 – 2024', title: 'Miles Apart', theme: 'miles', music: 'miles',
      outfit: { mohamed: 1, mariem: 0 },
      intro: ['He went to study in the United States. An ocean between them, seven hours apart.', 'She called every single day. She cried a lot, and still tried to make him laugh.', 'Sometimes he upset her. He always made it up to her.', 'Far from home he learned something simple: no one is prettier. No one else.'],
      mission: 'Help each other across the ocean, then call at the same time to meet in the middle.',
      objectives: [{ label: 'Help each other across', sig: 'call' }, { label: 'Messages sent', counter: 'msgs', optional: true }, { label: 'Meet in the middle', goal: true }],
      outro: { title: 'Back together', quote: 'The flight home was the longest twelve hours of his life. The hug at arrivals made up for all of it.' },
      finale: { kind: 'hug', lines: [[0.6, 'mohamed', 'There is no one else. There never was.'], [2.8, 'mariem', 'I know. I always knew.']] },
      killY: -2.5,
      camera: { dist: 12.5, height: 7.5 },
      build(L, P) {
        const usa = { top: G.mat('#c8ccd6'), side: G.mat('#7d8596') };
        const alex = { top: G.mat('#e6dccb'), side: G.mat('#a99a80') };
        const winTex = G.windowsTex('#3a3f5c', '#ffe7a8', 3).clone(); winTex.needsUpdate = true; winTex.repeat.set(0.35, 0.5);
        LV.apart(L, P, {
          a: usa, b: alex, roof: { top: G.mat('#9aa3b5'), side: new T.MeshStandardMaterial({ map: winTex, roughness: 0.6 }) },
          kind: 'letter', counterLabel: 'Messages', crateLabel: 'BOOKS', hazard: 'JET LAG', goalLabel: 'Meet in the middle',
          signA: 'United States · 7:00 AM', signB: 'Alexandria · 2:00 PM', mems: ['sevenhours', 'ocean'],
          call: ['Can you hear me?', 'Always. Come home.'],
          talks: [[3, 'mohamed', '7 AM here. She\'s already halfway through her day.'], [6, 'mariem', 'Did he eat breakfast? He never eats when he\'s stressed.'], [44, 'mariem', 'I cried again today. Don\'t tell him. ...Okay, tell him.'], [62, 'mohamed', 'I said something stupid. Calling her back. Right now.']],
          dressA(L) {
            const r = MM.rng(33);
            for (let x = -20; x < 120; x += 7 + r() * 4) L.prop('skyscraper', x, 0, -22 - r() * 10, { args: [5 + r() * 3, 10 + r() * 22, 5, ['#3a3f5c', '#4a3f6c', '#2f4a63'][Math.floor(r() * 3)], Math.floor(r() * 9)] });
            L.prop('liberty', 72, 0, -16, { s: 1.4 });
            L.prop('taxi', 8, 0, -7.2, { ry: 0.2 }); L.prop('taxi', 36, 0, -7.2, { ry: -0.1 });
            L.prop('lampPost', 14, 0, -3.6); L.prop('lampPost', 30, 0, -3.6);
            const plane = MM.Props.planeToy(); L.deco(plane, 0, 16, -10, Math.PI);
            L.anim.push((t) => { plane.position.set(((t * 9) % 160) - 30, 15 + Math.sin(t) * 0.6, -12); plane.rotation.y = 0; });
          },
          dressB(L) {
            const r = MM.rng(34);
            for (let x = -2; x < 96; x += 9) L.prop('palm', x + r() * 3, 0, 7.6, { args: [3.5 + r()] });
            L.deco(MM.Props.cornicheRail(100), 45, 0, 8.3);
            L.prop('felucca', 20, -1.3, 0.5);
          },
        });
        // someone tried to get close to him; he chose her
        L.npc('Someone', 34, 0, -7.4, { look: { gender: 'f', hair: '#c9a06a', top: '#c59cff' }, nosolid: true, line: 'Hey... want to grab coffee sometime? Just us?', r: 3.2 });
        L.talk(36, 'mohamed', 'Sorry. My heart is taken. Completely. She\'s waiting for me in Alexandria.', { by: 'mohamed' });
        L.memory('choseher', 38, 1.6, -4.4);
      },
    },

    /* =================================================================== 10 */
    {
      id: 'agency', num: 10, year: '2024', title: 'U3 AI', theme: 'tech', music: 'tech', money: 'revenue',
      intro: ['He came back home to Egypt with a degree, a laptop and a plan.', 'U3 AI. One desk. One client. Then two. Then a team.', 'For the first time in his life, there was money.', 'She was there for every launch, even the ones that crashed.'],
      mission: 'Bring the 3 servers online, then launch U3 AI together.',
      objectives: [{ label: 'Servers online', fn: (L) => [(L.sig.srv1 ? 1 : 0) + (L.sig.srv2 ? 1 : 0) + (L.sig['broken:bug'] ? 1 : 0), 3] }, { label: 'Revenue', counter: 'revenue', money: true, optional: true }, { label: 'Launch U3 AI', sig: 'launch' }, { label: 'Meet in the heart zone', goal: true }],
      outro: { title: 'Launched', quote: 'From zero money to business owner. He still keeps the first invoice in his wallet, and he still calls her first.' },
      finale: { kind: 'celebrate', fireworks: true, lines: [[0.5, 'mohamed', 'U3 AI is real. We did it.'], [2.6, 'mariem', 'YOU did it. I just never doubted it.']] },
      killY: -12,
      build(L, P) {
        L.spawn('mohamed', 0, 0, 0.8); L.spawn('mariem', 2, 0, 0.8);
        L.counter('revenue', 'Revenue', 0, { optional: true });
        const deal = (x, y, z) => L.item('contract', x, y, z, { counter: 'revenue', value: 25000 });
        L.ground(-6, 37, -4, 4); L.ground(53, 82, -4, 4); L.ground(88.5, 106, -4, 4);
        frontRail(L, -6, 37, 4); frontRail(L, 53, 106, 4);
        L.invisible(-6.5, -6, 0, 8, -4, 4); L.invisible(106, 106.5, 0, 8, -4, 4);
        backWall(L, -6, 106, -4.2, 7, { top: G.mat('#2a2f55'), side: G.mat('#1d2142') });
        L.prop('neon', 4, 3.2, -4.1, { args: ['U3 AI', '#7ee0c3', 1.6] });
        L.sign('Founded by Mohamed Yousry', 4, 2.4, -3.9, { h: 0.24, bg: 'rgba(20,24,50,.9)', color: '#cfe7ff' });
        L.prop('robot', -3, 0, -2.5, { ry: 0.5 }); L.prop('monitor', 9, 0, -3.4); L.prop('monitor', 11, 0, -3.4);
        L.prop('serverRack', 13.5, 0, -3.5);
        L.memory('dayone', 9.5, 1.8, 1.8);
        heartsArc(L, 0, 7, 1.3, -1.6, 4); L.heart(22, 3.7, 2.3); heartsArc(L, 25, 31, 1.3, 2.6, 3); heartsArc(L, 55, 60, 1.3, 2, 3); heartsArc(L, 68, 78, 1.3, -2.8, 4, 0.3); heartsArc(L, 99, 104, 1.3, -2.8, 3);
        L.talk(2, 'mohamed', 'Back home. One laptop, one desk, one idea: U3 AI.');
        L.talk(5, 'mariem', 'And one person who never doubted it.');
        deal(6, 1.2, 2); deal(14, 1.2, 2);
        // server 1: freed by Mariem, pushed by Mohamed
        L.wall(15.6, 19.2, 0, 2.4, -1.2, -0.8);
        L.door('cage1|srv1', 19.2, 19.6, 0, 2.4, -4, -0.8, { label: 'LOCK', color: '#ff4f8b' });
        L.crate(17.4, -2.4, 0, { style: 'serverRack', args: [1.6], box: false, r: 0.6, h: 1.6 });
        L.box(21, 23, 0, 2.8, 1, 3.6, L.M.plat);
        L.plate('cage1', 22, 2.3, 2.8, { label: 'UNLOCK' });
        L.plate('srv1', 26, -2.4, 0, { heavy: true, label: 'POWER' });
        L.sign('Mariem unlocks · Mohamed pushes the server to POWER', 21, 3.6, -3.6, { h: 0.26 });
        L.door('srv1', 32, 33, 0, 4.4, -4, 4, { label: 'SERVER 1', color: '#7ee0c3' });
        L.box(32, 33, 4.4, 6, -4, 4, L.M.wall);
        L.checkpoint(34.5, -3);
        // data stream
        L.mover(38, 41, -1.4, -1, -1.5, 1.5, { dy: 2.4, period: 4, phase: 0 });
        L.mover(42.5, 45.5, -0.2, 0.2, -1.5, 1.5, { dy: 2.0, period: 4, phase: 0.5 });
        L.mover(47, 50, -1.2, -0.8, -1.5, 1.5, { dy: 2.2, period: 4, phase: 0.25 });
        L.box(50.6, 53, -0.4, 0, -1.5, 1.5, L.M.plat);
        L.hazard(38, 4.6, 0, { kind: 'bug', r: 0.55, dx: 12, period: 5 });
        deal(39.5, 2.6, 0); deal(44, 3.4, 0); deal(48.5, 2.6, 0);
        L.checkpoint(55, -3);
        // server 2: timed door
        L.box(62, 64, 0, 4.8, -4, -0.6, L.M.plat);
        L.plate('timer', 63, -2.3, 4.8, { latch: 5, label: '5 SEC' });
        L.sign('Toss her up, then RUN', 59.5, 2.2, -2.6, { h: 0.3 });
        L.door('timer|srv2', 66, 66.6, 0, 4.5, -4, 4, { label: 'SERVER ROOM 2', color: '#ff4f8b' });
        L.box(66, 66.6, 4.5, 6, -4, 4, L.M.wall);
        L.crate(69.4, 0, 0, { style: 'serverRack', args: [1.6], box: false, r: 0.6, h: 1.6 });
        L.plate('srv2', 76, 0, 0, { heavy: true, label: 'POWER' });
        L.door('srv2', 80, 80.6, 0, 4.5, -4, 4, { label: 'SERVER 2', color: '#7ee0c3' });
        L.box(80, 80.6, 4.5, 6, -4, 4, L.M.wall);
        deal(73, 1.2, -3); deal(73, 1.2, 3);
        L.checkpoint(81.5, -3);
        // server 3: dash + slam the bug
        L.plate('br', 90, -2.8, 0, { label: 'BRIDGE' });
        L.bridge('br', 82, 88.5, -0.4, 0, -1.5, 1.5, { color: '#7ee0c3', glow: true });
        L.sign('Mariem: double jump + dash across', 81, 2.2, -2.6, { h: 0.3 });
        L.breakable('bug', 91, 92.6, 0, 2, -0.8, 0.8, { label: 'BUG', color: '#ff4d6d' });
        L.prop('serverRack', 91.8, 0, -3.2, { args: [2.2, '#ff4d6d'] });
        L.sign('Mohamed: SLAM the bug', 89.5, 2.6, 2.6, { h: 0.3 });
        // launch
        L.plate('go1', 95, -2.2, 0, { label: 'LAUNCH' }); L.plate('go2', 95, 2.2, 0, { label: 'LAUNCH' });
        L.logic('servers', (s) => s.srv1 && s.srv2 && s['broken:bug']);
        L.logic('launch', (s, lv) => (lv._launch = lv._launch || (s.go1 && s.go2 && s.servers)));
        L.door('launch', 97.5, 98.1, 0, 4.5, -4, 4, { label: 'LAUNCH', color: '#ffcf6e' });
        L.box(97.5, 98.1, 4.5, 6, -4, 4, L.M.wall);
        L.prop('neon', 103, 3.4, -4.1, { args: ['LIVE', '#ff6f9c', 1.2] });
        L.memory('owner', 101, 1.7, 2.6);
        L.goalZone([{ x0: 99.5, x1: 104.5, z0: -2.2, z1: 2.2, label: 'Together' }], { req: 'launch' });
        L.anim.push(() => { if (L._launch && !L._launchFx) { L._launchFx = true; L.game.fireworks(new THREE.Vector3(102, 6, -2), 4); L.game.say('mohamed', 'U3 AI is LIVE!', 2.4); } });
      },
    },

    /* =================================================================== 11 */
    {
      id: 'family', num: 11, year: '2025', title: 'Asking for Her Hand', theme: 'family', music: 'family', money: 'savings',
      outfit: { mohamed: 'suit', mariem: 'dress' },
      intro: ['January 2025. He sat with her parents for the first time: her father Hossam, her mother Yara and her brother Mohamed.', 'He came with his father Ahmed and his mother Mervat. He had nothing yet, except a promise.', 'June: he graduated, and she was there with his family.', 'Then he worked and saved until there was just enough for the Fatiha.'],
      mission: 'Bring the flowers and sweets, take the lift up together, serve the tea, then save enough for the Fatiha and her gift.',
      objectives: [{ label: 'Flowers and sweets', counter: 'gifts' }, { label: 'Tea served', counter: 'tea' }, { label: 'Savings', counter: 'savings', money: true }, { label: 'Her gift (Mohamed)', counter: 'phone' }, { label: 'The Fatiha', goal: true }],
      outro: { title: 'The Fatiha', quote: '15 August 2025. Two families, one prayer, and a very nervous man holding an iPhone box he had wrapped twice.' },
      finale: { kind: 'pray', title: '15 August 2025', sub: 'The Fatiha', yaw: 0, lines: [[0.8, null, 'Al-Fatiha.'], [3.4, 'mohamed', '(This is real. This is really happening.)'], [5.8, 'mariem', 'An iPhone 13 Pro?! You\'re crazy.'], [8, 'mohamed', 'Crazy about you.']] },
      killY: -8,
      build(L, P) {
        L.spawn('mohamed', 0, 0, 0.8); L.spawn('mariem', 2, 0, 0.8);
        L.counter('gifts', 'Gifts', 2); L.counter('tea', 'Tea', 5); L.counter('savings', 'Savings', 8000); L.counter('phone', 'iPhone', 1);
        const tile = { top: G.mat('#e9e2d6', { r: 0.4 }), side: G.mat('#b9ae9c') };
        const floor = { top: LV.woodFloor('#c49a72', '#7a5a3a'), side: G.mat('#efe0cc') };
        L.ground(-6, 17, -4.5, 4.5, 0, { mat: tile });
        frontRail(L, -6, 114, 4.5); L.invisible(-6.5, -6, 0, 10, -5, 5); L.invisible(114, 114.5, 0, 14, -5, 5);
        backWall(L, -6, 114, -4.5, 11);
        // lobby
        L.sign('Building lobby · 5th floor: Hossam\'s family', 1, 2.6, -3.4, { h: 0.26 });
        L.box(3, 5.5, 0, 0.9, -4.4, -3, { top: G.mat('#f4efe7'), side: G.mat('#8f5f36') });
        L.item('flowers', 4.2, 1.5, -3.6, { counter: 'gifts' });
        L.box(7.5, 10, 2.2, 2.4, -4.4, -3.2, { top: G.mat('#ffffff'), side: G.mat('#e6d6c4') });
        L.item('sweets', 8.8, 2.8, -3.8, { counter: 'gifts' });
        L.talk(1, 'mohamed', 'Flowers, sweets, suit. Breathe. You can do this.');
        L.talk(4, 'mariem', '(whispering) They\'re upstairs. Don\'t be nervous. I\'m nervous.');
        heartsArc(L, 2, 12, 1.3, 2.4, 4);
        // the lift: both inside, gifts in hand
        L.box(14, 17, 0, 4.5, -4.5, -1.6, L.M.wall); L.box(14, 17, 0, 4.5, 1.6, 4.5, L.M.wall);
        L.box(17, 114, 0, 4.5, -4.5, 4.5, floor);
        L.logic('up', (s, lv) => (lv._up = lv._up || (s['count:gifts'] && bothIn(lv, 14, 17, -1.6, 1.6, 1))));
        L.elevator('up', 14.1, 16.9, -1.5, 1.5, 0.3, 4.5, { label: 'LIFT · 5' });
        L.sign('Both in the lift, with the gifts', 12.5, 2.4, 2.8, { h: 0.26 });
        // the living room
        L.checkpoint(19.5, 3, 4.5);
        const Y = 4.5;
        L.prop('rug', 31, Y, -1.2, { args: [12, 4, '#c4566c'] });
        L.prop('sofa', 22, Y, -3.6, { args: ['#8f6f9a'] }); L.prop('sofa', 40, Y, -3.6, { args: ['#8f6f9a'] });
        L.prop('plant', 18.5, Y, -3.8); L.prop('tv', 45, Y, -4.1);
        const tea = (x, z) => { L.box(x - 0.45, x + 0.45, Y, Y + 0.6, z - 0.35, z + 0.35, { top: G.mat('#f4efe7'), side: G.mat('#8f5f36') }); L.item('cup', x, Y + 1.0, z, { counter: 'tea' }); };
        L.npc('Ahmed', 24, Y, -2.8, { look: { gender: 'm', top: '#4a5a6a', bottom: '#2c2f3a', glasses: true, beardStyle: 'short' }, line: 'My son works harder than anyone I know. Anyone.', r: 2.4 });
        L.npc('Mervat', 26.6, Y, -3, { look: { gender: 'f', hijab: '#c4a07a', top: '#7a5a8a' }, line: 'We already love her. Look at her!', r: 2.4 });
        L.deco(MM.Props.velvetChair(), 31, Y, -3.45);
        L.npc('Hossam', 31, Y + 0.25, -3.2, { look: { gender: 'm', top: '#3a4a6a', bottom: '#2c2f3a', beardStyle: 'short' }, pose: 'sit', line: 'So, Mohamed. Tell me about your plans.', r: 2.6, dur: 3 });
        L.npc('Yara', 34.4, Y, -3, { look: { gender: 'f', hijab: '#b98a9a', top: '#8f6f9a' }, line: 'Tea? Juice? Eat something, habibi, you look nervous!', r: 2.4 });
        L.npc('Mohamed (her brother)', 37.4, Y, -2.8, { look: { gender: 'm', top: '#5aa9ff' }, line: 'Two Mohameds in one family? This is going to get confusing.', r: 2.4 });
        tea(22.6, 1.6); tea(26, 1.8); tea(29.4, 1.6); tea(33, 1.8); tea(36.6, 1.6);
        L.memory('parents', 31, Y + 1.6, 0.2);
        L.talk(20, 'mohamed', '(Smile. Sit up straight. Don\'t spill the tea.)');
        L.talk(30, 'mariem', 'Dad, this is Mohamed. He\'s... very serious about me.');
        // the answer: both stand in front of her father
        L.plate('ask', 41, -1.4, Y, { label: 'ASK' }); L.plate('smile', 41, 1.8, Y, { label: 'SMILE' });
        L.logic('blessing', (s, lv) => (lv._bless = lv._bless || (s.ask && s.smile && s['count:tea'])));
        L.anim.push(() => { if (L._bless && !L._blessSaid) { L._blessSaid = true; L.game.say('Hossam', 'We\'ll see, son. Work hard. Then come back.', 3); } });
        L.wall(44, 45, Y, 11, -4.5, -1.4); L.wall(44, 45, Y, 11, 1.4, 4.5); L.wall(44, 45, Y + 3, 11, -1.4, 1.4);
        L.door('blessing', 44.1, 44.9, Y, Y + 3, -1.4, 1.4, { label: 'JUNE 2025', color: '#c4566c' });
        heartsArc(L, 20, 40, Y + 1.3, 3.2, 6, 0.3);
        // his graduation
        L.checkpoint(46.5, -3, Y);
        const banner = G.textPlane('Faculty of Engineering · Class of 2025', 0.4, { color: '#ffffff', bg: '#2c3e66', size: 70, pad: 20 }); banner.position.set(56, Y + 5, -4.4); L.add(banner);
        L.box(52, 60, Y, Y + 1.2, -4.5, -1.5, { top: G.mat('#2c3e66'), side: G.mat('#1f2c4a') });
        L.item('gradcap', 56, Y + 2.0, -2.8, { who: 'mohamed', onTake: (lv) => lv.game.say('mariem', 'That\'s MY engineer!', 2.4) });
        L.memory('hisgrad', 58.5, Y + 2.2, -2.8);
        for (let x = 50; x < 62; x += 1.6) L.prop('schoolChair', x, Y, 2.6, { ry: Math.PI });
        L.talk(49, 'mohamed', 'She came. With my family. She\'s cheering louder than my mother.');
        // saving up
        L.checkpoint(63, -3, Y);
        L.sign('Saving for the Fatiha: just enough', 64.5, Y + 2.4, -3, { h: 0.28 });
        const egp = (x, y, z) => L.item('coin', x, y, z, { counter: 'savings', value: 1000 });
        egp(66, Y + 1.2, 1.5); egp(68, Y + 1.2, -1.5);
        L.box(70, 72, Y, Y + 1.4, -4.5, 4.5, { top: G.mat('#efdcc6'), side: G.mat('#b9946f') });
        egp(71, Y + 2.2, 0);
        L.box(74, 77, Y, Y + 4.6, -4.5, -1.2, { top: G.mat('#efdcc6'), side: G.mat('#b9946f') });
        egp(75.5, Y + 5.3, -2.8);
        L.sign('Toss her up', 73, Y + 2.4, 2.4, { h: 0.24 });
        egp(79, Y + 1.2, 2); egp(81, Y + 1.2, -2);
        // the bank: a low hatch for her, a door for him that only opens from inside
        L.box(82.5, 83.5, Y, Y + 7, -4.5, -1.2, L.M.wall);
        L.box(82.5, 83.5, Y + 1.45, Y + 7, -1.2, 1.2, L.M.wall);
        L.box(82.5, 83.5, Y + 4, Y + 7, 1.2, 4.5, L.M.wall);
        L.door('shop', 82.6, 83.4, Y, Y + 4, 1.2, 4.5, { label: 'BANK', color: '#ffcf6e' });
        egp(85, Y + 0.8, 0.4); egp(86.5, Y + 0.8, -1.6);
        L.plate('shop', 87, -2.6, Y, { label: 'OPEN' });
        L.sign('Only Mariem fits under. Open his door from the inside.', 81, Y + 2.2, -2.8, { h: 0.24 });
        // the phone shop
        L.checkpoint(89, -3, Y);
        L.wall(91, 92, Y, 11, -4.5, -1.4); L.wall(91, 92, Y, 11, 1.4, 4.5); L.wall(91, 92, Y + 3, 11, -1.4, 1.4);
        L.door('count:savings', 91.1, 91.9, Y, Y + 3, -1.4, 1.4, { label: 'PHONE SHOP', color: '#2f6fb3' });
        L.box(93, 96, Y, Y + 1, -4.4, -2.8, { top: G.mat('#ffffff'), side: G.mat('#2f6fb3') });
        L.item('iphone', 94.5, Y + 1.5, -3.0, { counter: 'phone', who: 'mohamed' });
        L.talk(93, 'mohamed', 'One iPhone 13 Pro, please. Gift wrapped. Twice.', { by: 'mohamed' });
        // the Fatiha
        L.prop('rug', 105, Y, 0, { args: [6, 4, '#8f1d2c'] });
        L.npc('Hossam', 101, Y, -3, { look: { gender: 'm', top: '#3a4a6a', bottom: '#2c2f3a', beardStyle: 'short' }, line: 'Welcome to the family, son.', r: 3 });
        L.npc('Yara', 103, Y, -3.3, { look: { gender: 'f', hijab: '#b98a9a', top: '#8f6f9a' }, pose: 'pray', nosolid: true });
        L.npc('Ahmed', 107, Y, -3.3, { look: { gender: 'm', top: '#4a5a6a', bottom: '#2c2f3a', glasses: true, beardStyle: 'short' }, pose: 'pray', nosolid: true });
        L.npc('Mervat', 109, Y, -3, { look: { gender: 'f', hijab: '#c4a07a', top: '#7a5a8a' }, pose: 'pray' });
        L.npc('Mohamed (her brother)', 111.5, Y, -1.5, { look: { gender: 'm', top: '#5aa9ff' }, ry: -0.6, line: 'Okay, okay. You can call me "the other Mohamed".', r: 2.4 });
        L.memory('fatiha', 99, Y + 1.6, 2.4);
        L.goalZone([{ x0: 102.5, x1: 107.5, z0: -1.6, z1: 1.8, y: Y, label: 'The Fatiha' }], { req: ['count:savings', 'count:phone'], reqText: 'Save EGP 8,000 and buy her gift' });
      },
    },

    /* =================================================================== 12 */
    {
      id: 'engaged', num: 12, year: '16 October 2025', title: 'Engaged in the Garden', theme: 'garden', music: 'garden',
      outfit: { mohamed: 'suit', mariem: 'dress' },
      intro: ['16 October 2025. The engagement: a garden under fairy lights.', 'Her dad Hossam drove them in his old maroon Chevrolet Lanos, the most famous car in the family.', 'A photo session, a ring, and a romantic dinner for two.', 'That night he met her grandmother, Teta Yousr. She held his hand and said: never, ever upset her.'],
      mission: 'Take 3 photos together (stand on the spot, press Love), find the ring, then dinner for two.',
      objectives: [{ label: 'Photo session', counter: 'photos' }, { label: 'The ring (Mohamed)', counter: 'ring' }, { label: 'Dinner for two', goal: true }],
      outro: { title: 'Engaged', quote: 'In front of everyone they love: a ring, a yes, and a grandmother\'s blessing.' },
      finale: { kind: 'kneel', at: [76, 0, 1.9], gap: 1.4, title: '16 October 2025', sub: 'Engaged', yesAt: 3.8, lines: [[1.0, 'mohamed', 'Mariem... in front of everyone we love: will you be mine, forever?'], [3.8, 'mariem', 'I\'ve been yours since school.']] },
      killY: -8,
      build(L, P) {
        L.spawn('mohamed', 2, 0, 1); L.spawn('mariem', 3.4, 0, 1);
        L.counter('photos', 'Photos', 3); L.counter('ring', 'Ring', 1);
        L.ground(-6, 90, -4, 4);
        frontRail(L, -6, 90, 4); L.invisible(-6.5, -6, 0, 10, -4, 4); L.invisible(90, 90.5, 0, 12, -4, 4);
        L.invisible(-6, 90, 0, 10, -4.6, -4.1);
        L.box(-6, 90, 0, 2.2, -5.2, -4.2, { top: G.mat('#4f8a4a'), side: G.mat('#3f7a3f') }, { noShadow: true });
        for (let x = 0; x < 90; x += 6) L.prop('stringLights', x + 3, 0, -3.9, { args: [6, 3.4] });
        const r = MM.rng(12);
        for (let x = -4; x < 90; x += 7) L.prop('tree', x + r() * 2, 0, -6.5, { args: [3 + r() * 2, ['#ffc9de', '#ffffff', '#ffb3d1'][Math.floor(r() * 3)]] });
        for (let x = -4; x < 90; x += 1.8) L.prop('flower', x, 0, 3.7, { args: [['#ff6f9c', '#ffffff', '#ffcf6e'][Math.floor(x) % 3]] });
        // the Lanos
        L.prop('lanos', -2, 0, -2.4, { ry: Math.PI / 2, solid: true });
        L.npc('Hossam', 1, 0, -3.2, { look: { gender: 'm', top: '#3a4a6a', bottom: '#2c2f3a', beardStyle: 'short' }, line: 'Out you get! The Lanos never fails. Usually.', r: 3 });
        L.memory('lanos', 5, 1.6, 2.2);
        L.talk(4, 'mariem', 'Everyone is here. EVERYONE. Is my hijab okay?');
        L.talk(7, 'mohamed', 'You\'re the most beautiful thing in this garden. And it\'s a garden.');
        heartsArc(L, 6, 12, 1.3, 1.6, 3);
        // photo 1: the flower wall
        L.deco(MM.Props.flowerWall('M ♥ M · 16.10.2025'), 15, 0, -3.8);
        L.photoSpot('p1', 15, -1.6, 0, { label: 'Photo 1 · stand here together, press Love' });
        L.checkpoint(20, 2.6);
        // Teta Yousr
        const chair = MM.Props.velvetChair(); L.deco(chair, 27, 0, -3, 0);
        L.npc('Teta Yousr', 27, 0.25, -3, { look: { gender: 'f', hijab: '#e8e1d4', top: '#6a5a7a', glasses: true }, pose: 'sit', line: 'Mohamed, my son. Never, ever upset her. She is my heart.', r: 3.2, dur: 4.2 });
        L.memory('yousr', 29, 1.6, -1.2);
        L.talk(24, 'mariem', 'Teta! This is him. This is Mohamed.');
        // photo 2: the fountain
        const fx = 38;
        L.box(fx - 2, fx + 2, 0, 0.6, -3.8, -0.6, { top: G.mat('#bfe6ff', { r: 0.1, m: 0.2 }), side: G.mat('#e8e1d4') });
        G.mesh(G.cyl(0.25, 0.4, 1.6, 12), G.mat('#e8e1d4'), fx, 1.4, -2.2, L.group);
        L.photoSpot('p2', fx, 0.9, 0, { label: 'Photo 2 · by the fountain' });
        heartsArc(L, 34, 42, 1.3, 2.8, 4);
        // photo 3: the arch
        L.checkpoint(44, 2.6);
        L.prop('weddingArch', 52, 0, -1.2, { ry: 0 });
        L.photoSpot('p3', 52, -0.6, 0, { label: 'Photo 3 · under the arch' });
        // the ring on the gazebo: her plate raises his lift
        L.box(60, 66, 0, 3.2, -4, -0.4, { top: G.mat('#ffffff'), side: G.mat('#e8d6c8') });
        L.plate('help', 57, 2.4, 0, { latch: 6, label: '6 SEC' });
        L.elevator('help', 57.6, 59.9, -3.6, -1.2, 0.3, 3.2, { label: 'LIFT' });
        L.item('ring', 63.5, 3.9, -2.2, { counter: 'ring', who: 'mohamed' });
        L.talk(56, 'mariem', 'What are you looking for up there?');
        L.talk(58, 'mohamed', 'Nothing! Flowers. I\'m looking at... flowers.');
        heartsArc(L, 60.5, 65.5, 4.2, -2.2, 3, 0.3);
        // dinner for two
        L.checkpoint(68, 2.6);
        L.prop('diningTable', 76, 0, 0, { args: [true], solid: true, top: 0.81, shrink: 0.1 });
        L.prop('velvetChair', 74.8, 0, 0, { ry: Math.PI / 2 }); L.prop('velvetChair', 77.2, 0, 0, { ry: -Math.PI / 2 });
        L.prop('bouquet', 76, 0.81, 0.2);
        [[-0.45, -0.3], [0.45, -0.3]].forEach(([dx, dz]) => { const c = MM.Props.candle(); c.scale.setScalar(0.6); L.deco(c, 76 + dx, 0.81, dz); c.userData.light(true); });
        L.prop('stringLights', 76, 0, 0, { args: [8, 3.6] });
        L.goalZone([{ x0: 73, x1: 79, z0: 1, z1: 3.4, label: 'Dinner for two' }], { req: ['count:photos', 'count:ring'], reqText: '3 photos and the ring first' });
        heartsArc(L, 70, 82, 1.3, 3, 5, 0.4);
      },
    },

    /* =================================================================== 13 */
    {
      id: 'teta', num: 13, year: 'Late 2025', title: 'For Teta Yousr', theme: 'yousr', music: 'yousr', rain: true, warmth: true, umbrella: true,
      outfit: { mohamed: 0, mariem: 0 },
      intro: ['Not long after the engagement, Teta Yousr passed away.', 'Mariem lost someone who loved her completely. He became her shoulder, her support, her back.', 'He remembered what Teta Yousr asked of him: never, ever upset her.'],
      mission: 'Walk with her by the sea. Stay close. Light 5 candles for Teta Yousr.',
      objectives: [{ label: 'Candles for Teta', counter: 'lights' }, { label: 'To the end of the pier', goal: true }],
      outro: { title: 'For Teta Yousr', quote: 'The rain stopped. A star came out. He held her until she was ready to go home.' },
      finale: { kind: 'hug', title: 'For Teta Yousr', sub: 'who trusted him with her granddaughter', lines: [[1.2, 'mariem', 'She loved you, you know.'], [3.6, 'mohamed', 'I\'ll keep my promise to her. Every single day.'], [6.2, null, 'Never, ever upset her.']] },
      killY: -8,
      build(L, P) {
        L.spawn('mohamed', 0, 0, 0.6); L.spawn('mariem', 1.4, 0, 0.6);
        L.counter('lights', 'Candles', 5);
        const stone = { top: new T.MeshStandardMaterial({ color: '#6f7690', roughness: 0.3, metalness: 0.2 }), side: G.mat('#484c62') };
        L.ground(-6, 66, -4, 4, 0, { mat: stone });
        frontRail(L, -6, 82, 4); L.invisible(-6.5, -6, 0, 10, -4, 4);
        L.invisible(-6, 66, 0, 10, -4.6, -4.2);
        L.water(-80, 200, -120, -4.4, -1.4);
        L.water(66, 200, -4.4, 60, -1.4);
        L.deco(MM.Props.cornicheRail(72), 30, 0, -4.3);
        for (let x = -2; x < 66; x += 8) L.prop('lampPost', x, 0, -3.8, { args: ['#ffd88a'] });
        const candle = (x, y, z) => L.item('flame', x, y, z, { counter: 'lights' });
        L.talk(1, 'mariem', 'I can\'t believe she\'s gone.');
        L.talk(3, 'mohamed', 'I\'m here. Lean on me. As long as you need.');
        L.sign('Stay close to her', 5, 2.4, -2.8, { h: 0.3 });
        L.box(9, 11.5, 0, 0.55, -3.5, -2.5, { top: G.mat('#7a5a40'), side: G.mat('#5a4030') });
        candle(10.2, 1.3, -3);
        heartsArc(L, 4, 14, 1.3, 1.6, 4);
        L.talk(14, 'mariem', 'She used to call me her little doctor.');
        // a kiosk roof: push the crate to climb
        L.crate(17, 1.6, 0, { label: 'MEMORIES' });
        L.box(22, 25, 0, 3.0, -4, 4, { top: G.mat('#565c78'), side: G.mat('#3e4260') });
        candle(23.5, 3.8, 0);
        L.sign('Push the crate, climb together', 19, 2.4, -2.8, { h: 0.26 });
        L.checkpoint(27, -3);
        // an old boat: only she fits underneath
        L.box(30, 36, 1.45, 2.4, -4, 4, { top: G.mat('#8a5a3a'), side: G.mat('#6a3a2a') });
        L.box(30, 36, 0, 2.4, -4, -2.6, { top: G.mat('#8a5a3a'), side: G.mat('#6a3a2a') });
        candle(33, 0.8, 0.5);
        L.box(27.8, 29.8, 0, 1.2, 1.4, 4, { top: G.mat('#8a5a3a'), side: G.mat('#6a3a2a') });
        L.talk(29, 'mohamed', 'I can\'t fit under there. I\'ll climb over.');
        L.talk(37, 'mohamed', 'She trusted me with you. I won\'t let her down.');
        L.memory('shoulder', 39, 1.6, 2.4);
        // a lamp ledge: toss her for the candle
        L.box(44, 46, 0, 4.4, -4, -2, { top: G.mat('#9aa0b8'), side: G.mat('#5a5f78') });
        candle(45, 5.1, -3);
        L.sign('Toss her up to the ledge', 42, 2.2, 2.6, { h: 0.26 });
        L.checkpoint(48, -3);
        candle(54, 1.4, 1.8);
        L.memory('promise', 58, 1.6, -2);
        heartsArc(L, 50, 64, 1.3, 2.4, 5, 0.4);
        // the pier
        L.box(66, 82, -0.3, 0, -1.8, 1.8, { top: LV.woodFloor('#8a6a4a', '#4a3020'), side: G.mat('#5a4030') });
        L.invisible(66, 82, 0, 6, -2.3, -1.8); L.invisible(66, 82, 0, 6, 1.8, 2.3); L.invisible(82, 82.5, 0, 8, -2, 2);
        for (let x = 67; x < 82; x += 3) [-1.7, 1.7].forEach((z) => G.mesh(G.cyl(0.12, 0.12, 2.6, 8), G.mat('#5a4030'), x, -0.6, z, L.group));
        const star = L.star(72, 17, -40, 'Teta Yousr'); star.visible = false;
        L.anim.push(() => {
          if (L.sig['count:lights'] && !L._calm) {
            L._calm = true; star.visible = true;
            if (L.rain) L.rain.lines.visible = false;
            L.game.fx.emit('sparkle', new T.Vector3(72, 6, -6), { n: 40, color: 0xfff1c4 });
            L.game.say(null, 'The rain stopped.', 2.4);
          }
        });
        L.goalZone([{ x0: 75, x1: 81, z0: -1.6, z1: 1.6, label: 'For Teta' }], { req: 'count:lights', reqText: 'Light 5 candles first' });
      },
    },

    /* =================================================================== 14 */
    {
      id: 'concerts', num: 14, year: '2026', title: 'The Best Feeling', theme: 'nile', music: 'ending', type: 'concert',
      outfit: { mohamed: 1, mariem: 0 },
      intro: ['Officially together, at last. They couldn\'t believe it: trips, dinners, rooftops.', 'He kisses her hands. He opens the car door for her. He holds her hand everywhere.', 'Then one night on the couch: the final episode of the final season of Stranger Things. Their first kiss. The best feeling of his life.', 'And then: Tul8te and Hamaki, live. Dancing from the heart.'],
      mission: 'On the couch: both press Love. Then the concerts: Mohamed plays the blue notes, Mariem the pink ones. Left and right, on the beat.',
      objectives: [{ label: 'Finale night', fn: (C) => [C.kissT != null ? 1 : 0, 1] }, { label: 'Tul8te, then Hamaki', fn: (C) => [Math.round(C.progress() * 100), 100], pct: true }],
      outro: { title: 'The best feeling', quote: 'A couch, a finale and a first kiss. Then two concerts and two voices singing every word, completely off key.' },
    },
  );

})(window.MM);
