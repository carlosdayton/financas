import { TrendingUp, TrendingDown, Wallet, Receipt, Calendar, ArrowUpRight, ArrowDownRight, AlertCircle } from 'lucide-react';
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
      title: 'Saldo do Mês',
      subtitle: monthName,
      value: currentMonthBalance,
      icon: Calendar,
      trend: currentMonthBalance >= 0 ? 'Positivo' : 'Atenção',
      trendIcon: currentMonthBalance >= 0 ? ArrowUpRight : ArrowDownRight,
      color: currentMonthBalance >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)',
      bgColor: currentMonthBalance >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
    },
    {
      title: 'Receitas',
      subtitle: 'Entradas no mês',
      value: currentMonthIncome,
      icon: TrendingUp,
      trend: 'Entradas',
      trendIcon: ArrowUpRight,
      color: 'var(--accent-success)',
      bgColor: 'rgba(16, 185, 129, 0.1)',
    },
    {
      title: 'Despesas',
      subtitle: 'Saídas no mês',
      value: currentMonthExpense,
      icon: TrendingDown,
      trend: 'Saídas',
      trendIcon: ArrowDownRight,
      color: 'var(--accent-danger)',
      bgColor: 'rgba(244, 63, 94, 0.1)',
    },
    {
      title: 'Lançamentos',
      subtitle: 'Histórico acumulado',
      value: summary.transactionsCount,
      icon: Receipt,
      trend: 'Registros',
      trendIcon: ArrowUpRight,
      color: 'var(--accent-secondary)',
      bgColor: 'rgba(14, 165, 233, 0.1)',
      isCount: true,
    },
  ];

  const totalBalance = Object.values(accountBalances).reduce((sum, b) => sum + b, 0);

  const criticalBudgets = budgetStatus
    .filter((b) => b.percentage > 0)
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Top KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          const TrendIcon = card.trendIcon;

          return (
            <div
              key={card.title}
              className="glass p-5 card-hover flex flex-col justify-between relative overflow-hidden group"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    {card.title}
                  </p>
                  <p className="text-xs capitalize mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    {card.subtitle}
                  </p>
                </div>
                <div
                  className="p-2.5 rounded-xl border border-[var(--border-color)] transition-transform duration-300 group-hover:scale-110"
                  style={{ background: card.bgColor, color: card.color }}
                >
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-6">
                <p
                  className="text-2xl sm:text-3xl font-display font-bold tracking-tight break-words"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {card.isCount ? card.value.toLocaleString('pt-BR') : formatCurrency(card.value)}
                </p>

                <div className="mt-3 flex items-center justify-between">
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border"
                    style={{
                      background: card.bgColor,
                      color: card.color,
                      borderColor: 'rgba(255,255,255,0.05)',
                    }}
                  >
                    <TrendIcon className="w-3 h-3" />
                    {card.trend}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Account Balances Card */}
        {accounts.length > 0 && (
          <div className="glass p-5 flex flex-col">
            <div className="flex items-center justify-between pb-4 mb-3 border-b border-[var(--border-color)]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-display font-bold" style={{ color: 'var(--text-primary)' }}>
                    Saldos por Conta
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    {accounts.length} {accounts.length === 1 ? 'conta cadastrada' : 'contas cadastradas'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)] block">
                  Patrimônio Total
                </span>
                <span
                  className="text-lg font-mono font-bold"
                  style={{ color: totalBalance >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)' }}
                >
                  {formatCurrency(totalBalance)}
                </span>
              </div>
            </div>

            <div className="divide-y divide-[var(--border-color)] flex-1">
              {accounts.map((account) => {
                const balance = accountBalances[account.id] ?? 0;
                const isCredit = account.type === 'credit';

                return (
                  <div key={account.id} className="py-3 px-1 flex items-center justify-between gap-3 hover:bg-[var(--bg-tertiary)]/30 rounded-xl transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-3.5 h-3.5 rounded-full flex-shrink-0 border border-white/20"
                        style={{ backgroundColor: account.color }}
                      />
                      <div className="min-w-0">
                        <span className="text-sm font-semibold truncate block" style={{ color: 'var(--text-primary)' }}>
                          {account.name}
                        </span>
                        <span className="text-xs text-[var(--text-muted)] capitalize">
                          {account.type === 'checking' ? 'Conta Corrente' : account.type === 'savings' ? 'Poupança' : account.type === 'investment' ? 'Investimento' : account.type === 'credit' ? 'Cartão de Crédito' : 'Outros'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className="text-sm font-mono font-bold whitespace-nowrap block"
                        style={{ color: balance >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)' }}
                      >
                        {formatCurrency(balance)}
                      </span>
                      {isCredit && account.creditLimit && (
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-[10px] font-mono text-[var(--text-muted)]">
                            Lim. {formatCurrency(account.creditLimit)}
                          </span>
                          <div className="w-16 h-1.5 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${Math.min((Math.abs(balance) / account.creditLimit) * 100, 100)}%`,
                                background:
                                  Math.abs(balance) / account.creditLimit > 0.9
                                    ? 'var(--accent-danger)'
                                    : Math.abs(balance) / account.creditLimit > 0.7
                                    ? 'var(--accent-warning)'
                                    : account.color,
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Critical Budgets Card */}
        {criticalBudgets.length > 0 ? (
          <div className="glass p-5 flex flex-col">
            <div className="flex items-center justify-between pb-4 mb-3 border-b border-[var(--border-color)]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-display font-bold" style={{ color: 'var(--text-primary)' }}>
                    Orçamentos em Risco
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">Categorias mais próximas do limite</p>
                </div>
              </div>
              <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border-color)]">
                Top 3
              </span>
            </div>

            <div className="space-y-4 flex-1">
              {criticalBudgets.map((item) => {
                const pct = Math.min(item.percentage, 100);
                const isExceeded = item.isExceeded;
                const isWarning = item.percentage >= 70 && !isExceeded;
                const barColor = isExceeded
                  ? 'var(--accent-danger)'
                  : isWarning
                  ? 'var(--accent-warning)'
                  : 'var(--accent-primary)';

                return (
                  <div key={item.budget.id} className="p-3.5 rounded-xl bg-[var(--bg-tertiary)]/40 border border-[var(--border-color)]">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <span className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                        {item.budget.category}
                      </span>
                      <span className="text-xs font-mono font-bold whitespace-nowrap" style={{ color: barColor }}>
                        {formatCurrency(item.spent)} / {formatCurrency(item.budget.amount)}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: barColor }}
                      />
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-[11px]">
                      <span className="text-[var(--text-muted)]">Progresso</span>
                      <span className="font-bold font-mono" style={{ color: barColor }}>
                        {item.percentage.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="glass p-5 flex flex-col items-center justify-center text-center">
            <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-400 mb-3">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h4 className="text-base font-display font-semibold" style={{ color: 'var(--text-primary)' }}>
              Orçamentos sob controle
            </h4>
            <p className="text-xs max-w-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Nenhum limite de orçamento está em zona de risco no mês atual.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
