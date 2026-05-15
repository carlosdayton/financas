import { BarChart3, PieChartIcon } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import type { MonthlyData } from '../types/finance';

interface ChartsProps {
  monthlyData: MonthlyData[];
  categoryData: {
    income: { name: string; value: number }[];
    expense: { name: string; value: number }[];
  };
}

const COLORS = [
  '#5fbf8f', '#7aa7d9', '#fbbf24', '#fb7185',
  '#a3a3a3', '#38bdf8', '#22c55e', '#f97316',
];

interface TooltipEntry {
  color: string;
  name: string;
  value: number;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const CustomTooltip = ({ active, payload, label }: ChartTooltipProps) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-2xl p-3 shadow-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
      <p className="font-mono font-medium mb-2" style={{ color: 'var(--text-primary)' }}>{label}</p>
      {payload.map((entry, index: number) => (
        <p key={index} className="text-sm font-mono" style={{ color: entry.color }}>
          {entry.name}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  );
};

export function Charts({ monthlyData, categoryData }: ChartsProps) {
  const formatMonth = (month: string) => {
    const [year, monthNum] = month.split('-');
    return `${monthNum}/${year}`;
  };

  const chartCardStyle = { background: 'var(--bg-card)', border: '1px solid var(--border-color)' };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-8">
      <div className="rounded-2xl p-5 overflow-hidden glass" style={chartCardStyle}>
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 bg-emerald-500 text-white rounded-2xl">
            <BarChart3 className="w-5 h-5 text-black" />
          </div>
          <h3 className="text-xl font-display font-semibold" style={{ color: 'var(--text-primary)' }}>
            Evolução mensal
          </h3>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
              <XAxis
                dataKey="month"
                tickFormatter={formatMonth}
                stroke="var(--text-muted)"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: 'var(--border-color)' }}
              />
              <YAxis
                stroke="var(--text-muted)"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: 'var(--border-color)' }}
                tickFormatter={(value) => new Intl.NumberFormat('pt-BR', { notation: 'compact' }).format(value)}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }} />
              <Legend wrapperStyle={{ paddingTop: '20px', color: 'var(--text-secondary)' }} iconType="circle" />
              <Bar dataKey="income" name="Receitas" fill="var(--accent-success)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" name="Despesas" fill="var(--accent-danger)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl p-5 overflow-hidden glass" style={chartCardStyle}>
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 bg-emerald-500 text-white rounded-2xl">
            <PieChartIcon className="w-5 h-5 text-black" />
          </div>
          <h3 className="text-xl font-display font-semibold" style={{ color: 'var(--text-primary)' }}>
            Despesas por categoria
          </h3>
        </div>

        <div className="h-64">
          {categoryData.expense.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData.expense}
                  cx="48%"
                  cy="50%"
                  innerRadius={54}
                  outerRadius={82}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="var(--bg-card)"
                  strokeWidth={2}
                >
                  {categoryData.expense.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => typeof value === 'number' ? formatCurrency(value) : value}
                  contentStyle={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                  }}
                />
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  iconType="circle"
                  wrapperStyle={{ fontSize: '12px', color: 'var(--text-secondary)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-14 h-14 mx-auto mb-3 rounded-2xl flex items-center justify-center" style={{ background: 'var(--bg-tertiary)' }}>
                  <PieChartIcon className="w-7 h-7" style={{ color: 'var(--text-muted)' }} />
                </div>
                <p style={{ color: 'var(--text-secondary)' }}>Sem dados de despesas</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
