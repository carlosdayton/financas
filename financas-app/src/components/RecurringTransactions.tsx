import { useState } from 'react';
import { Repeat, Plus, Trash2, Calendar, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import type { RecurringTransaction, TransactionType, Category, Account } from '../types/finance';

interface RecurringTransactionsProps {
  recurring: RecurringTransaction[];
  categories: Category[];
  accounts: Account[];
  onAddRecurring: (rec: Omit<RecurringTransaction, 'id'>) => void;
  onDeleteRecurring: (id: string) => void;
  onToggleRecurring: (id: string, isActive: boolean) => void;
}

const FREQUENCIES = [
  { value: 'daily', label: 'Diário' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'monthly', label: 'Mensal' },
  { value: 'yearly', label: 'Anual' },
];

export function RecurringTransactions({
  recurring,
  categories,
  accounts,
  onAddRecurring,
  onDeleteRecurring,
  onToggleRecurring,
}: RecurringTransactionsProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newRecurring, setNewRecurring] = useState({
    description: '',
    amount: '',
    type: 'expense' as TransactionType,
    category: '',
    frequency: 'monthly' as RecurringTransaction['frequency'],
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    accountId: accounts[0]?.id || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecurring.description || !newRecurring.amount || !newRecurring.category) return;

    onAddRecurring({
      description: newRecurring.description,
      amount: parseFloat(newRecurring.amount),
      type: newRecurring.type,
      category: newRecurring.category,
      frequency: newRecurring.frequency,
      startDate: newRecurring.startDate,
      endDate: newRecurring.endDate || undefined,
      accountId: newRecurring.accountId,
      isActive: true,
    });

    setNewRecurring({
      description: '',
      amount: '',
      type: 'expense',
      category: '',
      frequency: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      accountId: accounts[0]?.id || '',
    });
    setIsAdding(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatFrequency = (freq: string) => {
    return FREQUENCIES.find((f) => f.value === freq)?.label || freq;
  };

  const filteredCategories = categories.filter((c) => c.type === newRecurring.type);

  return (
    <div className="space-y-5 animate-fade-in-up">
      {/* Header Banner */}
      <div className="glass p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Repeat className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-display font-bold" style={{ color: 'var(--text-primary)' }}>
              Transações Recorrentes
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Automatize contas fixas, assinaturas e salários
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-amber-500/20"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Nova Recorrência
        </button>
      </div>

      {/* Form */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="glass p-5 rounded-2xl space-y-4 animate-fade-in">
          <h3 className="text-sm font-display font-bold text-[var(--text-primary)]">
            Cadastrar Transação Recorrente
          </h3>

          <div className="grid grid-cols-2 gap-2 max-w-xs mb-3 p-1 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)]">
            <button
              type="button"
              onClick={() => setNewRecurring({ ...newRecurring, type: 'expense', category: '' })}
              className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                newRecurring.type === 'expense' ? 'bg-rose-500 text-white shadow-sm' : 'text-[var(--text-muted)]'
              }`}
            >
              Despesa
            </button>
            <button
              type="button"
              onClick={() => setNewRecurring({ ...newRecurring, type: 'income', category: '' })}
              className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                newRecurring.type === 'income' ? 'bg-emerald-500 text-white shadow-sm' : 'text-[var(--text-muted)]'
              }`}
            >
              Receita
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Descrição
              </label>
              <input
                type="text"
                value={newRecurring.description}
                onChange={(e) => setNewRecurring({ ...newRecurring, description: e.target.value })}
                placeholder="Ex: Aluguel, Netflix, Salário..."
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-amber-500/50"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Valor (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={newRecurring.amount}
                onChange={(e) => setNewRecurring({ ...newRecurring, amount: e.target.value })}
                placeholder="0,00"
                className="w-full px-3.5 py-2.5 text-sm font-mono font-bold rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Categoria
              </label>
              <select
                value={newRecurring.category}
                onChange={(e) => setNewRecurring({ ...newRecurring, category: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none cursor-pointer"
                required
              >
                <option value="">Selecione...</option>
                {filteredCategories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Frequência
              </label>
              <select
                value={newRecurring.frequency}
                onChange={(e) =>
                  setNewRecurring({ ...newRecurring, frequency: e.target.value as RecurringTransaction['frequency'] })
                }
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none cursor-pointer"
              >
                {FREQUENCIES.map((freq) => (
                  <option key={freq.value} value={freq.value}>
                    {freq.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Conta de Lançamento
              </label>
              <select
                value={newRecurring.accountId}
                onChange={(e) => setNewRecurring({ ...newRecurring, accountId: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none cursor-pointer"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Data de Início
              </label>
              <input
                type="date"
                value={newRecurring.startDate}
                onChange={(e) => setNewRecurring({ ...newRecurring, startDate: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none cursor-pointer"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Data Fim (Opcional)
              </label>
              <input
                type="date"
                value={newRecurring.endDate}
                onChange={(e) => setNewRecurring({ ...newRecurring, endDate: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none cursor-pointer"
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
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 shadow-md shadow-amber-500/20"
            >
              Salvar Recorrência
            </button>
          </div>
        </form>
      )}

      {/* List */}
      {recurring.length === 0 ? (
        <div className="glass p-8 text-center rounded-2xl">
          <Repeat className="w-10 h-10 mx-auto mb-3 text-[var(--text-muted)]" />
          <h4 className="text-base font-display font-semibold" style={{ color: 'var(--text-primary)' }}>
            Nenhuma transação recorrente configurada
          </h4>
          <p className="text-xs text-[var(--text-muted)] mt-1 max-w-xs mx-auto">
            Adicione lançamentos periódicos para que o sistema ajude a projetar o seu orçamento futuro.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {recurring.map((rec) => {
            const isIncome = rec.type === 'income';

            return (
              <div
                key={rec.id}
                className={`glass p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  rec.isActive ? 'border-[var(--border-color)]' : 'opacity-60 border-[var(--border-color)] bg-[var(--bg-tertiary)]/20'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`p-2.5 rounded-xl flex-shrink-0 border ${
                      isIncome
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}
                  >
                    {isIncome ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                      {rec.description}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--text-muted)] mt-0.5">
                      <span className="font-medium">{rec.category}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[var(--text-muted)]" />
                        {formatFrequency(rec.frequency)}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Wallet className="w-3 h-3 text-[var(--text-muted)]" />
                        {accounts.find((a) => a.id === rec.accountId)?.name || 'Conta Principal'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--border-color)]">
                  <span
                    className={`text-base font-mono font-bold ${
                      isIncome ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isIncome ? '+' : '-'}
                    {formatCurrency(rec.amount)}
                  </span>

                  <div className="flex items-center gap-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rec.isActive}
                        onChange={(e) => onToggleRecurring(rec.id, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-[var(--bg-tertiary)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>

                    <button
                      onClick={() => onDeleteRecurring(rec.id)}
                      className="p-1.5 text-[var(--text-muted)] hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                      title="Excluir recorrência"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
