/* Chapters 15-20: sea and sun, one year engaged, our home, ten exams, Dr. Mariem, forever. */
(function (MM) {
  'use strict';
  const G = MM.G, LV = MM.LV;
  const { frontRail, backWall, heartsArc } = LV;
  const T = THREE;

  MM.CHAPTERS.push(
    /* =================================================================== 15 */
    {
      id: 'summer', num: 15, year: 'Summer 2026', title: 'Sea & Sun', theme: 'sea', music: 'summer',
      outfit: { mohamed: 'summer', mariem: 'summer' },
      intro: ['13 July 2026: her birthday. A yacht, the open sea, just the two of them.', 'August: the North Coast. Sun, sand, and swimming together until sunset.'],
      mission: 'Light her 3 birthday candles and give her his gift. Then jump in, swim to Sahel and collect 6 seashells on the way.',
      objectives: [{ label: 'Birthday candles', counter: 'candles' }, { label: 'His gift', counter: 'gift' }, { label: 'Seashells', counter: 'shells' }, { label: 'Sunset in Sahel', goal: true }],
      outro: { title: 'Sea & sun', quote: 'A yacht for her birthday, a necklace with her name, and a summer that smelled like salt and sunscreen.' },
      finale: { kind: 'pose', at: [76, 0.32, -0.4], poses: { mohamed: 'sit-arm', mariem: 'sit' }, yaw: -Math.PI / 2, lines: [[0.6, 'mariem', 'Best summer of my life.'], [2.8, 'mohamed', 'You say that every summer.'], [5, 'mariem', 'And I\'m right every summer.']] },
      killY: -8,
      build(L, P) {
        L.spawn('mohamed', 0, 1.05, 0.6); L.spawn('mariem', 1.4, 1.05, 0.6);
        L.counter('candles', 'Candles', 3); L.counter('gift', 'Gift', 1); L.counter('shells', 'Shells', 6);
        L.water(-120, 260, -120, 120, -0.02);
        // the yacht
        const white = { top: LV.woodFloor('#c7925a', '#7a4f2a'), side: G.mat('#fbfbf8', { r: 0.35 }) };
        L.box(-4, 26, -3, 1.0, -2.6, 2.6, white);
        L.box(-4.6, 26.4, 0.2, 0.42, -2.66, 2.66, G.mat('#1f3fbf'), { nosolid: true });
        L.invisible(-4.5, 26, 1, 5, -3.1, -2.6); L.invisible(-4.5, 26, 1, 5, 2.6, 3.1); L.invisible(-5, -4.5, 1, 5, -3, 3);
        for (let x = -4; x <= 25; x += 1.45) [-2.5, 2.5].forEach((z) => G.mesh(G.cyl(0.03, 0.03, 0.8, 6), G.mat('#c9ccd3', { m: 0.8 }), x, 1.4, z, L.group));
        L.box(2, 8, 1.0, 3.0, -2.6, -0.6, { top: G.mat('#fbfbf8'), side: G.mat('#fbfbf8') });
        L.box(2.4, 7.6, 1.8, 2.6, -0.62, -0.58, G.mat('#1c2a44', { r: 0.1, m: 0.4 }), { nosolid: true });
        L.box(15, 19, 1.0, 4.8, -2.6, -0.8, { top: G.mat('#fbfbf8'), side: G.mat('#e8ecf2') });
        const cake = MM.Props.cake(); cake.scale.setScalar(0.7); L.deco(cake, 11, 1.85, 1.4);
        L.box(10.2, 11.8, 1.0, 1.85, 0.8, 2.0, { top: G.mat('#ffffff'), side: G.mat('#c7925a') });
        L.sign('Happy birthday, Mariem · 13.07.2026', 11, 3.2, 2.2, { h: 0.28, post: false });
        const candle = (x, y, z) => L.item('flame', x, y, z, { counter: 'candles' });
        candle(11, 2.7, 1.4); candle(5, 3.7, -1.6); candle(17, 5.5, -1.7);
        L.sign('Toss her up to the top deck', 14, 3.2, 1.6, { h: 0.24, post: false });
        L.box(21, 22.6, 1.0, 1.8, -2.4, -1.2, { top: G.mat('#ffffff'), side: G.mat('#c7925a') });
        L.item('necklace', 21.8, 2.5, -1.8, { counter: 'gift', who: 'mohamed', onTake: (lv) => lv.game.say('mariem', 'My name... in gold? MOHAMED.', 2.6) });
        L.memory('yacht', 8.5, 2.6, 1.6);
        L.talk(1, 'mohamed', 'Happy birthday. The whole sea is yours today.');
        L.talk(3, 'mariem', 'A YACHT? Who are you and what did you do with my koshari guy?');
        heartsArc(L, -2, 8, 2.3, 1.5, 4, 0.4);
        // birthday wish: both press, then the swim gate opens
        L.plate('w1', 23.5, -1.6, 1.0, { label: 'WISH' }); L.plate('w2', 23.5, 1.6, 1.0, { label: 'WISH' });
        L.logic('bday', (s, lv) => (lv._bday = lv._bday || (s.w1 && s.w2 && s['count:candles'])));
        L.door('bday', 25, 25.4, 1.0, 4, -2.6, 2.6, { label: 'SWIM →', color: '#2f6fb3' });
        L.anim.push(() => { if (L._bday && !L._bdayFx) { L._bdayFx = true; L.game.fireworks(new T.Vector3(14, 9, -6), 4); L.game.say('mariem', 'Last one in the water buys koshari!', 2.6); } });
        // August: swim to Sahel
        L.waterZone(26, 61, -4.5, 4.5, 0, -3, { color: '#3fc4e0' });
        L.invisible(26, 61, -3, 6, -5, -4.5); L.invisible(26, 61, -3, 6, 4.5, 5);
        const shell = (x, z) => L.item('shell', x, -0.45, z, { counter: 'shells' });
        shell(30, -1.5); shell(34, 1.8); shell(38, -2.2); shell(43, 0.8); shell(47, -1.4); shell(52, 2);
        for (let i = 0; i < 6; i++) L.prop('coral', 30 + i * 5, -3, i % 2 ? -3.4 : 3.4, { args: [i + 1] });
        L.sign('August 2026 · North Coast →', 30, 2.2, -3.6, { h: 0.3, post: false });
        heartsArc(L, 29, 55, 0.3, 0, 6, 0.6);
        // a gentle stair out of the sea onto the beach
        const sand = { top: G.mat('#f4e2b4'), side: G.mat('#d4bb84') };
        for (let i = 0; i < 9; i++) L.box(52 + i, 53 + i, -3, -2.4 + i * 0.3, -4.5, 4.5, sand);
        L.box(61, 92, -3, 0.3, -4.5, 4.5, sand);
        frontRail(L, 52, 92, 4.5); L.invisible(52, 92, 0, 8, -5, -4.5); L.invisible(92, 92.5, 0, 10, -5, 5);
        L.prop('beachUmbrella', 76, 0.3, -2.2, { args: ['#ff6f9c'] }); L.prop('beachUmbrella', 84, 0.3, -2.6, { args: ['#ffcf6e'] });
        for (let x = 64; x < 92; x += 6) L.prop('palm', x, 0.3, -4, { args: [3.6] });
        L.box(73.5, 75.5, 0.3, 0.34, -1.4, 0.4, G.mat('#ff9cc0'), { nosolid: true });
        L.box(76.5, 78.5, 0.3, 0.34, -1.4, 0.4, G.mat('#7ee0c3'), { nosolid: true });
        L.memory('sahel', 68, 1.8, 1.6);
        L.sign('Sahel', 64, 2.4, -3, { h: 0.34 });
        L.goalZone([{ x0: 73, x1: 79, z0: -1.6, z1: 1.4, y: 0.3, label: 'Sunset' }], { req: ['count:candles', 'count:gift', 'count:shells'], reqText: 'Candles, his gift and 6 shells' });
      },
    },

    /* =================================================================== 16 */
    {
      id: 'anniversary', num: 16, year: '16 October 2026', title: 'One Year Engaged', theme: 'nile', music: 'anniversary',
      outfit: { mohamed: 'suit', mariem: 'dress' },
      intro: ['16 October 2026. One year engaged.', 'He booked the fanciest hotel in Alexandria: a restaurant over the water, blue velvet chairs, warm lamps.', 'He kisses her hands. He opens every door for her. And tonight, there\'s one more surprise.'],
      mission: 'Light the 4 candles and find his gift before dinner. Mariem: no peeking.',
      objectives: [{ label: 'Light the candles', counter: 'candles' }, { label: 'Find the gift (Mohamed)', counter: 'gift' }, { label: 'Rose petals', counter: 'petals', optional: true }, { label: 'Our table', goal: true }],
      outro: { title: 'One year', quote: 'One year engaged. He still opens her door. She still pretends she can\'t open it herself.' },
      finale: { kind: 'hug', at: [56, 4.3, 1.9], gap: 1.3, fireworks: true, title: 'One year engaged', sub: '16.10.2026', lines: [[1, 'mohamed', 'One year. The best year of my life.'], [3.4, 'mariem', 'Every year is going to be the best year. That\'s the deal.']] },
      killY: -3,
      build(L, P) {
        const deck = { top: new THREE.MeshStandardMaterial({ map: (() => { const t = G.woodTex('#a8693c', '#5a2d12').clone(); t.needsUpdate = true; return t; })(), roughness: 0.4 }), side: G.mat('#6e3b1d') };
        const deck2 = { top: new THREE.MeshStandardMaterial({ map: (() => { const t = G.woodTex('#b4743f', '#5a2d12').clone(); t.needsUpdate = true; return t; })(), roughness: 0.4 }), side: G.mat('#f2ece4') };
        L.spawn('mohamed', 0, 0, 0.8); L.spawn('mariem', 2, 0, 0.8);
        L.counter('candles', 'Candles', 4); L.counter('gift', 'Gift', 1); L.counter('petals', 'Petals', 12, { optional: true });
        L.water(-80, 160, -90, 60, -1.5);
        L.ground(-4, 29, -4.5, 4.5, 0, { mat: deck });
        L.box(-4, 62, -2, -0.02, -4.6, 4.6, { top: G.mat('#ffffff'), side: G.mat('#f4efe7') }, { nosolid: true });
        frontRail(L, -4, 62, 4.5); L.invisible(-4.5, -4, 0, 9, -5, 5); L.invisible(62, 62.5, 0, 12, -5, 5);
        // back wall with river windows, valance and the wooden pillars with sconces (like the photos)
        L.box(-4, 29, 0, 4, -5.5, -4.5, { top: G.mat('#f6f1ea'), side: G.mat('#efe7dc') });
        for (let x = -2; x < 28; x += 3.3) L.prop('riverWindow', x, 0.9, -4.45, { args: [2.8, 2.2] });
        L.prop('valance', 12.5, 3.25, -4.35, { args: [33] });
        L.prop('pillarSconces', 9, 0, -3.9, { args: [4], solid: true, shrink: 0.32 });
        L.prop('pillarSconces', 22, 0, -3.9, { args: [4], solid: true, shrink: 0.32 });
        // blue LED cove
        const cove = new THREE.Mesh(new THREE.BoxGeometry(33, 0.08, 0.2), G.mat('#5a6bff', { e: '#5a6bff', ei: 2 })); cove.position.set(12.5, 4.05, -4.4); L.add(cove);
        // tables with blue velvet chairs
        [[5, -2], [14, 1.6], [19, -2.2]].forEach(([x, z]) => {
          L.prop('diningTable', x, 0, z, { solid: true, top: 0.81, shrink: 0.1 });
          L.prop('velvetChair', x - 1.1, 0, z, { ry: Math.PI / 2 }); L.prop('velvetChair', x + 1.1, 0, z, { ry: -Math.PI / 2 });
        });
        L.talk(2, 'mohamed', '(whispering) Okay. The gift\'s hidden upstairs. Act natural.');
        L.talk(5, 'mariem', 'Why is he acting so... natural?');
        L.talk(12, 'mohamed', 'Wait. Which deck did I hide it on? WHERE IS THE GIFT?');
        const petal = (x, y, z) => L.item('petal', x, y, z, { counter: 'petals' });
        petal(3, 0.6, 2.5); petal(7.5, 1.2, 2.8); petal(11, 0.6, 0); petal(17, 1.4, 3.5); petal(24, 0.6, 2);
        L.item('flame', 5, 1.5, -2, { counter: 'candles' });
        L.item('flame', 9, 3.2, -2.5, { counter: 'candles' });
        L.memory('anniversary', 14, 1.9, 1.6);
        heartsArc(L, 1, 11, 1.3, 0.6, 5); heartsArc(L, 16, 24, 1.3, 3.4, 4); heartsArc(L, 31, 36, 1.2, 0.5, 3); heartsArc(L, 40, 52, 5.6, -0.6, 6, 0.6);
        L.checkpoint(24, 3.4);
        // kitchen under the upper deck, with a low service hatch only Mariem fits through
        L.box(29, 30, 0, 4.3, -4.5, 2, L.M.wall); L.box(29, 30, 1.45, 4.3, 2, 4, L.M.wall); L.box(29, 30, 0, 4.3, 4, 4.5, L.M.wall);
        L.box(30, 37.5, 3.9, 4.3, -4.5, 4.5, deck2);
        L.ground(29, 37.5, -4.5, 4.5, 0, { mat: { top: G.mat('#d9d4cc'), side: G.mat('#6e3b1d') } });
        L.box(30, 37.5, 0, 3.9, 4.5, 4.8, G.mat('#bfe6ff', { t: true, o: 0.18 }));
        L.box(30, 37.5, 0, 3.9, -5.5, -4.5, G.mat('#efe7dc'));
        L.prop('fridge', 31, 0, -3.9); L.prop('mug', 33, 0.9, -3.9, { args: ['#ffffff', 0.4] });
        L.box(32, 36, 0, 0.9, -4.5, -3.2, { top: G.mat('#f4efe7'), side: G.mat('#b98a56') });
        L.sign('HOTEL KITCHEN · staff only', 29.5, 2.4, 4.55, { h: 0.24, post: false });
        L.plate('lift', 34.5, 2.4, 0, { latch: 8, label: 'STAFF LIFT' });
        petal(33, 0.6, 0.5); petal(36, 0.6, -1.5);
        L.talk(28, 'mariem', 'Babe? Why do you need the staff lift?');
        // staff lift for Mohamed, and a button upstairs so he can bring her up after
        L.elevator('lift|helper', 25.4, 28.95, -4.3, -1.4, 0.3, 4.3, { label: 'STAFF LIFT', mat: { top: G.mat('#d6b25a', { m: 0.5, r: 0.4 }), side: G.mat('#8a6a2a') } });
        // upper deck
        L.box(37.5, 62, 0, 4.3, -4.5, 4.5, deck2);
        L.invisible(29, 62, 4.3, 12, -5, -4.5);
        L.plate('helper', 31.5, 2.6, 4.3, { heavy: true, label: 'LIFT' });
        L.sign('Mohamed: hold LIFT to bring her up', 33, 5.8, -3.6, { h: 0.26 });
        L.checkpoint(39, -3.6, 4.3);
        L.item('gift', 45, 5.1, -2.6, { counter: 'gift', who: 'mohamed', sub: '#1f3fbf' });
        L.trigger(44, 46, -4, -1, (lv, game) => game.say('mohamed', 'Found it. Breathe. Just breathe.', 2.4));
        for (let x = 40; x < 62; x += 5) { L.prop('stringLights', x + 2.5, 4.3, -4.3, { args: [5, 3.2] }); L.prop('stringLights', x + 2.5, 4.3, 4.3, { args: [5, 3.2] }); }
        for (let x = 38; x < 62; x += 3) { L.prop('fence', x + 1.5, 4.3, -4.45, { args: [3, '#f4efe7'] }); }
        L.prop('plant', 38.5, 4.3, -3.6); L.prop('plant', 60.5, 4.3, 3.6);
        petal(41, 5, 2.5); petal(48, 5.8, 0); petal(51, 5, -3); petal(56, 5, 3.2); petal(43, 6.6, 0.5);
        L.item('flame', 50, 6.5, 2.2, { counter: 'candles' });
        L.item('flame', 31, 5.6, -1.5, { counter: 'candles' });
        L.memory('gentleman', 47, 5.9, 3.2);
        // the table for two
        const tbl = L.prop('diningTable', 56, 4.3, 0, { args: [false], solid: true, top: 4.3 + 0.81, shrink: 0.1 });
        L.prop('velvetChair', 54.8, 4.3, 0, { ry: Math.PI / 2 }); L.prop('velvetChair', 57.2, 4.3, 0, { ry: -Math.PI / 2 });
        L.prop('bouquet', 56, 5.11, 0.2);
        const candles = [];
        [[-0.45, -0.35], [0.45, -0.35], [-0.45, 0.35], [0.45, 0.35]].forEach(([dx, dz]) => { const c = MM.Props.candle(); c.scale.setScalar(0.6); L.deco(c, 56 + dx, 5.11, dz); candles.push(c); });
        L.anim.push(() => { const n = L.counters.candles.n; candles.forEach((c, i) => c.userData.light(i < n)); });
        // river at night: far bank lights, a bridge, the moon
        const lights = new THREE.Group();
        const rr = MM.rng(5);
        for (let i = 0; i < 160; i++) { const m = new THREE.Mesh(G.box(0.5, 0.5, 0.5), G.basic(rr() < 0.6 ? '#ffd28a' : '#9fc8ff')); m.position.set(-60 + rr() * 220, 0.5 + rr() * 9, -70 - rr() * 15); lights.add(m); }
        L.add(lights);
        for (let x = -40; x < 140; x += 14) L.prop('skyscraper', x, 0, -88, { args: [8, 8 + rr() * 18, 6, '#22264a', Math.floor(rr() * 9)] });
        const br = new THREE.Mesh(new THREE.BoxGeometry(200, 1, 4), G.mat('#2a2848')); br.position.set(40, 7, -55); L.add(br);
        for (let x = -50; x < 140; x += 6) { const b = new THREE.Mesh(G.sphere(0.25, 8, 6), G.basic('#ffe2a0')); b.position.set(x, 7.8, -53); L.add(b); }
        L.prop('moon', -20, 40, -120, { args: [8] });
        L.goalZone([{ x0: 53.2, x1: 58.8, z0: -2.4, z1: 2.4, y: 4.3, label: 'Our table' }], { req: ['count:candles', 'count:gift'], reqText: 'Light 4 candles and find the gift' });
      },
    },

    /* =================================================================== 17 */
    {
      id: 'home', num: 17, year: '21 October 2026', title: 'Our Home', theme: 'home', music: 'home',
      intro: ['21 October 2026. They walked into the home they had been dreaming of.', 'Two days later, it was theirs. A home in Alexandria.', 'Now: finishing, paint, decor, furniture, style. Two very different opinions about every single wall.'],
      mission: 'Pick the wall colour together (both stand on the same swatch). Mohamed moves the furniture onto the rugs, Mariem finds the decor. Then lights on, together.',
      objectives: [{ label: 'Wall colour, together', sig: 'painted:living' }, { label: 'Furniture in place', fn: (L) => [(L.sig.sofa ? 1 : 0) + (L.sig.dining ? 1 : 0) + (L.sig.bed ? 1 : 0), 3] }, { label: 'Decor pieces', counter: 'decor' }, { label: 'Lights on', sig: 'lights' }, { label: 'Our first night home', goal: true }],
      outro: { title: 'Home', quote: 'The sofa ended up where she wanted it. He says it was his idea. The walls are her colour. He says that was his idea too.' },
      finale: { kind: 'hug', lines: [[0.8, 'mariem', 'We\'re home.'], [2.8, 'mohamed', 'Our home.']] },
      killY: -10,
      build(L, P) {
        L.spawn('mohamed', 0, 0, 0.8); L.spawn('mariem', 2, 0, 0.8);
        L.counter('decor', 'Decor', 6);
        const floor = { top: new THREE.MeshStandardMaterial({ map: (() => { const t = G.woodTex('#e2b98c', '#9a6a40').clone(); t.needsUpdate = true; return t; })(), roughness: 0.5 }), side: G.mat('#a97b52') };
        L.ground(-4, 40, -4.5, 4.5, 0, { mat: floor });
        frontRail(L, -4, 58, 4.5); L.invisible(-4.5, -4, 0, 10, -5, 5); L.invisible(58, 58.5, 0, 12, -5, 5);
        const paintMat = new THREE.MeshStandardMaterial({ color: '#f6ede3', roughness: 0.9 });
        backWall(L, -4, 58, -4.5, 8.5, { top: G.mat('#ffffff'), side: paintMat });
        // choose the wall colour together: both on the same swatch
        L.paintRoom('living', 0, [{ color: '#f3d2c1', x: -2.6, z: -2.6, name: 'Peach' }, { color: '#cfe3ef', x: -0.4, z: -2.6, name: 'Sky blue' }, { color: '#e6dcf2', x: 1.8, z: -2.6, name: 'Lavender' }], [paintMat]);
        L.sign('Pick the wall colour: both on the SAME swatch', -0.4, 2.6, -1.2, { h: 0.24, post: false });
        L.memory('paint', -1.2, 1.7, 2.4);
        [3, 10, 25, 46, 53].forEach((x, i) => L.prop('bigWindow', x, i < 3 ? 1.2 : 4.8, -4.55, { args: [2.6, 2.2, '#ffe9c8'] }));
        // living room
        L.prop('rug', 10, 0, -2.4, { args: [3, 3, '#e8c6a8'] });
        L.plate('sofa', 10, -2.4, 0, { heavy: true, w: 2.4, d: 2.4, label: 'SOFA HERE', color: '#ffb3c8' });
        L.crate(4.5, 2, 0, { style: 'sofa', args: ['#d9a7b4'], r: 1.0, h: 1.15, box: false });
        L.prop('bookshelf', 6, 0, -4, { solid: true });
        L.item('decor', 6, 2.7, -4, { counter: 'decor', sub: 'plant' });
        L.box(13, 15, 3.1, 3.3, -4.5, -3.6, { top: G.mat('#ffffff'), side: G.mat('#e6d6c4') });
        L.item('decor', 14, 3.85, -4, { counter: 'decor', sub: 'frame' });
        L.prop('tv', 16, 0, -3.9, { solid: true });
        L.memory('keys', 1.5, 1.7, -2.2);
        heartsArc(L, 1, 9, 1.3, 3.6, 4); heartsArc(L, 20, 30, 1.3, -2.6, 4); heartsArc(L, 41, 50, 5, 0.6, 4, 0.4); heartsArc(L, 52, 57, 5, -3.4, 3, 0.3);
        L.sign('Push the sofa onto its rug (gold button)', 6.5, 2.6, 1.8, { h: 0.26, post: false });
        L.talk(1, 'mariem', 'Okay. Peach walls. Or sky blue. Or... lavender?');
        L.talk(4, 'mohamed', 'Whatever you pick. (Please not lavender.)');
        L.talk(7, 'mariem', 'Sofa goes by the window. No, the other window.');
        L.talk(9, 'mohamed', 'Babe. It weighs two hundred kilos.');
        // partition
        L.wall(18, 18.6, 0, 8, -4.5, -1.6); L.wall(18, 18.6, 3.2, 8, -1.6, 1.6); L.wall(18, 18.6, 0, 8, 1.6, 4.5);
        // dining + kitchen
        L.prop('rug', 28, 0, 0, { args: [3, 3, '#cfe0f0'] });
        L.plate('dining', 28, 0, 0, { heavy: true, w: 2.4, d: 2.4, label: 'TABLE HERE', color: '#9fc8ff' });
        L.crate(22, 0, 0, { style: 'diningSet', r: 1.0, h: 0.9, box: false });
        L.prop('fridge', 32, 0, -3.9, { solid: true });
        L.item('decor', 32, 2.9, -3.9, { counter: 'decor', sub: 'vase' });
        L.box(20, 22.4, 0, 0.9, 3.4, 4.5, { top: G.mat('#f4efe7'), side: G.mat('#b98a56') });
        L.item('decor', 21.2, 1.5, 3.9, { counter: 'decor', sub: 'lamp' });
        L.talk(20, 'mariem', 'This is OUR kitchen. Ours!');
        L.checkpoint(24, -3.6);
        // stairs up to the bedroom
        for (let i = 0; i < 9; i++) L.box(34 + i * 0.66, 34 + (i + 1) * 0.66, 0, 0.4 * (i + 1), -4.5, -0.5, { top: G.mat('#f1d9bf'), side: G.mat('#c9a27c') });
        L.box(34, 40, 0, 3.6, -0.5, 4.5, L.M.wall);
        L.box(40, 58, 0, 3.6, -4.5, 4.5, { top: floor.top, side: G.mat('#efe3d4') });
        L.talk(34, 'mohamed', 'Race you upstairs.');
        L.checkpoint(41, -3.6, 3.6);
        // bedroom
        L.box(43, 47, 5.05, 5.35, -4.5, -1.5, { top: G.mat('#f4efe7'), side: G.mat('#b98a56') });
        [[43.1, -4.4], [46.9, -4.4], [43.1, -1.6], [46.9, -1.6]].forEach(([x, z]) => L.box(x - 0.1, x + 0.1, 3.6, 5.05, z - 0.1, z + 0.1, G.mat('#b98a56'), { nosolid: false }));
        L.item('decor', 45, 4.2, -3.2, { counter: 'decor', sub: 'cushion' });
        L.box(47.5, 49.5, 6.5, 6.7, -4.5, -3.6, { top: G.mat('#ffffff'), side: G.mat('#e6d6c4') });
        L.item('decor', 48.5, 7.2, -4, { counter: 'decor', sub: 'clock' });
        L.prop('rug', 51, 3.6, -2.2, { args: [3, 3, '#f3d1dc'] });
        L.plate('bed', 51, -2.2, 3.6, { heavy: true, w: 2.4, d: 2.4, label: 'BED HERE', color: '#ffcf6e' });
        L.crate(45, 2.6, 3.6, { style: 'bed', r: 1.0, h: 1.1, box: false });
        L.memory('pinterest', 47, 5.1, 2.8);
        // lights: two switches at once
        L.plate('lightA', 42, 3, 3.6, { label: 'LIGHTS' }); L.plate('lightB', 56, -3, 3.6, { label: 'LIGHTS' });
        L.logic('lights', (s, lv) => (lv._lights = lv._lights || (s.lightA && s.lightB)));
        const lamps = [];
        [6, 14, 26, 44, 52].forEach((x, i) => { const y = i < 3 ? 7.4 : 8.2; const b = new THREE.Mesh(G.sphere(0.35, 12, 10), G.mat('#fff5df', { e: '#ffd88a', ei: 0.1 }).clone()); b.position.set(x, y, 0); L.add(b); lamps.push(b); });
        L.anim.push(() => { if (L._lights && !L._lit) { L._lit = true; lamps.forEach((b) => { b.material.emissiveIntensity = 2.2; }); L.hemi.intensity *= 1.25; L.game.fx.emit('sparkle', new THREE.Vector3(48, 7, 0), { n: 30 }); MM.Audio.sfx('complete'); } });
        L.prop('plant', 57, 3.6, -3.8); L.prop('plant', 40.8, 3.6, 3.8);
        L.goalZone([{ x0: 52, x1: 56.5, z0: 0.6, z1: 4.2, y: 3.6, label: 'Our first night home' }], { req: ['painted:living', 'sofa', 'dining', 'bed', 'lights', 'count:decor'], reqText: 'Wall colour, furniture, 6 decor pieces, then lights' });
      },
    },

    /* =================================================================== 18 */
    {
      id: 'exams', num: 18, year: 'Autumn 2026', title: 'Ten Exams, One Car', theme: 'drive', music: 'drive0', type: 'drive',
      corniche: true, exams: 10, carColor: '#d9dde3', finish: 'faculty', finishText: 'Last exam: done!', startSign: 'Our first car · 10 exams to go',
      intro: ['They chose their first car together at the showroom: economical, sensible, and completely theirs.', 'Exam season. Ten exams. He drove her to every single one, waited outside, and took her to the cinema after each.', 'He plays the songs. They dance in their seats. She controls the radio, obviously.'],
      mission: 'Mohamed steers (left/right) and hops (jump). Mariem switches the radio so it matches the colour of the notes. Drive through all 10 exam gates along the Corniche. Popcorn = cinema dates.',
      objectives: [{ label: 'Exams done', fn: (D) => [D.examsDone || 0, 10] }, { label: 'Cinema popcorn', fn: (D) => [D.popcorn || 0, 20], optional: true }, { label: 'To the faculty', fn: (D) => [Math.round(D.progress() * 100), 100], pct: true }],
      outro: { title: 'Ten for ten', quote: 'Ten exams, ten drives, ten cinema dates. The car still smells like popcorn.' },
      memoryOnFinish: ['firstcar', 'tenexams'],
    },

    /* =================================================================== 19 */
    {
      id: 'med', num: 19, year: '12 December 2026', title: 'Dr. Mariem', theme: 'med', music: 'med',
      outfit: { mohamed: 'suit', mariem: 'coat' },
      intro: ['12 December 2026, 12 o\'clock. Faculty of Medicine, Alexandria.', 'Years of anatomy, night shifts, coffee and daily calls.', 'Today she graduates: the smartest doctor he has ever met. His pride. The best choice of his life.'],
      mission: 'Bring Mariem 5 coffees and get her to the graduation stage.',
      objectives: [{ label: 'Coffees delivered', counter: 'coffee' }, { label: 'Reach the graduation stage', goal: true }],
      outro: { title: 'Dr. Mariem', quote: 'Congratulations, Dr. Mariem. He cheered so loud the dean looked over. He would do it again.' },
      finale: { kind: 'cap', lines: [[0.3, 'mohamed', 'DR. MARIEM! That\'s my fiancée!'], [2.8, 'mariem', 'We did it.'], [4.6, 'mohamed', 'YOU did it. I just brought the coffee.']] },
      killY: -10,
      build(L, P) {
        L.spawn('mohamed', 0, 0, 0.8); L.spawn('mariem', 2, 0, 0.8);
        L.counter('coffee', 'Coffee', 5);
        const cof = (x, y, z) => L.item('coffee', x, y, z, { counter: 'coffee' });
        L.ground(-4, 37, -4, 4); L.ground(53, 82, -4, 4);
        frontRail(L, -4, 37, 4); frontRail(L, 53, 82, 4);
        L.invisible(-4.5, -4, 0, 8, -4, 4); L.invisible(82, 82.5, 0, 12, -4, 4);
        backWall(L, -4, 82, -4.2, 7);
        // library
        L.prop('bigBook', 2, 0, -3.2, { args: ['#5aa9ff', 'ANATOMY', 3, 1.2, 1.6] });
        L.prop('bigBook', 6, 0, -3.2, { args: ['#ff6f9c', 'PHARMA', 3, 0.9, 1.6] });
        L.crate(4, 0.5, 0, { label: 'BOOK CART', color: '#9fd3c9', trim: '#4f8f84' });
        L.box(9, 16, 0, 2.8, -4, 4, { top: G.mat('#ffffff'), side: G.mat('#5aa9ff') });
        for (let x = 9.5; x < 16; x += 1.6) L.prop('bigBook', x, 2.8, -3.4, { args: [['#ff6f9c', '#7ee0c3', '#ffcf6e', '#c59cff'][Math.floor(x) % 4], '', 1.3, 2.2, 0.5], ry: Math.PI / 2 });
        cof(12, 3.5, 1.8);
        L.memory('studynights', 14.5, 3.6, -1.5);
        L.talk(1, 'mohamed', 'Graduation day. My job: coffee, flowers, and being the loudest one here.');
        L.talk(4, 'mariem', 'Anatomy, pharmacology, surgery... I\'ve got this. I\'ve GOT this.');
        L.sign('Push the book cart to climb the shelf', 5, 2.4, 2.6, { h: 0.26, post: false });
        // heartbeat corridor
        L.checkpoint(17.5, -3);
        L.prop('ecgMonitor', 22, 0, -3.6); L.prop('ecgMonitor', 31, 0, -3.6);
        L.sign('Jump the heartbeat!', 18.5, 2.4, 2.6, { h: 0.3, post: false });
        L.hazard(34, 0.28, 0, { kind: 'bar', w: 0.3, h: 0.5, d: 7.8, dx: -14, period: 3.4, linear: true });
        L.hazard(34, 0.28, 0, { kind: 'bar', w: 0.3, h: 0.5, d: 7.8, dx: -14, period: 3.4, phase: 0.5, linear: true });
        cof(27, 1.5, 2.4);
        heartsArc(L, 20, 34, 1.4, -1.5, 5, 0.3);
        // pill pit
        L.checkpoint(35.5, -3);
        L.mover(37.5, 40.8, -0.4, 0.5, -0.9, 0.9, { mesh: MM.Props.pill('#ff6f9c', '#ffffff', 2.4), dx: 5, period: 5 });
        L.mover(46.5, 49.8, -0.4, 0.5, -0.9, 0.9, { mesh: MM.Props.pill('#5aa9ff', '#ffffff', 2.4), dx: 3, period: 5, phase: 0.5 });
        L.prop('stethoscope', 45, -1, -6, { s: 2 });
        L.prop('flask', 40, 0, -6, { args: ['#7ee0c3'], s: 2 }); L.prop('flask', 50, 0, -6, { args: ['#ff6f9c'], s: 2 });
        cof(44, 2.3, 0);
        L.talk(37, 'mariem', 'Pharmacology flashbacks...');
        // lab door opened from the top of the cabinet (toss)
        L.checkpoint(54, -3);
        L.box(54.5, 56.5, 0, 4.5, -4, -1.6, { top: G.mat('#ffffff'), side: G.mat('#cfe9e5') });
        L.plate('lab', 55.5, -2.8, 4.5, { latch: 5, label: 'OPEN LAB' });
        cof(55.5, 5.3, -2.0);
        L.door('lab', 58, 58.6, 0, 5, -4, 4, { label: 'EXAM HALL', color: '#5aa9ff' });
        L.box(58, 58.6, 5, 7, -4, 4, L.M.wall);
        L.sign('Toss her onto the cabinet', 52.8, 2.4, 2.6, { h: 0.26, post: false });
        // the stage
        L.plate('study', 61, 2.6, 0, { heavy: true, label: 'HOLD' });
        L.elevator('study|cheer', 64.5, 67.6, -1.5, 1.5, 0.3, 3, { label: 'LIFT' });
        L.box(68, 82, 0, 3, -4, 4, { top: G.mat('#2c3e66'), side: G.mat('#1f2c4a') });
        L.plate('cheer', 70, -2.6, 3, { label: 'CHEER' });
        cof(66, 4.4, 2.4);
        L.talk(60, 'mohamed', 'Last exam. I\'ll hold the lift. Go be a doctor.');
        L.talk(69, 'mariem', 'Stand on CHEER... there. Now you come up too.');
        const banner = G.textPlane('Faculty of Medicine · Alexandria · 12.12.2026', 0.42, { color: '#ffffff', bg: '#2fb39a', size: 70, pad: 22 });
        banner.position.set(75, 6.2, -4.05); L.add(banner);
        L.prop('flower', 72, 3, -3.4); L.prop('flower', 78, 3, -3.4, { args: ['#ffcf6e'] });
        L.memory('drmariem', 72, 4.4, 2.6);
        L.goalZone([{ x0: 74, x1: 78.5, z0: -2.2, z1: 2.2, y: 3, label: 'Graduation' }], { req: 'count:coffee', reqText: 'Bring her all 5 coffees' });
      },
    },

    /* =================================================================== 20 */
    {
      id: 'forever', num: 20, year: '2027 · and forever', title: 'Forever', theme: 'forever', music: 'forever',
      outfit: { mohamed: 'groom', mariem: 'bride' },
      intro: ['2027: the wedding. Everyone they love, in one place.', 'Then a honeymoon, just the two of them. Then America, with their home, their car and both families.', 'And one day: a little girl and a little boy.', 'The story continues. He will never leave Mariem.'],
      mission: 'Collect 4 passport stamps to cross the world together, then come home to your family.',
      objectives: [{ label: 'Passport stamps', counter: 'stamps' }, { label: 'Home to our family', goal: true }],
      outro: { title: 'Forever', quote: 'From two kids at the same school to a family of four. The best chapters are still unwritten.' },
      finale: { kind: 'kids', lines: [[0.8, 'mariem', 'Look who\'s here!'], [3.2, 'mohamed', 'Our family. Our forever.'], [5.8, null, 'And the story continues. He will never leave Mariem.']] },
      killY: -16,
      build(L, P) {
        L.spawn('mohamed', 0, 0, 0.8); L.spawn('mariem', 2, 0, 0.8);
        L.counter('stamps', 'Stamps', 4);
        const isle = (x0, x1, top, mat) => { L.box(x0, x1, top - 3, top, -4, 4, mat || L.M.ground); const under = new THREE.Mesh(new THREE.ConeGeometry((x1 - x0) * 0.42, 6, 7), G.mat('#c7a37a', { flat: true })); under.rotation.x = Math.PI; under.scale.z = 0.6; under.position.set((x0 + x1) / 2, top - 6, 0); L.add(under); frontRail(L, x0, x1, 4); };
        // 1: Egypt
        isle(-4, 14, 0, { top: G.mat('#ecd09a'), side: G.mat('#c7a37a') });
        L.invisible(-4.5, -4, 0, 10, -4, 4);
        L.prop('weddingArch', 5, 0, -2.4, { ry: 0 });
        for (let x = -2; x < 11; x += 1.6) L.prop('flower', x, 0, -3.6, { args: [['#ff6f9c', '#ffffff', '#ffcf6e'][Math.floor(x + 2) % 3]] });
        L.npc('Hossam', 0.5, 0, -3.2, { look: { gender: 'm', top: '#1f2a44', bottom: '#1f2a44', beardStyle: 'short' }, pose: 'cheer', nosolid: true });
        L.npc('Yara', 2, 0, -3.4, { look: { gender: 'f', hijab: '#b98a9a', top: '#8f6f9a' }, pose: 'cheer', nosolid: true });
        L.npc('Ahmed', 8, 0, -3.4, { look: { gender: 'm', top: '#1f2a44', bottom: '#1f2a44', glasses: true, beardStyle: 'short' }, pose: 'cheer', nosolid: true });
        L.npc('Mervat', 9.5, 0, -3.2, { look: { gender: 'f', hijab: '#c4a07a', top: '#7a5a8a' }, pose: 'cheer', nosolid: true });
        L.item('stamp', 9, 1.4, 0, { counter: 'stamps', sub: '#e3a53c' });
        L.sign('Alexandria · The Wedding', 11.5, 2.2, -2.6, { h: 0.3 });
        L.memory('wedding', 3, 1.6, 2.4);
        L.trigger(3, 7.5, -3, 3, (lv, game) => {
          game.cutscene({ title: 'The Wedding', sub: '2027 · everyone they love, in one place', dur: 6, dist: 7, at: [5, 0, -0.6],
            lines: [[1, 'mohamed', 'I do. Since school, honestly.'], [3.4, 'mariem', 'I do. Forever.']],
            start: (g) => { const mo = g.player('mohamed'), ma = g.player('mariem'); mo.place(new THREE.Vector3(4.3, 0.05, -0.6)); ma.place(new THREE.Vector3(5.7, 0.05, -0.6)); mo.yaw = Math.PI / 2; ma.yaw = -Math.PI / 2; mo.model.play('hug', 3); ma.model.play('hug', 3); g.fireworks(new THREE.Vector3(5, 9, -8), 6); g.fx.emit('confetti', new THREE.Vector3(5, 4, -0.6), { n: 120, w: 6 }); } });
        }, { both: true });
        L.spring(12.6, 0, 0, { power: 22 });
        L.sign('Spring!', 12.6, 2.3, -2.4, { h: 0.3 });
        // 2: Paris
        isle(17.8, 36, 3);
        L.prop('eiffel', 30, 3, -7, { s: 1.3 });
        L.box(25.5, 28.5, 7, 7.5, -1.5, 1.5, { top: G.mat('#ffe0ec'), side: G.mat('#e8b8cc') });
        L.item('stamp', 27, 8.3, 0, { counter: 'stamps', sub: '#5a7bd9' });
        L.sign('Paris, someday (toss her up for the stamp)', 23, 5, -2.6, { h: 0.28 });
        L.memory('world', 33.5, 4.6, 2.2);
        L.talk(20, 'mariem', 'Take a photo of me with the tower. No, a better one.');
        L.checkpoint(20.5, -3, 3);
        // balloon ferry
        const bal = MM.Props.heartBalloon('#ff6f9c');
        const ferry = L.mover(35.9, 38.9, 2.6, 3, -1.5, 1.5, { dx: 10.6, period: 7, color: '#ff9cc0' });
        bal.position.set(0, 0.2, -1.2); ferry.mesh.add(bal);
        // 3: Maldives
        isle(49.5, 64, 3, { top: G.mat('#f6e3b4'), side: G.mat('#c7a37a') });
        L.prop('beachHut', 57, 3, -2.8); L.prop('palm', 52, 3, -3.4); L.prop('palm', 62, 3, -3.4, { args: [3.6] });
        L.item('stamp', 57, 4.2, -1.2, { counter: 'stamps', sub: '#3ec7c2' });
        L.sign('Honeymoon · just the two of us', 53, 5, -2.4, { h: 0.3 });
        L.talk(50, 'mohamed', 'Honeymoon. No laptops. Okay, one laptop.');
        L.talk(53, 'mariem', 'No laptops.');
        L.checkpoint(51, -3, 3);
        // rainbow bridge, both buttons
        L.plate('r1', 62, -2.4, 3, { label: 'TOGETHER' }); L.plate('r2', 62, 2.4, 3, { label: 'TOGETHER' });
        L.logic('rainbow', (s, lv) => (lv._rb = lv._rb || (s.r1 && s.r2)));
        ['#ff6f9c', '#ffcf6e', '#7ee0c3', '#5aa9ff', '#c59cff'].forEach((c, i) => L.bridge('rainbow', 64, 74, 2.6, 3, -1.6 + i * 0.64, -1.6 + (i + 1) * 0.64, { color: c, side: c }));
        // 4: USA
        isle(74, 90, 3, { top: G.mat('#c8ccd6'), side: G.mat('#8a91a2') });
        L.prop('liberty', 84, 3, -8, { s: 1.1 });
        for (let x = 70; x < 96; x += 6) L.prop('skyscraper', x, -14, -34, { args: [5, 16 + (x % 7) * 2, 5, '#8a86b8', x] });
        L.item('stamp', 86, 4.2, 2, { counter: 'stamps', sub: '#d9534f' });
        L.sign('America, with our families', 77, 5, -2.4, { h: 0.3 });
        L.talk(75, 'mohamed', 'The States again. This time with you, and everyone.');
        L.npc('Hossam', 80, 3, -3, { look: { gender: 'm', top: '#3a4a6a', bottom: '#2c2f3a', beardStyle: 'short' }, line: 'The Lanos would never make it here.', r: 2.8 });
        L.npc('Mervat', 82, 3, -3.2, { look: { gender: 'f', hijab: '#c4a07a', top: '#7a5a8a' }, line: 'Smile! Family photo!', r: 2.8 });
        L.checkpoint(76, -3, 3);
        // wedding island
        L.bridge('count:stamps', 90, 94, 2.6, 3, -1.6, 1.6, { color: '#ffffff', side: '#ffd6e4' });
        isle(94, 114, 3, { top: G.mat('#b8e6a8'), side: G.mat('#c7a37a') });
        L.invisible(114, 114.5, 0, 14, -4, 4);
        L.prop('house', 96, 3, -3.1, { s: 0.38 });
        L.invisible(94.4, 97.6, 3, 4.8, -4, -1.9);
        L.prop('heartBalloon', 108.5, 3, 2.8); L.prop('heartBalloon', 108.5, 3, -2.8, { args: ['#ffcf6e'] });
        L.prop('tree', 97, 3, -3.2, { args: [3.4, '#ffb3d1'] }); L.prop('tree', 112, 3, -3.2, { args: [3, '#ffffff'] });
        L.sign('Home', 99, 5, -2.6, { h: 0.34 });
        for (let x = 95; x < 114; x += 2) { L.prop('flower', x, 3, 3.6, { args: [['#ff6f9c', '#ffffff', '#ffcf6e'][Math.floor(x) % 3]] }); }
        L.memory('family', 100, 4.6, 2.2);
        heartsArc(L, 1, 8, 1.3, 2.2, 4); heartsArc(L, 20, 26, 4.4, 2.4, 3); heartsArc(L, 51, 56, 4.4, 2, 3); heartsArc(L, 76, 82, 4.4, -1.4, 3); heartsArc(L, 96, 104, 4.4, 0, 5, 0.5);
        L.memory('forever', 111, 4.6, 0);
        L.talk(95, 'mariem', 'Home. Do you hear that?');
        L.talk(97, 'mohamed', 'Little footsteps.');
        // sky dressing
        const rr = MM.rng(9);
        for (let i = 0; i < 14; i++) L.prop('cloud', -10 + rr() * 130, -6 + rr() * 22, -20 - rr() * 30, { args: [1.5 + rr() * 2], bob: 0.4 });
        [['#ff6f9c', 15, 14, -18], ['#ffcf6e', 60, 16, -22], ['#7ee0c3', 100, 13, -20]].forEach(([c, x, y, z]) => L.prop('hotAirBalloon', x, y, z, { args: [c], bob: 0.6 }));
        L.goalZone([{ x0: 104.5, x1: 107.5, z0: -1.6, z1: 1.6, y: 3, label: 'Our family' }], { req: 'count:stamps' });
      },
    },
  );
})(window.MM);
