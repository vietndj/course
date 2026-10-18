import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Easing,
  OffthreadVideo,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const EXPO_OUT = Easing.bezier(0.16, 1, 0.3, 1);

const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));
const nfc = (s: string): string => s.normalize('NFC');

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
  return [
    uuu * p0[0] + 3 * uu * t * p1[0] + 3 * u * tt * p2[0] + ttt * p3[0],
    uuu * p0[1] + 3 * uu * t * p1[1] + 3 * u * tt * p2[1] + ttt * p3[1],
  ];
};

export interface VietSemanticEraProps {
  mode?: 'full-9x16' | 'full-16x9' | 'hybrid-9x16';
}

// ============================================================================
// WORD-EXACT SUBTITLE TIMELINE (1620 frames @ 60fps = 27.00s)
// ============================================================================
interface TranscriptSegment {
  scene: number;
  startFrame: number;
  endFrame: number;
  text: string;
  highlight: string;
  tag: string;
}

const TRANSCRIPT_SEGMENTS: TranscriptSegment[] = [
  {
    scene: 1,
    startFrame: 0,
    endFrame: 240,
    text: nfc('Cái mạng xã hội cũ mà mình từng biết — NÓ ĐÃ CHẾT RỒI.'),
    highlight: nfc('NÓ ĐÃ CHẾT RỒI.'),
    tag: 'PIN_04 • KINETIC STROBE & HARD INVERT',
  },
  {
    scene: 2,
    startFrame: 240,
    endFrame: 442,
    text: nfc('Bây giờ là KỶ NGUYÊN CỦA NGỮ NGHĨA.'),
    highlight: nfc('KỶ NGUYÊN CỦA NGỮ NGHĨA'),
    tag: 'PIN_00 • 4 GOLDEN ORBITS & COMET TRAIL',
  },
  {
    scene: 3,
    startFrame: 442,
    endFrame: 592,
    text: nfc('Bạn không cần thiết phải làm IDOL TRÊN VIDEO.'),
    highlight: nfc('✖ IDOL TRÊN VIDEO'),
    tag: 'PIN_01 • VERTICAL WHEEL PICKER',
  },
  {
    scene: 4,
    startFrame: 592,
    endFrame: 782,
    text: nfc('Bởi vì AI ấy, NÓ KHÔNG ĐẾM TƯƠNG TÁC NỮA.'),
    highlight: nfc('KHÔNG ĐẾM TƯƠNG TÁC NỮA'),
    tag: 'PIN_05 • -8° 3D CYLINDRICAL DRUM',
  },
  {
    scene: 5,
    startFrame: 782,
    endFrame: 999,
    text: nfc('Nó hiểu sâu sắc cái video của bạn GIẢI QUYẾT ĐƯỢC VIỆC GÌ.'),
    highlight: nfc('GIẢI QUYẾT ĐƯỢC VIỆC GÌ'),
    tag: 'PIN_02 • RADIAL DIAL & SEMANTIC TREE',
  },
  {
    scene: 6,
    startFrame: 999,
    endFrame: 1175,
    text: nfc('AI bây giờ ấy, nó hiểu bạn CÒN HƠN VỢ BẠN.'),
    highlight: nfc('CÒN HƠN VỢ BẠN'),
    tag: 'PIN_01 + PIN_00 • 3-SPHERE & GOLDEN SWORD',
  },
  {
    scene: 7,
    startFrame: 1175,
    endFrame: 1302,
    text: nfc('Cho nên việc LÀM VIDEO BÂY GIỜ...'),
    highlight: nfc('LÀM VIDEO BÂY GIỜ'),
    tag: 'PIN_03 • 3D GLASS ROLODEX STACK',
  },
  {
    scene: 8,
    startFrame: 1302,
    endFrame: 1432,
    text: nfc('Bản chất là bạn PHẢI ĐÓNG GÓI ĐƯỢC...'),
    highlight: nfc('PHẢI ĐÓNG GÓI ĐƯỢC'),
    tag: 'PIN_03 • 3D ISOMETRIC PACKAGING GRID',
  },
  {
    scene: 9,
    startFrame: 1432,
    endFrame: 1620,
    text: nfc('KỸ NĂNG THẬT CỦA MÌNH để BÁN RA THỊ TRƯỜNG.'),
    highlight: nfc('ĐỂ BÁN RA THỊ TRƯỜNG'),
    tag: 'PIN_06 • GLASS PILL TO 3D GROWTH CARD',
  },
];

// 8-Petal Luxury Gold Star Emblem
const GoldStarEmblem: React.FC<{
  size?: number;
  petalColor?: string;
  centerColor?: string;
  rotationDeg?: number;
  glowColor?: string;
}> = ({
  size = 44,
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
        filter: glowColor ? `drop-shadow(0 0 14px ${glowColor})` : undefined,
        flexShrink: 0,
      }}
    >
      {angles.map((angle) => (
        <g key={angle} transform={`rotate(${angle} 50 50)`}>
          <rect x="41" y="8" width="18" height="40" rx="9" fill={petalColor} />
        </g>
      ))}
      <circle cx="50" cy="50" r="15" fill={centerColor} />
    </svg>
  );
};

// ============================================================================
// SCENE 1 (f0 -> f240 | 0.00s - 4.00s):
// Pin_04 Kinetic Strobe, Backlit Aura & Hard Background Invert ("NÓ ĐÃ CHẾT RỒI.")
// ============================================================================
const Scene1DeadOldSocial: React.FC<{
  frame: number;
  fps: number;
  isPortrait: boolean;
  isHybridTalkingHead: boolean;
}> = ({ frame, fps, isPortrait, isHybridTalkingHead }) => {
  const isInverted = frame >= 186;
  const beat1P = spring({
    frame: Math.max(0, frame - 7),
    fps,
    config: { mass: 0.9, damping: 14, stiffness: 140 },
  });
  const beat2P = spring({
    frame: Math.max(0, frame - 99),
    fps,
    config: { mass: 0.9, damping: 14, stiffness: 135 },
  });
  const invertSlamP = spring({
    frame: Math.max(0, frame - 186),
    fps,
    config: { mass: 1.0, damping: 11, stiffness: 180 },
  });
  const slashP = interpolate(frame, [196, 208], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EXPO_OUT,
  });

  // Subtle camera shake on hard invert impact
  const shakeX =
    frame >= 186 && frame <= 206
      ? Math.sin((frame - 186) * 1.9) * (206 - frame) * 0.55
      : 0;
  const shakeY =
    frame >= 186 && frame <= 206
      ? Math.cos((frame - 186) * 2.3) * (206 - frame) * 0.45
      : 0;

  // Typewriter cursor slide for Beat 2 ("MÀ MÌNH TỪNG BIẾT")
  const typeProgress = interpolate(frame, [99, 148], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EXPO_OUT,
  });
  const beat2Text = nfc('MÀ MÌNH TỪNG BIẾT');
  const visibleChars = Math.round(beat2Text.length * typeProgress);

  const oldMetrics = [
    { icon: '👍', label: nfc('LIKE ẢO'), x: -340, y: -230 },
    { icon: '❤️', label: nfc('THẢ TIM DẠO'), x: 330, y: -210 },
    { icon: '👁️', label: nfc('CÂU VIEW RẺ TIỀN'), x: -310, y: 240 },
    { icon: '🔥', label: nfc('DRAMA BỀ NỔI'), x: 320, y: 230 },
  ];

  // In hybrid mode during f0->f98, show lower-third kinetic HUD over real talking head
  if (isHybridTalkingHead && frame < 99) {
    return (
      <AbsoluteFill style={{ overflow: 'visible', pointerEvents: 'none' }}>
        {/* Top gradient mask to cleanly cover legacy top-left burnt-in text */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            height: 490,
            background:
              'linear-gradient(180deg, rgba(8,9,12,0.98) 0%, rgba(8,9,12,0.92) 62%, rgba(8,9,12,0) 100%)',
          }}
        />
        {/* Bottom-half gradient for crisp HUD contrast */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: 860,
            background:
              'linear-gradient(180deg, rgba(8,9,12,0) 0%, rgba(8,9,12,0.82) 50%, rgba(8,9,12,0.98) 100%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 250,
            left: 56,
            right: 56,
            padding: '32px 36px',
            borderRadius: 32,
            background: 'rgba(12, 14, 22, 0.88)',
            border: '2px solid rgba(250, 204, 21, 0.55)',
            boxShadow: '0 28px 70px rgba(0,0,0,0.75), 0 0 45px rgba(245, 158, 11, 0.28)',
            backdropFilter: 'blur(20px)',
            transform: `translate3d(0, ${(1 - beat1P) * 55}px, 0) scale(${0.92 + 0.08 * beat1P})`,
            opacity: clamp01(beat1P),
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '6px 16px',
              borderRadius: 999,
              background: 'rgba(250, 204, 21, 0.16)',
              border: '1px solid rgba(250, 204, 21, 0.45)',
              marginBottom: 16,
            }}
          >
            <span
              style={{
                fontFamily: "'GT-America', monospace",
                fontSize: 15,
                fontWeight: 700,
                color: '#FDE047',
                letterSpacing: '0.14em',
              }}
            >
              00:00.12 • KINETIC HOOK
            </span>
          </div>
          <div
            style={{
              fontFamily: "'SVN-Aeonik', sans-serif",
              fontSize: 60,
              fontWeight: 900,
              lineHeight: 1.32,
              color: '#FAF8F5',
              letterSpacing: '-0.02em',
              overflow: 'visible',
            }}
          >
            {nfc('CÁI MẠNG XÃ HỘI CŨ')}
          </div>
          <div
            style={{
              marginTop: 14,
              display: 'flex',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            {oldMetrics.slice(0, 3).map((m, i) => (
              <div
                key={i}
                style={{
                  padding: '8px 16px',
                  borderRadius: 999,
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  fontFamily: "'SVN-Aeonik', sans-serif",
                  fontSize: 18,
                  fontWeight: 700,
                  color: 'rgba(250,248,245,0.78)',
                }}
              >
                {m.icon} {m.label}
              </div>
            ))}
          </div>
        </div>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill
      style={{
        backgroundColor: isInverted ? '#FAF8F5' : '#08090C',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        transform: `translate3d(${shakeX}px, ${shakeY}px, 0)`,
      }}
    >
      {/* Backlit Aura (Pin_04) when on dark background */}
      {!isInverted && (
        <>
          <div
            style={{
              position: 'absolute',
              width: isPortrait ? 840 : 1020,
              height: isPortrait ? 840 : 680,
              borderRadius: 9999,
              background:
                'radial-gradient(circle, rgba(139, 92, 246, 0.32) 0%, rgba(245, 158, 11, 0.24) 45%, rgba(8, 9, 12, 0) 72%)',
              filter: 'blur(48px)',
              transform: `scale(${0.92 + Math.sin(frame * 0.08) * 0.06})`,
            }}
          />
          {/* Subtle architectural grid */}
          <AbsoluteFill
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(250, 204, 21, 0.05) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(250, 204, 21, 0.05) 1px, transparent 1px)
              `,
              backgroundSize: '96px 96px',
            }}
          />
        </>
      )}

      {/* Inverted Ivory White Impact Background Accents */}
      {isInverted && (
        <>
          <div
            style={{
              position: 'absolute',
              width: isPortrait ? 960 : 1280,
              height: isPortrait ? 960 : 820,
              borderRadius: 9999,
              background:
                'radial-gradient(circle, rgba(250, 204, 21, 0.38) 0%, rgba(239, 68, 68, 0.12) 48%, rgba(250, 248, 245, 0) 72%)',
              filter: 'blur(40px)',
            }}
          />
          {/* Corner Warning Frame */}
          <div
            style={{
              position: 'absolute',
              inset: isPortrait ? 48 : 54,
              border: '3px solid rgba(8, 9, 12, 0.16)',
              borderRadius: 36,
              pointerEvents: 'none',
            }}
          />
        </>
      )}

      {/* Floating Old Social Media Cards (Fade & Cross Out on Invert) */}
      {oldMetrics.map((item, idx) => {
        const cardP = spring({
          frame: Math.max(0, frame - (14 + idx * 6)),
          fps,
          config: { mass: 1, damping: 14, stiffness: 120 },
        });
        const scaleX = isPortrait ? 0.88 : 1.32;
        const scaleY = isPortrait ? 1.52 : 1.05;
        return (
          <div
            key={idx}
            style={{
              position: 'absolute',
              transform: `translate3d(${item.x * scaleX}px, ${item.y * scaleY}px, 0) scale(${0.85 + 0.15 * cardP}) rotate(${(idx % 2 === 0 ? -1 : 1) * 5}deg)`,
              opacity: isInverted ? 0.22 : clamp01(cardP) * 0.72,
              padding: '12px 22px',
              borderRadius: 999,
              background: isInverted
                ? 'rgba(8, 9, 12, 0.08)'
                : 'rgba(20, 23, 34, 0.82)',
              border: isInverted
                ? '1.5px solid rgba(8, 9, 12, 0.25)'
                : '1.5px solid rgba(250, 204, 21, 0.32)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              boxShadow: isInverted ? 'none' : '0 14px 32px rgba(0,0,0,0.45)',
            }}
          >
            <span style={{ fontSize: 22 }}>{item.icon}</span>
            <span
              style={{
                fontFamily: "'SVN-Aeonik', sans-serif",
                fontSize: 20,
                fontWeight: 700,
                color: isInverted ? '#08090C' : '#FAF8F5',
                textDecoration: isInverted ? 'line-through' : 'none',
                letterSpacing: '0.04em',
              }}
            >
              {item.label}
            </span>
          </div>
        );
      })}

      {/* Main Center Typography Stack */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: isPortrait ? 960 : 1560,
          padding: '0 36px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: isPortrait ? 26 : 22,
          overflow: 'visible',
        }}
      >
        {/* Top Tag Pill */}
        <div
          style={{
            padding: '10px 26px',
            borderRadius: 999,
            background: isInverted
              ? '#08090C'
              : 'rgba(250, 204, 21, 0.14)',
            border: isInverted
              ? '2px solid #08090C'
              : '1.5px solid rgba(250, 204, 21, 0.55)',
            color: isInverted ? '#FACC15' : '#FDE047',
            fontFamily: "'GT-America', monospace",
            fontSize: isPortrait ? 18 : 19,
            fontWeight: 700,
            letterSpacing: '0.16em',
            opacity: clamp01(beat1P),
          }}
        >
          {isInverted
            ? nfc('⚠ PARADIGM SHIFT • HARD INVERT @ 03.10S')
            : nfc('01 • KINETIC STROBE HOOK')}
        </div>

        {/* Line 1: CÁI MẠNG XÃ HỘI CŨ */}
        <div
          style={{
            fontFamily: "'SVN-Aeonik', sans-serif",
            fontSize: isInverted
              ? isPortrait
                ? 44
                : 50
              : isPortrait
              ? 76
              : 88,
            fontWeight: 900,
            lineHeight: 1.32,
            letterSpacing: '-0.02em',
            color: isInverted ? 'rgba(8, 9, 12, 0.58)' : '#FAF8F5',
            textShadow: isInverted
              ? 'none'
              : '0 0 42px rgba(250, 204, 21, 0.32)',
            transform: `translate3d(0, ${(1 - beat1P) * 40}px, 0) scale(${
              0.9 + 0.1 * beat1P
            })`,
            opacity: clamp01(beat1P),
            overflow: 'visible',
            padding: '4px 12px',
          }}
        >
          {nfc('CÁI MẠNG XÃ HỘI CŨ')}
        </div>

        {/* Line 2 (f99+): MÀ MÌNH TỪNG BIẾT with Typewriter Bar */}
        {frame >= 99 && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: isInverted ? '8px 24px' : '14px 34px',
              borderRadius: 20,
              background: isInverted
                ? 'rgba(8, 9, 12, 0.08)'
                : 'rgba(250, 204, 21, 0.14)',
              border: isInverted
                ? '1.5px solid rgba(8, 9, 12, 0.22)'
                : '2px solid rgba(250, 204, 21, 0.55)',
              transform: `translate3d(0, ${(1 - beat2P) * 26}px, 0)`,
              opacity: clamp01(beat2P),
              overflow: 'visible',
            }}
          >
            <span
              style={{
                fontFamily: "'SVN-Aeonik', sans-serif",
                fontSize: isInverted
                  ? isPortrait
                    ? 36
                    : 40
                  : isPortrait
                  ? 54
                  : 62,
                fontWeight: 800,
                lineHeight: 1.34,
                color: isInverted ? '#08090C' : '#FACC15',
                letterSpacing: '-0.01em',
                overflow: 'visible',
              }}
            >
              {isInverted ? beat2Text : beat2Text.slice(0, visibleChars)}
            </span>
            {!isInverted && (
              <span
                style={{
                  display: 'inline-block',
                  width: 6,
                  height: isPortrait ? 52 : 58,
                  marginLeft: 10,
                  backgroundColor: '#FACC15',
                  boxShadow: '0 0 18px #FACC15',
                  opacity: frame % 16 < 10 ? 1 : 0.25,
                }}
              />
            )}
          </div>
        )}

        {/* Line 3 (f186+): HARD INVERT SLAM "NÓ ĐÃ CHẾT RỒI." + RED/GOLD SWORD SLASH */}
        {isInverted && (
          <div
            style={{
              position: 'relative',
              marginTop: isPortrait ? 18 : 12,
              padding: isPortrait ? '24px 36px' : '22px 54px',
              borderRadius: 32,
              background: '#FFFFFF',
              border: '4px solid #08090C',
              boxShadow: '0 28px 0 #08090C, 0 38px 70px rgba(0,0,0,0.22)',
              transform: `scale(${0.82 + 0.18 * invertSlamP})`,
              overflow: 'visible',
            }}
          >
            <div
              style={{
                fontFamily: "'SVN-Aeonik', sans-serif",
                fontSize: isPortrait ? 86 : 108,
                fontWeight: 900,
                lineHeight: 1.32,
                letterSpacing: '-0.03em',
                color: '#08090C',
                overflow: 'visible',
                padding: '6px 12px',
              }}
            >
              {nfc('NÓ ĐÃ CHẾT RỒI.')}
            </div>

            {/* Diagonal Crimson-Gold Sword Slash at f202 */}
            {slashP > 0.01 && (
              <div
                style={{
                  position: 'absolute',
                  top: '54%',
                  left: '4%',
                  width: `${slashP * 92}%`,
                  height: 8,
                  borderRadius: 999,
                  background:
                    'linear-gradient(90deg, #DC2626 0%, #FACC15 52%, #EF4444 100%)',
                  boxShadow:
                    '0 0 22px rgba(220, 38, 38, 0.65), 0 0 14px rgba(250, 204, 21, 0.85)',
                  opacity: 0.88,
                  transform: 'translateY(-50%) rotate(-3.5deg)',
                  transformOrigin: 'left center',
                }}
              />
            )}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 2 (f240 -> f442 | 4.00s - 7.37s):
// Pin_00 4 Intersecting Golden Orbit Rings, 18-Dot Comet Trail & Bezier Cursor
// ============================================================================
const Scene2SemanticEraOrbits: React.FC<{
  frame: number; // local frame 0..202 (global 240..442)
  fps: number;
  isPortrait: boolean;
}> = ({ frame, fps, isPortrait }) => {
  const enterP = spring({
    frame,
    fps,
    config: { mass: 1, damping: 15, stiffness: 120 },
  });

  // Bezier cursor flies in f0..f40 (global f240..f280) and clicks "BÂY GIỜ"
  const cursorP = interpolate(frame, [0, 36], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EXPO_OUT,
  });
  const clickRippleP = interpolate(frame, [34, 86], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EXPO_OUT,
  });

  // Era explosion at f42 (global f282 = 4.70s)
  const eraBoomP = spring({
    frame: Math.max(0, frame - 42),
    fps,
    config: { mass: 1, damping: 12, stiffness: 145 },
  });

  const viewW = isPortrait ? 1080 : 1920;
  const viewH = isPortrait ? 1920 : 1080;
  const cx = viewW * 0.5;
  const cy = viewH * 0.5;
  const rOrbit = isPortrait ? 430 : 450;
  const shift = isPortrait ? 270 : 350;

  const startPt: [number, number] = isPortrait ? [880, 1460] : [1520, 880];
  const c1Pt: [number, number] = isPortrait ? [760, 1180] : [1280, 720];
  const c2Pt: [number, number] = isPortrait ? [620, 860] : [1080, 480];
  const endPt: [number, number] = [cx + 75, isPortrait ? cy - 255 : cy - 195];
  const [curX, curY] = cubicBezierPoint(cursorP, startPt, c1Pt, c2Pt, endPt);

  // 18 Comet Particles orbiting around central ring
  const cometDots = Array.from({ length: 18 }, (_, i) => i);
  const baseAngle = frame * 2.6;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#07080B',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Golden Core Radial Glow */}
      <div
        style={{
          position: 'absolute',
          width: isPortrait ? 980 : 1180,
          height: isPortrait ? 980 : 780,
          borderRadius: 9999,
          background:
            'radial-gradient(circle, rgba(245, 158, 11, 0.42) 0%, rgba(250, 204, 21, 0.16) 46%, transparent 72%)',
          filter: 'blur(45px)',
          transform: `scale(${0.85 + 0.25 * eraBoomP})`,
        }}
      />

      {/* 4 Intersecting Golden Orbit Rings SVG */}
      <svg
        width={viewW}
        height={viewH}
        viewBox={`0 0 ${viewW} ${viewH}`}
        style={{
          position: 'absolute',
          inset: 0,
          transform: `scale(${0.84 + 0.16 * enterP + frame * 0.0004})`,
        }}
      >
        <defs>
          <filter id="s2OrbitGlow">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="s2GoldArc" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#FEF08A" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>

        {/* 4 Orbit Circles: Left, Right, Top, Bottom */}
        {[
          { x: cx - shift, y: cy, r: rOrbit, speed: -9.5 },
          { x: cx + shift, y: cy, r: rOrbit, speed: 8.8 },
          { x: cx, y: cy - shift * 0.85, r: rOrbit, speed: 10.2 },
          { x: cx, y: cy + shift * 0.85, r: rOrbit, speed: -10.8 },
        ].map((orb, idx) => (
          <g key={idx}>
            <circle
              cx={orb.x}
              cy={orb.y}
              r={orb.r}
              fill="none"
              stroke="rgba(250, 204, 21, 0.26)"
              strokeWidth="2.2"
            />
            <circle
              cx={orb.x}
              cy={orb.y}
              r={orb.r}
              fill="none"
              stroke="url(#s2GoldArc)"
              strokeWidth="5.5"
              strokeLinecap="round"
              strokeDasharray="240 2800"
              strokeDashoffset={frame * orb.speed}
              filter="url(#s2OrbitGlow)"
            />
          </g>
        ))}

        {/* 18-Particle Golden Comet Trail on Master Ring */}
        {cometDots.map((idx) => {
          const deg = baseAngle - idx * 6.5;
          const rad = (deg * Math.PI) / 180;
          const R = isPortrait ? 430 : 440;
          const px = cx + Math.cos(rad) * R;
          const py = cy + Math.sin(rad) * R;
          const ratio = 1 - idx / cometDots.length;
          return (
            <circle
              key={idx}
              cx={px}
              cy={py}
              r={2.5 + ratio * 6.5}
              fill={idx < 3 ? '#FFFFFF' : '#FACC15'}
              opacity={ratio * 0.95}
              filter={idx < 5 ? 'url(#s2OrbitGlow)' : undefined}
            />
          );
        })}

        {/* Click Shockwave Ring */}
        {clickRippleP > 0.01 && clickRippleP < 0.99 && (
          <circle
            cx={cx}
            cy={cy}
            r={60 + clickRippleP * 460}
            fill="none"
            stroke="#FEF08A"
            strokeWidth={4 * (1 - clickRippleP)}
            opacity={(1 - clickRippleP) * 0.85}
            filter="url(#s2OrbitGlow)"
          />
        )}
      </svg>

      {/* Center Content Stack */}
      <div
        style={{
          position: 'relative',
          zIndex: 15,
          width: isPortrait ? 960 : 1520,
          padding: '0 32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: isPortrait ? 24 : 20,
          overflow: 'visible',
        }}
      >
        {/* Clicked Button: "BÂY GIỜ" */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 14,
            padding: '14px 36px',
            borderRadius: 999,
            background:
              frame >= 36
                ? 'linear-gradient(90deg, #FEF08A 0%, #FACC15 55%, #F59E0B 100%)'
                : 'rgba(18, 20, 28, 0.9)',
            border: '2.5px solid #FACC15',
            boxShadow:
              frame >= 36
                ? '0 0 45px rgba(250, 204, 21, 0.75)'
                : '0 14px 30px rgba(0,0,0,0.6)',
            transform: `scale(${
              frame >= 32 && frame <= 40 ? 0.92 : 1 + 0.05 * eraBoomP
            })`,
          }}
        >
          <GoldStarEmblem
            size={30}
            petalColor={frame >= 36 ? '#08090C' : '#FDE047'}
            centerColor={frame >= 36 ? '#F59E0B' : '#FFFFFF'}
            rotationDeg={frame * 3}
            glowColor=""
          />
          <span
            style={{
              fontFamily: "'SVN-Aeonik', sans-serif",
              fontSize: isPortrait ? 34 : 36,
              fontWeight: 900,
              lineHeight: 1.3,
              color: frame >= 36 ? '#08090C' : '#FAF8F5',
              letterSpacing: '0.06em',
            }}
          >
            {nfc('BÂY GIỜ • NOW')}
          </span>
        </div>

        {/* Badge: SEMANTIC AI ERA • 60FPS */}
        <div
          style={{
            padding: '8px 24px',
            borderRadius: 999,
            background: 'rgba(245, 158, 11, 0.16)',
            border: '1px solid rgba(250, 204, 21, 0.55)',
            color: '#FDE047',
            fontFamily: "'GT-America', monospace",
            fontSize: 17,
            fontWeight: 700,
            letterSpacing: '0.18em',
            opacity: clamp01(eraBoomP),
            transform: `translate3d(0, ${(1 - eraBoomP) * 20}px, 0)`,
          }}
        >
          SEMANTIC AI ERA • 60FPS
        </div>

        {/* Hero 3D Typography Explosion: KỶ NGUYÊN CỦA NGỮ NGHĨA */}
        <div
          style={{
            padding: isPortrait ? '28px 34px' : '28px 56px',
            borderRadius: 36,
            background:
              'linear-gradient(145deg, rgba(16, 18, 26, 0.88) 0%, rgba(8, 9, 14, 0.94) 100%)',
            border: '2px solid rgba(250, 204, 21, 0.65)',
            boxShadow:
              '0 32px 80px rgba(0,0,0,0.85), 0 0 65px rgba(245, 158, 11, 0.32)',
            backdropFilter: 'blur(20px)',
            opacity: clamp01(eraBoomP),
            transform: `translate3d(0, ${(1 - eraBoomP) * 48}px, 0) scale(${
              0.84 + 0.16 * eraBoomP
            })`,
            overflow: 'visible',
          }}
        >
          <div
            style={{
              fontFamily: "'SVN-Aeonik', sans-serif",
              fontSize: isPortrait ? 52 : 58,
              fontWeight: 800,
              lineHeight: 1.35,
              color: '#FAF8F5',
              letterSpacing: '-0.01em',
              overflow: 'visible',
              padding: '2px 8px',
            }}
          >
            {nfc('LÀ KỶ NGUYÊN CỦA')}
          </div>
          <div
            style={{
              fontFamily: "'SVN-Aeonik', sans-serif",
              fontSize: isPortrait ? 88 : 108,
              fontWeight: 900,
              lineHeight: 1.34,
              background:
                'linear-gradient(180deg, #FFFFFF 0%, #FEF08A 38%, #FACC15 78%, #D97706 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
              filter: 'drop-shadow(0 0 32px rgba(250, 204, 21, 0.48))',
              overflow: 'visible',
              padding: '6px 14px',
            }}
          >
            {nfc('NGỮ NGHĨA')}
          </div>
        </div>
      </div>

      {/* Bezier Cursor SVG */}
      {frame < 95 && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            transform: `translate3d(${curX}px, ${curY}px, 0)`,
            zIndex: 30,
            pointerEvents: 'none',
          }}
        >
          <svg
            width="46"
            height="46"
            viewBox="0 0 42 42"
            style={{ filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.75))' }}
          >
            <path
              d="M6 4L35 18L21 23L16 37L6 4Z"
              fill="#FEF08A"
              stroke="#F59E0B"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 3 (f442 -> f592 | 7.37s - 9.87s):
// Pin_01 Vertical Slot-Machine Wheel Picker -> Locks on "✖ IDOL TRÊN VIDEO" at f516
// ============================================================================
const Scene3WheelPickerNoIdol: React.FC<{
  frame: number; // local frame 0..150 (global 442..592)
  fps: number;
  isPortrait: boolean;
  isHybridTalkingHead: boolean;
}> = ({ frame, fps, isPortrait, isHybridTalkingHead }) => {
  const enterP = spring({
    frame,
    fps,
    config: { mass: 1, damping: 14, stiffness: 125 },
  });

  // Wheel scrolls from index 0 to index 4 ("✖ IDOL TRÊN VIDEO") locking at local frame 74 (global f516 = 8.60s)
  const scrollP = interpolate(frame, [6, 74], [0, 4], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EXPO_OUT,
  });
  const lockSlamP = spring({
    frame: Math.max(0, frame - 74),
    fps,
    config: { mass: 0.9, damping: 11, stiffness: 165 },
  });

  const wheelItems = [
    nfc('Diễn viên hài kịch'),
    nfc('Nhảy trend TikTok'),
    nfc('Kịch sĩ câu view'),
    nfc('Chiêu trò bề nổi'),
    nfc('✖ IDOL TRÊN VIDEO'),
    nfc('Làm lố trước ống kính'),
    nfc('Bắt chước người khác'),
  ];

  const rowH = isPortrait ? 84 : 78;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: isHybridTalkingHead ? 'transparent' : '#08090C',
        justifyContent: isHybridTalkingHead ? 'flex-end' : 'center',
        alignItems: 'center',
        paddingBottom: isHybridTalkingHead ? 210 : 0,
        overflow: 'hidden',
      }}
    >
      {isHybridTalkingHead ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(8,9,12,0.35) 0%, rgba(8,9,12,0.05) 38%, rgba(8,9,12,0.88) 62%, rgba(8,9,12,0.98) 100%)',
            pointerEvents: 'none',
          }}
        />
      ) : (
        <div
          style={{
            position: 'absolute',
            width: 960,
            height: 960,
            borderRadius: 9999,
            background:
              'radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, rgba(8, 9, 12, 0) 70%)',
            filter: 'blur(45px)',
          }}
        />
      )}

      {/* Main Container */}
      <div
        style={{
          position: 'relative',
          zIndex: 15,
          width: isPortrait ? 960 : 1480,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: isHybridTalkingHead ? 18 : 30,
          transform: `translate3d(0, ${(1 - enterP) * 40}px, 0)`,
          opacity: clamp01(enterP),
          overflow: 'visible',
        }}
      >
        {/* Top Anchor Header: BẠN KHÔNG CẦN THIẾT PHẢI LÀM */}
        <div
          style={{
            padding: isHybridTalkingHead ? '18px 32px' : '22px 44px',
            borderRadius: 28,
            background: 'rgba(15, 18, 28, 0.92)',
            border: '2px solid rgba(250, 204, 21, 0.48)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.65)',
            backdropFilter: 'blur(18px)',
            textAlign: 'center',
            overflow: 'visible',
          }}
        >
          <div
            style={{
              fontFamily: "'GT-America', monospace",
              fontSize: 15,
              fontWeight: 700,
              color: '#FDE047',
              letterSpacing: '0.16em',
              marginBottom: 8,
            }}
          >
            PIN_01 • VERTICAL SLOT-MACHINE WHEEL PICKER
          </div>
          <div
            style={{
              fontFamily: "'SVN-Aeonik', sans-serif",
              fontSize: isHybridTalkingHead
                ? 44
                : isPortrait
                ? 54
                : 62,
              fontWeight: 900,
              lineHeight: 1.34,
              color: '#FAF8F5',
              letterSpacing: '-0.02em',
              overflow: 'visible',
              padding: '2px 8px',
            }}
          >
            {nfc('BẠN KHÔNG CẦN THIẾT PHẢI LÀM')}
          </div>
        </div>

        {/* Vertical Wheel Picker Box */}
        <div
          style={{
            position: 'relative',
            width: isPortrait ? 900 : 1120,
            height: isHybridTalkingHead ? rowH * 4.2 : rowH * 5.2,
            borderRadius: 34,
            background: 'rgba(10, 12, 18, 0.94)',
            border: '2px solid rgba(250, 204, 21, 0.42)',
            boxShadow: '0 30px 75px rgba(0,0,0,0.85)',
            backdropFilter: 'blur(24px)',
            overflow: 'hidden',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {/* Center Locked Selection Highlight Bar */}
          <div
            style={{
              position: 'absolute',
              left: 24,
              right: 24,
              height: rowH + 10,
              borderRadius: 22,
              background:
                frame >= 74
                  ? 'linear-gradient(90deg, rgba(220, 38, 38, 0.24) 0%, rgba(250, 204, 21, 0.28) 50%, rgba(220, 38, 38, 0.24) 100%)'
                  : 'rgba(250, 204, 21, 0.12)',
              border:
                frame >= 74
                  ? '3px solid #FACC15'
                  : '2px solid rgba(250, 204, 21, 0.45)',
              boxShadow:
                frame >= 74
                  ? '0 0 45px rgba(250, 204, 21, 0.55), inset 0 0 25px rgba(239, 68, 68, 0.35)'
                  : 'none',
              transform: `scale(${frame >= 74 ? 0.96 + 0.04 * lockSlamP : 1})`,
              zIndex: 5,
            }}
          />

          {/* Wheel Items */}
          {wheelItems.map((item, idx) => {
            const dist = idx - scrollP;
            const absDist = Math.abs(dist);
            if (absDist > 2.6) return null;
            const yOffset = dist * rowH;
            const rotX = dist * -22;
            const scale = Math.max(0.72, 1 - absDist * 0.12);
            const opacity = Math.max(0.16, 1 - absDist * 0.38);
            const isTarget = idx === 4 && frame >= 70;

            return (
              <div
                key={idx}
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: rowH,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  transform: `translate3d(0, ${yOffset}px, 0) perspective(800px) rotateX(${rotX}deg) scale(${scale})`,
                  opacity,
                  zIndex: isTarget ? 10 : 2,
                  overflow: 'visible',
                }}
              >
                <span
                  style={{
                    fontFamily: "'SVN-Aeonik', sans-serif",
                    fontSize: isTarget
                      ? isPortrait
                        ? 60
                        : 68
                      : isPortrait
                      ? 40
                      : 44,
                    fontWeight: isTarget ? 900 : 600,
                    lineHeight: 1.32,
                    color: isTarget ? '#FACC15' : 'rgba(250, 248, 245, 0.65)',
                    letterSpacing: isTarget ? '-0.02em' : '0em',
                    textShadow: isTarget
                      ? '0 0 32px rgba(250, 204, 21, 0.65)'
                      : 'none',
                    overflow: 'visible',
                    padding: '4px 14px',
                  }}
                >
                  {item}
                </span>

                {/* Strike-through bar on "IDOL TRÊN VIDEO" after f76 */}
                {isTarget && lockSlamP > 0.05 && (
                  <div
                    style={{
                      position: 'absolute',
                      width: `${Math.min(1, lockSlamP) * 68}%`,
                      height: 6,
                      borderRadius: 99,
                      background: '#EF4444',
                      boxShadow: '0 0 18px #EF4444',
                      top: '54%',
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 4 (f592 -> f782 | 9.87s - 13.04s):
// Pin_05 -8° 3D Cylindrical Text Drum -> Mechanical Snap 0° at f689 ("NÓ KHÔNG ĐẾM TƯƠNG TÁC NỮA")
// ============================================================================
const Scene4CylindricalDrum: React.FC<{
  frame: number; // local frame 0..190 (global 592..782)
  fps: number;
  isPortrait: boolean;
}> = ({ frame, fps, isPortrait }) => {
  const enterP = spring({
    frame,
    fps,
    config: { mass: 1, damping: 14, stiffness: 125 },
  });

  // Drum spins from index 0 to index 4 ("NÓ KHÔNG ĐẾM TƯƠNG TÁC NỮA") and snaps at local frame 97 (global f689 = 11.49s)
  const drumSpinP = interpolate(frame, [4, 97], [0, 4], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EXPO_OUT,
  });

  // Tilt angle snaps from -8 deg to 0 deg at f97 (global f689)
  const snapP = spring({
    frame: Math.max(0, frame - 97),
    fps,
    config: { mass: 0.85, damping: 10, stiffness: 185 },
  });
  const drumTiltDeg = interpolate(snapP, [0, 1], [-8, 0]);

  const drumLines = [
    nfc('Lượt Like ảo mỗi ngày'),
    nfc('Thả Tim dạo vô nghĩa'),
    nfc('Bình luận rác câu tương tác'),
    nfc('Đếm mắt xem bề nổi'),
    nfc('NÓ KHÔNG ĐẾM TƯƠNG TÁC NỮA'),
    nfc('Thuật toán cũ đã khép lại'),
    nfc('Chỉ giữ lại giá trị thật'),
  ];

  const stepH = isPortrait ? 96 : 92;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#07080C',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Background radial glow */}
      <div
        style={{
          position: 'absolute',
          width: 1080,
          height: 820,
          borderRadius: 9999,
          background:
            'radial-gradient(circle, rgba(250, 204, 21, 0.28) 0%, rgba(7, 8, 12, 0) 70%)',
          filter: 'blur(48px)',
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 15,
          width: isPortrait ? 980 : 1580,
          padding: '0 28px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: isPortrait ? 34 : 28,
          opacity: clamp01(enterP),
          overflow: 'visible',
        }}
      >
        {/* Top Header Pill + "BỞI VÌ AI ẤY..." */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 14,
            overflow: 'visible',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 14,
              padding: '10px 26px',
              borderRadius: 999,
              background: 'rgba(250, 204, 21, 0.14)',
              border: '1.5px solid rgba(250, 204, 21, 0.5)',
              fontFamily: "'GT-America', monospace",
              fontSize: 17,
              fontWeight: 700,
              color: '#FDE047',
              letterSpacing: '0.16em',
            }}
          >
            <span>PIN_05 • 3D CYLINDRICAL DRUM</span>
            <span
              style={{
                padding: '4px 12px',
                borderRadius: 99,
                background: frame >= 97 ? '#EF4444' : 'rgba(255,255,255,0.12)',
                color: '#FFFFFF',
                fontSize: 14,
              }}
            >
              {frame >= 97 ? 'INTERACTION COUNTER: OFF' : 'SCANNING METRICS...'}
            </span>
          </div>

          <div
            style={{
              fontFamily: "'SVN-Aeonik', sans-serif",
              fontSize: isPortrait ? 64 : 74,
              fontWeight: 900,
              lineHeight: 1.34,
              color: '#FAF8F5',
              letterSpacing: '-0.02em',
              overflow: 'visible',
              padding: '4px 12px',
            }}
          >
            {nfc('BỞI VÌ AI ẤY...')}
          </div>
        </div>

        {/* Oblique -8° -> 0° Mechanical Snap 3D Cylindrical Drum */}
        <div
          style={{
            position: 'relative',
            width: isPortrait ? 940 : 1420,
            height: stepH * 5.2,
            borderRadius: 38,
            background:
              'linear-gradient(180deg, rgba(12,14,22,0.95) 0%, rgba(18,22,34,0.92) 50%, rgba(12,14,22,0.95) 100%)',
            border: '2px solid rgba(250, 204, 21, 0.5)',
            boxShadow: '0 36px 90px rgba(0,0,0,0.85)',
            transform: `rotate(${drumTiltDeg}deg)`,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
          }}
        >
          {/* Mechanical Left Gold Arrow Pointer `→` */}
          <div
            style={{
              position: 'absolute',
              left: isPortrait ? 24 : 44,
              zIndex: 20,
              width: isPortrait ? 64 : 76,
              height: isPortrait ? 64 : 76,
              borderRadius: 20,
              background: '#FACC15',
              boxShadow: '0 0 32px rgba(250, 204, 21, 0.85)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontFamily: "'SVN-Aeonik', sans-serif",
              fontSize: isPortrait ? 38 : 44,
              fontWeight: 900,
              color: '#08090C',
              transform: `scale(${frame >= 97 ? 0.9 + 0.18 * snapP : 0.9})`,
            }}
          >
            →
          </div>

          {/* Center Lock Rail */}
          <div
            style={{
              position: 'absolute',
              left: isPortrait ? 104 : 142,
              right: 28,
              height: stepH + 14,
              borderRadius: 24,
              background:
                frame >= 97
                  ? 'linear-gradient(90deg, rgba(250, 204, 21, 0.26) 0%, rgba(245, 158, 11, 0.12) 100%)'
                  : 'rgba(255, 255, 255, 0.05)',
              border:
                frame >= 97
                  ? '3px solid #FACC15'
                  : '1.5px solid rgba(250, 204, 21, 0.3)',
              boxShadow:
                frame >= 97 ? '0 0 42px rgba(250, 204, 21, 0.45)' : 'none',
            }}
          />

          {/* Cylindrical Drum Rows */}
          {drumLines.map((line, idx) => {
            const offset = idx - drumSpinP;
            const absOff = Math.abs(offset);
            if (absOff > 2.5) return null;
            const yPos = Math.sin((offset * Math.PI) / 5.2) * (stepH * 2.35);
            const rotX = offset * -26;
            const isHero = idx === 4 && frame >= 92;
            const blurPx = isHero ? 0 : Math.min(6, absOff * 2.4);

            return (
              <div
                key={idx}
                style={{
                  position: 'absolute',
                  left: isPortrait ? 120 : 168,
                  right: 40,
                  height: stepH,
                  display: 'flex',
                  alignItems: 'center',
                  transform: `translate3d(0, ${yPos}px, 0) perspective(1000px) rotateX(${rotX}deg)`,
                  opacity: isHero ? 1 : Math.max(0.18, 1 - absOff * 0.36),
                  filter: `blur(${blurPx}px)`,
                  zIndex: isHero ? 15 : 3,
                  overflow: 'visible',
                }}
              >
                <span
                  style={{
                    fontFamily: "'SVN-Aeonik', sans-serif",
                    fontSize: isHero
                      ? isPortrait
                        ? 48
                        : 66
                      : isPortrait
                      ? 36
                      : 44,
                    fontWeight: isHero ? 900 : 600,
                    lineHeight: 1.34,
                    color: isHero ? '#FACC15' : 'rgba(250, 248, 245, 0.62)',
                    letterSpacing: '-0.02em',
                    textShadow: isHero
                      ? '0 0 28px rgba(250, 204, 21, 0.55)'
                      : 'none',
                    overflow: 'visible',
                    padding: '4px 8px',
                  }}
                >
                  {line}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 5 (f782 -> f999 | 13.04s - 16.65s):
// Pin_02 Radial Tick-Mark Dial `< / >` + Cascading 3-Step Semantic File Tree
// ============================================================================
const Scene5SemanticFileTree: React.FC<{
  frame: number; // local frame 0..217 (global 782..999)
  fps: number;
  isPortrait: boolean;
}> = ({ frame, fps, isPortrait }) => {
  // 3 exact speech beats:
  // Node 1 at global f782 (local 0)
  // Node 2 at global f862 (local 80)
  // Node 3 at global f931 (local 149)
  const node1P = spring({
    frame,
    fps,
    config: { mass: 0.9, damping: 14, stiffness: 135 },
  });
  const node2P = spring({
    frame: Math.max(0, frame - 80),
    fps,
    config: { mass: 0.9, damping: 14, stiffness: 135 },
  });
  const node3P = spring({
    frame: Math.max(0, frame - 149),
    fps,
    config: { mass: 0.95, damping: 12, stiffness: 155 },
  });

  const ticks = Array.from({ length: 36 }, (_, i) => i * 10);

  // Progressive focus dimming as deeper branches activate
  const node1Opacity =
    frame >= 149 ? 0.42 : frame >= 80 ? 0.52 : clamp01(node1P);
  const node2Opacity =
    frame >= 149 ? 0.48 : frame >= 80 ? clamp01(node2P) : 0;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#07080C',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Golden Ambient Glow */}
      <div
        style={{
          position: 'absolute',
          width: 980,
          height: 980,
          borderRadius: 9999,
          background:
            'radial-gradient(circle, rgba(245, 158, 11, 0.26) 0%, rgba(7, 8, 12, 0) 70%)',
          filter: 'blur(48px)',
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 15,
          width: isPortrait ? 960 : 1540,
          display: 'flex',
          flexDirection: isPortrait ? 'column' : 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: isPortrait ? 38 : 64,
          padding: '0 28px',
          overflow: 'visible',
        }}
      >
        {/* Top / Left: Pin_02 Radial Tick-Mark Compass Dial `< / >` */}
        <div
          style={{
            position: 'relative',
            width: isPortrait ? 300 : 360,
            height: isPortrait ? 300 : 360,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 320 320"
            style={{ transform: `rotate(${frame * 0.85}deg)` }}
          >
            {ticks.map((deg) => {
              const isMajor = deg % 30 === 0;
              return (
                <line
                  key={deg}
                  x1="160"
                  y1={isMajor ? '14' : '22'}
                  x2="160"
                  y2={isMajor ? '38' : '34'}
                  stroke={isMajor ? '#FACC15' : 'rgba(250, 248, 245, 0.35)'}
                  strokeWidth={isMajor ? '3.5' : '2'}
                  strokeLinecap="round"
                  transform={`rotate(${deg} 160 160)`}
                />
              );
            })}
            <circle
              cx="160"
              cy="160"
              r="102"
              fill="none"
              stroke="rgba(250, 204, 21, 0.35)"
              strokeWidth="2"
              strokeDasharray="8 8"
            />
          </svg>

          <div
            style={{
              position: 'absolute',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontFamily: "'GT-America', monospace",
                fontSize: 38,
                fontWeight: 900,
                color: '#FACC15',
                letterSpacing: '-0.03em',
              }}
            >
              {'< / >'}
            </div>
            <div
              style={{
                fontFamily: "'GT-America', monospace",
                fontSize: 14,
                fontWeight: 700,
                color: '#FAF8F5',
                letterSpacing: '0.16em',
                marginTop: 6,
              }}
            >
              SEMANTIC ENGINE
            </div>
          </div>
        </div>

        {/* Bottom / Right: Cascading 3-Level Semantic Indent Tree */}
        <div
          style={{
            flex: 1,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
            overflow: 'visible',
          }}
        >
          {/* Branch 01 (f782): ├─ 01. NÓ HIỂU SÂU SẮC */}
          <div
            style={{
              marginLeft: 0,
              padding: '22px 32px',
              borderRadius: 26,
              background: 'rgba(16, 19, 28, 0.88)',
              border: '2px solid rgba(250, 204, 21, 0.42)',
              opacity: node1Opacity,
              transform: `translate3d(${(1 - node1P) * -45}px, 0, 0)`,
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              overflow: 'visible',
            }}
          >
            <span
              style={{
                fontFamily: "'GT-America', monospace",
                fontSize: 28,
                fontWeight: 700,
                color: '#FACC15',
              }}
            >
              ├─ 01.
            </span>
            <span
              style={{
                fontFamily: "'SVN-Aeonik', sans-serif",
                fontSize: isPortrait ? 44 : 50,
                fontWeight: 800,
                lineHeight: 1.34,
                color: '#FAF8F5',
                overflow: 'visible',
                padding: '2px 6px',
              }}
            >
              {nfc('NÓ HIỂU SÂU SẮC')}
            </span>
          </div>

          {/* Branch 02 (f862): │  └─ 02. CÁI VIDEO CỦA BẠN */}
          {frame >= 76 && (
            <div
              style={{
                marginLeft: isPortrait ? 44 : 72,
                padding: '22px 32px',
                borderRadius: 26,
                background: 'rgba(18, 22, 34, 0.92)',
                border: '2px solid rgba(250, 204, 21, 0.52)',
                opacity: node2Opacity,
                transform: `translate3d(${(1 - node2P) * -45}px, 0, 0)`,
                display: 'flex',
                alignItems: 'center',
                gap: 18,
                overflow: 'visible',
              }}
            >
              <span
                style={{
                  fontFamily: "'GT-America', monospace",
                  fontSize: 28,
                  fontWeight: 700,
                  color: '#FDE047',
                }}
              >
                └─ 02.
              </span>
              <span
                style={{
                  fontFamily: "'SVN-Aeonik', sans-serif",
                  fontSize: isPortrait ? 46 : 52,
                  fontWeight: 800,
                  lineHeight: 1.34,
                  color: '#FAF8F5',
                  overflow: 'visible',
                  padding: '2px 6px',
                }}
              >
                {nfc('CÁI VIDEO CỦA BẠN')}
              </span>
            </div>
          )}

          {/* Branch 03 (f931): └─ ★ GIẢI QUYẾT ĐƯỢC VIỆC GÌ? */}
          {frame >= 145 && (
            <div
              style={{
                marginLeft: isPortrait ? 88 : 144,
                padding: isPortrait ? '28px 34px' : '28px 44px',
                borderRadius: 30,
                background:
                  'linear-gradient(135deg, rgba(250, 204, 21, 0.24) 0%, rgba(16, 18, 28, 0.96) 100%)',
                border: '3px solid #FACC15',
                boxShadow:
                  '0 28px 70px rgba(0,0,0,0.85), 0 0 55px rgba(250, 204, 21, 0.45)',
                opacity: clamp01(node3P),
                transform: `translate3d(${(1 - node3P) * -50}px, 0, 0) scale(${
                  0.9 + 0.1 * node3P
                })`,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                overflow: 'visible',
              }}
            >
              <div
                style={{
                  fontFamily: "'GT-America', monospace",
                  fontSize: 16,
                  fontWeight: 700,
                  color: '#FDE047',
                  letterSpacing: '0.16em',
                }}
              >
                └─ ★ CORE VALUE RESOLUTION
              </div>
              <div
                style={{
                  fontFamily: "'SVN-Aeonik', sans-serif",
                  fontSize: isPortrait ? 52 : 62,
                  fontWeight: 900,
                  lineHeight: 1.34,
                  color: '#FACC15',
                  letterSpacing: '-0.02em',
                  textShadow: '0 0 32px rgba(250, 204, 21, 0.55)',
                  overflow: 'visible',
                  padding: '4px 8px',
                }}
              >
                {nfc('GIẢI QUYẾT ĐƯỢC VIỆC GÌ?')}
              </div>
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 6 (f999 -> f1175 | 16.65s - 19.58s):
// Pin_01 3-Sphere Optical Blend + Pin_00 Golden Sword Slit ("CÒN HƠN VỢ BẠN")
// ============================================================================
const Scene6ThreeSphereAndSword: React.FC<{
  frame: number; // local frame 0..176 (global 999..1175)
  fps: number;
  isPortrait: boolean;
  isHybridTalkingHead: boolean;
}> = ({ frame, fps, isPortrait, isHybridTalkingHead }) => {
  // Beats:
  // Global f999 (local 0): 3-Sphere Optical Blend "AI BÂY GIỜ ẤY"
  // Global f1074 (local 75): "NÓ HIỂU BẠN (99.8%)"
  // Global f1121 (local 122): Golden Sword Slit -> "CÒN HƠN VỢ BẠN"
  const sphereP = spring({
    frame,
    fps,
    config: { mass: 1, damping: 14, stiffness: 120 },
  });
  const understandP = spring({
    frame: Math.max(0, frame - 75),
    fps,
    config: { mass: 0.9, damping: 13, stiffness: 140 },
  });
  const swordCutP = interpolate(frame, [120, 134], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EXPO_OUT,
  });
  const wifeCardP = spring({
    frame: Math.max(0, frame - 122),
    fps,
    config: { mass: 0.95, damping: 11, stiffness: 165 },
  });

  const orbitR = interpolate(sphereP, [0, 1], [150, 74]);
  const angleBase = frame * 2.4;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: isHybridTalkingHead ? 'transparent' : '#07080C',
        justifyContent: isHybridTalkingHead ? 'flex-end' : 'center',
        alignItems: 'center',
        paddingBottom: isHybridTalkingHead ? 210 : 0,
        overflow: 'hidden',
      }}
    >
      {isHybridTalkingHead && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(8,9,12,0.45) 0%, rgba(8,9,12,0.05) 35%, rgba(8,9,12,0.85) 62%, rgba(8,9,12,0.98) 100%)',
            pointerEvents: 'none',
          }}
        />
      )}

      <div
        style={{
          position: 'relative',
          zIndex: 15,
          width: isPortrait ? 960 : 1560,
          padding: '0 28px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: isHybridTalkingHead ? 20 : 28,
          overflow: 'visible',
        }}
      >
        {/* Top 3-Sphere Optical Blend Cluster */}
        {!isHybridTalkingHead && (
          <div
            style={{
              position: 'relative',
              width: 300,
              height: 250,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {[
              { color: 'rgba(250, 204, 21, 0.65)', deg: 0 },
              { color: 'rgba(56, 189, 248, 0.58)', deg: 120 },
              { color: 'rgba(244, 63, 94, 0.58)', deg: 240 },
            ].map((sp, i) => {
              const rad = ((angleBase + sp.deg) * Math.PI) / 180;
              const sx = Math.cos(rad) * orbitR;
              const sy = Math.sin(rad) * (orbitR * 0.72);
              return (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    width: 170,
                    height: 170,
                    borderRadius: 999,
                    background: `radial-gradient(circle at 35% 35%, #FFFFFF 0%, ${sp.color} 55%, transparent 100%)`,
                    mixBlendMode: 'screen',
                    filter: 'blur(4px)',
                    transform: `translate3d(${sx}px, ${sy}px, 0)`,
                  }}
                />
              );
            })}
            <div
              style={{
                position: 'relative',
                zIndex: 10,
                padding: '10px 26px',
                borderRadius: 999,
                background: 'rgba(8, 9, 12, 0.85)',
                border: '2px solid #FACC15',
                fontFamily: "'SVN-Aeonik', sans-serif",
                fontSize: 34,
                fontWeight: 900,
                lineHeight: 1.3,
                color: '#FAF8F5',
                boxShadow: '0 0 32px rgba(250, 204, 21, 0.5)',
              }}
            >
              {nfc('AI BÂY GIỜ ẤY')}
            </div>
          </div>
        )}

        {/* Beat 2 (f1074 / local 75): NÓ HIỂU BẠN (99.8%) */}
        {frame >= 70 && (
          <div
            style={{
              width: isPortrait ? 900 : 1180,
              padding: isHybridTalkingHead ? '18px 28px' : '22px 36px',
              borderRadius: 28,
              background: 'rgba(15, 18, 28, 0.92)',
              border: '2px solid rgba(250, 204, 21, 0.5)',
              backdropFilter: 'blur(18px)',
              transform: `translate3d(0, ${(1 - understandP) * 30}px, 0)`,
              opacity: clamp01(understandP),
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              overflow: 'visible',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                overflow: 'visible',
              }}
            >
              <span
                style={{
                  fontFamily: "'SVN-Aeonik', sans-serif",
                  fontSize: isPortrait ? 44 : 52,
                  fontWeight: 900,
                  lineHeight: 1.34,
                  color: '#FAF8F5',
                  overflow: 'visible',
                }}
              >
                {nfc('NÓ HIỂU BẠN')}
              </span>
              <span
                style={{
                  fontFamily: "'GT-America', monospace",
                  fontSize: isPortrait ? 42 : 48,
                  fontWeight: 900,
                  color: '#FACC15',
                }}
              >
                99.8%
              </span>
            </div>
            {/* Progress Bar */}
            <div
              style={{
                width: '100%',
                height: 16,
                borderRadius: 99,
                background: 'rgba(255,255,255,0.1)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${clamp01(understandP) * 99.8}%`,
                  height: '100%',
                  borderRadius: 99,
                  background:
                    'linear-gradient(90deg, #FEF08A 0%, #FACC15 55%, #F59E0B 100%)',
                  boxShadow: '0 0 22px #FACC15',
                }}
              />
            </div>
          </div>
        )}

        {/* Beat 3 (f1121 / local 122): GOLDEN SWORD SLIT + "CÒN HƠN VỢ BẠN" COMPARISON CARD */}
        {frame >= 118 && (
          <div
            style={{
              position: 'relative',
              width: isPortrait ? 900 : 1180,
              padding: isHybridTalkingHead ? '24px 32px' : '30px 44px',
              borderRadius: 34,
              background:
                'linear-gradient(135deg, rgba(24, 20, 14, 0.96) 0%, rgba(12, 14, 22, 0.98) 100%)',
              border: '3px solid #FACC15',
              boxShadow:
                '0 32px 80px rgba(0,0,0,0.85), 0 0 65px rgba(250, 204, 21, 0.42)',
              transform: `scale(${0.86 + 0.14 * wifeCardP})`,
              opacity: clamp01(wifeCardP),
              overflow: 'visible',
            }}
          >
            {/* Golden Sword Slit Beam Sweeping Across */}
            {swordCutP > 0.01 && swordCutP < 0.99 && (
              <div
                style={{
                  position: 'absolute',
                  top: -12,
                  left: `${(1 - swordCutP) * 85}%`,
                  width: 260,
                  height: 22,
                  borderRadius: 999,
                  background: '#FFFFFF',
                  boxShadow:
                    '0 0 32px 12px #FDE047, 0 0 75px 28px #F59E0B',
                  zIndex: 30,
                }}
              />
            )}

            <div
              style={{
                display: 'flex',
                flexDirection: isPortrait ? 'column' : 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 24,
                overflow: 'visible',
              }}
            >
              <div style={{ textAlign: isPortrait ? 'center' : 'left', overflow: 'visible' }}>
                <div
                  style={{
                    fontFamily: "'GT-America', monospace",
                    fontSize: 15,
                    fontWeight: 700,
                    color: '#FDE047',
                    letterSpacing: '0.16em',
                    marginBottom: 8,
                  }}
                >
                  ⚡ GOLDEN SWORD INSIGHT
                </div>
                <div
                  style={{
                    fontFamily: "'SVN-Aeonik', sans-serif",
                    fontSize: isPortrait ? 68 : 78,
                    fontWeight: 900,
                    lineHeight: 1.34,
                    color: '#FACC15',
                    letterSpacing: '-0.02em',
                    textShadow: '0 0 34px rgba(250, 204, 21, 0.55)',
                    overflow: 'visible',
                    padding: '4px 8px',
                  }}
                >
                  {nfc('CÒN HƠN VỢ BẠN')}
                </div>
              </div>

              {/* 2-Column Comparison Bars: VỢ BẠN vs AI NGỮ NGHĨA */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: 28,
                  padding: '14px 26px',
                  borderRadius: 24,
                  background: 'rgba(8, 9, 12, 0.72)',
                  border: '1.5px solid rgba(250, 204, 21, 0.35)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'GT-America', monospace",
                      fontSize: 16,
                      fontWeight: 700,
                      color: 'rgba(250,248,245,0.65)',
                    }}
                  >
                    62%
                  </span>
                  <div
                    style={{
                      width: 54,
                      height: 68,
                      borderRadius: 12,
                      background: 'rgba(250, 248, 245, 0.28)',
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "'SVN-Aeonik', sans-serif",
                      fontSize: 16,
                      fontWeight: 700,
                      color: 'rgba(250,248,245,0.75)',
                    }}
                  >
                    {nfc('VỢ BẠN')}
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'GT-America', monospace",
                      fontSize: 18,
                      fontWeight: 900,
                      color: '#FACC15',
                    }}
                  >
                    99.8%
                  </span>
                  <div
                    style={{
                      width: 64,
                      height: 124 * clamp01(wifeCardP),
                      borderRadius: 14,
                      background:
                        'linear-gradient(180deg, #FEF08A 0%, #FACC15 55%, #D97706 100%)',
                      boxShadow: '0 0 28px rgba(250, 204, 21, 0.65)',
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "'SVN-Aeonik', sans-serif",
                      fontSize: 16,
                      fontWeight: 900,
                      color: '#FACC15',
                    }}
                  >
                    {nfc('AI NGỮ NGHĨA')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 7 (f1175 -> f1302 | 19.58s - 21.70s):
// Pin_03 3D Glassmorphic Rolodex Card Stack & Neon Border Sweep ("CHO NÊN VIỆC LÀM VIDEO BÂY GIỜ")
// ============================================================================
const Scene7GlassRolodexStack: React.FC<{
  frame: number; // local frame 0..127 (global 1175..1302)
  fps: number;
  isPortrait: boolean;
  isHybridTalkingHead: boolean;
}> = ({ frame, fps, isPortrait, isHybridTalkingHead }) => {
  const rolodexP = spring({
    frame,
    fps,
    config: { mass: 1, damping: 14, stiffness: 130 },
  });

  const backCards = [
    { zOffset: -120, yOffset: -88, scale: 0.84, opacity: 0.35, label: 'ARCHIVE • 2023–2024' },
    { zOffset: -60, yOffset: -44, scale: 0.92, opacity: 0.62, label: 'TRANSITION • 2025' },
  ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: isHybridTalkingHead ? 'transparent' : '#07080C',
        justifyContent: isHybridTalkingHead ? 'flex-end' : 'center',
        alignItems: 'center',
        paddingBottom: isHybridTalkingHead ? 210 : 0,
        overflow: 'hidden',
      }}
    >
      {isHybridTalkingHead ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(8,9,12,0.35) 0%, rgba(8,9,12,0.05) 38%, rgba(8,9,12,0.88) 62%, rgba(8,9,12,0.98) 100%)',
            pointerEvents: 'none',
          }}
        />
      ) : (
        <div
          style={{
            position: 'absolute',
            width: 1020,
            height: 820,
            borderRadius: 9999,
            background:
              'radial-gradient(circle, rgba(250, 204, 21, 0.28) 0%, rgba(7, 8, 12, 0) 70%)',
            filter: 'blur(48px)',
          }}
        />
      )}

      {/* 3D Rolodex Stack Container */}
      <div
        style={{
          position: 'relative',
          zIndex: 15,
          width: isPortrait ? 920 : 1340,
          height: isHybridTalkingHead ? 420 : 520,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          perspective: '1200px',
          overflow: 'visible',
        }}
      >
        {/* Back 2 Rolodex Cards */}
        {backCards.map((c, idx) => (
          <div
            key={idx}
            style={{
              position: 'absolute',
              width: '100%',
              height: isHybridTalkingHead ? 320 : 380,
              borderRadius: 36,
              background: 'rgba(18, 22, 34, 0.78)',
              border: '2px solid rgba(250, 204, 21, 0.35)',
              backdropFilter: 'blur(16px)',
              transform: `translate3d(0, ${c.yOffset * rolodexP}px, ${c.zOffset}px) rotateX(12deg) scale(${c.scale})`,
              opacity: c.opacity * clamp01(rolodexP),
              padding: '20px 34px',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
            }}
          >
            <span
              style={{
                fontFamily: "'GT-America', monospace",
                fontSize: 15,
                fontWeight: 700,
                color: 'rgba(253, 224, 71, 0.75)',
                letterSpacing: '0.16em',
              }}
            >
              {c.label}
            </span>
          </div>
        ))}

        {/* Front Hero Rolodex Card with Neon Border Sweep */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: isHybridTalkingHead ? 330 : 390,
            borderRadius: 38,
            background:
              'linear-gradient(145deg, rgba(16, 20, 32, 0.96) 0%, rgba(8, 10, 16, 0.99) 100%)',
            border: '3px solid #FACC15',
            boxShadow:
              '0 38px 90px rgba(0,0,0,0.88), 0 0 60px rgba(250, 204, 21, 0.38)',
            transform: `translate3d(0, ${(1 - rolodexP) * 65}px, 0) rotateX(${
              12 - 6 * rolodexP
            }deg) scale(${0.88 + 0.12 * rolodexP})`,
            padding: isPortrait ? '34px 40px' : '42px 64px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            gap: 18,
            overflow: 'visible',
          }}
        >
          {/* Animated Neon Border Sweep Pill */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              padding: '8px 24px',
              borderRadius: 999,
              background: 'rgba(250, 204, 21, 0.16)',
              border: '1.5px solid #FACC15',
              fontFamily: "'GT-America', monospace",
              fontSize: 16,
              fontWeight: 700,
              color: '#FDE047',
              letterSpacing: '0.16em',
            }}
          >
            <span>PIN_03 • 3D GLASS ROLODEX STACK</span>
          </div>

          <div
            style={{
              fontFamily: "'SVN-Aeonik', sans-serif",
              fontSize: isPortrait ? 46 : 54,
              fontWeight: 700,
              lineHeight: 1.34,
              color: '#FAF8F5',
              overflow: 'visible',
              padding: '2px 8px',
            }}
          >
            {nfc('CHO NÊN VIỆC')}
          </div>

          <div
            style={{
              fontFamily: "'SVN-Aeonik', sans-serif",
              fontSize: isPortrait ? 68 : 86,
              fontWeight: 900,
              lineHeight: 1.34,
              color: '#FACC15',
              letterSpacing: '-0.02em',
              textShadow: '0 0 36px rgba(250, 204, 21, 0.55)',
              overflow: 'visible',
              padding: '4px 12px',
            }}
          >
            {nfc('LÀM VIDEO BÂY GIỜ')}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 8 (f1302 -> f1432 | 21.70s - 23.87s):
// Pin_03 3D Isometric Packaging Grid Tilt ("BẢN CHẤT LÀ BẠN" -> "PHẢI ĐÓNG GÓI ĐƯỢC")
// ============================================================================
const Scene8IsometricPackagingGrid: React.FC<{
  frame: number; // local frame 0..130 (global 1302..1432)
  fps: number;
  isPortrait: boolean;
}> = ({ frame, fps, isPortrait }) => {
  // f1302 (local 0): Isometric grid "BẢN CHẤT LÀ BẠN"
  // f1341 (local 39): Modules converge & lock into 3D Gold Core Box "PHẢI ĐÓNG GÓI ĐƯỢC"
  const gridP = spring({
    frame,
    fps,
    config: { mass: 1, damping: 14, stiffness: 125 },
  });
  const packLockP = spring({
    frame: Math.max(0, frame - 39),
    fps,
    config: { mass: 0.95, damping: 12, stiffness: 155 },
  });

  const modules = [
    { id: 'MOD-01', title: nfc('TƯ DUY CỐT LÕI'), x: -310, y: -225 },
    { id: 'MOD-02', title: nfc('QUY TRÌNH THẬT'), x: 0, y: -245 },
    { id: 'MOD-03', title: nfc('CASE STUDY'), x: 310, y: -225 },
    { id: 'MOD-04', title: nfc('GIẢI PHÁP NGÁCH'), x: -310, y: 225 },
    { id: 'MOD-05', title: nfc('CÔNG CỤ AI'), x: 0, y: 245 },
    { id: 'MOD-06', title: nfc('CHUYỂN ĐỔI CAO'), x: 310, y: 225 },
  ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#07080C',
        justifyContent: 'center',
        alignItems: 'center',
        perspective: '1400px',
        overflow: 'hidden',
      }}
    >
      {/* Background Isometric Grid Lines */}
      <AbsoluteFill
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(250, 204, 21, 0.07) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(250, 204, 21, 0.07) 1px, transparent 1px)
          `,
          backgroundSize: '90px 90px',
          transform: 'rotateX(28deg) rotateZ(-12deg) scale(1.25)',
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 15,
          width: isPortrait ? 960 : 1540,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: isPortrait ? 38 : 30,
          overflow: 'visible',
        }}
      >
        {/* Top Subtitle Header: BẢN CHẤT LÀ BẠN */}
        <div
          style={{
            padding: '16px 38px',
            borderRadius: 999,
            background: 'rgba(15, 18, 28, 0.92)',
            border: '2px solid rgba(250, 204, 21, 0.5)',
            transform: `translate3d(0, ${(1 - gridP) * 30}px, 0)`,
            opacity: clamp01(gridP),
            overflow: 'visible',
          }}
        >
          <span
            style={{
              fontFamily: "'SVN-Aeonik', sans-serif",
              fontSize: isPortrait ? 50 : 58,
              fontWeight: 800,
              lineHeight: 1.34,
              color: '#FAF8F5',
              overflow: 'visible',
              padding: '2px 8px',
            }}
          >
            {nfc('BẢN CHẤT LÀ BẠN')}
          </span>
        </div>

        {/* 3D Isometric Packaging Stage */}
        <div
          style={{
            position: 'relative',
            width: isPortrait ? 920 : 1280,
            height: isPortrait ? 660 : 560,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            transform: `rotateX(${14 - 6 * packLockP}deg) rotateY(${
              -8 + 4 * packLockP
            }deg)`,
            transformStyle: 'preserve-3d',
            overflow: 'visible',
          }}
        >
          {/* 6 Surrounding Knowledge Modules converging into the Core Box */}
          {modules.map((m, idx) => {
            const convergeFactor = 1 - packLockP * 0.12;
            const mx = m.x * (isPortrait ? 0.94 : 1.25) * convergeFactor;
            const my = m.y * (isPortrait ? 1.12 : 0.96) * convergeFactor;
            return (
              <div
                key={idx}
                style={{
                  position: 'absolute',
                  width: isPortrait ? 255 : 280,
                  padding: '14px 18px',
                  borderRadius: 22,
                  background: 'rgba(16, 20, 32, 0.92)',
                  border: '1.5px solid rgba(250, 204, 21, 0.55)',
                  boxShadow: '0 18px 40px rgba(0,0,0,0.65)',
                  transform: `translate3d(${mx}px, ${my}px, 0) scale(${
                    0.88 + 0.12 * gridP
                  })`,
                  opacity: clamp01(gridP) * 0.92,
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontFamily: "'GT-America', monospace",
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#FDE047',
                    letterSpacing: '0.14em',
                  }}
                >
                  {m.id}
                </div>
                <div
                  style={{
                    fontFamily: "'SVN-Aeonik', sans-serif",
                    fontSize: 20,
                    fontWeight: 800,
                    lineHeight: 1.32,
                    color: '#FAF8F5',
                    marginTop: 4,
                  }}
                >
                  {m.title}
                </div>
              </div>
            );
          })}

          {/* Center 3D Golden Core Vault Box (f1341 / local 39): PHẢI ĐÓNG GÓI ĐƯỢC */}
          <div
            style={{
              position: 'relative',
              zIndex: 20,
              padding: isPortrait ? '30px 42px' : '32px 58px',
              borderRadius: 36,
              background:
                'linear-gradient(135deg, #FEF08A 0%, #FACC15 52%, #D97706 100%)',
              border: '4px solid #FFFFFF',
              boxShadow:
                '0 35px 90px rgba(0,0,0,0.9), 0 0 80px rgba(250, 204, 21, 0.65)',
              transform: `scale(${0.75 + 0.25 * packLockP})`,
              opacity: frame >= 35 ? clamp01(packLockP) : 0,
              textAlign: 'center',
              overflow: 'visible',
            }}
          >
            <div
              style={{
                fontFamily: "'GT-America', monospace",
                fontSize: 16,
                fontWeight: 900,
                color: '#08090C',
                letterSpacing: '0.18em',
                marginBottom: 8,
              }}
            >
              📦 3D ISOMETRIC SKILL VAULT
            </div>
            <div
              style={{
                fontFamily: "'SVN-Aeonik', sans-serif",
                fontSize: isPortrait ? 68 : 82,
                fontWeight: 900,
                lineHeight: 1.34,
                color: '#08090C',
                letterSpacing: '-0.02em',
                overflow: 'visible',
                padding: '4px 10px',
              }}
            >
              {nfc('PHẢI ĐÓNG GÓI ĐƯỢC')}
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 9 (f1432 -> f1620 | 23.87s - 27.00s):
// Pin_06 Frosted Glass Pill -> 3D Growth Card ("KỸ NĂNG THẬT CỦA MÌNH" -> "ĐỂ BÁN RA THỊ TRƯỜNG")
// + Rack Focus Brand Reveal ("✳ NGUYỄN VIỆT • KỶ NGUYÊN NGỮ NGHĨA")
// ============================================================================
const Scene9SkillToMarketFinale: React.FC<{
  frame: number; // local frame 0..188 (global 1432..1620)
  fps: number;
  isPortrait: boolean;
}> = ({ frame, fps, isPortrait }) => {
  // Beats:
  // Global f1433 (local 1): Frosted Glass Pill -> 3D Growth Card "KỸ NĂNG THẬT CỦA MÌNH"
  // Global f1512 (local 80): Shockwave CTA "ĐỂ BÁN RA THỊ TRƯỜNG"
  // Global f1573 (local 141): Rack Focus (Blur-to-Sharp) Brand Reveal
  const cardExpandP = spring({
    frame,
    fps,
    config: { mass: 1, damping: 14, stiffness: 130 },
  });
  const marketSlamP = spring({
    frame: Math.max(0, frame - 80),
    fps,
    config: { mass: 0.95, damping: 11, stiffness: 165 },
  });
  const rackFocusP = spring({
    frame: Math.max(0, frame - 141),
    fps,
    config: { mass: 1, damping: 14, stiffness: 130 },
  });

  const bars = [38, 54, 72, 92, 118, 148];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#07080C',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Luxury Gold Radial Halo */}
      <div
        style={{
          position: 'absolute',
          width: 1180,
          height: 980,
          borderRadius: 9999,
          background:
            'radial-gradient(circle, rgba(250, 204, 21, 0.34) 0%, rgba(245, 158, 11, 0.12) 48%, transparent 72%)',
          filter: 'blur(48px)',
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 15,
          width: isPortrait ? 960 : 1540,
          padding: '0 28px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: isPortrait ? 26 : 24,
          overflow: 'visible',
        }}
      >
        {/* Top Rack Focus Brand Badge (Sharpens & scales up at f1573 / local 141) */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 14,
            padding: frame >= 141 ? '16px 36px' : '10px 26px',
            borderRadius: 999,
            background:
              frame >= 141
                ? 'linear-gradient(90deg, #FEF08A 0%, #FACC15 55%, #F59E0B 100%)'
                : 'rgba(18, 22, 34, 0.9)',
            border: '2.5px solid #FACC15',
            boxShadow:
              frame >= 141
                ? '0 0 55px rgba(250, 204, 21, 0.85)'
                : '0 10px 28px rgba(0,0,0,0.5)',
            transform: `scale(${frame >= 141 ? 1 + 0.08 * rackFocusP : 1})`,
            filter:
              frame >= 141 && frame < 155
                ? `blur(${(1 - rackFocusP) * 10}px)`
                : 'none',
          }}
        >
          <GoldStarEmblem
            size={frame >= 141 ? 36 : 28}
            petalColor={frame >= 141 ? '#08090C' : '#FDE047'}
            centerColor={frame >= 141 ? '#F59E0B' : '#FFFFFF'}
            rotationDeg={frame * 2.5}
            glowColor=""
          />
          <span
            style={{
              fontFamily: "'SVN-Aeonik', sans-serif",
              fontSize: frame >= 141 ? 26 : 20,
              fontWeight: 900,
              lineHeight: 1.3,
              color: frame >= 141 ? '#08090C' : '#FDE047',
              letterSpacing: '0.1em',
            }}
          >
            {nfc('✳ NGUYỄN VIỆT • KỶ NGUYÊN NGỮ NGHĨA')}
          </span>
        </div>

        {/* 3D Growth Card: KỸ NĂNG THẬT CỦA MÌNH */}
        <div
          style={{
            width: isPortrait ? 900 : 1280,
            padding: isPortrait ? '32px 38px' : '34px 56px',
            borderRadius: 38,
            background:
              'linear-gradient(145deg, rgba(18, 22, 34, 0.94) 0%, rgba(10, 12, 20, 0.98) 100%)',
            border: '2.5px solid rgba(250, 204, 21, 0.6)',
            boxShadow: '0 34px 85px rgba(0,0,0,0.85)',
            transform: `perspective(1200px) rotateX(${
              8 - 4 * cardExpandP
            }deg) scale(${0.86 + 0.14 * cardExpandP})`,
            opacity: clamp01(cardExpandP),
            display: 'flex',
            flexDirection: isPortrait ? 'column' : 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 28,
            overflow: 'visible',
          }}
        >
          <div
            style={{
              textAlign: isPortrait ? 'center' : 'left',
              overflow: 'visible',
            }}
          >
            <div
              style={{
                fontFamily: "'GT-America', monospace",
                fontSize: 16,
                fontWeight: 700,
                color: '#FDE047',
                letterSpacing: '0.16em',
                marginBottom: 10,
              }}
            >
              PIN_06 • FROSTED GLASS PILL → 3D CARD
            </div>
            <div
              style={{
                fontFamily: "'SVN-Aeonik', sans-serif",
                fontSize: isPortrait ? 60 : 72,
                fontWeight: 900,
                lineHeight: 1.34,
                color: '#FAF8F5',
                letterSpacing: '-0.02em',
                overflow: 'visible',
                padding: '4px 8px',
              }}
            >
              {nfc('KỸ NĂNG THẬT CỦA MÌNH')}
            </div>
          </div>

          {/* 3D Ascending Value Bars */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: 12,
              height: 155,
              padding: '16px 24px',
              borderRadius: 24,
              background: 'rgba(8, 9, 12, 0.72)',
              border: '1.5px solid rgba(250, 204, 21, 0.35)',
            }}
          >
            {bars.map((h, i) => (
              <div
                key={i}
                style={{
                  width: 22,
                  height: h * clamp01(cardExpandP),
                  borderRadius: 8,
                  background:
                    i >= 4
                      ? 'linear-gradient(180deg, #FEF08A 0%, #FACC15 100%)'
                      : 'rgba(250, 204, 21, 0.38)',
                  boxShadow: i >= 4 ? '0 0 18px #FACC15' : 'none',
                }}
              />
            ))}
          </div>
        </div>

        {/* Finale Headline Slam (f1512 / local 80): ĐỂ BÁN RA THỊ TRƯỜNG */}
        {frame >= 76 && (
          <div
            style={{
              width: isPortrait ? 900 : 1280,
              padding: isPortrait ? '30px 36px' : '32px 56px',
              borderRadius: 36,
              background:
                'linear-gradient(135deg, #FEF08A 0%, #FACC15 55%, #D97706 100%)',
              border: '4px solid #FFFFFF',
              boxShadow:
                '0 32px 90px rgba(0,0,0,0.9), 0 0 75px rgba(250, 204, 21, 0.72)',
              transform: `scale(${0.84 + 0.16 * marketSlamP})`,
              opacity: clamp01(marketSlamP),
              textAlign: 'center',
              overflow: 'visible',
            }}
          >
            <div
              style={{
                fontFamily: "'GT-America', monospace",
                fontSize: 16,
                fontWeight: 900,
                color: '#08090C',
                letterSpacing: '0.18em',
                marginBottom: 6,
              }}
            >
              🚀 HIGH-TICKET MONETIZATION • MARKET READY
            </div>
            <div
              style={{
                fontFamily: "'SVN-Aeonik', sans-serif",
                fontSize: isPortrait ? 68 : 86,
                fontWeight: 900,
                lineHeight: 1.34,
                color: '#08090C',
                letterSpacing: '-0.02em',
                overflow: 'visible',
                padding: '4px 10px',
              }}
            >
              {nfc('ĐỂ BÁN RA THỊ TRƯỜNG')}
            </div>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

// ============================================================================
// SEMANTIC TIMECODE BAR & SUBTITLE HUD OVERLAY (Always-on 100% Speech Lock)
// ============================================================================
const SemanticHudOverlay: React.FC<{
  frame: number;
  fps: number;
  durationInFrames: number;
  isPortrait: boolean;
}> = ({ frame, fps, durationInFrames, isPortrait }) => {
  const activeSeg =
    TRANSCRIPT_SEGMENTS.find(
      (s) => frame >= s.startFrame && frame < s.endFrame
    ) || TRANSCRIPT_SEGMENTS[TRANSCRIPT_SEGMENTS.length - 1];

  const progressPct = (frame / durationInFrames) * 100;
  const secStr = (frame / fps).toFixed(2).padStart(5, '0');

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 80 }}>
      {/* Top Semantic Timecode Bar */}
      <div
        style={{
          position: 'absolute',
          top: isPortrait ? 38 : 28,
          left: isPortrait ? 44 : 64,
          right: isPortrait ? 44 : 64,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            padding: '8px 18px',
            borderRadius: 999,
            background: 'rgba(8, 9, 12, 0.78)',
            border: '1px solid rgba(250, 204, 21, 0.42)',
            backdropFilter: 'blur(12px)',
            fontFamily: "'GT-America', monospace",
            fontSize: 14,
            fontWeight: 700,
            color: '#FDE047',
            letterSpacing: '0.12em',
          }}
        >
          {`SCENE 0${activeSeg.scene}/09 • ${activeSeg.tag}`}
        </div>

        <div
          style={{
            padding: '8px 18px',
            borderRadius: 999,
            background: 'rgba(8, 9, 12, 0.78)',
            border: '1px solid rgba(250, 204, 21, 0.42)',
            backdropFilter: 'blur(12px)',
            fontFamily: "'GT-America', monospace",
            fontSize: 14,
            fontWeight: 700,
            color: '#FAF8F5',
            letterSpacing: '0.1em',
          }}
        >
          {`${secStr}S / 27.00S • F${String(frame).padStart(4, '0')}`}
        </div>
      </div>

      {/* Bottom Synchronized Transcript HUD Bar */}
      <div
        style={{
          position: 'absolute',
          bottom: isPortrait ? 42 : 28,
          left: isPortrait ? 44 : 140,
          right: isPortrait ? 44 : 140,
          padding: '14px 26px',
          borderRadius: 22,
          background: 'rgba(8, 9, 12, 0.84)',
          border: '1.5px solid rgba(250, 204, 21, 0.45)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          overflow: 'visible',
        }}
      >
        <div
          style={{
            fontFamily: "'SVN-Aeonik', sans-serif",
            fontSize: isPortrait ? 24 : 25,
            fontWeight: 700,
            lineHeight: 1.35,
            color: '#FAF8F5',
            textAlign: 'center',
            overflow: 'visible',
          }}
        >
          {activeSeg.text}
        </div>
        <div
          style={{
            width: '100%',
            height: 5,
            borderRadius: 99,
            background: 'rgba(255,255,255,0.14)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${progressPct}%`,
              height: '100%',
              background:
                'linear-gradient(90deg, #FEF08A 0%, #FACC15 55%, #F59E0B 100%)',
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================================
// MAIN COMPOSITION EXPORT: VietSemanticEra27s
// ============================================================================
export const VietSemanticEra27s: React.FC<VietSemanticEraProps> = ({
  mode = 'full-9x16',
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps, durationInFrames } = useVideoConfig();
  const isPortrait = height > width;
  const isHybrid = mode === 'hybrid-9x16';

  // Talking-head active windows in hybrid-9x16 mode:
  // Window A: f0 -> f98 (0.0s - 1.63s)
  // Window B: f474 -> f592 (7.9s - 9.87s) -> uses clean talking-head segment starting at f536 of proxy
  // Window C: f1116 -> f1284 (18.6s - 21.4s)
  const isHybridTalkingHeadWindow =
    isHybrid &&
    ((frame >= 0 && frame < 99) ||
      (frame >= 474 && frame < 592) ||
      (frame >= 1116 && frame < 1284));

  // For Window B (f474..f592), map to frames 536..654 of proxy video so the legacy black card at f474..f534 is bypassed
  const videoTrimBefore =
    frame >= 474 && frame < 592 ? 62 : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: '#08090C', overflow: 'hidden' }}>
      {/* Master 27s Audio Track (Original Voice + 4-Layer Ducking SFX) */}
      <Audio src={staticFile('motion02/master_audio_27s.wav')} />

      {/* Real Talking-Head Video Layer for Hybrid 9:16 Mode */}
      {isHybrid && (
        <AbsoluteFill
          style={{
            opacity: isHybridTalkingHeadWindow ? 1 : 0,
          }}
        >
          <OffthreadVideo
            src={staticFile('motion02/qc_offline_27s_1080p60.mp4')}
            trimBefore={videoTrimBefore}
            muted
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </AbsoluteFill>
      )}

      {/* SCENE 1: f0 -> f240 */}
      {frame < 240 && (
        <Scene1DeadOldSocial
          frame={frame}
          fps={fps}
          isPortrait={isPortrait}
          isHybridTalkingHead={isHybridTalkingHeadWindow}
        />
      )}

      {/* SCENE 2: f240 -> f442 */}
      {frame >= 240 && frame < 442 && (
        <Scene2SemanticEraOrbits
          frame={frame - 240}
          fps={fps}
          isPortrait={isPortrait}
        />
      )}

      {/* SCENE 3: f442 -> f592 */}
      {frame >= 442 && frame < 592 && (
        <Scene3WheelPickerNoIdol
          frame={frame - 442}
          fps={fps}
          isPortrait={isPortrait}
          isHybridTalkingHead={isHybridTalkingHeadWindow}
        />
      )}

      {/* SCENE 4: f592 -> f782 */}
      {frame >= 592 && frame < 782 && (
        <Scene4CylindricalDrum
          frame={frame - 592}
          fps={fps}
          isPortrait={isPortrait}
        />
      )}

      {/* SCENE 5: f782 -> f999 */}
      {frame >= 782 && frame < 999 && (
        <Scene5SemanticFileTree
          frame={frame - 782}
          fps={fps}
          isPortrait={isPortrait}
        />
      )}

      {/* SCENE 6: f999 -> f1175 */}
      {frame >= 999 && frame < 1175 && (
        <Scene6ThreeSphereAndSword
          frame={frame - 999}
          fps={fps}
          isPortrait={isPortrait}
          isHybridTalkingHead={isHybridTalkingHeadWindow}
        />
      )}

      {/* SCENE 7: f1175 -> f1302 */}
      {frame >= 1175 && frame < 1302 && (
        <Scene7GlassRolodexStack
          frame={frame - 1175}
          fps={fps}
          isPortrait={isPortrait}
          isHybridTalkingHead={isHybridTalkingHeadWindow}
        />
      )}

      {/* SCENE 8: f1302 -> f1432 */}
      {frame >= 1302 && frame < 1432 && (
        <Scene8IsometricPackagingGrid
          frame={frame - 1302}
          fps={fps}
          isPortrait={isPortrait}
        />
      )}

      {/* SCENE 9: f1432 -> f1620 */}
      {frame >= 1432 && (
        <Scene9SkillToMarketFinale
          frame={frame - 1432}
          fps={fps}
          isPortrait={isPortrait}
        />
      )}

      {/* Subtle Optical Lens Vignette */}
      <AbsoluteFill
        style={{
          pointerEvents: 'none',
          boxShadow: 'inset 0 0 110px rgba(0, 0, 0, 0.55)',
          zIndex: 70,
        }}
      />

      {/* Always-on Semantic Timecode & Transcript Progress Bar */}
      <SemanticHudOverlay
        frame={frame}
        fps={fps}
        durationInFrames={durationInFrames}
        isPortrait={isPortrait}
      />
    </AbsoluteFill>
  );
};
