import { useMemo, useCallback } from 'react';
import type { Transaction } from '../types/finance';

interface DetectedPattern {
  type: 'recurring' | 'category_suggestion' | 'spending_spike' | 'unusual_time';
  description: string;
  confidence: number; // 0-100
  transactions: Transaction[];
  suggestion?: string;
}

interface SpendingPrediction {
  category: string;
  predictedAmount: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export function usePatternDetection(transactions: Transaction[]) {
  // Detect recurring transactions automatically
  const detectRecurringPatterns = useCallback((): DetectedPattern[] => {
    const patterns: DetectedPattern[] = [];
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    
    // Group by description similarity
    const groups = new Map<string, Transaction[]>();
    
    expenseTransactions.forEach(t => {
      const normalizedDesc = t.description.toLowerCase().trim();
      let found = false;
      
      groups.forEach((group, key) => {
        if (similarity(normalizedDesc, key) > 0.8) {
          group.push(t);
          found = true;
        }
      });
      
      if (!found) {
        groups.set(normalizedDesc, [t]);
      }
    });
    
    // Check for monthly patterns
    groups.forEach((group, description) => {
      if (group.length >= 2) {
        const dates = group.map(t => new Date(t.date)).sort((a, b) => a.getTime() - b.getTime());
        const intervals: number[] = [];
        
        for (let i = 1; i < dates.length; i++) {
          const days = (dates[i].getTime() - dates[i-1].getTime()) / (1000 * 60 * 60 * 24);
          intervals.push(days);
        }
        
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        
        // Check if intervals are consistent (monthly ~30 days)
        if (avgInterval >= 25 && avgInterval <= 35) {
          const amounts = group.map(t => t.amount);
          const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
          const amountVariance = Math.max(...amounts) - Math.min(...amounts);
          
          if (amountVariance / avgAmount < 0.1) { // Less than 10% variance
            patterns.push({
              type: 'recurring',
              description: `Transação recorrente detectada: "${description}"`,
              confidence: Math.min(group.length * 20, 95),
              transactions: group,
              suggestion: `Considere criar uma transação recorrente para "${description}" de ${formatCurrency(avgAmount)}`,
            });
          }
        }
      }
    });
    
    return patterns;
  }, [transactions]);

  // Suggest categories based on description
  const suggestCategory = useCallback((description: string): string | null => {
    const normalized = description.toLowerCase();
    
    // Category rules based on keywords
    const rules: { [key: string]: string[] } = {
      'Alimentação': ['mercado', 'supermercado', 'restaurante', 'lanche', 'pizza', 'ifood', 'uber eats', 'rappi'],
      'Transporte': ['uber', '99', 'taxi', 'combustível', 'gasolina', 'ônibus', 'metrô', 'estacionamento'],
      'Saúde': ['farmácia', 'remédio', 'médico', 'consulta', 'exame', 'dentista', 'hospital'],
      'Educação': ['curso', 'livro', 'escola', 'faculdade', 'universidade', 'aula', 'professor'],
      'Entretenimento': ['cinema', 'netflix', 'spotify', 'youtube', 'jogo', 'streaming', 'show', 'teatro'],
      'Moradia': ['aluguel', 'condomínio', 'luz', 'água', 'internet', 'telefone', 'gás'],
      'Vestuário': ['roupa', 'sapato', 'calçado', 'loja', 'shopping', 'camiseta', 'calça'],
      'Tecnologia': ['celular', 'computador', 'notebook', 'tablet', 'eletrônico', 'aplicativo'],
    };
    
    for (const [category, keywords] of Object.entries(rules)) {
      if (keywords.some(keyword => normalized.includes(keyword))) {
        return category;
      }
    }
    
    // Find similar past transactions
    const similarTransactions = transactions.filter(t => 
      similarity(t.description.toLowerCase(), normalized) > 0.7
    );
    
    if (similarTransactions.length > 0) {
      // Return most common category
      const categories = similarTransactions.map(t => t.category);
      return mode(categories);
    }
    
    return null;
  }, [transactions]);

  // Detect spending spikes
  const detectSpendingSpikes = useCallback((): DetectedPattern[] => {
    const patterns: DetectedPattern[] = [];
    const currentMonth = new Date().toISOString().substring(0, 7);
    const previousMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 7);
    
    // Get category spending for current and previous month
    const categories = new Set(transactions.map(t => t.category));
    
    categories.forEach(category => {
      const currentSpending = transactions
        .filter(t => t.category === category && t.type === 'expense' && t.date.startsWith(currentMonth))
        .reduce((sum, t) => sum + t.amount, 0);
      
      const previousSpending = transactions
        .filter(t => t.category === category && t.type === 'expense' && t.date.startsWith(previousMonth))
        .reduce((sum, t) => sum + t.amount, 0);
      
      if (previousSpending > 0) {
        const increase = ((currentSpending - previousSpending) / previousSpending) * 100;
        
        if (increase > 50) {
          const categoryTransactions = transactions.filter(t => 
            t.category === category && t.date.startsWith(currentMonth)
          );
          
          patterns.push({
            type: 'spending_spike',
            description: `Aumento significativo em ${category}`,
            confidence: Math.min(increase, 95),
            transactions: categoryTransactions,
            suggestion: `Você gastou ${increase.toFixed(0)}% mais em ${category} este mês`,
          });
        }
      }
    });
    
    return patterns;
  }, [transactions]);

  // Predict future spending
  const predictSpending = useCallback((): SpendingPrediction[] => {
    const predictions: SpendingPrediction[] = [];
    const categories = new Set(transactions.map(t => t.category));
    
    categories.forEach(category => {
      const categoryTransactions = transactions
        .filter(t => t.category === category && t.type === 'expense')
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      if (categoryTransactions.length >= 3) {
        // Get last 3 months
        const monthlyTotals: number[] = [];
        for (let i = 0; i < 3; i++) {
          const month = new Date();
          month.setMonth(month.getMonth() - i);
          const monthStr = month.toISOString().substring(0, 7);
          
          const total = categoryTransactions
            .filter(t => t.date.startsWith(monthStr))
            .reduce((sum, t) => sum + t.amount, 0);
          monthlyTotals.push(total);
        }
        
        // Calculate trend
        const avg = monthlyTotals.reduce((a, b) => a + b, 0) / monthlyTotals.length;
        const trend = monthlyTotals[0] > monthlyTotals[1] 
          ? 'increasing' 
          : monthlyTotals[0] < monthlyTotals[1] 
          ? 'decreasing' 
          : 'stable';
        
        // Calculate confidence based on consistency
        const variance = Math.max(...monthlyTotals) - Math.min(...monthlyTotals);
        const confidence = Math.max(0, 100 - (variance / avg) * 100);
        
        predictions.push({
          category,
          predictedAmount: avg,
          confidence,
          trend,
        });
      }
    });
    
    return predictions.sort((a, b) => b.confidence - a.confidence);
  }, [transactions]);

  // Get all patterns
  const allPatterns = useMemo(() => {
    return [
      ...detectRecurringPatterns(),
      ...detectSpendingSpikes(),
    ];
  }, [detectRecurringPatterns, detectSpendingSpikes]);

  return {
    patterns: allPatterns,
    suggestCategory,
    predictSpending,
    detectRecurringPatterns,
    detectSpendingSpikes,
  };
}

// Helper functions
function similarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

function mode(arr: string[]): string | null {
  if (arr.length === 0) return null;
  
  const counts = new Map<string, number>();
  arr.forEach(item => {
    counts.set(item, (counts.get(item) || 0) + 1);
  });
  
  let maxCount = 0;
  let maxItem: string | null = null;
  
  counts.forEach((count, item) => {
    if (count > maxCount) {
      maxCount = count;
      maxItem = item;
    }
  });
  
  return maxItem;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}
