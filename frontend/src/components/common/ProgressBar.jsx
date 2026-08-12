import React from 'react';

export const ProgressBar = ({ progress = 0, showPercent = true, className = '', height = 'h-2' }) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  let colorClass = 'bg-blue-600';
  if (clampedProgress === 100) {
    colorClass = 'bg-emerald-500';
  } else if (clampedProgress < 30) {
    colorClass = 'bg-amber-500';
  }

  return (
    <div className={`w-full ${className}`}>
      {showPercent && (
        <div className="flex justify-between items-center text-xs text-slate-500 mb-1 font-medium">
          <span>Progress Project</span>
          <span className="text-slate-900 font-bold">{clampedProgress}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200 ${height}`}>
        <div
          className={`${colorClass} ${height} rounded-full transition-all duration-500 ease-out shadow-sm`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
};
