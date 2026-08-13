import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/* 접근성 — 눈으로는 잘 안 보이지만 쓰는 사람에게는 걸리는 것들.

   E2E 가 이미 키보드 조작은 본다(탭 방향키·메뉴 Escape·포커스 복귀). 하지만
   색 대비 · 레이블 · 역할 · 이름은 아무도 안 보고 있었다. 사람이 눈으로 훑어서
   잡을 수 있는 종류가 아니다 — 대비는 계산해야 알고, 숫자가 4.5 인지 4.0 인지는
   화면만 봐서는 구분이 안 된다.

   실제로 붙이자마자 하나 나왔다. `.grp-label i` 에 opacity:.75 가 걸려 있었는데,
   라이트 테마에서 #075985 가 배경과 섞여 #4380a2 가 되면서 4:1 로 떨어졌다.
   11px 글자라 AA 는 4.5:1 을 요구한다. opacity 를 걷어 내 고쳤다.

   테마마다 색이 다르므로 **양쪽 테마를 다 본다** — 다크만 보면 위의 것을 놓친다.
   폭도 두 개를 보는데, 모바일에서는 결과 레일이 접혔다 펴지면서 아예 다른
   마크업이 뜨기 때문이다.

   검사는 크로미움에서만 한다. 대비·레이블·역할은 DOM 과 CSS 의 사실이라
   엔진마다 달라지지 않는다. 사파리에서까지 돌리면 시간만 두 배가 된다. */

const APPS = ["image", "t2v", "i2v"] as const;
const THEMES = ["dark", "light"] as const;

/* 전환이 끝난 뒤의 색을 본다.

   버튼은 `transition:.15s` 로 상태가 바뀐다. 프리셋을 고르면 되돌리기 버튼이
   `opacity .3 → 1` 로 살아나는데, 그 중간을 axe 가 재면 배경과 섞인 색이 나온다.
   실측: 가라앉은 뒤 대비는 7.4:1 인데 전환 중에는 4.49:1 로 잡혔다(불투명도 0.69 지점).
   그래서 이 검사는 **가끔** 실패했다 — 반복 60회에 3회. CI 는 운으로 통과하고 있었다.
   가끔 맞는 테스트는 없는 것보다 나쁘다. 없으면 안 본 줄 알지만 있으면 봤다고 믿는다.

   `waitForTimeout` 으로 기다리면 나중에 전환 시간이 바뀔 때 또 깨진다. 대신 동작 줄이기를
   켠다 — styles.css 에 이미
   `@media(prefers-reduced-motion:reduce){ *{transition:none!important;animation:none!important} }`
   가 있어서 **앱 자신의 코드 경로**가 전환을 끈다. 테스트용 CSS 를 주입하면 앱 CSS 와
   어긋나도 아무도 못 잡지만 이 방식은 그럴 일이 없고, 실제 사용자 설정을 켠 상태를
   검사하게 된다 — 접근성 검사에는 오히려 제자리다.

   **`test.use({ reducedMotion })` 로 하면 안 된다.** Playwright 1.62 에서 이 파일 수준
   선언이 조용히 무시된다. 오류도 경고도 없이 미디어 질의가 계속 false 라, 고쳤다고
   믿는데 그대로 깨지는 상태가 된다(실제로 여기서 한 번 속았다). 그래서 페이지마다
   emulateMedia 를 명시적으로 부르고, 아래 첫 단언으로 정말 켜졌는지 확인한다.

   범위는 이 파일뿐이다. E2E 전역에 걸면 전환이 관여하는 동작(모바일 결과 패널
   여닫기 등)을 검사하지 못하게 된다. */
async function 열기(page: Page, app: string, theme: string) {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(t => localStorage.setItem("prompt-builder:theme", t), theme);
  await page.goto(`/${app}/`);
  // 켜졌는지 확인하고 넘어간다 — 조용히 안 먹는 경우가 있었다
  expect(await page.evaluate(() =>
    matchMedia("(prefers-reduced-motion: reduce)").matches), "동작 줄이기가 안 켜짐").toBe(true);
}

async function 위반(page: Page) {
  const r = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  // 실패했을 때 무엇이 어디서 걸렸는지 바로 보이게 추린다
  return r.violations.map(v => ({
    규칙: `[${v.impact}] ${v.id}`,
    대상: v.nodes.slice(0, 3).map(n => String(n.target[0])),
    사유: v.nodes[0]?.any?.[0]?.message ?? v.nodes[0]?.all?.[0]?.message ?? v.help,
  }));
}

for (const app of APPS) {
  for (const theme of THEMES) {
    test(`${app} · ${theme} 테마 — 세 탭에 WCAG AA 위반이 없다`, async ({ page, browserName }) => {
      test.skip(browserName !== "chromium", "DOM·CSS 사실이라 엔진마다 다르지 않다");
      await 열기(page, app, theme);
      for (const pane of ["look", "guide", "manual"]) {
        await page.click(`.modetab[data-pane="${pane}"]`);
        expect(await 위반(page), `${app}/${theme}/${pane}`).toEqual([]);
      }
      // 선택이 들어간 상태 — 켜진 칩의 대비는 꺼진 것과 다르다
      await page.click('.modetab[data-pane="look"]');
      await page.locator("[data-preset]").first().click();
      expect(await 위반(page), `${app}/${theme}/프리셋 선택됨`).toEqual([]);

      /* 네거티브 프롬프트 칸은 Stable Diffusion 계열에서만 나온다. 기본 모델로만 검사하면
         이 마크업(읽기 전용 입력칸 + 두 번째 복사 버튼)은 아무도 안 본 채로 나간다.
         피사체를 채우는 이유 — i2v 는 움직임 설명이 없으면 프롬프트 자체를 만들지 않고,
         본문이 비면 네거티브 칸도 같이 숨는다(항목만 골라서는 이 칸을 못 본다). */
      await page.fill("#subject", "a cat leaps onto a windowsill");
      await page.click('[data-model="generic"]');
      await expect(page.locator("#negBox")).toBeVisible();
      expect(await 위반(page), `${app}/${theme}/네거티브 칸`).toEqual([]);
    });

    test(`${app} · ${theme} 테마 — 모바일에서 WCAG AA 위반이 없다`, async ({ page, browserName }) => {
      test.skip(browserName !== "chromium", "DOM·CSS 사실이라 엔진마다 다르지 않다");
      await page.setViewportSize({ width: 390, height: 844 });
      await 열기(page, app, theme);
      await page.click('.modetab[data-pane="manual"]');
      expect(await 위반(page), `${app}/${theme}/모바일 직접선택`).toEqual([]);
      // 결과 레일은 접혀 있다가 펴지면서 아예 다른 마크업이 뜬다
      await page.click(".mobile-out-bar");
      expect(await 위반(page), `${app}/${theme}/모바일 결과패널`).toEqual([]);
    });
  }
}
