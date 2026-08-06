/** engine/*.js 조각 + apps/<app>/app.js → 실행 코드 조립.
 *  vite 플러그인과 검증·스모크 테스트가 공용으로 사용한다.
 *
 *  엔진은 한때 2,390줄짜리 파일 하나였다. 한 곳을 고치면 세 앱 전체가 영향을
 *  받는데 지금 어디를 보고 있는지 알기 어려웠다. 그래서 기능 단위로 쪼갰다.
 *  다만 조각들은 ES 모듈이 아니라 **이어 붙여 하나의 스크립트로 실행된다** —
 *  전역 하나를 공유하고 앱별 코드가 SLOT 자리에 끼어드는 구조를 그대로
 *  두기 위해서다. 그래서 조각 사이에 import/export 를 쓰면 안 되고,
 *  파일명 앞의 번호가 곧 실행 순서다. */
import { readFileSync, readdirSync } from "node:fs";

const M = /\/\*==SLOT:(\d+)==\*\//g;

/** 조각 파일 이름들 (실행 순서대로) — vite 가 감시 대상으로도 쓴다 */
export function enginePartFiles(root = ".") {
  return readdirSync(`${root}/src/shared/engine`)
    .filter(f => f.endsWith(".js"))
    .sort();
}

/** 조각을 순서대로 이어 붙인 엔진 원본 */
export function engineSource(root = ".") {
  const dir = `${root}/src/shared/engine`;
  return enginePartFiles(root).map(f => readFileSync(`${dir}/${f}`, "utf-8")).join("");
}

export function compose(app, root = ".") {
  const engine = engineSource(root).replace(/^\/\*[\s\S]*?\*\/\n/, "");
  const appSrc = readFileSync(`${root}/src/apps/${app}/app.js`, "utf-8");
  const slots = {};
  const parts = appSrc.split(M); // [머리말, n1, body1, n2, body2 …]
  for (let i = 1; i < parts.length; i += 2) slots[parts[i]] = parts[i + 1];
  return engine.replace(M, (_, n) => {
    if (!(n in slots)) throw new Error(`${app}: SLOT ${n} 없음`);
    return slots[n];
  });
}
