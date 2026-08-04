/** 옵션·프리셋 공용 타입. 마이그레이션하며 as-is 의 DATA/CONFIG/PRESETS 실제 형태에 맞춰 구체화한다. */
export interface OptionItem {
  key: string;
  label: string;
  prompt: string;        // 최종 영어 프롬프트 조각
  thumb?: string;        // /thumbs/… 경로 (없으면 SVG 프리뷰 사용)
}
export interface Section {
  id: string;
  title: string;
  items: OptionItem[];
  exclusiveWith?: string[]; // as-is 의 EXCLUSIVE 규칙
}
export interface AppData {
  app: "image" | "t2v" | "i2v";
  sections: Section[];
  presets: Record<string, string[]>;
}
