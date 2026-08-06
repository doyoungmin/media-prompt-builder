/* ══════════════════════════════════════════════════════════════
   추가 도식 2차 — 도식화가 더 효과적인 항목
   (사진이 더 효과적인 항목은 _audit/preview-gap-2026-07-31 에 따로 정리)
   ══════════════════════════════════════════════════════════════ */

/* ── 초점 지점 ── 어디에 초점면이 있는가는 '위치' 정보라 도식이 정확하다 */
Object.assign(PREVIEW, {
  "눈에 초점": svg(bg(2.6)+
    `<circle cx="32" cy="19" r="12" fill="${PV_S}"/>`+
    `<circle cx="27" cy="17" r="1.8" fill="${FACE}"/><circle cx="37" cy="17" r="1.8" fill="${FACE}"/>`+
    `<circle cx="27" cy="17" r="5" fill="none" stroke="${PV_C}" stroke-width="1.6"/>`+
    `<path d="M22 12 v-2.5 M32 12 v-2.5 M22 22 v2.5 M32 22 v2.5" stroke="${PV_C}" stroke-width="1.4" stroke-linecap="round"/>`+frame),
  "전경 초점": svg(
    `<defs><filter id="fgb"><feGaussianBlur stdDeviation="2.4"/></filter></defs>`+
    `<g filter="url(#fgb)">`+fig(40,15,7,16)+`</g>`+
    /* 앞에 또렷하게 걸린 잎사귀 */
    `<path d="M4 38 Q4 20 16 12 Q22 22 14 32 Q10 36 4 38 Z" fill="#2f7f60"/>`+
    `<path d="M4 38 Q10 30 16 12" stroke="#7fd8b4" stroke-width="1.1" fill="none"/>`+
    `<path d="M18 40 Q16 28 26 22 Q28 32 22 38 Z" fill="#2a6e54"/>`+frame),
  "의도적 초점 이탈": svg(
    `<defs><filter id="ofb"><feGaussianBlur stdDeviation="3"/></filter></defs>`+
    `<g filter="url(#ofb)">`+fig(32,17,8,15)+`</g>`+
    `<circle cx="13" cy="11" r="4.8" fill="#f5d18a" opacity=".5"/>`+
    `<circle cx="52" cy="13" r="6" fill="#f5d18a" opacity=".38"/>`+
    `<circle cx="46" cy="31" r="3.8" fill="#f5d18a" opacity=".45"/>`+frame),
});

/* ── 감도 · 화이트밸런스 ──
   ISO 는 질감(그레인)이라 도식, 화이트밸런스는 색이라 색상칩이 맞다 */
PREVIEW["ISO 100 클린"] = svg(
  `<rect x="0" y="2" width="64" height="36" fill="#5a6070"/>`+
  fig(32,15,6,13)+frame);
PREVIEW["ISO 3200 그레인"] = svg(
  `<defs><filter id="grn"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3"/>`+
  `<feColorMatrix type="saturate" values="0"/></filter></defs>`+
  `<rect x="0" y="2" width="64" height="36" fill="#5a6070"/>`+
  fig(32,15,6,13)+
  `<rect x="0" y="2" width="64" height="36" filter="url(#grn)" opacity=".55"/>`+frame);
/* 같은 실내 장면에 색온도만 달리 입힌다 — 색상칩보다 '무엇이 달라지는지'가 분명하다 */
const wbRoom = tintFill =>
  `<rect x="0" y="2" width="64" height="36" fill="#6a6f7a"/>`+
  `<rect x="0" y="27" width="64" height="11" fill="#4d525c"/>`+
  `<rect x="8" y="8" width="14" height="19" rx="1.5" fill="#c9ced8"/>`+    /* 창 */
  `<circle cx="45" cy="14" r="4" fill="#e6d9b8"/>`+                        /* 전등 */
  `<rect x="41" y="18" width="8" height="9" rx="1.5" fill="#8f95a1"/>`+
  tintFill;
Object.assign(PREVIEW, {
  "텅스텐 WB": svg(wbRoom(
    `<rect x="2.5" y="2.5" width="59" height="35" fill="#2f6db5" opacity=".5"/>`)+frame),
  "데이라이트 WB": svg(
    `<rect x="2.5" y="2.5" width="59" height="35" fill="#7a808c"/>`+
    `<rect x="2.5" y="27" width="59" height="10.5" fill="#5b616c"/>`+
    `<rect x="8" y="8" width="14" height="19" rx="1.5" fill="#eef3fa"/>`+     /* 밝은 주광 창 */
    `<circle cx="45" cy="14" r="4" fill="#efe7d2"/>`+
    `<rect x="41" y="18" width="8" height="9" rx="1.5" fill="#9aa0ac"/>`+frame),
  "믹스드 라이팅": svg(
    `<defs><linearGradient id="mixwb" x1="0" y1="0" x2="1" y2="0">`+
    `<stop offset="0%" stop-color="#2f6db5" stop-opacity=".55"/>`+
    `<stop offset="52%" stop-color="#2f6db5" stop-opacity=".12"/>`+
    `<stop offset="100%" stop-color="#e08a2e" stop-opacity=".6"/></linearGradient></defs>`+
    wbRoom(`<rect x="2.5" y="2.5" width="59" height="35" fill="url(#mixwb)"/>`)+frame),
});

/* ── 광학 필터 ── 어디가 얼마나 어두워지는가. 위치·정도 정보라 도식이 정확하다 */
const skyBox = (skyFill) =>
  `<rect x="0" y="2" width="64" height="21.5" fill="${skyFill}"/>`+
  `<rect x="0" y="23.5" width="64" height="14.5" fill="#3d4553"/>`+
  `<path d="M0 26.5 L20 20 L32 26 L46 18 L64 26.5 L64 38 L0 38 Z" fill="#2a303c"/>`;
Object.assign(PREVIEW, {
  "폴라라이저": svg(skyBox("#123a63")+
    `<circle cx="16" cy="11" r="4.5" fill="#eef2f8" opacity=".9"/>`+
    `<circle cx="47" cy="9" r="3.4" fill="#eef2f8" opacity=".75"/>`+frame),
  "ND 필터": svg(skyBox("#4a7bab")+
    `<rect x="2.5" y="2.5" width="59" height="35" fill="#0a0c11" opacity=".52"/>`+
    `<circle cx="50" cy="10" r="7" fill="none" stroke="${PV_C}" stroke-width="1.6"/>`+
    `<circle cx="50" cy="10" r="7" fill="#0a0c11" opacity=".45"/>`+frame),
  "그라데이션 ND": svg(
    `<defs><linearGradient id="gnd" x1="0" y1="0" x2="0" y2="1">`+
    `<stop offset="0%" stop-color="#0a0c11" stop-opacity=".78"/>`+
    `<stop offset="55%" stop-color="#0a0c11" stop-opacity=".12"/>`+
    `<stop offset="100%" stop-color="#0a0c11" stop-opacity="0"/></linearGradient></defs>`+
    skyBox("#4a7bab")+
    `<rect x="2.5" y="2.5" width="59" height="35" fill="url(#gnd)"/>`+
    `<path d="M2.5 21 h59" stroke="${PV_C}" stroke-width="1" stroke-dasharray="3 2.5" opacity=".8"/>`+frame),
});

/* ── 조명 기구 ──
   기구 자체의 '모양'과 '빛이 퍼지는 각도'는 도식이 정확하다.
   광질 도식(구에 떨어지는 빛)과 겹치지 않고 서로 보완한다. */
let _sid = 0;
/* 광원에서 피사체로 퍼지는 빛 — spread 가 클수록 넓게 퍼진다 */
const beam = (x, spread, op=.5) => {
  const id = "bm" + (++_sid);
  return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0">`+
    `<stop offset="0%" stop-color="#f3e7c8" stop-opacity="${op}"/>`+
    `<stop offset="100%" stop-color="#f3e7c8" stop-opacity="0"/></linearGradient></defs>`+
    `<path d="M${x} ${20-spread/2} L52 ${20-spread*1.5} L52 ${20+spread*1.5} L${x} ${20+spread/2} Z" fill="url(#${id})"/>`;
};
const softbox = (x,y,w,h,rx=1.5) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="#e9ecf3" stroke="#aeb4c2" stroke-width="1"/>`;
const target = `<circle cx="52" cy="20" r="6" fill="${PV_S}" opacity=".8"/>`;

Object.assign(PREVIEW, {
  "스튜디오 소프트박스": svg(beam(16,17)+softbox(6,7,10,26)+target+frame),
  "뷰티 디쉬":          svg(beam(16,11)+
    `<ellipse cx="11" cy="20" rx="4.5" ry="11" fill="#e9ecf3" stroke="#aeb4c2" stroke-width="1"/>`+
    `<circle cx="11" cy="20" r="3.4" fill="#aeb4c2"/>`+target+frame),
  "엄브렐라":           svg(beam(16,24,.42)+
    `<path d="M16 4 A15 15 0 0 0 16 36" fill="#e9ecf3" stroke="#aeb4c2" stroke-width="1"/>`+
    `<path d="M16 4 v32" stroke="#aeb4c2" stroke-width="1"/>`+target+frame),
  "스트립박스 + 그리드": svg(beam(16,5,.75)+softbox(9,5,6,30)+
    `<path d="M9 12 h6 M9 20 h6 M9 28 h6" stroke="#7d8494" stroke-width="1"/>`+target+frame),
  "스누트":             svg(beam(16,2.6,.9)+
    `<path d="M5 13 L16 17.5 L16 22.5 L5 27 Z" fill="#e9ecf3" stroke="#aeb4c2" stroke-width="1"/>`+
    target+frame),
  "대형 디퓨전 스크림":  svg(beam(18,30,.46)+
    `<rect x="13" y="3" width="6" height="34" rx="1.5" fill="#e9ecf3" opacity=".6" stroke="#aeb4c2" stroke-width="1"/>`+
    `<circle cx="7" cy="20" r="3.4" fill="#f5d18a"/>`+target+frame),
});

/* ── 흑백 필터 ── 흑백으로 바꿀 때 하늘이 얼마나 어두워지는가 */
const monoBox = (skyGray) =>
  `<rect x="0" y="2" width="64" height="21.5" fill="${skyGray}"/>`+
  `<rect x="0" y="23.5" width="64" height="14.5" fill="#8f8f8f"/>`+
  `<path d="M0 26.5 L20 20 L32 26 L46 18 L64 26.5 L64 38 L0 38 Z" fill="#4a4a4a"/>`+
  `<circle cx="17" cy="11" r="5" fill="#f2f2f2" opacity=".95"/>`+
  `<circle cx="45" cy="9" r="3.6" fill="#f2f2f2" opacity=".9"/>`;
Object.assign(PREVIEW, {
  "적색 필터": svg(monoBox("#141414")+frame),
  "황색 필터": svg(monoBox("#5e5e5e")+frame),
});/*==SLOT:1==*/
/* ── 효과 서술 (모델이 고유명사를 몰라도 통하도록 하는 보험) ── */
const EXT = {
  /* 카메라 바디 */
  "Leica M6":"natural tonal gradation, fine grain, candid unobtrusive framing",
  "Canon AE-1":"warm faded colors, soft contrast, nostalgic 1980s snapshot feel",
  "Nikon F3":"neutral color, crisp mechanical rendering, photojournalistic clarity",
  "Contax T2":"soft blooming highlights, gentle contrast, dreamy 1990s compact look",
  "일회용 카메라":"heavy grain, harsh direct flash, washed-out colors, light leaks",
  "Hasselblad 500C/M":"extremely smooth tonal transitions, medium format clarity",
  "Pentax 67":"medium format depth, creamy background falloff, three-dimensional subject",
  "Mamiya RZ67":"sculpted tonal rendering, editorial sharpness with soft falloff",
  "Rolleiflex TLR":"vintage medium format rendering, waist-level low perspective, gentle vignetting",
  "Linhof 4x5":"large format detail, perfectly controlled perspective, ultra-fine tonality",
  "8x10 대형":"extreme resolution with a paper-thin focus plane, monumental stillness",
  "Canon EOS R5":"clean modern digital rendering, warm accurate color, crisp detail",
  "Sony A7R V":"ultra high resolution, neutral cool color rendition, clinical sharpness",
  "Nikon Z9":"punchy contrast, fast-action sharpness, saturated colors",
  "Fujifilm GFX 100S":"medium format digital depth, wide tonal range, delicate detail",
  "Phase One XF":"commercial-grade resolution, flawless detail, advertising polish",
  "iPhone 15 Pro":"computational HDR look, everyday realism, slightly over-sharpened",
  "ARRI Alexa 35":"filmic highlight rolloff, natural midtones, wide dynamic range",
  "ARRI Alexa LF":"large format shallow depth, expansive cinematic frame, gentle falloff",
  "RED V-Raptor":"razor sharp digital detail, high resolution texture, crisp modern cinema look",
  "Sony Venice 2":"wide latitude, natural color science, smooth low-light rendering",
  "Panavision DXL2":"epic large format scale, rich cinematic texture",
  "35mm 시네필름":"organic film grain, soft highlight rolloff, classic cinematic texture",
  "16mm 필름":"coarse visible grain, slightly soft focus, gritty documentary texture",
  "Super 8":"heavy grain, unstable frame, faded washed colors, home movie nostalgia",
  "VHS 캠코더":"low resolution, scanlines, chromatic smearing, tape noise and tracking artifacts",
  "폴라로이드":"white instant film border, faded pastel colors, soft low contrast",
  "GoPro":"ultra-wide barrel distortion, deep focus, immersive first-person action",
  "드론 (DJI)":"high aerial vantage point, sweeping landscape scale, smooth stabilized motion",
  /* 렌즈 */
  "8mm 어안":"extreme circular distortion, curved horizon",
  "14mm 초광각":"dramatic exaggerated perspective, stretched edges, vast sense of space",
  "24mm 광각":"wide environmental context, dynamic near-far perspective",
  "35mm 준광각":"natural reportage framing, mild environmental context",
  "50mm 표준":"natural perspective, undistorted proportions",
  "85mm 인물":"flattering facial compression, clean subject separation",
  "135mm 망원":"compressed background, isolated subject, flattened perspective",
  "200mm 망원":"strong background compression, tightly isolated subject",
  "600mm 초망원":"extreme compression, background dissolved into an abstract wash",
  "100mm 매크로":"extreme close focus, fine surface texture, microscopic detail",
  "Cooke S4":"warm gentle rendering, soft tonal transitions, slightly lowered contrast",
  "Zeiss Master Prime":"clinical edge-to-edge sharpness, neutral high-contrast rendering",
  "Canon K35 빈티지":"warm glowing flares, soft low-contrast highlights, vintage 1970s character",
  "Helios 44-2":"sharp center falling into rotating background blur, vintage character",
  "Petzval":"swirling edge distortion, sharp center falling into blur",
  "틸트시프트":"selective plane of focus, miniature toy-like effect",
  "스플릿 다이옵터":"foreground and background simultaneously sharp, unnatural dual focus",
  "프로브 렌즈":"extreme close macro perspective, continuous travel through a tiny space",
  "소프트 포커스":"hazy glowing diffusion, romantic softened detail",
  /* 필름 스톡 · 색감 */
  "Kodak Portra 400":"soft natural tones, low contrast, muted pastel palette, fine grain",
  "Kodak Ektar 100":"vivid saturated colors, ultra fine grain, punchy contrast",
  "Kodachrome":"rich deep reds, warm saturated midcentury palette, archival slide look",
  "Fuji Velvia 50":"intensely saturated greens and blues, high contrast landscape rendering",
  "Fuji Pro 400H":"cool mint and pastel tones, airy soft highlights, delicate color separation",
  "CineStill 800T":"tungsten balanced, cool blue shadows, glowing red bloom around lights",
  "Kodak Vision3 500T":"tungsten balanced cinema negative, fine grain, wide latitude in low light",
  "Ilford HP5":"classic monochrome with soft mid-tones and moderate grain",
  "Kodak Tri-X 400":"gritty pronounced grain, deep blacks, high contrast reportage monochrome",
  "Ilford Delta 3200":"very coarse grain, murky shadows, raw low-light monochrome",
  "Technicolor":"vivid unnatural primary colors, glowing saturated midcentury palette",
  "크로스 프로세스":"shifted unnatural hues, blown contrast, cyan shadows",
  "세피아":"warm brown monochrome, faded aged paper tone",
  "어스 톤":"muted natural palette of warm browns, ochres and sage greens",
  /* 조명 */
  "골든아워":"long soft shadows, amber glow, hazy backlight",
  "블루아워":"deep blue ambient sky, soft shadowless light, serene mood",
  "렘브란트":"small triangle of light beneath the eye, sculpted directional shadow",
  "림 라이트":"bright glowing outline separating the subject from a dark background",
  "링라이트":"even frontal light, flat shadows, circular catchlight in the eyes",
  "스튜디오 소프트박스":"even controlled illumination, soft wrap-around shadows",
  "촛불":"warm orange pools of light surrounded by deep darkness",
  "텅스텐 실내등":"warm orange pools from lamps, cozy lived-in interior",
  "형광등":"flat greenish overhead illumination, sterile institutional mood",
  "정오 하드광":"short sharp shadows, blown highlights, unforgiving clarity",
  "흐린날 소프트":"flat even illumination, soft shadowless light, gentle contrast",
  "창가 사이드라이트":"soft light falling from one side, gradual falloff into shadow",
  /* 무빙 */
  "슬로우 푸시인":"camera creeps steadily closer, gradually tightening the frame",
  "트래킹 샷":"camera moves alongside the subject, holding consistent framing",
  "핸드헬드":"organic unstable framing, subtle breathing movement",
  "슬로우 모션":"smooth graceful slowed movement, elongated action",
  "타임랩스":"accelerated passage of time, streaking clouds and light trails",
  "고정 (트라이포드)":"completely still frame, locked-off camera",
  "짐벌 오빗":"continuous smooth circular movement around the subject",
  "항공 상승":"camera lifts upward, gradually revealing the wider landscape",
  /* 샷 · 구도 */
  "대칭 구도":"perfectly centered subject, balanced formal geometry",
  "더치 앵글":"tilted frame creating unease and instability",
};
/* ── 레퍼런스 룩 프리셋 ──
   각 룩을 정의하는 요소를 빠짐없이 담는다.
   장비·조명·색감만이 아니라 명암비 · 조명 기구 · 노출 · 톤 · 구도 · 시선까지 포함해야
   "그 룩"이 재현된다. 항목이 빠지면 사용자가 무엇을 더 골라야 할지 알 수 없다.        */
const ALL_PRESETS = {
  "시네마틱 블록버스터":[
    "ARRI Alexa 35","아나모픽","f/2.8 (중간)","골든아워","틸 & 오렌지",
    "와이드 / 풀샷","삼분할 구도","슬로우 푸시인","180도 셔터",
    "저대비 플랫","하이라이트 롤오프","렌즈 플레어"],

  "필름 누아르":[
    // 고보 그림자가 경질광을 함축하므로 '경질광'은 넣지 않는다 (문구 중복 · 길이 초과)
    "35mm 시네필름","50mm 표준","로우키","스플릿","강한 명암비 8:1",
    "고보 그림자","고대비 흑백","적색 필터","더치 앵글","고정 (트라이포드)",
    "블랙 크러시","비네팅"],

  "웨스 앤더슨":[
    "Kodak Portra 400","24mm 광각","대칭 구도","아이 레벨","정면","카메라 응시",
    "하이키","평탄한 조명 2:1","1스톱 오버","파스텔","고정 (트라이포드)"],

  "감성 필름 인물":[
    "Pentax 67","85mm 인물","f/1.8 (얕음)","눈에 초점","3/4 각도","시선 이탈",
    "창가 사이드라이트","중간 명암비 4:1","Kodak Portra 400",
    "미디엄 클로즈업","얕은 심도 보케","필름 그레인"],

  "다큐멘터리 리얼":[
    "Leica M6","35mm 준광각","흐린날 소프트","Kodak Tri-X 400","핸드헬드",
    "미디엄 샷","삼분할 구도","시선 이탈","눈에 초점","ISO 3200 그레인"],

  "럭셔리 제품 광고":[
    "Phase One XF","100mm 매크로","스튜디오 소프트박스","f/8 (깊음)","정확 노출",
    "익스트림 클로즈업","네거티브 스페이스","하이라이트 롤오프",
    "짐벌 오빗","8K 고해상","HDR"],

  "네온 사이버펑크":[
    "Sony Venice 2","아나모픽","네온 실전등","CineStill 800T","네온 사이버펑크",
    "로우 앵글","리딩 라인","블랙 크러시","트래킹 샷","렌즈 플레어"],

  "90s VHS 노스탤지어":[
    "VHS 캠코더","35mm 준광각","텅스텐 실내등","크로스 프로세스",
    "리프티드 블랙","저대비 플랫","핸드헬드","미디엄 샷"],

  "자연 다큐멘터리":[
    "RED V-Raptor","600mm 초망원","f/5.6 (선명)","골든아워","림 라이트",
    "얕은 심도 보케","눈에 초점","익스트림 와이드","삼분할 구도",
    "슬로우 모션","8K 고해상"],

  "패션 에디토리얼":[
    "Mamiya RZ67","135mm 망원","f/2.8 (중간)","버터플라이","뷰티 디쉬",
    "하이키","평탄한 조명 2:1","디새추레이션",
    "와이드 / 풀샷","정면","카메라 응시","렌즈 디퓨전"],

  "스케일 항공샷":[
    "드론 (DJI)","24mm 광각","블루아워","어스 톤","저대비 플랫","그라데이션 ND",
    "익스트림 와이드","리딩 라인","항공 상승","HDR"],

  "아늑한 실내":[
    "Canon EOS R5","50mm 표준","f/1.8 (얕음)","눈에 초점","시선 이탈",
    "창가 사이드라이트","텅스텐 실내등","리플렉터 필","Fuji Pro 400H",
    "미디엄 클로즈업","하이라이트 롤오프","블룸"],
};/*==SLOT:2==*/
const BW_FILM = ["Ilford HP5","Kodak Tri-X 400","Ilford Delta 3200","고대비 흑백"];
const COLOR_LOOK = ["Kodak Portra 400","Kodak Ektar 100","Kodachrome","Fuji Velvia 50",
  "Fuji Pro 400H","CineStill 800T","Kodak Vision3 500T","틸 & 오렌지","Technicolor",
  "파스텔","네온 사이버펑크","크로스 프로세스","어스 톤"];
// '카메라 고정 유지'는 모든 카메라 이동과 양립할 수 없다
const CAM_MOVES = ["슬로우 푸시인","풀 아웃","트래킹 샷","팬","틸트","핸드헬드",
  "스테디캠 롱테이크","돌리 줌","집 크레인","짐벌 오빗","휩 팬","크래시 줌",
  "FPV 드론","항공 상승","원형 랩어라운드","하이퍼랩스"];
// 실루엣은 앞쪽 주광이 없는 상태이므로 어떤 키 라이트와도 양립할 수 없다
const KEY_LIGHTS = ["렘브란트","버터플라이","스플릿","언더라이팅","링라이트"];
const PAIRS = [
  [BW_FILM, COLOR_LOOK],
  [["카메라 고정 유지"], CAM_MOVES],
  [["백라이트 실루엣"], KEY_LIGHTS],
  // 프레이밍 — 물리적으로 성립하지 않는 조합
  // 두 인물은 얼굴이 화면을 채우는 프레이밍 안에 들어갈 수 없다
  [["투 샷"], ["클로즈업","익스트림 클로즈업"]],
  // 어깨 너머 시점은 인물에 근접해 있어야 하고, 정수리 위나 1인칭 시점과 양립하지 않는다
  [["오버 더 숄더"], ["익스트림 와이드","익스트림 클로즈업","버즈 아이","POV"]],
  // 중심을 비껴 놓는 삼분할과 정중앙 대칭은 양립 불가
  [["삼분할 구도"], ["대칭 구도"]],
  // 옆모습·뒷모습으로는 카메라와 눈을 맞출 수 없다
  [["카메라 응시"], ["옆모습","뒷모습"]],
  // 흑백 필터는 컬러 필름·그레이딩과 함께 쓰지 않는다
  [["적색 필터","황색 필터"], COLOR_LOOK],
];

/* SOFT: 양립은 가능하지만 부자연스러운 조합 — 삭제하지 않고 경고만 표시 */
const SOFT = [
  {a:["f/1.2 (극얕음)","f/1.8 (얕음)"], b:["딥 포커스"],
   msg:"밝은 조리개(f/1.2~1.8)와 딥 포커스는 모순될 수 있어요 — 심도는 렌즈·거리에도 좌우되지만 보통 f/8 이상과 어울립니다"},
  {a:["f/8 (깊음)","f/16 (전초점)"], b:["얕은 심도 보케"],
   msg:"조인 조리개(f/8~16)와 얕은 심도 보케는 모순될 수 있어요 — f/1.2~2.8과 어울립니다"},
  {a:["VHS 캠코더","Super 8","일회용 카메라","폴라로이드"], b:["8K 고해상"],
   msg:"저화질 감성 장비와 8K 고해상은 서로 상쇄될 수 있어요"},
  {a:["소프트 포커스"], b:["딥 포커스"],
   msg:"소프트 포커스 렌즈와 딥 포커스는 방향이 달라요"},
  {a:["스튜디오 소프트박스"], b:["골든아워","블루아워","정오 하드광","흐린날 소프트","문라이트"],
   msg:"스튜디오 조명과 야외 시간대 조명이 섞여 있어요 — 의도한 믹스가 아니라면 하나만 남기세요"},
  {a:["한 장면 유지"], b:["휩 팬"],
   msg:"휩 팬은 장면 전환용 기법이라 '한 장면 유지'와 방향이 반대입니다"},
  {a:["피사체 정지"], b:["역동적 움직임"],
   msg:"'피사체 정지'와 '역동적 움직임'은 서로 반대입니다 — 배경만 크게 움직이길 원한 게 아니라면 하나만 남기세요"},
  {a:["미세한 움직임"], b:["FPV 드론","크래시 줌","휩 팬","돌리 줌"],
   msg:"'미세한 움직임'과 격렬한 카메라 무빙이 함께 있어요"},
  {a:["타임랩스","하이퍼랩스"], b:["미세한 움직임","24fps 시네마틱","180도 셔터"],
   msg:"타임랩스는 시간을 압축하므로 프레임레이트·모션 설정과 충돌할 수 있어요"},
  // 스튜디오 조명은 통제된 환경이라 현장 실전등과 섞이지 않는다
  {a:["스튜디오 소프트박스"], b:["네온 실전등","촛불","고보 그림자","텅스텐 실내등","형광등"],
   msg:"스튜디오 조명과 현장 실전등이 섞여 있어요 — 스튜디오는 통제된 조명만 쓰는 게 보통입니다"},
  {a:["형광등"], b:["촛불"],
   msg:"차가운 형광등과 따뜻한 촛불은 방향이 반대입니다"},
  // 부드러운 확산 효과가 3중으로 겹치면 화면이 뭉개진다
  {a:["소프트 포커스"], b:["렌즈 디퓨전","블룸"],
   msg:"소프트 포커스 렌즈에 디퓨전·블룸까지 더하면 디테일이 과하게 뭉개집니다"},
  {a:["렌즈 디퓨전"], b:["블룸"],
   msg:"디퓨전과 블룸은 같은 '빛 번짐' 효과라 중복입니다 — 하나로 충분해요"},
  // 그레인 중첩 — 단, Tri-X 를 ISO 3200 으로 증감하는 것은 다큐멘터리의 정석이라 제외한다
  {a:["Ilford Delta 3200"], b:["ISO 3200 그레인"],
   msg:"Delta 3200은 이미 ISO 3200 필름이라 감도를 또 지정할 필요가 없어요"},
  {a:["ISO 3200 그레인"], b:["필름 그레인"],
   msg:"고감도 그레인과 필름 그레인은 중복입니다"},
  // 필름 자체 특성과 후반 보정이 반대 방향
  {a:["CineStill 800T"], b:["할레이션"],
   msg:"CineStill 800T는 붉은 할레이션이 특징이라 따로 지정할 필요가 없어요"},
  {a:["Kodak Portra 400","Fuji Pro 400H"], b:["Technicolor","네온 사이버펑크"],
   msg:"부드러운 파스텔 필름에 강한 원색 그레이딩을 얹으면 필름 특성이 사라집니다"},
  {a:["Fuji Velvia 50","Kodak Ektar 100"], b:["디새추레이션","블리치 바이패스"],
   msg:"고채도 필름에 탈색 그레이딩은 서로 상쇄됩니다"},
  // 프레이밍 — 가능하지만 서로 어긋나는 조합
  {a:["대칭 구도"], b:["더치 앵글"],
   msg:"기울어진 프레임에서는 완벽한 대칭이 성립하기 어렵습니다"},
  {a:["대칭 구도"], b:["오버 더 숄더"],
   msg:"어깨 너머 시점은 한쪽에 전경이 있어 본질적으로 비대칭입니다"},
  {a:["오버 더 숄더"], b:["투 샷"],
   msg:"둘 다 두 인물을 담는 방식인데 프레이밍이 서로 달라요 — 하나만 고르세요"},
  {a:["투 샷"], b:["미디엄 클로즈업"],
   msg:"가슴 위 프레이밍에 두 인물을 넣기엔 화면이 좁습니다"},
  // 광질 · 명암비 · 기구
  {a:["경질광 (하드)"], b:["흐린날 소프트","대형 디퓨전 스크림","연질광 (소프트)"],
   msg:"경질광과 부드러운 확산광이 함께 지정돼 있어요"},
  {a:["연질광 (소프트)"], b:["정오 하드광","스누트"],
   msg:"연질광과 강한 직사광·스누트는 방향이 반대입니다"},
  {a:["평탄한 조명 2:1","리플렉터 필"], b:["로우키","강한 명암비 8:1"],
   msg:"그림자를 살리는 설정과 어둠을 강조하는 설정이 섞여 있어요"},
  {a:["네거티브 필"], b:["하이키","평탄한 조명 2:1"],
   msg:"네거티브 필은 그림자를 더 눌러서 평탄·하이키와 반대 방향입니다"},
  {a:["스누트","스트립박스 + 그리드"], b:["하이키"],
   msg:"좁게 떨어지는 기구로 하이키를 만들기는 어렵습니다"},
  // 노출 · 톤
  {a:["1스톱 오버"], b:["블랙 크러시","로우키","1스톱 언더"],
   msg:"밝게 올린 노출과 어둡게 누르는 설정이 충돌합니다"},
  {a:["1스톱 언더"], b:["하이키","리프티드 블랙"],
   msg:"어둡게 내린 노출과 밝게 들어올리는 설정이 충돌합니다"},
  {a:["저대비 플랫"], b:["고대비 흑백","블랙 크러시"],
   msg:"플랫 프로파일과 강한 대비·블랙 크러시는 반대입니다"},
  {a:["고대비 톤"], b:["고대비 흑백"],
   msg:"이미 고대비 흑백을 골랐으니 대비를 또 지정할 필요가 없어요"},
  {a:["리프티드 블랙"], b:["렌즈 디퓨전"],
   msg:"디퓨전 필터도 검정을 들어올리므로 효과가 중복됩니다"},
  // 초점
  {a:["의도적 초점 이탈"], b:["딥 포커스","눈에 초점"],
   msg:"초점을 빗나가게 하는 설정과 선명하게 맞추는 설정이 충돌합니다"},
  {a:["전경 초점"], b:["딥 포커스"],
   msg:"전경만 살리려면 얕은 심도가 필요합니다"},
  // 필터
  {a:["폴라라이저"], b:["반사 활용"],
   msg:"폴라라이저는 반사를 없애므로 '반사 활용'과 반대입니다"},
  {a:["ND 필터"], b:["f/8 (깊음)","f/16 (전초점)"],
   msg:"ND는 밝은 곳에서 조리개를 열기 위한 도구라 조인 조리개와는 목적이 어긋납니다"},
];/*==SLOT:3==*/
