import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
}

export function ThemeToggle({ isDark, onToggle }: ThemeToggleProps) {
  return (
    <button
      onClick={onToggle}
      className="relative p-2.5 rounded-2xl transition-all overflow-hidden group border hover:brightness-110 active:scale-95"
      style={{
        background: 'var(--bg-tertiary)',
        borderColor: 'var(--border-color)',
        color: 'var(--text-secondary)',
      }}
      title={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
    >
      <div className="relative w-5 h-5">
        <Sun
          className={`absolute inset-0 w-5 h-5 transition-all duration-300 ${
            isDark ? 'rotate-90 opacity-0 scale-0' : 'rotate-0 opacity-100 scale-100'
          }`}
        />
        <Moon
          className={`absolute inset-0 w-5 h-5 transition-all duration-300 ${
            isDark ? 'rotate-0 opacity-100 scale-100' : '-rotate-90 opacity-0 scale-0'
          }`}
        />
      </div>
    </button>
  );
}
