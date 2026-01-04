# Email Sender Standards

MindBridge uses consistent, verified sender identities across all transactional and marketing emails.

## Standard mailboxes
- Sales: sales@mindbridge.health
- Legal: legal@mindbridge.health
- Support: support@mindbridge.health

## Default sending policy
- FROM: support@mindbridge.health (single verified sender)
- REPLY-TO: set per email type:
  - Waitlist + demo inquiries -> sales@mindbridge.health
  - Legal/privacy requests -> legal@mindbridge.health
  - Support + account issues -> support@mindbridge.health

## Implementation notes
- If the email provider supports multiple verified senders, keep the single sender anyway to simplify compliance.
- If a provider requires a different verified address, map it in code and keep reply-to aligned with the mailbox above.
- Update any templates to reflect these addresses before enabling outbound email.
