/**
 * CAPTAIN PARALLAX — "THE SHADOWS WEREN'T ATTACKING"
 * 1080x1920 · 30fps · 1350 frames (45s) · six isolated 225-frame Sequences
 *
 * 0   Rule 1 hook  — shadow peels off the floor, grabs the ankles
 * 225 Days of terror — people stomp / burn their shadows
 * 450 Realisation  — macro on the ankle grip, pull vector, rain stops on invisible bodies
 * 675 Rule 2       — straining forward toward the invisible things, yanked back
 * 900 Rule 3       — thermal goggles HUD, cold masses, a walker loses his heat
 * 1125 Rule 4      — shadow goes limp, crimson flash @1200 (0:40), cold masses are BEHIND him
 *
 * Imports: react + remotion only. No Math.random(), no external assets, every interpolate() clamped.
 */
import React from 'react';
import {
  AbsoluteFill,
  Composition,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

/* ───────────────────────── constants & deterministic helpers ───────────────────────── */

const W = 1080;
const H = 1920;
const GY = 1040; // ground line where the hero's feet stand
const FONT = "Impact, 'Arial Black', 'Helvetica Neue', Arial, sans-serif";

const rand = (i: number) => {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return x - Math.floor(x); // 0..1, identical every render
};

const ip = (f: number, i: number[], o: number[]) =>
  interpolate(f, i, o, {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

const sm = (f: number, a: number, b: number) => {
  const t = ip(f, [a, b], [0, 1]);
  return t * t * (3 - 2 * t);
};

type RGB = [number, number, number];
const mixc = (a: RGB, b: RGB, t: number) => {
  const k = Math.max(0, Math.min(1, t));
  return `rgb(${Math.round(a[0] + (b[0] - a[0]) * k)},${Math.round(a[1] + (b[1] - a[1]) * k)},${Math.round(
    a[2] + (b[2] - a[2]) * k,
  )})`;
};

// streetlamp: slow breathing + stutters + rare full dropouts
const flick = (f: number, seed: number) => {
  const base = 0.8 + 0.1 * Math.sin(f * 0.23 + seed) + 0.06 * Math.sin(f * 0.71 + seed * 2);
  const stutter = rand(Math.floor(f / 2) + seed * 17) > 0.9 ? 0.25 : 1;
  const dead = rand(Math.floor(f / 11) + seed * 31) > 0.94 ? 0.05 : 1;
  return base * stutter * dead;
};

const shakeXY = (f: number, amp: number) => ({
  x: (rand(f * 1.7 + 3) - 0.5) * 2 * amp,
  y: (rand(f * 2.3 + 9) - 0.5) * 2 * amp,
  r: (rand(f * 3.1 + 5) - 0.5) * amp * 0.06,
});

/* ───────────────────────── script (6 sentences, 83 words) ───────────────────────── */

const LINES = [
  'Rule one: when your shadow tears loose from the floor, never fight it.',
  'For three days we stomped and burned them, believing they wanted us dead.',
  'Then someone noticed: every shadow gripped an ankle, hauling us away from something invisible.',
  'Rule two: never pull free, because the invisible things stand exactly where you’re facing.',
  'Rule three: through thermal goggles they glow cold, so never walk toward the cold.',
  'Rule four: when your shadow goes limp, don’t turn around, because they’re already behind you.',
];

/* ───────────────────────── palettes ───────────────────────── */

type Pal = {
  skin: string;
  hair: string;
  jacket: string;
  pants: string;
  shoe: string;
  rim: string;
  eye: string;
  accent: string;
};

const PAL_HERO: Pal = {skin: '#e9cbb9', hair: '#14102a', jacket: '#262a55', pants: '#12121f', shoe: '#07070d', rim: '#7fe4ff', eye: '#ff3355', accent: '#ff2a45'};
const PAL_A: Pal = {skin: '#d9b49c', hair: '#3b1d3f', jacket: '#4d1f35', pants: '#1a1624', shoe: '#08080e', rim: '#ffb48a', eye: '#7de3ff', accent: '#ffcf6a'};
const PAL_C: Pal = {skin: '#c99d84', hair: '#0b0b10', jacket: '#1f4a4f', pants: '#1b1b26', shoe: '#08080e', rim: '#9affd2', eye: '#ffd36a', accent: '#7affd9'};
const PAL_SIL: Pal = {skin: '#000', hair: '#000', jacket: '#000', pants: '#000', shoe: '#000', rim: '#000', eye: '#e6d8ff', accent: '#000'};

const thermalPal = (h: number): Pal => ({
  skin: mixc([255, 238, 170], [30, 70, 230], 1 - h),
  hair: mixc([255, 190, 70], [20, 50, 190], 1 - h),
  jacket: mixc([255, 130, 35], [20, 45, 180], 1 - h),
  pants: mixc([215, 60, 30], [14, 30, 140], 1 - h),
  shoe: mixc([130, 24, 34], [8, 18, 100], 1 - h),
  rim: mixc([255, 240, 200], [90, 170, 255], 1 - h),
  eye: '#ffffff',
  accent: mixc([255, 230, 120], [60, 120, 255], 1 - h),
});

/* ───────────────────────── subtitles (safe zone) ───────────────────────── */

const Subtitle: React.FC<{text: string; f: number}> = ({text, f}) => {
  const words = text.split(' ');
  const idx = Math.min(words.length - 1, Math.floor(ip(f, [2, 208], [0, words.length])));
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 360,
        left: 0,
        right: 0,
        paddingLeft: 60,
        paddingRight: 130,
        textAlign: 'center',
      }}
    >
      <span
        style={{
          background: 'rgba(0,0,0,0.45)',
          padding: '6px 18px',
          borderRadius: 14,
          boxDecorationBreak: 'clone',
          WebkitBoxDecorationBreak: 'clone',
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 58,
          lineHeight: 1.34,
          color: '#fff',
          textShadow: '0 4px 0 #000, 0 0 16px #000',
        }}
      >
        {words.map((w, i) => (
          <span key={i} style={{color: i === idx ? '#ff3150' : '#ffffff'}}>
            {w}{' '}
          </span>
        ))}
      </span>
    </div>
  );
};

/* ───────────────────────── scene shell (camera: zoom + shake) ───────────────────────── */

const Shell: React.FC<{
  f: number;
  shake?: number;
  zoom?: number;
  zx?: number;
  zy?: number;
  overlay?: React.ReactNode;
  children: React.ReactNode;
}> = ({f, shake = 0, zoom = 1, zx = 540, zy = 900, overlay, children}) => {
  const sk = shakeXY(f, shake);
  const z = zoom * (shake > 0 ? 1.05 : 1);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <svg width={W} height={H} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0}}>
        <g
          transform={`translate(${sk.x} ${sk.y}) rotate(${sk.r} 540 960) translate(${zx} ${zy}) scale(${z}) translate(${-zx} ${-zy})`}
        >
          {children}
        </g>
        {overlay}
      </svg>
    </AbsoluteFill>
  );
};

/* ───────────────────────── backdrop: night street / thermal street ───────────────────────── */

const Backdrop: React.FC<{
  f: number;
  lampX?: number;
  seed?: number;
  mood?: number;
  lamp?: number;
  thermal?: boolean;
}> = ({f, lampX = 930, seed = 1, mood = 0, lamp, thermal = false}) => {
  const fl = lamp !== undefined ? lamp : flick(f, seed);
  const lx = lampX - 112;
  const ly = 384;
  const skyTop = thermal ? '#0b0030' : mixc([3, 2, 10], [28, 2, 10], mood);
  const skyMid = thermal ? '#26105c' : mixc([20, 11, 44], [70, 8, 26], mood);
  const skyLow = thermal ? '#5b2a8a' : mixc([52, 20, 74], [130, 16, 44], mood);
  const bld = thermal ? '#1a0b46' : '#070510';
  const winA = thermal ? '#ff9a3c' : '#ffd27a';
  const winB = thermal ? '#ff5a2a' : '#8fd8ff';
  const lampCol = thermal ? '255,200,120' : '255,214,140';

  const buildings: React.ReactNode[] = [];
  for (let i = 0; i < 14; i++) {
    const bx = i * 80 - 20;
    const bw = 74 + rand(i) * 18;
    const bh = 240 + rand(i + 20) * 380;
    const by = 880 - bh;
    buildings.push(<rect key={`b${i}`} x={bx} y={by} width={bw} height={bh} fill={bld} />);
    if (rand(i + 40) > 0.5) {
      buildings.push(<rect key={`a${i}`} x={bx + bw * 0.3} y={by - 34} width={bw * 0.12} height={34} fill={bld} />);
    }
    for (let r = 0; r < Math.floor(bh / 46); r++) {
      for (let c = 0; c < 3; c++) {
        const id = i * 100 + r * 3 + c;
        if (rand(id + 7) > 0.72) {
          const off = rand(Math.floor(f / 5) + id) > 0.975;
          if (!off) {
            buildings.push(
              <rect
                key={`w${id}`}
                x={bx + 8 + c * (bw / 3.1)}
                y={by + 14 + r * 46}
                width={bw / 5}
                height={16}
                fill={rand(id + 3) > 0.8 ? winB : winA}
                opacity={0.45 + 0.45 * rand(id + 11)}
              />,
            );
          }
        }
      }
    }
  }

  const stars: React.ReactNode[] = [];
  if (!thermal) {
    for (let i = 0; i < 40; i++) {
      stars.push(
        <circle
          key={`s${i}`}
          cx={rand(i) * W}
          cy={rand(i + 60) * 560}
          r={0.8 + rand(i + 90) * 1.6}
          fill="#fff"
          opacity={0.25 + 0.5 * Math.abs(Math.sin(f * 0.07 + i))}
        />,
      );
    }
  }

  const fog: React.ReactNode[] = [];
  for (let i = 0; i < 6; i++) {
    const cx = ((rand(i + 200) * 1500 + f * (0.6 + rand(i + 210))) % 1500) - 200;
    fog.push(
      <ellipse
        key={`f${i}`}
        cx={cx}
        cy={930 + i * 34}
        rx={260 + rand(i) * 160}
        ry={36}
        fill={thermal ? '#b58cff' : '#8a8cff'}
        opacity={0.07}
      />,
    );
  }

  const reflect: React.ReactNode[] = [];
  for (let k = 0; k < 10; k++) {
    reflect.push(
      <ellipse
        key={`r${k}`}
        cx={lx + (rand(k) - 0.5) * 140}
        cy={1100 + k * 58}
        rx={14 + k * 7}
        ry={3 + k * 0.6}
        fill={`rgba(${lampCol},${0.11 * fl})`}
      />,
    );
  }

  return (
    <g>
      <defs>
        <linearGradient id="bd-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={skyTop} />
          <stop offset="0.6" stopColor={skyMid} />
          <stop offset="1" stopColor={skyLow} />
        </linearGradient>
        <linearGradient id="bd-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={thermal ? '#2a1260' : '#15101f'} />
          <stop offset="1" stopColor={thermal ? '#0a0222' : '#020106'} />
        </linearGradient>
        <radialGradient id="bd-glow">
          <stop offset="0" stopColor={`rgba(${lampCol},0.85)`} />
          <stop offset="0.35" stopColor={`rgba(${lampCol},0.25)`} />
          <stop offset="1" stopColor={`rgba(${lampCol},0)`} />
        </radialGradient>
        <linearGradient id="bd-cone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={`rgba(${lampCol},0.36)`} />
          <stop offset="1" stopColor={`rgba(${lampCol},0)`} />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={W} height={900} fill="url(#bd-sky)" />
      {stars}
      {!thermal && (
        <g>
          <circle cx={170} cy={300} r={150} fill="rgba(170,180,255,0.07)" />
          <circle cx={170} cy={300} r={78} fill="#cfd6ff" opacity={0.85} />
          <circle cx={150} cy={284} r={14} fill="#aab2e6" opacity={0.6} />
          <circle cx={196} cy={322} r={9} fill="#aab2e6" opacity={0.6} />
        </g>
      )}
      {buildings}
      <rect x={0} y={880} width={W} height={H - 880} fill="url(#bd-ground)" />
      <rect x={0} y={878} width={W} height={6} fill={thermal ? '#5b2a8a' : '#2a1d3a'} />
      {reflect}
      {[0, 1, 2, 3].map((k) => (
        <ellipse key={`p${k}`} cx={160 + k * 270} cy={1180 + k * 70} rx={120 + k * 14} ry={16} fill="none" stroke="rgba(150,160,255,0.16)" strokeWidth={2} />
      ))}
      <polygon points={`${lx - 14},${ly + 14} ${lx + 14},${ly + 14} ${lx + 300},1040 ${lx - 330},1040`} fill="url(#bd-cone)" opacity={fl} />
      <rect x={lampX - 8} y={400} width={16} height={600} fill="#050409" />
      <path d={`M ${lampX} 412 Q ${lampX} 362 ${lx} ${ly - 8}`} stroke="#050409" strokeWidth={14} fill="none" />
      <ellipse cx={lx} cy={ly + 6} rx={34} ry={13} fill="#0b0912" />
      <circle cx={lx} cy={ly + 14} r={190} fill="url(#bd-glow)" opacity={fl} />
      <ellipse cx={lx} cy={ly + 14} rx={24} ry={8} fill="#fff3c8" opacity={0.3 + 0.7 * fl} />
      {fog}
    </g>
  );
};

/* ───────────────────────── rain (stops on invisible bodies) ───────────────────────── */

const Rain: React.FC<{f: number; n?: number; opacity?: number; blockers?: {x1: number; x2: number; top: number}[]}> = ({
  f,
  n = 70,
  opacity = 0.22,
  blockers = [],
}) => {
  const out: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const x = rand(i) * 1200 - 60;
    const sp = 34 + rand(i + 7) * 16;
    const y = ((rand(i + 100) * (H + 100) + f * sp) % (H + 100)) - 50;
    const blk = blockers.find((b) => x >= b.x1 && x <= b.x2);
    if (blk && y > blk.top) {
      if (y < blk.top + 34) {
        const r = (y - blk.top) / 2.4;
        out.push(
          <ellipse key={`d${i}`} cx={x} cy={blk.top} rx={r} ry={r * 0.35} fill="none" stroke="rgba(190,235,255,0.7)" strokeWidth={2} opacity={1 - (y - blk.top) / 34} />,
        );
      }
      continue;
    }
    out.push(<line key={`d${i}`} x1={x} y1={y} x2={x - 7} y2={y + 38} stroke={`rgba(190,200,255,${opacity})`} strokeWidth={2} />);
  }
  return <g>{out}</g>;
};

/* ───────────────────────── people ───────────────────────── */

const arm = (a: number, b: number, l1 = 72, l2 = 66) => {
  const ra = (a * Math.PI) / 180;
  const rb = ((a + b) * Math.PI) / 180;
  const ex = Math.sin(ra) * l1;
  const ey = Math.cos(ra) * l1;
  return {ex, ey, hx: ex + Math.sin(rb) * l2, hy: ey + Math.cos(rb) * l2, rb};
};

const Flame: React.FC<{x: number; y: number; f: number; s?: number}> = ({x, y, f, s = 1}) => {
  const w = 1 + 0.18 * Math.sin(f * 0.9) + 0.1 * Math.sin(f * 1.7);
  const h = 1 + 0.2 * Math.sin(f * 1.3);
  return (
    <g transform={`translate(${x} ${y}) scale(${s * w} ${s * h})`}>
      <circle cx={0} cy={-34} r={120} fill="rgba(255,140,40,0.16)" />
      <path d="M 0 0 C -22 -14 -24 -44 -6 -76 C -4 -52 8 -48 10 -66 C 28 -42 24 -14 0 0 Z" fill="#ff7a1a" />
      <path d="M 0 -2 C -12 -12 -12 -30 0 -50 C 12 -30 12 -12 0 -2 Z" fill="#ffd36a" />
    </g>
  );
};

type PersonProps = {
  x: number;
  y: number;
  s: number;
  pal: Pal;
  face?: number;
  lean?: number;
  legF?: number;
  legB?: number;
  armF?: [number, number];
  armB?: [number, number];
  eye?: number;
  mouth?: number;
  brow?: number;
  sil?: boolean;
  glow?: number;
  sweat?: boolean;
  torch?: number;
  rim?: boolean;
};

// Dark-anime figure. Local units: feet at (0,0), ~440 tall, faces +x.
const Person: React.FC<PersonProps> = ({
  x,
  y,
  s,
  pal,
  face = 1,
  lean = 0,
  legF = 0,
  legB = 0,
  armF = [10, 12],
  armB = [-8, 10],
  eye = 1,
  mouth = 0,
  brow = 0,
  sil = false,
  glow = 1,
  sweat = false,
  torch,
  rim = true,
}) => {
  const k = (c: string) => (sil ? '#000' : c);
  const SY = -322;
  const af = arm(armF[0], armF[1]);
  const ab = arm(armB[0], armB[1]);
  const dirX = Math.sin(af.rb);
  const dirY = Math.cos(af.rb);
  return (
    <g
      transform={`translate(${x} ${y}) scale(${s * face} ${s}) rotate(${lean})`}
      style={rim && !sil ? {filter: `drop-shadow(5px -3px 4px ${pal.rim})`} : undefined}
    >
      {/* back arm */}
      <path d={`M 0 ${SY} L ${ab.ex} ${SY + ab.ey} L ${ab.hx} ${SY + ab.hy}`} stroke={k(pal.jacket)} strokeWidth={19} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={sil ? 1 : 0.8} />
      <circle cx={ab.hx} cy={SY + ab.hy} r={8} fill={k(pal.skin)} />
      {/* back leg */}
      <g transform={`translate(-9 0) rotate(${legB} 0 -196)`}>
        <path d="M -14 -196 L 14 -196 L 11 -104 L 12 -16 L -12 -16 L -11 -104 Z" fill={k(pal.pants)} />
        <path d="M -13 -16 L 12 -16 L 32 -5 L 32 0 L -14 0 Z" fill={k(pal.shoe)} />
      </g>
      {/* torso / hoodie */}
      <path d="M -32 -334 C -40 -296 -34 -240 -28 -192 L 30 -192 C 36 -240 42 -296 34 -334 C 20 -344 -18 -344 -32 -334 Z" fill={k(pal.jacket)} />
      {!sil && (
        <g>
          <path d="M 2 -338 L 4 -194" stroke={pal.accent} strokeWidth={3} opacity={0.8} />
          <path d="M -28 -200 L 30 -200" stroke={pal.accent} strokeWidth={4} opacity={0.7} />
          <path d="M -30 -330 C -12 -314 12 -314 32 -330" stroke="rgba(0,0,0,0.35)" strokeWidth={6} fill="none" />
        </g>
      )}
      {/* front leg */}
      <g transform={`translate(9 0) rotate(${legF} 0 -196)`}>
        <path d="M -14 -196 L 14 -196 L 11 -104 L 12 -16 L -12 -16 L -11 -104 Z" fill={k(pal.pants)} />
        <path d="M -13 -16 L 12 -16 L 32 -5 L 32 0 L -14 0 Z" fill={k(pal.shoe)} />
        {!sil && <path d="M -12 -22 L 12 -22" stroke={pal.accent} strokeWidth={3} opacity={0.7} />}
      </g>
      {/* neck + head */}
      <rect x={-8} y={-352} width={18} height={26} fill={k(pal.skin)} />
      <ellipse cx={3} cy={-376} rx={27} ry={31} fill={k(pal.skin)} />
      <path d="M -26 -378 C -34 -418 -4 -430 24 -414 C 34 -406 34 -392 30 -384 L 26 -398 L 18 -384 L 10 -402 L 2 -386 L -8 -404 L -14 -384 L -20 -396 L -26 -378 Z" fill={k(pal.hair)} />
      <path d="M -26 -380 L -54 -372 L -34 -366 L -60 -350 L -30 -352 Z" fill={k(pal.hair)} />
      {!sil && <path d="M 4 -424 L 22 -410" stroke={pal.rim} strokeWidth={2.4} opacity={0.8} strokeLinecap="round" />}
      {/* face */}
      {!sil && (
        <g>
          <path d={`M 4 ${-392 - brow * 5} L 26 ${-388 + brow * 3}`} stroke="#0a0814" strokeWidth={3} strokeLinecap="round" />
          <ellipse cx={15} cy={-378} rx={9.5} ry={Math.max(1.5, 7 * eye)} fill="#fbf6f4" />
          <circle cx={17} cy={-378} r={Math.min(6, Math.max(1, 3.4 * eye))} fill={pal.eye} />
          <circle cx={17} cy={-378} r={2} fill="#12000a" />
          <circle cx={14} cy={-381} r={1.8} fill="#fff" />
          <path d="M 4 -386 Q 15 -391 26 -384" stroke="#0a0814" strokeWidth={2.6} fill="none" strokeLinecap="round" />
          <path d="M 29 -372 L 32 -367 L 28 -366" stroke="rgba(0,0,0,0.4)" strokeWidth={1.8} fill="none" />
          <ellipse cx={19} cy={-357} rx={4.5} ry={1.4 + mouth * 4.5} fill="#2a0a10" />
          {sweat && (
            <g fill="#bfe9ff" opacity={0.85}>
              <path d="M -2 -400 q -5 10 0 14 q 5 -4 0 -14 Z" />
              <path d="M 30 -354 q -4 8 0 11 q 4 -3 0 -11 Z" />
            </g>
          )}
        </g>
      )}
      {sil && glow > 0.02 && (
        <ellipse cx={15} cy={-378} rx={10} ry={3.6 * glow} fill="#e6d8ff" opacity={glow} style={{filter: 'drop-shadow(0 0 6px #b48cff)'}} />
      )}
      {/* front arm (+ optional torch) */}
      {torch !== undefined && (
        <g>
          <path d={`M ${af.hx} ${SY + af.hy} L ${af.hx + dirX * 74} ${SY + af.hy + dirY * 74}`} stroke="#2a1a10" strokeWidth={9} strokeLinecap="round" />
          <Flame x={af.hx + dirX * 74} y={SY + af.hy + dirY * 74} f={torch} s={1.1} />
        </g>
      )}
      <path d={`M 0 ${SY} L ${af.ex} ${SY + af.ey} L ${af.hx} ${SY + af.hy}`} stroke={k(pal.jacket)} strokeWidth={20} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx={af.hx} cy={SY + af.hy} r={9} fill={k(pal.skin)} />
    </g>
  );
};

/* point on a rotated/flattened shadow silhouette, and ankle position of a leg */
const shadowPt = (px: number, py: number, s: number, a: number, fy: number, lx: number, ly: number): [number, number] => {
  const r = (a * Math.PI) / 180;
  const xr = lx * Math.cos(r) - ly * Math.sin(r);
  const yr = lx * Math.sin(r) + ly * Math.cos(r);
  return [px + s * xr, py + fy * s * yr];
};

const ankleAt = (x: number, y: number, s: number, dx: number, th: number): [number, number] => {
  const r = (th * Math.PI) / 180;
  return [x + s * (dx - 180 * Math.sin(r)), y + s * (-196 + 180 * Math.cos(r))];
};

const ShadowBody: React.FC<{px: number; py: number; s: number; a: number; fy: number; glow?: number; op?: number}> = ({px, py, s, a, fy, glow = 1, op = 1}) => (
  <g opacity={op} style={{filter: 'drop-shadow(0 0 7px #8a3cff)'}}>
    <g transform={`translate(${px} ${py}) scale(1 ${fy}) rotate(${a}) scale(${s})`}>
      <Person x={0} y={0} s={1} pal={PAL_SIL} sil glow={glow} rim={false} armF={[40, 30]} armB={[-30, 20]} />
    </g>
  </g>
);

const GrabArms: React.FC<{
  sh: [number, number];
  targets: [number, number][];
  grip: number;
  f: number;
  lift?: number;
  limp?: number;
}> = ({sh, targets, grip, f, lift = 40, limp = 0}) => (
  <g style={{filter: 'drop-shadow(0 0 5px #8a3cff)'}}>
    {targets.map((t, i) => {
      const free: [number, number] = [sh[0] + 70, sh[1] - 60 - i * 26];
      const tt: [number, number] = [t[0] - limp * 70, t[1] + limp * (26 + i * 8)];
      const hx = free[0] + (tt[0] - free[0]) * grip;
      const hy = free[1] + (tt[1] - free[1]) * grip;
      const cx = (sh[0] + hx) / 2;
      const cy = (sh[1] + hy) / 2 - lift * (1 - limp) - Math.sin(f * 0.5 + i) * 4 * (1 - limp);
      const curl = grip * (1 - limp);
      const d = `M ${sh[0]} ${sh[1]} Q ${cx} ${cy} ${hx} ${hy}`;
      return (
        <g key={i}>
          <path d={d} stroke="#000" strokeWidth={17} strokeLinecap="round" fill="none" />
          <path d={d} stroke="#7a3cff" strokeWidth={2} strokeLinecap="round" fill="none" opacity={0.55} />
          <ellipse cx={hx} cy={hy} rx={15} ry={11} fill="#000" />
          {[0, 1, 2, 3].map((q) => (
            <path key={q} d={`M ${hx - 10} ${hy - 10 + q * 7} q 10 ${-6 - curl * 4} 22 ${-2 + q}`} stroke="#000" strokeWidth={5} strokeLinecap="round" fill="none" />
          ))}
        </g>
      );
    })}
  </g>
);

type PairProps = {
  x: number;
  y: number;
  s: number;
  f: number;
  pal: Pal;
  grip?: number;
  a?: number;
  px?: number;
  limp?: number;
  lift?: number;
  shadowOp?: number;
  lean?: number;
  legF?: number;
  legB?: number;
  armF?: [number, number];
  armB?: [number, number];
  eye?: number;
  mouth?: number;
  brow?: number;
  sweat?: boolean;
  torch?: number;
};

// A person + their detached shadow gripping both ankles
const Pair: React.FC<PairProps> = (p) => {
  const {x, y, s, f, pal, grip = 1, a = 90, limp = 0, lift = 40} = p;
  const ssh = s * 0.9;
  const px = p.px !== undefined ? p.px : x - 50 * s - 376 * ssh;
  const fy = 0.62 + 0.38 * (1 - Math.min(1, Math.abs(a) / 90));
  const sh = shadowPt(px, y, ssh, a, fy, 0, -322);
  const legF = p.legF !== undefined ? p.legF : 0;
  const legB = p.legB !== undefined ? p.legB : 0;
  const targets: [number, number][] = [ankleAt(x, y, s, 9, legF), ankleAt(x, y, s, -9, legB)];
  return (
    <g>
      <ShadowBody px={px} py={y} s={ssh} a={a} fy={fy} glow={1 - limp} op={p.shadowOp !== undefined ? p.shadowOp : 1} />
      <Person
        x={x}
        y={y}
        s={s}
        pal={pal}
        lean={p.lean}
        legF={legF}
        legB={legB}
        armF={p.armF}
        armB={p.armB}
        eye={p.eye}
        mouth={p.mouth}
        brow={p.brow}
        sweat={p.sweat}
        torch={p.torch}
      />
      <GrabArms sh={sh} targets={targets} grip={grip} f={f} lift={lift} limp={limp} />
    </g>
  );
};

/* ───────────────────────── the invisible things (clues only show when the lamp stutters) ───────────────────────── */

const Invisible: React.FC<{
  x: number;
  y: number;
  s: number;
  f: number;
  vis: number;
  seed?: number;
  face?: number;
  reach?: number;
  col?: string;
  edge?: string;
}> = ({x, y, s, f, vis, seed = 1, face = -1, reach = 0, col = '140,210,255', edge = '190,235,255'}) => {
  if (vis < 0.01) return null;
  const sway = Math.sin(f * 0.06 + seed * 2) * 3;
  const o = Math.min(1, vis);
  const hand: [number, number] = [44 + (210 - 44) * reach, -110 + (-380 + 110) * reach];
  const elbow: [number, number] = [50 + (120 - 50) * reach, -250 + (-400 + 250) * reach];
  return (
    <g
      transform={`translate(${x + sway} ${y}) scale(${s * face} ${s})`}
      fill={`rgba(${col},${o * 0.16})`}
      stroke={`rgba(${edge},${o})`}
      strokeWidth={3}
      strokeLinejoin="round"
      strokeLinecap="round"
      style={{filter: `drop-shadow(0 0 8px rgba(${col},${o * 0.7}))`}}
    >
      <path d="M -24 -200 L -28 0 L -6 0 L -2 -200 Z" />
      <path d="M 8 -200 L 6 0 L 30 0 L 26 -200 Z" />
      <path d="M -36 -404 L -28 -200 L 28 -200 L 36 -404 Z" />
      <ellipse cx={2} cy={-452} rx={22} ry={36} />
      <path d={`M 30 -392 L ${elbow[0]} ${elbow[1]} L ${hand[0]} ${hand[1]}`} fill="none" strokeWidth={9} />
      <path d="M -30 -392 L -52 -250 L -44 -110" fill="none" strokeWidth={9} />
      {[0, 1, 2, 3, 4].map((k) => {
        const ang = 1.57 - reach * 1.57 + (k - 2) * 0.26;
        return <path key={k} d={`M ${hand[0]} ${hand[1]} l ${Math.cos(ang) * 38} ${Math.sin(ang) * 38}`} fill="none" strokeWidth={4} />;
      })}
      {[0, 1, 2, 3, 4, 5].map((k) => (
        <path key={`s${k}`} d={`M -60 ${-60 - k * 70} q 30 ${Math.sin(f * 0.25 + k + seed) * 10} 120 0`} fill="none" strokeWidth={2} opacity={0.55} />
      ))}
    </g>
  );
};

/* ───────────────────────── overlays ───────────────────────── */

const RuleTag: React.FC<{n: string; sub: string; f: number; col?: string}> = ({n, sub, f, col = '#ff2a45'}) => {
  const g = rand(Math.floor(f / 2) + n.charCodeAt(1)) > 0.82 ? 7 : 0;
  const common = {fontFamily: FONT, fontWeight: 900 as const, fontSize: 118, textAnchor: 'middle' as const, letterSpacing: 6};
  return (
    <g>
      <text x={540 + g} y={300} {...common} fill="#00e5ff" opacity={0.55}>
        RULE {n}
      </text>
      <text x={540 - g} y={300} {...common} fill={col} opacity={0.65}>
        RULE {n}
      </text>
      <text x={540} y={300} {...common} fill="#ffffff">
        RULE {n}
      </text>
      <rect x={200} y={322} width={680} height={5} fill={col} />
      <text x={540} y={374} fontFamily={FONT} fontWeight={900} fontSize={44} textAnchor="middle" fill={col} letterSpacing={4}>
        {sub}
      </text>
    </g>
  );
};

const DayTag: React.FC<{f: number}> = ({f}) => {
  const d = Math.min(3, Math.floor(f / 75) + 1);
  const local = f - (d - 1) * 75;
  const pop = ip(local, [0, 6, 14], [1.5, 0.92, 1]);
  return (
    <g>
      <g transform={`translate(540 300) scale(${pop})`}>
        <text x={0} y={0} fontFamily={FONT} fontWeight={900} fontSize={122} textAnchor="middle" fill="#ff2a45" letterSpacing={8}>
          DAY 0{d}
        </text>
      </g>
      {[1, 2, 3].map((i) => (
        <rect key={i} x={420 + (i - 1) * 90} y={330} width={70} height={10} fill={i <= d ? '#ff2a45' : 'rgba(255,255,255,0.25)'} />
      ))}
    </g>
  );
};

const Brackets: React.FC<{cx: number; cy: number; r: number; col: string; f: number; label?: string}> = ({cx, cy, r, col, f, label}) => {
  const p = r + Math.sin(f * 0.4) * 5;
  const c = 26;
  return (
    <g stroke={col} strokeWidth={5} fill="none" strokeLinecap="round">
      <path d={`M ${cx - p} ${cy - p + c} V ${cy - p} H ${cx - p + c}`} />
      <path d={`M ${cx + p - c} ${cy - p} H ${cx + p} V ${cy - p + c}`} />
      <path d={`M ${cx - p} ${cy + p - c} V ${cy + p} H ${cx - p + c}`} />
      <path d={`M ${cx + p - c} ${cy + p} H ${cx + p} V ${cy + p - c}`} />
      {label && (
        <text x={cx} y={cy - p - 14} fill={col} stroke="none" fontFamily="monospace" fontWeight={700} fontSize={30} textAnchor="middle">
          {label}
        </text>
      )}
    </g>
  );
};

const Arrow: React.FC<{x1: number; y1: number; x2: number; y2: number; col: string; label: string; op: number}> = ({x1, y1, x2, y2, col, label, op}) => {
  const dir = x2 > x1 ? 1 : -1;
  return (
    <g opacity={op}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={col} strokeWidth={10} strokeLinecap="round" />
      <path d={`M ${x2} ${y2} l ${-dir * 34} -24 M ${x2} ${y2} l ${-dir * 34} 24`} stroke={col} strokeWidth={10} strokeLinecap="round" fill="none" />
      <text x={(x1 + x2) / 2} y={y1 - 22} fill={col} fontFamily={FONT} fontWeight={900} fontSize={42} textAnchor="middle" letterSpacing={3}>
        {label}
      </text>
    </g>
  );
};

/* ───────────────────────── SCENE 1 — Rule 1 hook (frames 0–224) ───────────────────────── */

const Scene1: React.FC = () => {
  const f = useCurrentFrame();
  const hint = flick(f, 3) < 0.3 ? 0.5 : 0.05; // the invisible things only show when the lamp stutters
  const hs = 1.3;
  const ssh = hs * 0.9;
  const hx = 620 - sm(f, 128, 225) * 70;
  const a = f < 72 ? ip(f, [0, 46, 72], [-64, -6, 0]) : f < 118 ? 90 * Math.pow(sm(f, 72, 118), 1.6) : 90 + Math.sin(f * 0.55) * 2.2;
  const px = f < 118 ? ip(f, [0, 46, 72, 118], [620, 330, 130, 130]) : hx - 50 * hs - 376 * ssh;
  const grip = sm(f, 104, 126);
  const fight = f > 128 ? 1 : 0;
  const sw = Math.sin(f * 0.9);
  return (
    <>
      <Shell f={f} zoom={ip(f, [0, 225], [1, 1.06])} zx={620} zy={900} overlay={<RuleTag n="01" sub="NEVER FIGHT IT" f={f} />}>
        <Backdrop f={f} seed={3} />
        <Invisible x={820} y={GY + 4} s={1.3} f={f} vis={hint} seed={1} />
        <Invisible x={925} y={GY - 16} s={1.12} f={f} vis={hint * 0.8} seed={2} />
        <Pair
          x={hx}
          y={GY}
          s={hs}
          f={f}
          pal={PAL_HERO}
          px={px}
          a={a}
          grip={grip}
          lift={30}
          legF={fight ? -Math.max(0, sw) * 34 : 0}
          armF={fight ? [30 + sw * 45, 70] : [24, 40]}
          armB={fight ? [-20 - sw * 30, 60] : [-14, 30]}
          eye={ip(f, [0, 20], [1.7, 1.5])}
          mouth={f > 110 ? 1 : 0.2}
          brow={1}
          sweat
        />
        <Rain f={f} />
      </Shell>
      <Subtitle text={LINES[0]} f={f} />
    </>
  );
};

/* ───────────────────────── SCENE 2 — three days of terror (frames 225–449) ───────────────────────── */

const Scene2: React.FC = () => {
  const f = useCurrentFrame();
  const mood = ip(f, [0, 225], [0, 0.65]);
  const sw = Math.sin(f * 0.75);
  const run = Math.sin(f * 0.8);
  const hint = flick(f, 5) < 0.3 ? 0.4 : 0.04;
  const embers: React.ReactNode[] = [];
  for (let i = 0; i < 12; i++) {
    const t = (f * 2 + rand(i + 5) * 260) % 260;
    embers.push(
      <circle key={i} cx={250 + (rand(i) - 0.5) * 130 + Math.sin(f * 0.1 + i) * 12} cy={GY - 430 - t} r={2.6} fill="#ffb347" opacity={1 - t / 260} />,
    );
  }
  return (
    <>
      <Shell f={f} zoom={ip(f, [0, 225], [1, 1.1])} zx={600} zy={820} overlay={<DayTag f={f} />}>
        <Backdrop f={f} seed={5} mood={mood} />
        <Invisible x={450} y={GY - 36} s={1.0} f={f} vis={hint} seed={3} />
        <Invisible x={850} y={GY + 4} s={1.3} f={f} vis={hint} seed={4} />
        {/* A — torch against his own shadow */}
        <Pair x={250} y={GY - 30} s={1.0} f={f} pal={PAL_A} lift={60} armF={[150 + Math.sin(f * 0.5) * 20, 20]} armB={[-40, 30]} torch={f} eye={1.5} mouth={0.8} brow={1} />
        {/* hero — stomping */}
        <Pair
          x={600}
          y={GY}
          s={1.3}
          f={f}
          pal={PAL_HERO}
          lift={60}
          legF={-Math.max(0, sw) * 40}
          armF={[110 + sw * 20, 30]}
          armB={[80 - sw * 20, 40]}
          eye={1.7}
          mouth={1}
          brow={1}
          sweat
        />
        {/* C — running, dragged back */}
        <Pair x={880 + Math.sin(f * 0.4) * 8} y={GY - 20} s={0.95} f={f} pal={PAL_C} lean={12} lift={60} legF={run * 35} legB={-run * 35} armF={[-50 + run * 30, 40]} armB={[50 - run * 30, 30]} eye={1.6} mouth={1} brow={1} />
        <g>{embers}</g>
        <circle cx={250} cy={GY - 560} r={260} fill={`rgba(255,120,40,${0.1 + 0.05 * Math.sin(f * 0.9)})`} />
        <Rain f={f} n={90} />
        <rect x={0} y={0} width={W} height={H} fill="#ff0a2a" opacity={0.05 + 0.05 * mood * Math.abs(Math.sin(f * 0.2))} />
      </Shell>
      <Subtitle text={LINES[1]} f={f} />
    </>
  );
};

/* ───────────────────────── SCENE 3 — the realisation (frames 450–674) ───────────────────────── */

const EyeInset: React.FC<{f: number}> = ({f}) => {
  const cx = 790;
  const cy = 520;
  const open = 0.3 + 0.7 * sm(f, 176, 194);
  const ry = 78 * open;
  const pupil = ip(f, [176, 204], [24, 10]);
  const rays: React.ReactNode[] = [];
  for (let i = 0; i < 28; i++) {
    const t = (i / 28) * Math.PI * 2;
    rays.push(<line key={i} x1={cx + Math.cos(t) * 90} y1={cy + Math.sin(t) * 90} x2={cx + Math.cos(t) * 170} y2={cy + Math.sin(t) * 170} stroke="#fff" strokeWidth={3} opacity={0.14} />);
  }
  return (
    <g opacity={ip(f, [174, 182], [0, 1])}>
      <defs>
        <clipPath id="eyeClip">
          <circle cx={cx} cy={cy} r={146} />
        </clipPath>
        <radialGradient id="irisG">
          <stop offset="0" stopColor="#ff6a7e" />
          <stop offset="0.7" stopColor="#c4122e" />
          <stop offset="1" stopColor="#5a0616" />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={152} fill="#0a0614" stroke="#ff2a45" strokeWidth={6} />
      <g clipPath="url(#eyeClip)">
        {rays}
        <ellipse cx={cx} cy={cy} rx={128} ry={ry} fill="#f4ecf0" />
        <circle cx={cx + 6} cy={cy} r={Math.min(ry * 0.96, 58)} fill="url(#irisG)" />
        <circle cx={cx + 6} cy={cy} r={Math.min(ry * 0.9, pupil)} fill="#12000a" />
        <ellipse cx={cx - 14} cy={cy - 18 * open} rx={12} ry={9} fill="#fff" />
        <path d={`M ${cx - 134} ${cy + 4} Q ${cx} ${cy - ry * 1.5} ${cx + 134} ${cy + 4}`} stroke="#000" strokeWidth={13} fill="none" strokeLinecap="round" />
      </g>
    </g>
  );
};

const Scene3: React.FC = () => {
  const f = useCurrentFrame();
  const hx = 560;
  const hs = 1.3;
  const ankle: [number, number] = ankleAt(hx, GY, hs, 9, 0);
  const z = f < 112 ? 1 + 2.4 * sm(f, 0, 70) : 3.4 - 2.4 * sm(f, 112, 172);
  const zx = f < 112 ? ankle[0] : ip(f, [112, 172], [ankle[0], 700]);
  const zy = f < 112 ? ankle[1] : ip(f, [112, 172], [ankle[1], 900]);
  const vis = ip(f, [110, 170], [0.05, 0.6]);
  const grip = spring({frame: f, fps: 30, config: {damping: 8, stiffness: 160}});
  const blockers = f > 112 ? [{x1: 775, x2: 865, top: 540}, {x1: 880, x2: 970, top: 585}] : [];
  const overlay = (
    <g>
      {f >= 52 && f < 125 && (
        <g opacity={ip(f, [52, 62, 112, 124], [0, 1, 1, 0])}>
          <Brackets cx={ankle[0]} cy={ankle[1]} r={130} col="#ff2a45" f={f} label="GRIP" />
          <Arrow x1={560} y1={1150} x2={300} y2={1150} col="#ff2a45" label="PULL" op={ip(f, [62, 74], [0, 1])} />
          <Arrow x1={640} y1={1150} x2={900} y2={1150} col="#00e5ff" label="FRONT: ???" op={ip(f, [84, 96], [0, 1])} />
        </g>
      )}
      {f >= 150 && (
        <g opacity={ip(f, [150, 164], [0, 1])}>
          <Brackets cx={820} cy={760} r={190} col="#00e5ff" f={f} label="COLD MASS ×3" />
        </g>
      )}
      <EyeInset f={f} />
    </g>
  );
  return (
    <>
      <Shell f={f} zoom={z} zx={zx} zy={zy} overlay={overlay}>
        <Backdrop f={f} seed={7} />
        <Invisible x={820} y={GY + 4} s={1.3} f={f} vis={vis} seed={1} />
        <Invisible x={925} y={GY - 16} s={1.12} f={f} vis={vis * 0.85} seed={2} />
        <Invisible x={725} y={GY + 30} s={1.4} f={f} vis={vis * 0.7} seed={6} />
        <Pair x={hx} y={GY} s={hs} f={f} pal={PAL_HERO} grip={grip} lift={20} lean={Math.sin(f * 0.5) * 1.5} armF={[14, 20]} armB={[-10, 20]} eye={1.2} brow={0.5} />
        <Rain f={f} blockers={blockers} />
      </Shell>
      <Subtitle text={LINES[2]} f={f} />
    </>
  );
};

/* ───────────────────────── SCENE 4 — Rule 2: never pull free (frames 675–899) ───────────────────────── */

const Scene4: React.FC = () => {
  const f = useCurrentFrame();
  const strain = sm(f, 8, 100);
  const snap = sm(f, 150, 162);
  const hx = (620 + strain * 70) * (1 - snap) + 548 * snap;
  const lean = strain * 16 * (1 - snap) - snap * 8;
  const vis = ip(f, [0, 100], [0.08, 0.62]);
  const reach = sm(f, 60, 150);
  const x1 = 830 - ip(f, [40, 150], [0, 60]);
  const x2 = 935 - ip(f, [40, 150], [0, 50]);
  const swipe = ip(f, [150, 156, 196], [0, 0.85, 0]);
  const tremble = Math.sin(f * 2.4) * 2 * strain;
  return (
    <>
      <Shell f={f} zoom={ip(f, [0, 225], [1.02, 1.1])} zx={700} zy={800} overlay={<RuleTag n="02" sub="NEVER PULL FREE" f={f} />}>
        <Backdrop f={f} seed={9} />
        <Invisible x={x2} y={GY - 16} s={1.12} f={f} vis={vis * 0.85} seed={2} reach={reach * 0.8} />
        <Invisible x={x1} y={GY + 4} s={1.3} f={f} vis={vis} seed={1} reach={reach} />
        <Pair
          x={hx + tremble}
          y={GY}
          s={1.3}
          f={f}
          pal={PAL_HERO}
          px={130}
          lift={10}
          lean={lean}
          legF={-strain * 24 * (1 - snap)}
          legB={strain * 16 * (1 - snap)}
          armF={[30 + strain * 40, 40]}
          armB={[-30 - strain * 20, 30]}
          eye={ip(f, [0, 100], [1.3, 1.8])}
          mouth={strain}
          brow={1}
          sweat
        />
        <path d={`M ${x1 - 20} ${GY - 560} Q ${x1 - 120} ${GY - 470} ${x1 - 230} ${GY - 520}`} stroke="#00e5ff" strokeWidth={10} fill="none" strokeLinecap="round" opacity={swipe} />
        <path d={`M ${x1 - 10} ${GY - 500} Q ${x1 - 110} ${GY - 410} ${x1 - 220} ${GY - 450}`} stroke="#ff2a45" strokeWidth={6} fill="none" strokeLinecap="round" opacity={swipe * 0.8} />
        <Rain f={f} />
      </Shell>
      <Subtitle text={LINES[3]} f={f} />
    </>
  );
};

/* ───────────────────────── SCENE 5 — Rule 3: thermal goggles (frames 900–1124) ───────────────────────── */

const ThermalHUD: React.FC<{f: number; h: number; wx: number; dist: number}> = ({f, h, wx, dist}) => {
  const danger = dist < 12;
  const blink = Math.floor(f / 6) % 2 === 0;
  const bars: React.ReactNode[] = [];
  for (let i = 0; i < 4; i++) {
    bars.push(<rect key={i} x={0} y={rand(Math.floor(f / 4) + i * 13) * H} width={W} height={4 + rand(i + 3) * 12} fill="#fff" opacity={0.06} />);
  }
  const sig = Math.round(h * 36.5);
  return (
    <g>
      <defs>
        <pattern id="scan" width="8" height="8" patternUnits="userSpaceOnUse">
          <rect width="8" height="3" fill="rgba(0,0,0,0.28)" />
        </pattern>
        <linearGradient id="heatBar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.25" stopColor="#ffd34a" />
          <stop offset="0.5" stopColor="#ff5a1f" />
          <stop offset="0.75" stopColor="#7a1fd6" />
          <stop offset="1" stopColor="#1a3cff" />
        </linearGradient>
        <radialGradient id="vig" cx="0.5" cy="0.45" r="0.75">
          <stop offset="0.55" stopColor="rgba(0,0,0,0)" />
          <stop offset="1" stopColor="rgba(0,0,0,0.75)" />
        </radialGradient>
      </defs>
      <rect x={0} y={0} width={W} height={H} fill="url(#scan)" />
      <rect x={0} y={0} width={W} height={H} fill="url(#vig)" />
      {bars}
      <g stroke="#00ffb3" strokeWidth={5} fill="none" opacity={0.9}>
        <path d="M 40 150 V 100 H 100" />
        <path d="M 980 100 H 1040 V 150" />
        <path d="M 40 1790 V 1840 H 100" />
        <path d="M 980 1840 H 1040 V 1790" />
      </g>
      <g fontFamily="monospace" fontWeight={700} fontSize={30} fill="#00ffb3">
        <text x={64} y={470}>THERMAL // IR 8–14µm</text>
        <text x={64} y={510}>COLD MASS ×3  −4°C</text>
        <text x={64} y={550} fill={danger && blink ? '#ff2a45' : '#00ffb3'}>DIST {String(dist).padStart(2, '0')} m</text>
      </g>
      <rect x={64} y={600} width={26} height={240} fill="url(#heatBar)" />
      <text x={104} y={620} fontFamily="monospace" fontSize={24} fill="#fff">HOT</text>
      <text x={104} y={840} fontFamily="monospace" fontSize={24} fill="#fff">COLD</text>
      <g transform={`translate(800 700) rotate(${f * 2})`} stroke="#00ffb3" fill="none" strokeWidth={3} opacity={0.75}>
        <circle r={100} strokeDasharray="14 10" />
        <circle r={60} />
        <path d="M -130 0 H -80 M 80 0 H 130 M 0 -130 V -80 M 0 80 V 130" />
      </g>
      <text x={wx} y={440} fontFamily="monospace" fontWeight={700} fontSize={30} fill="#ffe08a" textAnchor="middle">
        {h < 0.2 ? (blink ? 'SIGNATURE LOST' : '') : `${sig}°C`}
      </text>
      {danger && blink && (
        <text x={540} y={1100} fontFamily={FONT} fontWeight={900} fontSize={60} fill="#ff2a45" textAnchor="middle" letterSpacing={4}>
          DO NOT ADVANCE
        </text>
      )}
    </g>
  );
};

const Scene5: React.FC = () => {
  const f = useCurrentFrame();
  const h = ip(f, [40, 205], [1, 0.08]);
  const wx = ip(f, [30, 205], [500, 700]);
  const dist = Math.round(ip(f, [30, 205], [38, 3]));
  const walk = Math.sin(f * 0.4) * 20;
  const cold = {col: '40,110,255', edge: '140,220,255'};
  return (
    <>
      <Shell f={f} shake={1.2} zoom={1.03} zx={600} zy={800} overlay={<g><ThermalHUD f={f} h={h} wx={wx} dist={dist} /><RuleTag n="03" sub="NEVER WALK TOWARD THE COLD" f={f} col="#00ffb3" /></g>}>
        <Backdrop f={f} thermal lamp={0.9 + 0.1 * Math.sin(f * 0.3)} seed={11} />
        <Invisible x={800} y={GY + 4} s={1.3} f={f} vis={0.9} seed={1} {...cold} />
        <Invisible x={905} y={GY - 16} s={1.12} f={f} vis={0.9} seed={2} {...cold} />
        <Invisible x={990} y={GY + 10} s={1.25} f={f} vis={0.9} seed={3} {...cold} />
        <Pair x={170} y={GY - 26} s={1.05} f={f} pal={thermalPal(1)} lift={30} armF={[20, 30]} eye={1.4} brow={1} />
        <Pair x={360} y={GY - 8} s={1.2} f={f} pal={thermalPal(0.95)} lift={30} armF={[16, 28]} eye={1.3} brow={1} />
        <Pair x={wx + Math.sin(f * 1.1) * 3} y={GY} s={1.3} f={f} pal={thermalPal(h)} lean={8} lift={20} legF={walk} legB={-walk} armF={[24 - walk, 30]} armB={[-20 + walk, 30]} eye={1.5} brow={1} />
      </Shell>
      <Subtitle text={LINES[4]} f={f} />
    </>
  );
};

/* ───────────────────────── SCENE 6 — Rule 4 twist (frames 1125–1349; crimson climax at local 75 = frame 1200 = 0:40.0) ───────────────────────── */

const Scene6: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const limp = sm(f, 20, 62);
  const front = 1 - sm(f, 40, 70);
  const hit = f >= 75;
  const boom = hit ? Math.exp(-(f - 75) / 9) : 0;
  const behind = sm(f, 75, 100);
  const shakeAmp = hit ? 4 + 30 * Math.exp(-(f - 75) / 32) : 0;
  const lamp = f < 75 ? 0.92 : Math.max(0.06, flick(f * 2, 4) * Math.exp(-(f - 75) / 60));
  const snapEye = spring({frame: Math.max(0, f - 75), fps, config: {damping: 9, stiffness: 180}});
  const eye = hit ? 1.1 + 0.9 * snapEye : ip(f, [0, 50], [1.1, 0.85]);
  const tremble = hit ? Math.sin(f * 2.6) * 1.5 : 0;
  const zoom = ip(f, [0, 225], [1, 1.05]) + sm(f, 140, 225) * 0.35;
  const red = {col: '255,40,70', edge: '255,90,110'};
  return (
    <>
      <Shell
        f={f}
        shake={shakeAmp}
        zoom={zoom}
        zx={620}
        zy={620}
        overlay={
          <g>
            <rect x={0} y={0} width={W} height={H} fill="#ff0a2a" opacity={0.85 * boom + (hit ? 0.16 : 0)} />
            <defs>
              <radialGradient id="redVig" cx="0.5" cy="0.45" r="0.8">
                <stop offset="0.5" stopColor="rgba(0,0,0,0)" />
                <stop offset="1" stopColor="rgba(60,0,10,0.8)" />
              </radialGradient>
            </defs>
            <rect x={0} y={0} width={W} height={H} fill="url(#redVig)" opacity={hit ? 1 : 0.35} />
            {hit && <RuleTag n="04" sub="DON’T TURN AROUND" f={f} />}
          </g>
        }
      >
        <Backdrop f={f} seed={13} lamp={lamp} mood={hit ? 0.7 : 0} />
        {/* distant citizens: every shadow goes limp together */}
        <Pair x={300} y={GY - 140} s={0.55} f={f} pal={PAL_A} limp={limp} lift={10} eye={0.9} />
        <Pair x={900} y={GY - 130} s={0.55} f={f} pal={PAL_C} limp={limp} lift={10} eye={0.9} />
        {/* the things that were in front fade out… */}
        <Invisible x={820} y={GY + 4} s={1.3} f={f} vis={0.45 * front} seed={1} />
        <Invisible x={925} y={GY - 16} s={1.12} f={f} vis={0.35 * front} seed={2} />
        {/* …and now stand BEHIND him */}
        <Invisible x={250} y={GY - 12} s={1.2} f={f} vis={0.75 * behind} seed={5} face={1} reach={0.4 * behind} {...red} />
        <Invisible x={470} y={GY + 6} s={1.4} f={f} vis={0.95 * behind} seed={6} face={1} reach={0.7 * behind} {...red} />
        <Pair
          x={600 + tremble}
          y={GY}
          s={1.3}
          f={f}
          pal={PAL_HERO}
          limp={limp}
          lift={20}
          armF={[6, 10]}
          armB={[-6, 10]}
          eye={eye}
          mouth={hit ? 0.6 : 0}
          brow={hit ? 1 : -0.3}
          sweat={hit}
        />
        <Rain f={f} />
      </Shell>
      <Subtitle text={LINES[5]} f={f} />
    </>
  );
};

/* ───────────────────────── composition ───────────────────────── */

const HorrorShort: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#000'}}>
    <Sequence from={0} durationInFrames={225}>
      <Scene1 />
    </Sequence>
    <Sequence from={225} durationInFrames={225}>
      <Scene2 />
    </Sequence>
    <Sequence from={450} durationInFrames={225}>
      <Scene3 />
    </Sequence>
    <Sequence from={675} durationInFrames={225}>
      <Scene4 />
    </Sequence>
    <Sequence from={900} durationInFrames={225}>
      <Scene5 />
    </Sequence>
    <Sequence from={1125} durationInFrames={225}>
      <Scene6 />
    </Sequence>
  </AbsoluteFill>
);

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="HorrorShort" component={HorrorShort} width={1080} height={1920} fps={30} durationInFrames={1350} />
  </>
);
