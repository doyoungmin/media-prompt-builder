import { defineConfig, type Plugin } from "vite";
import { resolve } from "node:path";

/** 가상 모듈 `virtual:engine-<app>` — 공통 엔진(src/shared/engine.js)의 SLOT 에
 *  앱별 코드(src/apps/<app>/app.js)를 삽입해 완성된 스크립트를 돌려준다.
 *  dev·build 양쪽에서 동작하며, 두 원본 파일을 감시해 수정 시 자동 반영된다. */
function engineCompose(): Plugin {
  return {
    name: "engine-compose",
    resolveId(id) {
      if (id.startsWith("virtual:engine-")) return "\0" + id;
    },
    async load(id) {
      if (!id.startsWith("\0virtual:engine-")) return;
      const app = id.slice("\0virtual:engine-".length);
      // @ts-ignore — 순수 JS 헬퍼
      const { compose, enginePartFiles } = await import("./scripts/compose-engine.mjs");
      // 엔진은 조각 여러 개다 — 하나만 감시하면 다른 조각을 고쳐도 다시 안 만든다
      for (const f of enginePartFiles(import.meta.dirname))
        this.addWatchFile(resolve(import.meta.dirname, `src/shared/engine/${f}`));
      this.addWatchFile(resolve(import.meta.dirname, `src/apps/${app}/app.js`));
      return compose(app, import.meta.dirname);
    },
  };
}

export default defineConfig({
  plugins: [engineCompose()],
  // 이미지가 다시 base64 로 인라인되는 것을 금지 — as-is 의 용량 문제 재발 방지
  build: {
    assetsInlineLimit: 0,
    rollupOptions: {
      input: {
        index: resolve(import.meta.dirname, "index.html"),
        image: resolve(import.meta.dirname, "image/index.html"),
        t2v: resolve(import.meta.dirname, "t2v/index.html"),
        i2v: resolve(import.meta.dirname, "i2v/index.html"),
      },
    },
  },
});
