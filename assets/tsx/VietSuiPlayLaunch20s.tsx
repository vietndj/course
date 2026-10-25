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
const EXPO_IN_OUT = Easing.bezier(0.76, 0, 0.24, 1);
const PUNCH_OUT = Easing.bezier(0.22, 1.18, 0.36, 1);

const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));
const nfc = (s: string): string => s.normalize('NFC');

// ============================================================================
// KHUÔN THIẾT KẾ GỐC SỐ 6: VIETSUIPLAYLAUNCH20S (16:9 & 9:16 RESPONSIVE)
// Tái tạo chuẩn 100% nhịp nhạc & chuyển động 60fps của mẫu Pinterest
// 1099793171536756930 (SuiPlay 0X1 Trailer - 20.03s / 1.202 frames @ 60fps).
// Chỉ cần thay câu chữ Tiếng Việt và đường dẫn video trong Bảng Biến Tweaks
// ở dưới là xuất ngay cả 2 bản Ngang (16:9) và Dọc (9:16) trong 3 giây.
// ============================================================================
export interface VietSuiPlayLaunchProps {
  mode?: '16x9' | '9x16';

  // --- 1. Bảng Điền Chữ Tiếng Việt (10 Điểm Chữ Qua 8 Stages) ---
  stage1Text?: string;
  stage2SolidText?: string;
  stage2OutlineText?: string;
  stage3ScreenTitle?: string;
  stage3ScreenBadge?: string;
  stage4Line1?: string;
  stage4Line2?: string;
  stage5CenterText?: string;
  stage6aGiantChar?: string;
  stage6aRestText?: string;
  stage6aSubPill?: string;
  stage6bLine1?: string;
  stage6bLine2?: string;
  stage6cLine1?: string;
  stage6cLine2?: string;
  stage7CenterText?: string;
  stage8DomainText?: string;
  stage8SubText?: string;

  // --- 2. Danh sách Video Minh Họa Đã Pre-Slice 60fps All-Intra ---
  portalClip?: string;
  stage4Clips?: string[];
  stage5Clips?: string[];
  stage6cCardClip?: string;
  stage7MatchCutClips?: Array<{ src: string; label: string }>;

  // --- 3. Âm thanh & Bảng màu chủ đạo ---
  audioSrc?: string;
  bgDeep?: string;
  bgGlow?: string;
  accentBlue?: string;
  accentViolet?: string;
  accentCyan?: string;
  motionBlurScale?: number;
}

export const defaultVietSuiPlayLaunchProps: Required<VietSuiPlayLaunchProps> = {
  mode: '16x9',

  // --- 1. Bảng Điền Chữ Tiếng Việt (Chốt theo anh Việt) ---
  stage1Text: 'Định nghĩa lại',
  stage2SolidText: 'Edit Video',
  stage2OutlineText: 'với AI',
  stage3ScreenTitle: 'Edit Video với AI',
  stage3ScreenBadge: 'AI by Gemini',
  stage4Line1: 'Tự động cắt',
  stage4Line2: '& tạo cảnh',
  stage5CenterText: 'Style của riêng bạn',
  stage6aGiantChar: 'M',
  stage6aRestText: 'ột lệnh',
  stage6aSubPill: 'AI by Gemini',
  stage6bLine1: 'Tự làm',
  stage6bLine2: 'toàn bộ',
  stage6cLine1: 'Bạn chỉ cần',
  stage6cLine2: 'lo kiến thức',
  stage7CenterText: 'Dựng cơ bản có AI',
  stage8DomainText: 'offline.fedu.vn',
  stage8SubText: 'Edit Video với AI • AI by Gemini',

  // --- 2. Danh sách Video Minh Họa ---
  portalClip: 'suiplay/s3_portal_open.mp4',
  stage4Clips: [
    'suiplay/s4_sbs_viet8h.mp4',
    'suiplay/s4_sbs_thamtho1.mp4',
  ],
  stage5Clips: [
    'suiplay/s5_sbs_thamtho2.mp4',
    'suiplay/s5_nhasy_atlas.mp4',
    'suiplay/s5_claude_riso.mp4',
  ],
  stage6cCardClip: 'suiplay/s6c_card_portal.mp4',
  stage7MatchCutClips: [
    { src: 'suiplay/s7_mc1_viet8h.mp4', label: 'TALKING-HEAD V3' },
    { src: 'suiplay/s7_mc2_thamtho1.mp4', label: 'SPA EDIT V8 • LOGO 2 TẦNG' },
    { src: 'suiplay/s7_mc3_thamtho2.mp4', label: 'SCIENTIFIC ATLAS DA LIỄU' },
    { src: 'suiplay/s7_mc4_nhasy.mp4', label: 'ATLAS NHA KHOA 2D' },
    { src: 'suiplay/s7_mc5_earthzoom.mp4', label: 'AI HOOK • EARTH ZOOM' },
    { src: 'suiplay/s7_mc6_throughobj.mp4', label: 'AI HOOK • THROUGH OBJECT' },
    { src: 'suiplay/s7_mc7_mcpower.mp4', label: 'MASTERCLASS 60FPS' },
    { src: 'suiplay/s7_mc8_gold3d.mp4', label: 'BENTO 3D GOLD ORBIT' },
    { src: 'suiplay/s7_mc9_cleanv3.mp4', label: 'ULTRA-CLEAN V3 60FPS' },
  ],

  // --- 3. Âm thanh & Bảng màu ---
  audioSrc: 'suiplay/pin_audio.wav',
  bgDeep: '#04050F',
  bgGlow: '#1A215E',
  accentBlue: '#4E6BFF',
  accentViolet: '#7C4DFF',
  accentCyan: '#38BDF8',
  motionBlurScale: 1.0,
};

// ============================================================================
// COMPONENT PHỤ TRỢ 1: BỘ LỌC DIRECTIONAL SVG MOTION BLUR THEO VẬN TỐC THẬT
// ============================================================================
const DirectionalBlurFilter: React.FC<{
  id: string;
  vx: number;
  vy: number;
}> = ({ id, vx, vy }) => {
  const sx = Math.min(48, Math.max(0, Number.isFinite(vx) ? vx : 0));
  const sy = Math.min(48, Math.max(0, Number.isFinite(vy) ? vy : 0));
  return (
    <svg width={0} height={0} style={{ position: 'absolute', pointerEvents: 'none' }}>
      <defs>
        <filter id={id} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur in="SourceGraphic" stdDeviation={`${sx.toFixed(2)} ${sy.toFixed(2)}`} />
        </filter>
      </defs>
    </svg>
  );
};

// ============================================================================
// COMPONENT PHỤ TRỢ 2: KHUNG VIDEO MINH HỌA THÍCH ỨNG 16:9 & 9:16
// ============================================================================
const ShowcaseVideoCanvas: React.FC<{
  src: string;
  isPortraitLayout: boolean;
  isSideBySide?: boolean;
  badgeText?: string;
  accentColor?: string;
  dimScrim?: number;
  zoomScale?: number;
}> = ({
  src,
  isPortraitLayout,
  isSideBySide = false,
  badgeText,
  accentColor = '#4E6BFF',
  dimScrim = 0.42,
  zoomScale = 1.0,
}) => {
  const resolvedSrc = staticFile(src);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#050714',
        overflow: 'hidden',
        transform: `scale(${zoomScale.toFixed(4)})`,
      }}
    >
      {/* Lớp 1: Nền Ambient Blur lấp đầy 100% khung hình */}
      <AbsoluteFill
        style={{
          filter: 'blur(34px) brightness(0.48) saturate(1.35)',
          transform: 'scale(1.16)',
        }}
      >
        <OffthreadVideo
          src={resolvedSrc}
          muted
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </AbsoluteFill>

      {/* Lớp 2: Bố cục hiển thị sắc nét tùy theo 16:9 hay 9:16 */}
      {isPortraitLayout ? (
        isSideBySide ? (
          // Trong màn dọc 9:16 khi chiếu clip Side-by-Side (1080x960): Đặt khung lớn sắc nét ở tâm + viền ánh sáng
          <AbsoluteFill
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              padding: '0 24px',
            }}
          >
            <div
              style={{
                width: '100%',
                height: 980,
                borderRadius: 34,
                overflow: 'hidden',
                border: '2px solid rgba(255,255,255,0.22)',
                boxShadow: '0 32px 90px rgba(0,0,0,0.78), 0 0 60px rgba(78,107,255,0.28)',
                position: 'relative',
                backgroundColor: '#070918',
              }}
            >
              <OffthreadVideo
                src={resolvedSrc}
                muted
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </AbsoluteFill>
        ) : (
          // Trong màn dọc 9:16 khi chiếu clip 9:16: Full-screen 100%
          <AbsoluteFill>
            <OffthreadVideo
              src={resolvedSrc}
              muted
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </AbsoluteFill>
        )
      ) : isSideBySide ? (
        // Trong màn ngang 16:9 khi chiếu clip Side-by-Side Trước/Sau: Khung Widescreen lớn ở trung tâm
        <AbsoluteFill
          style={{
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              width: 1460,
              height: 960,
              borderRadius: 32,
              overflow: 'hidden',
              border: '2px solid rgba(255,255,255,0.2)',
              boxShadow: '0 30px 90px rgba(0,0,0,0.75), 0 0 70px rgba(78,107,255,0.25)',
              backgroundColor: '#070918',
            }}
          >
            <OffthreadVideo
              src={resolvedSrc}
              muted
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        </AbsoluteFill>
      ) : (
        // Trong màn ngang 16:9 khi chiếu clip dọc 9:16: Bố cục 3 Khung Studio Đồng Bộ (Triptych Showcase)
        <AbsoluteFill
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 36,
          }}
        >
          {/* Khung phụ trái */}
          <div
            style={{
              width: 490,
              height: 870,
              borderRadius: 28,
              overflow: 'hidden',
              opacity: 0.42,
              transform: 'scale(0.92) perspective(900px) rotateY(14deg)',
              border: '1.5px solid rgba(255,255,255,0.14)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.65)',
            }}
          >
            <OffthreadVideo
              src={resolvedSrc}
              muted
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          {/* Khung chính trung tâm sắc nét 100% */}
          <div
            style={{
              width: 580,
              height: 1010,
              borderRadius: 32,
              overflow: 'hidden',
              border: '2px solid rgba(255,255,255,0.28)',
              boxShadow: '0 30px 90px rgba(0,0,0,0.85), 0 0 65px rgba(78,107,255,0.32)',
            }}
          >
            <OffthreadVideo
              src={resolvedSrc}
              muted
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          {/* Khung phụ phải */}
          <div
            style={{
              width: 490,
              height: 870,
              borderRadius: 28,
              overflow: 'hidden',
              opacity: 0.42,
              transform: 'scale(0.92) perspective(900px) rotateY(-14deg)',
              border: '1.5px solid rgba(255,255,255,0.14)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.65)',
            }}
          >
            <OffthreadVideo
              src={resolvedSrc}
              muted
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        </AbsoluteFill>
      )}

      {/* Lớp 3: Radial Scrim thông minh giúp chữ trắng nổi bật 100% trên mọi nền video */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 50%, rgba(4,6,18,${(dimScrim * 0.92).toFixed(2)}) 0%, rgba(4,6,18,${(dimScrim * 1.25).toFixed(2)}) 100%)`,
        }}
      />

      {/* Lớp 4: Nhãn góc nhỏ tinh tế (nếu có) */}
      {badgeText ? (
        <div
          style={{
            position: 'absolute',
            top: isPortraitLayout ? 86 : 44,
            left: isPortraitLayout ? 54 : 64,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 22px',
            borderRadius: 999,
            backgroundColor: 'rgba(7, 10, 28, 0.76)',
            border: `1.5px solid ${accentColor}66`,
            backdropFilter: 'blur(12px)',
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: accentColor,
              boxShadow: `0 0 12px ${accentColor}`,
            }}
          />
          <span
            style={{
              fontFamily: "'SVN-Aeonik', sans-serif",
              fontSize: isPortraitLayout ? 22 : 20,
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: '#E2E8F0',
              textTransform: 'uppercase',
            }}
          >
            {nfc(badgeText)}
          </span>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ============================================================================
// COMPONENT PHỤ TRỢ 3: KHUNG THIẾT BỊ STUDIO 3D ĐA LỚP (S3 & S8)
// Dựng 14 lớp chiều sâu 2.5D Extrusion + cụm điều khiển發sáng + Specular Sheen
// ============================================================================
const SuiPlayStudioDevice3D: React.FC<{
  rotateX: number;
  rotateY: number;
  rotateZ: number;
  scale: number;
  translateY: number;
  titleText: string;
  badgeText: string;
  subText?: string;
  screenVideoSrc?: string;
  screenVideoOpacity?: number;
  sheenProgress: number;
  isPortraitLayout: boolean;
}> = ({
  rotateX,
  rotateY,
  rotateZ,
  scale,
  translateY,
  titleText,
  badgeText,
  subText,
  screenVideoSrc,
  screenVideoOpacity = 0,
  sheenProgress,
  isPortraitLayout,
}) => {
  const bodyW = isPortraitLayout ? 920 : 1220;
  const bodyH = isPortraitLayout ? 500 : 560;
  const bodyRadius = bodyH / 2;
  const screenW = isPortraitLayout ? 620 : 840;
  const screenH = isPortraitLayout ? 410 : 464;
  const layers = 14;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        perspective: '1600px',
      }}
    >
      <div
        style={{
          width: bodyW,
          height: bodyH,
          position: 'relative',
          transformStyle: 'preserve-3d',
          transform: `translate3d(0px, ${translateY.toFixed(2)}px, 0px) scale(${scale.toFixed(4)}) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) rotateZ(${rotateZ.toFixed(2)}deg)`,
        }}
      >
        {/* 14 Lớp Vỏ Thân Máy (Extruded 3D Chassis Depth) */}
        {Array.from({ length: layers }).map((_, idx) => {
          const z = -(idx + 1) * 2.4;
          const shade = interpolate(idx, [0, layers - 1], [1, 0.35]);
          return (
            <div
              key={idx}
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: bodyRadius,
                transform: `translateZ(${z.toFixed(1)}px)`,
                background: `linear-gradient(135deg, rgba(38,52,126,${shade.toFixed(2)}) 0%, rgba(12,16,42,${shade.toFixed(2)}) 55%, rgba(28,38,96,${shade.toFixed(2)}) 100%)`,
                border: idx === 0 ? '2px solid rgba(130, 160, 255, 0.55)' : '1px solid rgba(60, 80, 165, 0.25)',
                boxShadow:
                  idx === layers - 1
                    ? '0 55px 120px rgba(0, 0, 0, 0.88), 0 0 90px rgba(78, 107, 255, 0.32)'
                    : undefined,
              }}
            />
          );
        })}

        {/* Mặt Trước Thiết Bị (Front Faceplate Z=0) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: bodyRadius,
            background:
              'radial-gradient(120% 140% at 18% 12%, #253174 0%, #0C1029 48%, #070919 88%, #1A245A 100%)',
            border: '2.5px solid rgba(148, 178, 255, 0.48)',
            boxShadow: 'inset 0 3px 16px rgba(255,255,255,0.22), inset 0 -8px 24px rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 38px',
            overflow: 'hidden',
          }}
        >
          {/* Cụm điều khiển bên trái (D-Pad + Analog Ring phát sáng) */}
          <div
            style={{
              width: (bodyW - screenW) / 2 - 48,
              height: '76%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-around',
            }}
          >
            {/* D-Pad Cross */}
            <div style={{ position: 'relative', width: 78, height: 78 }}>
              <div
                style={{
                  position: 'absolute',
                  left: 25,
                  top: 0,
                  width: 28,
                  height: 78,
                  borderRadius: 8,
                  background: 'linear-gradient(180deg, #748FFC 0%, #3B5BDB 100%)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 25,
                  width: 78,
                  height: 28,
                  borderRadius: 8,
                  background: 'linear-gradient(90deg, #748FFC 0%, #3B5BDB 100%)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
                }}
              />
            </div>

            {/* Left Thumbstick Neon Ring */}
            <div
              style={{
                width: 66,
                height: 66,
                borderRadius: '50%',
                background: 'radial-gradient(circle at 35% 35%, #1E264F 0%, #080B1A 100%)',
                border: '2.5px solid #5C7CFA',
                boxShadow: '0 0 18px rgba(92, 124, 250, 0.65), inset 0 2px 8px rgba(255,255,255,0.2)',
              }}
            />
          </div>

          {/* Màn Hình Studio Trung Tâm (Center Glass Screen) */}
          <div
            style={{
              width: screenW,
              height: screenH,
              borderRadius: 34,
              backgroundColor: '#040612',
              border: '2px solid rgba(120, 150, 255, 0.35)',
              boxShadow: 'inset 0 0 50px rgba(30, 50, 140, 0.45)',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {/* Glow nền trong màn hình */}
            <AbsoluteFill
              style={{
                background:
                  'radial-gradient(circle at 50% 45%, rgba(56, 88, 225, 0.42) 0%, rgba(8, 12, 34, 0.94) 72%)',
              }}
            />

            {/* Video bên trong màn hình (hiện lên trước khi Zoom-through) */}
            {screenVideoSrc && screenVideoOpacity > 0.01 ? (
              <AbsoluteFill style={{ opacity: clamp01(screenVideoOpacity) }}>
                <OffthreadVideo
                  src={staticFile(screenVideoSrc)}
                  muted
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <AbsoluteFill
                  style={{
                    background:
                      'radial-gradient(circle at 50% 50%, rgba(4,6,18,0.25) 0%, rgba(4,6,18,0.65) 100%)',
                  }}
                />
              </AbsoluteFill>
            ) : null}

            {/* Nội dung chữ chính trên màn hình thiết bị */}
            <div
              style={{
                position: 'relative',
                zIndex: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 16,
                padding: '0 32px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontFamily: "'SVN-Aeonik', sans-serif",
                  fontSize: isPortraitLayout ? 54 : 68,
                  fontWeight: 700,
                  color: '#FFFFFF',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2,
                  paddingTop: '0.12em',
                  paddingBottom: '0.12em',
                  textShadow: '0 8px 32px rgba(78, 107, 255, 0.55)',
                }}
              >
                {nfc(titleText)}
              </div>

              {subText ? (
                <div
                  style={{
                    fontFamily: "'SVN-Aeonik', sans-serif",
                    fontSize: isPortraitLayout ? 22 : 25,
                    fontWeight: 500,
                    color: '#A5B4FC',
                    letterSpacing: '0.04em',
                  }}
                >
                  {nfc(subText)}
                </div>
              ) : null}
            </div>

            {/* Badge đáy màn hình (AI by Gemini) */}
            <div
              style={{
                position: 'absolute',
                bottom: 28,
                zIndex: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '7px 20px',
                borderRadius: 999,
                backgroundColor: 'rgba(15, 23, 62, 0.78)',
                border: '1px solid rgba(129, 140, 248, 0.45)',
              }}
            >
              <span
                style={{
                  fontFamily: "'SVN-Aeonik', sans-serif",
                  fontSize: 18,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  color: '#C7D2FE',
                }}
              >
                {nfc(badgeText)}
              </span>
            </div>

            {/* Dải sáng phản chiếu mặt kính (Specular Glass Sheen) */}
            <div
              style={{
                position: 'absolute',
                top: -120,
                bottom: -120,
                width: 260,
                left: `${interpolate(sheenProgress, [0, 1], [-35, 115]).toFixed(1)}%`,
                transform: 'rotate(24deg)',
                background:
                  'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.18) 50%, rgba(255,255,255,0) 100%)',
                pointerEvents: 'none',
              }}
            />
          </div>

          {/* Cụm điều khiển bên phải (4 nút Action + Analog Ring phát sáng) */}
          <div
            style={{
              width: (bodyW - screenW) / 2 - 48,
              height: '76%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-around',
            }}
          >
            {/* 4 Action Buttons Diamond */}
            <div style={{ position: 'relative', width: 78, height: 78 }}>
              {[
                { x: 26, y: 0, label: 'A' },
                { x: 52, y: 26, label: 'I' },
                { x: 0, y: 26, label: 'V' },
                { x: 26, y: 52, label: '3' },
              ].map((btn, i) => (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    left: btn.x,
                    top: btn.y,
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    background: 'linear-gradient(145deg, #748FFC 0%, #364FC7 100%)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontFamily: "'SVN-Aeonik', sans-serif",
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#FFFFFF',
                    boxShadow: '0 3px 8px rgba(0,0,0,0.55)',
                  }}
                >
                  {btn.label}
                </div>
              ))}
            </div>

            {/* Right Thumbstick Neon Ring */}
            <div
              style={{
                width: 66,
                height: 66,
                borderRadius: '50%',
                background: 'radial-gradient(circle at 35% 35%, #1E264F 0%, #080B1A 100%)',
                border: '2.5px solid #38BDF8',
                boxShadow: '0 0 18px rgba(56, 189, 248, 0.65), inset 0 2px 8px rgba(255,255,255,0.2)',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPOSITION: VIETSUIPLAYLAUNCH20S (1.202 FRAMES @ 60FPS = 20.03S)
// ============================================================================
export const VietSuiPlayLaunch20s: React.FC<VietSuiPlayLaunchProps> = (rawProps) => {
  const props: Required<VietSuiPlayLaunchProps> = {
    ...defaultVietSuiPlayLaunchProps,
    ...rawProps,
  };

  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isPortrait = props.mode === '9x16' || height > width;
  const blurScale = props.motionBlurScale;

  // Nhịp thở camera liên tục (Sub-pixel Continuous Camera Drift)
  const cameraDrift = 1 + 0.006 * Math.sin(frame / 28);

  // ==========================================================================
  // STAGE 1 (f0 -> f120 | 0.00s -> 2.00s): "Định nghĩa lại"
  // ==========================================================================
  const s1Active = frame >= 0 && frame < 124;
  const s1In = clamp01((frame - 4) / 30);
  const s1Ease = EXPO_OUT(s1In);
  const s1Out = clamp01((frame - 98) / 22);
  const s1Opacity = clamp01(interpolate(frame, [3, 18, 98, 120], [0, 1, 1, 0]));
  const s1Tracking = interpolate(s1Ease, [0, 1], [0.28, -0.02]);
  const s1Scale = interpolate(s1Ease, [0, 1], [0.88, 1.0]) + s1Out * 0.06;
  const s1BlurX =
    (frame < 40
      ? interpolate(frame, [4, 14, 38], [34, 22, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
      : interpolate(frame, [98, 120], [0, 18], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })) *
    blurScale;

  // ==========================================================================
  // STAGE 2 (f120 -> f291 | 2.00s -> 4.85s): "Edit Video" (đặc) + "với AI" (viền)
  // ==========================================================================
  const s2Active = frame >= 118 && frame < 296;
  const s2SolidIn = clamp01((frame - 122) / 28);
  const s2SolidEase = EXPO_OUT(s2SolidIn);
  const s2OutlineIn = clamp01((frame - 150) / 36);
  const s2OutlineEase = EXPO_OUT(s2OutlineIn);
  const s2ExitDrop = clamp01((frame - 280) / 14);
  const s2Y = Math.pow(s2ExitDrop, 2.2) * 420;
  const s2BlurY = (frame >= 278 ? (frame - 278) * 2.6 : (1 - s2SolidEase) * 18) * blurScale;

  // Hiệu ứng nhấp nháy tắt từng ký tự ở f246 -> f282 (khi tiếng Riser lên đỉnh)
  const solidChars = Array.from(nfc(props.stage2SolidText));
  const flickerThresholds = [262, 248, 270, 254, 276, 250, 266, 258, 274, 252, 268, 260];

  // ==========================================================================
  // STAGE 3 (f291 -> f436 | 4.85s -> 7.26s): Khung Thiết Bị 3D & Zoom-Through
  // ==========================================================================
  const s3Active = frame >= 288 && frame < 440;
  const s3FlySpring = spring({
    fps,
    frame: Math.max(0, frame - 291),
    config: { mass: 0.7, damping: 13, stiffness: 120 },
  });
  const s3FlatProgress = clamp01((frame - 388) / 28);
  const s3FlatEase = EXPO_IN_OUT(s3FlatProgress);
  const s3PortalProgress = clamp01((frame - 418) / 17);
  const s3PortalEase = Easing.bezier(0.55, 0, 0.9, 0.45)(s3PortalProgress);

  const s3RotX = interpolate(s3FlatEase, [0, 1], [22, 0]) * (1 - s3PortalProgress);
  const s3RotY = interpolate(s3FlatEase, [0, 1], [-26, 0]) * (1 - s3PortalProgress);
  const s3RotZ = interpolate(s3FlatEase, [0, 1], [-14, 0]) * (1 - s3PortalProgress);
  const s3TransY = interpolate(s3FlySpring, [0, 1], [540, 0]) * (1 - s3FlatEase * 0.4);
  const s3Scale =
    interpolate(s3FlySpring, [0, 1], [0.52, 0.96]) +
    s3FlatEase * 0.12 +
    s3PortalEase * (isPortrait ? 3.8 : 3.2);
  const s3VideoOpacity = interpolate(frame, [396, 414], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const s3Sheen = clamp01((frame - 300) / 110);

  // ==========================================================================
  // STAGE 4 (f435 -> f543 | 7.25s -> 9.05s): "Tự động cắt / & tạo cảnh" + Side-by-Side
  // ==========================================================================
  const s4Active = frame >= 434 && frame < 544;
  const s4Line1P = clamp01((frame - 436) / 18);
  const s4Line1Ease = PUNCH_OUT(s4Line1P);
  const s4Line1X = interpolate(s4Line1Ease, [0, 1], [520, 0]);
  const s4Line1BlurX = Math.max(0, (1 - clamp01((frame - 436) / 14)) * 38) * blurScale;

  const s4Line2P = clamp01((frame - 450) / 20);
  const s4Line2Ease = PUNCH_OUT(s4Line2P);
  const s4Line2Y = interpolate(s4Line2Ease, [0, 1], [280, 0]);
  const s4Line2BlurY = Math.max(0, (1 - clamp01((frame - 450) / 15)) * 32) * blurScale;

  // ==========================================================================
  // STAGE 5 (f543 -> f702 | 9.05s -> 11.70s): "Style của riêng bạn" + 3 Clips
  // ==========================================================================
  const s5Active = frame >= 542 && frame < 704;
  const s5Words = nfc(props.stage5CenterText).split(' ');

  // ==========================================================================
  // STAGE 6 (f702 -> f912 | 11.70s -> 15.20s):
  //   6a (f702 -> f752): Chữ "M" khổng lồ Zoom-Out -> "Một lệnh"
  //   6b (f752 -> f840): "Tự làm / toàn bộ"
  //   6c (f840 -> f912): "Bạn chỉ cần / lo kiến thức" + Khung vuông bo góc ở tâm
  // ==========================================================================
  const s6Active = frame >= 702 && frame < 914;

  // 6a: Giant Letter "M" Zoom-Out
  const s6aActive = frame >= 702 && frame < 754;
  const s6aZoomP = clamp01((frame - 702) / 16);
  const s6aZoomEase = EXPO_OUT(s6aZoomP);
  const s6aScale = interpolate(s6aZoomEase, [0, 1], [15.5, 1.0]);
  const s6aRestP = clamp01((frame - 710) / 14);
  const s6aRestEase = EXPO_OUT(s6aRestP);
  const s6aBlur = Math.max(0, (1 - s6aZoomP) * 28) * blurScale;

  // 6b: "Tự làm / toàn bộ"
  const s6bActive = frame >= 750 && frame < 844;
  const s6bInP = clamp01((frame - 750) / 16);
  const s6bEase = PUNCH_OUT(s6bInP);
  const s6bBlurY = Math.max(0, (1 - clamp01((frame - 750) / 12)) * 30) * blurScale;

  // 6c: "Bạn chỉ cần / lo kiến thức" + Khung thẻ vuông bo góc bung lên
  const s6cActive = frame >= 840 && frame < 914;
  const s6cTextP = clamp01((frame - 840) / 16);
  const s6cTextEase = PUNCH_OUT(s6cTextP);
  const s6cBlurX = Math.max(0, (1 - clamp01((frame - 840) / 12)) * 28) * blurScale;
  const s6cCardSpring = spring({
    fps,
    frame: Math.max(0, frame - 854),
    config: { mass: 0.5, damping: 11, stiffness: 180 },
  });
  const s6cCardExpand = clamp01((frame - 898) / 14);
  const s6cCardExpandEase = EXPO_IN_OUT(s6cCardExpand);

  // ==========================================================================
  // STAGE 7 (f912 -> f1060 | 15.20s -> 17.67s): "Dựng cơ bản có AI" + 9 Match-Cuts
  // ==========================================================================
  const s7Active = frame >= 912 && frame < 1062;
  const s7BeatFrames = [912, 927, 942, 958, 976, 994, 1012, 1028, 1044, 1062];

  // ==========================================================================
  // STAGE 8 (f1060 -> f1202 | 17.67s -> 20.03s): Zoom-Out Thiết Bị + X-Glow + Shutter
  // ==========================================================================
  const s8Active = frame >= 1058;
  const s8ZoomOutP = clamp01((frame - 1060) / 22);
  const s8ZoomOutEase = EXPO_OUT(s8ZoomOutP);
  const s8FlipP = clamp01((frame - 1114) / 38);
  const s8FlipEase = EXPO_IN_OUT(s8FlipP);
  const s8ShutterP = clamp01((frame - 1142) / 48);
  const s8ShutterEase = EXPO_IN_OUT(s8ShutterP);

  const s8Scale = interpolate(s8ZoomOutEase, [0, 1], [3.6, 0.96]) - s8FlipEase * 0.1;
  const s8RotX =
    interpolate(s8ZoomOutEase, [0, 1], [0, 18]) * (1 - s8FlipEase) +
    Math.sin(s8FlipP * Math.PI) * 28;
  const s8RotY =
    interpolate(s8ZoomOutEase, [0, 1], [0, -22]) * (1 - s8FlipEase);
  const s8RotZ =
    interpolate(s8ZoomOutEase, [0, 1], [0, -12]) * (1 - s8FlipEase);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: props.bgDeep,
        overflow: 'hidden',
        fontFamily: "'SVN-Aeonik', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* Bản nhạc gốc giữ nguyên 100% */}
      <Audio src={staticFile(props.audioSrc)} />

      {/* Các bộ lọc SVG Directional Motion Blur */}
      <DirectionalBlurFilter id="s1-blur" vx={s1BlurX} vy={0} />
      <DirectionalBlurFilter id="s2-blur" vx={0} vy={s2BlurY} />
      <DirectionalBlurFilter id="s4-l1-blur" vx={s4Line1BlurX} vy={0} />
      <DirectionalBlurFilter id="s4-l2-blur" vx={0} vy={s4Line2BlurY} />
      <DirectionalBlurFilter id="s6a-blur" vx={s6aBlur} vy={s6aBlur * 0.4} />
      <DirectionalBlurFilter id="s6b-blur" vx={0} vy={s6bBlurY} />
      <DirectionalBlurFilter id="s6c-blur" vx={s6cBlurX} vy={s6cBlurX * 0.5} />

      {/* Nền Indigo Radial Glow chuẩn mẫu SuiPlay 0X1 */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${50 + Math.sin(frame / 35) * 12}% ${52 + Math.cos(frame / 42) * 10}%, ${props.bgGlow} 0%, ${props.bgDeep} 74%)`,
          transform: `scale(${cameraDrift.toFixed(4)})`,
        }}
      />

      {/* ====================================================================
          STAGE 1 (0.00s -> 2.00s): "Định nghĩa lại"
      ==================================================================== */}
      {s1Active ? (
        <AbsoluteFill
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            opacity: s1Opacity,
          }}
        >
          <div
            style={{
              fontSize: isPortrait ? 86 : 96,
              fontWeight: 700,
              color: '#FFFFFF',
              letterSpacing: `${s1Tracking.toFixed(3)}em`,
              lineHeight: 1.25,
              paddingTop: '0.16em',
              paddingBottom: '0.16em',
              transform: `scale(${s1Scale.toFixed(4)})`,
              filter: s1BlurX > 0.4 ? 'url(#s1-blur)' : undefined,
              textShadow: '0 10px 40px rgba(78, 107, 255, 0.45)',
            }}
          >
            {nfc(props.stage1Text)}
          </div>
        </AbsoluteFill>
      ) : null}

      {/* ====================================================================
          STAGE 2 (2.00s -> 4.85s): "Edit Video" (đặc) + "với AI" (viền mảnh)
      ==================================================================== */}
      {s2Active ? (
        <AbsoluteFill
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            transform: `translate3d(0px, ${s2Y.toFixed(2)}px, 0px)`,
            filter: s2BlurY > 0.5 ? 'url(#s2-blur)' : undefined,
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: isPortrait ? 'column' : 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: isPortrait ? 12 : 28,
            }}
          >
            {/* Cụm chữ đặc: "Edit Video" với hiệu ứng nhấp nháy tắt từng ký tự ở cuối Stage 2 */}
            <div
              style={{
                display: 'flex',
                fontSize: isPortrait ? 96 : 112,
                fontWeight: 700,
                color: '#FFFFFF',
                letterSpacing: '-0.02em',
                lineHeight: 1.22,
                paddingTop: '0.14em',
                paddingBottom: '0.14em',
              }}
            >
              {solidChars.map((ch, idx) => {
                const charAppear = clamp01((frame - (122 + idx * 2.2)) / 14);
                const offThreshold = flickerThresholds[idx % flickerThresholds.length];
                const isFlickerOut =
                  frame >= offThreshold && ((frame + idx * 3) % 6 < 4 || frame >= offThreshold + 10);
                const charOpacity = isFlickerOut ? 0.08 : EXPO_OUT(charAppear);
                return (
                  <span
                    key={idx}
                    style={{
                      display: 'inline-block',
                      opacity: charOpacity,
                      transform: `translate3d(${((1 - EXPO_OUT(charAppear)) * 24).toFixed(1)}px, 0px, 0px)`,
                      whiteSpace: 'pre',
                    }}
                  >
                    {ch}
                  </span>
                );
              })}
            </div>

            {/* Cụm chữ viền mảnh (Outline Stroke Reveal): "với AI" */}
            <svg
              width={isPortrait ? 420 : 440}
              height={isPortrait ? 140 : 150}
              viewBox="0 0 440 150"
              style={{ overflow: 'visible' }}
            >
              <text
                x={isPortrait ? '50%' : '8'}
                y="112"
                textAnchor={isPortrait ? 'middle' : 'start'}
                style={{
                  fontFamily: "'SVN-Aeonik', sans-serif",
                  fontSize: isPortrait ? 96 : 112,
                  fontWeight: 700,
                  fill: 'rgba(255,255,255,0.04)',
                  stroke: '#94A3B8',
                  strokeWidth: 2.6,
                  strokeDasharray: 900,
                  strokeDashoffset: interpolate(s2OutlineEase, [0, 1], [900, 0]),
                  letterSpacing: '0.01em',
                }}
              >
                {nfc(props.stage2OutlineText)}
              </text>
            </svg>
          </div>
        </AbsoluteFill>
      ) : null}

      {/* ====================================================================
          STAGE 3 (4.85s -> 7.25s): Thiết Bị 3D Bay Nghiêng -> Xoay Thẳng -> Zoom-Through
      ==================================================================== */}
      {s3Active ? (
        <AbsoluteFill>
          <SuiPlayStudioDevice3D
            rotateX={s3RotX}
            rotateY={s3RotY}
            rotateZ={s3RotZ}
            scale={s3Scale}
            translateY={s3TransY}
            titleText={props.stage3ScreenTitle}
            badgeText={props.stage3ScreenBadge}
            screenVideoSrc={props.portalClip}
            screenVideoOpacity={s3VideoOpacity}
            sheenProgress={s3Sheen}
            isPortraitLayout={isPortrait}
          />
        </AbsoluteFill>
      ) : null}

      {/* ====================================================================
          STAGE 4 (7.25s -> 9.05s): Video Side-by-Side Trước/Sau + "Tự động cắt / & tạo cảnh"
      ==================================================================== */}
      {s4Active ? (
        <AbsoluteFill>
          {/* Clip 1: f435 -> f490 (7.25s -> 8.17s) */}
          <Sequence from={434} durationInFrames={57}>
            <ShowcaseVideoCanvas
              src={props.stage4Clips[0]}
              isPortraitLayout={isPortrait}
              isSideBySide={false}
              badgeText="SO SÁNH TRƯỚC & SAU AI EDIT • CẮT NHỊP & B-ROLL"
              accentColor="#38BDF8"
              dimScrim={0.44}
              zoomScale={interpolate(frame, [434, 490], [1.06, 1.0], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              })}
            />
          </Sequence>

          {/* Clip 2: f490 -> f543 (8.17s -> 9.05s) */}
          <Sequence from={490} durationInFrames={54}>
            <ShowcaseVideoCanvas
              src={props.stage4Clips[1]}
              isPortraitLayout={isPortrait}
              isSideBySide={true}
              badgeText="TRƯỚC & SAU AI EDIT • KHÓA MẮT AFFINE & CẢNH TRÁM"
              accentColor="#818CF8"
              dimScrim={0.44}
              zoomScale={interpolate(frame, [490, 543], [1.05, 1.0], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              })}
            />
          </Sequence>

          {/* Chữ 2 tầng lệch nhịp: "Tự động cắt" (lao ngang) / "& tạo cảnh" (lao dọc) */}
          <AbsoluteFill
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isPortrait ? 'center' : 'flex-start',
                gap: 6,
                transform: isPortrait ? 'none' : 'translateX(-40px)',
              }}
            >
              <div
                style={{
                  fontSize: isPortrait ? 104 : 138,
                  fontWeight: 700,
                  color: '#FFFFFF',
                  letterSpacing: '-0.025em',
                  lineHeight: 1.18,
                  paddingTop: '0.14em',
                  paddingBottom: '0.08em',
                  transform: `translate3d(${s4Line1X.toFixed(1)}px, 0px, 0px)`,
                  filter: s4Line1BlurX > 0.5 ? 'url(#s4-l1-blur)' : undefined,
                  textShadow: '0 16px 48px rgba(0, 0, 0, 0.85)',
                }}
              >
                {nfc(props.stage4Line1)}
              </div>

              <div
                style={{
                  fontSize: isPortrait ? 104 : 138,
                  fontWeight: 700,
                  color: '#FFFFFF',
                  letterSpacing: '-0.025em',
                  lineHeight: 1.18,
                  paddingTop: '0.08em',
                  paddingBottom: '0.16em',
                  marginLeft: isPortrait ? 0 : 96,
                  opacity: clamp01((frame - 449) / 8),
                  transform: `translate3d(0px, ${s4Line2Y.toFixed(1)}px, 0px)`,
                  filter: s4Line2BlurY > 0.5 ? 'url(#s4-l2-blur)' : undefined,
                  textShadow: '0 16px 48px rgba(0, 0, 0, 0.85)',
                }}
              >
                {nfc(props.stage4Line2)}
              </div>
            </div>
          </AbsoluteFill>
        </AbsoluteFill>
      ) : null}

      {/* ====================================================================
          STAGE 5 (9.05s -> 11.70s): 3 Video Cắt Theo Beat + Chữ Tâm "Style của riêng bạn"
      ==================================================================== */}
      {s5Active ? (
        <AbsoluteFill>
          {/* Clip 3: f543 -> f598 (9.05s -> 9.97s) */}
          <Sequence from={543} durationInFrames={55}>
            <ShowcaseVideoCanvas
              src={props.stage5Clips[0]}
              isPortraitLayout={isPortrait}
              isSideBySide={true}
              badgeText="STYLE #1 • SPA DETOX & SCIENTIFIC ATLAS V4"
              accentColor="#34D399"
              dimScrim={0.45}
            />
          </Sequence>

          {/* Clip 4: f598 -> f652 (9.97s -> 10.87s) */}
          <Sequence from={598} durationInFrames={54}>
            <ShowcaseVideoCanvas
              src={props.stage5Clips[1]}
              isPortraitLayout={isPortrait}
              isSideBySide={false}
              badgeText="STYLE #2 • NHA KHOA & Y KHOA HỌC THUẬT"
              accentColor="#38BDF8"
              dimScrim={0.45}
            />
          </Sequence>

          {/* Clip 5: f652 -> f703 (10.87s -> 11.70s) */}
          <Sequence from={652} durationInFrames={52}>
            <ShowcaseVideoCanvas
              src={props.stage5Clips[2]}
              isPortraitLayout={isPortrait}
              isSideBySide={false}
              badgeText="STYLE #3 • CLAUDE EDITORIAL RISOGRAPH 60FPS"
              accentColor="#F59E0B"
              dimScrim={0.45}
            />
          </Sequence>

          {/* Chữ Neo Trung Tâm: "Style của riêng bạn" */}
          <AbsoluteFill
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              padding: '0 40px',
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: isPortrait ? '8px 20px' : '12px 26px',
                padding: isPortrait ? '22px 38px' : '24px 48px',
                borderRadius: 32,
                backgroundColor: 'rgba(5, 8, 22, 0.56)',
                border: '1.5px solid rgba(255, 255, 255, 0.22)',
                backdropFilter: 'blur(14px)',
                boxShadow: '0 24px 70px rgba(0,0,0,0.75)',
              }}
            >
              {s5Words.map((word, wIdx) => {
                const wP = clamp01((frame - (544 + wIdx * 3.5)) / 14);
                const wEase = PUNCH_OUT(wP);
                const wY = interpolate(wEase, [0, 1], [-95, 0]);
                return (
                  <span
                    key={wIdx}
                    style={{
                      display: 'inline-block',
                      fontSize: isPortrait ? 78 : 92,
                      fontWeight: 700,
                      color: '#FFFFFF',
                      letterSpacing: '-0.02em',
                      lineHeight: 1.24,
                      paddingTop: '0.14em',
                      paddingBottom: '0.14em',
                      opacity: clamp01(wP * 1.6),
                      transform: `translate3d(0px, ${wY.toFixed(1)}px, 0px)`,
                      textShadow: '0 10px 34px rgba(0, 0, 0, 0.85)',
                    }}
                  >
                    {word}
                  </span>
                );
              })}
            </div>
          </AbsoluteFill>
        </AbsoluteFill>
      ) : null}

      {/* ====================================================================
          STAGE 6 (11.70s -> 15.20s):
            6a: "M" khổng lồ Zoom-Out -> "Một lệnh" (AI by Gemini)
            6b: "Tự làm / toàn bộ"
            6c: "Bạn chỉ cần / lo kiến thức" + Khung vuông bo góc ở tâm
      ==================================================================== */}
      {s6Active ? (
        <AbsoluteFill
          style={{
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {/* 6a (f702 -> f752): "M" -> "Một lệnh" */}
          {s6aActive ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 18,
                filter: s6aBlur > 0.5 ? 'url(#s6a-blur)' : undefined,
              }}
            >
              {/* Pill công nghệ: AI by Gemini */}
              <div
                style={{
                  opacity: s6aRestEase,
                  transform: `translate3d(0px, ${((1 - s6aRestEase) * -28).toFixed(1)}px, 0px)`,
                  padding: '8px 26px',
                  borderRadius: 999,
                  background: 'linear-gradient(90deg, rgba(78,107,255,0.28) 0%, rgba(124,77,255,0.28) 100%)',
                  border: '1.5px solid rgba(165, 180, 252, 0.5)',
                  color: '#E0E7FF',
                  fontSize: isPortrait ? 26 : 28,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                }}
              >
                {nfc(props.stage6aSubPill)}
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'center',
                  fontSize: isPortrait ? 136 : 168,
                  fontWeight: 700,
                  color: '#FFFFFF',
                  letterSpacing: '-0.03em',
                  lineHeight: 1.22,
                  paddingTop: '0.16em',
                  paddingBottom: '0.16em',
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    transformOrigin: 'center center',
                    transform: `scale(${s6aScale.toFixed(3)})`,
                  }}
                >
                  {nfc(props.stage6aGiantChar)}
                </span>
                <span
                  style={{
                    display: 'inline-block',
                    opacity: s6aRestEase,
                    transform: `translate3d(${((1 - s6aRestEase) * 65).toFixed(1)}px, 0px, 0px)`,
                  }}
                >
                  {nfc(props.stage6aRestText)}
                </span>
              </div>
            </div>
          ) : null}

          {/* 6b (f752 -> f840): "Tự làm / toàn bộ" */}
          {s6bActive ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                filter: s6bBlurY > 0.5 ? 'url(#s6b-blur)' : undefined,
                transform: `scale(${interpolate(s6bEase, [0, 1], [0.76, 1.0]).toFixed(3)})`,
              }}
            >
              <div
                style={{
                  fontSize: isPortrait ? 136 : 164,
                  fontWeight: 700,
                  color: '#FFFFFF',
                  letterSpacing: '-0.03em',
                  lineHeight: 1.15,
                  paddingTop: '0.14em',
                  transform: `translate3d(0px, ${interpolate(s6bEase, [0, 1], [65, 0]).toFixed(1)}px, 0px)`,
                }}
              >
                {nfc(props.stage6bLine1)}
              </div>
              <div
                style={{
                  fontSize: isPortrait ? 142 : 172,
                  fontWeight: 700,
                  color: '#FFFFFF',
                  letterSpacing: '-0.03em',
                  lineHeight: 1.15,
                  paddingBottom: '0.16em',
                  transform: `translate3d(0px, ${interpolate(s6bEase, [0, 1], [-45, 0]).toFixed(1)}px, 0px)`,
                }}
              >
                {nfc(props.stage6bLine2)}
              </div>
            </div>
          ) : null}

          {/* 6c (f840 -> f912): "Bạn chỉ cần / lo kiến thức" + Khung vuông bo góc nảy lên ở tâm */}
          {s6cActive ? (
            <AbsoluteFill
              style={{
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {/* Khung Thẻ Vuông Bo Góc (Rounded Card Portal) ở giữa màn hình, phóng full ở f898 -> f912 */}
              {frame >= 854 ? (
                <div
                  style={{
                    position: 'absolute',
                    width: interpolate(
                      s6cCardExpandEase,
                      [0, 1],
                      [isPortrait ? 480 : 440, width]
                    ),
                    height: interpolate(
                      s6cCardExpandEase,
                      [0, 1],
                      [isPortrait ? 520 : 480, height]
                    ),
                    borderRadius: interpolate(s6cCardExpandEase, [0, 1], [36, 0]),
                    overflow: 'hidden',
                    transform: `scale(${interpolate(s6cCardSpring, [0, 1], [0.2, 1]).toFixed(3)})`,
                    border: '2px solid rgba(255,255,255,0.32)',
                    boxShadow: '0 30px 90px rgba(0,0,0,0.85)',
                    zIndex: 1,
                  }}
                >
                  <OffthreadVideo
                    src={staticFile(props.stage6cCardClip)}
                    muted
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <AbsoluteFill
                    style={{
                      background:
                        'radial-gradient(circle at 50% 50%, rgba(4,6,18,0.18) 0%, rgba(4,6,18,0.52) 100%)',
                    }}
                  />
                </div>
              ) : null}

              {/* 2 Dòng Chữ Đè Lên Khung Vuông ("Bạn chỉ cần / lo kiến thức") */}
              <div
                style={{
                  position: 'relative',
                  zIndex: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  filter: s6cBlurX > 0.5 ? 'url(#s6c-blur)' : undefined,
                  opacity: interpolate(frame, [900, 912], [1, 0], {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp',
                  }),
                }}
              >
                <div
                  style={{
                    fontSize: isPortrait ? 116 : 148,
                    fontWeight: 700,
                    color: '#FFFFFF',
                    letterSpacing: '-0.025em',
                    lineHeight: 1.16,
                    paddingTop: '0.14em',
                    transform: `translate3d(${interpolate(s6cTextEase, [0, 1], [-180, 0]).toFixed(1)}px, 0px, 0px)`,
                    textShadow: '0 14px 42px rgba(0,0,0,0.85)',
                  }}
                >
                  {nfc(props.stage6cLine1)}
                </div>
                <div
                  style={{
                    fontSize: isPortrait ? 116 : 148,
                    fontWeight: 700,
                    color: '#FFFFFF',
                    letterSpacing: '-0.025em',
                    lineHeight: 1.16,
                    paddingBottom: '0.16em',
                    transform: `translate3d(${interpolate(s6cTextEase, [0, 1], [180, 0]).toFixed(1)}px, 0px, 0px)`,
                    textShadow: '0 14px 42px rgba(0,0,0,0.85)',
                  }}
                >
                  {nfc(props.stage6cLine2)}
                </div>
              </div>
            </AbsoluteFill>
          ) : null}
        </AbsoluteFill>
      ) : null}

      {/* ====================================================================
          STAGE 7 (15.20s -> 17.67s): 9 Cú Match-Cut Theo Drum Roll + "Dựng cơ bản có AI"
      ==================================================================== */}
      {s7Active ? (
        <AbsoluteFill>
          {props.stage7MatchCutClips.map((clip, idx) => {
            const startF = s7BeatFrames[idx] ?? 912 + idx * 16;
            const endF = s7BeatFrames[idx + 1] ?? startF + 16;
            const durF = Math.max(1, endF - startF);
            return (
              <Sequence key={idx} from={startF} durationInFrames={durF}>
                <ShowcaseVideoCanvas
                  src={clip.src}
                  isPortraitLayout={isPortrait}
                  isSideBySide={false}
                  badgeText={`AI SHOWCASE #${idx + 1} • ${clip.label}`}
                  accentColor={idx % 2 === 0 ? '#4E6BFF' : '#38BDF8'}
                  dimScrim={0.38}
                  zoomScale={1.03}
                />
              </Sequence>
            );
          })}

          {/* Chữ Neo Giữa Màn Hình Trong Suốt Chuỗi Match-Cut: "Dựng cơ bản có AI" */}
          <AbsoluteFill
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              pointerEvents: 'none',
              padding: '0 36px',
            }}
          >
            <div
              style={{
                padding: isPortrait ? '22px 42px' : '26px 56px',
                borderRadius: 34,
                backgroundColor: 'rgba(4, 7, 20, 0.58)',
                border: '2px solid rgba(255, 255, 255, 0.28)',
                backdropFilter: 'blur(14px)',
                boxShadow: '0 28px 80px rgba(0,0,0,0.82)',
                transform: `scale(${(1 + 0.025 * Math.sin((frame - 912) * 0.42)).toFixed(4)})`,
              }}
            >
              <div
                style={{
                  fontSize: isPortrait ? 86 : 112,
                  fontWeight: 700,
                  color: '#FFFFFF',
                  letterSpacing: '-0.025em',
                  lineHeight: 1.22,
                  paddingTop: '0.14em',
                  paddingBottom: '0.14em',
                  textAlign: 'center',
                  textShadow: '0 14px 44px rgba(0, 0, 0, 0.9)',
                }}
              >
                {nfc(props.stage7CenterText)}
              </div>
            </div>
          </AbsoluteFill>
        </AbsoluteFill>
      ) : null}

      {/* ====================================================================
          STAGE 8 (17.67s -> 20.03s): Zoom-Out Khung Thiết Bị + X-Glow + Side Shutter
      ==================================================================== */}
      {s8Active ? (
        <AbsoluteFill style={{ backgroundColor: '#02030A' }}>
          {/* 4 Tia Sáng Chữ X (X-Glow Indigo/Violet chuẩn mẫu gốc) */}
          <AbsoluteFill
            style={{
              background: `
                linear-gradient(32deg, rgba(4,6,18,0.95) 38%, rgba(78,107,255,0.42) 50%, rgba(4,6,18,0.95) 62%),
                linear-gradient(-32deg, rgba(4,6,18,0.95) 38%, rgba(124,77,255,0.42) 50%, rgba(4,6,18,0.95) 62%)
              `,
              opacity: interpolate(frame, [1060, 1085, 1185, 1202], [0, 1, 0.85, 0.35], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              }),
            }}
          />

          {/* Khung Thiết Bị 3D hiện rõ "offline.fedu.vn" */}
          <SuiPlayStudioDevice3D
            rotateX={s8RotX}
            rotateY={s8RotY}
            rotateZ={s8RotZ}
            scale={s8Scale}
            translateY={0}
            titleText={props.stage8DomainText}
            badgeText={props.stage3ScreenBadge}
            subText={props.stage8SubText}
            sheenProgress={clamp01((frame - 1070) / 95)}
            isPortraitLayout={isPortrait}
          />

          {/* 2 Cánh Cửa Màn Trập Đen Hai Bên Khép Vào (Side Shutter Vignette) */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              width: `${interpolate(s8ShutterEase, [0, 1], [0, isPortrait ? 16 : 22]).toFixed(2)}%`,
              background: 'linear-gradient(90deg, #000000 75%, rgba(0,0,0,0) 100%)',
              zIndex: 10,
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              right: 0,
              width: `${interpolate(s8ShutterEase, [0, 1], [0, isPortrait ? 16 : 22]).toFixed(2)}%`,
              background: 'linear-gradient(-90deg, #000000 75%, rgba(0,0,0,0) 100%)',
              zIndex: 10,
            }}
          />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
