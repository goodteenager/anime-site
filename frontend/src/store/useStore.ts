"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/lib/auth";
import {
  fetchWatchlist,
  upsertWatchlistItem,
  deleteWatchlistItem,
  toggleFavoriteApi,
  type ServerWatchlistItem,
} from "@/lib/watchlistApi";

export type WatchStatus = "watching" | "completed" | "dropped" | "planned";

export interface WatchlistItem {
  animeId: number;
  title: string;
  image: string;
  status: WatchStatus;
  isFav: boolean;
  currentEpisode: number;
  totalEpisodes: number;
}

function serverToLocal(s: ServerWatchlistItem): WatchlistItem {
  return {
    animeId: s.animeId,
    title: s.title,
    image: s.image,
    status: s.status.toLowerCase() as WatchStatus,
    isFav: s.isFav,
    currentEpisode: s.currentEpisode,
    totalEpisodes: s.totalEpisodes,
  };
}

interface AppState {
  user: User | null;
  token: string | null;
  watchlist: WatchlistItem[];

  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;

  loadWatchlist: () => Promise<void>;
  addToWatchlist: (data: {
    animeId: number;
    title: string;
    image: string;
    status: WatchStatus;
    currentEpisode?: number;
    totalEpisodes?: number;
  }) => Promise<void>;
  removeFromWatchlist: (animeId: number) => Promise<void>;
  updateWatchlistStatus: (animeId: number, status: WatchStatus) => Promise<void>;
  toggleFavorite: (animeId: number, title?: string, image?: string, totalEpisodes?: number) => Promise<void>;

  getWatchlistItem: (animeId: number) => WatchlistItem | undefined;
  isFavorite: (animeId: number) => boolean;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      watchlist: [],

      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      logout: () => set({ user: null, token: null, watchlist: [] }),

      loadWatchlist: async () => {
        const token = get().token;
        if (!token) return;
        try {
          const items = await fetchWatchlist(token);
          set({ watchlist: items.map(serverToLocal) });
        } catch {
          /* token expired or network error */
        }
      },

      addToWatchlist: async (data) => {
        const token = get().token;
        if (!token) return;
        try {
          const existing = get().watchlist.find((w) => w.animeId === data.animeId);
          const saved = await upsertWatchlistItem(token, {
            animeId: data.animeId,
            title: data.title,
            image: data.image,
            status: data.status.toUpperCase(),
            isFav: existing?.isFav ?? false,
            currentEpisode: data.currentEpisode ?? existing?.currentEpisode ?? 0,
            totalEpisodes: data.totalEpisodes ?? 0,
          });
          const item = serverToLocal(saved);
          set((state) => {
            const idx = state.watchlist.findIndex((w) => w.animeId === item.animeId);
            if (idx >= 0) {
              const next = [...state.watchlist];
              next[idx] = item;
              return { watchlist: next };
            }
            return { watchlist: [item, ...state.watchlist] };
          });
        } catch (err) {
          console.error("addToWatchlist:", err);
        }
      },

      removeFromWatchlist: async (animeId) => {
        const token = get().token;
        if (!token) return;
        try {
          await deleteWatchlistItem(token, animeId);
          set((state) => ({
            watchlist: state.watchlist.filter((w) => w.animeId !== animeId),
          }));
        } catch (err) {
          console.error("removeFromWatchlist:", err);
        }
      },

      updateWatchlistStatus: async (animeId, status) => {
        const token = get().token;
        if (!token) return;
        const existing = get().watchlist.find((w) => w.animeId === animeId);
        if (!existing) return;
        try {
          const saved = await upsertWatchlistItem(token, {
            animeId,
            title: existing.title,
            image: existing.image,
            status: status.toUpperCase(),
            isFav: existing.isFav,
            currentEpisode: existing.currentEpisode,
            totalEpisodes: existing.totalEpisodes,
          });
          const item = serverToLocal(saved);
          set((state) => ({
            watchlist: state.watchlist.map((w) => (w.animeId === animeId ? item : w)),
          }));
        } catch (err) {
          console.error("updateWatchlistStatus:", err);
        }
      },

      toggleFavorite: async (animeId, title, image, totalEpisodes) => {
        const token = get().token;
        if (!token) return;
        try {
          const saved = await toggleFavoriteApi(token, {
            animeId,
            title: title ?? "",
            image: image ?? "",
            totalEpisodes: totalEpisodes ?? 0,
          });
          const item = serverToLocal(saved);
          set((state) => {
            const idx = state.watchlist.findIndex((w) => w.animeId === item.animeId);
            if (idx >= 0) {
              const next = [...state.watchlist];
              next[idx] = item;
              return { watchlist: next };
            }
            return { watchlist: [item, ...state.watchlist] };
          });
        } catch (err) {
          console.error("toggleFavorite:", err);
        }
      },

      getWatchlistItem: (animeId) => get().watchlist.find((w) => w.animeId === animeId),
      isFavorite: (animeId) => get().watchlist.some((w) => w.animeId === animeId && w.isFav),
    }),
    {
      name: "anime-site-store",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
    }
  )
);
