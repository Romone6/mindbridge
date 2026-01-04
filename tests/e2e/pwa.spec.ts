import { test, expect } from "@playwright/test";

test.describe("PWA offline fallback", () => {
  test("shows offline page for marketing routes", async ({ page, context }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    await page.evaluate(async () => {
      await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;
    });

    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => navigator.serviceWorker.controller !== null);

    await context.setOffline(true);
    await page.goto("/security", { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("heading", { name: "You are offline" })).toBeVisible();
    await context.setOffline(false);
  });
});
