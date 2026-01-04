import { test, expect } from '@playwright/test';

const previews = [
  {
    path: '/workspace-preview/clinician',
    heading: 'Clinician workspace preview',
  },
  {
    path: '/workspace-preview/admin',
    heading: 'Clinic admin workspace preview',
  },
];

test.describe('Workspace preview pages', () => {
  for (const preview of previews) {
    test(`${preview.path} renders sample workspace UI`, async ({ page }) => {
      await page.goto(preview.path, { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('heading', { name: preview.heading })).toBeVisible();
      await expect(page.getByText('Sample data').first()).toBeVisible();

      const demoCta = page.getByRole('link', { name: /Explore demo/i });
      await expect(demoCta).toHaveAttribute('href', '/demo');
      const workspaceCta = page.getByRole('link', { name: /Go to workspace/i });
      await expect(workspaceCta).toHaveAttribute('href', '/dashboard');

      const nav = page.getByRole('navigation', { name: /preview navigation/i });
      const navLinks = nav.getByRole('link');
      const navCount = await navLinks.count();
      expect(navCount).toBeGreaterThan(0);

      for (let index = 0; index < navCount; index += 1) {
        const link = navLinks.nth(index);
        const href = await link.getAttribute('href');
        expect(href).toMatch(/^#/);
        if (href) {
          await expect(page.locator(href)).toHaveCount(1);
        }
      }
    });
  }
});
