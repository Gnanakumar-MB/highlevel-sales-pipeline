import React from 'react';
import { 
  LayoutGrid, 
  Table2, 
  Search, 
  SlidersHorizontal, 
  Keyboard, 
  UserCheck, 
  Clock, 
  Sparkles,
  Zap,
  Sun,
  Moon
} from 'lucide-react';
import { usePipelineStore } from '../store/usePipelineStore';
import { TEAM_MEMBERS, CURRENT_USER } from '../simulation/mockGenerator';
import { FilterState } from '../types/pipeline';

export const Header: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    filters,
    setSearchQuery,
    setOwnerFilter,
    setQuickFilter,
    toggleDevDrawer,
    toggleShortcutsModal,
    totalDealsCount,
    isDevDrawerOpen,
    theme,
    toggleTheme,
  } = usePipelineStore();

  const handleQuickFilterClick = (filter: FilterState['quickFilter']) => {
    if (filters.quickFilter === filter) {
      setQuickFilter('all');
    } else {
      setQuickFilter(filter);
    }
  };

  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 backdrop-blur px-4 py-2.5 sticky top-0 z-30 select-none transition-colors">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand & Stats */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">HighLevel</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 font-medium">
                  Opportunities
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Managing <span className="text-slate-900 dark:text-slate-200 font-semibold">{totalDealsCount.toLocaleString()} deals</span> across 20 reps
              </p>
            </div>
          </div>
        </div>

        {/* Quick Priority Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          <button
            onClick={() => handleQuickFilterClick('my_deals')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filters.quickFilter === 'my_deals'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-500/20'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700/60'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>My Deals ({CURRENT_USER.split(' ')[0]})</span>
          </button>

          <button
            onClick={() => handleQuickFilterClick('stale')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filters.quickFilter === 'stale'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/20'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700/60'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Stale (&gt;30d)</span>
          </button>

          <button
            onClick={() => handleQuickFilterClick('high_value')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filters.quickFilter === 'high_value'
                ? 'bg-emerald-500 text-slate-950 font-semibold shadow-md shadow-emerald-500/20'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>High Value (&ge;₹20L)</span>
          </button>

          {/* Rep filter dropdown */}
          <select
            value={filters.ownerFilter}
            onChange={(e) => setOwnerFilter(e.target.value)}
            className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs rounded-lg px-2.5 py-1.5 border border-slate-300 dark:border-slate-700/60 focus:outline-none focus:border-sky-500 cursor-pointer"
          >
            <option value="all">All Sales Reps (20)</option>
            {TEAM_MEMBERS.map((rep) => (
              <option key={rep} value={rep}>
                {rep}
              </option>
            ))}
          </select>
        </div>

        {/* Search, View, Theme & Dev Actions */}
        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative w-44 sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="global-search-input"
              type="text"
              placeholder="Search deals (Press '/')..."
              value={filters.searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-700/80 rounded-lg pl-8 pr-7 py-1.5 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
            />
            {filters.searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs px-1"
              >
                ✕
              </button>
            )}
          </div>

          {/* View Switcher: Board vs Table */}
          <div className="flex items-center bg-slate-200/80 dark:bg-slate-950 p-0.5 rounded-lg border border-slate-300 dark:border-slate-800">
            <button
              onClick={() => setCurrentView('board')}
              title="Board View (Press 'B')"
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                currentView === 'board'
                  ? 'bg-white dark:bg-sky-600 text-sky-700 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Board</span>
              <kbd className="hidden md:inline text-[10px] px-1 bg-slate-200 dark:bg-black/30 rounded border border-slate-300 dark:border-white/10 ml-0.5">B</kbd>
            </button>
            <button
              onClick={() => setCurrentView('table')}
              title="Table View (Press 'T')"
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                currentView === 'table'
                  ? 'bg-white dark:bg-sky-600 text-sky-700 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Table2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Table</span>
              <kbd className="hidden md:inline text-[10px] px-1 bg-slate-200 dark:bg-black/30 rounded border border-slate-300 dark:border-white/10 ml-0.5">T</kbd>
            </button>
          </div>

          {/* Theme Toggle (Light / Dark) */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700/60 rounded-lg transition-colors"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* Keyboard Shortcuts Trigger */}
          <button
            onClick={toggleShortcutsModal}
            title="Keyboard Shortcuts (Press '?')"
            className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700/60 rounded-lg transition-colors"
          >
            <Keyboard className="w-4 h-4" />
          </button>

          {/* Dev / Chaos Simulation Drawer Toggle */}
          <button
            onClick={toggleDevDrawer}
            title="Chaos Controls (Network delay, failure rate, teammate chaos)"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              isDevDrawerOpen
                ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border-slate-300 dark:border-slate-700/60'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden lg:inline">Chaos Controls</span>
          </button>
        </div>
      </div>
    </header>
  );
};
