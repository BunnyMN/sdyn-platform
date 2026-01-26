import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { mn } from 'date-fns/locale';

// Combine Tailwind classes with clsx
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date in Mongolian
export function formatDate(date: string | Date, formatStr: string = 'yyyy-MM-dd'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr, { locale: mn });
}

// Format date with time
export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'yyyy-MM-dd HH:mm', { locale: mn });
}

// Format relative time (e.g., "2 hours ago")
export function formatRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true, locale: mn });
}

// Format currency (Mongolian Tugrik)
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('mn-MN', {
    style: 'currency',
    currency: 'MNT',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format number with separators
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('mn-MN').format(num);
}

// Format phone number
export function formatPhone(phone: string): string {
  // Format as +976 XX XX XX XX
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 8) {
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 6)} ${cleaned.slice(6, 8)}`;
  }
  if (cleaned.length === 11 && cleaned.startsWith('976')) {
    return `+976 ${cleaned.slice(3, 5)} ${cleaned.slice(5, 7)} ${cleaned.slice(7, 9)} ${cleaned.slice(9, 11)}`;
  }
  return phone;
}

// Truncate text
export function truncate(text: string, length: number = 50): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

// Generate initials from name
export function getInitials(firstName: string, lastName?: string): string {
  const first = firstName ? firstName.charAt(0).toUpperCase() : '';
  const last = lastName ? lastName.charAt(0).toUpperCase() : '';
  return `${first}${last}` || '?';
}

// Status badge color mapping
export const statusColors: Record<string, { bg: string; text: string }> = {
  active: { bg: 'bg-green-500/20', text: 'text-green-400' },
  inactive: { bg: 'bg-gray-500/20', text: 'text-gray-400' },
  pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
  paid: { bg: 'bg-green-500/20', text: 'text-green-400' },
  overdue: { bg: 'bg-red-500/20', text: 'text-red-400' },
  upcoming: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  ongoing: { bg: 'bg-green-500/20', text: 'text-green-400' },
  completed: { bg: 'bg-gray-500/20', text: 'text-gray-400' },
  cancelled: { bg: 'bg-red-500/20', text: 'text-red-400' },
};

// Status text translations
export const statusText: Record<string, string> = {
  active: 'Идэвхтэй',
  inactive: 'Идэвхгүй',
  pending: 'Хүлээгдэж буй',
  paid: 'Төлөгдсөн',
  overdue: 'Хугацаа хэтэрсэн',
  upcoming: 'Удахгүй болох',
  ongoing: 'Явагдаж буй',
  completed: 'Дууссан',
  cancelled: 'Цуцлагдсан',
};

// Get status display
export function getStatusDisplay(status: string): { color: { bg: string; text: string }; text: string } {
  return {
    color: statusColors[status] || { bg: 'bg-gray-500/20', text: 'text-gray-400' },
    text: statusText[status] || status,
  };
}

// Debounce function
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Download file from blob
export function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Validate email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate phone number (Mongolian)
export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 8 || (cleaned.length === 11 && cleaned.startsWith('976'));
}

// Generate random ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Sleep utility for async operations
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
