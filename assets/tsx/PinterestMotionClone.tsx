import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const EXPO_OUT = Easing.bezier(0.16, 1, 0.3, 1);
const IN_OUT_QUINT = Easing.bezier(0.83, 0, 0.17, 1);
const STAGGER = 5;

const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));

const cubicBezierPoint = (
  t: number,
  p0: [number, number],
  p1: [number, number],
  p2: [number, number],
  p3: [number, number]
): [number, number] => {
  const u = 1 - t;
  const tt = t * t;
  const uu = u * u;
  const uuu = uu * u;
  const ttt = tt * t;

  const x =
    uuu * p0[0] +
    3 * uu * t * p1[0] +
    3 * u * tt * p2[0] +
    ttt * p3[0];
  const y =
    uuu * p0[1] +
    3 * uu * t * p1[1] +
    3 * u * tt * p2[1] +
    ttt * p3[1];
  return [x, y];
};

// Reusable 8-Petal Daisy / Asterisk Flower Icon from Pinterest reference
const DaisyFlowerIcon: React.FC<{
  size?: number;
  petalColor?: string;
  centerColor?: string;
  rotationDeg?: number;
  glowColor?: string;
}> = ({
  size = 48,
  petalColor = '#D9F99D',
  centerColor = '#FACC15',
  rotationDeg = 0,
  glowColor,
}) => {
  const angles = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{
        transform: `rotate(${rotationDeg}deg)`,
        filter: glowColor ? `drop-shadow(0 0 18px ${glowColor})` : undefined,
        willChange: 'transform',
      }}
    >
      {angles.map((angle) => (
        <g key={angle} transform={`rotate(${angle} 50 50)`}>
          <rect
            x="41"
            y="8"
            width="18"
            height="40"
            rx="9"
            fill={petalColor}
          />
        </g>
      ))}
      <circle cx="50" cy="50" r="14" fill={centerColor} />
    </svg>
  );
};

// ============================================================================
// SCENE 1 (0 - 150f | 0.0s - 2.5s): "Everything starts with a..." + Yellow Blob & Cursor
// ============================================================================
const Scene1EverythingStarts: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const enterP = spring({
    frame,
    fps,
    config: { mass: 1, damping: 16, stiffness: 120 },
  });
  const exitP = interpolate(frame, [130, 150], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: IN_OUT_QUINT,
  });

  const words = ['Everything', 'starts', 'with', 'a'];

  // Yellow elliptical blob drop + bounce
  const blobDropP = spring({
    frame: Math.max(0, frame - 18),
    fps,
    config: { mass: 1.1, damping: 11, stiffness: 135 },
  });
  const blobPulse = 1 + Math.sin(frame * 0.12) * 0.035;
  const blobY = (1 - blobDropP) * -280;
  const blobScaleX = 0.88 + 0.12 * blobDropP * blobPulse;
  const blobScaleY = 1.12 - 0.12 * blobDropP / blobPulse;

  // Cursor Bezier flight from bottom right to click near the yellow blob
  const cursorMoveP = interpolate(frame, [24, 96], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EXPO_OUT,
  });
  const [curX, curY] = cubicBezierPoint(
    cursorMoveP,
    [1360, 880],
    [1180, 740],
    [980, 660],
    [835, 610]
  );
  const clickP = interpolate(frame, [88, 98, 114], [0, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const rippleP = interpolate(frame, [90, 136], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EXPO_OUT,
  });

  const camScale = 0.96 + 0.04 * enterP + exitP * 0.14;
  const sceneOpacity = clamp01(enterP) * (1 - exitP);
  const sceneBlur = (1 - clamp01(enterP)) * 8 + exitP * 10;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#031F1A',
        opacity: sceneOpacity,
        filter: `blur(${sceneBlur}px)`,
        transform: `scale(${camScale})`,
        overflow: 'hidden',
      }}
    >
      {/* Top Emerald Glow */}
      <div
        style={{
          position: 'absolute',
          top: -260,
          left: 260,
          width: 900,
          height: 560,
          borderRadius: 9999,
          background:
            'radial-gradient(circle, rgba(16, 185, 129, 0.36) 0%, rgba(4, 47, 46, 0) 70%)',
          filter: 'blur(45px)',
          transform: `translate3d(${Math.sin(frame * 0.03) * 35}px, 0, 0)`,
        }}
      />

      {/* Bottom-Left Glowing Lime Torus Ring (matches Frame 1 of Pinterest reference) */}
      <div
        style={{
          position: 'absolute',
          bottom: -340,
          left: 110,
          width: 780,
          height: 780,
          borderRadius: 9999,
          border: '68px solid rgba(190, 242, 100, 0.45)',
          boxShadow:
            '0 0 110px 30px rgba(163, 230, 53, 0.38), inset 0 0 90px rgba(16, 185, 129, 0.45)',
          filter: 'blur(28px)',
          transform: `translate3d(0, ${(1 - enterP) * 80}px, 0) scale(${0.9 + 0.12 * enterP})`,
        }}
      />

      {/* Center-Left Typography + Glass Pill + Dropping Yellow Elliptical Blob */}
      <div
        style={{
          position: 'absolute',
          top: 465,
          left: 190,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}
      >
        {words.map((w, i) => {
          const wp = spring({
            frame: Math.max(0, frame - (8 + i * STAGGER)),
            fps,
            config: { mass: 1, damping: 14, stiffness: 120 },
          });
          const isFirst = i === 0;
          return (
            <span
              key={w}
              style={{
                display: 'inline-block',
                fontFamily: "'SVN-Aeonik', sans-serif",
                fontSize: 44,
                fontWeight: isFirst ? 700 : 400,
                color: isFirst ? '#ECFCCB' : '#D9F99D',
                letterSpacing: '-0.02em',
                opacity: clamp01(wp),
                filter: `blur(${(1 - clamp01(wp)) * 8}px)`,
                transform: `translate3d(0, ${(1 - wp) * 34}px, 0)`,
              }}
            >
              {w}
            </span>
          );
        })}

        {/* Dark Glass Pill next to text */}
        <div
          style={{
            position: 'relative',
            width: 240,
            height: 62,
            marginLeft: 8,
            borderRadius: 999,
            background: 'rgba(6, 38, 31, 0.72)',
            border: '1px solid rgba(163, 230, 53, 0.18)',
            boxShadow: 'inset 0 2px 16px rgba(0,0,0,0.65)',
            display: 'flex',
            alignItems: 'center',
            paddingLeft: 26,
            backdropFilter: 'blur(16px)',
          }}
        >
          <div style={{ opacity: 0.35 }}>
            <DaisyFlowerIcon
              size={28}
              petalColor="#34D399"
              centerColor="#10B981"
              rotationDeg={frame * 1.4}
            />
          </div>

          {/* Dropping Glowing Yellow Elliptical Blob */}
          <div
            style={{
              position: 'absolute',
              top: -128,
              left: -34,
              width: 112,
              height: 158,
              borderRadius: '999px',
              background:
                'radial-gradient(circle at 38% 35%, #FEF08A 0%, #FACC15 55%, #EAB308 100%)',
              boxShadow:
                '0 22px 50px rgba(250, 204, 21, 0.45), 0 0 40px rgba(250, 204, 21, 0.55)',
              transform: `translate3d(0, ${blobY}px, 0) rotate(-16deg) scaleX(${blobScaleX}) scaleY(${blobScaleY})`,
              willChange: 'transform',
            }}
          />
        </div>
      </div>

      {/* Cursor + Click Ripple */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          transform: `translate3d(${curX}px, ${curY}px, 0) scale(${1 - clickP * 0.15})`,
          pointerEvents: 'none',
        }}
      >
        {rippleP > 0.01 && rippleP < 0.99 && (
          <div
            style={{
              position: 'absolute',
              top: -28,
              left: -28,
              width: 56,
              height: 56,
              borderRadius: 999,
              border: '2px solid #FEF08A',
              opacity: (1 - rippleP) * 0.75,
              transform: `scale(${0.4 + rippleP * 2.3})`,
            }}
          />
        )}
        <svg
          width="42"
          height="42"
          viewBox="0 0 42 42"
          style={{
            filter: 'drop-shadow(0 8px 18px rgba(0,0,0,0.6))',
          }}
        >
          <path
            d="M6 4L35 18L21 23L16 37L6 4Z"
            fill="#FEF08A"
            stroke="#FEF9C3"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 2 (150 - 300f | 2.5s - 5.0s): Orbit Rings & "Sketch"
// ============================================================================
const Scene2OrbitSketch: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const enterP = spring({
    frame,
    fps,
    config: { mass: 1, damping: 16, stiffness: 110 },
  });
  const exitP = interpolate(frame, [130, 150], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: IN_OUT_QUINT,
  });

  const sketchWordP = spring({
    frame: Math.max(0, frame - 22),
    fps,
    config: { mass: 1, damping: 13, stiffness: 130 },
  });

  const ringScale = 0.84 + 0.18 * enterP + frame * 0.0006;
  const cometOffset1 = -frame * 8.5;
  const cometOffset2 = frame * 7.2;

  const sceneOpacity = clamp01(enterP) * (1 - exitP);
  const sceneBlur = (1 - clamp01(enterP)) * 8 + exitP * 8;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#021D17',
        opacity: sceneOpacity,
        filter: `blur(${sceneBlur}px)`,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Intense Bottom Center Emerald Radial Glow */}
      <div
        style={{
          position: 'absolute',
          bottom: -240,
          left: '50%',
          marginLeft: -550,
          width: 1100,
          height: 680,
          borderRadius: 9999,
          background:
            'radial-gradient(circle, rgba(16, 185, 129, 0.72) 0%, rgba(5, 150, 105, 0.28) 48%, transparent 75%)',
          filter: 'blur(40px)',
        }}
      />

      {/* Intersecting Orbit Circles SVG */}
      <svg
        width="1920"
        height="1080"
        viewBox="0 0 1920 1080"
        style={{
          position: 'absolute',
          inset: 0,
          transform: `scale(${ringScale})`,
          willChange: 'transform',
        }}
      >
        <defs>
          <filter id="orbitGlow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Left Large Orbit Ring */}
        <circle
          cx="440"
          cy="480"
          r="580"
          fill="none"
          stroke="rgba(110, 231, 183, 0.34)"
          strokeWidth="2.2"
        />
        <circle
          cx="440"
          cy="480"
          r="580"
          fill="none"
          stroke="#BEF264"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray="180 3460"
          strokeDashoffset={cometOffset1}
          filter="url(#orbitGlow)"
        />

        {/* Right Large Orbit Ring */}
        <circle
          cx="1480"
          cy="480"
          r="580"
          fill="none"
          stroke="rgba(110, 231, 183, 0.34)"
          strokeWidth="2.2"
        />
        <circle
          cx="1480"
          cy="480"
          r="580"
          fill="none"
          stroke="#BEF264"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray="210 3430"
          strokeDashoffset={cometOffset2}
          filter="url(#orbitGlow)"
        />

        {/* Bottom Intersecting Orbit Ring */}
        <circle
          cx="960"
          cy="1190"
          r="620"
          fill="none"
          stroke="rgba(167, 243, 208, 0.42)"
          strokeWidth="2.5"
        />
        <circle
          cx="960"
          cy="1190"
          r="620"
          fill="none"
          stroke="#FACC15"
          strokeWidth="5.5"
          strokeLinecap="round"
          strokeDasharray="220 3680"
          strokeDashoffset={cometOffset1 * 1.15}
          filter="url(#orbitGlow)"
        />

        {/* Top Arch Orbit Ring */}
        <circle
          cx="960"
          cy="-260"
          r="620"
          fill="none"
          stroke="rgba(110, 231, 183, 0.25)"
          strokeWidth="2"
        />

        {/* Glowing Intersection Dots */}
        <circle cx="960" cy="285" r="5" fill="#ECFCCB" filter="url(#orbitGlow)" />
        <circle cx="1366" cy="912" r="6" fill="#FFFFFF" filter="url(#orbitGlow)" />
        <circle cx="554" cy="912" r="5" fill="#A7F3D0" filter="url(#orbitGlow)" />
      </svg>

      {/* Top-Right Rotating Daisy Flower on Orbit */}
      <div
        style={{
          position: 'absolute',
          top: 192,
          left: 1320,
          transform: `scale(${0.85 + 0.2 * enterP})`,
        }}
      >
        <DaisyFlowerIcon
          size={46}
          petalColor="#D9F99D"
          centerColor="#FACC15"
          rotationDeg={frame * 2.4}
          glowColor="rgba(217, 249, 157, 0.7)"
        />
      </div>

      {/* Center "Sketch" Typography */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          marginTop: 120,
          opacity: clamp01(sketchWordP),
          filter: `blur(${(1 - clamp01(sketchWordP)) * 10}px)`,
          transform: `translate3d(0, ${(1 - sketchWordP) * 42}px, 0) scale(${0.88 + 0.12 * sketchWordP})`,
        }}
      >
        <span
          style={{
            fontFamily: "'SVN-Aeonik', sans-serif",
            fontSize: 82,
            fontWeight: 700,
            color: '#D9F99D',
            letterSpacing: '-0.02em',
            textShadow:
              '0 0 36px rgba(190, 242, 100, 0.45), 0 12px 28px rgba(0, 0, 0, 0.55)',
          }}
        >
          Sketch
        </span>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 3 (300 - 450f | 5.0s - 7.5s): "What if this could" -> Laser Sword Slit Wipe
// ============================================================================
const Scene3WhatIfLaserSlit: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const enterP = spring({
    frame,
    fps,
    config: { mass: 1, damping: 15, stiffness: 120 },
  });

  // Tilted Glass Diamond Card entrance
  const cardSpring = spring({
    frame: Math.max(0, frame - 8),
    fps,
    config: { mass: 1, damping: 14, stiffness: 115 },
  });

  const textWords = ['What', 'if', 'this', 'could'];

  // Phase 2 of Scene 3 (frame 85 -> 150): Glowing Yellow Laser Bar slices right-to-left
  // & opens the dark slit wedge into bright lime background (#ECFCCB)
  const laserActiveP = interpolate(frame, [80, 132], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: IN_OUT_QUINT,
  });
  const slitExpandP = interpolate(frame, [110, 150], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EXPO_OUT,
  });

  const laserX = interpolate(laserActiveP, [0, 1], [1540, 260]);
  const laserOpacity = interpolate(frame, [76, 86, 138, 148], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#03221C',
        overflow: 'hidden',
      }}
    >
      {/* Ambient Emerald & Yellow Glows */}
      <div
        style={{
          position: 'absolute',
          bottom: -180,
          left: 220,
          width: 820,
          height: 540,
          borderRadius: 9999,
          background:
            'radial-gradient(circle, rgba(163, 230, 53, 0.52) 0%, rgba(16, 185, 129, 0.22) 52%, transparent 75%)',
          filter: 'blur(42px)',
          transform: `translate3d(${-laserActiveP * 120}px, 0, 0)`,
        }}
      />

      {/* Top Right Teal Sphere */}
      <div
        style={{
          position: 'absolute',
          top: -90,
          right: -40,
          width: 480,
          height: 480,
          borderRadius: 9999,
          background:
            'radial-gradient(circle at 35% 35%, rgba(52, 211, 153, 0.55) 0%, rgba(16, 185, 129, 0.25) 60%, transparent 76%)',
          filter: 'blur(12px)',
          opacity: 1 - laserActiveP * 0.85,
        }}
      />

      {/* Floating White Particle Square */}
      <div
        style={{
          position: 'absolute',
          top: 265,
          left: 945,
          width: 14,
          height: 14,
          background: '#FFFFFF',
          boxShadow: '0 0 16px #FFFFFF',
          transform: `translate3d(0, ${Math.sin(frame * 0.1) * 14}px, 0) rotate(${frame * 1.8}deg)`,
          opacity: 1 - laserActiveP,
        }}
      />

      {/* Tilted -35deg Glass Card with Bright Yellow Glowing Edge & Orange-Gold Daisy */}
      <div
        style={{
          position: 'absolute',
          top: 250,
          right: 260,
          width: 390,
          height: 390,
          borderRadius: 38,
          background:
            'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(190, 242, 100, 0.22) 100%)',
          backdropFilter: 'blur(22px)',
          WebkitBackdropFilter: 'blur(22px)',
          border: '2px solid rgba(254, 240, 138, 0.65)',
          boxShadow:
            '28px -18px 80px rgba(250, 204, 21, 0.55), inset -12px 12px 38px rgba(254, 240, 138, 0.35)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          opacity: clamp01(cardSpring) * (1 - laserActiveP * 0.95),
          transform: `translate3d(${(1 - cardSpring) * 90}px, ${(1 - cardSpring) * -50}px, 0) rotate(-35deg) scale(${0.86 + 0.14 * cardSpring})`,
        }}
      >
        <DaisyFlowerIcon
          size={132}
          petalColor="#F59E0B"
          centerColor="#FEF08A"
          rotationDeg={frame * 2.2}
          glowColor="rgba(250, 204, 21, 0.85)"
        />
      </div>

      {/* Bottom-Left Text: "What if this could" */}
      <div
        style={{
          position: 'absolute',
          bottom: 155,
          left: 115,
          display: 'flex',
          gap: 14,
          opacity: 1 - laserActiveP * 0.9,
          transform: `translate3d(${-laserActiveP * 80}px, 0, 0)`,
        }}
      >
        {textWords.map((w, idx) => {
          const wp = spring({
            frame: Math.max(0, frame - (10 + idx * STAGGER)),
            fps,
            config: { mass: 1, damping: 14, stiffness: 125 },
          });
          const isLast = idx === textWords.length - 1;
          return (
            <span
              key={w}
              style={{
                display: 'inline-block',
                fontFamily: "'SVN-Aeonik', sans-serif",
                fontSize: 48,
                fontWeight: 700,
                color: '#F8FAFC',
                letterSpacing: '-0.03em',
                opacity: clamp01(wp),
                filter: `blur(${(1 - clamp01(wp)) * 10 + (isLast ? 1.2 : 0)}px)`,
                transform: `translate3d(${(1 - wp) * 28}px, ${(1 - wp) * 24}px, 0)`,
              }}
            >
              {w}
            </span>
          );
        })}
      </div>

      {/* Dark Slit Wedge + Laser Sword Cut (Matches Frame 4 of Pinterest Grid!) */}
      {frame >= 74 && (
        <>
          {/* Dark Slit Wedge trailing from left edge to the laser tip */}
          <svg
            width="1920"
            height="1080"
            viewBox="0 0 1920 1080"
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
            }}
          >
            <polygon
              points={`0,${430 - slitExpandP * 520} ${laserX},540 0,${650 + slitExpandP * 520}`}
              fill="#040D0A"
            />
          </svg>

          {/* Glowing Yellow Laser Bar at the slit tip */}
          <div
            style={{
              position: 'absolute',
              top: 526,
              left: laserX,
              width: 190,
              height: 28,
              borderRadius: 999,
              background: '#FFFFFF',
              boxShadow:
                '0 0 28px 10px #FACC15, 0 0 70px 24px #F59E0B, 0 0 130px 40px rgba(250, 204, 21, 0.75)',
              opacity: laserOpacity,
              transform: `scaleX(${0.7 + 0.5 * Math.sin(laserActiveP * Math.PI)})`,
            }}
          />
        </>
      )}

      {/* Bright Lime Slit Wipe Expansion into Scene 4 */}
      {slitExpandP > 0.001 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, #E4F8C6 0%, #F4FCE3 60%, #FEFCE8 100%)',
            transformOrigin: 'center center',
            transform: `scaleY(${slitExpandP})`,
            zIndex: 50,
          }}
        />
      )}
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 4 (450 - 600f | 7.5s - 10.0s): "GROWTH" Kinetic Typography & Expanding Circle
// ============================================================================
const Scene4GrowthKinetic: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const enterP = spring({
    frame,
    fps,
    config: { mass: 1, damping: 15, stiffness: 115 },
  });
  const exitP = interpolate(frame, [130, 150], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: IN_OUT_QUINT,
  });

  // Left Lime Circle expansion
  const circleScale = interpolate(frame, [0, 95], [0.45, 1.08], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EXPO_OUT,
  });

  // Vertical echo stack offset
  const stackWave = interpolate(frame, [0, 110], [1, 0.22], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EXPO_OUT,
  });

  const echoOffsets = [-3, -2, -1, 0, 1, 2];

  // Ribbon spiral draw on the right
  const ribbonP = interpolate(frame, [28, 125], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EXPO_OUT,
  });

  return (
    <AbsoluteFill
      style={{
        background:
          'linear-gradient(125deg, #E9FAD0 0%, #F5FDE6 52%, #FEFCE8 100%)',
        opacity: 1 - exitP,
        filter: `blur(${exitP * 10}px)`,
        overflow: 'hidden',
      }}
    >
      {/* Left Expanding Soft Lime Circle with Thin Olive Border (Matches Frame 6 of Pinterest Grid) */}
      <div
        style={{
          position: 'absolute',
          top: 40,
          left: -260,
          width: 980,
          height: 980,
          borderRadius: 9999,
          background:
            'radial-gradient(circle at 60% 45%, #D9F99D 0%, #BEF264 75%, #A3E635 100%)',
          border: '2px solid rgba(54, 83, 20, 0.48)',
          transform: `scale(${circleScale})`,
          willChange: 'transform',
        }}
      />

      {/* Center Kinetic Typography Stack: "GROWTH" */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 560,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {echoOffsets.map((offset) => {
          const isMain = offset === 0;
          const absOff = Math.abs(offset);
          const yShift = offset * 88 * (0.65 + 0.35 * stackWave);
          const op = isMain
            ? clamp01(enterP)
            : Math.max(0.05, (0.34 - absOff * 0.09) * clamp01(enterP));

          return (
            <div
              key={offset}
              style={{
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                opacity: op,
                transform: `translate3d(0, ${yShift}px, 0) scale(${isMain ? 0.92 + 0.08 * enterP : 1 - absOff * 0.03})`,
                willChange: 'transform, opacity',
              }}
            >
              <span
                style={{
                  fontFamily: "'SVN-Aeonik', sans-serif",
                  fontSize: 112,
                  fontWeight: 900,
                  letterSpacing: '-0.03em',
                  color: isMain ? '#FACC15' : '#D9F99D',
                  textShadow: isMain
                    ? '0 10px 30px rgba(234, 179, 8, 0.28)'
                    : 'none',
                }}
              >
                GROWTH
              </span>

              {/* Dark Emerald Vertical Accent Bars on the Main "GROWTH" word (Matches Frame 6) */}
              {isMain && (
                <>
                  <div
                    style={{
                      position: 'absolute',
                      right: 84,
                      top: -54,
                      width: 18,
                      height: 68,
                      borderRadius: 99,
                      background: '#064E3B',
                      transform: `rotate(-8deg) scaleY(${enterP})`,
                      transformOrigin: 'bottom',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      right: 62,
                      bottom: -86,
                      width: 18,
                      height: 98,
                      borderRadius: 99,
                      background: '#064E3B',
                      transform: `rotate(4deg) scaleY(${enterP})`,
                      transformOrigin: 'top',
                    }}
                  />
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Right Curved Emerald & Lime 3D Ribbon Loop + Daisy (Matches Frame 8 of Pinterest Grid) */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 760,
          height: 1080,
          opacity: ribbonP,
          transform: `translate3d(${(1 - ribbonP) * 120}px, 0, 0)`,
        }}
      >
        <svg width="760" height="1080" viewBox="0 0 760 1080">
          <defs>
            <linearGradient id="ribbonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#15803D" />
              <stop offset="50%" stopColor="#84CC16" />
              <stop offset="100%" stopColor="#BEF264" />
            </linearGradient>
          </defs>
          {/* Back Dark Emerald Loop */}
          <path
            d="M 280 560 C 280 280, 580 280, 580 560 C 580 780, 420 860, 680 900"
            fill="none"
            stroke="#064E3B"
            strokeWidth="54"
            strokeLinecap="round"
            strokeDasharray="1600"
            strokeDashoffset={1600 * (1 - ribbonP)}
          />
          {/* Front Bright Lime Ribbon Sweep */}
          <path
            d="M 120 -40 C 110 420, 310 740, 680 860"
            fill="none"
            stroke="url(#ribbonGrad)"
            strokeWidth="44"
            strokeLinecap="round"
            strokeDasharray="1400"
            strokeDashoffset={1400 * (1 - ribbonP)}
          />
        </svg>

        <div
          style={{
            position: 'absolute',
            bottom: 185,
            right: 88,
          }}
        >
          <DaisyFlowerIcon
            size={48}
            petalColor="#15803D"
            centerColor="#FACC15"
            rotationDeg={frame * 2.5}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 5 (600 - 750f | 10.0s - 12.5s): "Design" Ring -> 3D Floating Bento UI Dashboard
// ============================================================================
const Scene5DesignBento3D: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  // Phase A (0 - 48f): Glowing Emerald Torus Ring with "Design" in center
  // Phase B (36 - 150f): Explodes into 3D Floating Bento UI Dashboard with 3D camera tilt
  const ringIntroP = spring({
    frame,
    fps,
    config: { mass: 1, damping: 14, stiffness: 120 },
  });
  const dashboardRevealP = spring({
    frame: Math.max(0, frame - 34),
    fps,
    config: { mass: 1, damping: 16, stiffness: 110 },
  });
  const camera3DTiltP = interpolate(frame, [62, 138], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: IN_OUT_QUINT,
  });
  const exitP = interpolate(frame, [132, 150], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: IN_OUT_QUINT,
  });

  const ringFadeOut = interpolate(frame, [30, 56], [1, 0.18], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const ringExpand = interpolate(frame, [30, 75], [1, 1.55], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EXPO_OUT,
  });

  // 3D Camera Angles for the Bento UI Dashboard
  const rotY = -22 * camera3DTiltP;
  const rotX = 9 * camera3DTiltP;
  const camScale = 0.92 + 0.08 * dashboardRevealP + camera3DTiltP * 0.05;

  // Spline Chart strokeDashoffset
  const splineDrawP = interpolate(frame, [45, 118], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EXPO_OUT,
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#03241E',
        perspective: '1600px',
        opacity: 1 - exitP,
        filter: `blur(${exitP * 8}px)`,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Background Perspective Grid Lines */}
      <AbsoluteFill
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(52, 211, 153, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(52, 211, 153, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '120px 120px',
        }}
      />

      {/* Glowing Emerald Torus Ring + "Design" Title (Matches Frame 10 of Pinterest Grid) */}
      <div
        style={{
          position: 'absolute',
          width: 760,
          height: 760,
          borderRadius: 9999,
          border: '64px solid rgba(52, 211, 153, 0.65)',
          boxShadow:
            '0 0 110px 35px rgba(16, 185, 129, 0.65), inset 0 0 90px 25px rgba(16, 185, 129, 0.55)',
          filter: 'blur(18px)',
          opacity: clamp01(ringIntroP) * ringFadeOut,
          transform: `scale(${(0.75 + 0.25 * ringIntroP) * ringExpand})`,
          pointerEvents: 'none',
        }}
      />

      {frame < 58 && (
        <div
          style={{
            position: 'absolute',
            zIndex: 30,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            opacity: clamp01(ringIntroP) * interpolate(frame, [30, 50], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
            transform: `scale(${0.88 + 0.12 * ringIntroP})`,
          }}
        >
          <span
            style={{
              fontFamily: "'SVN-Aeonik', sans-serif",
              fontSize: 78,
              fontWeight: 700,
              color: '#ECFCCB',
              letterSpacing: '-0.03em',
            }}
          >
            Design
          </span>
          <div
            style={{
              width: 38,
              height: 28,
              borderRadius: 6,
              background: '#FEF08A',
              boxShadow: '0 0 20px #FACC15',
            }}
          />
        </div>
      )}

      {/* 3D Floating Bento UI Dashboard (Matches Frames 9, 11, 12 of Pinterest Grid) */}
      {frame >= 32 && (
        <div
          style={{
            width: 1180,
            height: 700,
            position: 'relative',
            transformStyle: 'preserve-3d',
            opacity: clamp01(dashboardRevealP),
            transform: `rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${camScale})`,
            willChange: 'transform, opacity',
          }}
        >
          {/* Floating Top Yellow Neon Pill Bar (Matches Frame 12) */}
          <div
            style={{
              position: 'absolute',
              top: -48,
              right: 40,
              width: 440,
              height: 58,
              borderRadius: 999,
              background: 'linear-gradient(90deg, #FEF08A 0%, #FACC15 100%)',
              boxShadow: '0 0 50px rgba(250, 204, 21, 0.75)',
              transform: `translateZ(${95 * camera3DTiltP}px) rotate(-6deg)`,
            }}
          />

          {/* Main Glass Bento Frame */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 36,
              padding: 28,
              background:
                'linear-gradient(145deg, rgba(16, 185, 129, 0.24) 0%, rgba(4, 47, 46, 0.88) 100%)',
              border: '2px solid rgba(167, 243, 208, 0.45)',
              boxShadow:
                '0 40px 90px rgba(0, 0, 0, 0.75), 0 0 60px rgba(16, 185, 129, 0.32)',
              backdropFilter: 'blur(24px)',
              display: 'grid',
              gridTemplateColumns: '90px 1.25fr 1fr',
              gap: 24,
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Left Sidebar Strip */}
            <div
              style={{
                borderRadius: 24,
                background: 'rgba(6, 78, 59, 0.65)',
                border: '1px solid rgba(110, 231, 183, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '22px 0',
                justifyContent: 'space-between',
                transform: `translateZ(${30 * camera3DTiltP}px)`,
              }}
            >
              <DaisyFlowerIcon
                size={38}
                petalColor="#A7F3D0"
                centerColor="#FACC15"
                rotationDeg={frame * 2}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 12,
                      background:
                        i === 0
                          ? 'rgba(190, 242, 100, 0.28)'
                          : 'rgba(16, 185, 129, 0.18)',
                      border: '1px solid rgba(167, 243, 208, 0.3)',
                    }}
                  />
                ))}
              </div>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 99,
                  background: '#10B981',
                }}
              />
            </div>

            {/* Center Column: Weather Greeting Card + 45% / 60% Circular Gauges */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 22,
                transformStyle: 'preserve-3d',
              }}
            >
              {/* Top Lime/Emerald Weather Card ("Hello, Lucy / 25°C / Rainy All") */}
              <div
                style={{
                  flex: 1.15,
                  borderRadius: 26,
                  padding: '24px 28px',
                  background:
                    'linear-gradient(135deg, #BEF264 0%, #34D399 65%, #059669 100%)',
                  boxShadow: '0 24px 50px rgba(0, 0, 0, 0.45)',
                  position: 'relative',
                  overflow: 'hidden',
                  transform: `translateZ(${75 * camera3DTiltP}px)`,
                }}
              >
                <div
                  style={{
                    fontFamily: "'SVN-Aeonik', sans-serif",
                    fontSize: 18,
                    fontWeight: 700,
                    color: '#064E3B',
                    marginBottom: 8,
                  }}
                >
                  Hello, Lucy
                </div>
                <div
                  style={{
                    fontFamily: "'SVN-Aeonik', sans-serif",
                    fontSize: 44,
                    fontWeight: 900,
                    color: '#022C22',
                    lineHeight: 1.05,
                  }}
                >
                  25°C
                </div>
                <div
                  style={{
                    fontFamily: "'SVN-Aeonik', sans-serif",
                    fontSize: 22,
                    fontWeight: 700,
                    color: '#064E3B',
                    marginTop: 10,
                  }}
                >
                  Rainy All
                </div>

                {/* Soft White Clouds */}
                <div
                  style={{
                    position: 'absolute',
                    right: 26,
                    top: 28,
                    width: 96,
                    height: 44,
                    borderRadius: 99,
                    background: 'rgba(255, 255, 255, 0.88)',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    right: 90,
                    bottom: 24,
                    width: 72,
                    height: 32,
                    borderRadius: 99,
                    background: 'rgba(255, 255, 255, 0.78)',
                  }}
                />
              </div>

              {/* Middle Row Mini Yellow Pills */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 14,
                  transform: `translateZ(${50 * camera3DTiltP}px)`,
                }}
              >
                {['LIGHTING', 'CLIMATE', 'ENERGY'].map((lbl, idx) => (
                  <div
                    key={lbl}
                    style={{
                      padding: '12px 16px',
                      borderRadius: 16,
                      background:
                        idx < 2
                          ? 'linear-gradient(90deg, #FACC15 0%, #BEF264 100%)'
                          : 'rgba(6, 78, 59, 0.7)',
                      color: idx < 2 ? '#022C22' : '#A7F3D0',
                      fontFamily: "'SVN-Aeonik', sans-serif",
                      fontSize: 13,
                      fontWeight: 800,
                      textAlign: 'center',
                    }}
                  >
                    {lbl}
                  </div>
                ))}
              </div>

              {/* Bottom 2 Circular Gauge Cards: 45% & 60% */}
              <div
                style={{
                  flex: 1,
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 20,
                  transform: `translateZ(${65 * camera3DTiltP}px)`,
                }}
              >
                {[
                  { pct: '45%', ringColor: '#FACC15', dash: 175 },
                  { pct: '60%', ringColor: '#BEF264', dash: 210 },
                ].map((g) => (
                  <div
                    key={g.pct}
                    style={{
                      borderRadius: 24,
                      background: 'rgba(6, 95, 70, 0.55)',
                      border: '1.5px solid rgba(110, 231, 183, 0.35)',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      position: 'relative',
                    }}
                  >
                    <svg width="136" height="136" viewBox="0 0 136 136">
                      <circle
                        cx="68"
                        cy="68"
                        r="48"
                        fill="#FFFFFF"
                        stroke="rgba(16, 185, 129, 0.25)"
                        strokeWidth="12"
                      />
                      <circle
                        cx="68"
                        cy="68"
                        r="48"
                        fill="none"
                        stroke={g.ringColor}
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray="300"
                        strokeDashoffset={300 - g.dash * splineDrawP}
                        transform="rotate(-90 68 68)"
                      />
                    </svg>
                    <span
                      style={{
                        position: 'absolute',
                        fontFamily: "'SVN-Aeonik', sans-serif",
                        fontSize: 24,
                        fontWeight: 900,
                        color: '#064E3B',
                      }}
                    >
                      {g.pct}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: "Hi, Welcome back" Spline Chart + White 10°C Card */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
                transformStyle: 'preserve-3d',
              }}
            >
              {/* Spline Line Chart Widget (Matches Frame 9 of Pinterest Grid) */}
              <div
                style={{
                  flex: 1.25,
                  borderRadius: 24,
                  padding: '20px 22px',
                  background: 'rgba(4, 47, 46, 0.82)',
                  border: '1.5px solid rgba(52, 211, 153, 0.4)',
                  boxShadow: '0 20px 45px rgba(0,0,0,0.5)',
                  transform: `translateZ(${90 * camera3DTiltP}px)`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontFamily: "'SVN-Aeonik', sans-serif",
                        fontSize: 13,
                        fontWeight: 600,
                        color: '#6EE7B7',
                      }}
                    >
                      Hi, Welcome back
                    </div>
                    <div
                      style={{
                        fontFamily: "'SVN-Aeonik', sans-serif",
                        fontSize: 18,
                        fontWeight: 800,
                        color: '#ECFCCB',
                      }}
                    >
                      Growth Spline
                    </div>
                  </div>
                  {/* 5 Glowing Dots */}
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[0, 1, 2, 3, 4].map((d) => (
                      <div
                        key={d}
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: 99,
                          background: '#ECFCCB',
                          boxShadow: '0 0 8px #BEF264',
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* SVG Spline Wave */}
                <svg width="360" height="135" viewBox="0 0 360 135">
                  <path
                    d="M 10 110 C 60 85, 85 95, 130 62 C 175 30, 210 88, 255 38 C 295 4, 325 55, 350 42"
                    fill="none"
                    stroke="#FACC15"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray="520"
                    strokeDashoffset={520 * (1 - splineDrawP)}
                  />
                  <path
                    d="M 10 120 C 70 105, 110 75, 165 92 C 220 108, 260 65, 350 72"
                    fill="none"
                    stroke="#34D399"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray="520"
                    strokeDashoffset={520 * (1 - splineDrawP)}
                  />
                  {/* Floating Yellow Tag at Peak */}
                  <g transform="translate(232, 8)">
                    <rect
                       width="52"
                      height="24"
                      rx="6"
                      fill="#FACC15"
                    />
                    <text
                      x="26"
                      y="16"
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight="900"
                      fill="#022C22"
                      fontFamily="SVN-Aeonik, sans-serif"
                    >
                      100%
                    </text>
                  </g>
                </svg>
              </div>

              {/* White 10°C Widget Card */}
              <div
                style={{
                  borderRadius: 22,
                  padding: '18px 24px',
                  background: '#FFFFFF',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  boxShadow: '0 18px 40px rgba(0,0,0,0.35)',
                  transform: `translateZ(${60 * camera3DTiltP}px)`,
                }}
              >
                <span
                  style={{
                    fontFamily: "'SVN-Aeonik', sans-serif",
                    fontSize: 28,
                    fontWeight: 900,
                    color: '#022C22',
                  }}
                >
                  10°C
                </span>
                <span
                  style={{
                    padding: '6px 14px',
                    borderRadius: 99,
                    background: '#DCFCE7',
                    color: '#15803D',
                    fontFamily: "'SVN-Aeonik', sans-serif",
                    fontSize: 13,
                    fontWeight: 800,
                  }}
                >
                  OPTIMAL ECO
                </span>
              </div>

              {/* Bottom Toggle Row */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 16,
                  transform: `translateZ(${45 * camera3DTiltP}px)`,
                }}
              >
                <div
                  style={{
                    height: 62,
                    borderRadius: 18,
                    background: 'rgba(16, 185, 129, 0.25)',
                    border: '1px solid rgba(110, 231, 183, 0.35)',
                  }}
                />
                <div
                  style={{
                    height: 62,
                    borderRadius: 18,
                    background: 'linear-gradient(90deg, #FACC15 0%, #BEF264 100%)',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 6 (750 - 900f | 12.5s - 15.0s): "All crafted" -> "✳ Ready to grow?" Finale
// ============================================================================
const Scene6ReadyToGrowFinale: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  // Phase A (0 - 65f): Dark Emerald "Because / All crafted" + 3 Daisy Flowers (Frames 13 & 14 of Grid)
  // Phase B (55 - 150f): Cream/Lime Finale wipe -> "✳ Ready to grow?" (Frames 15 & 16 of Grid)
  const phaseAP = spring({
    frame,
    fps,
    config: { mass: 1, damping: 14, stiffness: 120 },
  });

  const creamWipeP = interpolate(frame, [54, 86], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: IN_OUT_QUINT,
  });

  const finaleWords = ['Ready', 'to', 'grow?'];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#03201A',
        overflow: 'hidden',
      }}
    >
      {/* Phase A: "Because" & "All crafted" on Dark Emerald */}
      <AbsoluteFill
        style={{
          opacity: 1 - creamWipeP,
          transform: `scale(${1 + creamWipeP * 0.08})`,
        }}
      >
        {/* Right Glowing Emerald Arc */}
        <div
          style={{
            position: 'absolute',
            top: -120,
            right: -140,
            width: 720,
            height: 720,
            borderRadius: 9999,
            border: '56px solid rgba(74, 222, 128, 0.35)',
            filter: 'blur(26px)',
          }}
        />

        {/* Top Left "Because" */}
        <div
          style={{
            position: 'absolute',
            top: 90,
            left: 140,
            fontFamily: "'SVN-Aeonik', sans-serif",
            fontSize: 64,
            fontWeight: 400,
            color: '#ECFCCB',
            opacity: clamp01(phaseAP),
            transform: `translate3d(0, ${(1 - phaseAP) * 32}px, 0)`,
          }}
        >
          Because
        </div>

        {/* Bottom Left "All crafted" */}
        <div
          style={{
            position: 'absolute',
            bottom: 130,
            left: 110,
            display: 'flex',
            alignItems: 'baseline',
            gap: 28,
            opacity: clamp01(phaseAP),
            transform: `translate3d(0, ${(1 - phaseAP) * 40}px, 0)`,
          }}
        >
          <span
            style={{
              fontFamily: "'SVN-Aeonik', sans-serif",
              fontSize: 56,
              fontWeight: 400,
              color: '#D9F99D',
            }}
          >
            All
          </span>
          <span
            style={{
              fontFamily: "'SVN-Aeonik', sans-serif",
              fontSize: 58,
              fontWeight: 800,
              color: '#FFFFFF',
            }}
          >
            crafted
          </span>
        </div>

        {/* Cluster of 3 Daisy Icons / Circles near bottom-center */}
        <div
          style={{
            position: 'absolute',
            bottom: 110,
            left: 620,
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            transform: `scale(${phaseAP})`,
          }}
        >
          <DaisyFlowerIcon
            size={74}
            petalColor="#FEF08A"
            centerColor="#F59E0B"
            rotationDeg={frame * 2.6}
          />
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: 999,
              background: '#D9F99D',
              border: '2px solid #064E3B',
            }}
          />
        </div>

        {/* Outlined Giant Flower Petals at Bottom Right (Matches Frame 14) */}
        <svg
          width="540"
          height="420"
          viewBox="0 0 540 420"
          style={{
            position: 'absolute',
            bottom: -60,
            right: 20,
            opacity: 0.55,
          }}
        >
          <path
            d="M270,400 C210,260 120,240 150,160 C180,90 250,150 270,260 C290,140 360,80 390,150 C420,220 330,260 270,400 Z"
            fill="none"
            stroke="#86EFAC"
            strokeWidth="2"
          />
        </svg>
      </AbsoluteFill>

      {/* Phase B: Cream & Soft Lime Finale ("✳ Ready to grow?") */}
      {creamWipeP > 0.01 && (
        <AbsoluteFill
          style={{
            background:
              'linear-gradient(120deg, #FEFCE8 0%, #F7FEE7 55%, #ECFCCB 100%)',
            opacity: creamWipeP,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {/* Subtle Warm Cream & Lime Soft Glow */}
          <div
            style={{
              position: 'absolute',
              width: 900,
              height: 900,
              borderRadius: 9999,
              background:
                'radial-gradient(circle, rgba(217, 249, 157, 0.55) 0%, transparent 70%)',
              filter: 'blur(50px)',
            }}
          />

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 24,
              position: 'relative',
              zIndex: 10,
            }}
          >
            {/* Rotating Dark Green 8-Petal Daisy Icon */}
            <div
              style={{
                transform: `scale(${spring({
                  frame: Math.max(0, frame - 64),
                  fps,
                  config: { mass: 1, damping: 12, stiffness: 130 },
                })})`,
              }}
            >
              <DaisyFlowerIcon
                size={54}
                petalColor="#15803D"
                centerColor="#FACC15"
                rotationDeg={frame * 2.2}
              />
            </div>

            {/* "Ready to grow?" Staggered Words */}
            <div style={{ display: 'flex', gap: 18 }}>
              {finaleWords.map((word, idx) => {
                const wp = spring({
                  frame: Math.max(0, frame - (70 + idx * STAGGER)),
                  fps,
                  config: { mass: 1, damping: 14, stiffness: 120 },
                });
                const wOp = clamp01(wp);
                return (
                  <span
                    key={word}
                    style={{
                      display: 'inline-block',
                      fontFamily: "'SVN-Aeonik', sans-serif",
                      fontSize: 64,
                      fontWeight: 400,
                      color: '#065F46',
                      letterSpacing: '-0.02em',
                      opacity: wOp,
                      filter: `blur(${(1 - wOp) * 8}px)`,
                      transform: `translate3d(0, ${(1 - wp) * 34}px, 0) scale(${0.94 + 0.06 * wp})`,
                    }}
                  >
                    {word}
                  </span>
                );
              })}
            </div>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

// ============================================================================
// MAIN COMPOSITION: PinterestMotionClone (900 frames = 15.0s @ 60fps, 1920x1080)
// ============================================================================
export const PinterestMotionClone: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: '#031F1A', overflow: 'hidden' }}>
      {/* Scene 1: 0 - 150f (0.0s - 2.5s) */}
      {frame < 155 && <Scene1EverythingStarts frame={frame} fps={fps} />}

      {/* Scene 2: 150 - 300f (2.5s - 5.0s) */}
      {frame >= 145 && frame < 305 && (
        <Scene2OrbitSketch frame={frame - 150} fps={fps} />
      )}

      {/* Scene 3: 300 - 450f (5.0s - 7.5s) */}
      {frame >= 295 && frame < 455 && (
        <Scene3WhatIfLaserSlit frame={frame - 300} fps={fps} />
      )}

      {/* Scene 4: 450 - 600f (7.5s - 10.0s) */}
      {frame >= 448 && frame < 605 && (
        <Scene4GrowthKinetic frame={frame - 450} fps={fps} />
      )}

      {/* Scene 5: 600 - 750f (10.0s - 12.5s) */}
      {frame >= 595 && frame < 755 && (
        <Scene5DesignBento3D frame={frame - 600} fps={fps} />
      )}

      {/* Scene 6: 750 - 900f (12.5s - 15.0s) */}
      {frame >= 745 && <Scene6ReadyToGrowFinale frame={frame - 750} fps={fps} />}

      {/* Subtle Anti-Banding Film Grain Pass */}
      <svg
        width="1920"
        height="1080"
        viewBox="0 0 1920 1080"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 200,
          opacity: 0.028,
          mixBlendMode: 'overlay',
        }}
      >
        <filter id="pinGrain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="3"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="1920" height="1080" filter="url(#pinGrain)" />
      </svg>
    </AbsoluteFill>
  );
};
