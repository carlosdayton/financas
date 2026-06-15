import { useState } from 'react';
import {
  LayoutDashboard,
  Wallet,
  Receipt,
  PiggyBank,
  MoreHorizontal,
  Target,
  BarChart3,
  Repeat,
  CreditCard,
  Tag,
  X,
  AlertTriangle,
} from 'lucide-react';
import type { Tab } from './Sidebar';

interface MobileNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  alerts?: {
    budgets?: number;
    creditcard?: number;
  };
}

const primaryTabs = [
  { id: 'dashboard' as Tab, label: 'Início', icon: LayoutDashboard },
  { id: 'transactions' as Tab, label: 'Transações', icon: Receipt },
  { id: 'accounts' as Tab, label: 'Contas', icon: Wallet },
  { id: 'budgets' as Tab, label: 'Orçamentos', icon: PiggyBank, alertKey: 'budgets' as const },
];

const secondaryTabs = [
  { id: 'creditcard' as Tab, label: 'Cartão de Crédito', icon: CreditCard, alertKey: 'creditcard' as const },
  { id: 'installments' as Tab, label: 'Parcelamentos', icon: CreditCard },
  { id: 'goals' as Tab, label: 'Metas', icon: Target },
  { id: 'recurring' as Tab, label: 'Recorrentes', icon: Repeat },
  { id: 'categories' as Tab, label: 'Categorias', icon: Tag },
  { id: 'analytics' as Tab, label: 'Análises', icon: BarChart3 },
];

export function MobileNav({ activeTab, onTabChange, alerts = {} }: MobileNavProps) {
  const [moreOpen, setMoreOpen] = useState(false);

  const isSecondaryActive = secondaryTabs.some((t) => t.id === activeTab);
  const totalSecondaryAlerts = secondaryTabs.reduce((sum, t) => {
    return sum + (t.alertKey ? (alerts[t.alertKey] ?? 0) : 0);
  }, 0);

  const handleTabChange = (tab: Tab) => {
    onTabChange(tab);
    setMoreOpen(false);
  };

  return (
    <>
      {/* More menu overlay */}
      {moreOpen && (
        <div className="mobile-nav-overlay" onClick={() => setMoreOpen(false)}>
          <div
            className="mobile-nav-sheet"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mobile-nav-sheet-header">
              <h3 className="text-lg font-display font-semibold" style={{ color: 'var(--text-primary)' }}>
                Mais opções
              </h3>
              <button
                onClick={() => setMoreOpen(false)}
                className="mobile-nav-sheet-close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mobile-nav-sheet-grid">
              {secondaryTabs.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                const alertCount = item.alertKey ? (alerts[item.alertKey] ?? 0) : 0;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className="mobile-nav-sheet-item"
                    style={{
                      background: isActive ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                      color: isActive ? '#000' : 'var(--text-secondary)',
                    }}
                  >
                    <div className="relative">
                      <Icon className="w-6 h-6" />
                      {alertCount > 0 && (
                        <span className="mobile-nav-alert-dot" />
                      )}
                    </div>
                    <span className="text-xs font-medium mt-1.5">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bottom navigation bar */}
      <nav className="mobile-nav">
        {primaryTabs.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const alertCount = item.alertKey ? (alerts[item.alertKey] ?? 0) : 0;

          return (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className="mobile-nav-item"
              style={{
                color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
              }}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {alertCount > 0 && (
                  <span className="mobile-nav-badge">
                    <AlertTriangle className="w-2 h-2" />
                  </span>
                )}
              </div>
              <span className="mobile-nav-label">{item.label}</span>
              {isActive && <span className="mobile-nav-indicator" />}
            </button>
          );
        })}

        {/* More button */}
        <button
          onClick={() => setMoreOpen(true)}
          className="mobile-nav-item"
          style={{
            color: isSecondaryActive ? 'var(--accent-primary)' : 'var(--text-muted)',
          }}
        >
          <div className="relative">
            <MoreHorizontal className="w-5 h-5" />
            {totalSecondaryAlerts > 0 && (
              <span className="mobile-nav-badge">
                <AlertTriangle className="w-2 h-2" />
              </span>
            )}
          </div>
          <span className="mobile-nav-label">Mais</span>
          {isSecondaryActive && <span className="mobile-nav-indicator" />}
        </button>
      </nav>
    </>
  );
}
