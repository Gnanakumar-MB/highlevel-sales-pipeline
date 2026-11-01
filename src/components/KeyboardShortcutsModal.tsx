import React from 'react';
import { usePipelineStore } from '../store/usePipelineStore';
import { X, Keyboard } from 'lucide-react';

export const KeyboardShortcutsModal: React.FC = () => {
  const { isShortcutsOpen, toggleShortcutsModal } = usePipelineStore();

  if (!isShortcutsOpen) return null;

  const shortcutGroups = [
    {
      title: 'Navigation',
      items: [
        { keys: ['j', '↓'], desc: 'Next deal card / table row' },
        { keys: ['k', '↑'], desc: 'Previous deal card / table row' },
        { keys: ['h', '←'], desc: 'Switch to column on the left (Board)' },
        { keys: ['l', '→'], desc: 'Switch to column on the right (Board)' },
      ],
    },
    {
      title: 'Selection & Bulk Actions',
      items: [
        { keys: ['x', 'Space'], desc: 'Toggle select focused deal' },
        { keys: ['Shift', 'Click'], desc: 'Range select deals between clicks' },
        { keys: ['Cmd', 'A'], desc: 'Select all deals in current view' },
        { keys: ['Esc'], desc: 'Clear selection / Close active popovers' },
      ],
    },
    {
      title: 'Stage Progression',
      items: [
        { keys: ['m'], desc: 'Open Quick Stage Move dialog' },
        { keys: ['1', '-', '7'], desc: 'Directly move deal to stage 1 to 7' },
      ],
    },
    {
      title: 'Application & Views',
      items: [
        { keys: ['b'], desc: 'Switch to Kanban Board View' },
        { keys: ['t'], desc: 'Switch to Bulk Table View' },
        { keys: ['/'], desc: 'Focus global search input' },
        { keys: ['?'], desc: 'Toggle keyboard shortcuts cheat sheet' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150 select-none">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Keyboard Shortcuts</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Designed for mouse-free power users</p>
            </div>
          </div>

          <button
            onClick={toggleShortcutsModal}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
          {shortcutGroups.map((group) => (
            <div key={group.title}>
              <h4 className="text-[11px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-2">
                {group.title}
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {group.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80"
                  >
                    <span className="text-slate-700 dark:text-slate-300">{item.desc}</span>
                    <div className="flex items-center gap-1">
                      {item.keys.map((k, kIdx) => (
                        <kbd
                          key={kIdx}
                          className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-mono text-[11px] shadow-sm"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 text-center text-[11px] text-slate-500">
          Press <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">Esc</kbd> anytime to dismiss
        </div>
      </div>
    </div>
  );
};
