/* 배포 직전 Git·GitHub CI 상태를 확인한다. 파일이나 원격을 바꾸지 않는다.
 *
 *  --skip-ci-status 를 주면 CI 결과 확인을 건너뛴다. CI **안에서** 돌 때 필요하다 —
 *  그 시점에는 자기 자신의 실행이 in_progress 라, 그대로 두면 자기를 기다리게 된다.
 *
 *  판정은 전부 scripts/ops-lib.mjs 에 있고 verify:ops 가 케이스별로 검사한다. */
import { spawnSync } from "node:child_process";
import { stdoutOf, gitProblems, ciVerdict, fetchRuns } from "./ops-lib.mjs";

const REPO = "doyoungmin/media-prompt-builder";
const skipCi = process.argv.includes("--skip-ci-status");

const git = (...args) => stdoutOf(spawnSync("git", args, { encoding: "utf8" }));

const branch = git("branch", "--show-current");
const porcelain = git("status", "--porcelain");
// fetch 는 출력이 필요 없다. 예전에는 stdio:"inherit" 로 돌리고 결과를 trim 하다 터졌다.
spawnSync("git", ["fetch", "--quiet", "origin", "main"], { encoding: "utf8" });
const head = git("rev-parse", "HEAD");
const remote = git("rev-parse", "origin/main");

const 문제 = gitProblems({ branch, porcelain, head, remote });
if (문제.length) {
  for (const m of 문제) console.error(`✗ ${m}`);
  process.exit(1);
}

if (skipCi) {
  console.log(`Git 상태 확인 — ${head.slice(0, 7)} (CI 결과 확인은 건너뜀)`);
  process.exit(0);
}

const verdict = ciVerdict(await fetchRuns(REPO), head);
if (!verdict.ok) {
  console.error(`✗ ${verdict.이유}${verdict.url ? `\n  ${verdict.url}` : ""}`);
  process.exit(1);
}
console.log(`배포 사전 점검 통과 — ${head.slice(0, 7)} · ${verdict.url}`);
