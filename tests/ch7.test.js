module.exports = async ({ ev, check, start }) => {
  await start(7);
  const crate = (i) => `(() => { const c = T.g.level.crates[${i}].body; return [+c.x.toFixed(2), +c.y.toFixed(2), +c.z.toFixed(2)]; })()`;
  let r = await ev(() => { T.tp('mariem', 30, 0, 3); T.tp('mohamed', 2.8, 0, 2); T.goto('mohamed', 8.58, 2, 4, { autojump: false }); T.goto('mohamed', 8.5, 4.05, 1.5, { autojump: false }); T.goto('mohamed', 10, 4.05, 1, { autojump: false }); T.goto('mohamed', 10, -1, 4, { autojump: false }); T.run(0.6, {}); const c = T.g.level.crates[0].body; return { s: T.sig('sofa'), c: [c.x, c.z], locked: T.g.level.crates[0].locked }; });
  check('Sofa pushed onto its rug and locks', r.s && r.locked, r);
  r = await ev(() => { T.tp('mohamed', 20.5, 0, 0); T.goto('mohamed', 26.6, 0, 4, { autojump: false }); T.run(0.6, {}); return { s: T.sig('dining') }; });
  check('Dining table placed', r.s, r);
  r = await ev(() => { T.tp('mohamed', 32, 0, -2.5); return T.goto('mohamed', 42, -2.5, 5); });
  check('Mohamed climbs the stairs', r.y > 3.5 && r.x > 41, r);
  r = await ev(() => { T.tp('mohamed', 43.4, 3.6, 2.6); T.goto('mohamed', 49.58, 2.6, 4, { autojump: false }); T.goto('mohamed', 49.5, 4.05, 1.2, { autojump: false }); T.goto('mohamed', 51, 4.05, 1, { autojump: false }); T.goto('mohamed', 51, -0.7, 4, { autojump: false }); T.run(0.6, {}); return { s: T.sig('bed'), c: [T.g.level.crates[2].body.x, T.g.level.crates[2].body.z] }; });
  check('Bed placed upstairs', r.s, r);
  r = await ev(() => {
    const L = T.g.level, got = () => L.counters.decor.n;
    const jumpAt = (x, y, z, dbl) => { T.tp('mariem', x, y, z); T.run(1.3, { mariem: (i) => ({ jump: i === 0 || (dbl && i === 22), jumpHeld: true }) }); };
    jumpAt(6, 0, -3.3, false);                 // plant on the bookshelf
    jumpAt(14, 0, -3.3, true);                 // frame on the high shelf
    T.tp('mariem', 21.2, 0, 3); T.run(0.5, {}); // lamp on the side table
    jumpAt(32, 0, -3.1, true);                 // vase on the fridge
    T.tp('mariem', 45, 3.6, 0); T.goto('mariem', 45, -3.2, 2, { autojump: false }); // cushion under the nightstand
    jumpAt(48.5, 3.6, -3.25, true);            // clock high on the bedroom wall
    return got();
  });
  check('All 6 decor pieces reachable for Mariem', r === 6, r);
  r = await ev(() => { T.tp('mohamed', 45, 3.6, -0.8); return T.goto('mohamed', 45, -3.2, 2, { autojump: false }); });
  check('Mohamed cannot crawl under the nightstand', r.z > -1.2, r);
  r = await ev(() => { T.tp('mohamed', 42, 3.6, 3); T.tp('mariem', 56, 3.6, -3); T.run(0.5, {}); const l = T.sig('lights'); T.goto('mohamed', 53.5, 2.2, 3); T.goto('mariem', 55, 2.6, 3); T.run(2, {}); return { l, done: T.g.level.goal.done }; });
  check('Lights on together and goal', r.l && r.done, r);
};
