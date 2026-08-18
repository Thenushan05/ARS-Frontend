import React from 'react';
import { clsx } from 'clsx';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const getBadgeStyle = (val: string) => {
    const s = val.trim().toLowerCase();

    // 1. GREEN = Paid / Approved / Completed / Verified
    if (['paid', 'approved', 'completed', 'verified', 'accepted'].some(k => s === k || s.includes(k))) {
      return 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
    }

    // 2. YELLOW = Pending / Part Paid / Action Required
    if (['pending', 'part paid', 'waiting', 'action required', 'rescheduled'].some(k => s === k || s.includes(k))) {
      return 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800';
    }

    // 3. RED = Refused / Overdue / Error / Rejected
    if (['refused', 'overdue', 'error', 'rejected', 'failed'].some(k => s === k || s.includes(k))) {
      return 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800';
    }

    // 4. BLUE = Active / Processing / In Progress / Scheduled / Requested
    if (['active', 'processing', 'in progress', 'scheduled', 'requested', 'submitted', 'new'].some(k => s === k || s.includes(k))) {
      return 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-sky-300 border-blue-300 dark:border-blue-800';
    }

    // 5. GREY = Closed / Cancelled / Inactive / Expired
    return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700';
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border transition-all whitespace-nowrap',
        getBadgeStyle(status),
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80 shrink-0" />
      {status}
    </span>
  );
};

export default StatusBadge;
