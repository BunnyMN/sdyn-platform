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

// HOC for protected pages
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requiredRoles?: string[]
) {
  return function ProtectedComponent(props: P) {
    const { isAuthenticated, isLoading, login, hasAnyRole } = useAuth()

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        login()
      }
    }, [isLoading, isAuthenticated, login])

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )
    }

    if (!isAuthenticated) {
      return null
    }

    if (requiredRoles && requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Хандах эрхгүй</h1>
            <p className="text-gray-600">Энэ хуудсанд хандах эрх танд байхгүй байна.</p>
          </div>
        </div>
      )
    }

    return <Component {...props} />
  }
}
