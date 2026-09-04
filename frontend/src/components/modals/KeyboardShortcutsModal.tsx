'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Command, Sparkles, Navigation, Timer, Zap } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shortcuts = [
    {
      category: 'Workspace Navigation',
      icon: Navigation,
      color: 'text-indigo-400',
      items: [
        { key: '1', label: 'Year Calendar' },
        { key: '2', label: 'Focus Timer' },
        { key: '3', label: 'Tasks & Directives' },
        { key: '4', label: 'Habits Matrix' },
        { key: '5', label: 'Goals & Targets' },
        { key: '6', label: 'Focus Analytics' },
        { key: '7', label: 'Daily Reflection' },
        { key: '8', label: 'Settings & Data' },
      ],
    },
    {
      category: 'Power Actions',
      icon: Zap,
      color: 'text-amber-400',
      items: [
        { key: 'Space', label: 'Start / Pause Focus Timer' },
        { key: '?', label: 'Toggle Shortcuts Help' },
        { key: 'Esc', label: 'Close Active Modal / Sheet' },
      ],
    },
  ];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050811]/85 backdrop-blur-xl animate-fadeIn"
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', damping: 26, stiffness: 320 }}
        className="w-full max-w-lg glass-panel-luxury rounded-3xl border border-white/[0.12] overflow-hidden shadow-2xl flex flex-col bg-[#090E1C]/95"
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-white/[0.08] flex items-center justify-between bg-slate-900/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-md">
              <Command className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white tracking-tight flex items-center gap-2">
                <span>Keyboard Shortcuts</span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-[10px] text-indigo-300 font-mono">
                  Pro Hotkeys
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Navigate DayMark at lightning speed with global hotkeys
              </p>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.9 }}
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Shortcuts List */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          {shortcuts.map((section) => {
            const SectionIcon = section.icon;
            return (
              <div key={section.category} className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
                  <SectionIcon className={`w-3.5 h-3.5 ${section.color}`} />
                  <span>{section.category}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {section.items.map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-white/[0.06] hover:border-indigo-500/30 transition-colors"
                    >
                      <span className="text-xs text-slate-300 font-medium">{item.label}</span>
                      <kbd className="px-2 py-1 rounded-lg bg-slate-800 border border-white/15 text-[11px] font-mono font-bold text-indigo-300 shadow-inner">
                        {item.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-white/[0.08] bg-slate-900/50 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-white/10 font-mono text-[10px] text-slate-300">?</kbd> anywhere to toggle this panel</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-bold cursor-pointer transition-colors"
          >
            Got it
          </button>
        </div>
      </motion.div>
    </div>
  );
};
