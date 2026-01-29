# AGENTS.md

This file provides information for agentic coding agents operating in this repository.

## Build Commands

*   **Full Build:** `cross-env NEXT_DISABLE_TURBOPACK=1 next build --webpack`

## Lint Commands

*   **Lint:** `eslint`

## Test Commands

*   **Full Test:** `tsx --test tests/unit/**/*.test.ts*`
*   **Single Test:** `tsx --test tests/unit/<test_file_name>.test.ts`
*   **E2E Test:** `playwright test`

## Code Style Guidelines

*   **Imports:**
    *   Use absolute imports for internal modules (e.g., `@/components/ui/button`).
    *   Use relative imports for local files within the same directory.
    *   Import statements should be at the top of the file.
*   **Formatting:**
    *   The project uses Tailwind CSS for styling. Follow Tailwind CSS conventions.
    *   Consistent indentation (likely 2 spaces based on `package.json`).
*   **Types:**
    *   Use TypeScript for all code.
    *   Define interfaces for data structures and component props.
    *   Use explicit types for function parameters and return values.
*   **Naming Conventions:**
    *   Use camelCase for variable and function names.
    *   Use PascalCase for component names.
    *   Use descriptive names for variables and functions.
*   **Error Handling:**
    *   Use `try...catch` blocks for error handling.
    *   Log errors using a consistent logging mechanism (if available).
    *   Display user-friendly error messages.

## Notes

*   This project uses Next.js.
*   This project uses TypeScript.
*   This project uses Tailwind CSS.