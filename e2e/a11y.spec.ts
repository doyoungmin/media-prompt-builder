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

async function 열기(page: Page, app: string, theme: string) {
  await page.addInitScript(t => localStorage.setItem("prompt-builder:theme", t), theme);
  await page.goto(`/${app}/`);
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
