module.exports = async ({ ev, check, start }) => {
  await start(12);
  const photos = () => T.g.level.counters.photos.n;
  let r = await ev(() => { T.tp('mohamed', 14.6, 0, -1.6); T.tp('mariem', 22, 0, 0); T.run(0.2, {}); T.run(0.1, { mohamed: { love: true } }); const alone = T.g.level.counters.photos.n; T.tp('mariem', 15.5, 0, -1.4); T.run(0.2, {}); T.run(0.1, { mariem: { love: true } }); return { alone, n: T.g.level.counters.photos.n }; });
  check('Photo needs both of them on the spot', r.alone === 0 && r.n === 1, r);
  r = await ev(() => { T.tp('mohamed', 37.4, 0, 1.0); T.tp('mariem', 38.6, 0, 1.0); T.run(0.2, {}); T.run(0.1, { mohamed: { love: true } }); T.tp('mohamed', 51.4, 0, -0.4); T.tp('mariem', 52.6, 0, -0.4); T.run(0.2, {}); T.run(0.1, { mariem: { love: true } }); return T.g.level.counters.photos.n; });
  check('Fountain and arch photos', r === 3, r);
  r = await ev(() => { const t = T.g.level.talks.find(k => k.who === 'Teta Yousr'); T.tp('mohamed', 27.5, 0, -0.4); T.run(0.3, {}); return { said: t && t.done }; });
  check('Teta Yousr speaks to him', r.said, r);
  r = await ev(() => { T.tp('mariem', 63.5, 3.25, -2.2); T.run(0.3, {}); const her = T.g.level.counters.ring.n; T.tp('mariem', 57, 0, 2.4); T.tp('mohamed', 58.7, 0.35, -2.4); T.run(3, {}); const up = T.P('mohamed'); T.goto('mohamed', 63.5, -2.2, 2); T.run(0.2, {}); return { her, up, ring: T.g.level.counters.ring.n }; });
  check('Her plate lifts him to the gazebo; only he can take the ring', r.her === 0 && r.up.y > 3.1 && r.ring === 1, r);
  r = await ev(() => { T.tp('mohamed', 75.2, 0, 2); T.tp('mariem', 76.8, 0, 2); T.run(2, {}); return T.g.level.goal.done; });
  check('Dinner for two completes the engagement', r);
};
