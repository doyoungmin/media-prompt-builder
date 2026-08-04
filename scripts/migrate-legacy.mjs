/**
 * as-is HTML → webapp 이식 (구상 문서 3~4단계).
 * 앱마다: head 메타 + body 마크업 → <app>/index.html,
 *         메인 스크립트 → src/apps/<app>/legacy.js (ES 모듈)
 * 변환: base64 → /thumbs/*.webp (thumbs-map.json), *.html 링크 → 경로 라우트.
 * 재실행 가능(멱등). 사용: node scripts/migrate-legacy.mjs [as-is 폴더]
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, join } from "node:path";

const asIs = resolve(process.argv[2] ?? "../as-is-HTML");
const map = JSON.parse(readFileSync("public/thumbs/thumbs-map.json", "utf-8"));

const APPS = [
  { app: "image", file: "prompt-builder-image.html" },
  { app: "t2v",   file: "prompt-builder-video-t2v.html" },
  { app: "i2v",   file: "prompt-builder-video-i2v.html" },
];
const ROUTES = {
  "prompt-builder-image.html": "/image/",
  "prompt-builder-video-t2v.html": "/t2v/",
  "prompt-builder-video-i2v.html": "/i2v/",
};

const reroute = (s) => {
  for (const [f, r] of Object.entries(ROUTES))
    s = s.replaceAll(`./${f}`, r).replaceAll(f, r);
  return s;
};
const deBase64 = (s) =>
  s.replace(/"([^"]+)"(\s*:\s*)"data:image\/webp;base64,[A-Za-z0-9+/=]+"/g,
    (m, key, sep) => map[key] ? `"${key}"${sep}"/thumbs/${map[key]}"` : m);

for (const { app, file } of APPS) {
  const src = readFileSync(join(asIs, file), "utf-8");

  // head: style·script 를 뺀 메타 부분만 가져온다 (테마는 shared/theme.ts 가 담당)
  let head = src.match(/<head>([\s\S]*?)<\/head>/)[1]
    .replace(/<style[\s\S]*?<\/style>/g, "")
    .replace(/<script[\s\S]*?<\/script>/g, "")
    .trim();

  // body: 메인 스크립트를 분리
  const bodyRaw = src.match(/<body[^>]*>([\s\S]*)<\/body>/)[1];
  const script = bodyRaw.match(/<script[^>]*>([\s\S]*?)<\/script>/)[1];
  const body = reroute(bodyRaw.replace(/<script[\s\S]*?<\/script>/g, "").trim());

  writeFileSync(join(app, "index.html"), `<!DOCTYPE html>
<!-- as-is ${file} 에서 이식. 마크업·메타는 원본 그대로, 스타일·스크립트는 모듈 참조. -->
<html lang="ko" data-app="${app === "image" ? "image" : app}">
<head>
${head}
<link rel="stylesheet" href="/src/shared/styles.css">
<script type="module" src="/src/shared/theme.ts"></script>
</head>
<body>
${body}
<script type="module" src="/src/apps/${app}/main.ts"></script>
</body>
</html>
`);

  writeFileSync(join("src/apps", app, "legacy.js"),
    `/* as-is ${file} 의 메인 스크립트 원본 이식.\n` +
    `   변경점: base64 → /thumbs URL, .html 링크 → 라우트. 로직 수정 없음.\n` +
    `   TODO(점진 리팩터링): DATA/CONFIG → data.ts, 공통 엔진 → src/shared/ */\n` +
    deBase64(reroute(script)));

  writeFileSync(join("src/apps", app, "main.ts"),
    `/* 엔트리: 이식된 원본 로직을 로드한다. 리팩터링이 진행되면 shared 모듈 조립으로 대체. */\nimport "./legacy.js";\n`);

  console.log(`${app}: html+legacy.js 생성`);
}
