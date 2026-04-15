import { usePWA, useNetworkStatus } from '../hooks/usePWA';
import { Download, WifiOff, RefreshCw, CheckCircle2, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export function PWAInstallPrompt() {
  const { canInstall, install, isInstalled } = usePWA();
  const [dismissed, setDismissed] = useState(false);

  if (!canInstall || dismissed || isInstalled) return null;

  return (
    <div 
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 rounded-2xl p-4 shadow-2xl"
      style={{ 
        background: 'var(--bg-card)', 
        border: '1px solid var(--border-color)',
        animation: 'slideUp 0.3s ease-out'
      }}
    >
      <div className="flex items-start gap-3">
        <div 
          className="p-3 rounded-xl"
          style={{ background: 'var(--bg-tertiary)' }}
        >
          <Download className="w-6 h-6 text-indigo-400" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
            Instalar App
          </h3>
          <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
            Instale o Finanças Pessoais para acesso rápido e uso offline!
          </p>
          <div className="flex gap-2">
            <button
              onClick={install}
              className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium text-sm hover:opacity-90 transition-opacity"
            >
              Instalar
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="px-4 py-2 rounded-xl font-medium text-sm transition-colors"
              style={{ 
                background: 'var(--bg-tertiary)', 
                color: 'var(--text-secondary)' 
              }}
            >
              Depois
            </button>
          </div>
        </div>
        <button 
          onClick={() => setDismissed(true)}
          style={{ color: 'var(--text-muted)' }}
          className="hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export function OfflineIndicator() {
  const isOnline = useNetworkStatus();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShow(true);
    } else {
      // Hide after 3 seconds when back online
      const timer = setTimeout(() => setShow(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  if (!show) return null;

  return (
    <div 
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-full flex items-center gap-2 shadow-lg transition-all ${
        isOnline ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
      }`}
      style={{ 
        backdropFilter: 'blur(10px)',
        border: `1px solid ${isOnline ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
      }}
    >
      {isOnline ? (
        <>
          <CheckCircle2 className="w-4 h-4" />
          <span className="text-sm font-medium">Você está online</span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4" />
          <span className="text-sm font-medium">Modo offline - dados salvos localmente</span>
        </>
      )}
    </div>
  );
}

export function UpdatePrompt() {
  const { updateAvailable, updateApp } = usePWA();
  const [dismissed, setDismissed] = useState(false);

  if (!updateAvailable || dismissed) return null;

  return (
    <div 
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 rounded-2xl p-4 shadow-2xl"
      style={{ 
        background: 'var(--bg-card)', 
        border: '1px solid var(--border-color)'
      }}
    >
      <div className="flex items-start gap-3">
        <div 
          className="p-3 rounded-xl"
          style={{ background: 'var(--bg-tertiary)' }}
        >
          <RefreshCw className="w-6 h-6 text-indigo-400" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
            Nova Versão Disponível
          </h3>
          <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
            Uma atualização do app está disponível. Recarregue para obter as melhorias!
          </p>
          <div className="flex gap-2">
            <button
              onClick={updateApp}
              className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium text-sm hover:opacity-90 transition-opacity"
            >
              Atualizar Agora
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="px-4 py-2 rounded-xl font-medium text-sm transition-colors"
              style={{ 
                background: 'var(--bg-tertiary)', 
                color: 'var(--text-secondary)' 
              }}
            >
              Depois
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(style);
