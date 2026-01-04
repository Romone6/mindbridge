import { test, expect } from "@playwright/test";

test.describe("FAQ chat assistant", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
  });

  test("answers common FAQ intents", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const toggle = page.getByTestId("faq-chat-toggle");
    await expect(toggle).toHaveAttribute("data-hydrated", "true");
    await toggle.click();
    await expect(page.getByTestId("faq-chat-panel")).toBeVisible();

    const input = page.getByTestId("faq-chat-input");
    const send = page.getByTestId("faq-chat-send");
    const assistantMessages = page
      .getByTestId("faq-chat-thread")
      .locator("[data-role='assistant']");

    const ask = async (question: string, expected: string) => {
      await input.fill(question);
      await send.click();
      await expect(assistantMessages.last()).toContainText(expected);
    };

    await ask("Are you HIPAA compliant?", "HIPAA");
    await ask("Do you have SOC 2?", "SOC 2");
    await ask("Is data encrypted?", "TLS 1.2");
    await ask("Do you train on patient data?", "not used to train");
    await ask("What is the hybrid model?", "hybrid model");
    await ask("Is this a medical device?", "Clinical Decision Support");
    await ask("What happens if the AI is wrong?", "fail-safe");
    await ask("Can we customize triage protocols?", "configure");
    await ask("Do you integrate with EHR?", "integrations");
    await ask("Where can I see pricing?", "pricing page");
    await ask("How do I book a demo?", "book a demo");

    const bookDemoLinks = page
      .getByTestId("faq-chat-thread")
      .getByRole("link", { name: "Book a demo" });
    await expect(bookDemoLinks.first()).toBeVisible();
  });

  test("shows crisis response and disables input", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const toggle = page.getByTestId("faq-chat-toggle");
    await expect(toggle).toHaveAttribute("data-hydrated", "true");
    await toggle.click();

    const input = page.getByTestId("faq-chat-input");
    const send = page.getByTestId("faq-chat-send");

    await input.fill("I want to kill myself");
    await send.click();

    const assistantMessages = page
      .getByTestId("faq-chat-thread")
      .locator("[data-role='assistant']");

    await expect(assistantMessages.last()).toContainText("988");
    await expect(page.getByText("Crisis support needed")).toBeVisible();
    await expect(input).toBeDisabled();
  });
});
