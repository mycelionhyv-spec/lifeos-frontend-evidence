import { expect, test, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";

const CONSOLE_NOISE = /extensions\.js|Failed to load resource|net::ERR|Download the React DevTools/i;

async function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (err) => {
    if (!CONSOLE_NOISE.test(err.message)) errors.push(err.message);
  });
  page.on("console", (msg) => {
    if (msg.type() === "error" && !CONSOLE_NOISE.test(msg.text())) errors.push(msg.text());
  });
  return errors;
}

async function seed(page: Page) {
  await page.goto("/app/settings");
  await expect(page.getByRole("heading", { name: "Tune the OS" })).toBeVisible();
  await page.getByTestId("reset-seed").click();
  await expect(page.getByText("Data reset.")).toBeVisible({ timeout: 8_000 });
}

async function noOverflow(page: Page) {
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    return doc.scrollWidth - doc.clientWidth;
  });
  expect(overflow, "horizontal overflow").toBeLessThanOrEqual(1);
}

test.describe("LifeOS interactions", () => {
  test("desktop and mobile navigation, no overflow, no console errors", async ({ page }, testInfo) => {
    const errors = await collectErrors(page);
    const mobile = testInfo.project.name === "mobile";

    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Evolve your potential." })).toBeVisible();
    await expect(page.getByText(/command centre/i)).toHaveCount(0);
    if (mobile) {
      await expect(async () => {
        if (await page.getByTestId("public-sheet").isVisible()) return;
        await page.getByTestId("public-menu").click();
        await expect(page.getByTestId("public-sheet")).toBeVisible();
      }).toPass({ timeout: 15_000 });
      await page.getByTestId("public-sheet").getByTestId("public-nav-products").click();
    } else {
      await page.getByTestId("public-nav").getByTestId("public-nav-products").click();
    }
    await expect(page.getByRole("heading", { name: "Explore what works." })).toBeVisible();
    await noOverflow(page);

    await page.goto("/app");
    await expect(page.getByRole("heading")).toBeVisible();
    if (mobile) {
      await expect(async () => {
        if (await page.getByTestId("app-sheet").isVisible()) return;
        await page.getByTestId("app-menu").click();
        await expect(page.getByTestId("app-sheet")).toBeVisible();
      }).toPass({ timeout: 15_000 });
      await page.getByTestId("app-sheet").getByTestId("nav-capture").click();
    } else {
      await page.getByTestId("lifeos-nav").getByTestId("nav-capture").click();
    }
    await expect(page.getByRole("heading", { name: "Say it once" })).toBeVisible();
    await noOverflow(page);
    expect(errors, errors.join("\n")).toEqual([]);
  });

  test("task create, edit, complete and validation", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "desktop covers mutations");
    await seed(page);
    await page.goto("/app/tasks");
    await expect(page.getByRole("heading", { name: "Work queue" })).toBeVisible();

    await page.getByTestId("add-task").click();
    await page.getByTestId("task-save").click();
    await expect(page.getByTestId("field-error")).toContainText(/task name/i);

    await page.getByTestId("task-name").fill("Water the succulents");
    await page.getByTestId("task-save").click();
    await expect(page.getByText("Water the succulents")).toBeVisible();

    await page.getByRole("button", { name: "Water the succulents" }).click();
    await page.getByTestId("task-name").fill("Water the succulents at dusk");
    await page.getByTestId("task-save").click();
    await expect(page.getByText("Water the succulents at dusk")).toBeVisible();

    await page.getByRole("checkbox", { name: "Water the succulents at dusk" }).click();
    await expect(page.locator('[data-testid="task-done"]')).toContainText("Water the succulents at dusk");
  });

  test("transaction, habit, mood, empty and failure states", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "desktop covers mutations");
    await seed(page);

    await page.goto("/app/money");
    await page.getByTestId("tx-desc").fill("Market veg");
    await page.getByTestId("tx-amt").fill("18.4");
    await page.getByTestId("log-transaction").click();
    await expect(page.getByText("Market veg")).toBeVisible();

    await page.goto("/app/health");
    await page.getByTestId("habit-HAB-1").click();
    await expect(page.getByTestId("habit-HAB-1")).toBeChecked();
    await page.getByTestId("mood-mood").fill("6");
    await page.getByTestId("save-mood").click();
    await expect(page.getByText(/M6 /)).toBeVisible();

    await page.goto("/app/settings");
    await page.getByTestId("reset-empty").click();
    await expect(page.getByText("Data reset.")).toBeVisible();
    await page.goto("/app/tasks");
    await expect(page.getByTestId("empty-block")).toContainText("Inbox is clear");

    await page.goto("/app/settings");
    await expect(page.getByTestId("simulate-failure")).toBeVisible();
    await page.getByTestId("simulate-failure").click();
    await expect(page.getByText("Saved.")).toBeVisible();
    await page.goto("/app");
    await expect(page.getByTestId("error-block")).toContainText(/Simulated API failure/i);

    await page.goto("/app/settings");
    await page.getByTestId("simulate-failure").click();
  });

  test("goal create/edit and sleep log/replace", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "desktop covers mutations");
    await seed(page);

    await page.goto("/app/goals");
    await page.getByTestId("add-goal").click();
    await page.getByTestId("goal-name").fill("Read 12 books");
    await page.getByTestId("goal-current").fill("3");
    await page.getByTestId("goal-target").fill("12");
    await page.getByTestId("goal-save").click();
    await expect(page.getByText("Read 12 books")).toBeVisible();
    await expect(page.getByText("25%")).toBeVisible();

    await page.getByRole("button", { name: "Read 12 books" }).click();
    await page.getByTestId("goal-name").fill("Read 12 books this year");
    await page.getByTestId("goal-save").click();
    await expect(page.getByText("Read 12 books this year")).toBeVisible();

    await page.goto("/app/health");
    await page.getByTestId("sleep-bedtime").fill("22:00");
    await page.getByTestId("sleep-waketime").fill("06:00");
    await page.getByTestId("sleep-quality").fill("8");
    await page.getByTestId("save-sleep").click();
    await expect(page.getByTestId("sleep-list")).toContainText("22:00");
    await expect(page.getByTestId("sleep-list")).toContainText("8h");

    await page.getByTestId("sleep-bedtime").fill("23:15");
    await page.getByTestId("sleep-waketime").fill("07:15");
    await page.getByTestId("sleep-quality").fill("6");
    await page.getByTestId("save-sleep").click();
    await expect(page.getByTestId("sleep-list")).toContainText("23:15");
    const nights = await page.locator("[data-testid=sleep-list] li").count();
    expect(nights).toBe(1);
  });

  test("Nexus Capture say-it-once commit", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "desktop covers mutations");
    await seed(page);
    await page.goto("/app/capture");
    await expect(page.getByText(/deterministic prototype/i)).toBeVisible();
    await expect(page.getByTestId("capture-parse")).toBeEnabled();
    await page.getByTestId("capture-parse").click();
    await expect(page.getByTestId("capture-cards")).toBeVisible();
    await expect(page.getByTestId("capture-card-P1")).toContainText("Task");
    await expect(page.getByTestId("capture-card-P2")).toContainText("Transaction");
    await expect(page.getByTestId("capture-card-P3")).toContainText("Habit");
    await page.getByTestId("capture-commit").click();
    await expect(page.getByTestId("capture-results")).toContainText("Task created");
    await expect(page.getByTestId("capture-results")).toContainText("Transaction logged");

    await page.goto("/app/tasks");
    await expect(page.getByText("Pay electricity")).toBeVisible();
    await page.goto("/app/money");
    await expect(page.getByText("groceries", { exact: true })).toBeVisible();
    await page.goto("/app/health");
    await expect(page.getByTestId("habit-HAB-1")).toBeChecked();
  });
});

test.describe("evidence screenshots", () => {
  test("capture branded pages", async ({ page }, testInfo) => {
    mkdirSync("screenshots/evidence", { recursive: true });
    const prefix = testInfo.project.name === "mobile" ? "390" : "1440";
    const routes: [string, string][] = [
      ["/", "home"],
      ["/products", "products"],
      ["/play", "play"],
      ["/join", "join"],
      ["/app", "today"],
      ["/app/capture", "capture"],
      ["/app/tasks", "tasks"],
      ["/app/goals", "goals"],
      ["/app/money", "money"],
      ["/app/health", "health"],
      ["/app/settings", "settings"],
    ];
    for (const [path, name] of routes) {
      await page.goto(path);
      await page.waitForTimeout(400);
      await page.screenshot({
        path: `screenshots/evidence/${prefix}-${name}.png`,
        fullPage: true,
      });
    }
  });
});
