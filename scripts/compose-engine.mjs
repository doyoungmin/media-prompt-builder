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

const SLOT_RE = /\/\*==SLOT:(\d+)==\*\//g;
const PART_RE = /^(\d{2})-.+\.js$/;

/** 조각 파일 이름들 (실행 순서대로) — vite 가 감시 대상으로도 쓴다 */
export function enginePartFiles(root = ".") {
  const files = readdirSync(`${root}/src/shared/engine`).filter(f => f.endsWith(".js"));
  const numbered = files.map(file => {
    const match = file.match(PART_RE);
    if (!match) throw new Error(`엔진 조각 파일명 규칙 위반: ${file} (예: 01-data.js)`);
    return { file, number: Number(match[1]) };
  }).sort((a, b) => a.number - b.number || a.file.localeCompare(b.file));

  numbered.forEach((part, index) => {
    const expected = index + 1;
    if (part.number !== expected)
      throw new Error(`엔진 조각 번호 누락/중복: ${part.file} (기대 번호 ${String(expected).padStart(2, "0")})`);
  });
  return numbered.map(part => part.file);
}

/** 조각을 순서대로 이어 붙인 엔진 원본 */
export function engineSource(root = ".") {
  const dir = `${root}/src/shared/engine`;
  return enginePartFiles(root).map(f => readFileSync(`${dir}/${f}`, "utf-8")).join("");
}

export function compose(app, root = ".") {
  const engine = engineSource(root).replace(/^\/\*[\s\S]*?\*\/\n/, "");
  const appSrc = readFileSync(`${root}/src/apps/${app}/app.js`, "utf-8");
  const engineSlots = [...engine.matchAll(SLOT_RE)].map(match => match[1]);
  const appSlots = [...appSrc.matchAll(SLOT_RE)].map(match => match[1]);
  const duplicate = ids => ids.find((id, index) => ids.indexOf(id) !== index);
  const dupEngine = duplicate(engineSlots), dupApp = duplicate(appSlots);
  if (dupEngine) throw new Error(`공통 엔진: SLOT ${dupEngine} 중복`);
  if (dupApp) throw new Error(`${app}: SLOT ${dupApp} 중복`);

  const expected = new Set(engineSlots), provided = new Set(appSlots);
  const missing = engineSlots.filter(id => !provided.has(id));
  const extra = appSlots.filter(id => !expected.has(id));
  if (missing.length || extra.length) {
    const detail = [missing.length && `누락 ${missing.join(",")}`, extra.length && `추가 ${extra.join(",")}`]
      .filter(Boolean).join(" · ");
    throw new Error(`${app}: SLOT 계약 불일치 (${detail})`);
  }

  const slots = {};
  const parts = appSrc.split(SLOT_RE); // [머리말, n1, body1, n2, body2 …]
  for (let i = 1; i < parts.length; i += 2) slots[parts[i]] = parts[i + 1];
  return engine.replace(SLOT_RE, (_, n) => slots[n]);
}
