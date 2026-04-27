import { Bell } from 'lucide-react';

export interface AlertPreferencesState {
  budgetThreshold: boolean;
  budgetExceeded: boolean;
  negativeBalance: boolean;
}

interface AlertPreferencesProps {
  preferences: AlertPreferencesState;
  onChange: (updates: Partial<AlertPreferencesState>) => void;
}

export function AlertPreferences({ preferences, onChange }: AlertPreferencesProps) {
  return (
    <div className="relative mb-8">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 rounded-2xl blur-xl" />
      <div className="relative rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-indigo-500/20">
            <Bell className="w-5 h-5 text-indigo-400" />
          </div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Preferencias de Alertas</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <label className="rounded-xl p-3 cursor-pointer" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
            <input
              type="checkbox"
              className="mr-2"
              checked={preferences.budgetThreshold}
              onChange={(e) => onChange({ budgetThreshold: e.target.checked })}
            />
            <span style={{ color: 'var(--text-primary)' }}>Orcamento em 80%</span>
          </label>
          <label className="rounded-xl p-3 cursor-pointer" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
            <input
              type="checkbox"
              className="mr-2"
              checked={preferences.budgetExceeded}
              onChange={(e) => onChange({ budgetExceeded: e.target.checked })}
            />
            <span style={{ color: 'var(--text-primary)' }}>Orcamento excedido</span>
          </label>
          <label className="rounded-xl p-3 cursor-pointer" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
            <input
              type="checkbox"
              className="mr-2"
              checked={preferences.negativeBalance}
              onChange={(e) => onChange({ negativeBalance: e.target.checked })}
            />
            <span style={{ color: 'var(--text-primary)' }}>Saldo mensal negativo</span>
          </label>
        </div>
      </div>
    </div>
  );
}
