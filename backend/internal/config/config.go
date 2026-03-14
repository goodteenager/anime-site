package config

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port          string
	DBDSN         string
	JWTSecret     string
	YummyAppToken string
}

func Load() *Config {
	_ = godotenv.Load()

	c := &Config{
		Port:          getEnv("PORT", "5000"),
		JWTSecret:     getEnv("JWT_SECRET", "fallback-secret"),
		YummyAppToken: getEnv("YUMMY_APP_TOKEN", ""),
	}

	if dsn := os.Getenv("DATABASE_URL"); dsn != "" {
		c.DBDSN = dsn
	} else {
		c.DBDSN = fmt.Sprintf(
			"postgres://%s:%s@%s:%s/%s?sslmode=disable",
			getEnv("DB_USER", "postgres"),
			getEnv("DB_PASSWORD", "postgres"),
			getEnv("DB_HOST", "127.0.0.1"),
			getEnv("DB_PORT", "5433"),
			getEnv("DB_NAME", "anime_db"),
		)
	}

	return c
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
