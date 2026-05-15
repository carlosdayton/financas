import { Eye, EyeOff } from 'lucide-react';
import { usePrivacy } from '../contexts/PrivacyContext';

export function PrivacyToggle() {
  const { isPrivate, togglePrivacy } = usePrivacy();

  return (
    <button
      onClick={togglePrivacy}
      title={isPrivate ? 'Revelar valores' : 'Ocultar valores'}
      className={`flex items-center gap-2 px-3 py-2 rounded-2xl transition-all duration-200 ${
        isPrivate
          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
          : ''
      }`}
      style={!isPrivate ? { background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' } : undefined}
    >
      {isPrivate ? (
        <EyeOff className="w-4 h-4" />
      ) : (
        <Eye className="w-4 h-4" />
      )}
      <span className="text-sm hidden sm:inline">
        {isPrivate ? 'Oculto' : 'Valores'}
      </span>
    </button>
  );
}
