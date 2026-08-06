// client/src/contexts/ToastContext.jsx
import { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const COLORS = {
  success: 'border-success-500/40 bg-success-500/10 text-success-400',
  error: 'border-danger-500/40 bg-danger-500/10 text-danger-400',
  warning: 'border-warning-500/40 bg-warning-500/10 text-warning-400',
  info: 'border-primary-500/40 bg-primary-500/10 text-primary-400',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);

  const dismiss = useCallback((id) => setToasts(prev => prev.filter(t => t.id !== id)), []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 w-80">
        {toasts.map(t => {
          const Icon = ICONS[t.type];
          return (
            <div key={t.id} className={`flex items-start gap-3 p-4 rounded-xl border backdrop-blur-sm shadow-card animate-slide-up ${COLORS[t.type]} bg-dark-900/90`}>
              <Icon className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="flex-1 text-sm text-dark-100">{t.message}</p>
              <button onClick={() => dismiss(t.id)} className="text-dark-500 hover:text-dark-300 ml-1">
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx.toast;
};
