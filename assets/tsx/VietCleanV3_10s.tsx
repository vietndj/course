import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Easing,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const EXPO_OUT = Easing.bezier(0.16, 1, 0.3, 1);
const WHIP_IN_OUT = Easing.bezier(0.68, 0, 0.22, 1);

const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));
const nfc = (s: string): string => s.normalize('NFC');

// ============================================================================
// TWEAKS SCHEMA (BẢNG BIẾN TÙY CHỈNH CHO KHUÔN THIẾT KẾ GỐC VIETCLEANV3_10S)
// Cho phép đổi toàn bộ câu chữ Tiếng Việt của 7 Cảnh, 9 mã màu chủ đạo
// và thông số nhịp chuyển động / âm thanh chỉ trong 3 giây mà không làm lệch
// dù chỉ 1 frame của chuỗi bàn giao liên cảnh (Clean Relay Choreography).
// ============================================================================
export interface VietCleanV3Props {
  // --- 1. Nội dung chữ Tiếng Việt của 7 Cảnh (Stages 1 -> 7) ---
  stage1Line1Words?: string[];
  stage1Line2Words?: string[];
  stage2Words?: Array<{ text: string; isHighlight?: boolean }>;
  stage3Line1Words?: string[];
  stage3Line2Words?: string[];
  stage4PillText?: string;
  stage5Line1Words?: string[];
  stage5Line2Words?: string[];
  stage6HeroWords?: string[];
  stage7aLine1Words?: string[];
  stage7aLine2Words?: string[];
  stage7bDrumItems?: string[];
  stage7bTargetIndex?: number;

  // --- 2. Bảng màu chủ đạo (Brand Color Palette) ---
  bgDark?: string;
  bgIvory?: string;
  accentGold?: string;
  accentYellow?: string;
  accentAmber?: string;
  accentCrimson?: string;
  accentRedStrike?: string;
  textIvory?: string;
  textInk?: string;

  // --- 3. Thông số nhịp chuyển động & Âm thanh (Motion & Audio Controls) ---
  audioSrc?: string;
  breathAmp?: number;
  motionBlurScale?: number;
}

export const defaultVietCleanV3Props: Required<VietCleanV3Props> = {
  // --- 1. Nội dung chữ Tiếng Việt của 7 Cảnh ---
  stage1Line1Words: ['Cái', 'mạng'],
  stage1Line2Words: ['xã', 'hội', 'cũ'],
  stage2Words: [
    { text: 'mà' },
    { text: 'mình' },
    { text: 'từng', isHighlight: true },
    { text: 'biết', isHighlight: true },
  ],
  stage3Line1Words: ['nó', 'đã'],
  stage3Line2Words: ['chết', 'rồi.'],
  stage4PillText: 'Bây giờ',
  stage5Line1Words: ['nó', 'là', 'cái'],
  stage5Line2Words: ['kỷ', 'nguyên', 'của'],
  stage6HeroWords: ['NGỮ', 'NGHĨA'],
  stage7aLine1Words: ['Bạn', 'không', 'cần'],
  stage7aLine2Words: ['thiết', 'phải', 'làm'],
  stage7bDrumItems: [
    'kịch sĩ câu view',
    'nhảy trend bề nổi',
    'chiêu trò phông bạt',
    'idol trên video',
    'diễn kịch sáo rỗng',
  ],
  stage7bTargetIndex: 3,

  // --- 2. Bảng màu chủ đạo ---
  bgDark: '#07080A',
  bgIvory: '#F7F4ED',
  accentGold: '#FACC15',
  accentYellow: '#FDE047',
  accentAmber: '#F59E0B',
  accentCrimson: '#E11D48',
  accentRedStrike: '#EF4444',
  textIvory: '#FAF8F5',
  textInk: '#090A0F',

  // --- 3. Thông số nhịp chuyển động & Âm thanh ---
  audioSrc: 'motion02/master_audio_10s_v3.wav',
  breathAmp: 0.006,
  motionBlurScale: 1.0,
};

// Minimalist 4-Point Star SVG (No text, pure geometry)
const FourPointStar: React.FC<{
  size?: number;
  color?: string;
  rotate?: number;
}> = ({ size = 44, color = '#FACC15', rotate = 0 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    style={{
      transform: `rotate(${rotate}deg)`,
      flexShrink: 0,
      filter: `drop-shadow(0 0 14px ${color})`,
    }}
  >
    <path
      d="M50 4 C54 34 66 46 96 50 C66 54 54 66 50 96 C46 66 34 54 4 50 C34 46 46 34 50 4 Z"
      fill={color}
    />
  </svg>
);

// Minimalist Cursor Arrow (No text label, pure vector from pin_02/pin_08)
const CleanCursorArrow: React.FC<{
  scale?: number;
  fillColor?: string;
  strokeColor?: string;
}> = ({ scale = 1, fillColor = '#FACC15', strokeColor = '#07080A' }) => (
  <svg
    width={44 * scale}
    height={44 * scale}
    viewBox="0 0 36 36"
    fill="none"
    style={{
      filter:
        'drop-shadow(0 8px 20px rgba(0,0,0,0.65)) drop-shadow(0 0 12px rgba(250,204,21,0.55))',
    }}
  >
    <path
      d="M6 4L30 15L18.5 19.2L14.2 31L6 4Z"
      fill={fillColor}
      stroke={strokeColor}
      strokeWidth="2.2"
      strokeLinejoin="round"
    />
  </svg>
);

// ============================================================================
// MAIN COMPOSITION: VietCleanV3_10s (600 frames @ 60fps, 1080x1920)
// 7 Distinct Clean Stages • Single Focal Point • 85% Negative Space • Zero HUD
// ============================================================================
export const VietCleanV3_10s: React.FC<VietCleanV3Props> = (props) => {
  const t: Required<VietCleanV3Props> = {
    ...defaultVietCleanV3Props,
    ...props,
  };
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Continuous subtle breathing scale so no frame is ever dead-static
  const breathScale = 1 + Math.sin(frame * 0.04) * t.breathAmp;

  // Directional SVG Motion Blur values for transitions
  // 1) Caret recoil blur (f88..f98)
  const caretRecoilBlurX =
    frame >= 88 && frame <= 98
      ? Math.sin(((frame - 88) / 10) * Math.PI) * 18 * t.motionBlurScale
      : 0;

  // 2) Whip-Pan blur from Scene 3 -> Scene 4 (f226..f238)
  const whip3to4BlurX =
    frame >= 226 && frame <= 238
      ? Math.sin(((frame - 226) / 12) * Math.PI) * 28 * t.motionBlurScale
      : 0;

  // 3) Upward exit blur Scene 5 -> Scene 6 (f314..f326) & Scene 6 -> Scene 7 (f422..f436)
  const verticalExitBlurY =
    frame >= 314 && frame <= 326
      ? Math.sin(((frame - 314) / 12) * Math.PI) * 18 * t.motionBlurScale
      : frame >= 422 && frame <= 436
      ? Math.sin(((frame - 422) / 14) * Math.PI) * 22 * t.motionBlurScale
      : 0;

  // 4) Oblique Drum Roll vertical blur in Scene 7b (f494..f514)
  const drumRollBlurY =
    frame >= 494 && frame < 514
      ? interpolate(frame, [494, 504, 514], [3, 14, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        }) * t.motionBlurScale
      : 0;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: t.bgDark,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Master 10s Voice-Safe Audio Track (V3 Clean Cues) */}
      <Audio src={staticFile(t.audioSrc)} />

      {/* True Velocity-Driven SVG Motion Blur Filters */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id="v3CaretBlur" x="-40%" y="-20%" width="180%" height="140%">
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation={`${caretRecoilBlurX.toFixed(1)} 0`}
            />
          </filter>
          <filter id="v3WhipBlurX" x="-40%" y="-20%" width="180%" height="140%">
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation={`${whip3to4BlurX.toFixed(1)} 0`}
            />
          </filter>
          <filter id="v3ExitBlurY" x="-20%" y="-40%" width="140%" height="180%">
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation={`0 ${verticalExitBlurY.toFixed(1)}`}
            />
          </filter>
          <filter id="v3DrumBlurY" x="-20%" y="-40%" width="140%" height="180%">
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation={`0 ${drumRollBlurY.toFixed(1)}`}
            />
          </filter>
        </defs>
      </svg>

      {/* ====================================================================
          STAGE 1 (f0 -> f88 | 0.00s - 1.47s): "Cái mạng / xã hội cũ"
          Pre-Cue: Minimalist 1.5px Figma Frame (f0..f16) -> fades out (f30..f46)
          Handoff (f74..f87): Caret sweeps left-to-right collapsing Stage 1 text
          ==================================================================== */}
      {frame < 88 && (() => {
        const boxExpandP = interpolate(frame, [2, 16], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: EXPO_OUT,
        });
        const boxW = interpolate(boxExpandP, [0, 1], [18, 760]);
        const boxH = interpolate(boxExpandP, [0, 1], [18, 280]);
        const frameFadeOut = interpolate(frame, [30, 46], [0.78, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

        // Reveal clip from left-to-right (f5..f20) and collapse wipe left-to-right (f74..f86)
        const revealRightInset = interpolate(frame, [5, 19], [100, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: EXPO_OUT,
        });
        const collapseLeftInset = interpolate(frame, [74, 86], [0, 100], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: WHIP_IN_OUT,
        });

        const line1Words = t.stage1Line1Words.map((w) => nfc(w));
        const line2Words = t.stage1Line2Words.map((w) => nfc(w));

        return (
          <div
            style={{
              position: 'relative',
              width: 1080,
              height: 1920,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              transform: `scale(${breathScale})`,
            }}
          >
            {/* Minimalist 1.5px Gold Selection Frame Pre-Cue (f0..f46) */}
            {frame < 47 && (
              <div
                style={{
                  position: 'absolute',
                  left: 540 - 380,
                  top: 960 - boxH / 2,
                  width: boxW,
                  height: boxH,
                  border: `1.5px solid ${t.accentGold}`,
                  opacity: frameFadeOut,
                  pointerEvents: 'none',
                }}
              >
                {[
                  { top: -5, left: -5 },
                  { top: -5, right: -5 },
                  { bottom: -5, left: -5 },
                  { bottom: -5, right: -5 },
                ].map((pos, idx) => (
                  <div
                    key={idx}
                    style={{
                      position: 'absolute',
                      ...pos,
                      width: 9,
                      height: 9,
                      backgroundColor: t.textIvory,
                      border: `1.5px solid ${t.accentGold}`,
                    }}
                  />
                ))}
              </div>
            )}

            {/* Free-standing Typography ("Cái mạng / xã hội cũ") */}
            <div
              style={{
                clipPath: `inset(-40px ${revealRightInset}% -40px ${collapseLeftInset}%)`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                padding: '24px 32px',
              }}
            >
              <div style={{ display: 'flex', gap: 22 }}>
                {line1Words.map((w, i) => {
                  const s = spring({
                    frame: Math.max(0, frame - (6 + i * 3)),
                    fps,
                    config: { mass: 0.7, damping: 13, stiffness: 185 },
                  });
                  return (
                    <span
                      key={i}
                      style={{
                        fontFamily: "'SVN-Aeonik', sans-serif",
                        fontSize: 84,
                        fontWeight: 800,
                        lineHeight: 1.24,
                        color: 'rgba(250, 248, 245, 0.88)',
                        letterSpacing: '-0.02em',
                        transform: `translateY(${22 * (1 - s)}px)`,
                      }}
                    >
                      {w}
                    </span>
                  );
                })}
              </div>
              <div style={{ display: 'flex', gap: 24 }}>
                {line2Words.map((w, i) => {
                  const s = spring({
                    frame: Math.max(0, frame - (11 + i * 3)),
                    fps,
                    config: { mass: 0.7, damping: 13, stiffness: 185 },
                  });
                  return (
                    <span
                      key={i}
                      style={{
                        fontFamily: "'SVN-Aeonik', sans-serif",
                        fontSize: 98,
                        fontWeight: 900,
                        lineHeight: 1.24,
                        color: t.textIvory,
                        letterSpacing: '-0.025em',
                        transform: `translateY(${24 * (1 - s)}px)`,
                      }}
                    >
                      {w}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ====================================================================
          SHARED CARET ACTOR + STAGE 2 (f74 -> f182 | 1.23s - 3.03s):
          - f74..f86: Caret sweeps left->right collapsing Stage 1
          - f88..f98: Caret recoils right->left with motion blur to seed Stage 2
          - f98..f132: Caret types out "mà mình từng biết"
          - f158..f170: Caret sweeps left painting Ivory Highlight Block #F7F4ED
          - f170..f182: Ivory Highlight Block expands full-screen into Stage 3 bg
          ==================================================================== */}
      {frame >= 74 && frame < 182 && (() => {
        // Caret X position across f74..f168
        const caretX =
          frame < 87
            ? interpolate(frame, [74, 86], [-360, 260], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
                easing: WHIP_IN_OUT,
              })
            : frame < 98
            ? interpolate(frame, [88, 98], [260, -370], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
                easing: EXPO_OUT,
              })
            : frame < 158
            ? interpolate(frame, [98, 130], [-370, 375], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
                easing: EXPO_OUT,
              })
            : interpolate(frame, [158, 169], [375, -390], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
                easing: WHIP_IN_OUT,
              });

        const revealStage2Pct = interpolate(frame, [98, 130], [100, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: EXPO_OUT,
        });

        // Ivory Highlight Block sweep (f158..f169) and full-screen iris expansion (f169..f180)
        const highlightSweepW = interpolate(frame, [158, 169], [0, 820], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: WHIP_IN_OUT,
        });
        const irisExpandP = interpolate(frame, [169, 180], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: EXPO_OUT,
        });
        const irisScale = interpolate(irisExpandP, [0, 1], [1, 22]);
        const textFadeOnIris = interpolate(frame, [168, 173], [1, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

        const words2 = t.stage2Words.map((item) => ({
          text: nfc(item.text),
          color: item.isHighlight ? t.accentYellow : t.textIvory,
        }));

        return (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {/* Expanding Ivory Highlight Block (#F7F4ED) -> becomes Stage 3 Background */}
            {frame >= 158 && (
              <div
                style={{
                  position: 'absolute',
                  left: 540 + 390 - highlightSweepW,
                  top: 960 - 72,
                  width: highlightSweepW,
                  height: 144,
                  borderRadius: interpolate(irisExpandP, [0, 1], [20, 0]),
                  backgroundColor: t.bgIvory,
                  transform: `scale(${irisScale})`,
                  transformOrigin: 'center center',
                  zIndex: 5,
                }}
              />
            )}

            {/* Stage 2 Text: "mà mình từng biết" (f96..f173) */}
            {frame >= 96 && frame < 174 && (
              <div
                style={{
                  position: 'relative',
                  zIndex: 10,
                  opacity: textFadeOnIris,
                  clipPath: `inset(-40px ${revealStage2Pct}% -40px -20px)`,
                  display: 'flex',
                  gap: 22,
                  alignItems: 'center',
                  padding: '20px 24px',
                }}
              >
                {words2.map((w, i) => {
                  const s = spring({
                    frame: Math.max(0, frame - (98 + i * 4.5)),
                    fps,
                    config: { mass: 0.65, damping: 13, stiffness: 195 },
                  });
                  const isCoveredByIvory =
                    frame >= 161 && 390 - highlightSweepW < (i - 1.5) * 180;
                  return (
                    <span
                      key={i}
                      style={{
                        fontFamily: "'SVN-Aeonik', sans-serif",
                        fontSize: 82,
                        fontWeight: 900,
                        lineHeight: 1.25,
                        color: isCoveredByIvory ? t.textInk : w.color,
                        letterSpacing: '-0.02em',
                        transform: `translateY(${18 * (1 - s)}px)`,
                      }}
                    >
                      {w.text}
                    </span>
                  );
                })}
              </div>
            )}

            {/* Single Glowing Caret Bar Actor (f74..f170) */}
            {frame < 170 && (
              <div
                style={{
                  position: 'absolute',
                  left: 540 + caretX,
                  top: 960 - 52,
                  width: 9,
                  height: 104,
                  borderRadius: 99,
                  backgroundColor: t.accentAmber,
                  boxShadow: '0 0 24px rgba(245, 158, 11, 0.85)',
                  filter:
                    caretRecoilBlurX > 0.5 ? 'url(#v3CaretBlur)' : undefined,
                  zIndex: 15,
                }}
              />
            )}
          </div>
        );
      })()}

      {/* ====================================================================
          STAGE 3 (f175 -> f238 | 2.92s - 3.97s): "nó đã / chết rồi."
          Stage: Warm Ivory Paper (#F7F4ED), 85% negative space
          Pre-Cue (f175..f186): 4 Crimson Asterisks ✱ ✱ ✱ ✱ standing free on Ivory
          Climax (f186..f225): Morphs into "nó đã / chết rồi." + Red Strike (f204)
          Handoff (f226..f238): Clean Spatial Whip-Pan left exposing dark Stage 4
          ==================================================================== */}
      {frame >= 175 && frame < 239 && (() => {
        const whipOutX = interpolate(frame, [226, 238], [0, -1260], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: WHIP_IN_OUT,
        });
        const strikeP = interpolate(frame, [204, 220], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: EXPO_OUT,
        });

        const s3Line1 = t.stage3Line1Words.map((w) => nfc(w));
        const s3Line2 = t.stage3Line2Words.map((w) => nfc(w));

        return (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 1080,
              height: 1920,
              backgroundColor: t.bgIvory,
              transform: `translate3d(${whipOutX}px, 0, 0)`,
              filter: whip3to4BlurX > 0.5 ? 'url(#v3WhipBlurX)' : undefined,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 20,
            }}
          >
            {/* Pre-Cue 3 (f175..f186): 4 Free-Standing Crimson Asterisks ✱ ✱ ✱ ✱ */}
            {frame < 186 && (
              <div style={{ display: 'flex', gap: 34, alignItems: 'center' }}>
                {[0, 1, 2, 3].map((i) => {
                  const astP = spring({
                    frame: Math.max(0, frame - (175 + i * 1.5)),
                    fps,
                    config: { mass: 0.6, damping: 11, stiffness: 220 },
                  });
                  return (
                    <span
                      key={i}
                      style={{
                        display: 'inline-block',
                        fontFamily: "'SVN-Aeonik', sans-serif",
                        fontSize: 96,
                        fontWeight: 900,
                        color: t.accentCrimson,
                        transform: `scale(${astP}) rotate(${(frame - 175) * 12}deg)`,
                      }}
                    >
                      ✱
                    </span>
                  );
                })}
              </div>
            )}

            {/* Main Typography 3 (f186+): "nó đã / chết rồi." */}
            {frame >= 186 && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  transform: `scale(${breathScale})`,
                }}
              >
                <div style={{ display: 'flex', gap: 22 }}>
                  {s3Line1.map((w, i) => {
                    const s = spring({
                      frame: Math.max(0, frame - (186 + i * 2.5)),
                      fps,
                      config: { mass: 0.7, damping: 12, stiffness: 205 },
                    });
                    return (
                      <span
                        key={i}
                        style={{
                          fontFamily: "'SVN-Aeonik', sans-serif",
                          fontSize: 78,
                          fontWeight: 800,
                          lineHeight: 1.2,
                          color: t.textInk,
                          letterSpacing: '-0.02em',
                          transform: `translateY(${24 * (1 - s)}px) scale(${0.8 + 0.2 * s})`,
                        }}
                      >
                        {w}
                      </span>
                    );
                  })}
                </div>

                <div
                  style={{
                    position: 'relative',
                    display: 'flex',
                    gap: 24,
                    padding: '4px 16px',
                  }}
                >
                  {s3Line2.map((w, i) => {
                    const s = spring({
                      frame: Math.max(0, frame - (190 + i * 2.5)),
                      fps,
                      config: { mass: 0.75, damping: 11, stiffness: 210 },
                    });
                    return (
                      <span
                        key={i}
                        style={{
                          fontFamily: "'SVN-Aeonik', sans-serif",
                          fontSize: 118,
                          fontWeight: 900,
                          lineHeight: 1.2,
                          color: strikeP > 0.6 ? '#52525B' : t.textInk,
                          letterSpacing: '-0.03em',
                          transform: `translateY(${28 * (1 - s)}px) scale(${0.78 + 0.22 * s})`,
                        }}
                      >
                        {w}
                      </span>
                    );
                  })}

                  {/* Clean Crimson Strike-Through Bar (f204+) */}
                  {frame >= 204 && (
                    <div
                      style={{
                        position: 'absolute',
                        left: 8,
                        top: '54%',
                        width: `${strikeP * 96}%`,
                        height: 14,
                        borderRadius: 999,
                        backgroundColor: t.accentCrimson,
                        transform: 'translateY(-50%) rotate(-1.5deg)',
                      }}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* ====================================================================
          STAGE 4 (f235 -> f280 | 3.92s - 4.67s): "✦ Bây giờ"
          Pre-Cue (f235..f242): Single Gold Cursor flies in from right & clicks
          Main (f241..f268): Single Minimalist Pill "✦ Bây giờ"
          Handoff (f268..f278): Pill dissolves leaving only the 4-Point Star ✦
          ==================================================================== */}
      {frame >= 235 && frame < 280 && (() => {
        const cursorInP = interpolate(frame, [235, 242], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: EXPO_OUT,
        });
        const cursorX = interpolate(cursorInP, [0, 1], [520, 125]);
        const cursorY = interpolate(cursorInP, [0, 1], [160, 48]);
        const cursorFadeOut = interpolate(frame, [264, 272], [1, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

        const pillPopP = spring({
          frame: Math.max(0, frame - 241),
          fps,
          config: { mass: 0.75, damping: 12, stiffness: 195 },
        });
        const pillDissolveP = interpolate(frame, [268, 276], [1, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: EXPO_OUT,
        });

        const rippleP = interpolate(frame, [241, 260], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: EXPO_OUT,
        });

        return (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {/* Subtle 1.5px Click Ripple */}
            {frame >= 241 && frame < 262 && (
              <div
                style={{
                  position: 'absolute',
                  width: 80 + rippleP * 380,
                  height: 80 + rippleP * 380,
                  borderRadius: 9999,
                  border: '1.5px solid rgba(250, 204, 21, 0.65)',
                  opacity: 1 - rippleP,
                }}
              />
            )}

            {/* Minimalist Pill: "✦ Bây giờ" */}
            {frame >= 241 && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 20,
                  padding: '22px 48px',
                  borderRadius: 999,
                  backgroundColor: `rgba(18, 20, 28, ${0.92 * pillDissolveP})`,
                  border: `2px solid rgba(250, 204, 21, ${0.78 * pillDissolveP})`,
                  boxShadow: `0 24px 60px rgba(0,0,0,${0.65 * pillDissolveP})`,
                  transform: `scale(${0.4 + 0.6 * pillPopP})`,
                }}
              >
                <FourPointStar
                  size={44}
                  color={t.accentGold}
                  rotate={(frame - 241) * 3}
                />
                <span
                  style={{
                    fontFamily: "'SVN-Aeonik', sans-serif",
                    fontSize: 70,
                    fontWeight: 800,
                    lineHeight: 1.2,
                    color: t.textIvory,
                    letterSpacing: '-0.02em',
                    opacity: pillDissolveP,
                  }}
                >
                  {nfc(t.stage4PillText)}
                </span>
              </div>
            )}

            {/* Single Clean Gold Cursor */}
            {frame < 273 && (
              <div
                style={{
                  position: 'absolute',
                  left: 540 + cursorX,
                  top: 960 + cursorY,
                  opacity: cursorFadeOut,
                  transform: `scale(${frame >= 241 && frame <= 245 ? 0.86 : 1})`,
                }}
              >
                <CleanCursorArrow
                  scale={1.15}
                  fillColor={t.accentGold}
                  strokeColor={t.bgDark}
                />
              </div>
            )}
          </div>
        );
      })()}

      {/* ====================================================================
          STAGE 5 (f272 -> f326 | 4.53s - 5.43s): "nó là cái / kỷ nguyên của"
          Pre-Cue (f272..f284): 4-Point Star + 3 Pure Geometric Shapes converge
          and vanish cleanly at f284 (0% overlap with text!)
          Main (f282..f314): Free-standing "nó là cái / kỷ nguyên của"
          Handoff (f314..f326): Clean upward exit with vertical motion blur
          ==================================================================== */}
      {frame >= 272 && frame < 326 && (() => {
        const geoConvergeP = interpolate(frame, [272, 282], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: EXPO_OUT,
        });
        const geoVanishP = interpolate(frame, [281, 285], [1, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

        const exitUpP = interpolate(frame, [314, 325], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: WHIP_IN_OUT,
        });
        const exitY = interpolate(exitUpP, [0, 1], [0, -480]);
        const exitOpacity = interpolate(frame, [316, 325], [1, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

        const s5Line1 = t.stage5Line1Words.map((w) => nfc(w));
        const s5Line2 = t.stage5Line2Words.map((w) => nfc(w));

        return (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {/* Pre-Cue 5 (f272..f285): Pure Geometric Shapes Converging (No labels!) */}
            {frame < 285 && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  opacity: geoVanishP,
                  transform: `scale(${1 - 0.35 * (1 - geoVanishP)})`,
                }}
              >
                <FourPointStar
                  size={48}
                  color={t.accentGold}
                  rotate={(frame - 241) * 4}
                />
                {/* Gold Circle */}
                <div
                  style={{
                    position: 'absolute',
                    transform: `translate(${interpolate(geoConvergeP, [0, 1], [-240, -48])}px, ${interpolate(geoConvergeP, [0, 1], [-180, -32])}px)`,
                    width: 24,
                    height: 24,
                    borderRadius: 999,
                    backgroundColor: t.accentGold,
                  }}
                />
                {/* Ivory Diamond */}
                <div
                  style={{
                    position: 'absolute',
                    transform: `translate(${interpolate(geoConvergeP, [0, 1], [240, 48])}px, ${interpolate(geoConvergeP, [0, 1], [-160, -32])}px) rotate(45deg)`,
                    width: 22,
                    height: 22,
                    backgroundColor: t.textIvory,
                  }}
                />
                {/* Warm Amber Ring */}
                <div
                  style={{
                    position: 'absolute',
                    transform: `translate(${interpolate(geoConvergeP, [0, 1], [0, 0])}px, ${interpolate(geoConvergeP, [0, 1], [220, 46])}px)`,
                    width: 26,
                    height: 26,
                    borderRadius: 999,
                    border: `4px solid ${t.accentAmber}`,
                  }}
                />
              </div>
            )}

            {/* Main Typography 5 (f282..f325): "nó là cái / kỷ nguyên của" */}
            {frame >= 282 && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 14,
                  transform: `translateY(${exitY}px) scale(${breathScale})`,
                  opacity: exitOpacity,
                  filter:
                    verticalExitBlurY > 0.5 ? 'url(#v3ExitBlurY)' : undefined,
                }}
              >
                <div style={{ display: 'flex', gap: 18 }}>
                  {s5Line1.map((w, i) => {
                    const s = spring({
                      frame: Math.max(0, frame - (282 + i * 2.5)),
                      fps,
                      config: { mass: 0.65, damping: 13, stiffness: 195 },
                    });
                    return (
                      <span
                        key={i}
                        style={{
                          fontFamily: "'SVN-Aeonik', sans-serif",
                          fontSize: 60,
                          fontWeight: 700,
                          lineHeight: 1.25,
                          color: 'rgba(250, 248, 245, 0.72)',
                          letterSpacing: '-0.015em',
                          transform: `translateY(${20 * (1 - s)}px)`,
                          opacity: clamp01(s * 1.4),
                        }}
                      >
                        {w}
                      </span>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', gap: 22 }}>
                  {s5Line2.map((w, i) => {
                    const s = spring({
                      frame: Math.max(0, frame - (290 + i * 3)),
                      fps,
                      config: { mass: 0.7, damping: 12, stiffness: 195 },
                    });
                    return (
                      <span
                        key={i}
                        style={{
                          fontFamily: "'SVN-Aeonik', sans-serif",
                          fontSize: 90,
                          fontWeight: 900,
                          lineHeight: 1.25,
                          color: t.textIvory,
                          letterSpacing: '-0.025em',
                          transform: `translateY(${24 * (1 - s)}px)`,
                          opacity: clamp01(s * 1.4),
                        }}
                      >
                        {w}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* ====================================================================
          STAGE 6 (f318 -> f438 | 5.30s - 7.30s): "NGỮ NGHĨA"
          Pre-Cue (f318..f329): Minimalist Bracket Split <  ✦  >
          Main (f327..f422): Hero Gold Typography "NGỮ NGHĨA" + Double Brush Underline
          Handoff (f422..f438): Vertical Whip-Slide upward pulling in Arrow →
          ==================================================================== */}
      {frame >= 318 && frame < 438 && (() => {
        const bracketSplitP = spring({
          frame: Math.max(0, frame - 318),
          fps,
          config: { mass: 0.75, damping: 13, stiffness: 180 },
        });
        const bracketOffset = interpolate(bracketSplitP, [0, 1], [38, 445]);
        const bracketFade = interpolate(frame, [336, 352], [0.85, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

        const brushP = interpolate(frame, [356, 394], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: EXPO_OUT,
        });

        const slideUpP = interpolate(frame, [422, 437], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: WHIP_IN_OUT,
        });
        const slideUpY = interpolate(slideUpP, [0, 1], [0, -980]);
        const slideOpacity = interpolate(frame, [426, 437], [1, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

        const s6Words = t.stage6HeroWords.map((w) => nfc(w));

        return (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              transform: `translateY(${slideUpY}px)`,
              opacity: slideOpacity,
              filter:
                verticalExitBlurY > 0.5 ? 'url(#v3ExitBlurY)' : undefined,
            }}
          >
            {/* Subtle warm radial glow behind NGỮ NGHĨA */}
            <div
              style={{
                position: 'absolute',
                width: 680,
                height: 680,
                borderRadius: 9999,
                background:
                  'radial-gradient(circle, rgba(250, 204, 21, 0.16) 0%, rgba(250, 204, 21, 0) 70%)',
                filter: 'blur(30px)',
              }}
            />

            {/* Pre-Cue 6 (f318..f352): Minimalist Gold Brackets <  ✦  > */}
            {frame < 352 && (
              <>
                <span
                  style={{
                    position: 'absolute',
                    fontFamily: "'SVN-Aeonik', sans-serif",
                    fontSize: 92,
                    fontWeight: 300,
                    color: t.accentGold,
                    transform: `translateX(${-bracketOffset}px)`,
                    opacity: bracketFade,
                  }}
                >
                  {'<'}
                </span>
                <span
                  style={{
                    position: 'absolute',
                    fontFamily: "'SVN-Aeonik', sans-serif",
                    fontSize: 92,
                    fontWeight: 300,
                    color: t.accentGold,
                    transform: `translateX(${bracketOffset}px)`,
                    opacity: bracketFade,
                  }}
                >
                  {'>'}
                </span>
                {frame < 328 && (
                  <FourPointStar
                    size={46}
                    color={t.accentYellow}
                    rotate={(frame - 318) * 9}
                  />
                )}
              </>
            )}

            {/* Hero Typography 6 (f327+): "NGỮ NGHĨA" + Double Brush Underline */}
            {frame >= 327 && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  transform: `scale(${breathScale})`,
                }}
              >
                <div style={{ display: 'flex', gap: 28 }}>
                  {s6Words.map((w, i) => {
                    const s = spring({
                      frame: Math.max(0, frame - (327 + i * 3)),
                      fps,
                      config: { mass: 0.8, damping: 11, stiffness: 195 },
                    });
                    return (
                      <span
                        key={i}
                        style={{
                          fontFamily: "'SVN-Aeonik', sans-serif",
                          fontSize: 116,
                          fontWeight: 900,
                          lineHeight: 1.22,
                          background: `linear-gradient(180deg, #FFFBEB 0%, ${t.accentYellow} 52%, ${t.accentAmber} 100%)`,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          letterSpacing: '-0.025em',
                          transform: `translateY(${28 * (1 - s)}px) scale(${0.82 + 0.18 * s})`,
                          filter: 'drop-shadow(0 16px 40px rgba(245, 158, 11, 0.28))',
                        }}
                      >
                        {w}
                      </span>
                    );
                  })}
                </div>

                {/* Hand-Drawn Double Gold Brush Underline (f356+) */}
                {frame >= 356 && (
                  <div style={{ position: 'relative', marginTop: 10 }}>
                    <svg width={700} height={42} viewBox="0 0 700 42">
                      <path
                        d="M 24 18 Q 350 4 676 16"
                        fill="none"
                        stroke={t.accentGold}
                        strokeWidth="6.5"
                        strokeLinecap="round"
                        strokeDasharray="660"
                        strokeDashoffset={660 * (1 - brushP)}
                      />
                      <path
                        d="M 80 32 Q 360 22 620 30"
                        fill="none"
                        stroke="rgba(253, 224, 71, 0.65)"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeDasharray="550"
                        strokeDashoffset={550 * (1 - brushP)}
                      />
                    </svg>
                    {brushP > 0.02 && brushP < 0.98 && (
                      <div
                        style={{
                          position: 'absolute',
                          left: 24 + brushP * 652 - 16,
                          top: -4,
                        }}
                      >
                        <FourPointStar
                          size={30}
                          color="#FEF08A"
                          rotate={frame * 6}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })()}

      {/* ====================================================================
          STAGE 7 (f432 -> f600 | 7.20s - 10.00s):
          - 7a (f432..f494): Arrow "→" slides in from bottom + "Bạn không cần / thiết phải làm"
          - 7b (f492..f600): Header recedes softly + pin_05 Frameless Oblique Drum Roll
            locks onto "→ idol trên video" at f514 + Red Strike-Through at f534
          ==================================================================== */}
      {frame >= 432 && (() => {
        const arrowEnterP = interpolate(frame, [432, 442], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: EXPO_OUT,
        });
        const arrowY = interpolate(arrowEnterP, [0, 1], [420, 0]);

        // At f492..f506, 7a text recedes upward into a subtle context line
        const headerRecedeP = interpolate(frame, [492, 506], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: EXPO_OUT,
        });

        // Frameless Oblique Drum Roll (f494..f514, inspired directly by pin_05)
        const drumSpinP = interpolate(frame, [494, 514], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: EXPO_OUT,
        });
        const lockSnapP = spring({
          frame: Math.max(0, frame - 514),
          fps,
          config: { mass: 0.75, damping: 12, stiffness: 205 },
        });
        const redStrikeP = interpolate(frame, [534, 554], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: EXPO_OUT,
        });

        const s7aLine1 = t.stage7aLine1Words.map((w) => nfc(w));
        const s7aLine2 = t.stage7aLine2Words.map((w) => nfc(w));
        const drumItems = t.stage7bDrumItems.map((item) => nfc(item));
        const targetIdx = t.stage7bTargetIndex;

        return (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              transform: `scale(${breathScale})`,
            }}
          >
            {/* 7A Typography: Full Center at f440..f492 -> Subtle Top Line at f492+ */}
            {frame >= 440 && (
              <div
                style={{
                  position: 'absolute',
                  left: 540,
                  top: 960 + interpolate(headerRecedeP, [0, 1], [0, -260]),
                  transform: `translate(-50%, -50%) scale(${interpolate(
                    headerRecedeP,
                    [0, 1],
                    [1, 0.54]
                  )})`,
                  opacity: interpolate(headerRecedeP, [0, 1], [1, 0.42]),
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: 8,
                  paddingLeft: interpolate(headerRecedeP, [0, 1], [90, 0]),
                }}
              >
                <div style={{ display: 'flex', gap: 20 }}>
                  {s7aLine1.map((w, i) => {
                    const s = spring({
                      frame: Math.max(0, frame - (440 + i * 2.5)),
                      fps,
                      config: { mass: 0.65, damping: 13, stiffness: 195 },
                    });
                    return (
                      <span
                        key={i}
                        style={{
                          fontFamily: "'SVN-Aeonik', sans-serif",
                          fontSize: 78,
                          fontWeight: 800,
                          lineHeight: 1.24,
                          color: 'rgba(250, 248, 245, 0.86)',
                          letterSpacing: '-0.02em',
                          transform: `translateY(${22 * (1 - s)}px)`,
                          opacity: clamp01(s * 1.4),
                        }}
                      >
                        {w}
                      </span>
                    );
                  })}
                </div>
                <div style={{ display: 'flex', gap: 20 }}>
                  {s7aLine2.map((w, i) => {
                    const s = spring({
                      frame: Math.max(0, frame - (448 + i * 2.5)),
                      fps,
                      config: { mass: 0.65, damping: 13, stiffness: 195 },
                    });
                    return (
                      <span
                        key={i}
                        style={{
                          fontFamily: "'SVN-Aeonik', sans-serif",
                          fontSize: 84,
                          fontWeight: 900,
                          lineHeight: 1.24,
                          color: t.textIvory,
                          letterSpacing: '-0.02em',
                          transform: `translateY(${22 * (1 - s)}px)`,
                          opacity: clamp01(s * 1.4),
                        }}
                      >
                        {w}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Anchor Arrow "→" on the left (turns into Crimson "✕" at f536+) */}
            <div
              style={{
                position: 'absolute',
                left: 118,
                top: 960,
                transform: `translateY(calc(-50% + ${arrowY}px))`,
                fontFamily: "'SVN-Aeonik', sans-serif",
                fontSize: 82,
                fontWeight: 900,
                color: redStrikeP > 0.3 ? t.accentRedStrike : t.accentGold,
              }}
            >
              {redStrikeP > 0.3 ? '✕' : '→'}
            </div>

            {/* 7B (f494+): Pin_05 Frameless Oblique Drum Roll -> Locks onto "idol trên video" */}
            {frame >= 494 && (
              <div
                style={{
                  position: 'absolute',
                  left: 230,
                  top: 960,
                  width: 760,
                  height: 360,
                  transform: `translateY(-50%) rotate(${interpolate(
                    drumSpinP,
                    [0, 1],
                    [-6, 0]
                  )}deg)`,
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 26,
                    filter:
                      drumRollBlurY > 0.4 ? 'url(#v3DrumBlurY)' : undefined,
                    transform: `translateY(${interpolate(
                      drumSpinP,
                      [0, 1],
                      [236, -118]
                    )}px)`,
                  }}
                >
                  {drumItems.map((item, idx) => {
                    const isTarget = idx === targetIdx;
                    const isLocked = frame >= 514 && isTarget;
                    const dist = Math.abs(idx - targetIdx);
                    const nonTargetOpacity =
                      frame >= 514 ? (dist === 1 ? 0.14 : 0.05) : 0.28;

                    return (
                      <div
                        key={idx}
                        style={{
                          position: 'relative',
                          height: 92,
                          display: 'flex',
                          alignItems: 'center',
                          transform: isLocked
                            ? `scale(${0.92 + 0.08 * lockSnapP})`
                            : undefined,
                          transformOrigin: 'left center',
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "'SVN-Aeonik', sans-serif",
                            fontSize: isTarget ? 86 : 56,
                            fontWeight: isTarget ? 900 : 700,
                            lineHeight: 1.2,
                            color: isLocked
                              ? redStrikeP > 0.5
                                ? '#71717A'
                                : t.textIvory
                              : t.textIvory,
                            opacity: isTarget ? 1 : nonTargetOpacity,
                            letterSpacing: '-0.025em',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {item}
                        </span>

                        {/* Crimson Strike-Through Bar across "idol trên video" (f534+) */}
                        {isLocked && frame >= 534 && (
                          <div
                            style={{
                              position: 'absolute',
                              left: -8,
                              top: '54%',
                              width: `${redStrikeP * 103}%`,
                              height: 12,
                              borderRadius: 999,
                              backgroundColor: t.accentRedStrike,
                              boxShadow: '0 0 24px rgba(239, 68, 68, 0.55)',
                              transform: 'translateY(-50%) rotate(-1.2deg)',
                            }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })()}
    </AbsoluteFill>
  );
};
