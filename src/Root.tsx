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

// --- REUSABLE STICK FIGURE COMPONENT ---
const StickFigure: React.FC<{
  x: number;
  y: number;
  scale?: number;
  color?: string;
  walkCycle?: number;
  armRaise?: number; // 0 = down, 1 = raised/pointing
  headTilt?: number;
  glow?: boolean;
}> = ({
  x,
  y,
  scale = 1,
  color = '#F8FAFC',
  walkCycle = 0,
  armRaise = 0,
  headTilt = 0,
  glow = false,
}) => {
  const legSwing = Math.sin(walkCycle) * 22;
  const armSwing = Math.cos(walkCycle) * 18;

  return (
    <g
      transform={`translate(${x}, ${y}) scale(${scale})`}
      style={{
        filter: glow ? `drop-shadow(0 0 12px ${color})` : undefined,
      }}
    >
      {/* Head */}
      <circle
        cx={0}
        cy={-115}
        r={24}
        fill="#090D16"
        stroke={color}
        strokeWidth={6}
        transform={`rotate(${headTilt}, 0, -115)`}
      />
      {/* Torso */}
      <line
        x1={0}
        y1={-91}
        x2={0}
        y2={-20}
        stroke={color}
        strokeWidth={6}
        strokeLinecap="round"
      />
      {/* Left Arm */}
      <line
        x1={0}
        y1={-78}
        x2={-28 + armSwing}
        y2={-32}
        stroke={color}
        strokeWidth={6}
        strokeLinecap="round"
      />
      {/* Right Arm (can raise) */}
      <line
        x1={0}
        y1={-78}
        x2={28 - armSwing + armRaise * 18}
        y2={-32 - armRaise * 65}
        stroke={color}
        strokeWidth={6}
        strokeLinecap="round"
      />
      {/* Left Leg */}
      <line
        x1={0}
        y1={-20}
        x2={-22 - legSwing}
        y2={45}
        stroke={color}
        strokeWidth={6}
        strokeLinecap="round"
      />
      {/* Right Leg */}
      <line
        x1={0}
        y1={-20}
        x2={22 + legSwing}
        y2={45}
        stroke={color}
        strokeWidth={6}
        strokeLinecap="round"
      />
    </g>
  );
};

// --- PARALLAX LAUNDROMAT BACKGROUND ---
const LaundromatBg: React.FC<{ panX: number; redAlert?: boolean }> = ({
  panX,
  redAlert = false,
}) => {
  const frame = useCurrentFrame();
  const flicker = Math.sin(frame * 0.9) > 0.88 ? 0.55 : 1;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: redAlert ? '#1A0508' : '#070B14',
        overflow: 'hidden',
      }}
    >
      {/* Far Parallax Layer: Night Rain Window */}
      <div
        style={{
          position: 'absolute',
          top: 160,
          left: -120 + panX * 0.3,
          width: 1400,
          height: 520,
          backgroundColor: redAlert ? '#2B090E' : '#0F172A',
          borderTop: '8px solid #1E293B',
          borderBottom: '8px solid #1E293B',
          opacity: 0.9,
        }}
      >
        {/* Rain Streaks */}
        {Array.from({ length: 18 }).map((_, i) => {
          const rainY = ((frame * 24 + i * 95) % 520) - 40;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: 60 + i * 74,
                top: rainY,
                width: 3,
                height: 38,
                backgroundColor: redAlert ? '#F87171' : '#38BDF8',
                opacity: 0.28,
                transform: 'rotate(12deg)',
              }}
            />
          );
        })}
      </div>

      {/* Mid Parallax Layer: Row of Industrial Washing Machines */}
      <svg
        width="1400"
        height="1920"
        style={{
          position: 'absolute',
          left: -100 + panX * 0.65,
          top: 0,
        }}
      >
        {[0, 1, 2, 3, 4].map((idx) => {
          const mx = 120 + idx * 240;
          const my = 780;
          return (
            <g key={idx}>
              <rect
                x={mx}
                y={my}
                width={200}
                height={320}
                rx={16}
                fill="#111827"
                stroke="#334155"
                strokeWidth={5}
              />
              <circle
                cx={mx + 100}
                cy={my + 155}
                r={68}
                fill="#030712"
                stroke={redAlert ? '#EF4444' : '#38BDF8'}
                strokeWidth={5}
                opacity={flicker}
              />
              <circle
                cx={mx + 100}
                cy={my + 155}
                r={48}
                fill="none"
                stroke="#1E293B"
                strokeWidth={3}
                strokeDasharray="14 10"
                transform={`rotate(${frame * 3 + idx * 40}, ${mx + 100}, ${my + 155})`}
              />
            </g>
          );
        })}
        {/* Floor Line */}
        <rect x={0} y={1100} width={1600} height={820} fill="#050811" />
        <line
          x1={0}
          y1={1100}
          x2={1600}
          y2={1100}
          stroke="#334155"
          strokeWidth={6}
        />
      </svg>

      {/* Overhead Fluorescent Light Cone */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 140 + panX * 0.5,
          width: 800,
          height: 1100,
          background: redAlert
            ? 'radial-gradient(ellipse at top, rgba(239,68,68,0.22), transparent 72%)'
            : 'radial-gradient(ellipse at top, rgba(56,189,248,0.16), transparent 72%)',
          opacity: flicker,
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};

// --- KINETIC CAPTION BAR ---
const CaptionBox: React.FC<{ text: string; highlight?: string; danger?: boolean }> = ({
  text,
  highlight,
  danger = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 14 } });

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 220,
        left: 70,
        right: 70,
        transform: `scale(${pop})`,
        backgroundColor: 'rgba(5, 8, 17, 0.86)',
        border: `3px solid ${danger ? '#EF4444' : '#38BDF8'}`,
        borderRadius: 24,
        padding: '28px 34px',
        textAlign: 'center',
        boxShadow: danger
          ? '0 0 35px rgba(239,68,68,0.45)'
          : '0 12px 30px rgba(0,0,0,0.65)',
      }}
    >
      <div
        style={{
          color: '#F8FAFC',
          fontSize: 44,
          fontWeight: 800,
          fontFamily: 'sans-serif',
          lineHeight: 1.28,
        }}
      >
        {text}
      </div>
      {highlight && (
        <div
          style={{
            color: danger ? '#F87171' : '#38BDF8',
            fontSize: 38,
            fontWeight: 900,
            fontFamily: 'sans-serif',
            marginTop: 12,
            letterSpacing: 1.5,
          }}
        >
          {highlight}
        </div>
      )}
    </div>
  );
};

// --- MAIN EPISODE COMPOSITION ---
const NightShiftRules: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ backgroundColor: '#050811' }}>
      {/* Top Channel Watermark */}
      <div
        style={{
          position: 'absolute',
          top: 75,
          left: 0,
          right: 0,
          textAlign: 'center',
          zIndex: 50,
          color: 'rgba(148,163,184,0.75)',
          fontSize: 24,
          fontWeight: 800,
          letterSpacing: 5,
          fontFamily: 'sans-serif',
        }}
      >
        CAPTAIN PARALLAX // ARCHIVE 01
      </div>

      {/* SCENE 1 (0s - 7s): Hook - Manager hands Leo the rules */}
      <Sequence from={0} durationInFrames={210}>
        <LaundromatBg panX={interpolate(frame, [0, 210], [0, -80])} />
        <svg width="1080" height="1920" style={{ position: 'absolute' }}>
          {/* Leo */}
          <StickFigure
            x={380}
            y={1010}
            scale={2.1}
            color="#38BDF8"
            armRaise={0.4}
          />
          {/* Manager handing card */}
          <StickFigure
            x={700}
            y={1010}
            scale={2.15}
            color="#94A3B8"
            armRaise={0.7}
          />
          {/* Glowing Rule Card */}
          <rect
            x={515}
            y={825}
            width={52}
            height={68}
            rx={6}
            fill="#FACC15"
          />
        </svg>
        <CaptionBox
          text="24-HOUR LAUNDROMAT — NIGHT SHIFT"
          highlight="“FOLLOW ALL 4 RULES.”"
        />
      </Sequence>

      {/* SCENE 2 (7s - 15s): Close-up on the Laminated Rules Card */}
      <Sequence from={210} durationInFrames={240}>
        <LaundromatBg panX={-80} />
        <div
          style={{
            position: 'absolute',
            top: 340,
            left: 110,
            right: 110,
            backgroundColor: '#FEF9C3',
            border: '8px solid #CA8A04',
            borderRadius: 24,
            padding: '44px 42px',
            color: '#0F172A',
            fontFamily: 'monospace',
            boxShadow: '0 25px 60px rgba(0,0,0,0.85)',
          }}
        >
          <div style={{ fontSize: 38, fontWeight: 900, marginBottom: 24, borderBottom: '4px solid #0F172A', paddingBottom: 12 }}>
            SHIFT RULES (FRONT)
          </div>
          <div style={{ fontSize: 33, fontWeight: 700, marginBottom: 20 }}>
            1. Never speak to anyone in a yellow raincoat.
          </div>
          <div style={{ fontSize: 33, fontWeight: 700, marginBottom: 20 }}>
            2. Lock the back door at 12:00 AM.
          </div>
          <div style={{ fontSize: 33, fontWeight: 700 }}>
            3. Ignore tapping on the dryer glass.
          </div>
        </div>
        <CaptionBox
          text="LEO SKIMMED THE FRONT PAGE..."
          highlight="HE NEVER FLIPPED IT OVER."
        />
      </Sequence>

      {/* SCENE 3 (15s - 23s): Leo tosses the card under the counter */}
      <Sequence from={450} durationInFrames={240}>
        <LaundromatBg panX={interpolate(frame - 450, [0, 240], [-80, -160])} />
        <svg width="1080" height="1920" style={{ position: 'absolute' }}>
          <StickFigure
            x={540}
            y={1010}
            scale={2.2}
            color="#38BDF8"
            headTilt={12}
          />
          {/* Falling Card */}
          <rect
            x={640}
            y={interpolate(frame - 450, [0, 90], [840, 1085], { extrapolateRight: 'clamp' })}
            width={58}
            height={36}
            rx={4}
            fill="#FACC15"
            transform={`rotate(${interpolate(frame - 450, [0, 90], [15, 85])}, 660, 960)`}
          />
        </svg>
        <div
          style={{
            position: 'absolute',
            top: 220,
            right: 110,
            backgroundColor: '#0F172A',
            border: '4px solid #38BDF8',
            padding: '16px 28px',
            borderRadius: 16,
            color: '#38BDF8',
            fontSize: 42,
            fontWeight: 900,
            fontFamily: 'monospace',
          }}
        >
          02:15 AM
        </div>
        <CaptionBox
          text="RULE #4 WAS PRINTED ON THE BACK."
          highlight="HE TOSSED IT ON THE FLOOR."
        />
      </Sequence>

      {/* SCENE 4 (23s - 32s): Friend Marcus knocks outside the glass door */}
      <Sequence from={690} durationInFrames={270}>
        <LaundromatBg panX={interpolate(frame - 690, [0, 270], [-160, -40])} />
        <svg width="1080" height="1920" style={{ position: 'absolute' }}>
          {/* Glass Door Divider */}
          <rect x={530} y={420} width={16} height={680} fill="#38BDF8" opacity={0.6} />
          {/* Leo inside */}
          <StickFigure
            x={340}
            y={1010}
            scale={2.15}
            color="#38BDF8"
            walkCycle={(frame - 690) * 0.18}
          />
          {/* "Marcus" outside waving */}
          <StickFigure
            x={740}
            y={1010}
            scale={2.25}
            color="#E2E8F0"
            armRaise={0.95}
            headTilt={-8}
          />
        </svg>
        <CaptionBox
          text="HIS BEST FRIEND MARCUS KNOCKED:"
          highlight="“MY CAR BROKE DOWN — LET ME IN!”"
        />
      </Sequence>

      {/* SCENE 5 (32s - 39s): Leo opens the door — lights turn red */}
      <Sequence from={960} durationInFrames={210}>
        <LaundromatBg panX={-40} redAlert={true} />
        <svg width="1080" height="1920" style={{ position: 'absolute' }}>
          {/* Leo backing away */}
          <StickFigure
            x={interpolate(frame - 960, [0, 210], [410, 290])}
            y={1010}
            scale={2.15}
            color="#38BDF8"
            armRaise={0.5}
          />
          {/* Tall distorted Marcus stepping inside */}
          <StickFigure
            x={interpolate(frame - 960, [0, 210], [720, 560])}
            y={990}
            scale={2.45}
            color="#EF4444"
            headTilt={24}
            glow={true}
          />
        </svg>
        <CaptionBox
          text="LEO UNLOCKED THE DOOR..."
          highlight="THEN LOOKED DOWN AT THE FLOOR."
          danger={true}
        />
      </Sequence>

      {/* SCENE 6 (39s - 45s): The Twist Reveal — Back of the Card */}
      <Sequence from={1170} durationInFrames={180}>
        <LaundromatBg panX={0} redAlert={true} />
        <div
          style={{
            position: 'absolute',
            top: 330,
            left: 100,
            right: 100,
            backgroundColor: '#450A0A',
            border: '8px solid #EF4444',
            borderRadius: 24,
            padding: '48px 42px',
            color: '#FEF2F2',
            fontFamily: 'monospace',
            boxShadow: '0 0 60px rgba(239,68,68,0.65)',
          }}
        >
          <div style={{ fontSize: 36, fontWeight: 900, color: '#FCA5A5', marginBottom: 24 }}>
            RULE 4 (BACK OF CARD):
          </div>
          <div style={{ fontSize: 38, fontWeight: 900, lineHeight: 1.35 }}>
            “NEVER OPEN THE DOOR FOR MARCUS. HE DIED IN A CRASH 3 YEARS AGO.”
          </div>
        </div>
        <CaptionBox
          text="THE THING SMILING AT HIM..."
          highlight="WAS NOT HIS FRIEND."
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
