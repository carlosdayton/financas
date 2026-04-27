import { Dashboard } from '../components/Dashboard';
import { Charts } from '../components/Charts';
import { InsightsDashboard } from '../components/InsightsDashboard';
import { SmartSuggestions } from '../components/SmartSuggestions';
import { FinancialAlerts } from '../components/FinancialAlerts';
import { AlertPreferences, type AlertPreferencesState } from '../components/AlertPreferences';
import type { FinancialSummary, MonthlyData, Goal, Transaction, BudgetStatus } from '../types/finance';

interface DashboardPageProps {
  summary: FinancialSummary;
  monthlyData: MonthlyData[];
  categoryData: {
    income: { name: string; value: number }[];
    expense: { name: string; value: number }[];
  };
  goals: Goal[];
  transactions: Transaction[];
  budgetStatus: BudgetStatus[];
  alertPreferences: AlertPreferencesState;
  onAlertPreferencesChange: (updates: Partial<AlertPreferencesState>) => void;
}

export function DashboardPage({
  summary,
  monthlyData,
  categoryData,
  goals,
  transactions,
  budgetStatus,
  alertPreferences,
  onAlertPreferencesChange,
}: DashboardPageProps) {
  const currentMonth = new Date().toISOString().substring(0, 7);
  const currentMonthBalance = transactions
    .filter((t) => t.date.startsWith(currentMonth) && !t.isTransfer)
    .reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Visão Geral</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Resumo das suas finanças</p>
      </div>

      <Dashboard summary={summary} />

      <FinancialAlerts budgetStatus={budgetStatus} currentMonthBalance={currentMonthBalance} />

      <AlertPreferences
        preferences={alertPreferences}
        onChange={onAlertPreferencesChange}
      />
      
      <SmartSuggestions transactions={transactions} />
      
      <InsightsDashboard 
        transactions={transactions}
        goals={goals}
      />
      
      <Charts monthlyData={monthlyData} categoryData={categoryData} />
    </div>
  );
}
