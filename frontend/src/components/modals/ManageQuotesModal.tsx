'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sparkles,
  Flame,
  Heart,
  Target,
  Trophy,
  Zap,
  Star,
  Award,
  BookOpen,
  Compass,
  Plus,
  Trash2,
  Edit2,
  Check,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  Quote,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { MotivationalQuote } from '@/types';

interface ManageQuotesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVAILABLE_ICONS = [
  { name: 'Heart', icon: Heart, label: 'Family & Pride' },
  { name: 'Target', icon: Target, label: 'Target / Goal' },
  { name: 'Flame', icon: Flame, label: 'Fire & Passion' },
  { name: 'Sparkles', icon: Sparkles, label: 'Inspiration' },
  { name: 'Trophy', icon: Trophy, label: 'Victory' },
  { name: 'Zap', icon: Zap, label: 'Energy' },
  { name: 'Star', icon: Star, label: 'Excellence' },
  { name: 'Award', icon: Award, label: 'Achievement' },
  { name: 'BookOpen', icon: BookOpen, label: 'Knowledge' },
  { name: 'Compass', icon: Compass, label: 'Direction' },
];

const PRESET_COLORS = [
  { hex: '#F59E0B', label: 'Gold Amber' },
  { hex: '#06B6D4', label: 'Cyan Blue' },
  { hex: '#10B981', label: 'Emerald' },
  { hex: '#8B5CF6', label: 'Purple' },
  { hex: '#EC4899', label: 'Rose' },
  { hex: '#3B82F6', label: 'Royal Blue' },
  { hex: '#F97316', label: 'Orange' },
];

export const ManageQuotesModal: React.FC<ManageQuotesModalProps> = ({ isOpen, onClose }) => {
  const {
    quotes,
    addQuote,
    updateQuote,
    deleteQuote,
    toggleQuoteActive,
    reorderQuotes,
    resetQuotesToDefault,
  } = useApp();

  // Form State
  const [text, setText] = useState('');
  const [category, setCategory] = useState('Parents & Pride');
  const [author, setAuthor] = useState('Self Reminder');
  const [color, setColor] = useState('#F59E0B');
  const [icon, setIcon] = useState('Heart');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormExpanded, setIsFormExpanded] = useState(false);

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

  const handleStartEdit = (quote: MotivationalQuote) => {
    setEditingId(quote.id);
    setText(quote.text);
    setCategory(quote.category || 'General');
    setAuthor(quote.author || 'Self Reminder');
    setColor(quote.color || '#F59E0B');
    setIcon(quote.icon || 'Heart');
    setIsFormExpanded(true);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setText('');
    setCategory('Parents & Pride');
    setAuthor('Self Reminder');
    setColor('#F59E0B');
    setIcon('Heart');
    setIsFormExpanded(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    if (editingId) {
      updateQuote(editingId, {
        text: text.trim(),
        category: category.trim() || 'General',
        author: author.trim() || 'Self Reminder',
        color,
        icon,
      });
      handleCancelEdit();
    } else {
      addQuote({
        text: text.trim(),
        category: category.trim() || 'General',
        author: author.trim() || 'Self Reminder',
        color,
        icon,
        isActive: true,
      });
      setText('');
      setIsFormExpanded(false);
    }
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...quotes];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    reorderQuotes(updated);
  };

  const handleMoveDown = (index: number) => {
    if (index === quotes.length - 1) return;
    const updated = [...quotes];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    reorderQuotes(updated);
  };

  const renderIconComponent = (iconName?: string, className = 'w-4 h-4', style = {}) => {
    const item = AVAILABLE_ICONS.find((i) => i.name === iconName) || AVAILABLE_ICONS[0];
    const IconComp = item.icon;
    return <IconComp className={className} style={style} />;
  };

  const activeCount = quotes.filter((q) => q.isActive).length;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#050811]/85 backdrop-blur-xl animate-fadeIn overflow-y-auto"
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        transition={{ type: 'spring', damping: 26, stiffness: 320 }}
        className="w-full max-w-2xl glass-panel-luxury rounded-3xl border border-white/[0.12] overflow-hidden shadow-2xl flex flex-col bg-[#090E1C]/95 my-auto max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="px-6 py-4.5 border-b border-white/[0.08] flex items-center justify-between bg-slate-900/80 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-md">
              <Quote className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
                Landing Page Motivational Quotes
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold font-mono">
                  {activeCount} Active
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Add, edit, or customize sentences scrolling on your landing banner
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Action Row: Add Button & Reset */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {!isFormExpanded ? (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setText('');
                  setIsFormExpanded(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-extrabold text-xs sm:text-sm shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-98 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Motivational Quote</span>
              </button>
            ) : (
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>{editingId ? 'Edit Quote' : 'New Quote Composer'}</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                if (confirm('Reset all quotes to default inspirational presets?')) {
                  resetQuotesToDefault();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-400 hover:text-slate-200 text-xs font-semibold border border-white/10 transition"
              title="Restore initial default quotes"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
          </div>

          {/* Expandable Form */}
          <AnimatePresence>
            {isFormExpanded && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleSubmit}
                className="glass-panel p-4 sm:p-5 rounded-2xl border border-amber-500/30 bg-amber-950/10 space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Motivational Quote / Sentence <span className="text-amber-400">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="e.g. Jaldi Job Lelo or Mammy & Papa ko Proud feel karwaoo..."
                    className="w-full glass-input rounded-xl p-3 text-sm text-white placeholder-slate-500 resize-none border border-white/15 focus:border-amber-400"
                    required
                    autoFocus
                  />
                  <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
                    <span>Write punchy reminders that keep you focused on your career & family.</span>
                    <span className="font-mono">{text.length} chars</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Category / Tag Badge
                    </label>
                    <input
                      type="text"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="e.g. Parents Pride, Dream Job, Discipline"
                      className="w-full glass-input rounded-xl px-3 py-2 text-xs sm:text-sm text-white border border-white/15 focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Author / Note (Optional)
                    </label>
                    <input
                      type="text"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="e.g. Self Reminder, Mom & Dad"
                      className="w-full glass-input rounded-xl px-3 py-2 text-xs sm:text-sm text-white border border-white/15 focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Color and Icon Picker */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Badge Color Accent
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {PRESET_COLORS.map((c) => (
                        <button
                          key={c.hex}
                          type="button"
                          onClick={() => setColor(c.hex)}
                          className={`w-7 h-7 rounded-lg transition-transform flex items-center justify-center border ${
                            color === c.hex
                              ? 'scale-110 border-white ring-2 ring-white/50'
                              : 'border-transparent opacity-75 hover:opacity-100'
                          }`}
                          style={{ backgroundColor: c.hex }}
                          title={c.label}
                        >
                          {color === c.hex && <Check className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Badge Icon
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {AVAILABLE_ICONS.slice(0, 7).map((item) => {
                        const IconComp = item.icon;
                        const isSelected = icon === item.name;
                        return (
                          <button
                            key={item.name}
                            type="button"
                            onClick={() => setIcon(item.name)}
                            className={`p-2 rounded-xl transition border text-xs flex items-center justify-center ${
                              isSelected
                                ? 'bg-amber-500/30 text-amber-300 border-amber-500/60 shadow-sm'
                                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border-white/10'
                            }`}
                            title={item.label}
                          >
                            <IconComp className="w-4 h-4" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Live Preview */}
                {text.trim() && (
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-white/10 space-y-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Banner Preview:
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-white">
                      <span
                        className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shrink-0"
                        style={{
                          backgroundColor: `${color}25`,
                          color: color,
                          border: `1px solid ${color}50`,
                        }}
                      >
                        {renderIconComponent(icon, 'w-3 h-3')}
                        {category || 'Quote'}
                      </span>
                      <span className="font-semibold italic text-slate-200 truncate">
                        "{text}"
                      </span>
                    </div>
                  </div>
                )}

                {/* Form Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 text-xs font-semibold border border-white/10 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-xs font-extrabold shadow-md hover:brightness-110 active:scale-98 transition"
                  >
                    {editingId ? 'Save Changes' : 'Add Quote to Ticker'}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Quotes List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span>Your Quotes Ticker ({quotes.length})</span>
              <span className="text-[11px] lowercase text-slate-500">
                drag / use arrows to reorder
              </span>
            </div>

            {quotes.length === 0 ? (
              <div className="p-8 text-center glass-panel rounded-2xl border border-white/10 space-y-2">
                <Quote className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-sm font-semibold text-slate-300">No motivational quotes yet</p>
                <p className="text-xs text-slate-500">
                  Add your first quote or click "Reset Defaults" above to load initial motivational quotes.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {quotes.map((q, idx) => {
                  const quoteColor = q.color || '#F59E0B';
                  return (
                    <motion.div
                      key={q.id}
                      layout
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`glass-panel p-3.5 sm:p-4 rounded-2xl border transition-all ${
                        q.isActive
                          ? 'border-white/[0.12] bg-slate-900/60 hover:border-white/20'
                          : 'border-white/[0.05] bg-slate-950/40 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        {/* Quote Content */}
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm"
                              style={{
                                backgroundColor: `${quoteColor}20`,
                                color: quoteColor,
                                border: `1px solid ${quoteColor}40`,
                              }}
                            >
                              {renderIconComponent(q.icon, 'w-3 h-3', { color: quoteColor })}
                              {q.category || 'Mindset'}
                            </span>

                            {q.author && (
                              <span className="text-[11px] text-slate-400 font-medium">
                                &bull; {q.author}
                              </span>
                            )}

                            {!q.isActive && (
                              <span className="text-[10px] font-bold text-slate-500 uppercase px-1.5 py-0.5 rounded bg-slate-800">
                                Hidden
                              </span>
                            )}
                          </div>

                          <p className="text-sm text-slate-100 font-medium leading-relaxed break-words">
                            "{q.text}"
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0 pt-0.5">
                          {/* Reorder Buttons */}
                          <div className="flex flex-col mr-1">
                            <button
                              type="button"
                              onClick={() => handleMoveUp(idx)}
                              disabled={idx === 0}
                              className="p-1 rounded text-slate-500 hover:text-white disabled:opacity-20 transition"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveDown(idx)}
                              disabled={idx === quotes.length - 1}
                              className="p-1 rounded text-slate-500 hover:text-white disabled:opacity-20 transition"
                              title="Move Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Visibility Toggle */}
                          <button
                            type="button"
                            onClick={() => toggleQuoteActive(q.id)}
                            className={`p-2 rounded-xl transition ${
                              q.isActive
                                ? 'text-emerald-400 hover:bg-emerald-500/10'
                                : 'text-slate-500 hover:bg-slate-800'
                            }`}
                            title={q.isActive ? 'Active on banner (click to hide)' : 'Hidden (click to show)'}
                          >
                            {q.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => handleStartEdit(q)}
                            className="p-2 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition"
                            title="Edit Quote"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm('Delete this motivational quote?')) {
                                deleteQuote(q.id);
                              }
                            }}
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                            title="Delete Quote"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-white/[0.08] bg-slate-900/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Changes are automatically saved to your workspace.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
};
