import { useState, useMemo, useEffect, useRef } from 'react';
import { useFinance } from './hooks/useFinance';
import { useToast } from './hooks/useToast';
import { useTheme } from './hooks/useTheme';
import { useSyncWhenOnline } from './hooks/usePWA';
import { useInstallments } from './hooks/useInstallments';
import { useAuth } from './hooks/useAuth';
import { Sidebar, type Tab } from './components/Sidebar';
import { ConfirmModal } from './components/ConfirmModal';
import { ToastContainer } from './components/Toast';
import { DataExport } from './components/DataExport';
import { ThemeToggle } from './components/ThemeToggle';
import { PWAInstallPrompt, OfflineIndicator, UpdatePrompt } from './components/PWAStatus';
import { PinLock } from './components/PinLock';
import type { AlertPreferencesState } from './components/AlertPreferences';
import { DashboardPage } from './pages/DashboardPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { AccountsPage } from './pages/AccountsPage';
import { GoalsPage } from './pages/GoalsPage';
import { RecurringPage } from './pages/RecurringPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { InstallmentsPage } from './pages/InstallmentsPage';
import { BudgetsPage } from './pages/BudgetsPage';
import type { Transaction } from './types/finance';
import type { AppBackupData, LegacyTransactionsBackupData } from './types/backup';
import { getCurrentMonthLocalISO, shiftMonthLocalISO } from './utils/date';

const ALERT_PREFERENCES_KEY = 'financas_alert_preferences';

const defaultAlertPreferences: AlertPreferencesState = {
  budgetThreshold: true,
  budgetExceeded: true,
  negativeBalance: true,
};

function App() {
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
  const [alertPreferences, setAlertPreferences] = useState<AlertPreferencesState>(() => {
    const stored = localStorage.getItem(ALERT_PREFERENCES_KEY);
    if (!stored) return defaultAlertPreferences;
    try {
      return { ...defaultAlertPreferences, ...JSON.parse(stored) };
    } catch {
      return defaultAlertPreferences;
    }
  });

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
        .filter((transaction) => transaction.date.startsWith(currentMonth) && !transaction.isTransfer)
        .reduce((sum, transaction) => sum + (transaction.type === 'income' ? transaction.amount : -transaction.amount), 0),
    [transactions, currentMonth]
  );
  const budgetAlertLevelRef = useRef<Record<string, 'none' | 'warning' | 'exceeded'>>({});
  const monthBalanceAlertedRef = useRef(false);

  const accountBalances = useMemo(() => {
    if (!isLoaded) return {};
    const balances: Record<string, number> = {};
    accounts.forEach((account) => {
      balances[account.id] = getAccountBalance(account.id);
    });
    return balances;
  }, [isLoaded, accounts, getAccountBalance]);

  const backupData = useMemo<AppBackupData>(
    () => ({
      version: '2.0',
      exportDate: new Date().toISOString(),
      finance: {
        transactions,
        categories,
        goals,
        accounts,
        recurring,
        budgets,
      },
      installments: {
        installments,
        payments,
      },
      preferences: {
        alertPreferences,
        theme: isDark ? 'dark' : 'light',
      },
    }),
    [
      transactions,
      categories,
      goals,
      accounts,
      recurring,
      budgets,
      installments,
      payments,
      alertPreferences,
      isDark,
    ]
  );

  useEffect(() => {
    localStorage.setItem(ALERT_PREFERENCES_KEY, JSON.stringify(alertPreferences));
  }, [alertPreferences]);

  useEffect(() => {
    if (!isLoaded) return;

    currentMonthBudgetStatus.forEach((item) => {
      const key = `${item.budget.month}:${item.budget.category}`;
      const currentLevel: 'none' | 'warning' | 'exceeded' = item.isExceeded
        ? 'exceeded'
        : item.percentage >= 80
        ? 'warning'
        : 'none';
      const previousLevel = budgetAlertLevelRef.current[key] ?? 'none';

      if (alertPreferences.budgetThreshold && currentLevel === 'warning' && previousLevel === 'none') {
        addToast(`Atencao: ${item.budget.category} atingiu ${item.percentage.toFixed(0)}% do orcamento.`, 'warning');
      }

      if (alertPreferences.budgetExceeded && currentLevel === 'exceeded' && previousLevel !== 'exceeded') {
        addToast(`Orcamento excedido em ${item.budget.category}.`, 'error');
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

    if (currentMonthBalance >= 0) {
      monthBalanceAlertedRef.current = false;
    }
  }, [isLoaded, currentMonthBalance, addToast, alertPreferences.negativeBalance]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-lg" style={{ color: 'var(--text-secondary)' }}>Carregando...</span>
        </div>
      </div>
    );
  }

  const handleAddTransaction = (data: Parameters<typeof addTransaction>[0]) => {
    addTransaction({ ...data, accountId: selectedAccount || undefined });
    addToast(`${data.type === 'income' ? 'Receita' : 'Despesa'} adicionada com sucesso!`, 'success');
  };

  const handleDeleteClick = (id: string) => {
    setTransactionToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (transactionToDelete) {
      deleteTransaction(transactionToDelete);
      addToast('Transacao excluida com sucesso!', 'success');
      setTransactionToDelete(null);
    }
    setDeleteModalOpen(false);
  };

  const handleAddGoal = (goal: Parameters<typeof addGoal>[0]) => {
    addGoal(goal);
    addToast('Meta criada com sucesso!', 'success');
  };

  const handleDeleteGoal = (id: string) => {
    deleteGoal(id);
    addToast('Meta excluida!', 'success');
  };

  const handleContributeToGoal = (goalId: string, amount: number) => {
    contributeToGoal(goalId, amount);
    addToast(`Contribuicao de R$ ${amount.toFixed(2)} adicionada!`, 'success');
  };

  const handleAddAccount = (account: Parameters<typeof addAccount>[0]) => {
    addAccount(account);
    addToast('Conta criada com sucesso!', 'success');
  };

  const handleDeleteAccount = (id: string) => {
    const fallbackAccount = accounts.find((account) => account.id !== id);

    if (!fallbackAccount) {
      addToast('Nao foi possivel excluir a ultima conta disponivel.', 'error');
      return;
    }

    reassignAccountReferences(id, fallbackAccount.id);
    reassignInstallmentAccountReferences(id, fallbackAccount.id);
    deleteAccount(id);
    addToast(`Conta excluida e lancamentos movidos para ${fallbackAccount.name}.`, 'success');

    if (selectedAccount === id) {
      setSelectedAccount(null);
    }
  };

  const handleAddRecurring = (recurringItem: Parameters<typeof addRecurring>[0]) => {
    addRecurring(recurringItem);
    addToast('Transacao recorrente criada!', 'success');
  };

  const handleDeleteRecurring = (id: string) => {
    deleteRecurring(id);
    addToast('Recorrencia excluida!', 'success');
  };

  const handleToggleRecurring = (id: string, isActive: boolean) => {
    updateRecurring(id, { isActive });
    addToast(isActive ? 'Recorrencia ativada!' : 'Recorrencia pausada!', 'success');
  };

  const handleTransferBetweenAccounts = (data: {
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    date?: string;
    description?: string;
  }) => {
    transferBetweenAccounts(data);
    addToast('Transferencia realizada com sucesso!', 'success');
  };

  const handleAddBudget = (budget: Parameters<typeof addBudget>[0]) => {
    addBudget(budget);
    addToast(`Limite para ${budget.category} salvo!`, 'success');
  };

  const handleDeleteBudget = (id: string) => {
    deleteBudget(id);
    addToast('Orcamento removido!', 'success');
  };

  const handleCopyFromPreviousMonth = () => {
    const sourceMonth = shiftMonthLocalISO(selectedBudgetMonth, -1);
    const sourceBudgets = budgets.filter((budget) => budget.month === sourceMonth);

    if (sourceBudgets.length === 0) {
      addToast('Nao ha orcamentos no mes anterior para copiar.', 'info');
      return;
    }

    sourceBudgets.forEach((budget) => {
      addBudget({
        category: budget.category,
        amount: budget.amount,
        month: selectedBudgetMonth,
      });
    });

    addToast(`${sourceBudgets.length} limite(s) copiados para ${selectedBudgetMonth}.`, 'success');
  };

  const handleImportData = (data: AppBackupData | LegacyTransactionsBackupData) => {
    if ('finance' in data) {
      replaceFinanceData(data.finance);
      replaceInstallmentsData(data.installments);
      setAlertPreferences({
        ...defaultAlertPreferences,
        ...data.preferences.alertPreferences,
      });
      setTheme(data.preferences.theme);
      setSelectedAccount(null);
      addToast('Backup completo restaurado com sucesso!', 'success');
      return;
    }

    replaceFinanceData({
      transactions: data.transactions,
      categories,
      goals,
      accounts,
      recurring,
      budgets,
    });
    setSelectedAccount(null);
    addToast('Backup legado restaurado: apenas transacoes foram importadas.', 'warning');
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
            onAlertPreferencesChange={(updates) => {
              setAlertPreferences((prev) => ({ ...prev, ...updates }));
            }}
          />
        );
      case 'transactions':
        return (
          <TransactionsPage
            transactions={transactions}
            categories={categories}
            filteredTransactions={filteredTransactions ?? transactions}
            onFilterChange={setFilteredTransactions}
            onAddTransaction={handleAddTransaction}
            onDeleteTransaction={handleDeleteClick}
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
      case 'budgets':
        return (
          <BudgetsPage
            categories={categories}
            budgets={budgets.filter((budget) => budget.month === selectedBudgetMonth)}
            budgetStatus={selectedMonthBudgetStatus}
            selectedMonth={selectedBudgetMonth}
            canCopyFromPreviousMonth={budgets.some((budget) => budget.month === shiftMonthLocalISO(selectedBudgetMonth, -1))}
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
      case 'analytics':
        return <AnalyticsPage transactions={transactions} goals={goals} />;
      default:
        return null;
    }
  };

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

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)' }}>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Excluir Transacao"
        message="Tem certeza que deseja excluir esta transacao? Esta acao nao pode ser desfeita."
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setTransactionToDelete(null);
        }}
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
      />

      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 overflow-auto">
        <header className="sticky top-0 z-30 backdrop-blur-md px-8 py-4" style={{ background: 'rgba(var(--bg-primary-rgb), 0.8)', borderBottom: '1px solid var(--border-color)' }}>
          <div className="flex items-center justify-between max-w-6xl">
            <div>
              <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {activeTab === 'dashboard' && 'Dashboard'}
                {activeTab === 'transactions' && 'Transacoes'}
                {activeTab === 'accounts' && 'Contas'}
                {activeTab === 'budgets' && 'Orcamentos'}
                {activeTab === 'installments' && 'Parcelamentos'}
                {activeTab === 'goals' && 'Metas Financeiras'}
                {activeTab === 'recurring' && 'Transacoes Recorrentes'}
                {activeTab === 'analytics' && 'Analises'}
              </h1>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {activeTab === 'dashboard' && 'Visao geral das suas financas'}
                {activeTab === 'transactions' && 'Gerencie receitas e despesas'}
                {activeTab === 'accounts' && 'Contas e carteiras'}
                {activeTab === 'budgets' && 'Limites mensais por categoria'}
                {activeTab === 'installments' && 'Controle suas compras parceladas'}
                {activeTab === 'goals' && 'Defina e acompanhe objetivos'}
                {activeTab === 'recurring' && 'Automatize transacoes fixas'}
                {activeTab === 'analytics' && 'Graficos e insights detalhados'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
              <DataExport
                transactions={transactions}
                backupData={backupData}
                onImport={handleImportData}
              />
              {hasPin && (
                <button
                  onClick={logout}
                  className="px-3 py-2 rounded-xl text-sm font-medium transition-colors hover:bg-red-500/20 hover:text-red-400"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Bloquear
                </button>
              )}
            </div>
          </div>
        </header>

        <div className="p-8 w-full">
          {renderContent()}
        </div>
      </main>

      <OfflineIndicator />
      <PWAInstallPrompt />
      <UpdatePrompt />
    </div>
  );
}

export default App
