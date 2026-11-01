import React, { useRef, useMemo, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { usePipelineStore } from '../store/usePipelineStore';
import { PIPELINE_STAGES, CURRENT_USER } from '../simulation/mockGenerator';
import { DealCard } from './DealCard';
import { Stage, StageId } from '../types/pipeline';
import { CheckSquare, Square, Layers } from 'lucide-react';
import { formatCompactINR } from '../utils/formatters';

interface ColumnProps {
  stage: Stage;
  dealIds: string[];
}

const KanbanColumn: React.FC<ColumnProps> = ({ stage, dealIds }) => {
  const {
    deals,
    focusedDealId,
    selectedDealIds,
    toggleSelectDeal,
    moveDeal,
    selectAllInStage,
    clearSelection,
  } = usePipelineStore();

  const [isDragOver, setIsDragOver] = useState(false);
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: dealIds.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 110,
    gap: 10,
    overscan: 6,
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const dealId = e.dataTransfer.getData('text/plain');
    if (dealId) {
      moveDeal(dealId, stage.id);
    }
  };

  const allInStageSelected = dealIds.length > 0 && dealIds.every((id) => selectedDealIds.has(id));
  const someInStageSelected = dealIds.some((id) => selectedDealIds.has(id));

  const stageTotalValue = useMemo(() => {
    let sum = 0;
    for (const id of dealIds) {
      if (deals[id]) sum += deals[id].value;
    }
    return sum;
  }, [dealIds, deals]);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col w-80 shrink-0 h-full rounded-2xl bg-slate-200/50 dark:bg-slate-900/40 border transition-all duration-150 ${
        isDragOver
          ? 'border-sky-500 bg-sky-500/10 ring-2 ring-sky-500/20'
          : 'border-slate-300/80 dark:border-slate-800/80'
      }`}
    >
      {/* Column Header */}
      <div className="p-3.5 border-b border-slate-300/70 dark:border-slate-800/80 flex items-center justify-between select-none">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
            style={{ backgroundColor: stage.color }}
          />
          <h3 className="font-semibold text-xs text-slate-800 dark:text-slate-100 truncate">{stage.label}</h3>
          <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400 font-medium">
            {dealIds.length.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 font-mono">
            {formatCompactINR(stageTotalValue)}
          </span>

          <button
            onClick={() => {
              if (allInStageSelected) {
                clearSelection();
              } else {
                selectAllInStage(stage.id);
              }
            }}
            title={allInStageSelected ? 'Deselect column' : 'Select all in column'}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            {allInStageSelected ? (
              <CheckSquare className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            ) : someInStageSelected ? (
              <div className="w-3.5 h-3.5 border border-sky-500 bg-sky-500/20 rounded flex items-center justify-center text-[9px] text-sky-500 font-bold">
                -
              </div>
            ) : (
              <Square className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Virtualized Cards Scroll Container */}
      <div
        ref={parentRef}
        className="flex-1 overflow-y-auto px-3 py-3"
        style={{ contain: 'strict' }}
      >
        {dealIds.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-xs text-center border border-dashed border-slate-300 dark:border-slate-800/80 rounded-xl p-4">
            <Layers className="w-6 h-6 mb-2 text-slate-400 dark:text-slate-600" />
            <span>No deals in this stage matching current filter</span>
          </div>
        ) : (
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const dealId = dealIds[virtualRow.index];
              const deal = deals[dealId];
              if (!deal) return null;

              const isFocused = focusedDealId === deal.id;
              const isSelected = selectedDealIds.has(deal.id);

              return (
                <div
                  key={virtualRow.key}
                  ref={virtualizer.measureElement}
                  data-index={virtualRow.index}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <DealCard
                    deal={deal}
                    isFocused={isFocused}
                    isSelected={isSelected}
                    onSelect={() => toggleSelectDeal(deal.id)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export const BoardView: React.FC = () => {
  const { deals, stageDealIds, filters } = usePipelineStore();

  const filteredStageDeals = useMemo(() => {
    const result: Record<StageId, string[]> = {
      new_lead: [],
      contacted: [],
      demo_done: [],
      proposal_sent: [],
      negotiation: [],
      won: [],
      lost: [],
    };

    const query = filters.searchQuery.toLowerCase().trim();
    const ownerFilter = filters.ownerFilter;
    const quickFilter = filters.quickFilter;

    PIPELINE_STAGES.forEach((stage) => {
      if (filters.stageFilter !== 'all' && filters.stageFilter !== stage.id) {
        result[stage.id] = [];
        return;
      }

      const ids = stageDealIds[stage.id] || [];
      const filtered: string[] = [];

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

        filtered.push(id);
      }

      result[stage.id] = filtered;
    });

    return result;
  }, [deals, stageDealIds, filters]);

  return (
    <div className="flex-1 overflow-x-auto p-4 flex gap-4 h-full min-w-0">
      {PIPELINE_STAGES.map((stage) => {
        if (filters.stageFilter !== 'all' && filters.stageFilter !== stage.id) {
          return null;
        }

        return (
          <KanbanColumn
            key={stage.id}
            stage={stage}
            dealIds={filteredStageDeals[stage.id] || []}
          />
        );
      })}
    </div>
  );
};
