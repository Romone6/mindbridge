/**
 * Encryption utilities for PHI data
 * Uses AES-256-GCM for authenticated encryption
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // GCM standard
const SALT_LENGTH = 64;
const KEY_LENGTH = 32;
const ITERATIONS = 100000;

/**
 * Get encryption key from environment variable
 * In production, this should be stored in a secure key management system (AWS KMS, Azure Key Vault, etc.)
 */
function getEncryptionKey(): Buffer {
    const key = process.env.ENCRYPTION_KEY;
    if (!key) {
        throw new Error('ENCRYPTION_KEY environment variable is required');
    }

    // Key should be base64 encoded 32-byte key
    return Buffer.from(key, 'base64');
}

/**
 * Derive encryption key from master key using PBKDF2
 */
function deriveKey(masterKey: Buffer, salt: Buffer): Buffer {
    return crypto.pbkdf2Sync(masterKey, salt, ITERATIONS, KEY_LENGTH, 'sha256');
}

/**
 * Encrypt sensitive data (PHI)
 * Returns base64 encoded encrypted data with format: salt:iv:tag:ciphertext
 */
export function encrypt(plaintext: string): string {
    try {
        const masterKey = getEncryptionKey();
        const salt = crypto.randomBytes(SALT_LENGTH);
        const key = deriveKey(masterKey, salt);
        const iv = crypto.randomBytes(IV_LENGTH);

        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

        let encrypted = cipher.update(plaintext, 'utf8', 'base64');
        encrypted += cipher.final('base64');

        const tag = cipher.getAuthTag();

        // Combine salt:iv:tag:ciphertext
        const combined = `${salt.toString('base64')}:${iv.toString('base64')}:${tag.toString('base64')}:${encrypted}`;

        return combined;
    } catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Failed to encrypt data');
    }
}

/**
 * Decrypt sensitive data (PHI)
 * Expects format: salt:iv:tag:ciphertext
 */
export function decrypt(encryptedData: string): string {
    try {
        const masterKey = getEncryptionKey();
        const parts = encryptedData.split(':');

        if (parts.length !== 4) {
            throw new Error('Invalid encrypted data format');
        }

        const [saltB64, ivB64, tagB64, ciphertext] = parts;
        const salt = Buffer.from(saltB64, 'base64');
        const iv = Buffer.from(ivB64, 'base64');
        const tag = Buffer.from(tagB64, 'base64');

        const key = deriveKey(masterKey, salt);

        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(tag);

        let decrypted = decipher.update(ciphertext, 'base64', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.error('Decryption error:', error);
        throw new Error('Failed to decrypt data');
    }
}

/**
 * Generate a new encryption key (for initial setup)
 * This should be run once and the key stored securely
 */
export function generateEncryptionKey(): string {
    const key = crypto.randomBytes(KEY_LENGTH);
    return key.toString('base64');
}

/**
 * Hash data for storage (one-way, for searchable fields)
 * Uses SHA-256
 */
export function hash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
}
