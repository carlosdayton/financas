import { useState } from 'react';
import { Plus, X, Receipt, Sparkles } from 'lucide-react';
import { TransactionForm } from '../components/TransactionForm';
import { TransactionList } from '../components/TransactionList';
import { Filters } from '../components/Filters';
import { EditTransactionModal } from '../components/EditTransactionModal';
import { QuickAddAIModal } from '../components/QuickAddAIModal';
import type { Transaction, Category, Account, Installment } from '../types/finance';
import { usePrivacy } from '../contexts/PrivacyContext';

interface TransactionsPageProps {
  transactions: Transaction[];
  categories: Category[];
  accounts?: Account[];
  filteredTransactions: Transaction[];
  onFilterChange: (filtered: Transaction[]) => void;
  onAddTransaction: (data: Omit<Transaction, 'id' | 'createdAt'>) => void;
  onDeleteTransaction: (id: string) => void;
  onEditTransaction: (id: string, updates: Partial<Transaction>) => void;
  onAddInstallment?: (data: Omit<Installment, 'id' | 'createdAt' | 'paidInstallments'>) => void;
}

export function TransactionsPage({
  transactions,
  categories,
  accounts = [],
  filteredTransactions,
  onFilterChange,
  onAddTransaction,
  onDeleteTransaction,
  onEditTransaction,
  onAddInstallment,
}: TransactionsPageProps) {
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const { mask } = usePrivacy();

  const totalFiltered = filteredTransactions.reduce((acc, t) => {
    if (t.isTransfer) return acc;
    return acc + (t.type === 'income' ? t.amount : -t.amount);
  }, 0);

  const formatCurrency = (val: number) =>
    mask(new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val));

  return (
    <div className="space-y-5 animate-fade-in-up">
      {/* Top Banner & Action */}
      <div className="glass p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-display font-bold" style={{ color: 'var(--text-primary)' }}>
              Lançamentos Financeiros
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              {filteredTransactions.length}{' '}
              {filteredTransactions.length === 1 ? 'transação encontrada' : 'transações encontradas'}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3">
          <div className="text-left sm:text-right">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)] block">
              Balanço dos Lançamentos
            </span>
            <span
              className="text-base sm:text-lg font-mono font-bold"
              style={{ color: totalFiltered >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)' }}
            >
              {totalFiltered >= 0 ? '+' : ''}
              {formatCurrency(totalFiltered)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAiModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all shadow-sm"
              title="Lançamento Inteligente por IA"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Lançar com IA</span>
            </button>

            <button
              onClick={() => setIsFormOpen(!isFormOpen)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-md ${
                isFormOpen
                  ? 'bg-[var(--bg-tertiary)] hover:bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-color)]'
                  : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20'
              }`}
            >
              {isFormOpen ? (
                <>
                  <X className="w-4 h-4" />
                  Fechar
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 stroke-[3]" />
                  Nova Transação
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Transaction Form (Collapsible) */}
      {isFormOpen && (
        <TransactionForm
          categories={categories}
          onSubmit={(data) => {
            onAddTransaction(data);
            setIsFormOpen(false);
          }}
          onCancel={() => setIsFormOpen(false)}
        />
      )}

      {/* Filter Bar */}
      <Filters
        transactions={transactions}
        categories={categories}
        onFilterChange={onFilterChange}
      />

      {/* Transaction List */}
      <TransactionList
        transactions={filteredTransactions.slice(0, 50)}
        onDelete={onDeleteTransaction}
        onEdit={setEditingTransaction}
      />

      {/* Edit Modal */}
      <EditTransactionModal
        transaction={editingTransaction}
        categories={categories}
        isOpen={!!editingTransaction}
        onSave={onEditTransaction}
        onClose={() => setEditingTransaction(null)}
      />

      {/* Quick Add AI Modal */}
      <QuickAddAIModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        categories={categories}
        accounts={accounts}
        onConfirm={(data) => {
          if (data.isInstallment && data.totalInstallments && data.totalInstallments > 1 && onAddInstallment) {
            onAddInstallment({
              description: data.description,
              totalAmount: data.amount,
              installmentAmount: data.installmentAmount || data.amount / data.totalInstallments,
              totalInstallments: data.totalInstallments,
              startDate: data.date,
              category: data.category,
              isActive: true,
            });
          } else {
            onAddTransaction(data);
          }
        }}
      />
    </div>
  );
}
