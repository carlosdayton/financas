import { useCallback } from 'react';

// Simple encryption using XOR cipher with a key derived from PIN
// Note: This is basic encryption suitable for local storage protection
// For production, consider using Web Crypto API with proper key management

export function useEncryption() {
  // Generate encryption key from PIN
  const generateKey = useCallback((pin: string): string => {
    let key = '';
    for (let i = 0; i < pin.length; i++) {
      key += pin.charCodeAt(i).toString(16).padStart(2, '0');
    }
    return key;
  }, []);

  // Encrypt data
  const encrypt = useCallback((data: string, pin: string): string => {
    const key = generateKey(pin);
    let encrypted = '';
    
    for (let i = 0; i < data.length; i++) {
      const charCode = data.charCodeAt(i);
      const keyChar = key.charCodeAt(i % key.length);
      encrypted += String.fromCharCode(charCode ^ keyChar);
    }
    
    // Convert to base64 for safe storage
    return btoa(encrypted);
  }, [generateKey]);

  // Decrypt data
  const decrypt = useCallback((encryptedData: string, pin: string): string | null => {
    try {
      const key = generateKey(pin);
      // Decode from base64
      const data = atob(encryptedData);
      let decrypted = '';
      
      for (let i = 0; i < data.length; i++) {
        const charCode = data.charCodeAt(i);
        const keyChar = key.charCodeAt(i % key.length);
        decrypted += String.fromCharCode(charCode ^ keyChar);
      }
      
      return decrypted;
    } catch {
      return null;
    }
  }, [generateKey]);

  // Encrypt object
  const encryptObject = useCallback(<T extends object>(obj: T, pin: string): string => {
    const jsonString = JSON.stringify(obj);
    return encrypt(jsonString, pin);
  }, [encrypt]);

  // Decrypt object
  const decryptObject = useCallback(<T extends object>(encryptedData: string, pin: string): T | null => {
    const decrypted = decrypt(encryptedData, pin);
    if (!decrypted) return null;
    
    try {
      return JSON.parse(decrypted) as T;
    } catch {
      return null;
    }
  }, [decrypt]);

  // Hash data (one-way)
  const hash = useCallback((data: string): string => {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16).padStart(16, '0');
  }, []);

  return {
    encrypt,
    decrypt,
    encryptObject,
    decryptObject,
    hash,
  };
}
