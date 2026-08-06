/* ══════════════════════════════════════════════════════════════
   추가 도식 — "글자만으로는 뜻을 알 수 없는" 항목들
   (감사: _audit/preview-gap-2026-07-31)
   ══════════════════════════════════════════════════════════════ */

/* ── 구도 원칙: 비어 있던 2개 ── 같은 그룹의 7개는 이미 도식이 있어
   이 둘만 카드 격자 안에서 빈 상자로 보였다 */
Object.assign(PREVIEW, {
  "대각 구도": svg(
    `<path d="M4 36 L60 6" stroke="${PV_C}" stroke-width="1.4" stroke-dasharray="4 3" opacity=".75"/>`+
    fig(22,25,4,8)+fig(46,13,3,6)+frame),
  "반사 활용": svg(
    fig(32,9,4,8)+
    `<path d="M4 22 h56" stroke="${PV_C}" stroke-width="1.4"/>`+
    `<g opacity=".42" transform="translate(0,44) scale(1,-1)">`+fig(32,9,4,8)+`</g>`+frame),
});

/* ── 얼굴 방향 · 시선 ──
   같은 섹션의 샷 사이즈·앵글은 전부 도식인데 이 두 그룹만 비어 있었다.
   특히 '3/4 각도'는 글자만으로는 알 수 없다. 이목구비는 카드 배경색으로 파낸다. */
const FACE="#0e0f13";
const headBase = `<circle cx="31" cy="19" r="12" fill="${PV_S}"/>`;
const eye = (x,y,r=1.7) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${FACE}"/>`;

Object.assign(PREVIEW, {
  "정면": svg(headBase+eye(26,17)+eye(36,17)+
    `<path d="M31 20 v3" stroke="${FACE}" stroke-width="1.4" stroke-linecap="round"/>`+
    `<path d="M27 26 q4 2.4 8 0" stroke="${FACE}" stroke-width="1.4" fill="none" stroke-linecap="round"/>`+frame),
  "3/4 각도": svg(headBase+
    `<path d="M42.6 18 l3.4 2.6 l-3.4 2 z" fill="${PV_S}"/>`+       /* 코 */
    eye(30,17)+eye(38,17,1.4)+
    `<path d="M33 26 q4 2.2 7 -0.4" stroke="${FACE}" stroke-width="1.4" fill="none" stroke-linecap="round"/>`+frame),
  "옆모습": svg(headBase+
    `<path d="M41.5 16.5 l5 4 l-5 3 z" fill="${PV_S}"/>`+
    eye(36,17)+
    `<path d="M38 26 q3 2 5 0" stroke="${FACE}" stroke-width="1.4" fill="none" stroke-linecap="round"/>`+frame),
  "뒷모습": svg(headBase+
    `<path d="M19 20 a12 12 0 0 1 24 0 z" fill="#544c90"/>`+
    `<rect x="26" y="30" width="10" height="7" rx="2" fill="${PV_S}" opacity=".6"/>`+frame),

  "카메라 응시": svg(headBase+eye(26,17)+eye(36,17)+
    `<path d="M26 19.5 L30 29 M36 19.5 L33 29" stroke="${PV_C}" stroke-width="1.5" stroke-dasharray="2.5 2"/>`+
    cam(31.5,32.5,3)+frame),
  "시선 이탈": svg(headBase+
    `<path d="M42.6 18 l3.4 2.6 l-3.4 2 z" fill="${PV_S}"/>`+eye(30,17)+eye(38,17,1.4)+
    arrow(43,15,56,9)+cam(31.5,32.5,3)+frame),
});

/* ── 조명: 구(球)에 빛이 떨어지는 표준 도식 ──
   숫자 '8:1'·'4:1'은 결과를 짐작하게 하지 못한다. 그림자 경계의 날카로움과
   어두운 쪽 밝기만으로 명암비·광질·필 7개가 한 번에 구분된다. */
let _lid = 0;
const LIT = "#e9ecf3";
/* lightEnd 가 클수록 빛에서 그늘로 급하게 꺾인다(경질광) */
const sphere = (lightEnd, darkCol, transEnd = 100) => {
  const id = "sph" + (++_lid);
  return `<defs><radialGradient id="${id}" cx="31%" cy="26%" r="66%">`+
    `<stop offset="0%" stop-color="${LIT}"/>`+
    `<stop offset="${lightEnd}%" stop-color="${LIT}"/>`+
    `<stop offset="${transEnd}%" stop-color="${darkCol}"/>`+
    `<stop offset="100%" stop-color="${darkCol}"/>`+
    `</radialGradient></defs>`+
    `<circle cx="29" cy="18" r="12" fill="url(#${id})"/>`;
};
const castShadow = soft => {
  if(!soft) return `<ellipse cx="33" cy="33" rx="12" ry="2.8" fill="#000" opacity=".85"/>`;
  const id = "csh" + (++_lid);
  return `<defs><filter id="${id}" x="-40%" y="-160%" width="180%" height="420%">`+
    `<feGaussianBlur stdDeviation="2.4"/></filter></defs>`+
    `<ellipse cx="34" cy="33" rx="14" ry="3.2" fill="#000" opacity=".7" filter="url(#${id})"/>`;
};
const keyMark = `<circle cx="9" cy="8" r="2.8" fill="#f5d18a"/>`+
  `<path d="M9 3.4 v-1.6 M4.4 8 h-1.6 M5.8 4.8 l-1.1 -1.1 M5.8 11.2 l-1.1 1.1 M12.2 4.8 l1.1 -1.1" `+
  `stroke="#f5d18a" stroke-width="1.1" stroke-linecap="round"/>`;
const panel = (fill,stroke) =>
  `<rect x="51" y="9" width="6" height="20" rx="1.5" fill="${fill}" stroke="${stroke}" stroke-width="1"/>`;

Object.assign(PREVIEW, {
  /* 명암비 — 어두운 쪽이 얼마나 살아 있는가 */
  "강한 명암비 8:1":  svg(keyMark+castShadow(0)+sphere(12,"#0b0d12")),
  "중간 명암비 4:1":  svg(keyMark+castShadow(0)+sphere(12,"#4a5164")),
  "평탄한 조명 2:1":  svg(keyMark+castShadow(1)+sphere(12,"#a7adbb")),

  /* 광질 — 빛에서 그늘로 넘어가는 경계의 날카로움 */
  "경질광 (하드)":   svg(keyMark+castShadow(0)+sphere(46,"#12151d",54)),
  "연질광 (소프트)": svg(keyMark+castShadow(1)+sphere(0,"#2e3446")),

  /* 필·반사 — 그늘 쪽에 무엇을 세우는가 */
  "리플렉터 필": svg(keyMark+castShadow(1)+sphere(12,"#727a8b")+
    panel(LIT,"#c8ccd6")+arrow(50,20,42,20)),
  "네거티브 필": svg(keyMark+castShadow(0)+sphere(12,"#07080b")+
    panel("#0a0b0f","#3b4152")),
});

/* ── 톤 · 대비: 톤 커브 ──
   '리프티드 블랙'과 '블랙 크러시'는 커브 하나면 즉시 구분된다.
   가로축 어두움→밝음, 세로축 출력. 점선은 손대지 않은 기준선. */
/* 톤 커브 — 그래프는 48×32 좌표로 그려 두고, 그릴 때 카드 전체(2~62 · 4~36)로
   늘린다. 예전에는 카드 한가운데 작게 떠 있어 좌우에 빈 자리가 크게 남았다.
   가로·세로 배율이 달라 선 굵기가 일그러지므로 non-scaling-stroke 로 고정한다. */
const CURVE_FIT = `translate(-8,-1) scale(1.25,1.125)`;
const curveBox =
  `<path d="M8 36 L56 4" stroke="${PV_A}" stroke-width="1" stroke-dasharray="3 3" opacity=".45"`+
  ` vector-effect="non-scaling-stroke"/>`;
const curve = d => `<path d="${d}" stroke="${PV_C}" stroke-width="2.2" fill="none"`+
  ` stroke-linecap="butt" vector-effect="non-scaling-stroke"/>`;
/* 격자 — 축 대신 3분할 눈금만 옅게. 테두리는 카드 면이 대신한다 */
const curveGrid = [1,2].flatMap(i=>[
  `<path d="M${8+i*16} 4 V36" stroke="${PV_A}" stroke-width="1" opacity=".22" vector-effect="non-scaling-stroke"/>`,
  `<path d="M8 ${4+i*10.67} H56" stroke="${PV_A}" stroke-width="1" opacity=".22" vector-effect="non-scaling-stroke"/>`,
]).join("");
const curveOf = d => `<g transform="${CURVE_FIT}">${curveGrid}${curveBox}${curve(d)}</g>`;

Object.assign(PREVIEW, {
  "저대비 플랫":      svg(curveOf("M8 28 C22 24, 42 18, 56 13")),
  "고대비 톤":        svg(curveOf("M8 36 C20 35, 24 24, 32 20 C40 16, 44 5, 56 4")),
  "블랙 크러시":      svg(curveOf("M8 36 L21 36 C34 31, 46 11, 56 4")),
  "리프티드 블랙":    svg(curveOf("M8 26 C22 19, 42 9, 56 4")),
  "하이라이트 롤오프": svg(curveOf("M8 36 C22 23, 32 12, 42 9 L56 8")),
});

/* ── 노출: 같은 계단을 밝기만 달리해 세 장 ──
   양끝이 뭉개지는 것(클리핑)까지 그대로 보인다 */
const wedge = shift => {
  /* 띠가 카드를 가로로 꽉 채운다 — 칸 사이 경계선이 곧 눈금이라 테두리는 필요 없다 */
  const cells = [0,1,2,3,4,5].map(i=>{
    const v = Math.max(0, Math.min(255, Math.round(16 + i*46 + shift)));
    const h = v.toString(16).padStart(2,"0");
    return `<rect x="${(i*64/6).toFixed(2)}" y="2" width="${(64/6).toFixed(2)}" height="27" fill="#${h}${h}${h}"/>`;
  }).join("");
  return cells;
};
Object.assign(PREVIEW, {
  /* 표식은 띠 바로 아래 같은 자리에 — 위/정상/아래를 한눈에 견주게 한다 */
  "1스톱 오버": svg(wedge(52)+`<path d="M32 31 l-5 5.5 h10 z" fill="#f5d18a"/>`),
  "정확 노출":  svg(wedge(0)+`<rect x="28" y="32.5" width="8" height="3.5" fill="${PV_C}"/>`),
  "1스톱 언더": svg(wedge(-52)+`<path d="M32 36.5 l-5 -5.5 h10 z" fill="${PV_A}"/>`),
});

