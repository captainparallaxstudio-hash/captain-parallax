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

const W = 1080;
const H = 1920;
const FONT = "Impact, 'Arial Black', 'Helvetica Neue', Arial, sans-serif";

const rand = (seed: number) => {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

const clamp = (f: number, inp: number[], out: number[]) =>
  interpolate(f, inp, out, {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

const ease = (f: number, a: number, b: number) => {
  const t = clamp(f, [a, b], [0, 1]);
  return t * t * (3 - 2 * t);
};

const LINES = [
  'Rule one: when your shadow tears loose from the floor, never fight it.',
  'For three days we stomped and burned them, believing they wanted us dead.',
  'Then someone noticed: every shadow gripped an ankle, hauling us away from something invisible.',
  'Rule two: never pull free, because the invisible things stand exactly where you’re facing.',
  'Rule three: through thermal goggles they glow cold, so never walk toward the cold.',
  'Rule four: when your shadow goes limp, don’t turn around, because they’re already behind you.',
];

/* ───────────────────────── SHARED CINEMATIC LAYERS ───────────────────────── */

const MangaSpeedLines: React.FC<{f: number; color?: string; opacity?: number}> = ({
  f,
  color = '#ffffff',
  opacity = 0.16,
}) => {
  const lines = Array.from({length: 36}, (_, i) => {
    const angle = (i / 36) * Math.PI * 2 + (f % 3) * 0.04;
    const inner = 340 + rand(i * 7 + (f % 4)) * 180;
    const outer = 1150;
    return {
      x1: 540 + Math.cos(angle) * inner,
      y1: 860 + Math.sin(angle) * inner,
      x2: 540 + Math.cos(angle) * outer,
      y2: 860 + Math.sin(angle) * outer,
      w: 2 + rand(i + 11) * 5,
    };
  });

  return (
    <g opacity={opacity}>
      {lines.map((l, idx) => (
        <line
          key={idx}
          x1={l.x1}
          y1={l.y1}
          x2={l.x2}
          y2={l.y2}
          stroke={color}
          strokeWidth={l.w}
        />
      ))}
    </g>
  );
};

const AtmosphericRain: React.FC<{
  f: number;
  count?: number;
  blockers?: {x1: number; x2: number; topY: number}[];
}> = ({f, count = 65, blockers = []}) => {
  const drops = Array.from({length: count}, (_, i) => {
    const x = rand(i + 3) * 1160 - 40;
    const speed = 38 + rand(i + 19) * 20;
    const y = ((rand(i + 41) * 2100 + f * speed) % 2100) - 100;
    const len = 42 + rand(i + 73) * 35;
    return {x, y, len, i};
  });

  return (
    <g>
      {drops.map(({x, y, len, i}) => {
        const hit = blockers.find((b) => x >= b.x1 && x <= b.x2);
        if (hit && y + len >= hit.topY) {
          const splashR = ((y + len - hit.topY) % 24) * 1.4;
          return (
            <ellipse
              key={i}
              cx={x}
              cy={hit.topY}
              rx={splashR}
              ry={splashR * 0.3}
              fill="none"
              stroke="rgba(125, 211, 252, 0.75)"
              strokeWidth={2}
              opacity={Math.max(0, 1 - splashR / 32)}
            />
          );
        }
        return (
          <line
            key={i}
            x1={x}
            y1={y}
            x2={x - 9}
            y2={y + len}
            stroke="rgba(186, 230, 253, 0.24)"
            strokeWidth={2}
            strokeLinecap="round"
          />
        );
      })}
    </g>
  );
};

const AnimeCityBackdrop: React.FC<{
  f: number;
  panX?: number;
  crimsonMood?: number;
  thermal?: boolean;
}> = ({f, panX = 0, crimsonMood = 0, thermal = false}) => {
  const lampFlicker =
    rand(Math.floor(f / 3) + 19) > 0.91 ? 0.32 : 0.88 + Math.sin(f * 0.28) * 0.08;

  const buildings = Array.from({length: 11}, (_, i) => {
    const bx = i * 115 - 80 + panX * 0.35;
    const bw = 105 + rand(i + 2) * 30;
    const bh = 360 + rand(i + 8) * 420;
    const by = 1140 - bh;
    return {bx, bw, bh, by, i};
  });

  return (
    <g>
      <defs>
        <linearGradient id="animeSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={thermal ? '#04091e' : '#03050c'} />
          <stop
            offset="55%"
            stopColor={thermal ? '#0c2340' : crimsonMood > 0.4 ? '#2b0711' : '#0b132b'}
          />
          <stop
            offset="100%"
            stopColor={thermal ? '#164e63' : crimsonMood > 0.4 ? '#580c1f' : '#182447'}
          />
        </linearGradient>
        <radialGradient id="sodiumLight" cx="50%" cy="20%" r="75%">
          <stop
            offset="0%"
            stopColor={thermal ? '#22d3ee' : '#fde047'}
            stopOpacity={0.48 * lampFlicker}
          />
          <stop
            offset="45%"
            stopColor={thermal ? '#0284c7' : '#f59e0b'}
            stopOpacity={0.14 * lampFlicker}
          />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="wetRoad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={thermal ? '#082f49' : '#0b101d'} />
          <stop offset="100%" stopColor="#020308" />
        </linearGradient>
      </defs>

      {/* Sky */}
      <rect width={W} height={1160} fill="url(#animeSky)" />

      {/* Distant Moon / Glow */}
      {!thermal && (
        <g transform={`translate(${210 + panX * 0.12}, 290)`}>
          <circle r={130} fill="rgba(186, 230, 253, 0.08)" />
          <circle r={62} fill="#e0f2fe" opacity={0.85} />
        </g>
      )}

      {/* Midground Anime Buildings */}
      {buildings.map(({bx, bw, bh, by, i}) => (
        <g key={i}>
          <rect
            x={bx}
            y={by}
            width={bw}
            height={bh}
            fill={thermal ? '#07192c' : '#060913'}
            stroke={thermal ? '#0e7490' : '#172038'}
            strokeWidth={2}
          />
          {Array.from({length: 5}, (_, row) =>
            Array.from({length: 2}, (_, col) => {
              const lit = rand(i * 20 + row * 3 + col) > 0.68;
              if (!lit) return null;
              return (
                <rect
                  key={`${row}-${col}`}
                  x={bx + 18 + col * 38}
                  y={by + 28 + row * 56}
                  width={20}
                  height={28}
                  fill={thermal ? '#38bdf8' : row % 2 === 0 ? '#fef08a' : '#7dd3fc'}
                  opacity={0.38}
                />
              );
            }),
          )}
        </g>
      ))}

      {/* Streetlamp Cone */}
      <g transform={`translate(${panX * 0.7}, 0)`}>
        <polygon points="840,340 420,1240 1180,1240" fill="url(#sodiumLight)" />
        <rect x="834" y="330" width="14" height="830" fill="#03050a" />
        <path d="M 841 340 Q 810 315 765 335" stroke="#03050a" strokeWidth="12" fill="none" />
        <ellipse
          cx="765"
          cy="342"
          rx="26"
          ry="9"
          fill={thermal ? '#67e8f9' : '#fef9c3'}
          opacity={lampFlicker}
        />
      </g>

      {/* Wet Asphalt Foreground */}
      <rect x={0} y={1140} width={W} height={780} fill="url(#wetRoad)" />
      <line
        x1={0}
        y1={1140}
        x2={W}
        y2={1140}
        stroke={thermal ? '#22d3ee' : '#334155'}
        strokeWidth={4}
      />
      {/* Wet Light Reflections */}
      {Array.from({length: 8}, (_, k) => (
        <ellipse
          key={k}
          cx={750 + panX * 0.7 + (rand(k + 50) - 0.5) * 160}
          cy={1210 + k * 75}
          rx={40 + k * 14}
          ry={5}
          fill={thermal ? '#38bdf8' : '#fbbf24'}
          opacity={0.14 * lampFlicker}
        />
      ))}
    </g>
  );
};

/* Detailed Anime Trench-Coat / Hoodie Protagonist */
const AnimeProtagonist: React.FC<{
  x: number;
  y: number;
  scale?: number;
  lean?: number;
  f: number;
  panic?: boolean;
  thermal?: boolean;
}> = ({x, y, scale = 1, lean = 0, f, panic = false, thermal = false}) => {
  const coatFlutter = Math.sin(f * 0.35) * 8 + (panic ? Math.sin(f * 0.9) * 6 : 0);
  const hairFlutter = Math.cos(f * 0.4) * 5;
  const rim = thermal ? '#38bdf8' : '#7dd3fc';
  const coatFill = thermal ? '#f97316' : '#111827';
  const skinFill = thermal ? '#fef08a' : '#f1d5c4';

  return (
    <g
      transform={`translate(${x}, ${y}) scale(${scale}) rotate(${lean})`}
      style={{filter: `drop-shadow(4px -2px 6px ${rim})`}}
    >
      {/* Back Leg */}
      <path d="M -24 -220 L -6 -220 L -14 -15 L -38 -15 Z" fill="#090d16" />
      <path d="M -42 -15 L -10 -15 L 8 -2 L -42 -2 Z" fill="#03050a" />

      {/* Front Leg */}
      <path d="M 8 -220 L 28 -220 L 34 -15 L 10 -15 Z" fill="#1e293b" />
      <path d="M 8 -15 L 38 -15 L 58 -2 L 8 -2 Z" fill="#0f172a" />

      {/* Flowing Anime Coat Tails */}
      <path
        d={`M -34 -380 L -62 -170 Q ${-30 + coatFlutter} -155 -8 -175 L 6 -230 L 36 -175 Q ${
          52 + coatFlutter
        } -165 44 -380 Z`}
        fill={coatFill}
        stroke={rim}
        strokeWidth={2}
      />
      {/* High Collar */}
      <path
        d="M -28 -395 L -36 -362 L 34 -362 L 26 -395 Z"
        fill={thermal ? '#ea580c' : '#1e293b'}
        stroke={rim}
        strokeWidth={2}
      />

      {/* Torso & Belt */}
      <rect x="-26" y="-375" width="52" height="150" rx="8" fill={coatFill} />
      <rect x="-26" y="-250" width="52" height="12" fill={thermal ? '#fde047' : '#38bdf8'} opacity={0.85} />

      {/* Raised Defensive / Tense Arm */}
      <path
        d="M 18 -360 L 58 -310 L 36 -275"
        fill="none"
        stroke={coatFill}
        strokeWidth={22}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="34" cy="-272" r="10" fill={skinFill} />

      {/* Neck & Sharp Anime Jawline */}
      <rect x="-10" y="-408" width="20" height="24" fill={skinFill} />
      <path
        d="M -24 -448 L 24 -448 L 26 -414 L 4 -394 L -22 -412 Z"
        fill={skinFill}
      />

      {/* Spiky Wind-Swept Anime Hair */}
      <path
        d={`M -28 -432 C -38 -476 -4 -494 30 -474 C 42 -464 42 -442 32 -430 L 24 -448 L 12 -432 L 2 -452 L -10 -432 L -20 -448 Z`}
        fill={thermal ? '#fb923c' : '#090d16'}
      />
      <path
        d={`M -28 -446 L ${-64 + hairFlutter} -436 L -36 -426 L ${
          -68 + hairFlutter
        } -412 L -26 -414 Z`}
        fill={thermal ? '#fb923c' : '#090d16'}
      />

      {/* Glowing Anime Eye */}
      <polygon points="8,-434 26,-430 24,-422 8,-424" fill="#ffffff" />
      <circle cx="19" cy="-428" r={panic ? 4.5 : 3.5} fill={thermal ? '#22d3ee' : '#ef4444'} />
      <path d="M 4 -440 L 28 -434" stroke="#03050a" strokeWidth="3.5" strokeLinecap="round" />

      {/* Sweat Drop if panicking */}
      {panic && (
        <path
          d="M -10 -444 Q -16 -432 -10 -426 Q -4 -432 -10 -444 Z"
          fill="#bae6fd"
          opacity={0.9}
        />
      )}
    </g>
  );
};

/* Living Shadow Entity with Glowing Violet/Cyan Rim & Tendril Arms */
const LivingShadowEntity: React.FC<{
  x: number;
  y: number;
  targetAnkleX: number;
  targetAnkleY: number;
  f: number;
  riseProgress: number; // 0 = flat on floor, 1 = crouched pulling back
  limp?: number; // 0 = active grip, 1 = collapsed limp
}> = ({x, y, targetAnkleX, targetAnkleY, f, riseProgress, limp = 0}) => {
  const crouchY = y - riseProgress * 220 * (1 - limp);
  const crouchX = x - riseProgress * 40;
  const pulse = 0.7 + Math.sin(f * 0.4) * 0.25;
  const rimCol = limp > 0.5 ? '#475569' : '#a855f7';

  const handX = targetAnkleX - limp * 90;
  const handY = targetAnkleY + limp * 28;
  const ctrlX = (crouchX + handX) / 2;
  const ctrlY = crouchY - 95 * (1 - limp) + Math.sin(f * 0.5) * 8 * (1 - limp);

  return (
    <g style={{filter: limp > 0.5 ? 'none' : 'drop-shadow(0 0 10px rgba(168, 85, 247, 0.75))'}}>
      {/* Ground Pool */}
      <ellipse
        cx={x + 40}
        cy={y}
        rx={160 - riseProgress * 50}
        ry={16}
        fill="#020308"
        stroke={rimCol}
        strokeWidth={2}
        opacity={0.85}
      />

      {/* Shadow Torso & Hunched Head */}
      <path
        d={`M ${x - 20} ${y} Q ${crouchX - 45} ${crouchY + 40} ${crouchX - 10} ${
          crouchY - 40
        } Q ${crouchX + 45} ${crouchY - 30} ${x + 55} ${y} Z`}
        fill="#020308"
        stroke={rimCol}
        strokeWidth={2.5}
      />
      <circle
        cx={crouchX + 8}
        cy={crouchY - 68}
        r={34}
        fill="#020308"
        stroke={rimCol}
        strokeWidth={2.5}
      />

      {/* Glowing Eyes */}
      {limp < 0.7 && (
        <g opacity={(1 - limp) * pulse}>
          <ellipse cx={crouchX + 16} cy={crouchY - 72} rx={9} ry={4} fill="#f3e8ff" />
          <ellipse cx={crouchX + 32} cy={crouchY - 70} rx={7} ry={3.5} fill="#f3e8ff" />
        </g>
      )}

      {/* Tendril Arms Gripping the Ankle */}
      <path
        d={`M ${crouchX + 12} ${crouchY - 22} Q ${ctrlX} ${ctrlY} ${handX} ${handY}`}
        fill="none"
        stroke="#020308"
        strokeWidth={22}
        strokeLinecap="round"
      />
      <path
        d={`M ${crouchX + 12} ${crouchY - 22} Q ${ctrlX} ${ctrlY} ${handX} ${handY}`}
        fill="none"
        stroke={rimCol}
        strokeWidth={3}
        strokeLinecap="round"
      />
      {/* Shadow Claws Wrapped Around Ankle */}
      <ellipse cx={handX} cy={handY} rx={18} ry={13} fill="#020308" stroke={rimCol} strokeWidth={2} />
    </g>
  );
};

/* Towering Invisible Entity (Revealed via Rain Outline / Thermal / Crimson Flash) */
const InvisibleEntity: React.FC<{
  x: number;
  y: number;
  scale?: number;
  f: number;
  opacity: number;
  crimson?: boolean;
  facingLeft?: boolean;
}> = ({x, y, scale = 1, f, opacity, crimson = false, facingLeft = true}) => {
  if (opacity <= 0.02) return null;
  const sway = Math.sin(f * 0.08) * 6;
  const strokeCol = crimson ? '#ef4444' : '#38bdf8';
  const fillCol = crimson ? 'rgba(239, 68, 68, 0.22)' : 'rgba(56, 189, 248, 0.12)';
  const dir = facingLeft ? -1 : 1;

  return (
    <g
      transform={`translate(${x + sway}, ${y}) scale(${scale * dir}, ${scale})`}
      opacity={opacity}
      style={{filter: `drop-shadow(0 0 14px ${strokeCol})`}}
    >
      {/* Towering Elongated Silhouette */}
      <path
        d="M -45 0 L -36 -290 L -54 -520 Q 0 -610 54 -520 L 36 -290 L 45 0 Z"
        fill={fillCol}
        stroke={strokeCol}
        strokeWidth={3.5}
      />
      {/* Long Reaching Clawed Arm */}
      <path
        d="M 38 -460 Q 135 -420 215 -340"
        fill="none"
        stroke={strokeCol}
        strokeWidth={12}
        strokeLinecap="round"
      />
      {/* Slit Eyes */}
      <ellipse cx="18" cy="-515" rx="14" ry="5" fill="#ffffff" />
      <ellipse cx="-10" cy="-515" rx="11" ry="4" fill="#ffffff" />
    </g>
  );
};

/* ───────────────────────── HUD & SAFE SUBTITLES ───────────────────────── */

const RuleHeader: React.FC<{rule: string; title: string; color?: string; f: number}> = ({
  rule,
  title,
  color = '#ef4444',
  f,
}) => {
  const {fps} = useVideoConfig();
  const pop = spring({frame: f, fps, config: {damping: 12, stiffness: 180}});
  return (
    <div
      style={{
        position: 'absolute',
        top: 135,
        left: 60,
        right: 60,
        transform: `scale(${pop})`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          fontFamily: FONT,
          fontSize: 88,
          fontWeight: 900,
          color: '#ffffff',
          letterSpacing: 6,
          textShadow: `0 0 22px ${color}, 0 5px 0 #000`,
        }}
      >
        {rule}
      </div>
      <div
        style={{
          marginTop: 6,
          backgroundColor: 'rgba(2, 6, 15, 0.85)',
          border: `3px solid ${color}`,
          padding: '8px 26px',
          borderRadius: 8,
          fontFamily: FONT,
          fontSize: 38,
          fontWeight: 900,
          color,
          letterSpacing: 4,
        }}
      >
        {title}
      </div>
    </div>
  );
};

const SafeSubtitle: React.FC<{text: string; f: number; highlightCrimson?: boolean}> = ({
  text,
  f,
  highlightCrimson = false,
}) => {
  const words = text.split(' ');
  const activeIdx = Math.min(words.length - 1, Math.floor(clamp(f, [4, 205], [0, words.length])));

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 360,
        left: 60,
        right: 130,
        textAlign: 'center',
      }}
    >
      <span
        style={
          {
            backgroundColor: 'rgba(2, 6, 15, 0.78)',
            padding: '10px 20px',
            borderRadius: 12,
            boxDecorationBreak: 'clone',
            WebkitBoxDecorationBreak: 'clone',
            fontFamily: FONT,
            fontSize: 52,
            fontWeight: 900,
            lineHeight: 1.32,
            color: '#ffffff',
            textShadow: '0 4px 0 #000, 0 0 14px #000',
          } as React.CSSProperties
        }
      >
        {words.map((w, i) => (
          <span
            key={i}
            style={{
              color:
                i === activeIdx
                  ? highlightCrimson
                    ? '#ef4444'
                    : '#38bdf8'
                  : '#ffffff',
            }}
          >
            {w}{' '}
          </span>
        ))}
      </span>
    </div>
  );
};

/* ───────────────────────── 6 ISOLATED SCENES (225 FRAMES EACH) ───────────────────────── */

const Scene1: React.FC = () => {
  const f = useCurrentFrame();
  const zoom = clamp(f, [0, 225], [1, 1.09]);
  const rise = ease(f, 25, 95);
  const heroX = 590 - ease(f, 110, 225) * 65;

  return (
    <AbsoluteFill style={{backgroundColor: '#020308'}}>
      <svg viewBox="0 0 1080 1920" style={{width: '100%', height: '100%', transform: `scale(${zoom})`}}>
        <AnimeCityBackdrop f={f} panX={clamp(f, [0, 225], [0, -35])} />
        <MangaSpeedLines f={f} opacity={0.12} />
        <InvisibleEntity x={860} y={1140} scale={1.15} f={f} opacity={0.08} />
        <LivingShadowEntity
          x={350}
          y={1140}
          targetAnkleX={heroX - 18}
          targetAnkleY={1126}
          f={f}
          riseProgress={rise}
        />
        <AnimeProtagonist x={heroX} y={1140} scale={1.15} lean={-6 * rise} f={f} panic />
        <AtmosphericRain f={f} />
      </svg>
      <RuleHeader rule="RULE 01" title="NEVER FIGHT YOUR SHADOW" f={f} />
      <SafeSubtitle text={LINES[0]} f={f} />
    </AbsoluteFill>
  );
};

const Scene2: React.FC = () => {
  const f = useCurrentFrame();
  const zoom = clamp(f, [0, 225], [1.02, 1.12]);
  const shake = Math.sin(f * 1.8) * 5;

  return (
    <AbsoluteFill style={{backgroundColor: '#020308'}}>
      <svg
        viewBox="0 0 1080 1920"
        style={{width: '100%', height: '100%', transform: `translateX(${shake}px) scale(${zoom})`}}
      >
        <AnimeCityBackdrop f={f} panX={clamp(f, [0, 225], [-20, 30])} crimsonMood={0.65} />
        <MangaSpeedLines f={f} color="#f59e0b" opacity={0.16} />
        {/* Background Citizen */}
        <LivingShadowEntity x={210} y={1130} targetAnkleX={330} targetAnkleY={1118} f={f} riseProgress={1} />
        <AnimeProtagonist x={340} y={1130} scale={0.95} lean={-10} f={f} panic />
        {/* Foreground Hero Fighting Back */}
        <LivingShadowEntity x={450} y={1145} targetAnkleX={675} targetAnkleY={1132} f={f} riseProgress={1} />
        <AnimeProtagonist x={690} y={1145} scale={1.2} lean={10} f={f} panic />
        {/* Amber Fire Glow */}
        <circle cx={620} cy={1060} r={190} fill="rgba(245, 158, 11, 0.16)" />
        <AtmosphericRain f={f} count={80} />
      </svg>
      <RuleHeader rule="DAYS 01 – 03" title="WE THOUGHT THEY WANTED US DEAD" color="#f59e0b" f={f} />
      <SafeSubtitle text={LINES[1]} f={f} />
    </AbsoluteFill>
  );
};

const Scene3: React.FC = () => {
  const f = useCurrentFrame();
  // Dramatic zoom in on the ankle grip, then pull back to reveal rain splashing off invisible silhouette
  const zoom = f < 110 ? clamp(f, [0, 80], [1, 2.2]) : clamp(f, [110, 170], [2.2, 1.05]);
  const originX = f < 110 ? 520 : 650;
  const originY = f < 110 ? 1120 : 920;
  const reveal = ease(f, 115, 175);

  return (
    <AbsoluteFill style={{backgroundColor: '#020308'}}>
      <svg
        viewBox="0 0 1080 1920"
        style={{
          width: '100%',
          height: '100%',
          transformOrigin: `${originX}px ${originY}px`,
          transform: `scale(${zoom})`,
        }}
      >
        <AnimeCityBackdrop f={f} />
        <InvisibleEntity x={840} y={1140} scale={1.2} f={f} opacity={0.15 + reveal * 0.55} />
        <LivingShadowEntity x={320} y={1140} targetAnkleX={545} targetAnkleY={1126} f={f} riseProgress={1} />
        <AnimeProtagonist x={560} y={1140} scale={1.15} lean={-8} f={f} />
        <AtmosphericRain
          f={f}
          count={95}
          blockers={reveal > 0.2 ? [{x1: 775, x2: 905, topY: 510}] : []}
        />
        {/* Tactical Vector Arrows */}
        {f > 125 && (
          <g opacity={ease(f, 125, 145)}>
            <line x1="520" y1="1230" x2="290" y2="1230" stroke="#a855f7" strokeWidth="10" strokeLinecap="round" />
            <polygon points="270,1230 310,1208 310,1252" fill="#a855f7" />
            <text x="405" y="1205" fill="#e9d5ff" fontFamily={FONT} fontSize="34" textAnchor="middle">
              PULLING TO SAFETY
            </text>
          </g>
        )}
      </svg>
      <RuleHeader rule="THE REALIZATION" title="IT WAS SAVING YOU" color="#38bdf8" f={f} />
      <SafeSubtitle text={LINES[2]} f={f} />
    </AbsoluteFill>
  );
};

const Scene4: React.FC = () => {
  const f = useCurrentFrame();
  const reach = ease(f, 30, 160);
  const heroX = 560 + Math.sin(f * 0.2) * 18;

  return (
    <AbsoluteFill style={{backgroundColor: '#020308'}}>
      <svg viewBox="0 0 1080 1920" style={{width: '100%', height: '100%', transform: 'scale(1.06)'}}>
        <AnimeCityBackdrop f={f} crimsonMood={0.35} />
        <MangaSpeedLines f={f} color="#38bdf8" opacity={0.14} />
        <InvisibleEntity x={830 - reach * 70} y={1140} scale={1.22} f={f} opacity={0.55 + reach * 0.25} />
        <LivingShadowEntity x={310} y={1140} targetAnkleX={heroX - 18} targetAnkleY={1126} f={f} riseProgress={1} />
        <AnimeProtagonist x={heroX} y={1140} scale={1.15} lean={-12} f={f} panic />
        <AtmosphericRain f={f} blockers={[{x1: 700, x2: 860, topY: 500}]} />
      </svg>
      <RuleHeader rule="RULE 02" title="NEVER PULL FREE" f={f} />
      <SafeSubtitle text={LINES[3]} f={f} />
    </AbsoluteFill>
  );
};

const Scene5: React.FC = () => {
  const f = useCurrentFrame();
  const scanY = clamp(f, [0, 225], [240, 1580]);

  return (
    <AbsoluteFill style={{backgroundColor: '#020917'}}>
      <svg viewBox="0 0 1080 1920" style={{width: '100%', height: '100%'}}>
        <AnimeCityBackdrop f={f} thermal />
        <InvisibleEntity x={810} y={1140} scale={1.25} f={f} opacity={0.92} />
        <LivingShadowEntity x={290} y={1140} targetAnkleX={525} targetAnkleY={1126} f={f} riseProgress={1} />
        <AnimeProtagonist x={540} y={1140} scale={1.15} lean={-7} f={f} thermal />

        {/* Thermal Goggles HUD Overlay */}
        <rect
          x={65}
          y={250}
          width={950}
          height={1280}
          rx={70}
          fill="none"
          stroke="#22d3ee"
          strokeWidth={6}
        />
        <line x1={65} y1={scanY} x2={1015} y2={scanY} stroke="#22d3ee" strokeWidth={4} opacity={0.7} />
        <text x={110} y={325} fill="#22d3ee" fontFamily="monospace" fontSize="32" fontWeight="bold">
          IR-THERMAL // ANOMALY TEMP: -14°C
        </text>
        <text x={810} y={480} fill="#38bdf8" fontFamily={FONT} fontSize="36" textAnchor="middle">
          COLD ENTITY
        </text>
      </svg>
      <RuleHeader rule="RULE 03" title="NEVER WALK TOWARD THE COLD" color="#22d3ee" f={f} />
      <SafeSubtitle text={LINES[4]} f={f} />
    </AbsoluteFill>
  );
};

const Scene6: React.FC = () => {
  const f = useCurrentFrame();
  const limp = ease(f, 15, 65);
  const climax = f >= 75; // Exact frame 1200 (0:40.0)
  const flashOpacity = climax ? clamp(f, [75, 83, 102], [0.92, 0.35, 0.14]) : 0;
  const joltX = climax && f < 98 ? Math.sin(f * 3.1) * 18 : 0;
  const zoom = climax ? clamp(f, [75, 225], [1.08, 1.24]) : 1.02;

  return (
    <AbsoluteFill style={{backgroundColor: '#090205'}}>
      <svg
        viewBox="0 0 1080 1920"
        style={{
          width: '100%',
          height: '100%',
          transform: `translateX(${joltX}px) scale(${zoom})`,
        }}
      >
        <AnimeCityBackdrop f={f} crimsonMood={climax ? 1 : 0.2} />
        {climax && <MangaSpeedLines f={f} color="#ef4444" opacity={0.28} />}

        {/* Shadow Goes Completely Limp */}
        <LivingShadowEntity
          x={430}
          y={1140}
          targetAnkleX={625}
          targetAnkleY={1126}
          f={f}
          riseProgress={1}
          limp={limp}
        />

        {/* Protagonist Frozen in Terror */}
        <AnimeProtagonist x={640} y={1140} scale={1.16} lean={0} f={f} panic={climax} />

        {/* Towering Crimson Entity Looming Directly BEHIND Him */}
        {climax && (
          <InvisibleEntity
            x={390}
            y={1140}
            scale={1.34}
            f={f}
            opacity={ease(f, 75, 88)}
            crimson
            facingLeft={false}
          />
        )}

        <AtmosphericRain f={f} count={85} />

        {/* Crimson Impact Flash */}
        <rect width={W} height={H} fill="#ef4444" opacity={flashOpacity} />
      </svg>
      <RuleHeader
        rule="RULE 04"
        title={climax ? "DON'T TURN AROUND" : 'WHEN IT GOES LIMP...'}
        color="#ef4444"
        f={f}
      />
      <SafeSubtitle text={LINES[5]} f={f} highlightCrimson />
    </AbsoluteFill>
  );
};

/* ───────────────────────── ROOT COMPOSITION (ID="MainComp") ───────────────────────── */

const HorrorShort: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#000000'}}>
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
  <Composition
    id="MainComp"
    component={HorrorShort}
    width={1080}
    height={1920}
    fps={30}
    durationInFrames={1350}
  />
);
