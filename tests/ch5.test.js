module.exports = async ({ ev, check, start }) => {
  await start(5);
  let r = await ev(() => { T.tp('mariem', 9, 0, -2.5); T.run(1.2, { mariem: (i) => ({ jump: i === 0 || i === 22, jumpHeld: true }) }); T.tp('mohamed', 5, 0, -0.4); T.run(1.2, { mohamed: (i) => ({ jump: i === 0, jumpHeld: true, mz: i < 30 ? -1 : 0 }) }); return T.g.level.counters.candles.n; });
  check('Two lower-deck flames collected', r === 2, r);
  r = await ev(() => { T.tp('mohamed', 27, 0, 3); return T.goto('mohamed', 33, 3, 3, { autojump: false }); });
  check('Mohamed cannot fit the service hatch', r.x < 29, r);
  r = await ev(() => { T.tp('mariem', 27, 0, 3); const p = T.goto('mariem', 34.5, 2.4, 4, { autojump: false }); T.run(0.2, {}); return { p, s: T.sig('lift') }; });
  check('Mariem crawls into the kitchen and calls the staff lift', r.p.x > 33 && r.s, r);
  r = await ev(() => { T.goto('mariem', 32, 0.5, 2); T.run(8.5, {}); T.tp('mohamed', 24, 0, -2.8); T.goto('mohamed', 27.2, -2.8, 2); T.goto('mariem', 34.5, 2.4, 2); T.run(2.2, {}); const up = T.P('mohamed'); const p = T.goto('mohamed', 40, -2.8, 4); return { up, p }; });
  check('Staff lift takes Mohamed to the upper deck', r.up.y > 4.2 && r.p.y > 4.2 && r.p.x > 39, r);
  r = await ev(() => { T.tp('mariem', 44.6, 4.3, -2.6); T.run(0.5, {}); const herRing = T.g.level.counters.ring.n; T.tp('mariem', 40, 4.3, 2); T.goto('mohamed', 45, -2.6, 2); return { herRing, ring: T.g.level.counters.ring.n }; });
  check('Only Mohamed can pick up the ring', r.herRing === 0 && r.ring === 1, r);
  r = await ev(() => {
    T.tp('mariem', 33, 0, 3); T.run(8.5, {}); // latch runs out, lift returns
    T.goto('mariem', 27, 3, 3); T.goto('mariem', 27.2, -2.8, 3);
    T.tp('mohamed', 33, 4.3, 2.6); T.goto('mohamed', 31.5, 2.6, 2); T.run(2.5, {});
    const up = T.P('mariem'); const p = T.goto('mariem', 38, -2.8, 3);
    return { up, p, helper: T.sig('helper') };
  });
  check('Mohamed holds LIFT and brings Mariem up', r.helper && r.p.y > 4.2 && r.p.x > 37, r);
  r = await ev(() => { T.tp('mariem', 50, 4.3, 2.2); T.run(1, { mariem: { jump: true, jumpHeld: true } }); T.tp('mariem', 31, 4.3, -1.5); T.run(1, { mariem: { jump: true, jumpHeld: true } }); return T.g.level.counters.candles.n; });
  check('All 4 candles lit', r === 4, r);
  r = await ev(() => { T.goto('mohamed', 54, -1.8, 4); T.goto('mariem', 58, 1.8, 6); T.run(2, {}); return { done: T.g.level.goal.done, m: T.P('mohamed'), f: T.P('mariem') }; });
  check('Meet at the table completes the proposal chapter', r.done, r);
};
