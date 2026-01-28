package middleware

import (
	"context"
	"crypto/rsa"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"math/big"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/rs/zerolog/log"

	"github.com/sdyn/backend/internal/config"
	"github.com/sdyn/backend/internal/models"
)

// JWKS represents JSON Web Key Set
type JWKS struct {
	Keys []JWK `json:"keys"`
}

// JWK represents a JSON Web Key
type JWK struct {
	Kid string `json:"kid"`
	Kty string `json:"kty"`
	Alg string `json:"alg"`
	Use string `json:"use"`
	N   string `json:"n"`
	E   string `json:"e"`
}

// KeycloakValidator manages Keycloak JWT validation
type KeycloakValidator struct {
	jwksURL      string
	issuer       string
	clientID     string
	keys         map[string]*rsa.PublicKey
	keysMutex    sync.RWMutex
	lastFetch    time.Time
	cacheTTL     time.Duration
	httpClient   *http.Client
}

// NewKeycloakValidator creates a new Keycloak JWT validator
func NewKeycloakValidator(cfg *config.Config) (*KeycloakValidator, error) {
	if cfg.KeycloakURL == "" || cfg.KeycloakRealm == "" {
		return nil, errors.New("keycloak URL and realm are required")
	}

	// Use internal URL for JWKS fetching (within Docker network)
	keycloakInternalURL := cfg.KeycloakURL
	if keycloakInternalURL == "https://auth.e-sdy.mn" {
		keycloakInternalURL = "http://keycloak:8080"
	}

	jwksURL := fmt.Sprintf("%s/realms/%s/protocol/openid-connect/certs", keycloakInternalURL, cfg.KeycloakRealm)
	issuer := fmt.Sprintf("%s/realms/%s", cfg.KeycloakURL, cfg.KeycloakRealm)

	validator := &KeycloakValidator{
		jwksURL:    jwksURL,
		issuer:     issuer,
		clientID:   cfg.KeycloakClientID,
		keys:       make(map[string]*rsa.PublicKey),
		cacheTTL:   1 * time.Hour,
		httpClient: &http.Client{Timeout: 10 * time.Second},
	}

	// Initial key fetch
	if err := validator.refreshKeys(); err != nil {
		log.Warn().Err(err).Msg("Failed to fetch initial JWKS keys, will retry on first request")
	}

	return validator, nil
}

// refreshKeys fetches the JWKS from Keycloak and updates the key cache
func (v *KeycloakValidator) refreshKeys() error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, v.jwksURL, nil)
	if err != nil {
		return fmt.Errorf("failed to create JWKS request: %w", err)
	}

	resp, err := v.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("failed to fetch JWKS: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("JWKS endpoint returned status %d", resp.StatusCode)
	}

	var jwks JWKS
	if err := json.NewDecoder(resp.Body).Decode(&jwks); err != nil {
		return fmt.Errorf("failed to decode JWKS: %w", err)
	}

	newKeys := make(map[string]*rsa.PublicKey)
	for _, key := range jwks.Keys {
		if key.Kty != "RSA" {
			continue
		}

		publicKey, err := parseRSAPublicKey(key.N, key.E)
		if err != nil {
			log.Warn().Err(err).Str("kid", key.Kid).Msg("Failed to parse RSA public key")
			continue
		}
		newKeys[key.Kid] = publicKey
	}

	v.keysMutex.Lock()
	v.keys = newKeys
	v.lastFetch = time.Now()
	v.keysMutex.Unlock()

	log.Info().Int("count", len(newKeys)).Msg("Refreshed JWKS keys from Keycloak")
	return nil
}

// parseRSAPublicKey converts base64url encoded n and e to RSA public key
func parseRSAPublicKey(nStr, eStr string) (*rsa.PublicKey, error) {
	nBytes, err := base64.RawURLEncoding.DecodeString(nStr)
	if err != nil {
		return nil, fmt.Errorf("failed to decode n: %w", err)
	}

	eBytes, err := base64.RawURLEncoding.DecodeString(eStr)
	if err != nil {
		return nil, fmt.Errorf("failed to decode e: %w", err)
	}

	n := new(big.Int).SetBytes(nBytes)
	e := int(new(big.Int).SetBytes(eBytes).Int64())

	return &rsa.PublicKey{N: n, E: e}, nil
}

// getKey retrieves a public key by kid, refreshing if necessary
func (v *KeycloakValidator) getKey(kid string) (*rsa.PublicKey, error) {
	v.keysMutex.RLock()
	key, exists := v.keys[kid]
	needsRefresh := time.Since(v.lastFetch) > v.cacheTTL
	v.keysMutex.RUnlock()

	if exists && !needsRefresh {
		return key, nil
	}

	// Refresh keys if not found or cache expired
	if err := v.refreshKeys(); err != nil {
		if exists {
			// Return existing key if refresh fails
			return key, nil
		}
		return nil, err
	}

	v.keysMutex.RLock()
	key, exists = v.keys[kid]
	v.keysMutex.RUnlock()

	if !exists {
		return nil, fmt.Errorf("key with kid %s not found", kid)
	}

	return key, nil
}

// ValidateToken validates a JWT token and returns the claims
func (v *KeycloakValidator) ValidateToken(tokenString string) (*models.KeycloakClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &models.KeycloakClaims{}, func(token *jwt.Token) (interface{}, error) {
		// Verify signing algorithm
		if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}

		// Get the kid from token header
		kid, ok := token.Header["kid"].(string)
		if !ok {
			return nil, errors.New("kid not found in token header")
		}

		// Get the public key
		return v.getKey(kid)
	})

	if err != nil {
		return nil, fmt.Errorf("failed to parse token: %w", err)
	}

	claims, ok := token.Claims.(*models.KeycloakClaims)
	if !ok || !token.Valid {
		return nil, errors.New("invalid token claims")
	}

	// Verify issuer
	if claims.Issuer != v.issuer {
		return nil, fmt.Errorf("invalid issuer: expected %s, got %s", v.issuer, claims.Issuer)
	}

	// Verify audience contains our client ID
	if !claims.VerifyAudience(v.clientID, true) {
		// Check azp (authorized party) as fallback
		if claims.AuthorizedParty != v.clientID {
			return nil, fmt.Errorf("invalid audience: token not issued for client %s", v.clientID)
		}
	}

	// Token expiration is automatically checked by jwt-go

	return claims, nil
}

// Global Keycloak validator instance
var keycloakValidator *KeycloakValidator

// InitKeycloakValidator initializes the global Keycloak validator
func InitKeycloakValidator(cfg *config.Config) error {
	var err error
	keycloakValidator, err = NewKeycloakValidator(cfg)
	return err
}

// KeycloakJWTAuth middleware validates Keycloak JWT tokens
func KeycloakJWTAuth() fiber.Handler {
	return func(c *fiber.Ctx) error {
		if keycloakValidator == nil {
			log.Error().Msg("Keycloak validator not initialized")
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   "Internal Server Error",
				"message": "Authentication service not configured",
			})
		}

		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error":   "Unauthorized",
				"message": "Missing authorization header",
			})
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error":   "Unauthorized",
				"message": "Invalid authorization header format",
			})
		}

		tokenString := parts[1]

		claims, err := keycloakValidator.ValidateToken(tokenString)
		if err != nil {
			log.Debug().Err(err).Msg("Token validation failed")
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error":   "Unauthorized",
				"message": "Invalid or expired token",
			})
		}

		// Extract roles from Keycloak claims
		roles := claims.GetRoles()

		// Store user info in context
		c.Locals("user_id", claims.Subject)
		c.Locals("keycloak_id", claims.Subject)
		c.Locals("member_id", claims.MemberID)
		c.Locals("email", claims.Email)
		c.Locals("preferred_username", claims.PreferredUsername)
		c.Locals("name", claims.Name)
		c.Locals("given_name", claims.GivenName)
		c.Locals("family_name", claims.FamilyName)
		c.Locals("roles", roles)
		c.Locals("organization_id", claims.OrganizationID)
		c.Locals("claims", claims)

		return c.Next()
	}
}

// JWTAuth is the legacy middleware using HMAC-signed tokens (fallback)
func JWTAuth(secret string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error":   "Unauthorized",
				"message": "Missing authorization header",
			})
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error":   "Unauthorized",
				"message": "Invalid authorization header format",
			})
		}

		tokenString := parts[1]

		token, err := jwt.ParseWithClaims(tokenString, &models.JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fiber.NewError(fiber.StatusUnauthorized, "Invalid signing method")
			}
			return []byte(secret), nil
		})

		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error":   "Unauthorized",
				"message": "Invalid or expired token",
			})
		}

		claims, ok := token.Claims.(*models.JWTClaims)
		if !ok || !token.Valid {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error":   "Unauthorized",
				"message": "Invalid token claims",
			})
		}

		// Store user info in context
		c.Locals("user_id", claims.UserID)
		c.Locals("member_id", claims.MemberID)
		c.Locals("email", claims.Email)
		c.Locals("roles", claims.Roles)
		c.Locals("organization_id", claims.OrganizationID)

		return c.Next()
	}
}

func RequireRole(roles ...string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userRoles, ok := c.Locals("roles").([]string)
		if !ok {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"error":   "Forbidden",
				"message": "No roles found",
			})
		}

		for _, requiredRole := range roles {
			for _, userRole := range userRoles {
				if userRole == requiredRole || userRole == "national_admin" {
					return c.Next()
				}
			}
		}

		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error":   "Forbidden",
			"message": "Insufficient permissions",
		})
	}
}

func GetUserID(c *fiber.Ctx) string {
	userID, _ := c.Locals("user_id").(string)
	return userID
}

func GetMemberID(c *fiber.Ctx) string {
	memberID, _ := c.Locals("member_id").(string)
	return memberID
}

func GetUserRoles(c *fiber.Ctx) []string {
	roles, _ := c.Locals("roles").([]string)
	return roles
}

func GetOrganizationID(c *fiber.Ctx) *string {
	orgID, ok := c.Locals("organization_id").(*string)
	if !ok {
		return nil
	}
	return orgID
}

func HasRole(c *fiber.Ctx, role string) bool {
	roles := GetUserRoles(c)
	for _, r := range roles {
		if r == role || r == "national_admin" {
			return true
		}
	}
	return false
}
