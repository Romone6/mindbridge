import { test, expect } from '@playwright/test';

test.describe('Clinic Workflow', () => {
  test('Public Intake Flow', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/MindBridge/);
    
    // Check Landing Page elements
    await expect(page.getByText('AI-assisted mental health intake for clinical teams.')).toBeVisible();
    
    // Navigate to Clinicians
    await page.getByRole('link', { name: 'Clinicians' }).first().click();
    await expect(page).toHaveURL(/.*clinicians/);
    
    // Check FAQ page
    await page.goto('/clinicians/faq');
    await expect(page).toHaveURL(/.*faq/);
    await expect(page.getByRole('button', { name: /Back to Clinicians/i })).toBeVisible();
  });
});
