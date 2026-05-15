import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, ArrowRight, X } from 'lucide-react';
import type { Transaction, Account, Goal } from '../types/finance';
import type { Tab } from './Sidebar';

interface Result {
  id: string;
  label: string;
  sublabel?: string;
  tab: Tab;
}

interface Props {
  isOpen: boolean;
  transactions: Transaction[];
  accounts: Account[];
  goals: Goal[];
  onNavigate: (tab: Tab) => void;
  onClose: () => void;
}

export function CommandPalette({ isOpen, transactions, accounts, goals, onNavigate, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const results = useMemo((): Result[] => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const out: Result[] = [];

    for (const t of transactions) {
      if (out.length >= 8) break;
      if (
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        String(t.amount).includes(q)
      ) {
        out.push({
          id: t.id,
          label: t.description,
          sublabel: `${t.type === 'income' ? '+' : '−'} R$ ${t.amount.toFixed(2)} · ${t.category} · ${t.date}`,
          tab: 'transactions',
        });
      }
    }

    for (const a of accounts) {
      if (a.name.toLowerCase().includes(q)) {
        out.push({ id: a.id, label: a.name, sublabel: 'Conta', tab: 'accounts' });
      }
    }

    for (const g of goals) {
      if (g.name.toLowerCase().includes(q)) {
        out.push({
          id: g.id,
          label: g.name,
          sublabel: `Meta · R$ ${g.currentAmount.toFixed(0)} / R$ ${g.targetAmount.toFixed(0)}`,
          tab: 'goals',
        });
      }
    }

    return out;
  }, [query, transactions, accounts, goals]);

  useEffect(() => { setSelected(0); }, [results]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, results.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
      if (e.key === 'Enter' && results[selected]) { onNavigate(results[selected].tab); onClose(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, results, selected, onNavigate, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg mx-4 rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
        onClick={e => e.stopPropagation()}
      >
        <div
          className="flex items-center gap-3 px-4 py-3"
          style={{ borderBottom: '1px solid var(--border-color)' }}
        >
          <Search size={18} style={{ color: 'var(--text-muted)' }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar transações, contas, metas..."
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: 'var(--text-primary)' }}
          />
          {query && (
            <button onClick={() => setQuery('')} className="flex-shrink-0">
              <X size={16} style={{ color: 'var(--text-muted)' }} />
            </button>
          )}
          <kbd
            className="px-1.5 py-0.5 rounded text-xs flex-shrink-0"
            style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}
          >
            ESC
          </kbd>
        </div>

        {results.length > 0 && (
          <ul className="py-2 max-h-80 overflow-auto">
            {results.map((r, i) => (
              <li
                key={r.id}
                className="flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors"
                style={{ background: i === selected ? 'var(--bg-tertiary)' : 'transparent' }}
                onMouseEnter={() => setSelected(i)}
                onClick={() => { onNavigate(r.tab); onClose(); }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{r.label}</p>
                  {r.sublabel && (
                    <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{r.sublabel}</p>
                  )}
                </div>
                <ArrowRight size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              </li>
            ))}
          </ul>
        )}

        {query && results.length === 0 && (
          <p className="px-4 py-6 text-sm text-center" style={{ color: 'var(--text-muted)' }}>
            Nenhum resultado para "{query}"
          </p>
        )}

        {!query && (
          <p className="px-4 py-4 text-xs" style={{ color: 'var(--text-muted)' }}>
            Busque transações por nome, categoria ou valor · contas · metas
          </p>
        )}
      </div>
    </div>
  );
}
