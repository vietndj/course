import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Easing,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const EXPO_OUT = Easing.bezier(0.16, 1, 0.3, 1);
const MECHANICAL_SNAP = Easing.bezier(0.65, 0, 0.15, 1);
const WHIP_UP = Easing.bezier(0.55, 0, 0.1, 1);

const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));
const nfc = (s: string): string => s.normalize('NFC');

// ============================================================================
// TWEAKS SCHEMA — KHUÔN #4: VIET MASTERCLASS POWER 10S (60FPS)
// Dựa trên phân tích giải phẫu 1:1 mẫu Instagram MasterClass (Dd_-1kWsir7 -
// Prof. Jeffrey Pfeffer "Win The Game of Power"):
// 1. Bảng màu Brutalist 3 sắc độ: Acid Chartreuse (#E0EE70), Pitch Black (#060606),
//    MasterClass Crimson (#C8232C).
// 2. Hệ chữ Dual-Hierarchy: Lead-in Sans-Serif mảnh (SVN-Aeonik Medium) +
//    Hero Impact Ultra-Condensed Heavy (GT-America Black scaleX 0.78).
// 3. 6 Cơ chế Motion Text đặc trưng:
//    - Stage 1A (f0-f48): Talking Head + Acid-Lime Split Lower-Third Wipe
//    - Stage 1B (f48-f88): Strategic Chessboard Perimeter + Step-Move Kings
//    - Stage 2A (f88-f168): Type-Slide -> Self-Scaling Pre-Cue + Hero Rise
//    - Stage 2B (f168-f238): Vertical Whip-Pan Blur -> Crimson Word Highlight
//    - Stage 3 (f238-f326): Diagonal Staircase Wipe & Split-Color Masked Reveal
//    - Stage 4 (f326-f438): Rising Black Monolith Pedestal Push
//    - Stage 5 (f438-f494): Talking Head Intercut (Human Trust Beat)
//    - Stage 6 (f494-f600): Vertical Slot-Machine Drum Roll (BOLDER -> MOVES)
// ============================================================================
export interface MasterClassPowerProps {
  // --- 1. Nội dung chữ Tiếng Việt theo từng cơ chế ---
  speakerName?: string;
  speakerTitle?: string;
  chessLead?: string;
  chessHero?: string;

  stage2aPart1?: string;
  stage2aPart2?: string;
  stage2aHero?: string;

  stage2bLead?: string;
  stage2bLine1Left?: string;
  stage2bLine1Crimson?: string;
  stage2bLine2?: string;

  stage3LeftText?: string;
  stage3RightText?: string;

  stage4Lead?: string;
  stage4Hero?: string;

  stage6Lead?: string;
  stage6RollWord1?: string;
  stage6RollWord2?: string;

  // --- 2. Bảng màu MasterClass Acid-Lime Brutalist ---
  acidLime?: string;
  pitchBlack?: string;
  crimsonRed?: string;
  pureWhite?: string;

  // --- 3. Điều khiển Media & Quang học ---
  videoSrc?: string;
  audioSrc?: string;
  showSubtitlesOnTalkingHead?: boolean;
}

export const defaultMasterClassPowerProps: Required<MasterClassPowerProps> = {
  speakerName: 'NGUYỄN VIỆT • FEDU',
  speakerTitle: 'CHIẾN LƯỢC NỘI DUNG & AI THỰC CHIẾN',
  chessLead: 'MẠNG XÃ HỘI',
  chessHero: 'THỜI KỲ CŨ',

  stage2aPart1: 'MÀ MÌNH',
  stage2aPart2: 'TỪNG',
  stage2aHero: 'BIẾT ĐẾN',

  stage2bLead: 'SỰ THẬT LÀ',
  stage2bLine1Left: 'NÓ ĐÃ',
  stage2bLine1Crimson: 'CHẾT',
  stage2bLine2: 'THẬT RỒI.',

  stage3LeftText: 'BÂY GIỜ LÀ',
  stage3RightText: 'KỶ NGUYÊN',

  stage4Lead: 'SỨC MẠNH CỦA',
  stage4Hero: 'NGỮ NGHĨA',

  stage6Lead: 'KHÔNG CẦN LÀM',
  stage6RollWord1: 'IDOL ẢO',
  stage6RollWord2: 'THỢ DIỄN',

  acidLime: '#E0EE70',
  pitchBlack: '#060606',
  crimsonRed: '#C8232C',
  pureWhite: '#FFFFFF',

  videoSrc: 'motion02/qc_offline_27s_1080p60.mp4',
  audioSrc: 'motion02/master_audio_10s_v3.wav',
  showSubtitlesOnTalkingHead: true,
};

// ============================================================================
// HELPER COMPONENTS: CHESS KING SVG & ULTRA-CONDENSED TEXT
// ============================================================================
const ChessKingIcon: React.FC<{
  fill: string;
  stroke: string;
  size?: number;
}> = ({ fill, stroke, size = 136 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
    <rect x="46" y="6" width="8" height="20" fill={fill} stroke={stroke} strokeWidth="3.5" />
    <rect x="39" y="11" width="22" height="7" fill={fill} stroke={stroke} strokeWidth="3.5" />
    <path
      d="M32 32 C32 24, 68 24, 68 32 L63 42 L37 42 Z"
      fill={fill}
      stroke={stroke}
      strokeWidth="3.5"
      strokeLinejoin="round"
    />
    <rect x="33" y="42" width="34" height="7" rx="3" fill={fill} stroke={stroke} strokeWidth="3.5" />
    <path
      d="M38 49 L32 76 L68 76 L62 49 Z"
      fill={fill}
      stroke={stroke}
      strokeWidth="3.5"
      strokeLinejoin="round"
    />
    <rect x="25" y="76" width="50" height="7" rx="3" fill={fill} stroke={stroke} strokeWidth="3.5" />
    <rect x="19" y="85" width="62" height="9" rx="3" fill={fill} stroke={stroke} strokeWidth="3.5" />
  </svg>
);

const CondensedHeroText: React.FC<{
  text: string;
  fontSize?: number;
  color?: string;
  scaleX?: number;
  letterSpacing?: string;
  lineHeight?: number;
  origin?: 'center' | 'left' | 'right';
}> = ({
  text,
  fontSize = 164,
  color = '#060606',
  scaleX = 0.78,
  letterSpacing = '-0.03em',
  lineHeight = 1.18,
  origin = 'center',
}) => (
  <div
    style={{
      fontFamily: "'GT-America', 'SVN-Aeonik', sans-serif",
      fontSize,
      fontWeight: 900,
      color,
      textTransform: 'uppercase',
      letterSpacing,
      lineHeight,
      whiteSpace: 'nowrap',
      transform: `scaleX(${scaleX})`,
      transformOrigin: `${origin} center`,
      paddingTop: '0.14em',
      paddingBottom: '0.08em',
      userSelect: 'none',
    }}
  >
    {nfc(text)}
  </div>
);

const LeadText: React.FC<{
  text: string;
  fontSize?: number;
  color?: string;
}> = ({ text, fontSize = 46, color = '#060606' }) => (
  <div
    style={{
      fontFamily: "'SVN-Aeonik', sans-serif",
      fontSize,
      fontWeight: 500,
      color,
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
      lineHeight: 1.25,
      whiteSpace: 'nowrap',
      paddingTop: '0.1em',
      paddingBottom: '0.06em',
      userSelect: 'none',
    }}
  >
    {nfc(text)}
  </div>
);

// ============================================================================
// MAIN COMPOSITION: VIET MASTERCLASS POWER 10S (60FPS)
// ============================================================================
export const VietMasterClassPower10s: React.FC<MasterClassPowerProps> = (rawProps) => {
  const props = { ...defaultMasterClassPowerProps, ...rawProps };
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const { acidLime, pitchBlack, crimsonRed, pureWhite } = props;

  // Continuous optical camera breath
  const cameraBreath = 1 + 0.005 * Math.sin(frame / 26);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: pitchBlack,
        overflow: 'hidden',
      }}
    >
      {/* Master 10s Voice-Safe Audio */}
      <Audio src={staticFile(props.audioSrc)} />

      {/* ====================================================================
          STAGE 1A (f0 -> f48 | 0.00s - 0.80s):
          Full-Screen Clean Talking Head + MasterClass Acid-Lime Split Lower-Third
          (Ref: 00:10.05s - "PROFESSOR JEFFREY PFEFFER / STANFORD UNIVERSITY")
          ==================================================================== */}
      {frame < 48 && (() => {
        const barWipe = interpolate(frame, [4, 20], [100, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: EXPO_OUT,
        });
        const subSlideY = interpolate(frame, [12, 28], [-110, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: EXPO_OUT,
        });
        const punchScale = interpolate(frame, [0, 48], [1.22, 1.27]);

        return (
          <AbsoluteFill>
            <Sequence from={0} durationInFrames={48} layout="none">
              <OffthreadVideo
                src={staticFile(props.videoSrc)}
                startFrom={595}
                muted
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: '50% 18%',
                  transform: `scale(${punchScale})`,
                  transformOrigin: '50% 22%',
                  filter: 'contrast(1.1) saturate(0.95) brightness(0.96)',
                }}
              />
            </Sequence>

            {/* Cinematic Bottom Gradient Vignette (Blends seamlessly with black blazer) */}
            <AbsoluteFill
              style={{
                background:
                  'linear-gradient(180deg, rgba(6,6,6,0) 48%, rgba(6,6,6,0.92) 76%, #060606 86%)',
              }}
            />

            {/* MasterClass Acid-Lime Lower-Third at Y = 1320px */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 1320,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 14,
              }}
            >
              {/* Acid-Lime Highlight Box with Masked Horizontal Wipe */}
              <div
                style={{
                  backgroundColor: acidLime,
                  padding: '10px 38px 8px 38px',
                  clipPath: `inset(0 ${barWipe}% 0 0)`,
                  boxShadow: '0 10px 28px rgba(0,0,0,0.42)',
                }}
              >
                <div
                  style={{
                    fontFamily: "'GT-America', 'SVN-Aeonik', sans-serif",
                    fontSize: 54,
                    fontWeight: 900,
                    color: pitchBlack,
                    textTransform: 'uppercase',
                    letterSpacing: '-0.02em',
                    transform: 'scaleX(0.82)',
                    whiteSpace: 'nowrap',
                    lineHeight: 1.18,
                  }}
                >
                  {nfc(props.speakerName)}
                </div>
              </div>

              {/* Secondary White Credential Line Sliding Down from Mask */}
              <div style={{ overflow: 'hidden', padding: '4px 16px' }}>
                <div
                  style={{
                    transform: `translateY(${subSlideY}%)`,
                    fontFamily: "'SVN-Aeonik', sans-serif",
                    fontSize: 30,
                    fontWeight: 600,
                    color: pureWhite,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    textShadow: '0 2px 10px rgba(0,0,0,0.85)',
                  }}
                >
                  {nfc(props.speakerTitle)}
                </div>
              </div>
            </div>

            {/* Clean MasterClass Bottom Subtitle */}
            {props.showSubtitlesOnTalkingHead && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 130,
                  left: 80,
                  right: 80,
                  textAlign: 'center',
                  fontFamily: "'SVN-Aeonik', sans-serif",
                  fontSize: 38,
                  fontWeight: 700,
                  color: pureWhite,
                  textShadow: '0 3px 12px rgba(0,0,0,0.9)',
                }}
              >
                {nfc('Cái mạng xã hội cũ...')}
              </div>
            )}
          </AbsoluteFill>
        );
      })()}

      {/* ====================================================================
          STAGE 1B (f48 -> f88 | 0.80s - 1.47s):
          Strategic Chessboard Perimeter + Step-Move Kings ("MẠNG XÃ HỘI / THỜI KỲ CŨ")
          (Ref: 00:07.16s - 00:09.57s "WIN THE GAME OF POWER")
          ==================================================================== */}
      {frame >= 48 && frame < 88 && (() => {
        const localF = frame - 48;
        const popS = spring({
          frame: localF,
          fps,
          config: { mass: 0.65, damping: 14, stiffness: 240 },
        });
        // Discrete mechanical chess step at localF >= 18 (just like f195 -> f206 in ref)
        const stepMoved = localF >= 18;

        const tileW = 270;
        const tileH = 274;

        // White King steps from (col 1, row 0) to (col 0, row 1)
        const whiteKingCol = stepMoved ? 0 : 1;
        const whiteKingRow = stepMoved ? 1 : 0;

        // Black King steps from (col 2, row 5) to (col 1, row 4)
        const blackKingCol = stepMoved ? 1 : 2;
        const blackKingRow = stepMoved ? 4 : 5;

        return (
          <AbsoluteFill style={{ backgroundColor: acidLime }}>
            {/* Top & Bottom Strategic Chessboard Tiles (leaving central cross open) */}
            {[0, 1, 2, 3, 4, 5, 6].map((r) =>
              [0, 1, 2, 3].map((c) => {
                const isCenterClear =
                  r === 2 ||
                  r === 3 ||
                  (r === 1 && (c === 1 || c === 2)) ||
                  (r === 4 && (c === 1 || c === 2));
                if (isCenterClear) return null;

                const isBlackTile = (r + c) % 2 === 1;
                if (!isBlackTile) return null;

                return (
                  <div
                    key={`${r}-${c}`}
                    style={{
                      position: 'absolute',
                      left: c * tileW,
                      top: r * tileH,
                      width: tileW,
                      height: tileH,
                      backgroundColor: pitchBlack,
                    }}
                  />
                );
              })
            )}

            {/* White King (Top Strategic Piece) */}
            <div
              style={{
                position: 'absolute',
                left: whiteKingCol * tileW + (tileW - 140) / 2,
                top: whiteKingRow * tileH + (tileH - 140) / 2,
              }}
            >
              <ChessKingIcon fill={pureWhite} stroke={pitchBlack} size={140} />
            </div>

            {/* Black King (Bottom Strategic Piece) */}
            <div
              style={{
                position: 'absolute',
                left: blackKingCol * tileW + (tileW - 140) / 2,
                top: blackKingRow * tileH + (tileH - 140) / 2,
              }}
            >
              <ChessKingIcon fill={pitchBlack} stroke={acidLime} size={140} />
            </div>

            {/* Center Focal Typography: "MẠNG XÃ HỘI / THỜI KỲ CŨ" */}
            <AbsoluteFill
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                transform: `scale(${interpolate(popS, [0, 1], [0.9, 1]) * cameraBreath})`,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 0,
                }}
              >
                <LeadText text={props.chessLead} fontSize={46} color={pitchBlack} />
                <div style={{ marginTop: -12 }}>
                  <CondensedHeroText
                    text={props.chessHero}
                    fontSize={146}
                    color={pitchBlack}
                    scaleX={0.78}
                  />
                </div>
              </div>
            </AbsoluteFill>
          </AbsoluteFill>
        );
      })()}

      {/* ====================================================================
          STAGE 2 (f88 -> f238 | 1.47s - 3.97s):
          2A (f88->f168): Type-Slide -> Self-Scaling Pre-Cue + Hero Rise
             ("MÀ MÌNH" + "TỪNG" -> shrinks up -> "BIẾT ĐẾN" slams up)
          2B (f168->f238): Vertical Whip-Pan Blur -> Masked Stack + Crimson Word
             ("SỰ THẬT LÀ / NÓ ĐÃ CHẾT / THẬT RỒI.")
          (Ref: 00:14.59s - 00:17.50s "HOW TO GAIN INFLUENCE -> WITH STANFORD'S ICONIC PROFESSOR")
          ==================================================================== */}
      {frame >= 88 && frame < 238 && (() => {
        const localF = frame - 88;

        // --- Phase 2A Timings (localF: 0 -> 80 | f88 -> f168) ---
        const word2SlideY = interpolate(localF, [4, 18], [115, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: EXPO_OUT,
        });

        // At localF 22 -> 40, "MÀ MÌNH TỪNG" shrinks from 1.58 -> 1.0 and moves up
        const shrinkProgress = interpolate(localF, [22, 40], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: MECHANICAL_SNAP,
        });
        const leadScale = interpolate(shrinkProgress, [0, 1], [1.58, 1.0]);
        const leadY = interpolate(shrinkProgress, [0, 1], [0, -108]);

        const heroRiseY = interpolate(localF, [24, 42], [115, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: EXPO_OUT,
        });

        // --- Phase 2B Whip-Pan Transition (localF: 78 -> 92 | f166 -> f180) ---
        const whipP = interpolate(localF, [78, 92], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: WHIP_UP,
        });
        const group2AY = interpolate(whipP, [0, 1], [0, -1150]);
        const whipBlurY = Math.sin(whipP * Math.PI) * 34;

        // Incoming 2B Group ("SỰ THẬT LÀ / NÓ ĐÃ CHẾT / THẬT RỒI.")
        const lead2BY = interpolate(whipP, [0, 1], [950, 0]);
        const line1RevealY = interpolate(localF, [90, 106], [115, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: EXPO_OUT,
        });
        const line2RevealY = interpolate(localF, [102, 118], [115, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: EXPO_OUT,
        });

        const block2BShiftY =
          interpolate(localF, [90, 106], [70, 10], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: EXPO_OUT,
          }) +
          interpolate(localF, [102, 118], [0, -45], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: EXPO_OUT,
          });

        return (
          <AbsoluteFill
            style={{
              backgroundColor: acidLime,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {/* SVG Directional Vertical Motion Blur Filter */}
            <svg width="0" height="0" style={{ position: 'absolute' }}>
              <filter id="mc-whip-blur" x="-20%" y="-60%" width="140%" height="220%">
                <feGaussianBlur in="SourceGraphic" stdDeviation={`0,${whipBlurY.toFixed(2)}`} />
              </filter>
            </svg>

            {/* GROUP 2A: "MÀ MÌNH TỪNG" -> "BIẾT ĐẾN" */}
            {localF < 92 && (
              <div
                style={{
                  position: 'absolute',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: `translateY(${group2AY}px) scale(${cameraBreath})`,
                  filter: whipBlurY > 1 ? 'url(#mc-whip-blur)' : 'none',
                }}
              >
                {/* Self-Scaling Lead Line: "MÀ MÌNH" + masked "TỪNG" (Perfectly Center-Aligned) */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 16,
                    transform: `translateY(${leadY}px) scale(${leadScale})`,
                    transformOrigin: 'center center',
                  }}
                >
                  <LeadText text={props.stage2aPart1} fontSize={48} color={pitchBlack} />
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ transform: `translateY(${word2SlideY}%)` }}>
                      <LeadText text={props.stage2aPart2} fontSize={48} color={pitchBlack} />
                    </div>
                  </div>
                </div>

                {/* Massive Condensed Hero Word: "BIẾT ĐẾN" */}
                {localF >= 22 && (
                  <div
                    style={{
                      overflow: 'hidden',
                      marginTop: -42,
                      paddingTop: '0.16em',
                      paddingBottom: '0.08em',
                      paddingLeft: 24,
                      paddingRight: 24,
                    }}
                  >
                    <div style={{ transform: `translateY(${heroRiseY}%)` }}>
                      <CondensedHeroText
                        text={props.stage2aHero}
                        fontSize={192}
                        color={pitchBlack}
                        scaleX={0.78}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* GROUP 2B: "SỰ THẬT LÀ" -> "NÓ ĐÃ [CHẾT (Crimson)]" -> "THẬT RỒI." */}
            {localF >= 78 && (
              <div
                style={{
                  position: 'absolute',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  transform: `translateY(${lead2BY + block2BShiftY}px) scale(${cameraBreath})`,
                  filter: whipBlurY > 1 ? 'url(#mc-whip-blur)' : 'none',
                }}
              >
                <LeadText text={props.stage2bLead} fontSize={44} color={pitchBlack} />

                {/* Line 1: "NÓ ĐÃ" (Black) + "CHẾT" (Crimson Red #C8232C) */}
                <div
                  style={{
                    overflow: 'hidden',
                    paddingTop: '0.14em',
                    paddingBottom: '0.06em',
                    paddingLeft: 24,
                    paddingRight: 24,
                    marginTop: -6,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 28,
                      transform: `translateY(${line1RevealY}%)`,
                    }}
                  >
                    <CondensedHeroText
                      text={props.stage2bLine1Left}
                      fontSize={142}
                      color={pitchBlack}
                      scaleX={0.78}
                      origin="right"
                    />
                    <CondensedHeroText
                      text={props.stage2bLine1Crimson}
                      fontSize={142}
                      color={crimsonRed}
                      scaleX={0.78}
                      origin="left"
                    />
                  </div>
                </div>

                {/* Line 2: "THẬT RỒI." (Black) */}
                <div
                  style={{
                    overflow: 'hidden',
                    paddingTop: '0.14em',
                    paddingBottom: '0.08em',
                    paddingLeft: 24,
                    paddingRight: 24,
                    marginTop: -28,
                  }}
                >
                  <div style={{ transform: `translateY(${line2RevealY}%)` }}>
                    <CondensedHeroText
                      text={props.stage2bLine2}
                      fontSize={142}
                      color={pitchBlack}
                      scaleX={0.78}
                    />
                  </div>
                </div>
              </div>
            )}
          </AbsoluteFill>
        );
      })()}

      {/* ====================================================================
          STAGE 3 (f238 -> f326 | 3.97s - 5.43s):
          Diagonal Staircase Wipe & Split-Color Masked Reveal
          ("BÂY GIỜ LÀ" [Black on Acid-Lime] | "KỶ NGUYÊN" [Acid-Lime on Black])
          (Ref: 00:21.59s - 00:23.50s "SEIZE THE PROMOTION")
          ==================================================================== */}
      {frame >= 238 && frame < 326 && (() => {
        const localF = frame - 238;

        // Staircase wipes diagonally from top-left (-1150px) to locked position (0px)
        const stairSlide = interpolate(localF, [4, 28], [-1150, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: EXPO_OUT,
        });

        // At locked position (stairSlide = 0), the center vertical riser wall is at X = 530
        // across Y = 820 -> 1100.
        // Before the staircase reaches center, "BÂY GIỜ LÀ" starts slightly near center
        // then shifts left to anchor cleanly at rightEdge = 508 (on the Acid-Lime step),
        // while "KỶ NGUYÊN" slides out from behind X = 530 (at leftEdge = 552) onto the Black step!
        const splitShift = interpolate(localF, [14, 34], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: MECHANICAL_SNAP,
        });

        const leftTextShiftX = interpolate(splitShift, [0, 1], [190, 0]);
        const rightTextSlideX = interpolate(localF, [20, 42], [-105, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: EXPO_OUT,
        });

        // 5-Step Staircase Polygon in Acid-Lime with Center Vertical Riser at X = 530 (Y: 820 -> 1100)
        const stairPath =
          'M -1200 -1200 L 1080 -1200 L 1080 420 L 900 420 L 900 620 L 720 620 L 720 820 L 530 820 L 530 1100 L 350 1100 L 350 1300 L 170 1300 L 170 1500 L 0 1500 L -1200 1500 Z';

        return (
          <AbsoluteFill style={{ backgroundColor: pitchBlack }}>
            {/* Base Layer (On Pitch Black):
                1) "BÂY GIỜ LÀ" in Acid-Lime (visible before the Acid-Lime staircase covers it)
                2) "KỶ NGUYÊN" in Acid-Lime emerging cleanly to the right of X = 530 */}
            <AbsoluteFill>
              {/* Left Text in Acid-Lime (for the dark region before staircase wipes over) */}
              <div
                style={{
                  position: 'absolute',
                  top: 885,
                  right: 1080 - 506 - leftTextShiftX,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <CondensedHeroText
                  text={props.stage3LeftText}
                  fontSize={110}
                  color={acidLime}
                  scaleX={0.78}
                  origin="right"
                />
              </div>

              {/* Right Text ("KỶ NGUYÊN") Masked at X = 530 Riser Wall */}
              <div
                style={{
                  position: 'absolute',
                  top: 885,
                  left: 552,
                  overflow: 'hidden',
                  paddingTop: '0.14em',
                  paddingBottom: '0.08em',
                  paddingRight: 24,
                }}
              >
                <div style={{ transform: `translateX(${rightTextSlideX}%)` }}>
                  <CondensedHeroText
                    text={props.stage3RightText}
                    fontSize={110}
                    color={acidLime}
                    scaleX={0.78}
                    origin="left"
                  />
                </div>
              </div>
            </AbsoluteFill>

            {/* Top Layer: Acid-Lime Staircase Polygon + Clipped Black Left Text */}
            <svg
              width="1080"
              height="1920"
              viewBox="0 0 1080 1920"
              style={{ position: 'absolute', inset: 0 }}
            >
              <defs>
                <clipPath id="stair-clip">
                  <path
                    d={stairPath}
                    transform={`translate(${stairSlide}, ${stairSlide})`}
                  />
                </clipPath>
              </defs>

              <path
                d={stairPath}
                fill={acidLime}
                transform={`translate(${stairSlide}, ${stairSlide})`}
              />
            </svg>

            {/* Black Left Text ("BÂY GIỜ LÀ") Clipped Inside the Acid-Lime Staircase */}
            <AbsoluteFill style={{ clipPath: 'url(#stair-clip)' }}>
              <div
                style={{
                  position: 'absolute',
                  top: 885,
                  right: 1080 - 506 - leftTextShiftX,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <CondensedHeroText
                  text={props.stage3LeftText}
                  fontSize={110}
                  color={pitchBlack}
                  scaleX={0.78}
                  origin="right"
                />
              </div>
            </AbsoluteFill>
          </AbsoluteFill>
        );
      })()}

      {/* ====================================================================
          STAGE 4 (f326 -> f438 | 5.43s - 7.30s):
          Rising Black Monolith Pedestal Push ("SỨC MẠNH CỦA / NGỮ NGHĨA")
          (Ref: 00:45.44s - 00:46.80s "ACT WITH AUTHORITY")
          ==================================================================== */}
      {frame >= 326 && frame < 438 && (() => {
        const localF = frame - 326;

        // 1. Lead text "SỨC MẠNH CỦA" appears at center (localF 0 -> 8)
        const leadOp = interpolate(localF, [0, 8], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

        // 2. Hero word "NGỮ NGHĨA" slides up from mask right below lead (localF 10 -> 26)
        const heroRevealY = interpolate(localF, [10, 26], [115, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: EXPO_OUT,
        });

        // 3. Giant Black Monolith Pedestal rises from bottom (localF 24 -> 66)
        // touching the bottom of "NGỮ NGHĨA" and pushing the entire block upward!
        const pedestalProgress = interpolate(localF, [24, 66], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: EXPO_OUT,
        });

        const pedestalHeight = interpolate(pedestalProgress, [0, 1], [0, 1140]);
        // Text sits at center initially (translateY = 60px), then gets pushed directly on top of the 1140px pedestal!
        const textPushY = interpolate(pedestalProgress, [0, 1], [40, -315]);

        return (
          <AbsoluteFill
            style={{
              backgroundColor: acidLime,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {/* Typography Block Pushed Upward by the Rising Pedestal */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                transform: `translateY(${textPushY}px) scale(${cameraBreath})`,
                opacity: leadOp,
              }}
            >
              <LeadText text={props.stage4Lead} fontSize={46} color={pitchBlack} />

              {localF >= 8 && (
                <div
                  style={{
                    overflow: 'hidden',
                    marginTop: -12,
                    paddingTop: '0.16em',
                    paddingBottom: '0.06em',
                    paddingLeft: 24,
                    paddingRight: 24,
                  }}
                >
                  <div style={{ transform: `translateY(${heroRevealY}%)` }}>
                    <CondensedHeroText
                      text={props.stage4Hero}
                      fontSize={164}
                      color={pitchBlack}
                      scaleX={0.78}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Rising Black Monolith Column Anchored Tightly Under the Text */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: (1080 - 520) / 2,
                width: 520,
                height: pedestalHeight,
                backgroundColor: pitchBlack,
              }}
            />
          </AbsoluteFill>
        );
      })()}

      {/* ====================================================================
          STAGE 5 (f438 -> f494 | 7.30s - 8.23s):
          Clean Talking Head Intercut ("Bạn không cần thiết phải làm...")
          (Human Trust Rubric — Direct Eye Contact before Final Punchline)
          ==================================================================== */}
      {frame >= 438 && frame < 494 && (() => {
        const localF = frame - 438;
        const zoomIn = interpolate(localF, [0, 56], [1.22, 1.28]);

        return (
          <AbsoluteFill>
            <Sequence from={438} durationInFrames={56} layout="none">
              <OffthreadVideo
                src={staticFile(props.videoSrc)}
                startFrom={1275}
                muted
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: '50% 18%',
                  transform: `scale(${zoomIn})`,
                  transformOrigin: '50% 22%',
                  filter: 'contrast(1.1) saturate(0.95) brightness(0.96)',
                }}
              />
            </Sequence>

            <AbsoluteFill
              style={{
                background:
                  'linear-gradient(180deg, rgba(0,0,0,0) 58%, rgba(0,0,0,0.78) 100%)',
              }}
            />

            {props.showSubtitlesOnTalkingHead && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 130,
                  left: 80,
                  right: 80,
                  textAlign: 'center',
                  fontFamily: "'SVN-Aeonik', sans-serif",
                  fontSize: 38,
                  fontWeight: 700,
                  color: pureWhite,
                  textShadow: '0 3px 12px rgba(0,0,0,0.9)',
                }}
              >
                {nfc('Bạn không cần thiết phải làm...')}
              </div>
            )}
          </AbsoluteFill>
        );
      })()}

      {/* ====================================================================
          STAGE 6 (f494 -> f600 | 8.23s - 10.00s):
          Vertical Slot-Machine Drum Roll ("KHÔNG CẦN LÀM" / "IDOL ẢO" -> "THỢ DIỄN")
          (Ref: 00:35.51s - 00:37.80s "MAKE BOLDER -> MAKE MOVES")
          ==================================================================== */}
      {frame >= 494 && (() => {
        const localF = frame - 494;

        // 1. "IDOL ẢO" scales in sharply from 0.28 -> 1.0 (localF 4 -> 22, like f870 -> f876 "BOLDER")
        const word1Scale = interpolate(localF, [4, 22], [0.28, 1.0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: EXPO_OUT,
        });
        const word1Op = clamp01(interpolate(localF, [4, 10], [0, 1]));

        // 2. Vertical Slot-Machine Roll (localF 38 -> 58, like f888 -> f901 "BOLDER" -> "MOVES")
        const rollProgress = interpolate(localF, [38, 58], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: MECHANICAL_SNAP,
        });

        const word1RollY = interpolate(rollProgress, [0, 1], [0, -110]);
        const word2RollY = interpolate(rollProgress, [0, 1], [110, 0]);

        return (
          <AbsoluteFill
            style={{
              backgroundColor: acidLime,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                transform: `scale(${cameraBreath})`,
              }}
            >
              {/* Fixed Anchor Lead Text Above ("KHÔNG CẦN LÀM", like "MAKE") */}
              <LeadText text={props.stage6Lead} fontSize={44} color={pitchBlack} />

              {/* Generous Slot-Machine Viewport Protecting 100% Vietnamese Diacritics */}
              <div
                style={{
                  position: 'relative',
                  width: 980,
                  height: 255,
                  overflow: 'hidden',
                  marginTop: 0,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                {/* Word 1: "IDOL ẢO" (Scales in, then rolls out upward) */}
                <div
                  style={{
                    position: 'absolute',
                    transform: `translateY(${word1RollY}%) scale(${word1Scale})`,
                    opacity: word1Op,
                  }}
                >
                  <CondensedHeroText
                    text={props.stage6RollWord1}
                    fontSize={168}
                    color={pitchBlack}
                    scaleX={0.78}
                  />
                </div>

                {/* Word 2: "THỢ DIỄN" (Rolls in tightly from bottom and locks till 10.0s) */}
                {localF >= 36 && (
                  <div
                    style={{
                      position: 'absolute',
                      transform: `translateY(${word2RollY}%)`,
                    }}
                  >
                    <CondensedHeroText
                      text={props.stage6RollWord2}
                      fontSize={168}
                      color={pitchBlack}
                      scaleX={0.78}
                    />
                  </div>
                )}
              </div>
            </div>
          </AbsoluteFill>
        );
      })()}
    </AbsoluteFill>
  );
};
