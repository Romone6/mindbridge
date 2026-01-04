import { test, expect } from '@playwright/test';

test.describe('Testimonials carousel', () => {
  test('renders empty state with booking CTA', async ({ page }) => {
    await page.goto('/?testimonials=empty', { waitUntil: 'domcontentloaded' });
    const emptyState = page.getByTestId('testimonials-empty');
    await expect(emptyState).toBeVisible();

    const cta = emptyState.getByRole('link', { name: /Book a demo/i });
    await expect(cta).toHaveAttribute('href', /calendly\.com/);
  });

  test('renders carousel structure with sample data', async ({ page }) => {
    await page.goto('/?testimonials=sample', { waitUntil: 'domcontentloaded' });
    const carousel = page.getByTestId('testimonials-carousel');
    await expect(carousel).toBeVisible();
    await expect(carousel.getByText('Sample only')).toBeVisible();

    await expect(carousel.getByRole('button', { name: 'Previous testimonial' })).toBeVisible();
    await expect(carousel.getByRole('button', { name: 'Next testimonial' })).toBeVisible();

    const slide = carousel.getByTestId('testimonial-slide');
    await expect(slide).toContainText('Placeholder');
  });
});
