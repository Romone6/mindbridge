import { z } from 'zod';

const envSchema = z.object({
    // Server-side
    ENCRYPTION_KEY: z.string().min(32).optional(), // Should be 32 bytes base64
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
    OPENAI_API_KEY: z.string().min(1).optional(),

    // Client-side (available on server too)
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
    NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),

});

const processEnv = {
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
};

// Validate environment variables
// In production, we want to fail fast if critical variables are missing
const parsed = envSchema.safeParse(processEnv);

if (!parsed.success) {
    console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
    // Only throw in production to prevent breaking local dev if partial env is set
    if (process.env.NODE_ENV === 'production') {
        throw new Error('Invalid environment variables');
    }
}

export const env = parsed.success ? parsed.data : processEnv as z.infer<typeof envSchema>;
