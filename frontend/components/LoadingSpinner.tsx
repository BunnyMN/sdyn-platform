'use client';

import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  className?: string;
  text?: string;
  fullScreen?: boolean;
}

const sizeClasses: Record<SpinnerSize, string> = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

export default function LoadingSpinner({
  size = 'md',
  className,
  text,
  fullScreen = false,
}: LoadingSpinnerProps) {
  const spinner = (
    <div className={clsx('flex flex-col items-center gap-3', className)}>
      <Loader2 className={clsx('animate-spin text-blue-600', sizeClasses[size])} />
      {text && <p className="text-sm text-gray-500">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
}

// Page-level loading component
export function PageLoader({ text = 'Уншиж байна...' }: { text?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
}

// Inline loading for buttons
export function ButtonLoader() {
  return <Loader2 className="w-4 h-4 animate-spin" />;
}
