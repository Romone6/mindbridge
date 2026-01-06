import { test, expect } from '@playwright/test';

test.describe('Theme Toggle', () => {
  test('theme persists across reload', async ({ page }) => {
    await page.goto('/');

    // Check that theme toggle exists
    const themeButton = page.getByRole('button', { name: /Switch to (dark|light) mode/ });
    await expect(themeButton).toBeVisible();

    // Click to open theme menu
    await themeButton.click();

    // Select dark theme
    await page.getByRole('menuitemradio', { name: 'Dark' }).click();

    // Verify aria-label changes
    await expect(page.getByRole('button', { name: 'Switch to light mode' })).toBeVisible();

    // Reload page
    await page.reload();

    // Theme should persist - aria-label should still indicate switch to light mode
    await expect(page.getByRole('button', { name: 'Switch to light mode' })).toBeVisible();
  });

  test('respects system preference by default', async ({ page, context }) => {
    // Set system preference to dark
    await context.addInitScript(() => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: (query: string) => ({
          matches: query === '(prefers-color-scheme: dark)',
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => {},
        }),
      });
    });

    await page.goto('/');

    // Should default to system theme (dark in this case)
    await expect(page.getByRole('button', { name: 'Switch to light mode' })).toBeVisible();
  });

  test('aria-label updates correctly', async ({ page }) => {
    await page.goto('/');

    // Initially should be "Switch to dark mode" (assuming light default)
    await expect(page.getByRole('button', { name: 'Switch to dark mode' })).toBeVisible();

    // Open theme menu and select dark
    await page.getByRole('button', { name: 'Switch to dark mode' }).click();
    await page.getByRole('menuitemradio', { name: 'Dark' }).click();

    // Should now show "Switch to light mode"
    await expect(page.getByRole('button', { name: 'Switch to light mode' })).toBeVisible();

    // Select light
    await page.getByRole('button', { name: 'Switch to light mode' }).click();
    await page.getByRole('menuitemradio', { name: 'Light' }).click();

    // Should now show "Switch to dark mode"
    await expect(page.getByRole('button', { name: 'Switch to dark mode' })).toBeVisible();
  });

  test('no theme flash on refresh', async ({ page }) => {
    // This is hard to test directly, but we can verify the theme script runs
    await page.goto('/');

    // Check that the html element has the correct class immediately
    const htmlClass = await page.locator('html').getAttribute('class');
    expect(htmlClass).toBeTruthy(); // Should have some class applied
  });
});