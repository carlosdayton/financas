import { AdvancedCharts } from '../components/AdvancedCharts';
import { ExpenseHeatmap } from '../components/ExpenseHeatmap';
import type { Transaction, Goal } from '../types/finance';

interface AnalyticsPageProps {
  transactions: Transaction[];
  goals: Goal[];
  recurring: unknown[];
  installments: unknown[];
  payments: unknown[];
  accountBalances: Record<string, number>;
}

export function AnalyticsPage({ transactions, goals }: AnalyticsPageProps) {
  void goals;
  return (
    <div className="space-y-6">
      <AdvancedCharts transactions={transactions} />
      <ExpenseHeatmap transactions={transactions} />
    </div>
  );
}
