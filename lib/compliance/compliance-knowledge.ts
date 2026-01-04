/**
 * Compliance Knowledge Base
 * 
 * This file contains pre-built Q&A pairs for the Trust Center AI Chatbot.
 * The chatbot uses this knowledge base to answer visitor questions about
 * MindBridge's compliance, security, and privacy practices.
 */

import { siteConfig } from "@/lib/site-config";

export interface KnowledgeItem {
    id: string;
    category: 'security' | 'privacy' | 'compliance' | 'data' | 'general';
    question: string;
    answer: string;
    keywords: string[];
}

export const complianceKnowledge: KnowledgeItem[] = [
    // Security
    {
        id: 'sec-001',
        category: 'security',
        question: 'What security measures does MindBridge use?',
        answer: 'MindBridge employs industry-leading security controls including: encryption at rest (AES-256) and in transit (TLS 1.3), role-based access control (RBAC), multi-factor authentication (MFA) for staff access, continuous security monitoring, regular penetration testing, and secure development practices following OWASP guidelines.',
        keywords: ['security', 'encryption', 'protection', 'safe', 'secure']
    },
    {
        id: 'sec-002',
        category: 'security',
        question: 'Is my data encrypted?',
        answer: 'Yes, absolutely. All data is encrypted both at rest using AES-256 encryption and in transit using TLS 1.3. Database-level encryption is enabled on all production systems, and encryption keys are managed through secure key management services.',
        keywords: ['encrypt', 'encrypted', 'encryption', 'data protection']
    },
    {
        id: 'sec-003',
        category: 'security',
        question: 'Do you perform security audits?',
        answer: 'Yes, we conduct regular security assessments including annual third-party penetration testing, continuous vulnerability scanning, static and dynamic application security testing (SAST/DAST), and regular security code reviews. Results are documented and remediation is tracked.',
        keywords: ['audit', 'penetration', 'testing', 'assessment', 'vulnerability']
    },
    {
        id: 'sec-004',
        category: 'security',
        question: 'How do you handle security incidents?',
        answer: 'We have a documented Incident Response Plan that includes: 24/7 monitoring and alerting, defined escalation procedures, containment and eradication protocols, customer notification procedures (within 72 hours for significant incidents), post-incident analysis and remediation, and regular incident response drills.',
        keywords: ['incident', 'breach', 'response', 'emergency']
    },

    // Privacy
    {
        id: 'priv-001',
        category: 'privacy',
        question: 'What data do you collect?',
        answer: 'We collect only the minimum data necessary to provide our services. This includes: contact information (name, email), clinical session data (for triage purposes), usage analytics (anonymized), and technical logs for security monitoring. We do not sell or share your data with third parties for marketing purposes.',
        keywords: ['collect', 'data', 'information', 'what data']
    },
    {
        id: 'priv-002',
        category: 'privacy',
        question: 'Are you GDPR compliant?',
        answer: 'Yes, MindBridge is fully GDPR compliant. We provide: clear consent mechanisms, data portability on request, right to erasure ("right to be forgotten"), data processing agreements with all sub-processors, a designated Data Protection Officer, and privacy impact assessments for new features.',
        keywords: ['gdpr', 'europe', 'european', 'data protection', 'privacy law']
    },
    {
        id: 'priv-003',
        category: 'privacy',
        question: 'How can I delete my data?',
        answer: 'You can request data deletion at any time by contacting our support team or using the "Delete My Data" option in your account settings. We process deletion requests within 30 days and will confirm once your data has been permanently removed from all systems, including backups (within 90 days).',
        keywords: ['delete', 'remove', 'erase', 'forget', 'deletion']
    },
    {
        id: 'priv-004',
        category: 'privacy',
        question: 'Do you share data with third parties?',
        answer: 'We only share data with third parties when necessary to provide our services and under strict contractual obligations. Our sub-processors include cloud infrastructure providers and essential service providers, all of whom are bound by data processing agreements and must meet our security standards.',
        keywords: ['share', 'third party', 'vendors', 'partners', 'sub-processors']
    },

    // Compliance
    {
        id: 'comp-001',
        category: 'compliance',
        question: 'Are you HIPAA compliant?',
        answer: 'Yes, MindBridge is designed with HIPAA compliance in mind. We implement: required administrative, physical, and technical safeguards, Business Associate Agreements (BAAs) with covered entities, access controls and audit logging for PHI, encryption of ePHI at rest and in transit, and regular HIPAA training for all staff.',
        keywords: ['hipaa', 'healthcare', 'phi', 'protected health', 'medical']
    },
    {
        id: 'comp-002',
        category: 'compliance',
        question: 'Do you have SOC 2 certification?',
        answer: 'We are currently pursuing SOC 2 Type II certification. Our security controls are designed to meet SOC 2 Trust Service Criteria including Security, Availability, Processing Integrity, Confidentiality, and Privacy. We expect to complete our audit in early 2026.',
        keywords: ['soc', 'soc2', 'soc 2', 'certification', 'aicpa']
    },
    {
        id: 'comp-003',
        category: 'compliance',
        question: 'What compliance frameworks do you follow?',
        answer: 'MindBridge follows multiple compliance frameworks including: SOC 2 Type II (in progress), HIPAA for healthcare data, GDPR for European data protection, ISO 27001 principles, NIST Cybersecurity Framework, NIST AI RMF for AI governance, and ISO 42001 for AI management systems.',
        keywords: ['framework', 'standards', 'compliance', 'regulation', 'iso', 'nist']
    },
    {
        id: 'comp-004',
        category: 'compliance',
        question: 'How do you ensure AI safety and ethics?',
        answer: 'Our AI systems are developed following NIST AI RMF and ISO 42001 guidelines. This includes: bias testing and mitigation, explainability and transparency in AI decisions, human oversight for clinical recommendations, regular model audits, clear disclosure that users are interacting with AI, and robust data governance for training data.',
        keywords: ['ai', 'artificial intelligence', 'ethics', 'bias', 'fairness', 'responsible']
    },

    // Data Handling
    {
        id: 'data-001',
        category: 'data',
        question: 'Where is my data stored?',
        answer: 'Your data is stored in secure, SOC 2 certified data centers. For most users, data is stored in the United States. We use industry-leading cloud providers with strong physical security controls, redundancy, and disaster recovery capabilities.',
        keywords: ['store', 'storage', 'location', 'where', 'datacenter', 'cloud']
    },
    {
        id: 'data-002',
        category: 'data',
        question: 'How long do you retain data?',
        answer: 'Data retention periods vary by data type: session data is retained for 7 years (healthcare compliance requirement), account data is retained while your account is active plus 30 days, logs are retained for 1 year for security purposes. You can request earlier deletion of non-required data at any time.',
        keywords: ['retention', 'retain', 'how long', 'keep', 'store']
    },
    {
        id: 'data-003',
        category: 'data',
        question: 'Do you have backups?',
        answer: 'Yes, we maintain comprehensive backup procedures including: daily encrypted backups, geographic redundancy (multiple regions), regular backup restoration testing, 90-day backup retention, and secure backup deletion procedures.',
        keywords: ['backup', 'backups', 'recovery', 'disaster', 'restore']
    },

    // General
    {
        id: 'gen-001',
        category: 'general',
        question: 'How can I contact your security team?',
        answer: `You can reach our security team at ${siteConfig.contactEmails.support}. For responsible disclosure of security vulnerabilities, please email ${siteConfig.contactEmails.support} with details. We appreciate security researchers and operate a responsible disclosure program.`,
        keywords: ['contact', 'security team', 'report', 'vulnerability', 'disclosure']
    },
    {
        id: 'gen-002',
        category: 'general',
        question: 'Can I get a copy of your security documentation?',
        answer: `Yes, we provide security documentation to customers and prospects under NDA. This includes our SOC 2 report (when available), security whitepaper, architecture overview, and completed security questionnaires. Please contact our sales team at ${siteConfig.contactEmails.sales} to request access.`,
        keywords: ['documentation', 'report', 'whitepaper', 'questionnaire', 'access']
    },
    {
        id: 'gen-003',
        category: 'general',
        question: 'What is MindBridge?',
        answer: 'MindBridge is a mental health triage platform that uses AI to assess patient needs and connect them with appropriate care. We prioritize security, privacy, and compliance to ensure sensitive health information is protected while providing accessible mental health support.',
        keywords: ['mindbridge', 'what is', 'about', 'company', 'platform']
    }
];

/**
 * Search the knowledge base for relevant answers
 */
export function searchKnowledge(query: string): KnowledgeItem[] {
    const queryLower = query.toLowerCase();
    const words = queryLower.split(/\s+/);

    // Score each knowledge item based on keyword matches
    const scored = complianceKnowledge.map(item => {
        let score = 0;

        // Check keyword matches
        for (const keyword of item.keywords) {
            if (queryLower.includes(keyword)) {
                score += 10;
            }
            for (const word of words) {
                if (keyword.includes(word) || word.includes(keyword)) {
                    score += 5;
                }
            }
        }

        // Check question similarity
        const questionLower = item.question.toLowerCase();
        for (const word of words) {
            if (word.length > 3 && questionLower.includes(word)) {
                score += 3;
            }
        }

        return { item, score };
    });

    // Sort by score and return top matches
    return scored
        .filter(s => s.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map(s => s.item);
}

/**
 * Get the system prompt for the AI chatbot
 */
export function getSystemPrompt(): string {
    const knowledgeContext = complianceKnowledge
        .map(k => `Q: ${k.question}\nA: ${k.answer}`)
        .join('\n\n');

    return `You are the MindBridge Trust Center AI Assistant. Your role is to answer questions about MindBridge's security, privacy, and compliance practices.

IMPORTANT GUIDELINES:
1. Only answer questions related to security, privacy, compliance, and data handling.
2. If asked about topics outside your scope, politely redirect to appropriate resources.
3. Be accurate and do not make up information. If unsure, say so.
4. Be helpful, professional, and concise.
5. For specific technical or legal questions, recommend contacting the security team.

KNOWLEDGE BASE:
${knowledgeContext}

When answering, draw from this knowledge base. If the question isn't covered, provide a general response and suggest contacting ${siteConfig.contactEmails.support} for more details.`;
}
