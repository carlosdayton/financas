import { Dashboard } from '../components/Dashboard';
import { Charts } from '../components/Charts';
import { InsightsDashboard } from '../components/InsightsDashboard';
import type { FinancialSummary, MonthlyData, Goal } from '../types/finance';

interface DashboardPageProps {
  summary: FinancialSummary;
  monthlyData: MonthlyData[];
  categoryData: {
    income: { name: string; value: number }[];
    expense: { name: string; value: number }[];
  };
  goals: Goal[];
}

export function DashboardPage({ summary, monthlyData, categoryData, goals }: DashboardPageProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Visão Geral</h2>
        <p className="text-[#a0a0b8]">Resumo das suas finanças</p>
      </div>

      <Dashboard summary={summary} />
      
      <InsightsDashboard 
        transactions={[]} // Será preenchido via props
        goals={goals}
      />
      
      <Charts monthlyData={monthlyData} categoryData={categoryData} />
    </div>
  );
}
