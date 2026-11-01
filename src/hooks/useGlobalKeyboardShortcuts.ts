import { useEffect } from 'react';
import { usePipelineStore } from '../store/usePipelineStore';
import { PIPELINE_STAGES } from '../simulation/mockGenerator';

export function useGlobalKeyboardShortcuts() {
  const {
    currentView,
    setCurrentView,
    focusedDealId,
    setFocusedDealId,
    focusedStage,
    setFocusedStage,
    toggleSelectDeal,
    clearSelection,
    toggleShortcutsModal,
    setQuickMoveOpen,
    isShortcutsOpen,
    isQuickMoveOpen,
    isDevDrawerOpen,
    toggleDevDrawer,
    stageDealIds,
  } = usePipelineStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcut if user is currently typing in an input or select
      const activeElement = document.activeElement;
      const isInput =
        activeElement?.tagName === 'INPUT' ||
        activeElement?.tagName === 'TEXTAREA' ||
        activeElement?.tagName === 'SELECT';

      // Always allow Esc to blur input or close overlays
      if (e.key === 'Escape') {
        if (isInput) {
          (activeElement as HTMLElement)?.blur();
          return;
        }
        if (isShortcutsOpen) {
          toggleShortcutsModal();
          return;
        }
        if (isQuickMoveOpen) {
          setQuickMoveOpen(false);
          return;
        }
        if (isDevDrawerOpen) {
          toggleDevDrawer();
          return;
        }
        clearSelection();
        return;
      }

      if (isInput) return;

      // Global View Switching
      if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        setCurrentView('board');
        return;
      }
      if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        setCurrentView('table');
        return;
      }

      // Open Shortcuts Cheat Sheet
      if (e.key === '?') {
        e.preventDefault();
        toggleShortcutsModal();
        return;
      }

      // Focus Search Bar
      if (e.key === '/') {
        e.preventDefault();
        const searchInput = document.getElementById('global-search-input');
        searchInput?.focus();
        return;
      }

      // Quick Move
      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        setQuickMoveOpen(true);
        return;
      }

      // Select / Deselect Deal
      if (e.key === 'x' || e.key === ' ' || e.code === 'Space') {
        if (focusedDealId) {
          e.preventDefault();
          toggleSelectDeal(focusedDealId);
          return;
        }
      }

      // Navigation: j / k / ArrowDown / ArrowUp
      if (e.key === 'j' || e.key === 'ArrowDown') {
        e.preventDefault();
        navigateNext();
        return;
      }
      if (e.key === 'k' || e.key === 'ArrowUp') {
        e.preventDefault();
        navigatePrev();
        return;
      }

      // Horizontal Navigation: h / l / ArrowLeft / ArrowRight (Column switching in Board View)
      if (currentView === 'board') {
        if (e.key === 'h' || e.key === 'ArrowLeft') {
          e.preventDefault();
          switchColumn(-1);
          return;
        }
        if (e.key === 'l' || e.key === 'ArrowRight') {
          e.preventDefault();
          switchColumn(1);
          return;
        }
      }
    };

    const navigateNext = () => {
      const ids = stageDealIds[focusedStage] || [];
      if (ids.length === 0) return;

      if (!focusedDealId) {
        setFocusedDealId(ids[0]);
        return;
      }

      const currentIndex = ids.indexOf(focusedDealId);
      if (currentIndex === -1 || currentIndex === ids.length - 1) {
        setFocusedDealId(ids[0]);
      } else {
        setFocusedDealId(ids[currentIndex + 1]);
      }
    };

    const navigatePrev = () => {
      const ids = stageDealIds[focusedStage] || [];
      if (ids.length === 0) return;

      if (!focusedDealId) {
        setFocusedDealId(ids[0]);
        return;
      }

      const currentIndex = ids.indexOf(focusedDealId);
      if (currentIndex <= 0) {
        setFocusedDealId(ids[ids.length - 1]);
      } else {
        setFocusedDealId(ids[currentIndex - 1]);
      }
    };

    const switchColumn = (direction: number) => {
      const stageIndex = PIPELINE_STAGES.findIndex((s) => s.id === focusedStage);
      let nextIndex = stageIndex + direction;
      if (nextIndex < 0) nextIndex = PIPELINE_STAGES.length - 1;
      if (nextIndex >= PIPELINE_STAGES.length) nextIndex = 0;

      const nextStage = PIPELINE_STAGES[nextIndex].id;
      setFocusedStage(nextStage);

      const stageIds = stageDealIds[nextStage] || [];
      if (stageIds.length > 0) {
        setFocusedDealId(stageIds[0]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    currentView,
    focusedDealId,
    focusedStage,
    isShortcutsOpen,
    isQuickMoveOpen,
    isDevDrawerOpen,
    stageDealIds,
  ]);
}
