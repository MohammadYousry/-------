// "Our home": the free-play apartment. Run with: node tests/run.js home
module.exports = async ({ ev, check, start, page }) => {
  // pretend the whole story is finished so every decor piece, frame and the kids are built
  await ev(() => {
    MM.CHAPTERS.forEach((c) => { MM.save.chapters[c.id] = { done: true, hearts: 1, time: 100 }; });
    MM.save.unlocked = 20; MM.save.trophies = ['firsthug', 'story', 'memories']; MM.save.letters = [];
  });
  await start(99);
  let r = await ev(() => ({ hub: T.g.chapter.hub, title: T.g.chapter.title, kids: T.g.kids.length, goal: !!T.g.level.goal, frames: T.g.level.group.children.length, ints: T.g.level.interacts.length }));
  check('Home builds as free play with the kids and no goal', r.hub && !r.goal && r.kids === 2 && r.ints === 2, r);

  r = await ev(() => {
    T.tp('mohamed', 3.4, 0.7, -3.0); T.run(0.3, {});
    T.run(0.2, { mohamed: { love: true } });
    const mo = T.g.player('mohamed');
    const sat = { seated: !!mo.seated, pose: mo.pose, y: +mo.body.y.toFixed(2) };
    T.tp('mariem', 4.6, 0.7, -3.0); T.run(0.3, {});
    T.run(0.3, { mariem: { love: true } });
    T.run(0.3, {});
    return { sat, couch: T.sig('couch'), ma: T.g.player('mariem').pose };
  });
  check('Both sit on the couch together', r.sat.seated && r.sat.pose === 'sit' && r.couch && r.ma === 'sit', r);
  r = await ev(() => { T.run(0.6, { mohamed: { mx: 0, mz: 1 } }); const mo = T.g.player('mohamed'); return { seated: !!mo.seated, pose: mo.pose, z: +mo.body.z.toFixed(2) }; });
  check('Moving stands up from the couch', !r.seated && r.pose == null && r.z > -2.6, r);

  r = await ev(() => { T.tp('mohamed', 15, 0, -2); T.run(0.2, {}); return T.sig('wall'); });
  check('Memory wall walk-by', r, r);

  r = await ev(() => { T.tp('mohamed', 36, 0, 0); T.tp('mariem', 38, 0, 0); T.run(0.4, {}); return T.sig('balcony'); });
  check('Balcony together', r, r);
  r = await ev(() => { T.tp('mariem', 38, 0, -3.6); T.goto('mariem', 38, -7, 1.5); return T.P('mariem'); });
  check('The balcony railing holds', r.z > -4.5 && r.y > -0.5, r);

  // mailbox: Love next to it opens the letters page on top of the game
  r = await ev(() => {
    T.g.state = 'play';
    T.tp('mohamed', -2.4, 0, -2.4); T.run(0.1, {});
    T.run(0.05, { mohamed: { love: true } });
    return { state: T.g.state, screen: T.g.ui.current() };
  });
  check('Mailbox opens the letters', r.state === 'paused' && r.screen === 'letters', r);
  r = await ev(() => {
    document.getElementById('letter-text').value = 'Test letter';
    document.getElementById('letter-from').value = 'mariem';
    T.g.action('letter-send');
    const l = MM.save.letters[0];
    T.g.action('back');
    return { n: MM.save.letters.length, from: l && l.from, state: T.g.state, stat: MM.save.stats.letters, trophy: MM.save.trophies.indexOf('letter') >= 0 };
  });
  check('A letter goes in the mailbox and Back returns to the game', r.n === 1 && r.from === 'mariem' && r.state === 'play' && r.trophy, r);
  r = await ev(() => { T.g.receiveLetters([{ id: 'x1', from: 'mohamed', text: 'From the other phone', at: Date.now() }, { id: 'x1', from: 'mohamed', text: 'dup', at: 1 }]); T.g.receiveLetters([{ id: 'x1', from: 'mohamed', text: 'again', at: 1 }]); return { n: MM.save.letters.length, unread: MM.save.letters.filter((l) => !l.read).length }; });
  check('Letters from the other phone arrive once, unread', r.n === 2 && r.unread === 1, r);

  // photo mode from the pause menu
  r = await ev(async () => {
    const g = T.g; g.state = 'paused';
    g.photo.enter();
    const s1 = g.state;
    g.photo.setPose('mohamed', 'kneel'); g.photo.setPose('mariem', 'love'); g.photo.together();
    for (let i = 0; i < 10; i++) g.photo.update(1 / 60);
    await g.photo.shoot();
    const saved = (MM.save.photos || []).length;
    g.photo.exit();
    return { s1, saved, after: g.state, hud: !document.getElementById('hud').hidden };
  });
  check('Photo mode: pose, shoot, save, back to play', r.s1 === 'photo' && r.saved === 1 && r.after === 'play' && r.hud, r);
  await ev(() => { T.g.state = 'test'; });

  // special days and counters
  r = await ev(() => {
    MM.save.settings.wedding = '2027-07-01';
    const a = MM.Extras.today(new Date(2026, 6, 13)), b = MM.Extras.today(new Date(2027, 6, 1)), c = MM.Extras.today(new Date(2028, 6, 1)), d = MM.Extras.today(new Date(2026, 2, 3));
    const cn = MM.Extras.counters(new Date(2026, 10, 3));
    return { a: a && a.title, b: b && b.title, c: c && c.sub, d, cn };
  });
  check('Special dates and counters', r.a === 'Happy birthday, Mariem!' && r.b === 'Our wedding day' && r.c === '1 year married' && !r.d && r.cn.length === 3, r);

  if (process.env.SHOTS) {
    const shot = async (name, pos) => { await ev((p) => { T.tp('mohamed', p[0], p[1], p[2]); T.tp('mariem', p[0] + 1.4, p[1], p[2]); T.g.snapCams(); }, pos); await page.waitForTimeout(700); await page.screenshot({ path: process.env.SHOTS + '/home-' + name + '.png' }); };
    await shot('living', [2, 0, 0.5]);
    await shot('wall', [17, 0, 0.5]);
    await shot('trophies', [26, 0, 0.5]);
    await shot('balcony', [37, 0, 0]);
  }
};
