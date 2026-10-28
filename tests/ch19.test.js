module.exports = async ({ ev, check, start }) => {
  await start(19);
  let r = await ev(() => { T.tp('mariem', 1, 0, -2); T.tp('mohamed', 2.6, 0, 0.5); T.goto('mohamed', 7.9, 0.5, 3, { autojump: false }); const m = T.goto('mohamed', 12, 0.5, 4); return { m, c: T.g.level.crates[0].body.x }; });
  check('Book cart makes a step to the 2.8 m shelf', r.m.y > 2.7, r);
  r = await ev(() => { T.tp('mohamed', 27, 0, 0); T.run(4, {}); return T.g.player('mohamed').stats.falls; });
  check('Standing in the heartbeat corridor gets you zapped', r > 0, r);
  r = await ev(() => {
    const L = T.g.level, bars = L.hazards;
    T.tp('mohamed', 18, 0, 0); const f0 = T.g.player('mohamed').stats.falls;
    let jumped = -99;
    T.run(7, { mohamed: (i, b) => { const a = { mx: 1, jumpHeld: true }; const near = bars.some(h => h.pos.x > b.x && h.pos.x - b.x < 1.5); if (near && b.grounded && i - jumped > 15) { a.jump = true; jumped = i; } if (b.x > 35.5) a.mx = 0; return a; } });
    return { p: T.P('mohamed'), hits: T.g.player('mohamed').stats.falls - f0 };
  });
  check('Timed jumps clear the heartbeat lasers', r.p.x > 34 && r.hits === 0, r);
  r = await ev(() => {
    const L = T.g.level, movers = L.objects.filter(o => o.type === 'mover');
    const res = {};
    ['mohamed', 'mariem'].forEach(w => {
      T.tp(w, 36.5, 0, 0);
      let idx = 0, guard = 0, f = 0, jumpedAt = -99;
      const targets = movers.map(m => m.solid);
      while (guard++ < 1500) {
        const b = T.b(w);
        let a = { mx: 0, jumpHeld: true };
        if (idx < targets.length) {
          const nxt = targets[idx];
          if (b.grounded && b.ground === nxt) idx++;
          else if (b.grounded && idx > 0 && b.ground === targets[idx - 1] && b.x < b.ground.x1 - 0.6) { a.mx = 1; }
          else if (b.grounded && nxt.x0 - (b.x + b.r) < 1.2 && f - jumpedAt > 40) { a.jump = true; a.mx = 1; jumpedAt = f; }
          else if (!b.grounded) { a.mx = MM.clamp(((nxt.x0 + nxt.x1) / 2 - b.x) * 2, -1, 1); }
        } else { a.mx = 1; if (b.grounded && b.x > 51 && b.x < 52.6 && f - jumpedAt > 40) { a.jump = true; jumpedAt = f; } if (b.x > 54.5) break; }
        T.step({ mohamed: w === 'mohamed' ? Object.assign(T.blank(), a) : null, mariem: w === 'mariem' ? Object.assign(T.blank(), a) : null });
        f++;
      }
      res[w] = Object.assign(T.P(w), { idx, guard });
    });
    return res;
  });
  check('Mohamed rides the pills across the lab', r.mohamed.x > 53 && r.mohamed.y > -0.1, r.mohamed);
  check('Mariem rides the pills across the lab', r.mariem.x > 53 && r.mariem.y > -0.1, r.mariem);
  r = await ev(() => { T.tp('mohamed', 53.6, 0, -2.6); T.tp('mariem', 54, 0, -2.7); T.run(0.2, { mohamed: { mx: 1, jumpHeld: true } }); T.run(0.05, { mohamed: { ability: true } }); T.goto('mariem', 55.5, -2.8, 2.2, { autojump: false }); T.run(0.3, {}); const s = T.sig('lab'); const p = T.P('mariem'); const m = T.goto('mohamed', 60, 0, 3); return { s, p, m, cof: T.g.level.counters.coffee.n }; });
  check('Toss onto the cabinet opens the exam hall', r.s && r.m.x > 59, r);
  r = await ev(() => { T.tp('mariem', 59.5, 0, 0); T.goto('mohamed', 61, 0, 2); T.goto('mariem', 66, 0, 2); T.goto('mohamed', 61, 2.6, 2); T.run(1.5, {}); const up = T.P('mariem'); T.goto('mariem', 70, -2.6, 3); T.goto('mohamed', 63, 2.6, 1.5); T.run(0.3, {}); return { up, f: T.P('mariem'), cheer: T.sig('cheer') }; });
  check('HOLD lifts Mariem to the stage, she stands on CHEER', r.up.y > 2.9 && r.cheer, r);
  r = await ev(() => { T.goto('mariem', 72, -2.6, 1); T.run(1.6, {}); T.goto('mohamed', 66, 0, 2); T.goto('mariem', 70, -2.6, 2); T.run(1.6, {}); const p = T.goto('mohamed', 72, 0, 3); return p; });
  check('CHEER brings Mohamed up too', r.y > 2.9 && r.x > 70, r);
  r = await ev(() => { T.g.level.counters.coffee.n = 5; T.goto('mohamed', 75.5, -1, 3); T.goto('mariem', 77, 1, 3); T.run(2, {}); return T.g.level.goal.done; });
  check('Graduation goal', r === true, r);
  r = await ev(() => T.g.level.items.filter(i => i.kind === 'coffee').map(i => [i.x, i.y, i.z]));
  check('5 coffees placed', r.length === 5, r);
};
