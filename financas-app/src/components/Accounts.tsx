import { useState } from 'react';
import { Wallet, Plus, Trash2, CreditCard, PiggyBank, Banknote, TrendingUp, Landmark, ArrowRightLeft, Check } from 'lucide-react';
import type { Account } from '../types/finance';
import { getTodayLocalISO } from '../utils/date';

interface AccountsProps {
  accounts: Account[];
  accountBalances: Record<string, number>;
  onAddAccount: (account: Omit<Account, 'id'>) => void;
  onDeleteAccount: (id: string) => void;
  selectedAccount: string | null;
  onSelectAccount: (id: string | null) => void;
  onTransferBetweenAccounts: (data: {
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    date?: string;
    description?: string;
  }) => void;
}

const ACCOUNT_TYPES = [
  { type: 'checking', label: 'Conta Corrente', icon: Wallet },
  { type: 'savings', label: 'Poupança', icon: PiggyBank },
  { type: 'credit', label: 'Cartão de Crédito', icon: CreditCard },
  { type: 'cash', label: 'Dinheiro', icon: Banknote },
  { type: 'investment', label: 'Investimentos', icon: TrendingUp },
];

const ACCOUNT_COLORS = [
  { name: 'Emerald', value: '#10b981' },
  { name: 'Sky', value: '#0ea5e9' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Violet', value: '#8b5cf6' },
];

export function Accounts({
  accounts,
  accountBalances,
  onAddAccount,
  onDeleteAccount,
  selectedAccount,
  onSelectAccount,
  onTransferBetweenAccounts,
}: AccountsProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [transfer, setTransfer] = useState({
    fromAccountId: accounts[0]?.id ?? '',
    toAccountId: accounts[1]?.id ?? '',
    amount: '',
    description: '',
    date: getTodayLocalISO(),
  });
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
    const accountType = ACCOUNT_TYPES.find((t) => t.type === type);
    return accountType?.icon || Wallet;
  };

  const totalBalance = Object.values(accountBalances).reduce((sum, balance) => sum + balance, 0);

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(transfer.amount);

    if (
      !transfer.fromAccountId ||
      !transfer.toAccountId ||
      transfer.fromAccountId === transfer.toAccountId ||
      !(amount > 0)
    ) {
      return;
    }

    onTransferBetweenAccounts({
      fromAccountId: transfer.fromAccountId,
      toAccountId: transfer.toAccountId,
      amount,
      description: transfer.description,
      date: transfer.date,
    });

    setTransfer((prev) => ({
      ...prev,
      amount: '',
      description: '',
    }));
    setIsTransferOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header Banner */}
      <div className="glass p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-display font-bold" style={{ color: 'var(--text-primary)' }}>
              Contas & Carteiras
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Patrimônio acumulado:{' '}
              <span className="font-semibold text-emerald-400 font-mono">{formatCurrency(totalBalance)}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {accounts.length >= 2 && (
            <button
              onClick={() => setIsTransferOpen(!isTransferOpen)}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold border border-indigo-500/20 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-all"
            >
              <ArrowRightLeft className="w-4 h-4" />
              Transferir
            </button>
          )}

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Nova Conta
          </button>
        </div>
      </div>

      {/* New Account Form */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="glass p-5 rounded-2xl space-y-4 animate-fade-in">
          <h3 className="text-sm font-display font-bold" style={{ color: 'var(--text-primary)' }}>
            Cadastrar Nova Conta
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Nome da Conta
              </label>
              <input
                type="text"
                value={newAccount.name}
                onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                placeholder="Ex: Nubank, Itaú, Carteira..."
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-emerald-500/50"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Tipo de Conta
              </label>
              <select
                value={newAccount.type}
                onChange={(e) => setNewAccount({ ...newAccount, type: e.target.value as Account['type'] })}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-emerald-500/50 cursor-pointer"
              >
                {ACCOUNT_TYPES.map((type) => (
                  <option key={type.type} value={type.type}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">
              Cor do Card
            </label>
            <div className="flex items-center gap-2">
              {ACCOUNT_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setNewAccount({ ...newAccount, color: color.value })}
                  className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                    newAccount.color === color.value ? 'ring-2 ring-white scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.value }}
                >
                  {newAccount.color === color.value && <Check className="w-3.5 h-3.5 text-black stroke-[3]" />}
                </button>
              ))}
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
              Salvar Conta
            </button>
          </div>
        </form>
      )}

      {/* Transfer Form */}
      {isTransferOpen && accounts.length >= 2 && (
        <form onSubmit={handleTransfer} className="glass p-5 rounded-2xl space-y-4 border border-indigo-500/30 animate-fade-in">
          <div className="flex items-center gap-2.5 pb-2 border-b border-[var(--border-color)]">
            <ArrowRightLeft className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-display font-bold text-[var(--text-primary)]">
              Transferência entre Contas
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Conta de Origem
              </label>
              <select
                value={transfer.fromAccountId}
                onChange={(e) => setTransfer({ ...transfer, fromAccountId: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none cursor-pointer"
                required
              >
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Conta de Destino
              </label>
              <select
                value={transfer.toAccountId}
                onChange={(e) => setTransfer({ ...transfer, toAccountId: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none cursor-pointer"
                required
              >
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Valor
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={transfer.amount}
                onChange={(e) => setTransfer({ ...transfer, amount: e.target.value })}
                placeholder="0,00"
                className="w-full px-3.5 py-2.5 text-sm font-mono font-bold rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Data
              </label>
              <input
                type="date"
                value={transfer.date}
                onChange={(e) => setTransfer({ ...transfer, date: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none cursor-pointer"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[var(--border-color)]">
            <input
              type="text"
              value={transfer.description}
              onChange={(e) => setTransfer({ ...transfer, description: e.target.value })}
              placeholder="Descrição ou observação (opcional)"
              className="flex-1 max-w-md px-3.5 py-2 text-xs rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)]"
            />

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsTransferOpen(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={transfer.fromAccountId === transfer.toAccountId}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-500 hover:bg-indigo-600 shadow-md shadow-indigo-500/20 disabled:opacity-50"
              >
                Confirmar Transferência
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {/* All Accounts Pill */}
        <div
          onClick={() => onSelectAccount(null)}
          className={`glass p-5 rounded-2xl cursor-pointer card-hover flex flex-col justify-between border ${
            selectedAccount === null
              ? 'border-emerald-500/40 bg-emerald-500/5'
              : 'border-[var(--border-color)]'
          }`}
        >
          <div className="flex items-center gap-3.5 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-black shadow-md shadow-emerald-500/20">
              <Landmark className="w-5 h-5 font-bold" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                Todas as Contas
              </h3>
              <p className="text-xs text-[var(--text-muted)]">{accounts.length} contas ativas</p>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] block">
              Saldo Consolidado
            </span>
            <p className="text-xl font-mono font-bold text-emerald-400 mt-0.5">
              {formatCurrency(totalBalance)}
            </p>
          </div>
        </div>

        {/* Individual Accounts */}
        {accounts.map((account) => {
          const Icon = getAccountIcon(account.type);
          const balance = accountBalances[account.id] || 0;
          const isSelected = selectedAccount === account.id;

          return (
            <div
              key={account.id}
              onClick={() => onSelectAccount(account.id)}
              className={`glass p-5 rounded-2xl cursor-pointer card-hover flex flex-col justify-between relative group border ${
                isSelected ? 'border-emerald-500/50 bg-emerald-500/5 shadow-lg' : 'border-[var(--border-color)]'
              }`}
            >
              {!account.isDefault && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteAccount(account.id);
                  }}
                  className="absolute top-3 right-3 p-2 rounded-xl text-[var(--text-muted)] hover:text-rose-400 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all"
                  title="Excluir conta"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

              <div className="flex items-center gap-3.5 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/10"
                  style={{ backgroundColor: `${account.color}25` }}
                >
                  <Icon className="w-5 h-5" style={{ color: account.color }} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                    {account.name}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    {ACCOUNT_TYPES.find((t) => t.type === account.type)?.label}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] block">
                  Saldo Disponível
                </span>
                <p
                  className={`text-xl font-mono font-bold mt-0.5 ${
                    balance >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {formatCurrency(balance)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
