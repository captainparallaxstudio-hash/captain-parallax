// src/Root.tsx — Remotion v4.0.234. 1080x1920 @ 30fps, 45s (1350 frames).
// Your src/index.ts must call: registerRoot(RemotionRoot)
/* eslint-disable */
import React from 'react';
import {AbsoluteFill, Composition, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

const FPS = 30;
const B = [0, 7, 15, 23, 32, 39, 45]; // scene boundaries in seconds (monster only exists in scene 5+)

const cl = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lp = (a: number, b: number, t: number) => a + (b - a) * t;
const ez = (t: number) => t * t * (3 - 2 * t);
const fk = (t: number, s = 1) => {
  const a = Math.sin(t * 23 * s) * Math.sin(t * 57 * s + 1.3);
  return (a > 0.88 ? 0.45 : a < -0.9 ? 0.7 : 1) * (0.93 + 0.07 * Math.sin(t * 9));
};

const SUB: string[][] = [
  ['OVERNIGHT SHIFT — 11:55 PM', '‘FOLLOW ALL 4 RULES ON THIS CARD.’'],
  ['LEO SKIMMED THE FRONT...', 'HE NEVER FLIPPED IT OVER.'],
  ['HE TOSSED THE CARD ASIDE.', 'RULE #4 STAYED HIDDEN.'],
  ['HIS BEST FRIEND MARCUS KNOCKED:', '‘MY CAR DIED — LET ME IN!’'],
  ['LEO UNLOCKED THE DOOR...', 'AND GLANCED DOWN AT THE FLOOR.'],
  ['THE THING SMILING AT HIM...', 'WAS NOT HIS FRIEND.'],
];

/* ---------- rain patterns (deterministic, built once) ---------- */
const mkRain = (n: number, len: number, sw: number, op: number, seed: number, col: string) => {
  let s = seed;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  let o = '';
  for (let i = 0; i < n; i++) {
    const x = r() * 60, y = r() * 120, l = len * (0.6 + r() * 0.8), a = op * (0.4 + r() * 0.6);
    for (const dx of [-60, 0, 60])
      for (const dy of [-120, 0, 120])
        o += `<line x1="${x + dx}" y1="${y + dy}" x2="${x + dx - l * 0.3}" y2="${y + dy + l}" stroke="${col}" stroke-width="${sw}" stroke-linecap="round" opacity="${a}"/>`;
  }
  return o;
};
const RAIN1 = mkRain(9, 34, 1, 0.75, 7, '#bcd8ff');
const RAIN2 = mkRain(6, 60, 1.6, 0.9, 11, '#d8e8ff');

/* ---------- shared SVG defs (frame-driven: rain scroll + grain seed) ---------- */
const defs = (t: number) => `
<linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d171c"/><stop offset="1" stop-color="#05090c"/></linearGradient>
<linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#16222a"/><stop offset="1" stop-color="#040608"/></linearGradient>
<linearGradient id="cone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e4fff0" stop-opacity=".6"/><stop offset="1" stop-color="#9fe8c8" stop-opacity="0"/></linearGradient>
<linearGradient id="coneR" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff3040" stop-opacity=".7"/><stop offset="1" stop-color="#ff1020" stop-opacity="0"/></linearGradient>
<linearGradient id="body" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#06070a"/><stop offset=".6" stop-color="#10141b"/><stop offset="1" stop-color="#1b222c"/></linearGradient>
<linearGradient id="card" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe65c"/><stop offset="1" stop-color="#dba00f"/></linearGradient>
<linearGradient id="glass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b3354"/><stop offset="1" stop-color="#060b16"/></linearGradient>
<radialGradient id="glow"><stop offset="0" stop-color="#ffd84a" stop-opacity=".8"/><stop offset="1" stop-color="#ffd84a" stop-opacity="0"/></radialGradient>
<radialGradient id="vig" cx=".5" cy=".5" r=".75"><stop offset=".45" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".88"/></radialGradient>
<filter id="b4" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="4"/></filter>
<filter id="b10" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="10"/></filter>
<filter id="b1" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.4"/></filter>
<filter id="gl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="${Math.floor(t * 12) % 50}"/><feColorMatrix type="saturate" values="0"/></filter>
<pattern id="rain" width="60" height="120" patternUnits="userSpaceOnUse" patternTransform="translate(0 ${(t * 520) % 120})">${RAIN1}</pattern>
<pattern id="rain2" width="60" height="120" patternUnits="userSpaceOnUse" patternTransform="translate(0 ${(t * 300) % 120})">${RAIN2}</pattern>
<clipPath id="cc"><rect x="-125" y="-215" width="250" height="430" rx="16"/></clipPath>
<clipPath id="gc"><rect x="70" y="108" width="220" height="436"/></clipPath>`;

/* ---------- drawing helpers (return SVG markup) ---------- */
const SK = '#2a1c14';
const eye = (x: number, y: number, r: number, c: string) =>
  `<circle cx="${x}" cy="${y}" r="${r * 3}" fill="${c}" opacity=".45" filter="url(#b4)"/><circle cx="${x}" cy="${y}" r="${r}" fill="#fff"/>`;

function loc(wx: number, wy: number, x: number, y: number, sx: number, sy: number, rot: number): [number, number] {
  const a = (-rot * Math.PI) / 180, dx = wx - x, dy = wy - y;
  return [(dx * Math.cos(a) - dy * Math.sin(a)) / sx, (dx * Math.sin(a) + dy * Math.cos(a)) / sy];
}
const limb = (x0: number, y0: number, h: number[], c: string, hc: string) =>
  `<path d="M${x0} ${y0}Q${(x0 + h[0]) / 2} ${Math.max(y0, h[1]) + 14} ${h[0]} ${h[1]}" stroke="${c}" stroke-width="10" stroke-linecap="round" fill="none"/><circle cx="${h[0]}" cy="${h[1]}" r="5.5" fill="${hc}"/>`;

/* feet at (x,y); hands=[leftWorld|null,rightWorld|null] in world coords; arms are drawn in body space so they stay attached */
function person(x: number, y: number, s: number, o: any = {}) {
  const hd = o.hood !== false, sx = o.sx || s, sy = o.sy || s, rot = o.rot || 0, lk = (o.look || 0) * 3;
  const ac = o.arm || '#10141b', hc = o.hand || SK, H = o.hands || [];
  let L: number[] = H[0] ? loc(H[0][0], H[0][1], x, y, sx, sy, rot) : [-31, -62];
  let R: number[] = H[1] ? loc(H[1][0], H[1][1], x, y, sx, sy, rot) : [31, -62];
  if (o.long) { L = [-40, -8]; R = [40, -8]; }
  let g = `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${sx} ${sy})"><ellipse cx="0" cy="2" rx="40" ry="7" fill="#000" opacity=".55"/>`;
  g += `<path d="M-27 0L-23 -118Q-22 -152 -8 -160L8 -160Q22 -152 23 -118L27 0Z" fill="${o.body || 'url(#body)'}"/><path d="M0 -70V0" stroke="#000" stroke-width="2" opacity=".6"/>`;
  g += limb(-22, -150, L, ac, hc) + limb(22, -150, R, ac, hc);
  g += hd
    ? `<path d="M-23 -166Q-24 -206 0 -207Q24 -206 23 -166Q15 -154 0 -157Q-15 -154 -23 -166Z" fill="#0c0e13"/><ellipse cx="${1 + lk}" cy="-176" rx="12" ry="14" fill="#030304"/>`
    : `<rect x="-6" y="-166" width="12" height="12" fill="${o.skin || '#1a1511'}"/><circle cx="0" cy="-177" r="17" fill="${o.skin || '#1a1511'}"/><path d="M-17 -182Q-14 -199 0 -197Q16 -199 17 -182Q8 -190 0 -189Q-8 -190 -17 -182Z" fill="#050505"/>`;
  g += `<path d="M23 -118Q22 -152 8 -160M17 -180Q18 -194 8 -199" fill="none" stroke="${o.rim || '#3d6070'}" stroke-width="2" opacity=".85"/>`;
  if (!o.noeye) g += eye(-4 + lk, -176, o.er || 1.7, o.eye || '#8fe6ff') + eye(7 + lk, -176, o.er || 1.7, o.eye || '#8fe6ff');
  return g + '</g>';
}

function mface(k: number, op = 1) {
  let tk = '';
  for (let i = 1; i < 10; i++) {
    const u = i / 10, x = 44 * (2 * u - 1), y = (1 - u) ** 2 * 16 + 2 * (1 - u) * u * 52 + u * u * 16;
    tk += `M${x} ${y}v7`;
  }
  const sm = 'M-44 16Q0 52 44 16';
  return `<g transform="scale(${k})" opacity="${op}"><path d="${sm}" stroke="#fff" stroke-width="7" fill="none" opacity=".6" filter="url(#b4)"/><path d="${sm}" stroke="#fff" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="${tk}" stroke="#fff" stroke-width="1.4"/><ellipse cx="-16" cy="0" rx="9" ry="4" transform="rotate(14 -16 0)" fill="#fff" filter="url(#b4)"/><ellipse cx="16" cy="0" rx="9" ry="4" transform="rotate(-14 16 0)" fill="#fff" filter="url(#b4)"/><ellipse cx="-16" cy="0" rx="7" ry="3.2" transform="rotate(14 -16 0)" fill="#fff"/><ellipse cx="16" cy="0" rx="7" ry="3.2" transform="rotate(-14 16 0)" fill="#fff"/></g>`;
}

/* the shadow-mimic: only ever called from scene 5 */
function mimic(x: number, y: number, s: number, lt: number, op = 1) {
  const sk = Math.sin(lt * 3) * 3, sx = s * 0.85, sy = s * 1.4;
  return `<g opacity="${op}"><g transform="translate(${x} ${y}) skewX(${sk}) translate(${-x} ${-y})">` +
    person(x, y, s, {hood: false, skin: '#000', body: '#000', arm: '#000', hand: '#000', noeye: 1, sx, sy, rim: '#b8c0cc', long: 1}) +
    `<g transform="translate(${x} ${y}) scale(${sx} ${sy}) translate(0 -177)">${mface(0.5)}</g></g></g>`;
}

function lights(t: number, r: number) {
  let o = '';
  for (const lx of [70, 180, 290]) {
    const f = fk(t + lx, 1 + lx / 300) * 0.55;
    o += `<polygon points="${lx - 14},56 ${lx + 14},56 ${lx + 115},480 ${lx - 115},480" fill="url(#cone)" opacity="${f * (1 - r)}"/><polygon points="${lx - 14},56 ${lx + 14},56 ${lx + 115},480 ${lx - 115},480" fill="url(#coneR)" opacity="${f * r * (0.8 + 0.2 * Math.sin(t * 10))}"/><rect x="${lx - 24}" y="50" width="48" height="7" rx="3" fill="${r > 0.5 ? '#ff6070' : '#effff4'}" opacity="${fk(t + lx, 1 + lx / 300)}" filter="url(#gl)"/>`;
  }
  return o;
}

function room(t: number, r: number, nl?: number) {
  const px = Math.sin(t * 0.3) * 3;
  let o = `<rect width="360" height="640" fill="url(#wall)"/>`;
  o += `<text x="${22 + px * 0.5}" y="86" font-family="Arial Black,sans-serif" font-size="19" fill="#4de2ff" opacity="${0.85 * fk(t, 0.5)}" filter="url(#gl)">LAUNDRY 24H</text>`;
  o += `<rect x="230" y="110" width="105" height="90" fill="url(#glass)" stroke="#26343a" stroke-width="3"/><rect x="230" y="110" width="105" height="90" fill="url(#rain)" opacity=".4"/>`;
  for (let i = 0; i < 7; i++) {
    const x = -14 + i * 62 + px * 1.5;
    o += `<rect x="${x}" y="300" width="56" height="140" rx="4" fill="#15232a"/><rect x="${x}" y="300" width="56" height="14" fill="#1f333b"/><circle cx="${x + 28}" cy="372" r="21" fill="#070c0f" stroke="#3a5560" stroke-width="3"/><circle cx="${x + 28}" cy="372" r="13" fill="#0c171c" opacity=".9"/><rect x="${x + 6}" y="305" width="10" height="4" fill="#4de2ff" opacity=".6"/>`;
    o += `<rect x="${x + 2}" y="226" width="52" height="66" rx="4" fill="#111d23"/><circle cx="${x + 28}" cy="262" r="17" fill="#060a0c" stroke="#2c434c" stroke-width="2"/>`;
  }
  o += `<rect y="440" width="360" height="200" fill="url(#floor)"/>`;
  for (let i = 0; i < 8; i++) o += `<path d="M${i * 52 - 20} 640L${180 + (i - 3.5) * 20} 440" stroke="#1d2e35" stroke-width="1" opacity=".6"/>`;
  for (const y of [470, 510, 570]) o += `<path d="M0 ${y}H360" stroke="#1d2e35" stroke-width="1" opacity=".5"/>`;
  return o + (nl ? '' : lights(t, r));
}

const rect = (c: string, op: number) =>
  `<rect width="360" height="640" fill="${c}" opacity="${op}" style="mix-blend-mode:multiply"/>`;

function flat(x: number, y: number, rot: number, k = 1, t = 0) {
  return `<ellipse cx="${x}" cy="${y + 4}" rx="${44 * k}" ry="${11 * k}" fill="#000" opacity=".6"/><ellipse cx="${x}" cy="${y}" rx="${50 * k}" ry="${12 * k}" fill="#ffd23a" opacity="${0.1 + 0.06 * Math.sin(t * 5)}" filter="url(#b4)"/><g transform="translate(${x} ${y}) rotate(${rot}) scale(${k} ${0.42 * k})"><rect x="-24" y="-33" width="48" height="66" rx="4" fill="#a37a0a" stroke="#e8c24a" stroke-width="1.5"/><text transform="scale(-1 1)" y="9" text-anchor="middle" font-family="Arial Black" font-size="22" fill="#7a0010" opacity=".3">RULE 4</text></g>`;
}

type Ink = {t: string; x?: number; y: number; s: number; c?: string};
function ink(lt: number, start: number, items: Ink[], cps: number) {
  let n = Math.floor((lt - start) * cps), o = '';
  for (const it of items) {
    if (n <= 0) break;
    const s = it.t.slice(0, n);
    n -= it.t.length;
    o += `<text x="${it.x ?? -104}" y="${it.y}" font-family="Courier New,monospace" font-weight="700" font-size="${it.s}" fill="${it.c || '#2b1e00'}" xml:space="preserve">${s}</text>`;
  }
  return o;
}

function bigCard(lt: number) {
  const gl = Math.sin(lt * 0.8) * 160;
  return `<rect x="-125" y="-215" width="250" height="430" rx="16" fill="#000" opacity=".5" transform="translate(8 14)" filter="url(#b10)"/><rect x="-125" y="-215" width="250" height="430" rx="16" fill="url(#card)"/><rect x="-124" y="-214" width="248" height="428" rx="16" fill="none" stroke="#fff8c8" stroke-width="3" opacity=".7"/><rect x="-112" y="-202" width="224" height="404" rx="9" fill="none" stroke="#6a4d00" stroke-width="1.5" opacity=".5"/><g clip-path="url(#cc)"><polygon points="${gl - 30},-215 ${gl + 20},-215 ${gl - 60},215 ${gl - 110},215" fill="#fff" opacity=".22"/></g>`;
}

const clk = (t: number, txt: string, ap: string) =>
  `<rect x="96" y="96" width="168" height="66" rx="6" fill="#100505" stroke="#401515"/><text x="170" y="144" text-anchor="middle" font-family="Courier New" font-weight="700" font-size="42" fill="#ff2d20" filter="url(#gl)" opacity="${fk(t, 0.6)}">${txt}</text><text x="238" y="144" font-family="Courier New" font-weight="700" font-size="14" fill="#ff2d20">${ap}</text>`;
const cardG = (x: number, y: number, rot: number) =>
  `<g transform="translate(${x} ${y}) rotate(${rot})"><rect x="-17" y="-24" width="34" height="48" rx="3" fill="url(#card)" stroke="#fff7b0" stroke-width="1.2"/><path d="M-11 -14h22M-11 -6h22M-11 2h16" stroke="#3a2a00" stroke-width="2"/></g>`;

/* ---------- scenes: each draws ONLY its own cast ---------- */
function s1(lt: number, t: number) {
  let o = room(t, 0);
  o += `<rect x="24" y="112" width="86" height="36" rx="4" fill="#120606" stroke="#3a1a1a"/><text x="52" y="138" text-anchor="middle" font-family="Courier New" font-weight="700" font-size="21" fill="#ff3b30" filter="url(#gl)">11:55</text><text x="92" y="138" text-anchor="middle" font-family="Courier New" font-weight="700" font-size="11" fill="#ff3b30">PM</text>`;
  const p = ez(cl((lt - 2) / 2.4)), cx = lp(165, 195, p), cy = 398 - Math.sin(p * Math.PI) * 12 - ez(cl((lt - 5) / 1.5)) * 30;
  const e = 1 - ez(cl((lt - 4.5) / 1)), rr = ez(cl((lt - 2.6) / 1.6));
  const mh = [lp(128, cx - 8, e), lp(415, cy + 4, e)], lh = [lp(222, cx + 8, rr), lp(425, cy + 6, rr)];
  o += `<circle cx="${cx}" cy="${cy}" r="70" fill="url(#glow)" opacity="${0.7 * fk(t, 0.3)}"/>`;
  o += person(100, 550, 1.45, {hood: false, body: '#2a323b', arm: '#2a323b', rot: 3, look: 1, eye: '#8a7a50', er: 1.1, rim: '#4a5a66', hands: [null, mh]});
  o += person(255, 550, 1.45, {look: -1, rim: '#46687a', hands: [lh, null]});
  return o + cardG(cx, cy, -10 + p * 10);
}

function s2(lt: number, t: number) {
  const z = 1 + lt * 0.012;
  let o = `<rect width="360" height="640" fill="#0b0805"/><circle cx="180" cy="305" r="300" fill="url(#glow)" opacity="${0.55 * fk(t, 0.4)}"/><g transform="translate(180 305) scale(${z}) rotate(-2.5)">` + bigCard(lt);
  o += `<rect x="-112" y="-200" width="224" height="38" fill="#19130a"/><text y="-175" text-anchor="middle" font-family="Courier New" font-weight="700" font-size="17" fill="#ffd93d">NIGHT SHIFT RULES</text><text y="-150" text-anchor="middle" font-family="Courier New" font-size="9" fill="#6a4d00">STORE #0417 · OPEN 24 HRS</text>`;
  const L = [['1. Ignore anyone in', '   a yellow coat.'], ['2. Lock the back door', '   at midnight.'], ['3. Never look inside', '   Dryer #4.']];
  L.forEach((l, k) => {
    o += ink(lt, 1 + k * 1.8, [{t: l[0], y: -90 + k * 90, s: 17}, {t: l[1], y: -66 + k * 90, s: 17}], 20);
  });
  return o + `<text y="188" text-anchor="middle" font-family="Courier New" font-size="8" fill="#6a4d00">LAMINATED · DO NOT REMOVE</text></g>`;
}

function s3(lt: number, t: number) {
  const k = 1 + lt * 0.008;
  let o = `<g transform="translate(180 330) scale(${k}) translate(-180 -330)">` + room(t, 0) + clk(t, `02${Math.floor(t * 2) % 2 ? ':' : ' '}15`, 'AM');
  const q = cl((lt - 1.25) / 1.35), w1 = ez(cl((lt - 0.6) / 0.4)), w2 = ez(cl((lt - 1) / 0.25)), w3 = ez(cl((lt - 1.25) / 1.2));
  const h = lt < 0.6 ? [112, 395] : lt < 1 ? [lp(112, 100, w1), lp(395, 325, w1)] : lt < 1.25 ? [lp(100, 140, w2), lp(325, 395, w2)] : [lp(140, 108, w3), lp(395, 420, w3)];
  o += person(60, 550, 1.4, {look: 1, hands: [null, h]});
  if (lt < 1.25) o += cardG(h[0] + 10, h[1] - 6, -12);
  else if (q < 1) {
    const x = lp(140, 150, q) + Math.sin(q * Math.PI) * 40, y = lp(395, 525, q) - Math.sin(q * Math.PI) * 60, sc = Math.cos(q * Math.PI * 6);
    o += `<g transform="translate(${x} ${y}) rotate(${q * 200}) scale(${Math.abs(sc) || 0.02} 1)"><rect x="-17" y="-24" width="34" height="48" rx="3" fill="${sc > 0 ? 'url(#card)' : '#a37a0a'}"/></g>`;
  } else o += flat(150, 525, 12, 1.1, t);
  return o + '</g>';
}

function door(t: number, a: number, inner: string, sign: number) {
  const fx = 290 - 220 * Math.cos(a * 1.35), dy = 55 * Math.sin(a * 1.35);
  let o = `<rect x="58" y="96" width="244" height="460" fill="#0a0f12" stroke="#1d2a30" stroke-width="8"/><rect x="70" y="108" width="220" height="436" fill="url(#glass)"/><g clip-path="url(#gc)"><circle cx="250" cy="190" r="40" fill="#ffd9a0" opacity=".35" filter="url(#b10)"/><circle cx="105" cy="230" r="26" fill="#8fd0ff" opacity=".3" filter="url(#b10)"/><rect x="70" y="480" width="220" height="64" fill="#2a4a6a" opacity=".35"/></g>` + inner;
  o += `<rect x="70" y="108" width="220" height="436" fill="url(#rain2)" opacity="${0.55 + a * 0.2}"/>`;
  o += `<polygon points="290,108 ${fx},${108 - dy} ${fx},${544 + dy} 290,544" fill="url(#glass)" stroke="#2a3a44" stroke-width="5" opacity="${lp(0.3, 0.9, a)}"/>`;
  if (sign) o += `<rect x="150" y="116" width="60" height="22" rx="3" fill="#031a0f" stroke="#3dff9c" opacity=".9"/><text x="180" y="132" text-anchor="middle" font-family="Arial Black" font-size="11" fill="#3dff9c" filter="url(#gl)" opacity="${fk(t, 0.8)}">OPEN</text>`;
  return o + `<rect x="80" y="322" width="22" height="34" rx="4" fill="#8a9096" stroke="#c9ced3"/><circle cx="91" cy="339" r="6" fill="#4a4f54"/>`;
}

/* Marcus is a completely normal person here — no monster */
function s4(lt: number, t: number) {
  const k = 1 + lt * 0.006, w = lt * 7, kn = Math.sin(lt * 14), hr = ez(cl((lt - 5.5) / 1.5));
  let o = `<g transform="translate(180 320) scale(${k}) translate(-180 -320)">` + room(t, 0, 1);
  let m = `<g filter="url(#b1)">` + person(185, 540, 1.2, {hood: false, body: '#1b2430', arm: '#1b2430', skin: '#2a1e17', eye: '#dfeeff', er: 1.3, rim: '#7fb2e0', hands: [[132 + 5 * kn, 338], [240 + Math.sin(w) * 14, 298 - Math.abs(Math.sin(w)) * 20]]}) + `</g>`;
  const rp = (lt * 3) % 1;
  m += `<circle cx="132" cy="338" r="${rp * 34}" fill="none" stroke="#cfe6ff" stroke-width="1.5" opacity="${(1 - rp) * 0.7}"/>`;
  for (let i = 0; i < 14; i++) {
    const x = 80 + ((i * 47) % 200), y = ((lt * (22 + i * 3) + i * 61) % 430) + 108;
    m += `<path d="M${x} ${y}v${8 + (i % 4) * 3}" stroke="#fff" stroke-width="2.4" opacity=".28" stroke-linecap="round"/><circle cx="${x}" cy="${y}" r="2.4" fill="#fff" opacity=".4"/>`;
  }
  o += door(t, 0, m, 1);
  o += person(40, 550, 1.4, {look: 1, hands: [null, [lp(83, 96, hr), lp(463, 342, hr)]]});
  return o + lights(t, 0) + `</g><rect width="360" height="640" fill="url(#rain)" opacity=".5"/>`;
}

/* Door opens, lights go crimson, Leo recoils, Marcus transforms into the mimic */
function s5(lt: number, t: number) {
  const a = ez(cl((lt - 0.9) / 1.4)), r = ez(cl((lt - 1) / 1.4)), tr = cl((lt - 2.5) / 1.2), w = ez(cl((lt - 3) / 2.3)), u = ez(cl((lt - 2.6) / 0.9));
  const zk = 1 + ez(cl((lt - 5.2) / 1.6)) * 0.6, sh = lt > 2.6 && lt < 4 ? Math.sin(t * 40) * 1.5 : 0;
  const ms = lp(1.2, 1.45, w), mx = lp(185, 222, w), my = lp(540, 553, w);
  let o = `<g transform="translate(${sh} 0) translate(150 525) scale(${zk}) translate(-150 -525)">` + room(t, r, 1);
  let m = '';
  if (tr < 1) m += `<g ${a < 0.3 ? 'filter="url(#b1)"' : ''}>` + person(mx, my, ms, {hood: false, body: '#1b2430', arm: '#1b2430', skin: '#2a1e17', eye: '#dfeeff', er: 1.3, rim: '#7fb2e0'}) + `</g>`;
  if (tr > 0) m += mimic(mx, my, ms * 1.1, lt, tr < 1 ? tr * (Math.sin(t * 55) > -0.3 ? 1 : 0.3) : 1);
  o += door(t, a, m, 0);
  o += flat(150, 525, 12, 1.1, t);
  const lx = lp(52, 26, u), ly = 550, lr = -u * 14, ec = r > 0.5 ? '#ffb0b0' : '#8fe6ff';
  o += `<circle cx="91" cy="339" r="${14 * Math.max(0, 1 - Math.abs(lt - 0.85) * 8)}" fill="#fff" opacity=".8"/>`;
  o += person(lx, ly, 1.4, {look: 1, rot: lr, er: lp(1.7, 2.8, u), eye: ec, rim: '#ff5060', hands: [[lp(lx - 43, lx - 26, u), lp(463, 318, u)], [lp(96, lx + 30, u), lp(340, 300, u)]]});
  o += lights(t, r) + `</g>` + rect('#e0001a', r * 0.4 * (0.85 + 0.15 * Math.sin(t * 12))) + `<rect width="360" height="640" fill="#ff0020" opacity="${r * 0.08 * Math.sin(t * 14) ** 2}"/>`;
  return o;
}

function s6(lt: number, t: number) {
  const f = fk(t, 1.2);
  let o = `<rect width="360" height="640" fill="#1a0306"/><circle cx="180" cy="300" r="320" fill="#ff1a2a" opacity="${0.35 * f}" filter="url(#b10)"/><g transform="translate(180 300) scale(${1 + lt * 0.012})">` + bigCard(lt);
  o += `<rect x="-112" y="-200" width="224" height="30" fill="#1a0505"/><text y="-179" text-anchor="middle" font-family="Courier New" font-weight="700" font-size="15" fill="#ff5a5a">NIGHT SHIFT RULES · BACK</text>`;
  o += ink(lt, 0.5, [
    {t: 'RULE 4:', y: -120, s: 34, c: '#8a0012'},
    {t: 'NEVER OPEN THE', y: -72, s: 18},
    {t: 'DOOR FOR MARCUS.', y: -48, s: 18},
    {t: 'HE DIED IN A', y: 10, s: 24, c: '#8a0012'},
    {t: 'CRASH 3 YEARS', y: 42, s: 24, c: '#8a0012'},
    {t: 'AGO.', y: 74, s: 24, c: '#8a0012'},
  ], 16);
  o += `</g>` + rect('#ff1a2a', 0.45 * f);
  if ((lt > 0.3 && lt < 0.5) || (lt > 4.1 && lt < 4.2)) o += `<rect width="360" height="640" fill="#fff" opacity=".15"/>`;
  return o;
}

const SCENES: ((lt: number, t: number) => string)[] = [s1, s2, s3, s4, s5, s6];

/* ---------- scene view: reads the LOCAL frame inside its <Sequence> ---------- */
const SceneView: React.FC<{idx: number}> = ({idx}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const len = (B[idx + 1] - B[idx]) * fps;
  const lt = f / fps;
  const t = B[idx] + lt; // global seconds
  const fade = interpolate(f, [0, 12, len - 12, len], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const html = SCENES[idx](lt, t);

  const l1 = interpolate(f, [9, 17], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) * (fade > 0 ? 1 : 0);
  const l2 = interpolate(f, [54, 62], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const pop1 = spring({frame: f - 9, fps, config: {damping: 200}});
  const pop2 = spring({frame: f - 54, fps, config: {damping: 200}});

  const subBase: React.CSSProperties = {display: 'block'};
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <svg
        width={1080}
        height={1920}
        viewBox="0 0 360 640"
        xmlns="http://www.w3.org/2000/svg"
        style={{position: 'absolute', left: 0, top: 0}}
      >
        <defs dangerouslySetInnerHTML={{__html: defs(t)}} />
        <g opacity={fade} dangerouslySetInnerHTML={{__html: html}} />
        <rect width="360" height="640" fill="url(#vig)" />
        <rect width="360" height="640" fill="#000" opacity={(1 - fk(t, 0.7)) * 0.5} />
        <rect width="360" height="640" filter="url(#grain)" opacity={0.09} style={{mixBlendMode: 'overlay'}} />
      </svg>

      <div style={{position: 'absolute', top: 27, left: 32, font: '700 32px/1 "Courier New", monospace', letterSpacing: '0.3em', color: '#fff', opacity: 0.55, textShadow: '0 0 6px #000'}}>
        CAPTAIN PARALLAX
      </div>
      <div style={{position: 'absolute', top: 27, right: 32, font: '700 32px/1 "Courier New", monospace', color: '#ff4d4d', opacity: 0.8, textShadow: '0 0 6px #000'}}>
        {`● SCENE ${idx + 1}/6`}
      </div>

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 76,
          textAlign: 'center',
          padding: '0 54px',
          font: '800 55px/1.28 "Arial Black", Impact, system-ui, sans-serif',
          textTransform: 'uppercase',
          letterSpacing: '0.02em',
          color: '#fff',
          textShadow: '0 0 6px #000, 0 5px 17px #000, 3px 3px 0 #000, -3px 3px 0 #000',
          opacity: fade > 0 ? 1 : 0,
        }}
      >
        <span style={{...subBase, opacity: l1, transform: `translateY(${(1 - pop1) * 14}px)`}}>{SUB[idx][0]}</span>
        <span style={{...subBase, color: '#ffd23a', opacity: l2, transform: `translateY(${(1 - pop2) * 14}px)`}}>{SUB[idx][1]}</span>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- main composition: strict scene isolation via <Sequence> ---------- */
const MainScene: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    {B.slice(0, 6).map((b, i) => (
      <Sequence key={i} name={`Scene ${i + 1}`} from={b * FPS} durationInFrames={(B[i + 1] - b) * FPS}>
        <SceneView idx={i} />
      </Sequence>
    ))}
  </AbsoluteFill>
);

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="MainComp" component={MainScene} durationInFrames={1350} fps={30} width={1080} height={1920} />
  </>
);
