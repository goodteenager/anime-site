"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, ChevronDown, Check, Heart } from "lucide-react";
import { useStore, type WatchStatus } from "@/store/useStore";

interface WatchlistButtonProps {
  animeId: number;
  title: string;
  image: string;
  totalEpisodes: number;
}

const STATUS_LABELS: Record<WatchStatus, string> = {
  watching: "Смотрю",
  completed: "Просмотрено",
  planned: "Планирую",
  dropped: "Брошено",
};

export function WatchlistButton({ animeId, title, image, totalEpisodes }: WatchlistButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user, watchlist, addToWatchlist, removeFromWatchlist, toggleFavorite, isFavorite } = useStore();
  const item = watchlist.find((w) => w.animeId === animeId);
  const fav = isFavorite(animeId);

  const requireAuth = () => {
    if (!user) {
      router.push("/auth");
      return true;
    }
    return false;
  };

  const handleSelect = async (status: WatchStatus) => {
    if (requireAuth()) return;
    setLoading(true);
    try {
      if (item?.status === status) {
        await removeFromWatchlist(animeId);
      } else {
        await addToWatchlist({
          animeId,
          title,
          image,
          status,
          currentEpisode: item?.currentEpisode || 0,
          totalEpisodes,
        });
      }
    } finally {
      setLoading(false);
    }
    setOpen(false);
  };

  const handleFav = async () => {
    if (requireAuth()) return;
    setLoading(true);
    try {
      await toggleFavorite(animeId, title, image, totalEpisodes);
    } finally {
      setLoading(false);
    }
  };

  const handleButtonClick = () => {
    if (requireAuth()) return;
    setOpen(!open);
  };

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <button
          onClick={handleButtonClick}
          disabled={loading}
          className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 ${
            item
              ? "bg-accent text-white hover:bg-accent-hover"
              : "border border-border bg-bg-card text-text-secondary hover:bg-bg-hover"
          }`}
        >
          {item ? <Check size={16} /> : <Bookmark size={16} />}
          <span>{item ? STATUS_LABELS[item.status] : "В список"}</span>
          <ChevronDown size={14} />
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div className="absolute left-0 top-full z-50 mt-1 min-w-[160px] overflow-hidden rounded-lg border border-border bg-bg-secondary py-1 shadow-xl">
              {(Object.entries(STATUS_LABELS) as [WatchStatus, string][]).map(([status, label]) => (
                <button
                  key={status}
                  onClick={() => handleSelect(status)}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-bg-hover ${
                    item?.status === status ? "text-accent-light" : "text-text-primary"
                  }`}
                >
                  {item?.status === status && <Check size={14} />}
                  <span>{label}</span>
                </button>
              ))}

              {item && (
                <>
                  <div className="my-1 border-t border-border" />
                  <button
                    onClick={() => { handleSelect(item.status); }}
                    className="w-full px-3 py-2 text-left text-sm text-red-400 transition-colors hover:bg-bg-hover"
                  >
                    Удалить из списка
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>

      <button
        onClick={handleFav}
        disabled={loading}
        className={`flex items-center justify-center rounded-lg px-3 py-2.5 transition-colors disabled:opacity-50 ${
          fav
            ? "bg-red-500/20 text-red-400"
            : "border border-border bg-bg-card text-text-muted hover:bg-bg-hover hover:text-red-400"
        }`}
        title={fav ? "Убрать из избранного" : "В избранное"}
      >
        <Heart size={18} fill={fav ? "currentColor" : "none"} />
      </button>
    </div>
  );
}
