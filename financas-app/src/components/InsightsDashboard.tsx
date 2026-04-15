import { useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Target, 
  Calendar,
  Wallet,
  PiggyBank,
  ArrowDownRight,
  Lightbulb
} from 'lucide-react';
import type { Transaction, Goal } from '../types/finance';

interface InsightsDashboardProps {
  transactions: Transaction[];
  goals: Goal[];
}

interface Insight {
  type: 'success' | 'warning' | 'info' | 'danger';
  icon: React.ReactNode;
  title: string;
  message: string;
  value?: string;
}

export function InsightsDashboard({ transactions, goals }: InsightsDashboardProps) {
  const insights = useMemo((): Insight[] => {
    if (transactions.length === 0) return [];

    const result: Insight[] = [];
    const currentMonth = new Date().toISOString().substring(0, 7);
    const previousMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 7);

    // Current month stats
    const currentMonthTransactions = transactions.filter(t => t.date.startsWith(currentMonth));
    const currentIncome = currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const currentExpense = currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const currentBalance = currentIncome - currentExpense;

    // Previous month stats
    const previousMonthTransactions = transactions.filter(t => t.date.startsWith(previousMonth));
    const previousIncome = previousMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const previousExpense = previousMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Mark as used to avoid TypeScript errors
    void previousIncome;

    // Balance insight
    if (currentBalance > 0) {
      result.push({
        type: 'success',
        icon: <TrendingUp className="w-5 h-5" />,
        title: 'Saldo Positivo',
        message: 'Você está economizando este mês!',
        value: `+${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(currentBalance)}`,
      });
    } else if (currentBalance < 0) {
      result.push({
        type: 'danger',
        icon: <TrendingDown className="w-5 h-5" />,
        title: 'Saldo Negativo',
        message: 'Suas despesas superaram suas receitas.',
        value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(currentBalance),
      });
    }

    // Expense trend
    if (previousExpense > 0) {
      const expenseChange = ((currentExpense - previousExpense) / previousExpense) * 100;
      if (expenseChange > 20) {
        result.push({
          type: 'warning',
          icon: <AlertTriangle className="w-5 h-5" />,
          title: 'Aumento de Gastos',
          message: `Suas despesas aumentaram ${expenseChange.toFixed(0)}% em relação ao mês passado.`,
        });
      } else if (expenseChange < -10) {
        result.push({
          type: 'success',
          icon: <ArrowDownRight className="w-5 h-5" />,
          title: 'Redução de Gastos',
          message: `Parabéns! Você reduziu ${Math.abs(expenseChange).toFixed(0)}% dos gastos.`,
        });
      }
    }

    // Goal progress
    const activeGoals = goals.filter(g => g.currentAmount < g.targetAmount);
    if (activeGoals.length > 0) {
      const closestGoal = activeGoals.sort((a, b) => 
        (b.currentAmount / b.targetAmount) - (a.currentAmount / a.targetAmount)
      )[0];
      const progress = (closestGoal.currentAmount / closestGoal.targetAmount) * 100;
      
      if (progress >= 80) {
        result.push({
          type: 'success',
          icon: <Target className="w-5 h-5" />,
          title: 'Meta Quase Atingida!',
          message: `Você atingiu ${progress.toFixed(0)}% da meta "${closestGoal.name}"`,
        });
      } else {
        result.push({
          type: 'info',
          icon: <PiggyBank className="w-5 h-5" />,
          title: 'Continue Economizando',
          message: `Meta "${closestGoal.name}" está em ${progress.toFixed(0)}%`,
        });
      }
    }

    // Daily average
    const daysInMonth = new Date().getDate();
    const dailyAverage = currentExpense / daysInMonth;
    const daysRemaining = 30 - daysInMonth;
    const projectedExpense = currentExpense + (dailyAverage * daysRemaining);
    
    if (previousExpense > 0 && projectedExpense > previousExpense * 1.1) {
      result.push({
        type: 'warning',
        icon: <Calendar className="w-5 h-5" />,
        title: 'Projeção de Gastos',
        message: `No ritmo atual, você gastará ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(projectedExpense)} este mês.`,
      });
    }

    // Biggest expense category
    const categoryMap = new Map<string, number>();
    currentMonthTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const current = categoryMap.get(t.category) || 0;
        categoryMap.set(t.category, current + t.amount);
      });
    
    const topCategory = Array.from(categoryMap.entries()).sort((a, b) => b[1] - a[1])[0];
    if (topCategory && topCategory[1] > currentExpense * 0.3) {
      result.push({
        type: 'info',
        icon: <Wallet className="w-5 h-5" />,
        title: 'Maior Categoria',
        message: `"${topCategory[0]}" representa ${((topCategory[1] / currentExpense) * 100).toFixed(0)}% dos seus gastos.`,
      });
    }

    // Savings rate
    if (currentIncome > 0) {
      const savingsRate = (currentBalance / currentIncome) * 100;
      if (savingsRate >= 20) {
        result.push({
          type: 'success',
          icon: <Lightbulb className="w-5 h-5" />,
          title: 'Excelente Taxa de Economia!',
          message: `Você está economizando ${savingsRate.toFixed(0)}% da sua renda.`,
        });
      } else if (savingsRate < 5 && savingsRate > 0) {
        result.push({
          type: 'warning',
          icon: <Lightbulb className="w-5 h-5" />,
          title: 'Dica de Economia',
          message: 'Tente economizar pelo menos 10% da sua renda.',
        });
      }
    }

    return result.slice(0, 6); // Limit to 6 insights
  }, [transactions, goals]);

  const getTypeStyles = (type: Insight['type']) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/30',
          icon: 'text-emerald-400',
          text: 'text-emerald-400',
        };
      case 'warning':
        return {
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/30',
          icon: 'text-amber-400',
          text: 'text-amber-400',
        };
      case 'danger':
        return {
          bg: 'bg-red-500/10',
          border: 'border-red-500/30',
          icon: 'text-red-400',
          text: 'text-red-400',
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-500/10',
          border: 'border-blue-500/30',
          icon: 'text-blue-400',
          text: 'text-blue-400',
        };
    }
  };

  if (insights.length === 0) {
    return (
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl blur-xl" />
        <div className="relative bg-[#16162a] rounded-2xl border border-[#2a2a45] p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: 'var(--bg-tertiary)' }}>
            <Lightbulb className="w-8 h-8" style={{ color: 'var(--text-muted)' }} />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Sem Insights Disponíveis</h3>
          <p className="text-[#a0a0b8]">Adicione mais transações para receber insights personalizados.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mb-8">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl blur-xl" />
      
      <div className="relative rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-lg">
            <Lightbulb className="w-5 h-5 text-indigo-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Insights & Análises</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((insight, index) => {
            const styles = getTypeStyles(insight.type);
            return (
              <div
                key={index}
                className={`p-4 rounded-xl border ${styles.bg} ${styles.border} transition-all hover:scale-[1.02]`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg bg-[#1a1a2e] ${styles.icon}`}>
                    {insight.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-white truncate">{insight.title}</h3>
                      {insight.value && (
                        <span className={`text-lg font-bold ${styles.text} whitespace-nowrap`}>
                          {insight.value}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#a0a0b8] mt-1">{insight.message}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
