import { useState } from 'react';
import { Brain, Sparkles, TrendingUp, AlertTriangle, X, Lightbulb, Repeat } from 'lucide-react';
import { usePatternDetection } from '../hooks/usePatternDetection';
import type { Transaction } from '../types/finance';

interface SmartSuggestionsProps {
  transactions: Transaction[];
  onCreateRecurring?: (transaction: Transaction) => void;
}

export function SmartSuggestions({ transactions, onCreateRecurring }: SmartSuggestionsProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const { patterns, predictSpending } = usePatternDetection(transactions);
  
  const activePatterns = patterns.filter(p => !dismissed.has(p.description));
  const predictions = predictSpending().slice(0, 3);

  const handleDismiss = (description: string) => {
    setDismissed(prev => new Set([...prev, description]));
  };

  if (transactions.length < 3) {
    return (
      <div className="rounded-2xl p-6 mb-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-indigo-500/20">
            <Brain className="w-5 h-5 text-indigo-400" />
          </div>
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Sugestões Inteligentes</h3>
        </div>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Adicione mais transações para receber sugestões personalizadas de automação.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
          <Sparkles className="w-5 h-5 text-indigo-400" />
        </div>
        <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Automação Inteligente</h3>
        {(activePatterns.length > 0 || predictions.length > 0) && (
          <span className="ml-auto text-xs px-2 py-1 rounded-full bg-indigo-500/20 text-indigo-400">
            {activePatterns.length + predictions.length} sugestões
          </span>
        )}
      </div>

      {/* Detected Patterns */}
      {activePatterns.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Padrões Detectados</h4>
          {activePatterns.map((pattern, index) => (
            <div
              key={index}
              className="relative rounded-xl p-4 transition-all hover:scale-[1.01]"
              style={{ 
                background: 'var(--bg-card)', 
                border: '1px solid var(--border-color)',
                borderLeft: `4px solid ${pattern.type === 'recurring' ? '#6366f1' : '#f59e0b'}`
              }}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${pattern.type === 'recurring' ? 'bg-indigo-500/20' : 'bg-amber-500/20'}`}>
                  {pattern.type === 'recurring' ? (
                    <Repeat className="w-5 h-5 text-indigo-400" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h5 className="font-medium" style={{ color: 'var(--text-primary)' }}>{pattern.description}</h5>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                      {pattern.confidence.toFixed(0)}% confiança
                    </span>
                  </div>
                  <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>{pattern.suggestion}</p>
                  
                  {pattern.type === 'recurring' && onCreateRecurring && (
                    <button
                      onClick={() => onCreateRecurring(pattern.transactions[0])}
                      className="text-sm px-3 py-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg hover:bg-indigo-500/30 transition-colors"
                    >
                      Criar Recorrente
                    </button>
                  )}
                </div>
                <button
                  onClick={() => handleDismiss(pattern.description)}
                  className="p-1 rounded-lg hover:bg-red-500/20 transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Spending Predictions */}
      {predictions.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Previsões de Gastos</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {predictions.map((prediction, index) => (
              <div
                key={index}
                className="rounded-xl p-4"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className={`w-4 h-4 ${
                    prediction.trend === 'increasing' ? 'text-red-400' :
                    prediction.trend === 'decreasing' ? 'text-emerald-400' :
                    'text-blue-400'
                  }`} />
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{prediction.category}</span>
                </div>
                <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(prediction.predictedAmount)}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                      style={{ width: `${prediction.confidence}%` }}
                    />
                  </div>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{prediction.confidence.toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="rounded-xl p-4" style={{ background: 'var(--bg-tertiary)' }}>
        <div className="flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Dica de Automação</h4>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              O sistema aprende com suas transações e sugere padrões recorrentes automaticamente. 
              Quanto mais você usa, mais inteligentes ficam as sugestões!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Category suggestion helper component
export function CategorySuggestion({ 
  description, 
  onSuggest 
}: { 
  description: string; 
  onSuggest: (category: string) => void;
}) {
  const { suggestCategory } = usePatternDetection([]);
  const [suggestedCategory, setSuggestedCategory] = useState<string | null>(null);
  
  // Get suggestion when description changes
  useState(() => {
    if (description.length > 2) {
      const category = suggestCategory(description);
      setSuggestedCategory(category);
    }
  });

  if (!suggestedCategory) return null;

  return (
    <button
      onClick={() => onSuggest(suggestedCategory)}
      className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 transition-colors"
    >
      <Brain className="w-4 h-4" />
      Sugerir: {suggestedCategory}
    </button>
  );
}
