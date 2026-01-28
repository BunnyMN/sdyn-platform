'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

export default function LoginPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading, login } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        // Already logged in, redirect to dashboard
        router.push('/dashboard')
      } else {
        // Not logged in, redirect to Keycloak
        login()
      }
    }
  }, [isLoading, isAuthenticated, router, login])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-white font-bold text-2xl">СД</span>
        </div>
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Нэвтрэх хуудас руу шилжүүлж байна...</span>
        </div>
      </div>
    </div>
  )
}
