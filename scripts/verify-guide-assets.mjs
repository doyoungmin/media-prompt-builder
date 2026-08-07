/* GUIDE_IMG 원본과 반응형 WebP 파생본의 존재·치수·전송량 계약을 검증한다.

   치수까지 보는 이유: 예전 판은 RIFF 매직과 총 바이트만 확인했다. 그러면
   guide-768 폴더에 480px 짜리가 들어가도, 아니면 생성 스크립트가 조용히
   엉뚱한 크기를 내놓아도 전부 통과한다. srcset 의 `768w` 는 브라우저에게
   하는 약속이므로 파일이 정말 그 폭인지 재야 한다. */
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

/** WebP 헤더에서 폭·높이를 읽는다 (VP8 / VP8L / VP8X 세 형식) */
function webpSize(buf) {
  const kind = buf.subarray(12, 16).toString("ascii");
  if (kind === "VP8 ") {
    return [buf.readUInt16LE(26) & 0x3fff, buf.readUInt16LE(28) & 0x3fff];
  }
  if (kind === "VP8L") {
    const bits = buf.readUInt32LE(21);
    return [(bits & 0x3fff) + 1, ((bits >> 14) & 0x3fff) + 1];
  }
  if (kind === "VP8X") {
    return [buf.readUIntLE(24, 3) + 1, buf.readUIntLE(27, 3) + 1];
  }
  return null;
}

/** 존재·형식·폭을 확인하고 바이트를 돌려준다. wantWidth 가 없으면 폭은 보지 않는다 */
function webp(path, wantWidth) {
  if (!existsSync(path)) { check(false, `${path}: 파일 없음`); return 0; }
  const buf = readFileSync(path);
  const ok = buf.subarray(0, 4).toString("ascii") === "RIFF"
          && buf.subarray(8, 12).toString("ascii") === "WEBP";
  check(ok, `${path}: WebP 형식이 아님`);
  if (ok && wantWidth) {
    const size = webpSize(buf);
    check(size !== null, `${path}: WebP 헤더를 해석할 수 없음`);
    if (size) {
      check(size[0] === wantWidth, `${path}: 폭이 ${wantWidth} 가 아님 (${size[0]})`);
      /* 카드가 16:9 고정이라 비율이 어긋나면 object-fit 이 잘라 낸다 */
      const ratio = size[0] / size[1];
      check(Math.abs(ratio - 16 / 9) < 0.02, `${path}: 16:9 가 아님 (${size[0]}x${size[1]})`);
    }
  }
  return statSync(path).size;
}

const imageFiles = guideFiles("image"), t2vFiles = guideFiles("t2v");
check(imageFiles.length === 20, `image GUIDE_IMG가 20장이 아님 (${imageFiles.length})`);
check(imageFiles.join(",") === t2vFiles.join(","), "image와 t2v GUIDE_IMG 목록이 다름");

/* 사다리 — srcset 에 적는 폭과 실제 파일이 1:1 로 맞아야 한다.
   1024 는 파생본이 아니라 원본 자리(public/thumbs/*.webp)다. */
const RUNGS = [
  { width: 480, dir: "public/thumbs/guide-480", cap: 300 * 1024 },
  { width: 768, dir: "public/thumbs/guide-768", cap: 600 * 1024 },
  { width: 1024, dir: "public/thumbs", cap: 1100 * 1024 },
];
const totals = {};
for (const rung of RUNGS) {
  totals[rung.width] = 0;
  for (const file of imageFiles) totals[rung.width] += webp(`${rung.dir}/${file}`, rung.width);
  check(totals[rung.width] <= rung.cap,
    `${rung.width}px 총량 초과: ${totals[rung.width]}B > ${rung.cap}B`);
}

/* 렌더러 계약 — srcset 의 폭 목록과 sizes 의 중단점이 실제와 맞는지.
   sizes 중단점은 styles.css 에 정말 그 미디어쿼리가 있는지까지 확인한다.
   여기서 어긋나면 브라우저가 작은 후보를 골라 늘려 그린다. */
const renderer = readFileSync("src/shared/engine/06-render.js", "utf8");
for (const token of ["srcset=", "sizes=", 'decoding="async"', 'loading="lazy"'])
  check(renderer.includes(token), `가이드 렌더러에 ${token} 없음`);

const declared = [...renderer.matchAll(/\$\{\w+\} (\d+)w/g)].map(m => Number(m[1]));
check(declared.join(",") === RUNGS.map(r => r.width).join(","),
  `srcset 폭 목록이 사다리와 다름: [${declared}] vs [${RUNGS.map(r => r.width)}]`);

const css = readFileSync("src/shared/styles.css", "utf8");
const breakpoints = [...(renderer.match(/const GUIDE_SIZES="([^"]+)"/)?.[1] || "")
  .matchAll(/max-width:(\d+)px/g)].map(m => Number(m[1]));
check(breakpoints.length > 0, "GUIDE_SIZES 에서 중단점을 찾지 못함");
for (const bp of breakpoints) {
  check(new RegExp(`@media\\((?:max|min)-width:${bp === 1679 ? 1680 : bp}px\\)`).test(css),
    `sizes 의 ${bp}px 중단점이 styles.css 에 없음 — 실재하지 않는 중단점을 쓰면 잘못된 후보를 고른다`);
}

if (failed) process.exit(1);
console.log("가이드 이미지 검수 통과 — "
  + RUNGS.map(r => `${r.width}px ${(totals[r.width] / 1024).toFixed(0)}KB`).join(" · ")
  + ` · 중단점 ${breakpoints.join("/")}px`);
