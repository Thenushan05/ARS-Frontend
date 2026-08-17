import React from 'react';

interface CurrencyDisplayProps {
  amount: number;
  currency?: string;
  className?: string;
  showSign?: boolean;
}

export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  amount,
  currency = 'LKR',
  className = '',
  showSign = false
}) => {
  const formatted = new Intl.NumberFormat('en-LK', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));

  const sign = showSign && amount > 0 ? '+' : amount < 0 ? '-' : '';

  return (
    <span className={`font-semibold tracking-tight ${className}`}>
      <span className="text-xs text-slate-400 font-normal mr-1">{currency}</span>
      {sign}{formatted}
    </span>
  );
};

export default CurrencyDisplay;
