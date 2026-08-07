import { test, expect, type Page } from "@playwright/test";

function watchRuntime(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(`pageerror: ${error.message}`));
  page.on("console", message => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  page.on("response", response => {
    if (response.status() >= 400) errors.push(`http ${response.status()}: ${response.url()}`);
  });
  return errors;
}

const APPS = [
  { path: "/image/", name: "이미지 프롬프트 빌더", note: null },
  { path: "/t2v/",   name: "영상 프롬프트 빌더",   note: "· 텍스트에서 생성" },
  { path: "/i2v/",   name: "영상 프롬프트 빌더",   note: "· 이미지에 모션 추가" },
];

/* 빌드된 번들이 실제로 실행되는지 — jsdom 은 ESM 번들을 못 돌려 여기서만 확인된다 */
test.describe("빌드 산출물이 브라우저에서 뜬다", () => {
  for (const app of APPS) {
    test(`${app.path} 부팅`, async ({ page }) => {
      const errors = watchRuntime(page);
      await page.goto(app.path);
      await expect(page.locator("#appTitleText")).toHaveText(app.name);
      if (app.note) await expect(page.locator("#appTitleNote")).toHaveText(app.note);
      else await expect(page.locator("#appTitleNote")).toHaveCount(0);
      await expect(page.locator("#prompt")).toBeVisible();
      await expect(page.locator("[data-model]").first()).toBeVisible();
      expect(errors, "콘솔 오류").toEqual([]);
    });
  }
});

test.describe("각 앱 핵심 흐름", () => {
  for (const app of APPS) {
    test(`${app.path} 선택에서 프롬프트 생성`, async ({ page }) => {
      const errors = watchRuntime(page);
      await page.goto(app.path);
      if (app.path === "/i2v/") await page.fill("#subject", "Her hair moves gently in the wind.");
      await page.locator("[data-preset]").first().click();
      await expect(page.locator("#prompt")).not.toHaveValue("");
      await expect(page.locator("#copyBtn")).toBeEnabled();
      expect(errors, "런타임·자산 오류").toEqual([]);
    });
  }
});

test("빌더 왕복 시 앱별 작업은 분리되고 복원된다", async ({ page }) => {
  await page.goto("/t2v/");
  await page.fill("#subject", "a cat on a windowsill");
  await page.locator("[data-preset]").first().click();
  await page.waitForFunction(() =>
    (localStorage.getItem("prompt-builder:t2v") || "").includes("windowsill"));
  await page.click("#builderBtn");
  await page.locator('#builderMenu a[href="/image/"]').click();
  await expect(page).toHaveURL(/\/image\/$/);
  await expect(page.locator("#appTitleText")).toHaveText("이미지 프롬프트 빌더");
  await expect(page.locator("#subject")).not.toHaveValue("a cat on a windowsill");
  await page.click("#builderBtn");
  await page.locator('#builderMenu a[href="/t2v/"]').click();
  await expect(page).toHaveURL(/\/t2v\/$/);
  await expect(page.locator("#subject")).toHaveValue("a cat on a windowsill");
});

test("프리셋을 고르면 프롬프트가 만들어진다", async ({ page }) => {
  await page.goto("/t2v/");
  await expect(page.locator("#prompt")).toHaveValue("");
  await page.locator("[data-preset]").first().click();
  await expect(page.locator("#prompt")).not.toHaveValue("");
  await expect(page.locator("#copyBtn")).toBeEnabled();
});

test("직접 선택이 프롬프트에 반영된다", async ({ page }) => {
  await page.goto("/t2v/");
  await page.click("#tab-manual");
  const chip = page.locator(".chip[data-kr]").first();
  const kr = await chip.getAttribute("data-kr");
  await chip.click();
  await expect(page.locator("#selSumCount")).toContainText("1개");
  await page.click("#selSumHead");
  await expect(page.locator(`.tag[data-remove="${kr}"]`)).toBeVisible();
});

/* 복사 버튼이 아이콘을 잃던 회귀 — 눈에 보이지만 단위 테스트로는 안 잡혔다 */
test("복사해도 버튼 아이콘이 남는다", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/t2v/");
  await page.locator("[data-preset]").first().click();
  await page.click("#copyBtn");
  await expect(page.locator("#copyBtn .copy-tx")).toHaveText("복사됨 ✓");
  await expect(page.locator("#copyBtn svg")).toHaveCount(1);
  await expect(page.locator("#copyBtn .copy-tx")).toHaveText("복사", { timeout: 4000 });
  await expect(page.locator("#copyBtn svg")).toHaveCount(1);
  expect(await page.evaluate(() => navigator.clipboard.readText())).not.toBe("");
});

test("작업이 새로고침 뒤에도 남는다", async ({ page }) => {
  await page.goto("/t2v/");
  await page.fill("#subject", "a cat on a windowsill");
  await page.locator("[data-preset]").first().click();
  const before = await page.locator("#prompt").inputValue();
  // 저장은 400ms 디바운스다. 시간을 재지 말고 실제로 기록될 때까지 기다린다.
  await page.waitForFunction(() =>
    (localStorage.getItem("prompt-builder:t2v") || "").includes("windowsill"));
  await page.reload();
  await expect(page.locator("#subject")).toHaveValue("a cat on a windowsill");
  await expect(page.locator("#prompt")).toHaveValue(before);
});

/* 저장값이 깨져도 앱이 죽지 않아야 한다 — 예전에는 백지가 됐다 */
for (const [label, bad] of [
  ["형식이 아예 다름", '{"v":2,"sel":{"shot":"문자열"}}'],
  ["JSON 이 깨짐",    "{oops"],
  ["미래 버전",       '{"v":99,"sel":{"shot":["와이드 / 풀샷"]}}'],
] as const) {
  test(`저장값이 손상돼도 뜬다 — ${label}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", e => errors.push(e.message));
    await page.goto("/t2v/");
    await page.evaluate(v => localStorage.setItem("prompt-builder:t2v", v), bad);
    await page.reload();
    await expect(page.locator("#prompt")).toBeVisible();
    await expect(page.locator("[data-act='reset']")).toBeVisible();
    expect(errors, "콘솔 오류").toEqual([]);
  });
}

/* 레이아웃 회귀 — jsdom 은 레이아웃을 계산하지 않아 이 부류를 전혀 못 잡는다 */
const WIDTHS = [1440, 1100, 900, 768, 430, 360];
for (const w of WIDTHS) {
  test(`폭 ${w}px 에서 헤더·버튼이 화면 안에 있다`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: 900 });
    await page.goto("/t2v/");
    // 가로 스크롤이 생기면 어딘가 넘친 것이다
    const overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
    expect(overflow, "가로 넘침").toBe(false);
    // 테마 스위치는 항상 화면 안에 보인다
    await expect(page.locator("#themeSwitch")).toBeInViewport();
    // 앱 이름은 어떤 폭에서도 쪼개지지 않는다(한 줄)
    const nameLines = await page.evaluate(() => {
      const el = document.getElementById("appTitleText")!;
      return Math.round(el.getBoundingClientRect().height /
        parseFloat(getComputedStyle(el).lineHeight || "0"));
    });
    expect(nameLines, "앱 이름이 여러 줄로 쪼개짐").toBeLessThanOrEqual(1);
  });
}

test("동작 버튼이 결과 레일 바닥에 붙어 있다", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/t2v/");
  const gap = await page.evaluate(() => {
    const rail = document.querySelector(".out-in")!;
    const act = document.querySelector(".out-actions")!;
    return Math.round(rail.getBoundingClientRect().bottom - act.getBoundingClientRect().bottom);
  });
  expect(Math.abs(gap), "버튼 바가 바닥에서 떠 있음").toBeLessThanOrEqual(1);
});

test("모바일에서 결과 패널을 열고 닫을 수 있다", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/t2v/");
  const bar = page.locator("#mobileOutBar");
  await expect(bar).toBeVisible();
  await bar.click();
  await expect(page.locator("#prompt")).toBeInViewport();
  await page.click("#mobileOutHead");
  await expect(bar).toBeVisible();
});

test("키보드만으로 주요 조작에 닿는다", async ({ page }) => {
  await page.goto("/t2v/");
  await page.locator("[data-preset]").first().click();
  await page.locator("#subject").focus();
  const reached: string[] = [];
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press("Tab");
    const id = await page.evaluate(() => document.activeElement?.id || "");
    if (id) reached.push(id);
    if (reached.includes("copyBtn")) break;
  }
  expect(reached, "탭 이동으로 복사 버튼까지 닿지 못함").toContain("copyBtn");
});

test("테마 선택이 메타 색상·새로고침·앱 전환에 유지된다", async ({ page }) => {
  await page.goto("/t2v/");
  await page.click("#themeLight");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute("content", "#f5f6f8");
  await page.reload();
  await expect(page.locator("#themeLight")).toHaveAttribute("aria-pressed", "true");
  await page.click("#builderBtn");
  await page.locator('#builderMenu a[href="/i2v/"]').click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute("content", "#f5f6f8");
});

test("앱 전환 메뉴와 탭을 방향키·Escape로 조작한다", async ({ page }) => {
  await page.goto("/t2v/");
  await page.locator("#builderBtn").focus();
  await page.keyboard.press("Enter");
  const firstFocusedHref = await page.evaluate(() => document.activeElement?.getAttribute("href"));
  expect(firstFocusedHref).toBe("/image/");
  await page.keyboard.press("ArrowDown");
  await expect(page.locator('#builderMenu a[href="/t2v/"]')).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.locator("#builderBtn")).toBeFocused();
  await expect(page.locator("#builderBtn")).toHaveAttribute("aria-expanded", "false");

  await page.locator("#tab-look").focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("#tab-guide")).toBeFocused();
  await expect(page.locator("#tab-guide")).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("#tab-guide")).toHaveAttribute("tabindex", "0");
  await expect(page.locator("#tab-look")).toHaveAttribute("tabindex", "-1");
});
