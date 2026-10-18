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

export interface VietBrandGoldProps {
  transparentBg?: boolean;
  alphaOverlayMode?: boolean;
}

// 8-Petal Luxury Gold Daisy / Star Emblem
const GoldStarFlower: React.FC<{
  size?: number;
  petalColor?: string;
  centerColor?: string;
  rotationDeg?: number;
  glowColor?: string;
}> = ({
  size = 48,
  petalColor = '#FDE047',
  centerColor = '#F59E0B',
  rotationDeg = 0,
  glowColor = 'rgba(250, 204, 21, 0.65)',
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
      <circle cx="50" cy="50" r="14.5" fill={centerColor} />
    </svg>
  );
};

// ============================================================================
// SCENE 1 (0 - 150f): "Mọi video triệu view đều bắt đầu từ..." + Gold Blob & Cursor
// ============================================================================
const Scene1StartHook: React.FC<{
  frame: number;
  fps: number;
  isPortrait: boolean;
}> = ({ frame, fps, isPortrait }) => {
  const enterP = spring({
    frame,
    fps,
    config: { mass: 1, damping: 15, stiffness: 120 },
  });
  const exitP = interpolate(frame, [130, 150], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: IN_OUT_QUINT,
  });

  const words = ['Mọi', 'video', 'triệu', 'view', 'đều', 'bắt', 'đầu', 'từ...'];

  const blobDropP = spring({
    frame: Math.max(0, frame - 18),
    fps,
    config: { mass: 1.08, damping: 11, stiffness: 135 },
  });
  const blobPulse = 1 + Math.sin(frame * 0.12) * 0.035;
  const blobY = (1 - blobDropP) * -260;
  const blobScaleX = 0.88 + 0.12 * blobDropP * blobPulse;
  const blobScaleY = 1.12 - 0.12 * blobDropP / blobPulse;

  const cursorMoveP = interpolate(frame, [24, 96], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EXPO_OUT,
  });

  const startPt: [number, number] = isPortrait ? [860, 1480] : [1420, 880];
  const c1Pt: [number, number] = isPortrait ? [740, 1240] : [1210, 730];
  const c2Pt: [number, number] = isPortrait ? [620, 1080] : [1040, 640];
  const endPt: [number, number] = isPortrait ? [560, 1015] : [1140, 585];

  const [curX, curY] = cubicBezierPoint(cursorMoveP, startPt, c1Pt, c2Pt, endPt);
  const clickP = interpolate(frame, [88, 98, 114], [0, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const rippleP = interpolate(frame, [90, 138], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EXPO_OUT,
  });

  const camScale = 0.96 + 0.04 * enterP + exitP * 0.12;
  const sceneOpacity = clamp01(enterP) * (1 - exitP);
  const sceneBlur = (1 - clamp01(enterP)) * 8 + exitP * 10;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#08090C',
        opacity: sceneOpacity,
        filter: `blur(${sceneBlur}px)`,
        transform: `scale(${camScale})`,
        overflow: 'hidden',
      }}
    >
      {/* Top Luxury Gold Ambient Halo */}
      <div
        style={{
          position: 'absolute',
          top: -240,
          left: isPortrait ? 120 : 320,
          width: 860,
          height: 540,
          borderRadius: 9999,
          background:
            'radial-gradient(circle, rgba(245, 158, 11, 0.28) 0%, rgba(8, 9, 12, 0) 70%)',
          filter: 'blur(45px)',
          transform: `translate3d(${Math.sin(frame * 0.03) * 35}px, 0, 0)`,
        }}
      />

      {/* Bottom-Left Glowing Gold Torus Ring */}
      <div
        style={{
          position: 'absolute',
          bottom: isPortrait ? -280 : -340,
          left: isPortrait ? -120 : 110,
          width: 780,
          height: 780,
          borderRadius: 9999,
          border: '66px solid rgba(250, 204, 21, 0.36)',
          boxShadow:
            '0 0 120px 32px rgba(245, 158, 11, 0.35), inset 0 0 90px rgba(250, 204, 21, 0.32)',
          filter: 'blur(28px)',
          transform: `translate3d(0, ${(1 - enterP) * 80}px, 0) scale(${0.9 + 0.12 * enterP})`,
        }}
      />

      {/* Center Content Container */}
      <div
        style={{
          position: 'absolute',
          top: isPortrait ? 780 : 455,
          left: isPortrait ? 84 : 150,
          right: isPortrait ? 84 : 150,
          display: 'flex',
          flexDirection: isPortrait ? 'column' : 'row',
          alignItems: isPortrait ? 'flex-start' : 'center',
          gap: isPortrait ? 38 : 22,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '12px 16px',
            maxWidth: isPortrait ? 900 : 1080,
          }}
        >
          {words.map((w, i) => {
            const wp = spring({
              frame: Math.max(0, frame - (6 + i * 4)),
              fps,
              config: { mass: 1, damping: 14, stiffness: 125 },
            });
            const isGold = w === 'triệu' || w === 'view';
            return (
              <span
                key={`${w}-${i}`}
                style={{
                  display: 'inline-block',
                  fontFamily: "'SVN-Aeonik', sans-serif",
                  fontSize: isPortrait ? 52 : 50,
                  fontWeight: isGold ? 800 : i < 2 ? 700 : 400,
                  color: isGold ? '#FACC15' : '#FAF8F5',
                  textShadow: isGold
                    ? '0 0 28px rgba(250, 204, 21, 0.45)'
                    : 'none',
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
        </div>

        {/* Dark Obsidian & Gold Glass Pill + Dropping Gold Elliptical Orb */}
        <div
          style={{
            position: 'relative',
            width: isPortrait ? 320 : 270,
            height: 70,
            borderRadius: 999,
            background: 'rgba(18, 20, 28, 0.82)',
            border: '1.5px solid rgba(250, 204, 21, 0.38)',
            boxShadow:
              'inset 0 2px 18px rgba(0,0,0,0.75), 0 0 30px rgba(245, 158, 11, 0.16)',
            display: 'flex',
            alignItems: 'center',
            paddingLeft: 28,
            backdropFilter: 'blur(18px)',
          }}
        >
          <div style={{ opacity: 0.65 }}>
            <GoldStarFlower
              size={30}
              petalColor="#FDE047"
              centerColor="#F59E0B"
              rotationDeg={frame * 1.6}
            />
          </div>
          <span
            style={{
              marginLeft: 14,
              fontFamily: "'SVN-Aeonik', sans-serif",
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: '0.1em',
              color: 'rgba(250, 248, 245, 0.6)',
            }}
          >
            IDEA SPARK
          </span>

          {/* Dropping Luxury Gold Elliptical Blob */}
          <div
            style={{
              position: 'absolute',
              top: -130,
              left: isPortrait ? 140 : -24,
              width: 114,
              height: 160,
              borderRadius: '999px',
              background:
                'radial-gradient(circle at 36% 32%, #FEF9C3 0%, #FACC15 52%, #D97706 100%)',
              boxShadow:
                '0 24px 55px rgba(245, 158, 11, 0.55), 0 0 46px rgba(250, 204, 21, 0.72)',
              transform: `translate3d(0, ${blobY}px, 0) rotate(-15deg) scaleX(${blobScaleX}) scaleY(${blobScaleY})`,
              willChange: 'transform',
            }}
          />
        </div>
      </div>

      {/* Gold-Tipped Cursor + Ripple */}
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
              top: -30,
              left: -30,
              width: 60,
              height: 60,
              borderRadius: 999,
              border: '2.2px solid #FDE047',
              boxShadow: '0 0 24px #FACC15',
              opacity: (1 - rippleP) * 0.8,
              transform: `scale(${0.4 + rippleP * 2.4})`,
            }}
          />
        )}
        <svg
          width="44"
          height="44"
          viewBox="0 0 42 42"
          style={{
            filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.7))',
          }}
        >
          <path
            d="M6 4L35 18L21 23L16 37L6 4Z"
            fill="#FEF08A"
            stroke="#F59E0B"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 2 (150 - 300f): GOLDEN ORBIT RINGS + COMET TRAIL & "Điểm chạm cảm xúc"
// (Also used in VietGoldAlphaOverlay when transparentBg = true)
// ============================================================================
const Scene2GoldenOrbitRings: React.FC<{
  frame: number;
  fps: number;
  isPortrait: boolean;
  transparentBg?: boolean;
  totalFrames?: number;
}> = ({
  frame,
  fps,
  isPortrait,
  transparentBg = false,
  totalFrames = 150,
}) => {
  const enterP = spring({
    frame,
    fps,
    config: { mass: 1, damping: 15, stiffness: 115 },
  });
  const exitStart = totalFrames - 22;
  const exitP = interpolate(frame, [exitStart, totalFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: IN_OUT_QUINT,
  });

  const heroWordP = spring({
    frame: Math.max(0, frame - 20),
    fps,
    config: { mass: 1, damping: 12, stiffness: 135 },
  });
  const subWordP = spring({
    frame: Math.max(0, frame - 32),
    fps,
    config: { mass: 1, damping: 14, stiffness: 120 },
  });

  // Intersection shockwave burst when text pops
  const burstP = interpolate(frame, [20, 78], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EXPO_OUT,
  });

  const ringScale = 0.85 + 0.16 * enterP + frame * 0.00055;
  const cometOffset1 = -frame * 9.2;
  const cometOffset2 = frame * 7.8;

  const sceneOpacity = clamp01(enterP) * (1 - exitP);
  const sceneBlur = (1 - clamp01(enterP)) * 8 + exitP * 8;

  const viewW = isPortrait ? 1080 : 1920;
  const viewH = isPortrait ? 1920 : 1080;
  const cx = viewW * 0.5;
  const cy = viewH * 0.5;
  const rMain = isPortrait ? 520 : 580;
  const offsetX = isPortrait ? 390 : 520;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: transparentBg ? 'transparent' : '#07080B',
        opacity: sceneOpacity,
        filter: `blur(${sceneBlur}px)`,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Golden Core Radial Glow */}
      <div
        style={{
          position: 'absolute',
          bottom: isPortrait ? 260 : -220,
          left: '50%',
          marginLeft: -520,
          width: 1040,
          height: 680,
          borderRadius: 9999,
          background:
            'radial-gradient(circle, rgba(245, 158, 11, 0.46) 0%, rgba(250, 204, 21, 0.18) 46%, transparent 74%)',
          filter: 'blur(42px)',
        }}
      />

      {/* 4 Intersecting Golden Orbit Rings + Glowing Comet Trails */}
      <svg
        width={viewW}
        height={viewH}
        viewBox={`0 0 ${viewW} ${viewH}`}
        style={{
          position: 'absolute',
          inset: 0,
          transform: `scale(${ringScale})`,
          willChange: 'transform',
        }}
      >
        <defs>
          <filter id="goldOrbitGlow">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="goldCometGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="45%" stopColor="#FEF08A" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>

        {/* Left Orbit Circle */}
        <circle
          cx={cx - offsetX}
          cy={cy - 40}
          r={rMain}
          fill="none"
          stroke="rgba(250, 204, 21, 0.28)"
          strokeWidth="2.2"
        />
        <circle
          cx={cx - offsetX}
          cy={cy - 40}
          r={rMain}
          fill="none"
          stroke="url(#goldCometGrad)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray="210 3400"
          strokeDashoffset={cometOffset1}
          filter="url(#goldOrbitGlow)"
        />

        {/* Right Orbit Circle */}
        <circle
          cx={cx + offsetX}
          cy={cy - 40}
          r={rMain}
          fill="none"
          stroke="rgba(250, 204, 21, 0.28)"
          strokeWidth="2.2"
        />
        <circle
          cx={cx + offsetX}
          cy={cy - 40}
          r={rMain}
          fill="none"
          stroke="url(#goldCometGrad)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray="230 3380"
          strokeDashoffset={cometOffset2}
          filter="url(#goldOrbitGlow)"
        />

        {/* Bottom Intersecting Orbit Circle */}
        <circle
          cx={cx}
          cy={cy + rMain + 85}
          r={rMain + 40}
          fill="none"
          stroke="rgba(253, 224, 71, 0.36)"
          strokeWidth="2.5"
        />
        <circle
          cx={cx}
          cy={cy + rMain + 85}
          r={rMain + 40}
          fill="none"
          stroke="#FACC15"
          strokeWidth="6.5"
          strokeLinecap="round"
          strokeDasharray="250 3600"
          strokeDashoffset={cometOffset1 * 1.18}
          filter="url(#goldOrbitGlow)"
        />

        {/* Top Intersecting Orbit Circle */}
        <circle
          cx={cx}
          cy={cy - rMain - 165}
          r={rMain + 40}
          fill="none"
          stroke="rgba(250, 204, 21, 0.24)"
          strokeWidth="2"
        />

        {/* Expanding Golden Shockwave Ring at Central Intersection */}
        {burstP > 0.01 && burstP < 0.99 && (
          <circle
            cx={cx}
            cy={cy + 40}
            r={40 + burstP * 320}
            fill="none"
            stroke="#FDE047"
            strokeWidth={3.5 * (1 - burstP)}
            opacity={(1 - burstP) * 0.75}
            filter="url(#goldOrbitGlow)"
          />
        )}

        {/* Glowing Intersection Nodes */}
        <circle
          cx={cx}
          cy={cy - 245}
          r="6"
          fill="#FFFFFF"
          filter="url(#goldOrbitGlow)"
        />
        <circle
          cx={cx - 340}
          cy={cy + 340}
          r="5.5"
          fill="#FDE047"
          filter="url(#goldOrbitGlow)"
        />
        <circle
          cx={cx + 340}
          cy={cy + 340}
          r="6"
          fill="#FFFFFF"
          filter="url(#goldOrbitGlow)"
        />
      </svg>

      {/* Rotating Gold 8-Petal Flower on Upper-Right Orbit */}
      <div
        style={{
          position: 'absolute',
          top: isPortrait ? cy - 360 : 188,
          left: isPortrait ? cx + 210 : 1310,
          transform: `scale(${0.85 + 0.2 * enterP})`,
        }}
      >
        <GoldStarFlower
          size={50}
          petalColor="#FEF08A"
          centerColor="#F59E0B"
          rotationDeg={frame * 2.5}
          glowColor="rgba(250, 204, 21, 0.85)"
        />
      </div>

      {/* Central Intersection Text Burst: "Điểm chạm cảm xúc" */}
      <div
        style={{
          position: 'relative',
          zIndex: 15,
          marginTop: isPortrait ? 60 : 95,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 14,
        }}
      >
        <div
          style={{
            padding: '7px 20px',
            borderRadius: 999,
            background: 'rgba(245, 158, 11, 0.14)',
            border: '1px solid rgba(250, 204, 21, 0.5)',
            color: '#FDE047',
            fontFamily: "'SVN-Aeonik', sans-serif",
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: '0.18em',
            opacity: clamp01(subWordP),
            transform: `translate3d(0, ${(1 - subWordP) * 20}px, 0)`,
          }}
        >
          GIAO ĐIỂM VÀNG • GOLDEN ORBIT
        </div>

        <div
          style={{
            opacity: clamp01(heroWordP),
            filter: `blur(${(1 - clamp01(heroWordP)) * 10}px)`,
            transform: `translate3d(0, ${(1 - heroWordP) * 44}px, 0) scale(${0.86 + 0.14 * heroWordP})`,
          }}
        >
          <span
            style={{
              fontFamily: "'SVN-Aeonik', sans-serif",
              fontSize: isPortrait ? 72 : 84,
              fontWeight: 900,
              background:
                'linear-gradient(180deg, #FFFFFF 0%, #FEF08A 42%, #FACC15 80%, #D97706 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
              filter: 'drop-shadow(0 0 34px rgba(250, 204, 21, 0.55))',
            }}
          >
            Điểm chạm cảm xúc
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 3 (300 - 450f): "Nếu biến lời nói thành hình ảnh..." -> Golden Sword Slit
// ============================================================================
const Scene3GoldenSwordSlit: React.FC<{
  frame: number;
  fps: number;
  isPortrait: boolean;
}> = ({ frame, fps, isPortrait }) => {
  const cardSpring = spring({
    frame: Math.max(0, frame - 8),
    fps,
    config: { mass: 1, damping: 14, stiffness: 115 },
  });

  const textWords = ['Nếu', 'biến', 'lời', 'nói', 'thành', 'hình', 'ảnh...'];

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

  const viewW = isPortrait ? 1080 : 1920;
  const viewH = isPortrait ? 1920 : 1080;
  const midY = viewH * 0.5;
  const laserX = interpolate(laserActiveP, [0, 1], [viewW * 0.82, viewW * 0.12]);
  const laserOpacity = interpolate(frame, [76, 86, 138, 148], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#08090C',
        overflow: 'hidden',
      }}
    >
      {/* Ambient Gold Glow */}
      <div
        style={{
          position: 'absolute',
          bottom: -160,
          left: isPortrait ? 80 : 220,
          width: 820,
          height: 540,
          borderRadius: 9999,
          background:
            'radial-gradient(circle, rgba(245, 158, 11, 0.42) 0%, rgba(250, 204, 21, 0.15) 52%, transparent 75%)',
          filter: 'blur(42px)',
          transform: `translate3d(${-laserActiveP * 120}px, 0, 0)`,
        }}
      />

      {/* Tilted -35deg Obsidian & Gold Glass Card */}
      <div
        style={{
          position: 'absolute',
          top: isPortrait ? 430 : 240,
          right: isPortrait ? 190 : 260,
          width: isPortrait ? 360 : 390,
          height: isPortrait ? 360 : 390,
          borderRadius: 38,
          background:
            'linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(250, 204, 21, 0.2) 100%)',
          backdropFilter: 'blur(22px)',
          WebkitBackdropFilter: 'blur(22px)',
          border: '2px solid rgba(253, 224, 71, 0.72)',
          boxShadow:
            '28px -18px 85px rgba(245, 158, 11, 0.58), inset -12px 12px 38px rgba(254, 240, 138, 0.32)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          opacity: clamp01(cardSpring) * (1 - laserActiveP * 0.95),
          transform: `translate3d(${(1 - cardSpring) * 90}px, ${(1 - cardSpring) * -50}px, 0) rotate(-35deg) scale(${0.86 + 0.14 * cardSpring})`,
        }}
      >
        <GoldStarFlower
          size={132}
          petalColor="#FACC15"
          centerColor="#FFFFFF"
          rotationDeg={frame * 2.2}
          glowColor="rgba(250, 204, 21, 0.9)"
        />
      </div>

      {/* Bottom-Left Vietnamese Text: "Nếu biến lời nói thành hình ảnh..." */}
      <div
        style={{
          position: 'absolute',
          bottom: isPortrait ? 340 : 155,
          left: isPortrait ? 84 : 115,
          right: isPortrait ? 84 : 500,
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px 14px',
          opacity: 1 - laserActiveP * 0.9,
          transform: `translate3d(${-laserActiveP * 80}px, 0, 0)`,
        }}
      >
        {textWords.map((w, idx) => {
          const wp = spring({
            frame: Math.max(0, frame - (10 + idx * 4)),
            fps,
            config: { mass: 1, damping: 14, stiffness: 125 },
          });
          const isGold = w === 'hình' || w === 'ảnh...';
          return (
            <span
              key={`${w}-${idx}`}
              style={{
                display: 'inline-block',
                fontFamily: "'SVN-Aeonik', sans-serif",
                fontSize: isPortrait ? 50 : 52,
                fontWeight: isGold ? 800 : 700,
                color: isGold ? '#FACC15' : '#FAF8F5',
                letterSpacing: '-0.02em',
                opacity: clamp01(wp),
                filter: `blur(${(1 - clamp01(wp)) * 10}px)`,
                transform: `translate3d(${(1 - wp) * 28}px, ${(1 - wp) * 24}px, 0)`,
              }}
            >
              {w}
            </span>
          );
        })}
      </div>

      {/* Golden Laser Sword Slit Cut */}
      {frame >= 74 && (
        <>
          <svg
            width={viewW}
            height={viewH}
            viewBox={`0 0 ${viewW} ${viewH}`}
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
            }}
          >
            <polygon
              points={`0,${midY - 110 - slitExpandP * 900} ${laserX},${midY} 0,${midY + 110 + slitExpandP * 900}`}
              fill="#040507"
            />
          </svg>

          <div
            style={{
              position: 'absolute',
              top: midY - 14,
              left: laserX,
              width: 210,
              height: 28,
              borderRadius: 999,
              background: '#FFFFFF',
              boxShadow:
                '0 0 30px 12px #FDE047, 0 0 75px 26px #F59E0B, 0 0 140px 44px rgba(250, 204, 21, 0.85)',
              opacity: laserOpacity,
              transform: `scaleX(${0.7 + 0.5 * Math.sin(laserActiveP * Math.PI)})`,
            }}
          />
        </>
      )}

      {/* Warm Ivory White Slit Wipe Expansion into Scene 4 */}
      {slitExpandP > 0.001 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(135deg, #FAF8F5 0%, #FEF9C3 55%, #FAF8F5 100%)',
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
// SCENE 4 (450 - 600f): "CHUYỂN ĐỔI" Kinetic Echo Stack & 3D Gold-Black Ribbon
// ============================================================================
const Scene4ConversionEcho: React.FC<{
  frame: number;
  fps: number;
  isPortrait: boolean;
}> = ({ frame, fps, isPortrait }) => {
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

  const circleScale = interpolate(frame, [0, 95], [0.45, 1.08], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EXPO_OUT,
  });

  const stackWave = interpolate(frame, [0, 110], [1, 0.24], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EXPO_OUT,
  });

  const echoOffsets = [-3, -2, -1, 0, 1, 2];

  const ribbonP = interpolate(frame, [24, 122], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EXPO_OUT,
  });

  return (
    <AbsoluteFill
      style={{
        background:
          'linear-gradient(125deg, #FAF8F5 0%, #F7F3E9 55%, #FEFCE8 100%)',
        opacity: 1 - exitP,
        filter: `blur(${exitP * 10}px)`,
        overflow: 'hidden',
      }}
    >
      {/* Left Expanding Champagne Gold Circle */}
      <div
        style={{
          position: 'absolute',
          top: isPortrait ? 260 : 40,
          left: isPortrait ? -320 : -260,
          width: isPortrait ? 860 : 980,
          height: isPortrait ? 860 : 980,
          borderRadius: 9999,
          background:
            'radial-gradient(circle at 60% 45%, #FEF08A 0%, #FDE047 68%, #FACC15 100%)',
          border: '2px solid rgba(15, 23, 42, 0.25)',
          transform: `scale(${circleScale})`,
          willChange: 'transform',
        }}
      />

      {/* Center Kinetic Typography Stack: "CHUYỂN ĐỔI" */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: isPortrait ? 0 : 120,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10,
        }}
      >
        {echoOffsets.map((offset) => {
          const isMain = offset === 0;
          const absOff = Math.abs(offset);
          const yShift = offset * (isPortrait ? 80 : 92) * (0.65 + 0.35 * stackWave);
          const op = isMain
            ? clamp01(enterP)
            : Math.max(0.06, (0.34 - absOff * 0.09) * clamp01(enterP));

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
                  fontSize: isPortrait ? 82 : 104,
                  fontWeight: 900,
                  letterSpacing: '-0.03em',
                  color: isMain ? '#08090C' : '#D97706',
                  textShadow: isMain
                    ? '0 12px 32px rgba(245, 158, 11, 0.32)'
                    : 'none',
                }}
              >
                CHUYỂN ĐỔI
              </span>

              {isMain && (
                <div
                  style={{
                    marginLeft: 18,
                    padding: '8px 18px',
                    borderRadius: 14,
                    background: '#FACC15',
                    border: '2px solid #08090C',
                    color: '#08090C',
                    fontFamily: "'SVN-Aeonik', sans-serif",
                    fontSize: isPortrait ? 22 : 26,
                    fontWeight: 900,
                  }}
                >
                  10X
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Right Curved Obsidian & Luxury Gold 3D Ribbon Loop */}
      <div
        style={{
          position: 'absolute',
          top: isPortrait ? 520 : 0,
          right: 0,
          width: 760,
          height: 1080,
          opacity: ribbonP,
          transform: `translate3d(${(1 - ribbonP) * 120}px, 0, 0)`,
        }}
      >
        <svg width="760" height="1080" viewBox="0 0 760 1080">
          <defs>
            <linearGradient id="goldRibbonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="50%" stopColor="#FACC15" />
              <stop offset="100%" stopColor="#FEF08A" />
            </linearGradient>
          </defs>
          <path
            d="M 280 560 C 280 280, 580 280, 580 560 C 580 780, 420 860, 680 900"
            fill="none"
            stroke="#08090C"
            strokeWidth="52"
            strokeLinecap="round"
            strokeDasharray="1600"
            strokeDashoffset={1600 * (1 - ribbonP)}
          />
          <path
            d="M 120 -40 C 110 420, 310 740, 680 860"
            fill="none"
            stroke="url(#goldRibbonGrad)"
            strokeWidth="42"
            strokeLinecap="round"
            strokeDasharray="1400"
            strokeDashoffset={1400 * (1 - ribbonP)}
          />
        </svg>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 5 (600 - 750f): "Thiết kế tự động" -> 3D Obsidian & Gold Bento Dashboard
// ============================================================================
const Scene5ObsidianGoldBento3D: React.FC<{
  frame: number;
  fps: number;
  isPortrait: boolean;
}> = ({ frame, fps, isPortrait }) => {
  const ringIntroP = spring({
    frame,
    fps,
    config: { mass: 1, damping: 14, stiffness: 120 },
  });
  const dashboardRevealP = spring({
    frame: Math.max(0, frame - 32),
    fps,
    config: { mass: 1, damping: 16, stiffness: 110 },
  });
  const camera3DTiltP = interpolate(frame, [58, 138], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: IN_OUT_QUINT,
  });
  const exitP = interpolate(frame, [132, 150], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: IN_OUT_QUINT,
  });

  const ringFadeOut = interpolate(frame, [28, 54], [1, 0.16], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const ringExpand = interpolate(frame, [28, 74], [1, 1.55], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EXPO_OUT,
  });

  const rotY = -20 * camera3DTiltP;
  const rotX = 8.5 * camera3DTiltP;
  const baseScale = isPortrait ? 0.78 : 0.94;
  const camScale = baseScale + 0.06 * dashboardRevealP + camera3DTiltP * 0.04;

  const splineDrawP = interpolate(frame, [42, 118], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EXPO_OUT,
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#08090C',
        perspective: '1600px',
        opacity: 1 - exitP,
        filter: `blur(${exitP * 8}px)`,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Subtle Luxury Gold Grid */}
      <AbsoluteFill
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(250, 204, 21, 0.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(250, 204, 21, 0.06) 1px, transparent 1px)
          `,
          backgroundSize: '120px 120px',
        }}
      />

      {/* Glowing Luxury Gold Torus Ring + "Thiết kế tự động" */}
      <div
        style={{
          position: 'absolute',
          width: 760,
          height: 760,
          borderRadius: 9999,
          border: '64px solid rgba(250, 204, 21, 0.58)',
          boxShadow:
            '0 0 120px 35px rgba(245, 158, 11, 0.58), inset 0 0 90px 25px rgba(250, 204, 21, 0.48)',
          filter: 'blur(18px)',
          opacity: clamp01(ringIntroP) * ringFadeOut,
          transform: `scale(${(0.75 + 0.25 * ringIntroP) * ringExpand})`,
          pointerEvents: 'none',
        }}
      />

      {frame < 56 && (
        <div
          style={{
            position: 'absolute',
            zIndex: 30,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            opacity:
              clamp01(ringIntroP) *
              interpolate(frame, [28, 48], [1, 0], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              }),
            transform: `scale(${0.88 + 0.12 * ringIntroP})`,
          }}
        >
          <span
            style={{
              fontFamily: "'SVN-Aeonik', sans-serif",
              fontSize: isPortrait ? 64 : 74,
              fontWeight: 800,
              color: '#FAF8F5',
              letterSpacing: '-0.02em',
            }}
          >
            Thiết kế tự động
          </span>
          <div
            style={{
              width: 38,
              height: 28,
              borderRadius: 6,
              background: '#FACC15',
              boxShadow: '0 0 22px #FACC15',
            }}
          />
        </div>
      )}

      {/* 3D Floating Obsidian & Gold Bento UI Dashboard */}
      {frame >= 30 && (
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
          {/* Floating Top Luxury Gold Neon Pill */}
          <div
            style={{
              position: 'absolute',
              top: -48,
              right: 40,
              width: 440,
              height: 56,
              borderRadius: 999,
              background: 'linear-gradient(90deg, #FEF08A 0%, #FACC15 50%, #F59E0B 100%)',
              boxShadow: '0 0 55px rgba(250, 204, 21, 0.78)',
              transform: `translateZ(${95 * camera3DTiltP}px) rotate(-5deg)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: "'SVN-Aeonik', sans-serif",
              fontSize: 16,
              fontWeight: 900,
              color: '#08090C',
              letterSpacing: '0.12em',
            }}
          >
            FEDU STUDIO • SKIA GPU 60FPS
          </div>

          {/* Main Obsidian Glass Bento Frame */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 36,
              padding: 28,
              background:
                'linear-gradient(145deg, rgba(24, 26, 34, 0.92) 0%, rgba(10, 12, 18, 0.96) 100%)',
              border: '2px solid rgba(250, 204, 21, 0.48)',
              boxShadow:
                '0 45px 95px rgba(0, 0, 0, 0.85), 0 0 65px rgba(245, 158, 11, 0.25)',
              backdropFilter: 'blur(24px)',
              display: 'grid',
              gridTemplateColumns: '90px 1.25fr 1fr',
              gap: 24,
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Left Sidebar */}
            <div
              style={{
                borderRadius: 24,
                background: 'rgba(18, 20, 28, 0.85)',
                border: '1px solid rgba(250, 204, 21, 0.28)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '22px 0',
                justifyContent: 'space-between',
                transform: `translateZ(${30 * camera3DTiltP}px)`,
              }}
            >
              <GoldStarFlower
                size={38}
                petalColor="#FDE047"
                centerColor="#F59E0B"
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
                          ? 'rgba(250, 204, 21, 0.28)'
                          : 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(250, 204, 21, 0.32)',
                    }}
                  />
                ))}
              </div>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 99,
                  background: '#FACC15',
                }}
              />
            </div>

            {/* Center Column: Gold Hero Card + 85% / 100% Circular Gauges */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 22,
                transformStyle: 'preserve-3d',
              }}
            >
              <div
                style={{
                  flex: 1.15,
                  borderRadius: 26,
                  padding: '24px 28px',
                  background:
                    'linear-gradient(135deg, #FEF08A 0%, #FACC15 55%, #D97706 100%)',
                  boxShadow: '0 24px 50px rgba(0, 0, 0, 0.5)',
                  position: 'relative',
                  overflow: 'hidden',
                  transform: `translateZ(${75 * camera3DTiltP}px)`,
                }}
              >
                <div
                  style={{
                    fontFamily: "'SVN-Aeonik', sans-serif",
                    fontSize: 16,
                    fontWeight: 800,
                    color: '#08090C',
                    letterSpacing: '0.06em',
                    marginBottom: 8,
                  }}
                >
                  NGUYỄN VIỆT • CREATOR ENGINE
                </div>
                <div
                  style={{
                    fontFamily: "'SVN-Aeonik', sans-serif",
                    fontSize: 44,
                    fontWeight: 900,
                    color: '#08090C',
                    lineHeight: 1.05,
                  }}
                >
                  60.0 FPS
                </div>
                <div
                  style={{
                    fontFamily: "'SVN-Aeonik', sans-serif",
                    fontSize: 20,
                    fontWeight: 700,
                    color: '#1E293B',
                    marginTop: 10,
                  }}
                >
                  Mượt chuẩn Apple Sub-pixel
                </div>
              </div>

              {/* Middle Row Pills */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 14,
                  transform: `translateZ(${50 * camera3DTiltP}px)`,
                }}
              >
                {['KỊCH BẢN', 'NHỊP ĐẬP', 'TỰ ĐỘNG'].map((lbl, idx) => (
                  <div
                    key={lbl}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 16,
                      background:
                        idx < 2
                          ? 'linear-gradient(90deg, #FACC15 0%, #FDE047 100%)'
                          : 'rgba(24, 26, 36, 0.9)',
                      color: idx < 2 ? '#08090C' : '#FDE047',
                      border: '1px solid rgba(250, 204, 21, 0.35)',
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

              {/* Bottom 2 Circular Gauge Cards */}
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
                  { pct: '85%', sub: 'GIỮ CHÂN', dash: 245 },
                  { pct: '100%', sub: 'TỰ ĐỘNG', dash: 285 },
                ].map((g) => (
                  <div
                    key={g.pct}
                    style={{
                      borderRadius: 24,
                      background: 'rgba(15, 17, 24, 0.9)',
                      border: '1.5px solid rgba(250, 204, 21, 0.35)',
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
                        fill="#FAF8F5"
                        stroke="rgba(250, 204, 21, 0.25)"
                        strokeWidth="12"
                      />
                      <circle
                        cx="68"
                        cy="68"
                        r="48"
                        fill="none"
                        stroke="#F59E0B"
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray="300"
                        strokeDashoffset={300 - g.dash * splineDrawP}
                        transform="rotate(-90 68 68)"
                      />
                    </svg>
                    <div
                      style={{
                        position: 'absolute',
                        textAlign: 'center',
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "'SVN-Aeonik', sans-serif",
                          fontSize: 22,
                          fontWeight: 900,
                          color: '#08090C',
                        }}
                      >
                        {g.pct}
                      </div>
                      <div
                        style={{
                          fontFamily: "'SVN-Aeonik', sans-serif",
                          fontSize: 9,
                          fontWeight: 800,
                          color: '#78350F',
                        }}
                      >
                        {g.sub}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Spline Chart + Ivory White Card */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
                transformStyle: 'preserve-3d',
              }}
            >
              <div
                style={{
                  flex: 1.25,
                  borderRadius: 24,
                  padding: '20px 22px',
                  background: 'rgba(12, 14, 20, 0.92)',
                  border: '1.5px solid rgba(250, 204, 21, 0.42)',
                  boxShadow: '0 20px 45px rgba(0,0,0,0.6)',
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
                        color: '#FDE047',
                      }}
                    >
                      Biểu đồ tăng trưởng
                    </div>
                    <div
                      style={{
                        fontFamily: "'SVN-Aeonik', sans-serif",
                        fontSize: 18,
                        fontWeight: 800,
                        color: '#FAF8F5',
                      }}
                    >
                      Chuyển đổi thực chiến
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[0, 1, 2, 3, 4].map((d) => (
                      <div
                        key={d}
                        style={{
                          width: 11,
                          height: 11,
                          borderRadius: 99,
                          background: '#FACC15',
                          boxShadow: '0 0 8px #FACC15',
                        }}
                      />
                    ))}
                  </div>
                </div>

                <svg width="360" height="135" viewBox="0 0 360 135">
                  <path
                    d="M 10 110 C 60 85, 85 95, 130 62 C 175 30, 210 88, 255 38 C 295 4, 325 55, 350 42"
                    fill="none"
                    stroke="#FACC15"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    strokeDasharray="520"
                    strokeDashoffset={520 * (1 - splineDrawP)}
                  />
                  <path
                    d="M 10 120 C 70 105, 110 75, 165 92 C 220 108, 260 65, 350 72"
                    fill="none"
                    stroke="rgba(250, 248, 245, 0.55)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray="520"
                    strokeDashoffset={520 * (1 - splineDrawP)}
                  />
                  <g transform="translate(226, 6)">
                    <rect width="62" height="24" rx="6" fill="#FACC15" />
                    <text
                      x="31"
                      y="16"
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight="900"
                      fill="#08090C"
                      fontFamily="SVN-Aeonik, sans-serif"
                    >
                      +184%
                    </text>
                  </g>
                </svg>
              </div>

              {/* Warm Ivory White Card */}
              <div
                style={{
                  borderRadius: 22,
                  padding: '18px 24px',
                  background: '#FAF8F5',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  boxShadow: '0 18px 40px rgba(0,0,0,0.45)',
                  transform: `translateZ(${60 * camera3DTiltP}px)`,
                }}
              >
                <span
                  style={{
                    fontFamily: "'SVN-Aeonik', sans-serif",
                    fontSize: 24,
                    fontWeight: 900,
                    color: '#08090C',
                  }}
                >
                  0 Keyframes
                </span>
                <span
                  style={{
                    padding: '6px 14px',
                    borderRadius: 99,
                    background: '#FEF08A',
                    color: '#08090C',
                    fontFamily: "'SVN-Aeonik', sans-serif",
                    fontSize: 12,
                    fontWeight: 900,
                  }}
                >
                  CODE THUẦN 100%
                </span>
              </div>

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
                    background: 'rgba(250, 204, 21, 0.16)',
                    border: '1px solid rgba(250, 204, 21, 0.38)',
                  }}
                />
                <div
                  style={{
                    height: 62,
                    borderRadius: 18,
                    background: 'linear-gradient(90deg, #FACC15 0%, #F59E0B 100%)',
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
// SCENE 6 (750 - 900f): "Làm kỹ từng khung hình" -> "✳ Sẵn sàng làm chủ cuộc chơi?"
// ============================================================================
const Scene6LuxuryFinale: React.FC<{
  frame: number;
  fps: number;
  isPortrait: boolean;
}> = ({ frame, fps, isPortrait }) => {
  const phaseAP = spring({
    frame,
    fps,
    config: { mass: 1, damping: 14, stiffness: 120 },
  });

  const ivoryWipeP = interpolate(frame, [54, 86], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: IN_OUT_QUINT,
  });

  const finaleWords = ['Sẵn', 'sàng', 'làm', 'chủ', 'cuộc', 'chơi?'];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#08090C',
        overflow: 'hidden',
      }}
    >
      {/* Phase A: Obsidian Black + Luxury Gold */}
      <AbsoluteFill
        style={{
          opacity: 1 - ivoryWipeP,
          transform: `scale(${1 + ivoryWipeP * 0.08})`,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -120,
            right: -140,
            width: 720,
            height: 720,
            borderRadius: 9999,
            border: '56px solid rgba(250, 204, 21, 0.32)',
            filter: 'blur(26px)',
          }}
        />

        <div
          style={{
            position: 'absolute',
            top: isPortrait ? 240 : 95,
            left: isPortrait ? 90 : 140,
            fontFamily: "'SVN-Aeonik', sans-serif",
            fontSize: isPortrait ? 52 : 60,
            fontWeight: 400,
            color: '#FDE047',
            opacity: clamp01(phaseAP),
            transform: `translate3d(0, ${(1 - phaseAP) * 32}px, 0)`,
          }}
        >
          Bởi vì
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: isPortrait ? 380 : 140,
            left: isPortrait ? 90 : 115,
            right: isPortrait ? 90 : 400,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'baseline',
            gap: 20,
            opacity: clamp01(phaseAP),
            transform: `translate3d(0, ${(1 - phaseAP) * 40}px, 0)`,
          }}
        >
          <span
            style={{
              fontFamily: "'SVN-Aeonik', sans-serif",
              fontSize: isPortrait ? 52 : 58,
              fontWeight: 400,
              color: '#FAF8F5',
            }}
          >
            Làm kỹ
          </span>
          <span
            style={{
              fontFamily: "'SVN-Aeonik', sans-serif",
              fontSize: isPortrait ? 56 : 64,
              fontWeight: 900,
              color: '#FACC15',
            }}
          >
            từng khung hình
          </span>
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: isPortrait ? 240 : 125,
            left: isPortrait ? 90 : 880,
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            transform: `scale(${phaseAP})`,
          }}
        >
          <GoldStarFlower
            size={74}
            petalColor="#FEF08A"
            centerColor="#F59E0B"
            rotationDeg={frame * 2.6}
          />
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 999,
              background: '#FACC15',
              border: '2px solid #FAF8F5',
            }}
          />
        </div>
      </AbsoluteFill>

      {/* Phase B: Warm Ivory White Finale ("✳ Sẵn sàng làm chủ cuộc chơi?") */}
      {ivoryWipeP > 0.01 && (
        <AbsoluteFill
          style={{
            background:
              'linear-gradient(120deg, #FAF8F5 0%, #FFFBEB 55%, #FEF9C3 100%)',
            opacity: ivoryWipeP,
            justifyContent: 'center',
            alignItems: 'center',
            padding: isPortrait ? '0 70px' : '0 120px',
          }}
        >
          <div
            style={{
              position: 'absolute',
              width: 900,
              height: 900,
              borderRadius: 9999,
              background:
                'radial-gradient(circle, rgba(250, 204, 21, 0.35) 0%, transparent 70%)',
              filter: 'blur(50px)',
            }}
          />

          <div
            style={{
              display: 'flex',
              flexDirection: isPortrait ? 'column' : 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 24,
              position: 'relative',
              zIndex: 10,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                transform: `scale(${spring({
                  frame: Math.max(0, frame - 64),
                  fps,
                  config: { mass: 1, damping: 12, stiffness: 130 },
                })})`,
              }}
            >
              <GoldStarFlower
                size={62}
                petalColor="#08090C"
                centerColor="#FACC15"
                rotationDeg={frame * 2.2}
                glowColor="rgba(245, 158, 11, 0.45)"
              />
            </div>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '10px 18px',
              }}
            >
              {finaleWords.map((word, idx) => {
                const wp = spring({
                  frame: Math.max(0, frame - (68 + idx * 4)),
                  fps,
                  config: { mass: 1, damping: 14, stiffness: 120 },
                });
                const wOp = clamp01(wp);
                const isHighlight = word === 'chủ' || word === 'cuộc' || word === 'chơi?';
                return (
                  <span
                    key={`${word}-${idx}`}
                    style={{
                      display: 'inline-block',
                      fontFamily: "'SVN-Aeonik', sans-serif",
                      fontSize: isPortrait ? 58 : 66,
                      fontWeight: isHighlight ? 900 : 500,
                      color: '#08090C',
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
// MAIN EXPORT: VietBrandPinterestGold
// Supports:
// - VietGold16x9 (1920x1080 @ 60fps, 900 frames)
// - VietGold9x16 (1080x1920 @ 60fps, 900 frames)
// - VietGoldAlphaOverlay (1080x1920 @ 60fps, 240 frames, transparentBg: true)
// ============================================================================
export const VietBrandPinterestGold: React.FC<VietBrandGoldProps> = ({
  transparentBg = false,
  alphaOverlayMode = false,
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps, durationInFrames } = useVideoConfig();
  const isPortrait = height > width;

  // Dedicated 4-second (240f) Transparent ProRes 4444 Overlay Mode for CapCut
  if (transparentBg || alphaOverlayMode) {
    const swordFlashP = interpolate(frame, [195, 225, 240], [0, 1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    const swordX = interpolate(frame, [192, 232], [width * 0.9, width * 0.08], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: IN_OUT_QUINT,
    });

    return (
      <AbsoluteFill style={{ backgroundColor: 'transparent', overflow: 'hidden' }}>
        <Scene2GoldenOrbitRings
          frame={frame}
          fps={fps}
          isPortrait={isPortrait}
          transparentBg={true}
          totalFrames={durationInFrames}
        />

        {/* Golden Laser Sword Wipe Accent at the end of the Alpha Overlay */}
        {swordFlashP > 0.01 && (
          <div
            style={{
              position: 'absolute',
              top: height * 0.5 - 12,
              left: swordX,
              width: 240,
              height: 24,
              borderRadius: 999,
              background: '#FFFFFF',
              boxShadow:
                '0 0 32px 12px #FDE047, 0 0 80px 28px #F59E0B, 0 0 140px 45px rgba(250, 204, 21, 0.9)',
              opacity: swordFlashP,
            }}
          />
        )}
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{ backgroundColor: '#08090C', overflow: 'hidden' }}>
      {/* Scene 1: 0 - 150f */}
      {frame < 155 && (
        <Scene1StartHook frame={frame} fps={fps} isPortrait={isPortrait} />
      )}

      {/* Scene 2 (HERO ORBIT RINGS): 150 - 300f */}
      {frame >= 145 && frame < 305 && (
        <Scene2GoldenOrbitRings
          frame={frame - 150}
          fps={fps}
          isPortrait={isPortrait}
          transparentBg={false}
          totalFrames={150}
        />
      )}

      {/* Scene 3: 300 - 450f */}
      {frame >= 295 && frame < 455 && (
        <Scene3GoldenSwordSlit
          frame={frame - 300}
          fps={fps}
          isPortrait={isPortrait}
        />
      )}

      {/* Scene 4: 450 - 600f */}
      {frame >= 448 && frame < 605 && (
        <Scene4ConversionEcho
          frame={frame - 450}
          fps={fps}
          isPortrait={isPortrait}
        />
      )}

      {/* Scene 5: 600 - 750f */}
      {frame >= 595 && frame < 755 && (
        <Scene5ObsidianGoldBento3D
          frame={frame - 600}
          fps={fps}
          isPortrait={isPortrait}
        />
      )}

      {/* Scene 6: 750 - 900f */}
      {frame >= 745 && (
        <Scene6LuxuryFinale
          frame={frame - 750}
          fps={fps}
          isPortrait={isPortrait}
        />
      )}
    </AbsoluteFill>
  );
};
