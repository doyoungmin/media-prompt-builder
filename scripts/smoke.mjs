/* 이식된 legacy.js 를 jsdom 에서 실행해 런타임 오류와 UI 생성 여부를 확인 */
import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
import { compose } from "./compose-engine.mjs";

let fail = 0;
for (const app of ["image", "t2v", "i2v"]) {
  const html = readFileSync(`${app}/index.html`, "utf-8")
    .replace(/<script type="module"[^>]*><\/script>/g, "");
  const dom = new JSDOM(html, { url: `https://example.com/${app}/`, runScripts: "outside-only", pretendToBeVisual: true });
  const errs = [];
  dom.window.addEventListener("error", e => errs.push(e.message));
  try {
    dom.window.eval(compose(app));
  } catch (e) { errs.push(String(e && e.stack || e).split("\n").slice(0,3).join(" | ")); }
  const d = dom.window.document;
  const counts = {
    buttons: d.querySelectorAll("button").length,
    sections: d.querySelectorAll("section, [class*=sec]").length,
    imgs: d.querySelectorAll("img").length,
    thumbRefs: [...d.querySelectorAll("img")].filter(i => (i.getAttribute("src")||"").startsWith("/thumbs/")).length,
  };
  /* 우측 레일 순서 — 대상 모델 → 입력 → Seedance → 출력 범위 → 현재 선택
     → 프롬프트 → 동작 버튼. 마크업이 3벌이라 하나만 어긋나기 쉬워 여기서 잠근다.
     (Seedance 패널은 CONFIG.sd 가 있는 영상 앱에만 있다) */
  const order = [...d.getElementById("outPanel").children]
    .map(el => el.id || el.className.split(" ")[0]);
  const want = ["modelBox", "subject-box", ...(app === "image" ? [] : ["sdBox"]),
                "scope", "selSumBox", "out-top", "prompt", "warns", "outActions"];
  if (order.join(",") !== want.join(",")) {
    errs.push(`레일 순서가 다름: ${order.join(" > ")}`);
  }
  // 화면 테마는 헤더로 옮겼다 — 레일에 남아 있으면 안 된다
  if (!d.querySelector("header #themeSwitch")) errs.push("themeSwitch 가 헤더에 없음");
  if (d.querySelector("#outPanel #themeSwitch")) errs.push("themeSwitch 가 레일에 남아 있음");
  // 출력 밀도는 프롬프트 제목 옆으로 갔다
  if (!d.querySelector(".out-top [data-length]")) errs.push("출력 밀도 스위치가 제목 옆에 없음");

  console.log(app, errs.length ? "ERRORS: " + errs.join(" || ") : "OK", JSON.stringify(counts));
  if (errs.length) fail = 1;
}
process.exit(fail);
