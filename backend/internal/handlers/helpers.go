package handlers

import (
	"encoding/json"
	"net/http"

	"anime-backend/internal/middleware"
)

func writeJSON(w http.ResponseWriter, status int, v interface{}) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

func getUserID(r *http.Request) string {
	return middleware.GetUserID(r)
}
