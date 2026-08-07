/* 배포 직전 Git·GitHub CI 상태를 확인한다. 파일이나 원격을 변경하지 않는다. */
import { spawnSync } from "node:child_process";

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: "utf8", ...options });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error((result.stderr || result.stdout || `${command} 실패`).trim());
  return result.stdout.trim();
}
function check(condition, message) {
  if (!condition) throw new Error(message);
}

const branch = run("git", ["branch", "--show-current"]);
check(branch === "main", `배포 브랜치가 main이 아님: ${branch}`);
check(run("git", ["status", "--porcelain"]) === "", "작업 트리가 깨끗하지 않음");
run("git", ["fetch", "--quiet", "origin", "main"], { stdio: "inherit" });
const head = run("git", ["rev-parse", "HEAD"]);
const remote = run("git", ["rev-parse", "origin/main"]);
check(head === remote, `로컬 HEAD와 origin/main이 다름: ${head.slice(0, 7)} / ${remote.slice(0, 7)}`);

const raw = run("gh", ["run", "list", "--commit", head, "--workflow", "CI", "--limit", "1",
  "--json", "headSha,status,conclusion,url"]);
const runs = JSON.parse(raw);
check(runs.length === 1, `HEAD ${head.slice(0, 7)}의 CI 실행을 찾지 못함`);
const ci = runs[0];
check(ci.headSha === head && ci.status === "completed" && ci.conclusion === "success",
  `최신 CI가 성공 상태가 아님: ${ci.status}/${ci.conclusion} ${ci.url || ""}`);
console.log(`배포 사전 점검 통과 — ${head.slice(0, 7)} · ${ci.url}`);
