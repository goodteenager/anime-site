package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"

	"anime-backend/internal/models"
)

type AuthHandler struct {
	db        *pgxpool.Pool
	jwtSecret string
}

func NewAuthHandler(db *pgxpool.Pool, jwtSecret string) *AuthHandler {
	return &AuthHandler{db: db, jwtSecret: jwtSecret}
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req models.RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"message": "Неверный формат данных"})
		return
	}

	if req.Username == "" || req.Email == "" || req.Password == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"message": "Все поля обязательны"})
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	var count int
	err := h.db.QueryRow(ctx,
		`SELECT COUNT(*) FROM "User" WHERE email = $1 OR username = $2`,
		req.Email, req.Username,
	).Scan(&count)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "DB check: " + err.Error()})
		return
	}
	if count > 0 {
		writeJSON(w, http.StatusBadRequest, map[string]string{"message": "Пользователь уже существует"})
		return
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(req.Password), 10)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Hash: " + err.Error()})
		return
	}

	var user models.User
	err = h.db.QueryRow(ctx,
		`INSERT INTO "User" (id, username, email, password, "createdAt")
		 VALUES (gen_random_uuid()::text, $1, $2, $3, NOW())
		 RETURNING id, username, email, avatar, "createdAt"`,
		req.Username, req.Email, string(hashed),
	).Scan(&user.ID, &user.Username, &user.Email, &user.Avatar, &user.CreatedAt)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Insert: " + err.Error()})
		return
	}

	token, err := h.generateToken(user.ID)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Ошибка сервера"})
		return
	}

	writeJSON(w, http.StatusCreated, models.AuthResponse{User: user, Token: token})
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req models.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"message": "Неверный формат данных"})
		return
	}

	if req.Email == "" || req.Password == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"message": "Email и пароль обязательны"})
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	var user models.User
	err := h.db.QueryRow(ctx,
		`SELECT id, username, email, password, avatar, "createdAt" FROM "User" WHERE email = $1`,
		req.Email,
	).Scan(&user.ID, &user.Username, &user.Email, &user.Password, &user.Avatar, &user.CreatedAt)
	if err != nil {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"message": "Неверные данные"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"message": "Неверные данные"})
		return
	}

	token, err := h.generateToken(user.ID)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Ошибка сервера"})
		return
	}

	writeJSON(w, http.StatusOK, models.AuthResponse{User: user, Token: token})
}

func (h *AuthHandler) Me(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r)
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	var user models.User
	err := h.db.QueryRow(ctx,
		`SELECT id, username, email, avatar, "createdAt" FROM "User" WHERE id = $1`,
		userID,
	).Scan(&user.ID, &user.Username, &user.Email, &user.Avatar, &user.CreatedAt)
	if err != nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"message": "Пользователь не найден"})
		return
	}

	writeJSON(w, http.StatusOK, user)
}

func (h *AuthHandler) generateToken(userID string) (string, error) {
	claims := jwt.MapClaims{
		"userId": userID,
		"exp":    time.Now().Add(7 * 24 * time.Hour).Unix(),
		"iat":    time.Now().Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(h.jwtSecret))
}
