/* Axis-separated AABB physics for characters and crates against a list of box solids. */
(function (MM) {
  'use strict';
  const EPS = 0.002, STEP = 0.42;
  const Ph = (MM.Physics = { EPS, STEP });

  // A solid: { x0,x1,y0,y1,z0,z1, active, oneWay, owner, dx,dy,dz, accDx,accDy,accDz, only, except }
  Ph.solid = function (x0, x1, y0, y1, z0, z1, o) {
    const s = { x0, x1, y0, y1, z0, z1, active: true, oneWay: false, owner: null, dx: 0, dy: 0, dz: 0, accDx: 0, accDy: 0, accDz: 0 };
    if (o) Object.assign(s, o);
    return s;
  };

  function filtered(s, b) {
    if (!s.active || s === b.self) return true;
    if (s.only && s.only !== b.who) return true;
    if (s.except && s.except === b.who) return true;
    if (s.noCrate && b.isCrate) return true;
    if (s.ignore && s.ignore === b) return true;
    return false;
  }

  function overlap(b, s) {
    return b.x + b.r > s.x0 + EPS && b.x - b.r < s.x1 - EPS &&
      b.z + b.r > s.z0 + EPS && b.z - b.r < s.z1 - EPS &&
      b.y + b.h > s.y0 + EPS && b.y < s.y1 - EPS;
  }
  Ph.overlap = overlap;

  Ph.anyOverlap = function (solids, b) {
    for (let i = 0; i < solids.length; i++) {
      const s = solids[i];
      if (filtered(s, b) || s.oneWay) continue;
      if (overlap(b, s)) return s;
    }
    return null;
  };

  function axis(solids, b, ax, d, allowStep) {
    if (d === 0) return;
    b[ax] += d;
    for (let i = 0; i < solids.length; i++) {
      const s = solids[i];
      if (filtered(s, b) || !overlap(b, s)) continue;
      if (ax === 'y') {
        if (d < 0) {
          if (s.oneWay && b.prevY < s.y1 - 0.08) continue;
          b.y = s.y1;
          if (b.vy < 0) { b.impact = Math.min(b.impact || 0, b.vy); b.vy = 0; }
          b.grounded = true; b.ground = s;
        } else {
          if (s.oneWay) continue;
          b.y = s.y0 - b.h - EPS;
          if (b.vy > 0) b.vy = 0;
          b.bonked = true;
        }
      } else {
        if (s.oneWay) continue;
        const rise = s.y1 - b.y;
        if (allowStep && rise > 0 && rise <= (b.isCrate ? 0.26 : STEP) && (b.wasGrounded || b.isCrate)) {
          const oy = b.y;
          b.y = s.y1 + EPS;
          if (!Ph.anyOverlap(solids, b)) { b.stepped = true; continue; }
          b.y = oy;
        }
        if (s.owner && s.owner.pushable && b.canPush && b.wasGrounded && rise > STEP) {
          s.owner.push(ax, d, b, solids);
          b.pushing = true;
          if (!overlap(b, s)) continue;
        }
        if (ax === 'x') b.x = d > 0 ? s.x0 - b.r - EPS : s.x1 + b.r + EPS;
        else b.z = d > 0 ? s.z0 - b.r - EPS : s.z1 + b.r + EPS;
        b.blocked = true;
      }
    }
  }
  Ph.axis = axis;

  // Integrates one fixed step. b.vx/vy/vz are already set by the controller.
  Ph.move = function (solids, b, dt) {
    b.wasGrounded = b.grounded;
    b.pushing = false; b.blocked = false; b.bonked = false; b.impact = 0; b.stepped = false;
    // ride whatever we stood on last step
    const g = b.ground;
    if (g && g.active && (g.dx || g.dy || g.dz)) {
      if (g.dy) { b.y += g.dy; if (g.dy > 0 && Ph.anyOverlap(solids, b)) b.y -= g.dy; }
      axis(solids, b, 'x', g.dx, false);
      axis(solids, b, 'z', g.dz, false);
    }
    b.grounded = false; b.ground = null;
    axis(solids, b, 'x', b.vx * dt, true);
    axis(solids, b, 'z', b.vz * dt, true);
    b.prevY = b.y;
    let dy = b.vy * dt;
    if (dy === 0) dy = -0.0001;
    axis(solids, b, 'y', dy, false);
    // stick to descending platforms / small drops when we were grounded and are not jumping
    if (!b.grounded && b.wasGrounded && b.vy <= 0 && !b.isCrate) {
      const oy = b.y, op = b.prevY;
      b.prevY = b.y; b.y -= 0.18;
      const hit = landing(solids, b);
      if (hit) { b.y = hit.y1; b.grounded = true; b.ground = hit; b.vy = 0; } else b.y = oy;
      b.prevY = op;
    }
  };

  function landing(solids, b) {
    let best = null;
    for (let i = 0; i < solids.length; i++) {
      const s = solids[i];
      if (filtered(s, b) || !overlap(b, s)) continue;
      if (s.oneWay && b.prevY < s.y1 - 0.08) continue;
      if (!best || s.y1 > best.y1) best = s;
    }
    return best;
  }

  // Highest walkable surface under (x,z) at or below y (for blob shadows).
  Ph.groundBelow = function (solids, x, z, y, r) {
    let best = -Infinity;
    for (let i = 0; i < solids.length; i++) {
      const s = solids[i];
      if (!s.active || s.noShadow) continue;
      if (x + r * 0.3 < s.x0 || x - r * 0.3 > s.x1 || z + r * 0.3 < s.z0 || z - r * 0.3 > s.z1) continue;
      if (s.y1 <= y + 0.06 && s.y1 > best) best = s.y1;
    }
    return best;
  };

  // Called at the start of each fixed step: solids flagged `acc` (crates, Mohamed's shoulders) publish
  // last step's accumulated movement so anyone riding them is carried along.
  Ph.flushDeltas = function (solids) {
    for (let i = 0; i < solids.length; i++) {
      const s = solids[i];
      if (!s.acc) continue;
      s.dx = s.accDx; s.dy = s.accDy; s.dz = s.accDz; s.accDx = s.accDy = s.accDz = 0;
    }
  };
})(window.MM);
