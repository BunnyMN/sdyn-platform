'use client'

import Keycloak from 'keycloak-js'

// Keycloak configuration
const keycloakConfig = {
  url: process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'https://auth.e-sdy.mn',
  realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'sdyn',
  clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'sdyn-web',
}

// Singleton instance
let keycloakInstance: Keycloak | null = null

export function getKeycloak(): Keycloak {
  if (typeof window === 'undefined') {
    throw new Error('Keycloak can only be initialized on the client side')
  }

  if (!keycloakInstance) {
    keycloakInstance = new Keycloak(keycloakConfig)
  }

  return keycloakInstance
}

// Initialize Keycloak
export async function initKeycloak(): Promise<boolean> {
  const keycloak = getKeycloak()

  try {
    const authenticated = await keycloak.init({
      onLoad: 'check-sso',
      silentCheckSsoRedirectUri: typeof window !== 'undefined'
        ? `${window.location.origin}/silent-check-sso.html`
        : undefined,
      pkceMethod: 'S256',
      checkLoginIframe: false,
    })

    if (authenticated) {
      // Set up token refresh
      setupTokenRefresh(keycloak)
    }

    return authenticated
  } catch (error) {
    console.error('Failed to initialize Keycloak:', error)
    return false
  }
}

// Setup automatic token refresh
function setupTokenRefresh(keycloak: Keycloak) {
  // Refresh token 60 seconds before it expires
  setInterval(async () => {
    if (keycloak.token && keycloak.isTokenExpired(60)) {
      try {
        await keycloak.updateToken(60)
      } catch (error) {
        console.error('Failed to refresh token:', error)
        keycloak.logout()
      }
    }
  }, 30000) // Check every 30 seconds
}

// Login function
export function login(redirectUri?: string) {
  const keycloak = getKeycloak()
  keycloak.login({
    redirectUri: redirectUri || window.location.origin + '/dashboard',
  })
}

// Logout function
export function logout(redirectUri?: string) {
  const keycloak = getKeycloak()
  keycloak.logout({
    redirectUri: redirectUri || window.location.origin,
  })
}

// Get access token
export function getToken(): string | undefined {
  const keycloak = getKeycloak()
  return keycloak.token
}

// Check if authenticated
export function isAuthenticated(): boolean {
  const keycloak = getKeycloak()
  return !!keycloak.authenticated
}

// Get user info from token
export function getUserInfo(): KeycloakUserInfo | null {
  const keycloak = getKeycloak()

  if (!keycloak.tokenParsed) {
    return null
  }

  const token = keycloak.tokenParsed as any

  return {
    id: token.sub,
    username: token.preferred_username,
    email: token.email,
    firstName: token.given_name,
    lastName: token.family_name,
    fullName: token.name,
    emailVerified: token.email_verified,
    roles: token.realm_access?.roles || [],
  }
}

// Check if user has a specific role
export function hasRole(role: string): boolean {
  const keycloak = getKeycloak()
  return keycloak.hasRealmRole(role)
}

// Check if user has any of the specified roles
export function hasAnyRole(roles: string[]): boolean {
  return roles.some(role => hasRole(role))
}

// User info type
export interface KeycloakUserInfo {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  fullName: string
  emailVerified: boolean
  roles: string[]
}

// Role constants
export const ROLES = {
  NATIONAL_ADMIN: 'national_admin',
  PROVINCE_ADMIN: 'province_admin',
  DISTRICT_ADMIN: 'district_admin',
  MEMBER: 'member',
} as const

// Check if user is admin (any level)
export function isAdmin(): boolean {
  return hasAnyRole([ROLES.NATIONAL_ADMIN, ROLES.PROVINCE_ADMIN, ROLES.DISTRICT_ADMIN])
}

// Check if user is national admin
export function isNationalAdmin(): boolean {
  return hasRole(ROLES.NATIONAL_ADMIN)
}
