/* i2v 앱 전용 코드 — 공통 엔진(src/shared/engine/*.js)의 SLOT 에 삽입되는 부분.
   여기 남는 것은 CONFIG 하나뿐이다 — 세 앱이 공유하던 사진 맵·충돌 규칙은
   엔진(01-data.js · 04-preview-3.js)으로 올렸다. 앱별 차이만 여기서 고친다. */
/*==SLOT:1==*/
/* ── 이미지 → 영상 (I2V) 전용 설정 ──
   참조 이미지가 카메라·렌즈·조명·색감을 이미 결정하므로 그 항목들은 제외하고
   '무엇이 어떻게 움직이는가'에만 집중한다.                                   */
const CONFIG = {
  title:'영상 <span>프롬프트 빌더</span> <em style="font-style:normal;font-size:13px;color:#6b7285">· 이미지에 모션 추가</em>',
  subjectLabel:'무엇을 어떻게 움직이게 할까요',
  shortLabel:'움직임 설명',
  subjectPlaceholder:'움직임을 서술하세요 (예: her hair drifts in the wind, she slowly turns toward the camera)',
  /* I2V 는 움직임 설명이 없으면 프롬프트를 만들지 않는다(build 참고).
     항목만 골라도 결과가 안 나오므로 UI 에서 그 이유를 분명히 알려야 한다. */
  subjectRequired:true,
  // ' — ' 앞이 좁은 안내 자리에 실제로 보이는 부분이라 짧게 끊어 둔다
  warnEmptySubject:'움직임 설명이 필요해요 — 항목 선택만으로는 프롬프트가 만들어지지 않습니다',

  // Seedance 전용 입력 패널 (엔진이 만든다). 참조 이미지가 있으므로 유지 수준을 받는다
  sd:{
    preserve:true,
    segHints:[
      "처음에 무엇이 움직이나요?",
      "그다음 무엇이 바뀌나요?",
      "마지막에 어떻게 끝나나요?",
    ],
  },

  sections:["move","shot","tech"],
  order:["move","shot","tech"],
  short:{move:"모션",shot:"프레이밍",tech:"질감"},
  notes:{
    move:"이 파일의 핵심 · 카메라 무빙 · 움직임의 크기 · 장면 제어",
    shot:"원본 이미지의 프레이밍을 유지하도록 알려줄 때만",
    tech:"움직임의 질감",
  },
  // 이미 찍힌 이미지에서 바꿀 수 없거나, 원본이 이미 결정한 요소는 전부 제거한다.
  dropItems:[
    // 정지 이미지가 이미 정한 촬영 결과
    "프리즈 (1/2000s)","장노출","ISO 100 클린","ISO 3200 그레인",
    "텅스텐 WB","데이라이트 WB","믹스드 라이팅",
    "렌즈 플레어","할레이션","비네팅","필름 그레인","크로마틱 애버레이션",
    "블룸","렌즈 디퓨전","8K 고해상","HDR","딥 포커스","얕은 심도 보케",
    // 이미 찍힌 사진의 앵글·구도는 사후에 바꿀 수 없다
    "아이 레벨","로우 앵글","하이 앵글","더치 앵글","버즈 아이","웜즈 아이","POV",
    "오버 더 숄더","투 샷","대칭 구도",
    // 구도 원칙·얼굴 방향·시선도 원본이 이미 결정한 것이다
    "삼분할 구도","리딩 라인","네거티브 스페이스","프레임 인 프레임",
    "전경 요소","대각 구도","반사 활용","소실점 원근",
    "정면","3/4 각도","옆모습","뒷모습","카메라 응시","시선 이탈",
    // 노출·톤·초점·필터도 촬영 시점에 확정된다
    "눈에 초점","전경 초점","의도적 초점 이탈",
    "1스톱 오버","정확 노출","1스톱 언더",
    "저대비 플랫","고대비 톤","블랙 크러시","리프티드 블랙","하이라이트 롤오프",
    "폴라라이저","ND 필터","그라데이션 ND","적색 필터","황색 필터",
    // 정지 이미지 한 장에서 만들 수 없는 시간 표현
    "타임랩스","하이퍼랩스","초고속",
  ],

  quick:{
    "전체":["move","shot","tech"],
    "움직임만":["move"],
    "움직임 + 질감":["move","tech"],
  },

  // 룩 프리셋 대신 모션 레시피 (I2V는 룩을 원본 이미지가 이미 정한다)
  look:{
    tab:"모션 레시피",
    tabSub:"자주 쓰는 움직임 한 번에",
    heading:"원하는 움직임을 고르세요",
    note:"원본 이미지의 스타일은 그대로 두고 움직임만 지정합니다. 마우스를 올리면 구성 항목이 보입니다.",
  },
  // 룩·가이드·칩의 예시 사진을 쓰지 않는다 — 룩은 원본 이미지가 이미 정한다.
  // 사진 맵은 엔진에 하나뿐이라 비워서 끌 수 없다(05-derive 의 usePhotos).
  noPreviewImages:true,

  presets:{
    "잔잔한 생동감":["고정 (트라이포드)","카메라 고정 유지","미세한 움직임","180도 셔터","한 장면 유지"],
    "살아있는 사진":["고정 (트라이포드)","카메라 고정 유지","피사체 정지","끊김 없는 루프","한 장면 유지"],
    "천천히 다가가기":["슬로우 푸시인","미세한 움직임","180도 셔터","한 장면 유지"],
    "물러나며 공개":["풀 아웃","보통 움직임","180도 셔터","한 장면 유지"],
    "인물 주위 회전":["짐벌 오빗","보통 움직임","180도 셔터","한 장면 유지"],
    "따라가기":["트래킹 샷","보통 움직임","180도 셔터","한 장면 유지"],
    "현장감 핸드헬드":["핸드헬드","보통 움직임","모션 블러 (1/15s)","한 장면 유지"],
    "우아한 슬로모":["슬로우 푸시인","보통 움직임","슬로우 모션","한 장면 유지"],
    "공중 상승":["항공 상승","역동적 움직임","180도 셔터","한 장면 유지"],
    "초점 이동":["랙 포커스","고정 (트라이포드)","미세한 움직임","한 장면 유지"],
  },
  // 프리셋의 첫 항목에 의존하면 고정·푸시인 도식이 중복되므로 대표 도식을 명시한다.
  presetPv:{
    "잔잔한 생동감":"미세한 움직임",
    "살아있는 사진":"끊김 없는 루프",
    "천천히 다가가기":"슬로우 푸시인",
    "물러나며 공개":"풀 아웃",
    "인물 주위 회전":"짐벌 오빗",
    "따라가기":"트래킹 샷",
    "현장감 핸드헬드":"핸드헬드",
    "우아한 슬로모":"슬로우 모션",
    "공중 상승":"항공 상승",
    "초점 이동":"랙 포커스",
  },

  // 세 질문이 서로 다른 배타 그룹만 건드리므로 답이 덮어써지지 않는다.
  //   ① 카메라 무빙(xg:move)  ② 움직임의 크기(xg:amount)  ③ 속도감(xg:time / 셔터)
  wiz:[
    {key:"camera", q:"카메라는 어떻게 움직일까요?",
     why:{
       "카메라 고정 (피사체만 움직임)":"카메라를 못박고 피사체만 움직임",
       "천천히 다가가기":"서서히 좁혀 들어감",
       "물러나며 보여주기":"물러나며 주변을 드러냄",
       "피사체 따라가기":"피사체와 함께 이동",
       "주위를 돌기":"원형으로 회전",
       "좌우로 훑기":"좌우로 공간을 스캔",
       "핸드헬드 흔들림":"미세한 손떨림",
       "위로 상승":"위로 올라가며 공개",
     }, opts:{
      "카메라 고정 (피사체만 움직임)":["고정 (트라이포드)","카메라 고정 유지"],
      "천천히 다가가기":["슬로우 푸시인"],
      "물러나며 보여주기":["풀 아웃"],
      "피사체 따라가기":["트래킹 샷"],
      "주위를 돌기":["짐벌 오빗"],
      "좌우로 훑기":["팬"],
      "핸드헬드 흔들림":["핸드헬드"],
      "위로 상승":["항공 상승"],
    }},
    {key:"amount", q:"움직임은 얼마나 크게?",
     why:{
       "거의 정지한 듯 미세하게":"숨결·머리카락 정도만",
       "자연스러운 정도":"일상적인 움직임",
       "크고 역동적으로":"크고 빠른 동작",
       "인물은 그대로, 배경만":"피사체 고정 · 환경만 움직임",
     }, opts:{
      "거의 정지한 듯 미세하게":["미세한 움직임","한 장면 유지"],
      "자연스러운 정도":["보통 움직임","한 장면 유지"],
      "크고 역동적으로":["역동적 움직임","한 장면 유지"],
      "인물은 그대로, 배경만":["피사체 정지","한 장면 유지"],
    }},
    {key:"speed", q:"속도감은 어떤가요?",
     why:{
       "자연스러운 실시간":"영화적으로 자연스러운 잔상",
       "느리고 우아하게":"슬로우 모션",
       "잔상이 느껴지게":"긴 셔터로 흐름 강조",
       "반복 재생용 루프":"처음과 끝이 이어짐",
     }, opts:{
      "자연스러운 실시간":["180도 셔터"],
      "느리고 우아하게":["슬로우 모션"],
      "잔상이 느껴지게":["모션 블러 (1/15s)"],
      "반복 재생용 루프":["끊김 없는 루프"],
    }},
  ],

  models:[
    {key:"veo", label:"Veo 3.1", shortLabel:"Veo",
     help:"Google Veo에서 이미지를 영상으로 만들 때 선택하세요.",
     /* 참조 이미지를 따르라는 것은 I2V 의 요건이지 방지 문구가 아니다 — anchor 로 낸다.
        예전에는 아래 guard 와 한 문자열이라 '텍스트 방지'를 끄면 함께 빠졌다. */
     anchor:" Keep the subject, composition and lighting consistent with the reference image.",
     guard:" Render the frame clean, without any text or watermarks.",
     limit:{short:110, detail:190}},
    {key:"seedance25", label:"Seedance 2.5", shortLabel:"Seedance 2.5",
     help:"Higgsfield의 Seedance 2.5로 최대 30초 영상을 만들 때 선택하세요.",
     guard:" No on-screen text, watermark or camera UI overlay.",
     seedance:{
       panelLabel:"스토리 시간구간",
       timeline:{2:["0-10s","10-20s"], 3:["0-10s","10-20s","20-30s"]},
     },
     // 대표 프리셋 + 기본 2구간 실측 최대 109/121단어에 추가 입력 여유를 포함
     limit:{short:125, detail:140}},
    {key:"seedance", label:"Seedance 2.0", shortLabel:"Seedance 2.0",
     help:"Seedance 2.0으로 6~10초 영상을 만들 때 선택하세요.",
     guard:" No on-screen text, watermark or camera UI overlay.",
     seedance:{
       panelLabel:"연속숏 시간구간",
       timeline:{2:["0-3s","3-6s"], 3:["0-3s","3-6s","6-10s"]},
     },
     // 대표 프리셋 + 기본 2구간 실측 최대 103/115단어에 추가 입력 여유를 포함
     limit:{short:125, detail:135}},
    {key:"generic", label:"Kling · Luma · Pika 등", shortLabel:"Kling · Luma",
     help:"Kling·Luma·Pika 등 다른 이미지-영상 모델을 사용할 때 선택하세요.",
     /* 긍정 지시(원본 스타일 유지)는 본문에 남기고, 빼고 싶은 것만 네거티브 칸으로 낸다.
        예전에는 둘이 한 문자열에 붙어 있어 부정 표현까지 본문으로 나갔다.
        그 뒤에도 이 지시가 guard 자리에 있어서 '텍스트 방지'를 끄면 사라졌다 — anchor 로 옮겼다. */
     anchor:", keep the reference image style",
     negative:"text, watermark",
     limit:{short:70, detail:130}},
  ],

  build(model){
    const motion=subjectText();
    /* T2V 와 같은 Seedance 형식(t2v/app.js 주석 참고).
       I2V 에서는 첫 프레임이 곧 참조 이미지이므로 그 사실과 '어디까지 유지할지'를 못박는다.
       유지 수준은 사용자가 고른다 — 엄격히 묶으면 안전하지만 움직임이 죽는다. */
    /* 무빙 섹션은 카메라의 움직임 · 움직임의 크기 · 속도감 · 장면 제어가 한데 있다.
       라벨을 붙여 낼 때는 갈라야 한다 — 05-derive 의 MOVE_GROUPS 주석 참고. */
    const cameraMove=moveItems("camera");
    const motionAmount=moveItems("amount");
    const continuity=moveItems("scene");
    const rendering=[...moveItems("time"), ...items("tech")];
    if(model==="seedance" || model==="seedance25"){
      const preserve = sd.preserve==="strict"
        ? "Keep the subject identity, outfit, composition, lighting and visual style unchanged from the reference image."
        : "Keep the subject clearly recognisable from the reference image; natural variation in pose and lighting is fine.";
      /* 구간을 채웠을 때만 '구간들' 을 말할 수 있다 — t2v/app.js 의 같은 주석 참고 */
      const segmented = model==="seedance25" && sdMulti();
      return sdPrompt({
        hasUserInput:!!motion,
        head: "Animate the reference image as the first frame."+(motion ? " "+dot(cap(motion)) : ""),
        framing: listText(items("shot")),
        camera: listText(cameraMove),
        motion: listText(motionAmount),
        continuity: listText(continuity),
        style: listText(rendering),
        keep: model==="seedance25"
          ? preserve+(segmented
              ? " Keep continuity across all segments; do not introduce new people, objects or locations unless explicitly requested."
              : " Do not introduce new people, objects or locations unless explicitly requested.")
            +(outputLength==="detail" ? " Keep the motion physically plausible and transitions coherent." : "")
          : preserve+" One continuous shot, no new people, objects or scene changes."
            +(outputLength==="detail" ? " Keep the motion subtle and physically plausible throughout." : ""),
      });
    }
    if(!motion) return "";        // 다른 모델은 움직임 설명이 없으면 프롬프트를 만들지 않는다
    if(model==="generic"){
      const parts=["animate this image", motion];
      ["move","shot","tech"].forEach(id=>items(id).forEach(it=>parts.push(itemText(it))));
      return parts.filter(Boolean).join(", ");
    }
    if(model==="veo"){
      return [
        "Animate the reference image.",
        plain("Motion", motion),
        block("Camera motion", cameraMove),
        /* 예전에는 이 셋이 전부 'Camera motion' 아래에 있었다. 그래서
           "Camera motion: slow dolly push-in, subtle minimal motion, almost still" —
           카메라가 다가가면서 거의 정지해 있으라는 모순으로 읽혔다. */
        block("Motion amount", motionAmount),
        block("Continuity", continuity),
        block("Keep the framing", items("shot")),
        block("Motion rendering", rendering),
        outputLength==="detail"
          ? "Keep the motion physically plausible and continuous from the first frame." : "",
      ].filter(Boolean).join(" ");
    }
    return "";
  },
};
