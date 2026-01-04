import { test, expect } from '@playwright/test';

test.describe('Clinic Workflow', () => {
  test('Public Intake Flow', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle(/MindBridge/);
    
    // Check Landing Page elements
    await expect(page.getByText('AI-assisted mental health intake for clinical teams.')).toBeVisible();
    await expect(page.getByText('Join the MindBridge waitlist.')).toBeVisible();
    
    // Navigate directly to clinician pages to avoid navbar label coupling.
    await page.goto('/clinicians', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: /Operational intake support/i })).toBeVisible();

    // Pricing page
    await page.goto('/pricing', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText('Plans built for clinical teams.')).toBeVisible();
    
    // Check FAQ page
    await page.goto('/clinicians/faq', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/.*faq/);
    await expect(page.getByRole('button', { name: /Back to Clinicians/i })).toBeVisible();
  });
});
