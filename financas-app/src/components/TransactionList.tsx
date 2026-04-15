import { Trash2, TrendingUp, TrendingDown, Receipt } from 'lucide-react';
import type { Transaction } from '../types/finance';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

export function TransactionList({ transactions, onDelete }: TransactionListProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (transactions.length === 0) {
    return (
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl blur-xl" />
        <div className="relative rounded-2xl p-12 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center" style={{ background: 'var(--bg-tertiary)' }}>
            <Receipt className="w-10 h-10" style={{ color: 'var(--text-muted)' }} />
          </div>
          <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Nenhuma transação</h3>
          <p style={{ color: 'var(--text-secondary)' }}>
            Adicione sua primeira receita ou despesa para começar!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl blur-xl" />
      
      <div className="relative rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
        <div className="p-6" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <h2 className="text-xl font-bold flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
            <div className="p-2 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-lg">
              <Receipt className="w-5 h-5 text-indigo-400" />
            </div>
            Transações Recentes
          </h2>
        </div>

        <div style={{ borderTop: '1px solid var(--border-color)' }}>
          {transactions.map((transaction, index) => (
            <div
              key={transaction.id}
              className="p-4 flex items-center justify-between transition-all duration-300 group"
              style={{ animationDelay: `${index * 50}ms`, borderBottom: '1px solid var(--border-color)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`p-3 rounded-xl ${
                    transaction.type === 'income'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}
                >
                  {transaction.type === 'income' ? (
                    <TrendingUp className="w-5 h-5" />
                  ) : (
                    <TrendingDown className="w-5 h-5" />
                  )}
                </div>

                <div>
                  <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{transaction.description}</p>
                  <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: 'var(--bg-tertiary)' }}>
                      {transaction.category}
                    </span>
                    <span>•</span>
                    <span>{formatDate(transaction.date)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span
                  className={`font-bold text-lg ${
                    transaction.type === 'income'
                      ? 'text-emerald-400'
                      : 'text-red-400'
                  }`}
                >
                  {transaction.type === 'income' ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </span>

                <button
                  onClick={() => onDelete(transaction.id)}
                  className="p-2 text-[#6b6b8a] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  title="Excluir transação"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {transactions.length >= 20 && (
          <div className="p-4 text-center border-t border-[#2a2a45]">
            <p className="text-sm text-[#6b6b8a]">
              Mostrando as 20 transações mais recentes
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
