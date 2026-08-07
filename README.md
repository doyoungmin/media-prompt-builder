# Media Prompt Builder

이미지·영상(T2V/I2V) 생성 프롬프트 빌더. `as-is-HTML/` 단일 파일 앱을 Vite + TypeScript 멀티페이지 구조로 전환한 것.
전체 설계는 상위 폴더의 `개발구상.md` 참고.

## 개발

```bash
npm install
npm run extract-assets   # 최초 1회: as-is HTML 에서 예시 사진 추출
npm run dev              # http://localhost:5173
npm run build            # dist/ 생성
```

## 구조

- `image/ t2v/ i2v/` — 앱별 HTML 엔트리 (경로 = 앱 식별자)
- `src/shared/engine/*.js` — 3개 앱 공통 엔진. 기능 단위로 나뉘어 있고
  **파일명 앞 번호가 곧 실행 순서**다. 조각들은 ES 모듈이 아니라 이어 붙여
  하나의 스크립트로 돌기 때문에 조각 안에 `import`/`export` 를 쓰면 안 된다
  (스모크가 이를 검사한다). `/*==SLOT:n==*/` 위치에 앱별 코드가 삽입된다
  (vite.config.ts 의 engine-compose 플러그인 · scripts/compose-engine.mjs)

  | 조각 | 무엇 |
  |---|---|
  | `01-data.js` | 항목 데이터 — 세 앱이 함께 쓰는 원본 목록 |
  | `02-preview.js` `03-preview-2.js` `04-preview-3.js` | 도식·색 스와치·효과 서술·레퍼런스 룩·충돌 규칙 (SLOT 3곳) |
  | `05-derive.js` | 앱 설정으로 걸러 낸 파생 상태 |
  | `06-render.js` | 화면 생성 |
  | `07-events.js` | 이벤트·선택·되돌리기 |
  | `08-sync.js` | 동기화·Seedance 패널·저장·테마 |
  | `09-prompt.js` | 프롬프트 조립과 복사 |
- `src/apps/*/app.js` — 앱별 차이만 담은 코드 (CONFIG·프리셋·썸네일 맵). 옵션 수정은 여기서
- `public/thumbs/` — 예시 사진 webp + `thumbs-map.json` (한글 키 → 파일명)

수정 → 반영 흐름: 공통 수정은 `src/shared/engine/`의 해당 기능 조각, 앱별 수정은 해당
`src/apps/*/app.js`를 고치면 된다. 조각 번호·SLOT 집합은 compose 검증이, 3앱 렌더는
`npm run test:smoke`가 확인한다. 작업 전에는 루트 `CLAUDE.md`도 읽는다.

### 가이드 이미지 파생본

가이드 카드 사진은 `srcset` 3단 사다리로 낸다. 원본 1024px 가 맨 윗칸이라 따로 만들지 않는다.

| 칸 | 위치 | 크기 |
|---|---|---|
| `480w` | `public/thumbs/guide-480/` | 480×270 |
| `768w` | `public/thumbs/guide-768/` | 768×432 |
| `1024w` | `public/thumbs/` (원본) | 1024×576 |

`sizes` 는 `06-render.js` 의 `GUIDE_SIZES` 하나뿐이고 **반드시 `styles.css` 의 실제 중단점을
따라가야 한다.** 지금은 `1039px`(옵션 그리드가 1열이 되는 지점)과 `1680px`(트랙 확대).
브라우저는 레이아웃을 계산하기 전에 이 선언만 보고 후보를 고르므로, 넘겨 선언하면 큰 파일을
받아 바이트만 손해지만 **모자라게 선언하면 작은 파일을 늘려 그린다.**

> 실제로 당한 적이 있다. `sizes` 가 `700px`·`1100px` 중단점을 쓰고 있었는데 CSS 에 그런
> 중단점이 없었다. 701~1039px 구간에서 카드는 970px 까지 커지는데 선언은 468px 이라
> 768px 짜리를 받아 늘려 그렸다. 파일도 문법도 멀쩡해서 정적 검사는 전부 통과했다.

원본을 교체한 뒤에는 ImageMagick 7 이 있는 환경에서 `npm run generate:guide-assets` 를
실행하고 생성 파일을 함께 커밋한다.

- `npm run verify:guide-assets` — 20장 목록·WebP 형식·**실제 치수**·16:9·총량·`sizes` 중단점이
  `styles.css` 에 실재하는지
- `npm run test:e2e` — 폭 9종에서 **실제 카드 폭**과 선언·선택된 파일을 대조

`GUIDE_SIZES` · `verify-guide-assets.mjs` 의 `RUNGS` · `generate-guide-variants.mjs` 셋이
어긋나면 검수가 잡는다.

### 대상 모델 추가

각 `app.js` 의 `CONFIG.models` 에 항목을 넣고 `CONFIG.build(model)` 에 분기를 더하면
'대상 모델' 전환 버튼이 자동으로 생긴다. `guard` 는 텍스트·워터마크 방지 문구,
`limit` 은 간결/상세 각각의 권장 단어 수다.

현재 영상 빌더(t2v·i2v)는 Veo · **Seedance 2.0** · 범용 셋을 지원한다.

### Seedance 2.0 모드

Seedance 2.0 은 1.0/1.5 와 달리 **네이티브 오디오·멀티숏·최대 15초**를 지원하고,
카메라·렌즈 키워드보다 **"언제 무엇이 바뀌는가"**에 훨씬 크게 반응한다. 그래서 이 모드만
전용 입력 패널을 쓴다 (`CONFIG.sd` 가 있는 앱에서 엔진이 만든다. 이미지 빌더에는 없다).

- **시간 구간** 2구간(6초) / 3구간(10초) — 구간별 사건 전개를 직접 적는다
- **오디오** 무음 / 환경음 / 환경음+대사 + 자유 메모
- **참조 이미지 유지 수준** (I2V 전용) 엄격 유지 / 자연스러운 변주

출력은 구간이 줄 단위로 살아 있어야 하므로 `sdPrompt()` 가 **줄바꿈을 유지**한다.
`dedupePhrases()` 도 문장을 가른 공백을 그대로 되돌리도록 고쳐 뒀다 — 예전처럼
`join(" ")` 로 합치면 시간 구간이 한 줄로 뭉개진다.

`npm run verify:seedance` 가 실제 출력 문자열을 뽑아 구간 줄·오디오 줄·줄바꿈 보존·
컨트롤 연동(구간 수/오디오/유지 수준)·되돌리기·초기화·경계 상황(구간 미입력)과
**Veo·범용 회귀**까지 검사한다.

> 참고: 1.0 / 1.5 Pro 는 무음·단일 숏이라 이 형식이 맞지 않는다. 그쪽 모델을 쓸 거라면
> Veo 또는 범용 출력을 쓰는 편이 낫다.

## 테스트

| 명령 | 무엇을 보는가 |
|---|---|
| `npm run typecheck` | 타입 |
| `npm run lint:css` | CSS 자책골(shorthand 가 longhand 를 덮어씀·주석 깨짐) |
| `npm run test:smoke` | 3개 앱이 jsdom 에서 뜨는지 · 레일 순서 · 참조 자산 존재 |
| `npm run verify:storage` `verify:copy` `verify:pwa` `verify:seedance` | 각 기능의 회귀 |
| `npm run verify:config` | 앱 설정의 모양과 실재하는 섹션·항목 참조 |
| `npm run verify:guide-assets` | 가이드 사진 사다리 계약(존재·치수·16:9·총량·중단점) |
| `npm run test:e2e` | **실제 브라우저**(Playwright) — 3앱 핵심 흐름·레이아웃·테마·키보드·사진 해상도 |
| `npm run verify:all` | 위 전체 검사 + 빌드 + 의존성 audit |

`test:e2e` 만 볼 수 있는 것이 있다. jsdom 은 레이아웃을 계산하지 않아 겹침·넘침·
고정 위치를 못 잡고, ESM 번들을 실행하지 못해 '빌드된 결과가 정말 도는지'도
확인하지 못한다. 그래서 E2E 는 `vite preview` 로 **빌드 산출물**을 띄우고
폭 1440·1100·900·768·430·360px 에서 검사한다.

처음 한 번은 브라우저를 받아야 한다: `npx playwright install --with-deps chromium`

앱 설정(`src/apps/*/app.js` 의 `CONFIG`)의 문서형 계약은 `src/app-config.d.ts`에 있다.
app.js는 SLOT으로 `src/shared/engine/*.js`에 삽입되는 전역 조각이어서 현재 TypeScript의
정적 강제 대상은 아니다. 대신 `verify:config`가 필수 필드 타입과 값의 실재성을 함께 본다 —
order가 sections 밖을 가리키는지, wiz·프리셋이 없는 항목을 부르는지, 모델 키가 겹치는지,
build()가 모든 키에서 문자열을 내놓는지 확인한다. CONFIG를 별도 모듈로 분리할 때
`AppConfig`를 정적 타입으로 직접 연결하는 것이 다음 구조 개선 과제다.

## 저장 상태 호환성

앱별 작업 상태는 `prompt-builder:<app-id>` 키로 localStorage에 저장되고,
`src/shared/engine/08-sync.js`의 `STORE_V`와 `migrateSavedState()`가 호환성을 관리한다.

- 선택 필드 추가처럼 기존 값을 그대로 읽을 수 있는 변경은 기본값으로 보완한다.
- 필드 타입·의미를 바꾸는 비호환 변경에서만 `STORE_V`를 올린다.
- 버전을 올릴 때는 기존 버전 마이그레이션과 손상 데이터 안전 초기화를 함께 구현한다.
- `npm run verify:storage`로 정상 복원, 구버전 마이그레이션, 손상 데이터 내성을 확인한다.

## 배포 (Cloudflare Workers)

운영 정본은 `wrangler.jsonc`가 가리키는 Cloudflare Workers 정적 에셋 배포이고,
운영 주소는 `https://media-prompt-builder.okeyido.workers.dev/`이다.
`dist/`가 통째로 올라가며 `/image/`, `/t2v/`, `/i2v/` 경로를 제공한다.

`main`에 push 하면 배포된다. 보통은 push 만 하면 끝이다.

### 검증을 통과한 것만 나가게 하기 (전환 필요)

예전에는 Cloudflare 가 push 를 직접 받아 배포했다. 그러면 검증과 배포가 나란히 달리는데,
실측하면 **배포 20초 · CI 1분**이라 CI 가 빨간불이어도 이미 운영에 나가 있었다. 지금까지
안 터진 건 push 전에 손으로 다 돌려 봤기 때문이지 구조가 막아 준 게 아니다.

그래서 `ci.yml` 에 `deploy` job 을 뒀다. `needs: check` 라 **검증이 통과해야만** 배포하고,
배포 뒤에 네 경로(`/` `/image/` `/t2v/` `/i2v/`)를 실제로 받아 200 인지 확인한다.

이 job 은 자격증명이 없으면 조용히 건너뛴다. 그래서 아래 세 단계를 밟기 전까지는
Cloudflare 쪽이 계속 배포하고, 밟는 순간 이쪽이 이어받는다 — **아무도 배포하지 않는
구간 없이** 갈아탈 수 있다.

1. Cloudflare 대시보드 → My Profile → API Tokens → **Edit Cloudflare Workers** 템플릿으로
   토큰 발급. Account ID 는 Workers 개요 화면 오른쪽에 있다
2. GitHub 저장소 → Settings → Secrets and variables → Actions 에
   `CLOUDFLARE_API_TOKEN` 과 `CLOUDFLARE_ACCOUNT_ID` 추가
3. 그 다음 push 가 GitHub 에서 배포되는지 확인한 뒤, Cloudflare 대시보드에서
   이 Worker 의 **Git 연동(Builds)을 해제**한다. 이 순서를 지켜야 겹치거나 비지 않는다

### 롤백

Cloudflare 대시보드 → Worker → Deployments 에서 이전 버전을 고르면 된다. `deploy` job 이
커밋 SHA 앞 12자리를 버전 태그로, 커밋 제목을 메시지로 남기므로 목록에서 바로 찾을 수 있다.

손으로 밀어야 할 때만 우회로를 쓴다.

```bash
npm run deploy      # release-check → verify:all → wrangler deploy --strict
```

`release-check.mjs`는 `main`인지, 작업 트리가 깨끗한지, `origin/main`과 같은지,
그 커밋의 CI가 성공했는지를 본다. **`gh` CLI 가 필요하다** — 없으면 그 단계에서 멈춘다.

정적 에셋은 `cache-control: max-age=0, must-revalidate`로 나간다. 그래서 가이드 사진처럼
파일명을 그대로 두고 내용만 바꿔도 브라우저가 매번 재검증하고, 캐시 버스팅을 따로 걸 필요가 없다.
