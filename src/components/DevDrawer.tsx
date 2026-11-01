import React, { useState } from 'react';
import { usePipelineStore } from '../store/usePipelineStore';
import { mockBackendApi } from '../simulation/mockApi';
import { 
  X, 
  Wifi, 
  WifiOff, 
  Zap, 
  Clock, 
  AlertTriangle, 
  Users2, 
  Play, 
  RotateCcw
} from 'lucide-react';

export const DevDrawer: React.FC = () => {
  const { isDevDrawerOpen, toggleDevDrawer, focusedDealId, deals, addToast } = usePipelineStore();
  
  const [config, setConfig] = useState(mockBackendApi.getConfig());

  if (!isDevDrawerOpen) return null;

  const handleLatencyMinChange = (val: number) => {
    const updated = { ...config, latencyMinMs: val };
    setConfig(updated);
    mockBackendApi.updateConfig({ latencyMinMs: val });
  };

  const handleLatencyMaxChange = (val: number) => {
    const updated = { ...config, latencyMaxMs: val };
    setConfig(updated);
    mockBackendApi.updateConfig({ latencyMaxMs: val });
  };

  const handleFailureRateChange = (val: number) => {
    const updated = { ...config, failureRate: val };
    setConfig(updated);
    mockBackendApi.updateConfig({ failureRate: val });
  };

  const handleTeammateToggle = (active: boolean) => {
    const updated = { ...config, isTeammateActive: active };
    setConfig(updated);
    mockBackendApi.updateConfig({ isTeammateActive: active });
  };

  const handleTeammateInterval = (sec: number) => {
    const updated = { ...config, teammateIntervalSec: sec };
    setConfig(updated);
    mockBackendApi.updateConfig({ teammateIntervalSec: sec });
  };

  const handleOfflineToggle = (offline: boolean) => {
    const updated = { ...config, isOffline: offline };
    setConfig(updated);
    mockBackendApi.updateConfig({ isOffline: offline });
    addToast({
      type: offline ? 'error' : 'success',
      title: offline ? 'Simulation: Network Offline' : 'Simulation: Network Online',
      description: offline 
        ? 'All subsequent saves will fail until re-enabled.'
        : 'Network connection restored.',
      duration: 3500,
    });
  };

  const handleTriggerTeammateEdit = () => {
    const event = mockBackendApi.generateRandomTeammateMutation(focusedDealId || undefined);
    if (event) {
      addToast({
        type: 'info',
        title: 'Teammate Mutation Injected',
        description: `${event.teammateName} modified ${event.dealSnapshot.company}.`,
        duration: 3500,
      });
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-80 sm:w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700/80 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-250 select-none transition-colors">
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Simulation &amp; Chaos Panel
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Reviewer Test Engine</p>
          </div>
        </div>

        <button
          onClick={toggleDevDrawer}
          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Drawer Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 text-xs text-slate-700 dark:text-slate-300">
        {/* Offline Mode Switch */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {config.isOffline ? (
              <WifiOff className="w-4 h-4 text-rose-500" />
            ) : (
              <Wifi className="w-4 h-4 text-emerald-500" />
            )}
            <div>
              <span className="font-semibold text-slate-900 dark:text-slate-200 block">Offline Mode</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Simulate zero network connection</span>
            </div>
          </div>
          <button
            onClick={() => handleOfflineToggle(!config.isOffline)}
            className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
              config.isOffline
                ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/30'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {config.isOffline ? 'OFFLINE' : 'ONLINE'}
          </button>
        </div>

        {/* Failure Rate Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="font-semibold text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              <span>Network Failure Rate</span>
            </label>
            <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-xs">
              {Math.round(config.failureRate * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={config.failureRate}
            onChange={(e) => handleFailureRateChange(parseFloat(e.target.value))}
            className="w-full accent-rose-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 font-mono">
            <span>0% (Always succeed)</span>
            <span className="text-rose-500 font-bold">10% (Default)</span>
            <span>100% (Fail all)</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Per PDF spec: saves take 0.3–1.5s, ~1 in 10 fail. Set to 100% to test retry &amp; undo rollback flows.
          </p>
        </div>

        {/* Network Latency Range Sliders */}
        <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
          <label className="font-semibold text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-sky-500" />
            <span>Simulated Network Latency</span>
          </label>

          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-500 dark:text-slate-400">Min Latency:</span>
              <span className="font-mono text-sky-600 dark:text-sky-400">{config.latencyMinMs} ms</span>
            </div>
            <input
              type="range"
              min="0"
              max="2000"
              step="50"
              value={config.latencyMinMs}
              onChange={(e) => handleLatencyMinChange(parseInt(e.target.value))}
              className="w-full accent-sky-500 cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-500 dark:text-slate-400">Max Latency:</span>
              <span className="font-mono text-sky-600 dark:text-sky-400">{config.latencyMaxMs} ms</span>
            </div>
            <input
              type="range"
              min="300"
              max="4000"
              step="100"
              value={config.latencyMaxMs}
              onChange={(e) => handleLatencyMaxChange(parseInt(e.target.value))}
              className="w-full accent-sky-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Teammates Simulation */}
        <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <label className="font-semibold text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
              <Users2 className="w-3.5 h-3.5 text-indigo-500" />
              <span>Teammates Concurrency</span>
            </label>
            <button
              onClick={() => handleTeammateToggle(!config.isTeammateActive)}
              className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                config.isTeammateActive
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {config.isTeammateActive ? 'RUNNING' : 'PAUSED'}
            </button>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-500 dark:text-slate-400">Interval:</span>
              <span className="font-mono text-indigo-600 dark:text-indigo-400">Every {config.teammateIntervalSec}s</span>
            </div>
            <input
              type="range"
              min="2"
              max="20"
              step="1"
              value={config.teammateIntervalSec}
              onChange={(e) => handleTeammateInterval(parseInt(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>

          {/* Trigger Single Teammate Mutation */}
          <button
            onClick={handleTriggerTeammateEdit}
            className="w-full mt-2 py-2 px-3 bg-indigo-50 dark:bg-indigo-600/20 hover:bg-indigo-100 dark:hover:bg-indigo-600/30 border border-indigo-200 dark:border-indigo-500/40 rounded-xl text-indigo-700 dark:text-indigo-200 font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <Play className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Trigger Teammate Edit Now</span>
          </button>
          {focusedDealId && (
            <p className="text-[10px] text-indigo-600 dark:text-indigo-400/80 text-center">
              Targeting focused deal: {focusedDealId} ({deals[focusedDealId]?.company})
            </p>
          )}
        </div>
      </div>

      {/* Drawer Footer */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 text-[11px] text-slate-500 flex items-center justify-between">
        <span>50,000 In-Memory Deals</span>
        <button
          onClick={() => window.location.reload()}
          className="text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset App</span>
        </button>
      </div>
    </div>
  );
};
