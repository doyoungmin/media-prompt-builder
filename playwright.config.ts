import { defineConfig, devices } from "@playwright/test";

/* 빌드 산출물을 실제 브라우저로 검증한다.
   jsdom 은 레이아웃을 계산하지 않아 겹침·넘침·고정 위치를 못 잡고,
   ESM 번들을 실행하지 못해 '빌드된 결과가 정말 도는지'도 확인할 수 없다.
   그 두 공백이 여기 몫이다. */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI
    ? [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]]
    : "list",
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  /* 사파리를 같이 본다. 이 앱은 aspect-ratio · color-mix · 100dvh ·
     env(safe-area-inset) 를 쓰는데, 전부 사파리에서 늦게 들어왔거나 동작이
     달랐던 것들이다. 크로미움만 보면 맥·아이폰 사용자에게 어떻게 보이는지
     아무도 모르는 채로 배포된다. */
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
  webServer: {
    /* --host 를 명시한다. vite preview 는 기본이 localhost 인데, CI 러너에서는
       localhost 가 ::1(IPv6) 로 먼저 풀려 서버가 IPv6 에만 붙는다. 그러면
       127.0.0.1 을 두드리는 아래 url 이 영원히 응답을 못 받고 120초 뒤 죽는다.
       내 샌드박스에서는 localhost 가 IPv4 라 통과해서 CI 에서만 터졌다. */
    command: "npm run build && npx vite preview --port 4173 --strictPort --host 127.0.0.1",
    url: "http://127.0.0.1:4173/",
    /* 오래된 4173 서버에 붙으면 다른 빌드를 검사할 수 있다. 매 실행마다 현재 산출물로 띄운다. */
    reuseExistingServer: false,
    timeout: 120_000,
    // 서버가 못 뜨면 이유를 로그로 남긴다 — 지난번엔 타임아웃 문구만 나왔다
    stdout: "pipe",
    stderr: "pipe",
  },
});
