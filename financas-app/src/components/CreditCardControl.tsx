import { useState, useMemo } from 'react';
import { CreditCard, AlertCircle, CheckCircle2, Calendar, DollarSign, ChevronDown, ChevronUp, Receipt } from 'lucide-react';
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

  // Compute invoice totals per credit account for selected month
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

      // Check if invoice was paid (look for a transfer-in transaction tagged as invoice payment)
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
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-rose-500/10 rounded-2xl blur-xl" />
        <div className="relative rounded-2xl p-8 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <CreditCard className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Nenhum Cartão de Crédito</h3>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Crie uma conta do tipo "Cartão de Crédito" na aba Contas para começar a controlar faturas.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mb-8">
      <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-rose-500/10 rounded-2xl blur-xl" />

      <div className="relative rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
            <div className="p-2 bg-gradient-to-br from-pink-500/20 to-rose-500/20 rounded-2xl">
              <CreditCard className="w-5 h-5 text-pink-400" />
            </div>
            Controle de Faturas
          </h2>

          {/* Month Selector */}
          <div className="flex gap-1">
            {months.map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMonth(m)}
                className={`px-3 py-1.5 rounded-2xl text-xs font-medium transition-all ${
                  selectedMonth === m
                    ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
                    : ''
                }`}
                style={selectedMonth !== m ? { background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' } : undefined}
              >
                {m === currentMonth ? 'Este mês' : formatMonth(m).split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {invoiceData.map(({ account, monthExpenses, totalSpent, limit, usagePercent, available, isPaid }) => {
            const isCritical = usagePercent >= 90;
            const isWarning = usagePercent >= 70 && usagePercent < 90;
            const isExpanded = expandedAccountId === account.id;
            const isPaying = payingAccountId === account.id;

            return (
              <div
                key={account.id}
                className="rounded-2xl overflow-hidden"
                style={{ border: `1px solid ${isPaid ? '#10b981' : isCritical ? '#ef444450' : isWarning ? '#f59e0b50' : 'var(--border-color)'}` }}
              >
                {/* Card Header */}
                <div
                  className="p-4 cursor-pointer transition-colors"
                  style={{ background: 'var(--bg-tertiary)' }}
                  onClick={() => setExpandedAccountId(isExpanded ? null : account.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center"
                        style={{ backgroundColor: `${account.color}20` }}
                      >
                        <CreditCard className="w-5 h-5" style={{ color: account.color }} />
                      </div>
                      <div>
                        <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{account.name}</h3>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {formatMonth(selectedMonth)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {isPaid ? (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-semibold bg-emerald-500/15 text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Paga
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-semibold bg-amber-500/15 text-amber-400">
                          <AlertCircle className="w-3.5 h-3.5" /> Pendente
                        </span>
                      )}
                      <div className="text-right">
                        <p className={`font-bold ${isCritical ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-pink-400'}`}>
                          {fmt(totalSpent)}
                        </p>
                        {limit > 0 && (
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            Limite: {fmt(limit)}
                          </p>
                        )}
                      </div>
                      {isExpanded ? <ChevronUp className="w-4 h-4" style={{ color: 'var(--text-muted)' }} /> : <ChevronDown className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />}
                    </div>
                  </div>

                  {/* Usage Bar */}
                  {limit > 0 && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                        <span>{usagePercent.toFixed(0)}% utilizado</span>
                        {available !== null && <span>{fmt(available)} disponível</span>}
                      </div>
                      <div className="h-2 rounded-2xl overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
                        <div
                          className="h-full rounded-2xl transition-all duration-500"
                          style={{
                            width: `${Math.min(usagePercent, 100)}%`,
                            background: isCritical
                              ? 'linear-gradient(90deg, #ef4444, #dc2626)'
                              : isWarning
                              ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                              : `linear-gradient(90deg, ${account.color}, ${account.color}cc)`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Expanded: transactions + pay button */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid var(--border-color)' }}>
                    {/* Pay Invoice */}
                    {!isPaid && totalSpent > 0 && (
                      <div className="p-4" style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
                        {!isPaying ? (
                          <button
                            onClick={() => {
                              setPayingAccountId(account.id);
                              setPaymentForm({
                                paymentAccountId: nonCreditAccounts[0]?.id ?? '',
                                paymentDate: new Date().toISOString().split('T')[0],
                              });
                            }}
                            className="flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold text-white transition-all bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 shadow-lg shadow-emerald-500/25"
                          >
                            <DollarSign className="w-4 h-4" />
                            Pagar Fatura ({fmt(totalSpent)})
                          </button>
                        ) : (
                          <div className="space-y-3">
                            <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                              Pagar fatura de {fmt(totalSpent)}
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Conta de pagamento</label>
                                <select
                                  value={paymentForm.paymentAccountId}
                                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentAccountId: e.target.value })}
                                  className="w-full px-3 py-2 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                  style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                                >
                                  {nonCreditAccounts.map((a) => (
                                    <option key={a.id} value={a.id}>{a.name}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Data do pagamento</label>
                                <input
                                  type="date"
                                  value={paymentForm.paymentDate}
                                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                                  className="w-full px-3 py-2 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                  style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                                />
                              </div>
                            </div>
                            <div className="flex gap-2">
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
                                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-2xl transition-all bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50"
                              >
                                <CheckCircle2 className="w-4 h-4" /> Confirmar Pagamento
                              </button>
                              <button
                                onClick={() => setPayingAccountId(null)}
                                className="px-4 py-2 text-sm rounded-2xl transition-colors"
                                style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Transaction list */}
                    <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                      {monthExpenses.length === 0 ? (
                        <div className="p-6 text-center">
                          <Receipt className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            Nenhuma despesa neste cartão em {formatMonth(selectedMonth)}.
                          </p>
                        </div>
                      ) : (
                        monthExpenses
                          .sort((a, b) => b.date.localeCompare(a.date))
                          .map((t) => (
                            <div key={t.id} className="flex items-center justify-between px-4 py-3">
                              <div>
                                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{t.description}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-xs px-2 py-0.5 rounded-2xl" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                                    {t.category}
                                  </span>
                                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                    <Calendar className="w-3 h-3 inline mr-1" />
                                    {t.date}
                                  </span>
                                  {t.notes && (
                                    <span className="text-xs italic" style={{ color: 'var(--text-muted)' }}>• {t.notes}</span>
                                  )}
                                </div>
                              </div>
                              <span className="font-semibold text-red-400 text-sm">{fmt(t.amount)}</span>
                            </div>
                          ))
                      )}
                    </div>

                    {/* Invoice total */}
                    {monthExpenses.length > 0 && (
                      <div
                        className="px-4 py-3 flex items-center justify-between"
                        style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)' }}
                      >
                        <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                          Total da fatura ({monthExpenses.length} itens)
                        </span>
                        <span className="font-bold text-pink-400">{fmt(totalSpent)}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
