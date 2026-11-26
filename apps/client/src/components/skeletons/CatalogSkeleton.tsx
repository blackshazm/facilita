import React from 'react';

export function CatalogSkeleton() {
  return (
    <div className="w-full space-y-6 animate-pulse">
      {/* Category Pills Skeleton */}
      <div className="flex gap-2.5 overflow-x-auto pb-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 w-28 bg-slate-800 rounded-xl shrink-0"></div>
        ))}
      </div>

      {/* Service Cards Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 bg-slate-800 rounded-xl"></div>
              <div className="w-16 h-5 bg-slate-800 rounded-full"></div>
            </div>
            <div className="space-y-2">
              <div className="w-3/4 h-4 bg-slate-800 rounded"></div>
              <div className="w-full h-3 bg-slate-850 rounded"></div>
            </div>
            <div className="h-px bg-slate-800"></div>
            <div className="flex justify-between items-center pt-1">
              <div className="w-20 h-5 bg-slate-800 rounded"></div>
              <div className="w-24 h-9 bg-slate-800 rounded-xl"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export default CatalogSkeleton;

