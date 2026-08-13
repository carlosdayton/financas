import { useState } from 'react';
import { Trash2, Pencil, ChevronDown, ChevronUp, ArrowUpRight, ArrowDownRight, Repeat } from 'lucide-react';
import type { Transaction } from '../types/finance';
import { usePrivacy } from '../contexts/PrivacyContext';
import { getTodayLocalISO } from '../utils/date';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
}

function groupByDate(transactions: Transaction[]): [string, Transaction[]][] {
  const groups = new Map<string, Transaction[]>();
  for (const t of transactions) {
    const key = t.date;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(t);
  }
  return Array.from(groups.entries()).sort((a, b) => b[0].localeCompare(a[0]));
}

function formatDateLabel(dateStr: string): string {
  const today = getTodayLocalISO();
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  if (dateStr === today) return 'Hoje';
  const [ty, tm, td] = today.split('-').map(Number);
  const todayDate = new Date(ty, tm - 1, td);
  const diffDays = Math.round((todayDate.getTime() - date.getTime()) / 86400000);
  if (diffDays === 1) return 'Ontem';
  return date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });
}

export function TransactionList({ transactions, onDelete, onEdit }: TransactionListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { mask } = usePrivacy();

  const formatCurrency = (value: number) =>
    mask(new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value));

  if (transactions.length === 0) {
    return (
      <div className="glass py-16 text-center rounded-2xl flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] mb-3">
          <ArrowUpRight className="w-6 h-6" />
        </div>
        <h4 className="text-base font-display font-semibold" style={{ color: 'var(--text-primary)' }}>
          Nenhum lançamento encontrado
        </h4>
        <p className="text-xs text-[var(--text-muted)] mt-1 max-w-xs">
          Tente alterar seus filtros de pesquisa ou adicione uma nova transação.
        </p>
      </div>
    );
  }

  const groups = groupByDate(transactions);

  return (
    <div className="space-y-4">
      {groups.map(([date, group]) => {
        const dayBalance = group
          .filter((t) => !t.isTransfer)
          .reduce((s, t) => s + (t.type === 'income' ? t.amount : -t.amount), 0);

        return (
          <div key={date} className="glass rounded-2xl overflow-hidden border border-[var(--border-color)]">
            {/* Date header */}
            <div className="px-4 py-2.5 flex items-center justify-between gap-2 bg-[var(--bg-tertiary)]/50 border-b border-[var(--border-color)]">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] capitalize">
                {formatDateLabel(date)}
              </span>
              <span
                className={`text-xs font-mono font-bold ${
                  dayBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {dayBalance >= 0 ? '+' : ''}
                {formatCurrency(dayBalance)}
              </span>
            </div>

            {/* Transaction Rows */}
            <div className="divide-y divide-[var(--border-color)]">
              {group.map((t) => {
                const isExpanded = expandedId === t.id;
                const isIncome = t.type === 'income';

                return (
                  <div
                    key={t.id}
                    className="p-3.5 sm:px-5 flex items-center justify-between gap-3 hover:bg-[var(--bg-tertiary)]/30 transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Icon Badge */}
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                          t.isTransfer
                            ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                            : isIncome
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}
                      >
                        {t.isTransfer ? (
                          <Repeat className="w-4 h-4" />
                        ) : isIncome ? (
                          <ArrowUpRight className="w-4.5 h-4.5" />
                        ) : (
                          <ArrowDownRight className="w-4.5 h-4.5" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                            {t.description}
                          </p>
                          {t.isRecurring && (
                            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20">
                              Recorrente
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-[var(--text-muted)] font-medium">
                            {t.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Amount & Actions */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <span
                          className={`text-sm sm:text-base font-mono font-bold block ${
                            t.isTransfer
                              ? 'text-[var(--text-secondary)]'
                              : isIncome
                              ? 'text-emerald-400'
                              : 'text-[var(--text-primary)]'
                          }`}
                        >
                          {t.isTransfer
                            ? formatCurrency(t.amount)
                            : `${isIncome ? '+' : '-'}${formatCurrency(t.amount)}`}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        {t.notes && (
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : t.id)}
                            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
                            title="Ver detalhes"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        )}

                        {!t.isTransfer && (
                          <button
                            onClick={() => onEdit(t)}
                            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => onDelete(t.id)}
                          className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {transactions.length >= 50 && (
        <p className="text-center text-xs text-[var(--text-muted)] py-2">
          Exibindo as 50 transações mais recentes
        </p>
      )}
    </div>
  );
}
