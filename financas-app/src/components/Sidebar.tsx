import {
  LayoutDashboard,
  Wallet,
  Receipt,
  Target,
  BarChart3,
  Repeat,
  CreditCard,
  PiggyBank,
  Tag,
  AlertTriangle,
} from 'lucide-react';

export type Tab = 'dashboard' | 'transactions' | 'accounts' | 'goals' | 'analytics' | 'recurring' | 'installments' | 'budgets' | 'categories' | 'creditcard';

interface SidebarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  alerts?: {
    budgets?: number;
    creditcard?: number;
  };
}

const mainNavItems = [
  { id: 'dashboard' as Tab, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'transactions' as Tab, label: 'Transações', icon: Receipt },
  { id: 'accounts' as Tab, label: 'Contas', icon: Wallet },
  { id: 'creditcard' as Tab, label: 'Cartões', icon: CreditCard, alertKey: 'creditcard' as const },
];

const managementNavItems = [
  { id: 'budgets' as Tab, label: 'Orçamentos', icon: PiggyBank, alertKey: 'budgets' as const },
  { id: 'goals' as Tab, label: 'Metas', icon: Target },
  { id: 'installments' as Tab, label: 'Parcelamentos', icon: CreditCard },
  { id: 'recurring' as Tab, label: 'Recorrentes', icon: Repeat },
  { id: 'categories' as Tab, label: 'Categorias', icon: Tag },
  { id: 'analytics' as Tab, label: 'Análises', icon: BarChart3 },
];

export function Sidebar({ activeTab, onTabChange, alerts = {} }: SidebarProps) {
  return (
    <aside
      className="w-60 min-h-screen hidden md:flex flex-col z-40 flex-shrink-0 transition-all duration-300"
      style={{
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-color)',
      }}
    >
      {/* Brand Header */}
      <div className="px-5 py-5 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-zinc-950 shadow-sm">
            <Wallet className="w-4 h-4 font-bold stroke-[2.5]" />
          </div>
          <span className="text-base font-display font-bold text-[var(--text-primary)]">
            Finanças
          </span>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-6">
        {/* Main Section */}
        <div>
          <p className="px-3 text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
            Principal
          </p>
          <ul className="space-y-0.5">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const alertCount = item.alertKey ? (alerts[item.alertKey] ?? 0) : 0;

              return (
                <li key={item.id}>
                  <button
                    onClick={() => onTabChange(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition-colors duration-150 ${
                      isActive
                        ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-semibold'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]/50'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-emerald-500' : 'text-[var(--text-muted)]'
                      }`}
                    />
                    <span className="flex-1 text-left">{item.label}</span>

                    {alertCount > 0 && (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 text-xs font-semibold rounded bg-rose-500/10 text-rose-400">
                        <AlertTriangle className="w-3 h-3" />
                        {alertCount}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Gestão Section */}
        <div>
          <p className="px-3 text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
            Planejamento
          </p>
          <ul className="space-y-0.5">
            {managementNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const alertCount = item.alertKey ? (alerts[item.alertKey] ?? 0) : 0;

              return (
                <li key={item.id}>
                  <button
                    onClick={() => onTabChange(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition-colors duration-150 ${
                      isActive
                        ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-semibold'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]/50'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-emerald-500' : 'text-[var(--text-muted)]'
                      }`}
                    />
                    <span className="flex-1 text-left">{item.label}</span>

                    {alertCount > 0 && (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 text-xs font-semibold rounded bg-rose-500/10 text-rose-400">
                        <AlertTriangle className="w-3 h-3" />
                        {alertCount}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </aside>
  );
}
