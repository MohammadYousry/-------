module.exports = async ({ ev, check, start }) => {
  await start(1);
  // physics sanity: Mohamed max jump height, Mariem double jump height
  let r = await ev(() => { T.tp('mohamed', 2, 0, 0); let maxY = 0; T.run(1.2, { mohamed: (i, b) => { maxY = Math.max(maxY, b.y); return { jump: i === 0, jumpHeld: true }; } }); return maxY; });
  check('Mohamed jump height ~1.87', r > 1.75 && r < 1.95, r);
  r = await ev(() => { T.tp('mariem', 4, 0, 0); let maxY = 0; T.run(1.6, { mariem: (i, b) => { maxY = Math.max(maxY, b.y); return { jump: i === 0 || i === 22, jumpHeld: true }; } }); return maxY; });
  check('Mariem double jump height ~3.4', r > 3.2 && r < 3.7, r);
  // hurdle
  r = await ev(() => { T.tp('mohamed', 4, 0, 0); return T.goto('mohamed', 10, 0, 4); });
  check('Mohamed over the hurdle', r.x > 9.5, r);
  r = await ev(() => { T.tp('mariem', 4, 0, 1); return T.goto('mariem', 10, 1, 4); });
  check('Mariem over the hurdle', r.x > 9.5, r);
  // door puzzle: Mariem holds p1, Mohamed through
  r = await ev(() => { T.tp('mariem', 18.5, 0, -2.4); T.tp('mohamed', 19, 0, 0); T.run(0.3, {}); const s = T.sig('p1'); T.goto('mohamed', 24, 0, 4); return { sig: s, p: T.P('mohamed') }; });
  check('Door p1 opens with Mariem on plate', r.sig && r.p.x > 23.5, r);
  r = await ev(() => { T.goto('mohamed', 25, 2.4, 3); T.run(0.3, {}); const s = T.sig('p1'); T.goto('mariem', 19, 0, 3); T.goto('mariem', 24, 0, 4); return { sig: s, p: T.P('mariem') }; });
  check('Mohamed holds p1, Mariem through', r.sig && r.p.x > 23.5, r);
  r = await ev(() => { T.tp('mohamed', 19, 0, 0); T.run(2.5, {}); return T.goto('mohamed', 24, 0, 3); });
  check('Door closes when nobody is on the plates', r.x < 21.5, r);
  // tunnel
  r = await ev(() => { T.tp('mohamed', 32, 0, 0); return T.goto('mohamed', 38, 0, 3, { autojump: false }); });
  check('Mohamed cannot fit the tunnel', r.x < 34, r);
  r = await ev(() => { T.tp('mariem', 32, 0, 0); return T.goto('mariem', 37, 0, 3, { autojump: false }); });
  check('Mariem fits the tunnel', r.x > 36.5, r);
  r = await ev(() => { T.goto('mariem', 38, -2.4, 3); T.tp('mohamed', 32, 0, 2.6); const p = T.goto('mohamed', 38, 2.6, 4); return { sig: T.sig('p2'), p }; });
  check('Mariem opens staff door for Mohamed', r.sig && r.p.x > 37, r);
  // crate climb
  r = await ev(() => { T.tp('mohamed', 42, 0, 0.5); T.tp('mariem', 40, 0, -3); T.goto('mohamed', 49, 0.5, 4, { autojump: false }); const c = T.g.level.crates[0].body; return { crate: [+c.x.toFixed(2), +c.y.toFixed(2)], p: T.P('mohamed') }; });
  check('Mohamed pushes crate to the stage wall', r.crate[0] > 48.9 && r.crate[0] < 49.3, r);
  r = await ev(() => { return T.goto('mohamed', 53, 0.5, 5); });
  check('Mohamed climbs crate onto the 2.6 m stage', r.y > 2.5 && r.x > 50.5, r);
  r = await ev(() => { T.tp('mariem', 47, 0, -2.5); return T.goto('mariem', 53, -2.5, 4); });
  check('Mariem double-jumps onto the stage', r.y > 2.5 && r.x > 50.5, r);
  r = await ev(() => { T.tp('mohamed', 47, 0, -2.5); return T.goto('mohamed', 53, -2.5, 3); });
  check('Without the crate Mohamed cannot reach the stage', r.x < 50 && r.y < 2.5, r);
  // toss wall
  r = await ev(() => { T.tp('mohamed', 64.2, 0, -2.5); T.tp('mariem', 64.6, 0, -2.6);
    T.run(0.2, { mohamed: { mx: 1, jumpHeld: true } });
    T.run(0.05, { mohamed: { ability: true } });
    T.goto('mariem', 67.5, -2.5, 2.2, { autojump: false });
    T.run(0.3, {});
    return { p: T.P('mariem'), sig: T.sig('p3') }; });
  check('Toss puts Mariem on the 4.6 m wall and she presses p3', r.p.y > 4.5 && r.sig, r);
  r = await ev(() => { T.tp('mohamed', 64, 0, 0); return T.goto('mohamed', 71, 0, 4); });
  check('Mohamed walks through the gym door', r.x > 70, r);
  r = await ev(() => { T.tp('mariem', 63, 0, -2.6); T.tp('mohamed', 60, 0, 2); return T.goto('mariem', 70, -2.6, 3); });
  check('Mariem alone cannot climb the 4.6 m wall', r.x < 66.2, r);
  // exam
  r = await ev(() => { T.tp('mohamed', 78, 0, -2.2); T.tp('mariem', 78, 0, 2.2); T.run(0.4, {}); return T.sig('exam'); });
  check('Both PASS plates latch the exam', r === true);
  r = await ev(() => { T.g.level.counters.notes.n = 3; T.goto('mohamed', 90, 0, 4); T.goto('mariem', 91, 1, 4); T.run(2.2, {}); return { prog: T.g.level.goal.progress, done: T.g.level.goal.done, st: T.g.state }; });
  check('Goal completes with both in the heart zone', r.done, r);
  // collectibles reachable: notes positions
  r = await ev(() => { const L = T.g.level; return L.items.filter(i => i.kind === 'note').map(i => [i.x, i.y, i.z]); });
  check('3 notes placed', r.length === 3, r);
};
