import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

export const PALETTE = {
  bgDark: '#07090f',
  bgSlate: '#0e131f',
  cyanGlow: '#38bdf8',
  amberLamp: '#f59e0b',
  crimsonAlert: '#dc2626',
  cardYellow: '#facc15',
  textWhite: '#f8fafc',
  textMuted: '#94a3b8',
};

// 1. Deterministic random (prevents flicker/errors in GitHub Actions)
export const seededRandom = (seed: number): number => {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

// 2. 3-Layer Parallax + Handheld Camera Rig + Impact Jolt
export const useParallaxCamera = (
  zoomFrom = 1.0,
  zoomTo = 1.08,
  shakeIntensity = 1.6,
  impactFrame = -1
) => {
  const frame = useCurrentFrame();

  const scale = interpolate(frame, [0, 225], [zoomFrom, zoomTo], {
    extrapolateRight: 'clamp',
  });

  // Impact jolt decay (triggers at impactFrame for 12 frames)
  let joltX = 0;
  let joltY = 0;
  if (impactFrame >= 0 && frame >= impactFrame && frame < impactFrame + 12) {
    const progress = (frame - impactFrame) / 12;
    const decay = 1 - progress;
    joltX = Math.sin(frame * 2.5) * 16 * decay;
    joltY = Math.cos(frame * 3.1) * 12 * decay;
  }

  const baseX = Math.sin(frame * 0.21) * shakeIntensity + joltX;
  const baseY = Math.cos(frame * 0.17) * shakeIntensity + joltY;

  return {
    bgStyle: {
      transform: `scale(${1 + (scale - 1) * 0.35}) translate(${baseX * 0.3}px, ${baseY * 0.3}px)`,
    },
    midStyle: {
      transform: `scale(${scale}) translate(${baseX}px, ${baseY}px)`,
    },
    fgStyle: {
      transform: `scale(${1 + (scale - 1) * 1.5}) translate(${baseX * 1.6}px, ${baseY * 1.6}px)`,
    },
  };
};

// 3. Snappy Anime Spring Pop (for rule cards, doors, alerts)
export const useSpringPop = (delayFrames = 10) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    fps,
    frame: Math.max(0, frame - delayFrames),
    config: { damping: 12, stiffness: 180, mass: 0.8 },
  });

  return {
    opacity: interpolate(frame, [delayFrames, delayFrames + 6], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
    transform: `scale(${interpolate(progress, [0, 1], [0.82, 1])}) translateY(${interpolate(progress, [0, 1], [35, 0])}px)`,
  };
};

// 4. Clean Scene Cut + Climax Crimson Impact Flash
export const SceneTransition: React.FC<{
  flashColor?: string;
  impactFrame?: number;
}> = ({ flashColor = '#000000', impactFrame = -1 }) => {
  const frame = useCurrentFrame();

  const edgeFade = interpolate(frame, [0, 7, 218, 225], [1, 0, 0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const impactOpacity =
    impactFrame >= 0
      ? interpolate(
          frame,
          [impactFrame, impactFrame + 2, impactFrame + 8],
          [0, 0.55, 0],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        )
      : 0;

  return (
    <>
      <AbsoluteFill
        style={{
          backgroundColor: '#dc2626',
          opacity: impactOpacity,
          pointerEvents: 'none',
        }}
      />
      <AbsoluteFill
        style={{
          backgroundColor: flashColor,
          opacity: edgeFade,
          pointerEvents: 'none',
        }}
      />
    </>
  );
};

// 5. Deterministic Rain Overlay
export const RainOverlay: React.FC<{ count?: number; opacity?: number }> = ({
  count = 45,
  opacity = 0.35,
}) => {
  const frame = useCurrentFrame();

  return (
    <svg
      viewBox="0 0 1080 1920"
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity }}
    >
      {Array.from({ length: count }).map((_, i) => {
        const startX = seededRandom(i + 1) * 1080;
        const speed = 30 + seededRandom(i + 101) * 22;
        const len = 38 + seededRandom(i + 201) * 45;
        const y = ((frame * speed + seededRandom(i + 301) * 1920) % 2000) - 80;
        const x = startX - y * 0.12;

        return (
          <line
            key={i}
            x1={x}
            y1={y}
            x2={x - 6}
            y2={y + len}
            stroke="#bae6fd"
            strokeWidth={2}
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
};

// 6. Safe-Zone Kinetic Subtitles (clears YouTube Shorts & Instagram Reels UI)
export const SafeSubtitle: React.FC<{
  text: string;
  accentColor?: string;
}> = ({ text, accentColor = '#facc15' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pop = spring({
    fps,
    frame,
    config: { damping: 14, stiffness: 200 },
  });

  const opacity = interpolate(frame, [0, 8, 212, 225], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 370,
        left: 70,
        right: 130,
        display: 'flex',
        justifyContent: 'center',
        opacity,
        transform: `scale(${interpolate(pop, [0, 1], [0.92, 1])}) translateY(${interpolate(pop, [0, 1], [16, 0])}px)`,
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(5, 7, 13, 0.88)',
          borderLeft: `6px solid ${accentColor}`,
          padding: '20px 28px',
          borderRadius: 12,
          boxShadow: '0 12px 32px rgba(0,0,0,0.8)',
        }}
      >
        <p
          style={{
            margin: 0,
            color: '#ffffff',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: 40,
            fontWeight: 800,
            lineHeight: 1.3,
            letterSpacing: 0.4,
            textShadow: '0 2px 8px rgba(0,0,0,0.9)',
          }}
        >
          {text}
        </p>
      </div>
    </div>
  );
};
