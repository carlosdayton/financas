import { useCallback, useEffect } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { Transaction, RecurringTransaction } from '../types/finance';
import { usePersistedState } from './usePersistedState';
import { getTodayLocalISO } from '../utils/date';

const RECURRING_KEY = 'financas_recurring';

export function useRecurring(setTransactions: Dispatch<SetStateAction<Transaction[]>>) {
  const [recurring, setRecurring] = usePersistedState<RecurringTransaction[]>(RECURRING_KEY, []);

  useEffect(() => {
    const today = getTodayLocalISO();

    recurring.forEach(rec => {
      if (!rec.isActive) return;
      if (rec.endDate && rec.endDate < today) return;
      if (rec.lastGenerated && rec.lastGenerated >= today) return;

      const lastGen = rec.lastGenerated ? new Date(rec.lastGenerated) : new Date(rec.startDate);
      const todayDate = new Date(today);
      let shouldGenerate = false;

      switch (rec.frequency) {
        case 'daily':
          shouldGenerate = lastGen < todayDate;
          break;
        case 'weekly':
          shouldGenerate = (todayDate.getTime() - lastGen.getTime()) >= 7 * 24 * 60 * 60 * 1000;
          break;
        case 'monthly':
          shouldGenerate = lastGen.getMonth() !== todayDate.getMonth() || lastGen.getFullYear() !== todayDate.getFullYear();
          break;
        case 'yearly':
          shouldGenerate = lastGen.getFullYear() !== todayDate.getFullYear();
          break;
      }

      if (shouldGenerate) {
        const newTransaction: Transaction = {
          id: crypto.randomUUID(),
          description: rec.description,
          amount: rec.amount,
          type: rec.type,
          category: rec.category,
          date: today,
          createdAt: new Date().toISOString(),
          accountId: rec.accountId,
          isRecurring: true,
          recurringId: rec.id,
        };
        setTransactions(prev => [newTransaction, ...prev]);
        setRecurring(prev => prev.map(r => r.id === rec.id ? { ...r, lastGenerated: today } : r));
      }
    });
  }, [recurring, setTransactions, setRecurring]);

  const addRecurring = useCallback((rec: Omit<RecurringTransaction, 'id'>) => {
    const newRecurring: RecurringTransaction = { ...rec, id: crypto.randomUUID() };
    setRecurring(prev => [...prev, newRecurring]);
  }, [setRecurring]);

  const updateRecurring = useCallback((id: string, updates: Partial<RecurringTransaction>) => {
    setRecurring(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  }, [setRecurring]);

  const deleteRecurring = useCallback((id: string) => {
    setRecurring(prev => prev.filter(r => r.id !== id));
  }, [setRecurring]);

  return {
    recurring,
    setRecurring,
    addRecurring,
    updateRecurring,
    deleteRecurring,
  };
}
