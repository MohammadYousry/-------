module.exports = async ({ ev, check, start }) => {
  await start(7);
  let r = await ev(() => { T.tp('mohamed', 15.2, 0, -1.8); T.goto('mohamed', 21.6, -1.8, 4, { autojump: false }); const c = T.g.level.crates[0].body; return [+c.x.toFixed(2), +c.z.toFixed(2)]; });
  check('Merch crate pushed against the ticket booth', r[0] > 20.9 && r[0] < 21.4, r);
  r = await ev(() => { T.goto('mohamed', 24.5, -2.2, 5); T.run(0.3, {}); return { p: T.P('mohamed'), b: T.g.level.counters.badges.n }; });
  check('Mohamed climbs crate + booth for his badge', r.p.y > 2.9 && r.b === 1, r);
  r = await ev(() => { T.tp('mariem', 24, 0, 0.5); T.run(1.3, { mariem: (i) => ({ jump: i === 0 || i === 22, jumpHeld: true }) }); T.tp('mariem', 31, 0, 1.8); T.run(1.3, { mariem: (i) => ({ jump: i === 0 || i === 22, jumpHeld: true }) }); return T.g.level.counters.badges.n; });
  check('Mariem cannot reach her badge alone, nor take his', r === 1, r);
  r = await ev(() => { T.tp('mohamed', 29, 0, 1.8); T.tp('mariem', 29.5, 0, 1.8); T.run(0.15, { mohamed: { mx: 1, jumpHeld: true } }); T.run(0.05, { mohamed: { ability: true } }); T.goto('mariem', 31, 1.8, 1.6, { autojump: false }); return T.g.level.counters.badges.n; });
  check('Toss gets her badge from the sign', r === 2, r);
  r = await ev(() => { T.tp('mohamed', 33, 0, 0); T.tp('mariem', 33, 0, 1); T.run(1.2, {}); T.goto('mohamed', 53, 0, 6); T.goto('mariem', 37, 0.2, 2); T.goto('mariem', 53, 1, 6); return { m: T.P('mohamed'), f: T.P('mariem') }; });
  check('Turnstiles open with both badges; both climb the stadium steps', r.m.y > 3.1 && r.f.y > 3.1 && r.m.x > 52, r);
  r = await ev(() => { const blocked = T.goto('mohamed', 74, 0, 3); T.tp('mohamed', 58, 3.2, 2.6); T.tp('mariem', 62, 3.6, -2.5); T.run(3.2, {}); const up = T.P('mariem'); T.goto('mariem', 65.2, -2.6, 2); T.run(0.3, {}); return { blocked, up, lights: T.sig('lights') }; });
  check('Hall door is shut before the lights', r.blocked.x < 70.2, r);
  check('His weight lifts her to the lighting booth; LIGHTS', r.up.y > 7 && r.lights, r);
  r = await ev(() => { T.tp('mariem', 66, 3.2, 0); T.run(1.5, {}); T.goto('mohamed', 78.4, 2, 5); T.goto('mariem', 79.8, 2, 5); T.run(2, {}); return T.g.level.goal.done; });
  check('Front row together completes Cairo', r);
};
