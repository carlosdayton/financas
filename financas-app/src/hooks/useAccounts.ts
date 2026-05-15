import { useCallback } from 'react';
import type { Account } from '../types/finance';
import { usePersistedState } from './usePersistedState';

const ACCOUNTS_KEY = 'financas_accounts';

export const defaultAccounts: Account[] = [
  { id: '1', name: 'Conta Principal', type: 'checking', balance: 0, color: '#6366f1', icon: 'wallet', isDefault: true },
];

export function useAccounts() {
  const [accounts, setAccounts] = usePersistedState<Account[]>(ACCOUNTS_KEY, defaultAccounts);

  const addAccount = useCallback((account: Omit<Account, 'id'>) => {
    const newAccount: Account = { ...account, id: crypto.randomUUID() };
    setAccounts(prev => [...prev, newAccount]);
  }, [setAccounts]);

  const updateAccount = useCallback((id: string, updates: Partial<Account>) => {
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  }, [setAccounts]);

  const deleteAccount = useCallback((id: string) => {
    setAccounts(prev => prev.filter(a => a.id !== id));
  }, [setAccounts]);

  return {
    accounts,
    setAccounts,
    addAccount,
    updateAccount,
    deleteAccount,
  };
}
