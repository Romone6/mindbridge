import { test, expect } from '@playwright/test';

test.describe('Trust logos strip', () => {
  test('renders standards when partners are empty', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const standards = page.getByTestId('logos-standards');
    await expect(standards).toBeVisible();
    await expect(standards).toContainText('SOC 2 Type II');
    await expect(standards).toContainText('Program in progress');
  });

  test('renders partners when sample mode is enabled', async ({ page }) => {
    await page.goto('/?logos=sample', { waitUntil: 'domcontentloaded' });
    const partners = page.getByTestId('logos-partners');
    await expect(partners).toBeVisible();
    await expect(partners).toContainText('Sample partner');
  });
});
