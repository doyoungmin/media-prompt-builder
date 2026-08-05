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
- `src/shared/engine.js` — 3개 앱 공통 엔진 1벌 (위저드·프롬프트 조립·SVG 프리뷰·저장).
  `/*==SLOT:n==*/` 위치에 앱별 코드가 빌드 시 삽입된다 (vite.config.ts 의 engine-compose 플러그인)
- `src/apps/*/app.js` — 앱별 차이만 담은 코드 (CONFIG·프리셋·썸네일 맵). 옵션 수정은 여기서
- `public/thumbs/` — 예시 사진 webp + `thumbs-map.json` (한글 키 → 파일명)

수정 → 반영 흐름: 공통 수정은 engine.js 한 곳, 앱별 수정은 해당 app.js 한 곳만 고치면
세 앱에 동시에 반영된다. `npm run test:smoke` 로 3개 앱 렌더 검증.

### 대상 모델 추가

각 `app.js` 의 `CONFIG.models` 에 항목을 넣고 `CONFIG.build(model)` 에 분기를 더하면
'대상 모델' 전환 버튼이 자동으로 생긴다. `guard` 는 텍스트·워터마크 방지 문구,
`limit` 은 간결/상세 각각의 권장 단어 수다.

현재 영상 빌더(t2v·i2v)는 Veo · **Seedance** · 범용 셋을 지원한다. Seedance 는
`Camera and lens:` 같은 라벨 블록을 화면 속 글자로 그려내거나 무시하므로,
라벨 없이 문장 조각을 마침표로 끊어 한 문단으로 잇는다 (주체·행동 → 카메라 → 장비·렌즈
→ 조명·색감 → 마감). 항목이 전부 명사구라 동사를 억지로 붙이면 비문이 되기 때문에
`cap()` 으로 첫 글자만 올린다. `npm run verify:seedance` 가 실제 출력 문자열을 뽑아
라벨 잔존·비문·200단어 초과·경계 상황(선택 0개, 입력 없음)을 검사한다.

## 배포 (GitHub → Cloudflare Pages 자동)

1. 이 폴더를 GitHub 저장소로 push
2. Cloudflare 대시보드 → Workers & Pages → Create → Pages → **Connect to Git**
3. Build command `npm run build` / Output directory `dist` (Framework preset: Vite)
4. 이후 `git push` 만 하면 자동 배포. PR 을 열면 프리뷰 URL 자동 생성.

CI(GitHub Actions)는 PR/push 마다 타입 검사 + 빌드 확인만 수행한다 (`.github/workflows/ci.yml`).
