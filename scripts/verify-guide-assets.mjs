/* GUIDE_IMG 원본과 반응형 WebP 파생본의 존재·치수·전송량 계약을 검증한다.

   치수까지 보는 이유: 예전 판은 RIFF 매직과 총 바이트만 확인했다. 그러면
   guide-768 폴더에 480px 짜리가 들어가도, 아니면 생성 스크립트가 조용히
   엉뚱한 크기를 내놓아도 전부 통과한다. srcset 의 `768w` 는 브라우저에게
   하는 약속이므로 파일이 정말 그 폭인지 재야 한다. */
import { existsSync, readFileSync, statSync } from "node:fs";
import { JSDOM } from "jsdom";
import { compose } from "./compose-engine.mjs";

let failed = false;
function check(condition, message) {
  if (!condition) { console.error(`✗ ${message}`); failed = true; }
}
/* 라벨 → 파일. 정본은 엔진 하나뿐이다(01-data.js).
   예전에는 image·t2v 의 app.js 에 같은 맵이 두 벌 있었고 여기서 대조했는데,
   **파일 목록만** 비교해서 두 라벨의 사진을 서로 바꿔 놔도 통과했다.
   맵이 하나가 된 지금은 대조할 상대가 없으므로, 대신 아래 두 가지를 본다.
     ① 라벨이 실제로 어느 앱의 가이드 선택지인가 (아니면 사진이 화면에 안 나온다)
     ② 한 파일을 두 라벨이 나눠 쓰지 않는가 */
function guideMap() {
  const source = readFileSync("src/shared/engine/01-data.js", "utf8");
  const block = source.match(/const GUIDE_IMG = \{([\s\S]*?)\n\};/)?.[1];
  if (!block) throw new Error("01-data.js 에서 GUIDE_IMG 블록을 찾지 못함");
  return Object.fromEntries(
    [...block.matchAll(/"([^"]+)"\s*:\s*"\/thumbs\/(t-\d{3}\.webp)"/g)].map(m => [m[1], m[2]]));
}
/** 그 앱의 가이드가 실제로 화면에 내놓는 선택지 — 스텝별로 묶어서 준다 */
function wizSteps(app) {
  const html = readFileSync(`${app}/index.html`, "utf8")
    .replace(/<script type="module"[^>]*><\/script>/g, "");
  const dom = new JSDOM(html, { url: `https://example.com/${app}/`,
    runScripts: "outside-only", pretendToBeVisual: true });
  dom.window.eval(compose(app) + `window.__ = { wiz: WIZ, photos: usePhotos };`);
  const { wiz, photos } = dom.window.__;
  return { photos, steps: wiz.map(s => ({ key: s.key, opts: Object.keys(s.opts) })) };
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

const map = guideMap();
const labels = Object.keys(map);
const imageFiles = [...new Set(Object.values(map))].sort();
check(labels.length === 20, `GUIDE_IMG가 20장이 아님 (${labels.length})`);
check(imageFiles.length === labels.length,
  `한 파일을 여러 라벨이 나눠 쓰고 있음 (라벨 ${labels.length} · 파일 ${imageFiles.length})`);

/* 한 스텝의 선택지는 전부 사진이거나 전부 도식이어야 한다.
   선택지 이름을 한 글자만 바꿔도 그 카드만 사진을 잃고 도식으로 떨어지는데,
   파일은 멀쩡히 있고 문법도 맞아서 나머지 검사는 전부 통과한다.
   앱·스텝 이름을 여기 박아 두지 않으려고 '섞였는가'로 본다 —
   지금은 image 의 세 스텝과 t2v 의 subject·mood·comp 가 사진, t2v 의 motion 이 도식이다. */
const used = new Set();
for (const app of ["image", "t2v", "i2v"]) {
  const { photos, steps } = wizSteps(app);
  if (!photos) continue;                       // 예시 사진을 아예 안 쓰는 앱(i2v)
  for (const step of steps) {
    const withPhoto = step.opts.filter(o => map[o]);
    step.opts.forEach(o => { if (map[o]) used.add(o); });
    check(withPhoto.length === 0 || withPhoto.length === step.opts.length,
      `${app} 가이드 '${step.key}' 스텝에 사진 있는 선택지와 없는 선택지가 섞임`
      + ` (${withPhoto.length}/${step.opts.length}) — 사진 없는 쪽: `
      + step.opts.filter(o => !map[o]).join(", "));
  }
}
for (const label of labels)
  check(used.has(label),
    `GUIDE_IMG 의 '${label}' 을 어느 앱의 가이드도 쓰지 않음 — 사진이 화면에 나오지 않는다`);

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
