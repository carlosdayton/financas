import { TrendingUp, TrendingDown, Wallet, Receipt, Calendar } from 'lucide-react';
import type { FinancialSummary, Account, BudgetStatus } from '../types/finance';
import { getCurrentMonthLocalISO } from '../utils/date';
import { usePrivacy } from '../contexts/PrivacyContext';

interface DashboardProps {
  summary: FinancialSummary;
  currentMonthIncome: number;
  currentMonthExpense: number;
  currentMonthBalance: number;
  accounts: Account[];
  accountBalances: Record<string, number>;
  budgetStatus: BudgetStatus[];
}

export function Dashboard({
  summary,
  currentMonthIncome,
  currentMonthExpense,
  currentMonthBalance,
  accounts,
  accountBalances,
  budgetStatus,
}: DashboardProps) {
  const { mask } = usePrivacy();

  const formatCurrency = (value: number) => {
    const formatted = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
    return mask(formatted);
  };

  const currentMonth = getCurrentMonthLocalISO();
  const monthName = new Date(currentMonth + '-01').toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });

  const cards = [
    {
      title: 'Saldo do mês',
      subtitle: monthName,
      value: currentMonthBalance,
      icon: Calendar,
      color: currentMonthBalance >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)',
    },
    {
      title: 'Receitas',
      subtitle: 'Entradas do mês',
      value: currentMonthIncome,
      icon: TrendingUp,
      color: 'var(--accent-success)',
    },
    {
      title: 'Despesas',
      subtitle: 'Saídas do mês',
      value: currentMonthExpense,
      icon: TrendingDown,
      color: 'var(--accent-danger)',
    },
    {
      title: 'Transações',
      subtitle: 'Histórico completo',
      value: summary.transactionsCount,
      icon: Receipt,
      color: 'var(--accent-secondary)',
      isCount: true,
    },
  ];

  const totalBalance = Object.values(accountBalances).reduce((sum, b) => sum + b, 0);

  const criticalBudgets = budgetStatus
    .filter((b) => b.percentage > 0)
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 3);

  return (
    <div className="space-y-6 mb-4">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 rounded-2xl blur-xl pointer-events-none" />
        <div className="relative grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {cards.map((card) => (
            <div key={card.title} className="glass p-4 sm:p-6 premium-hover card-hover flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>{card.title}</p>
                    <p className="text-xs mt-1 capitalize font-mono" style={{ color: 'var(--text-muted)' }}>{card.subtitle}</p>
                  </div>
                  <div className="p-2 border border-[var(--border-color)] bg-[var(--bg-tertiary)] rounded-xl" style={{ color: card.color }}>
                    <card.icon className="w-5 h-5" />
                  </div>
                </div>

                <p className="mt-5 sm:mt-8 text-[clamp(1.45rem,8vw,2.25rem)] md:text-4xl font-display font-bold tracking-tight break-words" style={{ color: 'var(--text-primary)' }}>
                  {card.isCount ? card.value.toLocaleString('pt-BR') : formatCurrency(card.value)}
                </p>
              </div>

              <div className="mt-4 h-1 rounded-2xl bg-[var(--bg-tertiary)] overflow-hidden">
                <div className="h-full w-2/5 rounded-2xl" style={{ background: card.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {accounts.length > 0 && (
          <div className="p-4 sm:p-6 border border-[var(--border-color)] bg-[var(--bg-card)]">
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 pb-4 border-b border-[var(--border-color)]">
              <h3 className="text-lg sm:text-xl font-display font-bold flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
                <div className="p-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)]">
                  <Wallet className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
                </div>
                Saldos por conta
              </h3>
              <div className="text-right">
                <span className="text-xs uppercase font-mono tracking-widest block" style={{ color: 'var(--text-muted)' }}>Total</span>
                <span className="text-xl font-mono font-bold" style={{ color: totalBalance >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
                  {formatCurrency(totalBalance)}
                </span>
              </div>
            </div>

            <div className="flex flex-col">
              {accounts.map((account) => {
                const balance = accountBalances[account.id] ?? 0;
                const isCredit = account.type === 'credit';

                return (
                  <div key={account.id} className="ledger-row premium-hover flex items-center justify-between gap-3 py-4 px-1 sm:px-2">
                    <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                      <div className="w-3 h-3 border border-[var(--border-color)]" style={{ backgroundColor: account.color }} />
                      <div>
                        <span className="text-sm sm:text-base font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{account.name}</span>
                        {isCredit && account.creditLimit && (
                          <p className="text-xs mt-1 font-mono" style={{ color: 'var(--text-muted)' }}>
                            Limite: {formatCurrency(account.creditLimit)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm sm:text-base font-mono font-bold whitespace-nowrap" style={{ color: balance >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
                        {formatCurrency(balance)}
                      </span>
                      {isCredit && account.creditLimit && (
                        <div className="mt-2 w-24 h-1 rounded-2xl bg-[var(--bg-tertiary)] overflow-hidden">
                          <div
                            className="h-full rounded-2xl"
                            style={{
                              width: `${Math.min(Math.abs(balance) / account.creditLimit * 100, 100)}%`,
                              background: Math.abs(balance) / account.creditLimit > 0.9
                                ? 'var(--accent-danger)'
                                : Math.abs(balance) / account.creditLimit > 0.7
                                ? 'var(--accent-warning)'
                                : account.color,
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {criticalBudgets.length > 0 && (
          <div className="p-4 sm:p-6 border border-[var(--border-color)] bg-[var(--bg-card)]">
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 pb-4 border-b border-[var(--border-color)]">
              <h3 className="text-lg sm:text-xl font-display font-bold flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
                <div className="p-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)]">
                  <TrendingDown className="w-5 h-5" style={{ color: 'var(--accent-danger)' }} />
                </div>
                Orçamentos em risco
              </h3>
              <span className="text-xs font-mono font-medium px-2 py-1 border border-[var(--border-color)] bg-[var(--bg-tertiary)]" style={{ color: 'var(--text-secondary)' }}>
                TOP 3
              </span>
            </div>

            <div className="flex flex-col">
              {criticalBudgets.map((item) => {
                const pct = Math.min(item.percentage, 100);
                const isExceeded = item.isExceeded;
                const isWarning = item.percentage >= 70 && !isExceeded;
                const barColor = isExceeded ? 'var(--accent-danger)' : isWarning ? 'var(--accent-warning)' : 'var(--accent-primary)';

                return (
                  <div key={item.budget.id} className="ledger-row premium-hover py-4 px-2">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <span className="text-base font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                        {item.budget.category}
                      </span>
                      <span className="text-xs sm:text-sm font-mono font-bold whitespace-nowrap" style={{ color: barColor }}>
                        {formatCurrency(item.spent)} / {formatCurrency(item.budget.amount)}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-2xl bg-[var(--bg-tertiary)] overflow-hidden">
                      <div className="h-full rounded-2xl" style={{ width: `${pct}%`, backgroundColor: barColor }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
