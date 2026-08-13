/* t2v 앱 전용 코드 — 공통 엔진(src/shared/engine/*.js)의 SLOT 에 삽입되는 부분.
   앱별 데이터·설정(CONFIG/프리셋/썸네일 맵 등)은 여기서 수정한다. */
/*==SLOT:1==*/
const PHOTO = {
  "뒷모습":"/thumbs/t-000.webp",
  "정면":"/thumbs/t-001.webp",
  "옆모습":"/thumbs/t-002.webp",
  "3/4 각도":"/thumbs/t-003.webp",
  "네거티브 필":"/thumbs/t-004.webp",
  "리플렉터 필":"/thumbs/t-005.webp",
  "블룸":"/thumbs/t-006.webp",
  "크로마틱 애버레이션":"/thumbs/t-007.webp",
  "렌즈 디퓨전":"/thumbs/t-008.webp",
  "렌즈 플레어":"/thumbs/t-009.webp",
  "필름 그레인":"/thumbs/t-010.webp",
  "할레이션":"/thumbs/t-011.webp",
  "비네팅":"/thumbs/t-012.webp",
  "시선 이탈":"/thumbs/t-013.webp",
  "카메라 응시":"/thumbs/t-014.webp",
  "100mm 매크로":"/thumbs/t-015.webp",
  "135mm 망원":"/thumbs/t-016.webp",
  "14mm 초광각":"/thumbs/t-017.webp",
  "200mm 망원":"/thumbs/t-018.webp",
  "24mm 광각":"/thumbs/t-019.webp",
  "35mm 준광각":"/thumbs/t-020.webp",
  "50mm 표준":"/thumbs/t-021.webp",
  "600mm 초망원":"/thumbs/t-022.webp",
  "85mm 인물":"/thumbs/t-023.webp",
  "8mm 어안":"/thumbs/t-024.webp",
  "버터플라이":"/thumbs/t-025.webp",
  "렘브란트":"/thumbs/t-026.webp",
  "림 라이트":"/thumbs/t-027.webp",
  "링라이트":"/thumbs/t-028.webp",
  "백라이트 실루엣":"/thumbs/t-029.webp",
  "스플릿":"/thumbs/t-030.webp",
  "언더라이팅":"/thumbs/t-031.webp",
  "촛불":"/thumbs/t-032.webp",
  "형광등":"/thumbs/t-033.webp",
  "고보 그림자":"/thumbs/t-034.webp",
  "하이키":"/thumbs/t-035.webp",
  "로우키":"/thumbs/t-036.webp",
  "네온 실전등":"/thumbs/t-037.webp",
  "텅스텐 실내등":"/thumbs/t-038.webp",
  "블루아워":"/thumbs/t-039.webp",
  "갓레이":"/thumbs/t-040.webp",
  "골든아워":"/thumbs/t-041.webp",
  "정오 하드광":"/thumbs/t-042.webp",
  "문라이트":"/thumbs/t-043.webp",
  "흐린날 소프트":"/thumbs/t-044.webp",
  "창가 사이드라이트":"/thumbs/t-045.webp",
  "평탄한 조명 2:1":"/thumbs/t-046.webp",
  "중간 명암비 4:1":"/thumbs/t-047.webp",
  "강한 명암비 8:1":"/thumbs/t-048.webp",
  "아나모픽":"/thumbs/t-049.webp",
  "Cooke S4":"/thumbs/t-050.webp",
  "Helios 44-2":"/thumbs/t-051.webp",
  "Canon K35 빈티지":"/thumbs/t-052.webp",
  "Petzval":"/thumbs/t-053.webp",
  "프로브 렌즈":"/thumbs/t-054.webp",
  "소프트 포커스":"/thumbs/t-055.webp",
  "스플릿 다이옵터":"/thumbs/t-056.webp",
  "틸트시프트":"/thumbs/t-057.webp",
  "Zeiss Master Prime":"/thumbs/t-058.webp",
};
const GUIDE_IMG = {
  "깨끗한 상업적":"/thumbs/t-059.webp",
  "도시 / 거리":"/thumbs/t-060.webp",
  "드라마틱 영화적":"/thumbs/t-061.webp",
  "따뜻한 감성":"/thumbs/t-062.webp",
  "밝고 경쾌한":"/thumbs/t-063.webp",
  "빈티지 레트로":"/thumbs/t-064.webp",
  "실내 공간":"/thumbs/t-065.webp",
  "야간 네온":"/thumbs/t-066.webp",
  "어둡고 무거운":"/thumbs/t-067.webp",
  "음식":"/thumbs/t-068.webp",
  "인물":"/thumbs/t-069.webp",
  "자연 다큐":"/thumbs/t-070.webp",
  "제품":"/thumbs/t-071.webp",
  "풍경 / 자연":"/thumbs/t-072.webp",
  /* ③ 구도 — 예전에는 도식이었다. 실제 사진이 구도를 훨씬 빨리 알려준다 */
  "중심을 비껴 (삼분할)":"/thumbs/t-085.webp",
  "정중앙 대칭":"/thumbs/t-086.webp",
  "여백을 크게":"/thumbs/t-087.webp",
  "선으로 시선 유도":"/thumbs/t-088.webp",
  "무언가를 통해 보기":"/thumbs/t-089.webp",
  "전경으로 깊이":"/thumbs/t-090.webp",
};/*==SLOT:2==*/
/* ── 프리셋 프리뷰 (400px 썸네일 임베딩) — embed_previews.py 가 생성 ── */
const PRESET_IMG = {
  "90s VHS 노스탤지어":"/thumbs/t-073.webp",
  "네온 사이버펑크":"/thumbs/t-074.webp",
  "다큐멘터리 리얼":"/thumbs/t-075.webp",
  "스케일 항공샷":"/thumbs/t-076.webp",
  "시네마틱 블록버스터":"/thumbs/t-077.webp",
  "아늑한 실내":"/thumbs/t-078.webp",
  "웨스 앤더슨":"/thumbs/t-079.webp",
  "필름 누아르":"/thumbs/t-080.webp",
  "감성 필름 인물":"/thumbs/t-081.webp",
  "럭셔리 제품 광고":"/thumbs/t-082.webp",
  "자연 다큐멘터리":"/thumbs/t-083.webp",
  "패션 에디토리얼":"/thumbs/t-084.webp",
};
/* ── 충돌 규칙 ──
   EXCLUSIVE: 목록 안에서 1개만 선택 가능 (나중 선택이 이전 선택을 대체)
   PAIRS: A쪽과 B쪽은 양립 불가 (한쪽을 고르면 반대쪽 전체 해제)      */
const EXCLUSIVE = [
  ["얕은 심도 보케","딥 포커스"],                                              // 심도
  ["프리즈 (1/2000s)","모션 블러 (1/15s)","장노출","180도 셔터"],               // 셔터
  ["ISO 100 클린","ISO 3200 그레인"],                                          // 감도
  ["텅스텐 WB","데이라이트 WB","믹스드 라이팅"],                                // WB
  ["로우키","하이키"],                                                         // 키 조명
  ["골든아워","블루아워","정오 하드광","흐린날 소프트","문라이트"],              // 시간대
  ["24fps 시네마틱","60fps 부드럽게"],                                         // 프레임레이트
  ["저대비 플랫","고대비 톤"],                                                 // 대비
  ["블랙 크러시","리프티드 블랙"],                                             // 섀도 처리
];/*==SLOT:3==*/
/* ── 텍스트 → 영상 (T2V) 전용 설정 ── */
const CONFIG = {
  title:'영상 <span>프롬프트 빌더</span> <em style="font-style:normal;font-size:13px;color:#6b7285">· 텍스트에서 생성</em>',
  sub:'Veo · 범용 영상 모델용. 텍스트에서 장면과 움직임을 함께 조합합니다.',
  subjectLabel:'피사체 · 행동 · 장면',
  shortLabel:'피사체 · 행동',
  subjectPlaceholder:'무엇이 어떻게 움직이나요? (예: a woman walks through a rainy Tokyo alley, looking back)',
  warnEmptySubject:'피사체와 행동이 비어 있어요 — 영상 모델은 "무엇이 무엇을 한다"가 없으면 결과가 불안정합니다',

  // Seedance 전용 입력 패널 (엔진이 만든다). preserve 는 참조 이미지가 있는 I2V 만 쓴다
  sd:{
    preserve:false,
    segHints:[
      "처음에 무엇이 보이고 어떻게 움직이나요?",
      "그다음 무엇이 바뀌나요?",
      "마지막에 어떻게 끝나나요?",
    ],
  },

  sections:["shot","move","body","lens","light","film","tech"],
  order:["shot","move","body","lens","light","film","tech"],
  short:{shot:"샷",move:"무빙",body:"바디",lens:"렌즈",light:"조명",film:"색감",tech:"디테일"},
  notes:{
    move:"영상의 핵심 · 무빙 1개 + 시간 표현 1개",
    body:"동영상 촬영이 가능한 기종만 · 1대만 선택됩니다",
  },
  // 구조적으로 동영상을 찍을 수 없는 스틸 전용 카메라는 제외한다.
  // (필름 질감은 35mm 시네필름 · 16mm · Super 8 · VHS 가 담당)
  dropItems:[
    "Hasselblad 500C/M","Pentax 67","Mamiya RZ67","Rolleiflex TLR",
    "Linhof 4x5","8x10 대형","Phase One XF","폴라로이드","일회용 카메라",
    "Leica M6","Canon AE-1","Nikon F3","Contax T2",
  ],

  quick:{
    "전체":["shot","move","body","lens","light","film","tech"],
    "움직임만":["move","shot"],
    "카메라+렌즈만":["body","lens"],
    "무드만 (조명·색감)":["light","film"],
    "장비 + 디테일":["body","lens","tech"],
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
       "따뜻한 감성":"16mm 필름 질감 + 황금빛 사광",
       "깨끗한 상업적":"스튜디오 조명 + 노이즈 없는 화질",
       "드라마틱 영화적":"어두운 명암 + 할리우드 색보정",
       "빈티지 레트로":"고전 필름 + 실내 전구빛",
       "어둡고 무거운":"저조도 + 절제된 색",
       "밝고 경쾌한":"부드러운 확산광 + 파스텔",
       "야간 네온":"네온 실전등 + 붉은 번짐",
       "자연 다큐":"자연광 + 흙빛 팔레트",
     }, opts:{
      "따뜻한 감성":["16mm 필름","골든아워","Kodak Portra 400","필름 그레인","중간 명암비 4:1"],
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
    {key:"motion", q:"카메라는 어떻게 움직일까요?",
     why:{
       "고정":"카메라 고정 + 24fps + 한 장면 유지",
       "천천히 다가가기":"서서히 좁혀 들어가며 긴장 고조",
       "물러나며 보여주기":"물러나며 상황을 드러냄",
       "피사체 따라가기":"피사체와 함께 이동",
       "현장감 핸드헬드":"손으로 든 듯한 미세한 흔들림",
       "주위를 돌기":"피사체 주위를 원형으로 회전",
       "공중에서 상승":"위로 올라가며 전경 공개",
       "느리게 (슬로모)":"고속 촬영으로 우아하게",
     }, opts:{
      "고정":["고정 (트라이포드)","카메라 고정 유지","24fps 시네마틱","한 장면 유지"],
      "천천히 다가가기":["슬로우 푸시인","24fps 시네마틱","한 장면 유지"],
      "물러나며 보여주기":["풀 아웃","24fps 시네마틱","한 장면 유지"],
      "피사체 따라가기":["트래킹 샷","24fps 시네마틱","한 장면 유지"],
      "현장감 핸드헬드":["핸드헬드","24fps 시네마틱","한 장면 유지"],
      "주위를 돌기":["짐벌 오빗","24fps 시네마틱","한 장면 유지"],
      "공중에서 상승":["항공 상승","24fps 시네마틱","한 장면 유지"],
      "느리게 (슬로모)":["슬로우 모션","한 장면 유지"],
    }},
  ],

  models:[
    {key:"veo", label:"Veo", shortLabel:"Veo",
     help:"촬영법 · 피사체와 행동 · 카메라 · 조명 · 마감을 구조화된 문장으로 조합합니다. 긴 프롬프트를 잘 소화합니다.",
     guard:" Render the frame clean, without any text, watermarks or camera interface overlays.",
     limit:{short:130, detail:210}},
    {key:"seedance", label:"Seedance 2.0", shortLabel:"Seedance",
     help:"시간 구간별로 무엇이 변하는지와 오디오를 함께 지시합니다. 아래 구간 입력칸을 채우세요.",
     guard:" No on-screen text, watermark or camera UI overlay.",
     // 2.0 은 4~15초. 구간을 나눠 쓰므로 단일 숏 형식보다 길어진다
     limit:{short:140, detail:210}},
    {key:"generic", label:"범용 영상 (Kling · Pika 등)", shortLabel:"범용 영상",
     help:"키워드 나열형. 문장 해석이 약한 모델에 적합합니다.",
     // Kling·Pika 는 네거티브 프롬프트 입력란이 따로 있다 — 본문에 부정문을 넣지 않는다
     negative:"text, watermark, camera UI overlay",
     // Kling·Pika 는 입력란이 넉넉해 키워드 나열이 길어도 받는다
     limit:{short:110, detail:170}},
  ],

  build(model){
    const subj=subjectText();
    /* Seedance 2.0 은 '시간이 지나며 무엇이 변하는가'를 줄 단위로 읽고 오디오도 같이 만든다.
       카메라·렌즈 키워드를 늘어놓는 것보다 구간별 사건 전개가 결과를 크게 가른다.
       (1.0/1.5 는 무음·단일 숏이라 이 형식이 필요 없다 — 그쪽은 범용/Veo 쪽이 낫다.) */
    if(model==="seedance"){
      return sdPrompt({
        head: subj,
        camera: listText(pick("shot","move")),
        style: listText(pick("body","lens","light","film","tech")),
        keep: outputLength==="detail"
          ? "One continuous shot. Keep the subject, wardrobe and setting consistent throughout, and keep the motion physically plausible."
          : "One continuous shot. Keep the subject and setting consistent throughout.",
      });
    }
    if(model==="generic"){
      const parts=[];
      if(subj) parts.push(subj);
      ["move","shot","body","lens","light","film","tech"].forEach(id=>
        items(id).forEach(it=>parts.push(itemText(it))));
      return parts.filter(Boolean).join(", ");
    }
    return [                        // veo
      block("Cinematography", pick("shot","move")),
      plain("Subject and action", subj),
      block("Camera and lens", pick("body","lens")),
      block("Lighting and color", pick("light","film")),
      block("Technical finish", items("tech")),
    ].filter(Boolean).join(" ");
  },
};