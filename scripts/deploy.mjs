/* 검증된 main 만 Git SHA·커밋 제목과 함께 Cloudflare Workers 에 배포한다.
 *
 *  평소에는 쓸 일이 없다 — push 하면 GitHub Actions 가 배포한다. 이건 GitHub 나
 *  Cloudflare 쪽에 문제가 있을 때 손으로 미는 비상 경로다.
 *
 *    --dry-run  실제 업로드만 빼고 전부 돌려 본다. CI 가 이 경로를 검사할 때 쓴다.
 *               자기 자신의 CI 결과를 기다리면 교착이므로 --skip-ci-status 도 함께 준다. */
import { spawnSync } from "node:child_process";
import { stdoutOf, deployArgs } from "./ops-lib.mjs";

const dryRun = process.argv.includes("--dry-run");

function run(command, args) {
  const result = spawnSync(command, args, { stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}
const git = (...args) => stdoutOf(spawnSync("git", args, { encoding: "utf8" }));

run(process.execPath, ["scripts/release-check.mjs", ...(dryRun ? ["--skip-ci-status"] : [])]);
if (!dryRun) run("npm", ["run", "verify:all"]);

const args = deployArgs(git("rev-parse", "HEAD"), git("log", "-1", "--format=%s"), { dryRun });
console.log(`npx ${args.join(" ")}`);
run("npx", args);
