import { useState, useEffect } from 'react';
import { X, ArrowDownCircle, ArrowUpCircle, Save } from 'lucide-react';
import type { Transaction, TransactionType } from '../types/finance';

interface EditTransactionModalProps {
  transaction: Transaction | null;
  categories: { id: string; name: string; type: TransactionType }[];
  isOpen: boolean;
  onSave: (id: string, updates: Partial<Transaction>) => void;
  onClose: () => void;
}

export function EditTransactionModal({
  transaction,
  categories,
  isOpen,
  onSave,
  onClose,
}: EditTransactionModalProps) {
  const [type, setType] = useState<TransactionType>('expense');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setDescription(transaction.description);
      setAmount(transaction.amount.toString());
      setCategory(transaction.category);
      setDate(transaction.date);
      setNotes(transaction.notes ?? '');
    }
  }, [transaction]);

  if (!isOpen || !transaction) return null;

  const filteredCategories = categories.filter(c => c.type === type);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !category || !date) return;

    onSave(transaction.id, {
      description,
      amount: parseFloat(amount),
      type,
      category,
      date,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-lg rounded-2xl shadow-2xl"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Editar Transação
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-2xl transition-colors hover:bg-red-500/10 hover:text-red-400"
            style={{ color: 'var(--text-muted)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Type Selector */}
          {!transaction.isTransfer && (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setType('expense'); setCategory(''); }}
                className={`flex-1 py-3 px-4 rounded-2xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  type === 'expense'
                    ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/25'
                    : ''
                }`}
                style={type !== 'expense' ? { background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' } : undefined}
              >
                <ArrowDownCircle className="w-4 h-4" /> Despesa
              </button>
              <button
                type="button"
                onClick={() => { setType('income'); setCategory(''); }}
                className={`flex-1 py-3 px-4 rounded-2xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  type === 'income'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25'
                    : ''
                }`}
                style={type !== 'income' ? { background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' } : undefined}
              >
                <ArrowUpCircle className="w-4 h-4" /> Receita
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Description */}
            <div className="col-span-2 space-y-1.5">
              <label className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                Descrição
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                required
              />
            </div>

            {/* Amount */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                Valor
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-muted)' }}>R$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                  required
                />
              </div>
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                Data
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                required
              />
            </div>

            {/* Category */}
            {!transaction.isTransfer && (
              <div className="col-span-2 space-y-1.5">
                <label className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Categoria
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none"
                  style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                  required
                >
                  <option value="" style={{ background: 'var(--bg-tertiary)' }}>Selecione uma categoria...</option>
                  {filteredCategories.map((cat) => (
                    <option key={cat.id} value={cat.name} style={{ background: 'var(--bg-tertiary)' }}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Notes */}
            <div className="col-span-2 space-y-1.5">
              <label className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                Notas <span className="text-xs" style={{ color: 'var(--text-muted)' }}>(opcional)</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Ex: parcelado no Nubank, reembolsado pelo João..."
                className="w-full px-4 py-2.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none"
                style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-2xl font-medium transition-colors"
              style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-2xl font-bold text-white transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 shadow-lg shadow-indigo-500/25"
            >
              <Save className="w-4 h-4" />
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
