import { useState, useMemo, useEffect, useRef } from 'react';
import { Sparkles, X, Check, ArrowUpRight, ArrowDownRight, Tag, Calendar, Wallet, Layers, Lightbulb } from 'lucide-react';
import type { Category, TransactionType, Account } from '../types/finance';
import { parseNaturalLanguageTransaction, type ParsedTransaction } from '../utils/aiParser';

interface QuickAddAIModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  accounts: Account[];
  onConfirm: (data: {
    description: string;
    amount: number;
    type: TransactionType;
    category: string;
    date: string;
    accountId?: string;
    isInstallment?: boolean;
    totalInstallments?: number;
    installmentAmount?: number;
  }) => void;
}

const EXAMPLE_PROMPTS = [
  'Almoço no restaurante 42,90 no Nubank',
  'Geladeira 2400 em 10x no cartão',
  'Uber para o trabalho 27,50 ontem no Itaú',
  'Salário 4500 dia 05',
];

export function QuickAddAIModal({ isOpen, onClose, categories, accounts, onConfirm }: QuickAddAIModalProps) {
  const [prompt, setPrompt] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPrompt('');
      setSelectedAccountId('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const parsed = useMemo<ParsedTransaction | null>(() => {
    return parseNaturalLanguageTransaction(prompt, categories, accounts);
  }, [prompt, categories, accounts]);

  useEffect(() => {
    if (parsed?.accountId) {
      setSelectedAccountId(parsed.accountId);
    } else if (accounts.length > 0 && !selectedAccountId) {
      setSelectedAccountId(accounts[0].id);
    }
  }, [parsed, accounts]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!parsed) return;
    onConfirm({
      description: parsed.description,
      amount: parsed.amount,
      type: parsed.type,
      category: parsed.category,
      date: parsed.date,
      accountId: selectedAccountId || parsed.accountId,
      isInstallment: parsed.isInstallment,
      totalInstallments: parsed.totalInstallments,
      installmentAmount: parsed.installmentAmount,
    });
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && parsed) {
      e.preventDefault();
      handleConfirm();
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const formatDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('pt-BR');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg glass p-6 rounded-2xl border border-[var(--border-color)] shadow-2xl space-y-5 animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-black font-bold shadow-md shadow-emerald-500/20">
              <Sparkles className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-lg font-display font-bold" style={{ color: 'var(--text-primary)' }}>
                Lançamento Inteligente com IA
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Digite frases como "Geladeira 2400 em 10x" ou "Almoço 42 no Nubank"
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Prompt Input */}
        <div className="space-y-2">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Descreva seu lançamento..."
              className="w-full px-4 py-3 text-sm sm:text-base rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-emerald-500/50 transition-colors shadow-inner"
            />
            {prompt && (
              <button
                onClick={() => setPrompt('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Example prompt pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span className="text-[11px] font-semibold text-[var(--text-muted)] flex-shrink-0">Exemplos:</span>
            {EXAMPLE_PROMPTS.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => setPrompt(ex)}
                className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] whitespace-nowrap transition-colors flex-shrink-0"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>

        {/* Live Parsed Preview */}
        {parsed ? (
          <div className="p-4 rounded-xl bg-[var(--bg-tertiary)]/60 border border-emerald-500/30 space-y-3.5 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Interpretação da IA ({parsed.confidence}% de precisão)
              </span>

              <div className="flex items-center gap-2">
                {parsed.isInstallment && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center gap-1">
                    <Layers className="w-3 h-3" />
                    {parsed.totalInstallments}x de {formatCurrency(parsed.installmentAmount || 0)}
                  </span>
                )}

                <span
                  className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    parsed.type === 'income'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                  }`}
                >
                  {parsed.type === 'income' ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  {parsed.type === 'income' ? 'Receita' : 'Despesa'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div>
                <span className="text-[10px] font-semibold uppercase text-[var(--text-muted)] block">Descrição</span>
                <span className="text-sm font-semibold text-[var(--text-primary)] truncate block">
                  {parsed.description}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-semibold uppercase text-[var(--text-muted)] block">Valor</span>
                <span
                  className={`text-sm font-mono font-bold block ${
                    parsed.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {formatCurrency(parsed.amount)}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-semibold uppercase text-[var(--text-muted)] block flex items-center gap-1">
                  <Tag className="w-3 h-3" /> Categoria
                </span>
                <span className="text-xs font-medium text-[var(--text-secondary)] truncate block">
                  {parsed.category}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-semibold uppercase text-[var(--text-muted)] block flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Data
                </span>
                <span className="text-xs font-medium text-[var(--text-secondary)] block">
                  {formatDate(parsed.date)}
                </span>
              </div>
            </div>

            {/* Account Selector Bar */}
            <div className="pt-2 border-t border-[var(--border-color)] flex items-center justify-between gap-3">
              <span className="text-xs font-semibold text-[var(--text-muted)] flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                Conta de Lançamento:
              </span>

              {accounts.length > 0 ? (
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none cursor-pointer"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="text-xs font-semibold text-[var(--text-secondary)]">Conta Principal</span>
              )}
            </div>
          </div>
        ) : prompt.trim() ? (
          <div className="p-4 rounded-xl bg-[var(--bg-tertiary)]/40 border border-[var(--border-color)] text-center text-xs text-[var(--text-muted)]">
            Digite um valor (ex: 42 ou 2400 10x) para que a IA processe a transação.
          </div>
        ) : null}

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-color)]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={!parsed}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-black bg-emerald-500 hover:bg-emerald-400 shadow-md shadow-emerald-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            Salvar Transação
          </button>
        </div>
      </div>
    </div>
  );
}
