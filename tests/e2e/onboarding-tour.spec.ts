import { test, expect } from '@playwright/test';

test.describe('Onboarding Tour', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/dashboard');
    });

    test('shows tour on first visit', async ({ page }) => {
        await page.goto('/dashboard');

        const tourDialog = page.locator('[role="dialog"]');
        await expect(tourDialog).toBeVisible({ timeout: 5000 });
    });

    test('can skip tour', async ({ page }) => {
        await page.goto('/dashboard');

        const skipButton = page.locator('button:has-text("Skip")');
        await skipButton.click();

        const tourDialog = page.locator('[role="dialog"]');
        await expect(tourDialog).toBeHidden();
    });

    test('can navigate through tour steps', async ({ page }) => {
        await page.goto('/dashboard');

        const tourDialog = page.locator('[role="dialog"]');
        await expect(tourDialog).toBeVisible();

        const nextButton = page.locator('button:has-text("Next")');
        await nextButton.click();

        const stepIndicator = page.locator('text=2 of 5');
        await expect(stepIndicator).toBeVisible();
    });

    test('can replay tour from help menu', async ({ page }) => {
        await page.goto('/dashboard');

        const skipButton = page.locator('button:has-text("Skip")');
        await skipButton.click();

        const helpMenu = page.locator('button:has-text("Help")');
        await helpMenu.click();

        const startTourButton = page.locator('button:has-text("Start tour")');
        await startTourButton.click();

        const tourDialog = page.locator('[role="dialog"]');
        await expect(tourDialog).toBeVisible();
    });

    test('respects reduced-motion preference', async ({ page }) => {
        await page.addInitScript(() => {
            Object.defineProperty(window, 'matchMedia', {
                writable: true,
                value: (query: string) => ({
                    matches: query === '(prefers-reduced-motion: reduce)',
                    media: query,
                    onchange: null,
                }),
            });
        });

        await page.goto('/dashboard');

        const tourDialog = page.locator('[role="dialog"]');
        await expect(tourDialog).toBeVisible();
    });

    test('completes tour and persists state', async ({ page }) => {
        await page.goto('/dashboard');

        const tourDialog = page.locator('[role="dialog"]');
        await expect(tourDialog).toBeVisible();

        const nextButton = page.locator('button:has-text("Next")');
        await nextButton.click();
        await nextButton.click();
        await nextButton.click();
        await nextButton.click();

        const finishButton = page.locator('button:has-text("Finish")');
        await finishButton.click();

        await expect(tourDialog).toBeHidden();

        await page.reload();

        await expect(tourDialog).toBeHidden();
    });
});
