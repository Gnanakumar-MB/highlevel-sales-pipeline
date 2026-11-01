import React from 'react';
import { usePipelineStore } from '../store/usePipelineStore';
import { Check, X, Bell } from 'lucide-react';

export const TeammateNotificationPill: React.FC = () => {
  const { bufferedEvents, applyBufferedEvents, dismissBufferedEvents } = usePipelineStore();

  if (bufferedEvents.length === 0) return null;

  const count = bufferedEvents.length;
  const latestEvent = bufferedEvents[bufferedEvents.length - 1];

  return (
    <div className="fixed top-16 right-6 z-40 select-none animate-in fade-in slide-in-from-top-3 duration-200">
      <div className="bg-slate-900/95 border border-indigo-500/40 shadow-xl shadow-indigo-950/40 rounded-xl p-3 flex items-center gap-3 backdrop-blur-md max-w-sm">
        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
          <Bell className="w-4 h-4 animate-bounce" />
        </div>

        <div className="flex-1 min-w-0">
          <h5 className="text-xs font-semibold text-slate-100 flex items-center gap-1.5">
            <span>Teammate Activity</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
              +{count}
            </span>
          </h5>
          <p className="text-[11px] text-slate-400 truncate">
            {latestEvent.teammateName} moved {latestEvent.dealSnapshot.company}
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={applyBufferedEvents}
            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg shadow transition-colors flex items-center gap-1"
            title="Reconcile changes safely without layout shifts"
          >
            <Check className="w-3 h-3" />
            <span>Apply</span>
          </button>
          <button
            onClick={dismissBufferedEvents}
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
