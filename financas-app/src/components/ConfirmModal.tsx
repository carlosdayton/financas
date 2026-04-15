import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'danger',
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const typeStyles = {
    danger: {
      icon: 'text-red-400',
      iconBg: 'bg-red-500/10',
      button: 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400',
    },
    warning: {
      icon: 'text-amber-400',
      iconBg: 'bg-amber-500/10',
      button: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400',
    },
    info: {
      icon: 'text-blue-400',
      iconBg: 'bg-blue-500/10',
      button: 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400',
    },
  };

  const style = typeStyles[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1 transition-colors"
          style={{ color: 'var(--text-muted)' }}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className={`w-14 h-14 mx-auto mb-4 ${style.iconBg} rounded-2xl flex items-center justify-center`}>
          <AlertTriangle className={`w-7 h-7 ${style.icon}`} />
        </div>

        {/* Content */}
        <h3 className="text-xl font-bold text-center mb-2" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h3>
        <p className="text-center mb-6" style={{ color: 'var(--text-secondary)' }}>
          {message}
        </p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 px-4 font-medium rounded-xl transition-all"
            style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 px-4 text-white font-bold rounded-xl transition-all transform hover:scale-[1.02] ${style.button}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
