import { AlertTriangle, CheckCircle2, TrendingDown } from 'lucide-react';
import type { BudgetStatus } from '../types/finance';

interface FinancialAlertsProps {
  budgetStatus: BudgetStatus[];
  currentMonthBalance: number;
}

export function FinancialAlerts({ budgetStatus, currentMonthBalance }: FinancialAlertsProps) {
  const exceededBudgets = budgetStatus.filter((item) => item.isExceeded);
  const warningBudgets = budgetStatus.filter((item) => !item.isExceeded && item.percentage >= 80);
  const hasAlerts = exceededBudgets.length > 0 || warningBudgets.length > 0 || currentMonthBalance < 0;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div className="relative mb-8">
      <div className="relative rounded-2xl p-5 glass" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-emerald-500 text-white rounded-2xl">
            <AlertTriangle className="w-5 h-5 text-black" />
          </div>
          <h2 className="text-xl font-display font-semibold" style={{ color: 'var(--text-primary)' }}>Alertas financeiros</h2>
        </div>

        {!hasAlerts ? (
          <div className="rounded-2xl p-4 flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <p style={{ color: 'var(--text-secondary)' }}>Tudo sob controle no momento. Nenhum alerta critico.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {currentMonthBalance < 0 && (
              <div className="rounded-2xl p-4 border bg-red-500/10 border-red-500/30">
                <p className="font-semibold flex items-center gap-2 text-red-400">
                  <TrendingDown className="w-4 h-4" />
                  Saldo do mes esta negativo
                </p>
                <p className="text-sm mt-1 font-mono" style={{ color: 'var(--text-secondary)' }}>
                  Resultado atual: {formatCurrency(currentMonthBalance)}. Reduza gastos para voltar ao positivo.
                </p>
              </div>
            )}

            {exceededBudgets.map((item) => (
              <div key={item.budget.id} className="rounded-2xl p-4 border bg-red-500/10 border-red-500/30">
                <p className="font-semibold text-red-400">Orcamento excedido em {item.budget.category}</p>
                <p className="text-sm mt-1 font-mono" style={{ color: 'var(--text-secondary)' }}>
                  Limite: {formatCurrency(item.budget.amount)} | Gasto: {formatCurrency(item.spent)} | Excedente: {formatCurrency(Math.abs(item.remaining))}
                </p>
              </div>
            ))}

            {warningBudgets.map((item) => (
              <div key={item.budget.id} className="rounded-2xl p-4 border bg-amber-500/10 border-amber-500/30">
                <p className="font-semibold text-amber-400">Atencao: {item.budget.category} em {item.percentage.toFixed(0)}%</p>
                <p className="text-sm mt-1 font-mono" style={{ color: 'var(--text-secondary)' }}>
                  Restam {formatCurrency(item.remaining)} ate o limite mensal.
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
