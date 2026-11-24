import React from 'react';
import { Composition, AbsoluteFill, useCurrentFrame, spring, useVideoConfig, interpolate } from 'remotion';

const TestScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ frame, fps, config: { damping: 12 } });
  const bgShift = interpolate(frame, [0, 150], [0, -60]);

  return (
    <AbsoluteFill style={{ backgroundColor: '#070B14', overflow: 'hidden', justifyContent: 'center', alignItems: 'center' }}>
      <div
        style={{
          position: 'absolute',
          inset: -100,
          transform: `translateX(${bgShift}px)`,
          backgroundImage: 'radial-gradient(#1E293B 2px, transparent 2px)',
          backgroundSize: '40px 40px',
        }}
      />
      <div style={{ transform: `scale(${scale})`, textAlign: 'center', zIndex: 2 }}>
        <div style={{ color: '#38BDF8', fontSize: 28, letterSpacing: 6, fontWeight: 700, fontFamily: 'sans-serif' }}>
          DISPATCH 001
        </div>
        <div style={{ color: '#F8FAFC', fontSize: 80, fontWeight: 900, fontFamily: 'sans-serif', marginTop: 8 }}>
          CAPTAIN PARALLAX
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="MainComp"
      component={TestScene}
      durationInFrames={150}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
