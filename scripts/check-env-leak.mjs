import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FORBIDDEN_KEYS = [
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'docenc', // Encryption keys
    'SERVICE_ROLE',
    'OPENAI_API_KEY',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
];

// Directories to scan
const SCAN_DIRS = ['app', 'components', 'lib', 'hooks', 'utils'];

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.js') || file.endsWith('.jsx')) {
                arrayOfFiles.push(path.join(dirPath, "/", file));
            }
        }
    });

    return arrayOfFiles;
}

function checkFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const isClient = content.includes("'use client'") || content.includes('"use client"');

    const isInComponents = filePath.includes('components');

    const errors = [];

    FORBIDDEN_KEYS.forEach(key => {
        if (content.includes(`process.env.${key}`)) {
            if (isClient || isInComponents) {
                errors.push(`❌ LEAK DETECTED: ${key} found in client/component file: ${filePath}`);
            }
        }
    });

    return errors;
}

console.log('🔒 Starting Secret Leak Scan...');
let leaking = false;

SCAN_DIRS.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(fullPath)) return;

    const files = getAllFiles(fullPath);
    files.forEach(file => {
        const errors = checkFile(file);
        if (errors.length > 0) {
            leaking = true;
            errors.forEach(e => console.error(e));
        }
    });
});

if (leaking) {
    console.error('\n🚫 FAILED: Secrets reference detected in client-side code.');
    process.exit(1);
} else {
    console.log('✅ SUCCESS: No client-side secret leaks detected.');
    process.exit(0);
}
