import { useState, useEffect, useMemo } from 'react';
import { Search, Calendar, Tag, Filter, X } from 'lucide-react';
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
  const [isExpanded, setIsExpanded] = useState(false);

  // Get unique months from transactions
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    transactions.forEach(t => {
      const month = t.date.substring(0, 7); // YYYY-MM
      months.add(month);
    });
    return Array.from(months).sort().reverse();
  }, [transactions]);

  // Apply filters
  useEffect(() => {
    let filtered = [...transactions];

    if (searchTerm) {
      filtered = filtered.filter(t =>
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(t => t.type === selectedType);
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    if (selectedMonth !== 'all') {
      filtered = filtered.filter(t => t.date.startsWith(selectedMonth));
    }

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
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="relative mb-6">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl blur-xl" />
      
      <div className="relative rounded-2xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
        {/* Search Bar */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar transações..."
              className="w-full pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
            />
          </div>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
              isExpanded
                ? 'bg-indigo-500 text-white'
                : ''
            }`}
            style={!isExpanded ? { background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' } : undefined}
          >
            <Filter className="w-5 h-5" />
            <span className="hidden sm:inline">Filtros</span>
            {hasActiveFilters && (
              <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                {[selectedType, selectedCategory, selectedMonth].filter(f => f !== 'all').length + (searchTerm ? 1 : 0)}
              </span>
            )}
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="p-3 rounded-xl transition-all"
              style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
              title="Limpar filtros"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Expanded Filters */}
        {isExpanded && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 animate-in slide-in-from-top-2" style={{ borderTop: '1px solid var(--border-color)' }}>
            {/* Type Filter */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                <Calendar className="w-4 h-4" />
                Tipo
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as TransactionType | 'all')}
                className="w-full px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
              >
                <option value="all">Todos</option>
                <option value="income">Receitas</option>
                <option value="expense">Despesas</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                <Tag className="w-4 h-4" />
                Categoria
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
              >
                <option value="all">Todas</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Month Filter */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                <Calendar className="w-4 h-4" />
                Período
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
              >
                <option value="all">Todo período</option>
                {availableMonths.map((month) => (
                  <option key={month} value={month}>
                    {formatMonth(month)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Results count */}
        <div className="mt-4 pt-4 flex items-center justify-between" style={{ borderTop: '1px solid var(--border-color)' }}>
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {transactions.length} transações no total
          </span>
          {hasActiveFilters && (
            <span className="text-sm text-indigo-400">
              Mostrando resultados filtrados
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
