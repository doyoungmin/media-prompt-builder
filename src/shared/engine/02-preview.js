/* ══════════════════════════════════════════════════════════════
   칩 미리보기 — 이미지 파일 없이 SVG·CSS 로만 그린다 (용량 증가 0)
   PREVIEW[한국어명] = SVG 문자열 또는 {sw:"CSS background"}
   ══════════════════════════════════════════════════════════════ */
const PV_A="#8b93a5", PV_S="#7081BE", PV_C="#78BF54";   // 보조선 · 피사체 · 카메라
/* 캔버스는 16:9 — 칸도 16:9 라 도식이 면을 정확히 채운다.
   좌표계(폭 64 · 세로 중심 20)는 그대로 두고 위아래 2 씩만 잘라 냈다.
   기존 도식 110개의 좌표를 건드리지 않으려는 것이고, 잘려 나가는 2 는
   지워 버린 액자선이 있던 자리라 그리는 내용이 없다. */
const svg = inner => `<svg viewBox="0 2 64 36" preserveAspectRatio="xMidYMid meet">${inner}</svg>`;
/* 도식 안에 그리던 회색 테두리 — 카드 면 자체가 곧 화면 프레임이므로 지웠다.
   테두리가 있으면 카드 안에 또 하나의 액자가 생겨 도식만 작아 보인다.
   호출부 90여 곳을 건드리지 않으려고 이름은 남긴다(되돌리려면 이 한 줄만 고치면 된다). */
const frame = "";
/* 프레임 안 인물 — 머리 반지름 r, 머리 중심 (cx,cy), 몸통 높이 bh.
   Material Symbols(Sharp) 의 사람 픽토그램을 따른다 — 둥근 모서리 없이
   머리(원) · 어깨(넓은 사각) · 다리(좁은 사각) 세 덩이.
   총 높이는 예전과 같은 bh 라 부르는 쪽 좌표를 고칠 필요가 없다. */
/* ── 인물 ── Material Symbols 의 boy 아이콘 비율을 그대로 쓴다.
   24 격자 원본: 머리끝 4 · 발 20 (전체 16) · 머리 r 1.75(중심 5.75)
                 몸통 y 8.5~15 폭 6 · 다리 y 15~20 폭 4 · 어깨 라운드 2
   전체 높이 T 하나로만 키우고 줄인다 — 가로·세로를 따로 잡으면 비율이 깨진다.
   cx 는 좌우 중심, topY 는 머리 끝. */
const person = (cx,topY,T) => {
  const n=v=>+v.toFixed(2), s=T/16, X=v=>n(cx+v*s), Y=v=>n(topY+v*s), L=v=>n(v*s);
  const rad=2*s, x0=cx-3*s;
  return `<circle cx="${n(cx)}" cy="${Y(5.75-4)}" r="${L(1.75)}" fill="${PV_S}"/>`
    +`<path d="M${n(x0)} ${n(topY+4.5*s+rad)} q0 ${n(-rad)} ${n(rad)} ${n(-rad)}`
    +` h${L(2)} q${n(rad)} 0 ${n(rad)} ${n(rad)} V${Y(11)} H${n(x0)} Z" fill="${PV_S}"/>`
    +`<rect x="${X(-2)}" y="${Y(11)}" width="${L(4)}" height="${L(5)}" fill="${PV_S}"/>`;
};
/* 예전 서명(머리 반지름 r · 몸 높이 bh)을 그대로 받는다 — 호출부 70여 곳을
   건드리지 않으려는 것. 바운딩 박스(머리끝 cy-r, 발끝 cy+1.1r+bh)는 예전과
   같아서 각 도식의 바닥선·지평선이 그대로 맞고, 안쪽 비율만 바로잡힌다.
   bh<=0 은 얼굴만 그리는 클로즈업 계열이라 원을 그대로 둔다. */
const fig = (cx,cy,r,bh) => bh>0
  ? person(cx, cy-r, 2.1*r+bh)
  : `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${PV_S}"/>`;
/* 배경 줄무늬 — blur 로 심도를 표현 */
const bg = b => `<defs><filter id="b${String(b).replace(".","_")}"><feGaussianBlur stdDeviation="${b}"/></filter></defs>`+
  `<g filter="url(#b${String(b).replace(".","_")})">`+
  [0,10,20,30,40,50,60].map(x=>`<rect x="${x}" y="2" width="5" height="36" fill="${PV_S}" opacity=".38"/>`).join("")+
  `</g>`;
/* ── 화살표 ── Material Symbols 의 straight 아이콘을 따른다.
   둥글림 없이(butt·miter) 곧은 축 + 작은 갈매기 머리.
   머리 크기를 길이에 비례시키던 것을 고정값으로 바꿨다 — 긴 화살표일수록
   머리만 커져서 무거워 보였다(짧은 화살표에서만 길이에 맞춰 줄인다). */
const arrow = (x1,y1,x2,y2,color=PV_C) => {
  const n=v=>+v.toFixed(2);
  const dx=x2-x1, dy=y2-y1, len=Math.hypot(dx,dy)||1;
  const ux=dx/len, uy=dy/len, px=-uy, py=ux;      // 진행 방향과 그 수직
  const h=Math.min(3.4,len*0.4);                  // 머리 깊이 = 반폭
  const bx=x2-ux*h, by=y2-uy*h;
  return `<path d="M${n(x1)} ${n(y1)} L${n(x2)} ${n(y2)}" stroke="${color}" stroke-width="2" stroke-linecap="butt"/>`+
    `<path d="M${n(bx+px*h)} ${n(by+py*h)} L${n(x2)} ${n(y2)} L${n(bx-px*h)} ${n(by-py*h)}" `+
    `fill="none" stroke="${color}" stroke-width="2" stroke-linecap="butt" stroke-linejoin="miter"/>`;
};
const cam = (cx,cy,r=3.6) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${PV_C}"/>`;
/* 삼각대 — 카메라가 그 자리에 못박혀 있다는 뜻. 팬·틸트에서는 회전축 노릇도 한다. */
const tripod = (cx,cy) => cam(cx,cy)+
  `<path d="M${cx} ${cy+3} L${cx-7} ${cy+9} M${cx} ${cy+3} L${cx+7} ${cy+9} M${cx} ${cy+3} V${cy+9}"`+
  ` stroke="${PV_C}" stroke-width="1.8" stroke-linecap="round"/>`;
/* 회전 화살표 — 중심(cx,cy)·반지름 r 로 a0°에서 a1°까지 돈다.
   팬·틸트가 '이동'이 아니라 '제자리 회전'임을 말한다.
   머리는 끝점의 접선에서 계산한다 — 손으로 좌표를 적었더니 접선을 벗어나
   화살표가 엉뚱한 데를 가리켰다(첫 판이 그래서 망가져 보였다). */
const turn = (cx,cy,r,a0,a1) => {
  const R=d=>d*Math.PI/180, P=a=>[cx+r*Math.cos(R(a)), cy+r*Math.sin(R(a))];
  const [x0,y0]=P(a0), [x1,y1]=P(a1);
  const large=Math.abs(a1-a0)>180?1:0, sweep=a1>a0?1:0, sg=sweep?1:-1;
  const tx=-sg*Math.sin(R(a1)), ty=sg*Math.cos(R(a1));   // 끝점 접선(진행 방향)
  const px=-ty, py=tx, h=3.2, bx=x1-tx*h, by=y1-ty*h;
  const n=v=>+v.toFixed(2);
  return `<path d="M${n(x0)} ${n(y0)} A${r} ${r} 0 ${large} ${sweep} ${n(x1)} ${n(y1)}"`+
    ` stroke="${PV_C}" stroke-width="2" fill="none"/>`+
    `<path d="M${n(bx+px*h)} ${n(by+py*h)} L${n(x1)} ${n(y1)} L${n(bx-px*h)} ${n(by-py*h)}"`+
    ` fill="none" stroke="${PV_C}" stroke-width="2" stroke-linejoin="miter"/>`;
};

const PREVIEW = {
  /* ── 조리개: 배경 흐림 정도 ── */
  "f/1.2 (극얕음)": svg(bg(3.4)+fig(32,17,7,14)+frame),
  "f/1.8 (얕음)":   svg(bg(2.4)+fig(32,17,7,14)+frame),
  "f/2.8 (중간)":   svg(bg(1.5)+fig(32,17,7,14)+frame),
  "f/5.6 (선명)":   svg(bg(0.8)+fig(32,17,7,14)+frame),
  "f/8 (깊음)":     svg(bg(0.3)+fig(32,17,7,14)+frame),
  "f/16 (전초점)":  svg(bg(0)+fig(32,17,7,14)+frame),

  /* ── 샷 사이즈: 프레임 안 인물 크기 ── */
  /* 샷 사이즈 — 예전에는 머리 크기를 키워 '가까움'을 표현했지만 그건 인물 비율을
     깨는 방식이었다. 비율은 그대로 두고 인물을 통째로 키워 프레임이 자르게 한다.
     실제 카메라가 다가가는 것과 같은 표현이라 뜻도 더 정확하다. */
  "익스트림 와이드":   svg(`<path d="M2 32 h60" stroke="${PV_A}" stroke-width="1"/>`+person(32,25,7)+frame),
  "와이드 / 풀샷":     svg(`<path d="M2 34 h60" stroke="${PV_A}" stroke-width="1"/>`+person(32,8,26)+frame),
  "미디엄 샷":        svg(person(32,3,49.5)+frame),      // 허리 위가 프레임을 채운다
  "미디엄 클로즈업":   svg(person(32,3,68)+frame),        // 가슴 위
  "클로즈업":         svg(fig(32,19,13,0)+frame),
  "익스트림 클로즈업": svg(`<circle cx="32" cy="20" r="24" fill="${PV_S}"/>`+
                      `<circle cx="32" cy="20" r="8" fill="#16181f"/>`+frame),

  /* ── 앵글: 카메라와 피사체의 높이 관계 ── */
  "아이 레벨":  svg(fig(40,17,5,14)+cam(12,20)+arrow(17,20,30,20)+frame),
  "로우 앵글":  svg(fig(40,14,5,16)+cam(12,33)+arrow(17,32,32,22)+frame),
  "하이 앵글":  svg(fig(40,20,5,12)+cam(12,7)+arrow(17,9,32,20)+frame),
  "더치 앵글":  svg(`<g transform="rotate(-16 32 20)">`+fig(32,14,5.5,16)+`</g>`+
                `<path d="M6 34 L58 26" stroke="${PV_A}" stroke-width="1.2"/>`+frame),
  "버즈 아이":  svg(`<circle cx="32" cy="22" r="6.5" fill="${PV_S}"/>`+
                `<rect x="27" y="26" width="10" height="4" rx="2" fill="${PV_S}" opacity=".55"/>`+
                cam(32,7)+arrow(32,11,32,17)+frame),
  "웜즈 아이":  svg(`<rect x="20" y="4" width="24" height="22" rx="3" fill="${PV_S}" opacity=".5"/>`+
                cam(32,34)+arrow(32,31,32,24)+frame),
  /* POV — 1인칭. 보는 사람 자신의 팔이 화면 아래에서 들어오는 것이 가장 분명한 신호다 */
  "POV":       svg(fig(32,13,5,11)+
                `<path d="M2 40 L10 26 L18 24 L20 30 L12 40 Z" fill="${PV_C}" opacity=".9"/>`+
                `<path d="M62 40 L54 26 L46 24 L44 30 L52 40 Z" fill="${PV_C}" opacity=".9"/>`+frame),

  /* ── 프레이밍 ── */
  "오버 더 숄더": svg(`<rect x="2" y="16" width="20" height="24" rx="5" fill="${PV_S}" opacity=".45"/>`+
                  fig(42,15,7,18)+frame),
  "투 샷":       svg(fig(21,16,6,16)+fig(43,16,6,16)+frame),
  "대칭 구도":    svg(`<path d="M32 2 v36" stroke="${PV_C}" stroke-width="1" stroke-dasharray="3 3"/>`+
                  `<rect x="8" y="12" width="12" height="24" rx="2" fill="${PV_S}" opacity=".55"/>`+
                  `<rect x="44" y="12" width="12" height="24" rx="2" fill="${PV_S}" opacity=".55"/>`+
                  fig(32,18,5,14)+frame),

  /* ── 기본 무빙 ── */
  "고정 (트라이포드)": svg(fig(32,16,6,14)+cam(32,34)+
                    `<path d="M26 37 h12" stroke="${PV_C}" stroke-width="2" stroke-linecap="round"/>`+frame),
  "슬로우 푸시인":    svg(fig(32,16,6,14)+cam(10,20)+arrow(14,20,26,20)+frame),
  "풀 아웃":         svg(fig(32,16,6,14)+cam(24,20)+arrow(20,20,7,20)+frame),
  "트래킹 샷":       svg(fig(38,16,6,14)+cam(38,34)+arrow(20,34,52,34)+
                    `<path d="M46 12 h10" stroke="${PV_S}" stroke-width="2" stroke-linecap="round" opacity=".5"/>`+frame),
  /* 위에서 내려다본 그림 — 삼각대에 못박힌 채 시야만 좌우로 도는 것 */
  "팬":             svg(tripod(32,30)+
                    `<path d="M32 27 L10 12 M32 27 L54 12" stroke="${PV_A}" stroke-width="1" stroke-dasharray="2 2"/>`+
                    turn(32,30,22,215,325)+frame),
  /* 옆에서 본 그림 — 같은 자리에서 시야만 위아래로 도는 것 */
  "틸트":           svg(tripod(14,28)+
                    `<path d="M17 26 L56 26 M17 26 L52 8" stroke="${PV_A}" stroke-width="1" stroke-dasharray="2 2"/>`+
                    turn(14,28,26,-5,-35)+frame),
  "핸드헬드":        svg(fig(32,16,6,14)+
                    `<path d="M8 34 q6 -6 12 0 q6 6 12 0 q6 -6 12 0 q6 6 12 0" stroke="${PV_C}" stroke-width="2" fill="none" stroke-linecap="round"/>`+frame),
  "스테디캠 롱테이크": svg(fig(38,16,6,14)+
                    `<path d="M6 34 q14 -5 26 0 q14 5 26 0" stroke="${PV_C}" stroke-width="2" fill="none" stroke-linecap="round"/>`+frame),

  /* ── 고급 무빙 ── */
  "돌리 줌":     svg(fig(32,16,7,14)+arrow(10,32,22,32)+arrow(54,8,42,8)+frame),
  "집 크레인":   svg(fig(32,26,5,10)+cam(14,30)+arrow(14,27,14,7)+arrow(16,7,30,10)+frame),
  "짐벌 오빗":   svg(`<ellipse cx="32" cy="22" rx="24" ry="9" fill="none" stroke="${PV_A}" stroke-width="1" stroke-dasharray="3 3"/>`+
                fig(32,18,5.5,9)+cam(56,22)+arrow(52,31,58,26)+frame),
  "휩 팬":      svg(fig(20,16,5,14)+
                `<g opacity=".35">`+fig(30,16,5,14)+`</g><g opacity=".18">`+fig(40,16,5,14)+`</g>`+
                arrow(14,34,54,34)+frame),
  "크래시 줌":   svg(`<circle cx="32" cy="20" r="17" fill="none" stroke="${PV_C}" stroke-width="1.2" opacity=".4"/>`+
                `<circle cx="32" cy="20" r="10" fill="none" stroke="${PV_C}" stroke-width="1.6" opacity=".7"/>`+
                fig(32,18,5,10)+arrow(48,6,38,14)+frame),
  "FPV 드론":   svg(`<path d="M4 36 Q20 4 34 24 Q46 40 60 8" stroke="${PV_C}" stroke-width="2" fill="none" stroke-linecap="round"/>`+
                cam(60,8,3)+frame),
  "항공 상승":   svg(`<path d="M6 36 h52" stroke="${PV_A}" stroke-width="1"/>`+
                `<rect x="24" y="28" width="7" height="8" fill="${PV_S}" opacity=".6"/>`+
                `<rect x="34" y="24" width="7" height="12" fill="${PV_S}" opacity=".6"/>`+
                cam(48,28)+arrow(48,25,48,6)+frame),
  "원형 랩어라운드": svg(`<path d="M8 26 A24 12 0 0 1 56 26" stroke="${PV_A}" stroke-width="1" fill="none" stroke-dasharray="3 3"/>`+
                fig(32,18,5.5,9)+arrow(10,24,20,17)+cam(56,26)+frame),
  "랙 포커스":   svg(bg(2.8)+`<circle cx="18" cy="22" r="7" fill="${PV_S}"/>`+
                `<circle cx="46" cy="20" r="9" fill="${PV_S}" opacity=".3"/>`+
                arrow(27,22,37,21)+frame),

  /* ── 시간 표현 ── */
  "슬로우 모션":  svg(`<g opacity=".2">`+fig(16,20,5,10)+`</g><g opacity=".45">`+fig(28,19,5,10)+`</g>`+
                fig(42,18,5,10)+`<path d="M8 36 h48" stroke="${PV_C}" stroke-width="1.6" stroke-dasharray="9 5"/>`+frame),
  "초고속":      svg(`<circle cx="32" cy="18" r="5" fill="${PV_S}"/>`+
                [0,45,90,135,180,225,270,315].map(a=>{const r=a*Math.PI/180;
                  return `<circle cx="${(32+Math.cos(r)*13).toFixed(1)}" cy="${(18+Math.sin(r)*11).toFixed(1)}" r="1.8" fill="${PV_S}" opacity=".55"/>`;}).join("")+frame),
  "타임랩스":    svg(`<path d="M4 30 q12 -14 24 0 q12 14 24 -4" stroke="${PV_C}" stroke-width="2" fill="none" stroke-linecap="round"/>`+
                `<circle cx="14" cy="10" r="4" fill="${PV_S}" opacity=".8"/><circle cx="32" cy="8" r="4" fill="${PV_S}" opacity=".5"/><circle cx="50" cy="10" r="4" fill="${PV_S}" opacity=".25"/>`+frame),
  "하이퍼랩스":  svg(`<path d="M4 34 L60 20" stroke="${PV_A}" stroke-width="1"/>`+
                `<g opacity=".25">`+fig(14,24,4,8)+`</g><g opacity=".55">`+fig(32,20,4,8)+`</g>`+fig(50,16,4,8)+
                arrow(8,36,56,26)+frame),
  "실시간 롱테이크": svg(fig(32,16,6,14)+
                `<path d="M6 34 h52" stroke="${PV_C}" stroke-width="2" stroke-linecap="round"/>`+frame),

  /* ── 움직임의 크기 ── */
  "미세한 움직임": svg(`<g opacity=".4">`+fig(35,16,6,14)+`</g>`+fig(32,16,6,14)+
                arrow(27,35,37,35)+arrow(37,35,27,35)+frame),
  "보통 움직임":  svg(`<g opacity=".4">`+fig(38,16,6,14)+`</g>`+fig(28,16,6,14)+
                arrow(19,35,47,35)+arrow(47,35,19,35)+frame),
  "역동적 움직임": svg(`<g opacity=".2">`+fig(16,18,6,13)+`</g><g opacity=".45">`+fig(30,15,6,13)+`</g>`+fig(46,19,6,13)+
                arrow(8,34,56,34)+frame),

  /* ── 장면 제어 ── */
  "한 장면 유지":  svg(`<rect x="3" y="8" width="58" height="24" rx="3" fill="none" stroke="${PV_C}" stroke-width="1.8"/>`+
                fig(32,17,5.5,11)),
  "24fps 시네마틱": svg(`<g opacity=".4">`+fig(24,18,5,11)+`</g>`+fig(34,18,5,11)+
                `<path d="M6 34 h52" stroke="${PV_A}" stroke-width="1" stroke-dasharray="10 6"/>`+frame),
  "60fps 부드럽게": svg(fig(32,18,5,11)+
                `<path d="M6 34 h52" stroke="${PV_A}" stroke-width="1" stroke-dasharray="3 2"/>`+frame),
  /* 처음과 끝이 이어진다 — 닫힌 원형 화살표가 그 뜻을 그대로 말한다 */
  "끊김 없는 루프": svg(fig(32,18,4.5,9)+turn(32,20,11,0,305)+frame),
  "피사체 정지":   svg(fig(32,16,6,14)+
                [12,22,32].map(y=>arrow(4,y,20,y)+arrow(44,y,60,y)).join("")+frame),
  "카메라 고정 유지": svg(fig(44,15,5,11)+tripod(16,24)+frame),
};

/* ── 필름 · 색감: 팔레트 스와치 ── */
const SWATCH = {
  "Kodak Portra 400":"linear-gradient(90deg,#f3ded0,#e8c3a8,#c99b7d,#8a6a55)",
  "Kodak Ektar 100":"linear-gradient(90deg,#0b6ea8,#12a05a,#e0c020,#d04020)",
  "Kodachrome":"linear-gradient(90deg,#7d1512,#c0392b,#d9a441,#2f5d3a)",
  "Fuji Velvia 50":"linear-gradient(90deg,#04324a,#0d7a5f,#3fae3a,#c8102e)",
  "Fuji Pro 400H":"linear-gradient(90deg,#dff0ea,#b9dcd2,#e8cfd4,#f0e4d6)",
  "CineStill 800T":"linear-gradient(90deg,#0a1230,#123a6b,#b03050,#f05a3c)",
  "Kodak Vision3 500T":"linear-gradient(90deg,#0d1a2e,#20406b,#8a7a5e,#d8c49a)",
  "Ilford HP5":"linear-gradient(90deg,#141414,#4a4a4a,#8f8f8f,#d8d8d8)",
  "Kodak Tri-X 400":"linear-gradient(90deg,#000,#2a2a2a,#7a7a7a,#ededed)",
  "Ilford Delta 3200":"linear-gradient(90deg,#1c1c1c,#565656,#9c9c9c,#c8c8c8)",
  "고대비 흑백":"linear-gradient(90deg,#000 0 35%,#fff 35% 100%)",
  "틸 & 오렌지":"linear-gradient(90deg,#0d3b45,#12707a,#d98a3a,#f0b45e)",
  "블리치 바이패스":"linear-gradient(90deg,#101418,#4a5258,#98a0a4,#e6e8e6)",
  "Technicolor":"linear-gradient(90deg,#c81028,#f0a000,#1060b0,#108040)",
  "디새추레이션":"linear-gradient(90deg,#4a4f52,#6f7478,#95999a,#b8bcbb)",
  "파스텔":"linear-gradient(90deg,#f6dfe6,#e2ecf7,#e7f4e4,#faf0d8)",
  "세피아":"linear-gradient(90deg,#2b1d10,#6b4a2a,#a8804f,#e0c9a6)",
  "크로스 프로세스":"linear-gradient(90deg,#0f3a4a,#2f8a6a,#d8d020,#c02070)",
  "어스 톤":"linear-gradient(90deg,#3d3428,#6b5a41,#9c8a6a,#cfc0a0)",
  "네온 사이버펑크":"linear-gradient(90deg,#12043a,#6a0f8f,#d81f8c,#22d3ee)",
};

/* ── 추가 도식: 구도 원칙 · 심도 · 셔터 · 색온도 (파일 없이 SVG·CSS 로만) ── */
Object.assign(PREVIEW, {
  /* 구도 원칙 */
  "삼분할 구도": svg(`<path d="M22.3 2 v36 M43.7 2 v36 M2 14.3 h60 M2 25.7 h60"
      stroke="${PV_A}" stroke-width=".8" opacity=".7"/>`+fig(43.7,14.3,4.5,9)+frame),
  "리딩 라인": svg(`<path d="M2 38 L30 18 M62 38 L34 18" stroke="${PV_C}" stroke-width="2" fill="none"/>`+
    `<path d="M14 38 L28 22 M50 38 L36 22" stroke="${PV_A}" stroke-width="1" fill="none"/>`+
    fig(32,13,4,8)+frame),
  "네거티브 스페이스": svg(fig(50,26,3.5,7)+frame),
  "프레임 인 프레임": svg(`<rect x="17" y="8" width="30" height="26" rx="2" fill="none"
      stroke="${PV_C}" stroke-width="2"/>`+fig(32,17,4.5,9)+frame),
  "전경 요소": svg(fig(34,16,6,12)+
    `<defs><filter id="fgb"><feGaussianBlur stdDeviation="2.2"/></filter></defs>`+
    `<g filter="url(#fgb)"><rect x="-2" y="26" width="26" height="16" rx="4" fill="${PV_S}" opacity=".7"/>`+
    `<rect x="46" y="30" width="22" height="12" rx="4" fill="${PV_S}" opacity=".55"/></g>`+frame),
  "소실점 원근": svg(
      `<path d="M2 38 L30 18 M62 38 L34 18" stroke="${PV_A}" stroke-width="1.6"/>`+
      `<path d="M8 38 L31 20 M56 38 L33 20" stroke="${PV_A}" stroke-width="1" opacity=".55"/>`+
      `<path d="M2 18 h60" stroke="${PV_A}" stroke-width="1" opacity=".45"/>`+
      cam(32,18,2.6)+fig(32,25,3,7)+frame),
  /* 심도 · 셔터 */
  "얕은 심도 보케": svg(bg(3.2)+
    [[12,10],[52,12],[18,31],[48,30]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="4" fill="${PV_S}" opacity=".35"/>`).join("")+
    fig(32,17,7,14)+frame),
  "딥 포커스": svg(bg(0)+fig(32,17,6,13)+
    `<rect x="4" y="30" width="9" height="9" rx="2" fill="${PV_S}" opacity=".7"/>`+
    `<rect x="51" y="30" width="9" height="9" rx="2" fill="${PV_S}" opacity=".7"/>`+frame),
  "프리즈 (1/2000s)": svg(fig(32,17,6,13)+
    [[12,10,2.2],[19,25,1.6],[47,9,2],[52,24,2.4],[44,32,1.5],[16,33,1.8],[54,15,1.3]]
      .map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${PV_C}"/>`).join("")+frame),
  "모션 블러 (1/15s)": svg(`<g opacity=".18">`+fig(18,18,5.5,11)+`</g><g opacity=".4">`+fig(26,18,5.5,11)+`</g>`+
    fig(36,18,5.5,11)+
    `<path d="M8 34 h46" stroke="${PV_C}" stroke-width="2" stroke-linecap="round" opacity=".8"/>`+frame),
  "장노출": svg(`<path d="M4 30 Q20 6 32 26 Q44 44 60 12" stroke="${PV_C}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`+
    `<path d="M4 36 Q20 14 32 32 Q44 48 60 20" stroke="${PV_C}" stroke-width="1.2" fill="none" opacity=".5"/>`+frame),
});

/* 색온도 그레이딩 스와치 */
Object.assign(SWATCH, {
  "웜 그레이드":"linear-gradient(90deg,#3a2412,#8a5a22,#d99a3c,#f5d18a)",
  "쿨 그레이드":"linear-gradient(90deg,#0d1c30,#1c4670,#4a86b8,#a8cfe8)",
  "스플릿 토닝":"linear-gradient(90deg,#12283f,#2f5a7a,#c98a4a,#f0c88a)",
});

/* 180도 셔터 — 셔터 각도 180°(반원 개방)와 그로 인한 자연스러운 잔상 */
PREVIEW["180도 셔터"] = svg(
  `<path d="M14 20 A9 9 0 0 1 32 20 Z" fill="${PV_C}"/>`+
  `<circle cx="23" cy="20" r="9" fill="none" stroke="${PV_A}" stroke-width="1.2"/>`+
  `<g opacity=".3">`+fig(42,18,5,10)+`</g>`+fig(48,18,5,10)+frame);

