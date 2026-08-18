import React from 'react';

interface LoadingSkeletonProps {
  rows?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ rows = 4 }) => {
  return (
    <div className="w-full space-y-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/50 p-4 animate-pulse">
      <div className="h-8 w-1/4 rounded bg-slate-200 dark:bg-slate-800" />
      <div className="space-y-2 pt-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="h-10 w-full rounded bg-slate-200/70 dark:bg-slate-800/60" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoadingSkeleton;
