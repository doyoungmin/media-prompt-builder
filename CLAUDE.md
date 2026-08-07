# MediaPromptBuilder

이미지·영상 생성 프롬프트를 단계별로 조립해 주는 웹앱.
아래는 이 저장소에서 일할 때 먼저 알아야 할 것들이다. 세부 사용법은 `README.md`.

```bash
npm install
npm run dev          # http://localhost:5173
npm run verify:all   # 배포 전 전체 검증 (E2E 포함)
```

---

## 1. 이 구조가 왜 이런가

세 개의 앱(`/image/` `/t2v/` `/i2v/`)이 **같은 엔진을 공유**한다. Vite 멀티페이지이고,
경로가 곧 앱 식별자다.

엔진은 `src/shared/engine/` 아래 9조각으로 나뉘어 있다. **조각들은 ES 모듈이 아니다.**
빌드 때 순서대로 이어 붙여 하나의 스크립트로 돌기 때문에 전역 하나를 공유한다.

- 조각 안에 `import` / `export` 를 쓰면 안 된다 — 스모크가 막는다
- **파일명 앞 번호가 곧 실행 순서**다
- 앱마다 다른 부분은 `src/apps/<app>/app.js` 에 있고, 엔진의 `/*==SLOT:n==*/` 자리에 끼워 넣는다
- 조립은 `scripts/compose-engine.mjs` 가 하고, vite 는 이걸 `virtual:engine-<app>` 으로 노출한다

그래서 **공통 동작을 고칠 때는 엔진 한 곳만, 앱별 항목을 고칠 때는 그 앱의 app.js 한 곳만** 고치면 된다.

| 조각 | 무엇 |
|---|---|
| `01-data.js` | 항목 데이터 — 세 앱이 함께 쓰는 원본 목록 |
| `02~04-preview*.js` | 도식·색 스와치·효과 서술·레퍼런스 룩·충돌 규칙 (SLOT 3곳) |
| `05-derive.js` | 앱 설정으로 걸러 낸 파생 상태 |
| `06-render.js` | 화면 생성 · 가이드 사진 srcset |
| `07-events.js` | 이벤트·선택·되돌리기·키보드 |
| `08-sync.js` | 동기화·Seedance 패널·저장·테마 (`STORE_V` 정본) |
| `09-prompt.js` | 프롬프트 조립과 복사 |

---

## 2. 여기서 반복해서 사고가 났다

이 저장소에서 실제로 터졌던 것들이다. 같은 자리를 또 밟기 쉽다.

### 로컬 초록 ≠ CI 초록

세 번 당했다. 전부 "내 환경에서만 통과"였다.

- jsdom 30 을 Node 20 CI 에 올려 터짐 → Node 22 로 올리고 `engines` 에 못 박음
- `vite preview` 가 CI 에서 `localhost` → IPv6 로 풀려 E2E 가 120초 뒤 죽음 → `--host 127.0.0.1` 명시
- 로컬에만 있는 브라우저·바이너리

**환경이 다를 수 있는 변경은 CI 를 보고 나서 완료라고 말할 것.**

### 테스트가 통과해도 결과물은 틀릴 수 있다

Seedance 출력에서 `Captured on shot on ARRI Alexa 35` 같은 비문이 나갔는데 자동 검사는 전부
초록이었다. 문자열 포함 여부만 봤기 때문이다. **생성물은 눈으로 한 번 읽어야 한다.**

### CSS 단축 속성이 longhand 를 조용히 덮는다

`margin-top:auto` 를 써 놓고 뒤에서 `margin` 단축을 쓰면 지워진다. 하단 스티키 버튼이
이것 때문에 안 붙었고, **고쳤다고 보고했는데 실제로는 안 고쳐져 있었다.**
`npm run lint:css` 가 이 패턴과 깨진 블록 주석을 잡는다.

### 정적 검사로는 절대 안 잡히는 것 — 레이아웃

가장 최근 사고다. 가이드 사진의 `srcset sizes` 가 `700px`·`1100px` 중단점을 쓰고 있었는데
`styles.css` 에는 그런 중단점이 없었다. 진짜로 1열이 되는 지점은 **1039px** 이다.
그래서 701~1039px 구간에서 카드는 970px 까지 커지는데 선언은 468px 이었고, 브라우저는
그 선언만 보고 768px 짜리를 받아 **늘려 그렸다.**

파일도 멀쩡하고 문법도 맞아서 정적 검사는 전부 통과한다. 실제 폭은 레이아웃을 계산하는
브라우저에서만 알 수 있다. → `e2e/app.spec.ts` 의 "가이드 사진이 실제 카드 폭에 맞는
해상도로 그려진다" 가 폭 9종에서 이걸 대조한다.

### 그래서 — 고쳤다고 말하기 전에

1. **실제 환경에서 재라.** jsdom 은 레이아웃을 계산하지 않고 ESM 번들도 못 돌린다
2. **테스트가 헛돌지 않는지 증명하라.** 고친 회귀를 일부러 되돌려 넣고 빨간불이 뜨는지 본다
3. 확신은 근거가 아니다 — 이 문장을 쓰는 지금도 그렇다

---

## 3. 가이드 사진 (자주 건드리게 된다)

`src/apps/{image,t2v}/app.js` 의 `GUIDE_IMG` 가 라벨 → 파일을 잇는다. **두 앱의 맵은 같아야 한다**
(검수가 대조한다). 사진은 `public/thumbs/` 에 있고 3단 사다리로 낸다.

| 칸 | 위치 | 크기 |
|---|---|---|
| 480w | `public/thumbs/guide-480/` | 480×270 |
| 768w | `public/thumbs/guide-768/` | 768×432 |
| 1024w | `public/thumbs/` (원본) | 1024×576 |

`sizes` 는 `06-render.js` 의 `GUIDE_SIZES` 하나뿐이고 **반드시 `styles.css` 의 실제 중단점을
따라가야 한다.** 지금은 `1039px`(1열 전환)과 `1680px`(트랙 확대). 넘겨 선언하면 큰 파일을 받아
바이트만 손해지만, 모자라게 선언하면 늘려 그린다 — 후자만 버그다.

사진을 추가·교체하면:

```bash
npm run generate:guide-assets   # ImageMagick 7 필요. 원본에서 480/768 파생
npm run verify:guide-assets     # 존재·치수·16:9·총량·중단점 실재 여부
npm run test:e2e                # 폭별 실제 카드 대조
```

세 곳(`GUIDE_SIZES` · `verify-guide-assets.mjs` 의 `RUNGS` · `generate-guide-variants.mjs`)이
어긋나면 검수가 잡는다.

---

## 4. 검증

| 명령 | 무엇을 보는가 |
|---|---|
| `typecheck` | 타입 |
| `lint:css` | 단축 속성이 longhand 를 덮는지 · 주석 깨짐 |
| `test:smoke` | 3개 앱이 jsdom 에서 뜨는지 · 레일 순서 · 참조 자산 존재 |
| `verify:storage` `verify:copy` `verify:pwa` `verify:seedance` | 각 기능 회귀 |
| `verify:config` | 앱 설정이 실재하는 섹션·항목을 가리키는지 |
| `verify:guide-assets` | 가이드 사진 사다리 계약 |
| `test:e2e` | **실제 브라우저** — 레이아웃·번들 실행·해상도 (34개) |
| `verify:all` | 위 전부 + `npm audit` |

E2E 는 처음 한 번 브라우저를 받아야 한다: `npx playwright install --with-deps chromium`

**타입은 여기까지밖에 못 본다.** `app.js` 는 SLOT 으로 끼워 넣는 조각이라 그 자체로 모듈이
아니다. 그래서 `src/app-config.d.ts` 는 모양만 적어 두고, 그 값이 *실재하는* 섹션·항목인지는
`verify:config` 가 런타임으로 본다.

---

## 5. 배포

**push 하면 Cloudflare 가 자동으로 배포한다.** 운영 주소는
`https://media-prompt-builder.okeyido.workers.dev/`. 보통은 push 만 하면 끝이고,
20~60초 뒤 반영된다.

`npm run deploy` 는 손으로 밀어야 할 때만 쓰는 우회로다 (`release-check` → `verify:all` →
`wrangler deploy --strict`). `release-check.mjs` 는 `gh` CLI 를 쓰므로 없으면 그 단계에서 멈춘다.

가이드 사진은 파일명을 그대로 두고 내용만 바꾸는 일이 잦은데, 정적 에셋이
`cache-control: max-age=0, must-revalidate` 로 나가서 브라우저가 매번 재검증한다.
캐시 버스팅을 따로 걸 필요는 없다.

---

## 6. 사람 쪽 취향

- **한국어로 답한다.** 코드 주석도 한국어다
- 짧게 쓴다. 뺄 수 있는 말은 뺀다
- 주석은 *무엇을* 이 아니라 **왜** 를 적는다. 위의 사고들이 전부 주석으로 남아 있는 이유다
- 배포까지 알아서 끝내라는 지시가 자주 나온다. 그럴수록 위의 "고쳤다고 말하기 전에" 를 지킬 것
