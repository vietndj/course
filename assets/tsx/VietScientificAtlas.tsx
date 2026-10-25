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
const nfc = (s: string): string => s.normalize('NFC');

export interface AtlasCallout {
  num: number;
  vi: string;
  latin: string;
  // Tọa độ chuẩn hóa 0..1 trên ảnh mô học sạch (không chữ)
  nx: number;
  ny: number;
  // Số đo nhảy số trên thẻ (vd 0.25 mm); bỏ trống nếu không cần
  measureValue?: number;
  measureUnit?: string;
}

export interface ScientificAtlasProps {
  // Tweaks Panel — nội dung
  kicker?: string;
  title1?: string;
  title2?: string;
  tissueSrc?: string;
  tissueAspect?: number; // width / height của ảnh mô học
  depthLabel?: string;
  scaleLabel?: string;
  callouts?: AtlasCallout[];
  voiceLine1?: string;
  voiceLine2?: string;
  voiceHighlight?: string;
  // Tweaks Panel — nhịp (frame @30fps)
  frameOpenAt?: number;
  firstCalloutAt?: number;
  calloutGap?: number; // <= 66 (2.2s) để giữ micro-beat
  voiceCardAt?: number;
  zoomFrom?: number;
  zoomTo?: number;
  // Tweaks Panel — màu
  paper?: string;
  ink?: string;
  leadInk?: string;
  mutedInk?: string;
  accent?: string;
  cardInk?: string;
}

export const defaultScientificAtlasProps: Required<ScientificAtlasProps> = {
  kicker: 'TÀI LIỆU MÔ HỌC DA LIỄU • HÌNH 01',
  title1: 'Sắc tố Melanin',
  title2: 'khóa sâu ở lớp đáy môi',
  tissueSrc: 'scientific/sci_01_tissue.png',
  tissueAspect: 677 / 620,
  depthLabel: '0.1 – 0.3 mm',
  scaleLabel: '100 µm  •  400×  •  H&E',
  callouts: [
    { num: 1, vi: 'Lớp biểu bì niêm mạc', latin: 'Squamous Epithelium', nx: 0.849, ny: 0.118 },
    {
      num: 2,
      vi: 'Melanin & cặn Nicotine khóa ở lớp đáy',
      latin: 'Stratum Basale',
      nx: 0.761,
      ny: 0.492,
      measureValue: 0.25,
      measureUnit: 'mm',
    },
    { num: 3, vi: 'Màng đáy ngăn tự đào thải', latin: 'Basement Membrane', nx: 0.746, ny: 0.777 },
  ],
  voiceLine1: 'Dù đã bỏ thuốc',
  voiceLine2: 'màu thâm cũng không tự hết',
  voiceHighlight: 'không tự hết',
  frameOpenAt: 0,
  firstCalloutAt: 16,
  calloutGap: 36,
  voiceCardAt: 10,
  zoomFrom: 1.0,
  zoomTo: 1.12,
  paper: '#F5F2EB',
  ink: '#2C2A29',
  leadInk: '#2B2927',
  mutedInk: '#6E6862',
  accent: '#B5462F',
  cardInk: '#1C1B1A',
};

// ---------- Lưới bố cục Full-Canvas 1080x1920 ----------
const HEADER = { top: 70, bottom: 230 };
const FRAME = { left: 60, right: 1020, top: 250, bottom: 960 };
const CARDS = { left: 60, right: 830, top: 990, bottom: 1500 };
const VOICE = { top: 1530, bottom: 1820 };
const RAIL_X = 870; // cột dây dẫn bên phải các thẻ

const reveal = (frame: number, start: number, dur = 18) =>
  interpolate(frame, [start, start + dur], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EXPO_OUT,
  });

// ---------- Header ----------
const Header: React.FC<{ p: Required<ScientificAtlasProps>; frame: number }> = ({ p, frame }) => {
  const rule = reveal(frame, 0, 20);
  const k = reveal(frame, 4);
  const t1 = reveal(frame, 6, 22);
  const t2 = reveal(frame, 10, 22);
  const line = (txt: string, v: number, top: number) => (
    <div style={{ position: 'absolute', left: 60, top, overflow: 'hidden', height: 74 }}>
      <div
        style={{
          fontFamily: 'SVN-FreightDisplay',
          fontStyle: 'italic',
          fontWeight: 500,
          fontSize: 64,
          lineHeight: '74px',
          color: p.ink,
          transform: `translateY(${(1 - v) * 74}px)`,
        }}
      >
        {nfc(txt)}
      </div>
    </div>
  );
  return (
    <>
      <div style={{ position: 'absolute', left: 60, top: HEADER.top, height: 3, width: 960 * rule, background: p.ink }} />
      <div
        style={{
          position: 'absolute',
          left: 60,
          top: HEADER.top + 14,
          fontFamily: 'SVN-Aeonik',
          fontWeight: 700,
          fontSize: 22,
          letterSpacing: 3,
          color: p.ink,
          opacity: k,
        }}
      >
        {nfc(p.kicker)}
      </div>
      {line(p.title1, t1, HEADER.top + 46)}
      {line(p.title2, t2, HEADER.top + 46 + 74 - 6)}
    </>
  );
};

// ---------- Vòng radar ----------
const Radar: React.FC<{ x: number; y: number; frame: number; start: number; color: string; active: boolean }> = ({
  x,
  y,
  frame,
  start,
  color,
  active,
}) => {
  const local = frame - start;
  if (local < 0) return null;
  const pop = interpolate(local, [0, 8], [0, 1], { extrapolateRight: 'clamp', easing: EXPO_OUT });
  const rings = active ? [0, 15] : [];
  return (
    <g>
      {rings.map((off) => {
        const ph = ((local + off) % 30) / 30;
        return <circle key={off} cx={x} cy={y} r={8 + ph * 34} fill="none" stroke={color} strokeWidth={2} opacity={(1 - ph) * 0.8} />;
      })}
      <circle cx={x} cy={y} r={14 * pop} fill="none" stroke={color} strokeWidth={2} />
      <circle cx={x} cy={y} r={6 * pop} fill={color} />
    </g>
  );
};

// ---------- Thẻ callout ----------
const CalloutCard: React.FC<{
  c: AtlasCallout;
  top: number;
  height: number;
  frame: number;
  start: number;
  dim: boolean;
  p: Required<ScientificAtlasProps>;
}> = ({ c, top, height, frame, start, dim, p }) => {
  const v = reveal(frame, start + 8, 16);
  const measure =
    c.measureValue !== undefined
      ? interpolate(frame, [start + 12, start + 34], [0, c.measureValue], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: EXPO_OUT,
        })
      : null;
  return (
    <div
      style={{
        position: 'absolute',
        left: CARDS.left,
        top,
        width: CARDS.right - CARDS.left,
        height,
        opacity: v * (dim ? 0.42 : 1),
        transform: `translateX(${(1 - v) * -60}px)`,
        display: 'flex',
        alignItems: 'center',
        gap: 22,
        borderTop: `2px solid ${p.ink}`,
        paddingLeft: 4,
      }}
    >
      <div
        style={{
          width: 58,
          height: 58,
          borderRadius: 29,
          background: dim ? 'transparent' : p.ink,
          border: `2px solid ${p.ink}`,
          color: dim ? p.ink : p.paper,
          fontFamily: 'SVN-Aeonik',
          fontWeight: 700,
          fontSize: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {c.num}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: 'SVN-Aeonik', fontWeight: 500, fontSize: 31, lineHeight: '38px', color: p.ink }}>
          {nfc(c.vi)}
        </div>
        <div style={{ fontFamily: 'SVN-FreightDisplay', fontStyle: 'italic', fontWeight: 500, fontSize: 26, color: p.mutedInk }}>
          {c.latin}
        </div>
      </div>
      {measure !== null && (
        <div style={{ fontFamily: 'GT-America', fontWeight: 700, fontSize: 40, color: p.accent, fontVariantNumeric: 'tabular-nums' }}>
          {measure.toFixed(2)}
          <span style={{ fontSize: 24, marginLeft: 6 }}>{c.measureUnit}</span>
        </div>
      )}
    </div>
  );
};

// ---------- Voice card đáy ----------
const VoiceCard: React.FC<{ p: Required<ScientificAtlasProps>; frame: number; fps: number }> = ({ p, frame, fps }) => {
  const s = spring({ frame: frame - p.voiceCardAt, fps, config: { damping: 18, stiffness: 140 } });
  const renderLine = (txt: string) => {
    const t = nfc(txt);
    const hl = nfc(p.voiceHighlight);
    const i = hl ? t.indexOf(hl) : -1;
    if (i < 0) return t;
    return (
      <>
        {t.slice(0, i)}
        <span style={{ color: '#F2B48F' }}>{t.slice(i, i + hl.length)}</span>
        {t.slice(i + hl.length)}
      </>
    );
  };
  return (
    <div
      style={{
        position: 'absolute',
        left: 60,
        right: 60,
        top: VOICE.top,
        height: VOICE.bottom - VOICE.top,
        background: p.cardInk,
        borderRadius: 28,
        transform: `translateY(${(1 - s) * 80}px)`,
        opacity: s,
        display: 'flex',
        alignItems: 'center',
        padding: '0 48px',
        gap: 36,
        boxShadow: '0 18px 40px rgba(28,27,26,0.18)',
      }}
    >
      <svg width={84} height={84} viewBox="0 0 84 84" style={{ flexShrink: 0 }}>
        <circle cx={42} cy={42} r={40} fill="none" stroke={p.paper} strokeWidth={2} opacity={0.5} />
        {[0, 1, 2, 3, 4].map((i) => {
          const h = 12 + 22 * Math.abs(Math.sin((frame + i * 7) / 6));
          return <rect key={i} x={20 + i * 10} y={42 - h / 2} width={5} height={h} rx={2.5} fill={p.paper} />;
        })}
      </svg>
      <div style={{ fontFamily: 'SVN-Aeonik', fontWeight: 700, fontSize: 50, lineHeight: '64px', color: p.paper }}>
        <div>{renderLine(p.voiceLine1)}</div>
        <div>{renderLine(p.voiceLine2)}</div>
      </div>
    </div>
  );
};

// ---------- Composition ----------
export const VietScientificAtlas: React.FC<ScientificAtlasProps> = (props) => {
  const p = { ...defaultScientificAtlasProps, ...props } as Required<ScientificAtlasProps>;
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Khung mô học: fit trong FRAME, căn giữa
  const fw = FRAME.right - FRAME.left;
  const fh = FRAME.bottom - FRAME.top;
  const imgW = Math.min(fw, fh * p.tissueAspect);
  const imgH = imgW / p.tissueAspect;
  const imgL = FRAME.left + (fw - imgW) / 2;
  const imgT = FRAME.top + (fh - imgH) / 2;

  const open = reveal(frame, p.frameOpenAt, 22);
  const starts = p.callouts.map((_, i) => p.firstCalloutAt + i * p.calloutGap);
  const activeIdx = starts.reduce((acc, s, i) => (frame >= s ? i : acc), -1);

  // Camera zoom 1.00 -> 1.12, tâm zoom trượt về điểm đang active
  const zoom = interpolate(frame, [0, durationInFrames], [p.zoomFrom, p.zoomTo], {
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.quad),
  });
  const focusOf = (i: number) => (i < 0 ? { x: 0.5, y: 0.5 } : { x: p.callouts[i].nx, y: p.callouts[i].ny });
  const prev = focusOf(activeIdx - 1);
  const cur = focusOf(activeIdx);
  const t = activeIdx < 0 ? 1 : reveal(frame, starts[activeIdx], 24);
  const ox = imgL + imgW * (prev.x + (cur.x - prev.x) * t) * 0.5 + imgW * 0.25;
  const oy = imgT + imgH * (prev.y + (cur.y - prev.y) * t) * 0.5 + imgH * 0.25;
  const toCanvas = (nx: number, ny: number) => ({
    x: ox + (imgL + nx * imgW - ox) * zoom,
    y: oy + (imgT + ny * imgH - oy) * zoom,
  });

  // Thẻ callout chia đều vùng CARDS
  const n = p.callouts.length;
  const gap = 16;
  const cardH = (CARDS.bottom - CARDS.top - gap * (n - 1)) / n;
  const cardTop = (i: number) => CARDS.top + i * (cardH + gap);

  const clipInset = (1 - open) * 50;
  const bracketV = reveal(frame, p.frameOpenAt + 10, 20);

  return (
    <AbsoluteFill style={{ background: p.paper }}>
      <Header p={p} frame={frame} />

      {/* Khung mô học bung mở + camera zoom */}
      <div
        style={{
          position: 'absolute',
          left: FRAME.left,
          top: FRAME.top,
          width: fw,
          height: fh,
          overflow: 'hidden',
          clipPath: `inset(${clipInset}% 0 ${clipInset}% 0)`,
        }}
      >
        <Img
          src={staticFile(p.tissueSrc)}
          style={{
            position: 'absolute',
            left: imgL - FRAME.left,
            top: imgT - FRAME.top,
            width: imgW,
            height: imgH,
            transformOrigin: `${ox - imgL}px ${oy - imgT}px`,
            transform: `scale(${zoom})`,
          }}
        />
      </div>

      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        {/* Góc ngắm khung */}
        {[
          [FRAME.left, FRAME.top, 1, 1],
          [FRAME.right, FRAME.top, -1, 1],
          [FRAME.left, FRAME.bottom, 1, -1],
          [FRAME.right, FRAME.bottom, -1, -1],
        ].map(([x, y, dx, dy], i) => (
          <path
            key={i}
            d={`M${x} ${y + dy * 36} L${x} ${y} L${x + dx * 36} ${y}`}
            stroke={p.ink}
            strokeWidth={2}
            fill="none"
            opacity={open}
          />
        ))}
        {/* Ngoặc độ sâu bên trái */}
        <path
          d={`M${FRAME.left + 26} ${imgT + 8} L${FRAME.left + 14} ${imgT + 8} L${FRAME.left + 14} ${imgT + 8 + imgH * 0.44 * bracketV} L${FRAME.left + 26} ${imgT + 8 + imgH * 0.44 * bracketV}`}
          stroke={p.leadInk}
          strokeWidth={2}
          fill="none"
        />
        <text
          x={FRAME.left + 34}
          y={imgT + 8 + imgH * 0.22}
          transform={`rotate(-90 ${FRAME.left + 34} ${imgT + 8 + imgH * 0.22})`}
          textAnchor="middle"
          dy={-2}
          fontFamily="SVN-Aeonik"
          fontWeight={700}
          fontSize={20}
          fill={p.leadInk}
          opacity={bracketV}
          style={{ paintOrder: 'stroke', stroke: p.paper, strokeWidth: 6 }}
        >
          {p.depthLabel}
        </text>
        {/* Thước đo vi thể */}
        <g opacity={reveal(frame, p.frameOpenAt + 14)}>
          <path d={`M${FRAME.right - 300} 940 L${FRAME.right - 300} 952 L${FRAME.right - 180} 952 L${FRAME.right - 180} 940`} stroke={p.ink} strokeWidth={3} fill="none" />
          <text x={FRAME.right} y={958} textAnchor="end" fontFamily="SVN-Aeonik" fontSize={20} fill={p.ink} style={{ paintOrder: 'stroke', stroke: p.paper, strokeWidth: 6 }}>
            {p.scaleLabel}
          </text>
        </g>

        {/* Leader lines tự vẽ + radar */}
        {p.callouts.map((c, i) => {
          const s = starts[i];
          if (frame < s) return null;
          const tp = toCanvas(c.nx, c.ny);
          const railX = RAIL_X + i * 44;
          const cy = cardTop(i) + cardH / 2;
          const d = `M${tp.x} ${tp.y} L${railX} ${tp.y} L${railX} ${cy} L${CARDS.right + 12} ${cy}`;
          const len = Math.abs(railX - tp.x) + Math.abs(cy - tp.y) + Math.abs(railX - CARDS.right - 12);
          const draw = reveal(frame, s + 2, 18);
          const dim = i !== activeIdx;
          return (
            <g key={c.num} opacity={dim ? 0.42 : 1}>
              <path
                d={d}
                stroke={p.leadInk}
                strokeWidth={2.5}
                fill="none"
                strokeDasharray={len}
                strokeDashoffset={len * (1 - draw)}
              />
              <circle cx={CARDS.right + 12} cy={cy} r={5 * draw} fill={p.leadInk} />
              <Radar x={tp.x} y={tp.y} frame={frame} start={s} color={dim ? p.leadInk : p.accent} active={!dim} />
            </g>
          );
        })}
      </svg>

      {p.callouts.map((c, i) => (
        <CalloutCard
          key={c.num}
          c={c}
          top={cardTop(i)}
          height={cardH}
          frame={frame}
          start={starts[i]}
          dim={i !== activeIdx}
          p={p}
        />
      ))}

      <VoiceCard p={p} frame={frame} fps={fps} />
    </AbsoluteFill>
  );
};
