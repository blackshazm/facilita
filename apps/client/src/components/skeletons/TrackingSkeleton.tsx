import React from 'react';

export function TrackingSkeleton() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col animate-pulse">
      {/* Top Bar Skeleton */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-slate-800 rounded-xl"></div>
          <div>
            <div className="w-32 h-4 bg-slate-800 rounded mb-1"></div>
            <div className="w-20 h-3 bg-slate-850 rounded"></div>
          </div>
        </div>
        <div className="w-24 h-8 bg-slate-800 rounded-full"></div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 md:p-6 max-w-7xl mx-auto w-full">
        {/* Left Column: Live Map Skeleton */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-4 min-h-[380px] lg:min-h-[520px] flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div className="w-48 h-5 bg-slate-800 rounded-lg"></div>
            <div className="w-28 h-4 bg-slate-800 rounded-lg"></div>
          </div>
          {/* Simulated Map Area */}
          <div className="flex-1 bg-slate-950/60 rounded-2xl border border-slate-800/80 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-slate-700">
              <div className="w-12 h-12 rounded-full border-4 border-slate-800 border-t-emerald-500/40 animate-spin"></div>
              <span className="text-xs font-semibold text-slate-500">Conectando ao Radar Geográfico...</span>
            </div>
          </div>
        </div>

        {/* Right Column: Timeline & Provider Card Skeleton */}
        <div className="space-y-6">
          {/* Provider Card Skeleton */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-slate-850 rounded-2xl"></div>
              <div className="space-y-2 flex-1">
                <div className="w-32 h-4 bg-slate-800 rounded"></div>
                <div className="w-24 h-3 bg-slate-850 rounded"></div>
              </div>
            </div>
            <div className="h-px bg-slate-800"></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="h-10 bg-slate-850 rounded-xl"></div>
              <div className="h-10 bg-slate-850 rounded-xl"></div>
            </div>
          </div>

          {/* Timeline Status Skeleton */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="w-36 h-4 bg-slate-800 rounded mb-4"></div>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-800 shrink-0"></div>
                <div className="flex-1 space-y-1.5">
                  <div className="w-3/4 h-3 bg-slate-800 rounded"></div>
                  <div className="w-1/2 h-2.5 bg-slate-850 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
export default TrackingSkeleton;
