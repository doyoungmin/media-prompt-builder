/* CSS 자책골 검사 — 같은 블록에서 longhand 를 shorthand 보다 먼저 선언하면
   뒤에 오는 shorthand 가 그것을 통째로 덮어쓴다. 조용히 사라지므로 눈으로는 안 보이고
   jsdom 은 레이아웃을 계산하지 않아 스모크 테스트로도 못 잡는다.

   실제로 이 코드베이스에서 났던 일:
     .out-in>.out-actions{ ... margin-top:auto; ... margin:0 -16px -16px; ... }
   → computed margin-top 이 0 이 되어 '동작 바를 항상 레일 바닥에' 가 아예 동작하지 않았다.

   npm run lint:css */
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

/** shorthand → 그 shorthand 가 덮어쓰는 longhand 들 */
const SHORTHANDS = {
  margin:        ["margin-top", "margin-right", "margin-bottom", "margin-left"],
  padding:       ["padding-top", "padding-right", "padding-bottom", "padding-left"],
  inset:         ["top", "right", "bottom", "left"],
  gap:           ["row-gap", "column-gap"],
  flex:          ["flex-grow", "flex-shrink", "flex-basis"],
  "flex-flow":   ["flex-direction", "flex-wrap"],
  background:    ["background-color", "background-image", "background-position",
                  "background-size", "background-repeat", "background-attachment"],
  font:          ["font-style", "font-variant", "font-weight", "font-size",
                  "line-height", "font-family"],
  border:        ["border-width", "border-style", "border-color",
                  "border-top", "border-right", "border-bottom", "border-left"],
  "border-radius": ["border-top-left-radius", "border-top-right-radius",
                    "border-bottom-right-radius", "border-bottom-left-radius"],
  overflow:      ["overflow-x", "overflow-y"],
  "place-items": ["align-items", "justify-items"],
  transition:    ["transition-property", "transition-duration",
                  "transition-timing-function", "transition-delay"],
};
/** longhand → 그것을 덮어쓰는 shorthand */
const OWNER = {};
for (const [short, longs] of Object.entries(SHORTHANDS))
  for (const l of longs) (OWNER[l] ||= []).push(short);

export function findClobbered(css) {
  const hits = [];
  // 가장 안쪽 블록만 고른다 ({ } 를 더 품지 않는 것). @media 같은 겹블록은 자연히 건너뛴다.
  for (const m of css.matchAll(/\{([^{}]*)\}/g)) {
    const body = m[1];
    // 블록이 시작하는 줄 번호 (사람이 찾아갈 수 있게)
    const line = css.slice(0, m.index).split("\n").length;
    const seen = new Map();   // 속성 → 이 블록에서 처음 나온 순서
    const props = body.split(";")
      .map(d => d.split(":")[0].trim().toLowerCase())
      .filter(p => p && !p.startsWith("--") && !p.startsWith("/*"));
    props.forEach((p, i) => { if (!seen.has(p)) seen.set(p, i); });

    for (const [prop, at] of seen) {
      for (const short of OWNER[prop] || []) {
        const shortAt = seen.get(short);
        if (shortAt !== undefined && shortAt > at) {
          hits.push({ line, prop, short,
            선언: body.split(";").map(s => s.trim()).filter(Boolean).slice(0, 12).join("; ") });
        }
      }
    }
  }
  return hits;
}

/* 주석이 어긋나면 그 뒤 규칙이 통째로 사라진다.
   CSS 파서는 잘못된 자리를 만나면 다음 { } 덩어리까지 삼키고 넘어가므로,
   짝 없는 주석 끝 하나에 바로 아래 규칙이 조용히 없어진다 — 빌드는 성공한다. */
export function findCommentBreaks(css) {
  const hits = [];
  let inComment = false, line = 1, openedAt = 0;
  for (let i = 0; i < css.length; i++) {
    if (css[i] === "\n") { line++; continue; }
    if (!inComment && css[i] === "/" && css[i + 1] === "*") { inComment = true; openedAt = line; i++; }
    else if (inComment && css[i] === "*" && css[i + 1] === "/") { inComment = false; i++; }
    else if (!inComment && css[i] === "*" && css[i + 1] === "/") {
      hits.push({ line, why: "열리지 않은 주석이 닫힙니다 — 그 위 줄들이 CSS 로 해석되어 아래 규칙이 사라집니다" });
      i++;
    }
  }
  if (inComment) hits.push({ line: openedAt, why: "주석이 닫히지 않았습니다" });
  return hits;
}

// 직접 실행할 때만 검사한다 (테스트에서 findClobbered 만 import 할 수 있게)
if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  let fail = 0;
  for (const f of ["src/shared/styles.css"]) {
    const css = readFileSync(f, "utf-8");
    const breaks = findCommentBreaks(css);
    for (const b of breaks) { fail = 1; console.log(`✗ ${f}:${b.line} — ${b.why}`); }
    const hits = findClobbered(css);
    if (!hits.length && !breaks.length) { console.log(`${f} OK`); continue; }
    if (hits.length) fail = 1;
    for (const h of hits) {
      console.log(`✗ ${f}:${h.line} — '${h.prop}' 를 먼저 쓰고 뒤에 '${h.short}' shorthand 가 와서 지워집니다.`);
      console.log(`    ${h.선언}`);
      console.log(`    → shorthand 를 먼저 쓰거나, 한 줄로 합치세요 (예: margin:auto -16px 0).`);
    }
  }
  process.exit(fail);
}
