/* Procedural music + sound effects with the Web Audio API. Every chapter gets its own little song. */
(function (MM) {
  'use strict';

  const SCALES = {
    major: [0, 2, 4, 5, 7, 9, 11],
    minor: [0, 2, 3, 5, 7, 8, 10],
    hijaz: [0, 1, 4, 5, 7, 8, 10],
  };

  // Drum grids: 16 sixteenth-notes per bar.
  const DRUMS = {
    light: { kick: 'x.......x.......', snare: '....x.......x...', hat: '..x...x...x...x.' },
    pop: { kick: 'x...x...x...x...', snare: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.' },
    lofi: { kick: 'x......x..x.....', snare: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.', swing: 0.18 },
    synth: { kick: 'x...x...x...x...', snare: '....x.......x...', hat: '.x.x.x.x.x.x.x.x' },
    soft: { kick: 'x.......x.......', snare: '............x...', hat: '....x.......x...' },
    darbuka: { dum: 'x.......x.......', tek: '..x...x.....x.x.' },
    zaffa: { dum: 'x..x....x..x....', tek: '..x.x.x...x.x.xx', kick: 'x.......x.......' },
  };

  const SONGS = {
    title: { bpm: 84, root: 60, scale: 'major', prog: [0, 4, 5, 3], lead: 'bell', arp: 'up8', pad: true, bass: true, seed: 11 },
    school: { bpm: 112, root: 65, scale: 'major', prog: [0, 3, 4, 0], lead: 'pluck', arp: 'updown8', bass: true, drums: 'light', seed: 21 },
    grind: { bpm: 80, root: 57, scale: 'minor', prog: [0, 5, 2, 6], lead: 'keys', arp: 'up8', pad: true, bass: true, drums: 'lofi', seed: 31 },
    miles: { bpm: 92, root: 62, scale: 'major', prog: [5, 3, 0, 4], lead: 'bell', arp: 'up8', pad: true, bass: true, drums: 'soft', seed: 41 },
    tech: { bpm: 118, root: 64, scale: 'minor', prog: [0, 5, 6, 4], lead: 'saw', arp: 'up16', pad: true, bass: true, drums: 'synth', seed: 51 },
    nile: { bpm: 76, root: 62, scale: 'hijaz', prog: [0, 3, 0, 4], lead: 'oud', arp: 'drone', pad: true, bass: true, drums: 'darbuka', seed: 61 },
    drive0: { bpm: 120, root: 60, scale: 'major', prog: [0, 4, 5, 3], lead: 'pluck', arp: 'updown8', bass: true, drums: 'pop', seed: 71 },
    drive1: { bpm: 100, root: 62, scale: 'hijaz', prog: [0, 3, 4, 0], lead: 'oud', arp: 'drone', pad: true, bass: true, drums: 'darbuka', seed: 72 },
    drive2: { bpm: 84, root: 57, scale: 'minor', prog: [0, 5, 2, 6], lead: 'keys', arp: 'up8', pad: true, bass: true, drums: 'lofi', seed: 73 },
    home: { bpm: 96, root: 67, scale: 'major', prog: [0, 5, 3, 4], lead: 'pluck', arp: 'up8', pad: true, bass: true, drums: 'soft', seed: 81 },
    med: { bpm: 104, root: 58, scale: 'major', prog: [0, 4, 5, 3], lead: 'bell', arp: 'updown8', bass: true, drums: 'light', seed: 91 },
    forever: { bpm: 100, root: 60, scale: 'major', prog: [0, 3, 4, 0], lead: 'bell', arp: 'up8', pad: true, bass: true, drums: 'zaffa', seed: 101 },
    ending: { bpm: 72, root: 60, scale: 'major', prog: [0, 4, 5, 3], lead: 'bell', arp: 'up8', pad: true, bass: true, seed: 111 },
    physics: { bpm: 100, root: 62, scale: 'major', prog: [0, 5, 3, 4], lead: 'pluck', arp: 'updown8', pad: true, bass: true, drums: 'soft', seed: 121 },
    alex: { bpm: 108, root: 64, scale: 'major', prog: [0, 3, 4, 3], lead: 'oud', arp: 'up8', bass: true, drums: 'darbuka', seed: 131 },
    sharm: { bpm: 88, root: 59, scale: 'minor', prog: [0, 5, 2, 6], lead: 'bell', arp: 'up8', pad: true, bass: true, drums: 'soft', seed: 141 },
    cairo: { bpm: 112, root: 62, scale: 'hijaz', prog: [0, 3, 4, 0], lead: 'oud', arp: 'drone', pad: true, bass: true, drums: 'zaffa', seed: 151 },
    family: { bpm: 90, root: 65, scale: 'major', prog: [0, 4, 5, 3], lead: 'keys', arp: 'up8', pad: true, bass: true, drums: 'soft', seed: 161 },
    garden: { bpm: 84, root: 60, scale: 'major', prog: [0, 5, 3, 4], lead: 'bell', arp: 'up8', pad: true, bass: true, drums: 'darbuka', seed: 171 },
    yousr: { bpm: 64, root: 57, scale: 'minor', prog: [0, 5, 3, 6], lead: 'bell', arp: 'up8', pad: true, bass: true, seed: 181 },
    concert1: { bpm: 104, root: 57, scale: 'minor', prog: [0, 5, 6, 4], lead: 'saw', arp: 'up16', pad: true, bass: true, drums: 'pop', seed: 191 },
    concert2: { bpm: 96, root: 62, scale: 'major', prog: [0, 4, 5, 3], lead: 'oud', arp: 'updown8', pad: true, bass: true, drums: 'darbuka', seed: 201 },
    summer: { bpm: 116, root: 67, scale: 'major', prog: [0, 4, 5, 3], lead: 'pluck', arp: 'updown8', bass: true, drums: 'pop', seed: 211 },
    anniversary: { bpm: 74, root: 62, scale: 'hijaz', prog: [0, 3, 0, 4], lead: 'oud', arp: 'drone', pad: true, bass: true, drums: 'darbuka', seed: 221 },
  };

  const A = {
    ctx: null, master: null, musicBus: null, sfxBus: null, reverb: null, noiseBuf: null,
    song: null, songId: null, timer: null,
    custom: null, customUrl: null,
    vol: { music: 0.55, sfx: 0.8 },
  };
  MM.Audio = A;

  A.init = function () {
    if (A.ctx) { if (A.ctx.state === 'suspended') A.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = (A.ctx = new AC());
    A.master = ctx.createGain(); A.master.gain.value = 0.9;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14; comp.ratio.value = 3;
    A.master.connect(comp); comp.connect(ctx.destination);
    A.musicBus = ctx.createGain(); A.musicBus.connect(A.master);
    A.sfxBus = ctx.createGain(); A.sfxBus.connect(A.master);
    // Reverb from generated noise impulse.
    A.reverb = ctx.createConvolver();
    const len = ctx.sampleRate * 2.4, imp = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = imp.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
    }
    A.reverb.buffer = imp;
    const rg = ctx.createGain(); rg.gain.value = 0.28;
    A.reverb.connect(rg); rg.connect(A.master);
    // Shared white noise buffer.
    const nb = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate), nd = nb.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    A.noiseBuf = nb;
    A.applyVolumes();
    A.timer = setInterval(tick, 25);
    if (A.pendingSong) { const p = A.pendingSong; A.pendingSong = null; A.playMusic(p); }
  };

  A.setVolumes = function (music, sfx) { A.vol.music = music; A.vol.sfx = sfx; A.applyVolumes(); };
  A.applyVolumes = function () {
    if (!A.ctx) return;
    const t = A.ctx.currentTime;
    A.musicBus.gain.setTargetAtTime(A.custom ? 0 : A.vol.music * 0.7, t, 0.05);
    A.sfxBus.gain.setTargetAtTime(A.vol.sfx, t, 0.05);
    if (A.custom) A.custom.volume = MM.clamp(A.vol.music, 0, 1);
  };

  /* ---------- custom song ---------- */
  A.setCustomSong = function (blob) {
    A.clearCustomSong();
    if (!blob) return;
    A.customUrl = URL.createObjectURL(blob);
    A.custom = new Audio(A.customUrl);
    A.custom.loop = true;
    A.applyVolumes();
    if (A.ctx) A.custom.play().catch(() => {});
  };
  A.clearCustomSong = function () {
    if (A.custom) { A.custom.pause(); A.custom = null; }
    if (A.customUrl) { URL.revokeObjectURL(A.customUrl); A.customUrl = null; }
    A.applyVolumes();
  };
  A.resumeCustom = function () { if (A.custom && A.custom.paused) A.custom.play().catch(() => {}); };

  /* ---------- music ---------- */
  function mtof(m) { return 440 * Math.pow(2, (m - 69) / 12); }

  function buildSong(id) {
    const def = SONGS[id] || SONGS.title;
    const rnd = MM.rng(def.seed);
    const sc = SCALES[def.scale];
    const deg = (d) => { // scale degree (any int) -> semitone offset
      const o = Math.floor(d / 7), i = ((d % 7) + 7) % 7;
      return o * 12 + sc[i];
    };
    // Two 4-bar melodies (A, B). Each note: [step, lengthSteps, degree]
    const rhythms = [
      [[0, 4], [4, 2], [6, 2], [8, 6], [14, 2]],
      [[0, 3], [3, 3], [6, 2], [8, 4], [12, 4]],
      [[0, 6], [6, 2], [8, 2], [10, 2], [12, 4]],
      [[2, 2], [4, 4], [8, 2], [10, 6]],
      [[0, 8], [8, 4], [12, 4]],
    ];
    function melody() {
      const bars = [];
      let cur = 4 + Math.floor(rnd() * 3);
      for (let b = 0; b < 4; b++) {
        const chordDeg = def.prog[b % def.prog.length];
        const rh = rhythms[Math.floor(rnd() * rhythms.length)];
        const notes = [];
        rh.forEach(([st, len], k) => {
          if (k === 0 || st % 8 === 0) {
            const tones = [chordDeg, chordDeg + 2, chordDeg + 4, chordDeg + 7];
            let best = tones[0], bd = 99;
            tones.forEach((t) => { const dd = Math.abs(t - cur) + rnd() * 1.5; if (dd < bd) { bd = dd; best = t; } });
            cur = best;
          } else {
            cur += rnd() < 0.5 ? -1 : 1;
            if (rnd() < 0.2) cur += rnd() < 0.5 ? -1 : 1;
          }
          cur = MM.clamp(cur, 2, 11);
          notes.push([st, len, cur]);
        });
        if (b === 3) { notes[notes.length - 1][2] = chordDeg + 7 > 11 ? chordDeg : chordDeg + 7; }
        bars.push(notes);
      }
      return bars;
    }
    const mA = melody(), mB = melody();
    return { id, def, deg, mel: [mA, mA, mB, mA], drums: def.drums ? DRUMS[def.drums] : null };
  }

  A.playMusic = function (id) {
    if (!A.ctx) { A.pendingSong = id; return; }
    if (A.songId === id) return;
    A.songId = id;
    const ctx = A.ctx;
    if (A.song) {
      const old = A.song;
      old.dead = true;
      old.gain.gain.setTargetAtTime(0, ctx.currentTime, 0.25);
      setTimeout(() => { try { old.gain.disconnect(); } catch (e) {} }, 2500);
    }
    if (!id) { A.song = null; return; }
    const s = buildSong(id);
    s.gain = ctx.createGain();
    s.gain.gain.value = 0.0001;
    s.gain.gain.setTargetAtTime(1, ctx.currentTime + 0.05, 0.4);
    s.gain.connect(A.musicBus);
    s.send = ctx.createGain(); s.send.gain.value = 0.5; s.gain.connect(s.send); s.send.connect(A.reverb);
    s.step = 0;
    s.next = ctx.currentTime + 0.12;
    s.t0 = s.next;
    s.stepDur = 60 / s.def.bpm / 4;
    A.song = s;
  };
  A.stopMusic = function () { A.playMusic(null); };
  // Time origin of the current song (for rhythm games): step k plays at t0 + k * stepDur.
  A.songClock = function () { const s = A.song; return s && A.ctx ? { t0: s.t0, stepDur: s.stepDur } : null; };

  function tick() {
    const s = A.song;
    if (!s || s.dead || !A.ctx) return;
    const ctx = A.ctx;
    if (s.next < ctx.currentTime - 0.5) s.next = ctx.currentTime + 0.05; // tab was asleep
    while (s.next < ctx.currentTime + 0.15) {
      let t = s.next;
      const swing = (s.drums && s.drums.swing) || 0;
      if (s.step % 2 === 1) t += s.stepDur * swing;
      scheduleStep(s, s.step, t);
      s.step++;
      s.next += s.stepDur;
    }
  }

  function scheduleStep(s, step, t) {
    const d = s.def, st = step % 16, bar = Math.floor(step / 16);
    const chord = d.prog[bar % d.prog.length];
    const root = d.root;
    const bl = s.stepDur * 16;
    // pad
    if (d.pad && st === 0) {
      [chord, chord + 2, chord + 4].forEach((dg) => voice(s, t, root - 12 + s.deg(dg), bl * 1.02, 'pad', 0.07));
    }
    // bass
    if (d.bass) {
      const pat = d.drums === 'pop' || d.drums === 'synth' ? [0, 4, 8, 12] : [0, 8];
      if (pat.indexOf(st) >= 0) voice(s, t, root - 24 + s.deg(chord), s.stepDur * (pat.length > 2 ? 3 : 6), 'bass', 0.22);
    }
    // arpeggio
    const arpTones = [chord, chord + 2, chord + 4, chord + 7];
    if (d.arp === 'up8' && st % 2 === 0) voice(s, t, root + s.deg(arpTones[(st / 2) % 4]), s.stepDur * 2, d.lead === 'saw' ? 'saw' : 'pluck', 0.06);
    if (d.arp === 'updown8' && st % 2 === 0) { const ord = [0, 1, 2, 3, 2, 1, 0, 1]; voice(s, t, root + s.deg(arpTones[ord[st / 2]]), s.stepDur * 2, 'pluck', 0.07); }
    if (d.arp === 'up16') voice(s, t, root + s.deg(arpTones[st % 4]) + (st >= 8 ? 12 : 0), s.stepDur, 'saw', 0.045);
    if (d.arp === 'drone' && st === 0) voice(s, t, root - 12, bl, 'drone', 0.06);
    // melody (rests every 4th phrase for breathing room)
    const phrase = Math.floor(bar / 4) % 4, mb = s.mel[phrase][bar % 4];
    if (Math.floor(bar / 16) % 2 === 1 && bar % 4 === 3) { /* breath */ } else {
      mb.forEach(([ns, len, dg]) => { if (ns === st) voice(s, t, root + 12 + s.deg(dg), s.stepDur * len, d.lead, d.lead === 'saw' ? 0.06 : 0.13); });
    }
    // drums
    const dr = s.drums;
    if (dr) {
      if (dr.kick && dr.kick[st] === 'x') drum(s, t, 'kick');
      if (dr.snare && dr.snare[st] === 'x') drum(s, t, 'snare');
      if (dr.hat && dr.hat[st] === 'x') drum(s, t, 'hat');
      if (dr.dum && dr.dum[st] === 'x') drum(s, t, 'dum');
      if (dr.tek && dr.tek[st] === 'x') drum(s, t, 'tek');
    }
  }

  function env(g, t, a, peak, decay, sustainTo) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t + a);
    g.gain.exponentialRampToValueAtTime(Math.max(sustainTo || 0.0001, 0.0001), t + a + decay);
  }

  function voice(s, t, midi, dur, inst, vel) {
    const ctx = A.ctx, f = mtof(midi), out = s.gain;
    const g = ctx.createGain(); g.connect(out);
    const stop = t + Math.max(dur, 0.1) + 1.6;
    const osc = (type, freq, gainV, dest) => {
      const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(freq, t);
      if (gainV != null) { const gg = ctx.createGain(); gg.gain.value = gainV; o.connect(gg); gg.connect(dest || g); } else o.connect(dest || g);
      o.start(t); o.stop(stop); return o;
    };
    if (inst === 'bell') {
      osc('sine', f); osc('sine', f * 2.756, 0.18); osc('sine', f * 5.4, 0.04);
      env(g, t, 0.006, vel, 1.6);
    } else if (inst === 'pluck') {
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(3200, t); lp.frequency.exponentialRampToValueAtTime(600, t + 0.4); lp.connect(g);
      osc('triangle', f, null, lp); osc('sine', f * 2, 0.3, lp);
      env(g, t, 0.004, vel, 0.55);
    } else if (inst === 'keys') {
      osc('sine', f); osc('sine', f * 2, 0.25); osc('triangle', f * 0.5, 0.15);
      env(g, t, 0.01, vel * 0.9, Math.min(1.4, dur + 0.6));
    } else if (inst === 'saw') {
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 6; lp.frequency.setValueAtTime(2600, t); lp.frequency.exponentialRampToValueAtTime(500, t + 0.25); lp.connect(g);
      osc('sawtooth', f, null, lp); osc('sawtooth', f * 1.006, 0.6, lp);
      env(g, t, 0.005, vel, Math.max(0.2, dur));
    } else if (inst === 'oud') {
      const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = f * 2.2; bp.Q.value = 1.4; bp.connect(g);
      const o = osc('sawtooth', f * 0.985, null, bp); o.frequency.exponentialRampToValueAtTime(f, t + 0.035);
      osc('triangle', f, 0.5, g);
      env(g, t, 0.003, vel * 1.2, 0.5);
      // tremolo-pick ornament on long notes
      if (dur > s.stepDur * 3) { const g2 = ctx.createGain(); g2.connect(out); const o2 = ctx.createOscillator(); o2.type = 'triangle'; o2.frequency.value = f; o2.connect(g2); o2.start(t + s.stepDur); o2.stop(t + s.stepDur + 0.5); env(g2, t + s.stepDur, 0.003, vel * 0.5, 0.35); }
    } else if (inst === 'pad') {
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 950; lp.connect(g);
      osc('sawtooth', f * 0.996, 0.5, lp); osc('sawtooth', f * 1.004, 0.5, lp);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vel, t + 0.5);
      g.gain.setValueAtTime(vel, t + dur * 0.8); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.6);
    } else if (inst === 'drone') {
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 500; lp.connect(g);
      osc('sawtooth', f, 0.6, lp); osc('sine', f * 1.5, 0.4, lp);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vel, t + 0.3);
      g.gain.setValueAtTime(vel, t + dur * 0.85); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.3);
    } else if (inst === 'bass') {
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 520; lp.connect(g);
      osc('triangle', f, null, lp); osc('sine', f, 0.8, lp);
      env(g, t, 0.01, vel, Math.max(0.25, dur));
    }
  }

  function noise(t, dur, dest, filterType, freq, q) {
    const ctx = A.ctx;
    const src = ctx.createBufferSource(); src.buffer = A.noiseBuf;
    const f = ctx.createBiquadFilter(); f.type = filterType || 'highpass'; f.frequency.value = freq || 1000; if (q) f.Q.value = q;
    src.connect(f); f.connect(dest);
    src.start(t, Math.random() * 0.5); src.stop(t + dur + 0.05);
    return { src, f };
  }

  function drum(s, t, kind) {
    const ctx = A.ctx, g = ctx.createGain(); g.connect(s.gain);
    if (kind === 'kick') {
      const o = ctx.createOscillator(); o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.14);
      o.connect(g); o.start(t); o.stop(t + 0.3); env(g, t, 0.002, 0.5, 0.28);
    } else if (kind === 'snare') {
      noise(t, 0.18, g, 'bandpass', 1800, 0.8); env(g, t, 0.002, 0.18, 0.16);
    } else if (kind === 'hat') {
      noise(t, 0.05, g, 'highpass', 7000); env(g, t, 0.001, 0.07, 0.045);
    } else if (kind === 'dum') {
      const o = ctx.createOscillator(); o.frequency.setValueAtTime(190, t); o.frequency.exponentialRampToValueAtTime(80, t + 0.18);
      o.connect(g); o.start(t); o.stop(t + 0.4); env(g, t, 0.002, 0.42, 0.35);
    } else if (kind === 'tek') {
      noise(t, 0.06, g, 'bandpass', 3800, 1.5);
      const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = 900; o.connect(g); o.start(t); o.stop(t + 0.05);
      env(g, t, 0.001, 0.2, 0.06);
    }
  }

  /* ---------- sound effects ---------- */
  function sweep(type, f0, f1, dur, vol, t0) {
    const ctx = A.ctx, t = (t0 || ctx.currentTime);
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(f1, 20), t + dur);
    o.connect(g); g.connect(A.sfxBus);
    env(g, t, 0.005, vol, dur);
    o.start(t); o.stop(t + dur + 0.05);
  }
  function tone(type, f, dur, vol, t0, toReverb) {
    const ctx = A.ctx, t = t0 || ctx.currentTime;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.value = f; o.connect(g); g.connect(A.sfxBus);
    if (toReverb) g.connect(A.reverb);
    env(g, t, 0.005, vol, dur);
    o.start(t); o.stop(t + dur + 0.05);
  }
  function nz(dur, vol, type, f0, f1, q, t0) {
    const ctx = A.ctx, t = t0 || ctx.currentTime, g = ctx.createGain(); g.connect(A.sfxBus);
    const n = noise(t, dur, g, type, f0, q);
    if (f1) n.f.frequency.exponentialRampToValueAtTime(f1, t + dur);
    env(g, t, 0.01, vol, dur);
  }

  const lastPlayed = {};
  A.sfx = function (name, opt) {
    if (!A.ctx || A.vol.sfx <= 0) return;
    const now = A.ctx.currentTime;
    if (lastPlayed[name] && now - lastPlayed[name] < 0.03) return;
    lastPlayed[name] = now;
    const p = (opt && opt.pitch) || 1;
    switch (name) {
      case 'jump': sweep('sine', 320 * p, 640 * p, 0.14, 0.18); break;
      case 'jump2': sweep('sine', 560 * p, 1250 * p, 0.16, 0.16); tone('triangle', 1760, 0.12, 0.05, now + 0.06); break;
      case 'land': nz(0.08, 0.12, 'lowpass', 400); break;
      case 'heart': tone('sine', 1318, 0.25, 0.12, now, true); tone('sine', 1976, 0.35, 0.1, now + 0.07, true); break;
      case 'item': [0, 0.06, 0.12].forEach((d, i) => tone('triangle', [880, 1108, 1318][i] * p, 0.2, 0.09, now + d, true)); break;
      case 'coin': tone('square', 1568, 0.07, 0.05); tone('square', 2093, 0.18, 0.05, now + 0.06); break;
      case 'memory': [523, 659, 784, 1046].forEach((f, i) => tone('sine', f, 1.1, 0.07, now + i * 0.09, true)); break;
      case 'plate': tone('square', 780, 0.04, 0.05); tone('sine', 220, 0.12, 0.12); break;
      case 'unplate': tone('sine', 180, 0.1, 0.08); break;
      case 'door': nz(0.6, 0.14, 'lowpass', 300, 120); tone('sine', 70, 0.5, 0.1); break;
      case 'toss': nz(0.32, 0.16, 'bandpass', 400, 2400, 1.2); sweep('triangle', 200, 520, 0.18, 0.1); break;
      case 'slam': sweep('sine', 140, 38, 0.45, 0.45); nz(0.3, 0.2, 'lowpass', 900, 200); break;
      case 'break': for (let i = 0; i < 4; i++) nz(0.09, 0.14, 'bandpass', 800 + Math.random() * 1600, null, 1.5, now + i * 0.04); break;
      case 'dash': nz(0.2, 0.14, 'bandpass', 1500, 4500, 2); break;
      case 'respawn': sweep('sine', 220, 880, 0.18, 0.14); break;
      case 'love': sweep('sine', 880, 660, 0.3, 0.1); sweep('sine', 1100, 830, 0.32, 0.07, now + 0.12); break;
      case 'check': tone('sine', 988, 0.3, 0.1, now, true); tone('sine', 1318, 0.5, 0.1, now + 0.12, true); break;
      case 'complete': [523, 659, 784, 1046, 1318].forEach((f, i) => tone('triangle', f, 0.5, 0.1, now + i * 0.11, true)); break;
      case 'ready': tone('sine', 1046, 0.2, 0.12, now, true); break;
      case 'click': tone('sine', 1400, 0.04, 0.05); break;
      case 'hit': sweep('square', 300, 80, 0.3, 0.12); nz(0.2, 0.15, 'lowpass', 600); break;
      case 'note': tone('triangle', 660 * p, 0.25, 0.1, now, true); tone('sine', 1320 * p, 0.2, 0.05, now); break;
      case 'honk': tone('square', 392, 0.18, 0.06); tone('square', 494, 0.18, 0.06); break;
      case 'spring': { const o = A.ctx.createOscillator(), g = A.ctx.createGain(); o.frequency.setValueAtTime(180, now); o.frequency.exponentialRampToValueAtTime(760, now + 0.25); o.connect(g); g.connect(A.sfxBus); env(g, now, 0.005, 0.16, 0.3); o.start(now); o.stop(now + 0.35); break; }
      case 'pop': nz(0.12, 0.18, 'bandpass', 1200, 300, 0.9); break;
      case 'firework': nz(0.5, 0.12, 'highpass', 2000, 500); for (let i = 0; i < 6; i++) nz(0.03, 0.07, 'highpass', 5000, null, null, now + 0.1 + Math.random() * 0.4); break;
      case 'switch': tone('square', 1200, 0.03, 0.05); tone('sine', 600, 0.08, 0.06, now + 0.03); break;
      case 'fail': sweep('triangle', 500, 160, 0.5, 0.12); break;
      case 'shutter': nz(0.05, 0.25, 'highpass', 3000); tone('square', 1800, 0.03, 0.05, now + 0.06); break;
      case 'splash': nz(0.4, 0.2, 'bandpass', 900, 300, 0.8); break;
      default: break;
    }
  };
})(window.MM);
