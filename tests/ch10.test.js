module.exports = async ({ ev, check, start }) => {
  await start(10);
  let r = await ev(() => { T.tp('mariem', 19.5, 0, 2.3); T.goto('mariem', 22, 2.3, 3); T.run(0.3, {}); return { p: T.P('mariem'), s: T.sig('cage1') }; });
  check('Mariem double-jumps onto the pillar and unlocks', r.p.y > 2.7 && r.s, r);
  r = await ev(() => { T.tp('mohamed', 14.6, 0, 0); T.goto('mohamed', 14.6, -2.4, 1.5, { autojump: false }); T.goto('mohamed', 25.3, -2.4, 6, { autojump: false }); T.run(0.3, {}); const c = T.g.level.crates[0].body; return { c: [+c.x.toFixed(2), +c.y.toFixed(2), +c.z.toFixed(2)], s: T.sig('srv1'), m: T.P('mohamed') }; });
  check('Mohamed pushes server 1 through the cage onto POWER', r.s, r);
  r = await ev(() => { T.goto('mariem', 24, 2.3, 2); T.goto('mohamed', 34.5, 0, 4); T.goto('mariem', 35, 1, 4); return [T.P('mohamed'), T.P('mariem')]; });
  check('Server 1 door opens for both', r[0].x > 34 && r[1].x > 34, r);
  // data stream hopping (waits for good timing like a player would)
  r = await ev(() => {
    T.g.level.hazards.forEach(h => { h.r = 0; });
    const L = T.g.level, movers = L.objects.filter(o => o.type === 'mover');
    const plats = movers.map(m => m.solid).concat([L.solids.find(s => s.x0 === 50.6)]);
    const res = {};
    ['mohamed', 'mariem'].forEach(w => {
      T.tp(w, 36.3, 0, 0);
      let idx = 0, guard = 0, jumpedAt = -99, f = 0;
      while (idx < plats.length && guard++ < 1800) {
        const b = T.b(w), nxt = plats[idx];
        const cur = b.ground ? b.ground.y1 : b.y;
        const ok = b.grounded && nxt.y1 - cur < (w === 'mohamed' ? 1.3 : 1.6) && nxt.y1 - cur > -2.2;
        const onIt = b.grounded && b.ground === nxt;
        let a = { mx: 0, jumpHeld: true };
        if (onIt) { idx++; }
        else if (ok && f - jumpedAt > 40) { a.jump = true; a.mx = 1; jumpedAt = f; }
        else if (!b.grounded) { const cx = (nxt.x0 + nxt.x1) / 2; a.mx = MM.clamp((cx - b.x) * 2, -1, 1); }
        T.step({ mohamed: w === 'mohamed' ? Object.assign(T.blank(), a) : null, mariem: w === 'mariem' ? Object.assign(T.blank(), a) : null });
        f++;
      }
      T.goto(w, 55, 0, 2);
      res[w] = Object.assign(T.P(w), { idx, guard });
    });
    return res;
  });
  check('Mohamed hops the data stream', r.mohamed.x > 54 && r.mohamed.y === 0, r.mohamed);
  check('Mariem hops the data stream', r.mariem.x > 54 && r.mariem.y === 0, r.mariem);
  r = await ev(() => { T.tp('mohamed', 61, 0, -2.3); T.tp('mariem', 61.4, 0, -2.4);
    T.run(0.2, { mohamed: { mx: 1, jumpHeld: true } }); T.run(0.05, { mohamed: { ability: true } });
    T.goto('mariem', 63, -2.3, 2.2, { autojump: false }); T.run(0.2, {});
    const s = T.sig('timer'); const p = T.P('mariem');
    T.goto('mariem', 63, -1.4, 0.4, { autojump: false });
    const m = T.goto('mohamed', 68, 1.5, 3);
    return { s, p, m };
  });
  check('Toss onto the rack, 5-second timer lets Mohamed in', r.s && r.p.y > 4.7 && r.m.x > 67, r);
  r = await ev(() => { T.goto('mohamed', 68, 0, 1, { autojump: false }); T.goto('mohamed', 75.3, 0, 5, { autojump: false }); T.run(0.3, {}); const c = T.g.level.crates[1].body; return { s: T.sig('srv2'), c: +c.x.toFixed(2) }; });
  check('Server 2 pushed onto POWER', r.s, r);
  r = await ev(() => { T.run(3, {}); T.goto('mariem', 66, 1, 3); const f = T.goto('mariem', 81.5, 1, 5); const m = T.goto('mohamed', 81.5, -2, 4); return { f, m }; });
  check('Both reach the dash pit', r.f.x > 81 && r.m.x > 81, r);
  r = await ev(() => { T.tp('mariem', 80.8, 0, -1); let st = 0, t0 = 0;
    T.run(2.4, { mariem: (i, b) => { const a = { mx: 1, jumpHeld: true };
      if (st === 0 && b.x > 81.3) { a.jump = true; st = 1; t0 = i; } else if (st === 1 && i - t0 > 18) { a.jump = true; st = 2; t0 = i; } else if (st === 2 && i - t0 > 14) { a.ability = true; st = 3; }
      if (st === 3 && b.grounded) { a.mx = 0; }
      return a; } });
    const p = T.P('mariem'); T.goto('mariem', 90, -2.8, 2); T.run(0.3, {});
    return { p, br: T.sig('br') }; });
  check('Mariem dashes over the pit and builds the bridge', r.p.x > 88.5 && r.br, r);
  r = await ev(() => { T.run(1.2, {}); const m = T.goto('mohamed', 90.4, 0, 4); T.run(0.25, { mohamed: { jump: true, jumpHeld: true } }); T.run(1, { mohamed: { ability: true } }); return { m, bug: T.sig('broken:bug'), servers: T.sig('servers') }; });
  check('Mohamed crosses and slams the BUG', r.m.x > 89 && r.bug && r.servers, r);
  r = await ev(() => { T.goto('mohamed', 95, -2.2, 3); T.goto('mariem', 95, 2.2, 3); T.run(0.5, {}); const l = T.sig('launch'); T.run(1.5, {}); T.goto('mohamed', 101, 0, 4); T.goto('mariem', 102, 1, 4); T.run(2, {}); return { l, done: T.g.level.goal.done }; });
  check('LAUNCH buttons and goal', r.l && r.done, r);
};
