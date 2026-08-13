import { useState } from 'react';
import { BarChart3, TrendingUp, CalendarDays } from 'lucide-react';
import { AdvancedCharts } from '../components/AdvancedCharts';
import { ExpenseHeatmap } from '../components/ExpenseHeatmap';
import { CashFlowProjection } from '../components/CashFlowProjection';
import type { Transaction, Goal } from '../types/finance';

interface AnalyticsPageProps {
  transactions: Transaction[];
  goals: Goal[];
  recurring: unknown[];
  installments: unknown[];
  payments: unknown[];
  accountBalances: Record<string, number>;
}

type AnalyticsTab = 'overview' | 'projection' | 'heatmap';

export function AnalyticsPage({ transactions }: AnalyticsPageProps) {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('overview');

  const tabs = [
    { id: 'overview' as const, label: 'Visão Geral & Gráficos', icon: BarChart3 },
    { id: 'projection' as const, label: 'Projeção de Fluxo', icon: TrendingUp },
    { id: 'heatmap' as const, label: 'Mapa de Calor de Despesas', icon: CalendarDays },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header Tabs Navigation */}
      <div className="glass p-2 rounded-2xl flex flex-wrap items-center gap-1.5 border border-[var(--border-color)]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[180px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="transition-all duration-300">
        {activeTab === 'overview' && (
          <div className="animate-fade-in">
            <AdvancedCharts transactions={transactions} />
          </div>
        )}

        {activeTab === 'projection' && (
          <div className="animate-fade-in">
            <CashFlowProjection transactions={transactions} />
          </div>
        )}

        {activeTab === 'heatmap' && (
          <div className="animate-fade-in">
            <ExpenseHeatmap transactions={transactions} />
          </div>
        )}
      </div>
    </div>
  );
}
