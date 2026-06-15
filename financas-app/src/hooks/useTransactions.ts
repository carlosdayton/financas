import { useCallback } from 'react';
import type { Transaction, FinancialSummary, MonthlyData } from '../types/finance';
import { usePersistedState } from './usePersistedState';
import { getTodayLocalISO } from '../utils/date';
import { DEFAULT_ACCOUNT_ID } from './useAccounts';

const TRANSACTIONS_KEY = 'financas_transactions';

export function useTransactions() {
  const [transactions, setTransactions] = usePersistedState<Transaction[]>(TRANSACTIONS_KEY, []);

  const addTransaction = useCallback((transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
  }, [setTransactions]);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => {
      const transaction = prev.find(t => t.id === id);
      if (transaction?.isTransfer && transaction.transferId) {
        return prev.filter(t => t.transferId !== transaction.transferId);
      }
      return prev.filter(t => t.id !== id);
    });
  }, [setTransactions]);

  const updateTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, [setTransactions]);

  const transferBetweenAccounts = useCallback((data: {
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    date?: string;
    description?: string;
  }) => {
    const date = data.date || getTodayLocalISO();
    const transferId = crypto.randomUUID();
    const baseDescription = data.description?.trim() || 'Transferencia entre contas';

    const outgoing: Transaction = {
      id: crypto.randomUUID(),
      description: baseDescription,
      amount: data.amount,
      type: 'expense',
      category: 'Transferencia interna',
      date,
      createdAt: new Date().toISOString(),
      accountId: data.fromAccountId,
      isTransfer: true,
      transferId,
      transferDirection: 'out',
    };

    const incoming: Transaction = {
      id: crypto.randomUUID(),
      description: baseDescription,
      amount: data.amount,
      type: 'income',
      category: 'Transferencia interna',
      date,
      createdAt: new Date().toISOString(),
      accountId: data.toAccountId,
      isTransfer: true,
      transferId,
      transferDirection: 'in',
    };

    setTransactions(prev => [incoming, outgoing, ...prev]);
  }, [setTransactions]);

  const getSummary = useCallback((): FinancialSummary => {
    const totalIncome = transactions
      .filter(t => t.type === 'income' && !t.isTransfer)
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions
      .filter(t => t.type === 'expense' && !t.isTransfer)
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      transactionsCount: transactions.length,
    };
  }, [transactions]);

  const getMonthlyData = useCallback((): MonthlyData[] => {
    const monthlyMap = new Map<string, { income: number; expense: number }>();
    transactions.filter(t => !t.isTransfer).forEach(t => {
      const month = t.date.substring(0, 7);
      const current = monthlyMap.get(month) || { income: 0, expense: 0 };
      if (t.type === 'income') current.income += t.amount;
      else current.expense += t.amount;
      monthlyMap.set(month, current);
    });
    return Array.from(monthlyMap.entries())
      .map(([month, data]) => ({ month, income: data.income, expense: data.expense, balance: data.income - data.expense }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12);
  }, [transactions]);

  const getCategoryData = useCallback((type: 'income' | 'expense') => {
    const categoryMap = new Map<string, number>();
    transactions.filter(t => t.type === type && !t.isTransfer).forEach(t => {
      categoryMap.set(t.category, (categoryMap.get(t.category) || 0) + t.amount);
    });
    return Array.from(categoryMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const getTransactionsByMonth = useCallback((yearMonth: string) => {
    return transactions.filter(t => t.date.startsWith(yearMonth));
  }, [transactions]);

  const getAccountBalance = useCallback((accountId: string) => {
    return transactions
      .filter(t => t.accountId === accountId || (!t.accountId && accountId === DEFAULT_ACCOUNT_ID))
      .reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);
  }, [transactions]);

  return {
    transactions,
    setTransactions,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    transferBetweenAccounts,
    getSummary,
    getMonthlyData,
    getCategoryData,
    getTransactionsByMonth,
    getAccountBalance,
  };
}
