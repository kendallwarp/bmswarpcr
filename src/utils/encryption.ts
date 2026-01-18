/**
 * Simple obfuscation utilities for API credentials
 * Note: This is NOT cryptographically secure - only basic obfuscation
 * For production, use proper encryption with backend storage
 */

export const obfuscate = (text: string): string => {
    try {
        return btoa(text);
    } catch (e) {
        console.error('Obfuscation failed:', e);
        return text;
    }
};

export const deobfuscate = (encoded: string): string => {
    try {
        return atob(encoded);
    } catch (e) {
        console.error('Deobfuscation failed:', e);
        return encoded;
    }
};
