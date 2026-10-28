/* The story: themes, chapters and memories. Coordinates are in metres; +x is "forward", the camera looks from +z.
   Reach cheat-sheet used to design every puzzle:
     Mohamed: climbs ledges up to ~1.6 m, jumps gaps up to ~3.2 m. Blocked by anything 2.4 m+.
     Mariem: single jump 2.0 m, double jump ~3.4 m, gaps up to ~4.5 m (6.5 m with double jump + dash).
     Toss: Mariem reaches ledges up to ~5 m. Tunnels are 1.45 m high: only Mariem fits. */
(function (MM) {
  'use strict';
  const G = MM.G;

  MM.THEMES = {
    school: { skyTop: '#79c2ff', skyBottom: '#ffe8d0', horizon: '#fff2df', fog: '#ffe8d0', fogNear: 50, fogFar: 170, hemiSky: '#ffffff', hemiGround: '#c9a98a', hemi: 1.15, sun: '#fff0d6', sunI: 2.4, groundTop: '#d9a066', groundSide: '#a8703f', platTop: '#f1c27d', platSide: '#c08a4a', wall: '#f3e3d0', wallTop: '#fff8ee', accent: '#ff6f9c', door: '#5aa9ff', bridge: '#ffcf6e', lift: '#7ee0c3' },
    grind: { skyTop: '#0a0f33', skyBottom: '#2a1d55', horizon: '#40307a', fog: '#2a1d55', fogNear: 45, fogFar: 150, stars: 700, hemiSky: '#9aa8ff', hemiGround: '#3a2440', hemi: 0.9, sun: '#ffd9a8', sunI: 2.0, groundTop: '#9a6a44', groundSide: '#5e3b24', platTop: '#f2e6d0', platSide: '#c9b49a', wall: '#3f3560', accent: '#ffcf6e', door: '#ff6f9c', mover: '#ffd84d', lift: '#7ee0c3' },
    miles: { skyTop: '#5762c9', skyBottom: '#ffb38a', horizon: '#ffd3a8', fog: '#f7b89a', fogNear: 60, fogFar: 190, hemiSky: '#ffe2cc', hemiGround: '#5a4a70', hemi: 1.15, sun: '#ffc89a', sunI: 2.2, groundTop: '#c8ccd6', groundSide: '#7d8596', platTop: '#d6dae3', platSide: '#8a91a2', wall: '#5b6178', accent: '#ff6f9c', door: '#ff6f9c', water: '#4f8fd8', bridge: '#ffcf6e', lift: '#7ee0c3' },
    tech: { skyTop: '#090b22', skyBottom: '#2a1660', horizon: '#46288f', fog: '#24145a', fogNear: 55, fogFar: 170, stars: 400, hemiSky: '#b4c0ff', hemiGround: '#3a2a66', hemi: 1.6, sun: '#e2e6ff', sunI: 2.4, grid: '#7ee0c3', groundTop: '#3d468c', groundSide: '#262c5c', platTop: '#5561b8', platSide: '#2f3770', wall: '#3a4180', wallTop: '#4b549e', accent: '#7ee0c3', door: '#ff4f8b', mover: '#7ee0c3', lift: '#ffcf6e', bridge: '#7ee0c3' },
    nile: { skyTop: '#060a28', skyBottom: '#1e1548', horizon: '#3a2370', fog: '#1e1548', fogNear: 50, fogFar: 170, stars: 600, hemiSky: '#7f82ff', hemiGround: '#4a2030', hemi: 1.05, sun: '#ffd49a', sunI: 1.5, groundTop: '#a8693c', groundSide: '#6e3b1d', platTop: '#b77a48', platSide: '#6e3b1d', wall: '#efe7dc', wallTop: '#ffffff', accent: '#1f3fbf', door: '#8f1d2c', water: '#16267a', lift: '#d6b25a' },
    drive: { skyTop: '#ff8fa3', skyBottom: '#ffd3a0', horizon: '#ffe2b8', fog: '#ffd9b0', hemiSky: '#ffe8d0', hemiGround: '#8a6a5a', hemi: 1.15, sun: '#ffd8a8', sunI: 2.3 },
    home: { skyTop: '#ffcfb0', skyBottom: '#fff1e2', horizon: '#fff6ea', fog: '#fff1e2', fogNear: 60, fogFar: 170, hemiSky: '#fff6ea', hemiGround: '#b58c6a', hemi: 1.2, sun: '#fff0d8', sunI: 2.1, groundTop: '#dfb486', groundSide: '#a97b52', platTop: '#f1d9bf', platSide: '#c9a27c', wall: '#f6ede3', wallTop: '#ffffff', accent: '#ff9cb5', door: '#d9a7b4', lift: '#ffcf6e' },
    med: { skyTop: '#8fe3da', skyBottom: '#effbf9', horizon: '#ffffff', fog: '#effbf9', fogNear: 60, fogFar: 170, hemiSky: '#ffffff', hemiGround: '#9ac8c0', hemi: 1.15, sun: '#ffffff', sunI: 2.2, groundTop: '#e3f1ef', groundSide: '#9fc9c1', platTop: '#ffffff', platSide: '#b7dcd5', wall: '#cfe9e5', wallTop: '#ffffff', accent: '#2fb39a', door: '#5aa9ff', mover: '#ff6f9c', lift: '#ffcf6e' },
    forever: { skyTop: '#ffb3d6', skyBottom: '#d2eaff', horizon: '#fff0f6', fog: '#f4e6f6', fogNear: 70, fogFar: 200, hemiSky: '#fff0f8', hemiGround: '#b3a0c8', hemi: 1.2, sun: '#fff1e6', sunI: 2.2, groundTop: '#9edc9a', groundSide: '#c7a37a', platTop: '#ffe0ec', platSide: '#e8b8cc', wall: '#ffffff', accent: '#ff6f9c', bridge: '#ffcf6e', mover: '#ff9cc0' },
  };

  // Memories, in story order. Each one is hidden in its chapter and collected into "Our album".
  MM.MEMORIES = [
    { id: 'glance', ch: 1, title: 'First Glance', text: '2021. The first time he saw her in class, he forgot the whole lesson.' },
    { id: 'shy', ch: 1, title: 'She Liked Him Too', text: 'She noticed him right back. She just never said it first. (She still says he should have noticed sooner.)' },
    { id: 'nightshift', ch: 2, title: 'Night Shift', text: 'Tutorials at 2 AM, freelance gigs, failed attempts. Every night she sent the same message: "You\'ve got this."' },
    { id: 'zero', ch: 2, title: 'Zero to One', text: 'He started with zero. Not low savings: zero. That\'s why the first "one" felt like a million.' },
    { id: 'sevenhours', ch: 3, title: 'Seven Hours', text: 'Good morning at his midnight. Good night at her sunrise. They made seven hours feel like seven minutes.' },
    { id: 'ocean', ch: 3, title: 'Across the Ocean', text: 'He studied in the United States. An ocean is wide. Their "see you soon" was wider.' },
    { id: 'dayone', ch: 4, title: 'Day One', text: 'U3 AI started on a single desk. The first client paid late. He celebrated anyway, with her.' },
    { id: 'owner', ch: 4, title: 'Business Owner', text: 'The first time he said "my company" out loud, she was the one who teared up.' },
    { id: 'nile', ch: 5, title: 'The Nile Night', text: 'Blue velvet chairs, warm lamps, river lights on the water. 2025.' },
    { id: 'yes', ch: 5, title: 'She Said Yes', text: 'He asked. She said yes before he finished the question.' },
    { id: 'playlist', ch: 6, title: 'Our Playlist', text: 'He drives. She picks the music. That deal will outlive every car they ever own.' },
    { id: 'keys', ch: 7, title: 'The Keys', text: '2026. He bought their home. She cried at the door. He pretended he didn\'t.' },
    { id: 'pinterest', ch: 7, title: 'Two Opinions', text: 'Endless Pinterest boards. Two very different opinions about the sofa. One home.' },
    { id: 'studynights', ch: 8, title: 'Study Nights', text: 'Flashcards on the fridge, coffee at midnight. He quizzed her until he knew the bones too.' },
    { id: 'drmariem', ch: 8, title: 'Dr. Mariem', text: 'Faculty of Medicine. Graduating this December. He will be the loudest one in the hall.' },
    { id: 'world', ch: 9, title: 'See the World', text: 'The pyramids, Paris, the Maldives and back to the States. Every passport stamp, side by side.' },
    { id: 'family', ch: 9, title: 'A Girl and a Boy', text: 'One day: a little girl with her mother\'s smile and a little boy with his father\'s laugh.' },
    { id: 'forever', ch: 9, title: 'Forever', text: 'From a glance across a classroom in 2021 to forever. Better together.' },
  ];

  // helpers --------------------------------------------------------------
  function frontRail(L, x0, x1, z, h) { L.invisible(x0, x1, 0, h || 6, z, z + 0.5); }
  function backWall(L, x0, x1, z, h, mat) { return L.box(x0, x1, -0.5, h, z - 1, z, mat || L.M.wall, { noShadow: true }); }
  function heartsArc(L, x0, x1, y, z, n, lift) {
    for (let i = 0; i < n; i++) { const t = n === 1 ? 0.5 : i / (n - 1); L.heart(x0 + (x1 - x0) * t, y + Math.sin(t * Math.PI) * (lift || 0.8), z); }
  }

  MM.CHAPTERS = [
    /* =================================================================== 1 */
    {
      id: 'school', num: 1, year: '2021', title: 'First Glance', theme: 'school', music: 'school',
      intro: ['Egypt, 2021. A classroom. Rows of desks. One ordinary morning.', 'He noticed her two rows ahead, and forgot the entire lesson.', 'She noticed him too. She just never said a word.'],
      mission: 'Get to the exam hall together. Find the 3 love notes on the way.',
      objectives: [{ label: 'Find 3 love notes', counter: 'notes' }, { label: 'Pass the exam together', sig: 'exam' }, { label: 'Meet in the heart zone', goal: true }],
      outro: { title: 'We passed', quote: 'Same class, same exam, same nervous smile. It was the start of everything.' },
      killY: -10,
      build(L, P) {
        L.spawn('mohamed', 0, 0, 0.8); L.spawn('mariem', 2, 0, 0.8);
        L.counter('notes', 'Love notes', 3);
        L.ground(-7, 96, -4, 4);
        frontRail(L, -7, 96, 4);
        L.invisible(-7.5, -7, 0, 6, -4, 4);
        backWall(L, -7, 96, -4.2, 6.5);
        L.prop('chalkboard', 4, 0, -4.1, { args: [7, '2021 · Class 3B\nM ♥ ?'] });
        [13, 18, 29, 45, 58, 76, 90].forEach((x) => L.prop('bigWindow', x, 1.4, -4.15, { args: [3, 2.6] }));
        for (let x = -4; x < 20; x += 3.2) { L.prop('desk', x, 0, -3.5); L.prop('schoolChair', x, 0, -2.85, { ry: Math.PI }); }
        L.prop('globe', 20, 0, -3.2); L.prop('plant', -5.5, 0, -3.2);
        L.sign('Move: WASD · Arrows · Stick', 0.5, 1.7, -1.6);
        L.talk(2, 'mohamed', 'She sits two rows ahead. Act normal. Act... normal.');
        L.talk(5, 'mariem', 'He keeps looking over here. Don\'t look back. Don\'t look back.');
        // hurdle
        L.sign('Jump!', 5.8, 1.7, -2);
        L.box(7, 8.2, 0, 0.8, -4, 4, { top: G.mat('#e05d6f'), side: G.mat('#b8475a') });
        heartsArc(L, 6.6, 8.6, 1.6, 0, 3, 0.4);
        // teacher's desk
        L.box(11, 13.4, 0, 1.1, -1.8, 0.6, { top: G.mat('#c58e5a'), side: G.mat('#8f5f36') });
        L.memory('glance', 12.2, 2.1, -0.6);
        L.item('note', 12.2, 1.7, 1.6, { counter: 'notes' });
        L.talk(10, 'mohamed', 'Did she just smile? She smiled. I think she smiled.');
        // door puzzle
        L.sign('Pink buttons open doors while someone stands on them', 16.5, 2.2, -2.6, { h: 0.3 });
        L.wall(21, 22, 0, 4.6, -4, -1.2); L.wall(21, 22, 0, 4.6, 1.2, 4); L.wall(21, 22, 3, 4.6, -1.2, 1.2);
        L.door('p1', 21.15, 21.85, 0, 3, -1.2, 1.2, { label: 'Class 3B' });
        L.plate('p1', 18.5, -2.4); L.plate('p1', 25, 2.4);
        heartsArc(L, 23, 28, 1.2, 0, 3);
        L.checkpoint(27, -3);
        // tunnel
        L.prop('locker', 30, 0, -3.5); L.prop('locker', 30.8, 0, -3.5, { args: ['#ff8fa8'] }); L.prop('locker', 31.6, 0, -3.5);
        L.sign('Only Mariem is small enough for the gap', 31.5, 2.4, -1.8, { h: 0.3 });
        L.wall(34, 35, 0, 5, -4, -1); L.wall(34, 35, 1.45, 5, -1, 1.3);
        L.door('p2', 34.1, 34.9, 0, 5, 1.3, 4, { label: 'Staff only', mode: 'down' });
        L.item('note', 34.5, 0.7, 0.15, { counter: 'notes' });
        L.plate('p2', 38, -2.4);
        L.talk(33, 'mariem', 'I\'ll squeeze through. Wait for me!');
        heartsArc(L, 36, 41, 1.2, 1.5, 3);
        // crate climb
        L.sign('Mohamed can push heavy boxes. Build a step!', 41.5, 2.2, -2.6, { h: 0.3 });
        L.crate(44, 0.5, 0, { label: 'Lost & Found' });
        L.box(50, 60, 0, 2.6, -4, 4, { top: G.mat('#f1c27d'), side: G.mat('#c08a4a') });
        L.memory('shy', 55, 3.7, -2.2);
        heartsArc(L, 52, 58, 3.5, 1.5, 4, 0.3);
        L.checkpoint(52, -3, 2.6);
        // toss wall
        L.sign('Mohamed: Power next to Mariem = TOSS her up!', 63, 2.2, -2.8, { h: 0.3 });
        L.wall(66, 69, 0, 4.6, -4, -1); L.wall(66, 69, 0, 4.6, 1, 4); L.wall(66, 69, 2.6, 4.6, -1, 1);
        L.door('p3', 66.15, 68.85, 0, 2.6, -1, 1, { label: 'Gym' });
        L.plate('p3', 67.5, -2.5, 4.6);
        L.item('note', 67.5, 5.4, 2.5, { counter: 'notes' });
        L.talk(62, 'mohamed', 'Ready? One, two... up you go!');
        L.checkpoint(72, -3);
        // exam hall
        L.plate('pass1', 78, -2.2, 0, { label: 'PASS' }); L.plate('pass2', 78, 2.2, 0, { label: 'PASS' });
        L.logic('exam', (s, lv) => (lv._exam = lv._exam || (s.pass1 && s.pass2)));
        L.door('exam', 84, 85, 0, 5, -4, 4, { label: 'EXAM HALL · 2021', color: '#ff6f9c' });
        L.wall(84, 85, 5, 6.5, -4, 4);
        L.talk(74, 'mariem', 'Final exam. Both buttons at the same time. Together.');
        L.talk(80, 'mohamed', 'We studied. We\'re ready. Probably.');
        for (let x = 87; x < 95; x += 2.6) { L.prop('desk', x, 0, -3.2); L.prop('desk', x, 0, 3.2); }
        L.prop('chalkboard', 92, 0, -4.1, { args: [6, 'FINAL EXAM'] });
        L.goalZone([{ x0: 88, x1: 93, z0: -2.2, z1: 2.2, label: 'Together' }], { req: 'count:notes', reqText: 'Find all 3 love notes first' });
        heartsArc(L, 86, 94, 1.3, 0, 3);
      },
    },

    /* =================================================================== 2 */
    {
      id: 'grind', num: 2, year: '2022', title: 'Zero to One', theme: 'grind', music: 'grind', money: 'savings',
      intro: ['After school, life got real.', 'Zero money. Zero connections. Just a laptop and a stubborn dream.', 'Every night: one more course, one more skill, one more try.', 'And every night, she was the one who believed in him.'],
      mission: 'Collect 5 skill books and reach his first paycheck. Smash the walls of doubt.',
      objectives: [{ label: 'Collect 5 skill books', counter: 'books' }, { label: 'Savings', counter: 'savings', money: true, optional: true }, { label: 'Reach the first paycheck', goal: true }],
      outro: { title: 'First paycheck', quote: 'EGP 3,000. It felt like a million, because she was the first person he called.' },
      killY: -12,
      build(L, P) {
        L.spawn('mohamed', 0, 0, 0.8); L.spawn('mariem', 2, 0, 0.8);
        L.counter('books', 'Skill books', 5);
        L.counter('savings', 'Savings', 0, { optional: true });
        const coin = (x, y, z) => L.item('coin', x, y, z, { counter: 'savings', value: 250 });
        L.ground(-6, 24, -4, 4);
        frontRail(L, -6, 24, 4);
        L.invisible(-6.5, -6, 0, 6, -4, 4);
        L.prop('laptop', 4, 0, -9, { args: [4] });
        L.prop('deskLamp', -4, 0, -7.5, { args: [3] });
        L.prop('mug', 11, 0, -6.5, { args: ['#ff9cc0', 2.4] });
        L.prop('moon', 30, 26, -70, { args: [7] });
        L.prop('bookStack', 18, 0, -6.5, { args: [9, 4], s: 2.4 });
        L.talk(2, 'mohamed', 'Zero money. Zero experience. Okay. Let\'s go.');
        L.talk(5, 'mariem', 'You\'ll make it. I know you will.');
        for (let x = 2; x < 10; x += 2) coin(x, 1.1, 1.6);
        L.sign('Mohamed: Jump, then Power in mid-air = SLAM', 8.5, 2.2, -2.6, { h: 0.3 });
        L.breakable('doubt1', 12, 13, 0, 4, -4, 4, { label: 'I CAN\'T', color: '#8e7fa8' });
        L.talk(10, 'mariem', 'That wall says "I can\'t". Smash it.');
        L.memory('nightshift', 20, 1.6, -2);
        heartsArc(L, 1, 7, 1.3, -1.8, 4); heartsArc(L, 16, 22, 1.2, 2, 3); heartsArc(L, 37, 45, 1.2, 2.6, 4, 0.4); heartsArc(L, 51, 54, 6.2, 2.4, 2, 0.2); heartsArc(L, 69, 76, 6.2, -1.2, 3, 0.3);
        L.checkpoint(17, -3);
        // ruler bridge over the void
        const ruler = L.mover(24, 27, -0.4, 0, -1.5, 1.5, { dx: 9, period: 6, color: '#ffd84d' });
        const ticks = G.textPlane('1  2  3  4  5', 0.22, { color: '#5b4300', size: 60, pad: 4 }); ticks.rotation.x = -Math.PI / 2; ticks.position.set(0, 0.21, 0); ruler.mesh.add(ticks);
        for (let x = 26; x <= 34; x += 2) coin(x, 1.0, 0);
        L.item('book', 30, 1.6, 0.9, { counter: 'books', sub: '#5aa9ff' });
        L.ground(36, 46.4, -4, 4); L.ground(46.4, 50, -4, 4);
        frontRail(L, 36, 50, 4);
        L.hazard(40.5, 1.0, 0, { kind: 'cloud', dz: 0, dx: 0, r: 0.75, label: 'STRESS' });
        const cloudObj = L.hazards[L.hazards.length - 1]; cloudObj.z = -3.4; cloudObj.dz = 6.8; cloudObj.period = 3.2;
        L.checkpoint(37, -3);
        // believe elevator
        L.plate('believe', 42, -2.6, 0, { label: 'BELIEVE' });
        L.elevator('believe|support', 46.6, 49.8, -1.6, 1.6, 0.4, 5, { label: 'LIFT' });
        L.item('book', 44, 3.2, 2.2, { counter: 'books', sub: '#ff6f9c' });
        L.talk(41, 'mariem', 'Stand on BELIEVE? I\'ll hold it. Go!');
        L.box(50, 78, 0, 5, -4, 4, { top: G.mat('#f2e6d0'), side: G.mat('#7a5a8a') });
        frontRail(L, 50, 78, 4);
        L.invisible(78, 78.5, 0, 12, -4, 4);
        for (let x = 51; x < 77; x += 2.2) L.prop('bookStack', x, 0, 4.25, { args: [7, Math.floor(x)], s: 1.4 });
        L.plate('support', 52.4, -2.6, 5, { label: 'SUPPORT' });
        L.checkpoint(53, -3, 5);
        // tunnel wall + doubt wall
        L.box(55, 57, 5, 9, -4, -1, L.M.wall); L.box(55, 57, 6.45, 9, -1, 1, L.M.wall);
        L.breakable('doubt2', 55, 57, 5, 9, 1, 4, { label: 'NOT GOOD\nENOUGH', color: '#8e7fa8' });
        L.item('book', 56, 5.7, 0, { counter: 'books', sub: '#7ee0c3' });
        L.talk(54, 'mohamed', '"Not good enough"? Watch this.');
        // caged book
        L.breakable('cage', 60, 62, 5, 6.7, -3.8, -0.8, { label: 'LATER', color: '#a091bb' });
        L.item('book', 61, 5.8, -2.3, { counter: 'books', sub: '#ffcf6e', req: 'broken:cage' });
        L.hazard(63, 5.9, 0, { kind: 'cloud', r: 0.7, label: 'BILLS' });
        const c2 = L.hazards[L.hazards.length - 1]; c2.z = -3.4; c2.dz = 6.8; c2.period = 2.8;
        // high book
        L.box(64, 66, 5, 7.6, -1, 1, { top: G.mat('#ffcf6e'), side: G.mat('#b98a3a') });
        L.item('book', 65, 8.4, 0, { counter: 'books', sub: '#c59cff' });
        for (let x = 58; x < 66; x += 2) coin(x, 6.2, 2.4);
        L.door('count:books', 67, 67.8, 5, 9, -4, 4, { label: 'FIRST PAYCHECK', color: '#ffcf6e' });
        L.box(67, 67.8, 9, 10.5, -4, 4, L.M.wall);
        const env = new THREE.Group();
        P.bx(env, 3.2, 2.1, 0.2, '#fffdf6', 0, 1.05, 0); const st = G.textPlane('EGP 3,000', 0.32, { color: '#3b2340', size: 70, pad: 6 }); st.position.set(0, 1.1, 0.12); env.add(st);
        L.deco(env, 74, 5, -3.2, 0.15);
        L.memory('zero', 69.5, 6.2, 2.6);
        L.goalZone([{ x0: 70.5, x1: 76, z0: -1.8, z1: 2.4, y: 5, label: 'Together' }], { req: 'count:books', reqText: 'Collect all 5 skill books' });
      },
    },

    /* =================================================================== 3 */
    {
      id: 'miles', num: 3, year: '2023', title: 'Miles Apart', theme: 'miles', music: 'miles',
      intro: ['Then came the biggest leap: studying in the United States.', 'A new country. Seven hours and an ocean between them.', 'Different time zones. Same team.'],
      mission: 'Help each other across the ocean, then call at the same time to meet in the middle.',
      objectives: [{ label: 'Help each other across', sig: 'call' }, { label: 'Messages sent', counter: 'msgs', optional: true }, { label: 'Meet in the middle', goal: true }],
      outro: { title: 'Back together', quote: 'The flight home was the longest twelve hours of his life. The hug at arrivals made up for all of it.' },
      killY: -2.5,
      camera: { dist: 12.5, height: 7.5 },
      build(L, P) {
        const usa = { top: G.mat('#c8ccd6'), side: G.mat('#7d8596') };
        const egy = { top: G.mat('#ecd09a'), side: G.mat('#b8935a') };
        L.spawn('mohamed', 2, 0, -5.5); L.spawn('mariem', 2, 0, 5.5);
        L.counter('msgs', 'Messages', 6, { optional: true });
        L.water(-60, 160, -60, 60, -1.3);
        // lane boundaries (the ocean keeps them apart until the call connects)
        [[-8.6, -8], [-3, -2.4], [2.4, 3], [8, 8.6]].forEach(([z0, z1]) => { L.invisible(-6, 84, 0, 14, z0, z1); L.invisible(88, 96, 0, 14, z0, z1); });
        L.invisible(84, 88, 0, 14, -8.6, -8); L.invisible(84, 88, 0, 14, 8, 8.6);
        L.invisible(-6.5, -6, 0, 14, -9, 9); L.invisible(96, 96.5, 0, 14, -9, 9);
        // USA lane
        L.ground(-6, 12, -8, -3, 0, { mat: usa }); L.ground(20, 44, -8, -3, 0, { mat: usa });
        L.box(44, 46, -3, 0, -8, -3, usa);
        const winTex = G.windowsTex('#3a3f5c', '#ffe7a8', 3).clone(); winTex.needsUpdate = true; winTex.repeat.set(0.35, 0.5);
        L.box(46, 64, 0, 4, -8, -3, { top: G.mat('#9aa3b5'), side: new THREE.MeshStandardMaterial({ map: winTex, roughness: 0.6 }) });
        L.box(64, 66, 0, 3, -8, -3, usa); L.box(66, 68, 0, 2, -8, -3, usa); L.box(68, 70, 0, 1, -8, -3, usa);
        L.ground(70, 96, -8, -3, 0, { mat: usa });
        // Egypt lane
        L.ground(-6, 44, 3, 8, 0, { mat: egy });
        L.ground(48, 50, 3, 8, 0, { mat: egy }); L.ground(54, 56, 3, 8, 0, { mat: egy }); L.ground(60, 62, 3, 8, 0, { mat: egy });
        L.ground(68.5, 96, 3, 8, 0, { mat: egy });
        // skyline + landmarks
        const r = MM.rng(33);
        for (let x = -20; x < 120; x += 7 + r() * 4) L.prop('skyscraper', x, 0, -22 - r() * 10, { args: [5 + r() * 3, 10 + r() * 22, 5, ['#3a3f5c', '#4a3f6c', '#2f4a63'][Math.floor(r() * 3)], Math.floor(r() * 9)] });
        L.prop('liberty', 72, 0, -16, { s: 1.4 });
        L.prop('taxi', 8, 0, -7.2, { ry: 0.2 }); L.prop('taxi', 36, 0, -7.2, { ry: -0.1 });
        L.prop('lampPost', 14, 0, -3.6); L.prop('lampPost', 30, 0, -3.6);
        for (let x = -2; x < 96; x += 9) L.prop('palm', x + r() * 3, 0, 7.6, { args: [3.5 + r()] });
        L.prop('pyramid', -14, 0, 18, { args: [9] }); L.prop('pyramid', 104, 0, 16, { args: [11] }); L.prop('pyramid', 112, 0, 4, { args: [6] });
        L.prop('obelisk', 26, 0, 7.4); L.prop('felucca', 20, -1.3, 0.5);
        const plane = MM.Props.planeToy(); L.deco(plane, 0, 16, -10, Math.PI);
        L.anim.push((t) => { plane.position.set(((t * 9) % 160) - 30, 15 + Math.sin(t) * 0.6, -12); plane.rotation.y = 0; });
        L.sign('New York · 7:00 AM', 1, 2, -7.4, { h: 0.34 });
        L.sign('Cairo · 2:00 PM', 1, 2, 7.6, { h: 0.34 });
        L.talk(3, 'mohamed', '7 AM here. She\'s already halfway through her day.');
        L.talk(6, 'mariem', 'Did he eat breakfast? He never eats when he\'s stressed.');
        // 1: her support builds his bridge
        L.plate('call1', 10, 5.5, 0, { label: 'SUPPORT' });
        L.bridge('call1', 12, 20, -0.5, 0, -8, -3, { color: '#ffcf6e', glow: true });
        L.sign('Your button builds HIS bridge', 8, 2.2, 3.6, { h: 0.3 });
        L.item('letter', 16, 1.2, 5.5, { counter: 'msgs' });
        L.checkpoint(22, -3.4, 0, { m: [22, 0, -5.5], f: [22, 0, 5.5] });
        // 2: his crate opens her door
        L.crate(23.6, -5.5, 0, { label: 'BOOKS' });
        L.plate('heavy2', 28, -5.5, 0, { heavy: true, label: 'WEIGHT' });
        L.door('heavy2', 30, 31, 0, 5, 3, 8, { label: 'CLOSED', color: '#ff6f9c' });
        L.box(30, 31, 5, 6, 3, 8, L.M.wall);
        L.sign('Push the books onto the gold button', 22.5, 2.4, -7.5, { h: 0.3 });
        L.item('letter', 26, 1.2, -5.5, { counter: 'msgs' });
        heartsArc(L, 32, 38, 1.2, 5.5, 3);
        // 3: her timed button lifts him to the rooftops
        L.plate('lift3', 42, 5.5, 0, { latch: 6, label: '6 SEC' });
        L.elevator('lift3', 42.6, 46, -7.4, -3.6, 0.4, 4, { label: 'LIFT' });
        L.checkpoint(41, -3.4, 0, { m: [41, 0, -5.5], f: [41, 0, 5.5] });
        L.item('letter', 52, 1.4, 5.5, { counter: 'msgs' });
        L.memory('sevenhours', 52, 5.2, -6.6);
        heartsArc(L, 48, 60, 5.4, -5.5, 5, 0.3);
        L.hazard(58, 4.9, -5.5, { kind: 'cloud', r: 0.7, label: 'JET LAG' });
        const jl = L.hazards[L.hazards.length - 1]; jl.z = -7.6; jl.dz = 4.2; jl.period = 2.6;
        // 4: dash gap
        L.sign('Mariem: Power = Kitten Dash (works in mid-air!)', 58.5, 2.2, 7.4, { h: 0.3 });
        L.checkpoint(61, -3.4, 4, { m: [61, 4, -5.5], f: [61, 0, 5.5] });
        L.item('letter', 65, 1.6, 5.5, { counter: 'msgs' });
        L.memory('ocean', 71, 1.4, 6.6);
        L.item('letter', 76, 1.2, -5.5, { counter: 'msgs' });
        L.item('letter', 76, 1.2, 5.5, { counter: 'msgs' });
        // 5: the call
        L.prop('booth', 80, 0, -7.2, { args: ['#5aa9ff', 'CALL'] }); L.prop('booth', 80, 0, 7.2, { args: ['#ff6f9c', 'CALL'] });
        L.plate('callA', 80, -5.5, 0, { label: 'CALL' }); L.plate('callB', 80, 5.5, 0, { label: 'CALL' });
        L.logic('call', (s, lv) => (lv._call = lv._call || (s.callA && s.callB)));
        L.bridge('call', 84, 88, -0.4, 0, -3, 3, { axis: 'z', color: '#ffe7a8', glow: true });
        L.talk(77, 'mariem', 'Both CALL buttons at once. Pick up, pick up...');
        L.goalZone([{ x0: 84.6, x1: 87.4, z0: -1.4, z1: 1.4, label: 'Meet in the middle' }], { req: 'call', reqText: 'Call each other at the same time' });
        L.anim.push(function (t) { if (L._call && !L._callSaid) { L._callSaid = true; L.game.say('mohamed', 'Can you hear me?', 2); setTimeout(() => L.game.say('mariem', 'Always. Come home.', 2.4), 2100); } });
      },
    },

    /* =================================================================== 4 */
    {
      id: 'agency', num: 4, year: '2024', title: 'U3 AI', theme: 'tech', music: 'tech', money: 'revenue',
      intro: ['He came back home to Egypt with a degree, a laptop and a plan.', 'U3 AI. One desk. One client. Then two. Then a team.', 'From zero money to business owner.', 'She was there for every launch, even the ones that crashed.'],
      mission: 'Bring the 3 servers online, then launch U3 AI together.',
      objectives: [{ label: 'Servers online', fn: (L) => [(L.sig.srv1 ? 1 : 0) + (L.sig.srv2 ? 1 : 0) + (L.sig['broken:bug'] ? 1 : 0), 3] }, { label: 'Revenue', counter: 'revenue', money: true, optional: true }, { label: 'Launch U3 AI', sig: 'launch' }, { label: 'Meet in the heart zone', goal: true }],
      outro: { title: 'Launched', quote: 'From zero to business owner. He still keeps the first invoice in his wallet.' },
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

    /* =================================================================== 5 */
    {
      id: 'nile', num: 5, year: '2025', title: 'The Nile Night', theme: 'nile', music: 'nile',
      intro: ['A boat on the Nile. Blue velvet chairs, warm lamps, river lights dancing on the water.', 'He had one question in his pocket.', '(She suspected nothing. Probably.)'],
      mission: 'Light the 4 candles and find the ring before dinner. Mariem: no peeking.',
      objectives: [{ label: 'Light the candles', counter: 'candles' }, { label: 'Find the ring (Mohamed)', counter: 'ring' }, { label: 'Rose petals', counter: 'petals', optional: true }, { label: 'Meet at the table', goal: true }],
      outro: { title: 'She said yes', quote: 'A boat, a river, a ring, and a yes that came before he finished the question.' },
      killY: -3,
      build(L, P) {
        const deck = { top: new THREE.MeshStandardMaterial({ map: (() => { const t = G.woodTex('#a8693c', '#5a2d12').clone(); t.needsUpdate = true; return t; })(), roughness: 0.4 }), side: G.mat('#6e3b1d') };
        const deck2 = { top: new THREE.MeshStandardMaterial({ map: (() => { const t = G.woodTex('#b4743f', '#5a2d12').clone(); t.needsUpdate = true; return t; })(), roughness: 0.4 }), side: G.mat('#f2ece4') };
        L.spawn('mohamed', 0, 0, 0.8); L.spawn('mariem', 2, 0, 0.8);
        L.counter('candles', 'Candles', 4); L.counter('ring', 'Ring', 1); L.counter('petals', 'Petals', 12, { optional: true });
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
        L.talk(2, 'mohamed', '(whispering) Okay. Ring\'s in my pocket. Act natural.');
        L.talk(5, 'mariem', 'Why is he acting so... natural?');
        L.talk(12, 'mohamed', 'Wait. Where\'s the ring? WHERE IS THE RING?');
        const petal = (x, y, z) => L.item('petal', x, y, z, { counter: 'petals' });
        petal(3, 0.6, 2.5); petal(7.5, 1.2, 2.8); petal(11, 0.6, 0); petal(17, 1.4, 3.5); petal(24, 0.6, 2);
        L.item('flame', 5, 1.5, -2, { counter: 'candles' });
        L.item('flame', 9, 3.2, -2.5, { counter: 'candles' });
        L.memory('nile', 14, 1.9, 1.6);
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
        L.sign('KITCHEN · staff only', 29.5, 2.4, 4.55, { h: 0.24, post: false });
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
        L.item('ring', 45, 5.1, -2.6, { counter: 'ring', who: 'mohamed' });
        L.trigger(44, 46, -4, -1, (lv, game) => game.say('mohamed', 'Found it. Breathe. Just breathe.', 2.4));
        for (let x = 40; x < 62; x += 5) { L.prop('stringLights', x + 2.5, 4.3, -4.3, { args: [5, 3.2] }); L.prop('stringLights', x + 2.5, 4.3, 4.3, { args: [5, 3.2] }); }
        for (let x = 38; x < 62; x += 3) { L.prop('fence', x + 1.5, 4.3, -4.45, { args: [3, '#f4efe7'] }); }
        L.prop('plant', 38.5, 4.3, -3.6); L.prop('plant', 60.5, 4.3, 3.6);
        petal(41, 5, 2.5); petal(48, 5.8, 0); petal(51, 5, -3); petal(56, 5, 3.2); petal(43, 6.6, 0.5);
        L.item('flame', 50, 6.5, 2.2, { counter: 'candles' });
        L.item('flame', 31, 5.6, -1.5, { counter: 'candles' });
        L.memory('yes', 47, 5.9, 3.2);
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
        L.goalZone([{ x0: 53.2, x1: 58.8, z0: -2.4, z1: 2.4, y: 4.3, label: 'Our table' }], { req: ['count:candles', 'count:ring'], reqText: 'Light 4 candles and find the ring' });
      },
    },

    /* =================================================================== 6 */
    {
      id: 'road', num: 6, year: '2026', title: 'The Open Road', theme: 'drive', music: 'drive0', type: 'drive',
      intro: ['Keys in hand. Our own car.', 'He drives. She controls the music. That\'s the deal. Always has been.'],
      mission: 'Mohamed steers (left/right) and hops (jump). Mariem switches the radio so it matches the color of the notes. Keep the vibe alive all the way home.',
      objectives: [{ label: 'Drive home', fn: (D) => [Math.round(D.progress() * 100), 100], pct: true }, { label: 'Notes on the right station', fn: (D) => [D.notesHit, 25], optional: true }],
      outro: { title: 'Home sweet home', quote: 'Windows down, her playlist on, his hand on the wheel. The best road trips are the short ones home.' },
      memoryOnFinish: 'playlist',
    },

    /* =================================================================== 7 */
    {
      id: 'home', num: 7, year: '2026', title: 'Our Home', theme: 'home', music: 'home',
      intro: ['And then: our home.', 'Empty walls. Endless Pinterest boards. Two very different opinions about the sofa.', 'Let\'s make it ours.'],
      mission: 'Mohamed moves the furniture onto the rugs. Mariem finds the decor. Then turn on the lights together.',
      objectives: [{ label: 'Furniture in place', fn: (L) => [(L.sig.sofa ? 1 : 0) + (L.sig.dining ? 1 : 0) + (L.sig.bed ? 1 : 0), 3] }, { label: 'Decor pieces', counter: 'decor' }, { label: 'Lights on', sig: 'lights' }, { label: 'Meet in the heart zone', goal: true }],
      outro: { title: 'Home', quote: 'The sofa ended up where she wanted it. He says it was his idea.' },
      killY: -10,
      build(L, P) {
        L.spawn('mohamed', 0, 0, 0.8); L.spawn('mariem', 2, 0, 0.8);
        L.counter('decor', 'Decor', 6);
        const floor = { top: new THREE.MeshStandardMaterial({ map: (() => { const t = G.woodTex('#e2b98c', '#9a6a40').clone(); t.needsUpdate = true; return t; })(), roughness: 0.5 }), side: G.mat('#a97b52') };
        L.ground(-4, 40, -4.5, 4.5, 0, { mat: floor });
        frontRail(L, -4, 58, 4.5); L.invisible(-4.5, -4, 0, 10, -5, 5); L.invisible(58, 58.5, 0, 12, -5, 5);
        backWall(L, -4, 58, -4.5, 8.5);
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
        L.talk(1, 'mariem', 'Okay. Sofa goes by the window. No, the other window.');
        L.talk(4, 'mohamed', 'Babe. It weighs two hundred kilos.');
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
        L.goalZone([{ x0: 52, x1: 56.5, z0: 0.6, z1: 4.2, y: 3.6, label: 'Our first night home' }], { req: ['sofa', 'dining', 'bed', 'lights', 'count:decor'], reqText: 'Furniture, 6 decor pieces, then lights' });
      },
    },

    /* =================================================================== 8 */
    {
      id: 'med', num: 8, year: 'December 2026', title: 'Dr. Mariem', theme: 'med', music: 'med',
      intro: ['Faculty of Medicine. Years of anatomy, night shifts and coffee.', 'This December, she graduates.', 'He can\'t study for her. But he can carry the books, bring the coffee and cheer the loudest.'],
      mission: 'Bring Mariem 5 coffees and get her to the graduation stage.',
      objectives: [{ label: 'Coffees delivered', counter: 'coffee' }, { label: 'Reach the graduation stage', goal: true }],
      outro: { title: 'Dr. Mariem', quote: 'Congratulations, Dr. Mariem. Class of 2026. He cheered so loud the dean looked over.' },
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
        L.talk(1, 'mohamed', 'Exam season. My job: coffee, snacks, and believing in her.');
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
        const banner = G.textPlane('Faculty of Medicine · Class of 2026', 0.42, { color: '#ffffff', bg: '#2fb39a', size: 70, pad: 22 });
        banner.position.set(75, 6.2, -4.05); L.add(banner);
        L.prop('flower', 72, 3, -3.4); L.prop('flower', 78, 3, -3.4, { args: ['#ffcf6e'] });
        L.memory('drmariem', 72, 4.4, 2.6);
        L.goalZone([{ x0: 74, x1: 78.5, z0: -2.2, z1: 2.2, y: 3, label: 'Graduation' }], { req: 'count:coffee', reqText: 'Bring her all 5 coffees' });
      },
    },

    /* =================================================================== 9 */
    {
      id: 'forever', num: 9, year: 'Forever', title: 'Our Future', theme: 'forever', music: 'forever',
      intro: ['Next chapter: the wedding.', 'Then a little girl and a little boy.', 'Then the whole world: the pyramids, Paris, the Maldives, and back to the States. Together this time.'],
      mission: 'Collect 4 passport stamps to open the way to the wedding arch.',
      objectives: [{ label: 'Passport stamps', counter: 'stamps' }, { label: 'Walk down the aisle', goal: true }],
      outro: { title: 'Forever', quote: 'From a glance across a classroom to a family of four. The best chapters are still unwritten.' },
      killY: -16,
      build(L, P) {
        L.spawn('mohamed', 0, 0, 0.8); L.spawn('mariem', 2, 0, 0.8);
        L.counter('stamps', 'Stamps', 4);
        const isle = (x0, x1, top, mat) => { L.box(x0, x1, top - 3, top, -4, 4, mat || L.M.ground); const under = new THREE.Mesh(new THREE.ConeGeometry((x1 - x0) * 0.42, 6, 7), G.mat('#c7a37a', { flat: true })); under.rotation.x = Math.PI; under.scale.z = 0.6; under.position.set((x0 + x1) / 2, top - 6, 0); L.add(under); frontRail(L, x0, x1, 4); };
        // 1: Egypt
        isle(-4, 14, 0, { top: G.mat('#ecd09a'), side: G.mat('#c7a37a') });
        L.invisible(-4.5, -4, 0, 10, -4, 4);
        L.prop('pyramid', 4, -3, -12, { args: [9] }); L.prop('pyramid', 13, -3, -14, { args: [6] }); L.prop('palm', -2, 0, -3.2); L.prop('palm', 9, 0, -3.4, { args: [3.6] });
        L.item('stamp', 9, 1.4, 0, { counter: 'stamps', sub: '#e3a53c' });
        L.sign('Egypt', 6, 2.2, -2.6, { h: 0.34 });
        L.talk(1, 'mariem', 'Okay. Wedding, then the whole world. Deal?');
        L.talk(3, 'mohamed', 'Deal. Pyramids first. We\'ve got those at home.');
        L.spring(12.6, 0, 0, { power: 22 });
        L.sign('Spring!', 12.6, 2.3, -2.4, { h: 0.3 });
        // 2: Paris
        isle(17.8, 36, 3);
        L.prop('eiffel', 30, 3, -7, { s: 1.3 });
        L.box(25.5, 28.5, 7, 7.5, -1.5, 1.5, { top: G.mat('#ffe0ec'), side: G.mat('#e8b8cc') });
        L.item('stamp', 27, 8.3, 0, { counter: 'stamps', sub: '#5a7bd9' });
        L.sign('Paris (toss her up for the stamp)', 23, 5, -2.6, { h: 0.28 });
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
        L.sign('Maldives', 53, 5, -2.4, { h: 0.34 });
        L.talk(50, 'mohamed', 'Honeymoon. No laptops. Okay, one laptop.');
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
        L.sign('Back to the States', 77, 5, -2.4, { h: 0.34 });
        L.talk(75, 'mohamed', 'The States again. This time, together.');
        L.checkpoint(76, -3, 3);
        // wedding island
        L.bridge('count:stamps', 90, 94, 2.6, 3, -1.6, 1.6, { color: '#ffffff', side: '#ffd6e4' });
        isle(94, 114, 3, { top: G.mat('#b8e6a8'), side: G.mat('#c7a37a') });
        L.invisible(114, 114.5, 0, 14, -4, 4);
        L.prop('weddingArch', 106, 3, 0, { ry: Math.PI / 2 });
        for (let x = 96; x < 104; x += 1.6) { L.prop('schoolChair', x, 3, -2.6, { ry: Math.PI / 2 }); L.prop('schoolChair', x, 3, 2.6, { ry: Math.PI / 2 }); }
        L.prop('cake', 110, 3, -2.8); L.prop('heartBalloon', 108.5, 3, 2.8); L.prop('heartBalloon', 108.5, 3, -2.8, { args: ['#ffcf6e'] });
        for (let x = 95; x < 114; x += 2) { L.prop('flower', x, 3, 3.6, { args: [['#ff6f9c', '#ffffff', '#ffcf6e'][Math.floor(x) % 3]] }); }
        L.memory('family', 100, 4.6, 2.2);
        heartsArc(L, 1, 8, 1.3, 2.2, 4); heartsArc(L, 20, 26, 4.4, 2.4, 3); heartsArc(L, 51, 56, 4.4, 2, 3); heartsArc(L, 76, 82, 4.4, -1.4, 3); heartsArc(L, 96, 104, 4.4, 0, 5, 0.5);
        L.memory('forever', 111, 4.6, 0);
        L.talk(95, 'mariem', 'Ready?');
        L.talk(97, 'mohamed', 'Since 2021.');
        // sky dressing
        const rr = MM.rng(9);
        for (let i = 0; i < 14; i++) L.prop('cloud', -10 + rr() * 130, -6 + rr() * 22, -20 - rr() * 30, { args: [1.5 + rr() * 2], bob: 0.4 });
        [['#ff6f9c', 15, 14, -18], ['#ffcf6e', 60, 16, -22], ['#7ee0c3', 100, 13, -20]].forEach(([c, x, y, z]) => L.prop('hotAirBalloon', x, y, z, { args: [c], bob: 0.6 }));
        L.goalZone([{ x0: 104.5, x1: 107.5, z0: -1.6, z1: 1.6, y: 3, label: 'I do' }], { req: 'count:stamps' });
      },
    },
  ];

  MM.chapterByNum = (n) => MM.CHAPTERS.find((c) => c.num === n);
})(window.MM);
