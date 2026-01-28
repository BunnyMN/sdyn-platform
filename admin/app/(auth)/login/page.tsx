'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, login, isAdmin } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && isAdmin) {
        // Already authenticated as admin, redirect to dashboard
        router.push('/dashboard');
      } else if (!isAuthenticated) {
        // Not authenticated, redirect to Keycloak
        login();
      }
    }
  }, [isLoading, isAuthenticated, isAdmin, login, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900 px-4">
      <div className="w-full max-w-md">
        <div className="card p-8">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-xl mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              СДЗН Админ
            </h1>
            <p className="text-dark-400">
              Удирдлагын системд нэвтэрч байна...
            </p>
          </div>

          {/* Loading State */}
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
            <p className="text-dark-300 text-sm">
              Нэвтрэлтийн хуудас руу шилжүүлж байна...
            </p>
          </div>

          {/* Manual Login Button (fallback) */}
          <div className="mt-8">
            <button
              onClick={() => login()}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              Нэвтрэх
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-dark-500 text-sm mt-8">
          2024 СДЗН. Бүх эрх хуулиар хамгаалагдсан.
        </p>
      </div>
    </div>
  );
}
