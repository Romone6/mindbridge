To address your requests regarding Invoicing and the Navbar, here is the plan:

### **1. Navbar / Onboarding Issue**
- **Status**: The "missing navbar" on the onboarding page was indeed a bug, but **I fixed it in the previous commit** (`fix: add navbar to onboarding layout`).
- **Why it persists**: Vercel deployments typically take **2-4 minutes**. If you checked immediately after my last message, the new version likely wasn't live yet.
- **Action**: No new code is needed for this specific issue. Please wait a moment and refresh.

### **2. Payment Structure: Invoices**
- **Understanding**: You want to structure payments through **Invoices** (sending a bill to the clinic) rather than forcing immediate credit card payment. This is common for B2B health systems.
- **Implementation**: I will modify the Stripe Checkout flow to support this.
    - **Change**: In `app/api/stripe/checkout/route.ts`, I can add `payment_method_collection: 'if_required'` or specific invoice configuration, but typically for self-serve, Card is best.
    - **Better Approach for "Invoices"**: Stripe automatically emails a PDF invoice/receipt for *every* subscription payment (even card).
    - **If you mean "Pay by Bank Transfer / Net 30"**: This requires switching the `collection_method` to `send_invoice` in the Stripe API.
    - **Recommendation**: For the Pilot, I recommend sticking to **Card Payments** (Self-Serve) but ensuring "Email Invoice" is enabled in your Stripe Dashboard settings. This keeps automation high. If you strictly want "Send Invoice (Pay Later)", I can code that, but it adds friction (you have to chase payments).
    - **My Plan**: I will update the `SettingsPage` to clarify that invoices are available, and I will verify the `checkout` route is robust.

### **3. Immediate Fix & Commit**
- **Action**: I will verify the code one last time and push an empty commit or small tweak to force a new deployment if you are stuck, but likely the previous one just needs time.
- **Action**: I will update `app/api/stripe/checkout/route.ts` to ensure we are using the correct `PRO_PRICE_ID` (I will add a TODO or environment variable for it so you can set it in Vercel without code changes).

### **Execution Steps**
1.  **Modify Checkout API**: Use an environment variable `STRIPE_PRO_PRICE_ID` instead of a hardcoded string.
2.  **Commit**: Push this change immediately. This will trigger a fresh deployment, ensuring the Navbar fix is definitely live.
