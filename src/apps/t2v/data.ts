import type { AppData } from "../../types";
/* TODO(마이그레이션): as-is 의 DATA/CONFIG/PRESETS 를 이 파일로 옮긴다.
   썸네일은 base64 대신 "/thumbs/<파일명>.webp" 경로를 쓴다 (public/thumbs/thumbs-map.json 참조). */
export const DATA: AppData = { app: "t2v", sections: [], presets: {} };
