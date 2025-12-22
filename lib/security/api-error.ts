import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

type AppError = Error & { statusCode?: number; code?: string };

/**
 * Standardized API error response
 * Scrubs stack traces in production
 */
export function handleApiError(error: unknown) {
    console.error('[API_ERROR]', error);

    if (error instanceof ZodError) {
        return NextResponse.json(
            {
                error: 'Validation Error',
                details: error.flatten().fieldErrors
            },
            { status: 400 }
        );
    }

    const appError = error as AppError;
    const statusCode = appError.statusCode || 500;
    const message = statusCode === 500
        ? 'Internal Server Error'
        : appError.message;

    return NextResponse.json(
        {
            error: message,
            code: appError.code,
            ...(process.env.NODE_ENV !== 'production' && { stack: appError.stack })
        },
        { status: statusCode }
    );
}

export class ApiError extends Error {
    statusCode: number;
    code?: string;

    constructor(message: string, statusCode: number = 500, code?: string) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
    }
}
