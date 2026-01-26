package services

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
	"golang.org/x/crypto/bcrypt"

	"github.com/sdyn/backend/internal/config"
	"github.com/sdyn/backend/internal/models"
)

type AuthService struct {
	cfg   *config.Config
	redis *redis.Client
}

func NewAuthService(cfg *config.Config, redis *redis.Client) *AuthService {
	return &AuthService{
		cfg:   cfg,
		redis: redis,
	}
}

func (s *AuthService) Login(ctx context.Context, req *models.LoginRequest) (*models.AuthResponse, error) {
	// In a real implementation, this would validate against Keycloak or the database
	// For now, return a stub implementation

	// Generate tokens
	accessToken, err := s.generateAccessToken(&models.User{
		ID:        uuid.New(),
		MemberID:  "SDYN-2024-00001",
		Email:     req.Email,
		FirstName: "Demo",
		LastName:  "User",
		Roles:     []string{"member"},
	})
	if err != nil {
		return nil, err
	}

	refreshToken, err := s.generateRefreshToken()
	if err != nil {
		return nil, err
	}

	return &models.AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresIn:    3600,
		TokenType:    "Bearer",
		User: &models.User{
			ID:        uuid.New(),
			MemberID:  "SDYN-2024-00001",
			Email:     req.Email,
			FirstName: "Demo",
			LastName:  "User",
			Roles:     []string{"member"},
		},
	}, nil
}

func (s *AuthService) Register(ctx context.Context, req *models.RegisterRequest) (*models.AuthResponse, error) {
	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	// In a real implementation, this would create the user in Keycloak and database
	_ = hashedPassword

	user := &models.User{
		ID:        uuid.New(),
		MemberID:  fmt.Sprintf("SDYN-%d-%05d", time.Now().Year(), 1),
		Email:     req.Email,
		FirstName: req.FirstName,
		LastName:  req.LastName,
		Phone:     &req.Phone,
		Roles:     []string{"member"},
	}

	// Generate tokens
	accessToken, err := s.generateAccessToken(user)
	if err != nil {
		return nil, err
	}

	refreshToken, err := s.generateRefreshToken()
	if err != nil {
		return nil, err
	}

	return &models.AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresIn:    3600,
		TokenType:    "Bearer",
		User:         user,
	}, nil
}

func (s *AuthService) RefreshToken(ctx context.Context, refreshToken string) (*models.AuthResponse, error) {
	// Validate refresh token from Redis
	userID, err := s.redis.Get(ctx, "refresh:"+refreshToken).Result()
	if err != nil {
		return nil, fmt.Errorf("invalid refresh token")
	}

	// In a real implementation, fetch user from database
	user := &models.User{
		ID:        uuid.MustParse(userID),
		MemberID:  "SDYN-2024-00001",
		Email:     "user@example.com",
		FirstName: "Demo",
		LastName:  "User",
		Roles:     []string{"member"},
	}

	// Generate new access token
	accessToken, err := s.generateAccessToken(user)
	if err != nil {
		return nil, err
	}

	// Generate new refresh token
	newRefreshToken, err := s.generateRefreshToken()
	if err != nil {
		return nil, err
	}

	// Store new refresh token
	s.redis.Set(ctx, "refresh:"+newRefreshToken, userID, 7*24*time.Hour)

	// Delete old refresh token
	s.redis.Del(ctx, "refresh:"+refreshToken)

	return &models.AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: newRefreshToken,
		ExpiresIn:    3600,
		TokenType:    "Bearer",
		User:         user,
	}, nil
}

func (s *AuthService) Logout(ctx context.Context, authHeader string) error {
	// Add token to blacklist
	// In a real implementation, extract token and add to Redis blacklist
	return nil
}

func (s *AuthService) ChangePassword(ctx context.Context, userID string, req *models.ChangePasswordRequest) error {
	// In a real implementation, validate current password and update in Keycloak
	return nil
}

func (s *AuthService) InitiatePasswordReset(ctx context.Context, email string) error {
	// Generate reset token
	token, err := s.generateRefreshToken()
	if err != nil {
		return err
	}

	// Store token with expiry
	s.redis.Set(ctx, "reset:"+token, email, 1*time.Hour)

	// In a real implementation, send email with reset link
	return nil
}

func (s *AuthService) ConfirmPasswordReset(ctx context.Context, req *models.ConfirmResetPasswordRequest) error {
	// Validate token
	email, err := s.redis.Get(ctx, "reset:"+req.Token).Result()
	if err != nil {
		return fmt.Errorf("invalid or expired reset token")
	}

	// Hash new password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	// In a real implementation, update password in Keycloak
	_ = email
	_ = hashedPassword

	// Delete reset token
	s.redis.Del(ctx, "reset:"+req.Token)

	return nil
}

func (s *AuthService) generateAccessToken(user *models.User) (string, error) {
	claims := models.JWTClaims{
		UserID:   user.ID.String(),
		MemberID: user.MemberID,
		Email:    user.Email,
		Roles:    user.Roles,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    "sdyn-api",
			Subject:   user.ID.String(),
		},
	}

	if user.OrganizationID != nil {
		claims.OrganizationID = user.OrganizationID
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.cfg.JWTSecret))
}

func (s *AuthService) generateRefreshToken() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(b), nil
}
