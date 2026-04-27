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
  const insights = (() : Insight[] => {
    if (transactions.length === 0) return [];

    const result: Insight[] = [];
    const currentMonth = getCurrentMonthLocalISO();
    const previousMonth = shiftMonthLocalISO(currentMonth, -1);
    const twoMonthsAgo = shiftMonthLocalISO(currentMonth, -2);

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
    const previousBalance = previousIncome - previousExpense;

    // Two months ago stats
    const twoMonthsAgoTransactions = transactions.filter(t => t.date.startsWith(twoMonthsAgo));
    const twoMonthsAgoExpense = twoMonthsAgoTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // 1. FINANCIAL HEALTH SCORE (NEW)
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

    // 2. BALANCE INSIGHT (IMPROVED)
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

    // 3. EXPENSE TREND (IMPROVED)
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

    // 4. 3-MONTH TREND (NEW)
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

    // 5. GOAL PROGRESS (IMPROVED)
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

    // 6. SPENDING PROJECTION (IMPROVED)
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

    // 7. TOP CATEGORY (IMPROVED)
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

    // 8. SAVINGS RATE (IMPROVED)
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

    // 9. INCOME STABILITY (NEW)
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

    // Sort by priority and return top 6
    return result.sort((a, b) => b.priority - a.priority).slice(0, 6);
  })();

  // Helper functions
  function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  function calculateHealthScore(income: number, expense: number, balance: number, goalsList: Goal[]): number {
    let score = 50; // Base score
    
    // Savings rate (0-30 points)
    if (income > 0) {
      const savingsRate = (balance / income) * 100;
      score += Math.min(savingsRate, 30);
    }
    
    // Goal progress (0-20 points)
    if (goalsList.length > 0) {
      const avgProgress = goalsList.reduce((sum, g) => sum + (g.currentAmount / g.targetAmount), 0) / goalsList.length;
      score += avgProgress * 20;
    }
    
    // Positive balance bonus (10 points)
    if (balance > 0) score += 10;
    
    // Expense control (0-10 points)
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
      case 'primary':
        return {
          bg: 'bg-indigo-500/10',
          border: 'border-indigo-500/30',
          icon: 'text-indigo-400',
          text: 'text-indigo-400',
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
        <div className="relative rounded-2xl p-8 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: 'var(--bg-tertiary)' }}>
            <Lightbulb className="w-8 h-8" style={{ color: 'var(--text-muted)' }} />
          </div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Sem Insights Disponíveis</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Adicione mais transações para receber insights personalizados.</p>
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
            <Brain className="w-5 h-5 text-indigo-400" />
          </div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Insights Inteligentes</h2>
          <span className="ml-auto text-xs px-2 py-1 rounded-full bg-indigo-500/20 text-indigo-400">
            {insights.length} análises
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((insight, index) => {
            const styles = getTypeStyles(insight.type);
            return (
              <div
                key={index}
                className={`p-4 rounded-xl border ${styles.bg} ${styles.border} transition-all hover:scale-[1.02] cursor-pointer`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${styles.icon}`} style={{ background: 'var(--bg-tertiary)' }}>
                    {insight.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{insight.title}</h3>
                      {insight.value && (
                        <span className={`text-lg font-bold ${styles.text} whitespace-nowrap`}>
                          {insight.value}
                        </span>
                      )}
                    </div>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{insight.message}</p>
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
