module.exports = async ({ ev, check, start }) => {
  await start(5);
  const meals = () => T.g.level.counters.meals.n;
  let r = await ev(() => { T.tp('mariem', 8.5, 0, -0.7); T.run(1.4, { mariem: (i) => ({ jump: i === 0 || i === 22, jumpHeld: true, mz: -1 }) }); return { meals: T.g.level.counters.meals.n, p: T.P('mariem') }; });
  check('Mariem double-jumps onto the koshari cart', r.meals === 1, r);
  r = await ev(() => { T.tp('mohamed', 22.5, 0, -0.8); T.run(1.2, { mohamed: (i) => ({ jump: i === 0, jumpHeld: true, mz: -1 }) }); return { meals: T.g.level.counters.meals.n, coins: T.g.level.counters.coins.n }; });
  check('Kebda stays out of reach without 3 coins', r.meals === 1, r);
  r = await ev(() => {
    T.tp('mariem', 5, 0, 2); T.tp('mariem', 14, 0, -2); T.run(0.2, {});
    T.tp('mohamed', 19, 0, 0.4); T.tp('mariem', 19.4, 0, 0.4);
    T.run(0.2, { mohamed: { mz: 1, jumpHeld: true } }); T.run(0.05, { mohamed: { ability: true } }); T.goto('mariem', 19, 2.6, 2, { autojump: false });
    return { coins: T.g.level.counters.coins.n, p: T.P('mariem') };
  });
  check('3 coins (one needs a toss onto the wall)', r.coins >= 3, r);
  r = await ev(() => { T.tp('mohamed', 22.5, 0, -0.8); T.run(1.2, { mohamed: (i) => ({ jump: i === 0, jumpHeld: true, mz: -1 }) }); return T.g.level.counters.meals.n; });
  check('Kebda with 3 coins', r === 2, r);
  r = await ev(() => { T.tp('mariem', 36, 0, -1.2); T.run(0.4, {}); const before = T.g.level.counters.meals.n; T.tp('mohamed', 31, 0, -2); T.tp('mariem', 41, 0, 2.4); T.run(0.4, {}); const o = T.sig('order'); T.goto('mariem', 36, -1.3, 3); T.run(0.3, {}); return { before, o, meals: T.g.level.counters.meals.n }; });
  check('Fries only after both press ORDER', r.before === 2 && r.o && r.meals === 3, r);
  r = await ev(() => { T.tp('mohamed', 52, 0, 0); const wall = T.goto('mohamed', 60, 0, 2); T.tp('mohamed', 48.5, 0, 2.6); T.tp('mariem', 49.8, 0, 2.6); T.run(0.3, {}); return { wall, bus: T.sig('bus') }; });
  check('The bus depot wall: you have to take the bus', r.wall.x < 54, r);
  check('Both at the bus stop catches the bus', r.bus, r);
  r = await ev(() => { T.tp('mohamed', 80, 0, 1.5); T.tp('mariem', 81, 0, 1.5); T.goto('mariem', 84, -1.6, 2); T.goto('mariem', 86, 1.6, 2); T.goto('mohamed', 90.2, -2.2, 3); T.goto('mariem', 91.4, -2.2, 3); T.run(2, {}); return { cal: T.g.level.items.filter(i => i.kind === 'calendar' && i.taken).length, done: T.g.level.goal.done }; });
  check('Two July birthdays found', r.cal === 2, r);
  check('Sunset on the Corniche completes the chapter', r.done, r);
};
