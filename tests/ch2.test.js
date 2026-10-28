module.exports = async ({ ev, check, start }) => {
  await start(2);
  // 1: the seesaw launches Mariem onto the high shelf; a toss alone cannot
  let r = await ev(() => {
    T.tp('mohamed', 18.2, 0, 2.6); T.tp('mariem', 18.6, 0, 2.7);
    T.run(0.2, { mohamed: { mx: 1, jumpHeld: true } }); T.run(0.05, { mohamed: { ability: true } });
    let maxY = 0; T.run(1.6, { mariem: (i, b) => { maxY = Math.max(maxY, b.y); return { mz: -1, jump: i === 30, jumpHeld: true }; } });
    return { maxY, cards: T.g.level.counters.cards.n };
  });
  check('A toss + double jump cannot reach the 7 m shelf', r.maxY < 7 && r.cards === 0, r);
  r = await ev(() => {
    T.tp('mariem', 16.2, 0.45, 0); T.run(0.3, {});
    T.tp('mohamed', 12.4, 2.6, 0);
    let launched = 0; T.run(0.8, { mariem: (i, b) => { launched = Math.max(launched, b.vy); return { jumpHeld: true }; } });
    const p = T.goto('mariem', 17.6, 0, 2.2, { autojump: false }); T.run(0.4, {});
    return { launched, p: T.P('mariem'), cards: T.g.level.counters.cards.n };
  });
  check('Mohamed landing on the seesaw launches Mariem', r.launched > 18, r);
  check('She lands on the shelf and solves problem 1', r.p.y > 6.9 && r.cards === 1, r);
  r = await ev(() => { T.tp('mariem', 16.2, 0.45, 0); T.tp('mohamed', 10, 0, 0); T.run(0.3, {}); let launched = 0; T.goto('mohamed', 13, 0, 1.5, { autojump: false }); T.run(0.5, { mariem: (i, b) => { launched = Math.max(launched, b.vy); return {}; } }); return launched; });
  check('Walking onto the seesaw does not launch her (needs a jump)', r < 1, r);
  // 2: the pulley
  r = await ev(() => { T.tp('mohamed', 24.5, 0, 2.5); T.tp('mariem', 28.5, 0.35, -2.3); T.run(2.8, {}); const up = T.P('mariem'); T.goto('mariem', 31.8, -2.6, 2); T.run(0.3, {}); return { up, cards: T.g.level.counters.cards.n }; });
  check('His MASS lifts her on the pulley to problem 2', r.up.y > 5 && r.cards === 2, r);
  // 3: the circuit
  r = await ev(() => { T.tp('mohamed', 46, 0, 0); const blocked = T.goto('mohamed', 51, 0, 2); T.tp('mohamed', 38, 0, -2.8); T.tp('mariem', 45, 0, 2.8); T.run(0.4, {}); const s = T.sig('circuit'); T.goto('mariem', 51.5, 0, 3); T.run(0.3, {}); return { blocked, s, cards: T.g.level.counters.cards.n }; });
  check('Circuit door blocks until both switches', r.blocked.x < 48.2, r);
  check('Both switches close the circuit, problem 3', r.s && r.cards === 3, r);
  r = await ev(() => { T.tp('mohamed', 55.2, 0, 0.8); T.tp('mariem', 56.6, 0, 0.8); T.run(2.2, {}); return T.g.level.goal.done; });
  check('Sit together completes the lesson', r);
};
