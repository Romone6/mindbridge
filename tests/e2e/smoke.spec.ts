import { test, expect } from '@playwright/test';

test.describe('Clinic Workflow', () => {
  test('Public Intake Flow', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/MindBridge/);
    
    // Check Landing Page elements
    await expect(page.getByText('AI-assisted mental health intake for clinical teams.')).toBeVisible();
    await expect(page.getByText('Join the MindBridge waitlist.')).toBeVisible();
    
    // Navigate to Clinicians
    await page.getByRole('link', { name: 'Clinicians' }).first().click();
    await expect(page).toHaveURL(/.*clinicians/);

    // Pricing page
    await page.goto('/pricing');
    await expect(page.getByText('Plans built for clinical teams.')).toBeVisible();
    
    // Check FAQ page
    await page.goto('/clinicians/faq');
    await expect(page).toHaveURL(/.*faq/);
    await expect(page.getByRole('button', { name: /Back to Clinicians/i })).toBeVisible();
  });
});
