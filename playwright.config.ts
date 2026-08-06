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
  reporter: process.env.CI ? "list" : [["list"]],
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run build && npx vite preview --port 4173 --strictPort",
    url: "http://127.0.0.1:4173/",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
