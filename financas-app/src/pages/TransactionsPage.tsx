import { TransactionForm } from '../components/TransactionForm';
import { TransactionList } from '../components/TransactionList';
import { Filters } from '../components/Filters';
import type { Transaction, Category } from '../types/finance';

interface TransactionsPageProps {
  transactions: Transaction[];
  categories: Category[];
  filteredTransactions: Transaction[];
  onFilterChange: (filtered: Transaction[]) => void;
  onAddTransaction: (data: Omit<Transaction, 'id' | 'createdAt'>) => void;
  onDeleteTransaction: (id: string) => void;
}

export function TransactionsPage({
  transactions,
  categories,
  filteredTransactions,
  onFilterChange,
  onAddTransaction,
  onDeleteTransaction,
}: TransactionsPageProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Transações</h2>
        <p className="text-[#a0a0b8]">Gerencie suas receitas e despesas</p>
      </div>

      <TransactionForm categories={categories} onSubmit={onAddTransaction} />
      
      <Filters
        transactions={transactions}
        categories={categories}
        onFilterChange={onFilterChange}
      />
      
      <TransactionList
        transactions={filteredTransactions.slice(0, 50)}
        onDelete={onDeleteTransaction}
      />
    </div>
  );
}
