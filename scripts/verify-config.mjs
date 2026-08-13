/* 앱 설정(CONFIG) 검사 — src/app-config.d.ts 가 적어 둔 모양과 실제 값을 맞춘다.

   app.js 는 SLOT 으로 engine 조각들에 삽입되는 조각이라 그 자체로는 모듈이 아니고,
   엔진도 checkJs 가 꺼져 있다. 그래서 설정 쪽 오타 — 없는 섹션을 order 에
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
    window.__wiz = WIZ; window.__presets = PRESETS; window.__lookup = lookup;
    window.__moveGroups = MOVE_GROUPS;`);
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

  // ── 사용할 생성 모델 UI ──
  const modelLabel = w.document.querySelector("#modelBox .profile-label")?.textContent.trim();
  bad(modelLabel !== "사용할 생성 모델", `모델 선택 제목이 사용자용 문구가 아님: '${modelLabel}'`);
  bad(w.document.getElementById("modelSwitch")?.getAttribute("aria-label") !== "사용할 생성 모델",
    "모델 선택 접근성 이름이 화면 제목과 다름");
  bad(w.document.getElementById("modeHelp")?.textContent !== C.models[0]?.help,
    "기본 모델 도움말에 모델 선택과 무관한 설명이 섞임");
  if (app === "image") {
    bad(C.models[0]?.key !== "natural", "이미지 빌더의 신규 사용자 기본 모델이 GPT Image가 아님");
    for (const key of ["natural", "nano", "ideogram", "generic"])
      bad(!C.models.some(m => m.key === key), `이미지 빌더에 대표 모델 키가 없음: ${key}`);
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
  const seedanceModels = C.models.filter(m => m.seedance);
  bad(Boolean(C.sd) !== Boolean(seedanceModels.length),
    `CONFIG.sd 와 모델별 seedance 프로필 존재 여부가 다름`);
  for (const m of C.models) {
    bad(!m.key || !m.label || !m.help, `모델 '${m.key}' 에 key/label/help 중 빠진 것이 있음`);
    bad(!m.shortLabel, `모델 '${m.key}' 의 버튼용 모델명이 없음`);
    bad(/^(키워드형|문장형|범용|범용 영상)$/.test(m.shortLabel || ""),
      `모델 '${m.key}' 버튼이 실제 모델명 대신 기능명임: ${m.shortLabel}`);
    bad(/문장 해석|텍스트 이해력|키워드 나열형|구조화된 문장/.test(m.help),
      `모델 '${m.key}' 도움말이 선택 기준 대신 기능 방식을 설명함: ${m.help}`);
    if (m.limit) bad(!(m.limit.short < m.limit.detail),
      `모델 '${m.key}' 의 limit 이 간결<상세 가 아님 (${m.limit.short}/${m.limit.detail})`);
    if (!m.guard && !m.negative) bad(!m.noGuardReason,
      `모델 '${m.key}' 는 guard 도 negative 도 없는데 noGuardReason 도 없음 — 토글이 이유 없이 비활성된다`);
    /* 네거티브 칸은 모델의 별도 입력란에 그대로 붙여 넣는 값이다. 문장이 섞이면
       거기에 넣을 수 없다 — 쉼표로 나열된 키워드여야 한다. */
    if (m.negative) {
      bad(/[.!?]/.test(m.negative), `모델 '${m.key}' 의 negative 에 문장 부호가 있음: ${m.negative}`);
      bad(!m.negative.trim(), `모델 '${m.key}' 의 negative 가 비었음`);
    }
    if (m.seedance) {
      bad(typeof m.seedance.panelLabel !== "string" || !m.seedance.panelLabel.trim(),
        `모델 '${m.key}' 의 seedance.panelLabel 이 비었음`);
      for (const count of [2, 3]) {
        const times = m.seedance.timeline?.[count];
        bad(!Array.isArray(times) || times.length !== count,
          `모델 '${m.key}' 의 ${count}구간 타임라인 개수가 ${count}개가 아님`);
        if (!Array.isArray(times)) continue;
        let previousEnd = 0;
        for (const time of times) {
          const match = /^(\d+)-(\d+)s$/.exec(time);
          bad(!match, `모델 '${m.key}' 의 타임코드 형식이 잘못됨: ${time}`);
          if (!match) continue;
          const start = +match[1], end = +match[2];
          bad(start !== previousEnd || end <= start,
            `모델 '${m.key}' 의 타임코드가 연속 증가하지 않음: ${times.join(", ")}`);
          previousEnd = end;
        }
      }
    }
  }

  /* ── 무빙 그룹 라벨 ──
     MOVE_GROUPS 는 01-data 의 그룹 라벨을 문자열로 가리킨다. 라벨이 바뀌면 그 그룹은
     어느 버킷에도 안 담기고 프롬프트에서 조용히 사라진다 — 정적 검사로는 안 잡힌다. */
  if (C.sections.includes("move")) {
    const moveSec = DATA.find(d => d.id === "move");
    const real = new Set(moveSec.groups.map(g => g.label));
    const listed = Object.values(w.__moveGroups).flat();
    for (const label of listed)
      bad(!real.has(label), `MOVE_GROUPS 가 없는 그룹을 가리킴: '${label}'`);
    for (const label of real)
      bad(!listed.includes(label), `무빙 그룹 '${label}' 이 MOVE_GROUPS 어디에도 없음 — 프롬프트에서 빠진다`);
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
