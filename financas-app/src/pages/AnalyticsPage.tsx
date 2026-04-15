import { AdvancedCharts } from '../components/AdvancedCharts';
import { ExpenseHeatmap } from '../components/ExpenseHeatmap';
import type { Transaction, Goal } from '../types/finance';

interface AnalyticsPageProps {
  transactions: Transaction[];
  goals: Goal[];
}

export function AnalyticsPage({ transactions, goals }: AnalyticsPageProps) {
  // goals prop is available for future use
  void goals;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Análises</h2>
        <p className="text-[#a0a0b8]">Gráficos e insights detalhados</p>
      </div>

      <AdvancedCharts transactions={transactions} />
      <ExpenseHeatmap transactions={transactions} />
    </div>
  );
}
