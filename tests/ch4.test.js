module.exports = async ({ ev, check, start }) => {
  await start(4);
  let r = await ev(() => { T.tp('mariem', 11.5, 0, 0); const hz = T.g.level.hazards[0]; let g = 0; while (Math.abs(hz.pos.z) > 1 && g++ < 400) T.run(1 / 60, { mariem: {} }); const falls = T.g.player('mariem').stats.falls; T.run(0.6, {}); return { hit: T.P('mariem').x < 5 || T.g.player('mariem').invuln > 0 }; });
  check('A taxi in the crossing knocks you back', r.hit, r);
  r = await ev(() => {
    const L = T.g.level, [h1, h2] = L.hazards;
    const waitPast = (h) => { let g = 0; while (!(h.dz > 0 ? h.pos.z > 6.5 && h.pos.z < 10 : h.pos.z < -6.5 && h.pos.z > -10) && g++ < 900) T.run(1 / 60, {}); };
    const out = {};
    ['mohamed', 'mariem'].forEach(w => { T.tp(w, 9, 0, 0); const f0 = T.g.player(w).stats.falls; waitPast(h1); T.goto(w, 13, 0, 0.9); waitPast(h2); out[w] = T.goto(w, 17.5, 0, 1.2); out[w].falls = T.g.player(w).stats.falls - f0; out[w].hurt = T.g.player(w).invuln > 0; });
    return out;
  });
  check('Both cross the road in a gap between taxis', r.mohamed.x > 17 && r.mariem.x > 17, r);
  r = await ev(() => { T.tp('mariem', 19.8, 0, 0.4); T.run(1.2, { mariem: (i) => ({ jump: i === 0, jumpHeld: true, mz: i < 20 ? 1 : 0 }) }); return T.g.level.counters.kit.n; });
  check('Student ID from the bench', r === 1, r);
  r = await ev(() => {
    const mv = T.g.level.objects.find(o => o.type === 'mover');
    let g = 0; while (mv.solid.x0 > 23.8 && g++ < 600) T.run(1 / 60, {});
    T.tp('mohamed', 24.6, 0.05, 0); T.tp('mariem', 25.6, 0.05, 0.8);
    T.run(2.6, {}); T.goto('mohamed', 33, 0, 2); T.goto('mariem', 33, 1, 2);
    return { m: T.P('mohamed'), f: T.P('mariem') };
  });
  check('Both ride the road-works platform', r.m.x > 31 && r.f.x > 31 && r.m.y > -0.1 && r.f.y > -0.1, r);
  r = await ev(() => { T.tp('mariem', 34, 0, -0.9); T.run(1.4, { mariem: (i) => ({ jump: i === 0 || i === 22, jumpHeld: true, mz: -1 }) }); return { kit: T.g.level.counters.kit.n, p: T.P('mariem') }; });
  check('Mariem alone cannot reach the kiosk roof', r.kit === 1, r);
  r = await ev(() => { T.tp('mohamed', 34, 0, 0.2); T.tp('mariem', 34.4, 0, 0.2); T.run(0.2, { mohamed: { mz: -1, jumpHeld: true } }); T.run(0.05, { mohamed: { ability: true } }); T.goto('mariem', 34, -2.7, 2, { autojump: false }); return { p: T.P('mariem'), kit: T.g.level.counters.kit.n }; });
  check('Toss onto the kiosk for the stethoscope', r.p.y > 4.5 && r.kit === 2, r);
  r = await ev(() => { T.tp('mohamed', 49, 0, 0.5); return T.goto('mohamed', 49, -3, 2, { autojump: false }); });
  check('Mohamed does not fit the locker hatch', r.z > -1.3, r);
  r = await ev(() => { const before = T.g.player('mariem').model; T.tp('mariem', 49, 0, 0.5); T.goto('mariem', 49.4, -3, 2.5, { autojump: false }); T.run(0.3, {}); return { kit: T.g.level.counters.kit.n, swapped: T.g.player('mariem').model !== before }; });
  check('Mariem gets her white coat (outfit changes)', r.kit === 3 && r.swapped, r);
  r = await ev(() => { T.goto('mariem', 49, 1, 2, { autojump: false }); T.tp('mohamed', 60, 0, 0); T.tp('mariem', 60, 0, 1); T.run(1.6, {}); T.goto('mohamed', 76, 0, 4); T.goto('mariem', 77, 1, 4); T.run(2, {}); return { door: T.sig('count:kit'), done: T.g.level.goal.done }; });
  check('Faculty gate opens and the first day completes', r.door && r.done, r);
};
