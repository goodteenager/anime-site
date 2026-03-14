package database

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

func Connect(dsn string) (*pgxpool.Pool, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	pool, err := pgxpool.New(ctx, dsn)
	if err != nil {
		return nil, fmt.Errorf("unable to create pool: %w", err)
	}

	if err := pool.Ping(ctx); err != nil {
		pool.Close()
		return nil, fmt.Errorf("unable to ping db: %w", err)
	}

	if err := migrate(ctx, pool); err != nil {
		pool.Close()
		return nil, fmt.Errorf("migration failed: %w", err)
	}

	return pool, nil
}

func migrate(ctx context.Context, pool *pgxpool.Pool) error {
	queries := []string{
		`CREATE TABLE IF NOT EXISTS "User" (
			id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
			username TEXT UNIQUE NOT NULL,
			email TEXT UNIQUE NOT NULL,
			password TEXT NOT NULL,
			avatar TEXT,
			"createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`,
		`CREATE TABLE IF NOT EXISTS "Watchlist" (
			id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
			"userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
			"animeId" INTEGER NOT NULL,
			title TEXT NOT NULL DEFAULT '',
			image TEXT NOT NULL DEFAULT '',
			status TEXT NOT NULL DEFAULT 'PLANNED',
			is_fav BOOLEAN NOT NULL DEFAULT false,
			current_episode INTEGER NOT NULL DEFAULT 0,
			"totalEpisodes" INTEGER NOT NULL DEFAULT 0,
			"createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			"updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			UNIQUE("userId", "animeId")
		)`,
		`CREATE TABLE IF NOT EXISTS "WatchProgress" (
			id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
			"userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
			"animeId" INTEGER NOT NULL,
			episode INTEGER NOT NULL,
			timestamp DOUBLE PRECISION NOT NULL DEFAULT 0,
			"updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			UNIQUE("userId", "animeId", episode)
		)`,
	}

	for _, q := range queries {
		if _, err := pool.Exec(ctx, q); err != nil {
			return fmt.Errorf("query failed: %w\nSQL: %s", err, q)
		}
	}

	return nil
}
