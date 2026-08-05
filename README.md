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

## 배포 (GitHub → Cloudflare Pages 자동)

1. 이 폴더를 GitHub 저장소로 push
2. Cloudflare 대시보드 → Workers & Pages → Create → Pages → **Connect to Git**
3. Build command `npm run build` / Output directory `dist` (Framework preset: Vite)
4. 이후 `git push` 만 하면 자동 배포. PR 을 열면 프리뷰 URL 자동 생성.

CI(GitHub Actions)는 PR/push 마다 타입 검사 + 빌드 확인만 수행한다 (`.github/workflows/ci.yml`).
