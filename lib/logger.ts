/**
 * Structured JSON Logger for SOC 2 Compliance
 * Ensures logs are machine-readable and PII is redacted
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: string;
    context?: Record<string, unknown>;
    error?: Error;
}

const PII_KEYS = ['email', 'password', 'token', 'key', 'secret', 'auth', 'ssn', 'credit_card'];

function redact(value: unknown): unknown {
    if (value === null || typeof value !== 'object') {
        return value;
    }

    if (Array.isArray(value)) {
        return value.map(redact);
    }

    const record = value as Record<string, unknown>;
    const redactedContext: Record<string, unknown> = {};

    for (const key of Object.keys(record)) {
        if (PII_KEYS.some(k => key.toLowerCase().includes(k))) {
            redactedContext[key] = '[REDACTED]';
        } else {
            redactedContext[key] = redact(record[key]);
        }
    }

    return redactedContext;
}

export class Logger {
    private static log(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error) {
        const entry: LogEntry = {
            level,
            message,
            timestamp: new Date().toISOString(),
            context: context ? redact(context) : undefined,
        };

        if (error) {
            entry.context = {
                ...entry.context,
                errorName: error.name,
                errorMessage: error.message,
                stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
            };
        }

        console.log(JSON.stringify(entry));
    }

    static info(message: string, context?: Record<string, unknown>) {
        this.log('info', message, context);
    }

    static warn(message: string, context?: Record<string, unknown>) {
        this.log('warn', message, context);
    }

    static error(message: string, error?: Error, context?: Record<string, unknown>) {
        this.log('error', message, context, error);
    }

    static debug(message: string, context?: Record<string, unknown>) {
        if (process.env.NODE_ENV !== 'production') {
            this.log('debug', message, context);
        }
    }
}
