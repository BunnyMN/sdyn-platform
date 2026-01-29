'use client';

import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { ButtonLoader } from './LoadingSpinner';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: ModalSize;
  showCloseButton?: boolean;
}

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
}: ModalProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={clsx(
            'relative w-full bg-white rounded-lg shadow-xl transform transition-all',
            sizeClasses[size]
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              {title && (
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              )}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="p-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

// Form field component
interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}

export function FormField({ label, required, error, children }: FormFieldProps) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

// Modal footer with action buttons
interface ModalFooterProps {
  onCancel: () => void;
  onConfirm: () => void;
  cancelText?: string;
  confirmText?: string;
  isLoading?: boolean;
  confirmVariant?: 'primary' | 'danger';
}

export function ModalFooter({
  onCancel,
  onConfirm,
  cancelText = 'Болих',
  confirmText = 'Хадгалах',
  isLoading = false,
  confirmVariant = 'primary',
}: ModalFooterProps) {
  return (
    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-4">
      <button
        type="button"
        onClick={onCancel}
        disabled={isLoading}
        className="btn-outline"
      >
        {cancelText}
      </button>
      <button
        type="button"
        onClick={onConfirm}
        disabled={isLoading}
        className={clsx(
          'flex items-center gap-2',
          confirmVariant === 'primary' ? 'btn-primary' : 'btn-danger'
        )}
      >
        {isLoading && <ButtonLoader />}
        {confirmText}
      </button>
    </div>
  );
}
