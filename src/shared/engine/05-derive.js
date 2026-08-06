/* ══════════════════════════════════════════════════════════════
   공통 UI 로직 — CONFIG 하나로 이미지 / T2V / I2V 파일이 갈라집니다.
   생성 방식 분기가 없으므로 죽은 버튼·문구 불일치가 구조적으로 발생하지 않습니다.
   ══════════════════════════════════════════════════════════════ */

/* CONFIG 기준으로 데이터 축소 */
const DATA = ALL_DATA
  .filter(sec=>CONFIG.sections.includes(sec.id))
  .map(sec=>{
    const groups=sec.groups
      .map(g=>({...g, items:g.items.filter(it=>!CONFIG.dropItems.includes(it[0]))}))
      .filter(g=>g.items.length);
    return {...sec, groups, note:CONFIG.notes[sec.id]||sec.note};
  })
  // 화면 순서 = 프롬프트 순서 (중요한 섹션이 위로 오고 자동으로 펼쳐진다)
  .sort((a,b)=>CONFIG.order.indexOf(a.id)-CONFIG.order.indexOf(b.id));

const ORDER = CONFIG.order.filter(id=>DATA.some(d=>d.id===id));
const lookup={}, state={}, scope={};
DATA.forEach(sec=>{
  state[sec.id]=new Set(); scope[sec.id]=true;
  sec.groups.forEach(g=>g.items.forEach(it=>{ lookup[it[0]]={sec:sec.id,en:it[1],grp:g.label}; }));
});
const has = kr => !!lookup[kr];
const clean = list => list.filter(has);

const PRESETS={};
Object.entries(CONFIG.presets || ALL_PRESETS).forEach(([k,v])=>{
  const list=clean(v);
  if(list.length>=3) PRESETS[k]=list;      // 남는 항목이 너무 적으면 프리셋 자체를 뺀다
});
const WIZ = CONFIG.wiz.map(s=>({
  ...s,
  opts:Object.fromEntries(Object.entries(s.opts).map(([k,v])=>[k,clean(v)]))
}));

let level="easy", query="", wizPick={}, guardOn=true;
let modelKey=CONFIG.models[0].key, outputLength="short";
let undoStack=[], manualEdits=false, replacedNotice=false, openBeforeSearch=null;
let undoHigh=0;   // 이번에 쌓인 되돌리기 단계의 최대치 (버튼의 N/M 중 M)
let lastApplied=null;   // 가이드가 방금 적용한 내용 (안내용)
let activePreset=null, subjectEditSnapshot=null;
let conflictNotice=null;   // 충돌로 방금 자동 해제된 항목 (안내용)

/* ── Seedance 2.0 전용 입력 ──
   Seedance 2.0 은 '시간이 지나며 무엇이 변하는가'와 오디오를 함께 받을 때 제 성능이 난다
   (1.0/1.5 는 무음·단일 숏이라 이 입력이 의미가 없다). 그 값들은 피사체 한 줄에서
   만들어낼 수 없으므로 별도 입력으로 받는다. seedance 모델일 때만 화면에 나온다. */
const SD_TIMES={2:["0-3s","3-6s"], 3:["0-3s","3-6s","6-10s"]};
/* 오디오는 고른 사람만 받는다 — 기본값 '무음'에서는 Audio 줄 자체를 내보내지 않는다.
   지시하지 않은 소리를 모델이 알아서 깔게 두는 편이 낫고, 프롬프트도 짧아진다. */
const SD_AUDIO={
  none:    "",
  ambient: "ambient sound that matches the scene. No dialogue.",
  dialogue:"ambient sound that matches the scene, with natural dialogue.",
};
let sd={count:2, segs:["","",""], audio:"none", note:"", preserve:"strict"};

/* 입력한 장면 묘사와 선택 항목이 정면으로 모순되는지 검사한다.
   예: "a wide shot of a mountain range" 라고 써놓고 익스트림 클로즈업을 고른 경우 */
const TEXT_CONFLICTS=[
  {re:/\b(wide|panoram\w*|landscape|vast|sweeping|establishing)\b/i,
   items:["익스트림 클로즈업","클로즈업","미디엄 클로즈업","100mm 매크로"],
   msg:m=>`넓은 장면인데 좁은 프레이밍 — 입력이 넓은 화면("${m}")입니다`},
  {re:/\b(close[- ]?up|macro|detail of|texture of)\b/i,
   items:["익스트림 와이드","와이드 / 풀샷","14mm 초광각","24mm 광각"],
   msg:m=>`근접 촬영인데 넓은 화각 — 입력이 근접 촬영("${m}")입니다`},
  {re:/\b(night|midnight|dark|moonlit|nocturnal)\b/i,
   items:["골든아워","정오 하드광","데이라이트 WB"],
   msg:m=>`밤 장면인데 낮 조명 — 입력이 밤("${m}")입니다`},
  {re:/\b(daylight|sunny|noon|bright day|daytime)\b/i,
   items:["문라이트","블루아워","텅스텐 WB"],
   msg:m=>`낮 장면인데 야간 조명 — 입력이 낮("${m}")입니다`},
  {re:/\b(black[- ]and[- ]white|monochrome|b&w)\b/i,
   items:["틸 & 오렌지","네온 사이버펑크","파스텔","Technicolor"],
   msg:m=>`흑백인데 컬러 그레이딩 — 입력이 흑백("${m}")입니다`},
  {re:/\b(still|motionless|frozen|standing perfectly still)\b/i,
   items:["역동적 움직임","FPV 드론","크래시 줌"],
   msg:m=>`정지 상태인데 격렬한 움직임 — 입력이 정지 상태("${m}")입니다`},
]
// 이 변형에 존재하지 않는 항목만 가리키는 규칙은 절대 발화하지 않으므로 아예 뺀다
.filter(r=>r.items.some(has));

/* 피사체 입력의 언어 검사 — 조립되는 나머지 문구는 전부 영어다.
   한국어가 섞이면 모델이 그 부분만 해석하지 못하거나 화면에 글자로 그려낸다. */
const HANGUL_RE=/[가-힣]/;

/* 칩 안에 넣을 소형 미리보기 — 사진이 있으면 사진, 없으면 SVG 도식 또는 색 스와치.
   종류를 따로 알려주는 이유는 도식만 카드를 작게 깔기 때문이다(아래 sec 렌더 참고). */
function pvKind(kr){
  if(typeof PHOTO!=="undefined" && PHOTO[kr]) return "photo";
  if(typeof PREVIEW!=="undefined" && PREVIEW[kr]) return "svg";
  if(typeof SWATCH!=="undefined" && SWATCH[kr]) return "sw";
  return "";
}
function pvOf(kr){
  switch(pvKind(kr)){
    case "photo": return `<span class="pv ph"><img src="${PHOTO[kr]}" alt="" loading="lazy"></span>`;
    // pv-svg — 도식은 사진과 화면비가 달라 칸 비율을 따로 잡는다(styles.css 참고)
    case "svg":   return `<span class="pv pv-svg">${PREVIEW[kr]}</span>`;
    case "sw":    return `<span class="pv sw" style="background:${SWATCH[kr]}"></span>`;
    default:      return "";
  }
}

