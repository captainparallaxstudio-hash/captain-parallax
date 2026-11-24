import React from 'react';
import {
  Composition,
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
  Sequence,
  Img,
  staticFile,
} from 'remotion';

// --- ANIMATED ILLUSTRATED PANEL WITH PARALLAX RAIN & CAMERA MOTION ---
const IllustratedScene: React.FC<{
  imageName: string;
  zoomFrom?: number;
  zoomTo?: number;
  panXFrom?: number;
  panXTo?: number;
  horrorRed?: boolean;
  shake?: boolean;
}> = ({
  imageName,
  zoomFrom = 1.02,
  zoomTo = 1.14,
  panXFrom = 0,
  panXTo = -25,
  horrorRed = false,
  shake = false,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const scale = interpolate(frame, [0, durationInFrames], [zoomFrom, zoomTo]);
  const translateX = interpolate(frame, [0, durationInFrames], [panXFrom, panXTo]);
  const shakeX = shake ? Math.sin(frame * 2.1) * 7 : 0;
  const shakeY = shake ? Math.cos(frame * 2.5) * 5 : 0;
  const flicker = horrorRed && Math.sin(frame * 1.3) > 0.8 ? 0.55 : 1;

  return (
    <AbsoluteFill style={{ backgroundColor: '#020408', overflow: 'hidden' }}>
      {/* Main Artwork Layer */}
      <Img
        src={staticFile(imageName)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${scale}) translate(${translateX + shakeX}px, ${shakeY}px)`,
          filter: horrorRed
            ? 'contrast(1.18) saturate(1.25)'
            : 'contrast(1.08) brightness(0.92)',
          opacity: flicker,
        }}
      />

      {/* Atmospheric Floating Dust / Rain Overlay */}
      <AbsoluteFill style={{ pointerEvents: 'none' }}>
        {Array.from({ length: 22 }).map((_, i) => {
          const y = ((frame * 26 + i * 93) % 1960) - 40;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: 30 + i * 48,
                top: y,
                width: 2,
                height: 44,
                backgroundColor: horrorRed ? '#FCA5A5' : '#BAE6FD',
                opacity: 0.16,
                transform: 'rotate(12deg)',
              }}
            />
          );
        })}
      </AbsoluteFill>

      {/* Deep Cinematic Vignette */}
      <AbsoluteFill
        style={{
          background: horrorRed
            ? 'radial-gradient(circle at center, rgba(127,29,29,0.12) 35%, rgba(0,0,0,0.92) 100%)'
            : 'radial-gradient(circle at center, transparent 40%, rgba(0,0,0,0.88) 100%)',
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};

// --- SLEEK BURNED-IN SUBTITLES ---
const SubtitleOverlay: React.FC<{
  line1: string;
  line2?: string;
  danger?: boolean;
}> = ({ line1, line2, danger = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 15 } });

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 230,
        left: 55,
        right: 55,
        transform: `scale(${pop})`,
        textAlign: 'center',
        zIndex: 30,
      }}
    >
      <div
        style={{
          display: 'inline-block',
          backgroundColor: 'rgba(2, 6, 23, 0.84)',
          padding: '20px 30px',
          borderRadius: 16,
          borderLeft: `6px solid ${danger ? '#EF4444' : '#38BDF8'}`,
          boxShadow: '0 16px 40px rgba(0,0,0,0.85)',
        }}
      >
        <div
          style={{
            color: '#F8FAFC',
            fontSize: 40,
            fontWeight: 800,
            fontFamily: 'sans-serif',
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
              marginTop: 8,
            }}
          >
            {line2}
          </div>
        )}
      </div>
    </div>
  );
};

// --- MAIN EPISODE ---
const NightShiftRules: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#020408' }}>
      <div
        style={{
          position: 'absolute',
          top: 72,
          left: 0,
          right: 0,
          textAlign: 'center',
          zIndex: 50,
          color: 'rgba(248, 250, 252, 0.65)',
          fontSize: 22,
          fontWeight: 800,
          letterSpacing: 6,
          fontFamily: 'sans-serif',
          textShadow: '0 2px 10px rgba(0,0,0,0.9)',
        }}
      >
        CAPTAIN PARALLAX
      </div>

      {/* SCENE 1 (0–7s) */}
      <Sequence from={0} durationInFrames={210}>
        <IllustratedScene imageName="scene1.png" zoomFrom={1.0} zoomTo={1.12} panXFrom={0} panXTo={-20} />
        <SubtitleOverlay
          line1="OVERNIGHT SHIFT — 11:55 PM"
          line2="“FOLLOW ALL 4 RULES ON THIS CARD.”"
        />
      </Sequence>

      {/* SCENE 2 (7–15s) */}
      <Sequence from={210} durationInFrames={240}>
        <IllustratedScene imageName="scene2.png" zoomFrom={1.05} zoomTo={1.16} panXFrom={-15} panXTo={15} />
        <SubtitleOverlay
          line1="1. IGNORE YELLOW COATS. 2. LOCK BACK DOOR."
          line2="HE NEVER FLIPPED THE CARD OVER."
        />
      </Sequence>

      {/* SCENE 3 (15–23s) */}
      <Sequence from={450} durationInFrames={240}>
        <IllustratedScene imageName="scene3.png" zoomFrom={1.12} zoomTo={1.0} panXFrom={10} panXTo={-15} />
        <SubtitleOverlay
          line1="02:15 AM — CARD ON THE FLOOR"
          line2="RULE #4 STAYED FACE-DOWN."
        />
      </Sequence>

      {/* SCENE 4 (23–32s) */}
      <Sequence from={690} durationInFrames={270}>
        <IllustratedScene imageName="scene4.png" zoomFrom={1.0} zoomTo={1.15} panXFrom={0} panXTo={-20} />
        <SubtitleOverlay
          line1="HIS BEST FRIEND MARCUS KNOCKED:"
          line2="“MY CAR DIED — LET ME IN!”"
        />
      </Sequence>

      {/* SCENE 5 (32–39s) */}
      <Sequence from={960} durationInFrames={210}>
        <IllustratedScene
          imageName="scene5.png"
          zoomFrom={1.04}
          zoomTo={1.18}
          horrorRed={true}
          shake={true}
        />
        <SubtitleOverlay
          line1="LEO UNLOCKED THE DOOR..."
          line2="AND LOOKED DOWN AT THE FLOOR."
          danger={true}
        />
      </Sequence>

      {/* SCENE 6 (39–45s) */}
      <Sequence from={1170} durationInFrames={180}>
        <IllustratedScene
          imageName="scene6.png"
          zoomFrom={1.08}
          zoomTo={1.2}
          horrorRed={true}
          shake={true}
        />
        <SubtitleOverlay
          line1="RULE 4: “NEVER OPEN FOR MARCUS.”"
          line2="“HE DIED IN A CRASH 3 YEARS AGO.”"
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
