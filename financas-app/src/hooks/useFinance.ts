import { useState, useEffect, useCallback } from 'react';
import type { 
  Transaction, 
  Category, 
  FinancialSummary, 
  MonthlyData, 
  Goal, 
  Account, 
  RecurringTransaction 
} from '../types/finance';

const TRANSACTIONS_KEY = 'financas_transactions';
const CATEGORIES_KEY = 'financas_categories';
const GOALS_KEY = 'financas_goals';
const ACCOUNTS_KEY = 'financas_accounts';
const RECURRING_KEY = 'financas_recurring';

const defaultCategories: Category[] = [
  { id: '1', name: 'Salário', type: 'income', color: '#22c55e', icon: 'wallet' },
  { id: '2', name: 'Freelance', type: 'income', color: '#16a34a', icon: 'briefcase' },
  { id: '3', name: 'Investimentos', type: 'income', color: '#15803d', icon: 'trending-up' },
  { id: '4', name: 'Alimentação', type: 'expense', color: '#ef4444', icon: 'utensils' },
  { id: '5', name: 'Transporte', type: 'expense', color: '#f97316', icon: 'car' },
  { id: '6', name: 'Moradia', type: 'expense', color: '#eab308', icon: 'home' },
  { id: '7', name: 'Saúde', type: 'expense', color: '#ec4899', icon: 'heart' },
  { id: '8', name: 'Lazer', type: 'expense', color: '#8b5cf6', icon: 'gamepad-2' },
  { id: '9', name: 'Educação', type: 'expense', color: '#3b82f6', icon: 'graduation-cap' },
  { id: '10', name: 'Outros', type: 'expense', color: '#6b7280', icon: 'more-horizontal' },
];

const defaultAccounts: Account[] = [
  { id: '1', name: 'Conta Principal', type: 'checking', balance: 0, color: '#6366f1', icon: 'wallet', isDefault: true },
];

export function useFinance() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [accounts, setAccounts] = useState<Account[]>(defaultAccounts);
  const [recurring, setRecurring] = useState<RecurringTransaction[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data from localStorage
  useEffect(() => {
    const storedTransactions = localStorage.getItem(TRANSACTIONS_KEY);
    const storedCategories = localStorage.getItem(CATEGORIES_KEY);
    const storedGoals = localStorage.getItem(GOALS_KEY);
    const storedAccounts = localStorage.getItem(ACCOUNTS_KEY);
    const storedRecurring = localStorage.getItem(RECURRING_KEY);
    
    if (storedTransactions) setTransactions(JSON.parse(storedTransactions));
    if (storedCategories) setCategories(JSON.parse(storedCategories));
    if (storedGoals) setGoals(JSON.parse(storedGoals));
    if (storedAccounts) setAccounts(JSON.parse(storedAccounts));
    if (storedRecurring) setRecurring(JSON.parse(storedRecurring));
    
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (isLoaded) localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  }, [transactions, isLoaded]);

  useEffect(() => {
    if (isLoaded) localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  }, [categories, isLoaded]);

  useEffect(() => {
    if (isLoaded) localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
  }, [goals, isLoaded]);

  useEffect(() => {
    if (isLoaded) localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  }, [accounts, isLoaded]);

  useEffect(() => {
    if (isLoaded) localStorage.setItem(RECURRING_KEY, JSON.stringify(recurring));
  }, [recurring, isLoaded]);

  // Process recurring transactions
  useEffect(() => {
    if (!isLoaded) return;

    const today = new Date().toISOString().split('T')[0];
    
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
        setRecurring(prev =>
          prev.map(r => r.id === rec.id ? { ...r, lastGenerated: today } : r)
        );
      }
    });
  }, [isLoaded, recurring]);

  const addTransaction = useCallback((transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, []);

  const updateTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    setTransactions(prev =>
      prev.map(t => (t.id === id ? { ...t, ...updates } : t))
    );
  }, []);

  // Goals
  const addGoal = useCallback((goal: Omit<Goal, 'id' | 'createdAt' | 'currentAmount'>) => {
    const newGoal: Goal = {
      ...goal,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      currentAmount: 0,
    };
    setGoals(prev => [...prev, newGoal]);
  }, []);

  const updateGoal = useCallback((id: string, updates: Partial<Goal>) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
  }, []);

  const deleteGoal = useCallback((id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  }, []);

  const contributeToGoal = useCallback((goalId: string, amount: number) => {
    setGoals(prev =>
      prev.map(g =>
        g.id === goalId
          ? { ...g, currentAmount: Math.min(g.currentAmount + amount, g.targetAmount) }
          : g
      )
    );
  }, []);

  // Accounts
  const addAccount = useCallback((account: Omit<Account, 'id'>) => {
    const newAccount: Account = { ...account, id: crypto.randomUUID() };
    setAccounts(prev => [...prev, newAccount]);
  }, []);

  const updateAccount = useCallback((id: string, updates: Partial<Account>) => {
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  }, []);

  const deleteAccount = useCallback((id: string) => {
    setAccounts(prev => prev.filter(a => a.id !== id));
  }, []);

  // Recurring
  const addRecurring = useCallback((rec: Omit<RecurringTransaction, 'id'>) => {
    const newRecurring: RecurringTransaction = { ...rec, id: crypto.randomUUID() };
    setRecurring(prev => [...prev, newRecurring]);
  }, []);

  const updateRecurring = useCallback((id: string, updates: Partial<RecurringTransaction>) => {
    setRecurring(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  }, []);

  const deleteRecurring = useCallback((id: string) => {
    setRecurring(prev => prev.filter(r => r.id !== id));
  }, []);

  const getSummary = useCallback((): FinancialSummary => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = transactions
      .filter(t => t.type === 'expense')
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

    transactions.forEach(transaction => {
      const month = transaction.date.substring(0, 7);
      const current = monthlyMap.get(month) || { income: 0, expense: 0 };
      
      if (transaction.type === 'income') {
        current.income += transaction.amount;
      } else {
        current.expense += transaction.amount;
      }
      
      monthlyMap.set(month, current);
    });

    return Array.from(monthlyMap.entries())
      .map(([month, data]) => ({
        month,
        income: data.income,
        expense: data.expense,
        balance: data.income - data.expense,
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12);
  }, [transactions]);

  const getCategoryData = useCallback((type: 'income' | 'expense') => {
    const categoryMap = new Map<string, number>();

    transactions
      .filter(t => t.type === type)
      .forEach(transaction => {
        const current = categoryMap.get(transaction.category) || 0;
        categoryMap.set(transaction.category, current + transaction.amount);
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
      .filter(t => t.accountId === accountId || (!t.accountId && accountId === '1'))
      .reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);
  }, [transactions]);

  return {
    transactions,
    categories,
    goals,
    accounts,
    recurring,
    isLoaded,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    addGoal,
    updateGoal,
    deleteGoal,
    contributeToGoal,
    addAccount,
    updateAccount,
    deleteAccount,
    addRecurring,
    updateRecurring,
    deleteRecurring,
    getSummary,
    getMonthlyData,
    getCategoryData,
    getTransactionsByMonth,
    getAccountBalance,
  };
}
