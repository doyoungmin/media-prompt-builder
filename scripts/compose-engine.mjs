/** engine.js + apps/<app>/app.js → 실행 코드 조립.
 *  vite 플러그인과 검증·스모크 테스트가 공용으로 사용한다. */
import { readFileSync } from "node:fs";
const M = /\/\*==SLOT:(\d+)==\*\//g;
export function compose(app, root = ".") {
  const engine = readFileSync(`${root}/src/shared/engine.js`, "utf-8").replace(/^\/\*[\s\S]*?\*\/\n/, "");
  const appSrc = readFileSync(`${root}/src/apps/${app}/app.js`, "utf-8");
  const slots = {};
  const parts = appSrc.split(M); // [머리말, n1, body1, n2, body2 …]
  for (let i = 1; i < parts.length; i += 2) slots[parts[i]] = parts[i + 1];
  return engine.replace(M, (_, n) => {
    if (!(n in slots)) throw new Error(`${app}: SLOT ${n} 없음`);
    return slots[n];
  });
}
