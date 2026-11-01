import React, { useEffect } from 'react';
import { usePipelineStore } from '../store/usePipelineStore';
import { PIPELINE_STAGES } from '../simulation/mockGenerator';
import { StageId } from '../types/pipeline';
import { ArrowRight, X } from 'lucide-react';

export const QuickMoveModal: React.FC = () => {
  const {
    isQuickMoveOpen,
    setQuickMoveOpen,
    focusedDealId,
    selectedDealIds,
    deals,
    moveDeal,
    bulkMoveSelected,
  } = usePipelineStore();

  const activeDeal = focusedDealId ? deals[focusedDealId] : null;
  const isBulk = selectedDealIds.size > 0;

  useEffect(() => {
    if (!isQuickMoveOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const num = parseInt(e.key, 10);
      if (!isNaN(num) && num >= 1 && num <= PIPELINE_STAGES.length) {
        e.preventDefault();
        const targetStage = PIPELINE_STAGES[num - 1].id;
        executeMove(targetStage);
      } else if (e.key === 'Escape') {
        setQuickMoveOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isQuickMoveOpen, focusedDealId, selectedDealIds]);

  if (!isQuickMoveOpen) return null;

  const executeMove = (targetStage: StageId) => {
    if (isBulk) {
      bulkMoveSelected(targetStage);
    } else if (focusedDealId) {
      moveDeal(focusedDealId, targetStage);
    }
    setQuickMoveOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60">
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              {isBulk ? `Move ${selectedDealIds.size} Deals` : `Move Deal: ${activeDeal?.company || 'Selected Deal'}`}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Press number [1-7] or click a stage</p>
          </div>
          <button
            onClick={() => setQuickMoveOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-2 space-y-1">
          {PIPELINE_STAGES.map((stage, idx) => {
            const isCurrent = activeDeal?.stage === stage.id;
            return (
              <button
                key={stage.id}
                onClick={() => executeMove(stage.id)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition-colors ${
                  isCurrent
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: stage.color }}
                  />
                  <span className="font-medium">{stage.label}</span>
                  {isCurrent && <span className="text-[10px] text-slate-400 dark:text-slate-500">(current)</span>}
                </div>

                <div className="flex items-center gap-2">
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-mono text-[10px]">
                    {idx + 1}
                  </kbd>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
