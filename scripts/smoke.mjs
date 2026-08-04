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
  console.log(app, errs.length ? "ERRORS: " + errs.join(" || ") : "OK", JSON.stringify(counts));
  if (errs.length) fail = 1;
}
process.exit(fail);
