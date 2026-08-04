/**
 * as-is HTML 의 PHOTO 객체(한글 키 → base64 webp)를 실제 파일로 추출한다.
 * 산출물:
 *   public/thumbs/t-000.webp …   (내용 해시로 중복 제거)
 *   public/thumbs/thumbs-map.json  { "한글 키": "t-000.webp", … }
 * 사용: node scripts/extract-assets.mjs [as-is 폴더 경로]
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve, join } from "node:path";

const asIs = resolve(process.argv[2] ?? "../as-is-HTML");
const outDir = resolve("public/thumbs");
mkdirSync(outDir, { recursive: true });

const sources = ["prompt-builder-image.html", "prompt-builder-video-t2v.html"];
const byHash = new Map();   // hash → filename
const map = {};             // key → filename
let n = 0;

for (const f of sources) {
  const html = readFileSync(join(asIs, f), "utf-8");
  const re = /"([^"]+)"\s*:\s*"data:image\/webp;base64,([A-Za-z0-9+/=]+)"/g;
  for (const m of html.matchAll(re)) {
    const [, key, b64] = m;
    const buf = Buffer.from(b64, "base64");
    const hash = createHash("sha1").update(buf).digest("hex");
    let name = byHash.get(hash);
    if (!name) {
      name = `t-${String(n++).padStart(3, "0")}.webp`;
      byHash.set(hash, name);
      writeFileSync(join(outDir, name), buf);
    }
    if (map[key] && map[key] !== name)
      console.warn(`키 충돌: "${key}" 가 서로 다른 이미지를 가리킴 (${map[key]} vs ${name})`);
    map[key] = name;
  }
}
writeFileSync(join(outDir, "thumbs-map.json"), JSON.stringify(map, null, 2));
console.log(`추출 완료: 이미지 ${byHash.size}장, 키 ${Object.keys(map).length}개 → public/thumbs/`);
