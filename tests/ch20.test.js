module.exports = async ({ ev, check, start }) => {
  await start(20);
  let r = await ev(() => { const out = {}; ['mohamed', 'mariem'].forEach(w => { T.tp(w, 10.5, 0, 0); T.run(2.2, { [w]: { mx: 1, jumpHeld: true } }); out[w] = T.P(w); }); return out; });
  check('Spring launches Mohamed to Paris', r.mohamed.x > 18.5 && r.mohamed.y > 2.9, r.mohamed);
  check('Spring launches Mariem to Paris', r.mariem.x > 18.5 && r.mariem.y > 2.9, r.mariem);
  r = await ev(() => { T.tp('mohamed', 23.6, 3, 0); T.tp('mariem', 24.1, 3, 0.1); T.run(0.2, { mohamed: { mx: 1, jumpHeld: true } }); T.run(0.05, { mohamed: { ability: true } }); T.goto('mariem', 27, 0, 2.2, { autojump: false }); T.run(0.3, {}); return { p: T.P('mariem'), n: T.g.level.counters.stamps.n }; });
  check('Toss reaches the Paris stamp (7.5 m)', r.n >= 1 && r.p.y > 7, r);
  r = await ev(() => {
    const ferry = T.g.level.objects.find(o => o.type === 'mover');
    const out = {};
    ['mohamed', 'mariem'].forEach(w => {
      T.tp(w, 35.2, 3, 0);
      let g = 0; while (ferry.solid.x0 > 36.7 && g++ < 900) T.run(1 / 60, {});
      T.run(0.45, { [w]: { mx: 1 } }); T.run(3.6, {}); T.goto(w, 52, 0, 2);
      out[w] = T.P(w);
    });
    return out;
  });
  check('Heart balloon ferry carries Mohamed to the Maldives', r.mohamed.x > 50 && r.mohamed.y > 2.9, r.mohamed);
  check('Heart balloon ferry carries Mariem to the Maldives', r.mariem.x > 50 && r.mariem.y > 2.9, r.mariem);
  r = await ev(() => { T.tp('mohamed', 62, 3, -2.4); T.tp('mariem', 62, 3, 2.4); T.run(0.4, {}); const rb = T.sig('rainbow'); T.run(1.5, {}); const m = T.goto('mohamed', 76, 0, 4); T.goto('mariem', 76, 0.8, 4); return { rb, m }; });
  check('Rainbow bridge to the States', r.rb && r.m.x > 75 && r.m.y > 2.9, r);
  r = await ev(() => { const L = T.g.level; T.goto('mohamed', 89, 0, 3, { autojump: false }); const blocked = T.goto('mohamed', 96, 0, 2, { autojump: false }); L.counters.stamps.n = 4; T.tp('mohamed', 88, 3, 0); T.run(1.2, {}); const p = T.goto('mohamed', 105, 0, 4); T.goto('mariem', 106, 0.6, 6); T.run(2, {}); return { blocked, p, done: L.goal.done }; });
  check('Stamp bridge to the wedding and the aisle', r.blocked.x < 90.6 || r.blocked.y < 2, r);
  check('Wedding goal completes', r.done, r);
};
