/* Seedance 2.0 출력 검수 — 실제 프롬프트 문자열을 뽑아 형식과 경계 상황을 확인한다.
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
  dom.window.eval(compose(app));
  const d = dom.window.document;
  return {
    dom, d,
    click: sel => { const el = typeof sel === "string" ? d.querySelector(sel) : sel;
      el.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true })); },
    fill: (sel, v) => { const el = d.querySelector(sel); el.value = v;
      el.dispatchEvent(new dom.window.Event("input", { bubbles: true })); },
    out: () => d.getElementById("prompt").value,
  };
}

for (const app of ["t2v", "i2v"]) {
  const { d, click, fill, out } = boot(app);
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
    bad(tag, !/^Audio: /m.test(txt), "Audio 줄 없음");
    bad(tag, lines.length < 4, "줄이 뭉개짐 (dedupe 가 줄바꿈을 먹었을 가능성)");
    bad(tag, /\s{2,}/.test(txt) || /\.\s*\./.test(txt), "구두점/공백 이상");
    bad(tag, txt.trim().split(/\s+/).length > 220, "220단어 초과");
    lines.forEach(l => bad(tag, /^[a-z]/.test(l), `소문자로 시작하는 줄: "${l.slice(0, 40)}"`));
  }

  // 구간 3개로 늘리면 세 번째 구간 줄이 생겨야 한다
  click('[data-sd-count="3"]');
  fill('[data-sd-seg="2"]', SEGS[app][2]);
  bad(app, !/^6-10s: /m.test(out()), "3구간 모드에서 6-10s 줄이 없음");

  // 오디오 전환
  click('[data-sd-audio="none"]');
  bad(app, !/Audio: silent/.test(out()), "무음 선택이 반영되지 않음");
  bad(app, !d.getElementById("sdNote").hidden, "무음인데 메모 입력칸이 보임");
  click('[data-sd-audio="dialogue"]');
  fill("#sdNote", "footsteps on wet pavement");
  bad(app, !/Footsteps on wet pavement\./.test(out()), "오디오 메모가 반영되지 않음");

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

  // 초기화
  click('[data-act="reset"]');
  bad(app, /0-3s: /.test(out()), "초기화 후에도 구간 내용이 남아 있음");
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
  bad(app, !/^Audio: /m.test(txt), "구간이 없어도 Audio 줄은 있어야 함");
  bad(app, /^\s|undefined|NaN/.test(txt), "앞쪽 공백 또는 undefined 누출");
}

console.log(fail ? "\n검수 실패" : "\n검수 통과");
process.exit(fail);
