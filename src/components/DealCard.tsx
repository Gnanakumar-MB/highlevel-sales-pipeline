import React from 'react';
import { 
  Users2, 
  Clock, 
  AlertTriangle, 
  RefreshCw, 
  RotateCcw, 
  Sparkles,
  Check
} from 'lucide-react';
import { Deal, StageId } from '../types/pipeline';
import { usePipelineStore } from '../store/usePipelineStore';
import { PIPELINE_STAGES, CURRENT_USER } from '../simulation/mockGenerator';
import { formatCurrencyINR } from '../utils/formatters';

interface DealCardProps {
  deal: Deal;
  isFocused: boolean;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
}

export const DealCard: React.FC<DealCardProps> = ({
  deal,
  isFocused,
  isSelected,
  onSelect,
}) => {
  const { moveDeal, retryMutation, rollbackMutation, setFocusedDealId } = usePipelineStore();

  const isPending = deal.syncStatus === 'pending';
  const isFailed = deal.syncStatus === 'failed';
  const isCurrentUser = deal.owner === CURRENT_USER;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', deal.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      id={`deal-card-${deal.id}`}
      draggable={!isPending}
      onDragStart={handleDragStart}
      onClick={() => setFocusedDealId(deal.id)}
      className={`relative group rounded-xl p-3.5 transition-all cursor-pointer border ${
        isSelected
          ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-500 shadow-md shadow-sky-500/10'
          : isFocused
          ? 'bg-slate-50 dark:bg-slate-900 border-sky-500 ring-2 ring-sky-500/40 shadow-sm'
          : isFailed
          ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-500/60 shadow-sm'
          : 'bg-white dark:bg-slate-900/90 hover:bg-slate-50 dark:hover:bg-slate-800/90 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
      }`}
    >
      {/* Top row: Checkbox, Company, Value */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(e);
            }}
            className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${
              isSelected
                ? 'bg-sky-600 border-sky-500 text-white'
                : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 hover:border-slate-400 dark:hover:border-slate-500'
            }`}
          >
            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
          </button>
          
          <div className="truncate">
            <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-sky-600 dark:group-hover:text-sky-300 transition-colors">
              {deal.company}
            </h4>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate block">
              {deal.title.split(' - ')[1] || deal.title}
            </span>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100 font-mono block">
            {formatCurrencyINR(deal.value)}
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-end gap-1">
            <Users2 className="w-3 h-3 text-slate-400 dark:text-slate-500" />
            {deal.licenses} lic.
          </span>
        </div>
      </div>

      {/* Tags & Owner Row */}
      <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/60 text-[11px]">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Owner pill */}
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-medium flex items-center gap-1 ${
              isCurrentUser
                ? 'bg-sky-500/10 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-500/30 font-semibold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            {isCurrentUser ? '★ You' : deal.owner.split(' ')[0]}
          </span>

          {/* Stale warning if >30d */}
          {deal.daysStale > 30 && (
            <span
              title={`Last contacted ${deal.daysStale} days ago`}
              className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-[10px] flex items-center gap-1 font-medium"
            >
              <Clock className="w-2.5 h-2.5" />
              {deal.daysStale}d
            </span>
          )}

          {/* High Value tag */}
          {deal.value >= 2000000 && (
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-[10px] flex items-center gap-0.5 font-medium">
              <Sparkles className="w-2.5 h-2.5" />
              High
            </span>
          )}
        </div>

        {/* Quick Stage Move Dropdown */}
        <div className="shrink-0">
          <select
            value={deal.stage}
            disabled={isPending}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              e.stopPropagation();
              moveDeal(deal.id, e.target.value as StageId);
            }}
            className="text-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded px-1.5 py-0.5 focus:outline-none focus:border-sky-500 cursor-pointer disabled:opacity-50"
          >
            {PIPELINE_STAGES.map((s) => (
              <option key={s.id} value={s.id}>
                → {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sync State Feedback Overlay */}
      {isPending && (
        <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-sky-600 dark:text-sky-400">
          <span className="flex items-center gap-1.5">
            <RefreshCw className="w-3 h-3 animate-spin text-sky-500" />
            Saving change...
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">optimistic</span>
        </div>
      )}

      {isFailed && (
        <div className="mt-2 pt-2 border-t border-rose-200 dark:border-rose-900/50 flex items-center justify-between gap-1 text-[11px] text-rose-800 dark:text-rose-300 bg-rose-100/60 dark:bg-rose-950/40 -mx-3.5 -mb-3.5 p-2 rounded-b-xl">
          <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 text-[10px] font-medium">
            <AlertTriangle className="w-3 h-3 text-rose-500 shrink-0" />
            Save Failed!
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                retryMutation(deal.id);
              }}
              className="px-2 py-0.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-[10px] font-semibold flex items-center gap-1 transition-colors shadow-sm"
            >
              <RefreshCw className="w-2.5 h-2.5" />
              Retry
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                rollbackMutation(deal.id);
              }}
              className="px-2 py-0.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-transparent rounded text-[10px] flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              Undo
            </button>
          </div>
        </div>
      )}

      {/* Teammate mutation banner */}
      {deal.lastModifiedBy && !isFailed && !isPending && (
        <div className="mt-1.5 text-[10px] text-indigo-600 dark:text-indigo-400 flex items-center gap-1 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
          Updated by {deal.lastModifiedBy}
        </div>
      )}
    </div>
  );
};
