import { useState } from 'react';
import { Plus, Trash2, Tag, Pencil, Check, X } from 'lucide-react';
import type { Category, TransactionType } from '../types/finance';

interface CategoriesProps {
  categories: Category[];
  onAddCategory: (category: Omit<Category, 'id'>) => void;
  onUpdateCategory: (id: string, updates: Partial<Category>) => void;
  onDeleteCategory: (id: string) => void;
}

const PRESET_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316',
  '#eab308', '#22c55e', '#10b981', '#06b6d4', '#3b82f6',
  '#14b8a6', '#a855f7', '#f43f5e', '#84cc16', '#64748b',
];

const DEFAULT_INCOME_CATEGORIES = ['1', '2', '3'];
const DEFAULT_EXPENSE_CATEGORIES = ['4', '5', '6', '7', '8', '9', '10'];

export function Categories({ categories, onAddCategory, onUpdateCategory, onDeleteCategory }: CategoriesProps) {
  const [activeType, setActiveType] = useState<TransactionType>('expense');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCat, setNewCat] = useState({ name: '', color: PRESET_COLORS[0], icon: 'tag' });
  const [editCat, setEditCat] = useState({ name: '', color: '', icon: '' });

  const filtered = categories.filter(c => c.type === activeType);

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
    <div className="relative mb-8">
      <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-2xl blur-xl" />

      <div className="relative rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
            <div className="p-2 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-2xl">
              <Tag className="w-5 h-5 text-violet-400" />
            </div>
            Categorias
          </h2>
          <button
            onClick={() => { setIsAdding(!isAdding); setEditingId(null); }}
            className="flex items-center gap-2 px-4 py-2 bg-violet-500 hover:bg-violet-400 text-white rounded-2xl transition-all text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Nova Categoria
          </button>
        </div>

        {/* Type Tabs */}
        <div className="flex gap-2 mb-6">
          {(['expense', 'income'] as TransactionType[]).map((t) => (
            <button
              key={t}
              onClick={() => setActiveType(t)}
              className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all ${
                activeType === t
                  ? t === 'expense'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : ''
              }`}
              style={activeType !== t ? { background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' } : undefined}
            >
              {t === 'expense' ? '💸 Despesas' : '💰 Receitas'}
              <span className="ml-2 text-xs opacity-70">
                ({categories.filter(c => c.type === t).length})
              </span>
            </button>
          ))}
        </div>

        {/* Add Form */}
        {isAdding && (
          <form onSubmit={handleAdd} className="mb-6 p-4 rounded-2xl space-y-4" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Nova categoria de {activeType === 'expense' ? 'despesa' : 'receita'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Nome</label>
                <input
                  type="text"
                  value={newCat.name}
                  onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
                  placeholder="Ex: Pets, Assinaturas, Viagem..."
                  className="w-full px-3 py-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm"
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Cor</label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewCat({ ...newCat, color })}
                      className={`w-6 h-6 rounded-2xl transition-all ${newCat.color === color ? 'ring-2 ring-white ring-offset-1 ring-offset-transparent scale-110' : 'hover:scale-105'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-2xl text-sm font-medium hover:from-violet-400 hover:to-purple-400 transition-all"
              >
                <Check className="w-4 h-4" /> Criar
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 rounded-2xl text-sm transition-colors"
                style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Category List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((cat) => {
            const isEditing = editingId === cat.id;
            const isDef = isDefault(cat.id);

            return (
              <div
                key={cat.id}
                className="group relative p-4 rounded-2xl transition-all"
                style={{ background: 'var(--bg-tertiary)', border: `1px solid ${cat.color}30` }}
              >
                {isEditing ? (
                  /* Edit mode */
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editCat.name}
                      onChange={(e) => setEditCat({ ...editCat, name: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                      style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                      autoFocus
                    />
                    <div className="flex flex-wrap gap-1.5">
                      {PRESET_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setEditCat({ ...editCat, color })}
                          className={`w-5 h-5 rounded-2xl transition-all ${editCat.color === color ? 'ring-2 ring-white scale-110' : 'hover:scale-105'}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveEdit(cat.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-2xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                      >
                        <Check className="w-3 h-3" /> Salvar
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-2xl transition-colors"
                        style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
                      >
                        <X className="w-3 h-3" /> Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  /* View mode */
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${cat.color}20` }}
                    >
                      <div className="w-4 h-4 rounded-2xl" style={{ backgroundColor: cat.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate text-sm" style={{ color: 'var(--text-primary)' }}>{cat.name}</p>
                      {isDef && (
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Padrão</p>
                      )}
                    </div>
                    {/* Actions */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEdit(cat)}
                        className="p-1.5 rounded-2xl hover:bg-indigo-500/10 hover:text-indigo-400 transition-colors"
                        style={{ color: 'var(--text-muted)' }}
                        title="Editar"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      {!isDef && (
                        <button
                          onClick={() => onDeleteCategory(cat.id)}
                          className="p-1.5 rounded-2xl hover:bg-red-500/10 hover:text-red-400 transition-colors"
                          style={{ color: 'var(--text-muted)' }}
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-8">
            <Tag className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
            <p style={{ color: 'var(--text-secondary)' }}>Nenhuma categoria de {activeType === 'expense' ? 'despesa' : 'receita'}.</p>
            <button
              onClick={() => setIsAdding(true)}
              className="mt-3 text-sm text-violet-400 hover:text-violet-300 transition-colors"
            >
              Criar primeira categoria
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
