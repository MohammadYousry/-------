module.exports = async ({ ev, check, start }) => {
  await start(15);
  let r = await ev(() => { T.tp('mariem', 11, 1.05, 0.3); T.run(0.6, { mariem: (i) => ({ jump: i === 0, jumpHeld: true, mz: 0.6 }) }); T.tp('mariem', 5, 1.05, 0.2); T.run(1.4, { mariem: (i) => ({ jump: i === 0 || i === 22, jumpHeld: true, mz: -1 }) }); return T.g.level.counters.candles.n; });
  check('Cake candle and cabin-roof candle', r === 2, r);
  r = await ev(() => { T.tp('mohamed', 17, 1.05, 0.4); T.tp('mariem', 17.4, 1.05, 0.4); T.run(0.2, { mohamed: { mz: -1, jumpHeld: true } }); T.run(0.05, { mohamed: { ability: true } }); T.goto('mariem', 17, -1.7, 2, { autojump: false }); return { n: T.g.level.counters.candles.n, p: T.P('mariem') }; });
  check('Toss to the top deck for the third candle', r.n === 3, r);
  r = await ev(() => { T.tp('mariem', 21.8, 1.05, -0.6); T.run(1, { mariem: (i) => ({ jump: i === 0, jumpHeld: true, mz: -1 }) }); const her = T.g.level.counters.gift.n; T.tp('mohamed', 21.8, 1.05, -0.5); T.run(1, { mohamed: (i) => ({ jump: i === 0, jumpHeld: true, mz: -1 }) }); return { her, gift: T.g.level.counters.gift.n }; });
  check('Only Mohamed can give her the necklace', r.her === 0 && r.gift === 1, r);
  r = await ev(() => { T.tp('mohamed', 23.5, 1.05, -1.6); T.tp('mariem', 23.5, 1.05, 1.6); T.run(0.5, {}); const b = T.sig('bday'); T.run(1.5, {}); return { b }; });
  check('Birthday wish opens the swim gate', r.b, r);
  r = await ev(() => {
    const L = T.g.level, shells = L.items.filter(i => i.kind === 'shell');
    const out = {};
    ['mariem', 'mohamed'].forEach((w) => {
      T.tp(w, 24.6, 1.05, 0);
      let frames = 0, k = 0;
      T.run(40, { [w]: (i, b) => {
        const tgt = w === 'mariem' && k < shells.length ? shells[k] : { x: 70, z: 0 };
        if (w === 'mariem' && k < shells.length && shells[k].taken) k++;
        const dx = tgt.x - b.x, dz = tgt.z - b.z, d = Math.hypot(dx, dz) || 1;
        const swim = T.g.player(w).swimming;
        return { mx: dx / d, mz: dz / d, jump: (swim || b.blocked) && i % 20 === 0, jumpHeld: true };
      } });
      out[w] = T.P(w);
    });
    return { out, shells: L.counters.shells.n };
  });
  check('Mariem swims through the reef collecting 6 shells', r.shells === 6, r);
  check('Both swim to Sahel and walk up onto the beach', r.out.mariem.x > 62 && r.out.mariem.y > 0.2 && r.out.mohamed.x > 62 && r.out.mohamed.y > 0.2, r);
  r = await ev(() => { T.goto('mohamed', 75.2, -0.2, 4); T.goto('mariem', 76.8, -0.2, 4); T.run(2, {}); return T.g.level.goal.done; });
  check('Sunset in Sahel completes the summer', r);
};
