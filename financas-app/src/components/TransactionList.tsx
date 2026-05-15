import { useState } from 'react';
import { Trash2, Pencil, ChevronDown, ChevronUp } from 'lucide-react';
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
      <div className="py-14 text-center border border-dashed border-[var(--border-color)] rounded-lg">
        <p className="text-sm text-[var(--text-muted)]">Nenhuma transação encontrada</p>
      </div>
    );
  }

  const groups = groupByDate(transactions);

  return (
    <div className="border border-[var(--border-color)] rounded-lg overflow-hidden divide-y divide-[var(--border-color)]">
      {groups.map(([date, group]) => {
        const dayBalance = group
          .filter(t => !t.isTransfer)
          .reduce((s, t) => s + (t.type === 'income' ? t.amount : -t.amount), 0);

        return (
          <div key={date}>
            {/* Date header */}
            <div className="px-4 py-2 flex items-center justify-between bg-[var(--bg-secondary)]">
              <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                {formatDateLabel(date)}
              </span>
              <span className={`text-xs font-mono font-bold ${dayBalance >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {dayBalance >= 0 ? '+' : ''}{formatCurrency(dayBalance)}
              </span>
            </div>

            {/* Transactions */}
            {group.map((t) => {
              const isExpanded = expandedId === t.id;
              const stripColor = t.isTransfer
                ? 'bg-[var(--text-muted)]'
                : t.type === 'income'
                ? 'bg-emerald-500'
                : 'bg-red-500';
              const amountColor = t.isTransfer
                ? 'text-[var(--text-secondary)]'
                : t.type === 'income'
                ? 'text-emerald-500'
                : 'text-[var(--text-primary)]';

              return (
                <div
                  key={t.id}
                  className="group flex items-start px-4 py-3 hover:bg-[var(--bg-secondary)] transition-colors"
                >
                  {/* Left color strip */}
                  <div className={`w-0.5 self-stretch mr-3 rounded-full flex-shrink-0 mt-0.5 ${stripColor}`} />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[var(--text-primary)] truncate leading-snug">
                          {t.description}
                        </p>
                        <p className="text-xs text-[var(--text-muted)] mt-0.5">
                          {t.category}
                          {t.isRecurring && (
                            <span className="ml-2 text-[var(--accent-secondary)]">· recorrente</span>
                          )}
                        </p>
                      </div>

                      <div className="flex items-center gap-0.5 flex-shrink-0">
                        <span className={`text-sm font-mono font-bold ${amountColor}`}>
                          {t.isTransfer
                            ? formatCurrency(t.amount)
                            : `${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount)}`}
                        </span>

                        {t.notes && (
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : t.id)}
                            className="p-1 opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                          >
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        )}

                        {!t.isTransfer && (
                          <button
                            onClick={() => onEdit(t)}
                            className="p-1 opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                            title="Editar"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => onDelete(t.id)}
                          className="p-1 opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-red-500 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {t.notes && isExpanded && (
                      <p className="mt-2 text-xs text-[var(--text-secondary)] italic border-l-2 border-[var(--border-color)] pl-2.5">
                        {t.notes}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}

      {transactions.length >= 50 && (
        <div className="px-4 py-3 text-center bg-[var(--bg-secondary)]">
          <p className="text-xs text-[var(--text-muted)]">Mostrando as 50 transações mais recentes</p>
        </div>
      )}
    </div>
  );
}
