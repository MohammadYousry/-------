/* The things that keep the game alive for years: their special dates, day counters, trophies and chapter stars. */
(function (MM) {
  'use strict';
  const X = (MM.Extras = {});
  const DAY = 86400000;

  /* ---------------- special dates ---------------- */
  // month is 1-12. `since` gives the year it started, for "N years" lines.
  X.DATES = [
    { m: 7, d: 13, title: 'Happy birthday, Mariem!', sub: (y) => 'Born 13 July 2002 · ' + (y - 2002) + ' today', icon: '🎂', theme: 'birthday' },
    { m: 7, d: 18, title: 'Happy birthday, Mohamed!', sub: (y) => 'Born 18 July 2003 · ' + (y - 2003) + ' today', icon: '🎂', theme: 'birthday' },
    { m: 8, d: 15, title: 'Our Fatiha anniversary', sub: (y) => (y - 2025 ? y - 2025 + (y - 2025 > 1 ? ' years' : ' year') + ' since' : 'Today:') + ' the Fatiha, 15 August 2025', icon: '🤲', theme: 'anniversary' },
    { m: 10, d: 16, title: 'Happy engagement anniversary', sub: (y) => (y - 2025) + (y - 2025 > 1 ? ' years' : ' year') + ' since 16 October 2025', icon: '💍', theme: 'anniversary' },
    { m: 10, d: 21, title: 'Happy home anniversary', sub: (y) => (y - 2026 ? (y - 2026) + (y - 2026 > 1 ? ' years' : ' year') + ' in ' : 'The day we found ') + 'our home in Alexandria', icon: '🏡', theme: 'anniversary' },
    { m: 12, d: 12, title: 'Dr. Mariem\'s day', sub: (y) => (y === 2026 ? 'Graduation day! 12 o\'clock.' : (y - 2026) + (y - 2026 > 1 ? ' years' : ' year') + ' since Dr. Mariem graduated'), icon: '🎓', theme: 'birthday' },
  ];

  function midnight(d) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
  X.daysBetween = (a, b) => Math.round((midnight(b) - midnight(a)) / DAY);

  // Today's celebration, if any (also their wedding anniversary once the date is set).
  X.today = function (now) {
    now = now || new Date();
    const m = now.getMonth() + 1, d = now.getDate(), y = now.getFullYear();
    const w = X.wedding();
    if (w && m === w.getMonth() + 1 && d === w.getDate() && y >= w.getFullYear()) {
      const n = y - w.getFullYear();
      return { title: n ? 'Happy wedding anniversary' : 'Our wedding day', sub: n ? n + (n > 1 ? ' years' : ' year') + ' married' : 'Today, forever starts', icon: '💒', theme: 'anniversary' };
    }
    const hit = X.DATES.find((e) => e.m === m && e.d === d);
    return hit ? { title: hit.title, sub: hit.sub(y), icon: hit.icon, theme: hit.theme } : null;
  };

  X.wedding = function () {
    const s = MM.save.settings.wedding;
    if (!s) return null;
    const d = new Date(s + 'T00:00:00');
    return isNaN(d) ? null : d;
  };

  // Small lines for the title screen: how long engaged, the wedding countdown, the next special day.
  X.counters = function (now) {
    now = now || new Date();
    const out = [];
    const engaged = new Date(2025, 9, 16), w = X.wedding();
    if (w && X.daysBetween(w, now) >= 0) out.push('💒 Married for ' + X.daysBetween(w, now).toLocaleString('en-US') + ' days');
    else {
      out.push('💍 Engaged for ' + X.daysBetween(engaged, now).toLocaleString('en-US') + ' days');
      if (w) out.push('👰 ' + X.daysBetween(now, w).toLocaleString('en-US') + ' days until our wedding');
    }
    // the next date on the calendar
    let best = null;
    X.DATES.forEach((e) => {
      let t = new Date(now.getFullYear(), e.m - 1, e.d);
      if (X.daysBetween(now, t) < 0) t = new Date(now.getFullYear() + 1, e.m - 1, e.d);
      const n = X.daysBetween(now, t);
      if (n > 0 && (!best || n < best.n)) best = { n, e };
    });
    if (best) out.push(best.e.icon + ' ' + best.e.title.replace(/^Happy /, '').replace(/!$/, '') + ' in ' + best.n + (best.n === 1 ? ' day' : ' days'));
    return out;
  };

  /* ---------------- chapter stars ---------------- */
  // ★ finished · ★ every heart (or the mini-game goal) · ★ every memory (or the mini-game's best)
  X.stars = function (def, rec) {
    if (!rec || !rec.done) return 0;
    let s = 1;
    if (def.type === 'drive') { if ((rec.notes || 0) >= 25) s++; if ((rec.popcorn || 0) >= 16) s++; }
    else if (def.type === 'concert') { if ((rec.pct || 0) >= 70) s++; if ((rec.pct || 0) >= 90) s++; }
    else { if (rec.heartsTotal && rec.hearts >= rec.heartsTotal) s++; if (rec.memTotal && (rec.mems || 0) >= rec.memTotal) s++; }
    return s;
  };
  X.starText = (n) => '★★★'.slice(0, n) + '☆☆☆'.slice(0, 3 - n);

  /* ---------------- trophies ---------------- */
  const doneCount = () => MM.CHAPTERS.filter((c) => MM.save.chapters[c.id] && MM.save.chapters[c.id].done).length;
  const heartTotal = () => Object.keys(MM.save.chapters).reduce((a, k) => a + (MM.save.chapters[k].hearts || 0), 0);
  const stat = (k) => (MM.save.stats && MM.save.stats[k]) || 0;
  const rec = (id) => MM.save.chapters[id] || {};
  X.TROPHIES = [
    { id: 'firsthug', icon: '🤗', title: 'First Hug', text: 'Press Love next to each other.', test: () => stat('hugs') >= 1 },
    { id: 'hugs50', icon: '💞', title: 'Cuddle Champions', text: 'Hug 50 times.', test: () => stat('hugs') >= 50 },
    { id: 'hearts100', icon: '💗', title: 'A Hundred Hearts', text: 'Collect 100 hearts across the story.', test: () => heartTotal() >= 100 },
    { id: 'allhearts', icon: '💖', title: 'Every Single Heart', text: 'Find every heart in a chapter.', test: () => MM.CHAPTERS.some((c) => !c.type && rec(c.id).heartsTotal && rec(c.id).hearts >= rec(c.id).heartsTotal) },
    { id: 'memories', icon: '📸', title: 'Our Whole Album', text: 'Find every memory in the game.', test: () => MM.MEMORIES.every((m) => MM.save.memories.indexOf(m.id) >= 0) },
    { id: 'half', icon: '🌗', title: 'Halfway There', text: 'Finish 10 chapters.', test: () => doneCount() >= 10 },
    { id: 'story', icon: '📖', title: 'Our Story', text: 'Finish all 20 chapters.', test: () => doneCount() >= MM.CHAPTERS.length },
    { id: 'stars', icon: '⭐', title: 'Three Stars', text: 'Get three stars in any chapter.', test: () => MM.CHAPTERS.some((c) => X.stars(c, MM.save.chapters[c.id]) >= 3) },
    { id: 'allstars', icon: '🌟', title: 'All the Stars', text: 'Three stars in every chapter.', test: () => MM.CHAPTERS.every((c) => X.stars(c, MM.save.chapters[c.id]) >= 3) },
    { id: 'concert', icon: '🎤', title: 'Front Row', text: '90% on the beat at the concerts.', test: () => (rec('concerts').pct || 0) >= 90 },
    { id: 'cinema', icon: '🍿', title: 'Cinema Every Time', text: 'Collect 16 popcorn on the exam drive.', test: () => (rec('exams').popcorn || 0) >= 16 },
    { id: 'nofall', icon: '🪶', title: 'Light on Our Feet', text: 'Finish a chapter without a single fall.', test: () => stat('nofall') >= 1 },
    { id: 'speed', icon: '⏱️', title: 'Top of the Class', text: 'Finish chapter 1 in under 2 minutes.', test: () => rec('kids').time && rec('kids').time < 120 },
    { id: 'together', icon: '🛋️', title: 'Side by Side', text: 'Finish a chapter together on one screen.', test: () => stat('localDone') >= 1 },
    { id: 'online', icon: '🌍', title: 'From Two Homes', text: 'Finish a chapter online.', test: () => stat('onlineDone') >= 1 },
    { id: 'wardrobe', icon: '👗', title: 'Full Wardrobe', text: 'Unlock every outfit.', test: () => ['kids', 'whitecoat', 'family', 'summer', 'forever'].every((id) => rec(id).done) },
    { id: 'photos', icon: '📷', title: 'Photographer', text: 'Take 10 photos in photo mode.', test: () => stat('photos') >= 10 },
    { id: 'letter', icon: '💌', title: 'Love Letter', text: 'Leave a letter in the mailbox at home.', test: () => stat('letters') >= 1 },
    { id: 'home', icon: '🏡', title: 'Home Sweet Home', text: 'Visit our home.', test: () => stat('homeVisits') >= 1 },
    { id: 'special', icon: '🎉', title: 'Special Day', text: 'Play on one of our special dates.', test: () => stat('specialDays') >= 1 },
    { id: 'quiz', icon: '🧠', title: 'We Know Us', text: 'Ten out of ten in the couple quiz.', test: () => stat('quizBest') >= 10 },
    { id: 'dance', icon: '💃', title: 'Our First Dance', text: 'Dance together at home.', test: () => stat('dances') >= 1 },
    { id: 'wish', icon: '🌠', title: 'Written in the Stars', text: 'Make a wish on the balcony.', test: () => stat('wishes') >= 1 },
  ];

  // Re-check every trophy; announce the new ones. Returns the newly unlocked list.
  X.check = function (silent) {
    MM.save.trophies = MM.save.trophies || [];
    const got = [];
    X.TROPHIES.forEach((t) => {
      if (MM.save.trophies.indexOf(t.id) >= 0) return;
      let ok = false;
      try { ok = !!t.test(); } catch (e) { ok = false; }
      if (ok) { MM.save.trophies.push(t.id); got.push(t); }
    });
    if (got.length) {
      MM.writeSave();
      if (!silent && MM.UI) got.forEach((t, i) => setTimeout(() => { MM.UI.toast('Trophy · ' + t.title, t.icon + ' ' + t.text, false, true, 'Trophy unlocked'); MM.Audio.sfx('memory'); }, i * 600));
    }
    return got;
  };

  X.bump = function (k, n) {
    MM.save.stats = MM.save.stats || {};
    MM.save.stats[k] = (MM.save.stats[k] || 0) + (n == null ? 1 : n);
    MM.writeSave();
    X.check();
  };
})(window.MM);
