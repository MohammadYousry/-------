/* The story: themes, memories, the real timeline and chapters 1-7. Chapters 8-20 live in levels2.js and levels3.js.
   Coordinates are in metres; +x is "forward", the camera looks from +z.
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
    drive: { skyTop: '#ff8fa3', skyBottom: '#ffd3a0', horizon: '#ffe2b8', fog: '#ffd9b0', hemiSky: '#ffe8d0', hemiGround: '#8a6a5a', hemi: 1.15, sun: '#ffd8a8', sunI: 2.3, accent: '#ff6f9c' },
    home: { skyTop: '#ffcfb0', skyBottom: '#fff1e2', horizon: '#fff6ea', fog: '#fff1e2', fogNear: 60, fogFar: 170, hemiSky: '#fff6ea', hemiGround: '#b58c6a', hemi: 1.2, sun: '#fff0d8', sunI: 2.1, groundTop: '#dfb486', groundSide: '#a97b52', platTop: '#f1d9bf', platSide: '#c9a27c', wall: '#f6ede3', wallTop: '#ffffff', accent: '#ff9cb5', door: '#d9a7b4', lift: '#ffcf6e' },
    med: { skyTop: '#8fe3da', skyBottom: '#effbf9', horizon: '#ffffff', fog: '#effbf9', fogNear: 60, fogFar: 170, hemiSky: '#ffffff', hemiGround: '#9ac8c0', hemi: 1.15, sun: '#ffffff', sunI: 2.2, groundTop: '#e3f1ef', groundSide: '#9fc9c1', platTop: '#ffffff', platSide: '#b7dcd5', wall: '#cfe9e5', wallTop: '#ffffff', accent: '#2fb39a', door: '#5aa9ff', mover: '#ff6f9c', lift: '#ffcf6e' },
    forever: { skyTop: '#ffb3d6', skyBottom: '#d2eaff', horizon: '#fff0f6', fog: '#f4e6f6', fogNear: 70, fogFar: 200, hemiSky: '#fff0f8', hemiGround: '#b3a0c8', hemi: 1.2, sun: '#fff1e6', sunI: 2.2, groundTop: '#9edc9a', groundSide: '#c7a37a', platTop: '#ffe0ec', platSide: '#e8b8cc', wall: '#ffffff', accent: '#ff6f9c', bridge: '#ffcf6e', mover: '#ff9cc0' },
    physics: { skyTop: '#ffb38a', skyBottom: '#fff0dc', horizon: '#fff4e6', fog: '#fff0dc', fogNear: 50, fogFar: 160, hemiSky: '#fff4e6', hemiGround: '#b58c6a', hemi: 1.2, sun: '#ffe0b8', sunI: 2.2, groundTop: '#c98f5a', groundSide: '#8f5f36', platTop: '#f1d9bf', platSide: '#c9a27c', wall: '#f3e6d2', wallTop: '#fffaf2', accent: '#5aa9ff', door: '#ff6f9c', lift: '#7ee0c3', bridge: '#ffcf6e' },
    alex: { skyTop: '#58b4ff', skyBottom: '#fff3dc', horizon: '#fff8ea', fog: '#e9f4ff', fogNear: 60, fogFar: 190, hemiSky: '#ffffff', hemiGround: '#b9a07a', hemi: 1.2, sun: '#fff3dc', sunI: 2.4, groundTop: '#e6dccb', groundSide: '#a99a80', platTop: '#f3ecdf', platSide: '#c4b49a', wall: '#efe4d2', wallTop: '#ffffff', accent: '#2f6fb3', door: '#2f6fb3', water: '#2f8fd8', lift: '#ffcf6e', bridge: '#ffcf6e', mover: '#ffcf3d' },
    sunset: { skyTop: '#ff7f9e', skyBottom: '#ffd09a', horizon: '#ffe1b0', fog: '#ffd4b0', fogNear: 60, fogFar: 190, hemiSky: '#ffe2cc', hemiGround: '#8a6a7a', hemi: 1.15, sun: '#ffb98a', sunI: 2.2, groundTop: '#e2cdb8', groundSide: '#9f8670', platTop: '#efe0cf', platSide: '#b59c84', wall: '#efd9c4', wallTop: '#fff2e2', accent: '#ff6f9c', door: '#2f6fb3', water: '#3d7fc8', lift: '#ffcf6e', bridge: '#ffcf6e', mover: '#ffcf3d' },
    sharm: { skyTop: '#3fb0ff', skyBottom: '#fff1d0', horizon: '#fff6e2', fog: '#f3ecd8', fogNear: 70, fogFar: 200, hemiSky: '#ffffff', hemiGround: '#c7a37a', hemi: 1.2, sun: '#fff0d0', sunI: 2.5, groundTop: '#f0d39b', groundSide: '#c9a36a', platTop: '#f3dfb4', platSide: '#c9a36a', wall: '#e9d2a8', accent: '#ff7a6b', door: '#ff6f9c', water: '#21b8c9', bridge: '#ffcf6e', lift: '#7ee0c3' },
    cairo: { skyTop: '#1b1d4a', skyBottom: '#ff9a6b', horizon: '#ffb88a', fog: '#c47a7a', fogNear: 55, fogFar: 180, hemiSky: '#ffd6c0', hemiGround: '#4a3050', hemi: 1.15, sun: '#ffb88a', sunI: 2.0, groundTop: '#b9b2a8', groundSide: '#6f685e', platTop: '#d8d0c4', platSide: '#8f877b', wall: '#5b4e6e', wallTop: '#7a6b8f', accent: '#ffcf6e', door: '#e04a4a', lift: '#7ee0c3', bridge: '#ffcf6e', mover: '#ffcf6e' },
    rain: { skyTop: '#151a2a', skyBottom: '#4a5672', horizon: '#5d6a88', fog: '#3e4862', fogNear: 30, fogFar: 120, hemiSky: '#9fb2d8', hemiGround: '#2a2a38', hemi: 1.1, sun: '#c8d6ff', sunI: 1.3, groundTop: '#6f7686', groundSide: '#454b5a', platTop: '#8a90a0', platSide: '#565c6c', wall: '#3e4458', wallTop: '#565c70', accent: '#ffcf6e', door: '#8f6fd8', lift: '#ffcf6e', bridge: '#ffcf6e' },
    family: { skyTop: '#ffc9a8', skyBottom: '#fff0e0', horizon: '#fff6ea', fog: '#fff0e0', fogNear: 60, fogFar: 170, hemiSky: '#fff6ea', hemiGround: '#a5806a', hemi: 1.2, sun: '#ffe8cc', sunI: 2.0, groundTop: '#c49a72', groundSide: '#8a6448', platTop: '#efdcc6', platSide: '#b9946f', wall: '#f2e4d4', wallTop: '#ffffff', accent: '#c4566c', door: '#8f5f36', lift: '#ffcf6e', bridge: '#ffcf6e' },
    garden: { skyTop: '#ff9ec0', skyBottom: '#ffe6c2', horizon: '#fff0d8', fog: '#ffe2cc', fogNear: 60, fogFar: 180, hemiSky: '#fff0e6', hemiGround: '#7a8a5a', hemi: 1.2, sun: '#ffd9b0', sunI: 2.1, groundTop: '#8fcf7e', groundSide: '#6a8a4a', platTop: '#f6efe4', platSide: '#c9b49a', wall: '#e8f3e0', wallTop: '#ffffff', accent: '#ff6f9c', door: '#ff9cc0', lift: '#ffcf6e', bridge: '#ffcf6e', mover: '#ffcf6e' },
    yousr: { skyTop: '#070b24', skyBottom: '#2c2f5e', horizon: '#3d3f78', fog: '#24264c', fogNear: 40, fogFar: 150, stars: 900, hemiSky: '#a8b4ff', hemiGround: '#2a2440', hemi: 1.15, sun: '#d8dcff', sunI: 1.4, groundTop: '#7a7f96', groundSide: '#484c62', platTop: '#9aa0b8', platSide: '#5a5f78', wall: '#3e4260', accent: '#ffcf6e', door: '#ffcf6e', water: '#1a2a6a', lift: '#ffcf6e', bridge: '#ffe2a0' },
    sea: { skyTop: '#2fa8ff', skyBottom: '#e6f8ff', horizon: '#ffffff', fog: '#dff3ff', fogNear: 70, fogFar: 220, hemiSky: '#ffffff', hemiGround: '#c9b48a', hemi: 1.25, sun: '#fff6e0', sunI: 2.5, groundTop: '#f4e2b4', groundSide: '#d4bb84', platTop: '#c7925a', platSide: '#fbfbf8', wall: '#fbfbf8', accent: '#ff7a6b', door: '#2f6fb3', water: '#1fa3d8', lift: '#7ee0c3', bridge: '#ffcf6e' },
  };

  // Memories, in story order. Each one is hidden in its chapter and collected into "Our album".
  MM.MEMORIES = [
    { id: 'topclass', ch: 1, title: 'Two Top Students', text: 'Long before anything happened, they were two kids at the same school, both at the top of the class.' },
    { id: 'wish', ch: 1, title: 'I Wish He Were Mine', text: 'She watched him from far away. He had a new crush every few weeks. She was too shy to talk to anyone, but she whispered it anyway: "I wish he were mine."' },
    { id: 'physics', ch: 2, title: 'The Physics Lesson', text: 'Thanaweya Amma. A physics lesson in a friend\'s living room. He came for Newton. He left in love.' },
    { id: 'number', ch: 2, title: 'Her Number', text: '"Can I have your number? For physics questions." "Only physics questions?" "...Mostly."' },
    { id: 'allnight', ch: 3, title: 'All Night on the Phone', text: 'Books open, phone on speaker, until the sun came up. "Did you finish the chapter?" "Did you?"' },
    { id: 'passed', ch: 3, title: 'We Both Passed', text: 'Results day. Both of them passed. They had carried each other through every single night of it.' },
    { id: 'firstday', ch: 4, title: 'First Day', text: 'He was a computer engineering student. She was going to be a doctor. On her first day, he walked her all the way to the gate.' },
    { id: 'whitecoat', ch: 4, title: 'The White Coat', text: 'Faculty of Medicine, Alexandria University. She put on the white coat for the first time, and he forgot how to talk.' },
    { id: 'koshari', ch: 5, title: 'Koshari for Two', text: 'Koshari, kebda, McDonald\'s fries, a bench by the sea. No money at all, and somehow the best dates of their lives.' },
    { id: 'bus', ch: 5, title: 'The Bus After College', text: 'The bus home after college, her head on his shoulder, Alexandria going by the window.' },
    { id: 'july', ch: 5, title: 'Two Birthdays in July', text: 'Hers: 13 July 2002. His: 18 July 2003. She is a year older, and she has never once let him forget it.' },
    { id: 'sharm', ch: 6, title: 'A Month in Sharm', text: '2022. He went to Sharm El Sheikh for a month. Thirty days of sun for him, thirty days of missing him for her.' },
    { id: 'scared', ch: 6, title: 'She Was Scared', text: 'She was scared and sad the whole month. She still sent him a voice note every night so he wouldn\'t feel alone.' },
    { id: 'firsttrip', ch: 7, title: 'Our First Trip', text: '2023. A conference at the stadium in Cairo. Their first trip together, just the two of them.' },
    { id: 'asleep', ch: 7, title: 'Asleep in His Arms', text: 'Alexandria to Cairo. She fell asleep in his arms and he didn\'t move once, the whole way.' },
    { id: 'waited', ch: 8, title: 'She Waited', text: 'Her family found out and kept her from him for a while. She cried alone, and she waited for the day he would come and ask for her properly.' },
    { id: 'scholarship', ch: 8, title: 'The Letter', text: 'A scholarship to the United States. The best news and the hardest news, in one envelope.' },
    { id: 'sevenhours', ch: 9, title: 'Seven Hours', text: 'Good morning at his midnight. Good night at her sunrise. She called every single day.' },
    { id: 'ocean', ch: 9, title: 'Across the Ocean', text: 'She cried a lot, and still tried to make him laugh. When he upset her, he always made it up to her.' },
    { id: 'choseher', ch: 9, title: 'He Chose Her', text: 'Someone over there tried to get close to him. He didn\'t even think about it. He chose her. He learned there is no one prettier, no one else.' },
    { id: 'dayone', ch: 10, title: 'Day One', text: 'Back home. U3 AI started on a single desk. The first client paid late. He celebrated anyway, with her.' },
    { id: 'owner', ch: 10, title: 'Business Owner', text: 'For the first time there was money. The first time he said "my company" out loud, she was the one who teared up.' },
    { id: 'parents', ch: 11, title: 'Meeting Her Parents', text: 'January 2025. He sat with Hossam, Yara and her brother Mohamed, with his father Ahmed and his mother Mervat beside him. He had nothing yet except a promise.' },
    { id: 'hisgrad', ch: 11, title: 'His Graduation', text: 'June 2025. He graduated, and she was there with his family, cheering for him.' },
    { id: 'fatiha', ch: 11, title: 'The Fatiha', text: '15 August 2025. He saved until there was just enough. They read the Fatiha, and he gave her an iPhone 13 Pro.' },
    { id: 'engaged', ch: 12, title: 'Engaged', text: '16 October 2025. A garden, a photo session, a ring, and a romantic dinner for two. The best engagement there ever was.' },
    { id: 'lanos', ch: 12, title: 'The Maroon Lanos', text: 'Her dad Hossam\'s old maroon Chevrolet Lanos took them out that night. It is family history now.' },
    { id: 'yousr', ch: 12, title: 'Teta Yousr', text: 'At the engagement, her grandmother Yousr held his hand: "Never, ever upset her." She trusted him with her granddaughter.' },
    { id: 'shoulder', ch: 13, title: 'His Shoulder', text: 'Teta Yousr passed away soon after. He stayed beside Mariem every day: her shoulder, her support, her back.' },
    { id: 'promise', ch: 13, title: 'The Promise', text: 'He keeps her in his eyes. He keeps Teta Yousr\'s words: never, ever upset her.' },
    { id: 'firstkiss', ch: 14, title: 'The Best Feeling', text: 'On the couch, the final episode of the final season of Stranger Things. Their first kiss. The most beautiful feeling of his life.' },
    { id: 'concerts', ch: 14, title: 'Tul8te & Hamaki', text: 'Their favourite singers, live. Dancing from the heart, singing every word.' },
    { id: 'yacht', ch: 15, title: 'A Yacht for Her Birthday', text: '13 July 2026. Her birthday on a yacht, alone at sea, just the two of them.' },
    { id: 'sahel', ch: 15, title: 'Sahel, August 2026', text: 'The North Coast. Swimming together until the sun went down.' },
    { id: 'anniversary', ch: 16, title: 'One Year Engaged', text: '16 October 2026. The fanciest hotel in Alexandria, one year to the day.' },
    { id: 'gentleman', ch: 16, title: 'He Opens Her Door', text: 'He kisses her hands. He opens the car door for her. He holds her hand everywhere. Officially, finally, together.' },
    { id: 'keys', ch: 17, title: 'The Home We Dreamed Of', text: '21 October 2026. They walked into the home they had been dreaming of. Two days later it was theirs.' },
    { id: 'paint', ch: 17, title: 'Two Opinions', text: 'Finishing, paint, decor, furniture, style. Two very different opinions about every wall. One home.' },
    { id: 'pinterest', ch: 17, title: 'Alexandria, Ours', text: 'A home in Alexandria. Every corner chosen together.' },
    { id: 'firstcar', ch: 18, title: 'Our First Car', text: 'They picked it together at the showroom: economical, sensible, and completely theirs. He plays the songs. They dance in their seats.' },
    { id: 'tenexams', ch: 18, title: 'Ten Exams', text: 'He drove her to all ten exams, waited outside every time, and took her to the cinema after each one.' },
    { id: 'studynights', ch: 19, title: 'Study Nights', text: 'Flashcards on the fridge, coffee at midnight, and daily calls. He quizzed her until he knew the bones too.' },
    { id: 'drmariem', ch: 19, title: 'Dr. Mariem', text: '12 December 2026, 12 o\'clock. The smartest doctor he has ever met. He is proud of her, and she is the best choice of his life.' },
    { id: 'wedding', ch: 20, title: 'The Wedding', text: '2027. The wedding. Everyone they love in one place.' },
    { id: 'world', ch: 20, title: 'See the World', text: 'A honeymoon alone, then America with their families. Every stamp, side by side.' },
    { id: 'family', ch: 20, title: 'A Girl and a Boy', text: 'One day: a little girl with her mother\'s smile and a little boy with his father\'s laugh.' },
    { id: 'forever', ch: 20, title: 'The Story Continues', text: '"I will never leave Mariem." From two kids at the same school to forever.' },
  ];

  // The real dates, shown on the "Our story" screen.
  MM.TIMELINE = [
    { date: 'Childhood', title: 'The same school', text: 'Two top students. He had a new crush every few weeks; she watched him from afar and wished he were hers.' },
    { date: '13 July 2002', title: 'Mariem is born', text: 'A year older than him, as she will remind him forever.' },
    { date: '18 July 2003', title: 'Mohamed is born', text: 'Five days and one year after her.' },
    { date: '2021', title: 'The physics lesson', text: 'Thanaweya Amma, a lesson at a friend\'s house. That\'s where it really started.' },
    { date: '2021', title: 'All night on the phone', text: 'Studying together until sunrise. Both of them passed.' },
    { date: '2021', title: 'University', text: 'Computer Engineering for him. Faculty of Medicine, Alexandria, for her. He walked her to the gate on her first day.' },
    { date: '2021 – 2022', title: 'Zero money', text: 'Koshari, kebda, McDonald\'s, the bus after college, the Corniche. Friends who loved each other.' },
    { date: '2022', title: 'A month in Sharm', text: 'He went to Sharm El Sheikh for a month. She was scared and sad, and called every night.' },
    { date: '2023', title: 'Cairo', text: 'A conference at the stadium. Their first trip alone. She slept in his arms the whole way.' },
    { date: '2023', title: 'The hard year', text: 'Her family found out and kept them apart for a while. She cried alone, and she waited. Then: a scholarship.' },
    { date: '2023 – 2024', title: 'The United States', text: 'He studied abroad. She called every day. He chose her, every time.' },
    { date: '2024', title: 'U3 AI', text: 'Back in Egypt, he started his own agency. For the first time, there was money.' },
    { date: 'January 2025', title: 'Meeting her parents', text: 'With his father Ahmed and his mother Mervat, he sat with Hossam, Yara and her brother Mohamed.' },
    { date: 'June 2025', title: 'His graduation', text: 'She was there with his family.' },
    { date: '15 August 2025', title: 'The Fatiha', text: 'Just enough savings, a lot of love, and an iPhone 13 Pro.' },
    { date: '16 October 2025', title: 'Engaged', text: 'In a garden, with a photo session and dinner for two. Teta Yousr: "Never, ever upset her."' },
    { date: 'Late 2025', title: 'Goodbye, Teta Yousr', text: 'He became her support and her back.' },
    { date: '2026', title: 'The best feeling', text: 'The Stranger Things finale and their first kiss. Tul8te and Hamaki live.' },
    { date: '13 July 2026', title: 'A yacht for her birthday', text: 'Alone at sea.' },
    { date: 'August 2026', title: 'Sahel', text: 'Swimming together on the North Coast.' },
    { date: '16 October 2026', title: 'One year engaged', text: 'The fanciest hotel in Alexandria.' },
    { date: '21 October 2026', title: 'Our home', text: 'The home they dreamed of, in Alexandria. Bought in two days.' },
    { date: 'Autumn 2026', title: 'Ten exams, one car', text: 'Their first car, chosen together. He drives her to every exam, then the cinema.' },
    { date: '12 December 2026 · 12:00', title: 'Dr. Mariem', text: 'Graduation day. The best choice of his life.', future: true },
    { date: '2027', title: 'The wedding', text: 'Then a honeymoon alone, and America with the home, the car and both families.', future: true },
    { date: 'One day', title: 'A girl and a boy', text: 'And the story continues. He will never leave Mariem.', future: true },
  ];

  /* ---------------- shared level helpers ---------------- */
  const LV = (MM.LV = {});
  LV.frontRail = function (L, x0, x1, z, h) { L.invisible(x0, x1, 0, h || 6, z, z + 0.5); };
  LV.backWall = function (L, x0, x1, z, h, mat) { return L.box(x0, x1, -0.5, h, z - 1, z, mat || L.M.wall, { noShadow: true }); };
  LV.heartsArc = function (L, x0, x1, y, z, n, lift) {
    for (let i = 0; i < n; i++) { const t = n === 1 ? 0.5 : i / (n - 1); L.heart(x0 + (x1 - x0) * t, y + Math.sin(t * Math.PI) * (lift || 0.8), z); }
  };
  LV.woodFloor = function (a, b) { const t = G.woodTex(a, b).clone(); t.needsUpdate = true; return new THREE.MeshStandardMaterial({ map: t, roughness: 0.5 }); };

  // A bus with its front wall cut away, so a cutscene can show them sitting inside.
  LV.busCutaway = function (color, label) {
    const P = MM.Props, g = new THREE.Group(), c = G.mat(color || '#2f6fb3', { r: 0.45 });
    P.bx(g, 9, 0.3, 2.6, '#3a3a44', 0, 0.55, 0);
    P.bx(g, 9, 2.3, 0.15, c, 0, 1.85, -1.25);
    for (let i = 0; i < 5; i++) P.bx(g, 1.4, 0.9, 0.04, G.mat('#bfe3ff', { r: 0.1, e: '#9fd0ff', ei: 0.3 }), -3.4 + i * 1.7, 2.1, -1.16);
    P.bx(g, 9.1, 0.15, 2.7, '#d8dde6', 0, 3.05, 0);
    [-4.45, 4.45].forEach((x) => P.bx(g, 0.15, 2.4, 2.6, c, x, 1.85, 0));
    P.bx(g, 9, 0.5, 0.16, c, 0, 0.95, 1.25);
    for (let i = 0; i < 4; i++) { P.bx(g, 1.3, 0.12, 0.8, '#8f1d2c', -3 + i * 2, 1.25, -0.7); P.bx(g, 1.3, 0.8, 0.12, '#8f1d2c', -3 + i * 2, 1.65, -1.08); }
    if (label) { const t = G.textPlane(label, 0.32, { color: '#ffcf6e', bg: '#1b1b22', size: 64, pad: 12 }); t.position.set(0, 2.85, 1.3); g.add(t); }
    [[-3, 1.3], [3, 1.3], [-3, -1.3], [3, -1.3]].forEach(([x, z]) => { const w = P.cy(g, 0.5, 0.5, 0.3, '#1d1d22', x, 0.5, z); w.rotation.x = Math.PI / 2; });
    return g;
  };
  // Cutscene: both of them ride a bus from x0 to x1 along the road at z. Ends with them standing at `exit`.
  LV.busRide = function (game, o) {
    const bus = LV.busCutaway(o.color, o.label);
    const L = game.level, y = o.y || 0;
    bus.position.set(o.x0, y, o.z); L.add(bus);
    const mo = game.player('mohamed'), ma = game.player('mariem');
    const seat = (p, dx) => { p.place(new THREE.Vector3(bus.position.x + dx, y + 0.9, o.z - 0.7)); p.body.vy = 0; p.yaw = 0; };
    game.cutscene({
      title: o.title, sub: o.sub, dur: o.dur || 6.5, lines: o.lines, dist: 7.5, h: 2.2, at: [o.x0, y, o.z],
      start: () => { mo.pose = 'sit'; ma.pose = o.sleep ? 'sleep' : 'sit'; seat(mo, -0.45); seat(ma, 0.35); },
      tick: (t, dt, g) => {
        const k = MM.ease.inOut(MM.clamp(t / (o.dur || 6.5), 0, 1));
        bus.position.x = MM.lerp(o.x0, o.x1, k);
        seat(mo, -0.45); seat(ma, 0.35);
        g.cut.center.x = bus.position.x;
      },
      end: () => {
        mo.pose = null; ma.pose = null;
        mo.place(new THREE.Vector3(o.exit[0] - 0.7, o.exit[1], o.exit[2])); ma.place(new THREE.Vector3(o.exit[0] + 0.7, o.exit[1], o.exit[2]));
        if (o.end) o.end(game);
      },
    });
  };

  /* Two lanes, one each, joined at the end (used for Sharm and for the United States).
     cfg: { a, b (lane materials), dressA(L), dressB(L), signA, signB, talks, kind, mems: [memA, memB], hazard, call } */
  LV.apart = function (L, P, cfg) {
    const { a, b } = cfg;
    L.spawn('mohamed', 2, 0, -5.5); L.spawn('mariem', 2, 0, 5.5);
    L.counter('msgs', cfg.counterLabel || 'Messages', 6, { optional: true });
    L.water(-60, 160, -60, 60, -1.3);
    // lane boundaries (the distance keeps them apart until the call connects)
    [[-8.6, -8], [-3, -2.4], [2.4, 3], [8, 8.6]].forEach(([z0, z1]) => { L.invisible(-6, 84, 0, 14, z0, z1); L.invisible(88, 96, 0, 14, z0, z1); });
    L.invisible(84, 88, 0, 14, -8.6, -8); L.invisible(84, 88, 0, 14, 8, 8.6);
    L.invisible(-6.5, -6, 0, 14, -9, 9); L.invisible(96, 96.5, 0, 14, -9, 9);
    // his lane
    L.ground(-6, 12, -8, -3, 0, { mat: a }); L.ground(20, 44, -8, -3, 0, { mat: a });
    L.box(44, 46, -3, 0, -8, -3, a);
    L.box(46, 64, 0, 4, -8, -3, cfg.roof || a);
    L.box(64, 66, 0, 3, -8, -3, a); L.box(66, 68, 0, 2, -8, -3, a); L.box(68, 70, 0, 1, -8, -3, a);
    L.ground(70, 96, -8, -3, 0, { mat: a });
    // her lane
    L.ground(-6, 44, 3, 8, 0, { mat: b });
    L.ground(48, 50, 3, 8, 0, { mat: b }); L.ground(54, 56, 3, 8, 0, { mat: b }); L.ground(60, 62, 3, 8, 0, { mat: b });
    L.ground(68.5, 96, 3, 8, 0, { mat: b });
    cfg.dressA(L, P); cfg.dressB(L, P);
    L.sign(cfg.signA, 1, 2, -7.4, { h: 0.34 });
    L.sign(cfg.signB, 1, 2, 7.6, { h: 0.34 });
    (cfg.talks || []).forEach((t) => L.talk(t[0], t[1], t[2], t[3]));
    const msg = (x, y, z) => L.item(cfg.kind || 'letter', x, y, z, { counter: 'msgs' });
    // 1: her support builds his bridge
    L.plate('call1', 10, 5.5, 0, { label: 'SUPPORT' });
    L.bridge('call1', 12, 20, -0.5, 0, -8, -3, { color: '#ffcf6e', glow: true });
    L.sign('Your button builds HIS bridge', 8, 2.2, 3.6, { h: 0.3 });
    msg(16, 1.2, 5.5);
    L.checkpoint(22, -3.4, 0, { m: [22, 0, -5.5], f: [22, 0, 5.5] });
    // 2: his crate opens her door
    L.crate(23.6, -5.5, 0, { label: cfg.crateLabel || 'BOOKS' });
    L.plate('heavy2', 28, -5.5, 0, { heavy: true, label: 'WEIGHT' });
    L.door('heavy2', 30, 31, 0, 5, 3, 8, { label: 'CLOSED', color: '#ff6f9c' });
    L.box(30, 31, 5, 6, 3, 8, L.M.wall);
    L.sign('Push the box onto the gold button', 22.5, 2.4, -7.5, { h: 0.3 });
    msg(26, 1.2, -5.5);
    LV.heartsArc(L, 32, 38, 1.2, 5.5, 3);
    // 3: her timed button lifts him to the rooftops
    L.plate('lift3', 42, 5.5, 0, { latch: 6, label: '6 SEC' });
    L.elevator('lift3', 42.6, 46, -7.4, -3.6, 0.4, 4, { label: 'LIFT' });
    L.checkpoint(41, -3.4, 0, { m: [41, 0, -5.5], f: [41, 0, 5.5] });
    msg(52, 1.4, 5.5);
    L.memory(cfg.mems[0], 52, 5.2, -6.6);
    LV.heartsArc(L, 48, 60, 5.4, -5.5, 5, 0.3);
    L.hazard(58, 4.9, -5.5, { kind: 'cloud', r: 0.7, label: cfg.hazard || 'JET LAG' });
    const jl = L.hazards[L.hazards.length - 1]; jl.z = -7.6; jl.dz = 4.2; jl.period = 2.6;
    // 4: dash gap
    L.sign('Mariem: Power = Kitten Dash (works in mid-air!)', 58.5, 2.2, 7.4, { h: 0.3 });
    L.checkpoint(61, -3.4, 4, { m: [61, 4, -5.5], f: [61, 0, 5.5] });
    msg(65, 1.6, 5.5);
    L.memory(cfg.mems[1], 71, 1.4, 6.6);
    msg(76, 1.2, -5.5); msg(76, 1.2, 5.5);
    // 5: the call
    L.prop('booth', 80, 0, -7.2, { args: ['#5aa9ff', 'CALL'] }); L.prop('booth', 80, 0, 7.2, { args: ['#ff6f9c', 'CALL'] });
    L.plate('callA', 80, -5.5, 0, { label: 'CALL' }); L.plate('callB', 80, 5.5, 0, { label: 'CALL' });
    L.logic('call', (s, lv) => (lv._call = lv._call || (s.callA && s.callB)));
    L.bridge('call', 84, 88, -0.4, 0, -3, 3, { axis: 'z', color: '#ffe7a8', glow: true });
    L.talk(77, 'mariem', 'Both CALL buttons at once. Pick up, pick up...');
    L.goalZone([{ x0: 84.6, x1: 87.4, z0: -1.4, z1: 1.4, label: cfg.goalLabel || 'Meet in the middle' }], { req: 'call', reqText: 'Call each other at the same time' });
    const [c1, c2] = cfg.call || ['Can you hear me?', 'Always. Come home.'];
    L.anim.push(function () { if (L._call && !L._callSaid) { L._callSaid = true; L.game.say('mohamed', c1, 2); setTimeout(() => L.game.say('mariem', c2, 2.4), 2100); } });
  };

  const { frontRail, backWall, heartsArc } = LV;

  MM.CHAPTERS = [
    /* =================================================================== 1 */
    {
      id: 'kids', num: 1, year: 'Childhood', title: 'The Same School', theme: 'school', music: 'school',
      outfit: { mohamed: 'school', mariem: 'school' }, scale: 0.8, camera: { dist: 8.4, height: 4.4 },
      intro: ['Long ago, two kids went to the same school. Both of them, top of the class.', 'He was loud and funny, and had a new crush every few weeks.', 'She was shy and talked to no one. She just watched him from far away and whispered: "I wish he were mine."'],
      mission: 'Get to the final exam together. Find the 3 gold stars on the way.',
      objectives: [{ label: 'Find 3 gold stars', counter: 'stars' }, { label: 'Pass the exam together', sig: 'exam' }, { label: 'Top of the class, both', goal: true }],
      outro: { title: 'Top of the class', quote: 'Two names on the same honour board. Neither of them knew yet that it was the same story.' },
      finale: { kind: 'celebrate', lines: [[0.4, 'mohamed', 'You\'re Mariem, right? Top of the class, same as me.'], [2.8, 'mariem', '(He knows my name. HE KNOWS MY NAME.)']] },
      killY: -10,
      build(L, P) {
        L.spawn('mohamed', 0, 0, 0.8); L.spawn('mariem', 2, 0, 0.8);
        L.counter('stars', 'Gold stars', 3);
        L.ground(-7, 96, -4, 4);
        frontRail(L, -7, 96, 4);
        L.invisible(-7.5, -7, 0, 6, -4, 4);
        backWall(L, -7, 96, -4.2, 6.5);
        L.prop('chalkboard', 4, 0, -4.1, { args: [7, 'Class 4A\nFinal exams this week'] });
        [13, 18, 29, 45, 58, 76, 90].forEach((x) => L.prop('bigWindow', x, 1.4, -4.15, { args: [3, 2.6] }));
        for (let x = -4; x < 20; x += 3.2) { L.prop('desk', x, 0, -3.5); L.prop('schoolChair', x, 0, -2.85, { ry: Math.PI }); }
        L.prop('globe', 20, 0, -3.2); L.prop('plant', -5.5, 0, -3.2);
        L.sign('Move: WASD · Arrows · Stick', 0.5, 1.7, -1.6);
        L.talk(2, 'mohamed', 'Top of the class again! ...Who\'s the quiet girl with the perfect handwriting?');
        L.talk(5, 'mariem', '(Don\'t look at him. He has a new crush every week anyway.)');
        L.sign('Jump!', 5.8, 1.7, -2);
        L.box(7, 8.2, 0, 0.8, -4, 4, { top: G.mat('#e05d6f'), side: G.mat('#b8475a') });
        heartsArc(L, 6.6, 8.6, 1.6, 0, 3, 0.4);
        L.box(11, 13.4, 0, 1.1, -1.8, 0.6, { top: G.mat('#c58e5a'), side: G.mat('#8f5f36') });
        L.memory('topclass', 12.2, 2.1, -0.6);
        L.item('goldstar', 12.2, 1.7, 1.6, { counter: 'stars' });
        L.talk(10, 'mariem', '(One day he\'ll notice me. One day.)');
        L.sign('Pink buttons open doors while someone stands on them', 16.5, 2.2, -2.6, { h: 0.3 });
        L.wall(21, 22, 0, 4.6, -4, -1.2); L.wall(21, 22, 0, 4.6, 1.2, 4); L.wall(21, 22, 3, 4.6, -1.2, 1.2);
        L.door('p1', 21.15, 21.85, 0, 3, -1.2, 1.2, { label: 'Class 4A' });
        L.plate('p1', 18.5, -2.4); L.plate('p1', 25, 2.4);
        heartsArc(L, 23, 28, 1.2, 0, 3);
        L.checkpoint(27, -3);
        L.prop('locker', 30, 0, -3.5); L.prop('locker', 30.8, 0, -3.5, { args: ['#ff8fa8'] }); L.prop('locker', 31.6, 0, -3.5);
        L.sign('Only Mariem is small enough for the gap', 31.5, 2.4, -1.8, { h: 0.3 });
        L.wall(34, 35, 0, 5, -4, -1); L.wall(34, 35, 1.45, 5, -1, 1.3);
        L.door('p2', 34.1, 34.9, 0, 5, 1.3, 4, { label: 'Staff only', mode: 'down' });
        L.item('goldstar', 34.5, 0.7, 0.15, { counter: 'stars' });
        L.plate('p2', 38, -2.4);
        L.talk(33, 'mariem', 'I\'ll squeeze through. Small has its perks!');
        heartsArc(L, 36, 41, 1.2, 1.5, 3);
        L.sign('Mohamed can push heavy boxes. Build a step!', 41.5, 2.2, -2.6, { h: 0.3 });
        L.crate(44, 0.5, 0, { label: 'Lost & Found' });
        L.box(50, 60, 0, 2.6, -4, 4, { top: G.mat('#f1c27d'), side: G.mat('#c08a4a') });
        L.memory('wish', 55, 3.7, -2.2);
        heartsArc(L, 52, 58, 3.5, 1.5, 4, 0.3);
        L.checkpoint(52, -3, 2.6);
        L.sign('Mohamed: Power next to Mariem = TOSS her up!', 63, 2.2, -2.8, { h: 0.3 });
        L.wall(66, 69, 0, 4.6, -4, -1); L.wall(66, 69, 0, 4.6, 1, 4); L.wall(66, 69, 2.6, 4.6, -1, 1);
        L.door('p3', 66.15, 68.85, 0, 2.6, -1, 1, { label: 'Gym' });
        L.plate('p3', 67.5, -2.5, 4.6);
        L.item('goldstar', 67.5, 5.4, 2.5, { counter: 'stars' });
        L.talk(62, 'mohamed', 'Ready? One, two... up you go!');
        L.checkpoint(72, -3);
        L.plate('pass1', 78, -2.2, 0, { label: 'PASS' }); L.plate('pass2', 78, 2.2, 0, { label: 'PASS' });
        L.logic('exam', (s, lv) => (lv._exam = lv._exam || (s.pass1 && s.pass2)));
        L.door('exam', 84, 85, 0, 5, -4, 4, { label: 'FINAL EXAM', color: '#ff6f9c' });
        L.wall(84, 85, 5, 6.5, -4, 4);
        L.talk(74, 'mariem', 'Final exam. Both buttons at the same time.');
        L.talk(80, 'mohamed', 'We studied. We\'re ready. Probably.');
        for (let x = 87; x < 95; x += 2.6) { L.prop('desk', x, 0, -3.2); L.prop('desk', x, 0, 3.2); }
        L.prop('chalkboard', 92, 0, -4.1, { args: [6, 'TOP STUDENTS\nMohamed Yousry\nMariem Hossam'] });
        L.goalZone([{ x0: 88, x1: 93, z0: -2.2, z1: 2.2, label: 'Top of the class' }], { req: 'count:stars', reqText: 'Find all 3 gold stars first' });
        heartsArc(L, 86, 94, 1.3, 0, 3);
      },
    },

    /* =================================================================== 2 */
    {
      id: 'physics', num: 2, year: '2021', title: 'The Physics Lesson', theme: 'physics', music: 'physics',
      outfit: { mohamed: 'school', mariem: 'school' },
      intro: ['Thanaweya Amma: the year that decides everything.', 'A physics lesson at a friend\'s house. A teacher, a whiteboard, a living room full of students.', 'That\'s where he really got to know her. He came for physics. He left in love.'],
      mission: 'Solve the 3 physics problems together: the seesaw, the pulley and the circuit. Then sit together.',
      objectives: [{ label: 'Physics problems solved', counter: 'cards' }, { label: 'Sit together', goal: true }],
      outro: { title: 'He left in love', quote: 'Every action has an equal and opposite reaction. He looked at her; she looked away and smiled.' },
      finale: { kind: 'pose', at: [56, 0, 0.8], poses: { mohamed: 'sit', mariem: 'sit' }, yaw: 0, lines: [[0.4, 'mohamed', 'Can I have your number? For physics questions.'], [2.8, 'mariem', 'Only physics questions?'], [5, 'mohamed', '...Mostly.']] },
      killY: -10,
      build(L, P) {
        L.spawn('mohamed', 0, 0, 0.8); L.spawn('mariem', 2, 0, 0.8);
        L.counter('cards', 'Problems', 3);
        const floor = { top: LV.woodFloor('#c98f5a', '#7a4f2a'), side: G.mat('#8f5f36') };
        L.ground(-6, 62, -4.5, 4.5, 0, { mat: floor });
        frontRail(L, -6, 62, 4.5); L.invisible(-6.5, -6, 0, 10, -5, 5); L.invisible(62, 62.5, 0, 12, -5, 5);
        backWall(L, -6, 62, -4.5, 9);
        [6, 20, 34, 48].forEach((x) => L.prop('bigWindow', x, 1.6, -4.55, { args: [3, 2.4, '#ffe2b8'] }));
        L.prop('whiteboard', 2, 0, -4.4, { args: ['Physics · Thanaweya Amma 2021', 6] });
        for (let x = -3; x < 9; x += 2.2) { L.prop('schoolChair', x, 0, 2.8, { ry: Math.PI }); }
        L.prop('sofa', 9, 0, -3.6, { args: ['#9fb4d9'] }); L.prop('plant', -5, 0, -3.8); L.prop('bookshelf', 26, 0, -4.1);
        L.npc('The teacher', 4.5, 0, -2.6, { look: { gender: 'm', glasses: true, bald: true, top: '#5a6f99', bottom: '#2c2f3a' }, line: 'Newton\'s third law: every action has an equal and opposite reaction. Mohamed. Eyes on the board.', r: 3.4 });
        L.npc('A friend', -3.5, 0, -2.8, { look: { gender: 'm', top: '#e0a050' }, line: 'Welcome to my living room, everyone. Shoes off!', r: 2.6, ry: 0.6 });
        L.talk(6, 'mohamed', '(She\'s here. Same lesson. Act normal.)');
        L.talk(8, 'mariem', '(He sat right behind me. Focus. Physics. Focus.)');
        L.memory('physics', 7, 1.6, 2.4);
        heartsArc(L, 0, 6, 1.3, 1.2, 3);
        // problem 1: the seesaw (Newton's third law)
        L.sign('Problem 1 · Mariem on the pink end, Mohamed JUMPS on the blue end', 13, 2.6, -2.8, { h: 0.26 });
        L.seesaw(14, 0, 0, { len: 6, power: 21, label: 'F = m · a' });
        L.box(15, 19.4, 6.7, 7.0, -1.6, 1.6, { top: G.mat('#ffffff'), side: G.mat('#cfd6dd') }, { oneWay: true });
        L.item('card', 17.6, 7.6, 0, { counter: 'cards', sub: 'Action = Reaction' });
        L.sign('Too high for a toss. Physics!', 18.5, 2.4, 2.6, { h: 0.24 });
        heartsArc(L, 15.5, 19, 8.4, 0, 3, 0.3);
        L.checkpoint(21.5, -3);
        // problem 2: the pulley
        L.sign('Problem 2 · The pulley: his weight lifts her', 23, 2.6, 2.8, { h: 0.26 });
        L.plate('mass', 24.5, 2.5, 0, { heavy: true, label: 'MASS' });
        L.elevator('mass', 27, 30, -3.6, -1, 0.3, 5.2, { label: 'PULLEY' });
        L.box(30, 33.5, 0, 5.2, -4.5, -1, { top: G.mat('#f1d9bf'), side: G.mat('#c9a27c') });
        L.item('card', 31.8, 5.9, -2.6, { counter: 'cards', sub: 'm · g = T' });
        L.memory('number', 32.8, 5.9, -3.6);
        L.talk(24, 'mariem', 'Stand on MASS. No offence.');
        L.talk(26, 'mohamed', 'None taken. I\'m a very useful mass.');
        // problem 3: the circuit
        L.checkpoint(35, 3);
        L.sign('Problem 3 · Close the circuit: both switches at once', 37, 2.6, -1.2, { h: 0.26 });
        L.plate('sw1', 38, -2.8, 0, { label: 'SWITCH' }); L.plate('sw2', 45, 2.8, 0, { label: 'SWITCH' });
        L.logic('circuit', (s, lv) => (lv._circ = lv._circ || (s.sw1 && s.sw2)));
        L.wall(48, 49, 0, 9, -4.5, -1.4); L.wall(48, 49, 0, 9, 1.4, 4.5); L.wall(48, 49, 3.2, 9, -1.4, 1.4);
        L.door('circuit', 48.1, 48.9, 0, 3.2, -1.4, 1.4, { label: 'CIRCUIT', color: '#ffcf6e' });
        const bulb = G.mesh(G.sphere(0.5, 16, 12), G.mat('#fff5df', { e: '#ffd88a', ei: 0.05 }).clone(), 47.3, 5.6, 0, L.group);
        L.anim.push(() => { if (L._circ && !L._lit) { L._lit = true; bulb.material.emissiveIntensity = 3; MM.Audio.sfx('item'); L.game.fx.emit('sparkle', bulb.position.clone(), { n: 24, color: 0xffd88a }); } });
        L.item('card', 51.5, 1.4, 0, { counter: 'cards', sub: 'V = I · R' });
        heartsArc(L, 38, 45, 1.3, 0, 4);
        // the end of the lesson
        L.prop('whiteboard', 56, 0, -4.4, { args: ['F = m · a  ♥', 5] });
        L.prop('rug', 56, 0, 0.6, { args: [4, 3, '#e8c6a8'] });
        L.goalZone([{ x0: 54, x1: 58, z0: -0.8, z1: 2.4, label: 'Sit together' }], { req: 'count:cards', reqText: 'Solve all 3 problems first' });
        heartsArc(L, 52, 60, 1.3, 2.8, 3);
      },
    },

    /* =================================================================== 3 */
    {
      id: 'calls', num: 3, year: '2021', title: 'All Night on the Phone', theme: 'grind', music: 'grind',
      outfit: { mohamed: 'school', mariem: 'school' },
      intro: ['After that lesson, the phone never really hung up.', 'They studied all night on speaker. "Did you finish the chapter?" "Did you?"', 'Whenever one of them wanted to quit, the other said: one more page.'],
      mission: 'Collect the 5 subjects and stay awake until results day. Smash the walls of sleep.',
      objectives: [{ label: 'Subjects revised', counter: 'books' }, { label: 'Voice notes', counter: 'calls', optional: true }, { label: 'Results day', goal: true }],
      outro: { title: 'We both passed', quote: 'Results day. Both names on the list. He called her before he called anyone else.' },
      finale: { kind: 'celebrate', lines: [[0.4, 'mariem', 'We passed! BOTH of us!'], [2.6, 'mohamed', 'Told you. One more page.']] },
      killY: -12,
      build(L, P) {
        L.spawn('mohamed', 0, 0, 0.8); L.spawn('mariem', 2, 0, 0.8);
        L.counter('books', 'Subjects', 5);
        L.counter('calls', 'Voice notes', 13, { optional: true });
        const vn = (x, y, z) => L.item('voice', x, y, z, { counter: 'calls' });
        L.ground(-6, 24, -4, 4);
        frontRail(L, -6, 24, 4);
        L.invisible(-6.5, -6, 0, 6, -4, 4);
        L.prop('laptop', 4, 0, -9, { args: [4] });
        L.prop('deskLamp', -4, 0, -7.5, { args: [3] });
        L.prop('mug', 11, 0, -6.5, { args: ['#ff9cc0', 2.4] });
        L.prop('phoneBig', -1, 0, -6.5, { s: 2.2, args: ['#ff9cc0'] });
        L.prop('moon', 30, 26, -70, { args: [7] });
        L.prop('bookStack', 18, 0, -6.5, { args: [9, 4], s: 2.4 });
        L.talk(2, 'mohamed', '2 AM. Chemistry. Are you still awake?');
        L.talk(5, 'mariem', 'Obviously. One more page, then you sleep. Deal?');
        for (let x = 2; x < 10; x += 2) vn(x, 1.1, 1.6);
        L.sign('Mohamed: Jump, then Power in mid-air = SLAM', 8.5, 2.2, -2.6, { h: 0.3 });
        L.breakable('doubt1', 12, 13, 0, 4, -4, 4, { label: 'SLEEPY', color: '#8e7fa8' });
        L.talk(10, 'mariem', 'That wall says "sleepy". Smash it.');
        L.memory('allnight', 20, 1.6, -2);
        heartsArc(L, 1, 7, 1.3, -1.8, 4); heartsArc(L, 16, 22, 1.2, 2, 3); heartsArc(L, 37, 45, 1.2, 2.6, 4, 0.4); heartsArc(L, 51, 54, 6.2, 2.4, 2, 0.2); heartsArc(L, 69, 76, 6.2, -1.2, 3, 0.3);
        L.checkpoint(17, -3);
        const ruler = L.mover(24, 27, -0.4, 0, -1.5, 1.5, { dx: 9, period: 6, color: '#ffd84d' });
        const ticks = G.textPlane('1  2  3  4  5', 0.22, { color: '#5b4300', size: 60, pad: 4 }); ticks.rotation.x = -Math.PI / 2; ticks.position.set(0, 0.21, 0); ruler.mesh.add(ticks);
        for (let x = 26; x <= 34; x += 2) vn(x, 1.0, 0);
        L.item('book', 30, 1.6, 0.9, { counter: 'books', sub: '#5aa9ff' });
        L.ground(36, 46.4, -4, 4); L.ground(46.4, 50, -4, 4);
        frontRail(L, 36, 50, 4);
        L.hazard(40.5, 1.0, 0, { kind: 'cloud', dz: 0, dx: 0, r: 0.75, label: 'STRESS' });
        const cloudObj = L.hazards[L.hazards.length - 1]; cloudObj.z = -3.4; cloudObj.dz = 6.8; cloudObj.period = 3.2;
        L.checkpoint(37, -3);
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
        L.box(55, 57, 5, 9, -4, -1, L.M.wall); L.box(55, 57, 6.45, 9, -1, 1, L.M.wall);
        L.breakable('doubt2', 55, 57, 5, 9, 1, 4, { label: 'TOO\nHARD', color: '#8e7fa8' });
        L.item('book', 56, 5.7, 0, { counter: 'books', sub: '#7ee0c3' });
        L.talk(54, 'mohamed', '"Too hard"? Watch this.');
        L.breakable('cage', 60, 62, 5, 6.7, -3.8, -0.8, { label: 'LATER', color: '#a091bb' });
        L.item('book', 61, 5.8, -2.3, { counter: 'books', sub: '#ffcf6e', req: 'broken:cage' });
        L.hazard(63, 5.9, 0, { kind: 'cloud', r: 0.7, label: 'PANIC' });
        const c2 = L.hazards[L.hazards.length - 1]; c2.z = -3.4; c2.dz = 6.8; c2.period = 2.8;
        L.box(64, 66, 5, 7.6, -1, 1, { top: G.mat('#ffcf6e'), side: G.mat('#b98a3a') });
        L.item('book', 65, 8.4, 0, { counter: 'books', sub: '#c59cff' });
        for (let x = 58; x < 66; x += 2) vn(x, 6.2, 2.4);
        L.door('count:books', 67, 67.8, 5, 9, -4, 4, { label: 'RESULTS DAY', color: '#ffcf6e' });
        L.box(67, 67.8, 9, 10.5, -4, 4, L.M.wall);
        const env = new THREE.Group();
        P.bx(env, 3.2, 2.1, 0.2, '#fffdf6', 0, 1.05, 0); const st = G.textPlane('PASSED · PASSED', 0.3, { color: '#2fb39a', size: 70, pad: 6 }); st.position.set(0, 1.1, 0.12); env.add(st);
        L.deco(env, 74, 5, -3.2, 0.15);
        L.memory('passed', 69.5, 6.2, 2.6);
        L.goalZone([{ x0: 70.5, x1: 76, z0: -1.8, z1: 2.4, y: 5, label: 'Results day' }], { req: 'count:books', reqText: 'Revise all 5 subjects' });
      },
    },

    /* =================================================================== 4 */
    {
      id: 'whitecoat', num: 4, year: '2021', title: 'The White Coat', theme: 'alex', music: 'alex',
      outfit: { mohamed: 1, mariem: 1 },
      intro: ['University. He chose Computer Engineering. She chose the Faculty of Medicine, Alexandria.', 'On her first day, he took her all the way to the gate.', 'Then she put on the white coat, and he forgot how to talk.'],
      mission: 'Get Mariem to the Faculty of Medicine. Find her student ID, her stethoscope and her white coat.',
      objectives: [{ label: 'ID, stethoscope, white coat', counter: 'kit' }, { label: 'Through the faculty gate', goal: true }],
      outro: { title: 'First day', quote: 'He waved until she disappeared into the building. Then he waved a bit more, just in case.' },
      finale: { kind: 'celebrate', lines: [[0.4, 'mohamed', 'Dr. Mariem. It has a nice ring to it.'], [2.8, 'mariem', 'I\'m not a doctor yet! ...Say it again though.']] },
      killY: -8,
      build(L, P) {
        L.spawn('mohamed', 0, 0, 0.8); L.spawn('mariem', 2, 0, 0.8);
        L.counter('kit', 'First-day kit', 3);
        const walk = { top: G.mat('#e6dccb', { r: 0.9 }), side: G.mat('#a99a80') };
        L.ground(-6, 24, -4, 4, 0, { mat: walk }); L.ground(30, 86, -4, 4, 0, { mat: walk });
        frontRail(L, -6, 86, 4); L.invisible(-6.5, -6, 0, 8, -4, 4); L.invisible(86, 86.5, 0, 12, -4, 4);
        L.invisible(-6, 86, 0, 10, -4.6, -4);
        const r = MM.rng(41);
        for (let x = -8; x < 90; x += 8.5) L.prop('alexBuilding', x, 0, -7.5, { args: [7.5, 8 + r() * 8, ['#f1d9c4', '#e8c8b0', '#f4e6cf', '#d9c9b4'][Math.floor(r() * 4)], Math.floor(r() * 50)] });
        L.sign('← Faculty of Engineering (his)', -4, 2.2, -3.4, { h: 0.26 });
        L.sign('Faculty of Medicine (hers) →', 3, 2.2, -3.4, { h: 0.26 });
        L.talk(1, 'mohamed', 'First day. I\'m walking you all the way to the gate. No arguments.');
        L.talk(4, 'mariem', 'What if I get lost? What if they\'re all geniuses?');
        L.talk(6, 'mohamed', 'Then you\'ll fit right in.');
        heartsArc(L, 0, 7, 1.3, 2.6, 4);
        // the road: look both ways
        const road = new THREE.Mesh(new THREE.PlaneGeometry(6, 30), G.mat('#3b3946', { r: 0.9 })); road.rotation.x = -Math.PI / 2; road.position.set(13, 0.02, -5); L.add(road);
        for (let z = -3.5; z <= 3.5; z += 1) { const s = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 0.45), G.basic('#f4efe7')); s.rotation.x = -Math.PI / 2; s.position.set(13, 0.03, z); L.add(s); }
        L.sign('Look both ways!', 9, 2.2, -3.2, { h: 0.3 });
        [[11.3, -12, 24, 0], [14.7, 12, -24, 0.5]].forEach(([x, z, dz, ph]) => {
          const g = new THREE.Group(); const taxi = MM.Props.taxi(); taxi.position.y = -0.75; taxi.rotation.y = dz > 0 ? 0 : Math.PI; g.add(taxi);
          L.hazard(x, 0.75, z, { mesh: g, dz, period: 4.4, phase: ph, linear: true, box: { w: 1.9, h: 1.5, d: 3.6 } });
        });
        L.checkpoint(18, -3);
        L.prop('fence', 19, 0, -3.8, { args: [4, '#2f6fb3'] });
        L.box(18.5, 21, 0, 0.55, 1.2, 2.6, { top: G.mat('#c58e5a'), side: G.mat('#8f5f36') });
        L.item('badge', 19.8, 1.25, 1.9, { counter: 'kit' });
        L.memory('firstday', 22.5, 1.5, -2.2);
        // road works: ride the platform
        L.sign('Road works! Ride the platform', 22, 2.4, 2.6, { h: 0.28 });
        L.mover(23.6, 26.6, -0.4, 0, -1.5, 1.5, { dx: 3.6, period: 5, color: '#ffcf3d', side: '#2f2f38' });
        [[24, -3], [29.5, -3], [24, 3], [29.5, 3]].forEach(([x, z]) => { const c = G.mesh(G.cone(0.3, 0.8, 10), G.mat('#ff7a2f'), x, 0.4, z, L.group); c.castShadow = true; });
        heartsArc(L, 24.5, 29.5, 1.6, 0, 3, 0.5);
        L.checkpoint(31, -3);
        // stethoscope on the kiosk roof
        L.box(32.5, 35.5, 0, 4.6, -4, -1.5, { top: G.mat('#2f6fb3'), side: G.mat('#f4efe7') });
        L.sign('Kiosk', 34, 2.4, -1.45, { h: 0.3, post: false });
        L.item('stetho', 34, 5.3, -2.7, { counter: 'kit' });
        L.sign('Toss her up for the stethoscope', 36.5, 2.2, 2.6, { h: 0.26 });
        L.talk(32, 'mariem', 'My stethoscope! Who leaves a stethoscope on a kiosk?!');
        heartsArc(L, 37, 44, 1.3, 1.6, 4);
        // locker room with a hatch only she fits through
        L.box(46, 52, 0, 4, -4.4, -4.2, L.M.wall);
        L.box(46, 46.2, 0, 4, -4.4, -1.2, L.M.wall); L.box(51.8, 52, 0, 4, -4.4, -1.2, L.M.wall);
        L.box(46, 48, 0, 4, -1.4, -1.2, L.M.wall); L.box(50, 52, 0, 4, -1.4, -1.2, L.M.wall); L.box(48, 50, 1.45, 4, -1.4, -1.2, L.M.wall);
        L.box(46, 52, 4, 4.3, -4.4, -1.2, { top: G.mat('#ffffff'), side: G.mat('#cfd6dd') });
        L.sign('Lockers · staff hatch', 49, 3.3, -1.15, { h: 0.24, post: false });
        L.prop('locker', 47.2, 0, -3.8); L.prop('locker', 48, 0, -3.8, { args: ['#9fd3c9'] }); L.prop('locker', 50.8, 0, -3.8);
        L.item('coat', 49.4, 1.0, -3, { counter: 'kit', who: 'mariem', onTake: (lv) => { const ma = lv.game.player('mariem'); if (ma) ma.setOutfit('coat'); lv.game.ui.cinemaText('The white coat', 'Faculty of Medicine · Alexandria University'); setTimeout(() => lv.game.ui.cinemaText(null), 3200); } });
        L.talk(45, 'mohamed', 'I won\'t fit through that hatch. Go get your coat, doctor.');
        L.checkpoint(54, -3);
        // the gate
        const gate = MM.Props.facultyGate('Faculty of Medicine', 'Alexandria University'); L.deco(gate, 64, 0, -0.3);
        L.box(55, 59.5, 0, 6.5, -4, -2.6, L.M.wall, { noShadow: true }); L.box(68.5, 74, 0, 6.5, -4, -2.6, L.M.wall, { noShadow: true });
        L.door('count:kit', 63.4, 64.6, 0, 5.4, -4, 4, { label: 'FIRST DAY', color: '#2fb39a' });
        L.wall(63.4, 64.6, 5.4, 7.2, -4, 4);
        L.talk(58, 'mariem', 'The gate won\'t open until I have everything. ID, stethoscope, coat.');
        for (let x = 67; x < 84; x += 4) L.prop('palm', x, 0, -3.4, { args: [3.6] });
        L.memory('whitecoat', 70, 1.6, 2.4);
        L.goalZone([{ x0: 74, x1: 80, z0: -2, z1: 2.4, label: 'First day' }], { req: 'count:kit', reqText: 'ID, stethoscope and the white coat' });
        heartsArc(L, 66, 72, 1.3, -1.2, 3);
      },
    },

    /* =================================================================== 5 */
    {
      id: 'cheap', num: 5, year: '2021 – 2022', title: 'Zero Money, Full Hearts', theme: 'sunset', music: 'alex',
      outfit: { mohamed: 1, mariem: 1 },
      intro: ['He had no money. Not a little: none.', 'So they ate koshari, kebda and McDonald\'s fries, took the bus after college and sat on the Corniche watching the sea.', 'Not engaged, no car. Just two friends who loved each other. She worried about him every single day.'],
      mission: 'Share 3 cheap meals (koshari, kebda, fries), catch the bus together, then watch the sunset on the Corniche.',
      objectives: [{ label: 'Meals shared', counter: 'meals' }, { label: 'Pocket money', counter: 'coins' }, { label: 'Catch the bus together', sig: 'bus' }, { label: 'Sunset on the Corniche', goal: true }],
      outro: { title: 'Richest people on the Corniche', quote: 'One sandwich split in two, the sea in front of them, and nothing in their pockets. They have never been richer.' },
      finale: { kind: 'pose', poses: { mohamed: 'sit-arm', mariem: 'sleep' }, yaw: Math.PI, place: { mohamed: [91.2, 0.95, -3.85], mariem: [90.4, 0.95, -3.85] }, at: [90.8, 0.95, -3.85], lines: [[0.5, 'mariem', 'Did you eat today? Really eat?'], [3, 'mohamed', 'Koshari, kebda AND fries. I\'m a king.'], [5.6, 'mariem', 'A king with zero pounds.'], [8, 'mohamed', 'The richest guy on the Corniche.']] },
      killY: -8,
      build(L, P) {
        L.spawn('mohamed', 0, 0, 0.8); L.spawn('mariem', 2, 0, 0.8);
        L.counter('meals', 'Meals', 3); L.counter('coins', 'Coins', 6);
        const walk = { top: G.mat('#e2cdb8', { r: 0.9 }), side: G.mat('#9f8670') };
        L.ground(-6, 96, -4, 4, 0, { mat: walk });
        frontRail(L, -6, 96, 4); L.invisible(-6.5, -6, 0, 10, -4, 4); L.invisible(96, 96.5, 0, 12, -4, 4);
        L.invisible(-6, 86, 0, 10, -4.6, -4.2);
        // the sea and the Corniche
        L.water(-80, 200, -120, -4.4, -1.4);
        L.box(-6, 96, -1.4, 0.9, -4.4, -4.2, { top: G.mat('#e8e1d4'), side: G.mat('#cfc6b6') }, { nosolid: true });
        L.deco(MM.Props.cornicheRail(92), 40, 0.9, -4.3);
        L.box(86, 96, 0, 0.9, -4.4, -3.4, { top: G.mat('#e8e1d4'), side: G.mat('#cfc6b6') });
        L.invisible(86, 96, 0, 10, -4.9, -4.4);
        L.prop('qaitbay', -40, -1.4, -70, { ry: 0.4, s: 1.6 }); L.prop('stanleyBridge', 70, -1.4, -55, { args: [70] });
        for (let x = -2; x < 96; x += 9) L.prop('lampPost', x, 0, -3.9);
        const coin = (x, y, z) => L.item('coin', x, y, z, { counter: 'coins' });
        L.talk(1, 'mariem', 'How much money do we have?');
        L.talk(3, 'mohamed', '(checks pockets) ...Enough for koshari. Probably.');
        // 1: koshari on the cart roof
        L.box(7, 10, 0, 2.8, -3.4, -1.4, { top: G.mat('#ffcf3d'), side: G.mat('#c9853a') });
        L.sign('KOSHARI · EGP 10', 8.5, 3.3, -1.3, { h: 0.3, post: false });
        L.item('koshari', 8.5, 3.4, -2.4, { counter: 'meals' });
        L.memory('koshari', 12, 1.6, 2.4);
        coin(5, 1.2, 2); coin(14, 1.2, -2);
        heartsArc(L, 3, 9, 1.3, 2.4, 3);
        // 2: kebda costs 3 coins
        L.checkpoint(16, -3);
        L.logic('coins3', (s, lv) => lv.counters.coins.n >= 3);
        L.box(21, 24, 0, 1.1, -3.4, -1.6, { top: G.mat('#f4efe7'), side: G.mat('#7a3a24') });
        L.sign('KEBDA · 3 coins', 22.5, 2.6, -1.5, { h: 0.3 });
        L.item('kebda', 22.5, 1.7, -2.5, { counter: 'meals', req: 'coins3' });
        L.box(18, 20, 0, 3.6, 1.6, 3.6, { top: G.mat('#cfc6b6'), side: G.mat('#a99a80') });
        coin(19, 4.4, 2.6);
        L.sign('Toss her for the coin', 17, 2.2, 0.6, { h: 0.24 });
        coin(26, 1.2, 1.5);
        L.talk(20, 'mariem', 'Kebda is 3 coins. We have... let me count.');
        // 3: fries for two
        L.checkpoint(28, -3);
        L.prop('burgerBooth', 36, 0, -3);
        L.plate('o1', 31, -2, 0, { label: 'ORDER' }); L.plate('o2', 41, 2.4, 0, { label: 'ORDER' });
        L.logic('order', (s, lv) => (lv._order = lv._order || (s.o1 && s.o2)));
        L.invisible(34, 38, 0, 2.8, -4.2, -1.7);
        L.sign('One fries, two forks: both press ORDER', 36, 3.4, -1.6, { h: 0.26, post: false });
        L.item('fries', 36, 1.4, -1.1, { counter: 'meals', req: 'order' });
        L.talk(30, 'mohamed', 'One large fries. We share. That\'s the romance.');
        coin(44, 1.2, -2); coin(46, 1.2, 2);
        heartsArc(L, 31, 41, 1.3, 0, 5, 0.4);
        // the bus after college
        L.checkpoint(44, -3);
        const stop = new THREE.Group(); P.bx(stop, 3.2, 0.1, 1.2, '#2f6fb3', 0, 2.6, 0); [-1.4, 1.4].forEach((x) => P.cy(stop, 0.05, 0.05, 2.6, '#c9ccd3', x, 1.3, -0.4)); L.deco(stop, 49, 0, 3.2);
        L.sign('BUS STOP · Corniche line', 49, 3.2, 3.4, { h: 0.26, post: false });
        L.wall(54, 56, 0, 7, -4, 4, { mat: { top: G.mat('#ffffff'), side: G.mat('#d9c9b4') } });
        L.sign('5 km to walk. Take the bus!', 52.5, 2.6, 2.8, { h: 0.28 });
        L.talk(47, 'mariem', 'Both of us at the bus stop. I\'m not taking it without you.');
        L.trigger(47.5, 51, 1.4, 4, (lv, game) => {
          lv.sig.bus = true;
          LV.busRide(game, { x0: 49, x1: 80, z: 6.6, exit: [80, 0.05, 1.5], color: '#2f6fb3', label: 'CORNICHE', sleep: true, dur: 7, title: 'The bus after college', sub: 'Her head on his shoulder, Alexandria going by the window', lines: [[1.6, null, '(Every day after college. Same bus, same seat.)'], [4.2, 'mohamed', '(Don\'t move. She\'s asleep.)']] });
        }, { both: true });
        // the Corniche at sunset
        L.memory('bus', 82, 1.6, 2.2);
        L.item('calendar', 84, 1.4, -2, { sub: 13, onTake: (lv) => lv.game.say(null, '13 July: her birthday. A year older than him, and proud of it.', 3) });
        L.item('calendar', 86, 1.4, 2, { sub: 18, onTake: (lv) => lv.game.say(null, '18 July: his birthday. Five days later. One year younger.', 3) });
        L.memory('july', 88, 1.6, 0);
        heartsArc(L, 80, 95, 1.3, 2.6, 5, 0.4);
        L.goalZone([{ x0: 88, x1: 94, z0: -3.3, z1: 0.6, label: 'Sunset' }], { req: ['count:meals', 'bus'], reqText: 'Share 3 meals and catch the bus' });
      },
    },

    /* =================================================================== 6 */
    {
      id: 'sharm', num: 6, year: '2022', title: 'A Month in Sharm', theme: 'sharm', music: 'sharm',
      outfit: { mohamed: 1, mariem: 0 },
      intro: ['2022. He went to Sharm El Sheikh for a month.', 'Sun, sea and mountains for him. Thirty days of missing him for her.', 'She was scared and sad, and still sent a voice note every night so he wouldn\'t feel alone.'],
      mission: 'Two places, one team. Help each other across from far away, then call at the same time so he can come home.',
      objectives: [{ label: 'Help each other across', sig: 'call' }, { label: 'Voice notes', counter: 'msgs', optional: true }, { label: 'Welcome home', goal: true }],
      outro: { title: 'Thirty days', quote: 'He counted the days on the beach. She counted them on the ceiling. Same number.' },
      finale: { kind: 'hug', lines: [[0.5, 'mariem', 'Never go away for a month again.'], [2.8, 'mohamed', 'Never. Okay, maybe a week. NO. Never.']] },
      killY: -2.5,
      camera: { dist: 12.5, height: 7.5 },
      build(L, P) {
        const sand = { top: G.mat('#f0d39b'), side: G.mat('#c9a36a') };
        const alex = { top: G.mat('#e6dccb'), side: G.mat('#a99a80') };
        LV.apart(L, P, {
          a: sand, b: alex, roof: { top: G.mat('#f3dfb4'), side: G.mat('#e0b97e') },
          kind: 'voice', counterLabel: 'Voice notes', crateLabel: 'SUITCASE', hazard: 'HOMESICK', goalLabel: 'Welcome home',
          signA: 'Sharm El Sheikh · Day 1', signB: 'Alexandria · missing him', mems: ['sharm', 'scared'],
          call: ['I\'m coming home tomorrow.', 'Finally. I was so scared.'],
          talks: [[3, 'mohamed', 'The sea here is unreal. I wish you could see it.'], [6, 'mariem', 'Send me a photo. And come back soon. Please.'], [30, 'mariem', 'Day fifteen. Halfway. I\'m fine. I\'m fine.'], [50, 'mohamed', 'Everything here is beautiful and none of it is her.']],
          dressA(L) {
            const r = MM.rng(8);
            for (let x = -20; x < 120; x += 12 + r() * 6) L.prop('mountain', x, -1.3, -24 - r() * 10, { args: [6 + r() * 4] });
            for (let x = 0; x < 96; x += 10) L.prop('palm', x + r() * 3, 0, -7.6, { args: [3.6 + r()] });
            for (let i = 0; i < 4; i++) L.prop('coral', 8 + i * 22, -1.6, -13 - r() * 4, { args: [i + 3], s: 0.7 });
            L.prop('beachUmbrella', 6, 0, -7, { args: ['#ff7a6b'] }); L.prop('beachUmbrella', 74, 0, -7, { args: ['#ffcf6e'] });
          },
          dressB(L) {
            L.deco(MM.Props.cornicheRail(100), 45, 0, 8.3);
            for (let x = 4; x < 96; x += 12) L.prop('lampPost', x, 0, 7.6);
          },
        });
      },
    },

    /* =================================================================== 7 */
    {
      id: 'cairo', num: 7, year: '2023', title: 'Cairo, Just Us', theme: 'cairo', music: 'cairo',
      outfit: { mohamed: 1, mariem: 1 },
      intro: ['2023. A conference at the stadium in Cairo, and their first trip alone.', 'Three hours on the road from Alexandria. She fell asleep in his arms and he didn\'t move once.', 'Then Cairo: lights, crowds, and the two of them.'],
      mission: 'Get both conference badges, get through the stadium gates, and find your seats in the front row.',
      objectives: [{ label: 'Conference badges', counter: 'badges' }, { label: 'Hall lights on', sig: 'lights' }, { label: 'Front row, together', goal: true }],
      outro: { title: 'Our first trip', quote: 'They don\'t remember a single talk from that conference. They remember everything else.' },
      finale: { kind: 'pose', poses: { mohamed: 'sit-arm', mariem: 'sit' }, yaw: Math.PI, at: [79, 3.2, 1.6], lines: [[0.5, 'mariem', 'Best trip ever.'], [2.6, 'mohamed', 'We haven\'t even left the stadium.'], [4.8, 'mariem', 'Exactly.']] },
      killY: -8,
      build(L, P) {
        L.spawn('mohamed', 3.2, 0, 1.4); L.spawn('mariem', 4.6, 0, 1.4);
        L.counter('badges', 'Badges', 2);
        const asphalt = { top: G.mat('#b9b2a8', { r: 0.95 }), side: G.mat('#6f685e') };
        L.ground(-6, 52, -4, 4, 0, { mat: asphalt });
        frontRail(L, -6, 96, 4); L.invisible(-6.5, -6, 0, 10, -4, 4); L.invisible(96, 96.5, 0, 14, -4, 4);
        L.invisible(-6, 96, 0, 14, -4.6, -4.1);
        const r = MM.rng(23);
        for (let x = -20; x < 40; x += 9) L.prop('skyscraper', x, 0, -14 - r() * 6, { args: [6, 12 + r() * 18, 5, ['#4a3f6c', '#3a3f5c', '#5b4e6e'][Math.floor(r() * 3)], Math.floor(r() * 9)] });
        L.prop('stadium', 70, 0, -6, { s: 1.2 });
        L.prop('taxi', 10, 0, -3, { ry: 1.4 });
        for (let x = 0; x < 50; x += 10) L.prop('lampPost', x, 0, -3.8, { args: ['#ffd88a'] });
        L.sign('Cairo International Stadium →', 8, 2.4, 2.6, { h: 0.3 });
        // arrival cutscene: she slept the whole way
        L.trigger(-6, 12, -4, 4, (lv, game) => {
          const bus = LV.busCutaway('#e04a4a', 'ALEX → CAIRO'); bus.position.set(-24, 0, -2.2); lv.add(bus);
          const mo = game.player('mohamed'), ma = game.player('mariem');
          const seat = () => { mo.place(new THREE.Vector3(bus.position.x - 0.45, 0.9, -2.9)); ma.place(new THREE.Vector3(bus.position.x + 0.35, 0.9, -2.9)); mo.yaw = ma.yaw = 0; };
          game.cutscene({
            title: 'Alexandria → Cairo', sub: 'Three hours on the road. She slept in his arms the whole way.', dur: 7, dist: 7.5, h: 2.2, at: [-24, 0, -2.2],
            lines: [[1.8, null, '(She fell asleep before the first toll gate.)'], [4.4, 'mohamed', '(Don\'t move. Don\'t breathe. Don\'t wake her.)']],
            start: () => { mo.pose = 'sit-arm'; ma.pose = 'sleep'; seat(); },
            tick: (t, dt, g) => { bus.position.x = MM.lerp(-24, -2, MM.ease.inOut(MM.clamp(t / 6.5, 0, 1))); seat(); g.cut.center.x = bus.position.x; },
            end: () => { mo.pose = ma.pose = null; mo.place(new THREE.Vector3(3.2, 0.05, 1.4)); ma.place(new THREE.Vector3(4.6, 0.05, 1.4)); game.say('mariem', 'Wait... we\'re here already? Did I sleep the WHOLE way?', 2.6); },
          });
        });
        L.memory('firsttrip', 12, 1.6, 2);
        heartsArc(L, 6, 14, 1.3, 2.6, 4);
        // ticket booth: his badge on the roof (push the crate), hers on the sign (toss)
        L.checkpoint(15, -3);
        L.crate(17, -1.8, 0, { label: 'MERCH' });
        L.box(22, 27, 0, 3.0, -4, -0.6, { top: G.mat('#e04a4a'), side: G.mat('#f4efe7') });
        L.sign('TICKETS', 24.5, 2.2, -0.55, { h: 0.34, post: false });
        L.item('badge', 24.5, 3.7, -2.2, { counter: 'badges', who: 'mohamed' });
        L.sign('Push the crate to climb the booth', 18.5, 2.4, -2.6, { h: 0.26 });
        const pole = G.mesh(G.cyl(0.08, 0.08, 4.6, 8), G.mat('#c9ccd3', { m: 0.6 }), 31, 2.3, 2.4, L.group); pole.castShadow = true;
        L.sign('Welcome, delegates', 31, 4.6, 2.5, { h: 0.3, post: false });
        L.item('badge', 31, 5.6, 1.8, { counter: 'badges', who: 'mariem' });
        L.talk(28, 'mariem', 'My badge is up THERE? Toss me, please.');
        // turnstiles
        L.wall(35, 36, 0, 6, -4, -1.2); L.wall(35, 36, 0, 6, 1.2, 4); L.wall(35, 36, 3, 6, -1.2, 1.2);
        L.door('count:badges', 35.1, 35.9, 0, 3, -1.2, 1.2, { label: 'BADGES ONLY', color: '#ffcf6e' });
        L.deco(MM.Props.crowd(40, 12, 0.8, 5), 44, 0, -3.6);
        heartsArc(L, 37, 43, 1.3, 2, 3);
        // stadium steps up to the concourse
        L.checkpoint(40, 2.4);
        [[44, 0.8], [46, 1.6], [48, 2.4], [50, 3.2]].forEach(([x, h]) => L.box(x, x + 2, 0, h, -4, 4, { top: G.mat('#d8d0c4'), side: G.mat('#8f877b') }));
        L.box(52, 96, 0, 3.2, -4, 4, { top: G.mat('#d8d0c4'), side: G.mat('#8f877b') });
        L.memory('asleep', 56, 4.8, -2.4);
        // lighting booth: his weight lifts her, she turns the lights on
        L.plate('hold', 58, 2.6, 3.2, { heavy: true, label: 'HOLD' });
        L.elevator('hold', 60.5, 63.5, -3.8, -1.2, 3.5, 7.2, { label: 'LIFT' });
        L.box(63.5, 67, 3.2, 7.2, -4, -1.2, { top: G.mat('#3a3a44'), side: G.mat('#22222a') });
        L.plate('lightsP', 65.2, -2.6, 7.2, { label: 'LIGHTS' });
        L.logic('lights', (s, lv) => (lv._lights = lv._lights || s.lightsP));
        L.door('lights', 70, 71, 3.2, 9, -4, 4, { label: 'CONFERENCE HALL', color: '#e04a4a' });
        L.talk(57, 'mohamed', 'I\'ll hold the lift. Go turn the lights on, boss.');
        L.anim.push(() => { if (L._lights && !L._lightsFx) { L._lightsFx = true; L.game.fx.emit('sparkle', new THREE.Vector3(65, 8, -2), { n: 30, color: 0xffe2a0 }); MM.Audio.sfx('complete'); } });
        // the hall
        L.prop('conferenceStage', 82, 3.2, -1.8, { args: ['Conference 2023'], solid: true, top: 4.2 });
        L.deco(MM.Props.crowd(40, 9, 2.4, 7), 89.5, 3.2, 2.4);
        L.goalZone([{ x0: 76.5, x1: 81.5, z0: 1.0, z1: 3.2, y: 3.2, label: 'Front row' }], { req: ['count:badges', 'lights'], reqText: 'Badges and the hall lights first' });
        heartsArc(L, 72, 80, 4.5, 2.8, 4, 0.3);
      },
    },
  ];

  MM.chapterByNum = (n) => MM.CHAPTERS.find((c) => c.num === n);
})(window.MM);
