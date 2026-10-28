/* Mohamed & Mariem — shared namespace, math helpers, save data, photo storage. */
window.MM = window.MM || {};
(function (MM) {
  'use strict';

  MM.VERSION = '2.0.0';
  MM.DEBUG = /[?&]debug=1/.test(location.search);

  MM.clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  MM.lerp = (a, b, t) => a + (b - a) * t;
  MM.damp = (a, b, lambda, dt) => a + (b - a) * (1 - Math.exp(-lambda * dt));
  MM.angleDamp = (a, b, lambda, dt) => {
    let d = b - a;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    return a + d * (1 - Math.exp(-lambda * dt));
  };
  MM.smooth = (t) => t * t * (3 - 2 * t);
  MM.ease = {
    outBack: (t) => { const c = 1.70158; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); },
    outCubic: (t) => 1 - Math.pow(1 - t, 3),
    inOut: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  };

  // Seeded RNG so decoration is identical on both online peers.
  MM.rng = function (seed) {
    let a = seed >>> 0;
    const f = function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    f.range = (lo, hi) => lo + f() * (hi - lo);
    f.pick = (arr) => arr[Math.floor(f() * arr.length)];
    return f;
  };

  MM.fmtTime = (s) => {
    s = Math.max(0, Math.floor(s));
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  };
  MM.fmtMoney = (n) => 'EGP ' + Math.round(n).toLocaleString('en-US');

  // Tiny event bus.
  const listeners = {};
  MM.on = (ev, fn) => { (listeners[ev] = listeners[ev] || []).push(fn); };
  MM.emit = (ev, a, b, c) => { (listeners[ev] || []).forEach((fn) => fn(a, b, c)); };

  /* ---------------- Characters ---------------- */
  // Physics numbers are tuned together with the level layouts in levels.js:
  //   Mohamed jump ≈ 1.87 m high, ≈ 3.9 m long.
  //   Mariem jump ≈ 2.0 m, double jump ≈ 3.5 m total, dash adds ≈ 2.9 m.
  //   Toss launches Mariem ≈ 4.8 m (≈ 6.3 m with her double jump).
  MM.GRAVITY = 30;
  MM.CHARS = {
    mohamed: {
      id: 'mohamed', name: 'Mohamed', tag: 'm', color: '#5aa9ff', hex: 0x5aa9ff,
      radius: 0.42, height: 1.9, speed: 5.6, accel: 46, airAccel: 22, jumpV: 10.6,
      heavy: true, canDouble: false,
      power: 'Toss · Slam',
      powerHint: 'Power near Mariem: toss · in air: slam',
    },
    mariem: {
      id: 'mariem', name: 'Mariem', tag: 'f', color: '#ff6f9c', hex: 0xff6f9c,
      radius: 0.3, height: 1.24, speed: 6.4, accel: 54, airAccel: 30, jumpV: 11.0,
      doubleJumpV: 9.6, dashSpeed: 13, dashTime: 0.22,
      heavy: false, canDouble: true,
      power: 'Kitten Dash',
      powerHint: 'Double jump · Power: dash',
    },
  };
  MM.CHAR_IDS = ['mohamed', 'mariem'];
  MM.TOSS_V = 17.5;

  /* ---------------- Save data ---------------- */
  // v2: the story grew from 9 to 20 chapters, so chapter progress starts fresh (settings and photos carry over).
  const SAVE_KEY = 'mm-love-save-v2', OLD_KEY = 'mm-love-save-v1';
  const defaultSave = () => ({
    v: 2,
    unlocked: 1,
    chapters: {},
    memories: [],
    settings: { music: 0.55, sfx: 0.8, quality: 'high', camera: 'split', outfit: { mohamed: 0, mariem: 0 } },
    lastLocal: { p1: 'mohamed', p2: 'mariem' },
  });
  MM.save = defaultSave();
  MM.loadSave = function () {
    try {
      let raw = localStorage.getItem(SAVE_KEY), old = false;
      if (!raw) { raw = localStorage.getItem(OLD_KEY); old = !!raw; }
      if (raw) {
        const d = JSON.parse(raw);
        if (old) { d.unlocked = 1; d.chapters = {}; d.v = 2; }
        const base = defaultSave();
        MM.save = Object.assign(base, d);
        MM.save.settings = Object.assign(base.settings, d.settings || {});
        MM.save.settings.outfit = Object.assign({ mohamed: 0, mariem: 0 }, (d.settings || {}).outfit || {});
        MM.save.lastLocal = Object.assign(base.lastLocal, d.lastLocal || {});
      }
    } catch (e) { /* storage blocked: play without saving */ }
    if (MM.DEBUG) MM.save.unlocked = 99;
    return MM.save;
  };
  MM.writeSave = function () {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(MM.save)); } catch (e) { /* ignore */ }
  };
  MM.resetSave = function () {
    const settings = MM.save.settings;
    MM.save = defaultSave();
    MM.save.settings = settings;
    MM.writeSave();
  };
  MM.unlockMemory = function (id) {
    if (MM.save.memories.indexOf(id) < 0) { MM.save.memories.push(id); MM.writeSave(); return true; }
    return false;
  };

  /* ---------------- Photo + song storage (IndexedDB, this device only) ---------------- */
  let dbp = null;
  function db() {
    if (dbp) return dbp;
    dbp = new Promise((res, rej) => {
      try {
        const r = indexedDB.open('mm-love-media', 1);
        r.onupgradeneeded = () => { r.result.createObjectStore('media'); };
        r.onsuccess = () => res(r.result);
        r.onerror = () => rej(r.error);
      } catch (e) { rej(e); }
    });
    return dbp;
  }
  MM.media = {
    cache: {},
    async get(key) {
      if (key in this.cache) return this.cache[key];
      try {
        const d = await db();
        const v = await new Promise((res, rej) => {
          const q = d.transaction('media').objectStore('media').get(key);
          q.onsuccess = () => res(q.result || null); q.onerror = () => rej(q.error);
        });
        this.cache[key] = v;
        return v;
      } catch (e) { return null; }
    },
    async set(key, val) {
      this.cache[key] = val;
      try {
        const d = await db();
        await new Promise((res, rej) => {
          const tx = d.transaction('media', 'readwrite');
          if (val == null) tx.objectStore('media').delete(key); else tx.objectStore('media').put(val, key);
          tx.oncomplete = res; tx.onerror = () => rej(tx.error);
        });
      } catch (e) { /* ignore */ }
    },
  };

  // Downscale a picked image file to a JPEG data URL (keeps IndexedDB small).
  MM.fileToPhoto = function (file, max) {
    max = max || 900;
    return new Promise((res, rej) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const s = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        res(c.toDataURL('image/jpeg', 0.86));
      };
      img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('Could not read that image')); };
      img.src = url;
    });
  };
})(window.MM);
