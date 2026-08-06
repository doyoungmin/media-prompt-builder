/* 3개 앱 공통 엔진 — legacy.js 3벌에서 완전히 동일했던 문(statement)만 모은 것.
   /*==SLOT:n==* / 위치에 앱별 코드(apps/<app>/app.js)가 빌드 시 삽입된다.
   scripts/split-engine.mjs 가 생성. 수정은 이 파일에 직접 해도 된다(재생성 시 주의). */

/* ── 데이터: [한국어명, 영어 프롬프트, 특성 설명, 추천여부] ── */
const R=1;
const ALL_DATA = [
{id:"body", title:"카메라 바디", note:"질감과 화질의 기반 · 1대만 선택됩니다", groups:[  {label:"디지털", xg:"cam", items:[
    ["Canon EOS R5","shot on Canon EOS R5","선명하고 따뜻한 인물 색감",R],
    ["Sony A7R V","shot on Sony A7R V","고해상 정밀, 중립적이고 차가운 색",R],
    ["Nikon Z9","shot on Nikon Z9","스포츠·액션, 강한 대비"],
    ["Fujifilm GFX 100S","shot on Fujifilm GFX 100S, medium format digital","중형 디지털의 깊은 계조"],
    ["Phase One XF","shot on Phase One XF IQ4","광고·제품용 최고 해상도"],
    ["iPhone 15 Pro","shot on iPhone 15 Pro","SNS·브이로그 룩, 현실적인 스냅",R],
  ]},
  {label:"시네마 · 특수", xg:"cam", items:[
    ["ARRI Alexa 35","shot on ARRI Alexa 35","현대 영화 표준, 부드러운 하이라이트 롤오프",R],
    ["ARRI Alexa LF","shot on ARRI Alexa LF","대형 센서 시네마, 넓고 얕은 심도"],
    ["RED V-Raptor","shot on RED V-Raptor 8K","초고해상 디지털 시네마, 선명한 디테일",R],
    ["Sony Venice 2","shot on Sony Venice 2","넓은 다이내믹 레인지, 자연스러운 피부톤"],
    ["Panavision DXL2","shot on Panavision Millennium DXL2","블록버스터 스케일, 아나모픽 궁합"],
    ["35mm 시네필름","shot on 35mm motion picture film","고전 영화 질감, 자연스러운 그레인",R],
    ["16mm 필름","shot on 16mm film, Bolex","거친 그레인, 인디·다큐 감성",R],
    ["Super 8","shot on Super 8mm film","홈비디오 노스탤지어, 심한 그레인과 흔들림"],
    ["VHS 캠코더","shot on VHS camcorder","저해상 스캔라인, 90년대 아날로그"],
    ["폴라로이드","shot on Polaroid SX-70","즉석 사진 프레임, 색 바랜 파스텔"],
    ["GoPro","shot on GoPro Hero, action cam","초광각 왜곡, 몰입형 액션"],
    ["드론 (DJI)","aerial shot on DJI drone","항공 시점, 광활한 스케일",R],
  ]},
  {label:"35mm 필름", xg:"cam", items:[
    ["Leica M6","shot on Leica M6","클래식 다큐·거리사진, 자연스러운 계조",R],
    ["Canon AE-1","shot on Canon AE-1","70~80년대 스냅 감성, 따뜻한 톤",R],
    ["Nikon F3","shot on Nikon F3","단단한 보도사진 룩, 중립적 색"],
    ["Contax T2","shot on Contax T2","90년대 감성 컴팩트, 부드러운 하이라이트"],
    ["일회용 카메라","shot on a disposable film camera","거친 그레인, 플래시 스냅 느낌"],
  ]},
  {label:"중형 · 대형 필름", xg:"cam", items:[
    ["Hasselblad 500C/M","shot on Hasselblad 500C/M, 6x6 medium format","정방형 프레임, 극도로 부드러운 디테일",R],
    ["Pentax 67","shot on Pentax 67, 6x7 medium format","중형 특유의 얕은 심도, 인물 명작 룩",R],
    ["Mamiya RZ67","shot on Mamiya RZ67","패션·에디토리얼 표준, 입체감 있는 피부톤"],
    ["Rolleiflex TLR","shot on Rolleiflex TLR","빈티지 정방형, 로우앵글 시점"],
    ["Linhof 4x5","shot on Linhof 4x5 large format","초고해상 정밀 묘사, 정적인 건축·풍경"],
    ["8x10 대형","shot on 8x10 large format film","극한의 디테일과 얕은 심도, 초상 사진"],
  ]},

]},

{id:"lens", title:"렌즈 · 조리개", note:"렌즈 1개 + 조리개 1개", groups:[
  {label:"광각", xg:"focal", items:[
    ["8mm 어안","8mm fisheye lens","극단적 원형 왜곡, 실험적"],
    ["14mm 초광각","14mm ultra-wide lens","웅장한 공간감, 가장자리 왜곡"],
    ["24mm 광각","24mm wide-angle lens","환경 포함 인물, 역동적 원근",R],
    ["35mm 준광각","35mm lens","다큐멘터리 표준, 자연스러운 현장감",R],
  ]},
  {label:"표준 · 망원", xg:"focal", items:[
    ["50mm 표준","50mm lens","사람 눈과 유사한 화각, 정직한 묘사",R],
    ["85mm 인물","85mm portrait lens","가장 아름다운 인물 비례, 배경 분리",R],
    ["135mm 망원","135mm telephoto lens","강한 배경 압축, 고립된 피사체",R],
    ["200mm 망원","200mm telephoto lens","극한 압축, 스포츠·야생"],
    ["600mm 초망원","600mm super telephoto lens","야생 다큐, 배경이 완전히 뭉개짐"],
    ["100mm 매크로","100mm macro lens","초근접 접사, 미세 디테일",R],
  ]},
  {label:"특수 · 캐릭터 렌즈", xg:"focal", items:[
    ["아나모픽","anamorphic lens, oval bokeh, horizontal blue lens flare","시네마스코프 룩, 가로 플레어와 타원 보케",R],
    ["Cooke S4","Cooke S4 prime lens, Cooke Look","부드럽고 따뜻한 피부 표현"],
    ["Zeiss Master Prime","Zeiss Master Prime lens","극도로 선명하고 중립적인 묘사"],
    ["Canon K35 빈티지","vintage Canon K35 lens","70년대 소프트 플레어, 따뜻한 빛번짐"],
    ["Helios 44-2","Helios 44-2 lens, swirly bokeh","소용돌이 보케, 몽환적 배경"],
    ["Petzval","Petzval lens","강한 주변부 소용돌이, 19세기 초상 룩"],
    ["틸트시프트","tilt-shift lens","미니어처 효과 또는 건축 수직 보정",R],
    ["스플릿 다이옵터","split diopter lens","전경과 후경 동시 초점, 긴장감"],
    ["프로브 렌즈","Laowa probe lens, macro probe","곤충 시점 관통 샷, 초근접 이동"],
    ["소프트 포커스","soft focus lens, dreamy diffusion","드리미한 확산, 로맨틱 무드"],
  ]},
  {label:"조리개", xg:"ap", sub:"숫자가 작을수록 배경이 흐려집니다", items:[
    ["f/1.2 (극얕음)","shot at f/1.2, razor-thin depth of field","눈만 초점, 배경 완전 소멸"],
    ["f/1.8 (얕음)","shot at f/1.8, shallow depth of field","인물 표준, 부드러운 보케",R],
    ["f/2.8 (중간)","shot at f/2.8","피사체 분리 + 어느 정도 배경 정보",R],
    ["f/5.6 (선명)","shot at f/5.6","렌즈 최상 성능, 균형잡힌 심도"],
    ["f/8 (깊음)","shot at f/8, deep focus","전체적으로 선명, 풍경·건축",R],
    ["f/16 (전초점)","shot at f/16, everything in focus, sunstars","전체 초점, 광원의 별빛 효과"],
  ]},
]},

{id:"light", title:"조명", note:"분위기의 90%를 결정", single:false, groups:[  {label:"자연광", items:[
    ["골든아워","golden hour sunlight, warm low sun","따뜻한 황금빛 사광, 긴 그림자",R],
    ["블루아워","blue hour, cool twilight ambience","차갑고 서정적인 박명",R],
    ["정오 하드광","harsh midday sun, hard shadows","선명한 그림자, 강렬하고 건조한 인상"],
    ["흐린날 소프트","overcast soft diffused light","그림자 없는 균일한 빛, 부드러움",R],
    ["창가 사이드라이트","window sidelight, soft directional","페르메이르 회화풍 측면광",R],
    ["문라이트","moonlight, cool blue night ambience","푸른 야간, 미스터리"],
    ["갓레이","volumetric god rays, light shafts through haze","안개 속 광선 다발, 신비로움"],
  ]},
  {label:"무드 · 인공광", items:[
    ["로우키","low-key lighting, chiaroscuro, deep shadows","어둠이 지배, 누아르·서스펜스",R],
    ["하이키","high-key lighting, bright airy, minimal shadows","밝고 청량, 광고·패션",R],
    ["네온 실전등","neon practical lights, magenta and cyan glow","사이버펑크 도시 야경",R],
    ["촛불","candlelight, warm flickering firelight","아주 따뜻하고 친밀한 저조도",R],
    ["고보 그림자","gobo shadows, venetian blind patterns","블라인드 줄무늬 그림자, 누아르"],
    ["텅스텐 실내등","tungsten practical lamps, warm interior","생활감 있는 실내 전구 빛"],
    ["형광등","cold fluorescent overhead light","무미건조한 사무실·병원"],
  ]},
  {label:"인물 키 라이트", xg:"key", sub:"주광은 하나만 — 빛의 위치를 정합니다", items:[
    ["렘브란트","Rembrandt lighting, triangle of light on cheek","볼에 삼각형 빛, 고전 회화적 깊이",R],
    ["버터플라이","butterfly lighting, beauty light","코 아래 나비 그림자, 뷰티·글래머"],
    ["스플릿","split lighting, half face in shadow","얼굴 절반 어둠, 극적 긴장"],
    ["언더라이팅","underlighting from below","공포·불안한 인상"],
    ["링라이트","ring light, catchlight in eyes","눈동자 링 반사, 뷰티 유튜브 룩"],
  ]},
  {label:"역광 · 보조광", sub:"키 라이트와 함께 쓸 수 있습니다", items:[
    ["림 라이트","rim lighting, backlit edge glow","윤곽선 발광, 피사체 분리",R],
    ["백라이트 실루엣","strong backlight, silhouette","완전한 실루엣 — 앞쪽 주광 없음",R],
  ]},
  {label:"조명 기구", xg:"mod", sub:"같은 위치라도 기구에 따라 결과가 달라집니다", items:[
    ["스튜디오 소프트박스","studio softbox lighting, controlled even light","깨끗한 상업 촬영 조명",R],
    ["뷰티 디쉬","beauty dish, crisp yet flattering light with fast falloff","선명하면서 피부가 예쁜 뷰티 표준"],
    ["엄브렐라","umbrella light, broad soft wraparound","넓게 감싸는 저렴하고 부드러운 광원"],
    ["스트립박스 + 그리드","gridded strip box, narrow controlled band of light","좁고 통제된 띠 형태의 빛"],
    ["스누트","snoot, tight focused pool of light","점처럼 좁게 떨어지는 스포트"],
    ["대형 디퓨전 스크림","large diffusion scrim, very soft wraparound light","창광 같은 초연질광"],
  ]},
  {label:"광질", xg:"quality", sub:"그림자 경계가 날카로운가 부드러운가", items:[
    ["경질광 (하드)","hard direct light, crisp well-defined shadow edges","윤곽이 뚜렷한 그림자, 강렬함"],
    ["연질광 (소프트)","soft diffused light, gradual shadow transition","경계가 녹아드는 그림자, 부드러움"],
  ]},
  {label:"명암비", xg:"ratio", sub:"밝은 쪽과 그림자의 밝기 차이 — 하나만", items:[
    ["강한 명암비 8:1","high key-to-fill ratio, shadows falling to deep black","그림자가 완전히 죽는 극적 대비"],
    ["중간 명암비 4:1","moderate lighting ratio, shadows retain some detail","그림자에 디테일이 남는 표준 인물 조명",R],
    ["평탄한 조명 2:1","low lighting ratio, soft even fill, minimal shadow","거의 그림자 없는 균일한 조명"],
  ]},
  {label:"필 · 반사", sub:"그림자 쪽을 어떻게 다룰지", items:[
    ["리플렉터 필","white reflector filling the shadow side","반사판으로 그림자를 살림"],
    ["네거티브 필","black negative fill on the shadow side, deepening the shadow edge","검은 판으로 그림자를 더 눌러 입체감을 만듦"],
  ]},

]},

{id:"film", title:"필름 스톡 · 색감", note:"필름 1종 + 그레이딩 1종", groups:[  {label:"컬러 필름", xg:"stock", sub:"필름은 한 종류만 — 촬영에 쓴 매체입니다", items:[
    ["Kodak Portra 400","Kodak Portra 400 film stock","가장 아름다운 피부톤, 부드러운 파스텔",R],
    ["Kodak Ektar 100","Kodak Ektar 100 film stock","고채도 선명한 색, 풍경용",R],
    ["Kodachrome","Kodachrome film stock","60~70년대 내셔널지오그래픽 룩, 진한 레드",R],
    ["Fuji Velvia 50","Fujifilm Velvia 50 slide film","강렬한 채도의 녹색·청색, 풍경"],
    ["Fuji Pro 400H","Fujifilm Pro 400H film stock","연한 민트·파스텔, 웨딩 감성"],
    ["CineStill 800T","CineStill 800T film stock, red halation","야간 네온, 붉은 할레이션 번짐",R],
    ["Kodak Vision3 500T","Kodak Vision3 500T","현대 영화용 텅스텐 필름, 저조도",R],
  ]},
  {label:"흑백 필름", xg:"stock", sub:"컬러 필름과 배타 — 하나만", items:[
    ["Ilford HP5","Ilford HP5 Plus black and white film","클래식 다큐 흑백, 부드러운 그레인",R],
    ["Kodak Tri-X 400","Kodak Tri-X 400 black and white","거친 그레인, 보도사진의 상징",R],
    ["Ilford Delta 3200","Ilford Delta 3200, heavy grain","극한 저조도, 매우 거친 질감"],
    ["고대비 흑백","high contrast black and white, deep blacks","강렬한 명암 대비, 그래픽적"],
  ]},
  {label:"흑백 필터", xg:"bwfilter", sub:"흑백 촬영용 — 컬러와 함께 쓰지 않습니다", items:[
    ["적색 필터","red filter, dramatically darkened sky, lightened warm tones","하늘이 거의 검게, 따뜻한 계열은 밝게"],
    ["황색 필터","yellow filter, slightly darkened sky, natural tonality","자연스러운 계조 보정"],
  ]},
  {label:"컬러 그레이딩", xg:"grade", sub:"후반 보정 — 하나만 선택됩니다", items:[
    ["틸 & 오렌지","teal and orange color grading","할리우드 블록버스터 표준",R],
    ["블리치 바이패스","bleach bypass, desaturated high contrast","탈색된 거친 톤, 전쟁·스릴러"],
    ["Technicolor","Technicolor three-strip process","1950년대 뮤지컬의 화려한 원색"],
    ["디새추레이션","desaturated muted color palette","감정 절제, 차분하고 현실적",R],
    ["파스텔","soft pastel color palette","동화적이고 부드러운 무드",R],
    ["세피아","sepia tone, aged photograph","오래된 사진, 과거 회상"],
    ["크로스 프로세스","cross-processed film, shifted colors","비틀린 색, 실험적 90년대"],
    ["어스 톤","earthy natural tones, warm browns and greens","자연주의, 서부극·시골"],
    ["네온 사이버펑크","cyberpunk neon palette, magenta and electric blue","형광 마젠타·블루, 미래 도시",R],
    ["웜 그레이드","warm color grade, amber highlights","전체를 따뜻하게 밀어올림"],
    ["쿨 그레이드","cool color grade, blue-shifted shadows","전체를 차갑게 내림"],
    ["스플릿 토닝","split toning, warm highlights and cool shadows","하이라이트는 따뜻, 그림자는 차갑게"],
  ]},

]},

{id:"shot", title:"샷 타입 · 앵글", note:"프레이밍과 시점", single:false, groups:[  {label:"샷 사이즈", xg:"size", sub:"1개만 선택됩니다", items:[
    ["익스트림 와이드","extreme wide shot, establishing shot","인물이 점처럼, 환경 압도",R],
    ["와이드 / 풀샷","wide shot, the entire subject visible within the frame","피사체 전체와 배경을 함께",R],
    ["미디엄 샷","medium shot, the subject occupying the middle of the frame","대화 장면 표준 · 인물은 허리 위",R],
    ["미디엄 클로즈업","medium close-up, tight framing on the upper part of the subject","인터뷰 표준 · 인물은 가슴 위"],
    ["클로즈업","close-up shot, the subject fills most of the frame","피사체가 화면을 채움 · 감정 전달의 핵심",R],
    ["익스트림 클로즈업","extreme close-up, frame-filling subject detail","피사체 일부를 화면 가득 정밀하게 강조",R],
  ]},
  {label:"앵글 · 시점", xg:"angle", items:[
    ["아이 레벨","eye level angle","중립적이고 자연스러운 시선",R],
    ["로우 앵글","low angle shot, looking up","피사체를 강하고 위압적으로",R],
    ["하이 앵글","high angle shot, looking down","피사체를 작고 취약하게",R],
    ["더치 앵글","dutch angle, tilted horizon","불안정과 혼란"],
    ["버즈 아이","bird's eye view, top-down overhead","기하학적 패턴, 신의 시점"],
    ["웜즈 아이","worm's eye view, from ground level","극단적 아래 시점, 초현실"],
    ["POV","POV shot, first person perspective","1인칭 몰입"],
  ]},
  {label:"인물 관계 프레이밍", sub:"두 인물의 관계를 보여주는 프레이밍", items:[
    ["오버 더 숄더","over-the-shoulder shot","대화의 시점 연결"],
    ["투 샷","two shot, two subjects in frame","관계성 표현"],
  ]},
  {label:"구도 원칙", sub:"여러 개 조합 가능", items:[
    ["삼분할 구도","rule of thirds composition, subject offset from center","중심을 비껴 배치, 가장 기본적인 안정 구도",R],
    ["리딩 라인","strong leading lines drawing the eye toward the subject","선이 시선을 피사체로 끌고 감"],
    ["네거티브 스페이스","generous negative space around the subject, minimalist composition","여백을 크게 — 고요함과 고립"],
    ["프레임 인 프레임","framed through a doorway or window, frame within a frame","문·창을 통해 들여다보는 이중 프레임"],
    ["전경 요소","out-of-focus foreground element framing the edge of the frame","흐린 전경으로 깊이를 만듦"],
    ["대각 구도","strong diagonal composition creating movement","대각선으로 역동감 부여"],
    ["반사 활용","subject mirrored in a reflective surface","물·유리에 비친 상을 함께 담음"],
    ["소실점 원근","one-point perspective with a strong vanishing point","한 점으로 모이는 강한 원근"],
    ["대칭 구도","perfectly symmetrical composition, centered","웨스 앤더슨 룩, 강한 형식미",R],
  ]},
  {label:"얼굴 방향", xg:"face", sub:"인물 촬영 — 하나만", items:[
    ["정면","facing the camera straight on","대칭적이고 직접적"],
    ["3/4 각도","three-quarter view of the face","가장 입체적인 표준 인물 각도",R],
    ["옆모습","profile view, side of the face","선을 강조, 서사적 거리감"],
    ["뒷모습","seen from behind, facing away from the camera","익명성과 여백"],
  ]},
  {label:"시선", xg:"gaze", items:[
    ["카메라 응시","looking directly into the lens, direct eye contact","관객과 직접 대면",R],
    ["시선 이탈","looking away from the camera, off-camera gaze","사색적·관찰적 분위기"],
  ]},

]},

{id:"move", title:"카메라 무빙", note:"동영상용 · 무빙 1개 + 시간 표현 1개", groups:[
  {label:"기본 무빙", xg:"move", items:[
    ["고정 (트라이포드)","static tripod shot, locked-off camera","완전히 정적, 관조적",R],
    ["슬로우 푸시인","slow dolly push-in","서서히 다가감, 긴장 고조",R],
    ["풀 아웃","slow dolly pull-out, reveal","물러나며 상황 노출"],
    ["트래킹 샷","tracking shot, camera follows subject","피사체와 함께 이동",R],
    ["팬","smooth pan across the scene","좌우 회전, 공간 스캔"],
    ["틸트","slow tilt up","상하 회전, 규모 드러냄"],
    ["핸드헬드","handheld camera, subtle shake","현장감·긴박감",R],
    ["스테디캠 롱테이크","steadicam long take, fluid continuous move","끊김 없는 유려한 이동"],
  ]},
  {label:"고급 · 특수 무빙", xg:"move", items:[
    ["돌리 줌","dolly zoom, vertigo effect","배경만 왜곡, 심리적 충격",R],
    ["집 크레인","crane shot, rising jib move","위로 솟구치며 스케일 확장"],
    ["짐벌 오빗","gimbal orbit around subject, 360 arc","피사체 주위 원형 회전",R],
    ["휩 팬","whip pan transition","초고속 팬, 장면 전환"],
    ["크래시 줌","crash zoom in","급격한 줌, 강조와 코믹"],
    ["FPV 드론","FPV drone fly-through, fast continuous motion","공간을 관통하는 고속 비행"],
    ["항공 상승","aerial drone rising shot","공중으로 올라가며 전경 노출",R],
    ["원형 랩어라운드","camera slowly wraps around the subject","극적 강조를 위한 감싸기"],
  ]},
  {label:"포커스 연출", sub:"무빙과 조합 가능", items:[
    ["랙 포커스","rack focus between foreground and background","초점 이동으로 시선 유도"],
  ]},
  {label:"시간 표현", xg:"time", items:[
    ["슬로우 모션","slow motion, 120fps overcranked","고속 촬영, 우아한 느림",R],
    ["초고속","ultra slow motion, 1000fps phantom","물방울·파열의 순간 포착"],
    ["타임랩스","time-lapse","시간 압축, 구름·인파 흐름",R],
    ["하이퍼랩스","hyperlapse, moving time-lapse","이동하며 시간 압축"],
    ["실시간 롱테이크","real-time continuous long take","컷 없는 몰입"],
  ]},
  {label:"움직임의 크기", xg:"amount", sub:"모델이 얼마나 크게 움직일지", items:[
    ["미세한 움직임","subtle minimal motion, almost still","숨결·머리카락 정도만 흔들림",R],
    ["보통 움직임","moderate natural motion","자연스러운 일상적 움직임",R],
    ["역동적 움직임","dynamic energetic motion, dramatic movement","크고 빠른 동작",R],
  ]},
  {label:"장면 제어", sub:"영상 모델의 폭주를 막는 지시문", items:[
    ["한 장면 유지","one single continuous take, the scene stays the same throughout","장면이 바뀌지 않고 하나의 컷으로 이어집니다",R],
    ["24fps 시네마틱","24fps cinematic frame rate","영화 특유의 잔상감",R],
    ["60fps 부드럽게","60fps smooth motion","매끄럽고 선명한 움직임"],
    ["끊김 없는 루프","seamless loop, the first and last frame match","처음과 끝이 이어지는 반복 영상"],
    ["피사체 정지","the subject stays still while the environment moves","인물은 그대로, 배경만 살아 움직임"],
    ["카메라 고정 유지","locked camera, the camera remains still","카메라가 움직이지 않고 고정됩니다"],
  ]},
]},

{id:"tech", title:"기술 디테일", note:"마감 품질을 올리는 요소", single:false, groups:[  {label:"심도 · 셔터", items:[
    ["얕은 심도 보케","shallow depth of field, creamy bokeh","배경을 크림처럼 뭉갬",R],
    ["딥 포커스","deep focus, everything sharp","전경부터 원경까지 선명",R],
    ["프리즈 (1/2000s)","1/2000s shutter speed, frozen motion","움직임 완전 정지"],
    ["모션 블러 (1/15s)","1/15s shutter speed, motion blur","흐름과 속도감",R],
    ["장노출","long exposure, light trails","빛 궤적, 물의 실크 표현"],
    ["180도 셔터","180-degree shutter rule, natural motion blur","영화적으로 자연스러운 잔상"],
  ]},
  {label:"초점 지점", xg:"fp", sub:"심도의 '깊이'가 아니라 '어디에' 맞추는지", items:[
    ["눈에 초점","critical focus on the eyes","인물 사진의 기본 — 눈이 가장 선명",R],
    ["전경 초점","focus on the foreground element, subject soft behind","앞을 살리고 피사체를 흐리게"],
    ["의도적 초점 이탈","subject slightly out of focus, intentional soft focus miss","일부러 빗나간 초점, 몽롱한 감성"],
  ]},
  {label:"노출", xg:"expo", sub:"조리개·셔터·ISO의 결과", items:[
    ["1스톱 오버","deliberately overexposed by one stop, bright airy exposure","밝고 통풍감 있는 감성 노출"],
    ["정확 노출","accurate balanced exposure","기준대로 맞춘 노출"],
    ["1스톱 언더","deliberately underexposed by one stop, moody dark exposure","어둡고 무거운 분위기"],
  ]},
  {label:"감도 · 화이트밸런스", items:[
    ["ISO 100 클린","ISO 100, clean noise-free image","노이즈 없는 최상 화질",R],
    ["ISO 3200 그레인","ISO 3200, visible grain","거친 저조도 질감",R],
    ["텅스텐 WB","tungsten white balance, cool blue shift","푸른 야간 톤"],
    ["데이라이트 WB","daylight white balance","자연스러운 주광 색"],
    ["믹스드 라이팅","mixed color temperature lighting","따뜻함과 차가움의 공존"],
  ]},
  {label:"광학 필터", sub:"촬영 시 렌즈 앞에 끼우는 필터", items:[
    ["폴라라이저","polarizing filter, deep saturated sky and removed reflections","하늘이 진해지고 반사가 사라짐"],
    ["ND 필터","neutral density filter allowing a wide aperture in bright light","밝은 낮에도 조리개를 열 수 있게"],
    ["그라데이션 ND","graduated neutral density filter, sky balanced with the foreground","하늘만 눌러 노출 균형"],
  ]},
  {label:"톤 · 대비", sub:"대비 1개 + 섀도 처리 1개 조합 가능", items:[
    ["저대비 플랫","low contrast flat tonal profile","계조가 완만한 시네마 플랫 룩"],
    ["고대비 톤","high contrast tonality, deep blacks and bright highlights","강렬한 명암 대비"],
    ["블랙 크러시","crushed blacks, shadows falling to pure black","그림자를 완전히 눌러 검게"],
    ["리프티드 블랙","lifted blacks, milky shadows","검정이 들려 올라간 필름 베이스 느낌"],
    ["하이라이트 롤오프","gentle highlight rolloff, highlights retained smoothly into the white point","밝은 부분이 부드럽게 넘어감"],
  ]},
  {label:"렌즈 아티팩트", items:[
    ["렌즈 플레어","lens flare streaking across the frame","가로로 뻗는 시네마틱 빛줄기",R],
    ["할레이션","halation, red glow around highlights","하이라이트 주변 붉은 번짐"],
    ["비네팅","subtle vignetting","가장자리 어둡게, 시선 집중",R],
    ["필름 그레인","natural film grain","아날로그 질감",R],
    ["크로마틱 애버레이션","slight chromatic aberration","경계의 색수차, 빈티지"],
    ["블룸","soft highlight bloom","빛이 번지는 몽환적 효과"],
    ["렌즈 디퓨전","Black Pro-Mist diffusion filter","하이라이트를 부드럽게, 영화적"],
  ]},
  {label:"해상도 · 다이내믹 레인지", items:[
    ["8K 고해상","8K resolution, ultra detailed","극한 디테일 요구"],
    ["HDR","HDR, high dynamic range","밝은 곳과 어두운 곳 모두 살림"],
  ]},

]},
];
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
/* 회전 화살표 — 호 + 끝의 갈매기. 팬·틸트가 '이동'이 아니라 '제자리 회전'임을 말한다 */
const turn = (d,hx,hy,h1x,h1y,h2x,h2y) =>
  `<path d="${d}" stroke="${PV_C}" stroke-width="2" fill="none"/>`+
  `<path d="M${h1x} ${h1y} L${hx} ${hy} L${h2x} ${h2y}" fill="none" stroke="${PV_C}"`+
  ` stroke-width="2" stroke-linejoin="miter"/>`;

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
                    turn("M14 14 A24 24 0 0 1 50 14", 50.5,14, 47,10.5, 46.5,17)+frame),
  /* 옆에서 본 그림 — 같은 자리에서 시야만 위아래로 도는 것 */
  "틸트":           svg(tripod(14,28)+
                    `<path d="M17 26 L56 26 M17 26 L52 8" stroke="${PV_A}" stroke-width="1" stroke-dasharray="2 2"/>`+
                    turn("M40 24 A26 26 0 0 0 46 12", 46.5,11.5, 42.5,14.5, 48,16)+frame),
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
  "끊김 없는 루프": svg(fig(32,18,4.5,9)+
                turn("M43 20 A11 11 0 1 1 38.2 10.9", 38.6,10.4, 34.4,13.6, 41,15)+frame),
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

/* ── 렌더링 ── */
/* 제목은 '앱 이름 + 갈래(<em>)' 로 되어 있다. 예: 영상 프롬프트 빌더 + · 텍스트에서 생성.
   한 덩어리 글자로 눌러 놓으면 좁은 화면에서 아무 데서나 접혀 "생성" 같은 조각만
   다음 줄로 떨어진다. 둘을 나눠 두고, 이름은 절대 접지 않는다. */
function splitTitle(html){
  const box=document.createElement("div");
  box.innerHTML=html;
  const em=box.querySelector("em");
  const note=em ? em.textContent.replace(/\s+/g," ").trim() : "";
  if(em) em.remove();
  return {name:box.textContent.replace(/\s+/g," ").trim(), note};
}
/* ── 세 빌더의 정체성 ──
   예전에는 주소에서 파일명을 읽어(`location.pathname`) 자기가 어느 빌더인지 알아냈다.
   Cloudflare Pages 는 `/x.html` 을 `/x` 로 정규화하고 루트는 `/` 라서, 어떤 키에도
   맞지 않아 아이콘·메뉴·저장소가 전부 어긋났다.
   그래서 빌드할 때 <html data-app="..."> 로 심고 그것만 본다. 주소가 어떻게 바뀌든
   흔들리지 않는다. 짧은 이름·아이콘·설명도 여기 한 줄에 모아 둔다(예전엔 맵 네 개였다). */
const APPS=[
  {id:"image", file:"/image/", icon:"i-image",
   short:"이미지",                note:"정지 이미지"},
  {id:"t2v",   file:"/t2v/", icon:"i-t2v",
   short:"영상 · 텍스트에서 생성", note:"텍스트에서 영상"},
  {id:"i2v",   file:"/i2v/", icon:"i-i2v",
   short:"영상 · 이미지에 모션",   note:"이미지에 모션"},
];
const APP_ID=document.documentElement.dataset.app||"image";
const THIS_APP=APPS.find(a=>a.id===APP_ID)||APPS[0];
{
  const t=splitTitle(CONFIG.title);
  const nameEl=document.getElementById("appTitleText");
  nameEl.textContent=t.name;
  if(t.note){
    // 이름과 갈래를 한 묶음으로 싼다 — 캐럿이 갈래를 따라 내려가지 않게 묶음 밖에 남긴다
    const grp=document.createElement("span"); grp.id="appTitleGroup";
    nameEl.replaceWith(grp);
    const note=document.createElement("span"); note.id="appTitleNote"; note.textContent=t.note;
    grp.append(nameEl, document.createTextNode(" "), note);
  }
}
document.getElementById("brandUse").setAttribute("href","#"+THIS_APP.icon);
/* 앱 설명(CONFIG.sub)은 화면에서 뺐다 — 제목과 아이콘이 이미 같은 말을 한다.
   검색·공유용 <meta description> 은 엔트리 HTML 에 그대로 남아 있다. */
document.getElementById("subject").placeholder=CONFIG.subjectPlaceholder;
document.getElementById("subject").setAttribute("aria-label",CONFIG.subjectLabel);
const subjectFieldLabel=document.getElementById("subjectFieldLabel");
// 아이콘을 지우지 않도록 글자만 담는 자리에 넣는다
document.getElementById("subjectFieldText").textContent=CONFIG.shortLabel||CONFIG.subjectLabel;
if(CONFIG.subjectRequired){
  const req=document.createElement("em"); req.textContent="필수";
  subjectFieldLabel.appendChild(req);
}
/* 프롬프트 상자의 기본 안내 문구 — 막혔을 때는 이유를 대신 보여준다 */
const PROMPT_HINT=document.getElementById("prompt").placeholder;
document.getElementById("modelSwitch").innerHTML=CONFIG.models.map((m,i)=>
  `<button${i===0?' class="on"':''} data-model="${m.key}" aria-pressed="${i===0}"
     title="${m.label}">${m.shortLabel||m.label}</button>`).join("");
document.getElementById("guideTabSub").textContent=`${WIZ.length}가지만 답하면 자동 완성`;
const LOOK=CONFIG.look||{};
document.getElementById("lookTabName").textContent=LOOK.tab||"레퍼런스 룩";
document.getElementById("lookTabSub").textContent=LOOK.tabSub||"유명 스타일 한 번에";
/* 탭이 헤더 한 줄로 들어가면서 보조 설명을 화면에 펼칠 자리가 없어졌다.
   글자를 지우지는 않고(스크린리더는 읽는다) 마우스 설명으로 옮긴다. */
document.querySelectorAll(".modetab").forEach(tab=>{
  const sub=tab.querySelector("small");
  const name=tab.querySelector(".modetab-tx").firstChild.textContent.trim()
    || tab.querySelector(".modetab-tx").textContent.trim();
  tab.title = sub && sub.textContent.trim() ? `${name} — ${sub.textContent.trim()}` : name;
});
document.getElementById("lookHeading").textContent=LOOK.heading||"대표 스타일을 고르세요";
document.getElementById("lookNote").textContent=LOOK.note
  ||"카드 이미지는 각 프리셋으로 실제 생성한 예시입니다. 마우스를 올리면 구성 항목이 보입니다.";
/* 빌더 전환 — 제목을 누르면 세 빌더가 펼쳐진다.
   제목과 전환 대상이 같은 것을 가리키므로 컨트롤을 따로 두지 않는다.
   항상 세 개이고, 그중 하나가 현재 앱이다(주소가 아니라 data-app 으로 가른다). */
const builderBtn=document.getElementById("builderBtn");
const builderMenu=document.getElementById("builderMenu");
builderMenu.innerHTML=APPS.map(a=>{
  const inner=`<svg class="ic" aria-hidden="true"><use href="#${a.icon}"/></svg>`
    +`<span class="bm-name">${a.short}</span><span class="bm-note">${a.note}</span>`;
  return a.id===APP_ID
    ? `<span class="bm-item on" role="menuitem" aria-current="page">${inner}</span>`
    : `<a class="bm-item" role="menuitem" href="${a.file}">${inner}</a>`;
}).join("");

function setBuilderOpen(open){
  builderMenu.classList.toggle("open",open);
  builderBtn.setAttribute("aria-expanded",open);
}
document.addEventListener("keydown",e=>{
  if(e.key==="Escape" && builderMenu.classList.contains("open")){
    setBuilderOpen(false); builderBtn.focus();
  }
});

const secWrap=document.getElementById("sections");
DATA.forEach((sec,i)=>{
  const el=document.createElement("section");
  el.id="sec-"+sec.id;
  el.className = i<2 ? "open" : "";
  el.innerHTML=`
    <div class="sec-bar">
      <button class="sec-head" aria-expanded="${i<2}" aria-controls="body-${sec.id}">
        <span class="arrow">▶</span>
        <svg class="ic sec-ic" aria-hidden="true"><use href="#i-${sec.id}"/></svg>
        <span class="sec-title">${sec.title}<em>${sec.note}</em></span>
        <span class="muted-tag" id="m-${sec.id}" style="display:none">출력 제외</span>
        <span class="badge off" id="b-${sec.id}">0</span>
      </button>
      <button class="sec-scope on" data-scope="${sec.id}" id="s-${sec.id}" aria-pressed="true">
        <svg class="ic ic-on" aria-hidden="true"><use href="#i-eye"/></svg>
        <svg class="ic ic-off" aria-hidden="true"><use href="#i-eye-off"/></svg>
      </button>
    </div>
    <div class="sec-body" id="body-${sec.id}">
      <div class="scope-note" id="note-${sec.id}" style="display:none">
        이 항목은 현재 출력에 포함되지 않습니다.
        <button data-enable="${sec.id}">출력에 포함</button>
      </div>
      ${sec.groups.map(g=>{
        /* 그룹은 한 종류의 미리보기만 가진다(사진 그룹 / 도식 그룹 / 스와치 그룹).
           사진이 아닌 것 — 손으로 그린 도식, 단색 스와치 — 은 크게 볼 것이 없으므로
           변을 절반(면적 1/4)으로 줄인다. */
        const kinds=new Set(g.items.map(it=>pvKind(it[0])).filter(Boolean));
        const gridClass = kinds.size
          ? " pvgrid" + (kinds.has("photo") ? "" : " minigrid")
          : "";
        return `
        <div class="grp" data-grp="${sec.id}|${g.label}">
          <div class="grp-label">${g.label}${g.sub?`<u>${g.sub}</u>`:""}
            <i class="hidden-n" data-hn="${sec.id}|${g.label}"></i></div>
          <div class="chips${gridClass}">
            ${g.items.map(it=>`
              <button class="chip${pvOf(it[0])?" haspv":""}" data-sec="${sec.id}" data-kr="${it[0]}" aria-pressed="false"
                      data-rec="${it[3]?1:0}" data-find="${(it[0]+" "+it[1]+" "+it[2]).toLowerCase()}">
                ${pvOf(it[0])||""}
                <span class="txt"><span class="kr">${it[0]}</span>
                <span class="desc">${it[2]}</span></span>
              </button>`).join("")}
          </div>
        </div>`;}).join("")}
      <div class="empty" style="display:none">검색 결과가 없습니다.</div>
    </div>`;
  secWrap.appendChild(el);
});
document.getElementById("m-all").textContent=`전문가 ${Object.keys(lookup).length}개`;

/* 가이드 선택지의 미리보기 — 전용 예시 사진이 있으면 그것을,
   없으면 그 선택지가 적용하는 첫 항목의 SVG 도식·스와치를 재사용한다 */
function optPv(label, payload){
  if(typeof GUIDE_IMG!=="undefined" && GUIDE_IMG[label])
    return `<span class="pv ph"><img src="${GUIDE_IMG[label]}" alt="" loading="lazy"></span>`;
  for(const k of payload){ const p=pvOf(k); if(p) return p; }
  return "";
}
document.getElementById("wiz").innerHTML = WIZ.map((s,i)=>{
  const hasPv=Object.entries(s.opts).some(([o,p])=>optPv(o,p));
  return `
  <div class="wiz-step" data-step="${s.key}">
    <div class="wiz-q"><b>${"①②③④"[i]}</b>${s.q}</div>
    <div class="opts${hasPv?" pvgrid":""}">
      ${Object.entries(s.opts).map(([o,p])=>{
        const pv=optPv(o,p);
        return `<button class="opt${pv?" haspv":""}" data-wiz="${s.key}" data-opt="${o}" aria-pressed="false">`
          +pv+`<span class="txt"><span class="kr">${o}</span>`
          +((s.why&&s.why[o])?`<span class="desc">${s.why[o]}</span>`:"")
          +`</span></button>`;}).join("")}
    </div>
  </div>`;}).join("") +
  `<div class="wiz-note">답할수록 프롬프트가 자동으로 채워집니다. 답하지 않은 항목은 비워두셔도 됩니다.</div>`;

const presetWrap=document.getElementById("presets");
function presetPreview(name,payload){
  const img=(typeof PRESET_IMG!=="undefined" && PRESET_IMG[name]) || "";
  if(img) return `<img src="${img}" alt="${name} 예시" loading="lazy">`;
  const explicit=CONFIG.presetPv && CONFIG.presetPv[name];
  if(explicit){
    const p=pvOf(explicit);
    if(p) return p;
  }
  for(const item of payload){
    const p=pvOf(item);
    if(p) return p;
  }
  return "";
}
if(Object.keys(PRESETS).length===0){
  document.querySelector('[data-pane="look"]').style.display="none";
}else{
  Object.keys(PRESETS).forEach(name=>{
    const b=document.createElement("button");
    b.className="preset-card";
    const tip=PRESETS[name].join(" · ");
    const preview=presetPreview(name,PRESETS[name]);
    // title 을 두면 커스텀 툴팁과 브라우저 기본 툴팁이 같은 내용으로 겹쳐 뜬다
    b.dataset.preset=name;
    b.innerHTML=preview+`<span class="preset-name">${name}</span><small>${tip}</small>`;
    b.onclick=()=>{
      // 이미 선택된 프리셋을 다시 눌러도 의미 없는 undo 단계를 만들지 않는다.
      if(activePreset===name) return;
      pushHistory();
      replacedNotice=manualEdits && DATA.some(s=>state[s.id].size>0);
      activePreset=name;
      wizPick={}; syncWizUI(); syncPresetUI();
      lastApplied={label:name, items:PRESETS[name], why:""};
      manualEdits=false;
      applySelection(PRESETS[name]);
    };
    presetWrap.appendChild(b);
  });
}

/* 섹션 하나하나를 켜고 끄는 일은 섹션 헤더가 맡는다(조작 대상 옆).
   여기에는 여러 섹션을 한 번에 바꾸는 프리셋과, 출력 전체에 걸리는 텍스트 방지만 둔다. */
const SEC_SHORT=CONFIG.short;
document.getElementById("scope").innerHTML =
  // 제외 목록은 '출력 범위' 라벨 줄의 오른쪽 끝에 붙인다 (빠진 게 있다는 사실이 제목과 한 줄)
  `<span class="scope-lab">출력 범위<span class="scope-off" id="scopeOff"></span></span>` +
  /* 묶음은 한 번에 하나만 걸리므로 낱개 칩이 아니라 탭(세그먼트)으로 둔다.
     '텍스트 방지'는 성격이 다른 켬/끔이라 세그먼트 밖에 남긴다. */
  `<div class="seg scope-quick" role="group" aria-label="출력 범위 묶음">` +
  Object.keys(CONFIG.quick).map(k=>`<button data-quick="${k}">${k}</button>`).join("") +
  `</div>
   <button class="sc on" id="guardBtn" aria-pressed="true"
     title="프롬프트 끝에 텍스트·워터마크·카메라 UI가 화면에 그려지는 것을 막는 문구를 추가합니다"
     ><svg class="ic" aria-hidden="true"><use href="#i-no-text"/></svg>텍스트 방지</button>`;

/* ── 이벤트 ── */

/* 현재 선택 목록 — 기본은 개수만 보여주고, 개별 해제가 필요할 때 편다.
   왼쪽에 칩이 켜져 있고 섹션마다 개수 뱃지가 있어 상시 노출할 이유가 없다. */
const selSumBox=document.getElementById("selSumBox");
const selSumHead=document.getElementById("selSumHead");
function setSelSumOpen(open){
  selSumBox.classList.toggle("open",open);
  selSumHead.setAttribute("aria-expanded",open);
}

/* 모바일에서는 우측 결과 레일을 하단 축소 바로 바꾸고, 요청할 때만 전체 화면으로 연다. */
const MOBILE_QUERY=window.matchMedia ? window.matchMedia("(max-width: 1039px)") : {matches:false};
const outRail=document.getElementById("outRail");
const outPanel=document.getElementById("outPanel");
const mobileOutBar=document.getElementById("mobileOutBar");
const mobileOutHead=document.getElementById("mobileOutHead");
const workspace=document.querySelector(".wrap");
function setMobileOutOpen(open,focusTarget=""){
  const mobile=!!MOBILE_QUERY.matches;
  const next=mobile && !!open;
  outRail.classList.toggle("mobile-open",next);
  mobileOutBar.setAttribute("aria-expanded",next);
  document.body.classList.toggle("mobile-out-open",next);
  workspace.inert=next;
  if(mobile){
    outPanel.inert=!next;
    outPanel.setAttribute("aria-hidden",String(!next));
  }else{
    outPanel.inert=false;
    outPanel.removeAttribute("aria-hidden");
  }
  if(next){
    outRail.setAttribute("role","dialog");
    outRail.setAttribute("aria-modal","true");
    outRail.setAttribute("aria-label","생성 결과");
  }else{
    outRail.removeAttribute("role");
    outRail.removeAttribute("aria-modal");
    outRail.removeAttribute("aria-label");
  }
  if(focusTarget==="head" && next) mobileOutHead.focus({preventScroll:true});
  if(focusTarget==="bar" && mobile) mobileOutBar.focus({preventScroll:true});
}
mobileOutBar.addEventListener("click",()=>setMobileOutOpen(true,"head"));
mobileOutHead.addEventListener("click",()=>setMobileOutOpen(false,"bar"));
document.addEventListener("keydown",e=>{
  if(e.key==="Escape" && outRail.classList.contains("mobile-open")){
    e.preventDefault(); setMobileOutOpen(false,"bar");
  }
});
function syncViewport(){
  setMobileOutOpen(outRail.classList.contains("mobile-open"));
  if(MOBILE_QUERY.matches && document.activeElement===document.getElementById("subject"))
    document.getElementById("subject").blur();
}
syncViewport(); window.addEventListener("resize",syncViewport);

document.addEventListener("click",e=>{
  const t=e.target;
  if(t.closest("#builderBtn")){
    setBuilderOpen(!builderMenu.classList.contains("open")); return;
  }
  // 메뉴 밖을 누르면 닫고, 원래 하려던 동작은 그대로 이어간다
  if(!t.closest("#builderMenu")) setBuilderOpen(false);
  if(t.closest("#selSumHead")){
    setSelSumOpen(!selSumBox.classList.contains("open")); saveState(); return;
  }
  /* 결과 레일의 동작 버튼과 표시 수준 — 나머지와 같은 위임 방식으로 통일한다
     (인라인 onclick 은 전역 함수 이름에 묶여 있어 리네임에 취약하다) */
  const act=t.closest("[data-act]");
  if(act){
    if(act.dataset.act==="undo") undo();
    else if(act.dataset.act==="reset") reset();
    else if(act.dataset.act==="copy") copyIt();
    return;
  }
  const lv=t.closest("[data-level]");
  if(lv){ setLevel(lv.dataset.level); return; }
  const modelBtn=t.closest("[data-model]");
  if(modelBtn){ modelKey=modelBtn.dataset.model; sync(); return; }
  const len=t.closest("[data-length]");
  if(len){ outputLength=len.dataset.length; sync(); return; }
  const tab=t.closest(".modetab");
  if(tab){
    document.querySelectorAll(".modetab").forEach(x=>{
      x.classList.remove("on"); x.setAttribute("aria-selected","false"); });
    document.querySelectorAll(".pane").forEach(x=>x.classList.remove("on"));
    tab.classList.add("on"); tab.setAttribute("aria-selected","true");
    document.getElementById("pane-"+tab.dataset.pane).classList.add("on"); return;
  }
  const opt=t.closest(".opt");
  if(opt){ pickWiz(opt.dataset.wiz, opt.dataset.opt); return; }
  const q=t.closest("[data-quick]");
  if(q){ const on=CONFIG.quick[q.dataset.quick];
    if(ORDER.every(id=>scope[id]===on.includes(id))) return;
    pushHistory();
    ORDER.forEach(id=>scope[id]=on.includes(id)); sync(); return; }
  if(t.closest("#guardBtn")){ pushHistory(); guardOn=!guardOn; sync(); return; }
  const en=t.closest("[data-enable]");
  if(en){ pushHistory(); scope[en.dataset.enable]=true; sync(); return; }
  const sc=t.closest("[data-scope]");
  if(sc){ pushHistory(); scope[sc.dataset.scope]=!scope[sc.dataset.scope]; sync(); return; }
  const head=t.closest(".sec-head");
  // .sec-bar 로 한 겹 감쌌으므로 parentElement 가 아니라 section 을 찾아야 한다
  if(head){ const open=head.closest("section").classList.toggle("open");
    head.setAttribute("aria-expanded",open); return; }
  const rm=t.closest("[data-remove]");
  if(rm){ pushHistory(); const kr=rm.dataset.remove; state[lookup[kr].sec].delete(kr);
    manualEdits=true; replacedNotice=false; lastApplied=null; conflictNotice=null;
    activePreset=null; sync(); return; }
  const chip=t.closest(".chip");
  if(chip) toggle(chip.dataset.sec, chip.dataset.kr);
});

/* 탭 좌우 방향키 이동 (WAI-ARIA tablist 패턴) */
document.querySelector(".modetabs").addEventListener("keydown",e=>{
  if(e.key!=="ArrowLeft" && e.key!=="ArrowRight" && e.key!=="Home" && e.key!=="End") return;
  const tabs=[...document.querySelectorAll(".modetab")].filter(t=>t.offsetParent!==null||true);
  const i=tabs.indexOf(document.activeElement); if(i<0) return;
  e.preventDefault();
  const n = e.key==="Home" ? 0
          : e.key==="End" ? tabs.length-1
          : (i + (e.key==="ArrowRight"?1:-1) + tabs.length) % tabs.length;
  tabs[n].focus(); tabs[n].click();
});

/* ── 카드 설명 툴팁 ──
   카드 이미지는 기본 크기로 유지하고, 카드 안에서 감춘 설명만 카드 옆에 보여준다.
   짧은 지연을 둬서 목록 위로 마우스를 지나갈 때 깜빡이지 않는다. */
const PV_SEL=".chip.haspv,.opt.haspv,.preset-card";
const PV_DELAY=140;
/* 같은 설명을 선택 상태의 상시 툴팁과 호버 툴팁이 함께 사용한다. */
document.querySelectorAll(PV_SEL).forEach(card=>{
  const desc=card.querySelector(".desc,small");
  if(desc && desc.textContent.trim()) card.dataset.tip=desc.textContent.trim();
});
const pvTooltip=document.createElement("div");
pvTooltip.id="pvtooltip";
pvTooltip.setAttribute("role","tooltip");
pvTooltip.setAttribute("aria-hidden","true");
document.body.appendChild(pvTooltip);
let tooltipTimer=null, tooltipCard=null;
const cardSelected=card=>card.matches(".chip.on,.opt.on,.preset-card.sel");

function hideTooltip(){
  clearTimeout(tooltipTimer); tooltipTimer=null; tooltipCard=null;
  pvTooltip.classList.remove("show");
  pvTooltip.setAttribute("aria-hidden","true");
}
function placeTooltip(card){
  const r=card.getBoundingClientRect();
  const inset=10, pad=10;
  pvTooltip.style.maxWidth=Math.max(120,r.width-inset*2)+"px";
  const w=pvTooltip.offsetWidth, h=pvTooltip.offsetHeight;
  // 카드 안쪽 상단 중앙에 놓고 화면 경계도 벗어나지 않게 한다
  let left=r.left+(r.width-w)/2;
  left=Math.min(Math.max(pad,left),Math.max(pad,window.innerWidth-w-pad));
  let top=r.top+inset;
  top=Math.min(Math.max(pad,top),Math.max(pad,window.innerHeight-h-pad));
  pvTooltip.style.left=Math.round(left)+"px";
  pvTooltip.style.top=Math.round(top)+"px";
}
function showTooltip(card){
  const descEl=card.querySelector(".desc,small");
  const desc=descEl&&descEl.textContent.trim();
  if(!desc) return;
  pvTooltip.textContent=desc;
  pvTooltip.classList.add("show");
  pvTooltip.setAttribute("aria-hidden","false");
  placeTooltip(card);         // 툴팁 크기가 정해진 뒤에 위치를 잡는다
}
function queueTooltip(card){
  if(cardSelected(card)){ hideTooltip(); return; }
  if(card===tooltipCard) return;
  clearTimeout(tooltipTimer); tooltipCard=card;
  tooltipTimer=setTimeout(()=>{
    if(tooltipCard===card && !cardSelected(card)) showTooltip(card);
  },PV_DELAY);
}
document.addEventListener("pointerover",e=>{
  if(!e.target.closest) return;
  const card=e.target.closest(PV_SEL);
  if(card) queueTooltip(card);
  else if(tooltipCard) hideTooltip();
});
document.addEventListener("pointerdown",hideTooltip);
document.addEventListener("focusin",e=>{
  const card=e.target.closest&&e.target.closest(PV_SEL);
  if(card) queueTooltip(card); else hideTooltip();
});
window.addEventListener("scroll",hideTooltip,true);
window.addEventListener("resize",hideTooltip);

document.getElementById("search").addEventListener("input",e=>{
  const prev=query; query=e.target.value.trim().toLowerCase();
  if(!prev && query){
    openBeforeSearch={};
    DATA.forEach(s=>openBeforeSearch[s.id]=document.getElementById("sec-"+s.id).classList.contains("open"));
  }else if(prev && !query && openBeforeSearch){
    DATA.forEach(s=>document.getElementById("sec-"+s.id).classList.toggle("open",openBeforeSearch[s.id]));
    openBeforeSearch=null;
  }
  sync();
});
const subjectEl=document.getElementById("subject");
subjectEl.addEventListener("focus",()=>{ subjectEditSnapshot=snapshot(); });
/* 피사체를 칠 때 바뀌는 것은 경고와 프롬프트뿐이다.
   칩 200개를 한 글자마다 다시 훑을 이유가 없다(그쪽이 sync() 비용의 대부분이다). */
subjectEl.addEventListener("input",syncOutput);
subjectEl.addEventListener("blur",()=>{
  if(subjectEditSnapshot && subjectEditSnapshot.subject!==subjectEl.value){
    pushHistory(subjectEditSnapshot);
    sync();
  }
  subjectEditSnapshot=null;
});
function syncLevelUI(){
  [["m-easy","easy"],["m-all","all"]].forEach(([id,v])=>{
    const b=document.getElementById(id);
    b.classList.toggle("on",level===v); b.setAttribute("aria-pressed",level===v);
  });
}
function setLevel(l){ level=l; syncLevelUI(); sync(); }

/* ── 선택 · 충돌 ── */
/* removed 배열을 넘기면 충돌 규칙 때문에 해제된 항목 이름이 담긴다.
   해제는 조용히 일어나면 안 된다 — 방금 고른 것이 사라진 것처럼 보이기 때문이다. */
function selectItem(kr, removed){
  const l=lookup[kr]; if(!l) return;
  const sec=DATA.find(d=>d.id===l.sec);
  const grp=sec.groups.find(g=>g.label===l.grp);
  const drop=n=>{
    if(n===kr) return;
    const t=lookup[n]; if(!t || !state[t.sec].has(n)) return;
    state[t.sec].delete(n);
    if(removed && !removed.includes(n)) removed.push(n);
  };
  if(grp.xg) DATA.forEach(s=>s.groups.forEach(g=>{
    if(g.xg===grp.xg) g.items.forEach(it=>drop(it[0]));
  }));
  EXCLUSIVE.forEach(set=>{ if(set.includes(kr)) set.forEach(drop); });
  PAIRS.forEach(([a,b])=>{
    if(a.includes(kr)) b.forEach(drop);
    if(b.includes(kr)) a.forEach(drop);
  });
  state[l.sec].add(kr);
}
function toggle(secId,kr){
  pushHistory();
  const removed=[];
  if(state[secId].has(kr)) state[secId].delete(kr); else selectItem(kr,removed);
  conflictNotice = removed.length ? {kept:kr, removed} : null;
  manualEdits=true; replacedNotice=false; lastApplied=null; activePreset=null; sync();
}

/* ── 되돌리기 ── */
function snapshot(){
  const sel={}; DATA.forEach(s=>sel[s.id]=[...state[s.id]]);
  return {
    sel,
    wiz:{...wizPick},
    subject:document.getElementById("subject").value,
    preset:activePreset,
    scope:Object.fromEntries(ORDER.map(id=>[id,scope[id]])),
    guard:guardOn,
    manual:manualEdits,
    applied:lastApplied ? {...lastApplied,items:[...lastApplied.items]} : null,
    replaced:replacedNotice,
    sd:{...sd, segs:[...sd.segs]},
  };
}
function normalizeSnapshot(sn){
  const sortedObject=obj=>Object.fromEntries(
    Object.keys(obj||{}).sort().map(key=>[key,obj[key]])
  );
  return {
    sel:Object.fromEntries(ORDER.slice().sort().map(id=>[
      id,[...(sn.sel[id]||[])].sort()
    ])),
    wiz:sortedObject(sn.wiz),
    subject:sn.subject,
    preset:sn.preset||null,
    scope:sortedObject(sn.scope),
    guard:!!sn.guard,
    manual:!!sn.manual,
    applied:sn.applied ? {
      label:sn.applied.label,
      items:[...(sn.applied.items||[])].sort(),
      why:sn.applied.why||"",
    } : null,
    replaced:!!sn.replaced,
    sd:sn.sd ? {...sn.sd, segs:[...(sn.sd.segs||[])]} : null,
  };
}
function snapshotKey(sn){ return JSON.stringify(normalizeSnapshot(sn)); }
function pushHistory(snap=snapshot()){
  const last=undoStack[undoStack.length-1];
  if(last && snapshotKey(last)===snapshotKey(snap)) return;
  undoStack.push(snap);
  if(undoStack.length>20) undoStack.shift();
}
/* 가이드 옵션의 시각 상태와 aria 상태를 함께 갱신한다 */
function syncWizUI(){
  document.querySelectorAll(".opt").forEach(b=>{
    const on=wizPick[b.dataset.wiz]===b.dataset.opt;
    b.classList.toggle("on",on); b.setAttribute("aria-pressed",on);
  });
}
function syncPresetUI(){
  document.querySelectorAll(".preset-card").forEach(c=>{
    c.classList.toggle("sel",c.dataset.preset===activePreset);
  });
}

function undo(){
  const sn=undoStack.pop(); if(!sn) return;
  DATA.forEach(s=>state[s.id]=new Set(sn.sel[s.id]));
  wizPick={...sn.wiz};
  document.getElementById("subject").value=sn.subject;
  activePreset=sn.preset||null;
  ORDER.forEach(id=>scope[id]=sn.scope[id]);
  guardOn=sn.guard;
  manualEdits=sn.manual;
  lastApplied=sn.applied ? {...sn.applied,items:[...sn.applied.items]} : null;
  replacedNotice=sn.replaced;
  conflictNotice=null;
  if(sn.sd){ sd={...sn.sd, segs:[...sn.sd.segs]}; redrawSd(); }
  syncWizUI();
  syncPresetUI();
  sync();
}
function applySelection(list, keep){
  conflictNotice=null;   // 가이드·프리셋 적용은 그 자체가 '교체' 안내를 따로 낸다
  if(!keep){
    DATA.forEach(sec=>state[sec.id].clear());
  }
  list.forEach(kr=>selectItem(kr));   // forEach 의 index 가 removed 로 새어들지 않게 한다
  sync();
}
function pickWiz(key,opt){
  pushHistory();
  replacedNotice=manualEdits && DATA.some(s=>state[s.id].size>0);
  const turningOn = wizPick[key]!==opt;
  wizPick[key]=turningOn?opt:null;
  syncWizUI();
  activePreset=null; syncPresetUI();
  const list=[]; WIZ.forEach(s=>{ const p=wizPick[s.key]; if(p) list.push(...s.opts[p]); });
  // 무엇이 왜 적용됐는지 그 자리에서 알려준다
  lastApplied = turningOn
    ? {label:opt, items:WIZ.find(s=>s.key===key).opts[opt],
       why:(WIZ.find(s=>s.key===key).why||{})[opt]||""}
    : null;
  manualEdits=false;
  applySelection(list,false);
}
function reset(){
  const changed=DATA.some(s=>state[s.id].size>0)
    ||document.getElementById("subject").value.trim()
    ||ORDER.some(id=>!scope[id]) || !guardOn || Object.keys(wizPick).length || activePreset
    ||sd.segs.some(t=>t.trim()) || sd.note.trim();
  if(changed) pushHistory();
  DATA.forEach(sec=>state[sec.id].clear());
  ORDER.forEach(id=>scope[id]=true);
  wizPick={}; syncWizUI();
  activePreset=null; syncPresetUI();
  document.getElementById("subject").value="";
  sd={count:2, segs:["","",""], audio:"none", note:"", preserve:"strict"}; redrawSd();
  document.getElementById("search").value=""; query=""; openBeforeSearch=null;
  manualEdits=false; replacedNotice=false; lastApplied=null; conflictNotice=null;
  sync();
}

/* ── 동기화 ──
   두 갈래로 나눠 둔다.
     syncItems()  선택 상태·검색·표시 수준에 따라 좌측 칩 목록을 다시 그린다.
                  칩이 200개 안팎이라 이 루프가 sync() 비용의 대부분(측정 17.6ms 중 10ms)이다.
     syncOutput() 경고·프롬프트·단어 수 등 결과 쪽만 갱신한다. 훨씬 싸다.
   피사체를 한 글자 칠 때마다 바뀌는 것은 결과뿐이므로 그 경로는 syncOutput() 만 부른다.
   sync() 는 둘 다 부르는 기존 이름 그대로라, 나머지 호출부는 손대지 않아도 된다. */
let outTotal=0;   // 출력에 포함된 선택 개수 — syncItems 가 계산해 syncOutput 이 쓴다
/* 속성 선택자(querySelectorAll)는 문서 전체를 훑는다. 여기 요소들은 처음 만들어진 뒤
   바뀌지 않으므로 한 번만 찾아 둔다 — syncOutput 이 한 글자마다 도는 경로다. */
const LEN_BTNS=[...document.querySelectorAll("[data-length]")];
const LEN_SHORT=LEN_BTNS.find(b=>b.dataset.length==="short");
const LEN_DETAIL=LEN_BTNS.find(b=>b.dataset.length==="detail");
const MODEL_BTNS=[...document.querySelectorAll("[data-model]")];
const SUBJECT_BOX=document.querySelector(".subject-box");

/* ── Seedance 입력 패널 ──
   엔트리 HTML 3벌에 같은 마크업을 복사해 두지 않도록 여기서 한 번만 만든다.
   CONFIG.sd 가 없는 앱(이미지 빌더)에서는 아예 만들지 않는다. */
const SD_BOX=CONFIG.sd ? buildSdPanel() : null;
function buildSdPanel(){
  const box=document.createElement("div");
  box.className="sd-box"; box.id="sdBox"; box.hidden=true;
  const seg=(label,name,opts)=>
    `<span class="profile-label">${label}</span>`
    +`<div class="seg" role="group" aria-label="${label}">`
    +opts.map(([v,t])=>`<button data-sd-${name}="${v}">${t}</button>`).join("")
    +`</div>`;
  box.innerHTML=
     seg("연속숏 시간구간","count",[["2","2구간 · 6초"],["3","3구간 · 10초"]])
    +`<div class="sd-segs" id="sdSegs"></div>`
    +seg("오디오","audio",[["none","무음"],["ambient","환경음"],["dialogue","환경음+대사"]])
    +`<input class="sd-note" id="sdNote" aria-label="효과음·대사 메모"
       placeholder="효과음·대사를 직접 적을 수 있어요 (선택)">`
    +(CONFIG.sd.preserve
      ? seg("참조 이미지 유지","preserve",[["strict","엄격 유지"],["natural","자연스러운 변주"]])
      : "");
  SUBJECT_BOX.insertAdjacentElement("afterend",box);

  // 구간 입력칸은 개수가 바뀌므로 따로 그린다
  const segsEl=box.querySelector("#sdSegs");
  const drawSegs=()=>{
    segsEl.innerHTML=SD_TIMES[sd.count].map((t,i)=>
      `<label class="sd-seg"><span class="sd-time">${t}</span>`
      +`<input data-sd-seg="${i}" aria-label="${t} 구간 내용"`
      +` placeholder="${(CONFIG.sd.segHints||[])[i]||"이 구간에서 무엇이 일어나나요?"}"></label>`
    ).join("");
    SD_TIMES[sd.count].forEach((_,i)=>{
      segsEl.querySelector(`[data-sd-seg="${i}"]`).value=sd.segs[i]||"";
    });
  };
  box.drawSegs=drawSegs;
  drawSegs();

  /* 구간·메모는 한 글자마다 결과만 바뀐다 — 칩 200개를 다시 훑을 이유가 없다.
     피사체 입력칸과 같은 이유로 syncOutput 만 부른다. */
  box.addEventListener("input",e=>{
    const s=e.target.closest("[data-sd-seg]");
    if(s){ sd.segs[+s.dataset.sdSeg]=s.value; syncOutput(); queueSave(); return; }
    if(e.target.id==="sdNote"){ sd.note=e.target.value; syncOutput(); queueSave(); }
  });
  /* 되돌리기 — 피사체 입력칸과 같은 방식으로 편집 전후를 한 단계로 묶는다.
     구간 수 버튼만 pushHistory 하고 텍스트 입력은 빼먹어서, 같은 패널 안에서
     되돌리기가 되는 것과 안 되는 것이 섞여 있었다.
     입력칸은 drawSegs 가 다시 만들므로 위임(focusin/focusout)으로 받는다. */
  const isSdText=el=>el && (el.matches("[data-sd-seg]") || el.id==="sdNote");
  let sdEditSnapshot=null;
  box.addEventListener("focusin",e=>{
    if(isSdText(e.target)) sdEditSnapshot=snapshot();
  });
  box.addEventListener("focusout",e=>{
    if(!isSdText(e.target) || !sdEditSnapshot) return;
    if(snapshotKey(sdEditSnapshot)!==snapshotKey(snapshot())){ pushHistory(sdEditSnapshot); sync(); }
    sdEditSnapshot=null;
  });
  box.addEventListener("click",e=>{
    const c=e.target.closest("[data-sd-count]");
    if(c){ pushHistory(); sd.count=+c.dataset.sdCount; drawSegs(); sync(); return; }
    const a=e.target.closest("[data-sd-audio]");
    if(a){ pushHistory(); sd.audio=a.dataset.sdAudio; sync(); return; }
    const p=e.target.closest("[data-sd-preserve]");
    if(p){ pushHistory(); sd.preserve=p.dataset.sdPreserve; sync(); }
  });
  return box;
}
/* 패널의 버튼 눌림 상태와 표시 여부를 현재 모델에 맞춘다 */
function syncSdUI(){
  if(!SD_BOX) return;
  SD_BOX.hidden = modelKey!=="seedance";
  const mark=(name,val)=>SD_BOX.querySelectorAll(`[data-sd-${name}]`).forEach(b=>{
    const on=b.dataset[`sd${name[0].toUpperCase()+name.slice(1)}`]===String(val);
    b.classList.toggle("on",on); b.setAttribute("aria-pressed",on);
  });
  mark("count",sd.count); mark("audio",sd.audio); mark("preserve",sd.preserve);
  SD_BOX.querySelector("#sdNote").hidden = sd.audio==="none";
}
/* sd 를 통째로 갈아끼운 뒤(되돌리기·복원·초기화) 입력칸 값을 다시 채운다 */
function redrawSd(){
  if(!SD_BOX) return;
  SD_BOX.drawSegs();
  SD_BOX.querySelector("#sdNote").value=sd.note;
}
const PROMPT_EL=document.getElementById("prompt");
const SUBJECT_NOTE=document.getElementById("subjectNote");
/* 결과 제목 옆 안내 — OUT_LAB 을 매번 다시 그리므로 노드를 만들어 들고 다닌다 */
const OUT_NOTE=document.createElement("span");
OUT_NOTE.id="outNote"; OUT_NOTE.setAttribute("role","status");
OUT_NOTE.setAttribute("aria-live","polite");
/* 좁은 자리라 첫 건만 적고 전체는 툴팁으로 넘긴다.
   내용이 같으면 건드리지 않는다 — 라이브 영역이라 매 입력마다 다시 쓰면
   스크린리더가 같은 문장을 계속 읽는다. */
function setNote(el, notes){
  const first=notes[0];
  /* 한 줄에 들어가는 건 앞머리뿐이다. 문구는 '요약 — 자세히' 로 쓰고
     여기서 앞머리만 떼어 쓴다(전체는 title 로 간다). */
  const text = first
    ? first.t.split("\n")[0].split(" — ")[0] + (notes.length>1 ? ` 외 ${notes.length-1}건` : "")
    : "";
  if(el.textContent!==text) el.textContent=text;
  const full=notes.map(n=>n.t).join("\n");
  if(el.title!==full) el.title=full;
  const cls="note"+(first?" show "+first.tone:"");
  if(el.className!==cls) el.className=cls;
}
const OUT_LAB=document.getElementById("outLab");
const MOBILE_OUT_SUM=document.getElementById("mobileOutSum");
const MOBILE_OUT_HEAD_SUM=document.getElementById("mobileOutHeadSum");

function sync(){ syncItems(); syncOutput(); }

function syncItems(){
  DATA.forEach(sec=>{
    const secEl=document.getElementById("sec-"+sec.id);
    let secVisible=0;
    sec.groups.forEach(g=>{
      const grpEl=secEl.querySelector(`[data-grp="${sec.id}|${g.label}"]`);
      let vis=0, hid=0;
      grpEl.querySelectorAll(".chip").forEach(c=>{
        const on=state[sec.id].has(c.dataset.kr);
        c.classList.toggle("on",on); c.setAttribute("aria-pressed",on);
        const show = query ? c.dataset.find.includes(query)
                           : (level==="all" || c.dataset.rec==="1" || on);
        c.classList.toggle("hide",!show);
        show ? vis++ : hid++;
      });
      grpEl.classList.toggle("hide",vis===0);
      const hn=grpEl.querySelector(".hidden-n");
      hn.textContent = (!query && level==="easy" && hid) ? `전문가 모드에 +${hid}개` : "";
      secVisible+=vis;
    });
    secEl.querySelector(".empty").style.display=secVisible?"none":"block";
    secEl.classList.toggle("hide", !!query && secVisible===0);
    if(query) secEl.classList.toggle("open", secVisible>0);
  });

  let total=0;
  DATA.forEach(sec=>{
    const n=state[sec.id].size; if(scope[sec.id]) total+=n;
    const b=document.getElementById("b-"+sec.id);
    b.textContent=n; b.classList.toggle("off",n===0);
    const off=!scope[sec.id];
    document.getElementById("sec-"+sec.id).classList.toggle("muted",off);
    document.getElementById("m-"+sec.id).style.display=off?"":"none";
    document.getElementById("note-"+sec.id).style.display=(off&&n>0)?"":"none";
  });
  ORDER.forEach(id=>{
    const el=document.getElementById("s-"+id);
    el.classList.toggle("on",scope[id]); el.setAttribute("aria-pressed",scope[id]);
    el.setAttribute("aria-label",`${SEC_SHORT[id]} 출력 ${scope[id]?"포함":"제외"}`);
    el.title = scope[id] ? `${SEC_SHORT[id]} 출력에서 제외` : `${SEC_SHORT[id]} 출력에 포함`;
  });
  /* 섹션 토글이 좌측 섹션 헤더로 갔으므로, 가이드·룩 탭에서는 보이지 않는다.
     무엇이 빠져 있는지는 출력 범위 줄에서 알려준다. */
  const offNames=ORDER.filter(id=>!scope[id]).map(id=>SEC_SHORT[id]);
  const offEl=document.getElementById("scopeOff");
  offEl.textContent = offNames.length ? `${offNames.join(" · ")} 제외됨` : "";
  offEl.classList.toggle("show", offNames.length>0);

  // 현재 선택 요약 (한국어, 클릭으로 개별 해제)
  const chosen=[];
  ORDER.forEach(id=>DATA.find(d=>d.id===id).groups.forEach(g=>g.items.forEach(it=>{
    if(state[id].has(it[0])) chosen.push({kr:it[0],off:!scope[id]});
  })));
  const sumEl=document.getElementById("selSummary");
  sumEl.innerHTML = chosen.length
    ? chosen.map(c=>`<button class="tag${c.off?" off":""}" data-remove="${c.kr}"
        title="클릭하면 해제">${c.kr}<i>×</i></button>`).join("")
    : `<span class="tag-empty">왼쪽에서 항목을 고르면 여기에 모입니다.</span>`;
  /* 접힌 상태에서도 몇 개를 골랐는지, 그중 몇 개가 출력에서 빠졌는지는 보여야 한다 */
  const offCount=chosen.filter(c=>c.off).length;
  document.getElementById("selSumCount").textContent = chosen.length
    ? `${chosen.length}개` + (offCount?` · ${offCount}개 제외`:"")
    : "없음";

  outTotal=total;
}

function syncOutput(){
  const total=outTotal;
  MODEL_BTNS.forEach(b=>{
    const on=b.dataset.model===modelKey;
    b.classList.toggle("on",on); b.setAttribute("aria-pressed",on);
  });
  LEN_BTNS.forEach(b=>{
    const on=b.dataset.length===outputLength;
    b.classList.toggle("on",on); b.setAttribute("aria-pressed",on);
  });
  syncSdUI();
  const model=currentModel();
  document.getElementById("modeHelp").textContent=model.help
    +" 간결은 장비의 시각효과 설명을 생략하며, 선택한 항목 자체는 모두 포함합니다.";
  const summary=`${model.label} · ${outputLength==="short"?"간결":"상세"}`;

  // '텍스트 방지' — 부정형을 지원하지 않는 모델에서는 비활성화한다
  const gb=document.getElementById("guardBtn");
  const noGuard=!model.guard;
  gb.disabled=noGuard;
  gb.classList.toggle("on", guardOn && !noGuard);
  gb.setAttribute("aria-pressed", guardOn && !noGuard);
  gb.title = noGuard ? model.noGuardReason
    : "프롬프트 끝에 텍스트·워터마크·카메라 UI가 화면에 그려지는 것을 막는 문구를 추가합니다";

  /* ── 안내 ──
     한곳에 모아 띄우던 팝업을 없애고, 고칠 곳 옆에 붙인다.
     입력에 관한 말은 입력칸 라벨 옆(inputNotes), 조합·적용·길이에 관한 말은
     결과 제목 옆(resultNotes). 좁은 자리라 첫 건만 쓰고 나머지는 툴팁으로 넘긴다. */
  const active=n=>{ const l=lookup[n]; return l && scope[l.sec] && state[l.sec].has(n); };
  const inputNotes=[], resultNotes=[];
  const subjText=document.getElementById("subject").value.trim();
  const subjEmpty=!subjText;

  /* 자리가 한 줄뿐이라 순서가 곧 우선순위다.
     방금 한 동작의 결과(해제·교체) → 고쳐야 할 것(조합·길이) → 잘 됐다는 확인(적용됨).
     '적용됨'은 사용자가 방금 의도한 일이라 가장 덜 급하다 — 맨 뒤로 미룬다. */
  if(conflictNotice)
    resultNotes.push({t:`${conflictNotice.kept}와(과) 충돌 — 함께 쓸 수 없어 자동 해제: ${conflictNotice.removed.join(" · ")}`,
                      tone:"swap"});
  if(replacedNotice)
    resultNotes.push({t:"직접 조정한 선택이 교체되었습니다 — '되돌리기'로 복구할 수 있어요", tone:"info"});
  SOFT.filter(r=>r.a.some(active)&&r.b.some(active))
      .forEach(r=>resultNotes.push({t:r.msg, tone:"warn"}));

  if(subjEmpty && total>0 && CONFIG.warnEmptySubject)
    inputNotes.push({t:CONFIG.warnEmptySubject, tone:"warn"});
  /* 조립되는 나머지 문구는 전부 영어다. 여기만 한국어면 모델이 그 부분을
     해석하지 못하거나 화면 속 글자로 그려낸다. */
  if(subjText && HANGUL_RE.test(subjText))
    inputNotes.push({t:`한국어입니다 — 영어로 쓰면 결과가 훨씬 안정적입니다`, tone:"warn"});
  // 입력 텍스트 ↔ 선택 항목 모순
  if(subjText) TEXT_CONFLICTS.forEach(r=>{
    const m=subjText.match(r.re);
    if(m){ const hit=r.items.filter(active);
      if(hit.length) inputNotes.push({t:`${r.msg(m[0])} — ${hit.join(", ")}`, tone:"warn"}); }
  });

  /* 되돌리기 — '되돌리기' 라는 글자는 아이콘이 이미 말한다.
     대신 몇 단계 남았는지를 숫자로 준다: 남은 단계 / 이번에 쌓인 최대 단계.
     되돌릴수록 앞 숫자만 줄어 어디까지 왔는지 보인다. */
  const undoBtn=document.getElementById("undoBtn");
  undoBtn.disabled=undoStack.length===0;
  undoHigh=Math.max(undoHigh, undoStack.length);
  if(!undoStack.length) undoHigh=0;
  document.getElementById("undoCount").textContent=`${undoStack.length}/${undoHigh}`;
  undoBtn.title=undoStack.length
    ? `되돌리기 — ${undoStack.length}단계 남음 (이번에 ${undoHigh}단계까지 쌓임)`
    : "되돌릴 단계가 없습니다";

  /* 출력 범위 빠른 선택 — 지금 범위와 정확히 같은 묶음을 눌린 상태로 둔다.
     누르고 나면 어느 것이 적용됐는지 알 수 없던 문제. */
  document.querySelectorAll("[data-quick]").forEach(b=>{
    const set=CONFIG.quick[b.dataset.quick];
    const on=ORDER.every(id=>scope[id]===set.includes(id));
    b.classList.toggle("on",on); b.setAttribute("aria-pressed",on);
  });

  const shortWords=wordCount(buildForLength("short"));
  const detailWords=wordCount(buildForLength("detail"));
  LEN_SHORT.textContent=`간결 · ${shortWords}단어`;
  LEN_DETAIL.textContent=`상세 · ${detailWords}단어`;

  const txt=build();
  const promptEl=PROMPT_EL;
  promptEl.value=txt;
  /* I2V 처럼 특정 입력이 없으면 프롬프트를 만들지 않는 앱에서는,
     '항목을 고르면 만들어집니다' 라는 기본 안내가 사실과 달라진다.
     막힌 이유를 상자 안에 그대로 띄우고 입력칸을 표시한다. */
  const blocked = CONFIG.subjectRequired && !txt && subjEmpty && total>0;
  promptEl.placeholder = blocked
    ? `${CONFIG.shortLabel||CONFIG.subjectLabel}을 입력하면 프롬프트가 만들어집니다.\n항목 선택만으로는 만들어지지 않습니다.`
    : PROMPT_HINT;
  SUBJECT_BOX.classList.toggle("need",!!blocked);
  document.getElementById("copyBtn").disabled = !txt;   // 빈 상태에서는 복사 비활성
  const words=wordCount(txt);
  // limit은 모델의 하드 제한이 아니라 이 앱의 권장 길이 기준이다.
  const lim=model.limit || {short:80, detail:150};
  if(words>lim[outputLength]) resultNotes.push({
    t:"권장 길이보다 길어요 — "+(outputLength==="short"?"항목을 줄이세요":"간결 모드 권장"),
    tone:"warn"});
  // 확인 문구는 맨 뒤 — 고쳐야 할 것이 있으면 그쪽이 먼저 보여야 한다
  /* '현재 총 N개' 는 빼둔다 — '현재 선택' 이 같은 수를 더 정확히(출력 제외분까지)
     세고 있어서, 두 숫자가 어긋나 보이면 어느 쪽을 믿을지 헷갈린다. */
  if(lastApplied) resultNotes.push({
    t:`${lastApplied.label} → ${lastApplied.items.length}개 적용`
      +`${lastApplied.why?" · "+lastApplied.why:""}\n${lastApplied.items.join(" · ")}`, tone:"ok"});
  /* blocked 조건은 warnEmptySubject 와 같아서 따로 말하지 않는다 —
     그 문구가 이미 입력칸 옆에 떠 있고, .need 로 입력칸도 함께 표시된다. */
  setNote(SUBJECT_NOTE, inputNotes);
  OUT_LAB.textContent="생성된 프롬프트";
  OUT_LAB.appendChild(OUT_NOTE);
  setNote(OUT_NOTE, resultNotes);

  /* 모바일 접힘 바 — 개수·단어수 대신 지금 알아야 할 것 한 줄만 */
  const head=[...resultNotes,...inputNotes][0];
  MOBILE_OUT_SUM.textContent = head ? head.t.split("\n")[0]
    : (txt ? summary : "선택 결과가 여기에 표시됩니다.");
  MOBILE_OUT_HEAD_SUM.textContent=summary;

  queueSave();
}

/* ── 선택 상태 저장 ──
   새로고침이나 실수로 닫았을 때 고른 것을 잃지 않게 한다.
   단, 로컬 파일(file://)로 열면 브라우저가 저장소 접근 자체를 막는 경우가 있어
   (Chrome·Safari) 전부 실패해도 조용히 넘어간다 — 저장은 어디까지나 덤이다. */
/* 저장 키는 앱 id 로 잡는다. 주소로 잡으면 같은 앱인데 `/` · `/x` · `/x.html` 이
   각각 다른 칸에 저장돼, 메뉴로 옮겨 다닐 때 작업이 사라진 것처럼 보인다. */
const STORE_KEY="prompt-builder:"+APP_ID;
const STORE_V=1;
function storage(){ try{ return window.localStorage; }catch(e){ return null; } }

/* ── 화면 테마 ── 앱별 작업 상태와 달리 세 빌더가 같은 선택을 공유한다. */
const THEME_KEY="prompt-builder:theme";
const THEME_BTNS=[...document.querySelectorAll("[data-theme-choice]")];
function applyTheme(theme,persist=true){
  const next=theme==="light"?"light":"dark";
  document.documentElement.dataset.theme=next;
  THEME_BTNS.forEach(btn=>btn.setAttribute("aria-pressed",btn.dataset.themeChoice===next));
  if(!persist) return;
  const s=storage(); if(!s) return;
  try{ s.setItem(THEME_KEY,next); }catch(e){}
}
document.getElementById("themeSwitch").addEventListener("click",e=>{
  const btn=e.target.closest("[data-theme-choice]");
  if(btn) applyTheme(btn.dataset.themeChoice);
});
applyTheme(document.documentElement.dataset.theme==="light"?"light":"dark",false);

let saveTimer=null;
function saveState(){
  const s=storage(); if(!s) return;
  try{
    s.setItem(STORE_KEY, JSON.stringify({
      v:STORE_V,
      sel:Object.fromEntries(DATA.map(d=>[d.id,[...state[d.id]]])),
      subject:document.getElementById("subject").value,
      model:modelKey, length:outputLength, level,
      scope:Object.fromEntries(ORDER.map(id=>[id,scope[id]])),
      guard:guardOn, wiz:wizPick, preset:activePreset,
      selOpen:selSumBox.classList.contains("open"),
      sd:{...sd, segs:[...sd.segs]},
    }));
  }catch(e){}   // 용량 초과·비공개 모드 등 — 저장 실패는 앱 동작에 영향이 없다
}
function queueSave(){ clearTimeout(saveTimer); saveTimer=setTimeout(saveState,400); }
/* 저장 키를 주소 기준에서 앱 id 기준으로 바꾸기 전에 쓰던 키들.
   그대로 두면 이미 저장해 둔 사람의 선택이 한 번 사라진 것처럼 보인다.
   한 번 옮겨 담고 옛 키는 지운다. 시간이 지나면 이 블록은 통째로 삭제해도 된다. */
function adoptLegacyState(s){
  const legacy=[
    "prompt-builder:"+THIS_APP.file,                       // /x.html 로 열었을 때
    "prompt-builder:"+THIS_APP.file.replace(/\.html$/,""), // Cloudflare 가 확장자를 뗀 주소
  ];
  if(APP_ID==="image") legacy.push("prompt-builder:");     // 루트(/)는 이미지 빌더였다
  for(const k of legacy){
    let v=null;
    try{ v=s.getItem(k); }catch(e){ continue; }
    if(!v) continue;
    try{ s.setItem(STORE_KEY,v); }catch(e){}
    legacy.forEach(old=>{ try{ s.removeItem(old); }catch(e){} });
    return v;
  }
  return null;
}

function restoreState(){
  const s=storage(); if(!s) return;
  let raw;
  try{ raw=s.getItem(STORE_KEY) || adoptLegacyState(s); }catch(e){ return; }
  let saved;
  try{ saved=JSON.parse(raw||"null"); }catch(e){ return; }
  if(!saved || saved.v!==STORE_V) return;
  // 저장된 뒤에 항목·모델이 바뀌었을 수 있으므로 지금 존재하는 것만 되살린다
  DATA.forEach(d=>state[d.id]=new Set(((saved.sel||{})[d.id]||[]).filter(has)));
  ORDER.forEach(id=>{ if(saved.scope && id in saved.scope) scope[id]=!!saved.scope[id]; });
  if(CONFIG.models.some(m=>m.key===saved.model)) modelKey=saved.model;
  if(saved.length==="short" || saved.length==="detail") outputLength=saved.length;
  if(saved.level==="easy" || saved.level==="all") level=saved.level;
  guardOn=saved.guard!==false;
  wizPick=(saved.wiz && typeof saved.wiz==="object") ? {...saved.wiz} : {};
  activePreset=(saved.preset && PRESETS[saved.preset]) ? saved.preset : null;
  document.getElementById("subject").value=saved.subject||"";
  /* 저장된 값이 지금의 선택지에 없을 수 있다(구간 수·오디오 종류가 바뀐 경우) */
  if(saved.sd && typeof saved.sd==="object"){
    const v=saved.sd;
    if(SD_TIMES[v.count]) sd.count=v.count;
    if(Array.isArray(v.segs)) sd.segs=[0,1,2].map(i=>String(v.segs[i]||""));
    if(v.audio in SD_AUDIO) sd.audio=v.audio;
    if(v.preserve==="strict"||v.preserve==="natural") sd.preserve=v.preserve;
    sd.note=String(v.note||"");
    redrawSd();
  }
  setSelSumOpen(!!saved.selOpen);
  syncLevelUI(); syncWizUI(); syncPresetUI();
}

/* ── 프롬프트 조립 ── */
function items(secId){
  if(!scope[secId]) return [];
  const sec=DATA.find(d=>d.id===secId); if(!sec) return [];
  const out=[];
  sec.groups.forEach(g=>g.items.forEach(it=>{
    if(state[secId].has(it[0])) out.push({kr:it[0],en:it[1],ext:EXT[it[0]]||""});
  }));
  return out;
}
const pick=(...ids)=>ids.flatMap(items);
function itemText(it){ return outputLength==="detail" && it.ext ? `${it.en}, ${it.ext}` : it.en; }
function listText(arr){ return arr.map(itemText).filter(Boolean).join(", "); }
function block(label,arr){ const t=listText(arr); return t?`${label}: ${t}.`:""; }
/* 라벨 없이 문장 조각을 이어 쓰는 모델(Seedance 등)에서 첫 글자만 올린다.
   한글·숫자로 시작하면 toUpperCase 가 원본을 그대로 돌려주므로 그대로 통과한다. */
function cap(t){ const s=(t||"").trim(); return s ? s[0].toUpperCase()+s.slice(1) : ""; }
const dot=t=>/[.!?]$/.test(t) ? t : t+".";

/* ── Seedance 2.0 프롬프트 조립 ──
   2.0 은 시간 구간을 줄 단위로 읽는다. 한 문단으로 뭉개면 '언제 무엇이 바뀌는가'가
   사라지므로 여기서 만든 줄바꿈은 끝까지 살려야 한다(dedupePhrases 참고). */
function sdSegments(){
  return SD_TIMES[sd.count]
    .map((time,i)=>({time, text:(sd.segs[i]||"").trim()}))
    .filter(s=>s.text);
}
function sdAudioLine(){
  const body=SD_AUDIO[sd.audio];
  if(!body) return "";                     // 무음 — 줄 자체를 만들지 않는다 (메모 입력칸도 숨는다)
  const note=sd.note.trim();
  return "Audio: "+body+(note ? " "+dot(cap(note)) : "");
}
function sdPrompt({head, camera, style, keep}){
  const lines=[];
  if(head)   lines.push(dot(cap(head)));
  sdSegments().forEach(s=>lines.push(`${s.time}: ${dot(cap(s.text))}`));
  if(camera) lines.push(dot("Camera: "+camera));
  if(style)  lines.push(dot("Style: "+style));
  const audio=sdAudioLine();
  if(audio)  lines.push(audio);
  if(keep)   lines.push(keep);
  return lines.join("\n");
}
function plain(label,t){ const c=(t||"").trim().replace(/[.\s]+$/,""); return c?`${label}: ${c}.`:""; }
const subjectText=()=>document.getElementById("subject").value.trim();
const currentModel=()=>CONFIG.models.find(m=>m.key===modelKey);

function withGuard(txt){
  const g=currentModel().guard;
  if(!guardOn || !txt || !g) return txt;
  return txt+g;
}

/* 같은 문구가 두 번 들어가는 것을 막는다.
   예: f/1.8 은 "shallow depth of field" 를 이미 포함하는데
       '얕은 심도 보케' 를 같이 고르면 그 문구가 두 번 나간다.
   중복은 모델이 그 개념에 과도한 가중치를 주게 만들고 프롬프트만 길어진다. */
function dedupePhrases(txt){
  if(!txt) return txt;
  const seen=new Set();
  /* 문장을 가른 공백을 함께 담아 두고 그대로 되돌린다.
     예전처럼 join(" ") 로 합치면 Seedance 2.0 의 시간 구간 줄바꿈이 한 줄로 뭉개진다.
     한 칸 공백으로 이어지던 기존 모델(Veo·범용)의 출력은 그대로다. */
  const parts=txt.split(/(?<=[.;])(\s+)/);
  const out=[];
  for(let i=0;i<parts.length;i+=2){
    const sent=parts[i], sep=parts[i+1]||"";
    const head=sent.match(/^[^:.]{1,40}:\s*/);      // "Camera and lens: " 같은 라벨은 보존
    const label=head?head[0]:"";
    let body=sent.slice(label.length);
    const period=/\.$/.test(body);
    if(period) body=body.slice(0,-1);
    const kept=body.split(", ").filter(p=>{
      const k=p.trim().toLowerCase();
      if(!k) return false;
      if(seen.has(k)) return false;
      seen.add(k); return true;
    });
    if(kept.length) out.push(label+kept.join(", ")+(period?".":""), sep);
  }
  return out.join("").replace(/\s+$/,"");
}

function build(){ return withGuard(dedupePhrases(CONFIG.build(modelKey))); }
function wordCount(txt){ return txt && txt.trim() ? txt.trim().split(/\s+/).length : 0; }
function buildForLength(length){
  const prev=outputLength;
  try{
    outputLength=length;
    return build();
  }finally{
    outputLength=prev;
  }
}

/* 손이 카드 위에 있어도 바로 복사할 수 있게 하는 키보드 단축키 */
document.addEventListener("keydown",e=>{
  if((e.metaKey||e.ctrlKey) && e.key==="Enter"){
    e.preventDefault();
    if(!document.getElementById("copyBtn").disabled) copyIt();
  }
});

function copyIt(){
  const t=document.getElementById("prompt").value; if(!t) return;
  const btn=document.getElementById("copyBtn");
  const done=()=>{ btn.textContent="복사됨 ✓"; btn.classList.add("done");
    setTimeout(()=>{btn.textContent="복사"; btn.classList.remove("done");},1400); };
  const fb=()=>{ const ta=document.getElementById("prompt");
    ta.removeAttribute("readonly"); ta.select();
    try{ document.execCommand("copy"); done(); }catch(e){}
    ta.setAttribute("readonly",""); window.getSelection().removeAllRanges(); };
  if(navigator.clipboard && window.isSecureContext)
    navigator.clipboard.writeText(t).then(done).catch(fb);
  else fb();
}

restoreState();
sync();
/* input[autofocus] 의 focus 이벤트는 이 스크립트가 실행되기 전에 이미 지나갔다.
   그래서 페이지를 열자마자 한 첫 입력은 스냅샷이 없어 되돌릴 수 없었다. */
if(document.activeElement===subjectEl) subjectEditSnapshot=snapshot();
