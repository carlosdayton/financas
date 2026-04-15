import { TrendingUp, TrendingDown, Wallet, Receipt } from 'lucide-react';
import type { FinancialSummary } from '../types/finance';

interface DashboardProps {
  summary: FinancialSummary;
}

export function Dashboard({ summary }: DashboardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const cards = [
    {
      title: 'Saldo Total',
      value: summary.balance,
      icon: Wallet,
      gradient: 'from-indigo-500 to-purple-500',
      iconBg: 'bg-indigo-500/20',
      iconColor: 'text-indigo-400',
      glowColor: 'shadow-indigo-500/25',
    },
    {
      title: 'Receitas',
      value: summary.totalIncome,
      icon: TrendingUp,
      gradient: 'from-emerald-500 to-teal-500',
      iconBg: 'bg-emerald-500/20',
      iconColor: 'text-emerald-400',
      glowColor: 'shadow-emerald-500/25',
    },
    {
      title: 'Despesas',
      value: summary.totalExpense,
      icon: TrendingDown,
      gradient: 'from-amber-500 to-red-500',
      iconBg: 'bg-amber-500/20',
      iconColor: 'text-amber-400',
      glowColor: 'shadow-amber-500/25',
    },
    {
      title: 'Transações',
      value: summary.transactionsCount,
      icon: Receipt,
      gradient: 'from-blue-500 to-cyan-500',
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-400',
      glowColor: 'shadow-blue-500/25',
      isCount: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <div
          key={card.title}
          className="relative group"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          {/* Glow effect */}
          <div className={`absolute inset-0 bg-gradient-to-r ${card.gradient} rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500`} />
          
          <div className="relative rounded-2xl p-6 card-hover overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            {/* Subtle gradient overlay */}
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${card.gradient} opacity-5 rounded-full blur-2xl transform translate-x-16 -translate-y-16`} />
            
            <div className="relative flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{card.title}</p>
                <p className={`text-3xl font-bold bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`}>
                  {card.isCount
                    ? card.value.toLocaleString('pt-BR')
                    : formatCurrency(card.value)}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${card.iconBg} ${card.iconColor}`}>
                <card.icon className="w-6 h-6" />
              </div>
            </div>
            
            {/* Bottom accent line */}
            <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${card.gradient} opacity-50`} />
          </div>
        </div>
      ))}
    </div>
  );
}
