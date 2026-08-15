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

/* 랜딩(/)은 운영 주소의 첫 화면인데 지금까지 E2E 밖이었다 — CI 는 200 만 봤다.
   테마 복원 스크립트가 없어서 라이트를 고른 사람이 여기서만 다크를 보고 있었다. */
test.describe("랜딩", () => {
  test("세 빌더로 가는 입구가 뜬다", async ({ page }) => {
    const errors = watchRuntime(page);
    await page.goto("/");
    await expect(page.locator("h1")).toHaveText("미디어 프롬프트 빌더");
    for (const app of APPS)
      await expect(page.locator(`.lp-card[href="${app.path}"]`)).toBeVisible();
    // 아이콘이 실제로 그려졌는지 — 경로 오타는 alt="" 라 눈에 안 띈다
    expect(await page.evaluate(() =>
      [...document.querySelectorAll<HTMLImageElement>(".lp img")]
        .filter(img => !img.complete || img.naturalWidth === 0)
        .map(img => img.getAttribute("src"))), "그려지지 않은 이미지").toEqual([]);
    expect(errors, "런타임·자산 오류").toEqual([]);
  });

  /* 앱 아이콘은 fill="white" 하나로만 그려져 있다. 라이트 테마 카드는 흰 바탕이라
     그대로 두면 **아이콘이 통째로 안 보인다** — 파일은 멀쩡하고 로드도 되므로
     naturalWidth 검사도 통과한다. 실제로 화면을 띄워 보고서야 알았다.
     앱 헤더(.brand-ic)와 같은 방식(filter:invert)으로 뒤집는데, 그 규칙이 사라지면
     아무도 모르게 다시 사라지므로 여기서 두 테마를 대조해 둔다. */
  test("라이트 테마에서 카드 아이콘이 바탕에 묻지 않는다", async ({ page }) => {
    const 필터 = async (theme: string) => {
      await page.addInitScript(t => localStorage.setItem("prompt-builder:theme", t), theme);
      await page.goto("/");
      return page.locator(".lp-card img").first().evaluate(el => getComputedStyle(el).filter);
    };
    expect(await 필터("dark"), "다크에서는 뒤집지 않는다").toBe("none");
    await page.context().clearCookies();
    expect(await 필터("light"), "라이트에서 흰 아이콘을 그대로 두면 안 보인다").not.toBe("none");
  });

  test("카드를 누르면 그 빌더로 간다", async ({ page }) => {
    for (const app of APPS) {
      await page.goto("/");
      await page.locator(`.lp-card[href="${app.path}"]`).click();
      await expect(page).toHaveURL(new RegExp(`${app.path}$`));
      await expect(page.locator("#appTitleText")).toHaveText(app.name);
    }
  });

  test("빌더에서 고른 테마를 현관에서도 따른다", async ({ page }) => {
    await page.goto("/t2v/");
    await page.click("#themeLight");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  });

  for (const w of [1440, 768, 390, 320]) {
    test(`랜딩 폭 ${w}px 에서 가로로 넘치지 않는다`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: 900 });
      await page.goto("/");
      expect(await page.evaluate(() =>
        document.documentElement.scrollWidth > document.documentElement.clientWidth + 1),
        "가로 넘침").toBe(false);
      await expect(page.locator('.lp-card[href="/i2v/"]')).toBeInViewport();
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

/* 복사 버튼이 아이콘을 잃던 회귀 — 눈에 보이지만 단위 테스트로는 안 잡혔다.

   clipboard-read / clipboard-write 는 크로미움에만 있는 권한 이름이라 사파리에서는
   grantPermissions 자체가 던진다. 사파리에는 그런 권한 개념이 없고 대신 사용자
   제스처로 시작된 복사만 허용한다 — 아래는 실제 버튼 클릭이니 통과한다.
   그래서 권한 부여는 크로미움에서만 하고, 읽기 검증도 거기서만 한다.
   정작 이 테스트가 지키려는 것(아이콘이 사라지지 않는가)은 양쪽에서 다 본다. */
test("복사해도 버튼 아이콘이 남는다", async ({ page, context, browserName }) => {
  const 클립보드확인 = browserName === "chromium";
  if (클립보드확인) await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/t2v/");
  await page.locator("[data-preset]").first().click();
  await page.click("#copyBtn");
  await expect(page.locator("#copyBtn .copy-tx")).toHaveText("복사됨 ✓");
  await expect(page.locator("#copyBtn svg")).toHaveCount(1);
  await expect(page.locator("#copyBtn .copy-tx")).toHaveText("복사", { timeout: 4000 });
  await expect(page.locator("#copyBtn svg")).toHaveCount(1);
  if (클립보드확인)
    expect(await page.evaluate(() => navigator.clipboard.readText())).not.toBe("");
});

/* 길이 경고는 항목을 많이 고를수록 SOFT 조합 경고 뒤로 밀렸다. 화면에는 첫 건만
   나오므로(setNote), 프롬프트가 3배로 길어진 바로 그 순간에 정확히 안 보였다.
   실측 386단어일 때 15건 중 15번째였다. 보이느냐가 쟁점이라 jsdom 으로는 못 잡는다. */
test("프롬프트가 크게 길어지면 그 경고가 화면 글자로 보인다", async ({ page }) => {
  await page.goto("/t2v/");
  await page.click("#tab-manual");
  await page.evaluate(() =>
    document.querySelectorAll<HTMLElement>(".chip[data-kr]").forEach(chip => chip.click()));
  const words = await page.evaluate(() =>
    (document.getElementById("prompt") as HTMLTextAreaElement).value.trim().split(/\s+/).length);
  expect(words, "항목을 다 골랐는데 권장 130단어의 1.5배를 못 넘음").toBeGreaterThan(195);
  // #outNote 에는 첫 건만 쓰인다 — 여기 보인다는 것이 곧 맨 앞으로 왔다는 뜻이다
  await expect(page.locator("#outNote")).toContainText(/권장 \d+단어의 [\d.]+배/);
});

/* 상세는 항목마다 EXT(특성 서술)를 덧붙이는 것이라, EXT 가 없는 항목만 고르면
   간결과 글자까지 같아진다. 그때도 버튼이 활성이면 눌러도 아무 일이 안 일어난다 —
   "할 일이 없는 버튼은 비활성" 은 아래 키보드 테스트가 이미 세운 규칙이다. */
test("상세가 간결과 같은 결과를 낼 때 그 버튼은 비활성이다", async ({ page }) => {
  await page.goto("/i2v/");
  const detail = page.locator('[data-length="detail"]');
  await expect(detail, "아무것도 안 고른 상태에서 활성").toBeDisabled();
  await page.fill("#subject", "her hair drifts in the wind");
  // 카메라 무빙에는 EXT 가 있다 — 상세가 실제로 달라진다
  await page.locator("[data-preset]").first().click();
  await expect(detail).toBeEnabled();
});

/* 초기화는 !guardOn 을 '바뀐 게 있다'로 세면서 정작 되돌리지 않았다.
   토글만 끄고 초기화를 누르면 아무것도 안 변하는 되돌리기 단계만 하나 쌓였다. */
test("초기화가 텍스트 방지를 되돌린다", async ({ page }) => {
  await page.goto("/t2v/");
  const guard = page.locator("#guardBtn");
  await expect(guard).toHaveAttribute("aria-pressed", "true");
  await guard.click();
  await expect(guard).toHaveAttribute("aria-pressed", "false");
  await page.locator("[data-act='reset']").click();
  await expect(guard).toHaveAttribute("aria-pressed", "true");
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
const WIDTHS = [1440, 1100, 900, 768, 430, 360, 320];
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

/* 대표 모델명을 쓰는 버튼이 좁고 낮은 화면에서도 잘리지 않아야
   '무엇을 고를지'를 처음 보는 사람이 판단할 수 있다. */
for (const app of [
  { path: "/image/", labels: ["GPT Image 등", "Stable Diffusion 등"] },
  { path: "/t2v/", labels: ["Veo", "Seedance 2.5", "Seedance 2.0", "Kling · Pika"] },
  { path: "/i2v/", labels: ["Veo", "Seedance 2.5", "Seedance 2.0", "Kling · Luma"] },
]) {
  test(`${app.path} 좁은 화면에서 생성 모델명이 모두 보인다`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 740 });
    await page.goto(app.path);
    await page.click(".mobile-out-bar");
    await expect(page.locator("#modelBox .profile-label")).toHaveText("사용할 생성 모델");
    await expect(page.locator("[data-model]")).toHaveText(app.labels);
    await expect(page.locator("#modeHelp")).toBeVisible();
    const layout = await page.locator("#modelSwitch").evaluate(el => {
      const box = el.getBoundingClientRect();
      return {
        overflow: el.scrollWidth > el.clientWidth + 1,
        buttons: [...el.querySelectorAll("button")].map(button => {
          const rect = button.getBoundingClientRect();
          return {
            text: button.textContent,
            clipped: button.scrollWidth > button.clientWidth + 1,
            outside: rect.left < box.left - 1 || rect.right > box.right + 1,
          };
        }),
      };
    });
    expect(layout.overflow, "생성 모델 묶음 가로 넘침").toBe(false);
    expect(layout.buttons.filter(button => button.clipped || button.outside),
      "잘리거나 묶음 밖으로 나간 생성 모델 버튼").toEqual([]);
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

/* 키보드 접근은 두 가지가 섞여 있어서 갈라 놓는다.

   ① 우리가 정하는 것 — 컨트롤이 네이티브 포커스 요소인가, 비활성 요소가 탭 순서에
      들어가 있지 않은가, 포커스를 준 뒤 키가 먹는가. 엔진과 무관하므로 양쪽에서 본다.
   ② 브라우저가 정하는 것 — 일반 `Tab` 이 버튼·링크에 가느냐. **사파리는 macOS 에서
      기본적으로 안 간다**(시스템의 키보드 탐색 설정에 달렸고 Linux 빌드는 다르다).
      우리가 고칠 수 있는 게 아니므로 이건 크로미움에서만 본다.

   합쳐 두면 macOS 에서 사파리로 돌릴 때 앱이 멀쩡한데도 빨간불이 뜬다. 그렇다고
   사파리를 통째로 빼면 ① 마저 못 보게 된다. */
test("컨트롤이 키보드로 조작 가능한 형태다", async ({ page }) => {
  await page.goto("/t2v/");

  // 네이티브 포커스 요소여야 한다 — div 에 클릭 핸들러만 단 것들은 키보드로 못 쓴다
  const 주요 = ["#subject", "#copyBtn", "#resetBtn", "#undoBtn", "#builderBtn"];
  for (const sel of 주요) {
    const tag = await page.locator(sel).evaluate(el => el.tagName);
    expect(["BUTTON", "INPUT", "TEXTAREA", "A", "SELECT"], `${sel} 이 ${tag}`).toContain(tag);
  }

  /* 할 일이 없는 버튼은 비활성이어야 한다. 활성인 채로 두면 키보드 사용자가
     탭으로 짚고 눌렀는데 아무 일도 안 일어난다. 시작 상태에서 되돌릴 것도
     복사할 것도 없다 (초기화는 언제든 눌러도 되므로 계속 활성이다). */
  for (const sel of ["#undoBtn", "#copyBtn"])
    expect(await page.locator(sel).isDisabled(), `${sel} 이 처음부터 활성`).toBe(true);

  /* 양수 tabindex 는 문서 순서를 무시하고 자기가 먼저 오겠다는 선언이라
     탭 순서를 뒤죽박죽으로 만든다. 하나도 없어야 한다.
     (roving tabindex 의 0 과 -1 은 정상 — 탭 목록에서 뺐다 넣었다 하는 용도다) */
  expect(await page.evaluate(() =>
    [...document.querySelectorAll("[tabindex]")]
      .filter(el => Number(el.getAttribute("tabindex")) > 0)
      .map(el => el.tagName + "#" + el.id)), "양수 tabindex 가 있음").toEqual([]);

  // 포커스를 직접 준 뒤 Enter 가 먹는가 (Tab 이 닿느냐와는 별개 문제다)
  await page.locator("[data-preset]").first().click();
  await expect(page.locator("#copyBtn")).toBeEnabled();
  await page.locator("#copyBtn").focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#copyBtn .copy-tx")).toHaveText("복사됨 ✓");
});

test("Tab 만으로 복사 버튼까지 닿는다", async ({ page, browserName }) => {
  test.skip(browserName !== "chromium",
    "사파리는 macOS 에서 Tab 이 버튼을 건너뛴다 — 시스템 설정 소관이고 앱이 고칠 수 없다");
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

/* 가이드 사진이 실제로 선명하게 그려지는가.

   srcset 의 sizes 는 브라우저에게 "이 이미지는 이만한 폭으로 그려질 것"이라고
   미리 약속하는 값이다. 브라우저는 레이아웃을 계산하기 전에 이 약속만 보고
   내려받을 후보를 정하므로, 약속이 실제보다 작으면 작은 파일을 받아 늘려
   그린다. 정적 검사로는 절대 잡히지 않는다 — 파일도 멀쩡하고 문법도 맞다.
   실제 폭은 레이아웃을 계산하는 여기서만 알 수 있다.

   한 번 당한 적이 있다: sizes 가 700px·1100px 중단점을 쓰고 있었는데
   styles.css 에는 그런 중단점이 없었다. 1열로 바뀌는 진짜 지점은 1039px 라
   701~1039px 구간에서 카드는 970px 까지 커지는데 선언은 468px 이었고,
   그래서 768px 짜리를 받아 놓고 늘려 그렸다.

   density-corrected naturalWidth 를 쓰는 게 요령이다. w 서술자 srcset 에서
   naturalWidth 는 파일의 고유 폭이 아니라 sizes 로 계산된 CSS 폭을 돌려준다.
   즉 브라우저가 실제로 계산한 약속값을 그대로 읽을 수 있다. */
test.describe("가이드 사진이 실제 카드 폭에 맞는 해상도로 그려진다", () => {
  const 자연폭 = { 480: 480, 768: 768, 1024: 1024 } as const;
  for (const [width, dpr] of [[390, 3], [390, 2], [768, 2], [900, 2], [1039, 2],
                              [1040, 2], [1280, 2], [1600, 2], [1920, 2]] as const) {
    test(`폭 ${width}px · dpr${dpr}`, async ({ browser }) => {
      const context = await browser.newContext({
        viewport: { width, height: 900 }, deviceScaleFactor: dpr,
      });
      const page = await context.newPage();
      await page.goto("/t2v/");
      await page.click('.modetab[data-pane="guide"]');
      /* 평소엔 loading="lazy" 라 화면에 들어와야 받는다. 1열 구간에서는 카드가
         커서 스크롤로 20장을 다 띄우기 어려우니 여기서만 즉시 로딩으로 바꾼다.
         후보 선택은 lazy 여부와 무관하므로 재는 값은 달라지지 않는다. */
      await page.evaluate(() =>
        document.querySelectorAll<HTMLImageElement>("#pane-guide .pv.ph img")
          .forEach(img => { img.loading = "eager"; }));
      await page.waitForFunction(() =>
        [...document.querySelectorAll<HTMLImageElement>("#pane-guide .pv.ph img")]
          .every(img => img.complete && img.currentSrc), null, { timeout: 20_000 });

      const 잰값 = await page.evaluate(() =>
        [...document.querySelectorAll<HTMLImageElement>("#pane-guide .pv.ph img")].map(img => ({
          카드폭: img.getBoundingClientRect().width,
          선언폭: img.naturalWidth,   // = sizes 로 계산된 CSS 폭
          고른파일: Number(img.currentSrc.match(/guide-(\d+)/)?.[1] ?? 1024),
        })));
      expect(잰값.length, "가이드 사진 수").toBe(20);

      /* 계약은 "선언 = 실제" 가 아니라 "선언이 실제보다 작지 않다" 이다.
         auto-fill 그리드의 카드 폭은 260~520px 사이를 연속으로 오가서 sizes
         한 값으로 따라갈 수 없다. 넘겨 선언하면 큰 파일을 받아 선명하고
         (바이트만 손해), 모자라게 선언하면 늘려 그린다 — 후자만 버그다. */
      for (const { 카드폭, 선언폭, 고른파일 } of 잰값) {
        const 실폭 = 자연폭[고른파일 as keyof typeof 자연폭];
        // ① 약속이 실제보다 작지 않은가 — sizes 중단점이 틀리면 여기서 걸린다
        expect(선언폭 / 카드폭,
          `sizes 가 ${선언폭}px 로 선언했는데 카드는 ${카드폭.toFixed(0)}px — 모자란 후보를 고른다`)
          .toBeGreaterThanOrEqual(0.95);
        // ② 받은 파일이 카드를 CSS 픽셀만큼은 채우는가 (늘려 그리지 않는가)
        expect(실폭 / 카드폭,
          `${고른파일}w 로 ${카드폭.toFixed(0)}px 카드를 그리면 늘어난다`).toBeGreaterThanOrEqual(1);
        // ③ 반대로 지나치게 큰 파일을 끌어오지 않는가 — 화면 픽셀의 2배까지만
        expect(실폭 / (카드폭 * dpr),
          `${카드폭.toFixed(0)}px 카드(dpr${dpr})에 ${고른파일}w 는 과하다`).toBeLessThanOrEqual(2.2);
      }
      await context.close();
    });
  }
});
