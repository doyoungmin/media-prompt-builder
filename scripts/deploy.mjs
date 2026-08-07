/* 검증된 main만 Git SHA·커밋 제목과 함께 Cloudflare Workers에 배포한다. */
import { spawnSync } from "node:child_process";

function run(command, args) {
  const result = spawnSync(command, args, { stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}
function text(...args) {
  const result = spawnSync("git", args, { encoding: "utf8" });
  if (result.status !== 0) throw new Error(result.stderr.trim());
  return result.stdout.trim();
}

run(process.execPath, ["scripts/release-check.mjs"]);
run("npm", ["run", "verify:all"]);
const sha = text("rev-parse", "--short=12", "HEAD");
const subject = text("log", "-1", "--format=%s");
run("npx", ["wrangler", "deploy", "--strict", "--tag", sha, "--message", subject]);
