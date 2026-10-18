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
const WHIP_BEZIER = Easing.bezier(0.7, 0, 0.2, 1);

const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));
const nfc = (s: string): string => s.normalize('NFC');

// ============================================================================
// REUSABLE VECTOR ACTORS (Cursors, Star Emblem, Corner Handles)
// ============================================================================
const GoldStarEmblem: React.FC<{
  size?: number;
  petalColor?: string;
  centerColor?: string;
  rotationDeg?: number;
}> = ({
  size = 36,
  petalColor = '#FDE047',
  centerColor = '#F59E0B',
  rotationDeg = 0,
}) => {
  const angles = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{
        transform: `rotate(${rotationDeg}deg)`,
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

const CursorArrowSVG: React.FC<{
  color: string;
  label?: string;
  scale?: number;
  rotate?: number;
}> = ({ color, label, scale = 1, rotate = 0 }) => (
  <div
    style={{
      display: 'inline-flex',
       alignItems: 'center',
      transform: `scale(${scale}) rotate(${rotate}deg)`,
      transformOrigin: 'top left',
      filter: `drop-shadow(0 8px 18px rgba(0,0,0,0.65)) drop-shadow(0 0 12px ${color})`,
    }}
  >
    <svg width="38" height="38" viewBox="0 0 36 36" fill="none">
      <path
        d="M5 4L31 15.5L18.5 19.5L14.5 32L5 4Z"
        fill={color}
        stroke="#08090C"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
    {label && (
      <div
        style={{
          marginLeft: 4,
          marginTop: 14,
          padding: '4px 10px',
          borderRadius: 999,
          backgroundColor: color,
          color: '#08090C',
          fontFamily: "'GT-America', monospace",
          fontSize: 13,
          fontWeight: 900,
          letterSpacing: '0.08em',
          whiteSpace: 'nowrap',
          border: '1.5px solid #08090C',
        }}
      >
        {label}
      </div>
    )}
  </div>
);

const CornerHandles: React.FC<{
  color?: string;
  fill?: string;
  size?: number;
}> = ({ color = '#FACC15', fill = '#FFFFFF', size = 13 }) => {
  const half = Math.round(size / 2);
  const pos = [
    { top: -half, left: -half },
    { top: -half, right: -half },
    { bottom: -half, left: -half },
    { bottom: -half, right: -half },
  ];
  return (
    <>
      {pos.map((p, idx) => (
        <div
          key={idx}
          style={{
            position: 'absolute',
            ...p,
            width: size,
            height: size,
            backgroundColor: fill,
            border: `2.5px solid ${color}`,
            boxShadow: `0 0 10px ${color}`,
            zIndex: 30,
          }}
        />
      ))}
    </>
  );
};

// ============================================================================
// MAIN COMPOSITION: VietContinuity10s (600 frames @ 60fps, 1080x1920)
// Architecture: One Continuous World Canvas & Pre-Cue Choreography
// ============================================================================
export const VietContinuity10s: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // --------------------------------------------------------------------------
  // 1. SHARED CAMERA RIG & DIRECTIONAL SVG MOTION BLUR
  // --------------------------------------------------------------------------
  // Whip-Pan from Scene 1 (x=0) to Scene 2 (x=1080) during f228..f244
  const whipPanP = interpolate(frame, [228, 244], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: WHIP_BEZIER,
  });
  const camX = -1080 * whipPanP;

  // Continuous subtle camera drift so 0 frames are ever static
  const driftScale =
    1 +
    Math.sin(frame * 0.045) * 0.008 +
    interpolate(frame, [0, 600], [0, 0.032], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  const driftY = Math.cos(frame * 0.038) * 4;

  // Impact shake at f186 (Hard Invert Slam) and f328 (NGỮ NGHĨA Boom) and f513 (Mechanical Snap)
  const shake1c =
    frame >= 184 && frame <= 202
      ? Math.sin((frame - 184) * 2.1) * (202 - frame) * 0.55
      : 0;
  const shake2b =
    frame >= 328 && frame <= 344
      ? Math.cos((frame - 328) * 2.4) * (344 - frame) * 0.5
      : 0;
  const shake3b =
    frame >= 513 && frame <= 528
      ? Math.sin((frame - 513) * 2.6) * (528 - frame) * 0.55
      : 0;

  // Directional Horizontal Blur during Whip-Pan (peaks at 32px around f236..f238, crisp by f245)
  const whipBlurX =
    frame >= 228 && frame <= 244
      ? Math.sin(((frame - 228) / 16) * Math.PI) * 32
      : 0;

  // Vertical Motion Blur for Header Recoil 1c (f160..f180, peaks at 18px around f168)
  const recoilBlur1c =
    frame >= 160 && frame <= 180
      ? Math.sin(((frame - 160) / 20) * Math.PI) * 18
      : 0;

  // Vertical Motion Blur for Caret Drop 1b (f82..f92, peaks around f87)
  const caretBlur1b =
    frame >= 82 && frame <= 92
      ? Math.sin(((frame - 82) / 10) * Math.PI) * 14
      : 0;

  // Vertical Motion Blur for Slot-Wheel Spin 3b (f490..f513)
  const slotWheelBlur3b =
    frame >= 490 && frame < 513
      ? interpolate(frame, [490, 502, 513], [4, 16, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
      : 0;

  // Portal Zoom-Through Blur applied only to Scene 2 outgoing layer (f418..f446)
  const portalBlur =
    frame >= 418 && frame <= 446
      ? Math.sin(((frame - 418) / 28) * Math.PI) * 10
      : 0;

  // ==========================================================================
  // 2. SCENE 1 CHOREOGRAPHY (f0 -> f252, World X = 0)
  // ==========================================================================
  // Pre-Cue 1a: Core seed square pop (f0..f6) + Figma Selection Box Expand (f2..f16)
  const seed1aScale = spring({
    frame,
    fps,
    config: { mass: 0.6, damping: 11, stiffness: 220 },
  });
  const box1aExpandP = interpolate(frame, [2, 16], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EXPO_OUT,
  });
  const box1aWidth = interpolate(box1aExpandP, [0, 1], [68, 956]);

  // Text 1a Word Wave ("CÁI MẠNG XÃ HỘI CŨ", f7..f26)
  const words1a = [nfc('CÁI'), nfc('MẠNG'), nfc('XÃ'), nfc('HỘI'), nfc('CŨ')];
  const clip1aPct = interpolate(frame, [5, 19], [0, 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EXPO_OUT,
  });

  // Secondary Micro-Action 1a: 4 corner rays & satellite cards (f28..f84)
  const ray1aP = interpolate(frame, [26, 42], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EXPO_OUT,
  });
  const satellites1a = [
    { icon: '👍', label: nfc('LIKE ẢO'), x: -270, y: -330, startF: 32 },
    { icon: '❤️', label: nfc('THẢ TIM DẠO'), x: 270, y: -330, startF: 38 },
    { icon: '👁️', label: nfc('CÂU VIEW RẺ TIỀN'), x: -265, y: 340, startF: 44 },
    { icon: '🔥', label: nfc('DRAMA BỀ NỔI'), x: 275, y: 340, startF: 50 },
  ];

  // Pre-Cue 1b: Caret Drop (f82..f90) + Highlight Sweep (f86..f108) + Lead-Char 'M' Seed (f85..f98)
  const caret1bDropP = interpolate(frame, [82, 89], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EXPO_OUT,
  });
  const highlight1bSweepP = interpolate(frame, [86, 118], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EXPO_OUT,
  });
  const seedM1bDropP = spring({
    frame: Math.max(0, frame - 85),
    fps,
    config: { mass: 0.7, damping: 12, stiffness: 190 },
  });

  // Text 1b Word Wave ("MÀ MÌNH TỪNG BIẾT", f99..f136)
  const words1b = [nfc('MÀ'), nfc('MÌNH'), nfc('TỪNG'), nfc('BIẾT')];
  const brush1bP = interpolate(frame, [130, 156], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EXPO_OUT,
  });

  // Pre-Cue 1c: Header Recoil (f160..f180) + Asterisk Seed ✱✱✱✱ (f164..f186) + Diagonal Slash Rip (f172..f188)
  const headerRecoil1cP = interpolate(frame, [160, 178], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EXPO_OUT,
  });
  const header1abY = interpolate(headerRecoil1cP, [0, 1], [0, -520]);
  const header1abScale = interpolate(headerRecoil1cP, [0, 1], [1, 0.52]);

  // Diagonal Canvas Rip (f172..f188): opens Ivory #FAF8F5 from a diagonal slash across center
  const rip1cP = interpolate(frame, [172, 188], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EXPO_OUT,
  });
  const ripSpread = rip1cP * 145; // % spread from diagonal center line

  // Text 1c ("NÓ ĐÃ CHẾT RỒI.") morphing from 4 asterisks at f186
  const words1c = [nfc('NÓ'), nfc('ĐÃ'), nfc('CHẾT'), nfc('RỒI.')];
  const strike1cP = interpolate(frame, [204, 224], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EXPO_OUT,
  });

  // Shared-Element Morph (f224..f238): Crimson Strike-Bar shrinks & morphs into Golden Comet Cursor
  const strikeMorphToCursorP = interpolate(frame, [224, 236], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EXPO_OUT,
  });

  // ==========================================================================
  // 3. SCENE 2 CHOREOGRAPHY (f228 -> f452, World X = 1080)
  // ==========================================================================
  // Pre-Cue 2a: Comet Cursor brakes at center (f240..f248) & pops "✳ BÂY GIỜ • NOW" pill
  const nowPillPopP = spring({
    frame: Math.max(0, frame - 240),
    fps,
    config: { mass: 0.75, damping: 11, stiffness: 185 },
  });
  const nowClickP = interpolate(frame, [260, 282], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EXPO_OUT,
  });
  const nowHeaderRecoilP = interpolate(frame, [274, 286], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EXPO_OUT,
  });

  // Pre-Cue 2b-1 (f264..f284): 6 Swarming AI Cursors converge & pull 3D Glass Bounding Frame
  const swarmConvergeP = interpolate(frame, [264, 282], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EXPO_OUT,
  });
  const frame2bExpandP = interpolate(frame, [276, 292], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EXPO_OUT,
  });

  // Pre-Cue 2b-2 (f314..f328): Elastic Split & < ✦ SEMANTIC_CORE ✦ > Placeholder Seed
  const elasticSplit2bP = interpolate(frame, [314, 326], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EXPO_OUT,
  });
  const semanticSeedBoxP = interpolate(frame, [314, 325], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EXPO_OUT,
  });

  // Climax 2b-2 (f328..f360): 3D Gold "NGỮ NGHĨA" Boom
  const semanticBoomP = spring({
    frame: Math.max(0, frame - 328),
    fps,
    config: { mass: 0.9, damping: 11, stiffness: 175 },
  });

  // Secondary Action (f358..f418): Laser Semantic Scanner & 3 Semantic Badges + Gold Underline
  const laserScanP = interpolate(frame, [358, 396], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const goldUnderline2bP = interpolate(frame, [366, 398], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EXPO_OUT,
  });

  // ==========================================================================
  // 4. PORTAL ZOOM-THROUGH (f418 -> f452) & SCENE 3 (f418 -> f600)
  // ==========================================================================
  const portalZoomP = interpolate(frame, [418, 450], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: WHIP_BEZIER,
  });
  const scene2PortalScale = interpolate(portalZoomP, [0, 1], [1, 5.4]);
  const scene2PortalOpacity = interpolate(frame, [438, 450], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Scene 3 emerges directly from inside the "NGỮ NGHĨA" Portal Window (f418..f446)
  const scene3PortalScale = interpolate(frame, [418, 446], [0.22, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EXPO_OUT,
  });
  const scene3PortalOpacity = interpolate(frame, [418, 430], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Pre-Cue 3a (f430..f444): Caret & Selection Box Sweep for "BẠN KHÔNG CẦN THIẾT PHẢI LÀM"
  const box3aSweepP = interpolate(frame, [430, 444], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EXPO_OUT,
  });
  const words3aLine1 = [nfc('BẠN'), nfc('KHÔNG'), nfc('CẦN'), nfc('THIẾT')];
  const words3aLine2 = [nfc('PHẢI'), nfc('LÀM')];

  // Pre-Cue 3b (f490..f513): Header Recoil 3a + Vertical Slot-Machine Wheel Picker Spin
  const headerRecoil3bP = interpolate(frame, [490, 504], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EXPO_OUT,
  });
  const wheelAppearP = interpolate(frame, [490, 500], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EXPO_OUT,
  });
  const wheelSpinP = interpolate(frame, [490, 513], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EXPO_OUT,
  });
  const idolLockSnapP = spring({
    frame: Math.max(0, frame - 513),
    fps,
    config: { mass: 0.85, damping: 11, stiffness: 210 },
  });

  // Secondary Finale 3b (f530..f600): Red Strike-Through & Stamp "[✕ KHÔNG CẦN ĐÓNG KỊCH]"
  const idolStrikeP = interpolate(frame, [530, 550], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EXPO_OUT,
  });
  const stampPopP = spring({
    frame: Math.max(0, frame - 552),
    fps,
    config: { mass: 0.8, damping: 11, stiffness: 190 },
  });

  const swarmCursorsConfig = [
    { label: 'AI_INTENT', color: '#FACC15', startX: -480, startY: -520, targetX: -460, targetY: -200, splitShiftY: -175 },
    { label: 'SEMANTIC', color: '#38BDF8', startX: 480, startY: -500, targetX: 330, targetY: -200, splitShiftY: -175 },
    { label: 'CONTEXT', color: '#FB7185', startX: -500, startY: 520, targetX: -455, targetY: 165, splitShiftY: 140 },
    { label: 'MATCH_99%', color: '#34D399', startX: 500, startY: 500, targetX: 330, targetY: 165, splitShiftY: 140 },
    { label: 'DEEP_READ', color: '#A78BFA', startX: -260, startY: -680, targetX: -450, targetY: -425, splitShiftY: -35 },
    { label: 'VECTOR_ID', color: '#FAF8F5', startX: 260, startY: 680, targetX: 335, targetY: -425, splitShiftY: -35 },
  ];

  const slotWheelItems = [
    nfc('🎭 Diễn viên hài kịch câu view'),
    nfc('💃 Nhảy trend TikTok vô nghĩa'),
    nfc('🎪 Kịch sĩ phông bạt bề nổi'),
    nfc('🤡 Chiêu trò câu kéo tương tác'),
    nfc('✖ IDOL TRÊN VIDEO'),
    nfc('🎬 Quay dựng màu mè sáo rỗng'),
    nfc('📢 Hô hào khẩu hiệu rỗng tuếch'),
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: '#07080C', overflow: 'hidden' }}>
      {/* Master 10s Pre-Cue Voice-Safe Audio */}
      <Audio src={staticFile('motion02/master_audio_10s_precue.wav')} />

      {/* ====================================================================
          SVG DIRECTIONAL MOTION BLUR FILTERS (True Velocity-Driven Blur)
          ==================================================================== */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id="worldWhipBlur" x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation={`${whipBlurX.toFixed(2)} 0`}
            />
          </filter>
          <filter id="portalZoomBlur2" x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation={`${portalBlur.toFixed(2)} ${portalBlur.toFixed(2)}`}
            />
          </filter>
          <filter id="headerRecoilBlur1c" x="-20%" y="-40%" width="140%" height="180%">
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation={`0 ${recoilBlur1c.toFixed(2)}`}
            />
          </filter>
          <filter id="caretDropBlur1b" x="-30%" y="-50%" width="160%" height="200%">
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation={`0 ${caretBlur1b.toFixed(2)}`}
            />
          </filter>
          <filter id="slotWheelBlur3b" x="-10%" y="-30%" width="120%" height="160%">
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation={`0 ${slotWheelBlur3b.toFixed(2)}`}
            />
          </filter>
        </defs>
      </svg>

      {/* ====================================================================
          PERSISTENT CONTEXT BRIDGE HEADER (Continuity Anchor across Scenes)
          ==================================================================== */}
      {frame >= 226 && (
        <div
          style={{
            position: 'absolute',
            top: 96,
            left: 44,
            right: 44,
            zIndex: 65,
            display: 'flex',
            justifyContent: 'center',
            gap: 14,
            pointerEvents: 'none',
            opacity: interpolate(frame, [226, 240], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
          }}
        >
          <div
            style={{
              padding: '8px 18px',
              borderRadius: 999,
              background: 'rgba(15, 18, 28, 0.88)',
              border: '1.5px solid rgba(239, 68, 68, 0.55)',
              color: '#FCA5A5',
              fontFamily: "'GT-America', monospace",
              fontSize: 15,
              fontWeight: 800,
              letterSpacing: '0.08em',
            }}
          >
            {nfc('✕ MẠNG XÃ HỘI CŨ: ĐÃ CHẾT')}
          </div>
          {frame >= 420 && (
            <div
              style={{
                padding: '8px 18px',
                borderRadius: 999,
                background: 'rgba(250, 204, 21, 0.16)',
                border: '1.5px solid #FACC15',
                color: '#FDE047',
                fontFamily: "'GT-America', monospace",
                fontSize: 15,
                fontWeight: 800,
                letterSpacing: '0.08em',
                transform: `scale(${interpolate(frame, [420, 436], [0.8, 1], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                })})`,
              }}
            >
              {nfc('✳ KỶ NGUYÊN NGỮ NGHĨA')}
            </div>
          )}
        </div>
      )}

      {/* ====================================================================
          ONE CONTINUOUS WORLD CANVAS (2160x1920 Shared Camera Rig)
          ==================================================================== */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 2160,
          height: 1920,
          transform: `translate3d(${camX + shake1c + shake2b + shake3b}px, ${driftY}px, 0) scale(${driftScale})`,
          transformOrigin: `${540 - camX}px 960px`,
          filter: whipBlurX > 0.4 ? 'url(#worldWhipBlur)' : undefined,
        }}
      >
        {/* ==================================================================
            WORLD SECTOR 1 (x: 0..1080): CẢNH 1 (f0 -> f250)
            ================================================================== */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 1080,
            height: 1920,
            backgroundColor: '#08090C',
            overflow: 'hidden',
          }}
        >
          {/* Ambient Backlit Aura & Grid on Dark Canvas */}
          <div
            style={{
              position: 'absolute',
              left: 120,
              top: 520,
              width: 840,
              height: 840,
              borderRadius: 9999,
              background:
                'radial-gradient(circle, rgba(250, 204, 21, 0.24) 0%, rgba(249, 115, 22, 0.14) 45%, rgba(8, 9, 12, 0) 72%)',
              filter: 'blur(40px)',
            }}
          />
          <AbsoluteFill
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(250, 204, 21, 0.055) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(250, 204, 21, 0.055) 1px, transparent 1px)
              `,
              backgroundSize: '80px 80px',
            }}
          />

          {/* DIAGONAL SLASH CANVAS RIP (f172..f188): Tears open Ivory #FAF8F5 */}
          {frame >= 172 && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: '#FAF8F5',
                clipPath: `polygon(${50 - ripSpread}% -20%, ${50 + ripSpread}% -20%, ${50 + ripSpread - 18}% 120%, ${50 - ripSpread - 18}% 120%)`,
                zIndex: 4,
              }}
            >
              {/* Subtle Neo-Brutalist Grid on Ivory */}
              <AbsoluteFill
                style={{
                  backgroundImage: `
                    linear-gradient(to right, rgba(8, 9, 12, 0.06) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(8, 9, 12, 0.06) 1px, transparent 1px)
                  `,
                  backgroundSize: '80px 80px',
                }}
              />
            </div>
          )}

          {/* DIAGONAL RIP BLADE LIGHT BEAM (f170..f190) */}
          {frame >= 170 && frame <= 192 && (
            <div
              style={{
                position: 'absolute',
                left: -200,
                top: 940,
                width: 1480,
                height: 22,
                background:
                  'linear-gradient(90deg, #DC2626 0%, #FACC15 50%, #FFFFFF 80%, #EF4444 100%)',
                boxShadow:
                  '0 0 45px #EF4444, 0 0 85px #FACC15, 0 0 18px #FFFFFF',
                transform: `rotate(-18deg) scaleX(${interpolate(
                  frame,
                  [170, 179, 192],
                  [0.1, 1.1, 0],
                  { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                )})`,
                zIndex: 28,
              }}
            />
          )}

          {/* 4 Corner Satellite Rays & Tags (f26..f240) */}
          {frame >= 26 && (
            <svg
              width={1080}
              height={1920}
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 6,
                opacity: frame >= 165 ? 0.25 : 0.85,
              }}
            >
              {satellites1a.map((sat, idx) => {
                const sx = 540 + (idx % 2 === 0 ? -360 : 360);
                const sy = 900 + (idx < 2 ? -80 : 80);
                const ex = 540 + sat.x;
                const ey = 900 + sat.y;
                return (
                  <line
                    key={idx}
                    x1={sx}
                    y1={sy}
                    x2={sx + (ex - sx) * ray1aP}
                    y2={sy + (ey - sy) * ray1aP}
                    stroke={frame >= 180 ? '#08090C' : '#FACC15'}
                    strokeWidth="2.5"
                    strokeDasharray="8 8"
                  />
                );
              })}
            </svg>
          )}

          {satellites1a.map((sat, idx) => {
            if (frame < sat.startF - 4) return null;
            const satP = spring({
              frame: Math.max(0, frame - sat.startF),
              fps,
              config: { mass: 0.75, damping: 12, stiffness: 165 },
            });
            const isLightBg = frame >= 180;
            return (
              <div
                key={idx}
                style={{
                  position: 'absolute',
                  left: 540 + sat.x,
                  top: 900 + sat.y,
                  transform: `translate(-50%, -50%) scale(${0.4 + 0.6 * satP}) rotate(${(idx % 2 === 0 ? -1 : 1) * 4}deg)`,
                  opacity: isLightBg ? 0.35 : clamp01(satP) * 0.92,
                  padding: '12px 24px',
                  borderRadius: 999,
                  background: isLightBg
                    ? 'rgba(8, 9, 12, 0.08)'
                    : 'rgba(17, 20, 32, 0.92)',
                  border: isLightBg
                    ? '2px solid rgba(8, 9, 12, 0.35)'
                    : '2px solid rgba(250, 204, 21, 0.55)',
                  boxShadow: isLightBg
                    ? 'none'
                    : '0 14px 30px rgba(0,0,0,0.55), 0 0 20px rgba(250, 204, 21, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  zIndex: 8,
                }}
              >
                <span style={{ fontSize: 24 }}>{sat.icon}</span>
                <span
                  style={{
                    fontFamily: "'SVN-Aeonik', sans-serif",
                    fontSize: 21,
                    fontWeight: 800,
                    color: isLightBg ? '#08090C' : '#FAF8F5',
                    textDecoration: isLightBg ? 'line-through' : 'none',
                  }}
                >
                  {sat.label}
                </span>
              </div>
            );
          })}

          {/* ================================================================
              CLUSTER 1A + 1B (Center at f0..f160 -> Header Recoil to Top at f160..f180)
              ================================================================ */}
          <div
            style={{
              position: 'absolute',
              left: 540,
              top: 860,
              transform: `translate(-50%, -50%) translateY(${header1abY}px) scale(${header1abScale})`,
              filter: recoilBlur1c > 0.4 ? 'url(#headerRecoilBlur1c)' : undefined,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 28,
              zIndex: 18,
              width: 980,
            }}
          >
            {/* --- BEAT 1A: PRE-CUE SEED NODE + FIGMA SELECTION BOUNDING BOX --- */}
            <div
              style={{
                position: 'relative',
                width: box1aWidth,
                minHeight: 158,
                border: `3px solid ${frame >= 180 ? '#08090C' : '#FACC15'}`,
                backgroundColor:
                  frame >= 180
                    ? 'rgba(255, 255, 255, 0.94)'
                    : 'rgba(14, 17, 26, 0.88)',
                boxShadow:
                  frame >= 180
                    ? '0 12px 0 #08090C'
                    : '0 24px 60px rgba(0,0,0,0.75), 0 0 36px rgba(250, 204, 21, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '22px 28px',
                transform: `scale(${0.7 + 0.3 * seed1aScale})`,
              }}
            >
              <CornerHandles
                color={frame >= 180 ? '#08090C' : '#FACC15'}
                fill={frame >= 180 ? '#FACC15' : '#FFFFFF'}
                size={15}
              />

              {/* Top-left Pre-Cue Seed Badge (visible especially at f0..f16) */}
              <div
                style={{
                  position: 'absolute',
                  top: -36,
                  left: 0,
                  padding: '4px 14px',
                  backgroundColor: '#FACC15',
                  color: '#08090C',
                  fontFamily: "'GT-America', monospace",
                  fontSize: 15,
                  fontWeight: 900,
                  letterSpacing: '0.1em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span>✦ PRE-CUE_01A</span>
              </div>

              {/* Top-right Figma Dimension Pill */}
              <div
                style={{
                  position: 'absolute',
                  top: -36,
                  right: 0,
                  padding: '4px 14px',
                  backgroundColor: frame >= 180 ? '#08090C' : 'rgba(250, 204, 21, 0.18)',
                  border: '1.5px solid #FACC15',
                  color: '#FDE047',
                  fontFamily: "'GT-America', monospace",
                  fontSize: 14,
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  whiteSpace: 'nowrap',
                }}
              >
                {`${Math.round(box1aWidth)} × 176 • OLD_SOCIAL_ERA`}
              </div>

              {/* Core Seed Square Actor when frame < 10 */}
              {frame < 12 && (
                <div
                  style={{
                    position: 'absolute',
                    left: 16,
                    width: 52,
                    height: 52,
                    borderRadius: 10,
                    backgroundColor: '#FACC15',
                    border: '3px solid #08090C',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 28px #FACC15',
                  }}
                >
                  <GoldStarEmblem size={32} petalColor="#08090C" centerColor="#F59E0B" rotationDeg={frame * 12} />
                </div>
              )}

              {/* Clip-Path Reveal + Word Wave: "CÁI MẠNG XÃ HỘI CŨ" */}
              <div
                style={{
                  clipPath: `inset(-28px ${100 - clip1aPct}% -32px -16px)`,
                  display: 'flex',
                  flexWrap: 'nowrap',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 18,
                  padding: '18px 14px 22px 14px',
                  overflow: 'visible',
                }}
              >
                {words1a.map((w, idx) => {
                  const wStart = 6 + idx * 2.5;
                  const wSpring = spring({
                    frame: Math.max(0, frame - wStart),
                    fps,
                    config: { mass: 0.65, damping: 12, stiffness: 195 },
                  });
                  const ty = 20 * (1 - wSpring);
                  const rot = 3.5 * (1 - wSpring);
                  return (
                    <span
                      key={idx}
                      style={{
                        display: 'inline-block',
                        fontFamily: "'SVN-Aeonik', sans-serif",
                        fontSize: 64,
                        fontWeight: 900,
                        lineHeight: 1.32,
                        color: frame >= 180 ? '#08090C' : '#FAF8F5',
                        letterSpacing: '-0.02em',
                        transform: `translateY(${ty}px) rotate(${rot}deg)`,
                      }}
                    >
                      {w}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* --- BEAT 1B (f82+): CARET DROP + LEAD-CHAR SEED 'M' + HIGHLIGHT SWEEP --- */}
            {frame >= 82 && (
              <div
                style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  filter: caretBlur1b > 0.4 ? 'url(#caretDropBlur1b)' : undefined,
                  transform: `translateY(${interpolate(caret1bDropP, [0, 1], [-85, 0])}px)`,
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    minWidth: interpolate(highlight1bSweepP, [0, 1], [110, 820]),
                    minHeight: 108,
                    padding: '16px 34px',
                    borderRadius: 20,
                    background:
                      frame >= 180
                        ? '#08090C'
                        : 'linear-gradient(90deg, rgba(249, 115, 22, 0.25) 0%, rgba(250, 204, 21, 0.22) 100%)',
                    border: '2.5px solid #F97316',
                    boxShadow: '0 0 32px rgba(249, 115, 22, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 16,
                    overflow: 'visible',
                  }}
                >
                  {/* Pre-Cue Lead-Char Seed 'M' (f84..f99, before full word wave) */}
                  {frame < 99 && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        transform: `translateY(${(1 - seedM1bDropP) * -70}px) scale(${0.7 + 0.3 * seedM1bDropP})`,
                      }}
                    >
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: 8,
                          backgroundColor: '#F97316',
                          color: '#08090C',
                          fontFamily: "'GT-America', monospace",
                          fontSize: 13,
                          fontWeight: 900,
                        }}
                      >
                        SEED_CHAR
                      </span>
                      <span
                        style={{
                          fontFamily: "'SVN-Aeonik', sans-serif",
                          fontSize: 64,
                          fontWeight: 900,
                          color: '#FB923C',
                          lineHeight: 1.25,
                          textShadow: '0 0 24px #F97316',
                        }}
                      >
                        M
                      </span>
                    </div>
                  )}

                  {/* Full Word Wave 1b (f99+): "MÀ MÌNH TỪNG BIẾT" */}
                  {frame >= 99 && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 18,
                        overflow: 'visible',
                      }}
                    >
                      {words1b.map((w, idx) => {
                        const wStart = 99 + idx * 3;
                        const wSpring = spring({
                          frame: Math.max(0, frame - wStart),
                          fps,
                          config: { mass: 0.65, damping: 12, stiffness: 190 },
                        });
                        return (
                          <span
                            key={idx}
                            style={{
                              display: 'inline-block',
                              fontFamily: "'SVN-Aeonik', sans-serif",
                              fontSize: 58,
                              fontWeight: 900,
                              lineHeight: 1.32,
                              color: '#FACC15',
                              transform: `translateY(${32 * (1 - wSpring)}px) scale(${0.8 + 0.2 * wSpring})`,
                              opacity: clamp01(wSpring * 1.5),
                            }}
                          >
                            {w}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* Glowing Orange-Gold Caret Actor */}
                  <div
                    style={{
                      width: 8,
                      height: 66,
                      borderRadius: 4,
                      backgroundColor: '#FB923C',
                      boxShadow: '0 0 22px #F97316, 0 0 10px #FACC15',
                    }}
                  />
                </div>

                {/* Self-Drawing Brush Underline (f130..f158) */}
                {frame >= 128 && (
                  <svg
                    width={760}
                    height={36}
                    viewBox="0 0 760 36"
                    style={{ marginTop: 6, overflow: 'visible' }}
                  >
                    <path
                      d="M 20 22 Q 380 6 740 20"
                      fill="none"
                      stroke="#F97316"
                      strokeWidth="7"
                      strokeLinecap="round"
                      strokeDasharray="740"
                      strokeDashoffset={740 * (1 - brush1bP)}
                    />
                  </svg>
                )}
              </div>
            )}
          </div>

          {/* ================================================================
              BEAT 1C (f164 -> f245): ASTERISK SEED ✱✱✱✱ -> "NÓ ĐÃ CHẾT RỒI."
              ================================================================ */}
          {frame >= 164 && (
            <div
              style={{
                position: 'absolute',
                left: 540,
                top: 1020,
                transform: 'translate(-50%, -50%)',
                zIndex: 25,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: 980,
              }}
            >
              {/* Pre-Cue 1c (f164..f186): 4 Rotating Crimson-Gold Asterisks ✱ ✱ ✱ ✱ */}
              {frame < 186 && (
                <div
                  style={{
                    padding: '26px 48px',
                    borderRadius: 28,
                    backgroundColor: '#08090C',
                    border: '4px solid #EF4444',
                    boxShadow: '0 20px 50px rgba(239, 68, 68, 0.45), 0 0 40px rgba(250, 204, 21, 0.4)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'GT-America', monospace",
                      fontSize: 15,
                      fontWeight: 900,
                      color: '#FACC15',
                      letterSpacing: '0.16em',
                    }}
                  >
                    ✦ PRE-CUE SEED • HARD INVERT INCOMING
                  </span>
                  <div style={{ display: 'flex', gap: 28 }}>
                    {[0, 1, 2, 3].map((i) => {
                      const astP = spring({
                        frame: Math.max(0, frame - (164 + i * 2)),
                        fps,
                        config: { mass: 0.6, damping: 10, stiffness: 220 },
                      });
                      return (
                        <span
                          key={i}
                          style={{
                            display: 'inline-block',
                            fontFamily: "'SVN-Aeonik', sans-serif",
                            fontSize: 88,
                            fontWeight: 900,
                            color: i % 2 === 0 ? '#EF4444' : '#FACC15',
                            transform: `scale(${astP}) rotate(${(frame - 164) * 14}deg)`,
                            textShadow: '0 0 24px rgba(239, 68, 68, 0.8)',
                          }}
                        >
                          ✱
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Climax 1c (f186+): Neo-Brutalist Card "NÓ ĐÃ CHẾT RỒI." */}
              {frame >= 186 && (
                <div
                  style={{
                    position: 'relative',
                    padding: '34px 44px',
                    borderRadius: 32,
                    backgroundColor: '#FFFFFF',
                    border: '5px solid #08090C',
                    boxShadow: '0 26px 0 #08090C, 0 36px 70px rgba(0,0,0,0.25)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 14,
                  }}
                >
                  <CornerHandles color="#08090C" fill="#EF4444" size={16} />
                  <div
                    style={{
                      padding: '6px 18px',
                      borderRadius: 999,
                      backgroundColor: '#08090C',
                      color: '#FACC15',
                      fontFamily: "'GT-America', monospace",
                      fontSize: 15,
                      fontWeight: 900,
                      letterSpacing: '0.14em',
                    }}
                  >
                    {strike1cP > 0.5
                      ? '✖ STATUS: TERMINATED • PARADIGM SHIFT'
                      : '⚠ HARD INVERT SLAM @ 03.10S'}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      gap: 20,
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '6px 12px',
                    }}
                  >
                    {words1c.map((w, idx) => {
                      const wSpring = spring({
                        frame: Math.max(0, frame - (186 + idx * 2)),
                        fps,
                        config: { mass: 0.7, damping: 11, stiffness: 210 },
                      });
                      return (
                        <span
                          key={idx}
                          style={{
                            display: 'inline-block',
                            fontFamily: "'SVN-Aeonik', sans-serif",
                            fontSize: 80,
                            fontWeight: 900,
                            lineHeight: 1.3,
                            color: strike1cP > 0.6 ? '#64748B' : '#08090C',
                            letterSpacing: '-0.02em',
                            transform: `translateY(${34 * (1 - wSpring)}px) scale(${0.75 + 0.25 * wSpring})`,
                          }}
                        >
                          {w}
                        </span>
                      );
                    })}
                  </div>

                  {/* Crimson Strike-Through Bar (f204..f224) that morphs into Comet Cursor (f224..f236) */}
                  {frame >= 204 && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '58%',
                        left: interpolate(strikeMorphToCursorP, [0, 1], [48, 760]),
                        width: interpolate(
                          strikeMorphToCursorP,
                          [0, 1],
                          [810 * strike1cP, 95]
                        ),
                        height: interpolate(strikeMorphToCursorP, [0, 1], [16, 22]),
                        borderRadius: 999,
                        background:
                          'linear-gradient(90deg, #DC2626 0%, #FACC15 60%, #FEF08A 100%)',
                        boxShadow:
                          '0 0 26px rgba(220, 38, 38, 0.85), 0 0 18px rgba(250, 204, 21, 0.9)',
                        transform: 'translateY(-50%) rotate(-2deg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                      }}
                    >
                      {frame >= 224 && (
                        <CursorArrowSVG
                          color="#FACC15"
                          label="WHIP_PAN ➔"
                          scale={1.25}
                        />
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ==================================================================
            SHARED-ELEMENT GOLDEN COMET BRIDGE (f226 -> f250 across x=600..1620)
            Ensures f232, f238, f246 have a dramatic glowing comet bridging Scene 1 & 2
            ================================================================== */}
        {frame >= 226 && frame <= 252 && (
          <div
            style={{
              position: 'absolute',
              left: interpolate(frame, [226, 244], [780, 1620], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
                easing: EXPO_OUT,
              }),
              top: interpolate(frame, [226, 244], [1020, 920], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              }),
              zIndex: 60,
              display: 'flex',
              alignItems: 'center',
              transform: 'translate(-50%, -50%)',
            }}
          >
            {/* Glowing Comet Tail */}
            <div
              style={{
                width: 340,
                height: 18,
                borderRadius: 999,
                background:
                  'linear-gradient(90deg, rgba(220,38,38,0) 0%, #EF4444 35%, #FACC15 75%, #FFFFFF 100%)',
                boxShadow: '0 0 36px #FACC15, 0 0 60px #EF4444',
                marginRight: -12,
              }}
            />
            <CursorArrowSVG color="#FACC15" label="COMET_SEED ➔" scale={1.45} />
          </div>
        )}

        {/* ==================================================================
            WORLD SECTOR 2 (x: 1080..2160): CẢNH 2 & CẢNH 3 PORTAL (f228 -> f600)
            ================================================================== */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 1080,
            width: 1080,
            height: 1920,
            backgroundColor: '#07080C',
            overflow: 'hidden',
          }}
        >
          {/* ================================================================
              SCENE 2 LAYER (f228 -> f450, zooms out through Portal at f418..f450)
              ================================================================ */}
          {frame < 452 && (
            <AbsoluteFill
              style={{
                transform: `scale(${scene2PortalScale})`,
                transformOrigin: '540px 980px',
                opacity: scene2PortalOpacity,
                filter: portalBlur > 0.4 ? 'url(#portalZoomBlur2)' : undefined,
              }}
            >
              {/* Radial Golden Core Glow */}
              <div
                style={{
                  position: 'absolute',
                  left: 90,
                  top: 490,
                  width: 900,
                  height: 900,
                  borderRadius: 9999,
                  background:
                    'radial-gradient(circle, rgba(245, 158, 11, 0.36) 0%, rgba(250, 204, 21, 0.14) 48%, transparent 72%)',
                  filter: 'blur(42px)',
                }}
              />

              {/* 4 Intersecting Golden Orbit Rings SVG */}
              <svg
                width={1080}
                height={1920}
                viewBox="0 0 1080 1920"
                style={{ position: 'absolute', inset: 0 }}
              >
                {[
                  { x: 540 - 250, y: 960, r: 410, speed: -9 },
                  { x: 540 + 250, y: 960, r: 410, speed: 9 },
                  { x: 540, y: 960 - 230, r: 410, speed: 10 },
                  { x: 540, y: 960 + 230, r: 410, speed: -10 },
                ].map((orb, idx) => (
                  <g key={idx}>
                    <circle
                      cx={orb.x}
                      cy={orb.y}
                      r={orb.r}
                      fill="none"
                      stroke="rgba(250, 204, 21, 0.22)"
                      strokeWidth="2"
                    />
                    <circle
                      cx={orb.x}
                      cy={orb.y}
                      r={orb.r}
                      fill="none"
                      stroke="#FACC15"
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeDasharray="220 2600"
                      strokeDashoffset={frame * orb.speed}
                    />
                  </g>
                ))}

                {/* Click Shockwave Ring at f260..f282 */}
                {nowClickP > 0.01 && nowClickP < 0.99 && (
                  <circle
                    cx={540}
                    cy={920}
                    r={60 + nowClickP * 460}
                    fill="none"
                    stroke="#FEF08A"
                    strokeWidth={6 * (1 - nowClickP)}
                    opacity={1 - nowClickP}
                  />
                )}
              </svg>

              {/* 6 SWARMING COLLABORATIVE AI CURSORS (Pre-Cue 2b-1 at f262..f418) */}
              {frame >= 260 &&
                swarmCursorsConfig.map((cur, idx) => {
                  const cx = interpolate(
                    swarmConvergeP,
                    [0, 1],
                    [cur.startX, cur.targetX]
                  );
                  const cy =
                    interpolate(
                      swarmConvergeP,
                      [0, 1],
                      [cur.startY, cur.targetY]
                    ) +
                    cur.splitShiftY * elasticSplit2bP;
                  const floatX = Math.sin(frame * 0.08 + idx) * 6;
                  const floatY = Math.cos(frame * 0.07 + idx) * 6;
                  return (
                    <div
                      key={idx}
                      style={{
                        position: 'absolute',
                        left: 540 + cx + floatX,
                        top: 960 + cy + floatY,
                        zIndex: 35,
                      }}
                    >
                      <CursorArrowSVG color={cur.color} label={cur.label} scale={1.02} />
                    </div>
                  );
                })}

              {/* BEAT 2A: "✳ BÂY GIỜ • NOW" PILL (Header Recoil at f274..f286) */}
              <div
                style={{
                  position: 'absolute',
                  left: 540,
                  top: 920 + interpolate(nowHeaderRecoilP, [0, 1], [0, -390]),
                  transform: `translate(-50%, -50%) scale(${
                    (0.3 + 0.7 * nowPillPopP) *
                    interpolate(nowHeaderRecoilP, [0, 1], [1, 0.78])
                  })`,
                  zIndex: 30,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: '18px 42px',
                  borderRadius: 999,
                  background:
                    'linear-gradient(90deg, #FEF08A 0%, #FACC15 55%, #F59E0B 100%)',
                  border: '3px solid #FFFFFF',
                  boxShadow: '0 0 50px rgba(250, 204, 21, 0.8)',
                }}
              >
                <GoldStarEmblem
                  size={34}
                  petalColor="#08090C"
                  centerColor="#F59E0B"
                  rotationDeg={frame * 4}
                />
                <span
                  style={{
                    fontFamily: "'SVN-Aeonik', sans-serif",
                    fontSize: 38,
                    fontWeight: 900,
                    color: '#08090C',
                    letterSpacing: '0.06em',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {nfc('✳ BÂY GIỜ • NOW')}
                </span>
              </div>

              {/* BEAT 2B-1 (f276+): 3D GLASS BOUNDING FRAME "NÓ LÀ CÁI / KỶ NGUYÊN CỦA" */}
              {frame >= 274 && (
                <div
                  style={{
                    position: 'absolute',
                    left: 540,
                    top: 880 + interpolate(elasticSplit2bP, [0, 1], [0, -185]),
                    width: interpolate(frame2bExpandP, [0, 1], [260, 920]),
                    transform: 'translate(-50%, -50%)',
                    padding: '26px 36px',
                    borderRadius: 28,
                    background: 'rgba(14, 18, 28, 0.88)',
                    border: '2.5px solid rgba(250, 204, 21, 0.75)',
                    boxShadow: '0 24px 60px rgba(0,0,0,0.7)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 10,
                    zIndex: 25,
                  }}
                >
                  <CornerHandles color="#38BDF8" fill="#FAF8F5" size={14} />

                  {/* Line 1 (f280+): "NÓ LÀ CÁI" */}
                  <div style={{ display: 'flex', gap: 16 }}>
                    {[nfc('NÓ'), nfc('LÀ'), nfc('CÁI')].map((w, i) => {
                      const wP = spring({
                        frame: Math.max(0, frame - (280 + i * 3)),
                        fps,
                        config: { mass: 0.65, damping: 12, stiffness: 190 },
                      });
                      return (
                        <span
                          key={i}
                          style={{
                            fontFamily: "'SVN-Aeonik', sans-serif",
                            fontSize: 46,
                            fontWeight: 800,
                            color: 'rgba(250, 248, 245, 0.88)',
                            transform: `translateY(${24 * (1 - wP)}px)`,
                            opacity: clamp01(wP * 1.4),
                          }}
                        >
                          {w}
                        </span>
                      );
                    })}
                  </div>

                  {/* Line 2 (f294+): "KỶ NGUYÊN CỦA" */}
                  {frame >= 292 && (
                    <div style={{ display: 'flex', gap: 18 }}>
                      {[nfc('KỶ'), nfc('NGUYÊN'), nfc('CỦA')].map((w, i) => {
                        const wP = spring({
                          frame: Math.max(0, frame - (294 + i * 3)),
                          fps,
                          config: { mass: 0.65, damping: 12, stiffness: 190 },
                        });
                        return (
                          <span
                            key={i}
                            style={{
                              fontFamily: "'SVN-Aeonik', sans-serif",
                              fontSize: 64,
                              fontWeight: 900,
                              color: '#FAF8F5',
                              lineHeight: 1.28,
                              transform: `translateY(${28 * (1 - wP)}px)`,
                              opacity: clamp01(wP * 1.4),
                            }}
                          >
                            {w}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* PRE-CUE 2B-2 (f314..f328): ELASTIC SPLIT & < ✦ SEMANTIC_CORE ✦ > SEED */}
              {frame >= 314 && frame < 328 && (
                <div
                  style={{
                    position: 'absolute',
                    left: 540,
                    top: 1020,
                    width: interpolate(semanticSeedBoxP, [0, 1], [280, 920]),
                    height: 150,
                    transform: 'translate(-50%, -50%)',
                    borderRadius: 24,
                    background: 'rgba(250, 204, 21, 0.16)',
                    border: '3px dashed #FACC15',
                    boxShadow: '0 0 45px rgba(250, 204, 21, 0.45)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    zIndex: 28,
                  }}
                >
                  <CornerHandles color="#FACC15" fill="#08090C" size={15} />
                  <span
                    style={{
                      fontFamily: "'GT-America', monospace",
                      fontSize: 16,
                      fontWeight: 900,
                      color: '#38BDF8',
                      letterSpacing: '0.18em',
                    }}
                  >
                    ✦ ELASTIC SPLIT PRE-CUE • SEEDING KEYWORD
                  </span>
                  <span
                    style={{
                      fontFamily: "'GT-America', monospace",
                      fontSize: 42,
                      fontWeight: 900,
                      color: '#FDE047',
                      letterSpacing: '0.1em',
                    }}
                  >
                    {'< ✦ SEMANTIC_CORE ✦ >'}
                  </span>
                </div>
              )}

              {/* CLIMAX 2B-2 (f328+): 3D GOLD "NGỮ NGHĨA" + LASER SCANNER + PORTAL WINDOW */}
              {frame >= 328 && (
                <div
                  style={{
                    position: 'absolute',
                    left: 540,
                    top: 1020,
                    width: 940,
                    transform: `translate(-50%, -50%) scale(${0.78 + 0.22 * semanticBoomP})`,
                    zIndex: 28,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      padding: '32px 36px',
                      borderRadius: 32,
                      background:
                        frame >= 418
                          ? 'rgba(8, 9, 12, 0.94)'
                          : 'linear-gradient(135deg, #FEF9C3 0%, #FACC15 48%, #F59E0B 100%)',
                      border: '4px solid #FFFFFF',
                      boxShadow:
                        '0 28px 75px rgba(245, 158, 11, 0.55), 0 0 60px rgba(250, 204, 21, 0.65)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      overflow: 'hidden',
                    }}
                  >
                    <CornerHandles color="#FFFFFF" fill="#08090C" size={16} />

                    <div
                      style={{
                        display: 'flex',
                        gap: 24,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {[nfc('NGỮ'), nfc('NGHĨA')].map((w, i) => {
                        const wP = spring({
                          frame: Math.max(0, frame - (328 + i * 3)),
                          fps,
                          config: { mass: 0.75, damping: 11, stiffness: 200 },
                        });
                        const portalSplitX =
                          frame >= 418
                            ? (i === 0 ? -1 : 1) *
                              interpolate(frame, [418, 438], [0, 320], {
                                extrapolateLeft: 'clamp',
                                extrapolateRight: 'clamp',
                                easing: EXPO_OUT,
                              })
                            : 0;
                        return (
                          <span
                            key={i}
                            style={{
                              fontFamily: "'SVN-Aeonik', sans-serif",
                              fontSize: 102,
                              fontWeight: 900,
                              lineHeight: 1.25,
                              color: frame >= 418 ? '#FACC15' : '#08090C',
                              letterSpacing: '-0.02em',
                              transform: `translateX(${portalSplitX}px) translateY(${32 * (1 - wP)}px) scale(${0.8 + 0.2 * wP})`,
                            }}
                          >
                            {w}
                          </span>
                        );
                      })}
                    </div>

                    {/* Self-drawing Gold-Black Underline inside card (f366..f418) */}
                    {frame >= 364 && frame < 418 && (
                      <svg width={680} height={24} viewBox="0 0 680 24">
                        <path
                          d="M 20 14 L 660 14"
                          stroke="#08090C"
                          strokeWidth="6"
                          strokeLinecap="round"
                          strokeDasharray="640"
                          strokeDashoffset={640 * (1 - goldUnderline2bP)}
                        />
                      </svg>
                    )}

                    {/* Laser Semantic Scanner Beam (f358..f416) */}
                    {frame >= 358 && frame <= 416 && (
                      <div
                        style={{
                          position: 'absolute',
                          left: 0,
                          right: 0,
                          top: `${laserScanP * 100}%`,
                          height: 8,
                          background:
                            'linear-gradient(90deg, #38BDF8 0%, #FFFFFF 50%, #38BDF8 100%)',
                          boxShadow: '0 0 28px #38BDF8, 0 0 12px #FFFFFF',
                        }}
                      />
                    )}
                  </div>

                  {/* 3 Semantic Verification Badges (f364..f418) */}
                  {frame >= 362 && (
                    <div
                      style={{
                        marginTop: 24,
                        display: 'flex',
                        gap: 14,
                        justifyContent: 'center',
                        flexWrap: 'wrap',
                      }}
                    >
                      {[
                        nfc('✓ HIỂU Ý ĐỊNH'),
                        nfc('✓ ĐỌC NGỮ CẢNH'),
                        nfc('✓ KHỚP NHU CẦU'),
                      ].map((b, i) => {
                        const bP = spring({
                          frame: Math.max(0, frame - (364 + i * 5)),
                          fps,
                          config: { mass: 0.7, damping: 12, stiffness: 185 },
                        });
                        return (
                          <div
                            key={i}
                            style={{
                              padding: '12px 22px',
                              borderRadius: 999,
                              background: 'rgba(14, 22, 34, 0.92)',
                              border: '2px solid #34D399',
                              color: '#6EE7B7',
                              fontFamily: "'SVN-Aeonik', sans-serif",
                              fontSize: 22,
                              fontWeight: 800,
                              transform: `translateY(${24 * (1 - bP)}px) scale(${0.8 + 0.2 * bP})`,
                              opacity: clamp01(bP * 1.4),
                            }}
                          >
                            {b}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </AbsoluteFill>
          )}

          {/* ================================================================
              SCENE 3 LAYER (f418 -> f600): EMERGES FROM PORTAL ZOOM-THROUGH
              ================================================================ */}
          {frame >= 418 && (
            <AbsoluteFill
              style={{
                transform: `scale(${scene3PortalScale})`,
                transformOrigin: '540px 960px',
                opacity: scene3PortalOpacity,
                zIndex: 40,
              }}
            >
              {/* Portal Golden Rim Halo during transition (f418..f452) */}
              {frame < 454 && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 40,
                    borderRadius: 48,
                    border: '6px solid #FACC15',
                    boxShadow:
                      '0 0 80px rgba(250, 204, 21, 0.85), inset 0 0 60px rgba(250, 204, 21, 0.45)',
                    opacity: interpolate(frame, [418, 434, 454], [0.9, 1, 0], {
                      extrapolateLeft: 'clamp',
                      extrapolateRight: 'clamp',
                    }),
                    pointerEvents: 'none',
                  }}
                />
              )}

              {/* BEAT 3A (f430..f600): CARET & SELECTION FRAME -> "BẠN KHÔNG CẦN THIẾT / PHẢI LÀM" */}
              <div
                style={{
                  position: 'absolute',
                  left: 540,
                  top: 860 + interpolate(headerRecoil3bP, [0, 1], [0, -370]),
                  width: interpolate(box3aSweepP, [0, 1], [180, 940]),
                  transform: `translate(-50%, -50%) scale(${interpolate(
                    headerRecoil3bP,
                    [0, 1],
                    [1, 0.76]
                  )})`,
                  padding: '26px 36px',
                  borderRadius: 28,
                  background: 'rgba(14, 17, 26, 0.92)',
                  border: '3px solid #FACC15',
                  boxShadow: '0 24px 60px rgba(0,0,0,0.75)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <CornerHandles color="#FACC15" fill="#FFFFFF" size={14} />

                <div
                  style={{
                    padding: '4px 16px',
                    borderRadius: 999,
                    backgroundColor: 'rgba(250, 204, 21, 0.18)',
                    border: '1.5px solid #FACC15',
                    color: '#FDE047',
                    fontFamily: "'GT-America', monospace",
                    fontSize: 14,
                    fontWeight: 900,
                    letterSpacing: '0.14em',
                  }}
                >
                  ✦ PORTAL HAND-OFF • ROLE_FILTER_SCAN
                </div>

                {/* Line 1: BẠN KHÔNG CẦN THIẾT */}
                <div
                  style={{
                    display: 'flex',
                    gap: 16,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {words3aLine1.map((w, i) => {
                    const wP = spring({
                      frame: Math.max(0, frame - (438 + i * 3)),
                      fps,
                      config: { mass: 0.65, damping: 12, stiffness: 195 },
                    });
                    return (
                      <span
                        key={i}
                        style={{
                          fontFamily: "'SVN-Aeonik', sans-serif",
                          fontSize: 58,
                          fontWeight: 900,
                          lineHeight: 1.3,
                          color: '#FAF8F5',
                          transform: `translateY(${28 * (1 - wP)}px)`,
                          opacity: clamp01(wP * 1.5),
                        }}
                      >
                        {w}
                      </span>
                    );
                  })}
                </div>

                {/* Line 2: PHẢI LÀM + Glowing Caret */}
                <div
                  style={{
                    display: 'flex',
                    gap: 16,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {words3aLine2.map((w, i) => {
                    const wP = spring({
                      frame: Math.max(0, frame - (452 + i * 3.5)),
                      fps,
                      config: { mass: 0.65, damping: 12, stiffness: 195 },
                    });
                    return (
                      <span
                        key={i}
                        style={{
                          fontFamily: "'SVN-Aeonik', sans-serif",
                          fontSize: 64,
                          fontWeight: 900,
                          lineHeight: 1.3,
                          color: '#FACC15',
                          transform: `translateY(${28 * (1 - wP)}px)`,
                          opacity: clamp01(wP * 1.5),
                        }}
                      >
                        {w}
                      </span>
                    );
                  })}
                  <div
                    style={{
                      width: 8,
                      height: 58,
                      borderRadius: 4,
                      backgroundColor: '#FACC15',
                      boxShadow: '0 0 18px #FACC15',
                    }}
                  />
                </div>
              </div>

              {/* BEAT 3B (f490..f600): VERTICAL SLOT-MACHINE WHEEL PICKER -> "✖ IDOL TRÊN VIDEO" */}
              {frame >= 490 && (
                <div
                  style={{
                    position: 'absolute',
                    left: 540,
                    top: 1030,
                    width: 940,
                    transform: `translate(-50%, -50%) scale(${
                      (0.85 + 0.15 * wheelAppearP) *
                      (frame >= 513 ? 0.94 + 0.06 * idolLockSnapP : 1)
                    })`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  {/* 3D Slot-Wheel Drum Container */}
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      height: 390,
                      borderRadius: 32,
                      background: 'rgba(10, 12, 20, 0.95)',
                      border:
                        frame >= 513
                          ? '4px solid #EF4444'
                          : '3px solid rgba(250, 204, 21, 0.65)',
                      boxShadow:
                        frame >= 513
                          ? '0 28px 70px rgba(239, 68, 68, 0.38), 0 0 45px rgba(250, 204, 21, 0.35)'
                          : '0 24px 60px rgba(0,0,0,0.75)',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {/* Center Selection Lock Window Highlight */}
                    <div
                      style={{
                        position: 'absolute',
                        left: 20,
                        right: 20,
                        top: '50%',
                        height: 126,
                        transform: 'translateY(-50%)',
                        borderRadius: 22,
                        background:
                          frame >= 513
                            ? 'linear-gradient(90deg, rgba(220, 38, 38, 0.28) 0%, rgba(250, 204, 21, 0.22) 100%)'
                            : 'rgba(250, 204, 21, 0.12)',
                        border:
                          frame >= 513
                            ? '3px solid #FACC15'
                            : '2px dashed rgba(250, 204, 21, 0.55)',
                        zIndex: 5,
                      }}
                    />

                    {/* Scrolling Drum List (index 0..4 from f490..f513) */}
                    <div
                      style={{
                        position: 'relative',
                        zIndex: 10,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        filter:
                          slotWheelBlur3b > 0.4 ? 'url(#slotWheelBlur3b)' : undefined,
                        transform: `translateY(${interpolate(
                          wheelSpinP,
                          [0, 1],
                          [360, -90]
                        )}px)`,
                      }}
                    >
                      {slotWheelItems.map((item, idx) => {
                        const isTarget = idx === 4;
                        const isLocked = frame >= 513 && isTarget;
                        return (
                          <div
                            key={idx}
                            style={{
                              height: 90,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              position: 'relative',
                              padding: '0 28px',
                            }}
                          >
                            <span
                              style={{
                                fontFamily: "'SVN-Aeonik', sans-serif",
                                fontSize: isTarget ? 66 : 40,
                                fontWeight: isTarget ? 900 : 700,
                                color: isLocked
                                  ? idolStrikeP > 0.6
                                    ? '#94A3B8'
                                    : '#FAF8F5'
                                  : isTarget
                                  ? '#FACC15'
                                  : 'rgba(250, 248, 245, 0.36)',
                                letterSpacing: isTarget ? '-0.02em' : '0',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {item}
                            </span>

                            {/* Red Strike-Through across "✖ IDOL TRÊN VIDEO" (f530+) */}
                            {isLocked && frame >= 530 && (
                              <div
                                style={{
                                  position: 'absolute',
                                  left: 24,
                                  top: '52%',
                                  width: `${idolStrikeP * 92}%`,
                                  height: 12,
                                  borderRadius: 999,
                                  background:
                                    'linear-gradient(90deg, #EF4444 0%, #FACC15 100%)',
                                  boxShadow: '0 0 24px #EF4444',
                                  transform: 'translateY(-50%) rotate(-2deg)',
                                }}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Finale Stamp "[✕ KHÔNG CẦN ĐÓNG KỊCH]" (f552..f600) */}
                  {frame >= 550 && (
                    <div
                      style={{
                        marginTop: 26,
                        padding: '14px 36px',
                        borderRadius: 18,
                        backgroundColor: '#EF4444',
                        border: '3px solid #FEF08A',
                        boxShadow: '0 18px 45px rgba(239, 68, 68, 0.5)',
                        color: '#FFFFFF',
                        fontFamily: "'SVN-Aeonik', sans-serif",
                        fontSize: 34,
                        fontWeight: 900,
                        letterSpacing: '0.04em',
                        transform: `scale(${0.7 + 0.3 * stampPopP}) rotate(-2deg)`,
                      }}
                    >
                      {nfc('[✕ KHÔNG CẦN ĐÓNG KỊCH]')}
                    </div>
                  )}
                </div>
              )}
            </AbsoluteFill>
          )}
        </div>
      </div>

      {/* ====================================================================
          TOP & BOTTOM HUD OVERLAY (Timecode + Synchronized Transcript)
          ==================================================================== */}
      <div
        style={{
          position: 'absolute',
          top: 34,
          left: 44,
          right: 44,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 80,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            padding: '8px 18px',
            borderRadius: 999,
            background: 'rgba(8, 9, 12, 0.82)',
            border: '1.5px solid rgba(250, 204, 21, 0.5)',
            fontFamily: "'GT-America', monospace",
            fontSize: 14,
            fontWeight: 800,
            color: '#FDE047',
            letterSpacing: '0.1em',
          }}
        >
          WORLD CANVAS • ZERO HARD-CUT • PRE-CUE 60FPS
        </div>
        <div
          style={{
            padding: '8px 18px',
            borderRadius: 999,
            background: 'rgba(8, 9, 12, 0.82)',
            border: '1.5px solid rgba(250, 204, 21, 0.5)',
            fontFamily: "'GT-America', monospace",
            fontSize: 14,
            fontWeight: 800,
            color: '#FAF8F5',
            letterSpacing: '0.1em',
          }}
        >
          {`${(frame / fps).toFixed(2).padStart(5, '0')}S / 10.00S • F${String(frame).padStart(3, '0')}`}
        </div>
      </div>

      {/* Bottom Synchronized Subtitle Progress Bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 38,
          left: 44,
          right: 44,
          padding: '14px 26px',
          borderRadius: 22,
          background: 'rgba(8, 9, 12, 0.86)',
          border: '1.5px solid rgba(250, 204, 21, 0.48)',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          zIndex: 80,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            fontFamily: "'SVN-Aeonik', sans-serif",
            fontSize: 24,
            fontWeight: 700,
            lineHeight: 1.35,
            color: '#FAF8F5',
            textAlign: 'center',
          }}
        >
          {frame < 238
            ? nfc('Cái mạng xã hội cũ mà mình từng biết — NÓ ĐÃ CHẾT RỒI.')
            : frame < 436
            ? nfc('Bây giờ nó là cái KỶ NGUYÊN CỦA NGỮ NGHĨA.')
            : nfc('Bạn không cần thiết phải làm IDOL Ở TRÊN VIDEO.')}
        </div>
        <div
          style={{
            width: '100%',
            height: 6,
            borderRadius: 99,
            background: 'rgba(255,255,255,0.16)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${(frame / durationInFrames) * 100}%`,
              height: '100%',
              background:
                'linear-gradient(90deg, #FEF08A 0%, #FACC15 55%, #F97316 100%)',
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};
