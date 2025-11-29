import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';

// Schema for validation
const WaitlistSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
});

export async function POST(request: Request) {
    const { error } = await supabase
        .from('waitlist')
        .insert([{ email, created_at: new Date().toISOString() }]);

    if (error) {
        // Handle duplicate emails gracefully
        if (error.code === '23505') { // Unique violation
            return NextResponse.json(
                { message: "You're already on the list!" },
                { status: 200 }
            );
        }
        console.error('Supabase error:', error);
        return NextResponse.json(
            { error: 'Failed to save email' },
            { status: 500 }
        );
    }
} else {
    // Fallback for demo/dev without keys
    console.log('Mock Waitlist Submission:', email);
}

return NextResponse.json(
    { message: "You've been added to the waitlist!" },
    { status: 200 }
);

    } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
    );
}
}
