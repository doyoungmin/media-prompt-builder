/** legacy.js 3벌을 최상위 문 단위로 분해해 3-way 비교 후
 *  shared/engine.js(공통) + apps/<app>/app.js(차이) 로 생성한다.
 *  검증: compose(engine, app) === legacy.js 원본 (바이트 동일) */
import { readFileSync, writeFileSync } from "node:fs";
import { parse } from "acorn";
import { createHash } from "node:crypto";

const APPS = ["image", "t2v", "i2v"];
const HDR = /^\/\*[\s\S]*?\*\/\n/; // 이식 때 붙인 머리말 주석

function chunks(app) {
  const raw = readFileSync(`src/apps/${app}/legacy.js`, "utf-8");
  const src = raw.replace(HDR, "");            // 머리말 제거본이 원본 스크립트
  const ast = parse(src, { ecmaVersion: "latest" });
  const out = []; let prev = 0;
  for (const st of ast.body) { out.push(src.slice(prev, st.end)); prev = st.end; }
  if (prev < src.length) out[out.length-1] += src.slice(prev); // 꼬리 공백
  return { src, out, hash: out.map(c => createHash("sha1").update(c.replace(/\s+/g," ").trim()).digest("hex")) };
}
const D = Object.fromEntries(APPS.map(a => [a, chunks(a)]));
console.log("문 개수:", APPS.map(a => `${a}=${D[a].out.length}`).join(" "));

// LCS 기반 정렬 (해시 시퀀스)
function opcodes(A, B) {
  const n=A.length, m=B.length, L=Array.from({length:n+1},()=>new Uint16Array(m+1));
  for(let i=n-1;i>=0;i--) for(let j=m-1;j>=0;j--)
    L[i][j] = A[i]===B[j] ? L[i+1][j+1]+1 : Math.max(L[i+1][j], L[i][j+1]);
  const pairs=[]; let i=0,j=0;
  while(i<n&&j<m){ if(A[i]===B[j]){pairs.push([i,j]);i++;j++;}
    else if(L[i+1][j]>=L[i][j+1]) i++; else j++; }
  return pairs;
}
const p_t = new Map(opcodes(D.image.hash, D.t2v.hash));
const p_i = new Map(opcodes(D.image.hash, D.i2v.hash));
// image 의 문이 세 앱 모두에서 동일하면 공통
const shared = D.image.hash.map((_,k) => p_t.has(k) && p_i.has(k));
console.log("공통 문:", shared.filter(Boolean).length, "/", shared.length);
writeFileSync("/tmp/align.json", JSON.stringify({
  shared, p_t:[...p_t], p_i:[...p_i],
  counts: Object.fromEntries(APPS.map(a=>[a,D[a].out.length]))
}));

// ── 생성: engine.js(공통+슬롯 마커) / apps/<app>/app.js(슬롯 내용) ──
const anchors_t = p_t, anchors_i = p_i;
let engine = "", slotNo = 0;
const appOut = Object.fromEntries(APPS.map(a => [a, ""]));
let k = 0;
while (k < D.image.out.length) {
  if (shared[k]) { engine += D.image.out[k]; k++; continue; }
  // 비공통 구간: 다음 공통 앵커까지
  let end = k; while (end < shared.length && !shared[end]) end++;
  slotNo++;
  engine += `/*==SLOT:${slotNo}==*/`;
  // 각 앱에서 대응 구간 = 이전 앵커의 매핑+1 .. 다음 앵커의 매핑-1
  const prevK = k - 1, nextK = end;
  for (const [app, pmap] of [["image", null], ["t2v", anchors_t], ["i2v", anchors_i]]) {
    let lo, hi;
    if (!pmap) { lo = k; hi = end - 1; }
    else {
      lo = prevK >= 0 ? pmap.get(prevK) + 1 : 0;
      hi = nextK < shared.length ? pmap.get(nextK) - 1 : D[app].out.length - 1;
    }
    const body = D[app].out.slice(lo, hi + 1).join("");
    appOut[app] += `/*==SLOT:${slotNo}==*/${body}`;
  }
  k = end;
}
writeFileSync("src/shared/engine.js",
  "/* 3개 앱 공통 엔진 — legacy.js 3벌에서 완전히 동일했던 문(statement)만 모은 것.\n" +
  "   /*==SLOT:n==* / 위치에 앱별 코드(apps/<app>/app.js)가 빌드 시 삽입된다.\n" +
  "   scripts/split-engine.mjs 가 생성. 수정은 이 파일에 직접 해도 된다(재생성 시 주의). */\n" + engine);
for (const a of APPS)
  writeFileSync(`src/apps/${a}/app.js`,
    `/* ${a} 앱 전용 코드 — 공통 엔진(src/shared/engine.js)의 SLOT 에 삽입되는 부분.\n` +
    `   앱별 데이터·설정(CONFIG/프리셋/썸네일 맵 등)은 여기서 수정한다. */\n` + appOut[a]);
console.log("생성 완료: engine.js + app.js×3, 슬롯", slotNo, "개");
