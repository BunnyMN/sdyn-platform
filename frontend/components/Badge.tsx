'use client';

import { clsx } from 'clsx';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'secondary';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  danger: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
  secondary: 'bg-purple-100 text-purple-800',
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  className,
}: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded-full',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </span>
  );
}

// Helper function to get badge variant from status
export function getStatusBadgeVariant(status: string): BadgeVariant {
  const statusMap: Record<string, BadgeVariant> = {
    active: 'success',
    pending: 'warning',
    inactive: 'secondary',
    suspended: 'danger',
    expired: 'danger',
    paid: 'success',
    overdue: 'danger',
    upcoming: 'info',
    ongoing: 'success',
    completed: 'secondary',
    cancelled: 'danger',
    draft: 'default',
  };
  return statusMap[status] || 'default';
}

// Helper function to get Mongolian status label
export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    active: 'Идэвхтэй',
    pending: 'Хүлээгдэж буй',
    inactive: 'Идэвхгүй',
    suspended: 'Түр зогсоосон',
    expired: 'Хугацаа дууссан',
    paid: 'Төлөгдсөн',
    overdue: 'Хугацаа хэтэрсэн',
    upcoming: 'Удахгүй болох',
    ongoing: 'Явагдаж буй',
    completed: 'Дууссан',
    cancelled: 'Цуцлагдсан',
    draft: 'Ноорог',
  };
  return labels[status] || status;
}
