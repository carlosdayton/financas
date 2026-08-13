import { useMemo, useState } from 'react';
import { AlertTriangle, PiggyBank, Plus, Trash2, Copy } from 'lucide-react';
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
    <div className="space-y-5 animate-fade-in-up">
      {/* Header Banner */}
      <div className="glass p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <PiggyBank className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-display font-bold" style={{ color: 'var(--text-primary)' }}>
              Orçamento Mensal por Categoria
            </h2>
            <p className="text-xs text-[var(--text-muted)] capitalize">
              Referência: <span className="font-semibold text-[var(--text-primary)]">{formatMonth(selectedMonth)}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onCopyFromPreviousMonth}
            disabled={!canCopyFromPreviousMonth}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold border border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all disabled:opacity-50"
          >
            <Copy className="w-3.5 h-3.5" />
            Copiar Mês Anterior
          </button>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Novo Limite
          </button>
        </div>
      </div>

      {/* Month & Summary Selector */}
      <div className="glass p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 max-w-xs">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">
            Selecione o Mês
          </label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => onMonthChange(e.target.value)}
            className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none cursor-pointer"
          />
        </div>

        <div className="flex items-center gap-6 divide-x divide-[var(--border-color)] pt-2 md:pt-0">
          <div className="pr-4">
            <span className="text-[10px] uppercase font-semibold text-[var(--text-muted)] block">Teto Orçado</span>
            <span className="text-base font-mono font-bold" style={{ color: 'var(--text-primary)' }}>
              {formatCurrency(totalBudget)}
            </span>
          </div>
          <div className="pl-4 pr-4">
            <span className="text-[10px] uppercase font-semibold text-[var(--text-muted)] block">Total Gasto</span>
            <span className="text-base font-mono font-bold" style={{ color: 'var(--text-primary)' }}>
              {formatCurrency(totalSpent)}
            </span>
          </div>
          <div className="pl-4">
            <span className="text-[10px] uppercase font-semibold text-[var(--text-muted)] block">Consumo</span>
            <span className={`text-base font-mono font-bold ${totalProgress > 100 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {totalProgress.toFixed(0)}%
            </span>
          </div>
        </div>
      </div>

      {/* Form */}
      {isAdding && (
        <form onSubmit={handleCreate} className="glass p-5 rounded-2xl space-y-4 animate-fade-in">
          <h3 className="text-sm font-display font-bold text-[var(--text-primary)]">Definir Novo Limite</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Categoria de Despesa
              </label>
              <select
                value={newBudget.category}
                onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none cursor-pointer"
                required
              >
                {expenseCategories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Limite Mensal (R$)
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={newBudget.amount}
                onChange={(e) => setNewBudget({ ...newBudget, amount: e.target.value })}
                placeholder="0,00"
                className="w-full px-3.5 py-2.5 text-sm font-mono font-bold rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none"
                required
              />
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
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 shadow-md shadow-emerald-500/20"
            >
              Salvar Limite
            </button>
          </div>
        </form>
      )}

      {/* Grid of Budgets */}
      {budgets.length === 0 ? (
        <div className="glass p-8 text-center rounded-2xl">
          <PiggyBank className="w-10 h-10 mx-auto mb-3 text-[var(--text-muted)]" />
          <h4 className="text-base font-display font-semibold" style={{ color: 'var(--text-primary)' }}>
            Nenhum limite cadastrado para este mês
          </h4>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Clique em "Novo Limite" ou "Copiar Mês Anterior" para definir tetos de gastos.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {budgetStatus.map((item) => {
            const progress = Math.min(item.percentage, 100);
            const isWarning = item.percentage >= 80 && !item.isExceeded;

            return (
              <div
                key={item.budget.id}
                className={`glass p-5 rounded-2xl flex flex-col justify-between group border relative ${
                  item.isExceeded
                    ? 'border-rose-500/40'
                    : isWarning
                    ? 'border-amber-500/40'
                    : 'border-[var(--border-color)]'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="font-display font-bold text-base" style={{ color: 'var(--text-primary)' }}>
                        {item.budget.category}
                      </h3>
                      <p className="text-xs text-[var(--text-muted)] font-mono mt-0.5">
                        Teto: {formatCurrency(item.budget.amount)}
                      </p>
                    </div>
                    <button
                      onClick={() => onDeleteBudget(item.budget.id)}
                      className="p-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all text-[var(--text-muted)] hover:text-rose-400 hover:bg-rose-500/10"
                      title="Remover orçamento"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs font-semibold mb-2">
                    <span className="text-[var(--text-secondary)] font-mono">
                      {formatCurrency(item.spent)} gastos
                    </span>
                    <span className={item.isExceeded ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'}>
                      {item.percentage.toFixed(0)}%
                    </span>
                  </div>

                  <div className="h-2 rounded-full bg-[var(--bg-tertiary)] overflow-hidden mb-3">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.isExceeded ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-[var(--border-color)] flex items-center justify-between text-xs">
                  <span className={`font-semibold flex items-center gap-1 ${item.isExceeded ? 'text-rose-400' : 'text-[var(--text-muted)]'}`}>
                    {item.isExceeded && <AlertTriangle className="w-3.5 h-3.5" />}
                    {item.isExceeded
                      ? `Excedido em ${formatCurrency(Math.abs(item.remaining))}`
                      : `Disponível: ${formatCurrency(item.remaining)}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
