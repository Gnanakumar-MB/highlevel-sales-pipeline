import { create } from 'zustand';
import { Deal, FilterState, OptimisticMutation, StageId, TeammateEvent } from '../types/pipeline';
import { mockBackendApi } from '../simulation/mockApi';

export interface ToastNotification {
  id: string;
  type: 'error' | 'success' | 'info';
  title: string;
  description: string;
  dealId?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
}

interface PipelineStoreState {
  // Data
  deals: Record<string, Deal>;
  stageDealIds: Record<StageId, string[]>;
  totalDealsCount: number;
  isLoading: boolean;

  // View state
  currentView: 'board' | 'table';
  setCurrentView: (view: 'board' | 'table') => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // Keyboard navigation & Selection
  focusedDealId: string | null;
  focusedStage: StageId;
  selectedDealIds: Set<string>;
  setFocusedDealId: (dealId: string | null) => void;
  setFocusedStage: (stage: StageId) => void;
  toggleSelectDeal: (dealId: string) => void;
  selectRange: (dealIds: string[]) => void;
  selectAllInStage: (stageId: StageId) => void;
  selectAllFiltered: (dealIds: string[]) => void;
  clearSelection: () => void;

  // Filters
  filters: FilterState;
  setSearchQuery: (query: string) => void;
  setOwnerFilter: (owner: string) => void;
  setQuickFilter: (filter: FilterState['quickFilter']) => void;
  setStageFilter: (stage: StageId | 'all') => void;

  // Optimistic Mutations & Network Resilience
  pendingMutations: Map<string, OptimisticMutation>;
  moveDeal: (dealId: string, targetStage: StageId) => Promise<void>;
  retryMutation: (dealId: string) => Promise<void>;
  rollbackMutation: (dealId: string) => void;
  bulkMoveSelected: (targetStage: StageId) => Promise<void>;

  // Teammate Concurrency Buffer (Calm UI)
  bufferedEvents: TeammateEvent[];
  applyBufferedEvents: () => void;
  dismissBufferedEvents: () => void;

  // Modals & Panels
  isDevDrawerOpen: boolean;
  toggleDevDrawer: () => void;
  isShortcutsOpen: boolean;
  toggleShortcutsModal: () => void;
  isQuickMoveOpen: boolean;
  setQuickMoveOpen: (open: boolean) => void;

  // Toasts
  toasts: ToastNotification[];
  addToast: (toast: Omit<ToastNotification, 'id'>) => void;
  removeToast: (id: string) => void;

  // Init & Teammate event listener setup
  initialize: () => void;
}

export const usePipelineStore = create<PipelineStoreState>((set, get) => ({
  deals: {},
  stageDealIds: {
    new_lead: [],
    contacted: [],
    demo_done: [],
    proposal_sent: [],
    negotiation: [],
    won: [],
    lost: []
  },
  totalDealsCount: 0,
  isLoading: true,

  currentView: 'board',
  setCurrentView: (view) => set({ currentView: view }),
  theme: (typeof window !== 'undefined' && (localStorage.getItem('pipeline-theme') as 'light' | 'dark')) || 'light',
  toggleTheme: () => {
    const nextTheme = get().theme === 'dark' ? 'light' : 'dark';
    if (typeof window !== 'undefined') {
      localStorage.setItem('pipeline-theme', nextTheme);
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    set({ theme: nextTheme });
  },

  focusedDealId: null,
  focusedStage: 'new_lead',
  selectedDealIds: new Set(),
  setFocusedDealId: (dealId) => set({ focusedDealId: dealId }),
  setFocusedStage: (stage) => set({ focusedStage: stage }),

  toggleSelectDeal: (dealId) => {
    const selected = new Set(get().selectedDealIds);
    if (selected.has(dealId)) {
      selected.delete(dealId);
    } else {
      selected.add(dealId);
    }
    set({ selectedDealIds: selected, focusedDealId: dealId });
  },

  selectRange: (dealIds) => {
    const selected = new Set(get().selectedDealIds);
    dealIds.forEach((id) => selected.add(id));
    set({ selectedDealIds: selected });
  },

  selectAllInStage: (stageId) => {
    const { stageDealIds, selectedDealIds } = get();
    const stageIds = stageDealIds[stageId] || [];
    const newSelected = new Set(selectedDealIds);
    stageIds.forEach((id) => newSelected.add(id));
    set({ selectedDealIds: newSelected });
  },

  selectAllFiltered: (dealIds) => {
    set({ selectedDealIds: new Set(dealIds) });
  },

  clearSelection: () => set({ selectedDealIds: new Set() }),

  filters: {
    searchQuery: '',
    ownerFilter: 'all',
    quickFilter: 'all',
    stageFilter: 'all'
  },

  setSearchQuery: (searchQuery) => set((state) => ({ filters: { ...state.filters, searchQuery } })),
  setOwnerFilter: (ownerFilter) => set((state) => ({ filters: { ...state.filters, ownerFilter } })),
  setQuickFilter: (quickFilter) => set((state) => ({ filters: { ...state.filters, quickFilter } })),
  setStageFilter: (stageFilter) => set((state) => ({ filters: { ...state.filters, stageFilter } })),

  pendingMutations: new Map(),

  moveDeal: async (dealId: string, targetStage: StageId) => {
    const { deals, stageDealIds, pendingMutations, addToast } = get();
    const deal = deals[dealId];
    if (!deal || deal.stage === targetStage) return;

    const previousStage = deal.stage;

    // 1. Snapshot previous state for rollback
    const mutation: OptimisticMutation = {
      dealId,
      previousStage,
      targetStage,
      timestamp: Date.now(),
      retryCount: 0,
    };
    const newPendingMutations = new Map(pendingMutations);
    newPendingMutations.set(dealId, mutation);

    // 2. Optimistic UI Update: update stage indices & deal status immediately
    const nextStageDealIds = { ...stageDealIds };
    nextStageDealIds[previousStage] = nextStageDealIds[previousStage].filter((id) => id !== dealId);
    nextStageDealIds[targetStage] = [dealId, ...nextStageDealIds[targetStage]];

    const updatedDeal: Deal = {
      ...deal,
      stage: targetStage,
      syncStatus: 'pending',
    };

    set({
      deals: { ...deals, [dealId]: updatedDeal },
      stageDealIds: nextStageDealIds,
      pendingMutations: newPendingMutations,
      focusedStage: targetStage,
    });

    // 3. Dispatch async save to mock backend
    try {
      await mockBackendApi.updateDeal(dealId, { stage: targetStage });

      // Save Succeeded! Mark synced
      const currentDeals = get().deals;
      if (currentDeals[dealId]) {
        const syncedDeal: Deal = { ...currentDeals[dealId], syncStatus: 'synced' };
        const updatedMutations = new Map(get().pendingMutations);
        updatedMutations.delete(dealId);
        set({
          deals: { ...currentDeals, [dealId]: syncedDeal },
          pendingMutations: updatedMutations,
        });
      }
    } catch (error: any) {
      // Save Failed! Update to failed state and trigger Actionable Toast
      const currentDeals = get().deals;
      if (currentDeals[dealId]) {
        const failedDeal: Deal = { ...currentDeals[dealId], syncStatus: 'failed' };
        set({ deals: { ...currentDeals, [dealId]: failedDeal } });
      }

      addToast({
        type: 'error',
        title: `Failed to move ${deal.company}`,
        description: error.message || 'Save failed due to network instability.',
        dealId,
        action: {
          label: 'Retry Save',
          onClick: () => get().retryMutation(dealId),
        },
        duration: 9000,
      });
    }
  },

  retryMutation: async (dealId: string) => {
    const { deals, pendingMutations, addToast } = get();
    const deal = deals[dealId];
    const mutation = pendingMutations.get(dealId);
    if (!deal || !mutation) return;

    // Update status to pending
    set({
      deals: {
        ...deals,
        [dealId]: { ...deal, syncStatus: 'pending' },
      },
    });

    try {
      await mockBackendApi.updateDeal(dealId, { stage: mutation.targetStage });
      const currentDeals = get().deals;
      const updatedMutations = new Map(get().pendingMutations);
      updatedMutations.delete(dealId);

      set({
        deals: {
          ...currentDeals,
          [dealId]: { ...currentDeals[dealId], syncStatus: 'synced' },
        },
        pendingMutations: updatedMutations,
      });

      addToast({
        type: 'success',
        title: 'Save Resolved',
        description: `Successfully synced ${deal.company} to pipeline.`,
        duration: 4000,
      });
    } catch (error: any) {
      const currentDeals = get().deals;
      set({
        deals: {
          ...currentDeals,
          [dealId]: { ...currentDeals[dealId], syncStatus: 'failed' },
        },
      });

      addToast({
        type: 'error',
        title: `Retry failed for ${deal.company}`,
        description: 'Network error persisted. You can retry again or revert to original stage.',
        dealId,
        action: {
          label: 'Revert Deal',
          onClick: () => get().rollbackMutation(dealId),
        },
        duration: 9000,
      });
    }
  },

  rollbackMutation: (dealId: string) => {
    const { deals, stageDealIds, pendingMutations, addToast } = get();
    const deal = deals[dealId];
    const mutation = pendingMutations.get(dealId);
    if (!deal || !mutation) return;

    const currentStage = deal.stage;
    const originalStage = mutation.previousStage;

    // Restore original stage indices
    const nextStageDealIds = { ...stageDealIds };
    nextStageDealIds[currentStage] = nextStageDealIds[currentStage].filter((id) => id !== dealId);
    nextStageDealIds[originalStage] = [dealId, ...nextStageDealIds[originalStage]];

    const revertedDeal: Deal = {
      ...deal,
      stage: originalStage,
      syncStatus: 'synced',
    };

    const nextPendingMutations = new Map(pendingMutations);
    nextPendingMutations.delete(dealId);

    set({
      deals: { ...deals, [dealId]: revertedDeal },
      stageDealIds: nextStageDealIds,
      pendingMutations: nextPendingMutations,
    });

    addToast({
      type: 'info',
      title: 'Deal Restored',
      description: `Reverted ${deal.company} back to ${originalStage}.`,
      duration: 4000,
    });
  },

  bulkMoveSelected: async (targetStage: StageId) => {
    const { selectedDealIds, deals, stageDealIds, addToast } = get();
    const idsToMove = Array.from(selectedDealIds).filter((id) => deals[id]?.stage !== targetStage);

    if (idsToMove.length === 0) return;

    // Snapshot for potential rollback
    const originalStages: Record<string, StageId> = {};
    idsToMove.forEach((id) => {
      originalStages[id] = deals[id].stage;
    });

    // 1. Optimistic batch update
    const updatedDeals = { ...deals };
    const nextStageDealIds = { ...stageDealIds };

    idsToMove.forEach((id) => {
      const prev = originalStages[id];
      nextStageDealIds[prev] = nextStageDealIds[prev].filter((dealId) => dealId !== id);
      updatedDeals[id] = {
        ...updatedDeals[id],
        stage: targetStage,
        syncStatus: 'pending',
      };
    });
    nextStageDealIds[targetStage] = [...idsToMove, ...nextStageDealIds[targetStage]];

    set({
      deals: updatedDeals,
      stageDealIds: nextStageDealIds,
      selectedDealIds: new Set(), // clear selection
    });

    try {
      await mockBackendApi.bulkUpdateStage(idsToMove, targetStage);

      // Succeeded! Mark all synced
      const finalDeals = { ...get().deals };
      idsToMove.forEach((id) => {
        if (finalDeals[id]) {
          finalDeals[id] = { ...finalDeals[id], syncStatus: 'synced' };
        }
      });

      set({ deals: finalDeals });

      const isSingle = idsToMove.length === 1;
      const singleDealName = isSingle ? (deals[idsToMove[0]]?.company || 'deal') : '';
      const stageLabel = targetStage.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());

      addToast({
        type: 'success',
        title: isSingle ? 'Deal Moved' : 'Bulk Move Successful',
        description: isSingle
          ? `Successfully moved ${singleDealName} to ${stageLabel}.`
          : `Successfully moved ${idsToMove.length.toLocaleString()} deals to ${stageLabel}.`,
        duration: 4000,
      });
    } catch (error: any) {
      // Bulk Save Failed - Rollback batch
      const rollbackDeals = { ...get().deals };
      const rollbackStageIndices = { ...get().stageDealIds };

      idsToMove.forEach((id) => {
        const origStage = originalStages[id];
        rollbackStageIndices[targetStage] = rollbackStageIndices[targetStage].filter((dId) => dId !== id);
        rollbackStageIndices[origStage] = [id, ...rollbackStageIndices[origStage]];
        rollbackDeals[id] = {
          ...rollbackDeals[id],
          stage: origStage,
          syncStatus: 'failed',
        };
      });

      set({
        deals: rollbackDeals,
        stageDealIds: rollbackStageIndices,
      });

      const isSingle = idsToMove.length === 1;
      const singleDealName = isSingle ? (deals[idsToMove[0]]?.company || 'deal') : '';

      addToast({
        type: 'error',
        title: isSingle ? `Failed to Move ${singleDealName}` : `Bulk Operation Failed`,
        description: isSingle
          ? `${error.message || 'Server error'}. Rolled back ${singleDealName}.`
          : `${error.message || 'Server error'}. Rolled back all ${idsToMove.length.toLocaleString()} deals.`,
        duration: 9000,
      });
    }
  },

  bufferedEvents: [],

  applyBufferedEvents: () => {
    const { bufferedEvents, deals, stageDealIds, addToast } = get();
    if (bufferedEvents.length === 0) return;

    const nextDeals = { ...deals };
    const nextStageDealIds = { ...stageDealIds };

    bufferedEvents.forEach((event) => {
      const deal = nextDeals[event.dealId];
      if (deal) {
        if (deal.stage !== event.newStage) {
          nextStageDealIds[deal.stage] = nextStageDealIds[deal.stage].filter((id) => id !== event.dealId);
          nextStageDealIds[event.newStage] = [event.dealId, ...nextStageDealIds[event.newStage]];
        }
        nextDeals[event.dealId] = {
          ...deal,
          stage: event.newStage,
          lastModifiedBy: event.teammateName,
          isBuffered: false,
        };
      }
    });

    set({
      deals: nextDeals,
      stageDealIds: nextStageDealIds,
      bufferedEvents: [],
    });

    addToast({
      type: 'info',
      title: 'Teammate Updates Applied',
      description: `Reconciled ${bufferedEvents.length} updates from teammates.`,
      duration: 3500,
    });
  },

  dismissBufferedEvents: () => set({ bufferedEvents: [] }),

  isDevDrawerOpen: false,
  toggleDevDrawer: () => set((state) => ({ isDevDrawerOpen: !state.isDevDrawerOpen })),

  isShortcutsOpen: false,
  toggleShortcutsModal: () => set((state) => ({ isShortcutsOpen: !state.isShortcutsOpen })),

  isQuickMoveOpen: false,
  setQuickMoveOpen: (open) => set({ isQuickMoveOpen: open }),

  toasts: [],
  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newToast: ToastNotification = { ...toast, id };
    set((state) => ({ toasts: [...state.toasts, newToast] }));

    if (toast.duration !== 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, toast.duration || 5000);
    }
  },

  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },

  initialize: () => {
    // Apply theme to document
    if (typeof window !== 'undefined') {
      const activeTheme = get().theme;
      if (activeTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }

    const { dealsById, stageDealIds } = mockBackendApi.getInitialDeals();
    const dealsRecord: Record<string, Deal> = {};
    for (const [id, deal] of dealsById.entries()) {
      dealsRecord[id] = deal;
    }

    set({
      deals: dealsRecord,
      stageDealIds,
      totalDealsCount: dealsById.size,
      isLoading: false,
    });

    // Listen to real-time teammate simulation events
    mockBackendApi.subscribeToTeammateEvents((event: TeammateEvent) => {
      const { focusedDealId, selectedDealIds, deals, stageDealIds } = get();

      // Check if this event conflicts with the user's active context
      const isSelected = selectedDealIds.has(event.dealId);
      const isFocused = focusedDealId === event.dealId;

      if (isSelected || isFocused) {
        // BUFFER the update! Do NOT jump the card under the user's fingers!
        set((state) => {
          const existingDeal = state.deals[event.dealId];
          const flaggedDeal = existingDeal
            ? { ...existingDeal, lastModifiedBy: event.teammateName, isBuffered: true }
            : existingDeal;

          return {
            bufferedEvents: [...state.bufferedEvents, event],
            deals: flaggedDeal ? { ...state.deals, [event.dealId]: flaggedDeal } : state.deals,
          };
        });
      } else {
        // Non-active background deal: apply quietly to prevent stale data
        const currentDeal = deals[event.dealId];
        if (currentDeal) {
          const nextDeals = { ...deals };
          const nextStageIndices = { ...stageDealIds };

          if (currentDeal.stage !== event.newStage) {
            nextStageIndices[currentDeal.stage] = nextStageIndices[currentDeal.stage].filter((id) => id !== event.dealId);
            nextStageIndices[event.newStage] = [event.dealId, ...nextStageIndices[event.newStage]];
          }

          nextDeals[event.dealId] = {
            ...currentDeal,
            stage: event.newStage,
            lastModifiedBy: event.teammateName,
          };

          set({
            deals: nextDeals,
            stageDealIds: nextStageIndices,
          });
        }
      }
    });
  },
}));
