import { test, expect } from "@playwright/test";

test.describe("Book demo page", () => {
  test("shows fallback when scheduling is missing", async ({ page }) => {
    await page.goto("/book-demo?preview=missing", { waitUntil: "domcontentloaded" });

    await expect(page.getByTestId("scheduling-fallback")).toBeVisible();
    await expect(page.getByTestId("scheduling-iframe")).toHaveCount(0);
  });

  test("shows scheduling iframe when configured", async ({ page }) => {
    await page.goto("/book-demo", { waitUntil: "domcontentloaded" });

    const iframe = page.getByTestId("scheduling-iframe").locator("iframe");
    await expect(iframe).toHaveAttribute("src", /example\.com\/schedule/);
  });

  test("validates lead form", async ({ page }) => {
    await page.goto("/book-demo?preview=missing", { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("book-demo-form")).toHaveAttribute(
      "data-hydrated",
      "true"
    );

    await page.getByTestId("book-demo-submit").click();
    await expect(page.getByTestId("book-demo-error-name")).toBeVisible();
    await expect(page.getByTestId("book-demo-error-email")).toBeVisible();
    await expect(page.getByTestId("book-demo-error-org")).toBeVisible();

    await page.getByTestId("book-demo-name").fill("Dr. Jane Smith");
    await page.getByTestId("book-demo-email").fill("jane@clinic.com");
    await page.getByTestId("book-demo-org").fill("Mind Clinic");
    await page.getByTestId("book-demo-submit").click();

    await expect(page.getByTestId("book-demo-status")).toContainText(
      "Thanks for reaching out"
    );
  });
});
