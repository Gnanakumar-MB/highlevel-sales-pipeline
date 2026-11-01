import React from 'react';
import { usePipelineStore } from '../store/usePipelineStore';
import { AlertCircle, CheckCircle, Info, X, RefreshCw } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = usePipelineStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full select-none pointer-events-none">
      {toasts.map((toast) => {
        const isError = toast.type === 'error';
        const isSuccess = toast.type === 'success';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-200 animate-in slide-in-from-bottom-2 ${
              isError
                ? 'bg-rose-950/95 border-rose-800 text-rose-100 shadow-rose-950/50'
                : isSuccess
                ? 'bg-emerald-950/95 border-emerald-800 text-emerald-100 shadow-emerald-950/50'
                : 'bg-slate-900/95 border-slate-700 text-slate-100 shadow-slate-950/50'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0">
                {isError && <AlertCircle className="w-4 h-4 text-rose-400" />}
                {isSuccess && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                {!isError && !isSuccess && <Info className="w-4 h-4 text-sky-400" />}
              </div>

              <div className="flex-1 min-w-0">
                <h5 className="text-xs font-semibold">{toast.title}</h5>
                <p className="text-[11px] opacity-90 mt-0.5 leading-snug">{toast.description}</p>

                {toast.action && (
                  <div className="mt-2.5 flex items-center gap-2">
                    <button
                      onClick={() => {
                        toast.action?.onClick();
                        removeToast(toast.id);
                      }}
                      className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1 shadow-sm transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>{toast.action.label}</span>
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-white p-1 -mr-1 -mt-1 rounded transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
