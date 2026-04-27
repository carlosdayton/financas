import { useState, useEffect } from 'react';
import { Lock, Unlock, Shield, AlertCircle, X } from 'lucide-react';

interface PinLockProps {
  isLocked: boolean;
  hasPin: boolean;
  failedAttempts: number;
  onSetupPin: (pin: string) => Promise<boolean>;
  onVerifyPin: (pin: string) => Promise<boolean>;
  getLockoutRemaining: () => number;
}

export function PinLock({
  isLocked,
  hasPin,
  failedAttempts,
  onSetupPin,
  onVerifyPin,
  getLockoutRemaining,
}: PinLockProps) {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isLocked) {
      const interval = setInterval(() => {
        const remaining = getLockoutRemaining();
        setRemainingTime(remaining);

        if (remaining <= 0) {
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isLocked, getLockoutRemaining]);

  const formatTime = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSetup = async () => {
    setError('');

    if (pin.length < 4) {
      setError('O PIN deve ter pelo menos 4 digitos');
      return;
    }

    if (pin !== confirmPin) {
      setError('Os PINs nao coincidem');
      return;
    }

    setIsSubmitting(true);
    const success = await onSetupPin(pin);
    setIsSubmitting(false);

    if (success) {
      setPin('');
      setConfirmPin('');
      setIsSettingUp(false);
    }
  };

  const handleVerify = async () => {
    setError('');

    if (pin.length < 4) {
      setError('Digite seu PIN');
      return;
    }

    setIsSubmitting(true);
    const success = await onVerifyPin(pin);
    setIsSubmitting(false);

    if (!success) {
      const remaining = 5 - failedAttempts;
      if (remaining > 0) {
        setError(`PIN incorreto. ${remaining} tentativas restantes.`);
      } else {
        setError('Muitas tentativas. Tente novamente em 5 minutos.');
      }
      setPin('');
    }
  };

  const handleKeyPress = (key: string) => {
    if (pin.length < 6) {
      setPin((prev) => prev + key);
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  if (!hasPin) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'var(--bg-primary)' }}>
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              Proteja seus Dados
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Configure um PIN para proteger suas informacoes financeiras
            </p>
          </div>

          {!isSettingUp ? (
            <div className="space-y-4">
              <button
                onClick={() => setIsSettingUp(true)}
                className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
              >
                Configurar PIN
              </button>
              <button
                onClick={() => setIsSettingUp(false)}
                className="w-full py-3 rounded-xl font-medium transition-colors"
                style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
              >
                Pular por enquanto
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Crie um PIN (4-6 digitos)
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-3 text-center text-2xl tracking-widest rounded-xl border outline-none focus:ring-2 focus:ring-indigo-500/50"
                  style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  placeholder="••••"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Confirme o PIN
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-3 text-center text-2xl tracking-widest rounded-xl border outline-none focus:ring-2 focus:ring-indigo-500/50"
                  style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  placeholder="••••"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <button
                onClick={handleSetup}
                disabled={pin.length < 4 || confirmPin.length < 4 || isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isSubmitting ? 'Salvando...' : 'Confirmar'}
              </button>

              <button
                onClick={() => {
                  setIsSettingUp(false);
                  setPin('');
                  setConfirmPin('');
                  setError('');
                }}
                className="w-full py-3 rounded-xl font-medium transition-colors"
                style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
              >
                Voltar
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            App Bloqueado
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Digite seu PIN para desbloquear
          </p>
        </div>

        {isLocked ? (
          <div className="text-center p-6 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Muitas tentativas
            </h3>
            <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
              Tente novamente em:
            </p>
            <div className="text-3xl font-bold text-red-400">
              {formatTime(remainingTime)}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-center gap-3">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full transition-all ${
                    i < pin.length ? 'bg-indigo-500 scale-110' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>

            {error && (
              <div className="flex items-center justify-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onClick={() => handleKeyPress(num.toString())}
                  className="aspect-square rounded-xl text-2xl font-medium transition-all hover:scale-105 active:scale-95"
                  style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                >
                  {num}
                </button>
              ))}
              <button
                onClick={handleBackspace}
                className="aspect-square rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
              >
                <X className="w-6 h-6" />
              </button>
              <button
                onClick={() => handleKeyPress('0')}
                className="aspect-square rounded-xl text-2xl font-medium transition-all hover:scale-105 active:scale-95"
                style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
              >
                0
              </button>
              <button
                onClick={handleVerify}
                disabled={pin.length < 4 || isSubmitting}
                className="aspect-square rounded-xl flex items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-500 text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                <Unlock className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
