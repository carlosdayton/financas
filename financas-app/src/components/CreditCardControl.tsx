import { useState, useMemo } from 'react';
import { CreditCard, AlertCircle, CheckCircle2, DollarSign, ChevronDown, ChevronUp } from 'lucide-react';
import type { Account, Transaction } from '../types/finance';
import { getCurrentMonthLocalISO, shiftMonthLocalISO } from '../utils/date';
import { usePrivacy } from '../contexts/PrivacyContext';

interface CreditCardControlProps {
  creditAccounts: Account[];
  transactions: Transaction[];
  onPayInvoice: (data: {
    accountId: string;
    month: string;
    amount: number;
    paymentAccountId: string;
    paymentDate: string;
  }) => void;
  allAccounts: Account[];
}

function formatCurrency(value: number, maskFn?: (s: string) => string) {
  const formatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  return maskFn ? maskFn(formatted) : formatted;
}

function formatMonth(yearMonth: string) {
  const [year, month] = yearMonth.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}

export function CreditCardControl({ creditAccounts, transactions, onPayInvoice, allAccounts }: CreditCardControlProps) {
  const currentMonth = getCurrentMonthLocalISO();
  const { mask } = usePrivacy();
  const fmt = (v: number) => formatCurrency(v, mask);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [expandedAccountId, setExpandedAccountId] = useState<string | null>(null);
  const [payingAccountId, setPayingAccountId] = useState<string | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    paymentAccountId: '',
    paymentDate: new Date().toISOString().split('T')[0],
  });

  const months = useMemo(() => {
    const result = [];
    for (let i = -2; i <= 1; i++) {
      result.push(shiftMonthLocalISO(currentMonth, i));
    }
    return result;
  }, [currentMonth]);

  const invoiceData = useMemo(() => {
    return creditAccounts.map((account) => {
      const monthExpenses = transactions.filter(
        (t) =>
          t.accountId === account.id &&
          t.type === 'expense' &&
          !t.isTransfer &&
          t.date.startsWith(selectedMonth)
      );

      const totalSpent = monthExpenses.reduce((sum, t) => sum + t.amount, 0);
      const limit = account.creditLimit ?? 0;
      const usagePercent = limit > 0 ? (totalSpent / limit) * 100 : 0;
      const available = limit > 0 ? Math.max(limit - totalSpent, 0) : null;

      const isPaid = transactions.some(
        (t) =>
          t.accountId === account.id &&
          t.type === 'income' &&
          t.isTransfer &&
          t.date.startsWith(selectedMonth) &&
          t.category === 'Fatura Cartão'
      );

      return { account, monthExpenses, totalSpent, limit, usagePercent, available, isPaid };
    });
  }, [creditAccounts, transactions, selectedMonth]);

  const nonCreditAccounts = allAccounts.filter((a) => a.type !== 'credit');

  if (creditAccounts.length === 0) {
    return (
      <div className="glass p-8 text-center rounded-2xl animate-fade-in-up">
        <CreditCard className="w-12 h-12 mx-auto mb-3 text-[var(--text-muted)]" />
        <h3 className="text-base font-display font-semibold" style={{ color: 'var(--text-primary)' }}>
          Nenhum Cartão de Crédito Cadastrado
        </h3>
        <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto mt-1">
          Crie uma conta do tipo "Cartão de Crédito" na aba Contas para gerenciar limites e faturas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in-up">
      {/* Header Banner */}
      <div className="glass p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-display font-bold" style={{ color: 'var(--text-primary)' }}>
              Faturas de Cartão de Crédito
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Controle de consumo, vencimentos e limites
            </p>
          </div>
        </div>

        {/* Month Selector Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)]">
          {months.map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMonth(m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedMonth === m
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              {m === currentMonth ? 'Este Mês' : formatMonth(m).split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Credit Cards Grid */}
      <div className="space-y-4">
        {invoiceData.map(({ account, monthExpenses, totalSpent, limit, usagePercent, available, isPaid }) => {
          const isCritical = usagePercent >= 90;
          const isWarning = usagePercent >= 70 && usagePercent < 90;
          const isExpanded = expandedAccountId === account.id;
          const isPaying = payingAccountId === account.id;

          return (
            <div
              key={account.id}
              className={`glass rounded-2xl overflow-hidden border transition-all ${
                isPaid
                  ? 'border-emerald-500/30'
                  : isCritical
                  ? 'border-rose-500/50'
                  : isWarning
                  ? 'border-amber-500/50'
                  : 'border-[var(--border-color)]'
              }`}
            >
              {/* Card Header */}
              <div
                className="p-5 cursor-pointer hover:bg-[var(--bg-tertiary)]/30 transition-colors"
                onClick={() => setExpandedAccountId(isExpanded ? null : account.id)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/10"
                      style={{ backgroundColor: `${account.color}25` }}
                    >
                      <CreditCard className="w-5 h-5" style={{ color: account.color }} />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-base" style={{ color: 'var(--text-primary)' }}>
                        {account.name}
                      </h3>
                      <p className="text-xs text-[var(--text-muted)] capitalize">
                        Fatura de {formatMonth(selectedMonth)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 justify-between sm:justify-end">
                    {isPaid ? (
                      <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Paga
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/20">
                        <AlertCircle className="w-3.5 h-3.5" /> Pendente
                      </span>
                    )}

                    <div className="text-right">
                      <p
                        className={`text-lg font-mono font-bold ${
                          isCritical ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-rose-400'
                        }`}
                      >
                        {fmt(totalSpent)}
                      </p>
                      {limit > 0 && (
                        <p className="text-[11px] text-[var(--text-muted)] font-mono">
                          Limite: {fmt(limit)}
                        </p>
                      )}
                    </div>

                    <div className="p-1 rounded-lg text-[var(--text-muted)]">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {/* Usage Bar */}
                {limit > 0 && (
                  <div className="mt-3.5">
                    <div className="flex justify-between text-xs mb-1.5 font-medium text-[var(--text-muted)]">
                      <span>{usagePercent.toFixed(0)}% limite usado</span>
                      {available !== null && <span>{fmt(available)} disponível</span>}
                    </div>
                    <div className="h-2 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(usagePercent, 100)}%`,
                          background: isCritical
                            ? 'var(--accent-danger)'
                            : isWarning
                            ? 'var(--accent-warning)'
                            : account.color,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="border-t border-[var(--border-color)] bg-[var(--bg-tertiary)]/20 animate-fade-in">
                  {/* Pay Invoice Form */}
                  {!isPaid && totalSpent > 0 && (
                    <div className="p-4 border-b border-[var(--border-color)] bg-[var(--bg-tertiary)]/40">
                      {!isPaying ? (
                        <button
                          onClick={() => {
                            setPayingAccountId(account.id);
                            setPaymentForm({
                              paymentAccountId: nonCreditAccounts[0]?.id ?? '',
                              paymentDate: new Date().toISOString().split('T')[0],
                            });
                          }}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 shadow-md shadow-emerald-500/20 transition-all"
                        >
                          <DollarSign className="w-4 h-4" />
                          Pagar Fatura ({fmt(totalSpent)})
                        </button>
                      ) : (
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                            Confirmar Pagamento de Fatura ({fmt(totalSpent)})
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-semibold text-[var(--text-muted)] mb-1">
                                Conta de Débito
                              </label>
                              <select
                                value={paymentForm.paymentAccountId}
                                onChange={(e) =>
                                  setPaymentForm({ ...paymentForm, paymentAccountId: e.target.value })
                                }
                                className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none"
                              >
                                {nonCreditAccounts.map((a) => (
                                  <option key={a.id} value={a.id}>
                                    {a.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-[var(--text-muted)] mb-1">
                                Data do Pagamento
                              </label>
                              <input
                                type="date"
                                value={paymentForm.paymentDate}
                                onChange={(e) =>
                                  setPaymentForm({ ...paymentForm, paymentDate: e.target.value })
                                }
                                className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none cursor-pointer"
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-2 pt-2">
                            <button
                              onClick={() => setPayingAccountId(null)}
                              className="px-3.5 py-1.5 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={() => {
                                onPayInvoice({
                                  accountId: account.id,
                                  month: selectedMonth,
                                  amount: totalSpent,
                                  paymentAccountId: paymentForm.paymentAccountId,
                                  paymentDate: paymentForm.paymentDate,
                                });
                                setPayingAccountId(null);
                              }}
                              disabled={!paymentForm.paymentAccountId}
                              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl shadow-md disabled:opacity-50"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              Confirmar Pagamento
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Transaction Items */}
                  <div className="divide-y divide-[var(--border-color)]">
                    {monthExpenses.length === 0 ? (
                      <div className="p-6 text-center text-xs text-[var(--text-muted)]">
                        Nenhum lançamento no cartão nesta fatura.
                      </div>
                    ) : (
                      monthExpenses.map((t) => (
                        <div key={t.id} className="px-5 py-3 flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-[var(--text-primary)]">{t.description}</p>
                            <div className="flex items-center gap-2 mt-0.5 text-xs text-[var(--text-muted)]">
                              <span>{t.category}</span>
                              <span>·</span>
                              <span>{t.date}</span>
                            </div>
                          </div>
                          <span className="text-sm font-mono font-bold text-rose-400">{fmt(t.amount)}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
