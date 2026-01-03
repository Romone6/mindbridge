import React from 'react';
import { PageShell } from '@/components/layout/page-shell';

export default function TermsOfService() {
    return (
        <PageShell>
            <div className="max-w-4xl space-y-6">
                <h1>Terms of service</h1>
                <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

                <div className="space-y-6">
                    <section>
                        <h2 className="text-xl font-semibold mb-3">1. Agreement to Terms</h2>
                        <p>
                            By accessing or using the MindBridge website and services, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
                        </p>
                    </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3">2. Use License</h2>
                    <p>
                        Permission is granted to temporarily download one copy of the materials (information or software) on MindBridge&apos;s website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Modify or copy the materials;</li>
                        <li>Use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
                        <li>Attempt to decompile or reverse engineer any software contained on MindBridge&apos;s website;</li>
                        <li>Remove any copyright or other proprietary notations from the materials; or</li>
                        <li>Transfer the materials to another person or &quot;mirror&quot; the materials on any other server.</li>
                    </ul>
                    <p className="mt-2">
                        This license shall automatically terminate if you violate any of these restrictions and may be terminated by MindBridge at any time.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3">3. Disclaimer</h2>
                    <p>
                        The materials on MindBridge&apos;s website are provided on an &quot;as is&quot; basis. MindBridge makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3">4. Limitations</h2>
                    <p>
                        In no event shall MindBridge or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on MindBridge&apos;s website, even if MindBridge or a MindBridge authorized representative has been notified orally or in writing of the possibility of such damage.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3">5. Accuracy of Materials</h2>
                    <p>
                        The materials appearing on MindBridge&apos;s website could include technical, typographical, or photographic errors. MindBridge does not warrant that any of the materials on its website are accurate, complete or current. MindBridge may make changes to the materials contained on its website at any time without notice. However MindBridge does not make any commitment to update the materials.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3">6. Links</h2>
                    <p>
                        MindBridge has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by MindBridge of the site. Use of any such linked website is at the user&apos;s own risk.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3">7. Modifications</h2>
                    <p>
                        MindBridge may revise these terms of service for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3">8. Governing Law</h2>
                    <p>
                        These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which MindBridge operates and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
                    </p>
                </section>
                </div>
            </div>
        </PageShell>
    );
}
