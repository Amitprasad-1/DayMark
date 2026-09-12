'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Settings as SettingsIcon,
  Download,
  Upload,
  Sliders,
  Volume2,
  CheckCircle,
  AlertTriangle,
  Clock,
  Sparkles,
  RefreshCw,
  Smartphone,
  Laptop,
  QrCode,
  Copy,
  Check,
  RotateCcw,
  History,
  Calendar,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cloudSync } from '@/lib/cloudSync';
import { format, subDays } from 'date-fns';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    exportDataJSON,
    importDataJSON,
    resetAllData,
    loadStudyFocusPreset,
    cloudRoomId,
    setCloudRoomId,
    cloudSyncStatus,
    lastSyncedAt,
    syncWithCloud,
    recoverMissingStudySession,
    backupSnapshots,
    restoreSnapshot,
    activities,
  } = useApp();

  const [importStatus, setImportStatus] = useState<string>('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedRoom, setCopiedRoom] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [inputRoomId, setInputRoomId] = useState(cloudRoomId);
  const [showQrModal, setShowQrModal] = useState(false);

  // Recovery form state
  const [recoveryDate, setRecoveryDate] = useState<string>(format(subDays(new Date(), 1), 'yyyy-MM-dd'));
  const [recoveryHours, setRecoveryHours] = useState<number>(2);
  const [recoveryActivity, setRecoveryActivity] = useState<string>('Data Analytics & Study');
  const [recoveryNotes, setRecoveryNotes] = useState<string>('');
  const [recoverySuccessMsg, setRecoverySuccessMsg] = useState<string>('');

  useEffect(() => {
    setInputRoomId(cloudRoomId);
  }, [cloudRoomId]);

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

  const handleManualSync = async () => {
    setIsSyncing(true);
    await syncWithCloud();
    setTimeout(() => {
      setIsSyncing(false);
    }, 600);
  };

  const handleApplyRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputRoomId.trim()) return;
    setCloudRoomId(inputRoomId.trim().toUpperCase());
    setImportStatus(`✅ Connected to Cloud Room [ ${inputRoomId.trim().toUpperCase()} ]`);
  };

  const pairingUrl = cloudSync.getPairingUrl();
  const qrCodeUrl = cloudSync.getQrCodeUrl(pairingUrl);

  const handleCopyPairingLink = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(pairingUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleCopyRoomCode = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(cloudRoomId);
      setCopiedRoom(true);
      setTimeout(() => setCopiedRoom(false), 2500);
    }
  };

  const handleQuickRestore = (hours: number, daysAgo: number, label: string) => {
    const targetDate = format(subDays(new Date(), daysAgo), 'yyyy-MM-dd');
    recoverMissingStudySession(targetDate, hours, recoveryActivity, `${hours}h study session on ${label}`);
    setRecoverySuccessMsg(`✅ Successfully restored ${hours} hours of study for ${targetDate} (${label})! Your heatmaps and total hours are updated.`);
    setTimeout(() => setRecoverySuccessMsg(''), 5000);
  };

  const handleCustomRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryDate || recoveryHours <= 0) return;
    recoverMissingStudySession(recoveryDate, recoveryHours, recoveryActivity, recoveryNotes || `${recoveryHours}h study session`);
    setRecoverySuccessMsg(`✅ Restored ${recoveryHours} hours on ${recoveryDate}!`);
    setTimeout(() => setRecoverySuccessMsg(''), 5000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="glass-panel-luxury p-6 lg:p-7 rounded-3xl border border-white/[0.09] shadow-2xl bg-[#090E1C]/80">
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-slate-800 text-slate-300 border border-white/10 shadow-md">
            <SettingsIcon className="w-5 h-5" />
          </div>
          <span>Cloud Sync, Real-Time Pairing &amp; Recovery</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Keep your laptop and phone updated in real time, pair devices via QR code, and restore any missing study sessions with 1 click.
        </p>
      </div>

      {/* =========================================================================
          SECTION 1: REAL-TIME CLOUD SYNC (LAPTOP <-> PHONE)
          ========================================================================= */}
      <div className="glass-panel-luxury p-6 lg:p-8 rounded-3xl border border-amber-500/30 space-y-6 shadow-2xl bg-[#0B0F20]/90 relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 shadow-lg">
              <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>Real-Time Cloud Sync (Laptop ↔ Phone)</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Universal Relay
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Both devices share this private Sync Room. Any session or habit logged on your laptop appears on your phone automatically.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={handleManualSync}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-xl cursor-pointer transition-all border border-amber-300/60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
            </motion.button>
          </div>
        </div>

        {/* Pairing Controls & Room ID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Room Code & Instructions */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl bg-slate-900/90 border border-white/10 shadow-inner">
              <div className="flex-1 min-w-[200px]">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                  Active Sync Room Code:
                </span>
                <form onSubmit={handleApplyRoom} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inputRoomId}
                    onChange={(e) => setInputRoomId(e.target.value)}
                    placeholder="e.g. DM-7842"
                    className="px-3.5 py-2 text-sm font-mono font-black text-amber-300 rounded-xl bg-black/60 border border-white/15 focus:border-amber-400 outline-none w-36 uppercase tracking-wider"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/15 cursor-pointer transition-all"
                  >
                    Join Room
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyRoomCode}
                    className="p-2 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 cursor-pointer transition-all"
                    title="Copy Room Code"
                  >
                    {copiedRoom ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </form>
              </div>

              <div className="h-10 w-px bg-white/10 hidden sm:block" />

              <div className="flex flex-col gap-1 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10B981]" />
                  <span className="font-bold">Sync Frequency: Every 12s + on focus</span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Last active: {lastSyncedAt ? lastSyncedAt.toLocaleTimeString() : 'Just now'}
                </div>
              </div>
            </div>

            {/* Quick Connect Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setShowQrModal(!showQrModal)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600/30 hover:bg-indigo-600/40 border border-indigo-400/50 text-indigo-200 text-xs font-bold cursor-pointer transition-all shadow-md"
              >
                <QrCode className="w-4 h-4 text-indigo-400" />
                <span>{showQrModal ? 'Hide Pairing QR' : 'Show Phone Pairing QR Code'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyPairingLink}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-200 text-xs font-bold cursor-pointer transition-all"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-amber-400" />}
                <span>{copiedLink ? 'Link Copied to Clipboard!' : 'Copy Direct Phone Link'}</span>
              </button>
            </div>

            {/* Device Cross-Sync Diagram */}
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/[0.06] text-xs text-slate-300 flex items-center justify-around gap-4 font-mono">
              <div className="flex items-center gap-2">
                <Laptop className="w-4 h-4 text-cyan-400" />
                <span>Laptop</span>
              </div>
              <div className="flex items-center gap-1 text-amber-400 font-black">
                <span>⇄</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/30">
                  {cloudRoomId}
                </span>
                <span>⇄</span>
              </div>
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>Phone</span>
              </div>
            </div>
          </div>

          {/* Right Col: Instant QR Code for Mobile Camera Scanning */}
          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-900/90 border border-white/10 text-center space-y-3">
            <div className="p-2 rounded-2xl bg-white shadow-2xl ring-4 ring-amber-400/20">
              <img
                src={qrCodeUrl}
                alt="DayMark Phone Sync QR"
                className="w-36 h-36 rounded-lg"
              />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-200">Scan with Phone Camera</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Opens DayMark on your phone and pairs instantly to this laptop.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 2: EMERGENCY STUDY DATA RECOVERY (RESTORE 2H, 4H, ETC.)
          ========================================================================= */}
      <div className="glass-panel-luxury p-6 lg:p-8 rounded-3xl border border-indigo-500/30 space-y-6 shadow-2xl bg-[#090E1C]/90 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 border border-cyan-400/40 text-cyan-300 shadow-lg">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>Recover Lost Study Sessions (Last 2 to 3 Days)</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  Instant Restore
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                If you studied 2 hours or 4 hours on another device or prior to syncing, restore those hours below.
              </p>
            </div>
          </div>
        </div>

        {/* 1-Click Quick Recovery Buttons */}
        <div className="space-y-3">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-300 block">
            1-Click Fast Recovery Presets:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={() => handleQuickRestore(4, 2, '2 Days Ago (Sep 10)')}
              className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-600/20 border border-emerald-400/50 text-emerald-200 hover:text-white flex flex-col items-center justify-center text-center cursor-pointer transition-all shadow-lg"
            >
              <span className="font-mono text-xl font-black text-emerald-300">4 Hours</span>
              <span className="text-xs font-bold mt-0.5">2 Days Ago</span>
              <span className="text-[10px] text-slate-400 font-mono">Sep 10</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={() => handleQuickRestore(2, 1, 'Yesterday (Sep 11)')}
              className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-400/50 text-indigo-200 hover:text-white flex flex-col items-center justify-center text-center cursor-pointer transition-all shadow-lg"
            >
              <span className="font-mono text-xl font-black text-indigo-300">2 Hours</span>
              <span className="text-xs font-bold mt-0.5">Yesterday</span>
              <span className="text-[10px] text-slate-400 font-mono">Sep 11</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={() => handleQuickRestore(4, 1, 'Yesterday (4 Hours)')}
              className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-400/50 text-amber-200 hover:text-white flex flex-col items-center justify-center text-center cursor-pointer transition-all shadow-lg"
            >
              <span className="font-mono text-xl font-black text-amber-300">4 Hours</span>
              <span className="text-xs font-bold mt-0.5">Yesterday</span>
              <span className="text-[10px] text-slate-400 font-mono">4 Hours Log</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={() => handleQuickRestore(2, 0, 'Today (2 Hours)')}
              className="p-3 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-400/50 text-cyan-200 hover:text-white flex flex-col items-center justify-center text-center cursor-pointer transition-all shadow-lg"
            >
              <span className="font-mono text-xl font-black text-cyan-300">2 Hours</span>
              <span className="text-xs font-bold mt-0.5">Today</span>
              <span className="text-[10px] text-slate-400 font-mono">Quick 2h Entry</span>
            </motion.button>
          </div>
        </div>

        {/* Custom Exact Session Recovery Form */}
        <form onSubmit={handleCustomRecovery} className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-4 shadow-inner">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-300 block">
            Custom Study Session Recovery:
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Study Date:
              </label>
              <input
                type="date"
                value={recoveryDate}
                onChange={(e) => setRecoveryDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl glass-input font-medium"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Study Hours:
              </label>
              <input
                type="number"
                min="0.5"
                max="16"
                step="0.5"
                value={recoveryHours}
                onChange={(e) => setRecoveryHours(parseFloat(e.target.value) || 2)}
                className="w-full px-3 py-2 text-xs rounded-xl glass-input font-medium font-mono"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Subject / Activity:
              </label>
              <select
                value={recoveryActivity}
                onChange={(e) => setRecoveryActivity(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl glass-input font-medium bg-slate-900"
              >
                {activities.map((a) => (
                  <option key={a.id} value={a.name}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <p className="text-[11px] text-slate-400">
              Restoring adds this session to your calendar heatmaps, total focus statistics, and syncs immediately to your phone.
            </p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-black text-xs cursor-pointer shadow-lg transition-all shrink-0"
            >
              Restore &amp; Sync Session
            </motion.button>
          </div>
        </form>

        {recoverySuccessMsg && (
          <p className="text-xs font-bold text-center py-2.5 px-4 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 shadow-inner">
            {recoverySuccessMsg}
          </p>
        )}
      </div>

      {/* =========================================================================
          SECTION 3: STANDARD TIMER SETTINGS & DATA PORTABILITY
          ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Focus Timer Defaults */}
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

        {/* Right Column: Data Sovereignty & Portability */}
        <div className="glass-panel-luxury p-6 lg:p-8 rounded-3xl border border-white/[0.09] space-y-5 shadow-2xl bg-[#090E1C]/80 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-black text-white flex items-center gap-2 border-b border-white/[0.07] pb-3.5 tracking-wide">
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Data Sovereignty &amp; Portability</span>
            </h3>

            <p className="text-xs text-slate-400 leading-relaxed">
              Export your full DayMark database to JSON anytime. You can save it to Google Drive, share between devices, or restore past backups.
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

          {/* Study Focus Profile Setup */}
          <div className="pt-6 border-t border-white/[0.07] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black text-cyan-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Personal Study Focus Profile</span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  Data Analytics, Coding &amp; DSA, Apti, English Practice &amp; Exercise.
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                type="button"
                onClick={() => {
                  loadStudyFocusPreset();
                  setImportStatus('✅ Applied your personal study focus preset (Data Analytics, Coding, Apti, English, Exercise)!');
                }}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-400/50 text-xs font-black cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.25)] hover:bg-cyan-500/30 transition-all"
              >
                Apply Routine
              </motion.button>
            </div>
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

      {/* =========================================================================
          SECTION 4: AUTOMATIC BACKUP VAULT HISTORY (ZERO DATA LOSS SAFETY)
          ========================================================================= */}
      {backupSnapshots.length > 0 && (
        <div className="glass-panel-luxury p-6 lg:p-8 rounded-3xl border border-white/[0.09] space-y-4 shadow-2xl bg-[#090E1C]/80">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Automatic Snapshot Vault ({backupSnapshots.length} Snapshots)</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">
              Auto-saved before every major sync
            </span>
          </div>

          <div className="space-y-2">
            {backupSnapshots.slice(0, 5).map((snap, idx) => (
              <div
                key={snap.id || idx}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 border border-white/10 text-xs"
              >
                <div className="flex items-center gap-3">
                  <History className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="font-bold text-slate-200 block">{snap.formattedDate}</span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {snap.sessionCount} Sessions ({snap.totalHours}h focus) &bull; {snap.habitsCount} Habits
                    </span>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  onClick={() => {
                    const ok = restoreSnapshot(snap.id);
                    if (ok) {
                      setImportStatus(`✅ Restored snapshot from ${snap.formattedDate}!`);
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/15 cursor-pointer transition-all"
                >
                  <RotateCcw className="w-3 h-3 text-amber-400" />
                  <span>Restore</span>
                </motion.button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
