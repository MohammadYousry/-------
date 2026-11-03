/* Photo mode: freeze the moment, move the camera around the two of them, pick poses, a filter and a frame,
   then keep the picture in "Our photos" and save or share it from the phone. */
(function (MM) {
  'use strict';
  const T = THREE;
  const $ = (id) => document.getElementById(id);

  const POSES = {
    mohamed: [['stand', 'Stand'], ['wave', 'Wave'], ['hug', 'Hug'], ['kiss', 'Kiss'], ['cheer', 'Cheer'], ['sit', 'Sit'], ['dance', 'Dance'], ['kneel', 'Kneel'], ['flex', 'Flex']],
    mariem: [['stand', 'Stand'], ['wave', 'Wave'], ['hug', 'Hug'], ['kiss', 'Kiss'], ['cheer', 'Cheer'], ['sit', 'Sit'], ['dance', 'Dance'], ['shy', 'Shy'], ['love', 'Love']],
  };
  // CSS preview filter and the matching per-pixel version used for the saved picture
  const FILTERS = [
    ['none', 'None', ''],
    ['warm', 'Warm', 'sepia(.15) saturate(1.18)'],
    ['golden', 'Golden hour', 'sepia(.32) saturate(1.3) brightness(1.04)'],
    ['bw', 'Black & white', 'grayscale(1) contrast(1.12)'],
    ['vintage', 'Vintage', 'sepia(.5) contrast(.9) brightness(1.06)'],
    ['dreamy', 'Dreamy', 'brightness(1.08) saturate(1.2) hue-rotate(-10deg)'],
  ];
  const FRAMES = [['none', 'None'], ['polaroid', 'Polaroid'], ['film', 'Film']];

  function pixels(ctx, w, h, kind) {
    if (kind === 'none') return;
    const img = ctx.getImageData(0, 0, w, h), d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      let r = d[i], g = d[i + 1], b = d[i + 2];
      const l = 0.299 * r + 0.587 * g + 0.114 * b;
      if (kind === 'bw') { const c = (l - 128) * 1.12 + 128; r = g = b = c; }
      else {
        const sep = kind === 'warm' ? 0.15 : kind === 'golden' ? 0.32 : kind === 'vintage' ? 0.5 : 0;
        if (sep) {
          const sr = l * 1.07 + 18, sg = l * 0.98 + 6, sb = l * 0.78;
          r = r + (sr - r) * sep; g = g + (sg - g) * sep; b = b + (sb - b) * sep;
        }
        const sat = kind === 'warm' ? 1.18 : kind === 'golden' ? 1.3 : kind === 'dreamy' ? 1.2 : 1;
        if (sat !== 1) { const m = 0.299 * r + 0.587 * g + 0.114 * b; r = m + (r - m) * sat; g = m + (g - m) * sat; b = m + (b - m) * sat; }
        if (kind === 'golden') { r *= 1.04; g *= 1.03; b *= 0.97; }
        if (kind === 'vintage') { r = r * 0.9 + 20; g = g * 0.9 + 16; b = b * 0.88 + 14; }
        if (kind === 'dreamy') { r = r * 1.06 + 10; g = g * 1.02 + 6; b = b * 1.08 + 12; }
      }
      d[i] = r < 0 ? 0 : r > 255 ? 255 : r; d[i + 1] = g < 0 ? 0 : g > 255 ? 255 : g; d[i + 2] = b < 0 ? 0 : b > 255 ? 255 : b;
    }
    ctx.putImageData(img, 0, 0);
    if (kind === 'vintage') {
      const v = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.7);
      v.addColorStop(0, 'rgba(40,20,0,0)'); v.addColorStop(1, 'rgba(40,20,0,.45)');
      ctx.fillStyle = v; ctx.fillRect(0, 0, w, h);
    }
  }

  // Share sheet on phones (Save Image), a normal download elsewhere.
  async function shareOrSave(url, name) {
    const blob = await (await fetch(url)).blob();
    try {
      const file = new File([blob], name, { type: 'image/jpeg' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: 'Mohamed & Mariem' }); return; }
    } catch (e) { if (e && e.name === 'AbortError') return; }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  }

  class Photo {
    constructor(game) {
      this.game = game; this.on = false;
      this.orbit = { yaw: 0, pitch: 0.28, dist: 5.2 };
      this.filter = 'none'; this.frame = 'polaroid';
      this.pose = { mohamed: 'stand', mariem: 'stand' };
      this.built = false;
    }

    build() {
      if (this.built) return;
      this.built = true;
      const seg = (id, list, cur, onPick) => {
        const el = $(id); el.innerHTML = '';
        list.forEach(([v, label]) => { const b = document.createElement('button'); b.dataset.v = v; b.textContent = label; if (v === cur) b.classList.add('on'); el.appendChild(b); });
        el.addEventListener('click', (e) => {
          const b = e.target.closest('button'); if (!b) return;
          el.querySelectorAll('button').forEach((q) => q.classList.toggle('on', q === b));
          onPick(b.dataset.v);
        });
      };
      seg('pose-m', POSES.mohamed, 'stand', (v) => this.setPose('mohamed', v));
      seg('pose-f', POSES.mariem, 'stand', (v) => this.setPose('mariem', v));
      seg('ph-filter', FILTERS, this.filter, (v) => { this.filter = v; this.preview(); });
      seg('ph-frame', FRAMES, this.frame, (v) => { this.frame = v; });
      // camera: drag to orbit, pinch or scroll to zoom
      const stage = $('stage');
      const pts = new Map();
      let pinch0 = 0, dist0 = 0;
      stage.addEventListener('pointerdown', (e) => { if (!this.on) return; pts.set(e.pointerId, { x: e.clientX, y: e.clientY }); stage.setPointerCapture(e.pointerId); if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch0 = Math.hypot(a.x - b.x, a.y - b.y); dist0 = this.orbit.dist; } });
      stage.addEventListener('pointermove', (e) => {
        if (!this.on || !pts.has(e.pointerId)) return;
        const p = pts.get(e.pointerId), dx = e.clientX - p.x, dy = e.clientY - p.y;
        p.x = e.clientX; p.y = e.clientY;
        if (pts.size === 2) { const [a, b] = [...pts.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y); if (pinch0) this.orbit.dist = MM.clamp(dist0 * (pinch0 / d), 1.8, 16); return; }
        this.orbit.yaw -= dx * 0.008; this.orbit.pitch = MM.clamp(this.orbit.pitch + dy * 0.006, -0.25, 1.3);
      });
      const up = (e) => { pts.delete(e.pointerId); if (pts.size < 2) pinch0 = 0; };
      stage.addEventListener('pointerup', up); stage.addEventListener('pointercancel', up);
      stage.addEventListener('wheel', (e) => { if (!this.on) return; e.preventDefault(); this.orbit.dist = MM.clamp(this.orbit.dist * (1 + Math.sign(e.deltaY) * 0.08), 1.8, 16); }, { passive: false });
      $('ph-together').addEventListener('click', () => this.together());
      $('ph-face').addEventListener('click', () => this.faceCamera());
    }

    can() { const g = this.game; return !!(g.level && g.players.length === 2 && (g.state === 'paused' || g.state === 'play')); }

    enter() {
      if (!this.can()) return;
      const g = this.game;
      this.build();
      this.prevState = g.state;
      g.state = 'photo'; this.on = true;
      g.ui.hideAll(); g.ui.hud(false); g.ui.touch(false); g.ui.divider(false); g.ui.clearSubs();
      document.body.classList.add('photo');
      $('photo-ui').hidden = false;
      const [a, b] = g.players;
      const mid = new T.Vector3((a.body.x + b.body.x) / 2, Math.max(a.body.y, b.body.y), (a.body.z + b.body.z) / 2);
      this.target = mid;
      this.orbit = { yaw: 0, pitch: 0.28, dist: Math.max(4.2, Math.hypot(a.body.x - b.body.x, a.body.z - b.body.z) + 3.4) };
      const auto = g.chapter && !g.chapter.hub ? g.chapter.title + ' · ' + g.chapter.year : g.chapter && g.chapter.hub ? 'Our home in Alexandria' : 'Mohamed & Mariem';
      if (!$('ph-caption').value || $('ph-caption').value === this.autoCap) $('ph-caption').value = auto;
      this.autoCap = auto;
      g.level.setHints(false);
      this.local = g.players.filter((p) => p.local);
      this.preview();
    }

    exit() {
      if (!this.on) return;
      const g = this.game;
      this.on = false;
      $('photo-ui').hidden = true;
      document.body.classList.remove('photo');
      $('stage').querySelector('canvas').style.filter = '';
      if (g.level) g.level.setHints(MM.save.settings.hints !== false);
      g.players.forEach((p) => { if (p.local) { p.pose = null; p.model.stop(); } });
      ['pose-m', 'pose-f'].forEach((id) => $(id).querySelectorAll('button').forEach((q) => q.classList.toggle('on', q.dataset.v === 'stand')));
      this.pose = { mohamed: 'stand', mariem: 'stand' };
      g.ui.hud(true); g.ui.divider(g.split()); g.ui.touch(MM.Input.isTouch() && g.mode !== 'local', g.mode === 'solo');
      g.state = 'paused';
      g.resume();
    }

    preview() { const f = FILTERS.find((x) => x[0] === this.filter); $('stage').querySelector('canvas').style.filter = f ? f[2] : ''; }

    setPose(who, v) {
      const p = this.game.player(who);
      if (!p || !p.local) { this.game.ui.toast('', 'Your partner poses on their own phone', true); return; }
      this.pose[who] = v;
      p.pose = null; p.model.stop();
      const q = p.partner();
      const face = () => { if (q) p.yaw = Math.atan2(q.body.x - p.body.x, q.body.z - p.body.z); };
      if (v === 'sit' || v === 'dance' || v === 'cheer') p.pose = v;
      else if (v === 'hug' || v === 'kiss') { face(); p.model.play(v, 999); }
      else if (v !== 'stand') p.model.play(v, 999);
    }

    // bring Mariem right next to Mohamed (in solo or on one screen)
    together() {
      const g = this.game, mo = g.player('mohamed'), ma = g.player('mariem');
      if (!mo.local || !ma.local) return;
      const side = new T.Vector3(Math.cos(mo.yaw), 0, -Math.sin(mo.yaw));
      ma.place(new T.Vector3(mo.body.x + side.x * 0.9, mo.body.y + 0.02, mo.body.z + side.z * 0.9));
      ma.yaw = mo.yaw;
      this.target.set((mo.body.x + ma.body.x) / 2, mo.body.y, (mo.body.z + ma.body.z) / 2);
      MM.Audio.sfx('respawn');
    }
    faceCamera() {
      const cam = this.game.cams[0];
      this.game.players.forEach((p) => { if (p.local) p.yaw = Math.atan2(cam.position.x - p.body.x, cam.position.z - p.body.z); });
    }

    update(dt) {
      const g = this.game;
      // poses hold; re-apply after anything resets them
      g.players.forEach((p) => { if (p.local) { const v = this.pose[p.who]; if (v && v !== 'stand' && !p.pose && !p.model.action) this.setPose(p.who, v); } });
      if (g.mode === 'online') g.simulate(dt, true); else g.visuals(dt);
      const o = this.orbit, c = g.cams[0], t = this.target;
      c.clearViewOffset();
      c.position.set(t.x + Math.sin(o.yaw) * Math.cos(o.pitch) * o.dist, t.y + 1.0 + Math.sin(o.pitch) * o.dist, t.z + Math.cos(o.yaw) * Math.cos(o.pitch) * o.dist);
      c.lookAt(t.x, t.y + 1.0, t.z);
    }

    // Take the picture: render once more, apply the filter, add the frame, keep it in the gallery.
    async shoot() {
      const g = this.game;
      g.render();
      const src = g.renderer.domElement;
      const max = 1600, s = Math.min(1, max / Math.max(src.width, src.height));
      const w = Math.round(src.width * s), h = Math.round(src.height * s);
      const shot = document.createElement('canvas'); shot.width = w; shot.height = h;
      const sx = shot.getContext('2d'); sx.drawImage(src, 0, 0, w, h);
      pixels(sx, w, h, this.filter);
      let out = shot;
      if (this.frame !== 'none') {
        const pad = Math.round(w * 0.04), bottom = this.frame === 'polaroid' ? Math.round(w * 0.16) : pad;
        out = document.createElement('canvas'); out.width = w + pad * 2; out.height = h + pad + bottom;
        const x = out.getContext('2d');
        x.fillStyle = this.frame === 'polaroid' ? '#fbf6f0' : '#111014'; x.fillRect(0, 0, out.width, out.height);
        x.drawImage(shot, pad, pad);
        if (this.frame === 'film') {
          x.fillStyle = '#fbf6f0';
          for (let i = pad; i < out.width - pad; i += pad * 1.2) { x.fillRect(i, pad * 0.3, pad * 0.6, pad * 0.4); x.fillRect(i, out.height - pad * 0.7, pad * 0.6, pad * 0.4); }
        } else {
          const cap = $('ph-caption').value.trim();
          x.fillStyle = '#b8325f'; x.textAlign = 'center'; x.textBaseline = 'middle';
          x.font = Math.round(w * 0.05) + 'px "Yellowtail", cursive';
          x.fillText(cap || 'Mohamed & Mariem', out.width / 2, h + pad + bottom * 0.42);
          x.fillStyle = '#8a6b88'; x.font = '700 ' + Math.round(w * 0.018) + 'px "Baloo Bhaijaan 2", sans-serif';
          x.fillText(new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase(), out.width / 2, h + pad + bottom * 0.78);
        }
      }
      const url = out.toDataURL('image/jpeg', 0.9);
      const id = 'p' + Date.now();
      await MM.media.set('gallery:' + id, url);
      MM.save.photos = MM.save.photos || [];
      MM.save.photos.unshift({ id, ch: g.chapter ? g.chapter.id : null, at: Date.now() });
      while (MM.save.photos.length > 80) { const old = MM.save.photos.pop(); MM.media.set('gallery:' + old.id, null); }
      MM.writeSave();
      MM.Extras.bump('photos');
      g.photoFlash();
      this.last = { url, id };
      const t = $('ph-last'); t.hidden = false; t.querySelector('img').src = url;
      return url;
    }
    shareLast() { if (this.last) shareOrSave(this.last.url, 'mohamed-mariem-' + this.last.id + '.jpg'); }
  }

  MM.Photo = Photo;
  MM.sharePhoto = shareOrSave;
})(window.MM);
