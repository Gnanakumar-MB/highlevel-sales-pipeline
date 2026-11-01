import React, { useEffect } from 'react';
import { usePipelineStore } from './store/usePipelineStore';
import { useGlobalKeyboardShortcuts } from './hooks/useGlobalKeyboardShortcuts';
import { Header } from './components/Header';
import { StageMetricsBar } from './components/StageMetricsBar';
import { BoardView } from './components/BoardView';
import { TableView } from './components/TableView';
import { BulkActionBar } from './components/BulkActionBar';
import { TeammateNotificationPill } from './components/TeammateNotificationPill';
import { DevDrawer } from './components/DevDrawer';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { QuickMoveModal } from './components/QuickMoveModal';
import { ToastContainer } from './components/ToastContainer';
import { Loader2 } from 'lucide-react';

export const App: React.FC = () => {
  const { initialize, isLoading, currentView } = usePipelineStore();

  useGlobalKeyboardShortcuts();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
        <Loader2 className="w-8 h-8 text-sky-500 animate-spin mb-3" />
        <h2 className="text-sm font-semibold tracking-wide">Initializing 50,000 In-Memory Deals...</h2>
        <p className="text-xs text-slate-500 mt-1">Preparing virtualized windows &amp; simulation engine</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans transition-colors duration-150">
      {/* Top Header */}
      <Header />

      {/* Stage Summary Metrics Bar */}
      <StageMetricsBar />

      {/* Main Viewport: Board or Table View */}
      <main className="flex-1 overflow-hidden flex flex-col relative">
        {currentView === 'board' ? <BoardView /> : <TableView />}
      </main>

      {/* Bulk Action Floating Bar */}
      <BulkActionBar />

      {/* Concurrency Teammate Notification */}
      <TeammateNotificationPill />

      {/* Dev / Chaos Drawer */}
      <DevDrawer />

      {/* Keyboard Shortcuts Cheat Sheet Modal */}
      <KeyboardShortcutsModal />

      {/* Quick Stage Move Modal */}
      <QuickMoveModal />

      {/* Non-intrusive Toasts */}
      <ToastContainer />
    </div>
  );
};

export default App;
