import React, { useMemo } from 'react';
import { usePipelineStore } from '../store/usePipelineStore';
import { PIPELINE_STAGES } from '../simulation/mockGenerator';
import { formatCompactINR } from '../utils/formatters';
import { StageId } from '../types/pipeline';

export const StageMetricsBar: React.FC = () => {
  const { deals, stageDealIds, filters, setStageFilter, focusedStage, setFocusedStage } = usePipelineStore();

  const stageStats = useMemo(() => {
    const stats: Record<StageId, { count: number; totalValue: number }> = {
      new_lead: { count: 0, totalValue: 0 },
      contacted: { count: 0, totalValue: 0 },
      demo_done: { count: 0, totalValue: 0 },
      proposal_sent: { count: 0, totalValue: 0 },
      negotiation: { count: 0, totalValue: 0 },
      won: { count: 0, totalValue: 0 },
      lost: { count: 0, totalValue: 0 },
    };

    PIPELINE_STAGES.forEach((stage) => {
      const ids = stageDealIds[stage.id] || [];
      stats[stage.id].count = ids.length;

      let sum = 0;
      for (const id of ids) {
        if (deals[id]) {
          sum += deals[id].value;
        }
      }
      stats[stage.id].totalValue = sum;
    });

    return stats;
  }, [deals, stageDealIds]);

  return (
    <div className="bg-slate-100/70 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800/80 px-4 py-2 overflow-x-auto select-none transition-colors">
      <div className="flex items-center gap-2.5 min-w-max">
        {PIPELINE_STAGES.map((stage) => {
          const stats = stageStats[stage.id] || { count: 0, totalValue: 0 };
          const isSelectedFilter = filters.stageFilter === stage.id;
          const isFocused = focusedStage === stage.id;

          return (
            <button
              key={stage.id}
              onClick={() => {
                if (isSelectedFilter) {
                  setStageFilter('all');
                } else {
                  setStageFilter(stage.id);
                  setFocusedStage(stage.id);
                }
              }}
              className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg border text-left transition-all ${
                isSelectedFilter
                  ? 'bg-sky-50 dark:bg-slate-800 border-sky-500 shadow-sm ring-1 ring-sky-500/30'
                  : isFocused
                  ? 'bg-white dark:bg-slate-900 border-slate-400 dark:border-slate-600 shadow-sm'
                  : 'bg-white/80 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800/80 hover:bg-white dark:hover:bg-slate-900 shadow-sm'
              }`}
            >
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                style={{ backgroundColor: stage.color }}
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{stage.label}</span>
                  <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {stats.count.toLocaleString()}
                  </span>
                </div>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  {formatCompactINR(stats.totalValue)}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
