import { useState } from 'react';
import { Wallet, Plus, Trash2, CreditCard, PiggyBank, Banknote, TrendingUp, Landmark } from 'lucide-react';
import type { Account } from '../types/finance';

interface AccountsProps {
  accounts: Account[];
  accountBalances: Record<string, number>;
  onAddAccount: (account: Omit<Account, 'id'>) => void;
  onDeleteAccount: (id: string) => void;
  selectedAccount: string | null;
  onSelectAccount: (id: string | null) => void;
}

const ACCOUNT_TYPES = [
  { type: 'checking', label: 'Conta Corrente', icon: Wallet },
  { type: 'savings', label: 'Poupança', icon: PiggyBank },
  { type: 'credit', label: 'Cartão de Crédito', icon: CreditCard },
  { type: 'cash', label: 'Dinheiro', icon: Banknote },
  { type: 'investment', label: 'Investimentos', icon: TrendingUp },
];

const ACCOUNT_COLORS = [
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Violet', value: '#8b5cf6' },
];

export function Accounts({ accounts, accountBalances, onAddAccount, onDeleteAccount, selectedAccount, onSelectAccount }: AccountsProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newAccount, setNewAccount] = useState({
    name: '',
    type: 'checking' as Account['type'],
    color: ACCOUNT_COLORS[0].value,
    icon: 'wallet',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccount.name) return;

    onAddAccount({
      name: newAccount.name,
      type: newAccount.type,
      color: newAccount.color,
      icon: newAccount.icon,
      balance: 0,
    });

    setNewAccount({ name: '', type: 'checking', color: ACCOUNT_COLORS[0].value, icon: 'wallet' });
    setIsAdding(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getAccountIcon = (type: string) => {
    const accountType = ACCOUNT_TYPES.find(t => t.type === type);
    return accountType?.icon || Wallet;
  };

  const totalBalance = Object.values(accountBalances).reduce((sum, balance) => sum + balance, 0);

  return (
    <div className="relative mb-8">
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl blur-xl" />
      
      <div className="relative rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
              <div className="p-2 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-lg">
                <Landmark className="w-5 h-5 text-emerald-400" />
              </div>
              Minhas Contas
            </h2>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Saldo total: <span className="text-emerald-400 font-semibold">{formatCurrency(totalBalance)}</span>
            </p>
          </div>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl transition-all"
          >
            <Plus className="w-4 h-4" />
            Nova Conta
          </button>
        </div>

        {isAdding && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 rounded-xl space-y-4" style={{ background: 'var(--bg-tertiary)' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Nome da Conta</label>
                <input
                  type="text"
                  value={newAccount.name}
                  onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                  placeholder="Ex: Nubank, Itaú..."
                  className="w-full px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Tipo</label>
                <select
                  value={newAccount.type}
                  onChange={(e) => setNewAccount({ ...newAccount, type: e.target.value as Account['type'] })}
                  className="w-full px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                >
                  {ACCOUNT_TYPES.map((type) => (
                    <option key={type.type} value={type.type}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Cor</label>
              <div className="flex gap-2">
                {ACCOUNT_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setNewAccount({ ...newAccount, color: color.value })}
                    className={`w-8 h-8 rounded-full transition-all ${
                      newAccount.color === color.value ? 'ring-2 ring-white scale-110' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium rounded-xl hover:from-emerald-400 hover:to-teal-400 transition-all"
              >
                Criar Conta
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

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {/* All accounts option */}
          <button
            onClick={() => onSelectAccount(null)}
            className={`p-4 rounded-xl border transition-all text-left ${
              selectedAccount === null
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : ''
            }`}
            style={selectedAccount !== null ? { background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' } : undefined}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <Landmark className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Todas as Contas</h3>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{accounts.length} contas</p>
              </div>
            </div>
            <p className="text-lg font-bold text-emerald-400">{formatCurrency(totalBalance)}</p>
          </button>

          {accounts.map((account) => {
            const Icon = getAccountIcon(account.type);
            const balance = accountBalances[account.id] || 0;

            return (
              <div
                key={account.id}
                onClick={() => onSelectAccount(account.id)}
                className={`relative p-4 rounded-xl border cursor-pointer transition-all group ${
                  selectedAccount === account.id
                    ? 'bg-[#252542] border-emerald-500/30'
                    : 'bg-[#252542] border-[#2a2a45] hover:border-[#3a3a55]'
                }`}
              >
                {!account.isDefault && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteAccount(account.id);
                    }}
                    className="absolute top-2 right-2 p-1.5 text-[#6b6b8a] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${account.color}20` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: account.color }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{account.name}</h3>
                    <p className="text-xs text-[#6b6b8a]">
                      {ACCOUNT_TYPES.find(t => t.type === account.type)?.label}
                    </p>
                  </div>
                </div>
                <p className={`text-lg font-bold ${balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {formatCurrency(balance)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
