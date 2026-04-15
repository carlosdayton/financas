import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import type { Toast as ToastType } from '../hooks/useToast';

interface ToastProps {
  toast: ToastType;
  onRemove: (id: string) => void;
}

export function Toast({ toast, onRemove }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const styles = {
    success: {
      icon: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      progress: 'bg-emerald-500',
    },
    error: {
      icon: 'text-red-400',
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      progress: 'bg-red-500',
    },
    warning: {
      icon: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      progress: 'bg-amber-500',
    },
    info: {
      icon: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      progress: 'bg-blue-500',
    },
  };

  const Icon = icons[toast.type];
  const style = styles[toast.type];

  return (
    <div
      className={`relative flex items-center gap-3 px-4 py-3 rounded-xl border ${style.bg} ${style.border} shadow-lg animate-in slide-in-from-right-full duration-300`}
    >
      <Icon className={`w-5 h-5 ${style.icon} flex-shrink-0`} />
      <p className="text-sm font-medium pr-4" style={{ color: 'var(--text-primary)' }}>{toast.message}</p>
      
      <button
        onClick={() => onRemove(toast.id)}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 transition-colors"
        style={{ color: 'var(--text-muted)' }}
      >
        <X className="w-4 h-4" />
      </button>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-xl overflow-hidden" style={{ background: 'var(--border-color)' }}>
        <div
          className={`h-full ${style.progress} animate-[shrink_3s_linear_forwards]`}
          style={{
            animation: 'shrink 3s linear forwards',
          }}
        />
      </div>
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastType[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}
