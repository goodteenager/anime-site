package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"

	"anime-backend/internal/config"
	"anime-backend/internal/database"
	"anime-backend/internal/handlers"
	"anime-backend/internal/middleware"
)

func main() {
	cfg := config.Load()

	db, err := database.Connect(cfg.DBDSN)
	if err != nil {
		log.Fatalf("Database connection failed: %v", err)
	}
	defer db.Close()
	log.Println("Connected to database")

	authH := handlers.NewAuthHandler(db, cfg.JWTSecret)
	userH := handlers.NewUserHandler(db)
	animeH := handlers.NewAnimeHandler(cfg.YummyAppToken)

	r := chi.NewRouter()
	r.Use(middleware.CORS)

	// Auth
	r.Post("/api/auth/register", authH.Register)
	r.Post("/api/auth/login", authH.Login)
	r.With(middleware.Auth(cfg.JWTSecret)).Get("/api/auth/me", authH.Me)

	// User (protected)
	r.Group(func(r chi.Router) {
		r.Use(middleware.Auth(cfg.JWTSecret))
		r.Get("/api/user/watchlist", userH.GetWatchlist)
		r.Post("/api/user/watchlist", userH.UpsertWatchlist)
		r.Delete("/api/user/watchlist/{animeId}", userH.DeleteWatchlist)
		r.Put("/api/user/watchlist/{animeId}/fav", userH.ToggleFavorite)
		r.Post("/api/user/progress", userH.UpsertProgress)
		r.Get("/api/user/progress/{animeId}", userH.GetProgress)
	})

	// Anime proxy
	r.Get("/api/anime/feed", animeH.Feed)
	r.Get("/api/anime/search", animeH.Search)
	r.Get("/api/anime/genres", animeH.Genres)
	r.Get("/api/anime/schedule", animeH.Schedule)
	r.Get("/api/anime/catalog", animeH.Catalog)
	r.Get("/api/anime/list", animeH.ListAnime)
	r.Get("/api/anime/{id}/videos", animeH.GetVideos)
	r.Get("/api/anime/{id}/recommendations", animeH.Recommendations)
	r.Get("/api/anime/{urlOrId}", animeH.GetAnime)

	// Health
	r.Get("/api/health", func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintf(w, `{"status":"ok"}`)
	})

	addr := ":" + cfg.Port
	log.Printf("Server running on http://localhost%s", addr)
	if err := http.ListenAndServe(addr, r); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
