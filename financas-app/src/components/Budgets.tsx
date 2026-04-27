import { useMemo, useState } from 'react';
import { AlertTriangle, PiggyBank, Plus, Trash2 } from 'lucide-react';
import type { Budget, BudgetStatus, Category } from '../types/finance';

interface BudgetsProps {
  categories: Category[];
  budgets: Budget[];
  budgetStatus: BudgetStatus[];
  selectedMonth: string;
  canCopyFromPreviousMonth: boolean;
  onAddBudget: (budget: Omit<Budget, 'id' | 'createdAt'>) => void;
  onDeleteBudget: (id: string) => void;
  onMonthChange: (month: string) => void;
  onCopyFromPreviousMonth: () => void;
}

export function Budgets({
  categories,
  budgets,
  budgetStatus,
  selectedMonth,
  canCopyFromPreviousMonth,
  onAddBudget,
  onDeleteBudget,
  onMonthChange,
  onCopyFromPreviousMonth,
}: BudgetsProps) {
  const expenseCategories = useMemo(
    () => categories.filter((category) => category.type === 'expense'),
    [categories]
  );
  const [isAdding, setIsAdding] = useState(false);
  const [newBudget, setNewBudget] = useState({
    category: expenseCategories[0]?.name ?? '',
    amount: '',
  });

  const totalBudget = budgetStatus.reduce((sum, item) => sum + item.budget.amount, 0);
  const totalSpent = budgetStatus.reduce((sum, item) => sum + item.spent, 0);
  const totalProgress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(newBudget.amount);
    if (!newBudget.category || !(amount > 0)) return;

    onAddBudget({
      category: newBudget.category,
      amount,
      month: selectedMonth,
    });

    setNewBudget({
      category: newBudget.category,
      amount: '',
    });
    setIsAdding(false);
  };

  const formatMonth = (month: string) => {
    const date = new Date(`${month}-01T00:00:00`);
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="relative mb-8">
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-indigo-500/10 rounded-2xl blur-xl" />

      <div className="relative rounded-2xl p-6 space-y-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
            <div className="p-2 bg-gradient-to-br from-emerald-500/20 to-indigo-500/20 rounded-lg">
              <PiggyBank className="w-5 h-5 text-emerald-400" />
            </div>
            Orçamento Mensal
          </h2>
          <div className="flex gap-2">
            <button
              onClick={onCopyFromPreviousMonth}
              disabled={!canCopyFromPreviousMonth}
              className="px-4 py-2 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
            >
              Copiar mes anterior
            </button>
            <button
              onClick={() => setIsAdding((prev) => !prev)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl transition-all"
            >
              <Plus className="w-4 h-4" />
              Novo Limite
            </button>
          </div>
        </div>

        <div className="rounded-xl p-4" style={{ background: 'var(--bg-tertiary)' }}>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
              Mes de referencia
            </label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => onMonthChange(e.target.value)}
              className="px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
            />
          </div>
          <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
            Visao geral de {formatMonth(selectedMonth)}
          </p>
          <div className="flex flex-wrap gap-6">
            <div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Orcado</p>
              <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(totalBudget)}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Gasto</p>
              <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(totalSpent)}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Consumo</p>
              <p className={`font-semibold ${totalProgress > 100 ? 'text-red-400' : 'text-emerald-400'}`}>
                {totalProgress.toFixed(0)}%
              </p>
            </div>
          </div>
        </div>

        {isAdding && (
          <form onSubmit={handleCreate} className="rounded-xl p-4 space-y-4" style={{ background: 'var(--bg-tertiary)' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Categoria
                </label>
                <select
                  value={newBudget.category}
                  onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                  required
                >
                  {expenseCategories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Limite mensal (R$)
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={newBudget.amount}
                  onChange={(e) => setNewBudget({ ...newBudget, amount: e.target.value })}
                  placeholder="0,00"
                  className="w-full px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                  required
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 py-2 bg-gradient-to-r from-emerald-500 to-indigo-500 text-white font-medium rounded-xl hover:from-emerald-400 hover:to-indigo-400 transition-all"
              >
                Salvar limite
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 rounded-xl transition-all"
                style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {budgets.length === 0 ? (
          <div className="text-center py-8">
            <p style={{ color: 'var(--text-secondary)' }}>Nenhum limite cadastrado para este mes.</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Crie limites por categoria para acompanhar os gastos.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {budgetStatus.map((item) => {
              const progress = Math.min(item.percentage, 100);
              const isWarning = item.percentage >= 80 && !item.isExceeded;

              return (
                <div key={item.budget.id} className="rounded-xl p-4 group" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{item.budget.category}</h3>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        Limite: {formatCurrency(item.budget.amount)}
                      </p>
                    </div>
                    <button
                      onClick={() => onDeleteBudget(item.budget.id)}
                      className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/10 hover:text-red-400"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {formatCurrency(item.spent)} gastos
                    </span>
                    <span className={item.isExceeded ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'}>
                      {item.percentage.toFixed(0)}%
                    </span>
                  </div>

                  <div className="h-2 rounded-full overflow-hidden mb-2" style={{ background: 'var(--bg-secondary)' }}>
                    <div
                      className={`h-full ${item.isExceeded ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'} transition-all`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <p className="text-xs flex items-center gap-1" style={{ color: item.isExceeded ? '#f87171' : 'var(--text-muted)' }}>
                    {item.isExceeded && <AlertTriangle className="w-3 h-3" />}
                    {item.isExceeded
                      ? `Excedido em ${formatCurrency(Math.abs(item.remaining))}`
                      : `Restante: ${formatCurrency(item.remaining)}`}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
