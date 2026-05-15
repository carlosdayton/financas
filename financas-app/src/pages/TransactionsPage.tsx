import { useState } from 'react';
import { TransactionForm } from '../components/TransactionForm';
import { TransactionList } from '../components/TransactionList';
import { Filters } from '../components/Filters';
import { EditTransactionModal } from '../components/EditTransactionModal';
import type { Transaction, Category } from '../types/finance';

interface TransactionsPageProps {
  transactions: Transaction[];
  categories: Category[];
  filteredTransactions: Transaction[];
  onFilterChange: (filtered: Transaction[]) => void;
  onAddTransaction: (data: Omit<Transaction, 'id' | 'createdAt'>) => void;
  onDeleteTransaction: (id: string) => void;
  onEditTransaction: (id: string, updates: Partial<Transaction>) => void;
}

export function TransactionsPage({
  transactions,
  categories,
  filteredTransactions,
  onFilterChange,
  onAddTransaction,
  onDeleteTransaction,
  onEditTransaction,
}: TransactionsPageProps) {
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  return (
    <div className="space-y-6">
      <TransactionForm categories={categories} onSubmit={onAddTransaction} />

      <Filters
        transactions={transactions}
        categories={categories}
        onFilterChange={onFilterChange}
      />

      <TransactionList
        transactions={filteredTransactions.slice(0, 50)}
        onDelete={onDeleteTransaction}
        onEdit={setEditingTransaction}
      />

      <EditTransactionModal
        transaction={editingTransaction}
        categories={categories}
        isOpen={!!editingTransaction}
        onSave={onEditTransaction}
        onClose={() => setEditingTransaction(null)}
      />
    </div>
  );
}
