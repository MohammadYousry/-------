/* Boot: load progress, wait briefly for fonts, start the game, unlock audio on first interaction. */
(function (MM) {
  'use strict';
  MM.loadSave();
  MM.Audio.setVolumes(MM.save.settings.music, MM.save.settings.sfx);
  MM.Input.init();

  function fail(msg) {
    const l = document.getElementById('loading');
    l.style.fontFamily = 'var(--f-ui)'; l.style.fontSize = '18px'; l.style.padding = '24px'; l.style.textAlign = 'center';
    l.textContent = msg;
  }

  function start() {
    if (!window.THREE) { fail('The 3D engine did not load. Check that the vendor folder sits next to index.html.'); return; }
    let game;
    try { game = new MM.Game(); } catch (e) { console.error(e); fail('This browser could not start 3D graphics (WebGL). Try Chrome, Safari or Edge with hardware acceleration on.'); return; }
    MM.game = game;
    document.getElementById('loading').hidden = true;
    const done = MM.CHAPTERS.filter((c) => MM.save.chapters[c.id] && MM.save.chapters[c.id].done).length;
    document.getElementById('title-foot').textContent = done ? 'Your story so far: ' + done + ' of ' + MM.CHAPTERS.length + ' chapters.' : 'Made for Mohamed & Mariem.';
    game.boot();
  }

  const fonts = document.fonts && document.fonts.load
    ? Promise.race([Promise.all([document.fonts.load('800 40px "Baloo Bhaijaan 2"'), document.fonts.load('40px "Yellowtail"')]), new Promise((r) => setTimeout(r, 2500))])
    : Promise.resolve();
  fonts.then(start, start);

  function unlock() {
    MM.Audio.init();
    MM.media.get('song').then((b) => { if (b) { MM.Audio.setCustomSong(b); document.getElementById('clear-song').hidden = false; } });
    window.removeEventListener('pointerdown', unlock);
    window.removeEventListener('keydown', unlock);
  }
  window.addEventListener('pointerdown', unlock);
  window.addEventListener('keydown', unlock);
})(window.MM);
