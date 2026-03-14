package handlers

import (
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
)

const yummyBaseURL = "https://api.yani.tv"

type AnimeHandler struct {
	appToken   string
	httpClient *http.Client
}

func NewAnimeHandler(appToken string) *AnimeHandler {
	return &AnimeHandler{
		appToken:   appToken,
		httpClient: &http.Client{Timeout: 15 * time.Second},
	}
}

func (h *AnimeHandler) proxy(w http.ResponseWriter, targetURL string) {
	req, err := http.NewRequest("GET", targetURL, nil)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Ошибка запроса"})
		return
	}

	req.Header.Set("X-Application", h.appToken)
	req.Header.Set("Accept", "image/avif,image/webp")
	req.Header.Set("Lang", "ru")

	resp, err := h.httpClient.Do(req)
	if err != nil {
		writeJSON(w, http.StatusBadGateway, map[string]string{"message": "Ошибка подключения к YummyAnime API"})
		return
	}
	defer resp.Body.Close()

	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(resp.StatusCode)
	io.Copy(w, resp.Body)
}

func (h *AnimeHandler) Feed(w http.ResponseWriter, r *http.Request) {
	h.proxy(w, yummyBaseURL+"/feed")
}

func (h *AnimeHandler) Search(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query().Get("q")
	if q == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"message": "Параметр q обязателен"})
		return
	}
	limit := r.URL.Query().Get("limit")
	if limit == "" {
		limit = "8"
	}
	h.proxy(w, fmt.Sprintf("%s/search?q=%s&limit=%s", yummyBaseURL, q, limit))
}

func (h *AnimeHandler) ListAnime(w http.ResponseWriter, r *http.Request) {
	target := yummyBaseURL + "/anime"
	if qs := r.URL.RawQuery; qs != "" {
		target += "?" + qs
	}
	h.proxy(w, target)
}

func (h *AnimeHandler) GetAnime(w http.ResponseWriter, r *http.Request) {
	urlOrID := chi.URLParam(r, "urlOrId")
	needVideos := r.URL.Query().Get("need_videos")
	target := fmt.Sprintf("%s/anime/%s", yummyBaseURL, urlOrID)
	if needVideos != "" {
		target += "?need_videos=" + needVideos
	}
	h.proxy(w, target)
}

func (h *AnimeHandler) GetVideos(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	h.proxy(w, fmt.Sprintf("%s/anime/%s/videos", yummyBaseURL, id))
}

func (h *AnimeHandler) Genres(w http.ResponseWriter, r *http.Request) {
	h.proxy(w, yummyBaseURL+"/anime/genres")
}

func (h *AnimeHandler) Schedule(w http.ResponseWriter, r *http.Request) {
	h.proxy(w, yummyBaseURL+"/anime/schedule")
}

func (h *AnimeHandler) Catalog(w http.ResponseWriter, r *http.Request) {
	h.proxy(w, yummyBaseURL+"/anime/catalog")
}

func (h *AnimeHandler) Recommendations(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	h.proxy(w, fmt.Sprintf("%s/anime/%s/recommendations", yummyBaseURL, id))
}
