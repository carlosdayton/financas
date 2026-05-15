import { RecurringTransactions } from '../components/RecurringTransactions';
import type { RecurringTransaction, Category, Account } from '../types/finance';

interface RecurringPageProps {
  recurring: RecurringTransaction[];
  categories: Category[];
  accounts: Account[];
  onAddRecurring: (rec: Omit<RecurringTransaction, 'id'>) => void;
  onDeleteRecurring: (id: string) => void;
  onToggleRecurring: (id: string, isActive: boolean) => void;
}

export function RecurringPage({
  recurring,
  categories,
  accounts,
  onAddRecurring,
  onDeleteRecurring,
  onToggleRecurring,
}: RecurringPageProps) {
  return (
    <div className="space-y-6">
      <RecurringTransactions
        recurring={recurring}
        categories={categories}
        accounts={accounts}
        onAddRecurring={onAddRecurring}
        onDeleteRecurring={onDeleteRecurring}
        onToggleRecurring={onToggleRecurring}
      />
    </div>
  );
}
