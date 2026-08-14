/* image 앱 전용 코드 — 공통 엔진(src/shared/engine/*.js)의 SLOT 에 삽입되는 부분.
   여기 남는 것은 CONFIG 하나뿐이다 — 세 앱이 공유하던 사진 맵·충돌 규칙은
   엔진(01-data.js · 04-preview-3.js)으로 올렸다. 앱별 차이만 여기서 고친다. */
/*==SLOT:1==*/
/* ── 이미지 전용 설정 ── */
const CONFIG = {
  title:'이미지 <span>프롬프트 빌더</span>',
  sub:'정지 이미지 생성용. 촬영 조건을 고르면 영어 프롬프트로 자동 조합됩니다.',
  subjectLabel:'피사체 · 장면',
  shortLabel:'피사체',
  subjectPlaceholder:'무엇을 찍나요? (예: a woman standing in a rainy Tokyo alley)',
  warnEmptySubject:'피사체가 비어 있어요 — 장비 이름이 피사체나 화면 속 텍스트로 해석될 수 있습니다',

  sections:["shot","body","lens","light","film","tech"],
  order:["shot","body","lens","light","film","tech"],
  short:{shot:"샷",body:"바디",lens:"렌즈",light:"조명",film:"색감",tech:"디테일"},
  notes:{},
  // 영상 전용 항목 제거
  dropItems:["180도 셔터"],

  quick:{
    "전체":["shot","body","lens","light","film","tech"],
    "카메라+렌즈만":["body","lens"],
    "장비 + 디테일":["body","lens","tech"],
    "무드만 (조명·색감)":["light","film"],
    "구도만":["shot"],
  },

  wiz:[
    {key:"subject", q:"어떤 종류의 촬영인가요?",
     why:{
       "인물":"얼굴 비례가 좋은 85mm + 배경 분리",
       "제품":"디테일 중심 접사 · 전체 초점",
       "음식":"위에서 내려다보는 접사",
       "풍경 / 자연":"넓은 화각 · 전경까지 선명",
       "도시 / 거리":"현장감 있는 다큐 화각",
       "실내 공간":"공간이 넓어 보이는 광각",
     }, opts:{
      "인물":["85mm 인물","f/1.8 (얕음)","미디엄 클로즈업","렌즈 디퓨전","눈에 초점"],
      "제품":["100mm 매크로","f/8 (깊음)","익스트림 클로즈업","ISO 100 클린","정확 노출"],
      "음식":["100mm 매크로","f/2.8 (중간)","클로즈업","하이 앵글","연질광 (소프트)"],
      "풍경 / 자연":["24mm 광각","f/8 (깊음)","익스트림 와이드","딥 포커스","하이라이트 롤오프"],
      "도시 / 거리":["35mm 준광각","f/2.8 (중간)","와이드 / 풀샷","아이 레벨"],
      "실내 공간":["24mm 광각","f/5.6 (선명)","와이드 / 풀샷","아이 레벨","중간 명암비 4:1"],
    }},
    {key:"mood", q:"어떤 느낌이면 좋을까요?",
     why:{
       "따뜻한 감성":"필름 질감 + 황금빛 사광",
       "깨끗한 상업적":"스튜디오 조명 + 노이즈 없는 화질",
       "드라마틱 영화적":"어두운 명암 + 할리우드 색보정",
       "빈티지 레트로":"고전 필름 + 실내 전구빛",
       "어둡고 무거운":"저조도 + 절제된 색",
       "밝고 경쾌한":"부드러운 확산광 + 파스텔",
       "야간 네온":"네온 실전등 + 붉은 번짐",
       "자연 다큐":"자연광 + 흙빛 팔레트",
     }, opts:{
      "따뜻한 감성":["Canon AE-1","골든아워","Kodak Portra 400","필름 그레인","중간 명암비 4:1"],
      "깨끗한 상업적":["Sony A7R V","스튜디오 소프트박스","하이키","ISO 100 클린","평탄한 조명 2:1"],
      "드라마틱 영화적":["ARRI Alexa 35","로우키","틸 & 오렌지","렌즈 플레어","강한 명암비 8:1"],
      "빈티지 레트로":["35mm 시네필름","Kodachrome","텅스텐 실내등","비네팅"],
      "어둡고 무거운":["35mm 시네필름","로우키","디새추레이션","강한 명암비 8:1","블랙 크러시"],
      "밝고 경쾌한":["Canon EOS R5","흐린날 소프트","파스텔","하이키","평탄한 조명 2:1"],
      "야간 네온":["Sony Venice 2","네온 실전등","CineStill 800T","네온 사이버펑크","블랙 크러시"],
      "자연 다큐":["RED V-Raptor","골든아워","어스 톤","ISO 100 클린","림 라이트"],
    }},
    {key:"comp", q:"구도는 어떻게 잡을까요?",
     why:{
       "중심을 비껴 (삼분할)":"가장 기본적인 안정 구도",
       "정중앙 대칭":"형식미가 강한 정면 대칭",
       "여백을 크게":"고요하고 미니멀한 인상",
       "선으로 시선 유도":"선이 피사체로 시선을 끎",
       "무언가를 통해 보기":"문·창을 통한 이중 프레임",
       "전경으로 깊이":"흐린 전경으로 공간감",
     }, opts:{
      "중심을 비껴 (삼분할)":["삼분할 구도"],
      "정중앙 대칭":["대칭 구도"],
      "여백을 크게":["네거티브 스페이스"],
      "선으로 시선 유도":["리딩 라인"],
      "무언가를 통해 보기":["프레임 인 프레임"],
      "전경으로 깊이":["전경 요소"],
    }},
  ],

  /* 실제 출력 구조가 같은 모델은 대표 모델명으로 묶는다.
     GPT Image·Nano Banana·Ideogram은 구조화된 문장형을 공유하고,
     Stable Diffusion 계열만 쉼표형 본문 + 별도 네거티브 프롬프트를 쓴다.
     natural/generic 키는 기존 저장 작업 복원을 위해 그대로 유지한다. */
  models:[
    {key:"natural", label:"GPT Image 등", shortLabel:"GPT Image 등",
     help:"문장형 프롬프트용 · GPT Image 2, Nano Banana 2·Pro, Ideogram 3. 글자를 넣을 때는 ‘텍스트 방지’를 끄세요.",
     guard:" Render the frame clean, without any text, watermarks or camera interface overlays.",
     // 대표 프리셋 최대 실측 103/145단어에 피사체 입력 여유를 포함
     limit:{short:130, detail:180}},
    {key:"generic", label:"Stable Diffusion 등", shortLabel:"Stable Diffusion 등",
     help:"키워드·네거티브 프롬프트용 · SDXL, Stable Diffusion 1.5, 일부 ComfyUI 모델",
     // 부정 표현은 본문에 넣지 않고 네거티브 칸으로 낸다 (09-prompt 의 negativeText 참고)
     negative:"text, watermark, camera UI overlay",
     // 대표 프리셋 최대 실측 90/132단어에 피사체 입력 여유를 포함한 권장 길이
     limit:{short:115, detail:170}},
  ],

  build(model){
    const subj=subjectText();
    if(model==="natural"){
      return [
        plain("Scene", subj),
        block("Framing", items("shot")),
        block("Camera and lens", pick("body","lens")),
        block("Lighting and color", pick("light","film")),
        block("Technical finish", items("tech")),
      ].filter(Boolean).join(" ");
    }
    const parts=[];
    if(subj) parts.push(subj);
    ["shot","body","lens","light","film","tech"].forEach(id=>
      items(id).forEach(it=>parts.push(itemText(it))));
    return parts.filter(Boolean).join(", ");
  },
};
