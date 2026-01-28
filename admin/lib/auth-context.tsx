'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import {
  getKeycloak,
  initKeycloak,
  login as keycloakLogin,
  logout as keycloakLogout,
  getUserInfo,
  hasRole,
  hasAnyRole,
  isAdmin,
  KeycloakUserInfo,
  ROLES,
  ADMIN_ROLES,
} from './keycloak'

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  user: KeycloakUserInfo | null
  token: string | undefined
  login: (redirectUri?: string) => void
  logout: (redirectUri?: string) => void
  hasRole: (role: string) => boolean
  hasAnyRole: (roles: string[]) => boolean
  isAdmin: boolean
  isNationalAdmin: boolean
  isProvinceAdmin: boolean
  isDistrictAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<KeycloakUserInfo | null>(null)
  const [token, setToken] = useState<string | undefined>(undefined)

  useEffect(() => {
    const init = async () => {
      try {
        const authenticated = await initKeycloak()
        setIsAuthenticated(authenticated)

        if (authenticated) {
          const keycloak = getKeycloak()
          setToken(keycloak.token)
          setUser(getUserInfo())

          // Listen for token updates
          keycloak.onTokenExpired = () => {
            keycloak.updateToken(60).then((refreshed) => {
              if (refreshed) {
                setToken(keycloak.token)
              }
            }).catch(() => {
              keycloakLogout()
            })
          }

          keycloak.onAuthRefreshSuccess = () => {
            setToken(keycloak.token)
          }

          keycloak.onAuthLogout = () => {
            setIsAuthenticated(false)
            setUser(null)
            setToken(undefined)
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    init()
  }, [])

  const login = useCallback((redirectUri?: string) => {
    keycloakLogin(redirectUri)
  }, [])

  const logout = useCallback((redirectUri?: string) => {
    keycloakLogout(redirectUri)
  }, [])

  const checkRole = useCallback((role: string) => {
    return hasRole(role)
  }, [])

  const checkAnyRole = useCallback((roles: string[]) => {
    return hasAnyRole(roles)
  }, [])

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    user,
    token,
    login,
    logout,
    hasRole: checkRole,
    hasAnyRole: checkAnyRole,
    isAdmin: isAuthenticated && isAdmin(),
    isNationalAdmin: isAuthenticated && hasRole(ROLES.NATIONAL_ADMIN),
    isProvinceAdmin: isAuthenticated && hasRole(ROLES.PROVINCE_ADMIN),
    isDistrictAdmin: isAuthenticated && hasRole(ROLES.DISTRICT_ADMIN),
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// HOC for protected admin pages
export function withAdminAuth<P extends object>(
  Component: React.ComponentType<P>,
  requiredRoles?: string[]
) {
  return function ProtectedComponent(props: P) {
    const { isAuthenticated, isLoading, login, hasAnyRole, isAdmin } = useAuth()

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        login()
      }
    }, [isLoading, isAuthenticated, login])

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-dark-900">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-dark-400">Нэвтэрч байна...</p>
          </div>
        </div>
      )
    }

    if (!isAuthenticated) {
      return null
    }

    // Check if user has admin role - required for admin panel
    if (!isAdmin) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-dark-900">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Хандах эрхгүй</h1>
            <p className="text-dark-400 mb-6">
              Админ панелд хандахын тулд удирдлагын эрх шаардлагатай.
              Хэрэв танд асуулт байвал системийн админтай холбогдоно уу.
            </p>
            <button
              onClick={() => login()}
              className="btn-primary"
            >
              Өөр бүртгэлээр нэвтрэх
            </button>
          </div>
        </div>
      )
    }

    // Check for specific required roles if provided
    if (requiredRoles && requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-dark-900">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Хандах эрх хүрэлцэхгүй</h1>
            <p className="text-dark-400">
              Энэ хуудсанд хандахын тулд нэмэлт эрх шаардлагатай байна.
            </p>
          </div>
        </div>
      )
    }

    return <Component {...props} />
  }
}

// Export roles and admin roles for convenience
export { ROLES, ADMIN_ROLES }
