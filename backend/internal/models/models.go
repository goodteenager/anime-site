package models

import "time"

type User struct {
	ID        string    `json:"id"`
	Username  string    `json:"username"`
	Email     string    `json:"email"`
	Password  string    `json:"-"`
	Avatar    *string   `json:"avatar"`
	CreatedAt time.Time `json:"createdAt"`
}

type RegisterRequest struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type AuthResponse struct {
	User  User   `json:"user"`
	Token string `json:"token"`
}

type WatchlistItem struct {
	ID             string    `json:"id"`
	UserID         string    `json:"userId"`
	AnimeID        int       `json:"animeId"`
	Title          string    `json:"title"`
	Image          string    `json:"image"`
	Status         string    `json:"status"`
	IsFav          bool      `json:"isFav"`
	CurrentEpisode int       `json:"currentEpisode"`
	TotalEpisodes  int       `json:"totalEpisodes"`
	CreatedAt      time.Time `json:"createdAt"`
	UpdatedAt      time.Time `json:"updatedAt"`
}

type WatchlistRequest struct {
	AnimeID        int    `json:"animeId"`
	Title          string `json:"title"`
	Image          string `json:"image"`
	Status         string `json:"status"`
	IsFav          bool   `json:"isFav"`
	CurrentEpisode int    `json:"currentEpisode"`
	TotalEpisodes  int    `json:"totalEpisodes"`
}

type FavoriteRequest struct {
	Title         string `json:"title"`
	Image         string `json:"image"`
	TotalEpisodes int    `json:"totalEpisodes"`
}

type ProgressItem struct {
	ID        string    `json:"id"`
	UserID    string    `json:"userId"`
	AnimeID   int       `json:"animeId"`
	Episode   int       `json:"episode"`
	Timestamp float64   `json:"timestamp"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type ProgressRequest struct {
	AnimeID   int     `json:"animeId"`
	Episode   int     `json:"episode"`
	Timestamp float64 `json:"timestamp"`
}
