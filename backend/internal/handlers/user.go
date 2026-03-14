package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"anime-backend/internal/models"
)

type UserHandler struct {
	db *pgxpool.Pool
}

func NewUserHandler(db *pgxpool.Pool) *UserHandler {
	return &UserHandler{db: db}
}

const watchlistColumns = `id, "userId", "animeId", title, image, status, is_fav, current_episode, "totalEpisodes", "createdAt", "updatedAt"`

func scanWatchlistItem(scanner interface{ Scan(dest ...any) error }) (models.WatchlistItem, error) {
	var item models.WatchlistItem
	err := scanner.Scan(
		&item.ID, &item.UserID, &item.AnimeID, &item.Title, &item.Image,
		&item.Status, &item.IsFav, &item.CurrentEpisode, &item.TotalEpisodes,
		&item.CreatedAt, &item.UpdatedAt,
	)
	return item, err
}

func (h *UserHandler) GetWatchlist(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r)
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	rows, err := h.db.Query(ctx,
		`SELECT `+watchlistColumns+` FROM "Watchlist" WHERE "userId" = $1 ORDER BY "updatedAt" DESC`, userID)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Ошибка сервера"})
		return
	}
	defer rows.Close()

	items := []models.WatchlistItem{}
	for rows.Next() {
		item, err := scanWatchlistItem(rows)
		if err != nil {
			continue
		}
		items = append(items, item)
	}

	writeJSON(w, http.StatusOK, items)
}

func (h *UserHandler) UpsertWatchlist(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r)
	var req models.WatchlistRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"message": "Неверный формат данных"})
		return
	}

	if req.Status == "" {
		req.Status = "PLANNED"
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	row := h.db.QueryRow(ctx,
		`INSERT INTO "Watchlist" (id, "userId", "animeId", title, image, status, is_fav, current_episode, "totalEpisodes", "createdAt", "updatedAt")
		 VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
		 ON CONFLICT ("userId", "animeId")
		 DO UPDATE SET status = $5, title = $3, image = $4, is_fav = $6, current_episode = $7, "totalEpisodes" = $8, "updatedAt" = NOW()
		 RETURNING `+watchlistColumns,
		userID, req.AnimeID, req.Title, req.Image, req.Status, req.IsFav, req.CurrentEpisode, req.TotalEpisodes,
	)

	item, err := scanWatchlistItem(row)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Ошибка сервера"})
		return
	}

	writeJSON(w, http.StatusOK, item)
}

func (h *UserHandler) DeleteWatchlist(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r)
	animeID, err := strconv.Atoi(chi.URLParam(r, "animeId"))
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"message": "Неверный animeId"})
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	_, err = h.db.Exec(ctx,
		`DELETE FROM "Watchlist" WHERE "userId" = $1 AND "animeId" = $2`, userID, animeID)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Ошибка сервера"})
		return
	}

	writeJSON(w, http.StatusOK, map[string]bool{"success": true})
}

func (h *UserHandler) ToggleFavorite(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r)
	animeID, err := strconv.Atoi(chi.URLParam(r, "animeId"))
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"message": "Неверный animeId"})
		return
	}

	var req models.FavoriteRequest
	json.NewDecoder(r.Body).Decode(&req)

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	row := h.db.QueryRow(ctx,
		`INSERT INTO "Watchlist" (id, "userId", "animeId", title, image, status, is_fav, current_episode, "totalEpisodes", "createdAt", "updatedAt")
		 VALUES (gen_random_uuid()::text, $1, $2, $3, $4, 'PLANNED', true, 0, $5, NOW(), NOW())
		 ON CONFLICT ("userId", "animeId")
		 DO UPDATE SET is_fav = NOT "Watchlist".is_fav, "updatedAt" = NOW()
		 RETURNING `+watchlistColumns,
		userID, animeID, req.Title, req.Image, req.TotalEpisodes,
	)

	item, err := scanWatchlistItem(row)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Ошибка сервера"})
		return
	}

	writeJSON(w, http.StatusOK, item)
}

func (h *UserHandler) UpsertProgress(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r)
	var req models.ProgressRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"message": "Неверный формат данных"})
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	var item models.ProgressItem
	err := h.db.QueryRow(ctx,
		`INSERT INTO "WatchProgress" (id, "userId", "animeId", episode, timestamp, "updatedAt")
		 VALUES (gen_random_uuid()::text, $1, $2, $3, $4, NOW())
		 ON CONFLICT ("userId", "animeId", episode)
		 DO UPDATE SET timestamp = $4, "updatedAt" = NOW()
		 RETURNING id, "userId", "animeId", episode, timestamp, "updatedAt"`,
		userID, req.AnimeID, req.Episode, req.Timestamp,
	).Scan(&item.ID, &item.UserID, &item.AnimeID, &item.Episode, &item.Timestamp, &item.UpdatedAt)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Ошибка сервера"})
		return
	}

	writeJSON(w, http.StatusOK, item)
}

func (h *UserHandler) GetProgress(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r)
	animeID, err := strconv.Atoi(chi.URLParam(r, "animeId"))
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"message": "Неверный animeId"})
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	rows, err := h.db.Query(ctx,
		`SELECT id, "userId", "animeId", episode, timestamp, "updatedAt"
		 FROM "WatchProgress" WHERE "userId" = $1 AND "animeId" = $2 ORDER BY episode ASC`,
		userID, animeID)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Ошибка сервера"})
		return
	}
	defer rows.Close()

	items := []models.ProgressItem{}
	for rows.Next() {
		var item models.ProgressItem
		if err := rows.Scan(&item.ID, &item.UserID, &item.AnimeID, &item.Episode, &item.Timestamp, &item.UpdatedAt); err != nil {
			continue
		}
		items = append(items, item)
	}

	writeJSON(w, http.StatusOK, items)
}
