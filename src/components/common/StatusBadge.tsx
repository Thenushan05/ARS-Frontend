import React from 'react';
import { clsx } from 'clsx';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const getBadgeStyle = (val: string) => {
    const s = val.toLowerCase();

    // Green Statuses
    if (['paid', 'completed', 'approved', 'active', 'registered', 'accepted', 'verified'].some(k => s.includes(k))) {
      return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    }

    // Yellow Statuses
    if (['pending', 'part paid', 'waiting', 'interested', 'appointment', 'in progress', 'requested', 'sent'].some(k => s.includes(k))) {
      return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    }

    // Red Statuses
    if (['overdue', 'refused', 'error', 'cancelled', 'rejected', 'expired', 'not interested'].some(k => s.includes(k))) {
      return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
    }

    // Blue Statuses
    if (['processing', 'submitted', 'new lead', 'new case', 'draft'].some(k => s.includes(k))) {
      return 'bg-sky-500/15 text-sky-400 border-sky-500/30';
    }

    // Grey Default / Inactive / Closed
    return 'bg-slate-700/50 text-slate-300 border-slate-600/40';
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border backdrop-blur-sm transition-all',
        getBadgeStyle(status),
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-75" />
      {status}
    </span>
  );
};

export default StatusBadge;
