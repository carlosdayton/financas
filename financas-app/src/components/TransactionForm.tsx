import { useState } from 'react';
import { Plus, ArrowUpCircle, ArrowDownCircle, FileText } from 'lucide-react';
import type { TransactionType } from '../types/finance';
import { getTodayLocalISO } from '../utils/date';

interface TransactionFormProps {
  categories: { id: string; name: string; type: TransactionType }[];
  onSubmit: (data: {
    description: string;
    amount: number;
    type: TransactionType;
    category: string;
    date: string;
    notes?: string;
  }) => void;
  onCancel?: () => void;
}

export function TransactionForm({ categories, onSubmit, onCancel }: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>('expense');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(getTodayLocalISO());
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);

  const filteredCategories = categories.filter((c) => c.type === type);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !category || !date) return;
    onSubmit({
      description,
      amount: parseFloat(amount),
      type,
      category,
      date,
      notes: notes.trim() || undefined,
    });
    setDescription('');
    setAmount('');
    setCategory('');
    setNotes('');
    setShowNotes(false);
    if (onCancel) onCancel();
  };

  return (
    <div className="glass p-5 rounded-2xl border border-[var(--border-color)] shadow-xl animate-fade-in-up">
      {/* Type Selector Pills */}
      <div className="grid grid-cols-2 gap-2 mb-4 p-1 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)]">
        <button
          type="button"
          onClick={() => { setType('expense'); setCategory(''); }}
          className={`flex items-center justify-center gap-2 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200 ${
            type === 'expense'
              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          <ArrowDownCircle className="w-4 h-4" />
          Despesa
        </button>
        <button
          type="button"
          onClick={() => { setType('income'); setCategory(''); }}
          className={`flex items-center justify-center gap-2 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200 ${
            type === 'income'
              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          <ArrowUpCircle className="w-4 h-4" />
          Receita
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Description */}
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">
              Descrição
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Supermercado, Salário..."
              className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-emerald-500/50 transition-colors"
              required
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">
              Valor
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--text-muted)]">R$</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm font-mono font-bold rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-emerald-500/50 transition-colors"
                required
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">
              Categoria
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-emerald-500/50 transition-colors cursor-pointer"
              required
            >
              <option value="">Selecione...</option>
              {filteredCategories.map((cat) => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">
              Data
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-emerald-500/50 transition-colors cursor-pointer"
              required
            />
          </div>
        </div>

        {showNotes && (
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">
              Observação (Opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Detalhes adicionais..."
              className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-emerald-500/50 transition-colors resize-none"
            />
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-[var(--border-color)]">
          <button
            type="button"
            onClick={() => setShowNotes(!showNotes)}
            className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            {showNotes ? 'Ocultar observação' : '+ Adicionar observação'}
          </button>

          <div className="flex items-center gap-2">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-md ${
                type === 'income'
                  ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20'
                  : 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20'
              }`}
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              Salvar {type === 'income' ? 'Receita' : 'Despesa'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
