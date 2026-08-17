import React from 'react';
import { LucideIcon } from 'lucide-react';
import CurrencyDisplay from './CurrencyDisplay';

interface StatCardProps {
  title: string;
  value: string | number;
  isCurrency?: boolean;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  subtitle?: string;
  colorScheme?: 'blue' | 'emerald' | 'purple' | 'amber' | 'rose' | 'slate';
  guarded?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  isCurrency = false,
  icon: Icon,
  trend,
  trendUp = true,
  subtitle,
  colorScheme = 'blue',
  guarded = false
}) => {
  const schemeClasses = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    slate: 'bg-slate-700/30 text-slate-300 border-slate-600/30',
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md shadow-xl transition-all duration-300 hover:border-slate-700 hover:shadow-2xl">
      {guarded && (
        <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-mono bg-purple-900/50 text-purple-300 border border-purple-500/30">
          Financial Restricted
        </span>
      )}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            {isCurrency && typeof value === 'number' ? (
              <CurrencyDisplay amount={value} className="text-2xl text-slate-100" />
            ) : (
              <span className="text-2xl font-bold text-slate-100 tracking-tight">{value}</span>
            )}
          </div>
          {(trend || subtitle) && (
            <div className="mt-2 flex items-center gap-1.5 text-xs">
              {trend && (
                <span className={`font-semibold ${trendUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {trendUp ? '↑' : '↓'} {trend}
                </span>
              )}
              {subtitle && <span className="text-slate-400">{subtitle}</span>}
            </div>
          )}
        </div>

        <div className={`p-3.5 rounded-xl border ${schemeClasses[colorScheme]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
