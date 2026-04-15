import { 
  LayoutDashboard, 
  Wallet, 
  Receipt, 
  Target, 
  BarChart3, 
  Repeat
} from 'lucide-react';

export type Tab = 'dashboard' | 'transactions' | 'accounts' | 'goals' | 'analytics' | 'recurring';

interface SidebarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const menuItems = [
  { id: 'dashboard' as Tab, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'transactions' as Tab, label: 'Transações', icon: Receipt },
  { id: 'accounts' as Tab, label: 'Contas', icon: Wallet },
  { id: 'goals' as Tab, label: 'Metas', icon: Target },
  { id: 'recurring' as Tab, label: 'Recorrentes', icon: Repeat },
  { id: 'analytics' as Tab, label: 'Análises', icon: BarChart3 },
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <aside className="w-64 min-h-screen flex flex-col" style={{ background: 'var(--bg-card)', borderRight: '1px solid var(--border-color)' }}>
      {/* Logo */}
      <div className="p-6" style={{ borderBottom: '1px solid var(--border-color)' }}>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg blur opacity-50" />
            <div className="relative p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
              <Wallet className="w-5 h-5 text-white" />
            </div>
          </div>
          <div>
            <h1 className="font-bold text-white">Finanças</h1>
            <p className="text-xs text-[#6b6b8a]">v3.0</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25'
                      : 'hover:text-white'
                  }`}
                  style={!isActive ? { color: 'var(--text-secondary)' } : undefined}
                  onMouseEnter={(e) => !isActive && (e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)')}
                  onMouseLeave={(e) => !isActive && (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : ''}`} />
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4" style={{ borderTop: '1px solid var(--border-color)' }}>
        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span>Sistema online</span>
        </div>
      </div>
    </aside>
  );
}
