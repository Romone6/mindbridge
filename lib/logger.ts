/**
 * Structured JSON Logger for SOC 2 Compliance
 * Ensures logs are machine-readable and PII is redacted
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: string;
    context?: Record<string, any>;
    error?: Error;
}

const PII_KEYS = ['email', 'password', 'token', 'key', 'secret', 'auth', 'ssn', 'credit_card'];

function redact(obj: any): any {
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(redact);
    }

    const redactedContext: Record<string, any> = {};

    for (const key in obj) {
        if (PII_KEYS.some(k => key.toLowerCase().includes(k))) {
            redactedContext[key] = '[REDACTED]';
        } else {
            redactedContext[key] = redact(obj[key]);
        }
    }

    return redactedContext;
}

export class Logger {
    private static log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error) {
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

    static info(message: string, context?: Record<string, any>) {
        this.log('info', message, context);
    }

    static warn(message: string, context?: Record<string, any>) {
        this.log('warn', message, context);
    }

    static error(message: string, error?: Error, context?: Record<string, any>) {
        this.log('error', message, context, error);
    }

    static debug(message: string, context?: Record<string, any>) {
        if (process.env.NODE_ENV !== 'production') {
            this.log('debug', message, context);
        }
    }
}
