/* Input: two keyboard schemes, gamepads and an on-screen touch stick, merged per player slot. */
(function (MM) {
  'use strict';

  const SCHEMES = {
    p1: {
      up: ['KeyW'], down: ['KeyS'], left: ['KeyA'], right: ['KeyD'],
      jump: ['Space'], ability: ['KeyE', 'KeyF'], love: ['KeyQ'], swap: ['Tab'], call: ['KeyC'],
    },
    p2: {
      up: ['ArrowUp'], down: ['ArrowDown'], left: ['ArrowLeft'], right: ['ArrowRight'],
      jump: ['Enter', 'NumpadEnter', 'Numpad0', 'Period'], ability: ['ShiftRight', 'Numpad1', 'Slash', 'ControlRight'],
      love: ['Numpad2', 'Comma'], swap: ['Numpad3'], call: ['Numpad4'],
    },
  };
  const BUTTONS = ['jump', 'ability', 'love', 'swap', 'call', 'pause'];
  const GAME_KEYS = new Set(['Space', 'Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Slash', 'Period', 'Comma']);

  const I = {
    down: Object.create(null),
    tapped: Object.create(null),
    prev: { p1: {}, p2: {}, any: {} },
    state: { p1: blank(), p2: blank(), any: blank() },
    padsPrev: [],
    touch: { mx: 0, mz: 0, held: {}, tapped: {} },
    capture: false, // true while gameplay owns the keyboard
    mode: 'any', // 'local' assigns pads per slot
    lastDevice: 'keyboard',
  };
  MM.Input = I;

  function blank() { return { mx: 0, mz: 0, jump: false, jumpHeld: false, ability: false, abilityHeld: false, love: false, swap: false, call: false, pause: false }; }

  I.init = function () {
    window.addEventListener('keydown', (e) => {
      if (!I.down[e.code]) I.tapped[e.code] = true;
      I.down[e.code] = true;
      I.lastDevice = 'keyboard';
      if (I.capture && (GAME_KEYS.has(e.code) || e.code.startsWith('Numpad'))) {
        const tag = (e.target && e.target.tagName) || '';
        if (tag !== 'INPUT' && tag !== 'SELECT' && tag !== 'TEXTAREA') e.preventDefault();
      }
    });
    window.addEventListener('keyup', (e) => { I.down[e.code] = false; });
    window.addEventListener('blur', () => { I.down = Object.create(null); });
    initTouch();
  };

  function keyHeld(codes) {
    for (let i = 0; i < codes.length; i++) if (I.down[codes[i]] || I.tapped[codes[i]]) return true;
    return false;
  }

  function readKeys(scheme, out) {
    const s = SCHEMES[scheme];
    let mx = 0, mz = 0;
    if (keyHeld(s.left)) mx -= 1;
    if (keyHeld(s.right)) mx += 1;
    if (keyHeld(s.up)) mz -= 1;
    if (keyHeld(s.down)) mz += 1;
    out.mx += mx; out.mz += mz;
    out.jump = out.jump || keyHeld(s.jump);
    out.ability = out.ability || keyHeld(s.ability);
    out.love = out.love || keyHeld(s.love);
    out.swap = out.swap || keyHeld(s.swap);
    out.call = out.call || keyHeld(s.call);
  }

  function readPad(p, out) {
    if (!p) return;
    const b = (i) => !!(p.buttons[i] && p.buttons[i].pressed);
    let ax = p.axes[0] || 0, ay = p.axes[1] || 0;
    if (Math.hypot(ax, ay) < 0.22) { ax = 0; ay = 0; }
    if (b(14)) ax = -1; if (b(15)) ax = 1; if (b(12)) ay = -1; if (b(13)) ay = 1;
    out.mx += ax; out.mz += ay;
    out.jump = out.jump || b(0);
    out.ability = out.ability || b(2) || b(1) || b(7) || b(5);
    out.love = out.love || b(3);
    out.swap = out.swap || b(8) || b(4);
    out.pause = out.pause || b(9);
    if (ax || ay || b(0) || b(2) || b(1)) I.lastDevice = 'pad';
  }

  function readTouch(out) {
    const t = I.touch;
    out.mx += t.mx; out.mz += t.mz;
    ['jump', 'ability', 'love', 'swap'].forEach((k) => { out[k] = out[k] || !!t.held[k] || !!t.tapped[k]; });
  }

  I.pads = function () {
    let list = [];
    try { list = Array.from(navigator.getGamepads ? navigator.getGamepads() : []).filter(Boolean); } catch (e) { list = []; }
    return list;
  };

  // Call once per rendered frame before gameplay reads input.
  I.update = function () {
    const pads = I.pads();
    const raw = { p1: blank(), p2: blank(), any: blank() };
    readKeys('p1', raw.p1); readKeys('p2', raw.p2);
    readKeys('p1', raw.any); readKeys('p2', raw.any);
    if (pads.length >= 2) { readPad(pads[0], raw.p1); readPad(pads[1], raw.p2); }
    else if (pads.length === 1) readPad(pads[0], raw.p2);
    pads.forEach((p) => readPad(p, raw.any));
    readTouch(raw.any);
    const pauseKey = I.down.Escape || I.tapped.Escape || I.down.KeyP || I.tapped.KeyP;
    raw.any.pause = raw.any.pause || pauseKey;
    raw.p1.pause = raw.p1.pause || pauseKey;

    ['p1', 'p2', 'any'].forEach((slot) => {
      const r = raw[slot], prev = I.prev[slot], st = I.state[slot];
      let len = Math.hypot(r.mx, r.mz);
      if (len > 1) { r.mx /= len; r.mz /= len; }
      st.mx = r.mx; st.mz = r.mz;
      BUTTONS.forEach((k) => { st[k] = r[k] && !prev[k]; prev[k] = r[k]; });
      st.jumpHeld = r.jump; st.abilityHeld = r.ability;
    });
    I.tapped = Object.create(null);
    I.touch.tapped = {};
  };

  I.get = function (slot) { return I.state[slot] || I.state.any; };

  // Gamepad/arrow menu navigation (returns pressed edges)
  const navPrev = {};
  I.menuNav = function () {
    const pads = I.pads();
    const cur = { up: false, down: false, left: false, right: false, ok: false, back: false };
    pads.forEach((p) => {
      const b = (i) => !!(p.buttons[i] && p.buttons[i].pressed);
      const ax = p.axes[0] || 0, ay = p.axes[1] || 0;
      cur.up = cur.up || b(12) || ay < -0.6; cur.down = cur.down || b(13) || ay > 0.6;
      cur.left = cur.left || b(14) || ax < -0.6; cur.right = cur.right || b(15) || ax > 0.6;
      cur.ok = cur.ok || b(0) || b(9); cur.back = cur.back || b(1);
    });
    const out = {};
    Object.keys(cur).forEach((k) => { out[k] = cur[k] && !navPrev[k]; navPrev[k] = cur[k]; });
    return out;
  };

  I.isTouch = function () { return ('ontouchstart' in window) || navigator.maxTouchPoints > 0; };

  function initTouch() {
    const joy = document.getElementById('joy');
    if (!joy) return;
    const knob = joy.querySelector('i');
    let id = null, cx = 0, cy = 0;
    const R = 55;
    const move = (e) => {
      let dx = e.clientX - cx, dy = e.clientY - cy;
      const l = Math.hypot(dx, dy);
      if (l > R) { dx = (dx / l) * R; dy = (dy / l) * R; }
      knob.style.transform = `translate(${dx}px,${dy}px)`;
      const nx = dx / R, ny = dy / R;
      const m = Math.hypot(nx, ny) < 0.18 ? 0 : 1;
      I.touch.mx = nx * m; I.touch.mz = ny * m;
    };
    joy.addEventListener('pointerdown', (e) => {
      id = e.pointerId; const r = joy.getBoundingClientRect();
      cx = r.left + r.width / 2; cy = r.top + r.height / 2;
      joy.setPointerCapture(id); move(e); e.preventDefault();
    });
    joy.addEventListener('pointermove', (e) => { if (e.pointerId === id) move(e); });
    const end = (e) => { if (e.pointerId !== id) return; id = null; knob.style.transform = ''; I.touch.mx = 0; I.touch.mz = 0; };
    joy.addEventListener('pointerup', end); joy.addEventListener('pointercancel', end);

    document.querySelectorAll('.tbtn').forEach((b) => {
      const k = b.dataset.k;
      b.addEventListener('pointerdown', (e) => { e.preventDefault(); I.touch.held[k] = true; I.touch.tapped[k] = true; b.classList.add('down'); b.setPointerCapture(e.pointerId); MM.Audio.init(); });
      const up = () => { I.touch.held[k] = false; b.classList.remove('down'); };
      b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up);
    });
  }
})(window.MM);
