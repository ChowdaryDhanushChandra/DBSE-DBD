import React from 'react';

export const LoadingSpinner = ({ size = 'md', message = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="relative">
        <div
          className={`${sizeClasses[size]} border-cyan-500/20 border-t-cyan-400 border-r-purple-500 rounded-full animate-spin shadow-[0_0_15px_rgba(0,229,255,0.4)]`}
        />
        <div className="absolute inset-0 rounded-full blur-sm bg-cyan-400/20 animate-pulse" />
      </div>
      {message && <p className="mt-3 text-xs tracking-wider uppercase text-cyan-300/80 font-medium">{message}</p>}
    </div>
  );
};

export const EmptyState = ({
  icon: Icon,
  title = 'No records found',
  description = 'There are no items matching your criteria at this moment.',
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-[#070D22]/80 backdrop-blur-md rounded-2xl border border-dashed border-cyan-500/20 shadow-glass">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4 shadow-[0_0_20px_rgba(0,229,255,0.2)]">
          <Icon className="w-7 h-7" />
        </div>
      )}
      <h3 className="text-base font-bold text-white tracking-wide">{title}</h3>
      <p className="mt-1 text-sm text-slate-400 max-w-sm">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-4 inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white text-sm font-semibold rounded-xl transition-all shadow-[0_0_15px_rgba(0,229,255,0.3)] hover:shadow-[0_0_20px_rgba(0,229,255,0.5)] cursor-pointer"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
