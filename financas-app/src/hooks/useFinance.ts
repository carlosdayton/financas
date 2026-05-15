import { useCallback } from 'react';
import type { FinanceBackupData } from '../types/backup';
import { useTransactions } from './useTransactions';
import { useCategories, defaultCategories } from './useCategories';
import { useGoals } from './useGoals';
import { useAccounts, defaultAccounts } from './useAccounts';
import { useRecurring } from './useRecurring';
import { useBudgets } from './useBudgets';

export function useFinance() {
  const {
    transactions, setTransactions,
    addTransaction, deleteTransaction, updateTransaction, transferBetweenAccounts,
    getSummary, getMonthlyData, getCategoryData, getTransactionsByMonth, getAccountBalance,
  } = useTransactions();

  const { categories, setCategories, addCategory, updateCategory, deleteCategory } = useCategories();
  const { goals, setGoals, addGoal, updateGoal, deleteGoal, contributeToGoal } = useGoals();
  const { accounts, setAccounts, addAccount, updateAccount, deleteAccount } = useAccounts();
  const { recurring, setRecurring, addRecurring, updateRecurring, deleteRecurring } = useRecurring(setTransactions);
  const { budgets, setBudgets, addBudget, updateBudget, deleteBudget, getBudgetStatus } = useBudgets(transactions);

  const reassignAccountReferences = useCallback((fromAccountId: string, toAccountId: string) => {
    setTransactions(prev =>
      prev.map(t => t.accountId === fromAccountId ? { ...t, accountId: toAccountId } : t)
    );
    setRecurring(prev =>
      prev.map(r => r.accountId === fromAccountId ? { ...r, accountId: toAccountId } : r)
    );
  }, [setTransactions, setRecurring]);

  const replaceAllData = useCallback((data: FinanceBackupData) => {
    setTransactions(data.transactions);
    setCategories(data.categories.length > 0 ? data.categories : defaultCategories);
    setGoals(data.goals);
    setAccounts(data.accounts.length > 0 ? data.accounts : defaultAccounts);
    setRecurring(data.recurring);
    setBudgets(data.budgets);
  }, [setTransactions, setCategories, setGoals, setAccounts, setRecurring, setBudgets]);

  return {
    transactions,
    categories,
    goals,
    accounts,
    recurring,
    budgets,
    isLoaded: true,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    addCategory,
    updateCategory,
    deleteCategory,
    addGoal,
    updateGoal,
    deleteGoal,
    contributeToGoal,
    addAccount,
    updateAccount,
    deleteAccount,
    reassignAccountReferences,
    addRecurring,
    updateRecurring,
    deleteRecurring,
    transferBetweenAccounts,
    addBudget,
    updateBudget,
    deleteBudget,
    getSummary,
    getMonthlyData,
    getCategoryData,
    getTransactionsByMonth,
    getAccountBalance,
    getBudgetStatus,
    replaceAllData,
  };
}
