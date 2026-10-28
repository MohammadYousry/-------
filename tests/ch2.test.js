module.exports = async ({ ev, check, start }) => {
  await start(2);
  let r = await ev(() => { T.tp('mariem', 10, 0, 1); return T.goto('mariem', 15, 1, 3); });
  check('Doubt wall blocks Mariem', r.x < 12, r);
  r = await ev(() => { T.tp('mariem', 6, 0, 2); T.tp('mohamed', 11.2, 0, 0); T.run(0.25, { mohamed: { jump: true, jumpHeld: true } }); T.run(1.0, { mohamed: { ability: true } }); return T.sig('broken:doubt1'); });
  check('Mohamed slam breaks "I CAN\'T"', r);
  r = await ev(() => T.goto('mariem', 17, 1, 3));
  check('Mariem passes after the slam', r.x > 16.5, r);
  // ruler ride
  r = await ev(() => {
    const L = T.g.level; const ruler = L.objects.find(o => o.type === 'mover');
    T.tp('mohamed', 23.3, 0, 0); T.tp('mariem', 23.3, 0, 1);
    let guard = 0; while (ruler.solid.x0 > 24.6 && guard++ < 600) T.run(1 / 60, {});
    T.run(0.5, { mohamed: { mx: 1 }, mariem: { mx: 1 } });
    T.run(3.4, {});
    const mid = [T.P('mohamed'), T.P('mariem')];
    T.goto('mohamed', 38, 0, 2); T.goto('mariem', 38, 1, 2);
    return { mid, m: T.P('mohamed'), f: T.P('mariem'), book1: T.g.level.items.find(i => i.kind === 'book').taken };
  });
  check('Both ride the ruler across the void', r.m.x > 36 && r.f.x > 36 && r.m.y === 0, r);
  // book 2 by double jump
  r = await ev(() => { T.tp('mariem', 44, 0, 2.2); T.run(1.2, { mariem: (i) => ({ jump: i === 0 || i === 22, jumpHeld: true }) }); return T.g.level.items.filter(i => i.kind === 'book')[1].taken; });
  check('Mariem double-jumps for the high book', r);
  // elevator relay
  r = await ev(() => {
    T.tp('mohamed', 45.5, 0, 0); T.tp('mariem', 40, 0, -2.6);
    T.goto('mohamed', 48.2, 0, 2); T.goto('mariem', 42, -2.6, 2); T.run(2.8, {});
    const up = T.P('mohamed');
    T.goto('mohamed', 52.4, -2.6, 3); T.run(0.2, {});
    return { up, top: T.P('mohamed'), sup: T.sig('support') };
  });
  check('BELIEVE lifts Mohamed to the shelf (5 m)', r.up.y > 4.9 && r.top.y > 4.9, r);
  r = await ev(() => {
    // Mohamed steps off SUPPORT so the lift can come down for her
    T.goto('mohamed', 54, -2.6, 1);
    T.goto('mariem', 45, 0, 2); T.run(2.5, {});
    T.goto('mariem', 48.2, 0, 2);
    T.goto('mohamed', 52.4, -2.6, 1.5); T.run(2.6, {});
    const up = T.P('mariem'); T.goto('mariem', 53, 0.5, 2);
    return { up, p: T.P('mariem') };
  });
  check('SUPPORT brings Mariem up too', r.p.y > 4.9 && r.p.x > 50, r);
  // tunnel + doubt2
  r = await ev(() => { T.tp('mariem', 54, 5, 0); return { p: T.goto('mariem', 58, 0, 3, { autojump: false }), book: T.g.level.items.filter(i => i.kind === 'book')[2].taken }; });
  check('Mariem through the book tunnel grabs book 3', r.p.x > 57.5 && r.book, r);
  r = await ev(() => { T.tp('mohamed', 54, 5, 2.5); const blocked = T.goto('mohamed', 58, 2.5, 2, { autojump: false }); T.tp('mohamed', 54.2, 5, 2.5); T.run(0.25, { mohamed: { jump: true, jumpHeld: true } }); T.run(1, { mohamed: { ability: true } }); const p = T.goto('mohamed', 58, 2.5, 2); return { blocked, br: T.sig('broken:doubt2'), p }; });
  check('"NOT GOOD ENOUGH" blocks him until he slams it', r.blocked.x < 55 && r.br && r.p.x > 57.5, r);
  // cage
  r = await ev(() => { T.tp('mariem', 60.6, 6.7, -2.3); T.run(0.5, {}); const before = T.g.level.items.filter(i => i.kind === 'book')[3].taken; T.tp('mariem', 58, 5, 2); T.tp('mohamed', 59.4, 5, -2.3); T.run(0.25, { mohamed: { jump: true, jumpHeld: true } }); T.run(1, { mohamed: { ability: true } }); T.goto('mohamed', 61, -2.3, 2); return { before, br: T.sig('broken:cage'), after: T.g.level.items.filter(i => i.kind === 'book')[3].taken }; });
  check('Caged book only after the slam', !r.before && r.br && r.after, r);
  r = await ev(() => { T.g.level.hazards.forEach(h => { h.r = 0; }); T.tp('mariem', 62.5, 5, 0); T.goto('mariem', 65, 0, 3); T.run(0.5, {}); return { p: T.P('mariem'), book: T.g.level.items.filter(i => i.kind === 'book')[4].taken, n: T.g.level.counters.books.n }; });
  check('Mariem reaches the high book (7.6 m)', r.book && r.n === 5, r);
  r = await ev(() => { T.tp('mohamed', 66, 5, 0); T.tp('mariem', 66, 5, 1); T.run(1, {}); T.goto('mohamed', 73, 0, 3); T.goto('mariem', 74, 1, 3); T.run(2, {}); return { door: T.sig('count:books'), done: T.g.level.goal.done }; });
  check('Paycheck door opens and the goal completes', r.door && r.done, r);
};
