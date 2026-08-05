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
                "scope", "selSumBox", "out-top", "prompt", "outActions"];
  if (order.join(",") !== want.join(",")) {
    errs.push(`레일 순서가 다름: ${order.join(" > ")}`);
  }
  /* 안내는 고칠 곳 옆으로 나눠 갔다 — 모아 띄우던 상자는 없어야 한다 */
  if (d.getElementById("warns")) errs.push("안내 상자(.warns)가 남아 있음");
  if (!d.querySelector(".subject-box > #subjectNote")) errs.push("입력 안내 자리가 없음");
  if (!d.querySelector("#outLab > #outNote")) errs.push("결과 안내 자리가 없음");
  if (!d.querySelector(".scope-lab > #scopeOff")) errs.push("제외 문구가 출력 범위 라벨 옆에 없음");
  /* 출력 범위 묶음은 하나만 걸리므로 탭(세그먼트) — 텍스트 방지만 세그먼트 밖 토글로 남는다 */
  const quicks = [...d.querySelectorAll("[data-quick]")];
  if (!quicks.length || !quicks.every(b => b.closest(".seg.scope-quick")))
    errs.push("출력 범위 묶음이 세그먼트 안에 없음");
  if (d.querySelector(".scope-quick #guardBtn")) errs.push("텍스트 방지가 세그먼트 안에 들어감");
  if (!d.querySelector("#scope > #guardBtn")) errs.push("텍스트 방지 토글이 없음");
  // 개수·단어수는 걷어냈다 (간결/상세 버튼이 이미 단어수를 말한다)
  const labText = d.getElementById("outLab").textContent;
  if (/출력 중|단어|선택 없음/.test(labText)) errs.push(`제목에 중복 정보가 남음: "${labText}"`);
  // 화면 테마는 앱 제목 바로 옆(.brand 안) — 모바일에서도 제목과 같은 줄에 남는다
  if (!d.querySelector(".brand > #themeSwitch")) errs.push("themeSwitch 가 제목 옆에 없음");
  if (d.querySelector("#outPanel #themeSwitch")) errs.push("themeSwitch 가 레일에 남아 있음");
  // 출력 밀도는 하단 스티키 2열로 갔다
  if (!d.querySelector(".out-actions [data-length]")) errs.push("출력 밀도가 하단 버튼 영역에 없음");
  if (d.querySelector(".out-top [data-length]")) errs.push("출력 밀도가 제목 옆에 남아 있음");
  if (d.querySelectorAll(".out-actions .out-actions-row").length !== 2)
    errs.push("하단 버튼 영역이 2열이 아님");
  // 앱 설명문구는 걷어냈다
  if (d.getElementById("appSub")) errs.push("앱 설명문구가 남아 있음");
  // 되돌리기는 글자 대신 카운트
  const undo = d.getElementById("undoBtn");
  if (!d.getElementById("undoCount")) errs.push("되돌리기 카운트가 없음");
  if (/되돌리기/.test(undo.textContent)) errs.push("되돌리기 버튼에 글자 레이블이 남음");
  if (!/^\d+\/\d+$/.test(undo.textContent.trim())) errs.push(`되돌리기 표기가 N/M 이 아님: "${undo.textContent.trim()}"`);

  console.log(app, errs.length ? "ERRORS: " + errs.join(" || ") : "OK", JSON.stringify(counts));
  if (errs.length) fail = 1;
}
process.exit(fail);
