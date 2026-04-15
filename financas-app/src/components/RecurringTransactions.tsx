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
    return FREQUENCIES.find(f => f.value === freq)?.label || freq;
  };

  const filteredCategories = categories.filter(c => c.type === newRecurring.type);

  return (
    <div className="relative mb-8">
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-2xl blur-xl" />
      
      <div className="relative rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
            <div className="p-2 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-lg">
              <Repeat className="w-5 h-5 text-amber-400" />
            </div>
            Transações Recorrentes
          </h2>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white rounded-xl transition-all"
          >
            <Plus className="w-4 h-4" />
            Nova Recorrência
          </button>
        </div>

        {isAdding && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 rounded-xl space-y-4" style={{ background: 'var(--bg-tertiary)' }}>
            <div className="flex gap-4 mb-4">
              <button
                type="button"
                onClick={() => setNewRecurring({ ...newRecurring, type: 'expense', category: '' })}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                  newRecurring.type === 'expense'
                    ? 'bg-red-500 text-white'
                    : ''
                }`}
                style={newRecurring.type !== 'expense' ? { background: 'var(--bg-secondary)', color: 'var(--text-secondary)' } : undefined}
              >
                Despesa
              </button>
              <button
                type="button"
                onClick={() => setNewRecurring({ ...newRecurring, type: 'income', category: '' })}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                  newRecurring.type === 'income'
                    ? 'bg-emerald-500 text-white'
                    : ''
                }`}
                style={newRecurring.type !== 'income' ? { background: 'var(--bg-secondary)', color: 'var(--text-secondary)' } : undefined}
              >
                Receita
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Descrição</label>
                <input
                  type="text"
                  value={newRecurring.description}
                  onChange={(e) => setNewRecurring({ ...newRecurring, description: e.target.value })}
                  placeholder="Ex: Aluguel, Salário..."
                  className="w-full px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={newRecurring.amount}
                  onChange={(e) => setNewRecurring({ ...newRecurring, amount: e.target.value })}
                  placeholder="0,00"
                  className="w-full px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Categoria</label>
                <select
                  value={newRecurring.category}
                  onChange={(e) => setNewRecurring({ ...newRecurring, category: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                  required
                >
                  <option value="">Selecione...</option>
                  {filteredCategories.map((cat) => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Frequência</label>
                <select
                  value={newRecurring.frequency}
                  onChange={(e) => setNewRecurring({ ...newRecurring, frequency: e.target.value as RecurringTransaction['frequency'] })}
                  className="w-full px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                >
                  {FREQUENCIES.map((freq) => (
                    <option key={freq.value} value={freq.value}>{freq.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Conta</label>
                <select
                  value={newRecurring.accountId}
                  onChange={(e) => setNewRecurring({ ...newRecurring, accountId: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Data Início</label>
                <input
                  type="date"
                  value={newRecurring.startDate}
                  onChange={(e) => setNewRecurring({ ...newRecurring, startDate: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Data Fim (opcional)</label>
                <input
                  type="date"
                  value={newRecurring.endDate}
                  onChange={(e) => setNewRecurring({ ...newRecurring, endDate: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-xl hover:from-amber-400 hover:to-orange-400 transition-all"
              >
                Criar Recorrência
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

        {recurring.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-[#252542] rounded-2xl flex items-center justify-center">
              <Repeat className="w-8 h-8 text-[#6b6b8a]" />
            </div>
            <p className="text-[#a0a0b8]">Nenhuma transação recorrente.</p>
            <p className="text-sm text-[#6b6b8a] mt-1">Automatize suas receitas e despesas fixas!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recurring.map((rec) => (
              <div
                key={rec.id}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                  rec.isActive
                    ? 'bg-[#252542] border-[#2a2a45]'
                    : 'bg-[#1a1a2e] border-[#2a2a45] opacity-60'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-2 rounded-lg ${
                      rec.type === 'income'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-red-500/10 text-red-400'
                    }`}
                  >
                    {rec.type === 'income' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{rec.description}</h3>
                    <div className="flex items-center gap-2 text-sm text-[#6b6b8a]">
                      <span>{rec.category}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatFrequency(rec.frequency)}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Wallet className="w-3 h-3" />
                        {accounts.find(a => a.id === rec.accountId)?.name || 'Conta Principal'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className={`font-bold ${rec.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {rec.type === 'income' ? '+' : '-'}{formatCurrency(rec.amount)}
                  </span>
                  
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rec.isActive}
                      onChange={(e) => onToggleRecurring(rec.id, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#1a1a2e] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>

                  <button
                    onClick={() => onDeleteRecurring(rec.id)}
                    className="p-2 text-[#6b6b8a] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
