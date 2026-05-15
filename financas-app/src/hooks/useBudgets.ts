import { useCallback } from 'react';
import type { Transaction, Budget, BudgetStatus } from '../types/finance';
import { usePersistedState } from './usePersistedState';

const BUDGETS_KEY = 'financas_budgets';

export function useBudgets(transactions: Transaction[]) {
  const [budgets, setBudgets] = usePersistedState<Budget[]>(BUDGETS_KEY, []);

  const addBudget = useCallback((budget: Omit<Budget, 'id' | 'createdAt'>) => {
    const newBudget: Budget = {
      ...budget,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setBudgets(prev => [...prev.filter(b => !(b.category === budget.category && b.month === budget.month)), newBudget]);
  }, [setBudgets]);

  const updateBudget = useCallback((id: string, updates: Partial<Budget>) => {
    setBudgets(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  }, [setBudgets]);

  const deleteBudget = useCallback((id: string) => {
    setBudgets(prev => prev.filter(b => b.id !== id));
  }, [setBudgets]);

  const getBudgetStatus = useCallback((month: string): BudgetStatus[] => {
    return budgets
      .filter(b => b.month === month)
      .map(budget => {
        const spent = transactions
          .filter(t => t.type === 'expense' && t.category === budget.category && t.date.startsWith(month))
          .reduce((sum, t) => sum + t.amount, 0);
        const remaining = budget.amount - spent;
        const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
        return { budget, spent, remaining, percentage, isExceeded: spent > budget.amount };
      })
      .sort((a, b) => b.percentage - a.percentage);
  }, [budgets, transactions]);

  return {
    budgets,
    setBudgets,
    addBudget,
    updateBudget,
    deleteBudget,
    getBudgetStatus,
  };
}
