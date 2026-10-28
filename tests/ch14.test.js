module.exports = async ({ ev, check, start }) => {
  await start(14, 'local');
  await ev(() => { MM.TEST_CLOCK = true; });
  let r = await ev(() => { const C = T.g.concert; C.running = true; T.step({ mohamed: Object.assign(T.blank(), { love: true }), mariem: null }); T.run(0.5, {}); const one = C.kissT != null; T.step({ mohamed: null, mariem: Object.assign(T.blank(), { love: true }) }); T.run(5.6, {}); return { one, kissed: C.kissT != null, phase: C.phase, mem: MM.save.memories.indexOf('firstkiss') >= 0 }; });
  check('The kiss needs both of them to press Love', !r.one && r.kissed && r.mem, r);
  check('Then the concert starts', r.phase === 'song' || r.phase === 'gap', r);
  r = await ev(() => {
    const g = T.g, C = g.concert; let frames = 0; const prev = { mohamed: 0, mariem: 0 };
    while (!C.done && frames < 60 * 200) {
      const now = C.now(), inp = { mohamed: T.blank(), mariem: T.blank() };
      if (C.phase === 'song') ['mohamed', 'mariem'].forEach((w) => {
        const n = C.notes.find((q) => q.state === 0 && q.who === w && Math.abs(q.step - now) < C.pw * 0.8);
        if (n && prev[w] === 0) inp[w].mx = n.dir === 'L' ? -1 : 1;
        prev[w] = inp[w].mx;
      });
      g.debugInput = inp; g.simulate(1 / 60, false); g.debugInput = null; frames++;
    }
    return { done: C.done, tot: C.total(), secs: Math.round(frames / 60), st: g.state };
  });
  check('Both concerts played to the end', r.done, r);
  check('A bot on the beat scores over 85%', r.tot.pct > 85, r);
};
