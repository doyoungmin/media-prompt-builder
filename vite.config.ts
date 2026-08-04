import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  // 이미지가 다시 base64 로 인라인되는 것을 금지 — as-is 의 용량 문제 재발 방지
  build: {
    assetsInlineLimit: 0,
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
        image: resolve(__dirname, "image/index.html"),
        t2v: resolve(__dirname, "t2v/index.html"),
        i2v: resolve(__dirname, "i2v/index.html"),
      },
    },
  },
});
