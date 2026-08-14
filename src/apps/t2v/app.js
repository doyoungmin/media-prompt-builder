/* t2v 앱 전용 코드 — 공통 엔진(src/shared/engine/*.js)의 SLOT 에 삽입되는 부분.
   여기 남는 것은 CONFIG 하나뿐이다 — 세 앱이 공유하던 사진 맵·충돌 규칙은
   엔진(01-data.js · 04-preview-3.js)으로 올렸다. 앱별 차이만 여기서 고친다. */
/*==SLOT:1==*/
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
    {key:"veo", label:"Veo 3.1", shortLabel:"Veo",
     help:"Google Veo에서 영상을 만들 때 선택하세요.",
     guard:" Render the frame clean, without any text, watermarks or camera interface overlays.",
     limit:{short:130, detail:210}},
    {key:"seedance25", label:"Seedance 2.5", shortLabel:"Seedance 2.5",
     help:"Higgsfield의 Seedance 2.5로 최대 30초 영상을 만들 때 선택하세요.",
     guard:" No on-screen text, watermark or camera UI overlay.",
     seedance:{
       panelLabel:"스토리 시간구간",
       timeline:{2:["0-10s","10-20s"], 3:["0-10s","10-20s","20-30s"]},
     },
     // 대표 프리셋 + 기본 2구간 실측 최대 127/173단어에 추가 입력 여유를 포함
     limit:{short:140, detail:195}},
    {key:"seedance", label:"Seedance 2.0", shortLabel:"Seedance 2.0",
     help:"Seedance 2.0으로 6~10초 영상을 만들 때 선택하세요.",
     guard:" No on-screen text, watermark or camera UI overlay.",
     seedance:{
       panelLabel:"연속숏 시간구간",
       timeline:{2:["0-3s","3-6s"], 3:["0-3s","3-6s","6-10s"]},
     },
     // 대표 프리셋 + 기본 2구간 실측 최대 128/173단어에 추가 입력 여유를 포함
     limit:{short:140, detail:195}},
    {key:"generic", label:"Kling · Pika 등", shortLabel:"Kling · Pika",
     help:"Kling·Pika 등 다른 영상 생성 모델을 사용할 때 선택하세요.",
     // Kling·Pika 는 네거티브 프롬프트 입력란이 따로 있다 — 본문에 부정문을 넣지 않는다
     negative:"text, watermark, camera UI overlay",
     // Kling·Pika 는 입력란이 넉넉해 키워드 나열이 길어도 받는다
     limit:{short:110, detail:170}},
  ],

  build(model){
    const subj=subjectText();
    /* Seedance 계열은 '시간이 지나며 무엇이 변하는가'를 줄 단위로 읽고 오디오도 같이
       만든다. 카메라 이동·피사체 움직임·장면 연속성을 서로 다른 줄로 분리해 모순을 막는다. */
    if(model==="seedance" || model==="seedance25"){
      const cameraMove=moveItems("camera");
      const motionAmount=moveItems("amount");
      const continuity=moveItems("scene");
      const rendering=[...moveItems("time"), ...pick("body","lens","light","film","tech")];
      return sdPrompt({
        hasUserInput:!!subj,
        head: subj,
        camera: listText([...items("shot"), ...cameraMove]),
        motion: listText(motionAmount),
        continuity: listText(continuity),
        style: listText(rendering),
        keep: model==="seedance25"
          ? (outputLength==="detail"
            ? "Maintain subject identity, wardrobe and setting consistency across all segments, with physically plausible motion and coherent transitions."
            : "Keep the subject and setting consistent across all segments.")
          : (outputLength==="detail"
            ? "One continuous shot. Keep the subject, wardrobe and setting consistent throughout, and keep the motion physically plausible."
            : "One continuous shot. Keep the subject and setting consistent throughout."),
      });
    }
    if(model==="generic"){
      const parts=[];
      if(subj) parts.push(subj);
      ["move","shot","body","lens","light","film","tech"].forEach(id=>
        items(id).forEach(it=>parts.push(itemText(it))));
      return parts.filter(Boolean).join(", ");
    }
    /* 피사체를 맨 앞에 둔다. 두 가지가 같이 해결된다.
       ① Veo 공식 권장 순서가 '주체 → 행동 → 장면 → 카메라 → 스타일' 이다.
       ② dedupe 는 앞에서부터 훑으므로, 항목 블록이 피사체보다 앞에 있으면 피사체에 쓴
          조각이 항목 문구와 정확히 같을 때 사용자가 쓴 쪽이 지워졌다.
          예: 피사체 "a woman walks away, wide shot" + 와이드/풀샷 선택
              → "Subject and action: a woman walks away." ("wide shot" 이 증발)
          순서를 바꾸면 사용자가 쓴 것이 먼저 등록돼 항목 쪽 중복이 대신 빠진다.
       이 순서에 기대고 있으므로 verify:seedance 가 앱·모델 전부에서 이걸 대조한다. */
    return [                        // veo
      plain("Subject and action", subj),
      block("Cinematography", pick("shot","move")),
      block("Camera and lens", pick("body","lens")),
      block("Lighting and color", pick("light","film")),
      block("Technical finish", items("tech")),
    ].filter(Boolean).join(" ");
  },
};
