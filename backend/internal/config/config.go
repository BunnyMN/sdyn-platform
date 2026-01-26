package config

import (
	"github.com/spf13/viper"
)

type Config struct {
	Env            string
	Port           string
	DatabaseURL    string
	RedisURL       string
	JWTSecret      string
	AllowedOrigins string

	// Keycloak
	KeycloakURL          string
	KeycloakRealm        string
	KeycloakClientID     string
	KeycloakClientSecret string

	// MinIO
	MinioEndpoint  string
	MinioAccessKey string
	MinioSecretKey string
	MinioBucket    string
}

func Load() (*Config, error) {
	viper.AutomaticEnv()

	viper.SetDefault("APP_ENV", "development")
	viper.SetDefault("APP_PORT", "8080")

	cfg := &Config{
		Env:                  viper.GetString("APP_ENV"),
		Port:                 viper.GetString("APP_PORT"),
		DatabaseURL:          viper.GetString("DATABASE_URL"),
		RedisURL:             viper.GetString("REDIS_URL"),
		JWTSecret:            viper.GetString("JWT_SECRET"),
		AllowedOrigins:       viper.GetString("ALLOWED_ORIGINS"),
		KeycloakURL:          viper.GetString("KEYCLOAK_URL"),
		KeycloakRealm:        viper.GetString("KEYCLOAK_REALM"),
		KeycloakClientID:     viper.GetString("KEYCLOAK_CLIENT_ID"),
		KeycloakClientSecret: viper.GetString("KEYCLOAK_CLIENT_SECRET"),
		MinioEndpoint:        viper.GetString("MINIO_ENDPOINT"),
		MinioAccessKey:       viper.GetString("MINIO_ACCESS_KEY"),
		MinioSecretKey:       viper.GetString("MINIO_SECRET_KEY"),
		MinioBucket:          viper.GetString("MINIO_BUCKET"),
	}

	if cfg.AllowedOrigins == "" {
		cfg.AllowedOrigins = "http://localhost:3000,http://localhost:3001"
	}

	if cfg.MinioBucket == "" {
		cfg.MinioBucket = "sdyn-files"
	}

	return cfg, nil
}
