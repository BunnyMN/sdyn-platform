package models

import (
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=6"`
}

type RegisterRequest struct {
	Email     string `json:"email" validate:"required,email"`
	Password  string `json:"password" validate:"required,min=8"`
	FirstName string `json:"first_name" validate:"required,min=2,max=100"`
	LastName  string `json:"last_name" validate:"required,min=2,max=100"`
	Phone     string `json:"phone" validate:"required"`
}

type AuthResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int64  `json:"expires_in"`
	TokenType    string `json:"token_type"`
	User         *User  `json:"user"`
}

type User struct {
	ID             uuid.UUID `json:"id"`
	MemberID       string    `json:"member_id"`
	Email          string    `json:"email"`
	FirstName      string    `json:"first_name"`
	LastName       string    `json:"last_name"`
	Phone          *string   `json:"phone,omitempty"`
	OrganizationID *string   `json:"organization_id,omitempty"`
	Roles          []string  `json:"roles"`
	AvatarURL      *string   `json:"avatar_url,omitempty"`
}

type RefreshTokenRequest struct {
	RefreshToken string `json:"refresh_token" validate:"required"`
}

type JWTClaims struct {
	UserID         string   `json:"user_id"`
	MemberID       string   `json:"member_id"`
	Email          string   `json:"email"`
	Roles          []string `json:"roles"`
	OrganizationID *string  `json:"organization_id,omitempty"`
	jwt.RegisteredClaims
}

// KeycloakClaims represents the JWT claims from Keycloak tokens
type KeycloakClaims struct {
	// Standard OIDC claims
	Subject           string `json:"sub"`
	Issuer            string `json:"iss"`
	AuthorizedParty   string `json:"azp"`
	Email             string `json:"email"`
	EmailVerified     bool   `json:"email_verified"`
	PreferredUsername string `json:"preferred_username"`
	Name              string `json:"name"`
	GivenName         string `json:"given_name"`
	FamilyName        string `json:"family_name"`

	// Keycloak-specific claims
	RealmAccess   RealmAccess   `json:"realm_access"`
	ResourceAccess map[string]ResourceAccess `json:"resource_access"`

	// Custom SDYN claims (set via Keycloak mappers)
	MemberID       string  `json:"member_id,omitempty"`
	OrganizationID *string `json:"organization_id,omitempty"`

	jwt.RegisteredClaims
}

// RealmAccess contains realm-level roles
type RealmAccess struct {
	Roles []string `json:"roles"`
}

// ResourceAccess contains client-level roles
type ResourceAccess struct {
	Roles []string `json:"roles"`
}

// GetRoles returns all roles from realm and resource access
func (c *KeycloakClaims) GetRoles() []string {
	roleSet := make(map[string]struct{})

	// Add realm roles
	for _, role := range c.RealmAccess.Roles {
		roleSet[role] = struct{}{}
	}

	// Add client roles (from sdyn-api client)
	if clientAccess, ok := c.ResourceAccess["sdyn-api"]; ok {
		for _, role := range clientAccess.Roles {
			roleSet[role] = struct{}{}
		}
	}

	// Convert to slice
	roles := make([]string, 0, len(roleSet))
	for role := range roleSet {
		roles = append(roles, role)
	}

	return roles
}

// HasRole checks if the user has a specific role
func (c *KeycloakClaims) HasRole(role string) bool {
	for _, r := range c.GetRoles() {
		if r == role || r == "national_admin" {
			return true
		}
	}
	return false
}

// HasAnyRole checks if the user has any of the specified roles
func (c *KeycloakClaims) HasAnyRole(roles ...string) bool {
	for _, role := range roles {
		if c.HasRole(role) {
			return true
		}
	}
	return false
}

type ChangePasswordRequest struct {
	CurrentPassword string `json:"current_password" validate:"required"`
	NewPassword     string `json:"new_password" validate:"required,min=8"`
}

type ResetPasswordRequest struct {
	Email string `json:"email" validate:"required,email"`
}

type ConfirmResetPasswordRequest struct {
	Token       string `json:"token" validate:"required"`
	NewPassword string `json:"new_password" validate:"required,min=8"`
}
