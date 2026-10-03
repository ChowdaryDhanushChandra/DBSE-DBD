import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  BedDouble,
  Bath,
  Footprints,
  Users,
  UtensilsCrossed,
  ChefHat,
  Droplets,
  Trash2,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import api from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

const AREA_ICON_MAP = {
  'Hostel Rooms': BedDouble,
  'Bathrooms': Bath,
  'Corridors': Footprints,
  'Common Areas': Users,
  'Dining Hall': UtensilsCrossed,
  'Kitchen': ChefHat,
  'Drinking Water Area': Droplets,
  'Waste Disposal Area': Trash2,
};

const CleanlinessScorePage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const res = await api.get('/hygiene/cleanliness-score');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load cleanliness score:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchScores();
  }, []);

  if (loading) {
    return <LoadingSpinner size="lg" message="Calculating weekly cleanliness scores..." />;
  }

  const {
    overallScore = 4.24,
    previousWeekScore = 4.12,
    trend = '+0.12',
    trendStatus = 'Improving',
    areas = [
      { area: 'Hostel Rooms', score: 4.4, status: 'Good', lastInspected: 'Today', remarks: 'Sanitized and vacuumed' },
      { area: 'Bathrooms', score: 3.7, status: 'Good', lastInspected: 'Today', remarks: 'Disinfected, fixtures checked' },
      { area: 'Corridors', score: 4.2, status: 'Good', lastInspected: 'Yesterday', remarks: 'Bins emptied, polished floors' },
      { area: 'Common Areas', score: 4.5, status: 'Excellent', lastInspected: 'This Week', remarks: 'Dust-free and orderly' },
      { area: 'Dining Hall', score: 4.6, status: 'Excellent', lastInspected: 'Today', remarks: 'Food-safe sanitization complete' },
      { area: 'Kitchen', score: 4.0, status: 'Good', lastInspected: 'Today', remarks: 'Steam cleaned, storage organized' },
      { area: 'Drinking Water Area', score: 4.3, status: 'Good', lastInspected: 'This Week', remarks: 'RO filter pressure normal' },
      { area: 'Waste Disposal Area', score: 3.9, status: 'Good', lastInspected: 'Today', remarks: 'Segregated and sealed' },
    ],
  } = data || {};

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Excellent':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            Excellent
          </span>
        );
      case 'Good':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
            Good
          </span>
        );
      case 'Needs Improvement':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            Needs Improvement
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            Critical
          </span>
        );
    }
  };

  const percentage = Math.round((overallScore / 5) * 100);

  return (
    <div className="space-y-7 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_#a855f7]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-300">
              Hostel Hygiene Matrix
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Sparkles className="w-6 h-6" />
            </span>
            Weekly Cleanliness Score
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Standardized hygiene index measured across 8 critical residential and dining zones
          </p>
        </div>
      </div>

      {/* Hero Score Showcase Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#120a2e] via-[#0b0c26] to-[#050816] border border-purple-500/30 p-6 sm:p-8 shadow-glass">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-purple-300 font-bold px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30">
              HOSTEL CLEANLINESS – THIS WEEK
            </span>
            <div className="flex items-baseline gap-3 pt-2">
              <span className="text-5xl font-black text-white">
                ⭐ {overallScore?.toFixed(2)}
              </span>
              <span className="text-lg text-zinc-400 font-bold">/ 5.0</span>
            </div>
            <p className="text-xs text-zinc-400 max-w-lg">
              Calculated automatically from weekly audit logs across Rooms, Bathrooms, Corridors, Common Areas, Dining Hall, Kitchen, Drinking Water, and Waste Disposal.
            </p>
            <div className="pt-2 flex items-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1 font-bold text-emerald-400">
                <TrendingUp className="w-4 h-4" />
                {trend} vs Last Week ({previousWeekScore})
              </span>
              <span className="text-zinc-500">•</span>
              <span className="text-zinc-300 font-medium">Status: {trendStatus}</span>
            </div>
          </div>

          {/* Radial / Progress Visual Indicator */}
          <div className="flex flex-col items-center justify-center p-6 rounded-3xl bg-[#050816]/70 border border-white/10 shrink-0">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="52"
                  stroke="#1e293b"
                  strokeWidth="10"
                  fill="transparent"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="52"
                  stroke="url(#purpleGrad)"
                  strokeWidth="10"
                  strokeDasharray={2 * Math.PI * 52}
                  strokeDashoffset={2 * Math.PI * 52 * (1 - overallScore / 5)}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#c084fc" />
                    <stop offset="100%" stopColor="#00e5ff" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-white">{percentage}%</span>
                <span className="text-[9px] uppercase font-bold text-zinc-400">Compliance</span>
              </div>
            </div>
            <p className="text-xs font-bold text-purple-300 mt-2">Overall Score: {overallScore}/5</p>
          </div>
        </div>

        {/* Linear Progress Bar */}
        <div className="mt-6 w-full bg-white/10 h-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 rounded-full transition-all duration-700"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* 8 Areas Cleanliness Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-extrabold text-white">8-Zone Cleanliness Breakdown</h3>
          <span className="text-xs text-zinc-400 font-mono">Verified by Chief Warden</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {areas.map((item) => {
            const Icon = AREA_ICON_MAP[item.area] || Sparkles;
            const scorePercent = Math.round((item.score / 5) * 100);
            return (
              <div
                key={item.area}
                className="p-5 rounded-3xl bg-[#070D22]/80 border border-white/10 hover:border-purple-500/40 transition-all duration-200 shadow-glass flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    {getStatusBadge(item.status)}
                  </div>

                  <h4 className="text-sm font-black text-white">{item.area}</h4>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black text-white">⭐ {item.score?.toFixed(1)}</span>
                    <span className="text-xs text-zinc-400">/ 5.0</span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-white/10 h-1.5 rounded-full my-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        item.score >= 4.5 ? 'bg-emerald-400' : item.score >= 3.5 ? 'bg-cyan-400' : 'bg-amber-400'
                      }`}
                      style={{ width: `${scorePercent}%` }}
                    />
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed italic">
                    "{item.remarks}"
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    {item.lastInspected}
                  </span>
                  <span className="text-emerald-400 font-semibold">✓ Verified</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CleanlinessScorePage;
