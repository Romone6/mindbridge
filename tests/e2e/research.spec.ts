import { test, expect } from '@playwright/test';

test.describe('Research hub', () => {
  test('filters and searches research items', async ({ page }) => {
    await page.goto('/research', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('research-index')).toHaveAttribute('data-hydrated', 'true');

    const search = page.getByTestId('research-search');
    await search.fill('intake');
    await expect(page.getByRole('link', { name: 'Clinical intake overview' })).toBeVisible();

    await search.fill('');
    await page.getByTestId('research-tag-safety').click();
    await expect(page.getByTestId('research-tag-safety')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('link', { name: 'Risk signal review workflow' })).toBeVisible();
    await expect(page.getByTestId('research-card-implementation-briefing')).toHaveCount(0);
  });

  test('renders a research detail page and 404 for unknown slug', async ({ page }) => {
    await page.goto('/research/clinical-intake-overview', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Clinical intake overview' })).toBeVisible();

    await page.goto('/research/not-a-real-post', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Page Not Found' })).toBeVisible();
  });
});
