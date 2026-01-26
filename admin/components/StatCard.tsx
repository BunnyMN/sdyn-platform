'use client';

import { LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
}

export default function StatCard({
  title,
  value,
  change,
  icon: Icon,
  iconColor = 'text-primary-400',
  iconBgColor = 'bg-primary-500/20',
}: StatCardProps) {
  return (
    <div className="card p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-dark-400 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-white mt-2">{value}</p>
          {change && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={clsx(
                  'text-sm font-medium',
                  change.type === 'increase' ? 'text-green-400' : 'text-red-400'
                )}
              >
                {change.type === 'increase' ? '+' : '-'}
                {Math.abs(change.value)}%
              </span>
              <span className="text-dark-500 text-sm">өмнөх сараас</span>
            </div>
          )}
        </div>
        <div className={clsx('p-3 rounded-xl', iconBgColor)}>
          <Icon className={clsx('w-6 h-6', iconColor)} />
        </div>
      </div>
    </div>
  );
}
