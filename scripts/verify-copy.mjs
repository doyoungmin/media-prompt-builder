/* 복사 완료 피드백 뒤에도 버튼의 아이콘·레이블 구조가 유지되는지 검증한다.
   복사할 칸이 둘(본문 · 네거티브)이라 두 버튼을 같은 기준으로 본다. */
import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
import { compose } from "./compose-engine.mjs";

const html = readFileSync("image/index.html", "utf-8")
  .replace(/<script type="module"[^>]*><\/script>/g, "");
const dom = new JSDOM(html, {
  url: "https://example.com/image/",
  runScripts: "outside-only",
  pretendToBeVisual: true,
});
dom.window.document.execCommand = () => true;
dom.window.eval(compose("image"));

const d = dom.window.document;
const subject = d.getElementById("subject");
subject.value = "a cat in a sunlit room";
subject.dispatchEvent(new dom.window.Event("input", { bubbles: true }));

/* 1.4초를 실제로 기다리지 않고 복구 콜백까지 즉시 실행한다. */
dom.window.setTimeout = fn => { fn(); return 0; };

const errors = [];
const checkButton = (button, tag) => {
  button.click();
  if (!button.querySelector("svg use[href='#i-copy']")) errors.push(`${tag} 복사 후 아이콘이 사라짐`);
  if (!button.querySelector(".copy-tx")) errors.push(`${tag} 복사 후 .copy-tx 레이블이 사라짐`);
  if (button.querySelector(".copy-tx")?.textContent !== "복사") errors.push(`${tag} 복사 완료 후 레이블이 복구되지 않음`);
  if (button.classList.contains("done")) errors.push(`${tag} 복사 완료 상태가 해제되지 않음`);
};
checkButton(d.getElementById("copyBtn"), "본문");

/* ── 네거티브 프롬프트 칸 ──
   Stable Diffusion 계열에서만 나오고, 그때는 본문에 방지 문구가 없어야 한다.
   둘 다 나가면 부정 표현을 본문에서 빼려던 이유가 사라진다. */
const negBox = d.getElementById("negBox");
const prompt = d.getElementById("prompt");
const pick = key => {
  d.querySelector(`[data-model="${key}"]`).dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
};
if (!negBox) {
  errors.push("네거티브 칸이 만들어지지 않음");
} else {
  pick("natural");                       // GPT Image — 본문에 붙이는 모델
  if (!negBox.hidden) errors.push("GPT Image인데 네거티브 칸이 보임");
  if (!/without any text/.test(prompt.value)) errors.push("GPT Image인데 본문에 방지 문구가 없음");

  pick("generic");                       // Stable Diffusion — 네거티브 칸으로 내는 모델
  if (negBox.hidden) errors.push("Stable Diffusion인데 네거티브 칸이 안 보임");
  if (!d.getElementById("negPrompt").value) errors.push("네거티브 칸이 비어 있음");
  if (/watermark/.test(prompt.value)) errors.push("네거티브로 뺐는데 본문에도 방지 문구가 남음");
  checkButton(d.getElementById("negCopyBtn"), "네거티브");

  // '텍스트 방지'를 끄면 칸 자체가 사라져야 한다
  d.getElementById("guardBtn").dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
  if (!negBox.hidden) errors.push("텍스트 방지를 껐는데 네거티브 칸이 남음");
  d.getElementById("guardBtn").dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));

  // 본문이 비면 네거티브만 남겨 두지 않는다
  subject.value = "";
  subject.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
  if (!negBox.hidden) errors.push("본문이 비었는데 네거티브 칸이 남음");
}

console.log(errors.length ? `복사 버튼 검수 실패: ${errors.join(" · ")}` : "복사 버튼 검수 통과");
dom.window.close();
process.exit(errors.length ? 1 : 0);
