import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

import { SupabaseClient } from '@supabase/supabase-js';

// Use the Service Role Key to bypass RLS and create a clinic
const SUPABASE_URL = 'https://fkbycbpceppkxearfnol.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrYnljYnBjZXBwa3hlYXJmbm9sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDQxNTI4MywiZXhwIjoyMDc5OTkxMjgzfQ.iFdH_bnNIallqbz2VW5Bb5UAIbI9rwBrLA_cre-OFL4';

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
    
    expect(intakes).toHaveLength(1);
    expect(intakes[0].answers_json.complaint).toContain('anxious');
    
    // 8. Verify Triage Output
    const { data: triage } = await supabase
        .from('triage_outputs')
        .select('*')
        .eq('intake_id', intakes[0].id);
        
    expect(triage).toHaveLength(1);
    expect(triage[0].urgency_tier).toBe('High'); // "anxious" triggers High in our mock logic
  });
});
