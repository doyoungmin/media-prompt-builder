/* localStorage 저장값의 정상 복원·구버전 마이그레이션·손상 내성을 검증한다. */
import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
import { compose } from "./compose-engine.mjs";

const html = readFileSync("image/index.html", "utf-8")
  .replace(/<script type="module"[^>]*><\/script>/g, "");
let fail = 0;
const check = (ok, message) => {
  if (!ok) { fail = 1; console.log(`✗ ${message}`); }
};

function boot(saved) {
  const dom = new JSDOM(html, {
    url: "https://example.com/image/",
    runScripts: "outside-only",
    pretendToBeVisual: true,
  });
  if (saved !== undefined) {
    dom.window.localStorage.setItem("prompt-builder:image", JSON.stringify(saved));
  }
  let error = null;
  try { dom.window.eval(compose("image")); }
  catch (e) { error = e; }
  return { dom, d: dom.window.document, error };
}

/* v1 정상 데이터는 선택·입력을 유지한 채 현재 버전으로 다시 저장되어야 한다. */
{
  const { dom, d, error } = boot({
    v: 1,
    sel: { body: ["Canon EOS R5"] },
    subject: "a lighthouse at dusk",
    model: "natural",
    length: "detail",
    level: "all",
    scope: { body: true },
    guard: false,
    wiz: {},
    preset: null,
    selOpen: true,
  });
  check(!error, `v1 복원 중 예외: ${error}`);
  check(d.getElementById("subject").value === "a lighthouse at dusk", "v1 피사체 복원 실패");
  check(d.querySelector('.chip[data-kr="Canon EOS R5"]')?.classList.contains("on"), "v1 선택 복원 실패");
  check(d.querySelector('[data-model="natural"]')?.classList.contains("on"), "v1 모델 복원 실패");
  await new Promise(resolve => dom.window.setTimeout(resolve, 450));
  const stored = JSON.parse(dom.window.localStorage.getItem("prompt-builder:image"));
  check(stored.v === 2, `v1 마이그레이션 저장 버전이 2가 아님: ${stored.v}`);
  dom.window.close();
}

/* 타입이 깨진 저장값은 앱을 죽이지 않고 기본 상태로 시작해야 한다. */
for (const [name, saved] of [
  ["문자열 선택", { v: 2, sel: { body: "corrupt" } }],
  ["객체 선택", { v: 2, sel: { body: {} } }],
  ["숫자 선택", { v: 2, sel: { body: 42 } }],
  ["잘못된 범위", { v: 2, sel: {}, scope: "corrupt" }],
]) {
  const { dom, d, error } = boot(saved);
  check(!error, `${name} 저장값 때문에 부팅 실패: ${error}`);
  check(d.getElementById("subject")?.value === "", `${name} 저장값이 기본 입력 상태를 오염시킴`);
  dom.window.close();
}

/* 알 수 없는 미래 버전은 무리하게 해석하지 않는다. */
{
  const { dom, d, error } = boot({ v: 999, sel: { body: ["Canon EOS R5"] }, subject: "should not restore" });
  check(!error, `미지원 버전 처리 중 예외: ${error}`);
  check(d.getElementById("subject").value === "", "미지원 버전 데이터가 복원됨");
  dom.window.close();
}

console.log(fail ? "저장 상태 검수 실패" : "저장 상태 검수 통과");
process.exit(fail);
