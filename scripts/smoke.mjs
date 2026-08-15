/* 이식된 legacy.js 를 jsdom 에서 실행해 런타임 오류와 UI 생성 여부를 확인 */
import { readFileSync, existsSync } from "node:fs";
import { JSDOM } from "jsdom";
import { compose, enginePartFiles } from "./compose-engine.mjs";

let fail = 0;

/* 엔진 조각은 ES 모듈이 아니라 이어 붙여 하나의 스크립트로 돈다.
   조각 안에 import/export 가 들어가면 전체가 조용히 깨진다. */
for (const f of enginePartFiles()) {
  const src = readFileSync(`src/shared/engine/${f}`, "utf-8");
  const bad = src.match(/^\s*(import|export)\s/m);
  if (bad) { console.log(`engine/${f} ERRORS: 조각에 ${bad[1]} 가 있음 — 조각은 모듈이 아니다`); fail = 1; }
}
const brandIcons = {
  image: "/app-icons/image.svg?v=2",
  t2v: "/app-icons/t2v.svg?v=2",
  i2v: "/app-icons/i2v.svg?v=2",
};
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
  const brandIcon = d.querySelector("img.brand-ic");
  if (!brandIcon || brandIcon.getAttribute("src") !== brandIcons[app])
    errs.push(`브랜드 아이콘이 다름: ${brandIcon?.getAttribute("src") || "없음"}`);
  if (d.getElementById("brandUse")) errs.push("기존 인라인 브랜드 아이콘이 남아 있음");
  const counts = {
    buttons: d.querySelectorAll("button").length,
    sections: d.querySelectorAll("section, [class*=sec]").length,
    imgs: d.querySelectorAll("img").length,
    thumbRefs: [...d.querySelectorAll("img")].filter(i => (i.getAttribute("src")||"").startsWith("/thumbs/")).length,
  };
  /* 우측 레일 순서 — 대상 모델 → 입력 → Seedance → 출력 범위 → 현재 선택
     → 프롬프트 → 네거티브 → 동작 버튼. 마크업이 3벌이라 하나만 어긋나기 쉬워 여기서 잠근다.
     (Seedance 패널은 CONFIG.sd 가 있는 영상 앱에만 있다. 네거티브 칸은 negative 를 쓰는
      모델이 있는 앱에만 있고, 지금은 세 앱 모두 키워드형 모델이 있어 전부 생긴다.) */
  const order = [...d.getElementById("outPanel").children]
    .map(el => el.id || el.className.split(" ")[0]);
  const want = ["modelBox", "subject-box", ...(app === "image" ? [] : ["sdBox"]),
                "scope", "selSumBox", "out-top", "prompt", "negBox", "outActions"];
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
  /* 제목은 '이름 + 갈래' 로 나뉘어야 한다 — 한 덩어리면 좁은 화면에서
     "생성" 같은 조각만 다음 줄로 떨어진다. 갈래가 없는 앱(image)은 이름만. */
  const nameEl = d.getElementById("appTitleText"), noteEl = d.getElementById("appTitleNote");
  if (!nameEl || !nameEl.textContent.trim()) errs.push("앱 이름이 비었음");
  if (/·/.test(nameEl?.textContent || "")) errs.push(`이름에 갈래가 섞여 있음: "${nameEl.textContent}"`);
  if (app === "image") {
    if (noteEl) errs.push("갈래가 없는 앱인데 갈래 요소가 생김");
  } else {
    if (!noteEl || !noteEl.textContent.trim()) errs.push("갈래가 비었음");
    if (!d.querySelector("#appTitleGroup > #appTitleText")) errs.push("제목 묶음이 없음");
    // 캐럿은 묶음 밖에 있어야 갈래를 따라 내려가지 않는다
    if (d.querySelector("#appTitleGroup .caret")) errs.push("캐럿이 제목 묶음 안에 있음");
  }
  // 되돌리기는 글자 대신 카운트
  const undo = d.getElementById("undoBtn");
  if (!d.getElementById("undoCount")) errs.push("되돌리기 카운트가 없음");
  if (/되돌리기/.test(undo.textContent)) errs.push("되돌리기 버튼에 글자 레이블이 남음");
  if (!/^\d+\/\d+$/.test(undo.textContent.trim())) errs.push(`되돌리기 표기가 N/M 이 아님: "${undo.textContent.trim()}"`);

  /* 실행 중 생성된 썸네일도 확인한다. app.js 안의 경로 오타는 HTML 정적 검사로 잡히지 않는다. */
  const runtimeAssets = new Set();
  for (const img of d.querySelectorAll("img")) {
    const src = (img.getAttribute("src") || "").split("?")[0];
    if (src.startsWith("/thumbs/")) runtimeAssets.add(src);
    for (const candidate of (img.getAttribute("srcset") || "").split(",")) {
      const url = candidate.trim().split(/\s+/)[0];
      if (url?.startsWith("/thumbs/")) runtimeAssets.add(url.split("?")[0]);
    }
  }
  for (const url of runtimeAssets)
    if (!existsSync("public" + url)) errs.push(`동적 썸네일 없음: ${url}`);

  /* 엔트리가 가리키는 정적 자산이 실제로 있는지 — 파비콘·앱 아이콘·매니페스트는
     화면에 안 나오거나 탭에만 나와서, 파일명을 바꾸면 조용히 깨진 채 배포된다.
     /src/ 는 vite 가 빌드 때 해결하므로 뺀다. */
  const refs = [...new Set([...html.matchAll(/(?:href|src)="(\/[^"]+)"/g)].map(m => m[1]))]
    .filter(u => !u.startsWith("/src/"))
    .map(u => u.split("?")[0]);
  for (const u of refs) {
    if (!existsSync("public" + u)) errs.push(`참조한 자산이 없음: ${u}`);
  }
  // 매니페스트가 가리키는 아이콘도 같이 본다
  for (const u of refs.filter(u => u.endsWith(".webmanifest"))) {
    let man;
    try { man = JSON.parse(readFileSync("public" + u, "utf-8")); }
    catch (e) { errs.push(`매니페스트를 읽을 수 없음: ${u}`); continue; }
    for (const icon of man.icons || []) {
      if (!existsSync("public" + icon.src)) errs.push(`매니페스트 아이콘 없음: ${icon.src}`);
    }
    if (!man.start_url) errs.push(`매니페스트에 start_url 없음: ${u}`);
  }

  console.log(app, errs.length ? "ERRORS: " + errs.join(" || ") : "OK", JSON.stringify(counts));
  if (errs.length) fail = 1;
}

/* 랜딩(/)은 엔진을 쓰지 않지만 정적 자산을 여럿 가리킨다. 아이콘은 alt="" 라
   경로가 틀려도 화면에서 조용히 비고, 위 세 앱 검사는 여기를 보지 않았다. */
{
  const html = readFileSync("index.html", "utf-8");
  const refs = [...new Set([...html.matchAll(/(?:href|src)="(\/[^"]+)"/g)].map(m => m[1]))]
    .filter(u => !u.startsWith("/src/"))
    .map(u => u.split("?")[0]);
  /* 두 종류가 섞여 있다 — 파일(/logo-pb.svg)과 빌더로 가는 라우트(/image/).
     라우트를 public 에서 찾으면 멀쩡한 링크를 없다고 잡는다(실제로 그랬다).
     라우트는 그 자리에 엔트리 HTML 이 있어야 한다 — vite 의 input 과 같은 파일이다. */
  const missing = refs.filter(u =>
    u.endsWith("/") ? !existsSync(`.${u}index.html`) : !existsSync("public" + u));
  console.log("index", missing.length ? "ERRORS: 참조가 가리키는 것이 없음: " + missing.join(", ") : "OK",
    JSON.stringify({ 자산: refs.filter(u => !u.endsWith("/")).length,
                     라우트: refs.filter(u => u.endsWith("/")).length }));
  if (missing.length) fail = 1;
}
process.exit(fail);
