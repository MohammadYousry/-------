/* Online co-op over WebRTC (PeerJS). One player hosts a room code, the other joins. No game server needed. */
(function (MM) {
  'use strict';
  const PREFIX = 'mm-love-2026-';
  const ALPHA = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

  const N = {
    peer: null, conn: null, role: null, code: null, connected: false,
    handlers: {}, lastRecv: 0, pingT: null,
  };
  MM.Net = N;

  N.on = function (type, fn) { (N.handlers[type] = N.handlers[type] || []).push(fn); };
  function fire(type, data) { (N.handlers[type] || []).forEach((fn) => fn(data)); }

  N.available = function () { return typeof window.Peer === 'function' && typeof window.RTCPeerConnection === 'function'; };
  N.active = function () { return !!N.role; };

  function newCode() { let s = ''; for (let i = 0; i < 5; i++) s += ALPHA[Math.floor(Math.random() * ALPHA.length)]; return s; }

  function errText(e) {
    const t = (e && e.type) || '';
    if (t === 'peer-unavailable') return 'No room with that code. Check the letters and try again.';
    if (t === 'browser-incompatible') return 'This browser can\'t do online play. Try Chrome, Safari or Edge.';
    if (t === 'network' || t === 'server-error' || t === 'socket-error' || t === 'socket-closed') return 'Can\'t reach the connection server. Check your internet and try again.';
    return 'Connection problem: ' + (e && e.message ? e.message : t || 'unknown');
  }

  function setupConn(conn) {
    N.conn = conn;
    conn.on('open', () => {
      N.connected = true; N.lastRecv = performance.now();
      fire('connected');
      clearInterval(N.pingT);
      N.pingT = setInterval(() => {
        N.send({ t: 'ping' });
        if (N.connected && performance.now() - N.lastRecv > 8000) { N.connected = false; fire('lost'); }
      }, 1500);
    });
    conn.on('data', (d) => {
      N.lastRecv = performance.now();
      if (!N.connected) { N.connected = true; fire('connected'); }
      if (!d || d.t === 'ping') return;
      fire('msg', d);
    });
    conn.on('close', () => { if (N.connected) { N.connected = false; fire('lost'); } });
    conn.on('error', (e) => fire('error', errText(e)));
  }

  N.host = function (onCode) {
    N.close();
    if (!N.available()) { fire('error', 'Online play isn\'t available here. Open the game from its website link to play online.'); return; }
    const code = newCode();
    let peer;
    try { peer = new window.Peer(PREFIX + code, { debug: 0 }); } catch (e) { fire('error', errText(e)); return; }
    N.peer = peer; N.role = 'host'; N.code = code;
    peer.on('open', () => onCode(code));
    peer.on('connection', (conn) => {
      if (N.conn && N.connected) { conn.on('open', () => { conn.send({ t: 'full' }); setTimeout(() => conn.close(), 300); }); return; }
      setupConn(conn);
    });
    peer.on('error', (e) => {
      if (e.type === 'unavailable-id') { N.host(onCode); return; }
      fire('error', errText(e));
    });
    peer.on('disconnected', () => { try { peer.reconnect(); } catch (e) { /* ignore */ } });
  };

  N.join = function (code) {
    N.close();
    if (!N.available()) { fire('error', 'Online play isn\'t available here. Open the game from its website link to play online.'); return; }
    code = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (code.length !== 5) { fire('error', 'Room codes have 5 letters.'); return; }
    let peer;
    try { peer = new window.Peer({ debug: 0 }); } catch (e) { fire('error', errText(e)); return; }
    N.peer = peer; N.role = 'guest'; N.code = code;
    peer.on('open', () => { setupConn(peer.connect(PREFIX + code, { reliable: true, serialization: 'json' })); });
    peer.on('error', (e) => fire('error', errText(e)));
  };

  N.send = function (obj) {
    if (!N.conn || !N.connected) return;
    try { N.conn.send(obj); } catch (e) { /* ignore */ }
  };
  // Gameplay events go through here so solo/local play can call it freely.
  N.sendEv = function (obj) { if (N.role && N.connected) N.send(Object.assign({ t: 'ev' }, obj)); };

  N.close = function () {
    clearInterval(N.pingT);
    try { if (N.conn) N.conn.close(); } catch (e) { /* ignore */ }
    try { if (N.peer) N.peer.destroy(); } catch (e) { /* ignore */ }
    N.peer = null; N.conn = null; N.role = null; N.code = null; N.connected = false;
  };

  N.inviteLink = function () {
    const u = location.href.split('#')[0].split('?')[0];
    return u + '?join=' + N.code;
  };
})(window.MM);
