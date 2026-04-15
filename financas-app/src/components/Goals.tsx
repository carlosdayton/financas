import { useState } from 'react';
import { Target, Plus, Trash2, TrendingUp, Calendar, CheckCircle2 } from 'lucide-react';
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
  { name: 'Cyan', value: '#06b6d4' },
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

  const formatDate = (dateStr: string) => {
    void formatDate; // Mark as used
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  const getDaysRemaining = (deadline: string) => {
    const days = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  return (
    <div className="relative mb-8">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl blur-xl" />
      
      <div className="relative rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
            <div className="p-2 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-lg">
              <Target className="w-5 h-5 text-indigo-400" />
            </div>
            Metas Financeiras
          </h2>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl transition-all"
          >
            <Plus className="w-4 h-4" />
            Nova Meta
          </button>
        </div>

        {isAdding && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 rounded-xl space-y-4" style={{ background: 'var(--bg-tertiary)' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Nome da Meta</label>
                <input
                  type="text"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                  placeholder="Ex: Viagem, Carro novo..."
                  className="w-full px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Valor Meta (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={newGoal.targetAmount}
                  onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                  placeholder="0,00"
                  className="w-full px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Data Limite (opcional)</label>
                <input
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Cor</label>
                <div className="flex gap-2">
                  {GOAL_COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setNewGoal({ ...newGoal, color: color.value })}
                      className={`w-8 h-8 rounded-full transition-all ${
                        newGoal.color === color.value ? 'ring-2 ring-white scale-110' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium rounded-xl hover:from-indigo-400 hover:to-purple-400 transition-all"
              >
                Criar Meta
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 bg-[#1a1a2e] text-[#a0a0b8] rounded-xl hover:text-white transition-all"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {goals.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-[#252542] rounded-2xl flex items-center justify-center">
              <Target className="w-8 h-8 text-[#6b6b8a]" />
            </div>
            <p className="text-[#a0a0b8]">Nenhuma meta definida ainda.</p>
            <p className="text-sm text-[#6b6b8a] mt-1">Crie sua primeira meta financeira!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {goals.map((goal) => {
              const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
              const isCompleted = progress >= 100;

              return (
                <div
                  key={goal.id}
                  className="relative p-4 bg-[#252542] rounded-xl border border-[#2a2a45] group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${goal.color}20` }}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5" style={{ color: goal.color }} />
                        ) : (
                          <Target className="w-5 h-5" style={{ color: goal.color }} />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{goal.name}</h3>
                        {goal.deadline && (
                          <p className="text-xs text-[#6b6b8a] flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {getDaysRemaining(goal.deadline)} dias restantes
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => onDeleteGoal(goal.id)}
                      className="p-1.5 text-[#6b6b8a] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-[#a0a0b8]">
                        {formatCurrency(goal.currentAmount)} de {formatCurrency(goal.targetAmount)}
                      </span>
                      <span className="font-medium" style={{ color: goal.color }}>
                        {progress.toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-2 bg-[#1a1a2e] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${progress}%`, backgroundColor: goal.color }}
                      />
                    </div>
                  </div>

                  {contributingTo === goal.id ? (
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={contributionAmount}
                        onChange={(e) => setContributionAmount(e.target.value)}
                        placeholder="Valor"
                        className="flex-1 px-3 py-2 bg-[#1a1a2e] border border-[#2a2a45] rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        autoFocus
                      />
                      <button
                        onClick={() => handleContribute(goal.id)}
                        className="px-3 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-400 transition-all"
                      >
                        Adicionar
                      </button>
                      <button
                        onClick={() => {
                          setContributingTo(null);
                          setContributionAmount('');
                        }}
                        className="px-3 py-2 bg-[#1a1a2e] text-[#a0a0b8] rounded-lg text-sm hover:text-white transition-all"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setContributingTo(goal.id)}
                      disabled={isCompleted}
                      className="w-full py-2 bg-[#1a1a2e] text-[#a0a0b8] rounded-lg text-sm font-medium hover:text-white hover:bg-[#2a2a50] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <TrendingUp className="w-4 h-4" />
                      {isCompleted ? 'Meta Alcançada!' : 'Adicionar Contribuição'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
