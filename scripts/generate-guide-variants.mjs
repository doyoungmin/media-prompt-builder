/* GUIDE_IMG 원본(1024px)에서 480/768px WebP 파생본을 만든다.
   필요 도구: ImageMagick 7의 `magick`. 원본은 건드리지 않는다.

   원본 1024 자체가 srcset 사다리의 맨 윗칸이라 여기서 다시 만들지 않는다.
   폭을 바꾸려면 scripts/verify-guide-assets.mjs 의 RUNGS 와
   engine/06-render.js 의 guideImg 를 함께 고쳐야 한다 — 셋이 어긋나면
   검수가 잡는다. */
import { mkdirSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

/* 정본은 엔진 하나뿐이다(01-data.js) — 예전엔 앱마다 한 벌씩 있었다 */
function guideFiles() {
  const source = readFileSync("src/shared/engine/01-data.js", "utf8");
  const block = source.match(/const GUIDE_IMG = \{([\s\S]*?)\n\};/)?.[1];
  if (!block) throw new Error("01-data.js 에서 GUIDE_IMG 블록을 찾지 못함");
  return [...new Set([...block.matchAll(/"\/thumbs\/(t-\d{3}\.webp)"/g)].map(match => match[1]))].sort();
}

const files = guideFiles();
for (const { width, quality } of [{ width: 480, quality: 74 }, { width: 768, quality: 76 }]) {
  const dir = `public/thumbs/guide-${width}`;
  mkdirSync(dir, { recursive: true });
  for (const file of files) {
    const result = spawnSync("magick", [
      `public/thumbs/${file}`, "-resize", `${width}x${width}>`, "-strip",
      "-quality", String(quality), "-define", "webp:method=6", `${dir}/${file}`,
    ], { stdio: "inherit" });
    if (result.error?.code === "ENOENT")
      throw new Error("ImageMagick `magick`을 찾지 못했습니다. 설치 후 다시 실행하세요.");
    if (result.status !== 0) process.exit(result.status || 1);
  }
}
console.log(`가이드 이미지 ${files.length}장 × 2크기 생성 완료`);
