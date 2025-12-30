import { test, expect } from '@playwright/test';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

test.describe('Patient Intake Flow', () => {
  test.skip(
    !supabaseUrl || !serviceRoleKey,
    'E2E requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
  );

  let clinicId: string;
  let supabase: SupabaseClient;

  test.beforeAll(async () => {
    supabase = createClient(supabaseUrl!, serviceRoleKey!);

    // Create a test clinic
    const { data, error } = await supabase
      .from('clinics')
      .insert({
        name: 'Playwright Test Clinic ' + Date.now(),
        address: '123 Test St',
      })
      .select()
      .single();

    if (error) throw new Error('Failed to create test clinic: ' + error.message);
    clinicId = data.id;
    console.log('Created test clinic:', clinicId);
  });

  test.afterAll(async () => {
    // Cleanup
    if (clinicId) {
      await supabase.from('clinics').delete().eq('id', clinicId);
    }
  });

  test('Guest Patient can submit intake', async ({ page }) => {
    // 1. Visit Intake Page
    await page.goto(`/intake/${clinicId}`);

    // 2. Check Welcome Screen
    await expect(page.getByText('Welcome')).toBeVisible();
    await expect(page.getByText(/Emergency warning/i)).toBeVisible();

    // 3. Start Assessment
    await page.getByRole('button', { name: /I understand, start assessment/i }).click();

    // 4. Fill Form
    await expect(page.getByText('How can we help you today?')).toBeVisible();
    await page
      .getByLabel('Describe your main concern')
      .fill('I have been feeling very anxious lately and having trouble sleeping.');

    // 5. Submit
    await page.getByRole('button', { name: /Submit for triage/i }).click();

    // 6. Verify Success
    await expect(page.getByText(/Submission received/i)).toBeVisible();
    await expect(page.getByText('Your intake has been securely recorded')).toBeVisible();

    // 7. Verify Data in DB (Optional but good)
    const { data: intakes } = await supabase
      .from('intakes')
      .select('*')
      .eq('clinic_id', clinicId);

    if (!intakes) {
      throw new Error('No intakes returned for test clinic');
    }
    expect(intakes).toHaveLength(1);
    expect(intakes[0].answers_json.complaint).toContain('anxious');

    // 8. Verify Triage Output
    const { data: triage } = await supabase
      .from('triage_outputs')
      .select('*')
      .eq('intake_id', intakes[0].id);

    if (!triage) {
      throw new Error('No triage output returned for intake');
    }
    expect(triage).toHaveLength(1);
    expect(triage[0].urgency_tier).toBe('High');
  });
});
