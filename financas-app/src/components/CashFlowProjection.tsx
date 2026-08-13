import { useMemo } from 'react';
import { TrendingUp } from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine,
} from 'recharts';
import type { Transaction } from '../types/finance';

interface CashFlowProjectionProps {
  transactions: Transaction[];
  months?: number;
}

interface ProjectionPoint {
  month: string;
  label: string;
  income: number;
  expense: number;
  balance: number;
  projected: boolean;
}

interface TooltipEntry {
  color: string;
  name: string;
  value: number;
  dataKey: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const formatCurrencyCompact = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    notation: 'compact',
  }).format(value);

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  const isProjected = payload[0] && (payload[0] as unknown as { payload: ProjectionPoint }).payload?.projected;

  return (
    <div
      className="rounded-2xl p-4 shadow-xl"
      style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
    >
      <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
        {label}
        {isProjected && (
          <span className="ml-2 text-xs text-amber-400 font-normal">projetado</span>
        )}
      </p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  );
}

function addMonths(yearMonth: string, n: number): string {
  const [y, m] = yearMonth.split('-').map(Number);
  const date = new Date(y, m - 1 + n, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(yearMonth: string): string {
  const [y, m] = yearMonth.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
}

export function CashFlowProjection({ transactions, months = 4 }: CashFlowProjectionProps) {
  const data = useMemo((): ProjectionPoint[] => {
    const monthlyMap = new Map<string, { income: number; expense: number }>();

    transactions.forEach((t) => {
      const key = t.date.substring(0, 7);
      if (!monthlyMap.has(key)) monthlyMap.set(key, { income: 0, expense: 0 });
      const entry = monthlyMap.get(key)!;
      if (t.type === 'income') entry.income += t.amount;
      else entry.expense += t.amount;
    });

    const sorted = Array.from(monthlyMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));

    const historyMonths = sorted.slice(-6);
    const avgIncome =
      historyMonths.length > 0
        ? historyMonths.reduce((s, [, d]) => s + d.income, 0) / historyMonths.length
        : 0;
    const avgExpense =
      historyMonths.length > 0
        ? historyMonths.reduce((s, [, d]) => s + d.expense, 0) / historyMonths.length
        : 0;

    const currentMonth = new Date().toISOString().substring(0, 7);
    const historical: ProjectionPoint[] = sorted.map(([key, d]) => ({
      month: key,
      label: monthLabel(key),
      income: d.income,
      expense: d.expense,
      balance: d.income - d.expense,
      projected: false,
    }));

    const future: ProjectionPoint[] = Array.from({ length: months }, (_, i) => {
      const key = addMonths(currentMonth, i + 1);
      return {
        month: key,
        label: monthLabel(key),
        income: avgIncome,
        expense: avgExpense,
        balance: avgIncome - avgExpense,
        projected: true,
      };
    });

    return [...historical.slice(-6), ...future];
  }, [transactions, months]);

  const todayKey = new Date().toISOString().substring(0, 7);

  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div
        className="relative rounded-2xl p-6 overflow-hidden"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 rounded-2xl blur-3xl transform translate-x-32 -translate-y-32" />

        <div className="relative flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Projeção de Fluxo de Caixa
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Baseado na média dos últimos 6 meses
            </p>
          </div>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
              <XAxis
                dataKey="label"
                stroke="#6b6b8a"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#2a2a45' }}
              />
              <YAxis
                stroke="#6b6b8a"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#2a2a45' }}
                tickFormatter={formatCurrencyCompact}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                x={monthLabel(todayKey)}
                stroke="#6b6b8a"
                strokeDasharray="4 4"
                label={{ value: 'hoje', fill: '#6b6b8a', fontSize: 10 }}
              />
              <Area
                type="monotone"
                dataKey="income"
                name="Receita"
                stroke="#06b6d4"
                strokeWidth={2}
                fill="url(#incomeGradient)"
              />
              <Area
                type="monotone"
                dataKey="expense"
                name="Despesa"
                stroke="#f43f5e"
                strokeWidth={2}
                fill="url(#expenseGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <span className="w-8 h-0.5 bg-cyan-400 inline-block" />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Receita</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-0.5 bg-rose-400 inline-block" />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Despesa</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-0.5 border-t border-dashed border-[#6b6b8a] inline-block" />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Projetado</span>
          </div>
        </div>
      </div>
    </div>
  );
}
