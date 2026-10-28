module.exports = async ({ ev, check, start }) => {
  await start(13);
  const n = () => T.g.level.counters.lights.n;
  let r = await ev(() => { T.tp('mariem', 10.2, 0, -2.1); T.tp('mohamed', 10.8, 0, -1.4); T.run(0.3, {}); return T.g.level.counters.lights.n; });
  check('Candle on the bench', r === 1, r);
  r = await ev(() => { T.tp('mohamed', 15.4, 0, 1.6); T.goto('mohamed', 21.6, 1.6, 4, { autojump: false }); T.goto('mohamed', 23.5, 0, 5); T.run(0.3, {}); return { p: T.P('mohamed'), n: T.g.level.counters.lights.n }; });
  check('Crate step onto the kiosk roof candle', r.p.y > 2.9 && r.n === 2, r);
  r = await ev(() => { T.tp('mohamed', 29.4, 0, -1); const m = T.goto('mohamed', 33, -1, 2, { autojump: false }); T.tp('mariem', 28.5, 0, -1); T.goto('mariem', 33, 0.5, 3, { autojump: false }); T.run(0.2, {}); return { m, n: T.g.level.counters.lights.n }; });
  check('Only Mariem fits under the old boat', r.m.x < 30 && r.n === 3, r);
  r = await ev(() => { T.tp('mohamed', 26.5, 0, 2.6); return T.goto('mohamed', 38, 2.6, 6); });
  check('Mohamed climbs over the boat', r.x > 37, r);
  r = await ev(() => { T.tp('mohamed', 45, 0, -0.9); T.tp('mariem', 45.4, 0, -0.9); T.run(0.2, { mohamed: { mz: -1, jumpHeld: true } }); T.run(0.05, { mohamed: { ability: true } }); T.goto('mariem', 45, -3, 2, { autojump: false }); T.tp('mariem', 54, 0, 1.8); T.tp('mohamed', 53.4, 0, 1.4); T.run(0.5, {}); return { n: T.g.level.counters.lights.n, calm: !!T.g.level._calm, rain: T.g.level.rain.lines.visible }; });
  check('All 5 candles: the rain stops and her star appears', r.n === 5 && r.calm && !r.rain, r);
  r = await ev(() => { T.goto('mohamed', 77, -0.5, 6); T.goto('mariem', 78.4, 0.5, 6); T.run(2, {}); return { done: T.g.level.goal.done, m: T.P('mohamed') }; });
  check('End of the pier completes the chapter', r.done, r);
};
