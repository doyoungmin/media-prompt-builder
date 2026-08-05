/* Seedance 출력 검수 — 프리셋을 적용한 뒤 모델별 실제 프롬프트 문자열을 뽑아 본다.
   npm run verify:seedance */
import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
import { compose } from "./compose-engine.mjs";

const SUBJECT = {
  t2v: "a woman walks through a rainy Tokyo alley, looking back over her shoulder",
  i2v: "her hair and coat drift in the wind while she slowly turns her head",
};

let fail = 0;
for (const app of ["t2v", "i2v"]) {
  const html = readFileSync(`${app}/index.html`, "utf-8")
    .replace(/<script type="module"[^>]*><\/script>/g, "");
  const dom = new JSDOM(html, { url: `https://example.com/${app}/`, runScripts: "outside-only", pretendToBeVisual: true });
  dom.window.eval(compose(app));
  const d = dom.window.document;
  const click = el => el.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));

  // 입력 + 선택을 채운다 (프리셋 1개 → 항목 다수 선택)
  const subj = d.getElementById("subject");
  subj.value = SUBJECT[app];
  subj.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
  const preset = d.querySelector("[data-preset]");
  if (preset) click(preset);

  const models = [...d.querySelectorAll("[data-model]")];
  console.log(`\n──────── ${app} · 모델 ${models.length}개: ${models.map(m => m.dataset.model).join(", ")}`);
  if (!models.some(m => m.dataset.model === "seedance")) { console.log("  ✗ seedance 버튼 없음"); fail = 1; }

  for (const m of models) {
    for (const len of ["short", "detail"]) {
      click(m);
      click(d.querySelector(`[data-length="${len}"]`));
      const txt = d.getElementById("prompt").value;
      const words = txt.trim() ? txt.trim().split(/\s+/).length : 0;
      const tag = `${m.dataset.model}/${len}`;
      console.log(`\n  [${tag}] ${words}단어`);
      console.log(`  ${txt}`);
      if (!txt) { console.log(`  ✗ ${tag} 빈 프롬프트`); fail = 1; }
      if (m.dataset.model === "seedance") {
        const bad = (cond, why) => { if (cond) { console.log(`  ✗ ${tag} ${why}`); fail = 1; } };
        // Seedance 는 라벨 블록을 화면 속 글자로 그리거나 무시한다
        bad(/(^|\s)[A-Z][A-Za-z ]{2,30}:\s/.test(txt), "라벨 블록이 남아 있음");
        bad(/\.\s*\./.test(txt) || /\s{2,}/.test(txt), "구두점/공백 이상");
        bad(words > 200, "200단어 초과 (Seedance 권장 상한)");
        // 명사구에 동사를 억지로 붙였을 때 나오는 비문들
        bad(/\bon shot on\b/i.test(txt), "장비 항목 앞에 중복 전치사(on shot on)");
        bad(/\bThe camera (static|slow|gimbal|crane|handheld)\b/.test(txt), "동사 없는 비문(The camera + 명사구)");
        bad(/\bas [a-z]+ shot\b/i.test(txt), "중복 표현(shot as ... shot)");
        // 모든 문장은 대문자로 시작해야 한다
        txt.split(/(?<=\.)\s+/).forEach(s => bad(/^[a-z]/.test(s), `소문자로 시작하는 문장: "${s.slice(0, 40)}"`));
        // 문장 조각 모드이므로 라벨 구분자 대신 마침표로만 끊긴다
        bad(!/\.$/.test(txt.trim()), "마지막이 마침표로 끝나지 않음");
      }
    }
  }
}
/* ── 경계 상황: 선택 0개 / 입력 없음 ── */
for (const app of ["t2v", "i2v"]) {
  const html = readFileSync(`${app}/index.html`, "utf-8")
    .replace(/<script type="module"[^>]*><\/script>/g, "");
  const dom = new JSDOM(html, { url: `https://example.com/${app}/`, runScripts: "outside-only", pretendToBeVisual: true });
  dom.window.eval(compose(app));
  const d = dom.window.document;
  const click = el => el.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
  click(d.querySelector('[data-model="seedance"]'));
  const setSubj = v => {
    const s = d.getElementById("subject");
    s.value = v; s.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
    return d.getElementById("prompt").value;
  };
  console.log(`\n──────── ${app} · 경계 상황 (seedance)`);
  const onlySubject = setSubj("a cat leaps onto a windowsill");
  console.log(`  [선택 0개]  "${onlySubject}"`);
  if (/\s{2,}|\.\s*\./.test(onlySubject)) { console.log("  ✗ 선택 0개에서 구두점/공백 이상"); fail = 1; }
  if (app === "t2v" && !onlySubject.startsWith("A cat leaps")) { console.log("  ✗ 첫 글자 대문자화 실패"); fail = 1; }
  const noSubject = setSubj("");
  console.log(`  [입력 없음] "${noSubject}"`);
  // i2v 는 움직임 입력이 없으면 프롬프트를 만들지 않는 것이 정상 동작이다
  if (app === "i2v" && noSubject !== "") { console.log("  ✗ i2v 는 입력이 없으면 빈 문자열이어야 함"); fail = 1; }
  if (/^\s|\s{2,}/.test(noSubject)) { console.log("  ✗ 입력 없음에서 앞쪽 공백 발생"); fail = 1; }
}

console.log(fail ? "\n검수 실패" : "\n검수 통과");
process.exit(fail);
