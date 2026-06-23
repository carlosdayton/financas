import { useState } from 'react';
import { Plus } from 'lucide-react';
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
}

export function TransactionForm({ categories, onSubmit }: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>('expense');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(getTodayLocalISO());
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);

  const filteredCategories = categories.filter(c => c.type === type);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !category || !date) return;
    onSubmit({ description, amount: parseFloat(amount), type, category, date, notes: notes.trim() || undefined });
    setDescription('');
    setAmount('');
    setCategory('');
    setNotes('');
    setShowNotes(false);
  };

  return (
    <div className="border border-[var(--border-color)] rounded-lg bg-[var(--bg-card)] overflow-hidden">
      {/* Type toggle */}
      <div className="flex border-b border-[var(--border-color)]">
        <button
          type="button"
          onClick={() => { setType('expense'); setCategory(''); }}
          className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
            type === 'expense'
              ? 'text-red-500 border-b-2 border-red-500 -mb-px bg-[var(--bg-secondary)]'
              : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
          }`}
        >
          Despesa
        </button>
        <button
          type="button"
          onClick={() => { setType('income'); setCategory(''); }}
          className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
            type === 'income'
              ? 'text-emerald-500 border-b-2 border-emerald-500 -mb-px bg-[var(--bg-secondary)]'
              : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
          }`}
        >
          Receita
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-3 sm:p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descrição"
            className="sm:col-span-2 md:col-span-1 px-3 py-2 text-sm rounded-md bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--text-secondary)]"
            required
          />
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--text-muted)] pointer-events-none">R$</span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0,00"
              className="w-full pl-9 pr-3 py-2 text-sm rounded-md bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--text-secondary)]"
              required
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-md bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-secondary)] cursor-pointer"
            required
          >
            <option value="">Categoria</option>
            {filteredCategories.map((cat) => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-md bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-secondary)]"
            required
          />
        </div>

        {showNotes && (
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Nota opcional..."
            className="mt-2.5 w-full px-3 py-2 text-sm rounded-md bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--text-secondary)] resize-none"
          />
        )}

        <div className="flex items-center justify-between mt-3">
          <button
            type="button"
            onClick={() => setShowNotes(!showNotes)}
            className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
          >
            {showNotes ? 'Ocultar nota' : '+ Nota'}
          </button>
          <button
            type="submit"
            className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold text-white transition-colors ${
              type === 'income'
                ? 'bg-emerald-500 hover:bg-emerald-600'
                : 'bg-red-500 hover:bg-red-600'
            }`}
          >
            <Plus className="w-4 h-4" />
            Adicionar
          </button>
        </div>
      </form>
    </div>
  );
}
