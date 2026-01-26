'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const data = {
      first_name: formData.get('first_name'),
      last_name: formData.get('last_name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      password: formData.get('password'),
    }

    const confirmPassword = formData.get('confirm_password')
    if (data.password !== confirmPassword) {
      setError('Нууц үг таарахгүй байна')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.message || 'Бүртгэл амжилтгүй боллоо')
      }

      const result = await response.json()
      localStorage.setItem('access_token', result.access_token)
      localStorage.setItem('refresh_token', result.refresh_token)
      localStorage.setItem('user', JSON.stringify(result.user))

      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Алдаа гарлаа')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="card p-8">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center space-x-2 mb-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">СД</span>
              </div>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Гишүүн болох</h1>
            <p className="text-gray-600 mt-2">СДЗН-д гишүүнээр элсэх</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Овог
                </label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  required
                  className="input"
                  placeholder="Овог"
                />
              </div>
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Нэр
                </label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  required
                  className="input"
                  placeholder="Нэр"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                И-мэйл хаяг
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="input"
                placeholder="name@example.com"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Утасны дугаар
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                required
                className="input"
                placeholder="99001122"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Нууц үг
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  required
                  minLength={8}
                  className="input pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Хамгийн багадаа 8 тэмдэгт</p>
            </div>

            <div>
              <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-2">
                Нууц үг давтах
              </label>
              <input
                type="password"
                id="confirm_password"
                name="confirm_password"
                required
                className="input"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-start">
              <input
                type="checkbox"
                id="terms"
                required
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1"
              />
              <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                <Link href="/terms" className="text-blue-600 hover:text-blue-700">
                  Үйлчилгээний нөхцөл
                </Link>{' '}
                болон{' '}
                <Link href="/privacy" className="text-blue-600 hover:text-blue-700">
                  Нууцлалын бодлого
                </Link>
                -г зөвшөөрч байна
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Бүртгэж байна...
                </>
              ) : (
                'Бүртгүүлэх'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Бүртгэлтэй юу?{' '}
              <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Нэвтрэх
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
