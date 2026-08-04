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
- `src/shared/` — 3개 앱 공통 엔진 (CSS·테마·위저드·프롬프트 조립·SVG 프리뷰)
- `src/apps/*/data.ts` — 앱별 옵션·프리셋 데이터 (여기만 고치면 옵션 수정 끝)
- `public/thumbs/` — 예시 사진 webp + `thumbs-map.json` (한글 키 → 파일명)

## 배포 (GitHub → Cloudflare Pages 자동)

1. 이 폴더를 GitHub 저장소로 push
2. Cloudflare 대시보드 → Workers & Pages → Create → Pages → **Connect to Git**
3. Build command `npm run build` / Output directory `dist` (Framework preset: Vite)
4. 이후 `git push` 만 하면 자동 배포. PR 을 열면 프리뷰 URL 자동 생성.

CI(GitHub Actions)는 PR/push 마다 타입 검사 + 빌드 확인만 수행한다 (`.github/workflows/ci.yml`).
