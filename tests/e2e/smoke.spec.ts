import { test, expect } from '@playwright/test';

test.describe('Clinic Workflow', () => {
  test('Public Intake Flow', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/MindBridge/);
    
    // Check Landing Page elements
    await expect(page.getByText('AI-assisted mental health intake for clinical teams.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'View demo' })).toBeVisible();
    
    // Clinicians page
    await page.goto('/clinicians');
    await expect(page.getByText('Operational intake support for mental health clinics.')).toBeVisible();

    
    // Check FAQ page
    await page.goto('/clinicians/faq');
    await expect(page).toHaveURL(/.*faq/);
    await expect(page.getByRole('button', { name: /Back to Clinicians/i })).toBeVisible();
  });
});
