import { Dashboard } from '../components/Dashboard';
import { Charts } from '../components/Charts';
import { InsightsDashboard } from '../components/InsightsDashboard';
import { SmartSuggestions } from '../components/SmartSuggestions';
import { FinancialAlerts } from '../components/FinancialAlerts';
import { AlertPreferences, type AlertPreferencesState } from '../components/AlertPreferences';
import type { FinancialSummary, MonthlyData, Goal, Transaction, BudgetStatus, Account } from '../types/finance';
import { getCurrentMonthLocalISO } from '../utils/date';

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
  accounts: Account[];
  accountBalances: Record<string, number>;
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
  accounts,
  accountBalances,
}: DashboardPageProps) {
  const currentMonth = getCurrentMonthLocalISO();

  const currentMonthTransactions = transactions.filter(
    (t) => t.date.startsWith(currentMonth) && !t.isTransfer
  );
  const currentMonthIncome = currentMonthTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const currentMonthExpense = currentMonthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const currentMonthBalance = currentMonthIncome - currentMonthExpense;

  return (
    <div className="space-y-6">
      <Dashboard
        summary={summary}
        currentMonthIncome={currentMonthIncome}
        currentMonthExpense={currentMonthExpense}
        currentMonthBalance={currentMonthBalance}
        accounts={accounts}
        accountBalances={accountBalances}
        budgetStatus={budgetStatus}
      />

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
