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
const nfc = (s: string): string => s.normalize('NFC');

export interface ClaudeMotionRisoProps {
  // Tweaks Panel (Editable Variables just like Claude Motion Tweaks)
  scene1Line1?: string;
  scene1Line2?: string;
  scene2Line1?: string;
  scene2Line2?: string;
  scene3Line1?: string;
  scene3Line2?: string;
  scene4Line1?: string;
  scene4Line2?: string;
  scene5Hero1?: string;
  scene5Hero2?: string;
  scene6Line1?: string;
  scene6Line2?: string;
  scene7Target1?: string;
  scene7Target2?: string;
  scene7Stamp?: string;
  stockColor?: string;
  orangeInk?: string;
  tealInk?: string;
  darkInk?: string;
}

export const defaultClaudeMotionRisoProps: Required<ClaudeMotionRisoProps> = {
  scene1Line1: 'CÁI MẠNG',
  scene1Line2: 'XÃ HỘI CŨ',
  scene2Line1: 'MÀ MÌNH',
  scene2Line2: 'TỪNG BIẾT',
  scene3Line1: 'NÓ ĐÃ',
  scene3Line2: 'CHẾT RỒI.',
  scene4Line1: 'BÂY GIỜ',
  scene4Line2: 'LÀ KỶ NGUYÊN CỦA',
  scene5Hero1: 'NGỮ',
  scene5Hero2: 'NGHĨA',
  scene6Line1: 'BẠN KHÔNG CẦN',
  scene6Line2: 'THIẾT PHẢI LÀM',
  scene7Target1: 'IDOL',
  scene7Target2: 'TRÊN VIDEO',
  scene7Stamp: 'KỸ NĂNG THẬT > DIỄN XUẤT',
  stockColor: '#F3ECDD',
  orangeInk: '#E2683A',
  tealInk: '#1E5A64',
  darkInk: '#122026',
};

// Off-register Risograph Headline Helper (6 words max rule, NFC Vietnamese safe)
const RisoHeadline: React.FC<{
  lines: string[];
  fontSize?: number;
  mainColor: string;
  offsetColor: string;
  offsetX?: number;
  offsetY?: number;
  align?: 'center' | 'left';
  lineGap?: number;
  frameOffset?: number;
}> = ({
  lines,
  fontSize = 92,
  mainColor,
  offsetColor,
  offsetX = 5,
  offsetY = 4,
  align = 'center',
  lineGap = 10,
  frameOffset = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: align === 'center' ? 'center' : 'flex-start',
        gap: lineGap,
        overflow: 'visible',
        padding: '12px 24px',
      }}
    >
      {lines.map((rawLine, idx) => {
        const line = nfc(rawLine);
        const s = spring({
          frame: Math.max(0, frame - frameOffset - idx * 4),
          fps,
          config: { mass: 0.72, damping: 14, stiffness: 190 },
        });
        const y = interpolate(s, [0, 1], [38, 0]);
        const op = interpolate(s, [0, 0.4, 1], [0, 1, 1]);

        return (
          <div
            key={idx}
            style={{
              position: 'relative',
              transform: `translateY(${y}px)`,
              opacity: op,
              overflow: 'visible',
              paddingTop: '0.12em',
              paddingBottom: '0.12em',
            }}
          >
            {/* Off-register Underlayer Ink */}
            <span
              aria-hidden
              style={{
                position: 'absolute',
                left: offsetX,
                top: offsetY,
                fontFamily: "'SVN-Aeonik', 'Inter', sans-serif",
                fontSize,
                fontWeight: 800,
                lineHeight: 1.28,
                letterSpacing: '-0.02em',
                color: offsetColor,
                opacity: 0.55,
                whiteSpace: 'nowrap',
                userSelect: 'none',
              }}
            >
              {line}
            </span>
            {/* Primary Ink Layer */}
            <span
              style={{
                position: 'relative',
                fontFamily: "'SVN-Aeonik', 'Inter', sans-serif",
                fontSize,
                fontWeight: 800,
                lineHeight: 1.28,
                letterSpacing: '-0.02em',
                color: mainColor,
                whiteSpace: 'nowrap',
                display: 'inline-block',
              }}
            >
              {line}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export const VietClaudeMotionRiso10s: React.FC<ClaudeMotionRisoProps> = (rawProps) => {
  const props = { ...defaultClaudeMotionRisoProps, ...rawProps };
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const { stockColor, orangeInk, tealInk, darkInk } = props;

  // Continuous micro-motion (Hold rule: no dead static frame)
  const microScale = 1 + Math.sin(frame * 0.045) * 0.007;
  const jitterX = Math.sin(frame * 0.35) * 0.8;
  const jitterY = Math.cos(frame * 0.28) * 0.8;

  // Dynamic background color per scene (Scene 3 hard invert on "nó đã chết rồi")
  const isScene3 = frame >= 182 && frame < 238;
  const isScene3Slam = frame >= 204 && frame < 238;
  const bgColor = isScene3Slam
    ? darkInk
    : isScene3
    ? orangeInk
    : stockColor;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: bgColor,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Master 10s Voice-Safe Audio (Vietnamese Speech + 4-Layer SFX) */}
      <Audio src={staticFile('motion02/master_audio_10s_v3.wav')} />

      {/* Subtle Risograph Paper Grain & Registration Border */}
      <AbsoluteFill
        style={{
          pointerEvents: 'none',
          backgroundImage:
            'radial-gradient(rgba(18, 32, 38, 0.07) 1.2px, transparent 1.2px), radial-gradient(rgba(226, 104, 58, 0.05) 1.2px, transparent 1.2px)',
          backgroundSize: '18px 18px',
          backgroundPosition: '0 0, 9px 9px',
          zIndex: 40,
        }}
      />

      {/* Minimalist Print Registration Marks (Safe-Zone Framed) */}
      <div
        style={{
          position: 'absolute',
          inset: 54,
          border: `2px solid ${isScene3 ? 'rgba(243,236,221,0.22)' : 'rgba(30,90,100,0.16)'}`,
          pointerEvents: 'none',
          zIndex: 35,
        }}
      />

      {/* ====================================================================
          SCENE 1 (f0 -> f88 | 0.00s - 1.47s): "Cái mạng / xã hội cũ"
          Off-register Risograph Mechanical Gear + Bold Two-Tone Print
          ==================================================================== */}
      {frame < 88 && (() => {
        const gearScale = spring({
          frame,
          fps,
          config: { mass: 0.8, damping: 13, stiffness: 170 },
        });
        const gearRot = frame * 1.1;
        const exitSlideY = interpolate(frame, [74, 88], [0, -140], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: EXPO_OUT,
        });
        const exitOp = interpolate(frame, [76, 87], [1, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

        return (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 44,
              transform: `scale(${microScale}) translateY(${exitSlideY}px)`,
              opacity: exitOp,
            }}
          >
            {/* Off-Register Risograph Icon: Old Social Network Nodes */}
            <div
              style={{
                position: 'relative',
                width: 240,
                height: 240,
                transform: `scale(${gearScale})`,
              }}
            >
              {/* Orange Ink Plate (Off-register +6px, +5px) */}
              <svg
                width="240"
                height="240"
                viewBox="0 0 200 200"
                style={{
                  position: 'absolute',
                  left: 6 + jitterX,
                  top: 5 + jitterY,
                  transform: `rotate(${gearRot}deg)`,
                  opacity: 0.85,
                }}
              >
                <circle
                  cx="100"
                  cy="100"
                  r="68"
                  fill="none"
                  stroke={orangeInk}
                  strokeWidth="12"
                  strokeDasharray="24 14"
                />
                <circle cx="100" cy="100" r="24" fill={orangeInk} />
              </svg>

              {/* Deep Teal Ink Plate */}
              <svg
                width="240"
                height="240"
                viewBox="0 0 200 200"
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  transform: `rotate(${-gearRot * 0.7}deg)`,
                }}
              >
                <circle
                  cx="100"
                  cy="100"
                  r="68"
                  fill="none"
                  stroke={tealInk}
                  strokeWidth="10"
                />
                <line x1="32" y1="100" x2="168" y2="100" stroke={tealInk} strokeWidth="8" />
                <line x1="100" y1="32" x2="100" y2="168" stroke={tealInk} strokeWidth="8" />
                <circle cx="100" cy="100" r="18" fill={stockColor} stroke={tealInk} strokeWidth="8" />
              </svg>
            </div>

            <RisoHeadline
              lines={[props.scene1Line1, props.scene1Line2]}
              fontSize={104}
              mainColor={darkInk}
              offsetColor={orangeInk}
              offsetX={6}
              offsetY={5}
              frameOffset={4}
            />
          </div>
        );
      })()}

      {/* ====================================================================
          SCENE 2 (f88 -> f182 | 1.47s - 3.03s): "mà mình / từng biết"
          HYBRID TALKING HEAD CARD #1 + Off-Register Risograph Frame
          ==================================================================== */}
      {frame >= 88 && frame < 182 && (() => {
        const localF = frame - 88;
        const cardEnter = spring({
          frame: localF,
          fps,
          config: { mass: 0.75, damping: 14, stiffness: 185 },
        });
        const cardScale = interpolate(cardEnter, [0, 1], [0.86, 1]);
        const exitScale = interpolate(frame, [168, 181], [1, 1.12], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: EXPO_OUT,
        });

        return (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 36,
              transform: `scale(${cardScale * exitScale * microScale})`,
            }}
          >
            {/* Off-Register Risograph Photo/Footage Frame */}
            <div style={{ position: 'relative', width: 660, height: 760 }}>
              {/* Offset Orange Ink Shadow Block */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  transform: `translate(${16 + jitterX}px, ${16 + jitterY}px)`,
                  backgroundColor: orangeInk,
                  borderRadius: 28,
                }}
              />
              {/* Offset Teal Ink Wireframe */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  transform: 'translate(-10px, -10px)',
                  border: `4px solid ${tealInk}`,
                  borderRadius: 28,
                }}
              />
              {/* Main Talking Head Video Container */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  borderRadius: 24,
                  overflow: 'hidden',
                  border: `6px solid ${darkInk}`,
                  backgroundColor: darkInk,
                }}
              >
                <OffthreadVideo
                  src={staticFile('motion02/qc_offline_27s_1080p60.mp4')}
                  muted
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: '50% 74%',
                    transform: 'scale(1.28)',
                    transformOrigin: '50% 68%',
                    filter: 'contrast(1.08) saturate(0.92)',
                  }}
                />
                {/* Halftone Duotone Tint Overlay */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                      'linear-gradient(180deg, rgba(30,90,100,0.12) 0%, rgba(18,32,38,0.45) 100%)',
                  }}
                />
              </div>
            </div>

            {/* Risograph Label Below Footage */}
            <RisoHeadline
              lines={[props.scene2Line1, props.scene2Line2]}
              fontSize={96}
              mainColor={tealInk}
              offsetColor={orangeInk}
              offsetX={5}
              offsetY={4}
              frameOffset={90}
            />
          </div>
        );
      })()}

      {/* ====================================================================
          SCENE 3 (f182 -> f238 | 3.03s - 3.97s): "nó đã / CHẾT RỒI."
          Hard Risograph Plate Invert + Diagonal Stamp Slash
          ==================================================================== */}
      {frame >= 182 && frame < 238 && (() => {
        const localF = frame - 182;
        const slamS = spring({
          frame: Math.max(0, frame - 204),
          fps,
          config: { mass: 0.65, damping: 11, stiffness: 240 },
        });
        const slashProgress = interpolate(frame, [196, 214], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: EXPO_OUT,
        });

        return (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 32,
              transform: `scale(${microScale * interpolate(slamS, [0, 1], [1, 1.06])})`,
            }}
          >
            {/* Broken Flatline Pulse Graphic */}
            <svg width="520" height="140" viewBox="0 0 520 140" style={{ overflow: 'visible' }}>
              <path
                d="M 20 70 L 150 70 L 185 20 L 220 120 L 255 45 L 285 70 L 500 70"
                fill="none"
                stroke={stockColor}
                strokeWidth="12"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.9}
              />
              <line
                x1="80"
                y1="125"
                x2={80 + 360 * slashProgress}
                y2={125 - 110 * slashProgress}
                stroke={ isScene3Slam ? orangeInk : darkInk }
                strokeWidth="16"
                strokeLinecap="round"
              />
            </svg>

            <RisoHeadline
              lines={[props.scene3Line1, props.scene3Line2]}
              fontSize={122}
              mainColor={stockColor}
              offsetColor={isScene3Slam ? orangeInk : darkInk}
              offsetX={7}
              offsetY={6}
              frameOffset={183}
            />
          </div>
        );
      })()}

      {/* ====================================================================
          SCENE 4 (f238 -> f326 | 3.97s - 5.43s): "Bây giờ / là kỷ nguyên của"
          Two-Ink Risograph Orbit Compass + Clean Transition
          ==================================================================== */}
      {frame >= 238 && frame < 326 && (() => {
        const localF = frame - 238;
        const enterS = spring({
          frame: localF,
          fps,
          config: { mass: 0.75, damping: 14, stiffness: 180 },
        });
        const ringRot = localF * 1.4;

        return (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 42,
              transform: `scale(${interpolate(enterS, [0, 1], [0.88, 1]) * microScale})`,
            }}
          >
            {/* Two-Ink Risograph Compass Rings */}
            <div style={{ position: 'relative', width: 260, height: 260 }}>
              <svg
                width="260"
                height="260"
                viewBox="0 0 260 260"
                style={{
                  position: 'absolute',
                  left: 5 + jitterX,
                  top: 4 + jitterY,
                  transform: `rotate(${ringRot}deg)`,
                }}
              >
                <ellipse
                  cx="130"
                  cy="130"
                  rx="105"
                  ry="52"
                  fill="none"
                  stroke={orangeInk}
                  strokeWidth="10"
                />
                <circle cx="235" cy="130" r="14" fill={orangeInk} />
              </svg>

              <svg
                width="260"
                height="260"
                viewBox="0 0 260 260"
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  transform: `rotate(${-ringRot * 0.8 + 45}deg)`,
                }}
              >
                <ellipse
                  cx="130"
                  cy="130"
                  rx="105"
                  ry="52"
                  fill="none"
                  stroke={tealInk}
                  strokeWidth="10"
                />
                <circle cx="130" cy="130" r="26" fill={tealInk} />
              </svg>
            </div>

            <RisoHeadline
              lines={[props.scene4Line1, props.scene4Line2]}
              fontSize={86}
              mainColor={darkInk}
              offsetColor={tealInk}
              offsetX={5}
              offsetY={4}
              frameOffset={240}
            />
          </div>
        );
      })()}

      {/* ====================================================================
          SCENE 5 (f326 -> f438 | 5.43s - 7.30s): "NGỮ / NGHĨA"
          Hero Risograph Venn Intersection + Monumental Typography
          ==================================================================== */}
      {frame >= 326 && frame < 438 && (() => {
        const localF = frame - 326;
        const popS = spring({
          frame: localF,
          fps,
          config: { mass: 0.7, damping: 13, stiffness: 195 },
        });
        const vennSpread = interpolate(popS, [0, 1], [0, 64]);

        return (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 36,
              transform: `scale(${microScale})`,
            }}
          >
            {/* Risograph Multiply Blend Venn Spheres */}
            <div
              style={{
                position: 'relative',
                width: 380,
                height: 220,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  width: 190,
                  height: 190,
                  borderRadius: '50%',
                  backgroundColor: orangeInk,
                  opacity: 0.82,
                  transform: `translateX(${-vennSpread + jitterX}px)`,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  width: 190,
                  height: 190,
                  borderRadius: '50%',
                  backgroundColor: tealInk,
                  opacity: 0.85,
                  transform: `translateX(${vennSpread - jitterX}px)`,
                }}
              />
              {/* Intersection Core */}
              <div
                style={{
                  position: 'relative',
                  width: 68,
                  height: 68,
                  borderRadius: '50%',
                  backgroundColor: stockColor,
                  border: `6px solid ${darkInk}`,
                  transform: `scale(${popS})`,
                }}
              />
            </div>

            {/* Monumental Hero Words: NGỮ NGHĨA */}
            <RisoHeadline
              lines={[props.scene5Hero1, props.scene5Hero2]}
              fontSize={148}
              mainColor={darkInk}
              offsetColor={orangeInk}
              offsetX={8}
              offsetY={6}
              lineGap={4}
              frameOffset={328}
            />
          </div>
        );
      })()}

      {/* ====================================================================
          SCENE 6 (f438 -> f494 | 7.30s - 8.23s): "Bạn không cần / thiết phải làm"
          HYBRID TALKING HEAD CARD #2 + Risograph Teal Banner
          ==================================================================== */}
      {frame >= 438 && frame < 494 && (() => {
        const localF = frame - 438;
        const enterS = spring({
          frame: localF,
          fps,
          config: { mass: 0.72, damping: 14, stiffness: 195 },
        });

        return (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 34,
              transform: `scale(${interpolate(enterS, [0, 1], [0.9, 1]) * microScale})`,
            }}
          >
            {/* Circular/Octagonal Risograph Talking Head Portrait */}
            <div style={{ position: 'relative', width: 520, height: 520 }}>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  backgroundColor: tealInk,
                  transform: `translate(${-14 + jitterX}px, ${14 + jitterY}px)`,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  border: `5px dashed ${orangeInk}`,
                  transform: `translate(12px, -12px) rotate(${localF * 0.8}deg)`,
                }}
              />
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: `7px solid ${darkInk}`,
                  backgroundColor: darkInk,
                }}
              >
                <Sequence from={438} durationInFrames={56} layout="none">
                  <OffthreadVideo
                    src={staticFile('motion02/qc_offline_27s_1080p60.mp4')}
                    startFrom={540}
                    muted
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: '50% 24%',
                      transform: 'scale(1.36)',
                      transformOrigin: '50% 28%',
                      filter: 'contrast(1.08) saturate(0.92)',
                    }}
                  />
                </Sequence>
              </div>
            </div>

            <RisoHeadline
              lines={[props.scene6Line1, props.scene6Line2]}
              fontSize={84}
              mainColor={darkInk}
              offsetColor={orangeInk}
              offsetX={5}
              offsetY={4}
              frameOffset={439}
            />
          </div>
        );
      })()}

      {/* ====================================================================
          SCENE 7 (f494 -> f600 | 8.23s - 10.00s): "IDOL / TRÊN VIDEO"
          Risograph Wheel Reject + Heavy Red-Orange Strike Stamp
          ==================================================================== */}
      {frame >= 494 && (() => {
        const localF = frame - 494;
        const lockS = spring({
          frame: localF,
          fps,
          config: { mass: 0.75, damping: 13, stiffness: 190 },
        });
        const strikeP = interpolate(frame, [532, 550], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: EXPO_OUT,
        });
        const stampS = spring({
          frame: Math.max(0, frame - 544),
          fps,
          config: { mass: 0.65, damping: 11, stiffness: 220 },
        });

        return (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 38,
              transform: `scale(${interpolate(lockS, [0, 1], [0.88, 1]) * microScale})`,
            }}
          >
            {/* Faded Rejected Role Pill Above */}
            <div
              style={{
                padding: '10px 32px',
                borderRadius: 999,
                border: `3px solid ${tealInk}`,
                opacity: 0.42,
                fontFamily: "'SVN-Aeonik', sans-serif",
                fontSize: 42,
                fontWeight: 700,
                color: tealInk,
                letterSpacing: '0.04em',
              }}
            >
              {nfc('× DIỄN VIÊN HÀO NHOÁNG')}
            </div>

            {/* Target Words with Risograph Strike-Through Bar */}
            <div style={{ position: 'relative', padding: '10px 30px' }}>
              <RisoHeadline
                lines={[props.scene7Target1, props.scene7Target2]}
                fontSize={124}
                mainColor={darkInk}
                offsetColor={tealInk}
                offsetX={6}
                offsetY={5}
                frameOffset={495}
              />

              {/* Heavy Off-Register Orange Strike Bar across "IDOL" */}
              <div
                style={{
                  position: 'absolute',
                  left: '8%',
                  top: '28%',
                  width: `${84 * strikeP}%`,
                  height: 22,
                  backgroundColor: orangeInk,
                  transform: 'rotate(-5deg)',
                  boxShadow: `5px 5px 0px ${darkInk}`,
                  borderRadius: 6,
                }}
              />
            </div>

            {/* Final Holding Stamp (Holds cleanly till 10.0s as required by Claude Motion "Done means") */}
            {frame >= 542 && (
              <div
                style={{
                  transform: `scale(${interpolate(stampS, [0, 1], [1.35, 1])}) rotate(-2deg)`,
                  opacity: interpolate(stampS, [0, 0.4, 1], [0, 1, 1]),
                  backgroundColor: tealInk,
                  color: stockColor,
                  padding: '20px 44px',
                  borderRadius: 16,
                  border: `4px solid ${darkInk}`,
                  boxShadow: `10px 10px 0px ${orangeInk}`,
                  fontFamily: "'SVN-Aeonik', sans-serif",
                  fontSize: 46,
                  fontWeight: 800,
                  lineHeight: 1.28,
                  letterSpacing: '0.02em',
                }}
              >
                {nfc(props.scene7Stamp)}
              </div>
            )}
          </div>
        );
      })()}
    </AbsoluteFill>
  );
};
