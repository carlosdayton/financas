import { useState, useEffect, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import type { Transaction, TransactionType, Category } from '../types/finance';

interface FiltersProps {
  transactions: Transaction[];
  categories: Category[];
  onFilterChange: (filtered: Transaction[]) => void;
}

export function Filters({ transactions, categories, onFilterChange }: FiltersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<TransactionType | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    transactions.forEach((t) => months.add(t.date.substring(0, 7)));
    return Array.from(months).sort().reverse();
  }, [transactions]);

  useEffect(() => {
    let filtered = [...transactions];
    if (searchTerm) {
      filtered = filtered.filter(
        (t) =>
          t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedType !== 'all') filtered = filtered.filter((t) => t.type === selectedType);
    if (selectedCategory !== 'all') filtered = filtered.filter((t) => t.category === selectedCategory);
    if (selectedMonth !== 'all') filtered = filtered.filter((t) => t.date.startsWith(selectedMonth));
    onFilterChange(filtered);
  }, [transactions, searchTerm, selectedType, selectedCategory, selectedMonth, onFilterChange]);

  const hasActiveFilters = searchTerm || selectedType !== 'all' || selectedCategory !== 'all' || selectedMonth !== 'all';

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType('all');
    setSelectedCategory('all');
    setSelectedMonth('all');
  };

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('pt-BR', {
      month: 'short',
      year: '2-digit',
    });
  };

  return (
    <div className="glass p-3.5 rounded-2xl flex flex-col md:flex-row md:items-center gap-3">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar lançamento ou categoria..."
          className="w-full pl-10 pr-3.5 py-2 text-xs sm:text-sm rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-emerald-500/50 transition-colors"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Type pills */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)]">
          {(['all', 'income', 'expense'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                selectedType === t
                  ? t === 'income'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : t === 'expense'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              {t === 'all' ? 'Tudo' : t === 'income' ? 'Receitas' : 'Despesas'}
            </button>
          ))}
        </div>

        {/* Category Select */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 text-xs sm:text-sm rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none cursor-pointer"
        >
          <option value="all">Todas Categorias</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>{cat.name}</option>
          ))}
        </select>

        {/* Month Select */}
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-3 py-2 text-xs sm:text-sm rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none cursor-pointer"
        >
          <option value="all">Todo Período</option>
          {availableMonths.map((month) => (
            <option key={month} value={month}>{formatMonth(month)}</option>
          ))}
        </select>

        {/* Clear Button */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
            title="Limpar filtros"
          >
            <X className="w-3.5 h-3.5" />
            Limpar
          </button>
        )}
      </div>
    </div>
  );
}
