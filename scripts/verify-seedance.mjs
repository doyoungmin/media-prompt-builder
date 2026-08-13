/* 프롬프트 조립 검수 — 실제 출력 문자열을 뽑아 형식과 경계 상황을 확인한다.

   원래 Seedance 전용으로 시작했지만 검사할 것이 형식 전반으로 늘었다:
   구간 줄·오디오·줄바꿈 보존에 더해 사람이 쓴 말이 dedupe 에 지워지지 않는지,
   피사체 꼬리 마침표, 아무것도 안 썼을 때 빈 프롬프트인지까지 본다.
   이름은 verify:seedance 그대로다 — CI 워크플로까지 함께 고쳐야 해서 나중으로 미뤘다.

   npm run verify:seedance */
import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
import { compose } from "./compose-engine.mjs";

const SUBJECT = {
  t2v: "a woman walks through a rainy Tokyo alley at night",
  i2v: "her hair and coat drift in the wind",
};
const SEGS = {
  t2v: ["she walks slowly, neon reflections ripple across the wet pavement",
        "she hears something behind her, pauses, and looks back over her shoulder",
        "she pulls her coat tighter and walks out of frame"],
  i2v: ["her hair moves gently in the wind",
        "she slowly turns her head toward the camera and blinks once",
        "she settles and holds the gaze"],
};

let fail = 0;
const bad = (tag, cond, why) => { if (cond) { console.log(`  ✗ ${tag} ${why}`); fail = 1; } };

function boot(app) {
  const html = readFileSync(`${app}/index.html`, "utf-8")
    .replace(/<script type="module"[^>]*><\/script>/g, "");
  const dom = new JSDOM(html, { url: `https://example.com/${app}/`, runScripts: "outside-only", pretendToBeVisual: true });
  dom.window.eval(compose(app) + `
    /* 검사에서 '진짜 항목 문구' 를 집으려면 켜져 있는 항목과 그 영어 문구가 필요하다.
       출력 문자열에서 조각을 주워 쓰면 "animate this image" 같은 고정 문구까지 섞인다. */
    window.__state = state; window.__lookup = lookup;`);
  const d = dom.window.document;
  return {
    dom, d, win: dom.window,
    click: sel => { const el = typeof sel === "string" ? d.querySelector(sel) : sel;
      el.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true })); },
    fill: (sel, v) => { const el = d.querySelector(sel); el.value = v;
      el.dispatchEvent(new dom.window.Event("input", { bubbles: true })); },
    out: () => d.getElementById("prompt").value,
  };
}

for (const app of ["t2v", "i2v"]) {
  const { dom, d, click, fill, out } = boot(app);
  console.log(`\n──────── ${app}`);

  const models = [...d.querySelectorAll("[data-model]")].map(m => m.dataset.model);
  console.log(`  모델: ${models.join(", ")}`);
  bad(app, !models.includes("seedance"), "seedance 버튼 없음");

  // Seedance 패널은 seedance 모델일 때만 보여야 한다
  click('[data-model="veo"]');
  bad(app, !d.getElementById("sdBox").hidden, "veo 모드에서 Seedance 패널이 보임");
  click('[data-model="seedance"]');
  bad(app, d.getElementById("sdBox").hidden, "seedance 모드에서 패널이 안 보임");
  bad(app, !!d.querySelector("[data-sd-preserve]") !== (app === "i2v"),
      "참조 유지 컨트롤이 잘못된 앱에 있음");

  fill("#subject", SUBJECT[app]);
  fill('[data-sd-seg="0"]', SEGS[app][0]);
  fill('[data-sd-seg="1"]', SEGS[app][1]);
  click(d.querySelector("[data-preset]"));
  click('[data-model="seedance"]');

  for (const len of ["short", "detail"]) {
    click(`[data-length="${len}"]`);
    const txt = out();
    const tag = `seedance/${len}`;
    const lines = txt.split("\n");
    console.log(`\n  [${tag}] ${txt.trim().split(/\s+/).length}단어 · ${lines.length}줄`);
    console.log(txt.split("\n").map(l => "  | " + l).join("\n"));

    bad(tag, !txt, "빈 프롬프트");
    // 2.0 의 핵심 — 시간 구간이 각각 제 줄에 있어야 한다
    bad(tag, !lines.some(l => /^0-3s: /.test(l)), "0-3s 구간 줄 없음");
    bad(tag, !lines.some(l => /^3-6s: /.test(l)), "3-6s 구간 줄 없음");
    bad(tag, /^Audio: /m.test(txt), "오디오를 안 골랐는데 Audio 줄이 나옴");
    bad(tag, lines.length < 4, "줄이 뭉개짐 (dedupe 가 줄바꿈을 먹었을 가능성)");
    bad(tag, /\s{2,}/.test(txt) || /\.\s*\./.test(txt), "구두점/공백 이상");
    bad(tag, txt.trim().split(/\s+/).length > 220, "220단어 초과");
    lines.forEach(l => bad(tag, /^[a-z]/.test(l), `소문자로 시작하는 줄: "${l.slice(0, 40)}"`));
  }

  // 구간 3개로 늘리면 세 번째 구간 줄이 생겨야 한다
  click('[data-sd-count="3"]');
  fill('[data-sd-seg="2"]', SEGS[app][2]);
  bad(app, !/^6-10s: /m.test(out()), "3구간 모드에서 6-10s 줄이 없음");

  // 오디오 — 기본은 무음(줄 없음), 고른 뒤에만 Audio 줄이 붙는다
  bad(app, !d.getElementById("sdNote").hidden, "기본 무음인데 메모 입력칸이 보임");
  click('[data-sd-audio="ambient"]');
  bad(app, !/^Audio: ambient sound/m.test(out()), "환경음 선택이 반영되지 않음");
  bad(app, d.getElementById("sdNote").hidden, "오디오를 골랐는데 메모 입력칸이 안 보임");
  click('[data-sd-audio="dialogue"]');
  fill("#sdNote", "footsteps on wet pavement");
  bad(app, !/Footsteps on wet pavement\./.test(out()), "오디오 메모가 반영되지 않음");
  click('[data-sd-audio="none"]');
  bad(app, /Audio/.test(out()), "무음으로 되돌렸는데 Audio 줄이 남음");
  bad(app, !d.getElementById("sdNote").hidden, "무음인데 메모 입력칸이 보임");

  // i2v 참조 유지 수준
  if (app === "i2v") {
    click('[data-sd-preserve="natural"]');
    bad(app, !/recognisable/.test(out()), "'자연스러운 변주' 가 반영되지 않음");
    click('[data-sd-preserve="strict"]');
    bad(app, !/unchanged from the reference image/.test(out()), "'엄격 유지' 가 반영되지 않음");
  }

  // 되돌리기가 Seedance 입력까지 되돌리는가
  const before = out();
  click('[data-sd-count="2"]');
  click("#undoBtn");
  bad(app, out() !== before, "되돌리기가 Seedance 입력을 복구하지 못함");

  /* 구간 '텍스트' 편집도 한 단계로 잡혀야 한다 — 구간 수 버튼만 되고 텍스트는
     빠져 있어서, 같은 패널 안에서 되돌리기가 되는 것과 안 되는 것이 섞여 있었다. */
  const seg0 = d.querySelector('[data-sd-seg="0"]');
  const kept = out();
  const undoText = () => d.getElementById("undoCount").textContent;
  const steps = () => +undoText().split("/")[0];
  const beforeSteps = steps();
  seg0.dispatchEvent(new dom.window.FocusEvent("focusin", { bubbles: true }));
  fill('[data-sd-seg="0"]', "a completely different opening beat");
  seg0.dispatchEvent(new dom.window.FocusEvent("focusout", { bubbles: true }));
  bad(app, steps() !== beforeSteps + 1,
      `구간 텍스트 편집이 되돌리기 단계로 안 잡힘 (${beforeSteps} → ${steps()})`);
  click("#undoBtn");
  bad(app, out() !== kept, "구간 텍스트 편집을 되돌리지 못함");
  bad(app, d.querySelector('[data-sd-seg="0"]').value !== SEGS[app][0],
      "되돌린 뒤 입력칸 값이 복구되지 않음");

  // 초기화
  click('[data-act="reset"]');
  bad(app, /0-3s: /.test(out()), "초기화 후에도 구간 내용이 남아 있음");
}

/* ── 사람이 쓴 줄은 앞줄과 문구가 겹쳐도 지워지지 않는다 ──
   dedupe 가 모든 줄을 훑던 시절, 피사체 한 줄에 쓴 표현을 구간 서술에서 또 쓰면
   구간 쪽 그 부분이 통째로 사라졌다. 쓴 사람에게는 입력한 문장이 이유 없이 증발한 것으로 보인다.

   겹침의 '방향'이 중요하다. 줄은 위에서 아래로 처리되므로 Camera·Style 은 구간 줄보다
   뒤에 있고, 구간에 항목과 같은 문구를 써도 구간 쪽이 먼저 등록돼 살아남는다.
   구간이 실제로 잘리는 건 그보다 위에 있는 '피사체 줄'과 겹칠 때뿐이다.
   (이 방향을 뒤집어 놓고 검사를 짰다가, 고친 곳을 되돌려도 초록인 헛도는 검사를 만들었다.) */
const ECHO = "neon reflections ripple across the wet pavement";
for (const app of ["t2v", "i2v"]) {
  const { d, click, fill, out } = boot(app);
  click('[data-model="seedance"]');
  fill("#subject", `${SUBJECT[app]}, ${ECHO}`);
  click(d.querySelector("[data-preset]"));
  fill('[data-sd-seg="0"]', `${ECHO}, and then she steps forward`);

  const txt = out();
  const segLine = txt.split("\n").find(l => /^0-3s: /.test(l));
  console.log(`\n──────── ${app} · 피사체와 겹친 구간 서술`);
  console.log(`  | ${txt.split("\n")[0]}\n  | ${segLine}`);

  bad(app, !segLine, "구간 서술을 넣었는데 0-3s 줄이 사라짐");
  bad(app, segLine && !segLine.toLowerCase().includes(ECHO),
      `피사체와 겹친 문구가 구간 서술에서 지워짐 — "${ECHO}"`);
  bad(app, segLine && !/and then she steps forward/.test(segLine),
      "구간 서술의 나머지 부분이 지워짐");

  /* 반대편도 확인 — 사람이 쓴 줄을 지키느라 항목 쪽 중복 제거까지 멈추면 안 된다.
     피사체에 항목 문구를 그대로 넣으면 Camera·Style 에서는 빠져야 한다. */
  const { d: d2, click: c2, fill: f2, out: o2 } = boot(app);
  c2('[data-model="seedance"]');
  f2("#subject", SUBJECT[app]);
  c2(d2.querySelector("[data-preset]"));
  const itemLine = o2().split("\n").find(l => /^(Camera|Style): /.test(l));
  bad(app, !itemLine, "Camera/Style 줄이 없어 항목 중복 제거를 검사할 수 없음");
  if (!itemLine) continue;
  /* 검사할 문구를 여기 적어 두지 않고 엔진이 방금 내보낸 것을 되먹이는 이유 —
     항목 문구가 바뀌면 적어 둔 값은 어디에도 안 걸리고 조용히 헛도는 검사가 된다. */
  const phrase = itemLine.replace(/^(Camera|Style): /, "").split(", ")[0].toLowerCase();
  f2("#subject", `${SUBJECT[app]}, ${phrase}`);
  const parts = o2().toLowerCase().split(/[\n,.]/).map(s => s.trim());
  const hits = parts.filter(p => p === phrase).length;
  console.log(`  · 항목 중복 제거 — "${phrase}" ${hits}회`);
  bad(app, hits !== 1, `항목 중복 제거가 멈춤 — "${phrase}" 가 ${hits}번 나옴`);
}

/* ── 사용자가 쓴 것이 하나도 없을 때 ──
   유지 지시와 가드는 사용자가 쓴 내용이 아니다. 그것만으로 문자열이 차면 복사 버튼이
   살아나서, 아무것도 입력하지 않은 사람이 보일러플레이트만 든 '완성된 프롬프트'를
   복사해 간다. 항목만 고른 상태가 정확히 그 상황이다. */
for (const app of ["t2v", "i2v"]) {
  const { d, click, out } = boot(app);
  click('[data-model="seedance"]');
  click(d.querySelector("[data-preset]"));      // 항목만 고르고 글은 한 자도 안 씀
  const txt = out();
  console.log(`\n──────── ${app} · 항목만 선택 (피사체·구간 미입력)`);
  console.log(`  | ${txt ? txt.split("\n")[0] : "(빈 프롬프트 — 의도한 결과)"}`);
  bad(app, !!txt, `사용자 입력이 없는데 프롬프트가 만들어짐: "${txt.slice(0, 60)}…"`);
  bad(app, !d.getElementById("copyBtn").disabled, "빈 프롬프트인데 복사 버튼이 활성");
}

/* ── 피사체 꼬리 마침표 ──
   키워드 나열형은 피사체를 쉼표로 이어 붙이므로 "…windowsill., golden hour…" 가 나갔다. */
{
  const MODELS = { image: ["generic", "natural"],
                   t2v:   ["veo", "generic", "seedance"],
                   i2v:   ["veo", "generic", "seedance"] };
  for (const [app, models] of Object.entries(MODELS)) {
    const { d, click, fill, out } = boot(app);
    fill("#subject", "a cat leaps onto a windowsill.");
    click(d.querySelector("[data-preset]"));
    for (const m of models) {
      click(`[data-model="${m}"]`);
      const txt = out();
      bad(`${app}/${m}`, /\.\s*,/.test(txt),
          `피사체 꼬리 마침표가 쉼표 앞에 남음: "${txt.slice(0, 80)}…"`);
      bad(`${app}/${m}`, /\.\./.test(txt), "마침표가 겹침");
    }
  }
  console.log("\n──────── 피사체 꼬리 마침표 검사 완료");
}

/* ── 피사체에 쓴 말은 항목과 겹쳐도 지워지지 않는다 (한 줄 출력) ──
   한 줄 출력은 라벨 블록을 순서대로 이어 붙이고 dedupe 는 앞에서부터 훑는다. 그래서
   항목 블록이 피사체 블록보다 **앞에** 있으면, 피사체에 쓴 조각이 그 항목 문구와 정확히
   같을 때 사용자가 쓴 쪽이 지워진다. t2v/veo 가 실제로 그랬다:
     피사체 "a woman walks away, wide shot" + 와이드/풀샷 선택
     → Subject and action: a woman walks away.   ("wide shot" 이 증발)

   블록 순서는 앞으로도 바뀔 수 있고 그때 조용히 되살아나는 종류라, 앱·모델 전부를 본다.
   되먹일 문구는 **켜져 있는 항목의 영어 문구**에서 집는다. 출력 문자열에서 조각을 주우면
   "animate this image" 같은 build 가 박아 넣는 고정 문구까지 섞여, 그걸 피사체에 쓰면
   지워지는 게 맞는데도 실패로 잡힌다(실제로 그렇게 한 번 헛짚었다). */
for (const app of ["image", "t2v", "i2v"]) {
  const { d, win, click, fill, out } = boot(app);
  const SUBJ = "a woman walks away";
  fill("#subject", SUBJ);
  click(d.querySelector("[data-preset]"));
  const models = [...d.querySelectorAll("[data-model]")].map(m => m.dataset.model);

  // 지금 켜져 있는 항목들의 영어 문구 첫 조각 — dedupe 가 정확 일치로 보는 단위와 같다
  const phrases = [...new Set(
    Object.values(win.__state)
      .flatMap(set => [...set])
      .map(kr => win.__lookup[kr].en.split(", ")[0].replace(/[.\s]+$/, ""))
      .filter(Boolean))];
  console.log(`\n──────── ${app} · 피사체가 항목 문구와 겹칠 때 (항목 ${phrases.length}개 되먹임)`);
  bad(app, phrases.length < 3, `되먹일 항목이 ${phrases.length}개뿐 — 검사가 헐거워진다`);

  for (const m of models) {
    click(`[data-model="${m}"]`);
    const lost = [];
    for (const phrase of phrases) {
      fill("#subject", `${SUBJ}, ${phrase}`);
      if (!out().toLowerCase().includes(`${SUBJ}, ${phrase}`.toLowerCase())) lost.push(phrase);
    }
    console.log(`  ${lost.length ? "✗  " : "OK "}[${m}]${lost.length ? ` 지워짐: ${lost.join(" · ")}` : ""}`);
    bad(`${app}/${m}`, lost.length, `피사체에 쓴 항목 문구가 지워짐: ${lost.join(" · ")}`);
  }
}

/* ── 기존 모델 회귀 — 줄바꿈 보존 수정이 Veo·범용 출력을 바꾸면 안 된다 ── */
{
  const { d, click, fill, out } = boot("t2v");
  fill("#subject", "a cat leaps onto a windowsill");
  click(d.querySelector("[data-preset]"));
  for (const m of ["veo", "generic"]) {
    click(`[data-model="${m}"]`);
    const txt = out();
    console.log(`\n──────── 회귀 · ${m}: ${txt.slice(0, 90)}…`);
    bad(m, txt.includes("\n"), "한 줄이어야 할 출력에 줄바꿈이 생김");
    bad(m, /\s{2,}/.test(txt), "공백이 겹침");
    bad(m, !txt, "빈 프롬프트");
  }
}

/* ── 경계 상황: 구간을 하나도 안 채웠을 때 ── */
for (const app of ["t2v", "i2v"]) {
  const { click, fill, out } = boot(app);
  click('[data-model="seedance"]');
  fill("#subject", app === "t2v" ? "a cat leaps onto a windowsill" : "the cat blinks slowly");
  const txt = out();
  console.log(`\n──────── ${app} · 구간 미입력\n${txt.split("\n").map(l => "  | " + l).join("\n")}`);
  bad(app, /\n\n/.test(txt) || /\s{2,}/.test(txt), "빈 줄/공백이 남음");
  bad(app, /^Audio: /m.test(txt), "오디오 미선택인데 Audio 줄이 나옴");
  bad(app, /^\s|undefined|NaN/.test(txt), "앞쪽 공백 또는 undefined 누출");
}

console.log(fail ? "\n검수 실패" : "\n검수 통과");
process.exit(fail);
