import { useState } from 'react';
import { Target, Plus, Trash2, TrendingUp, Calendar, CheckCircle2, Check } from 'lucide-react';
import type { Goal } from '../types/finance';

interface GoalsProps {
  goals: Goal[];
  onAddGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'currentAmount'>) => void;
  onUpdateGoal: (id: string, updates: Partial<Goal>) => void;
  onDeleteGoal: (id: string) => void;
  onContribute: (goalId: string, amount: number) => void;
}

const GOAL_COLORS = [
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Sky', value: '#0ea5e9' },
  { name: 'Violet', value: '#8b5cf6' },
];

export function Goals({ goals, onAddGoal, onDeleteGoal, onContribute }: GoalsProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: '',
    targetAmount: '',
    deadline: '',
    color: GOAL_COLORS[0].value,
  });
  const [contributingTo, setContributingTo] = useState<string | null>(null);
  const [contributionAmount, setContributionAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.name || !newGoal.targetAmount) return;

    onAddGoal({
      name: newGoal.name,
      targetAmount: parseFloat(newGoal.targetAmount),
      deadline: newGoal.deadline || undefined,
      color: newGoal.color,
    });

    setNewGoal({ name: '', targetAmount: '', deadline: '', color: GOAL_COLORS[0].value });
    setIsAdding(false);
  };

  const handleContribute = (goalId: string) => {
    const amount = parseFloat(contributionAmount);
    if (amount > 0) {
      onContribute(goalId, amount);
      setContributingTo(null);
      setContributionAmount('');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getDaysRemaining = (deadline: string) => {
    const days = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  return (
    <div className="space-y-5 animate-fade-in-up">
      {/* Header Banner */}
      <div className="glass p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-display font-bold" style={{ color: 'var(--text-primary)' }}>
              Metas & Objetivos Financeiros
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              {goals.length} {goals.length === 1 ? 'meta em andamento' : 'metas em andamento'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-500/20"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Nova Meta
        </button>
      </div>

      {/* Form */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="glass p-5 rounded-2xl space-y-4 animate-fade-in">
          <h3 className="text-sm font-display font-bold" style={{ color: 'var(--text-primary)' }}>
            Criar Nova Meta
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Nome da Meta
              </label>
              <input
                type="text"
                value={newGoal.name}
                onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                placeholder="Ex: Viagem de Férias, Reserva de Emergência..."
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-indigo-500/50"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Valor Alvo (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={newGoal.targetAmount}
                onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                placeholder="0,00"
                className="w-full px-3.5 py-2.5 text-sm font-mono font-bold rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Data Limite (Opcional)
              </label>
              <input
                type="date"
                value={newGoal.deadline}
                onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Cor Identificadora
              </label>
              <div className="flex items-center gap-2">
                {GOAL_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setNewGoal({ ...newGoal, color: color.value })}
                    className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                      newGoal.color === color.value ? 'ring-2 ring-white scale-110' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.value }}
                  >
                    {newGoal.color === color.value && <Check className="w-3.5 h-3.5 text-black stroke-[3]" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-color)]">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-500 hover:bg-indigo-600 shadow-md shadow-indigo-500/20"
            >
              Salvar Meta
            </button>
          </div>
        </form>
      )}

      {/* Goals Cards Grid */}
      {goals.length === 0 ? (
        <div className="glass p-8 text-center rounded-2xl">
          <Target className="w-10 h-10 mx-auto mb-3 text-[var(--text-muted)]" />
          <h4 className="text-base font-display font-semibold" style={{ color: 'var(--text-primary)' }}>
            Nenhuma meta definida ainda
          </h4>
          <p className="text-xs text-[var(--text-muted)] mt-1 max-w-xs mx-auto">
            Crie sua primeira meta financeira para acompanhar o progresso de suas economias.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {goals.map((goal) => {
            const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
            const isCompleted = progress >= 100;

            return (
              <div
                key={goal.id}
                className="glass p-5 rounded-2xl border border-[var(--border-color)] group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/10"
                        style={{ backgroundColor: `${goal.color}25` }}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5" style={{ color: goal.color }} />
                        ) : (
                          <Target className="w-5 h-5" style={{ color: goal.color }} />
                        )}
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-base" style={{ color: 'var(--text-primary)' }}>
                          {goal.name}
                        </h3>
                        {goal.deadline && (
                          <p className="text-xs flex items-center gap-1 text-[var(--text-muted)] mt-0.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {getDaysRemaining(goal.deadline)} dias restantes
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteGoal(goal.id)}
                      className="p-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all text-[var(--text-muted)] hover:text-rose-400 hover:bg-rose-500/10"
                      title="Excluir meta"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                      <span className="text-[var(--text-secondary)] font-mono">
                        {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                      </span>
                      <span style={{ color: goal.color }}>{progress.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${progress}%`, backgroundColor: goal.color }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[var(--border-color)]">
                  {contributingTo === goal.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={contributionAmount}
                        onChange={(e) => setContributionAmount(e.target.value)}
                        placeholder="R$ 0,00"
                        className="flex-1 min-w-0 px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none"
                        autoFocus
                      />
                      <button
                        onClick={() => handleContribute(goal.id)}
                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                      >
                        Confirmar
                      </button>
                      <button
                        onClick={() => {
                          setContributingTo(null);
                          setContributionAmount('');
                        }}
                        className="px-2 py-1.5 rounded-xl text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                      >
                        X
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setContributingTo(goal.id)}
                      disabled={isCompleted}
                      className="w-full py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] border border-[var(--border-color)]"
                    >
                      <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                      {isCompleted ? 'Meta Concluída!' : '+ Depositar Valor'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
