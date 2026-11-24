import React from 'react';
import {
  Composition,
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
  Sequence,
} from 'remotion';

// --- ARTICULATED ANIMATED CHARACTER COMPONENT ---
const AnimatedCharacter: React.FC<{
  x: number;
  y: number;
  scale?: number;
  facing?: 1 | -1;
  pose?: 'idle' | 'walk' | 'reach' | 'recoil' | 'mimic';
  accentColor?: string;
  isShadowEntity?: boolean;
}> = ({
  x,
  y,
  scale = 1,
  facing = 1,
  pose = 'idle',
  accentColor = '#38BDF8',
  isShadowEntity = false,
}) => {
  const frame = useCurrentFrame();
  const breath = Math.sin(frame * 0.12) * 3;
  const walk = pose === 'walk' ? Math.sin(frame * 0.28) : 0;
  const twitch = isShadowEntity ? Math.sin(frame * 0.7) * 6 : 0;

  const bodyFill = isShadowEntity ? '#030305' : '#0F172A';
  const strokeCol = isShadowEntity ? '#EF4444' : '#E2E8F0';
  const strokeW = isShadowEntity ? 4 : 5;

  // Dynamic torso lean
  const torsoLean =
    pose === 'recoil' ? -14 : pose === 'reach' ? 10 : pose === 'mimic' ? 18 : 0;

  return (
    <g
      transform={`translate(${x}, ${y}) scale(${scale * facing}, ${scale})`}
      style={{
        filter: isShadowEntity
          ? 'drop-shadow(0 0 18px rgba(239, 68, 68, 0.75))'
          : 'drop-shadow(0 12px 14px rgba(0, 0, 0, 0.85))',
      }}
    >
      {/* Ground Contact Shadow */}
      <ellipse cx={0} cy={92} rx={42} ry={10} fill="rgba(0,0,0,0.65)" />

      {/* Back Leg (Thigh + Calf) */}
      <path
        d={`M -6 10 L ${-14 - walk * 22} 52 L ${-18 - walk * 28} 90`}
        fill="none"
        stroke="#64748B"
        strokeWidth={11}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Front Leg (Thigh + Calf) */}
      <path
        d={`M 6 10 L ${14 + walk * 24} 52 L ${12 + walk * 28} 90`}
        fill="none"
        stroke={isShadowEntity ? '#18181B' : '#CBD5E1'}
        strokeWidth={11}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Upper Body Group (Breathing + Leaning) */}
      <g transform={`translate(0, ${breath}) rotate(${torsoLean})`}>
        {/* Hoodie / Coat Silhouette */}
        <path
          d={
            isShadowEntity
              ? 'M -20 -75 L 22 -75 L 16 16 L -16 16 Z'
              : 'M -22 -72 Q 0 -80 22 -72 L 26 16 L -26 16 Z'
          }
          fill={bodyFill}
          stroke={strokeCol}
          strokeWidth={strokeW}
          strokeLinejoin="round"
        />

        {/* Hoodie Collar / Chest Accent */}
        {!isShadowEntity && (
          <path
            d="M -10 -70 L 0 -52 L 10 -70"
            fill="none"
            stroke={accentColor}
            strokeWidth={3.5}
          />
        )}

        {/* Back Arm */}
        <path
          d={`M -16 -62 L ${-28 - walk * 15} -25 L ${-22 - walk * 18} 8`}
          fill="none"
          stroke="#64748B"
          strokeWidth={9}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Front Arm (Pose-driven) */}
        <path
          d={
            pose === 'reach'
              ? 'M 16 -62 L 48 -56 L 76 -64'
              : pose === 'recoil'
              ? 'M 16 -62 L 38 -82 L 26 -106'
              : pose === 'mimic'
              ? `M 16 -62 L 54 -35 L 82 ${-10 + twitch}`
              : `M 16 -62 L ${26 + walk * 15} -25 L ${22 + walk * 18} 8`
          }
          fill="none"
          stroke={isShadowEntity ? '#18181B' : '#E2E8F0'}
          strokeWidth={9}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Head & Hair Silhouette */}
        <g transform={`translate(0, -104) rotate(${twitch})`}>
          <circle
            cx={0}
            cy={0}
            r={isShadowEntity ? 26 : 24}
            fill={bodyFill}
            stroke={strokeCol}
            strokeWidth={strokeW}
          />
          {/* Stylized Hair Spikes for Protagonist */}
          {!isShadowEntity && (
            <path
              d="M -24 -6 Q -20 -32 4 -30 Q 22 -30 24 -8 Q 10 -20 -4 -18 Q -15 -18 -24 -6 Z"
              fill={accentColor}
            />
          )}
          {/* Expressive Eyes */}
          {isShadowEntity ? (
            <>
              <ellipse cx={8} cy={-2} rx={5} ry={3} fill="#EF4444" />
              <path
                d="M 2 10 Q 12 18 20 8"
                fill="none"
                stroke="#EF4444"
                strokeWidth={3}
                strokeLinecap="round"
              />
            </>
          ) : (
            <>
              <circle
                cx={10}
                cy={-2}
                r={pose === 'recoil' ? 4.5 : 3.2}
                fill="#F8FAFC"
              />
              {pose === 'recoil' && (
                <circle cx={10} cy={-2} r={1.5} fill="#0F172A" />
              )}
            </>
          )}
        </g>
      </g>
    </g>
  );
};

// --- CINEMATIC PARALLAX LAUNDROMAT ENVIRONMENT ---
const CinematicLaundromat: React.FC<{
  cameraX: number;
  cameraZoom?: number;
  horrorMode?: boolean;
}> = ({ cameraX, cameraZoom = 1, horrorMode = false }) => {
  const frame = useCurrentFrame();
  const lampSway = Math.sin(frame * 0.06) * 3.5;
  const lightFlicker =
    horrorMode && Math.sin(frame * 1.4) > 0.78 ? 0.35 : 0.95;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#03050A',
        overflow: 'hidden',
        transform: `scale(${cameraZoom})`,
      }}
    >
      {/* LAYER 1 (FAR): Rain-Streaked Night Street & Neon Reflections */}
      <div
        style={{
          position: 'absolute',
          top: 180,
          left: -200 + cameraX * 0.25,
          width: 1600,
          height: 640,
          background: horrorMode
            ? 'linear-gradient(180deg, #1F0508 0%, #090305 100%)'
            : 'linear-gradient(180deg, #0B132B 0%, #060913 100%)',
          borderTop: '10px solid #1E293B',
          borderBottom: '10px solid #1E293B',
        }}
      >
        {/* Distant Streetlight Glow */}
        <div
          style={{
            position: 'absolute',
            left: 420,
            top: 90,
            width: 260,
            height: 260,
            borderRadius: '50%',
            background: horrorMode
              ? 'radial-gradient(circle, rgba(239,68,68,0.28), transparent 70%)'
              : 'radial-gradient(circle, rgba(56,189,248,0.22), transparent 70%)',
          }}
        />
        {/* Diagonal Wind-Driven Rain */}
        {Array.from({ length: 28 }).map((_, i) => {
          const ry = ((frame * 30 + i * 77) % 640) - 40;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: 40 + i * 54,
                top: ry,
                width: 2,
                height: 46,
                backgroundColor: horrorMode ? '#FCA5A5' : '#7DD3FC',
                opacity: 0.22,
                transform: 'rotate(14deg)',
              }}
            />
          );
        })}
      </div>

      {/* LAYER 2 (MID): Detailed Washing Machines with Tumbling Laundry */}
      <svg
        width="1600"
        height="1920"
        style={{
          position: 'absolute',
          left: -160 + cameraX * 0.65,
          top: 0,
        }}
      >
        {[0, 1, 2, 3, 4].map((i) => {
          const mx = 140 + i * 270;
          const my = 790;
          return (
            <g key={i}>
              {/* Machine Casing */}
              <rect
                x={mx}
                y={my}
                width={230}
                height={350}
                rx={18}
                fill="#0F172A"
                stroke="#1E293B"
                strokeWidth={5}
              />
              {/* Control Panel Strip */}
              <rect
                x={mx + 16}
                y={my + 18}
                width={198}
                height={36}
                rx={8}
                fill="#020617"
              />
              <circle
                cx={mx + 185}
                cy={my + 36}
                r={7}
                fill={horrorMode ? '#EF4444' : '#22C55E'}
              />
              {/* Glowing Drum */}
              <circle
                cx={mx + 115}
                cy={my + 195}
                r={78}
                fill="#020617"
                stroke={horrorMode ? '#991B1B' : '#334155'}
                strokeWidth={10}
              />
              {/* Spinning Water & Clothes */}
              <path
                d={`M ${mx + 60} ${my + 195} Q ${mx + 115} ${my + 155} ${mx + 170} ${my + 195}`}
                fill="none"
                stroke={horrorMode ? '#EF4444' : '#38BDF8'}
                strokeWidth={8}
                strokeLinecap="round"
                opacity={0.45}
                transform={`rotate(${frame * 6 + i * 65}, ${mx + 115}, ${my + 195})`}
              />
            </g>
          );
        })}

        {/* Perspective Floor */}
        <rect x={0} y={1140} width={1800} height={780} fill="#04060C" />
        <line
          x1={0}
          y1={1140}
          x2={1800}
          y2={1140}
          stroke="#1E293B"
          strokeWidth={5}
        />
      </svg>

      {/* LAYER 3 (VOLUMETRIC LIGHTING): Swinging Overhead Lamp */}
      <div
        style={{
          position: 'absolute',
          top: -40,
          left: 140 + cameraX * 0.4,
          width: 800,
          height: 1300,
          transformOrigin: 'top center',
          transform: `rotate(${lampSway}deg)`,
          background: horrorMode
            ? 'conic-gradient(from 155deg at 50% 0%, transparent 0deg, rgba(239,68,68,0.22) 25deg, transparent 50deg)'
            : 'conic-gradient(from 155deg at 50% 0%, transparent 0deg, rgba(56,189,248,0.16) 25deg, transparent 50deg)',
          opacity: lightFlicker,
          pointerEvents: 'none',
        }}
      />

      {/* Cinematic Dark Vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at center, transparent 42%, rgba(0,0,0,0.88) 100%)',
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};

// --- SLEEK FILM SUBTITLE COMPONENT ---
const FilmSubtitle: React.FC<{ line1: string; line2?: string; danger?: boolean }> = ({
  line1,
  line2,
  danger = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rise = spring({ frame, fps, config: { damping: 16 } });

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 240,
        left: 60,
        right: 60,
        transform: `translateY(${(1 - rise) * 24}px)`,
        opacity: rise,
        textAlign: 'center',
        zIndex: 40,
      }}
    >
      <div
        style={{
          display: 'inline-block',
          backgroundColor: 'rgba(2, 6, 23, 0.82)',
          backdropFilter: 'blur(6px)',
          padding: '18px 30px',
          borderRadius: 16,
          borderLeft: `6px solid ${danger ? '#EF4444' : '#38BDF8'}`,
        }}
      >
        <div
          style={{
            color: '#F8FAFC',
            fontSize: 40,
            fontWeight: 800,
            fontFamily: 'sans-serif',
            letterSpacing: 0.5,
          }}
        >
          {line1}
        </div>
        {line2 && (
          <div
            style={{
              color: danger ? '#F87171' : '#38BDF8',
              fontSize: 38,
              fontWeight: 900,
              fontFamily: 'sans-serif',
              marginTop: 6,
            }}
          >
            {line2}
          </div>
        )}
      </div>
    </div>
  );
};

// --- MAIN EPISODE COMPOSITION ---
const NightShiftRules: React.FC = () => {
  const frame = useCurrentFrame();

  // Subtle camera shake during final horror reveal
  const shakeX = frame >= 960 ? Math.sin(frame * 1.9) * 6 : 0;
  const shakeY = frame >= 960 ? Math.cos(frame * 2.3) * 4 : 0;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#020408',
        transform: `translate(${shakeX}px, ${shakeY}px)`,
      }}
    >
      {/* Minimal Top Series Tag */}
      <div
        style={{
          position: 'absolute',
          top: 72,
          left: 0,
          right: 0,
          textAlign: 'center',
          zIndex: 50,
          color: 'rgba(226, 232, 240, 0.55)',
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: 6,
          fontFamily: 'sans-serif',
        }}
      >
        CAPTAIN PARALLAX
      </div>

      {/* SCENE 1 (0–7s): Manager hands Leo the laminated card */}
      <Sequence from={0} durationInFrames={210}>
        <CinematicLaundromat
          cameraX={interpolate(frame, [0, 210], [0, -70])}
          cameraZoom={interpolate(frame, [0, 210], [1, 1.05])}
        />
        <svg width="1080" height="1920" style={{ position: 'absolute' }}>
          <AnimatedCharacter
            x={360}
            y={960}
            scale={2.15}
            facing={1}
            pose="reach"
            accentColor="#38BDF8"
          />
          <AnimatedCharacter
            x={730}
            y={960}
            scale={2.25}
            facing={-1}
            pose="reach"
            accentColor="#94A3B8"
          />
          {/* Glowing Laminated Rule Card */}
          <rect
            x={522}
            y={815}
            width={46}
            height={62}
            rx={6}
            fill="#FACC15"
            stroke="#FEF08A"
            strokeWidth={3}
          />
        </svg>
        <FilmSubtitle
          line1="OVERNIGHT SHIFT — 11:55 PM"
          line2="“FOLLOW EVERY RULE ON THIS CARD.”"
        />
      </Sequence>

      {/* SCENE 2 (7–15s): Close-up on the front of the Rules Card */}
      <Sequence from={210} durationInFrames={240}>
        <CinematicLaundromat cameraX={-70} cameraZoom={1.08} />
        <div
          style={{
            position: 'absolute',
            top: 340,
            left: 115,
            right: 115,
            backgroundColor: '#FEF9C3',
            border: '6px solid #A16207',
            borderRadius: 20,
            padding: '44px 40px',
            color: '#0F172A',
            fontFamily: 'monospace',
            boxShadow: '0 30px 70px rgba(0,0,0,0.9)',
            transform: 'rotate(-1.5deg)',
          }}
        >
          <div
            style={{
              fontSize: 36,
              fontWeight: 900,
              borderBottom: '4px solid #0F172A',
              paddingBottom: 12,
              marginBottom: 24,
            }}
          >
            EMPLOYEE RULES (FRONT)
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 20 }}>
            1. Ignore anyone in a yellow coat.
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 20 }}>
            2. Lock the back door at midnight.
          </div>
          <div style={{ fontSize: 32, fontWeight: 700 }}>
            3. Never look inside Dryer #4.
          </div>
        </div>
        <FilmSubtitle
          line1="LEO SKIMMED THE FRONT..."
          line2="HE NEVER CHECKED THE BACK."
        />
      </Sequence>

      {/* SCENE 3 (15–23s): Card drops on the floor; clock hits 02:15 AM */}
      <Sequence from={450} durationInFrames={240}>
        <CinematicLaundromat
          cameraX={interpolate(frame - 450, [0, 240], [-70, -140])}
        />
        <svg width="1080" height="1920" style={{ position: 'absolute' }}>
          <AnimatedCharacter
            x={520}
            y={960}
            scale={2.2}
            facing={1}
            pose="idle"
            accentColor="#38BDF8"
          />
          {/* Card falling face-down */}
          <rect
            x={640}
            y={interpolate(frame - 450, [0, 75], [840, 1130], {
              extrapolateRight: 'clamp',
            })}
            width={56}
            height={28}
            rx={4}
            fill="#FACC15"
            transform={`rotate(${interpolate(frame - 450, [0, 75], [10, 90])}, 660, 980)`}
          />
        </svg>
        <div
          style={{
            position: 'absolute',
            top: 210,
            right: 100,
            backgroundColor: 'rgba(2, 6, 23, 0.85)',
            border: '3px solid #38BDF8',
            borderRadius: 12,
            padding: '14px 26px',
            color: '#38BDF8',
            fontSize: 40,
            fontWeight: 900,
            fontFamily: 'monospace',
          }}
        >
          02:15 AM
        </div>
        <FilmSubtitle
          line1="HE TOSSED THE CARD ASIDE."
          line2="RULE #4 STAYED HIDDEN."
        />
      </Sequence>

      {/* SCENE 4 (23–32s): Friend knocks on the front glass in the rain */}
      <Sequence from={690} durationInFrames={270}>
        <CinematicLaundromat
          cameraX={interpolate(frame - 690, [0, 270], [-140, -40])}
        />
        <svg width="1080" height="1920" style={{ position: 'absolute' }}>
          {/* Glass Storefront Divider */}
          <rect
            x={540}
            y={320}
            width={14}
            height={820}
            fill="#38BDF8"
            opacity={0.45}
          />
          {/* Leo walking toward door */}
          <AnimatedCharacter
            x={interpolate(frame - 690, [0, 200], [280, 410], {
              extrapolateRight: 'clamp',
            })}
            y={960}
            scale={2.2}
            facing={1}
            pose="walk"
            accentColor="#38BDF8"
          />
          {/* Figure outside pretending to be Marcus */}
          <AnimatedCharacter
            x={730}
            y={960}
            scale={2.25}
            facing={-1}
            pose="reach"
            accentColor="#94A3B8"
          />
        </svg>
        <FilmSubtitle
          line1="HIS BEST FRIEND MARCUS KNOCKED:"
          line2="“MY CAR DIED — LET ME IN!”"
        />
      </Sequence>

      {/* SCENE 5 (32–39s): Door unlocks — lights turn crimson, silhouette distorts */}
      <Sequence from={960} durationInFrames={210}>
        <CinematicLaundromat
          cameraX={-40}
          cameraZoom={interpolate(frame - 960, [0, 210], [1.02, 1.12])}
          horrorMode={true}
        />
        <svg width="1080" height="1920" style={{ position: 'absolute' }}>
          <AnimatedCharacter
            x={interpolate(frame - 960, [0, 210], [410, 310])}
            y={960}
            scale={2.2}
            facing={1}
            pose="recoil"
            accentColor="#38BDF8"
          />
          <AnimatedCharacter
            x={interpolate(frame - 960, [0, 210], [720, 560])}
            y={935}
            scale={2.5}
            facing={-1}
            pose="mimic"
            isShadowEntity={true}
          />
        </svg>
        <FilmSubtitle
          line1="LEO UNLOCKED THE DOOR..."
          line2="AND GLANCED DOWN AT THE FLOOR."
          danger={true}
        />
      </Sequence>

      {/* SCENE 6 (39–45s): Final Twist — Back of the Card */}
      <Sequence from={1170} durationInFrames={180}>
        <CinematicLaundromat cameraX={0} cameraZoom={1.1} horrorMode={true} />
        <div
          style={{
            position: 'absolute',
            top: 320,
            left: 105,
            right: 105,
            backgroundColor: '#2A0408',
            border: '6px solid #EF4444',
            borderRadius: 20,
            padding: '46px 40px',
            color: '#FEF2F2',
            fontFamily: 'monospace',
            boxShadow: '0 0 70px rgba(239, 68, 68, 0.7)',
            transform: 'rotate(1.5deg)',
          }}
        >
          <div
            style={{
              fontSize: 34,
              fontWeight: 900,
              color: '#FCA5A5',
              marginBottom: 20,
            }}
          >
            RULE 4 (BACK OF CARD):
          </div>
          <div style={{ fontSize: 37, fontWeight: 900, lineHeight: 1.35 }}>
            “NEVER OPEN THE DOOR FOR MARCUS. HE DIED IN A CRASH 3 YEARS AGO.”
          </div>
        </div>
        <FilmSubtitle
          line1="THE THING SMILING AT HIM..."
          line2="WAS NOT HIS FRIEND."
          danger={true}
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="MainComp"
      component={NightShiftRules}
      durationInFrames={1350}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
