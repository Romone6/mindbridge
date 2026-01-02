import { test, expect } from '@playwright/test';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Use env vars to avoid committing secrets
const SUPABASE_URL = process.env.PLAYWRIGHT_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.PLAYWRIGHT_SUPABASE_SERVICE_ROLE;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error('Missing PLAYWRIGHT_SUPABASE_URL or PLAYWRIGHT_SUPABASE_SERVICE_ROLE env variables');
}

test.describe('Patient Intake Flow', () => {
  let clinicId: string;
  let supabase: SupabaseClient;

  test.beforeAll(async () => {
    supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    
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
    await expect(page.getByText('Emergency Warning')).toBeVisible();
    
    // 3. Start Assessment
    await page.getByRole('button', { name: 'I Understand, Start Assessment' }).click();
    
    // 4. Fill Form
    await expect(page.getByText('How can we help you today?')).toBeVisible();
    await page.getByLabel('Describe your main concern').fill('I have been feeling very anxious lately and having trouble sleeping.');
    
    // 5. Submit
    await page.getByRole('button', { name: 'Submit for Triage' }).click();
    
    // 6. Verify Success
    await expect(page.getByText('Submission Received')).toBeVisible();
    await expect(page.getByText('Your intake has been securely recorded')).toBeVisible();

    // 7. Verify Data in DB (Optional but good)
    const { data: intakes } = await supabase
        .from('intakes')
        .select('*')
        .eq('clinic_id', clinicId);
    
    expect(intakes).not.toBeNull();
    if (!intakes) return;

    expect(intakes).toHaveLength(1);
    expect(intakes[0].answers_json.complaint).toContain('anxious');
    
    // 8. Verify Triage Output
    const { data: triage } = await supabase
        .from('triage_outputs')
        .select('*')
        .eq('intake_id', intakes[0].id);
        
    expect(triage).not.toBeNull();
    if (!triage) return;

    expect(triage).toHaveLength(1);
    expect(triage[0].urgency_tier).toBe('High'); // "anxious" triggers High in our mock logic
  });
});
