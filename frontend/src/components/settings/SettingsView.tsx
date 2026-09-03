'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Settings as SettingsIcon,
  Download,
  Upload,
  RefreshCw,
  Sliders,
  Volume2,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

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
        setImportStatus('✅ Backup data imported successfully!');
      } else {
        setImportStatus('❌ Error: Invalid backup JSON file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-slate-400" />
          <span>Preferences &amp; Data Management</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Customize Focus Timer defaults, audio triggers, and local JSON backups.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Timer & Goal Settings */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <span>Focus Timer Defaults</span>
          </h3>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-300 block mb-1">
                Daily Focus Target (Minutes): <span className="font-bold text-indigo-400">{settings.dailyTargetMinutes}m</span>
              </label>
              <input
                type="number"
                min="30"
                max="1440"
                step="30"
                value={settings.dailyTargetMinutes}
                onChange={(e) => updateSettings({ dailyTargetMinutes: parseInt(e.target.value) || 360 })}
                className="w-full px-3 py-2 text-xs rounded-xl glass-input"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">
                Pomodoro Work Duration (Minutes)
              </label>
              <input
                type="number"
                min="5"
                max="120"
                value={settings.workIntervalMinutes}
                onChange={(e) => updateSettings({ workIntervalMinutes: parseInt(e.target.value) || 25 })}
                className="w-full px-3 py-2 text-xs rounded-xl glass-input"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Short Break (Mins)</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={settings.shortBreakMinutes}
                  onChange={(e) => updateSettings({ shortBreakMinutes: parseInt(e.target.value) || 5 })}
                  className="w-full px-3 py-2 text-xs rounded-xl glass-input"
                />
              </div>
              <div>
                <label className="text-xs text-slate-300 block mb-1">Long Break (Mins)</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={settings.longBreakMinutes}
                  onChange={(e) => updateSettings({ longBreakMinutes: parseInt(e.target.value) || 15 })}
                  className="w-full px-3 py-2 text-xs rounded-xl glass-input"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <span className="text-xs text-slate-300">Completion Chime Sound</span>
              <button
                onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  settings.soundEnabled
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                {settings.soundEnabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: JSON Export & Backup */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Data Backup &amp; Portability</span>
          </h3>

          <div className="space-y-4">
            <p className="text-xs text-slate-400 leading-relaxed">
              Your DayMark data (sessions, habits, tasks, goals, countdowns, and journal reviews) is safely persisted locally in your browser. Export it anytime to JSON or transfer to another device.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleExport}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Export Backup (JSON)</span>
              </button>

              <label className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-white/10 cursor-pointer transition-colors">
                <Upload className="w-4 h-4 text-indigo-400" />
                <span>Import Backup</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </label>
            </div>

            {importStatus && (
              <p className="text-xs font-medium text-center py-2 px-3 rounded-lg bg-slate-900 border border-white/10">
                {importStatus}
              </p>
            )}

            {/* Reset Section */}
            <div className="pt-6 border-t border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-rose-400">Reset Local Storage</h4>
                  <p className="text-[11px] text-slate-500">Restore factory seed dataset.</p>
                </div>
                <button
                  onClick={() => setShowResetConfirm(!showResetConfirm)}
                  className="px-3 py-1.5 rounded-lg bg-rose-950/60 text-rose-300 border border-rose-800/40 text-xs font-bold"
                >
                  Reset Data
                </button>
              </div>

              {showResetConfirm && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 space-y-2">
                  <p className="text-xs text-rose-200">
                    Are you sure you want to reset all data back to the demo state?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        resetAllData();
                        setShowResetConfirm(false);
                      }}
                      className="px-3 py-1 rounded bg-rose-600 text-white text-xs font-bold"
                    >
                      Confirm Reset
                    </button>
                    <button
                      onClick={() => setShowResetConfirm(false)}
                      className="px-3 py-1 rounded bg-slate-800 text-slate-300 text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
