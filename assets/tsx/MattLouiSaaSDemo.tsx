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
const CARD_STAGGER = 8;

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

const SmoothCursor3D: React.FC<{
  x: number;
  y: number;
  scale?: number;
  tiltDeg?: number;
  rippleProgress?: number;
  accentColor?: string;
  label?: string;
}> = ({
  x,
  y,
  scale = 1,
  tiltDeg = 0,
  rippleProgress = 0,
  accentColor = '#00F5D4',
  label = 'EDIT PILOT AI',
}) => {
  const showRipple = rippleProgress > 0.001 && rippleProgress < 0.999;
  const rippleScale1 = 0.35 + rippleProgress * 2.4;
  const rippleOpacity1 = (1 - rippleProgress) * 0.78;
  const rippleScale2 = 0.2 + rippleProgress * 1.65;
  const rippleOpacity2 = (1 - rippleProgress) * 0.52;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 90,
        transform: `translate3d(${x}px, ${y}px, 0) scale(${scale}) rotate(${tiltDeg}deg)`,
        transformOrigin: 'top left',
        willChange: 'transform',
      }}
    >
      {showRipple && (
        <>
          <div
            style={{
              position: 'absolute',
              top: -28,
              left: -28,
              width: 56,
              height: 56,
              borderRadius: 999,
              border: `2px solid ${accentColor}`,
              boxShadow: `0 0 28px ${accentColor}`,
              opacity: rippleOpacity1,
              transform: `scale(${rippleScale1})`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: -28,
              left: -28,
              width: 56,
              height: 56,
              borderRadius: 999,
              background: `radial-gradient(circle, ${accentColor}55 0%, transparent 72%)`,
              opacity: rippleOpacity2,
              transform: `scale(${rippleScale2})`,
            }}
          />
        </>
      )}

      <svg
        width="44"
        height="44"
        viewBox="0 0 44 44"
        style={{
          filter: `drop-shadow(0 12px 24px rgba(0, 0, 0, 0.65)) drop-shadow(0 0 14px ${accentColor}88)`,
        }}
      >
        <defs>
          <linearGradient id="cursorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="65%" stopColor="#E2F1FF" />
            <stop offset="100%" stopColor={accentColor} />
          </linearGradient>
        </defs>
        <path
          d="M5.5 4.2L37.8 17.6C39.7 18.4 39.6 21.1 37.6 21.8L23.4 26.5L18.1 40.3C17.3 42.2 14.6 42.1 13.9 40.1L3.3 6.9C2.7 5.1 4.1 3.6 5.5 4.2Z"
          fill="url(#cursorGrad)"
          stroke="#07111E"
          strokeWidth="2.2"
        />
      </svg>

      <div
        style={{
          position: 'absolute',
          top: 30,
          left: 28,
          padding: '6px 14px',
          borderRadius: 999,
          background: 'rgba(8, 15, 30, 0.88)',
          border: `1px solid ${accentColor}99`,
          boxShadow: `0 10px 26px rgba(0,0,0,0.5), 0 0 18px ${accentColor}44`,
          color: '#F8FAFC',
          fontFamily: "'SVN-Aeonik', -apple-system, BlinkMacSystemFont, sans-serif",
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: '0.08em',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </div>
    </div>
  );
};

// ============================================================================
// SCENE 1 (Frames 0 - 240): Way 1 "Record It" — Edit Pilot AI Prompt Bar 3D
// ============================================================================
const Scene1RecordIt: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  // Entrance & Exit transitions
  const enterSpring = spring({
    frame,
    fps,
    config: { mass: 1, damping: 14, stiffness: 120 },
  });
  const smoothSpring = spring({
    frame,
    fps,
    config: { mass: 1, damping: 200, stiffness: 90 },
  });

  const exitProgress = interpolate(frame, [218, 240], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: IN_OUT_QUINT,
  });

  // Camera 3D stages:
  // Stage A (0 -> 42): start from rotateX(14deg) rotateY(-12deg) scale(0.92)
  // Stage B (42 -> 148): zoom in scale(1.12) following cursor while typing
  // Stage C (148 -> 215): dolly-out to rotateX(0deg) rotateY(0deg) scale(1) on Send click
  const zoomInP = interpolate(frame, [18, 86], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EXPO_OUT,
  });
  const dollyOutP = interpolate(frame, [152, 208], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: IN_OUT_QUINT,
  });

  const camRotateX =
    14 * (1 - zoomInP) + 6.5 * zoomInP * (1 - dollyOutP) + 0 * dollyOutP;
  const camRotateY =
    -12 * (1 - zoomInP) + -4.2 * zoomInP * (1 - dollyOutP) + 0 * dollyOutP;
  const camScale =
    0.92 * (1 - zoomInP) +
    1.12 * zoomInP * (1 - dollyOutP) +
    1.0 * dollyOutP +
    exitProgress * 0.08;

  const camPanX = -34 * zoomInP * (1 - dollyOutP);
  const camPanY = -18 * zoomInP * (1 - dollyOutP) - exitProgress * 36;

  // Prompt tokens with 85% overlap stagger (STAGGER = 5 frames @ 60fps)
  const promptWords = [
    'Recreate',
    '@mattloui',
    '3D',
    'camera',
    'push,',
    'spring(1,14,120)',
    '&',
    'sub-pixel',
    'Neon',
    'glow',
    'at',
    '60fps',
  ];

  // Send click pulse around frame 162
  const clickTrigger = interpolate(frame, [158, 166, 178], [0, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EXPO_OUT,
  });
  const sendGlowP = spring({
    frame: Math.max(0, frame - 160),
    fps,
    config: { mass: 1, damping: 14, stiffness: 120 },
  });
  const rippleP = interpolate(frame, [160, 206], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EXPO_OUT,
  });

  // Bezier cursor trajectory
  const cursorMove1 = interpolate(frame, [0, 58], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EXPO_OUT,
  });
  const cursorTypingDrift = interpolate(frame, [58, 132], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const cursorToSend = interpolate(frame, [128, 162], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: IN_OUT_QUINT,
  });

  const [startX, startY] = cubicBezierPoint(
    cursorMove1,
    [320, 860],
    [410, 620],
    [540, 560],
    [660, 548]
  );
  const driftX = startX + cursorTypingDrift * 410;
  const driftY = startY + Math.sin(cursorTypingDrift * Math.PI * 2) * 8.5;

  const [finalCursorX, finalCursorY] = cubicBezierPoint(
    cursorToSend,
    [driftX, driftY],
    [1160, 490],
    [1310, 520],
    [1388, 608]
  );

  const cursorScale = 1 - clickTrigger * 0.14 + sendGlowP * 0.04;
  const cursorTilt = -8 * (1 - cursorToSend) + 6 * cursorToSend;

  const sceneOpacity = clamp01(enterSpring) * (1 - exitProgress);
  const sceneBlur = (1 - clamp01(enterSpring)) * 10 + exitProgress * 10;

  const attachmentChips = [
    { label: 'Screen_Rec_MattLoui_60fps.mov', tag: '4K 60FPS', color: '#00F5D4' },
    { label: 'Spring_Physics_Config.json', tag: 'DAMPING 14', color: '#3B6EF6' },
    { label: 'SubPixel_Matrix3D.glsl', tag: 'SKIA GPU', color: '#A855F7' },
  ];

  return (
    <AbsoluteFill
      style={{
        perspective: '1600px',
        opacity: sceneOpacity,
        filter: `blur(${sceneBlur}px)`,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          width: 1560,
          height: 860,
          position: 'relative',
          transformStyle: 'preserve-3d',
          transform: `translate3d(${camPanX}px, ${camPanY}px, 0) rotateX(${camRotateX}deg) rotateY(${camRotateY}deg) scale(${camScale})`,
          willChange: 'transform',
        }}
      >
        {/* Top Way Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 28,
            transform: `translate3d(0, ${(1 - smoothSpring) * 35}px, 0)`,
            opacity: clamp01(smoothSpring),
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 14,
              padding: '10px 22px',
              borderRadius: 999,
              background: 'rgba(0, 245, 212, 0.09)',
              border: '1px solid rgba(0, 245, 212, 0.45)',
              boxShadow: '0 0 30px rgba(0, 245, 212, 0.18)',
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                background: '#00F5D4',
                boxShadow: '0 0 14px #00F5D4',
              }}
            />
            <span
              style={{
                fontFamily: "'SVN-Aeonik', sans-serif",
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: '0.14em',
                color: '#00F5D4',
              }}
            >
              WAY 01 / 03 — RECORD IT
            </span>
          </div>

          <div
            style={{
              fontFamily: "'SVN-Aeonik', sans-serif",
              fontSize: 16,
              fontWeight: 500,
              color: 'rgba(226, 232, 240, 0.72)',
              letterSpacing: '0.06em',
            }}
          >
            CHROMIUM SKIA GPU • 1920×1080 • 60.0 FPS
          </div>
        </div>

        {/* Hero Title */}
        <div
          style={{
            marginBottom: 34,
            transform: `translate3d(0, ${(1 - enterSpring) * 45}px, 0) scale(${0.92 + 0.08 * enterSpring})`,
            transformOrigin: 'left center',
          }}
        >
          <div
            style={{
              fontFamily: "'SVN-Aeonik', sans-serif",
              fontSize: 64,
              fontWeight: 900,
              letterSpacing: '-0.03em',
              color: '#F8FAFC',
              lineHeight: 1.08,
            }}
          >
            Edit Pilot AI{' '}
            <span
              style={{
                background: 'linear-gradient(90deg, #00F5D4 0%, #3B6EF6 55%, #A855F7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Prompt Bar 3D
            </span>
          </div>
        </div>

        {/* Main Glassmorphism Dark Prompt Studio Card */}
        <div
          style={{
            position: 'relative',
            borderRadius: 32,
            padding: '38px 44px',
            background:
              'linear-gradient(145deg, rgba(13, 21, 38, 0.86) 0%, rgba(7, 11, 22, 0.94) 100%)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: `1.5px solid rgba(0, 245, 212, ${0.42 + sendGlowP * 0.48})`,
            boxShadow: `
              0 36px 80px -16px rgba(0, 0, 0, 0.82),
              0 0 ${42 + sendGlowP * 55}px rgba(0, 245, 212, ${0.22 + sendGlowP * 0.32}),
              inset 0 1px 0 rgba(255, 255, 255, 0.18),
              inset 0 0 36px rgba(0, 245, 212, 0.07)
            `,
          }}
        >
          {/* Top Studio Header Bar inside Glass Card */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: 24,
              marginBottom: 28,
              borderBottom: '1px solid rgba(148, 163, 184, 0.16)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: 99, background: '#FF5F56' }} />
                <div style={{ width: 12, height: 12, borderRadius: 99, background: '#FFBD2E' }} />
                <div style={{ width: 12, height: 12, borderRadius: 99, background: '#27C93F' }} />
              </div>
              <span
                style={{
                  marginLeft: 10,
                  fontFamily: "'SVN-Aeonik', sans-serif",
                  fontSize: 17,
                  fontWeight: 700,
                  color: '#E2E8F0',
                  letterSpacing: '0.03em',
                }}
              >
                EDIT PILOT STUDIO — SCREEN RECORDING MOTION CLONER
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '6px 16px',
                borderRadius: 999,
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.45)',
              }}
            >
              <div
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: 999,
                  background: '#EF4444',
                  boxShadow: '0 0 12px #EF4444',
                  transform: `scale(${0.88 + Math.sin(frame * 0.18) * 0.16})`,
                }}
              />
              <span
                style={{
                  fontFamily: "'SVN-Aeonik', sans-serif",
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#FCA5A5',
                  letterSpacing: '0.08em',
                }}
              >
                REC 00:04.12 • 60FPS LOCKED
              </span>
            </div>
          </div>

          {/* Attached Reference Pills (Staggered) */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 30 }}>
            {attachmentChips.map((chip, idx) => {
              const chipP = spring({
                frame: Math.max(0, frame - 12 - idx * STAGGER),
                fps,
                config: { mass: 1, damping: 14, stiffness: 120 },
              });
              const chipBlur = (1 - clamp01(chipP)) * 10;
              return (
                <div
                  key={chip.label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 20px',
                    borderRadius: 16,
                    background: 'rgba(15, 23, 42, 0.78)',
                    border: `1px solid ${chip.color}55`,
                    boxShadow: `0 8px 24px rgba(0,0,0,0.35), 0 0 18px ${chip.color}18`,
                    opacity: clamp01(chipP),
                    filter: `blur(${chipBlur}px)`,
                    transform: `translate3d(0, ${(1 - chipP) * 32}px, 0) scale(${0.92 + 0.08 * chipP})`,
                  }}
                >
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 99,
                      background: chip.color,
                      boxShadow: `0 0 10px ${chip.color}`,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "'SVN-Aeonik', sans-serif",
                      fontSize: 16,
                      fontWeight: 600,
                      color: '#F1F5F9',
                    }}
                  >
                    {chip.label}
                  </span>
                  <span
                    style={{
                      padding: '3px 9px',
                      borderRadius: 8,
                      background: `${chip.color}22`,
                      color: chip.color,
                      fontFamily: "'SVN-Aeonik', sans-serif",
                      fontSize: 12,
                      fontWeight: 800,
                      letterSpacing: '0.06em',
                    }}
                  >
                    {chip.tag}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Prompt Input Box with Sub-pixel Blur-in Words */}
          <div
            style={{
              position: 'relative',
              minHeight: 168,
              borderRadius: 24,
              padding: '28px 32px',
              background: 'rgba(6, 10, 20, 0.85)',
              border: `1.5px solid rgba(0, 245, 212, ${0.35 + sendGlowP * 0.55})`,
              boxShadow: `inset 0 2px 18px rgba(0, 0, 0, 0.65), 0 0 ${24 + sendGlowP * 40}px rgba(0, 245, 212, ${0.15 + sendGlowP * 0.25})`,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '12px 14px',
              }}
            >
              <span
                style={{
                  padding: '6px 14px',
                  borderRadius: 10,
                  background: 'rgba(0, 245, 212, 0.14)',
                  border: '1px solid rgba(0, 245, 212, 0.45)',
                  color: '#00F5D4',
                  fontFamily: "'SVN-Aeonik', sans-serif",
                  fontSize: 22,
                  fontWeight: 700,
                }}
              >
                /clone-motion
              </span>

              {promptWords.map((word, idx) => {
                const wordStart = 28 + idx * STAGGER;
                const wp = spring({
                  frame: Math.max(0, frame - wordStart),
                  fps,
                  config: { mass: 1, damping: 14, stiffness: 120 },
                });
                const wOpacity = clamp01(wp);
                const wBlur = (1 - wOpacity) * 10;
                const isHighlight =
                  word.includes('@mattloui') ||
                  word.includes('spring') ||
                  word.includes('60fps') ||
                  word.includes('Neon');

                return (
                  <span
                    key={`${word}-${idx}`}
                    style={{
                      display: 'inline-block',
                      fontFamily: "'SVN-Aeonik', sans-serif",
                      fontSize: 30,
                      fontWeight: isHighlight ? 800 : 500,
                      color: isHighlight ? '#00F5D4' : '#F8FAFC',
                      textShadow: isHighlight
                        ? '0 0 22px rgba(0, 245, 212, 0.45)'
                        : 'none',
                      opacity: wOpacity,
                      filter: `blur(${wBlur}px)`,
                      transform: `translate3d(0, ${(1 - wp) * 26}px, 0) scale(${0.92 + 0.08 * wp})`,
                      willChange: 'transform, opacity, filter',
                    }}
                  >
                    {word}
                  </span>
                );
              })}

              {/* Glowing Caret */}
              <span
                style={{
                  display: 'inline-block',
                  width: 3.5,
                  height: 34,
                  borderRadius: 4,
                  background: '#00F5D4',
                  boxShadow: '0 0 14px #00F5D4',
                  opacity: 0.55 + Math.sin(frame * 0.25) * 0.45,
                }}
              />
            </div>

            {/* Bottom Action Footer inside Prompt Box */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: 26,
                paddingTop: 20,
                borderTop: '1px solid rgba(148, 163, 184, 0.14)',
              }}
            >
              {/* Audio / Motion Waveform Visualizer */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                <div
                  style={{
                    fontFamily: "'SVN-Aeonik', sans-serif",
                    fontSize: 15,
                    fontWeight: 600,
                    color: '#94A3B8',
                    letterSpacing: '0.04em',
                  }}
                >
                  VOICE + KEYFRAME STREAM
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: 5,
                    height: 32,
                  }}
                >
                  {Array.from({ length: 24 }).map((_, i) => {
                    const wave =
                      0.28 +
                      0.72 *
                        Math.abs(
                          Math.sin(frame * 0.14 + i * 0.48) *
                            Math.cos(frame * 0.07 - i * 0.22)
                        );
                    return (
                      <div
                        key={i}
                        style={{
                          width: 4,
                          height: 30,
                          borderRadius: 99,
                          background:
                            i % 3 === 0
                              ? '#00F5D4'
                              : i % 3 === 1
                              ? '#3B6EF6'
                              : '#818CF8',
                          transformOrigin: 'bottom',
                          transform: `scaleY(${wave})`,
                        }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Glowing Send / Generate Button */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '15px 32px',
                  borderRadius: 18,
                  background:
                    sendGlowP > 0.05
                      ? 'linear-gradient(90deg, #00F5D4 0%, #3B6EF6 100%)'
                      : 'linear-gradient(90deg, rgba(0, 245, 212, 0.88) 0%, rgba(59, 110, 246, 0.88) 100%)',
                  boxShadow: `
                    0 12px 32px rgba(0, 245, 212, ${0.35 + sendGlowP * 0.45}),
                    0 0 ${25 + sendGlowP * 65}px rgba(0, 245, 212, ${0.4 + sendGlowP * 0.55})
                  `,
                  transform: `scale(${1 - clickTrigger * 0.08 + sendGlowP * 0.06})`,
                }}
              >
                <span
                  style={{
                    fontFamily: "'SVN-Aeonik', sans-serif",
                    fontSize: 18,
                    fontWeight: 900,
                    color: '#040B16',
                    letterSpacing: '0.05em',
                  }}
                >
                  {sendGlowP > 0.2 ? 'RENDERING 60FPS SKIA...' : 'SEND TO REM0TION 60FPS'}
                </span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 12H19M19 12L12 5M19 12L12 19"
                    stroke="#040B16"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Bottom Telemetry Status Strip */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 26,
              color: 'rgba(148, 163, 184, 0.85)',
              fontFamily: "'SVN-Aeonik', sans-serif",
              fontSize: 15,
              fontWeight: 500,
            }}
          >
            <span>✓ Sub-pixel Float32 Transform (`translate3d` + `scale`)</span>
            <span>✓ Bezier Easing `(0.16, 1, 0.3, 1)` & `(0.83, 0, 0.17, 1)`</span>
            <span style={{ color: '#00F5D4', fontWeight: 700 }}>
              STATUS: {sendGlowP > 0.2 ? 'DISPATCHED TO GPU PIPELINE ⚡' : 'READY FOR PROMPT'}
            </span>
          </div>
        </div>

        {/* 3D Cursor */}
        <SmoothCursor3D
          x={finalCursorX}
          y={finalCursorY}
          scale={cursorScale}
          tiltDeg={cursorTilt}
          rippleProgress={rippleP}
          accentColor="#00F5D4"
          label={sendGlowP > 0.2 ? 'PROMPT SENT • 60FPS' : 'RECORD & PROMPT'}
        />
      </div>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 2 (Frames 240 - 480): Way 2 "Screenshot It" — 3-Step Workflow Breakdown
// ============================================================================
const Scene2ScreenshotIt: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const enterP = spring({
    frame,
    fps,
    config: { mass: 1, damping: 14, stiffness: 120 },
  });
  const cameraSmooth = spring({
    frame,
    fps,
    config: { mass: 1, damping: 200, stiffness: 80 },
  });
  const exitP = interpolate(frame, [218, 240], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: IN_OUT_QUINT,
  });

  // Camera glides smoothly from angled perspective into center
  const camRotateX = 13 * (1 - cameraSmooth) + 1.8 * cameraSmooth;
  const camRotateY = 11 * (1 - cameraSmooth) - 1.2 * cameraSmooth;
  const camScale = 0.92 + 0.08 * cameraSmooth + exitP * 0.06;
  const camY = (1 - cameraSmooth) * 40 - exitP * 35;

  // SVG Connector Line strokeDashoffset animation
  const pathLength = 1520;
  const lineDrawP = interpolate(frame, [18, 124], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EXPO_OUT,
  });
  const dashOffset = pathLength * (1 - lineDrawP);

  const cards = [
    {
      step: 'STEP 01',
      title: 'Screenshot UI Frame',
      subtitle: 'Drop any high-converting SaaS frame into Claude Vision',
      metric: '99.4%',
      metricLabel: 'Layout Token Accuracy',
      accent: '#00F5D4',
      bars: [0.48, 0.72, 0.64, 0.88, 0.95, 0.82, 1.0],
      tags: ['DOM Hierarchy', 'Glass Blur 24px', 'Hex Palette'],
    },
    {
      step: 'STEP 02',
      title: 'Extract Spring Physics',
      subtitle: 'Convert static spacing into sub-pixel spring & Bezier curves',
      metric: '60 FPS',
      metricLabel: 'Zero Integer Rounding',
      accent: '#3B6EF6',
      bars: [0.35, 0.58, 0.76, 0.68, 0.92, 0.86, 0.98],
      tags: ['damping: 14', 'stiffness: 120', 'Stagger 85%'],
    },
    {
      step: 'STEP 03',
      title: 'Remotion Skia Render',
      subtitle: 'Compile TSX directly to Chromium GPU 1080p60 H.264 stream',
      metric: '0.00ms',
      metricLabel: 'Sub-pixel Jitter Error',
      accent: '#A855F7',
      bars: [0.52, 0.66, 0.81, 0.89, 0.94, 0.97, 1.0],
      tags: ['translate3d()', 'scaleY() Bars', 'CRF 16 Master'],
    },
  ];

  // Cursor sweeping across the 3 workflow cards
  const cursorT = interpolate(frame, [20, 195], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: IN_OUT_QUINT,
  });
  const [curX, curY] = cubicBezierPoint(
    cursorT,
    [260, 650],
    [680, 420],
    [1120, 720],
    [1520, 520]
  );

  const sceneOpacity = clamp01(enterP) * (1 - exitP);
  const sceneBlur = (1 - clamp01(enterP)) * 10 + exitP * 10;

  return (
    <AbsoluteFill
      style={{
        perspective: '1600px',
        opacity: sceneOpacity,
        filter: `blur(${sceneBlur}px)`,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          width: 1640,
          height: 880,
          position: 'relative',
          transformStyle: 'preserve-3d',
          transform: `translate3d(0, ${camY}px, 0) rotateX(${camRotateX}deg) rotateY(${camRotateY}deg) scale(${camScale})`,
          willChange: 'transform',
        }}
      >
        {/* Header Section */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: 42,
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 12,
                padding: '9px 20px',
                borderRadius: 999,
                background: 'rgba(59, 110, 246, 0.14)',
                border: '1px solid rgba(59, 110, 246, 0.5)',
                marginBottom: 18,
              }}
            >
              <div
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: 99,
                  background: '#3B6EF6',
                  boxShadow: '0 0 12px #3B6EF6',
                }}
              />
              <span
                style={{
                  fontFamily: "'SVN-Aeonik', sans-serif",
                  fontSize: 15,
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  color: '#60A5FA',
                }}
              >
                WAY 02 / 03 — SCREENSHOT IT
              </span>
            </div>

            <div
              style={{
                fontFamily: "'SVN-Aeonik', sans-serif",
                fontSize: 58,
                fontWeight: 900,
                color: '#F8FAFC',
                letterSpacing: '-0.03em',
                lineHeight: 1.08,
              }}
            >
              3-Step Visual-to-Code{' '}
              <span
                style={{
                  background: 'linear-gradient(90deg, #00F5D4 0%, #3B6EF6 55%, #A855F7 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Workflow Breakdown
              </span>
            </div>
          </div>

          <div
            style={{
              padding: '12px 22px',
              borderRadius: 16,
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(148, 163, 184, 0.22)',
              color: '#CBD5E1',
              fontFamily: "'SVN-Aeonik', sans-serif",
              fontSize: 16,
              fontWeight: 600,
            }}
          >
            STAGGER = 8 FRAMES • SPRING(1, 14, 120)
          </div>
        </div>

        {/* Horizontal SVG Connecting Path Behind the 3 Cards */}
        <svg
          width="1640"
          height="620"
          viewBox="0 0 1640 620"
          style={{
            position: 'absolute',
            top: 190,
            left: 0,
            pointerEvents: 'none',
            zIndex: 1,
          }}
        >
          <defs>
            <linearGradient id="workflowLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00F5D4" />
              <stop offset="50%" stopColor="#3B6EF6" />
              <stop offset="100%" stopColor="#A855F7" />
            </linearGradient>
          </defs>
          {/* Subtle background track */}
          <path
            d="M 180 310 C 460 150, 640 470, 820 310 C 1000 150, 1180 470, 1460 310"
            fill="none"
            stroke="rgba(148, 163, 184, 0.16)"
            strokeWidth="3"
            strokeDasharray="8 10"
          />
          {/* Animated self-drawing glowing connector */}
          <path
            d="M 180 310 C 460 150, 640 470, 820 310 C 1000 150, 1180 470, 1460 310"
            fill="none"
            stroke="url(#workflowLineGrad)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={pathLength}
            strokeDashoffset={dashOffset}
            style={{
              filter: 'drop-shadow(0 0 18px rgba(0, 245, 212, 0.55))',
            }}
          />
        </svg>

        {/* 3 SaaS Workflow Cards */}
        <div
          style={{
            position: 'relative',
            zIndex: 5,
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 34,
          }}
        >
          {cards.map((card, idx) => {
            const cardStart = 14 + idx * CARD_STAGGER;
            const cardP = spring({
              frame: Math.max(0, frame - cardStart),
              fps,
              config: { mass: 1, damping: 14, stiffness: 120 },
            });
            const cOpacity = clamp01(cardP);
            const cBlur = (1 - cOpacity) * 10;

            return (
              <div
                key={card.step}
                style={{
                  borderRadius: 28,
                  padding: '34px 32px',
                  background:
                    'linear-gradient(160deg, rgba(15, 23, 42, 0.88) 0%, rgba(7, 11, 21, 0.95) 100%)',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  border: `1.5px solid ${card.accent}66`,
                  boxShadow: `
                    0 28px 65px -12px rgba(0, 0, 0, 0.78),
                    0 0 34px ${card.accent}26,
                    inset 0 1px 0 rgba(255, 255, 255, 0.15)
                  `,
                  opacity: cOpacity,
                  filter: `blur(${cBlur}px)`,
                  transform: `translate3d(0, ${(1 - cardP) * 56}px, 0) scale(${0.92 + 0.08 * cardP})`,
                  willChange: 'transform, opacity, filter',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: 580,
                }}
              >
                <div>
                  {/* Step Header */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 22,
                    }}
                  >
                    <span
                      style={{
                        padding: '6px 14px',
                        borderRadius: 99,
                        background: `${card.accent}1F`,
                        border: `1px solid ${card.accent}66`,
                        color: card.accent,
                        fontFamily: "'SVN-Aeonik', sans-serif",
                        fontSize: 13,
                        fontWeight: 800,
                        letterSpacing: '0.1em',
                      }}
                    >
                      {card.step}
                    </span>
                    <span
                      style={{
                        fontFamily: "'SVN-Aeonik', sans-serif",
                        fontSize: 14,
                        fontWeight: 600,
                        color: '#94A3B8',
                      }}
                    >
                      60FPS PIPELINE
                    </span>
                  </div>

                  {/* Card Title & Subtitle */}
                  <div
                    style={{
                      fontFamily: "'SVN-Aeonik', sans-serif",
                      fontSize: 31,
                      fontWeight: 800,
                      color: '#F8FAFC',
                      marginBottom: 10,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {card.title}
                  </div>
                  <div
                    style={{
                      fontFamily: "'SVN-Aeonik', sans-serif",
                      fontSize: 16,
                      fontWeight: 400,
                      color: '#94A3B8',
                      lineHeight: 1.45,
                      marginBottom: 24,
                    }}
                  >
                    {card.subtitle}
                  </div>

                  {/* Key Metric Callout */}
                  <div
                    style={{
                      padding: '16px 20px',
                      borderRadius: 18,
                      background: 'rgba(6, 11, 22, 0.72)',
                      border: '1px solid rgba(148, 163, 184, 0.16)',
                      display: 'flex',
                      alignItems: 'baseline',
                      justifyContent: 'space-between',
                      marginBottom: 24,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'SVN-Aeonik', sans-serif",
                        fontSize: 36,
                        fontWeight: 900,
                        color: card.accent,
                        textShadow: `0 0 20px ${card.accent}55`,
                      }}
                    >
                      {card.metric}
                    </span>
                    <span
                      style={{
                        fontFamily: "'SVN-Aeonik', sans-serif",
                        fontSize: 14,
                        fontWeight: 600,
                        color: '#CBD5E1',
                      }}
                    >
                      {card.metricLabel}
                    </span>
                  </div>
                </div>

                {/* Animated Bar Chart inside Card using scaleY() with transformOrigin: 'bottom' */}
                <div>
                  <div
                    style={{
                      height: 150,
                      padding: '18px 18px 14px 18px',
                      borderRadius: 18,
                      background: 'rgba(5, 9, 18, 0.82)',
                      border: '1px solid rgba(148, 163, 184, 0.14)',
                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: 'space-between',
                      gap: 12,
                      marginBottom: 20,
                    }}
                  >
                    {card.bars.map((targetH, barIdx) => {
                      const barStart = cardStart + 18 + barIdx * STAGGER;
                      const barP = spring({
                        frame: Math.max(0, frame - barStart),
                        fps,
                        config: { mass: 1, damping: 14, stiffness: 120 },
                      });
                      const dynamicPulse =
                        1 + Math.sin(frame * 0.09 + barIdx * 0.7 + idx) * 0.04;
                      const scaleYVal = Math.max(0.04, targetH * barP * dynamicPulse);

                      return (
                        <div
                          key={barIdx}
                          style={{
                            flex: 1,
                            height: '100%',
                            display: 'flex',
                            alignItems: 'flex-end',
                          }}
                        >
                          <div
                            style={{
                              width: '100%',
                              height: '100%',
                              borderRadius: 8,
                              background: `linear-gradient(180deg, ${card.accent} 0%, ${card.accent}33 100%)`,
                              boxShadow: `0 0 16px ${card.accent}44`,
                              transformOrigin: 'bottom',
                              transform: `scaleY(${scaleYVal})`,
                              willChange: 'transform',
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Feature Tags */}
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {card.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 9,
                          background: 'rgba(30, 41, 59, 0.65)',
                          border: '1px solid rgba(148, 163, 184, 0.2)',
                          color: '#E2E8F0',
                          fontFamily: "'SVN-Aeonik', sans-serif",
                          fontSize: 13,
                          fontWeight: 600,
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Floating 3D Cursor */}
        <SmoothCursor3D
          x={curX}
          y={curY}
          scale={1}
          tiltDeg={-5}
          accentColor="#3B6EF6"
          label="EXTRACTING MOTION TOKENS"
        />
      </div>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 3 (Frames 480 - 720): Way 3 "Reference It" — Sword Slit Reveal & Dashboard
// ============================================================================
const Scene3ReferenceIt: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  // Sword Slit Reveal at the start of Scene 3
  const slitCutP = interpolate(frame, [0, 16], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EXPO_OUT,
  });
  const slitOpenP = interpolate(frame, [10, 48], [0.008, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EXPO_OUT,
  });
  const slitFlareOpacity = interpolate(frame, [0, 14, 46], [0, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const camSmooth = spring({
    frame,
    fps,
    config: { mass: 1, damping: 200, stiffness: 85 },
  });
  const camRotateX = 10 * (1 - camSmooth) + 1.2 * camSmooth;
  const camRotateY = -9 * (1 - camSmooth) + 0.8 * camSmooth;
  const camScale = 0.93 + 0.07 * camSmooth;

  // Title words with STAGGER = 5 frames & blue box scaleX
  const titleWords = ["Here's", "what's"];
  const workingWordP = spring({
    frame: Math.max(0, frame - (16 + 2 * STAGGER)),
    fps,
    config: { mass: 1, damping: 14, stiffness: 120 },
  });
  const blueBoxScaleX = interpolate(frame, [22, 62], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EXPO_OUT,
  });

  const kpiCards = [
    {
      label: 'MONTHLY RECURRING REVENUE',
      value: 'US$5,572',
      delta: '+42.8% vs last month',
      accent: '#00F5D4',
      sub: 'Clickt / FEDU Creator Suite',
    },
    {
      label: 'ACTIVE SAAS CREATORS',
      value: '11.0k',
      delta: '+1,840 new signups',
      accent: '#3B6EF6',
      sub: '60fps Native Pipeline',
    },
    {
      label: 'CONVERSION LIFT RATE',
      value: '4.4%',
      delta: '+1.9x retention boost',
      accent: '#A855F7',
      sub: 'Sub-Pixel Motion Polish',
    },
  ];

  // SVG Growth Chart strokeDashoffset animation
  const chartPathLen = 1480;
  const chartDrawP = interpolate(frame, [36, 156], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EXPO_OUT,
  });
  const chartDashOffset = chartPathLen * (1 - chartDrawP);

  // 3D Cursor gliding along the growth curve
  const cursorCurveP = interpolate(frame, [32, 168], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: IN_OUT_QUINT,
  });
  const [cursorX, cursorY] = cubicBezierPoint(
    cursorCurveP,
    [240, 740],
    [620, 660],
    [1040, 520],
    [1435, 455]
  );
  const peakRippleP = interpolate(frame, [164, 212], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EXPO_OUT,
  });

  return (
    <AbsoluteFill
      style={{
        perspective: '1600px',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Sword Slit Light Beam Overlay */}
      {slitFlareOpacity > 0.01 && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: '50%',
            height: 18,
            marginTop: -9,
            zIndex: 120,
            pointerEvents: 'none',
            background:
              'linear-gradient(90deg, transparent 0%, #00F5D4 20%, #FFFFFF 50%, #3B6EF6 80%, transparent 100%)',
            boxShadow:
              '0 0 60px 18px rgba(0, 245, 212, 0.85), 0 0 120px 36px rgba(59, 110, 246, 0.65)',
            opacity: slitFlareOpacity,
            transform: `scaleX(${slitCutP}) scaleY(${1 + slitOpenP * 2.5})`,
          }}
        />
      )}

      {/* Scene Content revealed via Sword Slit scaleY */}
      <div
        style={{
          width: 1640,
          height: 900,
          position: 'relative',
          transformStyle: 'preserve-3d',
          transformOrigin: 'center center',
          transform: `scaleY(${slitOpenP}) rotateX(${camRotateX}deg) rotateY(${camRotateY}deg) scale(${camScale})`,
          willChange: 'transform',
        }}
      >
        {/* Top Badge Row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 22,
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              padding: '9px 20px',
              borderRadius: 999,
              background: 'rgba(59, 110, 246, 0.16)',
              border: '1px solid rgba(59, 110, 246, 0.55)',
            }}
          >
            <div
              style={{
                width: 9,
                height: 9,
                borderRadius: 99,
                background: '#00F5D4',
                boxShadow: '0 0 12px #00F5D4',
              }}
            />
            <span
              style={{
                fontFamily: "'SVN-Aeonik', sans-serif",
                fontSize: 15,
                fontWeight: 700,
                letterSpacing: '0.14em',
                color: '#F8FAFC',
              }}
            >
              WAY 03 / 03 — REFERENCE IT • CLICKT / FEDU SAAS PROMO
            </span>
          </div>

          <div
            style={{
              fontFamily: "'SVN-Aeonik', sans-serif",
              fontSize: 15,
              fontWeight: 600,
              color: '#94A3B8',
              letterSpacing: '0.06em',
            }}
          >
            SWORD SLIT REVEAL • LIVE ANALYTICS ENGINE
          </div>
        </div>

        {/* Hero Title: "Here's what's [working.]" */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            marginBottom: 34,
          }}
        >
          {titleWords.map((word, idx) => {
            const wp = spring({
              frame: Math.max(0, frame - (14 + idx * STAGGER)),
              fps,
              config: { mass: 1, damping: 14, stiffness: 120 },
            });
            const wOp = clamp01(wp);
            const wBlur = (1 - wOp) * 10;
            return (
              <span
                key={word}
                style={{
                  display: 'inline-block',
                  fontFamily: "'SVN-Aeonik', sans-serif",
                  fontSize: 70,
                  fontWeight: 900,
                  color: '#F8FAFC',
                  letterSpacing: '-0.03em',
                  opacity: wOp,
                  filter: `blur(${wBlur}px)`,
                  transform: `translate3d(0, ${(1 - wp) * 45}px, 0) scale(${0.92 + 0.08 * wp})`,
                }}
              >
                {word}
              </span>
            );
          })}

          {/* Blue Highlight Box #3B6EF6 expanding with scaleX(transformOrigin: 'left') */}
          <div
            style={{
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              padding: '6px 28px 10px 28px',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: 20,
                background: 'linear-gradient(90deg, #3B6EF6 0%, #2563EB 100%)',
                boxShadow:
                  '0 18px 45px rgba(59, 110, 246, 0.55), 0 0 32px rgba(0, 245, 212, 0.3)',
                transformOrigin: 'left center',
                transform: `scaleX(${blueBoxScaleX})`,
                willChange: 'transform',
              }}
            />
            <span
              style={{
                position: 'relative',
                zIndex: 2,
                fontFamily: "'SVN-FreightDisplay', 'GT-Sectra', Georgia, serif",
                fontStyle: 'italic',
                fontSize: 72,
                fontWeight: 900,
                color: '#FFFFFF',
                letterSpacing: '-0.02em',
                opacity: clamp01(workingWordP),
                filter: `blur(${(1 - clamp01(workingWordP)) * 10}px)`,
                transform: `translate3d(0, ${(1 - workingWordP) * 45}px, 0) scale(${0.92 + 0.08 * workingWordP})`,
              }}
            >
              working.
            </span>
          </div>
        </div>

        {/* 3 KPI Dashboard Cards (`US$5,572`, `11.0k`, `4.4%`) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 28,
            marginBottom: 28,
          }}
        >
          {kpiCards.map((card, idx) => {
            const cardP = spring({
              frame: Math.max(0, frame - (26 + idx * CARD_STAGGER)),
              fps,
              config: { mass: 1, damping: 14, stiffness: 120 },
            });
            const cOp = clamp01(cardP);
            const cBlur = (1 - cOp) * 10;

            return (
              <div
                key={card.value}
                style={{
                  borderRadius: 24,
                  padding: '26px 30px',
                  background:
                    'linear-gradient(155deg, rgba(15, 23, 42, 0.88) 0%, rgba(7, 11, 22, 0.94) 100%)',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  border: `1.5px solid ${card.accent}55`,
                  boxShadow: `0 22px 50px rgba(0,0,0,0.65), 0 0 28px ${card.accent}22`,
                  opacity: cOp,
                  filter: `blur(${cBlur}px)`,
                  transform: `translate3d(0, ${(1 - cardP) * 45}px, 0) scale(${0.92 + 0.08 * cardP})`,
                  willChange: 'transform, opacity, filter',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 12,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'SVN-Aeonik', sans-serif",
                      fontSize: 13,
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      color: '#94A3B8',
                    }}
                  >
                    {card.label}
                  </span>
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: 99,
                      background: `${card.accent}22`,
                      color: card.accent,
                      fontFamily: "'SVN-Aeonik', sans-serif",
                      fontSize: 12,
                      fontWeight: 800,
                    }}
                  >
                    {card.delta}
                  </span>
                </div>

                <div
                  style={{
                    fontFamily: "'SVN-Aeonik', sans-serif",
                    fontSize: 54,
                    fontWeight: 900,
                    color: '#F8FAFC',
                    letterSpacing: '-0.03em',
                    lineHeight: 1.05,
                    marginBottom: 8,
                    textShadow: `0 0 24px ${card.accent}44`,
                  }}
                >
                  {card.value}
                </div>

                <div
                  style={{
                    fontFamily: "'SVN-Aeonik', sans-serif",
                    fontSize: 14,
                    fontWeight: 500,
                    color: '#64748B',
                  }}
                >
                  {card.sub}
                </div>
              </div>
            );
          })}
        </div>

        {/* Main SVG Interactive Revenue & Engagement Graph Card */}
        <div
          style={{
            position: 'relative',
            borderRadius: 28,
            padding: '28px 36px',
            height: 390,
            background:
              'linear-gradient(160deg, rgba(12, 19, 36, 0.9) 0%, rgba(6, 10, 20, 0.96) 100%)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1.5px solid rgba(59, 110, 246, 0.45)',
            boxShadow:
              '0 32px 70px rgba(0, 0, 0, 0.78), 0 0 40px rgba(59, 110, 246, 0.2), inset 0 1px 0 rgba(255,255,255,0.14)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 14,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span
                style={{
                  fontFamily: "'SVN-Aeonik', sans-serif",
                  fontSize: 20,
                  fontWeight: 800,
                  color: '#F8FAFC',
                }}
              >
                Real-Time SaaS Growth Velocity (60fps Telemetry)
              </span>
              <span
                style={{
                  padding: '4px 12px',
                  borderRadius: 99,
                  background: 'rgba(0, 245, 212, 0.14)',
                  border: '1px solid rgba(0, 245, 212, 0.4)',
                  color: '#00F5D4',
                  fontFamily: "'SVN-Aeonik', sans-serif",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                +184.2% BENCHMARK
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                gap: 20,
                fontFamily: "'SVN-Aeonik', sans-serif",
                fontSize: 14,
                color: '#94A3B8',
              }}
            >
              <span style={{ color: '#00F5D4', fontWeight: 700 }}>● MRR Trajectory</span>
              <span style={{ color: '#3B6EF6', fontWeight: 700 }}>● Sub-Pixel Retention</span>
            </div>
          </div>

          {/* SVG Area + Line Chart */}
          <svg
            width="1560"
            height="285"
            viewBox="0 0 1560 285"
            style={{ position: 'relative', zIndex: 2 }}
          >
            <defs>
              <linearGradient id="areaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3B6EF6" stopOpacity="0.52" />
                <stop offset="55%" stopColor="#00F5D4" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#00F5D4" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="strokeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3B6EF6" />
                <stop offset="55%" stopColor="#00F5D4" />
                <stop offset="100%" stopColor="#FFFFFF" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid Lines */}
            {[55, 125, 195, 260].map((yPos) => (
              <line
                key={yPos}
                x1="20"
                y1={yPos}
                x2="1520"
                y2={yPos}
                stroke="rgba(148, 163, 184, 0.12)"
                strokeWidth="1"
                strokeDasharray="6 8"
              />
            ))}

            {/* Gradient Area Underneath Curve */}
            <path
              d="M 40 250 C 240 240, 340 190, 520 182 C 700 174, 820 115, 1020 104 C 1200 94, 1320 42, 1490 26 L 1490 270 L 40 270 Z"
              fill="url(#areaGrad)"
              style={{
                opacity: chartDrawP,
              }}
            />

            {/* Main Animated Stroke Path */}
            <path
              d="M 40 250 C 240 240, 340 190, 520 182 C 700 174, 820 115, 1020 104 C 1200 94, 1320 42, 1490 26"
              fill="none"
              stroke="url(#strokeGrad)"
              strokeWidth="5.5"
              strokeLinecap="round"
              strokeDasharray={chartPathLen}
              strokeDashoffset={chartDashOffset}
              style={{
                filter: 'drop-shadow(0 0 18px rgba(0, 245, 212, 0.65))',
              }}
            />

            {/* Glowing Data Nodes along the curve */}
            {[
              { cx: 520, cy: 182, delay: 62 },
              { cx: 1020, cy: 104, delay: 98 },
              { cx: 1490, cy: 26, delay: 136 },
            ].map((pt, i) => {
              const nodeP = spring({
                frame: Math.max(0, frame - pt.delay),
                fps,
                config: { mass: 1, damping: 14, stiffness: 120 },
              });
              return (
                <g
                  key={i}
                  style={{
                    opacity: clamp01(nodeP),
                    transform: `translate3d(${pt.cx}px, ${pt.cy}px, 0) scale(${nodeP})`,
                  }}
                >
                  <circle r="13" fill="rgba(0, 245, 212, 0.25)" />
                  <circle r="6.5" fill="#00F5D4" stroke="#FFFFFF" strokeWidth="2.5" />
                </g>
              );
            })}
          </svg>
        </div>

        {/* 3D Cursor Gliding over Dashboard */}
        <SmoothCursor3D
          x={cursorX}
          y={cursorY}
          scale={1}
          tiltDeg={-4}
          rippleProgress={peakRippleP}
          accentColor="#00F5D4"
          label="US$5,572 • +184.2% PEAK"
        />
      </div>
    </AbsoluteFill>
  );
};

// ============================================================================
// MAIN COMPOSITION: MattLouiSaaSDemo (720 frames @ 60fps, 1920x1080)
// ============================================================================
export const MattLouiSaaSDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Ambient floating background orbs (sub-pixel continuous float)
  const orb1X = Math.sin(frame * 0.018) * 95;
  const orb1Y = Math.cos(frame * 0.014) * 65;
  const orb2X = Math.cos(frame * 0.016) * -110;
  const orb2Y = Math.sin(frame * 0.02) * 75;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#050811',
        overflow: 'hidden',
      }}
    >
      {/* Ambient Deep SaaS Space Gradient & Grid */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(circle at 50% 42%, rgba(16, 28, 58, 0.72) 0%, rgba(5, 8, 17, 1) 78%)',
        }}
      />

      {/* Glowing Orbs */}
      <div
        style={{
          position: 'absolute',
          top: 80,
          left: 180,
          width: 680,
          height: 680,
          borderRadius: 9999,
          background: 'radial-gradient(circle, rgba(0, 245, 212, 0.13) 0%, transparent 70%)',
          filter: 'blur(40px)',
          transform: `translate3d(${orb1X}px, ${orb1Y}px, 0)`,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 40,
          right: 140,
          width: 760,
          height: 760,
          borderRadius: 9999,
          background: 'radial-gradient(circle, rgba(59, 110, 246, 0.16) 0%, transparent 70%)',
          filter: 'blur(48px)',
          transform: `translate3d(${orb2X}px, ${orb2Y}px, 0)`,
          pointerEvents: 'none',
        }}
      />

      {/* Subtle Perspective Reference Grid */}
      <AbsoluteFill
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(148, 163, 184, 0.045) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(148, 163, 184, 0.045) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
          opacity: 0.75,
          pointerEvents: 'none',
        }}
      />

      {/* Scene 1: Frames 0 - 240 */}
      {frame < 245 && <Scene1RecordIt frame={frame} fps={fps} />}

      {/* Scene 2: Frames 240 - 480 */}
      {frame >= 235 && frame < 485 && (
        <Scene2ScreenshotIt frame={frame - 240} fps={fps} />
      )}

      {/* Scene 3: Frames 480 - 720 */}
      {frame >= 475 && <Scene3ReferenceIt frame={frame - 480} fps={fps} />}

      {/* CapCut Optical Pass: Radial Vignette + Edge Chromatic Glow at 4 Outer Corners */}
      <AbsoluteFill
        style={{
          pointerEvents: 'none',
          zIndex: 200,
          background: `
            radial-gradient(circle at 50% 50%, transparent 58%, rgba(2, 4, 10, 0.64) 100%),
            radial-gradient(circle at 0% 0%, rgba(0, 245, 212, 0.12) 0%, transparent 28%),
            radial-gradient(circle at 100% 0%, rgba(59, 110, 246, 0.14) 0%, transparent 28%),
            radial-gradient(circle at 0% 100%, rgba(168, 85, 247, 0.12) 0%, transparent 28%),
            radial-gradient(circle at 100% 100%, rgba(0, 245, 212, 0.12) 0%, transparent 28%)
          `,
          boxShadow: 'inset 0 0 110px rgba(0, 0, 0, 0.75)',
        }}
      />

      {/* Anti-Banding Subtle Film Grain Pass (SVG feTurbulence) */}
      <svg
        width="1920"
        height="1080"
        viewBox="0 0 1920 1080"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 210,
          opacity: 0.032,
          mixBlendMode: 'overlay',
        }}
      >
        <filter id="antiBandingNoise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="3"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="1920" height="1080" filter="url(#antiBandingNoise)" />
      </svg>
    </AbsoluteFill>
  );
};
