import React, { useState } from 'react';
import { usePipelineStore } from '../store/usePipelineStore';
import { PIPELINE_STAGES } from '../simulation/mockGenerator';
import { StageId } from '../types/pipeline';
import { X, ArrowRight, Trash2, Trophy } from 'lucide-react';

export const BulkActionBar: React.FC = () => {
  const { selectedDealIds, clearSelection, bulkMoveSelected } = usePipelineStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const count = selectedDealIds.size;
  if (count === 0) return null;

  const handleBulkMove = async (targetStage: StageId) => {
    setIsProcessing(true);
    setIsDropdownOpen(false);
    try {
      await bulkMoveSelected(targetStage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 select-none animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="bg-white/95 dark:bg-slate-900/95 border border-slate-300 dark:border-slate-700/80 shadow-2xl rounded-2xl px-5 py-3 flex items-center gap-4 text-xs backdrop-blur-md">
        {/* Selection count badge */}
        <div className="flex items-center gap-2 pr-3 border-r border-slate-200 dark:border-slate-700">
          <div className="w-5 h-5 rounded-full bg-sky-600 text-white font-bold flex items-center justify-center text-[10px]">
            {count > 999 ? '999+' : count}
          </div>
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            {count.toLocaleString()} {count === 1 ? 'deal' : 'deals'} selected
          </span>
        </div>

        {/* Dedicated "Move to Lost" button */}
        <button
          disabled={isProcessing}
          onClick={() => handleBulkMove('lost')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow-md shadow-rose-600/20 transition-all disabled:opacity-50"
          title="Move selected deals to Lost (Quarter-end batch clean-up)"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Move to Lost</span>
        </button>

        {/* Quick "Move to Won" button */}
        <button
          disabled={isProcessing}
          onClick={() => handleBulkMove('won')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>Move to Won</span>
        </button>

        {/* Move to Any Stage Dropdown */}
        <div className="relative">
          <button
            disabled={isProcessing}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600 font-medium transition-colors disabled:opacity-50"
          >
            <span>Move to Stage...</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {isDropdownOpen && (
            <div className="absolute bottom-full mb-2 left-0 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden py-1 z-50">
              {PIPELINE_STAGES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleBulkMove(s.id)}
                  className="w-full text-left px-3 py-2 text-xs text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                  <span>{s.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Clear selection button */}
        <button
          onClick={clearSelection}
          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors ml-1"
          title="Clear selection (Esc)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
