/* DOM side of the game: screens, HUD, story cards, album, settings, lobby. */
(function (MM) {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const U = (MM.UI = {});
  let game = null;
  let current = null;
  const history = [];

  const SCREENS = ['title', 'local', 'online', 'chapters', 'album', 'howto', 'settings', 'timeline', 'story', 'pause', 'complete', 'ending'];
  const chBg = (c) => c.card || 'linear-gradient(160deg,' + (MM.THEMES[c.theme] || MM.THEMES.school).skyTop + ',' + (MM.THEMES[c.theme] || MM.THEMES.school).accent + ')';

  U.init = function (g) {
    game = g;
    document.addEventListener('click', (e) => {
      const el = e.target.closest('[data-act]');
      if (!el || el.disabled) return;
      MM.Audio.init();
      MM.Audio.sfx('click');
      game.action(el.dataset.act, el);
    });
    // character pickers
    renderWho();
    $('cam-seg').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; MM.save.settings.camera = b.dataset.cam; MM.writeSave(); segSel('cam-seg', 'cam', b.dataset.cam); });
    $('q-seg').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; MM.save.settings.quality = b.dataset.q; MM.writeSave(); segSel('q-seg', 'q', b.dataset.q); game.applyQuality(); });
    [['o-seg-m', 'mohamed'], ['o-seg-f', 'mariem']].forEach(([id, who]) => $(id).addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; MM.save.settings.outfit[who] = +b.dataset.o; MM.writeSave(); segSel(id, 'o', b.dataset.o); game.refreshMenuChars(); }));
    $('set-music').addEventListener('input', (e) => { MM.save.settings.music = +e.target.value; MM.Audio.setVolumes(MM.save.settings.music, MM.save.settings.sfx); MM.writeSave(); });
    $('set-sfx').addEventListener('input', (e) => { MM.save.settings.sfx = +e.target.value; MM.Audio.setVolumes(MM.save.settings.music, MM.save.settings.sfx); MM.writeSave(); });
    $('song-file').addEventListener('change', async (e) => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      MM.Audio.init();
      await MM.media.set('song', f);
      MM.Audio.setCustomSong(f);
      $('clear-song').hidden = false;
      U.toast('Our song', 'Now playing: ' + f.name.replace(/\.[^.]+$/, ''), true);
    });
    $('join-code').addEventListener('keydown', (e) => { if (e.key === 'Enter') game.action('join'); e.stopPropagation(); });
    $('join-code').addEventListener('input', (e) => { e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5); });
    $('lobby-ch').addEventListener('change', (e) => game.lobbyChapter(+e.target.value));
    $('st-ready').addEventListener('click', (e) => { const r = e.target.closest('.ready'); if (r) game.readyClick(r.dataset.who); });
  };

  function segSel(id, key, val) { document.querySelectorAll('#' + id + ' button').forEach((b) => b.classList.toggle('on', b.dataset[key] === String(val))); }
  U.syncSettings = function () {
    const s = MM.save.settings;
    $('set-music').value = s.music; $('set-sfx').value = s.sfx;
    segSel('q-seg', 'q', s.quality); segSel('cam-seg', 'cam', s.camera);
    segSel('o-seg-m', 'o', s.outfit.mohamed); segSel('o-seg-f', 'o', s.outfit.mariem);
  };

  function whoButtons(container, selected, onPick) {
    container.innerHTML = '';
    MM.CHAR_IDS.forEach((id) => {
      const c = MM.CHARS[id];
      const b = document.createElement('button');
      b.className = 'who-btn ' + c.tag + (selected === id ? ' sel' : '');
      b.innerHTML = '<b style="color:' + c.color + '">' + c.name + '</b><small>' + (id === 'mohamed' ? 'The big guy: pushes, tosses, slams' : 'The little kitten: double jump, dash, tiny tunnels') + '</small>';
      b.addEventListener('click', () => { MM.Audio.init(); MM.Audio.sfx('click'); onPick(id); });
      container.appendChild(b);
    });
  }
  function renderWho() {
    const ll = MM.save.lastLocal;
    document.querySelectorAll('#scr-local .who').forEach((el) => {
      const slot = +el.dataset.slot;
      whoButtons(el, slot === 0 ? ll.p1 : ll.p2, (id) => {
        if (slot === 0) { ll.p1 = id; ll.p2 = id === 'mohamed' ? 'mariem' : 'mohamed'; } else { ll.p2 = id; ll.p1 = id === 'mohamed' ? 'mariem' : 'mohamed'; }
        MM.writeSave(); renderWho();
      });
    });
    whoButtons($('online-who'), game ? game.onlineChar : 'mohamed', (id) => { game.onlineChar = id; renderWho(); });
  }
  U.renderWho = renderWho;

  /* ---------- screens ---------- */
  U.show = function (name, keepHistory) {
    if (current && current !== name && keepHistory !== false && ['title', 'local', 'online', 'chapters', 'settings', 'howto', 'album', 'timeline'].indexOf(current) >= 0) history.push(current);
    SCREENS.forEach((s) => { const el = $('scr-' + s); if (el) el.hidden = s !== name; });
    current = name;
    if (name === 'chapters') renderChapters();
    if (name === 'album') renderAlbum();
    if (name === 'timeline') renderTimeline();
    if (name === 'settings') U.syncSettings();
    if (name === 'local') renderWho();
    if (name === 'online') { renderWho(); }
    U.gpIndex = -1;
    document.querySelectorAll('.gp-focus').forEach((e) => e.classList.remove('gp-focus'));
  };
  U.hideAll = function () { SCREENS.forEach((s) => { const el = $('scr-' + s); if (el) el.hidden = true; }); current = null; };
  U.back = function () { const prev = history.pop() || 'title'; U.show(prev, false); };
  U.current = () => current;
  U.clearHistory = () => { history.length = 0; };

  U.fade = function (on) { $('fade').classList.toggle('off', !on); };
  U.loading = function (on) { $('loading').hidden = !on; };

  /* ---------- chapters ---------- */
  function renderChapters() {
    const grid = $('ch-grid');
    grid.innerHTML = '';
    $('ch-mode-l').textContent = game.chapterMode === 'solo' ? 'Chapters · solo' : 'Chapters · together';
    MM.CHAPTERS.forEach((c) => {
      const locked = c.num > MM.save.unlocked;
      const rec = MM.save.chapters[c.id];
      const b = document.createElement('button');
      b.className = 'ch-card' + (locked ? ' locked' : '');
      b.style.setProperty('--ch-bg', chBg(c));
      b.innerHTML = '<span class="st">Chapter ' + c.num + '</span><span class="yr">' + c.year + '</span><span class="nm">' + c.title + '</span><span class="st">' + (rec && rec.done ? 'Done · ' + rec.hearts + ' hearts · ' + MM.fmtTime(rec.time) : locked ? 'Finish the chapter before to unlock' : 'Not played yet') + '</span>';
      if (!locked) b.addEventListener('click', () => { MM.Audio.init(); MM.Audio.sfx('click'); game.pickChapter(c.num); });
      grid.appendChild(b);
    });
  }
  U.renderChapters = renderChapters;

  /* ---------- album ---------- */
  async function renderAlbum() {
    const wrap = $('album');
    wrap.innerHTML = '';
    for (let i = 0; i < MM.MEMORIES.length; i++) {
      const m = MM.MEMORIES[i];
      const has = MM.save.memories.indexOf(m.id) >= 0;
      const card = document.createElement('div');
      card.className = 'polaroid' + (has ? '' : ' locked');
      card.style.setProperty('--tilt', ((i % 3) - 1) * 1.2 + 'deg');
      const ch = MM.chapterByNum(m.ch);
      if (!has) {
        card.innerHTML = '<div class="ph"><div class="ph-empty" style="color:var(--muted)">Hidden in chapter ' + m.ch + '</div></div><div class="yr">' + ch.year + '</div><h4>???</h4><p style="color:var(--muted)">Find this memory in "' + ch.title + '".</p>';
      } else {
        const photo = await MM.media.get('photo:' + m.id);
        card.innerHTML = '<div class="ph">' + (photo ? '<img alt="">' : '<div class="ph-empty">Add a photo of this moment</div>') + '</div><div class="yr">' + ch.year + ' · ' + ch.title + '</div><h4></h4><p></p><div class="acts"><button data-ph="add">' + (photo ? 'Change photo' : 'Add photo') + '</button>' + (photo ? '<button data-ph="del">Remove</button>' : '') + '</div>';
        card.querySelector('h4').textContent = m.title;
        card.querySelector('p').textContent = m.text;
        if (photo) card.querySelector('img').src = photo;
        const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*'; inp.hidden = true; inp.id = 'ph-' + m.id; card.appendChild(inp);
        card.querySelector('[data-ph="add"]').addEventListener('click', () => inp.click());
        const del = card.querySelector('[data-ph="del"]');
        if (del) del.addEventListener('click', async () => { await MM.media.set('photo:' + m.id, null); renderAlbum(); });
        inp.addEventListener('change', async () => {
          const f = inp.files && inp.files[0];
          if (!f) return;
          try { const d = await MM.fileToPhoto(f); await MM.media.set('photo:' + m.id, d); renderAlbum(); } catch (e) { U.toast('Photo', e.message, true); }
        });
      }
      wrap.appendChild(card);
    }
  }
  U.renderAlbum = renderAlbum;

  /* ---------- our story: the real dates ---------- */
  function renderTimeline() {
    const wrap = $('timeline');
    if (wrap.childElementCount) return;
    MM.TIMELINE.forEach((e) => {
      const li = document.createElement('li');
      li.innerHTML = '<span class="tl-date"></span><div><b></b><p></p></div>';
      li.querySelector('.tl-date').textContent = e.date;
      li.querySelector('b').textContent = e.title;
      li.querySelector('p').textContent = e.text;
      if (e.future) li.classList.add('future');
      wrap.appendChild(li);
    });
  }

  /* ---------- story card ---------- */
  let storyTimers = [];
  U.story = function (def, mode, roles) {
    storyTimers.forEach(clearTimeout); storyTimers = [];
    $('st-ch').textContent = 'Chapter ' + def.num + ' of ' + MM.CHAPTERS.length;
    $('st-yr').textContent = def.year;
    $('st-title').textContent = def.title;
    $('st-mission').textContent = 'Mission: ' + def.mission;
    const lines = $('st-lines'); lines.innerHTML = '';
    def.intro.forEach((t, i) => {
      const p = document.createElement('p'); p.textContent = t; lines.appendChild(p);
      storyTimers.push(setTimeout(() => p.classList.add('in'), 500 + i * 1100));
    });
    const rr = $('st-ready'); rr.innerHTML = '';
    const needs = mode === 'solo' ? ['solo'] : ['mohamed', 'mariem'];
    needs.forEach((w) => {
      const c = MM.CHARS[w];
      const d = document.createElement('div');
      d.className = 'ready ' + (c ? c.tag : 'm'); d.dataset.who = w;
      d.innerHTML = '<span class="dot"></span><span>' + (c ? c.name : 'Ready') + (roles && roles[w] ? ' <span class="muted">(' + roles[w] + ')</span>' : '') + '</span>';
      rr.appendChild(d);
    });
    $('st-hint').textContent = mode === 'solo' ? 'Press Jump or tap here to start' : mode === 'online' ? 'Press Jump when you\'re ready. The chapter starts when you\'re both ready.' : 'Both players press Jump when you\'re ready';
    U.show('story');
  };
  U.setReady = function (who, on) {
    const el = document.querySelector('#st-ready .ready[data-who="' + who + '"]');
    if (el) el.classList.toggle('on', !!on);
  };

  /* ---------- HUD ---------- */
  U.hud = function (on) { $('hud').hidden = !on; if (!on) { $('together').hidden = true; $('subtitle').hidden = true; } };
  U.divider = function (on) { $('divider').hidden = !on; };
  U.touch = function (on, solo) { $('touch').hidden = !on; document.body.classList.toggle('touch', !!on); $('t-swap').style.visibility = solo ? 'visible' : 'hidden'; };

  U.setPlayerChips = function (list) {
    // list: [{who, label, hint, active, side}]
    [0, 1].forEach((i) => {
      const el = $('pchip-' + i), it = list[i];
      if (!it) { el.hidden = true; return; }
      el.hidden = false;
      const c = MM.CHARS[it.who];
      el.className = 'pchip ' + c.tag + (it.active ? ' active' : '');
      el.innerHTML = '<span class="av">' + c.name[0] + '</span><span><b>' + c.name + '</b> <span class="muted">' + (it.label || '') + '</span><br><span class="hint">' + (it.hint || '') + '</span></span>';
    });
  };

  U.objectives = function (def, rows) {
    $('hud-mt').textContent = 'Chapter ' + def.num + ' · ' + def.title;
    const ul = $('hud-obj');
    const html = rows.map((r) => '<li class="' + (r.done ? 'done' : '') + '"><span>' + r.label + '</span>' + (r.n != null ? '<span class="n">' + r.n + '</span>' : '') + '</li>').join('');
    if (ul._last !== html) { ul.innerHTML = html; ul._last = html; }
  };
  U.counts = function (hearts, heartsTotal, mems, memTotal) {
    const hide = hearts == null;
    $('hud-hearts').parentNode.hidden = hide; $('hud-mems').parentNode.hidden = hide;
    if (hide) return;
    $('hud-hearts').textContent = hearts + ' / ' + heartsTotal;
    $('hud-mems').textContent = mems + ' / ' + memTotal;
  };
  U.counterChip = function (text) { const el = $('hud-counter'); el.hidden = !text; if (text) el.textContent = text; };
  U.meter = function (label, frac, color) {
    const el = $('hud-meter');
    el.hidden = label == null;
    if (label == null) return;
    $('hud-meter-l').textContent = label;
    const bar = $('hud-meter-bar'); bar.style.width = Math.round(MM.clamp(frac, 0, 1) * 100) + '%';
    if (color) bar.style.background = color;
  };
  U.driveHud = function (d) {
    const st = MM.DRIVE_STATIONS[d.station];
    U.counterChip('Radio: ' + st.name);
    $('hud-counter').style.color = st.css;
    U.meter('Vibe ' + Math.round(d.vibe), d.vibe / 100, d.vibe < 25 ? 'linear-gradient(90deg,#ff7a6b,#ffb36b)' : null);
  };
  U.together = function (progress, show, text) {
    const el = $('together');
    el.hidden = !show;
    if (!show) return;
    $('together-ring').setAttribute('stroke-dashoffset', String(264 * (1 - progress)));
    $('together-l').textContent = text;
  };

  /* ---------- subtitles + toasts ---------- */
  const subQueue = [];
  let subTimer = null;
  U.say = function (who, text, dur) {
    subQueue.push({ who, text, dur: dur || Math.min(5, 1.6 + text.length * 0.045) });
    if (!subTimer) nextSub();
  };
  function nextSub() {
    const s = subQueue.shift();
    if (!s) { $('subtitle').hidden = true; subTimer = null; return; }
    // who: 'mohamed' | 'mariem' | a family member's name | null for narration
    const c = MM.CHARS[s.who];
    $('sub-who').textContent = c ? c.name + ':' : s.who ? s.who + ':' : '';
    $('sub-who').style.color = c ? c.color : 'var(--gold)';
    $('subtitle').classList.toggle('narr', !s.who);
    $('sub-text').textContent = s.text;
    $('subtitle').hidden = false;
    subTimer = setTimeout(nextSub, s.dur * 1000);
  }
  U.clearSubs = function () { subQueue.length = 0; clearTimeout(subTimer); subTimer = null; $('subtitle').hidden = true; };

  // Big centred caption for story moments (null hides it).
  U.cinemaText = function (title, sub) {
    const el = $('cinema');
    if (!el) return;
    if (!title) { el.classList.remove('in'); return; }
    $('cinema-t').textContent = title;
    $('cinema-s').textContent = sub || '';
    el.classList.add('in');
  };

  U.toast = function (title, text, plain, big) {
    const wrap = $('toasts');
    const el = document.createElement('div');
    el.className = 'toast' + (plain ? ' plain' : '');
    el.innerHTML = (plain ? '' : '<div class="t1">Memory found</div><div class="t2"></div>') + '<div class="t3"></div>';
    if (!plain) el.querySelector('.t2').textContent = title;
    el.querySelector('.t3').textContent = plain ? (title ? title + ' · ' : '') + text : text;
    wrap.appendChild(el);
    while (wrap.children.length > 3) wrap.removeChild(wrap.firstChild);
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 450); }, big ? 7000 : 3600);
  };

  /* ---------- pause / complete ---------- */
  U.pause = function (def, online, isHost) {
    $('pause-ch').textContent = 'Chapter ' + def.num + ' · ' + def.title;
    $('pause-note').textContent = online ? (isHost ? 'Your partner keeps playing while this menu is open.' : 'Your partner keeps playing. Only the host can restart or skip.') : 'The game is paused.';
    document.querySelectorAll('#scr-pause [data-act="restart"],#scr-pause [data-act="skip"]').forEach((b) => { b.disabled = online && !isHost; });
    U.show('pause');
  };
  U.complete = function (def, st, canNext, waitText) {
    $('done-ch').textContent = 'Chapter ' + def.num + ' complete · ' + def.year;
    $('done-title').textContent = def.outro.title;
    $('done-quote').textContent = def.outro.quote;
    $('done-hearts').textContent = st.hearts;
    $('done-mems').textContent = st.mems;
    $('done-time').textContent = MM.fmtTime(st.time);
    $('done-next').textContent = def.num >= MM.CHAPTERS.length ? 'See our ending' : 'Next chapter';
    $('done-next').disabled = !canNext;
    $('done-wait').textContent = waitText || '';
    U.show('complete');
  };

  /* ---------- online lobby ---------- */
  U.online = {
    reset() {
      $('online-start').hidden = false; $('online-lobby').hidden = true; $('online-msg').textContent = ''; $('online-msg').className = 'status';
      $('lobby-host-ctl').hidden = true; $('online-go').disabled = true;
    },
    lobby(code, isHost) {
      $('online-start').hidden = true; $('online-lobby').hidden = false;
      $('room-code').textContent = code || '-----';
      $('lobby-host-ctl').hidden = !isHost;
    },
    status(text, kind) { const el = $('net-status'); el.textContent = text; el.className = 'status' + (kind ? ' ' + kind : ''); },
    msg(text, kind) { const el = $('online-msg'); el.textContent = text; el.className = 'status' + (kind ? ' ' + kind : ''); },
    roles(local, remote, connected) {
      const r = $('lobby-roles');
      const c1 = MM.CHARS[local], c2 = MM.CHARS[remote];
      r.innerHTML = '<span class="chip" style="color:' + c1.color + '">You: ' + c1.name + '</span><span class="chip" style="color:' + c2.color + '">Partner: ' + c2.name + (connected ? '' : ' (waiting)') + '</span>';
    },
    chapters(sel) {
      const s = $('lobby-ch');
      s.innerHTML = MM.CHAPTERS.filter((c) => c.num <= MM.save.unlocked).map((c) => '<option value="' + c.num + '"' + (c.num === sel ? ' selected' : '') + '>' + c.num + '. ' + c.year + ' · ' + c.title + '</option>').join('');
    },
    canStart(on) { $('online-go').disabled = !on; },
  };

  /* ---------- gamepad menu navigation ---------- */
  U.gpIndex = -1;
  U.menuNav = function (nav) {
    if (!current) return;
    const scr = $('scr-' + current);
    if (!scr || scr.hidden) return;
    const els = Array.from(scr.querySelectorAll('.btn:not([disabled]), .ch-card:not(.locked), .who-btn, .ready, .seg button, .polaroid button')).filter((e) => e.offsetParent !== null);
    if (!els.length) return;
    let i = U.gpIndex;
    if (nav.down || nav.right) i = (i + 1) % els.length;
    if (nav.up || nav.left) i = (i - 1 + els.length) % els.length;
    if (i !== U.gpIndex) {
      document.querySelectorAll('.gp-focus').forEach((e) => e.classList.remove('gp-focus'));
      U.gpIndex = i;
      els[i].classList.add('gp-focus');
      els[i].scrollIntoView({ block: 'nearest' });
      MM.Audio.sfx('click');
    }
    if (nav.ok && U.gpIndex >= 0 && els[U.gpIndex]) { MM.Audio.init(); els[U.gpIndex].click(); }
    if (nav.back) { const b = scr.querySelector('[data-act="back"],[data-act="resume"]'); if (b) b.click(); }
  };
})(window.MM);
