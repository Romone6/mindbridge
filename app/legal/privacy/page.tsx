import React from 'react';

export default function PrivacyPolicy() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
            <p className="mb-4 text-sm text-gray-500">Last Updated: {new Date().toLocaleDateString()}</p>

            <div className="space-y-6">
                <section>
                    <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
                    <p>
                        MindBridge (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how our organization uses the personal data we collect from you when you use our website and services.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3">2. What data do we collect?</h2>
                    <p>We collect the following data:</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Personal identification information (Name, email address, phone number, etc.)</li>
                        <li>Usage data (Log files, IP addresses, browser type)</li>
                        <li>Clinical data (if applicable and authorized)</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3">3. How do we collect your data?</h2>
                    <p>You directly provide MindBridge with most of the data we collect. We collect data and process data when you:</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Register online or place an order for any of our products or services.</li>
                        <li>Voluntarily complete a customer survey or provide feedback on any of our message boards or via email.</li>
                        <li>Use or view our website via your browser&apos;s cookies.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3">4. How will we use your data?</h2>
                    <p>MindBridge collects your data so that we can:</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Process your order and manage your account.</li>
                        <li>Email you with special offers on other products and services we think you might like.</li>
                        <li>Improve our platform and user experience.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3">5. How do we store your data?</h2>
                    <p>
                        MindBridge securely stores your data at secure cloud infrastructure providers compliant with industry standards (e.g., SOC 2, HIPAA where applicable). We employ appropriate technical and organizational measures to protect your data.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3">6. Marketing</h2>
                    <p>
                        MindBridge would like to send you information about products and services of ours that we think you might like. If you have agreed to receive marketing, you may always opt out at a later date.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3">7. What are your data protection rights?</h2>
                    <p>MindBridge would like to make sure you are fully aware of all of your data protection rights. Every user is entitled to the following:</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>The right to access – You have the right to request copies of your personal data.</li>
                        <li>The right to rectification – You have the right to request that MindBridge correct any information you believe is inaccurate.</li>
                        <li>The right to erasure – You have the right to request that MindBridge erase your personal data, under certain conditions.</li>
                        <li>The right to restrict processing – You have the right to request that MindBridge restrict the processing of your personal data, under certain conditions.</li>
                        <li>The right to object to processing – You have the right to object to MindBridge&apos;s processing of your personal data, under certain conditions.</li>
                        <li>The right to data portability – You have the right to request that MindBridge transfer the data that we have collected to another organization, or directly to you, under certain conditions.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3">8. Changes to our privacy policy</h2>
                    <p>
                        MindBridge keeps its privacy policy under regular review and places any updates on this web page.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3">9. How to contact us</h2>
                    <p>
                        If you have any questions about MindBridge&apos;s privacy policy, the data we hold on you, or you would like to exercise one of your data protection rights, please do not hesitate to contact us.
                    </p>
                </section>
            </div>
        </div>
    );
}
