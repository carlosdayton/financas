import { Bell, X, Check } from 'lucide-react';

export interface AlertPreferencesState {
  budgetThreshold: boolean;
  budgetExceeded: boolean;
  negativeBalance: boolean;
}

interface AlertPreferencesProps {
  preferences: AlertPreferencesState;
  onChange: (updates: Partial<AlertPreferencesState>) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export function AlertPreferences({ preferences, onChange, isOpen, onClose }: AlertPreferencesProps) {
  if (isOpen !== undefined && !isOpen) return null;

  const content = (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-display font-semibold" style={{ color: 'var(--text-primary)' }}>
              Preferências de Alertas
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Configure quando deseja ser notificado no sistema
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="space-y-2.5">
        <label
          onClick={() => onChange({ budgetThreshold: !preferences.budgetThreshold })}
          className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all duration-200 ${
            preferences.budgetThreshold
              ? 'bg-emerald-500/10 border-emerald-500/30'
              : 'bg-[var(--bg-tertiary)] border-[var(--border-color)] hover:border-[var(--text-muted)]'
          }`}
        >
          <div className="min-w-0 pr-3">
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Aviso de Limite de Orçamento (80%)
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Alerta quando uma categoria atingir 80% do teto estipulado.
            </p>
          </div>
          <div
            className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${
              preferences.budgetThreshold ? 'bg-emerald-500 text-black' : 'border border-[var(--border-color)] bg-[var(--bg-secondary)]'
            }`}
          >
            {preferences.budgetThreshold && <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </div>
        </label>

        <label
          onClick={() => onChange({ budgetExceeded: !preferences.budgetExceeded })}
          className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all duration-200 ${
            preferences.budgetExceeded
              ? 'bg-rose-500/10 border-rose-500/30'
              : 'bg-[var(--bg-tertiary)] border-[var(--border-color)] hover:border-[var(--text-muted)]'
          }`}
        >
          <div className="min-w-0 pr-3">
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Orçamento Excedido (100%)
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Alerta imediato quando os gastos ultrapassarem o orçamento.
            </p>
          </div>
          <div
            className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${
              preferences.budgetExceeded ? 'bg-rose-500 text-white' : 'border border-[var(--border-color)] bg-[var(--bg-secondary)]'
            }`}
          >
            {preferences.budgetExceeded && <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </div>
        </label>

        <label
          onClick={() => onChange({ negativeBalance: !preferences.negativeBalance })}
          className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all duration-200 ${
            preferences.negativeBalance
              ? 'bg-amber-500/10 border-amber-500/30'
              : 'bg-[var(--bg-tertiary)] border-[var(--border-color)] hover:border-[var(--text-muted)]'
          }`}
        >
          <div className="min-w-0 pr-3">
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Saldo Mensal Negativo
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Alerta caso o balanço de despesas do mês superem as receitas.
            </p>
          </div>
          <div
            className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${
              preferences.negativeBalance ? 'bg-amber-500 text-black' : 'border border-[var(--border-color)] bg-[var(--bg-secondary)]'
            }`}
          >
            {preferences.negativeBalance && <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </div>
        </label>
      </div>
    </div>
  );

  if (isOpen !== undefined) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
        <div
          className="w-full max-w-md p-6 glass rounded-2xl animate-in zoom-in-95 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="glass p-5 rounded-2xl mb-6">
      {content}
    </div>
  );
}
