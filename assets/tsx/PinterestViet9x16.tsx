import React from 'react';
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const EXPO_OUT = Easing.bezier(0.16, 1, 0.3, 1);
const EXPO_IN = Easing.bezier(0.7, 0, 0.84, 0);
const WHIP_BEZIER = Easing.bezier(0.68, 0, 0.18, 1);

const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));
const nfc = (s: string): string => s.normalize('NFC');

// Exact transition timestamps from original Pinterest video measured by Opus (in frames @ 30fps)
// 4.47s(134), 9.0s(270), 10.43s(313), 14.2s(426), 19.87s(596), 23.8s(714),
// 26.2s(786), 27.8s(834), 29.3s(879), 32.5s(975), 33.7s(1011), 38.47s(1154), 42.1s(1263)
const CUT_FRAMES = [134, 270, 313, 426, 596, 714, 786, 834, 879, 975, 1011, 1154, 1263];

// ============================================================================
// TWEAKS SCHEMA (KHUÔN THIẾT KẾ GỐC — SỬA CHỮ, MÀU & NHỊP TỨC THỜI)
// ============================================================================
export interface PinterestViet9x16Props {
  // Scene 1 (0.0s - 4.7s): Tia sáng -> Ý tưởng
  scene1Headline?: string;
  scene1Subline?: string;
  scene1PillText?: string;
  scene1HeroWord?: string;

  // Scene 2 (4.2s - 9.2s): Bản phác thảo -> Một câu hỏi -> BỨT PHÁ
  scene2PhaseA?: string;
  scene2PhaseBLead?: string;
  scene2PhaseBMain?: string;
  scene2PhaseBAccent?: string;
  scene2PhaseCLead?: string;
  scene2PhaseCHighlight?: string;

  // Scene 3 (8.7s - 14.4s): Thiết kế có chủ đích -> Biến Ý TƯỞNG thành trải nghiệm
  scene3Badge?: string;
  scene3Verb?: string;
  scene3HeroBox?: string;
  scene3TailWhite?: string;
  scene3TailAccent?: string;

  // Scene 4 (13.9s - 20.1s): TĂNG TRƯỞNG (7-row echo) -> SỰ RÕ RÀNG
  scene4EchoWord?: string;
  scene4Watermark?: string;
  scene4CenterBadge?: string;

  // Scene 5 (19.6s - 24.0s): Không rối rắm -> Chỉ có dòng chảy & sự tối giản
  scene5TopPill?: string;
  scene5BottomBanner?: string;

  // Scene 6 (23.5s - 29.5s): 3D Isometric Bento Dashboard -> Thiết kế định hình hành trình
  scene6LoginTitle?: string;
  scene6LoginCta?: string;
  scene6ProfileName?: string;
  scene6ProfileCta?: string;
  scene6ChartTitle?: string;
  scene6ChartBadge?: string;
  scene6HeroWord?: string;
  scene6Subline?: string;

  // Scene 7 (29.0s - 35.8s): Smart Home UI -> Bố cục thông minh -> Hành động RÕ RÀNG
  scene7Greeting?: string;
  scene7WeatherSub?: string;
  scene7Gauge1Label?: string;
  scene7Gauge2Label?: string;
  scene7AcLabel?: string;
  scene7TiltSub?: string;
  scene7BoxHighlight?: string;
  scene7BoxNormal?: string;
  scene7PipeLead?: string;
  scene7PipeHero?: string;

  // Scene 8 (35.3s - 42.4s): Chế tác để tiến lên -> Không chỉ là vẻ bề ngoài
  scene8LeadPrefix?: string;
  scene8LeadHighlight?: string;
  scene8LeadSuffix?: string;
  scene8Stack1?: string;
  scene8Stack2?: string;
  scene8Stack3?: string;
  scene8Stack4?: string;
  scene8Stack5?: string;

  // Scene 9 (41.8s - 47.33s): Mà là cách nó VẬN HÀNH -> Sẵn sàng bứt phá?
  scene9Lead?: string;
  scene9HeroBox?: string;
  scene9FinaleTop?: string;
  scene9FinalePill?: string;

  // Bảng màu chủ đạo (Color Palette Tweaks)
  darkBgColor?: string;
  lightBgColor?: string;
  limeAccentColor?: string;
  emeraldAccentColor?: string;
  deepEmeraldColor?: string;
  lightTextColor?: string;

  // Thông số nhịp chuyển động (Motion Rig Tweaks)
  cameraEnergyMultiplier?: number;
  whipImpulseStrength?: number;
}

export const defaultPinterestViet9x16Props: Required<PinterestViet9x16Props> = {
  // Scene 1
  scene1Headline: 'Mọi đột phá',
  scene1Subline: 'đều bắt đầu từ một',
  scene1PillText: 'Tia sáng',
  scene1HeroWord: 'Ý tưởng',

  // Scene 2
  scene2PhaseA: 'Bản phác thảo',
  scene2PhaseBLead: 'Một',
  scene2PhaseBMain: 'câu',
  scene2PhaseBAccent: 'hỏi ?',
  scene2PhaseCLead: 'Điều gì xảy ra nếu nó',
  scene2PhaseCHighlight: 'BỨT PHÁ',

  // Scene 3
  scene3Badge: 'Thiết kế có chủ đích',
  scene3Verb: 'Biến',
  scene3HeroBox: 'Ý TƯỞNG',
  scene3TailWhite: 'thành trải nghiệm',
  scene3TailAccent: ' sống động.',

  // Scene 4
  scene4EchoWord: 'TĂNG TRƯỞNG',
  scene4Watermark: 'SỰ RÕ RÀNG',
  scene4CenterBadge: 'Sự rõ ràng',

  // Scene 5
  scene5TopPill: 'Không rối rắm  —  Không chờ đợi',
  scene5BottomBanner: 'Chỉ có dòng chảy & sự tối giản',

  // Scene 6
  scene6LoginTitle: 'Chào mừng trở lại.',
  scene6LoginCta: 'ĐĂNG NHẬP',
  scene6ProfileName: 'Nguyễn Việt',
  scene6ProfileCta: 'Theo dõi ngay',
  scene6ChartTitle: 'Biểu đồ chuyển đổi trực quan',
  scene6ChartBadge: '+100k',
  scene6HeroWord: 'Thiết kế',
  scene6Subline: 'định hình toàn bộ hành trình.',

  // Scene 7
  scene7Greeting: 'Xin chào, Anh Việt',
  scene7WeatherSub: '26°C  •  Trời mát mẻ',
  scene7Gauge1Label: 'Cường độ sáng',
  scene7Gauge2Label: 'Nhiệt độ phòng',
  scene7AcLabel: 'Điều hòa thông minh',
  scene7TiltSub: '26°C  •  Giao diện trực quan',
  scene7BoxHighlight: 'Bố cục ',
  scene7BoxNormal: 'thông minh',
  scene7PipeLead: 'Hành động',
  scene7PipeHero: 'RÕ RÀNG',

  // Scene 8
  scene8LeadPrefix: 'Tất cả được ',
  scene8LeadHighlight: 'chế tác',
  scene8LeadSuffix: ' để đưa bạn tiến về phía trước.',
  scene8Stack1: 'Bởi vì',
  scene8Stack2: 'thiết kế',
  scene8Stack3: 'đỉnh cao',
  scene8Stack4: 'không chỉ là',
  scene8Stack5: 'vẻ bề ngoài',

  // Scene 9
  scene9Lead: 'Mà là cách nó',
  scene9HeroBox: 'VẬN HÀNH.',
  scene9FinaleTop: 'Sẵn sàng',
  scene9FinalePill: 'bứt phá ?',

  // Color Palette Tweaks
  darkBgColor: '#042016',
  lightBgColor: '#F1FCEB',
  limeAccentColor: '#DAFF3E',
  emeraldAccentColor: '#10B981',
  deepEmeraldColor: '#064E3B',
  lightTextColor: '#F0F9E8',

  // Motion Rig Tweaks
  cameraEnergyMultiplier: 1.0,
  whipImpulseStrength: 1.0,
};

// ============================================================================
// REUSABLE ANTI-ALIASED SVG VECTOR ACTORS
// ============================================================================
const DaisyFlowerSVG: React.FC<{
  size?: number;
  petalColor?: string;
  centerColor?: string;
  rotationDeg?: number;
  outlineOnly?: boolean;
  strokeWidth?: number;
  glowColor?: string;
}> = ({
  size = 64,
  petalColor = '#DAFF3E',
  centerColor = '#FEF08A',
  rotationDeg = 0,
  outlineOnly = false,
  strokeWidth = 2.5,
  glowColor,
}) => {
  const angles = [0, 36, 72, 108, 144, 180, 216, 252, 288, 324];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{
        transform: `rotate(${rotationDeg}deg)`,
        filter: glowColor ? `drop-shadow(0 0 22px ${glowColor})` : undefined,
        willChange: 'transform',
        flexShrink: 0,
      }}
    >
      {angles.map((a) => (
        <g key={a} transform={`rotate(${a} 50 50)`}>
          <rect
            x="41.5"
            y="6"
            width="17"
            height="42"
            rx="8.5"
            fill={outlineOnly ? 'none' : petalColor}
            stroke={outlineOnly ? petalColor : 'none'}
            strokeWidth={outlineOnly ? strokeWidth : 0}
          />
        </g>
      ))}
      {!outlineOnly && <circle cx="50" cy="50" r="14" fill={centerColor} />}
    </svg>
  );
};

const LineArtFaceAvatarSVG: React.FC<{
  size?: number;
  bgColor?: string;
  strokeColor?: string;
  rotationDeg?: number;
}> = ({
  size = 88,
  bgColor = '#D9F99D',
  strokeColor = '#064E3B',
  rotationDeg = 0,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    style={{
      transform: `rotate(${rotationDeg}deg)`,
      filter: 'drop-shadow(0 10px 24px rgba(0,0,0,0.22))',
      flexShrink: 0,
    }}
  >
    <circle
      cx="50"
      cy="50"
      r="46"
      fill={bgColor}
      stroke={strokeColor}
      strokeWidth="2.5"
    />
    <path
      d="M26 38 Q36 28 46 36"
      fill="none"
      stroke={strokeColor}
      strokeWidth="2.8"
      strokeLinecap="round"
    />
    <path
      d="M56 36 Q66 28 76 38"
      fill="none"
      stroke={strokeColor}
      strokeWidth="2.8"
      strokeLinecap="round"
    />
    <path
      d="M52 34 L45 56 L55 58"
      fill="none"
      stroke={strokeColor}
      strokeWidth="2.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="36" cy="44" r="3.2" fill={strokeColor} />
    <circle cx="65" cy="44" r="3.2" fill={strokeColor} />
    <path
      d="M38 68 Q50 78 64 67"
      fill="none"
      stroke={strokeColor}
      strokeWidth="2.8"
      strokeLinecap="round"
    />
  </svg>
);

const PointerCursorSVG: React.FC<{
  scale?: number;
  rotateDeg?: number;
  color?: string;
}> = ({ scale = 1, rotateDeg = 0, color = '#DAFF3E' }) => (
  <svg
    width="56"
    height="56"
    viewBox="0 0 48 48"
    style={{
      transform: `scale(${scale}) rotate(${rotateDeg}deg)`,
      transformOrigin: 'top left',
      filter: `drop-shadow(0 12px 20px rgba(0,0,0,0.55)) drop-shadow(0 0 16px ${color})`,
    }}
  >
    <path
      d="M6 4L40 19L23 24.5L17.5 41L6 4Z"
      fill={color}
      stroke="#FFFFFF"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
  </svg>
);

const FigmaSelectionBox: React.FC<{
  children: React.ReactNode;
  borderColor?: string;
  padding?: string;
  progress?: number;
}> = ({
  children,
  borderColor = '#4ADE80',
  padding = '10px 24px',
  progress = 1,
}) => {
  const hs = 12;
  const corners = [
    { top: -hs / 2, left: -hs / 2 },
    { top: -hs / 2, right: -hs / 2 },
    { bottom: -hs / 2, left: -hs / 2 },
    { bottom: -hs / 2, right: -hs / 2 },
  ];
  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding,
        border: `2.5px solid ${borderColor}`,
        background: 'rgba(16, 185, 129, 0.12)',
        transform: `scale(${0.85 + 0.15 * progress})`,
        opacity: clamp01(progress * 1.2),
      }}
    >
      {corners.map((pos, idx) => (
        <div
          key={idx}
          style={{
            position: 'absolute',
            ...pos,
            width: hs,
            height: hs,
            backgroundColor: '#FFFFFF',
            border: `2px solid ${borderColor}`,
            boxShadow: `0 0 10px ${borderColor}`,
          }}
        />
      ))}
      {children}
    </div>
  );
};

// ============================================================================
// DYNAMIC PARALLAX FIELD (Ensures continuous full-frame optical flow & 0% dead frames)
// ============================================================================
const ContinuousOrbitalBackdrop: React.FC<{
  frame: number;
  isLightMode: boolean;
  camX: number;
  camY: number;
  darkBgColor: string;
  lightBgColor: string;
}> = ({ frame, isLightMode, camX, camY, darkBgColor, lightBgColor }) => {
  const strokeCol = isLightMode
    ? 'rgba(16, 120, 68, 0.24)'
    : 'rgba(134, 239, 172, 0.24)';
  const accentCol = isLightMode
    ? 'rgba(132, 204, 22, 0.38)'
    : 'rgba(218, 255, 62, 0.34)';

  // Continuous sweeping motion across the entire 1080x1920 canvas
  const sweepX = ((frame * 6.5) % 1400) - 200;
  const sweepY = ((frame * 5.2) % 2200) - 200;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: isLightMode ? lightBgColor : darkBgColor,
        overflow: 'hidden',
      }}
    >
      {/* 3 Moving Bokeh Mesh Orbs */}
      <div
        style={{
          position: 'absolute',
          left: 140 + Math.sin(frame * 0.05) * 260 + camX * 0.35,
          top: 280 + Math.cos(frame * 0.04) * 320 + camY * 0.35,
          width: 780,
          height: 780,
          borderRadius: 9999,
          background: isLightMode
            ? 'radial-gradient(circle, rgba(187, 247, 150, 0.85) 0%, rgba(241, 252, 235, 0) 70%)'
            : 'radial-gradient(circle, rgba(218, 255, 62, 0.42) 0%, rgba(16, 185, 129, 0.18) 45%, rgba(4, 32, 22, 0) 72%)',
          filter: 'blur(36px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: -120 + Math.cos(frame * 0.045) * 240 - camX * 0.4,
          bottom: 180 + Math.sin(frame * 0.055) * 290 - camY * 0.4,
          width: 860,
          height: 860,
          borderRadius: 9999,
          background: isLightMode
            ? 'radial-gradient(circle, rgba(217, 249, 120, 0.78) 0%, rgba(241, 252, 235, 0) 70%)'
            : 'radial-gradient(circle, rgba(16, 185, 129, 0.52) 0%, rgba(52, 211, 153, 0.2) 50%, rgba(4, 32, 22, 0) 74%)',
          filter: 'blur(40px)',
        }}
      />

      {/* Full-Canvas Moving Architectural Grid & Orbital Rings (guarantees continuous global optical flow) */}
      <svg
        width="1080"
        height="1920"
        viewBox="0 0 1080 1920"
        style={{
          position: 'absolute',
          inset: 0,
          transform: `translate3d(${camX * 0.55}px, ${camY * 0.55}px, 0) scale(${1.08 + Math.sin(frame * 0.03) * 0.04})`,
        }}
      >
        {/* Diagonal kinetic flow lines across entire viewport */}
        {[-600, -200, 200, 600, 1000, 1400, 1800].map((baseY, idx) => {
          const yShift = (baseY + frame * (idx % 2 === 0 ? 5.8 : -5.4)) % 2400 - 300;
          return (
            <g key={idx}>
              <line
                x1="-200"
                y1={yShift}
                x2="1280"
                y2={yShift + 420}
                stroke={strokeCol}
                strokeWidth="2"
                strokeDasharray="28 36"
                strokeDashoffset={-frame * 7}
              />
              <circle
                cx={((frame * (7 + idx) + idx * 190) % 1160) - 40}
                cy={(yShift + 210 + 1920) % 1920}
                r={idx % 2 === 0 ? 7 : 5}
                fill={accentCol}
              />
            </g>
          );
        })}

        {/* Rotating Giant Orbital Rings */}
        <g
          transform={`translate(540, 960) rotate(${frame * 1.35})`}
          opacity="0.75"
        >
          <ellipse
            cx="0"
            cy="0"
            rx="560"
            ry="820"
            fill="none"
            stroke={strokeCol}
            strokeWidth="2.5"
            strokeDasharray="160 120"
          />
          <ellipse
            cx="0"
            cy="0"
            rx="820"
            ry="540"
            fill="none"
            stroke={accentCol}
            strokeWidth="2.5"
            strokeDasharray="220 180"
          />
          <circle
            cx="0"
            cy="0"
            r="420"
            fill="none"
            stroke={strokeCol}
            strokeWidth="2"
            strokeDasharray="90 70"
          />
        </g>

        {/* Sweeping Energy Wave */}
        <circle
          cx={sweepX}
          cy={sweepY}
          r="260"
          fill="none"
          stroke={accentCol}
          strokeWidth="3"
          opacity="0.55"
        />
      </svg>
    </AbsoluteFill>
  );
};

// ============================================================================
// MAIN COMPOSITION: PinterestViet9x16 (1080x1920 @ 30fps, 1420 frames = 47.33s)
// ============================================================================
export const PinterestViet9x16: React.FC<PinterestViet9x16Props> = (rawProps) => {
  const props: Required<PinterestViet9x16Props> = {
    ...defaultPinterestViet9x16Props,
    ...rawProps,
  };
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Light Mint Mode active during 14.2s..23.8s (f426..f714) and 42.1s..47.33s (f1263..f1420)
  const isLightMode =
    (frame >= 426 && frame < 714) || frame >= 1263;

  // --------------------------------------------------------------------------
  // 1. CONTINUOUS GLOBAL CAMERA RIG + WHIP IMPULSES AT ALL 13 CUT POINTS
  // --------------------------------------------------------------------------
  let whipImpulseX = 0;
  let whipImpulseY = 0;
  let whipZoom = 0;
  let blurX = 0;
  let blurY = 0;
  let transitionChroma = 0;

  const whipScale = props.whipImpulseStrength;

  for (let i = 0; i < CUT_FRAMES.length; i++) {
    const cf = CUT_FRAMES[i];
    const dist = frame - cf;
    if (Math.abs(dist) <= 8) {
      const w = Math.cos((dist / 8) * (Math.PI / 2)) * whipScale;
      const dir = i % 2 === 0 ? 1 : -1;
      whipImpulseX += dir * Math.sin((dist / 8) * Math.PI) * 95 * whipScale;
      whipImpulseY += (i % 3 === 0 ? -1 : 1) * Math.sin((dist / 8) * Math.PI) * 65 * whipScale;
      whipZoom += w * 0.14;
      blurX = Math.max(blurX, w * 22);
      blurY = Math.max(blurY, w * 14);
      transitionChroma = Math.max(transitionChroma, w * 12);
    }
  }

  // Extra kinetic bursts in 8-12s (f240-360), 20-28s (f600-840), and 32-36s (f960-1080)
  // to match the high velocity peaks of the Pinterest original
  const highEnergyZone =
    (frame >= 240 && frame <= 360) ||
    (frame >= 600 && frame <= 840) ||
    (frame >= 960 && frame <= 1080);
  const energyMult = (highEnergyZone ? 1.65 : 1.15) * props.cameraEnergyMultiplier;

  const camX =
    Math.sin(frame * 0.085) * 34 * energyMult +
    Math.cos(frame * 0.17) * 14 +
    whipImpulseX;
  const camY =
    Math.cos(frame * 0.075) * 38 * energyMult +
    Math.sin(frame * 0.15) * 16 +
    whipImpulseY;
  const camScale =
    1.03 +
    Math.sin(frame * 0.06) * 0.035 * energyMult +
    whipZoom;
  const camRot = Math.sin(frame * 0.05) * 1.4 * energyMult;

  // Global Hero Daisy Flower coordinates (travels seamlessly across all scenes!)
  const heroFlowerX =
    540 +
    Math.sin(frame * 0.09) * 290 +
    whipImpulseX * 1.3;
  const heroFlowerY =
    420 +
    Math.cos(frame * 0.07) * 380 +
    whipImpulseY * 1.3;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: isLightMode ? props.lightBgColor : props.darkBgColor,
        overflow: 'hidden',
        fontFamily: "'SVN-Aeonik', sans-serif",
      }}
    >
      {/* SVG Directional Motion Blur Filter */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id="dirMotionBlur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation={`${blurX.toFixed(1)}, ${blurY.toFixed(1)}`}
            />
          </filter>
        </defs>
      </svg>

      {/* LAYER 0: CONTINUOUS ORBITAL BACKDROP */}
      <ContinuousOrbitalBackdrop
        frame={frame}
        isLightMode={isLightMode}
        camX={camX}
        camY={camY}
        darkBgColor={props.darkBgColor}
        lightBgColor={props.lightBgColor}
      />

      {/* LAYER 1: WORLD CAMERA CONTAINER WITH DIRECTIONAL MOTION BLUR */}
      <AbsoluteFill
        style={{
          transform: `translate3d(${camX}px, ${camY}px, 0) scale(${camScale}) rotate(${camRot}deg)`,
          filter: blurX > 1.2 || blurY > 1.2 ? 'url(#dirMotionBlur)' : undefined,
          willChange: 'transform, filter',
        }}
      >
        {/* ==================================================================
            SCENE 1 (f0 -> f142 | 0.0s -> 4.7s):
            "Mọi đột phá đều bắt đầu từ một [ 🌼 Tia sáng ] -> Ý TƯỞNG"
            ================================================================== */}
        {frame < 144 && (
          <Scene1SparkAndIdea frame={frame} fps={fps} t={props} />
        )}

        {/* ==================================================================
            SCENE 2 (f126 -> f278 | 4.2s -> 9.2s):
            "Bản phác thảo -> Một câu hỏi -> Điều gì xảy ra nếu nó [ BỨT PHÁ ] ?"
            ================================================================== */}
        {frame >= 126 && frame < 280 && (
          <Scene2SketchQuestionGrow frame={frame - 134} fps={fps} t={props} />
        )}

        {/* ==================================================================
            SCENE 3 (f262 -> f434 | 8.7s -> 14.4s):
            Portal Zoom -> Diagonal Studio Split -> "Biến [ Ý TƯỞNG ] thành trải nghiệm"
            ================================================================== */}
        {frame >= 262 && frame < 436 && (
          <Scene3PurposefulDesignStudio frame={frame - 270} fps={fps} t={props} />
        )}

        {/* ==================================================================
            SCENE 4 (f418 -> f604 | 13.9s -> 20.1s):
            Light Mint Mode: "TĂNG TRƯỞNG" Echo Stack -> "Người dùng cần SỰ RÕ RÀNG"
            ================================================================== */}
        {frame >= 418 && frame < 606 && (
          <Scene4GrowthAndClarity frame={frame - 426} fps={fps} t={props} />
        )}

        {/* ==================================================================
            SCENE 5 (f588 -> f722 | 19.6s -> 24.0s):
            Laptop B-Roll + 3D S-Curve Bezier Ribbon: "Không rối rắm — Chỉ có dòng chảy"
            ================================================================== */}
        {frame >= 588 && frame < 724 && (
          <Scene5RibbonFlowLaptop frame={frame - 596} fps={fps} t={props} />
        )}

        {/* ==================================================================
            SCENE 6 (f706 -> f886 | 23.5s -> 29.5s):
            3D Isometric Bento Glassmorphism Dashboard -> "Thiết kế định hình hành trình"
            ================================================================== */}
        {frame >= 706 && frame < 888 && (
          <Scene6BentoDashboard3D frame={frame - 714} fps={fps} t={props} />
        )}

        {/* ==================================================================
            SCENE 7 (f870 -> f1076 | 29.0s -> 35.8s):
            Smart Home UI -> "[ Bố cục thông minh ]" -> Neon Pipe "Hành động rõ ràng"
            ================================================================== */}
        {frame >= 870 && frame < 1078 && (
          <Scene7SmartHomeAndActions frame={frame - 879} fps={fps} t={props} />
        )}

        {/* ==================================================================
            SCENE 8 (f1060 -> f1272 | 35.3s -> 42.4s):
            "Tất cả được chế tác để tiến lên -> Không chỉ là VẺ BỀ NGOÀI"
            ================================================================== */}
        {frame >= 1060 && frame < 1274 && (
          <Scene8CraftedAndHowItLooks frame={frame - 1068} fps={fps} t={props} />
        )}

        {/* ==================================================================
            SCENE 9 (f1255 -> f1420 | 41.8s -> 47.33s):
            Light Mint Finale: "✳️ Mà là cách nó [ VẬN HÀNH ] -> ✳️ Sẵn sàng bứt phá?"
            ================================================================== */}
        {frame >= 1255 && (
          <Scene9WorksAndReadyFinale frame={frame - 1263} fps={fps} t={props} />
        )}

        {/* CONTINUOUS SHARED GUIDE MOTIF: Travelling Daisy Sparkle across scenes */}
        <div
          style={{
            position: 'absolute',
            left: heroFlowerX,
            top: heroFlowerY,
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: 60,
          }}
        >
          <DaisyFlowerSVG
            size={62}
            petalColor={isLightMode ? props.emeraldAccentColor : props.limeAccentColor}
            centerColor={isLightMode ? props.deepEmeraldColor : '#F59E0B'}
            rotationDeg={frame * 7.5}
            glowColor={
              isLightMode
                ? 'rgba(16, 185, 129, 0.45)'
                : 'rgba(218, 255, 62, 0.65)'
            }
          />
        </div>
      </AbsoluteFill>

      {/* LAYER 2: CAPCUT OPTICAL EDGE VIGNETTE & TRANSITION CHROMA BURST */}
      <AbsoluteFill
        style={{
          pointerEvents: 'none',
          boxShadow: isLightMode
            ? 'inset 0 0 140px rgba(16, 120, 68, 0.18)'
            : 'inset 0 0 160px rgba(0, 0, 0, 0.65)',
          border:
            transitionChroma > 1.5
              ? `${Math.round(transitionChroma * 0.7)}px solid rgba(218, 255, 62, 0.35)`
              : 'none',
        }}
      />
      {transitionChroma > 1.5 && (
        <AbsoluteFill
          style={{
            pointerEvents: 'none',
            mixBlendMode: 'screen',
            background: `radial-gradient(circle at 50% 50%, transparent 55%, rgba(239, 68, 68, ${(
              transitionChroma * 0.025
            ).toFixed(3)}) 82%, rgba(59, 130, 246, ${(
              transitionChroma * 0.035
            ).toFixed(3)}) 100%)`,
          }}
        />
      )}
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 1 (f0..142): "Mọi đột phá đều bắt đầu từ một [ 🌼 Tia sáng ] -> Ý TƯỞNG"
// ============================================================================
const Scene1SparkAndIdea: React.FC<{
  frame: number;
  fps: number;
  t: Required<PinterestViet9x16Props>;
}> = ({ frame, fps, t }) => {
  const enterP = spring({
    frame,
    fps,
    config: { mass: 0.8, damping: 13, stiffness: 160 },
  });
  const morphToIdeaP = interpolate(frame, [74, 96], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: WHIP_BEZIER,
  });
  const exitP = interpolate(frame, [124, 140], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EXPO_IN,
  });

  // Cursor Bezier flight from bottom right to click the "[ 🌼 Tia sáng ]" button at f44
  const curP = interpolate(frame, [12, 44], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EXPO_OUT,
  });
  const curX = interpolate(curP, [0, 1], [940, 580]) + Math.sin(frame * 0.14) * 18;
  const curY = interpolate(curP, [0, 1], [1560, 1085]) + Math.cos(frame * 0.12) * 14;
  const clickBurstP = interpolate(frame, [42, 76], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EXPO_OUT,
  });

  const ideaPopP = spring({
    frame: Math.max(0, frame - 82),
    fps,
    config: { mass: 0.85, damping: 11, stiffness: 185 },
  });

  return (
    <AbsoluteFill
      style={{
        opacity: clamp01(enterP) * (1 - exitP),
        transform: `scale(${0.92 + 0.08 * enterP + exitP * 0.35})`,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Part 1A: "Mọi đột phá / đều bắt đầu từ / [ 🌼 Tia sáng ]" */}
      <div
        style={{
          position: 'absolute',
          width: 920,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 28,
          opacity: 1 - morphToIdeaP,
          transform: `translate3d(0, ${-morphToIdeaP * 260 + Math.sin(frame * 0.1) * 12}px, 0) scale(${1 + morphToIdeaP * 0.35})`,
        }}
      >
        <div
          style={{
            fontSize: 92,
            fontWeight: 900,
            color: t.limeAccentColor,
            letterSpacing: '-0.03em',
            textAlign: 'center',
            textShadow: '0 0 36px rgba(218, 255, 62, 0.45)',
          }}
        >
          {nfc(t.scene1Headline)}
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 500,
            color: t.lightTextColor,
            textAlign: 'center',
            opacity: interpolate(frame, [10, 26], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
          }}
        >
          {nfc(t.scene1Subline)}
        </div>

        {/* Interactive Spark Pill Button */}
        <div
          style={{
            marginTop: 18,
            padding: '24px 54px',
            borderRadius: 999,
            background:
              frame >= 44
                ? 'linear-gradient(135deg, rgba(218, 255, 62, 0.32) 0%, rgba(16, 185, 129, 0.48) 100%)'
                : 'rgba(16, 85, 58, 0.72)',
            border:
              frame >= 44
                ? `3.5px solid ${t.limeAccentColor}`
                : '2.5px solid rgba(134, 239, 172, 0.65)',
            boxShadow:
              frame >= 44
                ? '0 0 65px rgba(218, 255, 62, 0.65)'
                : '0 20px 50px rgba(0,0,0,0.45)',
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            transform: `scale(${frame >= 44 ? 1.12 - clickBurstP * 0.06 : 1})`,
          }}
        >
          <DaisyFlowerSVG
            size={64}
            petalColor={t.limeAccentColor}
            centerColor="#FFFFFF"
            rotationDeg={frame * 8}
            glowColor="rgba(218, 255, 62, 0.8)"
          />
          <span
            style={{
              fontSize: 62,
              fontWeight: 800,
              color: frame >= 44 ? '#FFFFFF' : '#A7F3D0',
              letterSpacing: '-0.02em',
            }}
          >
            {nfc(t.scene1PillText)}
          </span>
        </div>

        {/* Radial Spark Rays on Click (f44..f76) */}
        {frame >= 42 && (
          <svg
            width="700"
            height="700"
            viewBox="-350 -350 700 700"
            style={{
              position: 'absolute',
              top: 250,
              pointerEvents: 'none',
            }}
          >
            {[0, 45, 90, 135, 180, 225, 270, 315].map((ang) => {
              const r0 = 70 + clickBurstP * 190;
              const r1 = r0 + 55 * (1 - clickBurstP * 0.5);
              return (
                <line
                  key={ang}
                  x1={0}
                  y1={-r0}
                  x2={0}
                  y2={-r1}
                  stroke={t.limeAccentColor}
                  strokeWidth="10"
                  strokeLinecap="round"
                  opacity={1 - clickBurstP}
                  transform={`rotate(${ang})`}
                />
              );
            })}
          </svg>
        )}
      </div>

      {/* 3D Cursor */}
      {frame < 90 && (
        <div
          style={{
            position: 'absolute',
            left: curX,
            top: curY,
            opacity: 1 - morphToIdeaP,
          }}
        >
          <PointerCursorSVG
            scale={1.35}
            rotateDeg={-12 + curP * 12}
            color={t.limeAccentColor}
          />
        </div>
      )}

      {/* Part 1B (f76..f142): Intersecting Glowing Orbit Rings + "Ý TƯỞNG" */}
      {frame >= 74 && (
        <AbsoluteFill
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            opacity: morphToIdeaP,
            transform: `scale(${0.75 + 0.25 * ideaPopP})`,
          }}
        >
          <svg
            width="1080"
            height="1920"
            viewBox="0 0 1080 1920"
            style={{ position: 'absolute', inset: 0 }}
          >
            <circle
              cx="540"
              cy="320"
              r="680"
              fill="none"
              stroke={t.limeAccentColor}
              strokeWidth="5"
              strokeDasharray="420 900"
              strokeDashoffset={-frame * 18}
            />
            <circle
              cx="540"
              cy="1600"
              r="680"
              fill="none"
              stroke="#34D399"
              strokeWidth="5"
              strokeDasharray="420 900"
              strokeDashoffset={frame * 18}
            />
            <circle
              cx="-120"
              cy="960"
              r="680"
              fill="none"
              stroke="rgba(167, 243, 208, 0.55)"
              strokeWidth="3.5"
            />
            <circle
              cx="1200"
              cy="960"
              r="680"
              fill="none"
              stroke="rgba(167, 243, 208, 0.55)"
              strokeWidth="3.5"
            />
          </svg>
          <div
            style={{
              fontSize: 138,
              fontWeight: 800,
              color: t.lightTextColor,
              letterSpacing: '-0.03em',
              textShadow: '0 0 50px rgba(52, 211, 153, 0.65)',
              transform: `translateY(${Math.sin(frame * 0.15) * 16}px)`,
            }}
          >
            {nfc(t.scene1HeroWord)}
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 2 (local f0..144 | Global f134..270):
// "Bản phác thảo -> Một câu hỏi -> Điều gì xảy ra nếu nó [ BỨT PHÁ ] ?"
// ============================================================================
const Scene2SketchQuestionGrow: React.FC<{
  frame: number;
  fps: number;
  t: Required<PinterestViet9x16Props>;
}> = ({ frame, fps, t }) => {
  const enterP = spring({
    frame: Math.max(0, frame + 8),
    fps,
    config: { mass: 0.75, damping: 12, stiffness: 170 },
  });
  const exitP = interpolate(frame, [126, 142], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EXPO_IN,
  });

  // Sub-phase transitions: Sketch (0..46), Question (40..88), Grow Diamond (80..144)
  const toQuestionP = interpolate(frame, [38, 54], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: WHIP_BEZIER,
  });
  const toGrowP = interpolate(frame, [78, 94], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: WHIP_BEZIER,
  });

  return (
    <AbsoluteFill
      style={{
        opacity: clamp01(enterP) * (1 - exitP),
        transform: `scale(${0.9 + 0.1 * enterP + exitP * 0.45})`,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* 2A: "Bản phác thảo" sliding along glowing emerald ring */}
      {frame < 58 && (
        <AbsoluteFill
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            opacity: 1 - toQuestionP,
            transform: `translateX(${-toQuestionP * 420}px) rotate(${-toQuestionP * 18}deg)`,
          }}
        >
          <div
            style={{
              position: 'absolute',
              bottom: -260,
              width: 1180,
              height: 1180,
              borderRadius: 9999,
              border: '38px solid rgba(52, 211, 153, 0.42)',
              boxShadow:
                '0 0 120px 30px rgba(16, 185, 129, 0.55), inset 0 0 80px rgba(218, 255, 62, 0.35)',
              transform: `scale(${0.92 + frame * 0.004})`,
            }}
          />
          <div
            style={{
              fontSize: 116,
              fontWeight: 900,
              color: t.limeAccentColor,
              transform: `translate3d(${frame * 4.5 - 90}px, ${-120 + Math.sin(frame * 0.12) * 35}px, 0) rotate(${-8 - frame * 0.35}deg)`,
              textShadow: '0 18px 40px rgba(0,0,0,0.55)',
            }}
          >
            {nfc(t.scene2PhaseA)}
          </div>
        </AbsoluteFill>
      )}

      {/* 2B: "Một câu hỏi" with stylized italic yellow accent */}
      {frame >= 36 && frame < 96 && (
        <AbsoluteFill
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            opacity: toQuestionP * (1 - toGrowP),
            transform: `translate3d(${(1 - toQuestionP) * 380 - toGrowP * 380}px, 0, 0)`,
          }}
        >
          <div
            style={{
              position: 'absolute',
              right: -340,
              width: 980,
              height: 980,
              borderRadius: 9999,
              border: '46px solid rgba(52, 211, 153, 0.38)',
              boxShadow: '0 0 110px 24px rgba(16, 185, 129, 0.5)',
            }}
          />
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: 18,
              padding: '0 80px',
            }}
          >
            <span
              style={{
                fontSize: 84,
                fontWeight: 500,
                color: '#A7F3D0',
              }}
            >
              {nfc(t.scene2PhaseBLead)}
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 22 }}>
              <span
                style={{
                  fontSize: 132,
                  fontWeight: 800,
                  color: t.lightTextColor,
                }}
              >
                {nfc(t.scene2PhaseBMain)}
              </span>
              <span
                style={{
                  fontFamily: "'GT-Sectra', Georgia, serif",
                  fontStyle: 'italic',
                  fontSize: 144,
                  fontWeight: 900,
                  color: t.limeAccentColor,
                  textShadow: '0 0 42px rgba(218, 255, 62, 0.55)',
                }}
              >
                {nfc(t.scene2PhaseBAccent)}
              </span>
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* 2C: Rotated Neon Diamond + "Điều gì xảy ra nếu nó [ BỨT PHÁ ] ?" */}
      {frame >= 76 && (
        <AbsoluteFill
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            opacity: toGrowP,
            transform: `scale(${0.84 + 0.16 * toGrowP})`,
          }}
        >
          {/* Rotating Glowing Diamond Card in Upper Center */}
          <div
            style={{
              width: 460,
              height: 460,
              borderRadius: 48,
              background: 'rgba(16, 95, 62, 0.42)',
              border: `5px solid ${t.limeAccentColor}`,
              boxShadow:
                '0 0 85px rgba(218, 255, 62, 0.45), inset 0 0 50px rgba(52, 211, 153, 0.35)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              transform: `translateY(-190px) rotate(${45 - (frame - 76) * 1.1}deg)`,
            }}
          >
            <DaisyFlowerSVG
              size={185}
              petalColor="#FACC15"
              centerColor="#FEF08A"
              rotationDeg={frame * 5}
              glowColor="rgba(250, 204, 21, 0.85)"
            />
          </div>

          {/* Lower Typography + Figma Selection Bounding Box */}
          <div
            style={{
              position: 'absolute',
              bottom: 320,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 28,
            }}
          >
            <div
              style={{
                fontSize: 64,
                fontWeight: 600,
                color: t.lightTextColor,
                textAlign: 'center',
              }}
            >
              {nfc(t.scene2PhaseCLead)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <FigmaSelectionBox
                borderColor="#86EFAC"
                padding="14px 38px"
                progress={clamp01((frame - 84) / 14)}
              >
                <span
                  style={{
                    fontSize: 96,
                    fontWeight: 900,
                    color: t.limeAccentColor,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {nfc(t.scene2PhaseCHighlight)}
                </span>
              </FigmaSelectionBox>
              <span
                style={{
                  fontSize: 96,
                  fontWeight: 900,
                  color: t.lightTextColor,
                }}
              >
                ?
              </span>
            </div>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 3 (local f0..164 | Global f270..426):
// Portal Zoom (f0..43) -> Diagonal Split Studio (f43..156)
// "Đó là nơi thiết kế có chủ đích bắt đầu -> Biến [ Ý TƯỞNG ] thành trải nghiệm"
// ============================================================================
const Scene3PurposefulDesignStudio: React.FC<{
  frame: number;
  fps: number;
  t: Required<PinterestViet9x16Props>;
}> = ({ frame, fps, t }) => {
  const splitOpenP = interpolate(frame, [36, 62], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EXPO_OUT,
  });
  const exitP = interpolate(frame, [142, 158], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EXPO_IN,
  });

  const ideaBoxP = spring({
    frame: Math.max(0, frame - 66),
    fps,
    config: { mass: 0.8, damping: 12, stiffness: 175 },
  });

  return (
    <AbsoluteFill
      style={{
        opacity: 1 - exitP,
        transform: `scale(${1 + exitP * 0.28})`,
        overflow: 'hidden',
      }}
    >
      {/* Background Studio Designer B-Roll with Continuous Pan & Scale */}
      <AbsoluteFill
        style={{
          transform: `scale(${1.12 + frame * 0.0018}) translate3d(${
            Math.sin(frame * 0.08) * 28
          }px, ${Math.cos(frame * 0.07) * 24}px, 0)`,
        }}
      >
        <Img
          src={staticFile('pinterest_ref/broll_designer.jpg')}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'brightness(0.72) contrast(1.12) saturate(1.2)',
          }}
        />
      </AbsoluteFill>

      {/* Animated 8x10 Dot-Matrix Overlay */}
      <svg
        width="1080"
        height="1920"
        viewBox="0 0 1080 1920"
        style={{
          position: 'absolute',
          inset: 0,
          opacity: clamp01((frame - 20) / 20),
        }}
      >
        {Array.from({ length: 10 }).map((_, rIdx) =>
          Array.from({ length: 8 }).map((__, cIdx) => {
            const wave = Math.sin(frame * 0.16 + cIdx * 0.5 + rIdx * 0.4) * 10;
            const cx = 155 + cIdx * 110 + wave;
            const cy = 420 + rIdx * 115 - wave;
            const isLime = cIdx >= 4;
            return (
              <circle
                key={`${rIdx}-${cIdx}`}
                cx={cx}
                cy={cy}
                r={6.5}
                fill={isLime ? t.limeAccentColor : '#34D399'}
                opacity={0.82}
              />
            );
          })
        )}
      </svg>

      {/* Center Kinetic Typography Stack */}
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: '0 92px',
          gap: 26,
          transform: `translateY(${Math.sin(frame * 0.1) * 14}px)`,
        }}
      >
        <div
          style={{
            fontSize: 42,
            fontWeight: 700,
            color: '#A7F3D0',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            opacity: clamp01(frame / 18),
          }}
        >
          {nfc(t.scene3Badge)}
        </div>

        <div
          style={{
            fontSize: 108,
            fontWeight: 800,
            color: t.limeAccentColor,
            lineHeight: 1.05,
            textShadow: '0 14px 36px rgba(0,0,0,0.65)',
          }}
        >
          {nfc(t.scene3Verb)}
        </div>

        <div
          style={{
            padding: '16px 42px',
            borderRadius: 18,
            background: `linear-gradient(90deg, #4ADE80 0%, ${t.limeAccentColor} 100%)`,
            boxShadow: '0 22px 55px rgba(74, 222, 128, 0.45)',
            transform: `scale(${0.75 + 0.25 * ideaBoxP}) rotate(${-2 + ideaBoxP * 2}deg)`,
          }}
        >
          <span
            style={{
              fontSize: 112,
              fontWeight: 900,
              color: t.darkBgColor,
              letterSpacing: '-0.03em',
            }}
          >
            {nfc(t.scene3HeroBox)}
          </span>
        </div>

        <div
          style={{
            fontSize: 88,
            fontWeight: 800,
            color: '#FFFFFF',
            lineHeight: 1.12,
            textShadow: '0 14px 36px rgba(0,0,0,0.75)',
          }}
        >
          {nfc(t.scene3TailWhite)}
          <span style={{ color: t.limeAccentColor }}>{nfc(t.scene3TailAccent)}</span>
        </div>
      </AbsoluteFill>

      {/* Diagonal Emerald Split Doors Opening (f0..f62) */}
      {splitOpenP < 0.99 && (
        <AbsoluteFill style={{ pointerEvents: 'none' }}>
          <div
            style={{
              position: 'absolute',
              inset: -200,
              background: `linear-gradient(135deg, ${t.darkBgColor} 0%, ${t.deepEmeraldColor} 100%)`,
              borderBottom: `8px solid ${t.limeAccentColor}`,
              transform: `rotate(-18deg) translateY(${-55 - splitOpenP * 75}%)`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: -200,
              background: `linear-gradient(135deg, ${t.deepEmeraldColor} 0%, ${t.darkBgColor} 100%)`,
              borderTop: `8px solid ${t.limeAccentColor}`,
              transform: `rotate(-18deg) translateY(${55 + splitOpenP * 75}%)`,
            }}
          />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 4 (local f0..178 | Global f426..596):
// Light Mint Mode: "TĂNG TRƯỞNG" 7-Row Echo Stack -> "Người dùng cần SỰ RÕ RÀNG"
// ============================================================================
const Scene4GrowthAndClarity: React.FC<{
  frame: number;
  fps: number;
  t: Required<PinterestViet9x16Props>;
}> = ({ frame, fps, t }) => {
  const enterP = spring({
    frame: Math.max(0, frame + 6),
    fps,
    config: { mass: 0.8, damping: 12, stiffness: 170 },
  });
  const toClarityP = interpolate(frame, [82, 102], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: WHIP_BEZIER,
  });
  const exitP = interpolate(frame, [160, 174], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EXPO_IN,
  });

  return (
    <AbsoluteFill
      style={{
        opacity: clamp01(enterP) * (1 - exitP),
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Part 4A (f0..f102): 7-Tier Kinetic Echo Repeat "TĂNG TRƯỞNG" */}
      {frame < 106 && (
        <AbsoluteFill
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            opacity: 1 - toClarityP,
            transform: `translateX(${-toClarityP * 480}px)`,
          }}
        >
          {/* Left Giant Thin Ring */}
          <div
            style={{
              position: 'absolute',
              left: -420,
              width: 1120,
              height: 1120,
              borderRadius: 9999,
              background: 'rgba(187, 247, 170, 0.52)',
              border: '3.5px solid #166534',
              transform: `translateX(${frame * 2.4}px)`,
            }}
          />

          {/* 7-Row Echo Stack */}
          {[-3, -2, -1, 0, 1, 2, 3].map((row) => {
            const isHero = row === 0;
            const yOffset = row * 165 + Math.sin(frame * 0.14 + row) * 18;
            const xSlide = (row % 2 === 0 ? 1 : -1) * Math.cos(frame * 0.1) * 32;
            return (
              <div
                key={row}
                style={{
                  position: 'absolute',
                  transform: `translate3d(${xSlide}px, ${yOffset}px, 0) scale(${
                    isHero ? 1.08 : 0.96
                  })`,
                  fontSize: isHero ? 118 : 106,
                  fontWeight: 900,
                  color: isHero ? t.deepEmeraldColor : 'rgba(6, 78, 59, 0.13)',
                  background: isHero ? t.limeAccentColor : 'transparent',
                  padding: isHero ? '10px 38px' : '0',
                  borderRadius: 24,
                  boxShadow: isHero
                    ? '0 24px 60px rgba(132, 204, 22, 0.45)'
                    : 'none',
                  letterSpacing: '-0.03em',
                  whiteSpace: 'nowrap',
                }}
              >
                {nfc(t.scene4EchoWord)}
              </div>
            );
          })}

          {/* Flying Dark Emerald Capsule Pill */}
          <div
            style={{
              position: 'absolute',
              width: 110,
              height: 240,
              borderRadius: 999,
              background: t.deepEmeraldColor,
              boxShadow: '0 22px 45px rgba(6, 78, 59, 0.38)',
              transform: `translate3d(${280 - frame * 5.5}px, ${
                -80 + Math.sin(frame * 0.18) * 90
              }px, 0) rotate(${38 - frame * 2.4}deg)`,
            }}
          />
        </AbsoluteFill>
      )}

      {/* Part 4B (f82..f178): S-Curve Ribbon + "SỰ RÕ RÀNG" */}
      {frame >= 80 && (
        <AbsoluteFill
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            opacity: toClarityP,
            transform: `translateX(${(1 - toClarityP) * 420}px)`,
          }}
        >
          {/* Giant Background Watermark Text */}
          {[-420, 0, 420].map((yPos, idx) => (
            <div
              key={idx}
              style={{
                position: 'absolute',
                top: 880 + yPos,
                fontSize: 168,
                fontWeight: 900,
                color: 'rgba(6, 78, 59, 0.08)',
                letterSpacing: '-0.04em',
                whiteSpace: 'nowrap',
                transform: `translateX(${(idx % 2 === 0 ? 1 : -1) * (frame - 80) * 3.5}px)`,
              }}
            >
              {nfc(t.scene4Watermark)}
            </div>
          ))}

          {/* Smooth Anti-Aliased SVG Bezier S-Ribbon */}
          <svg
            width="1080"
            height="1920"
            viewBox="0 0 1080 1920"
            style={{ position: 'absolute', inset: 0 }}
          >
            <path
              d="M 820 -80 C 220 420, 960 1120, 260 1980"
              fill="none"
              stroke={t.deepEmeraldColor}
              strokeWidth="112"
              strokeLinecap="round"
            />
            <path
              d="M 820 -80 C 220 420, 960 1120, 260 1980"
              fill="none"
              stroke="#C6F626"
              strokeWidth="112"
              strokeLinecap="round"
              strokeDasharray="950 2400"
              strokeDashoffset={900 - (frame - 80) * 18}
            />
          </svg>

          {/* Center Badge & Avatars */}
          <div
            style={{
              padding: '28px 62px',
              borderRadius: 32,
              background: t.deepEmeraldColor,
              border: `4px solid ${t.limeAccentColor}`,
              boxShadow: '0 28px 65px rgba(6, 78, 59, 0.35)',
              transform: `rotate(-8deg) scale(${0.9 + Math.sin(frame * 0.15) * 0.05})`,
            }}
          >
            <span
              style={{
                fontSize: 82,
                fontWeight: 900,
                color: t.limeAccentColor,
                letterSpacing: '-0.02em',
              }}
            >
              {nfc(t.scene4CenterBadge)}
            </span>
          </div>

          <div
            style={{
              position: 'absolute',
              left: 190,
              top: 520 + Math.sin(frame * 0.14) * 28,
            }}
          >
            <LineArtFaceAvatarSVG size={126} rotationDeg={frame * 1.5} />
          </div>
          <div
            style={{
              position: 'absolute',
              right: 170,
              bottom: 480 + Math.cos(frame * 0.14) * 28,
            }}
          >
            <LineArtFaceAvatarSVG
              size={126}
              bgColor="#ECFCCB"
              rotationDeg={-frame * 1.5}
            />
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 5 (local f0..126 | Global f596..714):
// Laptop User B-Roll + 3D S-Curve Ribbon Wrapping Frame
// "Không rối rắm — Không chờ đợi — Chỉ có dòng chảy & sự tối giản"
// ============================================================================
const Scene5RibbonFlowLaptop: React.FC<{
  frame: number;
  fps: number;
  t: Required<PinterestViet9x16Props>;
}> = ({ frame, fps, t }) => {
  const enterP = spring({
    frame: Math.max(0, frame + 6),
    fps,
    config: { mass: 0.85, damping: 12, stiffness: 165 },
  });
  const exitP = interpolate(frame, [106, 122], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EXPO_IN,
  });

  const ribbonDrawP = interpolate(frame, [0, 68], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EXPO_OUT,
  });

  return (
    <AbsoluteFill
      style={{
        opacity: clamp01(enterP) * (1 - exitP),
        transform: `scale(${0.88 + 0.12 * enterP + exitP * 0.4})`,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Top Headline */}
      <div
        style={{
          position: 'absolute',
          top: 230,
          padding: '16px 42px',
          borderRadius: 999,
          background: t.deepEmeraldColor,
          color: t.limeAccentColor,
          fontSize: 48,
          fontWeight: 800,
          boxShadow: '0 18px 45px rgba(6, 78, 59, 0.28)',
          transform: `translateY(${Math.sin(frame * 0.14) * 12}px)`,
        }}
      >
        {nfc(t.scene5TopPill)}
      </div>

      {/* Central Framed Laptop User Photo with Continuous Inner Parallax */}
      <div
        style={{
          width: 920,
          height: 760,
          borderRadius: 36,
          overflow: 'hidden',
          border: '8px solid #FFFFFF',
          boxShadow: '0 38px 90px rgba(6, 78, 59, 0.32)',
          transform: `rotate(${Math.sin(frame * 0.08) * 2.2}deg) scale(${
            1 + Math.cos(frame * 0.1) * 0.025
          })`,
        }}
      >
        <Img
          src={staticFile('pinterest_ref/broll_laptop.jpg')}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${1.08 + frame * 0.0015}) translateX(${
              Math.sin(frame * 0.09) * 18
            }px)`,
          }}
        />
      </div>

      {/* Ultra-Smooth Anti-Aliased SVG Bezier Ribbon Looping Around Photo */}
      <svg
        width="1080"
        height="1920"
        viewBox="0 0 1080 1920"
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      >
        <defs>
          <linearGradient id="ribbonGrad5" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={t.deepEmeraldColor} />
            <stop offset="45%" stopColor={t.emeraldAccentColor} />
            <stop offset="100%" stopColor="#C6F626" />
          </linearGradient>
        </defs>
        <path
          d="M 140 -40 C 80 620, 420 980, 680 780 C 920 580, 440 320, 460 760 C 480 1160, 780 1380, 980 1560"
          fill="none"
          stroke="url(#ribbonGrad5)"
          strokeWidth="84"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="3200"
          strokeDashoffset={3200 * (1 - ribbonDrawP)}
        />
      </svg>

      {/* Bottom Floating Ribbon Banner */}
      <div
        style={{
          position: 'absolute',
          bottom: 250,
          padding: '22px 52px',
          borderRadius: 999,
          background: 'linear-gradient(90deg, #C6F626 0%, #4ADE80 100%)',
          border: `3px solid ${t.deepEmeraldColor}`,
          color: t.darkBgColor,
          fontSize: 52,
          fontWeight: 900,
          boxShadow: '0 22px 55px rgba(6, 78, 59, 0.28)',
          transform: `rotate(-3deg) translateY(${Math.cos(frame * 0.14) * 14}px)`,
        }}
      >
        {nfc(t.scene5BottomBanner)}
      </div>

      {/* Line-art Face Avatars */}
      <div style={{ position: 'absolute', left: 78, top: 960 }}>
        <LineArtFaceAvatarSVG size={116} rotationDeg={frame * 2} />
      </div>
      <div style={{ position: 'absolute', right: 82, bottom: 380 }}>
        <LineArtFaceAvatarSVG size={116} rotationDeg={-frame * 2} />
      </div>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 6 (local f0..172 | Global f714..879):
// 3D Isometric Bento Glassmorphism Dashboard (f0..120) -> "Thiết kế" (f120..172)
// ============================================================================
const Scene6BentoDashboard3D: React.FC<{
  frame: number;
  fps: number;
  t: Required<PinterestViet9x16Props>;
}> = ({ frame, fps, t }) => {
  const enterP = spring({
    frame: Math.max(0, frame + 6),
    fps,
    config: { mass: 0.85, damping: 12, stiffness: 170 },
  });
  // Cut at global 26.2s (local f72) = dramatic 3D isometric tilt & zoom!
  const isoTiltP = interpolate(frame, [62, 86], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: WHIP_BEZIER,
  });
  // Cut at global 27.8s (local f120) = morph into "Thiết kế" + Neon Highlighter
  const toDesignWordP = interpolate(frame, [114, 130], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: WHIP_BEZIER,
  });
  const exitP = interpolate(frame, [152, 168], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EXPO_IN,
  });

  const metricScale = clamp01(frame / 55);
  const revVal = Math.round(1250 * metricScale);

  return (
    <AbsoluteFill
      style={{
        opacity: clamp01(enterP) * (1 - exitP),
        justifyContent: 'center',
        alignItems: 'center',
        perspective: 1400,
      }}
    >
      {/* Part 6A (f0..f130): 3D Isometric Bento Glassmorphism Dashboard */}
      {frame < 134 && (
        <div
          style={{
            width: 960,
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
            opacity: 1 - toDesignWordP,
            transform: `rotateX(${8 + isoTiltP * 14}deg) rotateY(${
              -6 - isoTiltP * 16
            }deg) rotateZ(${isoTiltP * 4}deg) scale(${
              0.92 + 0.08 * enterP + isoTiltP * 0.14
            })`,
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Row 1: Login Card + User Profile Card */}
          <div style={{ display: 'flex', gap: 24 }}>
            <div
              style={{
                flex: 1.15,
                padding: 32,
                borderRadius: 28,
                background: 'rgba(16, 90, 62, 0.62)',
                border: '2px solid rgba(134, 239, 172, 0.55)',
                backdropFilter: 'blur(16px)',
                boxShadow: '0 24px 55px rgba(0,0,0,0.45)',
              }}
            >
              <div style={{ fontSize: 34, fontWeight: 800, color: t.limeAccentColor }}>
                {nfc(t.scene6LoginTitle)}
              </div>
              <div
                style={{
                  marginTop: 18,
                  height: 44,
                  borderRadius: 999,
                  background: 'rgba(52, 211, 153, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 20px',
                  color: '#A7F3D0',
                  fontSize: 22,
                }}
              >
                • • • • • • • • • •
              </div>
              <div
                style={{
                  marginTop: 18,
                  height: 50,
                  borderRadius: 999,
                  background: t.limeAccentColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: t.darkBgColor,
                  fontSize: 24,
                  fontWeight: 900,
                }}
              >
                {nfc(t.scene6LoginCta)}
              </div>
            </div>

            <div
              style={{
                flex: 0.95,
                padding: 32,
                borderRadius: 28,
                background: 'rgba(16, 90, 62, 0.62)',
                border: '2px solid rgba(134, 239, 172, 0.55)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                <LineArtFaceAvatarSVG size={68} />
                <div>
                  <div
                    style={{ fontSize: 28, fontWeight: 800, color: t.limeAccentColor }}
                  >
                    {nfc(t.scene6ProfileName)}
                  </div>
                  <div style={{ fontSize: 20, color: '#A7F3D0' }}>
                    ★★★★★ 5.0
                  </div>
                </div>
              </div>
              <div
                style={{
                  height: 46,
                  borderRadius: 999,
                  background: '#FFFFFF',
                  color: t.darkBgColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  fontWeight: 800,
                }}
              >
                {nfc(t.scene6ProfileCta)}
              </div>
            </div>
          </div>

          {/* Row 2: Highlight Update (5 Progress Rings) */}
          <div
            style={{
              padding: '26px 34px',
              borderRadius: 28,
              background: 'rgba(16, 90, 62, 0.62)',
              border: '2px solid rgba(134, 239, 172, 0.55)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            {[0, 1, 2, 3, 4].map((idx) => (
              <div
                key={idx}
                style={{
                  width: 112,
                  height: 112,
                  borderRadius: 999,
                  border: '4px solid #4ADE80',
                  background:
                    idx === 0
                      ? '#FFFFFF'
                      : `radial-gradient(circle, ${t.limeAccentColor} 0%, #4ADE80 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 26,
                  fontWeight: 900,
                  color: t.darkBgColor,
                  transform: `scale(${0.92 + Math.sin(frame * 0.15 + idx) * 0.08})`,
                }}
              >
                {`${82 + idx * 4}%`}
              </div>
            ))}
          </div>

          {/* Row 3: Hero Graphic Wave Chart ("100k" Badge + 4 Metrics) */}
          <div
            style={{
              padding: 36,
              borderRadius: 32,
              background: 'rgba(10, 68, 46, 0.78)',
              border: `2.5px solid ${t.limeAccentColor}`,
              boxShadow: '0 28px 70px rgba(0,0,0,0.55)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: 28, fontWeight: 700, color: '#A7F3D0' }}>
                {nfc(t.scene6ChartTitle)}
              </span>
              <div
                style={{
                  padding: '10px 28px',
                  borderRadius: 16,
                  background: t.limeAccentColor,
                  color: t.darkBgColor,
                  fontSize: 32,
                  fontWeight: 900,
                }}
              >
                {nfc(t.scene6ChartBadge)}
              </div>
            </div>

            <svg
              width="880"
              height="220"
              viewBox="0 0 880 220"
              style={{ marginTop: 16 }}
            >
              <path
                d={`M 20 180 Q 180 ${150 - Math.sin(frame * 0.15) * 35}, 340 160 T 580 ${
                  45 + Math.cos(frame * 0.15) * 25
                } T 860 130`}
                fill="none"
                stroke={t.limeAccentColor}
                strokeWidth="7"
                strokeLinecap="round"
              />
            </svg>

            <div
              style={{
                marginTop: 18,
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              {[
                `${revVal}k`,
                `${Math.round(210 * metricScale)}k`,
                `${Math.round(764 * metricScale)}k`,
                `${Math.round(250 * metricScale)}k`,
              ].map((val, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: 40,
                    fontWeight: 900,
                    color: t.limeAccentColor,
                  }}
                >
                  {val}
                </div>
              ))}
            </div>
          </div>

          {/* Row 4: Schedule Calendar Strip */}
          <div
            style={{
              padding: '24px 36px',
              borderRadius: 28,
              background: 'rgba(16, 90, 62, 0.62)',
              border: '2px solid rgba(134, 239, 172, 0.55)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((d, idx) => {
              const active = idx === 3;
              return (
                <div
                  key={d}
                  style={{
                    padding: active ? '18px 26px' : '12px 18px',
                    borderRadius: 18,
                    background: active ? t.limeAccentColor : 'transparent',
                    color: active ? t.darkBgColor : '#D1FAE5',
                    fontSize: 28,
                    fontWeight: 900,
                  }}
                >
                  {d}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Part 6B (f116..f172): "Thiết kế định hình hành trình" + Neon Brush Stroke */}
      {frame >= 114 && (
        <AbsoluteFill
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            opacity: toDesignWordP,
            transform: `scale(${0.82 + 0.18 * toDesignWordP})`,
          }}
        >
          <div
            style={{
              fontSize: 128,
              fontWeight: 900,
              color: t.lightTextColor,
              letterSpacing: '-0.03em',
            }}
          >
            {nfc(t.scene6HeroWord)}
          </div>
          {/* Double Highlighter Brush Stroke */}
          <div
            style={{
              marginTop: 14,
              width: 560 * clamp01((frame - 120) / 18),
              height: 36,
              borderRadius: 999,
              background: t.limeAccentColor,
              boxShadow: '0 0 45px rgba(218, 255, 62, 0.75)',
              transform: 'rotate(-2deg)',
            }}
          />
          <div
            style={{
              marginTop: 34,
              fontSize: 56,
              fontWeight: 600,
              color: '#A7F3D0',
            }}
          >
            {nfc(t.scene6Subline)}
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 7 (local f0..195 | Global f879..1068):
// Smart Home UI (f0..96) -> "[ Bố cục thông minh ]" (f96..132) -> Neon Pipe "Hành động rõ ràng" (f132..195)
// ============================================================================
const Scene7SmartHomeAndActions: React.FC<{
  frame: number;
  fps: number;
  t: Required<PinterestViet9x16Props>;
}> = ({ frame, fps, t }) => {
  const enterP = spring({
    frame: Math.max(0, frame + 6),
    fps,
    config: { mass: 0.8, damping: 12, stiffness: 170 },
  });
  const toSmartLayoutP = interpolate(frame, [90, 104], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: WHIP_BEZIER,
  });
  const toClearActionsP = interpolate(frame, [126, 140], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: WHIP_BEZIER,
  });
  const exitP = interpolate(frame, [176, 192], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EXPO_IN,
  });

  const pipeDrawP = interpolate(frame, [132, 178], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EXPO_OUT,
  });

  return (
    <AbsoluteFill
      style={{
        opacity: clamp01(enterP) * (1 - exitP),
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Part 7A (f0..f104): Smart Home Tablet Dashboard */}
      {frame < 106 && (
        <div
          style={{
            width: 940,
            padding: 38,
            borderRadius: 42,
            background: 'rgba(8, 56, 38, 0.88)',
            border: '4px solid #A7F3D0',
            boxShadow: '0 36px 90px rgba(0,0,0,0.6)',
            display: 'flex',
            flexDirection: 'column',
            gap: 28,
            opacity: 1 - toSmartLayoutP,
            transform: `scale(${0.9 + 0.1 * enterP + toSmartLayoutP * 0.25}) rotate(${
              Math.sin(frame * 0.1) * 1.5
            }deg)`,
          }}
        >
          {/* Weather Card "Xin chào, Anh Việt • 26°C" */}
          <div
            style={{
              padding: 38,
              borderRadius: 32,
              background: `linear-gradient(135deg, ${t.limeAccentColor} 0%, #4ADE80 100%)`,
              color: t.darkBgColor,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: 48, fontWeight: 900 }}>
                {nfc(t.scene7Greeting)}
              </div>
              <div style={{ fontSize: 40, fontWeight: 800, marginTop: 12 }}>
                {nfc(t.scene7WeatherSub)}
              </div>
            </div>
            <DaisyFlowerSVG
              size={96}
              petalColor={t.darkBgColor}
              centerColor={t.limeAccentColor}
              rotationDeg={frame * 5}
            />
          </div>

          {/* 2 Circular Gauges: 45% & 60% */}
          <div style={{ display: 'flex', gap: 28 }}>
            {[
              { label: nfc(t.scene7Gauge1Label), pct: '45%' },
              { label: nfc(t.scene7Gauge2Label), pct: '60%' },
            ].map((g, idx) => (
              <div
                key={idx}
                style={{
                  flex: 1,
                  padding: 32,
                  borderRadius: 28,
                  background: 'rgba(32, 195, 130, 0.32)',
                  border: '2px solid rgba(167, 243, 208, 0.5)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 18,
                }}
              >
                <div style={{ fontSize: 28, fontWeight: 700, color: '#D1FAE5' }}>
                  {g.label}
                </div>
                <div
                  style={{
                    width: 170,
                    height: 170,
                    borderRadius: 999,
                    border: `16px solid ${t.limeAccentColor}`,
                    background: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 48,
                    fontWeight: 900,
                    color: t.darkBgColor,
                  }}
                >
                  {g.pct}
                </div>
              </div>
            ))}
          </div>

          {/* Air Conditioner 10°C Widget */}
          <div
            style={{
              padding: '28px 38px',
              borderRadius: 28,
              background: '#FFFFFF',
              color: t.darkBgColor,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: 36, fontWeight: 800 }}>
              {nfc(t.scene7AcLabel)}
            </span>
            <span style={{ fontSize: 52, fontWeight: 900, color: t.deepEmeraldColor }}>
              10°C
            </span>
          </div>
        </div>
      )}

      {/* Part 7B (f90..f140): "[ Bố cục thông minh ]" + Tilted Weather Card */}
      {frame >= 88 && frame < 142 && (
        <AbsoluteFill
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            gap: 55,
            opacity: toSmartLayoutP * (1 - toClearActionsP),
            transform: `translateY(${(1 - toSmartLayoutP) * 240 - toClearActionsP * 240}px)`,
          }}
        >
          <div
            style={{
              width: 820,
              padding: 46,
              borderRadius: 36,
              background: `linear-gradient(135deg, ${t.limeAccentColor} 0%, #4ADE80 100%)`,
              color: t.darkBgColor,
              boxShadow: '0 32px 80px rgba(0,0,0,0.55)',
              transform: `rotate(${-6 + (frame - 88) * 0.25}deg)`,
            }}
          >
            <div style={{ fontSize: 58, fontWeight: 900 }}>
              {nfc(t.scene7Greeting)}
            </div>
            <div style={{ fontSize: 48, fontWeight: 800, marginTop: 14 }}>
              {nfc(t.scene7TiltSub)}
            </div>
          </div>

          <FigmaSelectionBox borderColor={t.limeAccentColor} padding="24px 48px">
            <span
              style={{
                fontSize: 78,
                fontWeight: 900,
                color: t.limeAccentColor,
              }}
            >
              {nfc(t.scene7BoxHighlight)}
            </span>
            <span
              style={{
                fontSize: 78,
                fontWeight: 500,
                color: '#FFFFFF',
                marginLeft: 18,
              }}
            >
              {nfc(t.scene7BoxNormal)}
            </span>
          </FigmaSelectionBox>
        </AbsoluteFill>
      )}

      {/* Part 7C (f126..f195): Grid Tiles + Glowing L-Shaped Neon Pipe + "Hành động rõ ràng" */}
      {frame >= 124 && (
        <AbsoluteFill
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            opacity: toClearActionsP,
            transform: `scale(${0.84 + 0.16 * toClearActionsP})`,
          }}
        >
          {/* Neon L-Pipe SVG */}
          <svg
            width="1080"
            height="1920"
            viewBox="0 0 1080 1920"
            style={{ position: 'absolute', inset: 0 }}
          >
            <path
              d="M 160 620 L 280 620 L 280 1280 L 920 1280"
              fill="none"
              stroke="rgba(52, 211, 153, 0.35)"
              strokeWidth="84"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 160 620 L 280 620 L 280 1280 L 920 1280"
              fill="none"
              stroke={t.limeAccentColor}
              strokeWidth="48"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="1600"
              strokeDashoffset={1600 * (1 - pipeDrawP)}
            />
          </svg>

          <div
            style={{
              padding: '32px 58px',
              borderRadius: 32,
              background: 'rgba(4, 32, 22, 0.88)',
              border: `3px solid ${t.limeAccentColor}`,
              boxShadow: '0 28px 70px rgba(0,0,0,0.65)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <span style={{ fontSize: 74, fontWeight: 500, color: t.lightTextColor }}>
              {nfc(t.scene7PipeLead)}
            </span>
            <span style={{ fontSize: 96, fontWeight: 900, color: t.limeAccentColor }}>
              {nfc(t.scene7PipeHero)}
            </span>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 8 (local f0..202 | Global f1068..1263):
// "Tất cả được chế tác để tiến lên -> Không chỉ là VẺ BỀ NGOÀI"
// ============================================================================
const Scene8CraftedAndHowItLooks: React.FC<{
  frame: number;
  fps: number;
  t: Required<PinterestViet9x16Props>;
}> = ({ frame, fps, t }) => {
  const enterP = spring({
    frame: Math.max(0, frame + 6),
    fps,
    config: { mass: 0.8, damping: 12, stiffness: 170 },
  });
  // Cut at global 38.47s (local f86)
  const toBecauseP = interpolate(frame, [78, 94], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: WHIP_BEZIER,
  });
  const exitP = interpolate(frame, [182, 198], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EXPO_IN,
  });

  const stackLines = [
    { text: nfc(t.scene8Stack1), delay: 84, lime: false },
    { text: nfc(t.scene8Stack2), delay: 94, lime: false },
    { text: nfc(t.scene8Stack3), delay: 104, lime: false },
    { text: nfc(t.scene8Stack4), delay: 114, lime: false },
    { text: nfc(t.scene8Stack5), delay: 126, lime: true },
  ];

  return (
    <AbsoluteFill
      style={{
        opacity: clamp01(enterP) * (1 - exitP),
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Part 8A (f0..f94): "Tất cả được chế tác để tiến lên" + Rolling Avatar Cluster */}
      {frame < 96 && (
        <AbsoluteFill
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            padding: '0 80px',
            opacity: 1 - toBecauseP,
            transform: `translateX(${-toBecauseP * 460}px)`,
          }}
        >
          <div
            style={{
              fontSize: 92,
              fontWeight: 800,
              color: t.lightTextColor,
              textAlign: 'center',
              lineHeight: 1.18,
            }}
          >
            {nfc(t.scene8LeadPrefix)}
            <span style={{ color: t.limeAccentColor, fontWeight: 900 }}>
              {nfc(t.scene8LeadHighlight)}
            </span>
            {nfc(t.scene8LeadSuffix)}
          </div>

          <div
            style={{
              marginTop: 55,
              display: 'flex',
              alignItems: 'center',
              gap: 28,
              transform: `translateX(${Math.sin(frame * 0.14) * 65}px)`,
            }}
          >
            <LineArtFaceAvatarSVG size={124} rotationDeg={frame * 3} />
            <DaisyFlowerSVG
              size={142}
              petalColor={t.limeAccentColor}
              centerColor="#F59E0B"
              rotationDeg={frame * 6}
              glowColor="rgba(218, 255, 62, 0.75)"
            />
            <LineArtFaceAvatarSVG size={124} rotationDeg={-frame * 3} />
          </div>
        </AbsoluteFill>
      )}

      {/* Part 8B (f80..f202): Giant Wireframe Daisy + 5-Line Kinetic Typography Stack */}
      {frame >= 78 && (
        <AbsoluteFill
          style={{
            justifyContent: 'center',
            alignItems: 'flex-start',
            padding: '0 88px',
            opacity: toBecauseP,
          }}
        >
          {/* Giant Outline Daisy Rotating in Bottom Right */}
          <div
            style={{
              position: 'absolute',
              right: -280,
              bottom: -220,
              opacity: 0.78,
            }}
          >
            <DaisyFlowerSVG
              size={980}
              petalColor={t.limeAccentColor}
              rotationDeg={(frame - 78) * 1.8}
              outlineOnly={true}
              strokeWidth={1.8}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            {stackLines.map((item, idx) => {
              const lp = spring({
                frame: Math.max(0, frame - item.delay),
                fps,
                config: { mass: 0.8, damping: 12, stiffness: 175 },
              });
              return (
                <div
                  key={idx}
                  style={{
                    fontSize: item.lime ? 116 : 102,
                    fontWeight: item.lime ? 900 : 500,
                    color: item.lime ? t.limeAccentColor : t.lightTextColor,
                    letterSpacing: '-0.03em',
                    lineHeight: 1.06,
                    opacity: clamp01(lp),
                    transform: `translate3d(${(1 - lp) * -120}px, ${
                      Math.sin(frame * 0.12 + idx) * 8
                    }px, 0)`,
                    textShadow: item.lime
                      ? '0 0 45px rgba(218, 255, 62, 0.55)'
                      : 'none',
                  }}
                >
                  {item.text}
                </div>
              );
            })}
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 9 (local f0..157 | Global f1263..1420):
// Light Mint Finale: "✳️ Mà là cách nó [ VẬN HÀNH ]" -> "✳️ Sẵn sàng bứt phá?"
// ============================================================================
const Scene9WorksAndReadyFinale: React.FC<{
  frame: number;
  fps: number;
  t: Required<PinterestViet9x16Props>;
}> = ({ frame, fps, t }) => {
  const enterP = spring({
    frame: Math.max(0, frame + 6),
    fps,
    config: { mass: 0.8, damping: 12, stiffness: 170 },
  });
  const toReadyP = interpolate(frame, [62, 78], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: WHIP_BEZIER,
  });

  return (
    <AbsoluteFill
      style={{
        opacity: clamp01(enterP),
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 72px',
      }}
    >
      {/* Part 9A (f0..f78): "✳️ Mà là cách nó [ VẬN HÀNH ]" */}
      {frame < 82 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 32,
            opacity: 1 - toReadyP,
            transform: `scale(${0.88 + 0.12 * enterP + toReadyP * 0.25})`,
          }}
        >
          <DaisyFlowerSVG
            size={112}
            petalColor={t.deepEmeraldColor}
            centerColor={t.limeAccentColor}
            rotationDeg={frame * 6}
          />
          <div
            style={{
              fontSize: 82,
              fontWeight: 700,
              color: t.deepEmeraldColor,
              textAlign: 'center',
            }}
          >
            {nfc(t.scene9Lead)}
          </div>
          <div
            style={{
              padding: '22px 58px',
              borderRadius: 24,
              background: t.deepEmeraldColor,
              border: `4px solid ${t.limeAccentColor}`,
              boxShadow: '0 28px 65px rgba(6, 78, 59, 0.35)',
              transform: `rotate(-2deg) scale(${1 + Math.sin(frame * 0.18) * 0.04})`,
            }}
          >
            <span
              style={{
                fontSize: 104,
                fontWeight: 900,
                color: t.limeAccentColor,
                letterSpacing: '-0.02em',
              }}
            >
              {nfc(t.scene9HeroBox)}
            </span>
          </div>
        </div>
      )}

      {/* Part 9B (f62..f157): "✳️ Sẵn sàng bứt phá?" */}
      {frame >= 60 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 36,
            opacity: toReadyP,
            transform: `translateY(${(1 - toReadyP) * 140 + Math.sin(frame * 0.12) * 14}px)`,
          }}
        >
          <DaisyFlowerSVG
            size={128}
            petalColor={t.emeraldAccentColor}
            centerColor={t.deepEmeraldColor}
            rotationDeg={frame * 5}
            glowColor="rgba(16, 185, 129, 0.55)"
          />
          <div
            style={{
              fontSize: 96,
              fontWeight: 900,
              color: t.deepEmeraldColor,
              textAlign: 'center',
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
            }}
          >
            {nfc(t.scene9FinaleTop)}
            <br />
            <span
              style={{
                display: 'inline-block',
                marginTop: 14,
                padding: '12px 42px',
                borderRadius: 22,
                background: t.limeAccentColor,
                border: `3px solid ${t.deepEmeraldColor}`,
                color: t.darkBgColor,
              }}
            >
              {nfc(t.scene9FinalePill)}
            </span>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
