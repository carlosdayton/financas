
import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Search, Bell, Sparkles } from 'lucide-react';
import { useFinance } from './hooks/useFinance';
import { useToast } from './hooks/useToast';
import { useTheme } from './hooks/useTheme';
import { useSyncWhenOnline } from './hooks/usePWA';
import { useInstallments } from './hooks/useInstallments';
import { useAuth } from './hooks/useAuth';
import { PrivacyProvider } from './contexts/PrivacyContext';
import { Sidebar, type Tab } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { ConfirmModal } from './components/ConfirmModal';
import { ToastContainer } from './components/Toast';
import { DataExport } from './components/DataExport';
import { ThemeToggle } from './components/ThemeToggle';
import { PrivacyToggle } from './components/PrivacyToggle';
import { PWAInstallPrompt, OfflineIndicator, UpdatePrompt } from './components/PWAStatus';
import { PinLock } from './components/PinLock';
import { AlertPreferences, type AlertPreferencesState } from './components/AlertPreferences';
import { CommandPalette } from './components/CommandPalette';
import { QuickAddAIModal } from './components/QuickAddAIModal';
import { DashboardPage } from './pages/DashboardPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { AccountsPage } from './pages/AccountsPage';
import { GoalsPage } from './pages/GoalsPage';
import { RecurringPage } from './pages/RecurringPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { InstallmentsPage } from './pages/InstallmentsPage';
import { BudgetsPage } from './pages/BudgetsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { CreditCardPage } from './pages/CreditCardPage';
import type { Transaction } from './types/finance';
import type { AppBackupData, LegacyTransactionsBackupData } from './types/backup';
import { getCurrentMonthLocalISO, shiftMonthLocalISO } from './utils/date';

const ALERT_PREFERENCES_KEY = 'financas_alert_preferences';

const defaultAlertPreferences: AlertPreferencesState = {
  budgetThreshold: true,
  budgetExceeded: true,
  negativeBalance: true,
};

function AppInner() {
  const {
    transactions,
    categories,
    goals,
    accounts,
    recurring,
    budgets,
    isLoaded,
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
    deleteAccount,
    reassignAccountReferences,
    addRecurring,
    updateRecurring,
    deleteRecurring,
    transferBetweenAccounts,
    addBudget,
    deleteBudget,
    getSummary,
    getMonthlyData,
    getCategoryData,
    getAccountBalance,
    getBudgetStatus,
    replaceAllData: replaceFinanceData,
  } = useFinance();

  const { toasts, addToast, removeToast } = useToast();
  useSyncWhenOnline();

  const {
    installments,
    payments,
    addInstallment,
    payInstallment,
    deleteInstallment,
    getInstallmentPayments,
    reassignAccountReferences: reassignInstallmentAccountReferences,
    replaceAllData: replaceInstallmentsData,
  } = useInstallments();

  const {
    isAuthenticated,
    hasPin,
    isLocked,
    failedAttempts,
    setupPin,
    verifyPin,
    logout,
    getLockoutRemaining,
  } = useAuth();

  const { isDark, toggleTheme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[] | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [alertPreferencesOpen, setAlertPreferencesOpen] = useState(false);
  const [quickAddAIOpen, setQuickAddAIOpen] = useState(false);
  const [alertPreferences, setAlertPreferences] = useState<AlertPreferencesState>(() => {
    const stored = localStorage.getItem(ALERT_PREFERENCES_KEY);
    if (!stored) return defaultAlertPreferences;
    try {
      return { ...defaultAlertPreferences, ...JSON.parse(stored) };
    } catch {
      return defaultAlertPreferences;
    }
  });

  // ââ€â‚¬ââ€â‚¬ Derived data ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬
  const summary = useMemo(
    () => (isLoaded ? getSummary() : { totalIncome: 0, totalExpense: 0, balance: 0, transactionsCount: 0 }),
    [isLoaded, getSummary]
  );
  const monthlyData = useMemo(() => (isLoaded ? getMonthlyData() : []), [isLoaded, getMonthlyData]);
  const categoryData = useMemo(
    () => ({
      income: isLoaded ? getCategoryData('income') : [],
      expense: isLoaded ? getCategoryData('expense') : [],
    }),
    [isLoaded, getCategoryData]
  );
  const currentMonth = useMemo(() => getCurrentMonthLocalISO(), []);
  const [selectedBudgetMonth, setSelectedBudgetMonth] = useState(currentMonth);

  const currentMonthBudgetStatus = useMemo(
    () => (isLoaded ? getBudgetStatus(currentMonth) : []),
    [isLoaded, getBudgetStatus, currentMonth]
  );
  const selectedMonthBudgetStatus = useMemo(
    () => (isLoaded ? getBudgetStatus(selectedBudgetMonth) : []),
    [isLoaded, getBudgetStatus, selectedBudgetMonth]
  );
  const currentMonthBalance = useMemo(
    () =>
      transactions
        .filter((t) => t.date.startsWith(currentMonth) && !t.isTransfer)
        .reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0),
    [transactions, currentMonth]
  );

  const accountBalances = useMemo(() => {
    if (!isLoaded) return {};
    const balances: Record<string, number> = {};
    accounts.forEach((account) => {
      balances[account.id] = getAccountBalance(account.id);
    });
    return balances;
  }, [isLoaded, accounts, getAccountBalance]);

  // Sidebar alert counts
  const sidebarAlerts = useMemo(() => {
    const exceededBudgets = currentMonthBudgetStatus.filter((b) => b.isExceeded).length;
    const creditAccounts = accounts.filter((a) => a.type === 'credit');
    const unpaidInvoices = creditAccounts.filter((acc) => {
      const monthExpenses = transactions.filter(
        (t) => t.accountId === acc.id && t.type === 'expense' && !t.isTransfer && t.date.startsWith(currentMonth)
      );
      const isPaid = transactions.some(
        (t) => t.accountId === acc.id && t.type === 'income' && t.isTransfer && t.date.startsWith(currentMonth) && t.category === 'Fatura Cartão'
      );
      return monthExpenses.length > 0 && !isPaid;
    }).length;

    return { budgets: exceededBudgets, creditcard: unpaidInvoices };
  }, [currentMonthBudgetStatus, accounts, transactions, currentMonth]);

  const backupData = useMemo<AppBackupData>(
    () => ({
      version: '2.0',
      exportDate: new Date().toISOString(),
      finance: { transactions, categories, goals, accounts, recurring, budgets },
      installments: { installments, payments },
      preferences: { alertPreferences, theme: isDark ? 'dark' : 'light' },
    }),
    [transactions, categories, goals, accounts, recurring, budgets, installments, payments, alertPreferences, isDark]
  );

  // ââ€â‚¬ââ€â‚¬ Side effects ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬
  useEffect(() => {
    localStorage.setItem(ALERT_PREFERENCES_KEY, JSON.stringify(alertPreferences));
  }, [alertPreferences]);

  const budgetAlertLevelRef = useRef<Record<string, 'none' | 'warning' | 'exceeded'>>({});
  const monthBalanceAlertedRef = useRef(false);

  useEffect(() => {
    if (!isLoaded) return;
    currentMonthBudgetStatus.forEach((item) => {
      const key = `${item.budget.month}:${item.budget.category}`;
      const currentLevel: 'none' | 'warning' | 'exceeded' = item.isExceeded ? 'exceeded' : item.percentage >= 80 ? 'warning' : 'none';
      const previousLevel = budgetAlertLevelRef.current[key] ?? 'none';
      if (alertPreferences.budgetThreshold && currentLevel === 'warning' && previousLevel === 'none') {
        addToast(`Atenção: ${item.budget.category} atingiu ${item.percentage.toFixed(0)}% do orçamento.`, 'warning');
      }
      if (alertPreferences.budgetExceeded && currentLevel === 'exceeded' && previousLevel !== 'exceeded') {
        addToast(`Orçamento excedido em ${item.budget.category}.`, 'error');
      }
      budgetAlertLevelRef.current[key] = currentLevel;
    });
  }, [isLoaded, currentMonthBudgetStatus, addToast, alertPreferences.budgetExceeded, alertPreferences.budgetThreshold]);

  useEffect(() => {
    if (!isLoaded) return;
    if (alertPreferences.negativeBalance && currentMonthBalance < 0 && !monthBalanceAlertedRef.current) {
      addToast('Alerta: saldo mensal ficou negativo.', 'error');
      monthBalanceAlertedRef.current = true;
      return;
    }
    if (currentMonthBalance >= 0) monthBalanceAlertedRef.current = false;
  }, [isLoaded, currentMonthBalance, addToast, alertPreferences.negativeBalance]);

  // ââ€â‚¬ââ€â‚¬ Ctrl+N global shortcut ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(o => !o);
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        setActiveTab('transactions');
        setTimeout(() => {
          const firstInput = document.querySelector<HTMLInputElement>('input[placeholder*="Mercado"]');
          firstInput?.focus();
        }, 100);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // ââ€â‚¬ââ€â‚¬ Handlers ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬
  const handleAddTransaction = useCallback((data: Parameters<typeof addTransaction>[0]) => {
    addTransaction({ ...data, accountId: selectedAccount || undefined });
    addToast(`${data.type === 'income' ? 'Receita' : 'Despesa'} adicionada!`, 'success');
  }, [addTransaction, selectedAccount, addToast]);

  const handleEditTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    updateTransaction(id, updates);
    addToast('Transação atualizada!', 'success');
  }, [updateTransaction, addToast]);

  const handleDeleteClick = useCallback((id: string) => {
    setTransactionToDelete(id);
    setDeleteModalOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (transactionToDelete) {
      deleteTransaction(transactionToDelete);
      addToast('Transação excluída!', 'success');
      setTransactionToDelete(null);
    }
    setDeleteModalOpen(false);
  }, [transactionToDelete, deleteTransaction, addToast]);

  const handleAddGoal = useCallback((goal: Parameters<typeof addGoal>[0]) => {
    addGoal(goal);
    addToast('Meta criada!', 'success');
  }, [addGoal, addToast]);

  const handleDeleteGoal = useCallback((id: string) => {
    deleteGoal(id);
    addToast('Meta excluída!', 'success');
  }, [deleteGoal, addToast]);

  const handleContributeToGoal = useCallback((goalId: string, amount: number) => {
    contributeToGoal(goalId, amount);
    addToast(`Contribuição de R$ ${amount.toFixed(2)} adicionada!`, 'success');
  }, [contributeToGoal, addToast]);

  const handleAddAccount = useCallback((account: Parameters<typeof addAccount>[0]) => {
    addAccount(account);
    addToast('Conta criada!', 'success');
  }, [addAccount, addToast]);

  const handleDeleteAccount = useCallback((id: string) => {
    const fallbackAccount = accounts.find((a) => a.id !== id);
    if (!fallbackAccount) {
      addToast('Não é possível excluir a última conta.', 'error');
      return;
    }
    reassignAccountReferences(id, fallbackAccount.id);
    reassignInstallmentAccountReferences(id, fallbackAccount.id);
    deleteAccount(id);
    addToast(`Conta excluída. Lançamentos movidos para ${fallbackAccount.name}.`, 'success');
    if (selectedAccount === id) setSelectedAccount(null);
  }, [accounts, reassignAccountReferences, reassignInstallmentAccountReferences, deleteAccount, addToast, selectedAccount]);

  const handleAddRecurring = useCallback((r: Parameters<typeof addRecurring>[0]) => {
    addRecurring(r);
    addToast('Transação recorrente criada!', 'success');
  }, [addRecurring, addToast]);

  const handleDeleteRecurring = useCallback((id: string) => {
    deleteRecurring(id);
    addToast('Recorrência excluída!', 'success');
  }, [deleteRecurring, addToast]);

  const handleToggleRecurring = useCallback((id: string, isActive: boolean) => {
    updateRecurring(id, { isActive });
    addToast(isActive ? 'Recorrência ativada!' : 'Recorrência pausada!', 'success');
  }, [updateRecurring, addToast]);

  const handleTransferBetweenAccounts = useCallback((data: {
    fromAccountId: string; toAccountId: string; amount: number; date?: string; description?: string;
  }) => {
    transferBetweenAccounts(data);
    addToast('Transferência realizada!', 'success');
  }, [transferBetweenAccounts, addToast]);

  const handleAddBudget = useCallback((budget: Parameters<typeof addBudget>[0]) => {
    addBudget(budget);
    addToast(`Limite para ${budget.category} salvo!`, 'success');
  }, [addBudget, addToast]);

  const handleDeleteBudget = useCallback((id: string) => {
    deleteBudget(id);
    addToast('Orçamento removido!', 'success');
  }, [deleteBudget, addToast]);

  const handleCopyFromPreviousMonth = useCallback(() => {
    const sourceMonth = shiftMonthLocalISO(selectedBudgetMonth, -1);
    const sourceBudgets = budgets.filter((b) => b.month === sourceMonth);
    if (sourceBudgets.length === 0) {
      addToast('Não há orçamentos no mês anterior para copiar.', 'info');
      return;
    }
    sourceBudgets.forEach((b) => addBudget({ category: b.category, amount: b.amount, month: selectedBudgetMonth }));
    addToast(`${sourceBudgets.length} limite(s) copiados!`, 'success');
  }, [selectedBudgetMonth, budgets, addBudget, addToast]);

  const handlePayCreditInvoice = useCallback((data: {
    accountId: string; month: string; amount: number; paymentAccountId: string; paymentDate: string;
  }) => {
    transferBetweenAccounts({
      fromAccountId: data.paymentAccountId,
      toAccountId: data.accountId,
      amount: data.amount,
      date: data.paymentDate,
      description: `Fatura ${data.month}`,
    });
    addToast(`Fatura de ${data.month} paga! R$ ${data.amount.toFixed(2)}`, 'success');
  }, [transferBetweenAccounts, addToast]);

  const handleImportData = useCallback((data: AppBackupData | LegacyTransactionsBackupData) => {
    if ('finance' in data) {
      replaceFinanceData(data.finance);
      replaceInstallmentsData(data.installments);
      setAlertPreferences({ ...defaultAlertPreferences, ...data.preferences.alertPreferences });
      setTheme(data.preferences.theme);
      setSelectedAccount(null);
      addToast('Backup completo restaurado!', 'success');
      return;
    }
    replaceFinanceData({ transactions: data.transactions, categories, goals, accounts, recurring, budgets });
    setSelectedAccount(null);
    addToast('Backup legado restaurado: apenas transações importadas.', 'warning');
  }, [replaceFinanceData, replaceInstallmentsData, setTheme, addToast, categories, goals, accounts, recurring, budgets]);

  // ââ€â‚¬ââ€â‚¬ Render ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬
  if (!isLoaded) {
    return (
      <div className="app-shell min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="relative flex flex-col items-center gap-4 z-10 glass p-8 rounded-2xl">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-[var(--bg-tertiary)] rounded-2xl" />
            <div className="w-12 h-12 border-4 border-[var(--accent-primary)] border-t-transparent rounded-2xl animate-spin absolute top-0 left-0" />
          </div>
          <span className="text-sm font-medium tracking-wide" style={{ color: 'var(--text-secondary)' }}>Iniciando...</span>
        </div>
      </div>
    );
  }

  if (hasPin && !isAuthenticated) {
    return (
      <PinLock
        isLocked={isLocked}
        hasPin={hasPin}
        failedAttempts={failedAttempts}
        onSetupPin={setupPin}
        onVerifyPin={verifyPin}
        getLockoutRemaining={getLockoutRemaining}
      />
    );
  }

  const PAGE_TITLES: Record<Tab, { title: string; subtitle: string }> = {
    dashboard: { title: 'Dashboard', subtitle: 'Visão geral das suas finanças' },
    transactions: { title: 'Transações', subtitle: 'Gerencie receitas e despesas — Ctrl+N para nova transação' },
    accounts: { title: 'Contas', subtitle: 'Contas e carteiras' },
    creditcard: { title: 'Cartão de Crédito', subtitle: 'Controle de faturas mensais' },
    budgets: { title: 'Orçamentos', subtitle: 'Limites mensais por categoria' },
    installments: { title: 'Parcelamentos', subtitle: 'Controle suas compras parceladas' },
    goals: { title: 'Metas Financeiras', subtitle: 'Defina e acompanhe objetivos' },
    recurring: { title: 'Transações Recorrentes', subtitle: 'Automatize transações fixas' },
    categories: { title: 'Categorias', subtitle: 'Gerencie suas categorias' },
    analytics: { title: 'Análises', subtitle: 'Gráficos e insights detalhados' },
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardPage
            summary={summary}
            monthlyData={monthlyData}
            categoryData={categoryData}
            goals={goals}
            transactions={transactions}
            budgetStatus={currentMonthBudgetStatus}
            alertPreferences={alertPreferences}
            onAlertPreferencesChange={(updates) => setAlertPreferences((prev) => ({ ...prev, ...updates }))}
            accounts={accounts}
            accountBalances={accountBalances}
          />
        );
      case 'transactions':
        return (
          <TransactionsPage
            transactions={transactions}
            categories={categories}
            accounts={accounts}
            filteredTransactions={filteredTransactions ?? transactions}
            onFilterChange={setFilteredTransactions}
            onAddTransaction={handleAddTransaction}
            onDeleteTransaction={handleDeleteClick}
            onEditTransaction={handleEditTransaction}
            onAddInstallment={addInstallment}
          />
        );
      case 'accounts':
        return (
          <AccountsPage
            accounts={accounts}
            accountBalances={accountBalances}
            selectedAccount={selectedAccount}
            onAddAccount={handleAddAccount}
            onDeleteAccount={handleDeleteAccount}
            onSelectAccount={setSelectedAccount}
            onTransferBetweenAccounts={handleTransferBetweenAccounts}
          />
        );
      case 'creditcard':
        return (
          <CreditCardPage
            accounts={accounts}
            transactions={transactions}
            onPayInvoice={handlePayCreditInvoice}
          />
        );
      case 'budgets':
        return (
          <BudgetsPage
            categories={categories}
            budgets={budgets.filter((b) => b.month === selectedBudgetMonth)}
            budgetStatus={selectedMonthBudgetStatus}
            selectedMonth={selectedBudgetMonth}
            canCopyFromPreviousMonth={budgets.some((b) => b.month === shiftMonthLocalISO(selectedBudgetMonth, -1))}
            onAddBudget={handleAddBudget}
            onDeleteBudget={handleDeleteBudget}
            onMonthChange={setSelectedBudgetMonth}
            onCopyFromPreviousMonth={handleCopyFromPreviousMonth}
          />
        );
      case 'goals':
        return (
          <GoalsPage
            goals={goals}
            onAddGoal={handleAddGoal}
            onUpdateGoal={updateGoal}
            onDeleteGoal={handleDeleteGoal}
            onContribute={handleContributeToGoal}
          />
        );
      case 'installments':
        return (
          <InstallmentsPage
            installments={installments}
            onAddInstallment={addInstallment}
            onPayInstallment={payInstallment}
            onDeleteInstallment={deleteInstallment}
            getInstallmentPayments={getInstallmentPayments}
          />
        );
      case 'recurring':
        return (
          <RecurringPage
            recurring={recurring}
            categories={categories}
            accounts={accounts}
            onAddRecurring={handleAddRecurring}
            onDeleteRecurring={handleDeleteRecurring}
            onToggleRecurring={handleToggleRecurring}
          />
        );
      case 'categories':
        return (
          <CategoriesPage
            categories={categories}
            onAddCategory={addCategory}
            onUpdateCategory={updateCategory}
            onDeleteCategory={deleteCategory}
          />
        );
      case 'analytics':
        return (
          <AnalyticsPage
            transactions={transactions}
            goals={goals}
            recurring={recurring}
            installments={installments}
            payments={payments}
            accountBalances={accountBalances}
          />
        );
      default:
        return null;
    }
  };

  const { title, subtitle } = PAGE_TITLES[activeTab] ?? { title: '', subtitle: '' };

  return (
    <div className="app-shell min-h-screen flex flex-col md:flex-row">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Excluir Transação"
        message="Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita."
        onConfirm={handleConfirmDelete}
        onCancel={() => { setDeleteModalOpen(false); setTransactionToDelete(null); }}
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
      />

      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} alerts={sidebarAlerts} />

      <main className="flex-1 min-w-0 overflow-auto relative">
        <header
          className="sticky top-0 z-30 px-4 py-3 md:px-8 md:py-4 transition-all duration-300"
          style={{ 
            background: 'rgba(var(--bg-primary-rgb), 0.82)', 
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderBottom: '1px solid var(--border-color)' 
          }}
        >
          <div className="flex items-center justify-between gap-3 animate-fade-in-up">
            <div className="min-w-0 flex-1 flex items-center gap-4">
              <div>
                <h1 className="text-xl md:text-2xl font-display font-bold tracking-tight truncate" style={{ color: 'var(--text-primary)' }}>{title}</h1>
                <p className="text-xs font-medium hidden sm:block mt-0.5" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>
              </div>

              {/* Quick Command Palette Search Trigger */}
              <button
                onClick={() => setCommandPaletteOpen(true)}
                className="hidden md:flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-emerald-500/30 transition-all duration-200 shadow-sm min-w-[240px]"
              >
                <Search className="w-4 h-4 text-emerald-400" />
                <span className="flex-1 text-left">Buscar ou comando...</span>
                <kbd className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-secondary)]">
                  Ctrl K
                </kbd>
              </button>
            </div>

            <div className="flex items-center gap-1.5 md:gap-2.5 flex-shrink-0">
              {/* Quick Add AI Trigger Button */}
              <button
                onClick={() => setQuickAddAIOpen(true)}
                title="Lançamento Rápido com IA"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all duration-200 shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">Entrada IA</span>
              </button>

              {/* Alert preferences modal trigger */}
              <button
                onClick={() => setAlertPreferencesOpen(true)}
                title="Configurações de Alertas"
                className="p-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-emerald-400 hover:border-emerald-500/30 transition-all duration-200"
              >
                <Bell className="w-4.5 h-4.5" />
              </button>

              <PrivacyToggle />
              <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
              <DataExport
                transactions={transactions}
                accounts={accounts}
                backupData={backupData}
                onImport={handleImportData}
              />
              {hasPin && (
                <button
                  onClick={logout}
                  className="hidden sm:inline-flex px-3.5 py-2 rounded-xl text-xs font-semibold border border-rose-500/20 text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 transition-all duration-200"
                >
                  Bloquear
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Quick Add AI Modal */}
        <QuickAddAIModal
          isOpen={quickAddAIOpen}
          onClose={() => setQuickAddAIOpen(false)}
          categories={categories}
          accounts={accounts}
          onConfirm={(data) => {
            if (data.isInstallment && data.totalInstallments && data.totalInstallments > 1) {
              addInstallment({
                description: data.description,
                totalAmount: data.amount,
                installmentAmount: data.installmentAmount || data.amount / data.totalInstallments,
                totalInstallments: data.totalInstallments,
                startDate: data.date,
                category: data.category,
                isActive: true,
              });
              addToast(
                `Compra parcelada de ${data.totalInstallments}x de R$ ${(
                  data.installmentAmount || data.amount / data.totalInstallments
                ).toFixed(2)} cadastrada!`,
                'success'
              );
            } else {
              handleAddTransaction(data);
            }
          }}
        />

        {/* Alert preferences modal */}
        <AlertPreferences
          isOpen={alertPreferencesOpen}
          onClose={() => setAlertPreferencesOpen(false)}
          preferences={alertPreferences}
          onChange={(updates) => setAlertPreferences((prev) => ({ ...prev, ...updates }))}
        />

        <div className="p-3 pb-24 md:p-8 md:pb-8 w-full max-w-[1600px] mx-auto animate-fade-in-up delay-100">
          {renderContent()}
        </div>
      </main>

      <CommandPalette
        isOpen={commandPaletteOpen}
        transactions={transactions}
        accounts={accounts}
        goals={goals}
        onNavigate={(tab) => { setActiveTab(tab); setCommandPaletteOpen(false); }}
        onClose={() => setCommandPaletteOpen(false)}
      />
      <MobileNav activeTab={activeTab} onTabChange={setActiveTab} alerts={sidebarAlerts} />
      <OfflineIndicator />
      <PWAInstallPrompt />
      <UpdatePrompt />
    </div>
  );
}

function App() {
  return (
    <PrivacyProvider>
      <AppInner />
    </PrivacyProvider>
  );
}

export default App;

