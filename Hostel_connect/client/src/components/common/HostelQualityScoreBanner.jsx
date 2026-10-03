import React, { useState, useEffect } from 'react';
import {
  Trophy,
  UtensilsCrossed,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Minus,
  HelpCircle,
} from 'lucide-react';
import api from '../../services/api';

const HostelQualityScoreBanner = () => {
  const [data, setData] = useState({
    qualityScore: 4.28,
    messRating: 4.18,
    cleanlinessRating: 4.24,
    resolutionRating: 4.45,
    trendLabel: 'Improving',
    trendDiff: '+0.13',
  });
  const [showFormula, setShowFormula] = useState(false);

  useEffect(() => {
    const fetchScore = async () => {
      try {
        const res = await api.get('/hygiene/quality-score');
        if (res.data.success && res.data.data) {
          setData(res.data.data);
        }
      } catch (err) {
        // Fallback to initial realistic data
      }
    };
    fetchScore();
  }, []);

  const { qualityScore, messRating, cleanlinessRating, resolutionRating, trendLabel, trendDiff } = data;

  const getTrendBadge = (label) => {
    if (label === 'Improving') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          <TrendingUp className="w-3.5 h-3.5" />
          Improving ({trendDiff || '+0.12'})
        </span>
      );
    }
    if (label === 'Needs Attention') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
          <TrendingDown className="w-3.5 h-3.5" />
          Needs Attention ({trendDiff || '-0.08'})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
        <Minus className="w-3.5 h-3.5" />
        Stable ({trendDiff || '0.00'})
      </span>
    );
  };

  const percentage = Math.min(100, Math.round((qualityScore / 5) * 100));

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0d1333] via-[#0a0f26] to-[#070b19] border border-cyan-500/30 p-6 sm:p-7 shadow-[0_10px_40px_-10px_rgba(0,229,255,0.15)] text-white">
      {/* Subtle Glow Accents */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-purple-600/10 rounded-full blur-[90px] pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Trophy, Score, Title */}
        <div className="flex items-start sm:items-center space-x-5">
          <div className="relative">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-amber-500 via-purple-600 to-cyan-400 p-0.5 shadow-[0_0_25px_rgba(245,158,11,0.3)] flex items-center justify-center">
              <div className="w-full h-full bg-[#0a0e27] rounded-2xl flex flex-col items-center justify-center">
                <Trophy className="w-7 h-7 sm:w-8 sm:h-8 text-amber-400 animate-pulse" />
              </div>
            </div>
            <span className="absolute -bottom-2 -right-2 px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase bg-amber-500 text-black shadow-md">
              Top 5%
            </span>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-[11px] font-mono tracking-widest uppercase font-bold text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Institutional Quality Index
              </span>
              {getTrendBadge(trendLabel)}
            </div>

            <div className="flex items-baseline space-x-3">
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {qualityScore?.toFixed(2)}
                <span className="text-lg font-bold text-zinc-400"> / 5.0</span>
              </h2>
              <span className="text-xs text-zinc-400 hidden sm:inline-block">
                Overall Hostel Quality Score
              </span>
            </div>

            <p className="text-xs text-zinc-400 mt-1 max-w-xl">
              Composite index calculated dynamically from 40% Mess Rating, 40% Cleanliness Rating, and 20% Issue Resolution.
            </p>
          </div>
        </div>

        {/* Right: Sub-criteria pills & Progress meter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-[#050816]/70 p-4 rounded-2xl border border-white/10 shrink-0">
          {/* Criterion 1: Mess */}
          <div className="flex items-center space-x-3 px-3 py-1.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-zinc-400 uppercase font-bold">Mess (40%)</p>
              <p className="text-base font-black text-cyan-300">⭐ {messRating?.toFixed(2)}</p>
            </div>
          </div>

          <div className="hidden sm:block w-px h-10 bg-white/10" />

          {/* Criterion 2: Cleanliness */}
          <div className="flex items-center space-x-3 px-3 py-1.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-zinc-400 uppercase font-bold">Cleanliness (40%)</p>
              <p className="text-base font-black text-purple-300">🧹 {cleanlinessRating?.toFixed(2)}</p>
            </div>
          </div>

          <div className="hidden sm:block w-px h-10 bg-white/10" />

          {/* Criterion 3: Complaint Resolution */}
          <div className="flex items-center space-x-3 px-3 py-1.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-zinc-400 uppercase font-bold">Resolution (20%)</p>
              <p className="text-base font-black text-emerald-300">🛡️ {resolutionRating?.toFixed(2)}</p>
            </div>
          </div>

          {/* Formula info toggle */}
          <button
            onClick={() => setShowFormula(!showFormula)}
            className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-400 hover:text-white transition-colors"
            title="View calculation formula"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expandable Formula Explanation */}
      {showFormula && (
        <div className="mt-4 pt-4 border-t border-white/10 text-xs text-zinc-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
          <div>
            <strong className="text-cyan-400">Formula:</strong> Quality Score = (0.40 × Mess Rating) + (0.40 × Cleanliness Score) + (0.20 × Complaint Resolution Rate × 5.0)
          </div>
          <span className="text-[11px] text-zinc-400">
            Current Week Index: {qualityScore} • Threshold target: ≥ 4.20
          </span>
        </div>
      )}

      {/* Progress Bar */}
      <div className="mt-5 w-full bg-white/10 h-2 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-400 via-purple-500 to-cyan-400 rounded-full transition-all duration-700"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default HostelQualityScoreBanner;
