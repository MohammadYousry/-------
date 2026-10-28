module.exports = async ({ ev, check, start }) => {
  await start(6);
  let r = await ev(() => { T.tp('mariem', 10, 0, 4); return T.goto('mariem', 10, -6, 3); });
  check('Ocean wall keeps Mariem in Egypt', r.z > 2.4, r);
  r = await ev(() => { T.tp('mohamed', 10, 0, -5.5); const before = T.goto('mohamed', 22, -5.5, 3, { autojump: false }); return before; });
  check('USA gap stops Mohamed before the bridge (falls/respawns)', r.x < 20, r);
  r = await ev(() => { T.tp('mariem', 10, 0, 5.5); T.run(1.5, {}); T.tp('mohamed', 10, 0, -5.5); const p = T.goto('mohamed', 22, -5.5, 4); return { sig: T.sig('call1'), p }; });
  check('Her SUPPORT button builds his bridge', r.sig && r.p.x > 21 && r.p.y === 0, r);
  r = await ev(() => { T.tp('mariem', 28, 0, 5.5); return T.goto('mariem', 34, 5.5, 3); });
  check('Egypt door blocks her', r.x < 30, r);
  r = await ev(() => { T.tp('mohamed', 21.5, 0, -5.5); T.goto('mohamed', 27.2, -5.5, 4, { autojump: false }); T.run(0.3, {}); const c = T.g.level.crates[0].body; const s = T.sig('heavy2'); T.goto('mariem', 35, 5.5, 4); return { crate: [+c.x.toFixed(2), +c.y.toFixed(2)], s, f: T.P('mariem') }; });
  check('Books on WEIGHT open her door', r.s && r.f.x > 32, r);
  r = await ev(() => { T.tp('mohamed', 41, 0, -5.5); T.tp('mariem', 40, 0, 5.5); T.goto('mohamed', 44.3, -5.5, 2); T.goto('mariem', 42, 5.5, 2); T.goto('mariem', 40, 5.5, 1); T.run(2.5, {}); const up = T.P('mohamed'); const p = T.goto('mohamed', 50, -5.5, 2); return { up, p }; });
  check('Her 6-second button lifts him to the rooftop', r.up.y > 3.9 && r.p.y > 3.9 && r.p.x > 48, r);
  r = await ev(() => { T.tp('mariem', 42, 0, 5.5); return T.goto('mariem', 61, 5.5, 8, { edge: true }); });
  check('Mariem crosses the pyramid stepping stones', r.x > 60.5 && r.y === 0, r);
  r = await ev(() => { T.tp('mariem', 60.3, 0, 5.5); let st = 0, t0 = -1, done = 0;
    T.run(2.5, { mariem: (i, b) => { const a = { mx: 1, jumpHeld: true };
      if (st === 0 && b.x > 61.5) { a.jump = true; st = 1; t0 = i; }
      else if (st === 1 && i - t0 > 18) { a.jump = true; st = 2; t0 = i; }
      else if (st === 2 && i - t0 > 14) { a.ability = true; st = 3; }
      return a; } });
    return T.P('mariem'); });
  check('Jump + double jump + dash clears the 6.5 m gap', r.x > 68.5 && r.y > -0.5, r);
  r = await ev(() => { T.tp('mohamed', 62, 4, -5.5); return T.goto('mohamed', 75, -5.5, 5); });
  check('Mohamed walks down the rooftop steps', r.x > 74 && r.y === 0, r);
  r = await ev(() => { T.tp('mohamed', 80, 0, -5.5); T.tp('mariem', 80, 0, 5.5); T.run(0.5, {}); const c = T.sig('call'); T.run(1.2, {}); T.goto('mohamed', 86, -0.4, 5); T.goto('mariem', 86, 0.6, 5); T.run(2, {}); return { c, done: T.g.level.goal.done, m: T.P('mohamed'), f: T.P('mariem') }; });
  check('Simultaneous CALL builds the bridge and they meet in the middle', r.c && r.done, r);
};
