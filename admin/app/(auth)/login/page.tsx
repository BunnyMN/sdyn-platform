'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Mail, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // TODO: Implement actual authentication with Keycloak
      // For now, simulate login
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (email === 'admin@sdyn.mn' && password === 'admin123') {
        localStorage.setItem('admin_token', 'demo_token');
        router.push('/dashboard');
      } else {
        setError('И-мэйл эсвэл нууц үг буруу байна');
      }
    } catch (err) {
      setError('Нэвтрэхэд алдаа гарлаа. Дахин оролдоно уу.');
    } finally {
      setIsLoading(false);
    }
  };

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
              Удирдлагын системд нэвтрэх
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-dark-200 mb-2">
                И-мэйл хаяг
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-11"
                  placeholder="admin@sdyn.mn"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-dark-200 mb-2">
                Нууц үг
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-11 pr-11"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 bg-dark-700 border-dark-600 rounded text-primary-600 focus:ring-primary-500 focus:ring-offset-dark-900"
                />
                <span className="ml-2 text-sm text-dark-300">Намайг сана</span>
              </label>
              <a href="#" className="text-sm text-primary-400 hover:text-primary-300">
                Нууц үг мартсан?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Нэвтэрч байна...
                </>
              ) : (
                'Нэвтрэх'
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-dark-700/50 rounded-lg">
            <p className="text-xs text-dark-400 text-center mb-2">Туршилтын хандалт:</p>
            <p className="text-xs text-dark-300 text-center">
              И-мэйл: admin@sdyn.mn | Нууц үг: admin123
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-dark-500 text-sm mt-8">
          © 2024 СДЗН. Бүх эрх хуулиар хамгаалагдсан.
        </p>
      </div>
    </div>
  );
}
