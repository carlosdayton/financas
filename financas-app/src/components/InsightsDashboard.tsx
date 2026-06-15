import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Target,
  Calendar,
  Wallet,
  PiggyBank,
  ArrowDownRight,
  Lightbulb,
  Zap,
  Clock,
  Award,
  AlertCircle,
  BarChart3,
  Sparkles,
  Brain,
  Shield,
  ArrowUpRight
} from 'lucide-react';
import type { Transaction, Goal } from '../types/finance';
import { getCurrentMonthLocalISO, shiftMonthLocalISO } from '../utils/date';

interface InsightsDashboardProps {
  transactions: Transaction[];
  goals: Goal[];
}

interface Insight {
  type: 'success' | 'warning' | 'info' | 'danger' | 'primary';
  icon: React.ReactNode;
  title: string;
  message: string;
  value?: string;
  priority: number;
}

export function InsightsDashboard({ transactions, goals }: InsightsDashboardProps) {

  // Helper functions (defined before the IIFE so they can be used inside)
  function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  function calculateHealthScore(income: number, expense: number, balance: number, goalsList: Goal[]): number {
    let score = 50;
    if (income > 0) {
      const savingsRate = (balance / income) * 100;
      score += Math.min(savingsRate, 30);
    }
    if (goalsList.length > 0) {
      const avgProgress = goalsList.reduce((sum, g) => sum + (g.currentAmount / g.targetAmount), 0) / goalsList.length;
      score += avgProgress * 20;
    }
    if (balance > 0) score += 10;
    if (income > 0 && expense < income) {
      score += 10 * (1 - (expense / income));
    }
    return Math.min(Math.round(score), 100);
  }

  function getHealthStatus(score: number): { message: string } {
    if (score >= 90) return { message: 'Sua saúde financeira está excelente!' };
    if (score >= 70) return { message: 'Boa saúde financeira. Continue assim!' };
    if (score >= 50) return { message: 'Saúde financeira regular. Há espaço para melhorar.' };
    if (score >= 30) return { message: 'Atenção necessária. Revise seus gastos.' };
    return { message: 'Situação crítica. Busque equilibrar suas finanças.' };
  }

  const insights = ((): Insight[] => {
    if (transactions.length === 0) return [];

    const result: Insight[] = [];
    const currentMonth = getCurrentMonthLocalISO();
    const previousMonth = shiftMonthLocalISO(currentMonth, -1);
    const twoMonthsAgo = shiftMonthLocalISO(currentMonth, -2);

    const currentMonthTransactions = transactions.filter(t => t.date.startsWith(currentMonth));
    const currentIncome = currentMonthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const currentExpense = currentMonthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const currentBalance = currentIncome - currentExpense;

    const previousMonthTransactions = transactions.filter(t => t.date.startsWith(previousMonth));
    const previousIncome = previousMonthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const previousExpense = previousMonthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const previousBalance = previousIncome - previousExpense;

    const twoMonthsAgoTransactions = transactions.filter(t => t.date.startsWith(twoMonthsAgo));
    const twoMonthsAgoExpense = twoMonthsAgoTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    // 1. Financial Health Score
    const healthScore = calculateHealthScore(currentIncome, currentExpense, currentBalance, goals);
    const healthStatus = getHealthStatus(healthScore);
    result.push({
      type: healthScore >= 70 ? 'success' : healthScore >= 40 ? 'warning' : 'danger',
      icon: <Shield className="w-5 h-5" />,
      title: 'Saúde Financeira',
      message: healthStatus.message,
      value: `${healthScore}/100`,
      priority: 100,
    });

    // 2. Balance Insight
    if (currentBalance > 0) {
      const balanceChange = previousBalance !== 0
        ? ((currentBalance - previousBalance) / Math.abs(previousBalance)) * 100
        : 0;
      result.push({
        type: 'success',
        icon: <TrendingUp className="w-5 h-5" />,
        title: 'Saldo Positivo',
        message: balanceChange > 0
          ? `Seu saldo melhorou ${balanceChange.toFixed(0)}% em relação ao mês passado!`
          : 'Você está no azul este mês. Continue assim!',
        value: `+${formatCurrency(currentBalance)}`,
        priority: 90,
      });
    } else if (currentBalance < 0) {
      result.push({
        type: 'danger',
        icon: <TrendingDown className="w-5 h-5" />,
        title: 'Saldo Negativo',
        message: `Você precisa reduzir ${formatCurrency(Math.abs(currentBalance))} para equilibrar.`,
        value: formatCurrency(currentBalance),
        priority: 95,
      });
    }

    // 3. Expense Trend
    if (previousExpense > 0) {
      const expenseChange = ((currentExpense - previousExpense) / previousExpense) * 100;
      if (expenseChange > 30) {
        result.push({
          type: 'danger',
          icon: <AlertCircle className="w-5 h-5" />,
          title: 'Aumento Crítico de Gastos',
          message: `Suas despesas aumentaram ${expenseChange.toFixed(0)}%! Revise suas categorias.`,
          priority: 85,
        });
      } else if (expenseChange > 15) {
        result.push({
          type: 'warning',
          icon: <AlertTriangle className="w-5 h-5" />,
          title: 'Aumento de Gastos',
          message: `Despesas ${expenseChange.toFixed(0)}% maiores que o mês passado.`,
          priority: 70,
        });
      } else if (expenseChange < -15) {
        result.push({
          type: 'success',
          icon: <ArrowDownRight className="w-5 h-5" />,
          title: 'Redução de Gastos',
          message: `Excelente! Você economizou ${Math.abs(expenseChange).toFixed(0)}% este mês.`,
          priority: 75,
        });
      }
    }

    // 4. 3-Month Trend
    if (previousExpense > 0 && twoMonthsAgoExpense > 0) {
      const avgExpense = (currentExpense + previousExpense + twoMonthsAgoExpense) / 3;
      const trend = currentExpense > avgExpense * 1.1 ? 'up' : currentExpense < avgExpense * 0.9 ? 'down' : 'stable';
      if (trend === 'up') {
        result.push({
          type: 'warning',
          icon: <BarChart3 className="w-5 h-5" />,
          title: 'Tendência de Alta',
          message: 'Seus gastos estão acima da média dos últimos 3 meses.',
          priority: 65,
        });
      } else if (trend === 'down') {
        result.push({
          type: 'success',
          icon: <Sparkles className="w-5 h-5" />,
          title: 'Tendência de Baixa',
          message: 'Parabéns! Você está gastando menos que a média recente.',
          priority: 65,
        });
      }
    }

    // 5. Goal Progress
    const activeGoals = goals.filter(g => g.currentAmount < g.targetAmount);
    if (activeGoals.length > 0) {
      const closestGoal = activeGoals.sort((a, b) =>
        (b.currentAmount / b.targetAmount) - (a.currentAmount / a.targetAmount)
      )[0];
      const progress = (closestGoal.currentAmount / closestGoal.targetAmount) * 100;
      const remaining = closestGoal.targetAmount - closestGoal.currentAmount;
      if (progress >= 90) {
        result.push({
          type: 'success',
          icon: <Award className="w-5 h-5" />,
          title: 'Meta Quase Atingida! 🎉',
          message: `Faltam apenas ${formatCurrency(remaining)} para "${closestGoal.name}"`,
          value: `${progress.toFixed(0)}%`,
          priority: 80,
        });
      } else if (progress >= 50) {
        result.push({
          type: 'primary',
          icon: <Target className="w-5 h-5" />,
          title: 'Meta na Metade',
          message: `"${closestGoal.name}" está a ${formatCurrency(remaining)} de ser concluída.`,
          value: `${progress.toFixed(0)}%`,
          priority: 60,
        });
      } else {
        result.push({
          type: 'info',
          icon: <PiggyBank className="w-5 h-5" />,
          title: 'Meta em Progresso',
          message: `"${closestGoal.name}": ${progress.toFixed(0)}% completo`,
          priority: 40,
        });
      }
    }

    // 6. Spending Projection
    const daysInMonth = new Date().getDate();
    const daysRemaining = 30 - daysInMonth;
    const dailyAverage = daysInMonth > 0 ? currentExpense / daysInMonth : 0;
    const projectedExpense = currentExpense + (dailyAverage * daysRemaining);
    if (previousExpense > 0) {
      const projectedChange = ((projectedExpense - previousExpense) / previousExpense) * 100;
      if (projectedChange > 25) {
        result.push({
          type: 'danger',
          icon: <Brain className="w-5 h-5" />,
          title: 'Alerta de Projeção',
          message: `Projeção: ${formatCurrency(projectedExpense)} (${projectedChange.toFixed(0)}% acima do mês passado)`,
          priority: 88,
        });
      } else if (projectedChange > 10) {
        result.push({
          type: 'warning',
          icon: <Calendar className="w-5 h-5" />,
          title: 'Projeção de Gastos',
          message: `No ritmo atual, você gastará ${formatCurrency(projectedExpense)}.`,
          priority: 55,
        });
      }
    }

    // 7. Top Category
    const categoryMap = new Map<string, number>();
    currentMonthTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const current = categoryMap.get(t.category) || 0;
        categoryMap.set(t.category, current + t.amount);
      });
    const topCategory = Array.from(categoryMap.entries()).sort((a, b) => b[1] - a[1])[0];
    if (topCategory && topCategory[1] > currentExpense * 0.25) {
      const percentage = (topCategory[1] / currentExpense) * 100;
      result.push({
        type: percentage > 50 ? 'warning' : 'info',
        icon: <Wallet className="w-5 h-5" />,
        title: 'Maior Gasto',
        message: `"${topCategory[0]}" consome ${percentage.toFixed(0)}% do seu orçamento.`,
        value: formatCurrency(topCategory[1]),
        priority: 50,
      });
    }

    // 8. Savings Rate
    if (currentIncome > 0) {
      const savingsRate = (currentBalance / currentIncome) * 100;
      if (savingsRate >= 30) {
        result.push({
          type: 'success',
          icon: <Zap className="w-5 h-5" />,
          title: 'Excelente Economista!',
          message: `Você está economizando ${savingsRate.toFixed(0)}% da renda. Meta de especialistas!`,
          priority: 85,
        });
      } else if (savingsRate >= 20) {
        result.push({
          type: 'success',
          icon: <Lightbulb className="w-5 h-5" />,
          title: 'Boa Taxa de Economia',
          message: `Você está economizando ${savingsRate.toFixed(0)}% da sua renda.`,
          priority: 70,
        });
      } else if (savingsRate < 5 && savingsRate >= 0) {
        result.push({
          type: 'warning',
          icon: <Clock className="w-5 h-5" />,
          title: 'Economia Baixa',
          message: `Apenas ${savingsRate.toFixed(0)}% economizado. Tente atingir 10-20%.`,
          priority: 72,
        });
      }
    }

    // 9. Income Stability
    if (previousIncome > 0) {
      const incomeChange = ((currentIncome - previousIncome) / previousIncome) * 100;
      if (incomeChange > 10) {
        result.push({
          type: 'success',
          icon: <ArrowUpRight className="w-5 h-5" />,
          title: 'Renda Crescente',
          message: `Sua renda aumentou ${incomeChange.toFixed(0)}% em relação ao mês passado!`,
          priority: 78,
        });
      } else if (incomeChange < -20) {
        result.push({
          type: 'warning',
          icon: <TrendingDown className="w-5 h-5" />,
          title: 'Queda de Renda',
          message: `Sua renda caiu ${Math.abs(incomeChange).toFixed(0)}%. Atenção aos gastos!`,
          priority: 82,
        });
      }
    }

    return result.sort((a, b) => b.priority - a.priority).slice(0, 6);
  })();

  const getTypeStyles = (type: Insight['type']) => {
    switch (type) {
      case 'success':
        return { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', icon: 'text-emerald-400', text: 'text-emerald-400' };
      case 'warning':
        return { bg: 'bg-amber-500/10', border: 'border-amber-500/30', icon: 'text-amber-400', text: 'text-amber-400' };
      case 'danger':
        return { bg: 'bg-red-500/10', border: 'border-red-500/30', icon: 'text-red-400', text: 'text-red-400' };
      case 'primary':
        return { bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', icon: 'text-indigo-400', text: 'text-indigo-400' };
      case 'info':
      default:
        return { bg: 'bg-blue-500/10', border: 'border-blue-500/30', icon: 'text-blue-400', text: 'text-blue-400' };
    }
  };

  if (insights.length === 0) {
    return (
      <div className="relative mb-8 group animate-in slide-in-from-bottom-4 duration-700">
        <div className="relative rounded-2xl p-8 text-center glass transition-all duration-300">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-emerald-500 text-white text-black transition-colors">
            <Lightbulb className="w-8 h-8 transition-colors duration-300" />
          </div>
          <h3 className="text-xl font-display font-bold mb-2">Sem Insights Disponíveis</h3>
          <p className="text-[var(--text-muted)]">Adicione mais transações para receber insights personalizados.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mb-8 group animate-in slide-in-from-bottom-4 duration-700">
      <div className="relative rounded-2xl p-6 glass transition-all duration-300">
        <div className="flex items-center gap-3 mb-6 relative border-b border-[var(--border-color)] pb-4">
          <div className="p-2.5 bg-emerald-500 text-white rounded-2xl shadow-none">
            <Brain className="w-5 h-5 text-black" />
          </div>
          <h2 className="text-2xl font-display font-semibold">Insights Inteligentes</h2>
          <span className="ml-auto text-sm font-medium px-3 py-1 rounded-2xl border border-[var(--border-color)] text-[var(--text-muted)]">
            {insights.length} análises
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((insight, index) => {
            const styles = getTypeStyles(insight.type);
            return (
                <div
                  key={index}
                  className={`p-4 rounded-2xl border ${styles.bg} ${styles.border} transition-all duration-300 hover:-translate-y-1 cursor-pointer`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-2xl ${styles.icon} bg-[var(--bg-tertiary)] border border-[var(--border-color)]`}>
                      {insight.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold truncate text-[var(--text-primary)]">{insight.title}</h3>
                        {insight.value && (
                          <span className={`text-lg font-mono font-bold ${styles.text} whitespace-nowrap`}>
                            {insight.value}
                          </span>
                        )}
                      </div>
                      <p className="text-sm mt-1 text-[var(--text-secondary)]">{insight.message}</p>
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

