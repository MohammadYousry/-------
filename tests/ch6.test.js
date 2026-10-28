module.exports = async ({ ev, check, start }) => {
  await start(6, 'local');
  const r = await ev(() => {
    const g = T.g, D = g.drive; D.running = true;
    const LANES = [-2.6, 0, 2.6];
    let frames = 0, lastSteer = -99, lastSt = -99;
    while (!D.done && frames < 60 * 120) {
      const inpM = T.blank(), inpF = T.blank();
      // driver: dodge obstacles ahead in our lane
      const ahead = D.obstacles.filter(o => !o.hit && o.z < D.z && o.z > D.z - 16);
      const blockedLane = (l) => ahead.some(o => o.lanes.indexOf(l) >= 0 && o.z > D.z - 12);
      if (blockedLane(D.lane) && frames - lastSteer > 12) {
        const opts = [D.lane - 1, D.lane + 1].filter(l => l >= 0 && l <= 2 && !blockedLane(l));
        if (opts.length) { inpM.mx = opts[0] > D.lane ? 1 : -1; lastSteer = frames; }
        else if (D.lane !== 1 && !blockedLane(1)) { inpM.mx = 1 > D.lane ? 1 : -1; lastSteer = frames; }
        else { const o = ahead.find(o => o.lanes.indexOf(D.lane) >= 0); if (o && o.hoppable && o.z > D.z - 4) inpM.jump = true; }
      } else if (!blockedLane(D.lane) && frames - lastSteer > 20) {
        // drift toward upcoming notes
        const note = D.notes.find(n => !n.taken && !n.missed && n.z < D.z - 3 && n.z > D.z - 20);
        if (note && note.lane !== D.lane && !blockedLane(note.lane)) { const dir = note.lane > D.lane ? 1 : -1; if (!blockedLane(D.lane + dir)) { inpM.mx = dir; lastSteer = frames; } }
      }
      // DJ: match the next note colour
      const nn = D.notes.find(n => !n.taken && !n.missed && n.z < D.z && n.z > D.z - 26);
      if (nn && nn.col !== D.station && frames - lastSt > 8) { inpF.mx = ((nn.col - D.station + 3) % 3) === 1 ? 1 : -1; lastSt = frames; }
      g.debugInput = { mohamed: inpM, mariem: inpF };
      g.simulate(1 / 60, false);
      g.debugInput = null;
      frames++;
    }
    return { done: D.done, z: Math.round(D.z), vibe: D.vibe, notes: D.notesHit, total: D.notesTotal, hits: D.hits, secs: Math.round(frames / 60), failed: D.failed };
  });
  check('Road trip reaches home with the vibe alive', r.done && r.vibe > 0, r);
};
