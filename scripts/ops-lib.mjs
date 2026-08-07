/** 운영 스크립트(release-check · deploy)의 판정 로직.
 *
 *  왜 따로 뺐나 — 예전 release-check 는 `git fetch` 를 stdio:"inherit" 로 돌리고는
 *  그 결과에 무조건 `.trim()` 을 불렀다. stdout 이 null 이라 첫 줄에서 터졌는데,
 *  아무도 한 번도 실행해 본 적이 없어서 문서에는 "쓸 수 있는 명령"으로 적혀 있었다.
 *  `node --check` 로는 이런 걸 못 잡는다 — 문법은 멀쩡하기 때문이다.
 *
 *  그래서 판정을 전부 순수 함수로 내려놓고 scripts/verify-ops.mjs 가 케이스별로
 *  검사한다. 네트워크도 git 도 필요 없다. */

/** spawnSync 결과에서 stdout 을 꺼낸다.
 *  stdio:"inherit" 로 돌린 명령은 stdout 이 null 이다 — 여기서 터지던 자리다. */
export function stdoutOf(result) {
  if (result.error) throw result.error;
  if (result.status !== 0) {
    const 이유 = (result.stderr || result.stdout || "").trim();
    throw new Error(이유 || `명령이 ${result.status} 로 끝남`);
  }
  return (result.stdout ?? "").trim();
}

/** git 상태가 배포해도 되는 모양인지. 문제가 없으면 빈 배열. */
export function gitProblems({ branch, porcelain, head, remote }) {
  const 문제 = [];
  if (branch !== "main") 문제.push(`배포 브랜치가 main 이 아님: ${branch || "(없음)"}`);
  if (porcelain !== "") 문제.push("작업 트리가 깨끗하지 않음 — 커밋하거나 되돌리고 다시 시도한다");
  if (head !== remote)
    문제.push(`로컬과 origin/main 이 다름: ${head.slice(0, 7)} / ${remote.slice(0, 7)} — push 했는지 확인한다`);
  return 문제;
}

/** GitHub Actions 실행 목록에서 이 커밋의 CI 결과를 판정한다.
 *  runs 는 /actions/runs 응답의 workflow_runs 배열. */
export function ciVerdict(runs, sha, workflow = "CI") {
  const 이것 = (runs ?? []).filter(r => r.head_sha === sha && (!workflow || r.name === workflow));
  if (!이것.length)
    return { ok: false, 이유: `${sha.slice(0, 7)} 의 ${workflow} 실행을 찾지 못함 — push 가 반영됐는지 확인한다` };
  // 재실행이 있으면 가장 최근 시도가 정본이다
  const 최신 = 이것.sort((a, b) => (b.run_attempt ?? 1) - (a.run_attempt ?? 1))[0];
  if (최신.status !== "completed")
    return { ok: false, 이유: `CI 가 아직 ${최신.status} — 끝나고 나서 다시 시도한다`, url: 최신.html_url };
  if (최신.conclusion !== "success")
    return { ok: false, 이유: `CI 가 ${최신.conclusion} 로 끝남`, url: 최신.html_url };
  return { ok: true, url: 최신.html_url };
}

/** wrangler deploy 인자. 커밋 메시지 첫 줄이 대시보드 배포 목록에 그대로 보인다. */
export function deployArgs(sha, subject, { dryRun = false } = {}) {
  const args = ["wrangler", "deploy", "--tag", sha.slice(0, 12), "--message", subject];
  if (dryRun) args.push("--dry-run");
  return args;
}

/** GitHub Actions 실행 목록 조회. gh CLI 를 쓰지 않는다 —
 *  다른 사람·다른 환경에서 gh 설치와 인증이 갖춰져 있으리라 기대할 수 없다.
 *  토큰이 있으면 쓰고(시간당 5000회), 없으면 공개 API 로 간다(시간당 60회). */
export async function fetchRuns(repo, token = process.env.GITHUB_TOKEN) {
  const url = `https://api.github.com/repos/${repo}/actions/runs?per_page=20`;
  const res = await fetch(url, {
    headers: {
      accept: "application/vnd.github+json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  });
  if (res.status === 403 || res.status === 429) {
    const 남음 = res.headers.get("x-ratelimit-remaining");
    throw new Error(남음 === "0"
      ? "GitHub API 호출 한도를 넘었다. GITHUB_TOKEN 을 주면 한도가 크게 늘어난다"
      : `GitHub API 가 ${res.status} 를 돌려줌 — 비공개 저장소라면 GITHUB_TOKEN 이 필요하다`);
  }
  if (!res.ok) throw new Error(`GitHub API ${res.status} ${res.statusText}`);
  return (await res.json()).workflow_runs ?? [];
}
