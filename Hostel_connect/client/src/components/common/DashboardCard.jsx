import React from 'react';

const DashboardCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'cyan', // cyan, purple, pink, emerald, amber, rose
  trend,
  trendDirection = 'up',
  onClick,
}) => {
  const colorMap = {
    cyan: {
      bg: 'bg-cyan-500/15',
      text: 'text-cyan-400',
      border: 'border-cyan-500/30',
    },
    purple: {
      bg: 'bg-purple-500/15',
      text: 'text-purple-400',
      border: 'border-purple-500/30',
    },
    pink: {
      bg: 'bg-pink-500/15',
      text: 'text-pink-400',
      border: 'border-pink-500/30',
    },
    indigo: {
      bg: 'bg-purple-500/15',
      text: 'text-purple-400',
      border: 'border-purple-500/30',
    },
    orange: {
      bg: 'bg-pink-500/15',
      text: 'text-pink-400',
      border: 'border-pink-500/30',
    },
    emerald: {
      bg: 'bg-emerald-500/15',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
    },
    amber: {
      bg: 'bg-amber-500/15',
      text: 'text-amber-400',
      border: 'border-amber-500/30',
    },
    rose: {
      bg: 'bg-rose-500/15',
      text: 'text-rose-400',
      border: 'border-rose-500/30',
    },
  };

  const currentTheme = colorMap[color] || colorMap.cyan;

  return (
    <div
      onClick={onClick}
      className={`bg-[#0a0e27]/80 backdrop-blur-xl rounded-2xl p-5 border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] hover:border-cyan-400/50 hover:shadow-[0_10px_35px_-5px_rgba(0,229,255,0.2)] transition-all duration-300 ${
        onClick ? 'cursor-pointer hover:-translate-y-1' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">{title}</p>
          <h3 className="text-2xl font-black text-white tracking-tight">{value}</h3>
        </div>
        {Icon && (
          <div className={`p-3 rounded-2xl border ${currentTheme.bg} ${currentTheme.text} ${currentTheme.border}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 flex items-center text-xs space-x-2">
          {trend && (
            <span
              className={`font-semibold flex items-center ${
                trendDirection === 'up' ? 'text-cyan-400' : 'text-pink-400'
              }`}
            >
              {trendDirection === 'up' ? '↑' : '↓'} {trend}
            </span>
          )}
          {subtitle && <span className="text-zinc-400">{subtitle}</span>}
        </div>
      )}
    </div>
  );
};

export default DashboardCard;
