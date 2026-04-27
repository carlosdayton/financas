import { useState, useCallback } from 'react';

const PIN_HASH_KEY = 'financas_pin_hash';
const LOCKOUT_KEY = 'financas_lockout';

interface AuthState {
  isAuthenticated: boolean;
  hasPin: boolean;
  isLocked: boolean;
  lockoutTime: number;
  failedAttempts: number;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>(() => {
    const storedPinHash = localStorage.getItem(PIN_HASH_KEY);
    const storedLockout = localStorage.getItem(LOCKOUT_KEY);

    if (storedLockout) {
      const lockoutData = JSON.parse(storedLockout) as { lockedUntil?: number; attempts?: number };
      const now = Date.now();

      if (lockoutData.lockedUntil && lockoutData.lockedUntil > now) {
        return {
          isAuthenticated: false,
          hasPin: !!storedPinHash,
          isLocked: true,
          lockoutTime: lockoutData.lockedUntil ?? 0,
          failedAttempts: lockoutData.attempts || 0,
        };
      }

      localStorage.removeItem(LOCKOUT_KEY);
    }

    return {
      isAuthenticated: false,
      hasPin: !!storedPinHash,
      isLocked: false,
      lockoutTime: 0,
      failedAttempts: 0,
    };
  });

  // Hash function for PIN
  const legacyHashPin = useCallback((pin: string): string => {
    let hash = 0;
    for (let i = 0; i < pin.length; i++) {
      const char = pin.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }, []);

  const hashPin = useCallback(async (pin: string): Promise<string> => {
    const encoded = new TextEncoder().encode(pin);
    const digest = await crypto.subtle.digest('SHA-256', encoded);
    return Array.from(new Uint8Array(digest))
      .map((value) => value.toString(16).padStart(2, '0'))
      .join('');
  }, []);

  // Setup PIN
  const setupPin = useCallback(async (pin: string): Promise<boolean> => {
    if (pin.length < 4 || pin.length > 6) {
      return false;
    }
    
    const hashedPin = await hashPin(pin);
    localStorage.setItem(PIN_HASH_KEY, hashedPin);
    
    setState(prev => ({
      ...prev,
      hasPin: true,
      isAuthenticated: true,
    }));
    
    return true;
  }, [hashPin]);

  // Verify PIN
  const verifyPin = useCallback(async (pin: string): Promise<boolean> => {
    if (state.isLocked) {
      const now = Date.now();
      if (state.lockoutTime > now) {
        return false;
      }
      // Lockout expired
      localStorage.removeItem(LOCKOUT_KEY);
      setState(prev => ({
        ...prev,
        isLocked: false,
        failedAttempts: 0,
      }));
    }

    const storedHash = localStorage.getItem(PIN_HASH_KEY);
    const inputHash = await hashPin(pin);
    const inputLegacyHash = legacyHashPin(pin);

    if (storedHash === inputHash || storedHash === inputLegacyHash) {
      // Success
      if (storedHash === inputLegacyHash && storedHash !== inputHash) {
        localStorage.setItem(PIN_HASH_KEY, inputHash);
      }
      localStorage.removeItem(LOCKOUT_KEY);
      setState(prev => ({
        ...prev,
        isAuthenticated: true,
        failedAttempts: 0,
        isLocked: false,
      }));
      return true;
    }

    // Failed attempt
    const newAttempts = state.failedAttempts + 1;
    const maxAttempts = 5;
    
    if (newAttempts >= maxAttempts) {
      // Lock out for 5 minutes
      const lockoutDuration = 5 * 60 * 1000; // 5 minutes
      const lockedUntil = Date.now() + lockoutDuration;
      
      localStorage.setItem(LOCKOUT_KEY, JSON.stringify({
        lockedUntil,
        attempts: newAttempts,
      }));
      
      setState(prev => ({
        ...prev,
        isLocked: true,
        lockoutTime: lockedUntil,
        failedAttempts: newAttempts,
      }));
    } else {
      localStorage.setItem(LOCKOUT_KEY, JSON.stringify({
        lockedUntil: 0,
        attempts: newAttempts,
      }));
      
      setState(prev => ({
        ...prev,
        failedAttempts: newAttempts,
      }));
    }

    return false;
  }, [hashPin, legacyHashPin, state.failedAttempts, state.isLocked, state.lockoutTime]);

  // Logout
  const logout = useCallback(() => {
    setState(prev => ({
      ...prev,
      isAuthenticated: false,
    }));
  }, []);

  // Remove PIN
  const removePin = useCallback(() => {
    localStorage.removeItem(PIN_HASH_KEY);
    localStorage.removeItem(LOCKOUT_KEY);
    setState(prev => ({
      ...prev,
      hasPin: false,
      isAuthenticated: false,
      failedAttempts: 0,
      isLocked: false,
    }));
  }, []);

  // Check if biometrics is available
  const checkBiometrics = useCallback(async (): Promise<boolean> => {
    if (!window.PublicKeyCredential) {
      return false;
    }
    
    try {
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      return available;
    } catch {
      return false;
    }
  }, []);

  // Get remaining lockout time
  const getLockoutRemaining = useCallback((): number => {
    if (!state.isLocked) return 0;
    const remaining = state.lockoutTime - Date.now();
    return Math.max(0, remaining);
  }, [state.isLocked, state.lockoutTime]);

  return {
    ...state,
    setupPin,
    verifyPin,
    logout,
    removePin,
    checkBiometrics,
    getLockoutRemaining,
  };
}
