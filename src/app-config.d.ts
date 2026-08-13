/* 앱 설정(CONFIG)의 모양 — 세 앱의 app.js 가 이 타입을 만족해야 한다.
   엔진은 조각으로 나뉘어 있고 checkJs 도 꺼져 있어서, 설정 쪽 오타
   (모델 키를 잘못 쓴다든가, sections 에 없는 섹션을 order 에 넣는다든가)는
   화면을 열어 보기 전까지 아무도 잡아 주지 않았다. 여기만 먼저 묶는다.

   app.js 는 SLOT 으로 engine 조각들에 삽입되는 조각이라 그 자체로는 모듈이
   아니다. 그래서 import 하지 않고 전역 타입으로 선언만 해 두고, 값이 실제로
   이 모양인지는 scripts/verify-config.mjs 가 실행 시점에 확인한다. */

/** 섹션 식별자 — DATA 의 id 와 같아야 한다 */
type SectionId = string;

/** 대상 모델 하나 */
interface ModelSpec {
  /** build(model) 로 넘어오는 키 */
  key: string;
  /** 설정 패널에 그대로 나오는 이름 */
  label: string;
  /** 버튼에 들어갈 짧은 이름. 없으면 label 을 쓴다 */
  shortLabel?: string;
  /** 모델 선택 시 아래에 뜨는 설명 */
  help: string;
  /**
   * 프롬프트 끝에 붙는 텍스트·워터마크 방지 문구.
   * 빈 값이면 '텍스트 방지' 토글이 비활성화되고 noGuardReason 이 툴팁이 된다.
   */
  guard?: string;
  /**
   * 본문 대신 '네거티브 프롬프트' 칸으로 낼 방지 문구(쉼표로 나열).
   * 키워드 나열형 모델은 본문의 부정 표현을 지시로 읽지 못하고 그 단어에 가중치를 준다.
   * guard 와 함께 쓸 수 있다 — 긍정 지시는 guard 로, 빼고 싶은 것은 여기로.
   */
  negative?: string;
  /** guard 도 negative 도 없을 때 토글에 띄울 이유 */
  noGuardReason?: string;
  /** 이 앱이 권장하는 길이(단어). 모델의 하드 제한이 아니다 */
  limit?: { short: number; detail: number };
}

/** 가이드 탭의 질문 하나 */
interface WizStep {
  key: string;
  q: string;
  /** 선택지 → 왜 그 조합인지 한 줄 설명 */
  why?: Record<string, string>;
  /** 선택지 → 적용할 항목 이름들 */
  opts: Record<string, string[]>;
}

/** Seedance 전용 입력 패널 설정. 이 키가 있는 앱에만 패널이 생긴다 */
interface SeedanceConfig {
  /** 참조 이미지 유지 수준을 물을지 (I2V 만 true) */
  preserve: boolean;
  /** 구간 입력칸의 안내 문구 (구간 순서대로) */
  segHints?: string[];
}

interface AppConfig {
  /** HTML 을 담은 제목. <em> 안은 갈래로 떼어져 작게 표시된다 */
  title: string;
  /** 검색·공유용 설명. 화면에는 나오지 않는다 */
  sub: string;

  subjectLabel: string;
  /** 좁은 자리에 쓸 짧은 이름 */
  shortLabel?: string;
  subjectPlaceholder: string;
  /** true 면 이 입력 없이는 프롬프트를 만들지 않는다 */
  subjectRequired?: boolean;
  /** 입력이 비었을 때의 안내. ' — ' 앞이 좁은 자리에 보이는 부분이다 */
  warnEmptySubject?: string;

  /** 이 앱이 쓰는 섹션들 */
  sections: SectionId[];
  /** 출력에 넣는 순서 */
  order: SectionId[];
  /** 섹션 → 짧은 이름 */
  short: Record<SectionId, string>;
  /** 섹션 → 보조 설명 */
  notes?: Record<SectionId, string>;

  /** 이 앱에서 뺄 항목 이름들 */
  dropItems?: string[];
  /** 출력 범위 묶음 이름 → 포함할 섹션들 */
  quick: Record<string, SectionId[]>;

  /** 레퍼런스 룩 탭의 문구 */
  look?: { tab?: string; tabSub?: string; heading?: string; note?: string };
  /** 사진 없이 도식만 쓰는 앱 */
  noPreviewImages?: boolean;
  /** 앱 전용 프리셋 (없으면 공통 프리셋) */
  presets?: Record<string, string[]>;
  /** 프리셋 → 미리보기 이미지 */
  presetPv?: Record<string, string>;

  sd?: SeedanceConfig;
  wiz: WizStep[];
  models: ModelSpec[];

  /** 고른 모델 키를 받아 프롬프트 문자열을 만든다 */
  build(model: string): string;
}
