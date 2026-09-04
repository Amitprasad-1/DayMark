'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Settings as SettingsIcon,
  Download,
  Upload,
  Sliders,
  Volume2,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    exportDataJSON,
    importDataJSON,
    resetAllData,
  } = useApp();

  const [importStatus, setImportStatus] = useState<string>('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleExport = () => {
    const jsonStr = exportDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DayMark_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importDataJSON(content);
      if (success) {
        setImportStatus('✅ Backup data imported and restored successfully!');
      } else {
        setImportStatus('❌ Error: Invalid backup JSON file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel-luxury p-6 lg:p-7 rounded-3xl border border-white/[0.09] shadow-2xl bg-[#090E1C]/80">
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-slate-800 text-slate-300 border border-white/10 shadow-md">
            <SettingsIcon className="w-5 h-5" />
          </div>
          <span>System Preferences &amp; Data Portability</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Customize focus interval cadences, sound chime triggers, and persistent backup payloads.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Timer & Goal Settings */}
        <div className="glass-panel-luxury p-6 lg:p-8 rounded-3xl border border-white/[0.09] space-y-5 shadow-2xl bg-[#090E1C]/80">
          <h3 className="text-sm font-black text-white flex items-center gap-2 border-b border-white/[0.07] pb-3.5 tracking-wide">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <span>Focus Timer Defaults</span>
          </h3>

          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Daily Focus Target (Minutes): <span className="font-mono font-black text-indigo-400">{settings.dailyTargetMinutes}m</span>
              </label>
              <input
                type="number"
                min="30"
                max="1440"
                step="30"
                value={settings.dailyTargetMinutes}
                onChange={(e) => updateSettings({ dailyTargetMinutes: parseInt(e.target.value) || 360 })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl glass-input font-medium"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Pomodoro Work Duration (Minutes)
              </label>
              <input
                type="number"
                min="5"
                max="120"
                value={settings.workIntervalMinutes}
                onChange={(e) => updateSettings({ workIntervalMinutes: parseInt(e.target.value) || 25 })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl glass-input font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Short Break (Mins)</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={settings.shortBreakMinutes}
                  onChange={(e) => updateSettings({ shortBreakMinutes: parseInt(e.target.value) || 5 })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl glass-input font-medium"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Long Break (Mins)</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={settings.longBreakMinutes}
                  onChange={(e) => updateSettings({ longBreakMinutes: parseInt(e.target.value) || 15 })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl glass-input font-medium"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-slate-200 font-bold">Session Completion Chime</span>
              </div>
              <motion.button
                whileTap={{ scale: 0.92 }}
                type="button"
                onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  settings.soundEnabled
                    ? 'bg-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                    : 'bg-slate-800 text-slate-400 border border-white/5'
                }`}
              >
                {settings.soundEnabled ? 'Enabled' : 'Disabled'}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Right Column: JSON Export & Backup */}
        <div className="glass-panel-luxury p-6 lg:p-8 rounded-3xl border border-white/[0.09] space-y-5 shadow-2xl bg-[#090E1C]/80 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-black text-white flex items-center gap-2 border-b border-white/[0.07] pb-3.5 tracking-wide">
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Data Sovereignty &amp; Portability</span>
            </h3>

            <p className="text-xs text-slate-400 leading-relaxed">
              Your DayMark dataset (focus sessions, habits, directives, strategic targets, and reflections) is securely cached locally and synchronized with PostgreSQL. Export your data to JSON anytime.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={handleExport}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xl cursor-pointer transition-all border border-emerald-400/40"
              >
                <Download className="w-4 h-4" />
                <span>Export JSON</span>
              </motion.button>

              <label className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 font-bold text-xs border border-white/10 hover:border-indigo-500/40 cursor-pointer transition-all shadow-md">
                <Upload className="w-4 h-4 text-indigo-400" />
                <span>Import JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </label>
            </div>

            {importStatus && (
              <p className="text-xs font-bold text-center py-2.5 px-3.5 rounded-xl bg-slate-900 border border-white/10 text-slate-200 shadow-inner">
                {importStatus}
              </p>
            )}
          </div>

          {/* Reset Section */}
          <div className="pt-6 border-t border-white/[0.07] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black text-rose-400 uppercase tracking-wide">Reset Local Workspace</h4>
                <p className="text-[11px] text-slate-500">Restore default demo seed dataset.</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                type="button"
                onClick={() => setShowResetConfirm(!showResetConfirm)}
                className="px-3.5 py-1.5 rounded-xl bg-rose-950/60 text-rose-300 border border-rose-800/50 text-xs font-black cursor-pointer shadow-sm"
              >
                Reset Data
              </motion.button>
            </div>

            <AnimatePresence>
              {showResetConfirm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 rounded-2xl bg-rose-950/50 border border-rose-800/70 space-y-3 shadow-xl"
                >
                  <p className="text-xs text-rose-200 font-medium leading-relaxed">
                    Are you certain you want to wipe local data and reset back to the default seed dataset?
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        resetAllData();
                        setShowResetConfirm(false);
                      }}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black cursor-pointer shadow-md"
                    >
                      Confirm Reset
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowResetConfirm(false)}
                      className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 text-xs font-bold border border-white/10 hover:text-white cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
