import { useState } from 'react';
import { Brain, TrendingUp, AlertTriangle, X, Lightbulb, Repeat } from 'lucide-react';
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
      <div className="rounded-2xl p-5 mb-6 glass" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-emerald-500 text-white rounded-2xl">
            <Brain className="w-5 h-5 text-black" />
          </div>
          <h3 className="text-xl font-display font-semibold" style={{ color: 'var(--text-primary)' }}>Sugestões</h3>
        </div>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Adicione mais transações para receber sugestões de automação.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 mb-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-emerald-500 text-white rounded-2xl">
          <Brain className="w-5 h-5 text-black" />
        </div>
        <h3 className="text-xl font-display font-semibold" style={{ color: 'var(--text-primary)' }}>Automação</h3>
        {(activePatterns.length > 0 || predictions.length > 0) && (
          <span className="ml-auto text-sm font-medium px-3 py-1 rounded-2xl" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
            {activePatterns.length + predictions.length} sugestões
          </span>
        )}
      </div>

      {activePatterns.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Padrões detectados</h4>
          {activePatterns.map((pattern, index) => (
            <div key={index} className="rounded-2xl p-4 glass" style={{ borderLeft: `3px solid ${pattern.type === 'recurring' ? 'var(--accent-secondary)' : 'var(--accent-warning)'}` }}>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-2xl" style={{ background: 'var(--bg-tertiary)', color: pattern.type === 'recurring' ? 'var(--accent-secondary)' : 'var(--accent-warning)' }}>
                  {pattern.type === 'recurring' ? <Repeat className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h5 className="font-medium" style={{ color: 'var(--text-primary)' }}>{pattern.description}</h5>
                    <span className="text-xs px-2 py-0.5 rounded-2xl" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                      {pattern.confidence.toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>{pattern.suggestion}</p>

                  {pattern.type === 'recurring' && onCreateRecurring && (
                    <button
                      onClick={() => onCreateRecurring(pattern.transactions[0])}
                      className="text-sm font-medium px-3 py-2 rounded-2xl transition-colors"
                      style={{ background: 'var(--bg-tertiary)', color: 'var(--accent-secondary)' }}
                    >
                      Criar recorrente
                    </button>
                  )}
                </div>
                <button
                  onClick={() => handleDismiss(pattern.description)}
                  className="p-1.5 rounded-2xl transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {predictions.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Previsões de gastos</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {predictions.map((prediction, index) => (
              <div key={index} className="rounded-2xl p-4 glass">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp
                    className="w-4 h-4"
                    style={{
                      color: prediction.trend === 'increasing'
                        ? 'var(--accent-danger)'
                        : prediction.trend === 'decreasing'
                        ? 'var(--accent-success)'
                        : 'var(--accent-secondary)'
                    }}
                  />
                  <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{prediction.category}</span>
                </div>
                <p className="text-xl font-mono font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(prediction.predictedAmount)}
                </p>
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex-1 h-1.5 rounded-2xl overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
                    <div className="h-full rounded-2xl" style={{ width: `${prediction.confidence}%`, background: 'var(--accent-primary)' }} />
                  </div>
                  <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{prediction.confidence.toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl p-4 glass">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-2xl flex-shrink-0" style={{ background: 'var(--bg-tertiary)', color: 'var(--accent-warning)' }}>
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Dica de automação</h4>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              O app identifica padrões recorrentes conforme você registra suas transações.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CategorySuggestion({
  description,
  onSuggest
}: {
  description: string;
  onSuggest: (category: string) => void;
}) {
  const { suggestCategory } = usePatternDetection([]);
  const [suggestedCategory, setSuggestedCategory] = useState<string | null>(null);

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
      className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-2xl transition-colors"
      style={{ background: 'var(--bg-tertiary)', color: 'var(--accent-secondary)' }}
    >
      <Brain className="w-4 h-4" />
      Sugerir: {suggestedCategory}
    </button>
  );
}
