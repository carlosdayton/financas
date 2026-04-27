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
  AlertCircle
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
  'Outros'
];

export function Installments({ 
  installments, 
  onAddInstallment, 
  onPayInstallment, 
  onDeleteInstallment,
  getInstallmentPayments 
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

  const activeInstallments = installments.filter(inst => inst.isActive);
  const completedInstallments = installments.filter(inst => !inst.isActive);

  const getProgressPercentage = (inst: Installment) => {
    return (inst.paidInstallments / inst.totalInstallments) * 100;
  };

  const getRemainingAmount = (inst: Installment) => {
    return inst.totalAmount - (inst.installmentAmount * inst.paidInstallments);
  };

  return (
    <div className="space-y-6">
      {/* Add Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-5 h-5" />
          Novo Parcelamento
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="relative rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-indigo-500/20">
              <CreditCard className="w-5 h-5 text-indigo-400" />
            </div>
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Ativos</span>
          </div>
          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{activeInstallments.length}</p>
        </div>

        <div className="relative rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Valor Restante</span>
          </div>
          <p className="text-2xl font-bold text-emerald-400">
            {formatCurrency(activeInstallments.reduce((sum, inst) => sum + getRemainingAmount(inst), 0))}
          </p>
        </div>

        <div className="relative rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <Calendar className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Concluídos</span>
          </div>
          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{completedInstallments.length}</p>
        </div>
      </div>

      {/* Add Form */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="rounded-2xl p-6 space-y-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Novo Parcelamento</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Descrição</label>
              <input
                type="text"
                value={newInstallment.description}
                onChange={(e) => setNewInstallment({ ...newInstallment, description: e.target.value })}
                placeholder="Ex: iPhone 15 Pro"
                className="w-full px-4 py-2 rounded-xl border outline-none focus:ring-2 focus:ring-indigo-500/50"
                style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Categoria</label>
              <select
                value={newInstallment.category}
                onChange={(e) => setNewInstallment({ ...newInstallment, category: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border outline-none focus:ring-2 focus:ring-indigo-500/50"
                style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Valor Total</label>
              <input
                type="number"
                step="0.01"
                value={newInstallment.totalAmount}
                onChange={(e) => setNewInstallment({ ...newInstallment, totalAmount: e.target.value })}
                placeholder="R$ 0,00"
                className="w-full px-4 py-2 rounded-xl border outline-none focus:ring-2 focus:ring-indigo-500/50"
                style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Valor da Parcela</label>
              <input
                type="number"
                step="0.01"
                value={newInstallment.installmentAmount}
                onChange={(e) => setNewInstallment({ ...newInstallment, installmentAmount: e.target.value })}
                placeholder="R$ 0,00"
                className="w-full px-4 py-2 rounded-xl border outline-none focus:ring-2 focus:ring-indigo-500/50"
                style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Total de Parcelas</label>
              <input
                type="number"
                value={newInstallment.totalInstallments}
                onChange={(e) => setNewInstallment({ ...newInstallment, totalInstallments: e.target.value })}
                placeholder="12"
                className="w-full px-4 py-2 rounded-xl border outline-none focus:ring-2 focus:ring-indigo-500/50"
                style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Primeira Parcela</label>
              <input
                type="date"
                value={newInstallment.startDate}
                onChange={(e) => setNewInstallment({ ...newInstallment, startDate: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border outline-none focus:ring-2 focus:ring-indigo-500/50"
                style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                required
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
            >
              Criar Parcelamento
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-6 py-2 rounded-xl font-medium transition-colors"
              style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Active Installments */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Parcelamentos Ativos</h3>
        
        {activeInstallments.length === 0 ? (
          <div className="text-center py-8 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: 'var(--bg-tertiary)' }}>
              <Package className="w-8 h-8" style={{ color: 'var(--text-muted)' }} />
            </div>
            <p style={{ color: 'var(--text-secondary)' }}>Nenhum parcelamento ativo.</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Adicione uma compra parcelada para começar!</p>
          </div>
        ) : (
          activeInstallments.map((inst) => (
            <div
              key={inst.id}
              className="rounded-2xl p-5 transition-all hover:scale-[1.01]"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-indigo-500/20">
                    <CreditCard className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{inst.description}</h4>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{inst.category}</p>
                  </div>
                </div>
                <button
                  onClick={() => onDeleteInstallment(inst.id)}
                  className="p-2 rounded-lg transition-colors hover:bg-red-500/20"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Progresso: {inst.paidInstallments} de {inst.totalInstallments} parcelas
                  </span>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {getProgressPercentage(inst).toFixed(0)}%
                  </span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
                    style={{ width: `${getProgressPercentage(inst)}%` }}
                  />
                </div>
              </div>

              {/* Values */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Valor Total</p>
                  <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(inst.totalAmount)}</p>
                </div>
                <div>
                  <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Parcela</p>
                  <p className="font-semibold text-indigo-400">{formatCurrency(inst.installmentAmount)}</p>
                </div>
                <div>
                  <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Restante</p>
                  <p className="font-semibold text-emerald-400">{formatCurrency(getRemainingAmount(inst))}</p>
                </div>
              </div>

              {/* Payments Grid */}
              <div className="pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>Parcelas:</p>
                <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-12 gap-2">
                  {getInstallmentPayments(inst.id).map((payment) => {
                    const isOverdue = !payment.isPaid && new Date(payment.dueDate) < new Date();
                    return (
                      <button
                        key={payment.id}
                        onClick={() => !payment.isPaid && onPayInstallment(inst.id, payment.installmentNumber)}
                        disabled={payment.isPaid}
                        className={`p-2 rounded-lg text-xs font-medium transition-all ${
                          payment.isPaid
                            ? 'bg-emerald-500/20 text-emerald-400 cursor-default'
                            : isOverdue
                            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                            : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                        }`}
                        title={`Vencimento: ${new Date(payment.dueDate).toLocaleDateString('pt-BR')}`}
                      >
                        {payment.isPaid ? (
                          <CheckCircle2 className="w-4 h-4 mx-auto" />
                        ) : isOverdue ? (
                          <AlertCircle className="w-4 h-4 mx-auto" />
                        ) : (
                          <Circle className="w-4 h-4 mx-auto" />
                        )}
                        <span className="block mt-1">{payment.installmentNumber}</span>
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
        <div className="space-y-4">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Concluídos</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {completedInstallments.map((inst) => (
              <div
                key={inst.id}
                className="rounded-2xl p-4 opacity-70"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/20">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>{inst.description}</h4>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {formatCurrency(inst.totalAmount)} • {inst.totalInstallments}x
                    </p>
                  </div>
                  <button
                    onClick={() => onDeleteInstallment(inst.id)}
                    className="p-2 rounded-lg transition-colors hover:bg-red-500/20"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
