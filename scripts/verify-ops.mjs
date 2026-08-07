/* 운영 스크립트의 판정 로직을 케이스별로 검사한다.
 *
 *  왜 필요했나 — release-check 가 첫 줄에서 터지는 상태로 커밋돼 있었고, 문서에는
 *  "쓸 수 있는 명령"으로 적혀 있었다. 아무도 한 번도 실행해 보지 않았기 때문이다.
 *  문법은 멀쩡해서 `node --check` 로는 안 잡힌다. 그래서 판정을 순수 함수로 내리고
 *  여기서 검사한다. 네트워크도 git 도 실제 배포도 필요 없다. */
import { stdoutOf, gitProblems, ciVerdict, deployArgs } from "./ops-lib.mjs";

let fail = 0;
function 검사(이름, fn) {
  try { fn(); console.log(`  ✓ ${이름}`); }
  catch (e) { console.error(`  ✗ ${이름} — ${e.message}`); fail = 1; }
}
function 같다(실제, 기대, 설명 = "") {
  const a = JSON.stringify(실제), b = JSON.stringify(기대);
  if (a !== b) throw new Error(`${설명}${설명 ? ": " : ""}${a} ≠ ${b}`);
}
function 던진다(fn, 조각) {
  try { fn(); } catch (e) {
    if (조각 && !String(e.message).includes(조각)) throw new Error(`다른 오류: ${e.message}`);
    return;
  }
  throw new Error("던지지 않았다");
}

console.log("stdoutOf — spawnSync 결과 꺼내기");
검사("정상 출력은 그대로 (앞뒤 공백 제거)", () =>
  같다(stdoutOf({ status: 0, stdout: " main \n" }), "main"));
/* 이게 실제로 터졌던 자리다. stdio:"inherit" 로 돌린 명령은 stdout 이 null 인데
   예전 코드가 무조건 .trim() 을 불러 TypeError 를 냈다. */
검사("stdout 이 null 이어도 터지지 않는다 (stdio:inherit)", () =>
  같다(stdoutOf({ status: 0, stdout: null }), ""));
검사("stdout 이 undefined 여도 터지지 않는다", () =>
  같다(stdoutOf({ status: 0 }), ""));
검사("0 이 아닌 종료코드는 stderr 를 담아 던진다", () =>
  던진다(() => stdoutOf({ status: 1, stderr: "치명적: 저장소 아님\n" }), "치명적"));
검사("stderr 가 비어 있어도 종료코드를 알려 준다", () =>
  던진다(() => stdoutOf({ status: 128, stdout: null, stderr: null }), "128"));
검사("spawn 자체가 실패하면 그 오류를 올린다", () =>
  던진다(() => stdoutOf({ error: new Error("ENOENT") }), "ENOENT"));

console.log("gitProblems — 배포해도 되는 상태인가");
const 정상 = { branch: "main", porcelain: "", head: "a".repeat(40), remote: "a".repeat(40) };
검사("깨끗한 main 은 문제 없음", () => 같다(gitProblems(정상), []));
검사("다른 브랜치를 잡는다", () =>
  같다(gitProblems({ ...정상, branch: "feature" }).length, 1));
검사("커밋 안 한 변경을 잡는다", () =>
  같다(gitProblems({ ...정상, porcelain: " M src/x.js" }).length, 1));
검사("원격과 어긋난 것을 잡는다", () =>
  같다(gitProblems({ ...정상, remote: "b".repeat(40) }).length, 1));
검사("브랜치가 비어 있어도(detached HEAD) 문구가 깨지지 않는다", () => {
  const m = gitProblems({ ...정상, branch: "" })[0];
  if (!m.includes("(없음)")) throw new Error(m);
});
검사("문제가 여러 개면 모두 알려 준다", () =>
  같다(gitProblems({ branch: "x", porcelain: " M a", head: "a", remote: "b" }).length, 3));

console.log("ciVerdict — 이 커밋의 CI 결과");
const sha = "c".repeat(40);
const 실행 = (o) => ({ head_sha: sha, name: "CI", status: "completed", conclusion: "success",
                       run_attempt: 1, html_url: "https://example/1", ...o });
검사("성공한 실행이면 통과", () => 같다(ciVerdict([실행()], sha).ok, true));
검사("진행 중이면 막고 이유를 말한다", () => {
  const v = ciVerdict([실행({ status: "in_progress", conclusion: null })], sha);
  같다(v.ok, false); if (!v.이유.includes("in_progress")) throw new Error(v.이유);
});
검사("실패한 실행이면 막는다", () =>
  같다(ciVerdict([실행({ conclusion: "failure" })], sha).ok, false));
검사("취소된 실행이면 막는다", () =>
  같다(ciVerdict([실행({ conclusion: "cancelled" })], sha).ok, false));
검사("실행이 하나도 없으면 막는다", () => 같다(ciVerdict([], sha).ok, false));
검사("응답이 비어 있어도(undefined) 터지지 않는다", () =>
  같다(ciVerdict(undefined, sha).ok, false));
검사("다른 커밋의 실행은 세지 않는다", () =>
  같다(ciVerdict([실행({ head_sha: "d".repeat(40) })], sha).ok, false));
검사("다른 워크플로는 세지 않는다", () =>
  같다(ciVerdict([실행({ name: "Pages" })], sha).ok, false));
/* 재실행으로 고친 경우 — 옛 시도가 실패로 남아 있어도 최신 시도를 봐야 한다 */
검사("재실행했으면 마지막 시도를 본다", () =>
  같다(ciVerdict([실행({ run_attempt: 1, conclusion: "failure" }),
                  실행({ run_attempt: 2, conclusion: "success" })], sha).ok, true));
검사("재실행이 실패했으면 옛 성공을 믿지 않는다", () =>
  같다(ciVerdict([실행({ run_attempt: 1, conclusion: "success" }),
                  실행({ run_attempt: 2, conclusion: "failure" })], sha).ok, false));

console.log("deployArgs — wrangler 인자 조립");
검사("SHA 는 12자리로 자른다", () =>
  같다(deployArgs("0123456789abcdef", "제목"), ["wrangler", "deploy", "--tag", "0123456789ab", "--message", "제목"]));
검사("--dry-run 을 주면 붙는다", () =>
  같다(deployArgs("0123456789abcdef", "제목", { dryRun: true }).at(-1), "--dry-run"));
검사("공백·따옴표가 든 제목도 인자 하나로 넘어간다", () => {
  const a = deployArgs("0".repeat(40), 'fix: "그것" 을 고침');
  같다(a[a.indexOf("--message") + 1], 'fix: "그것" 을 고침');
});

if (fail) process.exit(1);
console.log("운영 스크립트 판정 로직 검수 통과");
