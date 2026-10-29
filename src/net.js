/* Online co-op. One player hosts a room code, the other joins. No game server needed.
   Two routes, picked automatically:
     direct: a WebRTC data channel between the two devices (PeerJS), fastest;
     relay:  game messages forwarded by the PeerJS signalling server over the same secure
             WebSocket both devices already use to find each other. It works on networks where a
             direct link can't be made (mobile data, strict routers, TURN servers down).
   The relay starts at once; the direct route takes over when it opens and hands back if it drops. */
(function (MM) {
  'use strict';
  const PREFIX = 'mm-love-2026-';
  const ALPHA = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const LOST_MS = 15000; // no message from the partner for this long = connection lost
  const RELAY_STATE_MS = 90; // state packets over the relay are throttled to ~11 per second

  // STUN finds a direct route; TURN relays media when a direct route is impossible.
  const ICE = [
    { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'] },
    { urls: 'stun:stun.cloudflare.com:3478' },
    { urls: ['turn:eu-0.turn.peerjs.com:3478', 'turn:us-0.turn.peerjs.com:3478'], username: 'peerjs', credential: 'peerjsp' },
    { urls: ['turn:openrelay.metered.ca:80', 'turn:openrelay.metered.ca:443', 'turn:openrelay.metered.ca:443?transport=tcp'], username: 'openrelayproject', credential: 'openrelayproject' },
  ];
  const PEER_OPTS = { debug: 0, config: { iceServers: ICE } };

  const N = {
    peer: null, conn: null, role: null, code: null, connected: false, partner: null, route: null,
    handlers: {}, lastRecv: 0, pingT: null, helloT: null, lastStateSent: 0,
  };
  MM.Net = N;

  N.on = function (type, fn) { (N.handlers[type] = N.handlers[type] || []).push(fn); };
  function fire(type, data) { (N.handlers[type] || []).forEach((fn) => fn(data)); }

  N.available = function () { return typeof window.Peer === 'function' && typeof window.WebSocket === 'function'; };
  N.active = function () { return !!N.role; };

  function newCode() { let s = ''; for (let i = 0; i < 5; i++) s += ALPHA[Math.floor(Math.random() * ALPHA.length)]; return s; }

  function errText(e) {
    const t = (e && e.type) || '';
    if (t === 'peer-unavailable') return 'No room with that code. Check the letters and try again.';
    if (t === 'browser-incompatible') return 'This browser can\'t do online play. Try Chrome, Safari or Edge.';
    if (t === 'network' || t === 'server-error' || t === 'socket-error' || t === 'socket-closed') return 'Can\'t reach the connection server. Check your internet and try again.';
    return 'Connection problem: ' + (e && e.message ? e.message : t || 'unknown');
  }

  /* ---------- liveness ---------- */
  function heard() {
    N.lastRecv = performance.now();
    if (!N.connected) {
      N.connected = true;
      if (N.role === 'guest' && N.peer) N.seatId = N.peer.id; // the id the host knows us by, for coming back after a drop
      fire('connected');
    }
  }
  function startPing() {
    clearInterval(N.pingT);
    N.pingT = setInterval(() => {
      if (!N.role) return;
      if (N.connected) N.send({ t: 'ping' });
      if (N.connected && performance.now() - N.lastRecv > LOST_MS) { N.connected = false; N.route = null; fire('lost'); }
    }, 1500);
  }
  function receive(d, via) {
    if (!d) return;
    heard();
    if (via === 'direct' && N.route !== 'direct') { N.route = 'direct'; fire('route', 'direct'); }
    if (d.t === 'ping') return;
    fire('msg', d);
  }

  /* ---------- relay over the signalling socket ---------- */
  // The server only forwards well-formed signalling messages, so game data rides inside an ICE-candidate envelope.
  const RELAY_ID = 'dc_mmrelay';
  const envelope = (d) => ({ connectionId: RELAY_ID, type: 'data', candidate: { candidate: '', sdpMid: '0', sdpMLineIndex: 0 }, mm: 1, d });
  function relaySend(obj) {
    const s = N.peer && N.peer.socket;
    if (!s || !N.partner) return false;
    try { s.send({ type: 'CANDIDATE', dst: N.partner, payload: envelope(obj) }); return true; } catch (e) { return false; }
  }
  function relayListen(peer) {
    const s = peer.socket;
    if (!s || s._mmRelay) return;
    s._mmRelay = true;
    s.on('message', (m) => {
      const p = m && m.payload;
      if (!p || !p.mm || N.peer !== peer) return;
      // PeerJS keeps envelopes it can't match to a connection; drop them so memory stays flat
      if (peer._lostMessages) peer._lostMessages.delete(RELAY_ID);
      const d = p.d;
      if (N.role === 'host') {
        if (d && d.t === '__hello') {
          // a new guest, or ours coming back after a drop (they tell us their old id); a third device is turned away
          if (!takeSeat(m.src, d.re)) { s.send({ type: 'CANDIDATE', dst: m.src, payload: envelope({ t: 'full' }) }); return; }
          relaySend({ t: '__welcome' });
          if (!N.route) { N.route = 'relay'; fire('route', 'relay'); }
          heard();
          return;
        }
        if (m.src !== N.partner) return;
      } else {
        if (m.src !== PREFIX + N.code) return;
        clearInterval(N.helloT); N.helloT = null;
        if (d && d.t === '__welcome') { if (!N.route) { N.route = 'relay'; fire('route', 'relay'); } heard(); return; }
      }
      receive(d, 'relay');
    });
  }

  // Host: may this device have the guest seat? Yes if it's free, if it's our guest coming back, or if the old guest went quiet.
  function takeSeat(id, re) {
    const quiet = performance.now() - N.lastRecv > 3000;
    if (N.partner && id !== N.partner && N.connected && re !== N.partner && !quiet) return false;
    if (id !== N.partner) {
      // drop whatever is left of the old guest's direct link
      if (N.conn && N.conn.peer !== id) { try { N.conn.close(); } catch (e) { /* ignore */ } N.conn = null; if (N.route === 'direct') N.route = 'relay'; }
      N.partner = id;
    }
    return true;
  }

  /* ---------- direct route ---------- */
  function setupConn(conn) {
    conn.on('open', () => {
      if (N.conn && N.conn !== conn) { try { N.conn.close(); } catch (e) { /* ignore */ } }
      N.conn = conn;
      if (N.route !== 'direct') { N.route = 'direct'; fire('route', 'direct'); }
      heard();
    });
    conn.on('data', (d) => { if (conn.peer === N.partner || N.role === 'guest') receive(d, 'direct'); });
    conn.on('close', () => { if (N.conn === conn) { N.conn = null; if (N.route === 'direct') { N.route = N.partner ? 'relay' : null; fire('route', N.route); } } });
    // a direct route that can't be negotiated is not an error any more: the relay carries the game
    conn.on('error', () => { if (N.conn === conn) N.conn = null; });
  }

  function peerErrors(peer, onFatal) {
    peer.on('error', (e) => {
      if (N.peer !== peer) return;
      const t = e && e.type;
      if (t === 'negotiation-failed' || t === 'webrtc') return; // relay keeps going
      if (t === 'peer-unavailable' && (N.connected || N.route)) return; // relay packets to a partner who stepped away
      onFatal(e);
    });
    peer.on('disconnected', () => { if (N.peer === peer) { try { peer.reconnect(); } catch (e) { /* ignore */ } } });
  }

  N.host = function (onCode) {
    N.close();
    if (!N.available()) { fire('error', 'Online play isn\'t available here. Open the game from its website link to play online.'); return; }
    const code = newCode();
    let peer;
    try { peer = new window.Peer(PREFIX + code, PEER_OPTS); } catch (e) { fire('error', errText(e)); return; }
    N.peer = peer; N.role = 'host'; N.code = code;
    peer.on('open', () => { relayListen(peer); onCode(code); });
    peer.on('connection', (conn) => {
      if (!takeSeat(conn.peer, conn.metadata && conn.metadata.re)) { conn.on('open', () => { conn.send({ t: 'full' }); setTimeout(() => conn.close(), 300); }); return; }
      setupConn(conn);
    });
    peerErrors(peer, (e) => { if (e.type === 'unavailable-id') { N.host(onCode); return; } fire('error', errText(e)); });
    startPing();
  };

  N.join = function (code, re) {
    N.close();
    if (!N.available()) { fire('error', 'Online play isn\'t available here. Open the game from its website link to play online.'); return; }
    code = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (code.length !== 5) { fire('error', 'Room codes have 5 letters.'); return; }
    let peer;
    try { peer = new window.Peer(PEER_OPTS); } catch (e) { fire('error', errText(e)); return; }
    N.peer = peer; N.role = 'guest'; N.code = code; N.partner = PREFIX + code;
    peer.on('open', () => {
      relayListen(peer);
      // say hello over the relay until the host answers, and try the direct route alongside
      relaySend({ t: '__hello', re });
      clearInterval(N.helloT);
      let tries = 0;
      N.helloT = setInterval(() => {
        if (N.connected || ++tries > 12) { clearInterval(N.helloT); N.helloT = null; if (!N.connected) fire('error', 'No room with that code. Check the letters and try again.'); return; }
        relaySend({ t: '__hello', re });
      }, 1000);
      setupConn(peer.connect(PREFIX + code, { reliable: true, serialization: 'json', metadata: { re } }));
    });
    peerErrors(peer, (e) => fire('error', errText(e)));
    startPing();
  };

  // Rejoin the same room after a drop (the guest gets a fresh id; the host takes it back).
  N.rejoin = function () { if (N.role === 'guest' && N.code) N.join(N.code, N.seatId); };

  N.send = function (obj) {
    if (!N.role) return;
    if (N.route === 'direct' && N.conn && N.conn.open) { try { N.conn.send(obj); return; } catch (e) { /* fall through to the relay */ } }
    if (!N.partner) return;
    if (obj.t === 'st') { const now = performance.now(); if (now - N.lastStateSent < RELAY_STATE_MS) return; N.lastStateSent = now; }
    relaySend(obj);
  };
  // Gameplay events go through here so solo/local play can call it freely.
  N.sendEv = function (obj) { if (N.role && N.connected) N.send(Object.assign({ t: 'ev' }, obj)); };

  N.close = function () {
    clearInterval(N.pingT); clearInterval(N.helloT); N.helloT = null;
    try { if (N.conn) N.conn.close(); } catch (e) { /* ignore */ }
    try { if (N.peer) N.peer.destroy(); } catch (e) { /* ignore */ }
    N.peer = null; N.conn = null; N.role = null; N.code = null; N.connected = false; N.partner = null; N.route = null;
  };

  N.inviteLink = function () {
    const u = location.href.split('#')[0].split('?')[0];
    return u + '?join=' + N.code;
  };
})(window.MM);
