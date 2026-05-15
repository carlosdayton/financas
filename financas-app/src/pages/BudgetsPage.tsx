import { Budgets } from '../components/Budgets';
import type { Budget, BudgetStatus, Category } from '../types/finance';

interface BudgetsPageProps {
  categories: Category[];
  budgets: Budget[];
  budgetStatus: BudgetStatus[];
  selectedMonth: string;
  canCopyFromPreviousMonth: boolean;
  onAddBudget: (budget: Omit<Budget, 'id' | 'createdAt'>) => void;
  onDeleteBudget: (id: string) => void;
  onMonthChange: (month: string) => void;
  onCopyFromPreviousMonth: () => void;
}

export function BudgetsPage({
  categories,
  budgets,
  budgetStatus,
  selectedMonth,
  canCopyFromPreviousMonth,
  onAddBudget,
  onDeleteBudget,
  onMonthChange,
  onCopyFromPreviousMonth,
}: BudgetsPageProps) {
  return (
    <div className="space-y-6">
      <Budgets
        categories={categories}
        budgets={budgets}
        budgetStatus={budgetStatus}
        selectedMonth={selectedMonth}
        canCopyFromPreviousMonth={canCopyFromPreviousMonth}
        onAddBudget={onAddBudget}
        onDeleteBudget={onDeleteBudget}
        onMonthChange={onMonthChange}
        onCopyFromPreviousMonth={onCopyFromPreviousMonth}
      />
    </div>
  );
}
