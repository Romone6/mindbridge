/**
 * Pre-built response templates for high-risk clinical scenarios
 * These ensure consistent, safe, and empathetic responses
 */

export const RESPONSE_TEMPLATES = {
    SUICIDAL_IDEATION: {
        immediate: `I'm really concerned about what you've shared. Your safety is the most important thing right now.

**If you are in immediate danger, please:**
- Call emergency services (911 in the US, 000 in Australia)
- Go to your nearest emergency room
- Call the 988 Suicide & Crisis Lifeline (or 13 11 14 in Australia)

A clinician has been alerted and will review your information as a priority. You don't have to go through this alone.`,

        withPlan: `I hear that you're having thoughts about ending your life and have been thinking about how you might do it. This is a medical emergency.

**Please take action right now:**
1. Call emergency services immediately (911 or 000)
2. Tell someone you trust - a family member, friend, or neighbor
3. Remove access to any means of harm if possible
4. Stay in a safe, public place

You've taken an important step by sharing this. A crisis specialist needs to speak with you immediately. This is not something you should face alone.`,

        passive: `Thank you for being honest about these difficult thoughts. Many people experience thoughts like this, especially during times of severe distress. These thoughts don't make you a bad person - they're a sign that you need support.

While I can't provide treatment, I want to make sure you're connected with someone who can help. A clinician will review this conversation and reach out.

**In the meantime:**
- If thoughts become more intense or you feel unsafe, call 988 (or 13 11 14 in Australia)
- Reach out to someone you trust
- Avoid being alone if possible

Would you like to continue the assessment so we can get you the right level of care?`,
    },

    SELF_HARM: {
        recent: `I'm concerned to hear that you've been hurting yourself. This is a sign that you're dealing with overwhelming emotions and need support.

**Immediate steps:**
- If you need medical attention for injuries, please call emergency services
- A clinician will be notified immediately to provide support
- Consider removing access to items you use for self-harm

Self-harm is often a coping mechanism for intense emotional pain. There are healthier ways to manage these feelings, and a professional can help you develop them. You deserve care and support.`,

        ideation: `Thank you for sharing that you're having urges to hurt yourself. That takes courage. These urges are often a signal that emotional pain has become overwhelming.

**Right now, you can:**
- Use the Crisis Text Line: Text 988 (or HELLO to 741741)
- Try grounding techniques: ice cubes in your hand, intense physical exercise, or calling a friend
- Write down your feelings instead of acting on them

A clinician will review this and reach out. If urges become stronger, please reach out to a crisis line or emergency services.`,
    },

    SEVERE_DEPRESSION: {
        response: `I hear that you're going through an extremely difficult time. Feeling this level of hopelessness and struggling to function are signs that you need professional support - and that support is available.

Depression can make it feel like things will never improve, but that's the illness talking, not reality. Many people with severe depression have recovered with the right treatment.

**What helps:**
- Speaking with a psychiatrist or psychologist
- Sometimes medication (which only a doctor can prescribe)
- Building a support system
- Having a safety plan for crisis moments

A clinician will review your assessment as a priority. In the meantime, if you feel unsafe, please call 988 (or 13 11 14 in Australia).`,
    },

    ANXIETY_CRISIS: {
        response: `It sounds like you're experiencing severe anxiety that's really impacting your life. Panic attacks and constant worry can be exhausting and scary.

The good news is that anxiety disorders are very treatable. Many people find significant relief through therapy (especially CBT), sometimes combined with medication.

**For immediate relief during panic:**
- Breathe slowly: 4 counts in, 4 counts hold, 4 counts out
- Ground yourself: Name 5 things you can see, 4 things you can touch, 3 things you can hear
- Remind yourself: This is anxiety, it's not dangerous, it will pass

A clinician will review your information. If anxiety is preventing you from eating, sleeping, or functioning, consider going to urgent care or calling a crisis line.`,
    },

    GENERAL_VALIDATION: {
        distress: `What you're experiencing sounds really challenging, and I'm glad you're here seeking support. These feelings are real and valid, and they're telling us that you need help.`,

        courage: `It takes a lot of courage to reach out and talk about what you're going through. You've made an important step by being here.`,

        hope: `While things feel overwhelming right now, please know that help is available and many people do find relief from these symptoms with proper support.`,
    },

    BOUNDARY_SETTING: {
        diagnosis: `I can help gather information and assess the level of support you might need, but I can't provide a diagnosis. That requires a licensed clinician who can conduct a full evaluation. My role is to make sure you're connected with the right level of care.`,

        treatment: `I'm not able to recommend specific treatments or medications - that's something only a licensed healthcare provider can do after evaluating you personally. But I can help ensure you're connected with someone who can provide that care.`,

        emergency: `This sounds like it may need immediate attention. While I can document what you're sharing, I'm not a replacement for emergency services. If you're in crisis, please call 911 (or 000 in Australia) or go to your nearest emergency room.`,
    },

    ENCOURAGEMENT: {
        seeking_help: `Reaching out for help is a sign of strength, not weakness. You're taking the right steps.`,

        professionals: `Connecting with a mental health professional can make a real difference. They have specific training and tools to help with what you're experiencing.`,

        trusted_person: `Is there someone in your life you trust - a family member, friend, teacher, or mentor - who you could talk to about what you're going through?`,
    },
};

/**
 * Get appropriate response template based on risk indicators
 */
export function getResponseTemplate(
    scenario: 'suicidal_ideation' | 'self_harm' | 'severe_depression' | 'anxiety_crisis',
    severity: 'immediate' | 'recent' | 'passive' | 'ideation' | 'response' = 'response'
): string {
    const template = RESPONSE_TEMPLATES[scenario.toUpperCase() as keyof typeof RESPONSE_TEMPLATES];

    if (typeof template === 'object' && severity in template) {
        return template[severity as keyof typeof template] as string;
    }

    return RESPONSE_TEMPLATES.GENERAL_VALIDATION.distress;
}
