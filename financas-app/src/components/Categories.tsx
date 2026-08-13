import { useState } from 'react';
import { Plus, Trash2, Tag, Pencil } from 'lucide-react';
import type { Category, TransactionType } from '../types/finance';

interface CategoriesProps {
  categories: Category[];
  onAddCategory: (category: Omit<Category, 'id'>) => void;
  onUpdateCategory: (id: string, updates: Partial<Category>) => void;
  onDeleteCategory: (id: string) => void;
}

const PRESET_COLORS = [
  '#10b981', '#0ea5e9', '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316',
  '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#a855f7', '#f43f5e', '#64748b',
];

const DEFAULT_INCOME_CATEGORIES = ['1', '2', '3'];
const DEFAULT_EXPENSE_CATEGORIES = ['4', '5', '6', '7', '8', '9', '10'];

export function Categories({ categories, onAddCategory, onUpdateCategory, onDeleteCategory }: CategoriesProps) {
  const [activeType, setActiveType] = useState<TransactionType>('expense');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCat, setNewCat] = useState({ name: '', color: PRESET_COLORS[0], icon: 'tag' });
  const [editCat, setEditCat] = useState({ name: '', color: '', icon: '' });

  const filtered = categories.filter((c) => c.type === activeType);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCat.name.trim()) return;
    onAddCategory({ name: newCat.name.trim(), type: activeType, color: newCat.color, icon: newCat.icon });
    setNewCat({ name: '', color: PRESET_COLORS[0], icon: 'tag' });
    setIsAdding(false);
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditCat({ name: cat.name, color: cat.color, icon: cat.icon });
  };

  const handleSaveEdit = (id: string) => {
    if (!editCat.name.trim()) return;
    onUpdateCategory(id, { name: editCat.name.trim(), color: editCat.color, icon: editCat.icon });
    setEditingId(null);
  };

  const isDefault = (id: string) =>
    DEFAULT_INCOME_CATEGORIES.includes(id) || DEFAULT_EXPENSE_CATEGORIES.includes(id);

  return (
    <div className="space-y-5 animate-fade-in-up">
      {/* Header Banner */}
      <div className="glass p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-display font-bold" style={{ color: 'var(--text-primary)' }}>
              Categorias de Lançamentos
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Organização personalizada para receitas e despesas
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setIsAdding(!isAdding);
            setEditingId(null);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-500 hover:bg-purple-600 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-purple-500/20"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Nova Categoria
        </button>
      </div>

      {/* Type Selector Tabs */}
      <div className="glass p-1.5 rounded-2xl grid grid-cols-2 gap-2 border border-[var(--border-color)]">
        {(['expense', 'income'] as TransactionType[]).map((t) => (
          <button
            key={t}
            onClick={() => setActiveType(t)}
            className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              activeType === t
                ? t === 'expense'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'bg-emerald-500 text-white shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <span>{t === 'expense' ? 'Despesas' : 'Receitas'}</span>
            <span className="text-[11px] opacity-80 font-mono">
              ({categories.filter((c) => c.type === t).length})
            </span>
          </button>
        ))}
      </div>

      {/* Form */}
      {isAdding && (
        <form onSubmit={handleAdd} className="glass p-5 rounded-2xl space-y-4 animate-fade-in">
          <h3 className="text-sm font-display font-bold" style={{ color: 'var(--text-primary)' }}>
            Criar Categoria de {activeType === 'expense' ? 'Despesa' : 'Receita'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Nome da Categoria
              </label>
              <input
                type="text"
                value={newCat.name}
                onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
                placeholder="Ex: Pets, Assinaturas, Viagens..."
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-purple-500/50"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Cor Visual
              </label>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewCat({ ...newCat, color })}
                    className={`w-6 h-6 rounded-lg transition-all ${
                      newCat.color === color ? 'ring-2 ring-white scale-110' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
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
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-500 hover:bg-purple-600 shadow-md shadow-purple-500/20"
            >
              Salvar Categoria
            </button>
          </div>
        </form>
      )}

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {filtered.map((cat) => {
          const isEditing = editingId === cat.id;
          const isDef = isDefault(cat.id);

          return (
            <div
              key={cat.id}
              className="glass p-4 rounded-2xl border border-[var(--border-color)] group hover:border-[var(--text-muted)] transition-all flex items-center justify-between gap-3"
            >
              {isEditing ? (
                <div className="w-full space-y-2.5">
                  <input
                    type="text"
                    value={editCat.name}
                    onChange={(e) => setEditCat({ ...editCat, name: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none"
                    autoFocus
                  />
                  <div className="flex flex-wrap gap-1">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setEditCat({ ...editCat, color })}
                        className={`w-5 h-5 rounded-md ${editCat.color === color ? 'ring-2 ring-white scale-110' : ''}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-end gap-1.5 pt-1">
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-2.5 py-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => handleSaveEdit(cat.id)}
                      className="px-3 py-1 text-xs font-bold text-white bg-emerald-500 rounded-lg"
                    >
                      Salvar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${cat.color}25` }}
                    >
                      <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-display font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                        {cat.name}
                      </p>
                      {isDef && <span className="text-[10px] text-[var(--text-muted)] font-mono">Padrão</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => startEdit(cat)}
                      className="p-1.5 text-[var(--text-muted)] hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    {!isDef && (
                      <button
                        onClick={() => onDeleteCategory(cat.id)}
                        className="p-1.5 text-[var(--text-muted)] hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
