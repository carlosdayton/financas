import { AdvancedCharts } from '../components/AdvancedCharts';
import { ExpenseHeatmap } from '../components/ExpenseHeatmap';
import { CashFlowProjection } from '../components/CashFlowProjection';
import type { Transaction, Goal, RecurringTransaction, Installment, InstallmentPayment } from '../types/finance';

interface AnalyticsPageProps {
  transactions: Transaction[];
  goals: Goal[];
  recurring: RecurringTransaction[];
  installments: Installment[];
  payments: InstallmentPayment[];
  accountBalances: Record<string, number>;
}

export function AnalyticsPage({ transactions, goals, recurring, installments, payments, accountBalances }: AnalyticsPageProps) {
  void goals;
  return (
    <div className="space-y-6">
      <CashFlowProjection
        transactions={transactions}
        recurring={recurring}
        installments={installments}
        payments={payments}
        accountBalances={accountBalances}
      />
      <AdvancedCharts transactions={transactions} />
      <ExpenseHeatmap transactions={transactions} />
    </div>
  );
}
