/* 앱 설정(CONFIG) 검사 — src/app-config.d.ts 가 적어 둔 모양과 실제 값을 맞춘다.

   app.js 는 SLOT 으로 engine.js 에 삽입되는 조각이라 그 자체로는 모듈이 아니고,
   engine.js 는 checkJs 도 꺼져 있다. 그래서 설정 쪽 오타 — 없는 섹션을 order 에
   넣는다든가, wiz 선택지가 존재하지 않는 항목을 가리킨다든가, 모델 키가 겹친다든가 —
   는 화면을 열어 보기 전까지 아무도 잡아 주지 않았다.
   타입으로는 '문자열이다'까지밖에 못 보므로, 실제로 존재하는지까지 여기서 본다.

   npm run verify:config */
import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
import { compose } from "./compose-engine.mjs";

const APPS = ["image", "t2v", "i2v"];
let fail = 0;

function load(app) {
  const html = readFileSync(`${app}/index.html`, "utf-8")
    .replace(/<script type="module"[^>]*><\/script>/g, "");
  const dom = new JSDOM(html, { url: `https://example.com/${app}/`,
    runScripts: "outside-only", pretendToBeVisual: true });
  dom.window.eval(compose(app) + `
    window.__cfg = CONFIG; window.__data = DATA; window.__order = ORDER;
    window.__wiz = WIZ; window.__presets = PRESETS; window.__lookup = lookup;`);
  return dom.window;
}

for (const app of APPS) {
  const errs = [];
  const bad = (cond, msg) => { if (cond) errs.push(msg); };
  const w = load(app);
  const C = w.__cfg, DATA = w.__data, lookup = w.__lookup;
  const requiredStrings = ["title", "sub", "subjectLabel", "subjectPlaceholder"];
  for (const key of requiredStrings)
    bad(typeof C?.[key] !== "string", `${key} 는 문자열이어야 함`);
  for (const key of ["sections", "order", "wiz", "models"])
    bad(!Array.isArray(C?.[key]), `${key} 는 배열이어야 함`);
  bad(!C?.quick || typeof C.quick !== "object" || Array.isArray(C.quick), "quick 은 객체여야 함");
  bad(typeof C?.build !== "function", "build 는 함수여야 함");
  if (errs.length) {
    console.log(`${app.padEnd(6)} ✗\n  ${errs.join("\n  ")}`);
    fail = 1;
    continue;
  }
  const secIds = new Set(DATA.map(d => d.id));
  const itemNames = new Set(Object.keys(lookup));

  // ── 섹션 ──
  bad(!Array.isArray(C.sections) || !C.sections.length, "sections 가 비었음");
  for (const id of C.sections) bad(!secIds.has(id), `sections 에 없는 섹션: ${id}`);
  bad(new Set(C.sections).size !== C.sections.length, "sections 에 중복이 있음");
  for (const id of C.order) bad(!C.sections.includes(id), `order 에 sections 밖 섹션: ${id}`);
  bad(new Set(C.order).size !== C.order.length, "order 에 중복이 있음");
  for (const id of C.sections) bad(!C.short?.[id], `short 에 빠진 섹션: ${id}`);
  for (const id of Object.keys(C.notes || {}))
    bad(!C.sections.includes(id), `notes 가 쓰지 않는 섹션을 가리킴: ${id}`);

  // ── 출력 범위 묶음 ──
  for (const [name, ids] of Object.entries(C.quick || {})) {
    bad(!ids.length, `quick '${name}' 이 비었음`);
    for (const id of ids) bad(!C.sections.includes(id), `quick '${name}' 이 없는 섹션을 가리킴: ${id}`);
  }

  // ── 대상 모델 ──
  const keys = C.models.map(m => m.key);
  bad(new Set(keys).size !== keys.length, `모델 키가 겹침: ${keys.join(", ")}`);
  for (const m of C.models) {
    bad(!m.key || !m.label || !m.help, `모델 '${m.key}' 에 key/label/help 중 빠진 것이 있음`);
    if (m.limit) bad(!(m.limit.short < m.limit.detail),
      `모델 '${m.key}' 의 limit 이 간결<상세 가 아님 (${m.limit.short}/${m.limit.detail})`);
    if (!m.guard) bad(!m.noGuardReason,
      `모델 '${m.key}' 는 guard 가 없는데 noGuardReason 도 없음 — 토글이 이유 없이 비활성된다`);
  }

  // ── 가이드 ──
  const wizKeys = C.wiz.map(s => s.key);
  bad(new Set(wizKeys).size !== wizKeys.length, `wiz 키가 겹침: ${wizKeys.join(", ")}`);
  for (const step of C.wiz) {
    bad(!step.q, `wiz '${step.key}' 에 질문이 없음`);
    for (const [opt, items] of Object.entries(step.opts || {})) {
      bad(!items.length, `wiz '${step.key}' 의 '${opt}' 가 비었음`);
      for (const it of items)
        bad(!itemNames.has(it), `wiz '${step.key}' > '${opt}' 가 없는 항목을 가리킴: ${it}`);
    }
    for (const opt of Object.keys(step.why || {}))
      bad(!step.opts?.[opt], `wiz '${step.key}' 의 why 에만 있는 선택지: ${opt}`);
  }

  // ── 프리셋 ──
  for (const [name, items] of Object.entries(w.__presets || {}))
    for (const it of items)
      bad(!itemNames.has(it), `프리셋 '${name}' 이 없는 항목을 가리킴: ${it}`);

  // ── Seedance 패널 ──
  if (C.sd) {
    bad(typeof C.sd.preserve !== "boolean", "sd.preserve 는 boolean 이어야 함");
    if (C.sd.segHints) bad(C.sd.segHints.length < 3,
      `sd.segHints 가 ${C.sd.segHints.length}개 — 3구간 모드에서 모자람`);
  }

  // ── build() 가 모든 모델에서 문자열을 내놓는가 ──
  for (const m of C.models) {
    let out;
    try { out = C.build(m.key); }
    catch (e) { errs.push(`build('${m.key}') 가 던짐: ${String(e.message).split("\n")[0]}`); continue; }
    bad(typeof out !== "string", `build('${m.key}') 가 문자열을 내놓지 않음: ${typeof out}`);
  }
  // 정의되지 않은 키로 불러도 죽지 않아야 한다(저장된 옛 모델 키 등)
  try { C.build("__없는모델__"); }
  catch (e) { errs.push(`없는 모델 키에 build() 가 던짐: ${String(e.message).split("\n")[0]}`); }

  // ── 죽은 설정 ──
  for (const it of C.dropItems || [])
    bad(itemNames.has(it), `dropItems 가 살아 있는 항목을 가리킴(빼지 못함): ${it}`);

  console.log(`${app.padEnd(6)} ${errs.length ? "✗\n  " + errs.join("\n  ") : "OK"}`);
  if (errs.length) fail = 1;
}
console.log(fail ? "\n설정 검사 실패" : "\n설정 검사 통과");
process.exit(fail);
