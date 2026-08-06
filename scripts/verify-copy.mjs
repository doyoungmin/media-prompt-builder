/* 복사 완료 피드백 뒤에도 버튼의 아이콘·레이블 구조가 유지되는지 검증한다. */
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
const button = d.getElementById("copyBtn");
button.click();

const errors = [];
if (!button.querySelector("svg use[href='#i-copy']")) errors.push("복사 후 아이콘이 사라짐");
if (!button.querySelector(".copy-tx")) errors.push("복사 후 .copy-tx 레이블이 사라짐");
if (button.querySelector(".copy-tx")?.textContent !== "복사") errors.push("복사 완료 후 레이블이 복구되지 않음");
if (button.classList.contains("done")) errors.push("복사 완료 상태가 해제되지 않음");

console.log(errors.length ? `복사 버튼 검수 실패: ${errors.join(" · ")}` : "복사 버튼 검수 통과");
dom.window.close();
process.exit(errors.length ? 1 : 0);
