import { useState, useMemo, useEffect } from 'react';
import { useFinance } from './hooks/useFinance';
import { useToast } from './hooks/useToast';
import { useTheme } from './hooks/useTheme';
import { useSyncWhenOnline } from './hooks/usePWA';
import { Sidebar, type Tab } from './components/Sidebar';
import { ConfirmModal } from './components/ConfirmModal';
import { ToastContainer } from './components/Toast';
import { DataExport } from './components/DataExport';
import { ThemeToggle } from './components/ThemeToggle';
import { PWAInstallPrompt, OfflineIndicator, UpdatePrompt } from './components/PWAStatus';
import { DashboardPage } from './pages/DashboardPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { AccountsPage } from './pages/AccountsPage';
import { GoalsPage } from './pages/GoalsPage';
import { RecurringPage } from './pages/RecurringPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import type { Transaction } from './types/finance';

function App() {
  const {
    transactions,
    categories,
    goals,
    accounts,
    recurring,
    isLoaded,
    addTransaction,
    deleteTransaction,
    addGoal,
    updateGoal,
    deleteGoal,
    contributeToGoal,
    addAccount,
    deleteAccount,
    addRecurring,
    updateRecurring,
    deleteRecurring,
    getSummary,
    getMonthlyData,
    getCategoryData,
    getAccountBalance,
  } = useFinance();

  const { toasts, addToast, removeToast } = useToast();
  
  // Enable sync when back online
  useSyncWhenOnline();
  const { isDark, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

  // Update filtered transactions when transactions change
  useEffect(() => {
    if (isLoaded) {
      setFilteredTransactions(transactions);
    }
  }, [transactions, isLoaded]);

  const summary = useMemo(() => isLoaded ? getSummary() : { totalIncome: 0, totalExpense: 0, balance: 0, transactionsCount: 0 }, [isLoaded, getSummary]);
  const monthlyData = useMemo(() => isLoaded ? getMonthlyData() : [], [isLoaded, getMonthlyData]);
  const categoryData = useMemo(() => ({
    income: isLoaded ? getCategoryData('income') : [],
    expense: isLoaded ? getCategoryData('expense') : [],
  }), [isLoaded, getCategoryData]);

  const accountBalances = useMemo(() => {
    if (!isLoaded) return {};
    const balances: Record<string, number> = {};
    accounts.forEach(acc => {
      balances[acc.id] = getAccountBalance(acc.id);
    });
    return balances;
  }, [isLoaded, accounts, getAccountBalance]);

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
    addToast(
      `${data.type === 'income' ? 'Receita' : 'Despesa'} adicionada com sucesso!`,
      'success'
    );
  };

  const handleDeleteClick = (id: string) => {
    setTransactionToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (transactionToDelete) {
      deleteTransaction(transactionToDelete);
      addToast('Transação excluída com sucesso!', 'success');
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
    addToast('Meta excluída!', 'success');
  };

  const handleContributeToGoal = (goalId: string, amount: number) => {
    contributeToGoal(goalId, amount);
    addToast(`Contribuição de R$ ${amount.toFixed(2)} adicionada!`, 'success');
  };

  const handleAddAccount = (account: Parameters<typeof addAccount>[0]) => {
    addAccount(account);
    addToast('Conta criada com sucesso!', 'success');
  };

  const handleDeleteAccount = (id: string) => {
    deleteAccount(id);
    addToast('Conta excluída!', 'success');
    if (selectedAccount === id) {
      setSelectedAccount(null);
    }
  };

  const handleAddRecurring = (rec: Parameters<typeof addRecurring>[0]) => {
    addRecurring(rec);
    addToast('Transação recorrente criada!', 'success');
  };

  const handleDeleteRecurring = (id: string) => {
    deleteRecurring(id);
    addToast('Recorrência excluída!', 'success');
  };

  const handleToggleRecurring = (id: string, isActive: boolean) => {
    updateRecurring(id, { isActive });
    addToast(isActive ? 'Recorrência ativada!' : 'Recorrência pausada!', 'success');
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
          />
        );
      case 'transactions':
        return (
          <TransactionsPage
            transactions={transactions}
            categories={categories}
            filteredTransactions={filteredTransactions}
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
        return (
          <AnalyticsPage
            transactions={transactions}
            goals={goals}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)' }}>
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Excluir Transação"
        message="Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita."
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setTransactionToDelete(null);
        }}
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
      />

      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="sticky top-0 z-30 backdrop-blur-md px-8 py-4" style={{ background: 'rgba(var(--bg-primary-rgb), 0.8)', borderBottom: '1px solid var(--border-color)' }}>
          <div className="flex items-center justify-between max-w-6xl">
            <div>
              <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {activeTab === 'dashboard' && 'Dashboard'}
                {activeTab === 'transactions' && 'Transações'}
                {activeTab === 'accounts' && 'Contas'}
                {activeTab === 'goals' && 'Metas Financeiras'}
                {activeTab === 'recurring' && 'Transações Recorrentes'}
                {activeTab === 'analytics' && 'Análises'}
              </h1>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {activeTab === 'dashboard' && 'Visão geral das suas finanças'}
                {activeTab === 'transactions' && 'Gerencie receitas e despesas'}
                {activeTab === 'accounts' && 'Contas e carteiras'}
                {activeTab === 'goals' && 'Defina e acompanhe objetivos'}
                {activeTab === 'recurring' && 'Automatize transações fixas'}
                {activeTab === 'analytics' && 'Gráficos e insights detalhados'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
              <DataExport transactions={transactions} onImport={(data) => {
                data.forEach(t => handleAddTransaction(t));
              }} />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8 w-full">
          {renderContent()}
        </div>
      </main>

      {/* PWA Components */}
      <OfflineIndicator />
      <PWAInstallPrompt />
      <UpdatePrompt />
    </div>
  );
}

export default App
