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

const menuItems = [
  { id: 'dashboard' as Tab, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'transactions' as Tab, label: 'Transações', icon: Receipt },
  { id: 'accounts' as Tab, label: 'Contas', icon: Wallet },
  { id: 'creditcard' as Tab, label: 'Cartão', icon: CreditCard, alertKey: 'creditcard' as const },
  { id: 'budgets' as Tab, label: 'Orçamentos', icon: PiggyBank, alertKey: 'budgets' as const },
  { id: 'installments' as Tab, label: 'Parcelamentos', icon: CreditCard },
  { id: 'goals' as Tab, label: 'Metas', icon: Target },
  { id: 'recurring' as Tab, label: 'Recorrentes', icon: Repeat },
  { id: 'categories' as Tab, label: 'Categorias', icon: Tag },
  { id: 'analytics' as Tab, label: 'Análises', icon: BarChart3 },
];

export function Sidebar({ activeTab, onTabChange, alerts = {} }: SidebarProps) {
  return (
    <aside className="w-64 min-h-screen hidden md:flex flex-col z-40" style={{ background: 'var(--bg-card)', borderRight: '1px solid var(--border-color)' }}>
      <div className="px-5 py-5" style={{ borderBottom: '1px solid var(--border-color)' }}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500 text-white rounded-2xl">
            <Wallet className="w-5 h-5 text-black" />
          </div>
          <div>
            <h1 className="text-xl font-display font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>FinanceApp</h1>
            <p className="text-xs font-mono uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Private</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const alertCount = item.alertKey ? (alerts[item.alertKey] ?? 0) : 0;

            return (
              <li key={item.id}>
                <button
                  onClick={() => onTabChange(item.id)}
                  className="group w-full flex items-center gap-3 px-3 py-2.5 transition-none relative border-l-2"
                  style={{
                    borderColor: isActive ? 'var(--accent-primary)' : 'transparent',
                    color: isActive ? '#000' : 'var(--text-secondary)',
                    backgroundColor: isActive ? 'var(--accent-primary)' : 'transparent',
                  }}
                >
                  <Icon className="w-4.5 h-4.5 flex-shrink-0 relative z-10" />
                  <span className="font-medium font-mono text-sm uppercase tracking-wider flex-1 text-left relative z-10">{item.label}</span>

                  {alertCount > 0 && !isActive && (
                    <span className="flex items-center gap-1 px-1.5 py-0.5 text-xs font-bold bg-red-500/10 text-red-400">
                      <AlertTriangle className="w-2.5 h-2.5" />
                      {alertCount}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4" style={{ borderTop: '1px solid var(--border-color)' }}>
        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
          <div className="w-2 h-2 rounded-2xl" style={{ background: 'var(--accent-success)' }} />
          <span>Dados locais</span>
        </div>
      </div>
    </aside>
  );
}
