import React from 'react';

export const LoadingCardSkeleton = () => (
  <div className="bg-white border border-slate-200 rounded-2xl p-5 animate-pulse space-y-4 shadow-sm">
    <div className="flex justify-between items-center">
      <div className="h-5 bg-slate-200 rounded w-1/3"></div>
      <div className="h-4 bg-slate-200 rounded w-16"></div>
    </div>
    <div className="h-4 bg-slate-200/70 rounded w-3/4"></div>
    <div className="h-2 bg-slate-100 rounded w-full"></div>
    <div className="flex justify-between items-center pt-2">
      <div className="flex -space-x-2">
        <div className="w-7 h-7 bg-slate-200 rounded-full"></div>
        <div className="w-7 h-7 bg-slate-200 rounded-full"></div>
      </div>
      <div className="h-4 bg-slate-200 rounded w-20"></div>
    </div>
  </div>
);

export const LoadingTableSkeleton = () => (
  <div className="bg-white border border-slate-200 rounded-2xl p-4 animate-pulse space-y-3">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="h-12 bg-slate-100 rounded-xl flex items-center px-4 space-x-4">
        <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
        <div className="h-4 bg-slate-200 rounded flex-1"></div>
        <div className="h-4 bg-slate-200 rounded w-24"></div>
        <div className="h-4 bg-slate-200 rounded w-20"></div>
      </div>
    ))}
  </div>
);
