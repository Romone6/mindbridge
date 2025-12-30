import { stripe } from "@/lib/stripe";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createClerkSupabaseClient } from "@/lib/supabase";

const PRO_PRICE_ID = process.env.STRIPE_PRO_PRICE_ID;

export async function POST(req: Request) {
    const { userId, getToken } = await auth();
    if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!PRO_PRICE_ID) {
        return new NextResponse("Stripe Price ID not configured", { status: 500 });
    }

    const { clinicId } = await req.json();
    
    // Verify ownership
    const token = await getToken({ template: 'supabase' });
    const supabase = createClerkSupabaseClient(token!);
    
    if (!supabase) {
        return new NextResponse("Database connection failed", { status: 500 });
    }

    const { data: membership } = await supabase
        .from('clinic_memberships')
        .select('role')
        .eq('clinic_id', clinicId)
        .eq('user_id', userId)
        .single();

    if (!membership || membership.role !== 'OWNER') {
        return new NextResponse("Forbidden", { status: 403 });
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
        line_items: [
            {
                price: PRO_PRICE_ID,
                quantity: 1,
            },
        ],
        mode: "subscription",
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?canceled=true`,
        metadata: {
            clinicId: clinicId,
            userId: userId,
        },
    });

    return NextResponse.json({ url: session.url });
}
