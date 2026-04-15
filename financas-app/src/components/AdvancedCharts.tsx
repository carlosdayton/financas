import { useMemo } from 'react';
import { TrendingUp, BarChart3, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  ComposedChart,
  Bar,
} from 'recharts';
import type { Transaction } from '../types/finance';

interface AdvancedChartsProps {
  transactions: Transaction[];
}

interface MonthlyBalance {
  month: string;
  balance: number;
  income: number;
  expense: number;
  cumulative: number;
}

interface YearComparison {
  month: string;
  currentYear: number;
  previousYear: number;
}

export function AdvancedCharts({ transactions }: AdvancedChartsProps) {
  // Calculate monthly balance trend
  const balanceTrend = useMemo((): MonthlyBalance[] => {
    const monthlyMap = new Map<string, { income: number; expense: number }>();
    
    // Get all months from transactions
    transactions.forEach(t => {
      const month = t.date.substring(0, 7);
      if (!monthlyMap.has(month)) {
        monthlyMap.set(month, { income: 0, expense: 0 });
      }
      const current = monthlyMap.get(month)!;
      if (t.type === 'income') {
        current.income += t.amount;
      } else {
        current.expense += t.amount;
      }
    });

    // Sort and calculate cumulative
    const sorted = Array.from(monthlyMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    let cumulative = 0;
    
    return sorted.map(([month, data]) => {
      const balance = data.income - data.expense;
      cumulative += balance;
      return {
        month,
        balance,
        income: data.income,
        expense: data.expense,
        cumulative,
      };
    });
  }, [transactions]);

  // Year over year comparison
  const yearComparison = useMemo((): YearComparison[] => {
    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;
    
    const currentYearData = new Map<string, number>();
    const previousYearData = new Map<string, number>();
    
    transactions.forEach(t => {
      const date = new Date(t.date);
      const year = date.getFullYear();
      const month = date.getMonth();
      const monthKey = `${month + 1}`.padStart(2, '0');
      
      if (year === currentYear) {
        const current = currentYearData.get(monthKey) || 0;
        currentYearData.set(monthKey, current + (t.type === 'expense' ? t.amount : 0));
      } else if (year === previousYear) {
        const current = previousYearData.get(monthKey) || 0;
        previousYearData.set(monthKey, current + (t.type === 'expense' ? t.amount : 0));
      }
    });

    const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    return months.map(month => ({
      month: new Date(2000, parseInt(month) - 1).toLocaleDateString('pt-BR', { month: 'short' }),
      currentYear: currentYearData.get(month) || 0,
      previousYear: previousYearData.get(month) || 0,
    }));
  }, [transactions]);

  // Calculate insights
  const insights = useMemo(() => {
    if (transactions.length === 0) return null;

    const currentMonth = new Date().toISOString().substring(0, 7);
    const previousMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 7);

    const currentMonthTransactions = transactions.filter(t => t.date.startsWith(currentMonth));
    const previousMonthTransactions = transactions.filter(t => t.date.startsWith(previousMonth));

    const currentExpense = currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const previousExpense = previousMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenseChange = previousExpense > 0 
      ? ((currentExpense - previousExpense) / previousExpense) * 100 
      : 0;

    // Average daily expense
    const daysInMonth = new Date().getDate();
    const avgDailyExpense = currentExpense / daysInMonth;

    // Top expense category
    const categoryMap = new Map<string, number>();
    currentMonthTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const current = categoryMap.get(t.category) || 0;
        categoryMap.set(t.category, current + t.amount);
      });
    
    const topCategory = Array.from(categoryMap.entries())
      .sort((a, b) => b[1] - a[1])[0];

    return {
      expenseChange,
      avgDailyExpense,
      topCategory: topCategory ? { name: topCategory[0], amount: topCategory[1] } : null,
      currentExpense,
    };
  }, [transactions]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      notation: 'compact',
    }).format(value);
  };

  const formatMonth = (month: string) => {
    const [year, monthNum] = month.split('-');
    return `${monthNum}/${year}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl p-4 shadow-xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
          <p className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{formatMonth(label)}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 mb-8">
      {/* Insights Cards */}
      {insights && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Variação vs Mês Anterior</span>
                <div className={`p-2 rounded-lg ${insights.expenseChange > 0 ? 'bg-red-500/10' : 'bg-emerald-500/10'}`}>
                  {insights.expenseChange > 0 ? (
                    <ArrowUpRight className="w-4 h-4 text-red-400" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-emerald-400" />
                  )}
                </div>
              </div>
              <p className={`text-2xl font-bold ${insights.expenseChange > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {insights.expenseChange > 0 ? '+' : ''}{insights.expenseChange.toFixed(1)}%
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                {insights.expenseChange > 0 ? 'Aumento' : 'Redução'} nas despesas
              </p>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Média Diária</span>
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Calendar className="w-4 h-4 text-amber-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-amber-400">
                {formatCurrency(insights.avgDailyExpense)}
              </p>
              <p className="text-xs text-[#6b6b8a] mt-1">Gasto médio por dia</p>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-rose-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Maior Categoria</span>
                <div className="p-2 rounded-lg bg-rose-500/10">
                  <BarChart3 className="w-4 h-4 text-rose-400" />
                </div>
              </div>
              {insights.topCategory ? (
                <>
                  <p className="text-lg font-bold text-rose-400 truncate">
                    {insights.topCategory.name}
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    {formatCurrency(insights.topCategory.amount)}
                  </p>
                </>
              ) : (
                <p className="text-lg font-bold text-[#6b6b8a]">-</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Balance Trend Chart */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative rounded-2xl p-6 overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-full blur-3xl transform translate-x-32 -translate-y-32" />
          
          <div className="relative flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Evolução do Saldo Acumulado</h3>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={balanceTrend}>
                <defs>
                  <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis
                  dataKey="month"
                  tickFormatter={formatMonth}
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
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="cumulative"
                  name="Saldo Acumulado"
                  stroke="#6366f1"
                  strokeWidth={3}
                  fill="url(#balanceGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Year over Year Comparison */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative rounded-2xl p-6 overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 rounded-full blur-3xl transform translate-x-32 -translate-y-32" />
          
          <div className="relative flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-lg">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Comparativo Anual - Despesas</h3>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={yearComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis
                  dataKey="month"
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
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="previousYear"
                  name="Ano Anterior"
                  fill="#6b6b8a"
                  radius={[4, 4, 0, 0]}
                  opacity={0.5}
                />
                <Bar
                  dataKey="currentYear"
                  name="Ano Atual"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
