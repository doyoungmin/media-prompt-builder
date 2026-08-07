/* GUIDE_IMG 원본과 반응형 WebP 파생본의 존재·전송량 계약을 검증한다. */
import { existsSync, readFileSync, statSync } from "node:fs";

let failed = false;
function check(condition, message) {
  if (!condition) { console.error(`✗ ${message}`); failed = true; }
}
function guideFiles(app) {
  const source = readFileSync(`src/apps/${app}/app.js`, "utf8");
  const block = source.match(/const GUIDE_IMG\s*=\s*\{([\s\S]*?)\};\/\*==SLOT:2==\*\//)?.[1] || "";
  return [...new Set([...block.matchAll(/"\/thumbs\/(t-\d{3}\.webp)"/g)].map(match => match[1]))].sort();
}
function webp(path) {
  if (!existsSync(path)) { check(false, `${path}: 파일 없음`); return 0; }
  const buf = readFileSync(path);
  check(buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP",
    `${path}: WebP 형식이 아님`);
  return statSync(path).size;
}

const imageFiles = guideFiles("image"), t2vFiles = guideFiles("t2v");
check(imageFiles.length === 20, `image GUIDE_IMG가 20장이 아님 (${imageFiles.length})`);
check(imageFiles.join(",") === t2vFiles.join(","), "image와 t2v GUIDE_IMG 목록이 다름");
const totals = { 480: 0, 768: 0 };
for (const file of imageFiles) {
  webp(`public/thumbs/${file}`);
  for (const width of [480, 768]) totals[width] += webp(`public/thumbs/guide-${width}/${file}`);
}
check(totals[480] <= 300 * 1024, `480px 파생본 총량 초과: ${totals[480]}B`);
check(totals[768] <= 600 * 1024, `768px 파생본 총량 초과: ${totals[768]}B`);
const renderer = readFileSync("src/shared/engine/06-render.js", "utf8");
for (const token of ["srcset=", "sizes=", 'decoding="async"'])
  check(renderer.includes(token), `가이드 렌더러에 ${token} 없음`);

if (failed) process.exit(1);
console.log(`가이드 이미지 검수 통과 — 480px ${totals[480]}B · 768px ${totals[768]}B`);
