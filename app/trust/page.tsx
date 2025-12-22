import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, FileText, CheckCircle } from 'lucide-react';

import LiveStatusPanel from '@/components/trust/live-status-panel';
import UpcomingAudits from '@/components/trust/upcoming-audits';

export default function TrustCenter() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">Trust Center</h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Transparency is at the core of our values. Monitor our security posture, compliance status, and data protection policies in real-time.
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                    <div className="flex items-center space-x-3 mb-4">
                        <ShieldCheck className="w-8 h-8 text-green-600" />
                        <h2 className="text-xl font-semibold">Security</h2>
                    </div>
                    <p className="text-gray-600 mb-4">
                        We employ industry-leading security controls including encryption at rest and in transit, role-based access control, and continuous monitoring.
                    </p>
                    <div className="text-sm font-medium text-green-600 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1" /> SOC 2 Type II (In Progress)
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                    <div className="flex items-center space-x-3 mb-4">
                        <Lock className="w-8 h-8 text-blue-600" />
                        <h2 className="text-xl font-semibold">Privacy</h2>
                    </div>
                    <p className="text-gray-600 mb-4">
                        We collect only what is necessary and process data in accordance with GDPR and HIPAA standards. Your data is yours.
                    </p>
                    <div className="text-sm font-medium text-blue-600 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1" /> GDPR Compliant
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                    <div className="flex items-center space-x-3 mb-4">
                        <FileText className="w-8 h-8 text-purple-600" />
                        <h2 className="text-xl font-semibold">Compliance</h2>
                    </div>
                    <p className="text-gray-600 mb-4">
                        Our infrastructure and processes are regularly audited to ensure we meet strict regulatory requirements for healthcare data.
                    </p>
                    <div className="text-sm font-medium text-purple-600 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1" /> HIPAA Ready
                    </div>
                </div>
            </div>

            {/* Live Status Panel - Dynamic */}
            <LiveStatusPanel />

            <div className="border-t pt-10">
                <h2 className="text-2xl font-bold mb-6">Resources</h2>
                <div className="grid md:grid-cols-2 gap-4">
                    <Link href="/legal/privacy" className="block p-4 border rounded hover:bg-gray-50 transition">
                        <h3 className="font-semibold text-lg mb-1">Privacy Policy</h3>
                        <p className="text-gray-500 text-sm">Read how we handle your data.</p>
                    </Link>
                    <Link href="/legal/terms" className="block p-4 border rounded hover:bg-gray-50 transition">
                        <h3 className="font-semibold text-lg mb-1">Terms of Service</h3>
                        <p className="text-gray-500 text-sm">Understand your rights and responsibilities.</p>
                    </Link>
                </div>
            </div>
            {/* Upcoming Audits */}
            <UpcomingAudits />


        </div>
    );
}
