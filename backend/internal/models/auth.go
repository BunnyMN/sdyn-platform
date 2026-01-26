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
