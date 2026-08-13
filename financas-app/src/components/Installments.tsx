import { useState } from 'react';
import {
  CreditCard,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Calendar,
  DollarSign,
  Package,
  AlertCircle,
} from 'lucide-react';
import type { Installment, InstallmentPayment } from '../types/finance';
import { getTodayLocalISO } from '../utils/date';

interface InstallmentsProps {
  installments: Installment[];
  onAddInstallment: (data: Omit<Installment, 'id' | 'createdAt' | 'paidInstallments'>) => void;
  onPayInstallment: (installmentId: string, installmentNumber: number) => void;
  onDeleteInstallment: (id: string) => void;
  getInstallmentPayments: (installmentId: string) => InstallmentPayment[];
}

const CATEGORIES = [
  'Eletrônicos',
  'Móveis',
  'Viagem',
  'Educação',
  'Saúde',
  'Veículo',
  'Outros',
];

export function Installments({
  installments,
  onAddInstallment,
  onPayInstallment,
  onDeleteInstallment,
  getInstallmentPayments,
}: InstallmentsProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newInstallment, setNewInstallment] = useState({
    description: '',
    totalAmount: '',
    installmentAmount: '',
    totalInstallments: '',
    startDate: getTodayLocalISO(),
    category: CATEGORIES[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInstallment.description || !newInstallment.totalAmount || !newInstallment.installmentAmount) return;

    onAddInstallment({
      description: newInstallment.description,
      totalAmount: parseFloat(newInstallment.totalAmount),
      installmentAmount: parseFloat(newInstallment.installmentAmount),
      totalInstallments: parseInt(newInstallment.totalInstallments) || 1,
      startDate: newInstallment.startDate,
      category: newInstallment.category,
      isActive: true,
    });

    setNewInstallment({
      description: '',
      totalAmount: '',
      installmentAmount: '',
      totalInstallments: '',
      startDate: getTodayLocalISO(),
      category: CATEGORIES[0],
    });
    setIsAdding(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const activeInstallments = installments.filter((inst) => inst.isActive);
  const completedInstallments = installments.filter((inst) => !inst.isActive);

  const getProgressPercentage = (inst: Installment) => {
    return (inst.paidInstallments / inst.totalInstallments) * 100;
  };

  const getRemainingAmount = (inst: Installment) => {
    return inst.totalAmount - inst.installmentAmount * inst.paidInstallments;
  };

  return (
    <div className="space-y-5 animate-fade-in-up">
      {/* Header Banner */}
      <div className="glass p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-display font-bold" style={{ color: 'var(--text-primary)' }}>
              Compras Parceladas
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Gerencie parcelamentos de longo prazo e compromissos mensais
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-500/20"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Novo Parcelamento
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass p-4 rounded-2xl border border-[var(--border-color)]">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <CreditCard className="w-4.5 h-4.5" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Parcelamentos Ativos
            </span>
          </div>
          <p className="text-2xl font-mono font-bold" style={{ color: 'var(--text-primary)' }}>
            {activeInstallments.length}
          </p>
        </div>

        <div className="glass p-4 rounded-2xl border border-[var(--border-color)]">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-4.5 h-4.5" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Saldo Restante a Pagar
            </span>
          </div>
          <p className="text-2xl font-mono font-bold text-emerald-400">
            {formatCurrency(activeInstallments.reduce((sum, inst) => sum + getRemainingAmount(inst), 0))}
          </p>
        </div>

        <div className="glass p-4 rounded-2xl border border-[var(--border-color)]">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Calendar className="w-4.5 h-4.5" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Total Concluídos
            </span>
          </div>
          <p className="text-2xl font-mono font-bold" style={{ color: 'var(--text-primary)' }}>
            {completedInstallments.length}
          </p>
        </div>
      </div>

      {/* Form */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="glass p-5 rounded-2xl space-y-4 animate-fade-in">
          <h3 className="text-sm font-display font-bold text-[var(--text-primary)]">
            Cadastrar Compra Parcelada
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Descrição do Item/Serviço
              </label>
              <input
                type="text"
                value={newInstallment.description}
                onChange={(e) => setNewInstallment({ ...newInstallment, description: e.target.value })}
                placeholder="Ex: iPhone 15 Pro, Notebook, Sofá..."
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-indigo-500/50"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Categoria
              </label>
              <select
                value={newInstallment.category}
                onChange={(e) => setNewInstallment({ ...newInstallment, category: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Valor Total (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={newInstallment.totalAmount}
                onChange={(e) => setNewInstallment({ ...newInstallment, totalAmount: e.target.value })}
                placeholder="0,00"
                className="w-full px-3.5 py-2.5 text-sm font-mono font-bold rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Valor por Parcela (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={newInstallment.installmentAmount}
                onChange={(e) => setNewInstallment({ ...newInstallment, installmentAmount: e.target.value })}
                placeholder="0,00"
                className="w-full px-3.5 py-2.5 text-sm font-mono font-bold rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Qtd. de Parcelas
              </label>
              <input
                type="number"
                value={newInstallment.totalInstallments}
                onChange={(e) => setNewInstallment({ ...newInstallment, totalInstallments: e.target.value })}
                placeholder="12"
                className="w-full px-3.5 py-2.5 text-sm font-mono font-bold rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Data 1ª Parcela
              </label>
              <input
                type="date"
                value={newInstallment.startDate}
                onChange={(e) => setNewInstallment({ ...newInstallment, startDate: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none cursor-pointer"
                required
              />
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
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-500 hover:bg-indigo-600 shadow-md shadow-indigo-500/20"
            >
              Salvar Parcelamento
            </button>
          </div>
        </form>
      )}

      {/* Active List */}
      <div className="space-y-4">
        {activeInstallments.length === 0 ? (
          <div className="glass p-8 text-center rounded-2xl">
            <Package className="w-10 h-10 mx-auto mb-3 text-[var(--text-muted)]" />
            <h4 className="text-base font-display font-semibold" style={{ color: 'var(--text-primary)' }}>
              Nenhum parcelamento ativo
            </h4>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Adicione suas compras parceladas para acompanhar o cronograma de pagamentos.
            </p>
          </div>
        ) : (
          activeInstallments.map((inst) => (
            <div key={inst.id} className="glass p-5 rounded-2xl border border-[var(--border-color)] space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-base" style={{ color: 'var(--text-primary)' }}>
                      {inst.description}
                    </h4>
                    <span className="text-xs text-[var(--text-muted)]">{inst.category}</span>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteInstallment(inst.id)}
                  className="p-2 rounded-xl text-[var(--text-muted)] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Excluir parcelamento"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                  <span className="text-[var(--text-secondary)]">
                    Progresso: {inst.paidInstallments} de {inst.totalInstallments} parcelas seguras
                  </span>
                  <span className="text-indigo-400 font-mono">
                    {getProgressPercentage(inst).toFixed(0)}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${getProgressPercentage(inst)}%` }}
                  />
                </div>
              </div>

              {/* Values */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-[var(--bg-tertiary)]/40 border border-[var(--border-color)]">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-[var(--text-muted)] block">Valor Total</span>
                  <span className="text-sm font-mono font-bold" style={{ color: 'var(--text-primary)' }}>
                    {formatCurrency(inst.totalAmount)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-[var(--text-muted)] block">Valor Parcela</span>
                  <span className="text-sm font-mono font-bold text-indigo-400">
                    {formatCurrency(inst.installmentAmount)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-[var(--text-muted)] block">Restante</span>
                  <span className="text-sm font-mono font-bold text-emerald-400">
                    {formatCurrency(getRemainingAmount(inst))}
                  </span>
                </div>
              </div>

              {/* Payments Grid */}
              <div className="pt-2">
                <span className="text-xs font-semibold text-[var(--text-muted)] block mb-2">Parcelas do Cronograma:</span>
                <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-12 gap-1.5">
                  {getInstallmentPayments(inst.id).map((payment) => {
                    const isOverdue = !payment.isPaid && new Date(payment.dueDate) < new Date();

                    return (
                      <button
                        key={payment.id}
                        onClick={() => !payment.isPaid && onPayInstallment(inst.id, payment.installmentNumber)}
                        disabled={payment.isPaid}
                        className={`p-2 rounded-xl text-xs font-semibold transition-all flex flex-col items-center justify-center gap-0.5 ${
                          payment.isPaid
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 cursor-default'
                            : isOverdue
                            ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20 hover:bg-rose-500/25'
                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/20 hover:bg-amber-500/25'
                        }`}
                        title={`Vencimento: ${new Date(payment.dueDate).toLocaleDateString('pt-BR')}`}
                      >
                        {payment.isPaid ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : isOverdue ? (
                          <AlertCircle className="w-3.5 h-3.5" />
                        ) : (
                          <Circle className="w-3.5 h-3.5" />
                        )}
                        <span className="text-[10px] font-mono">{payment.installmentNumber}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Completed Installments */}
      {completedInstallments.length > 0 && (
        <div className="space-y-3 pt-4">
          <h3 className="text-sm font-display font-bold text-[var(--text-muted)] uppercase tracking-wider">
            Parcelamentos Finalizados
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {completedInstallments.map((inst) => (
              <div
                key={inst.id}
                className="glass p-4 rounded-xl flex items-center justify-between border border-[var(--border-color)] opacity-75"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {inst.description}
                    </h4>
                    <p className="text-xs font-mono text-[var(--text-muted)]">
                      {formatCurrency(inst.totalAmount)} • {inst.totalInstallments}x de {formatCurrency(inst.installmentAmount)}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteInstallment(inst.id)}
                  className="p-1.5 text-[var(--text-muted)] hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
