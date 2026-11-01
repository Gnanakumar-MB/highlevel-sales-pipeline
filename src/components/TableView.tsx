import React, { useRef, useMemo, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { usePipelineStore } from '../store/usePipelineStore';
import { PIPELINE_STAGES, CURRENT_USER } from '../simulation/mockGenerator';
import { StageId } from '../types/pipeline';
import { formatCurrencyINR } from '../utils/formatters';
import { 
  Check, 
  Sparkles, 
  RefreshCw, 
  RotateCcw
} from 'lucide-react';

export const TableView: React.FC = () => {
  const {
    deals,
    stageDealIds,
    filters,
    focusedDealId,
    setFocusedDealId,
    selectedDealIds,
    toggleSelectDeal,
    selectRange,
    selectAllFiltered,
    clearSelection,
    moveDeal,
    retryMutation,
    rollbackMutation,
  } = usePipelineStore();

  const parentRef = useRef<HTMLDivElement>(null);
  const [lastClickedIndex, setLastClickedIndex] = useState<number | null>(null);

  const allFilteredDealIds = useMemo(() => {
    const query = filters.searchQuery.toLowerCase().trim();
    const ownerFilter = filters.ownerFilter;
    const quickFilter = filters.quickFilter;
    const stageFilter = filters.stageFilter;

    const stagesToIterate = stageFilter === 'all' 
      ? PIPELINE_STAGES.map((s) => s.id) 
      : [stageFilter];

    const result: string[] = [];

    for (const stage of stagesToIterate) {
      const ids = stageDealIds[stage] || [];
      for (let i = 0; i < ids.length; i++) {
        const id = ids[i];
        const deal = deals[id];
        if (!deal) continue;

        if (query) {
          const matchTitle = deal.title.toLowerCase().includes(query);
          const matchCompany = deal.company.toLowerCase().includes(query);
          const matchId = deal.id.toLowerCase().includes(query);
          const matchOwner = deal.owner.toLowerCase().includes(query);
          if (!matchTitle && !matchCompany && !matchId && !matchOwner) {
            continue;
          }
        }

        if (ownerFilter !== 'all' && deal.owner !== ownerFilter) {
          continue;
        }

        if (quickFilter === 'my_deals' && deal.owner !== CURRENT_USER) {
          continue;
        }
        if (quickFilter === 'stale' && deal.daysStale <= 30) {
          continue;
        }
        if (quickFilter === 'high_value' && deal.value < 2000000) {
          continue;
        }

        result.push(id);
      }
    }

    return result;
  }, [deals, stageDealIds, filters]);

  const rowVirtualizer = useVirtualizer({
    count: allFilteredDealIds.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
    overscan: 15,
  });

  const isAllSelected = allFilteredDealIds.length > 0 && allFilteredDealIds.every((id) => selectedDealIds.has(id));
  const isSomeSelected = allFilteredDealIds.some((id) => selectedDealIds.has(id));

  const handleRowClick = (dealId: string, index: number, event: React.MouseEvent) => {
    setFocusedDealId(dealId);

    if (event.shiftKey && lastClickedIndex !== null) {
      const start = Math.min(lastClickedIndex, index);
      const end = Math.max(lastClickedIndex, index);
      const rangeIds = allFilteredDealIds.slice(start, end + 1);
      selectRange(rangeIds);
    } else if (event.ctrlKey || event.metaKey) {
      toggleSelectDeal(dealId);
      setLastClickedIndex(index);
    } else {
      setLastClickedIndex(index);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 m-4 rounded-xl overflow-hidden shadow-sm dark:shadow-2xl transition-colors">
      {/* Table Toolbar */}
      <div className="p-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs select-none">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {allFilteredDealIds.length.toLocaleString()} Deals
          </span>
          {filters.quickFilter !== 'all' && (
            <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/20 font-medium">
              Filter: {filters.quickFilter.replace('_', ' ')}
            </span>
          )}
          {filters.stageFilter !== 'all' && (
            <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20 font-medium">
              Stage: {filters.stageFilter.replace('_', ' ')}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (isAllSelected) {
                clearSelection();
              } else {
                selectAllFiltered(allFilteredDealIds);
              }
            }}
            className="text-xs px-2.5 py-1 rounded bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 flex items-center gap-1.5 transition-colors shadow-sm"
          >
            {isAllSelected ? 'Deselect All' : `Select All (${allFilteredDealIds.length.toLocaleString()})`}
          </button>
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-400 select-none">
        <div className="col-span-1 flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (isAllSelected) clearSelection();
              else selectAllFiltered(allFilteredDealIds);
            }}
            className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
              isAllSelected
                ? 'bg-sky-600 border-sky-500 text-white'
                : isSomeSelected
                ? 'border-sky-500 bg-sky-500/20 text-sky-600'
                : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900'
            }`}
          >
            {isAllSelected ? <Check className="w-3 h-3 stroke-[3]" /> : isSomeSelected ? '-' : null}
          </button>
          <span>ID</span>
        </div>
        <div className="col-span-3">Company &amp; Deal</div>
        <div className="col-span-2">Stage</div>
        <div className="col-span-2 text-right">Value (₹)</div>
        <div className="col-span-2">Owner</div>
        <div className="col-span-1 text-center">Stale</div>
        <div className="col-span-1 text-right">Status</div>
      </div>

      {/* Virtualized Rows Container */}
      <div
        ref={parentRef}
        className="flex-1 overflow-y-auto select-none"
        style={{ contain: 'strict' }}
      >
        {allFilteredDealIds.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-xs text-center">
            <span>No deals match your search and filter criteria</span>
          </div>
        ) : (
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const dealId = allFilteredDealIds[virtualRow.index];
              const deal = deals[dealId];
              if (!deal) return null;

              const isFocused = focusedDealId === deal.id;
              const isSelected = selectedDealIds.has(deal.id);
              const isPending = deal.syncStatus === 'pending';
              const isFailed = deal.syncStatus === 'failed';
              const isCurrentUser = deal.owner === CURRENT_USER;

              const currentStageObj = PIPELINE_STAGES.find((s) => s.id === deal.stage);

              return (
                <div
                  key={deal.id}
                  onClick={(e) => handleRowClick(deal.id, virtualRow.index, e)}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  className={`grid grid-cols-12 gap-2 px-4 items-center border-b text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800/40'
                      : isFocused
                      ? 'bg-slate-100 dark:bg-slate-800/80 border-sky-500'
                      : isFailed
                      ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/40'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 border-slate-100 dark:border-slate-800/60'
                  }`}
                >
                  {/* Select + ID */}
                  <div className="col-span-1 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelectDeal(deal.id);
                      }}
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-sky-600 border-sky-500 text-white'
                          : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </button>
                    <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {deal.id.replace('DEAL-', '')}
                    </span>
                  </div>

                  {/* Company & Deal Title */}
                  <div className="col-span-3 truncate flex flex-col justify-center">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="font-medium text-slate-900 dark:text-slate-100 truncate">{deal.company}</span>
                      {deal.value >= 2000000 && (
                        <Sparkles className="w-3 h-3 text-emerald-500 shrink-0" />
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {deal.title.split(' - ')[1] || deal.title}
                    </span>
                  </div>

                  {/* Stage Dropdown */}
                  <div className="col-span-2 flex items-center">
                    <select
                      value={deal.stage}
                      disabled={isPending}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        e.stopPropagation();
                        moveDeal(deal.id, e.target.value as StageId);
                      }}
                      className="bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded px-2 py-1 focus:outline-none focus:border-sky-500 cursor-pointer disabled:opacity-50"
                      style={{ borderLeftColor: currentStageObj?.color, borderLeftWidth: '3px' }}
                    >
                      {PIPELINE_STAGES.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Value & Licenses */}
                  <div className="col-span-2 text-right">
                    <span className="font-mono font-semibold text-slate-900 dark:text-slate-200 block">
                      {formatCurrencyINR(deal.value)}
                    </span>
                    <span className="text-[10px] text-slate-500">{deal.licenses} licenses</span>
                  </div>

                  {/* Owner */}
                  <div className="col-span-2 truncate">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[11px] ${
                        isCurrentUser
                          ? 'bg-sky-500/10 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 font-semibold'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {isCurrentUser ? '★ You' : deal.owner}
                    </span>
                  </div>

                  {/* Stale Days */}
                  <div className="col-span-1 text-center">
                    <span
                      className={`text-[11px] font-mono px-1.5 py-0.5 rounded ${
                        deal.daysStale > 30
                          ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 font-semibold'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {deal.daysStale}d
                    </span>
                  </div>

                  {/* Status / Actions */}
                  <div className="col-span-1 flex items-center justify-end gap-1">
                    {isPending && (
                      <span title="Saving change...">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-500" />
                      </span>
                    )}
                    {isFailed && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            retryMutation(deal.id);
                          }}
                          title="Retry save"
                          className="p-1 bg-rose-600 hover:bg-rose-500 text-white rounded"
                        >
                          <RefreshCw className="w-2.5 h-2.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            rollbackMutation(deal.id);
                          }}
                          title="Undo save"
                          className="p-1 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded"
                        >
                          <RotateCcw className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    )}
                    {!isPending && !isFailed && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500" title="Synced" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
