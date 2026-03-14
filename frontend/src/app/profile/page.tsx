"use client";

import Image from "next/image";
import Link from "next/link";
import { User, Eye, Check, Pause, Clock, Heart, Trash2, LogOut, LogIn } from "lucide-react";
import { useStore, type WatchStatus } from "@/store/useStore";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

const STATUS_CONFIG: Record<WatchStatus, { label: string; icon: React.ReactNode; color: string }> = {
  watching: { label: "Смотрю", icon: <Eye size={14} />, color: "text-blue-400" },
  completed: { label: "Просмотрено", icon: <Check size={14} />, color: "text-green-400" },
  planned: { label: "Планирую", icon: <Clock size={14} />, color: "text-yellow-400" },
  dropped: { label: "Брошено", icon: <Pause size={14} />, color: "text-red-400" },
};

function ProfileContent() {
  const searchParams = useSearchParams();
  const tab = (searchParams.get("tab") || "watching") as WatchStatus | "favorites";
  const { user, watchlist, removeFromWatchlist, toggleFavorite, logout } = useStore();
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const filteredList =
    tab === "favorites"
      ? watchlist.filter((w) => w.isFav)
      : watchlist.filter((w) => w.status === tab);

  const stats = {
    watching: watchlist.filter((w) => w.status === "watching").length,
    completed: watchlist.filter((w) => w.status === "completed").length,
    planned: watchlist.filter((w) => w.status === "planned").length,
    dropped: watchlist.filter((w) => w.status === "dropped").length,
    favorites: watchlist.filter((w) => w.isFav).length,
  };

  const handleRemove = async (animeId: number) => {
    setLoadingId(animeId);
    await removeFromWatchlist(animeId);
    setLoadingId(null);
  };

  const handleToggleFav = async (item: { animeId: number; title: string; image: string; totalEpisodes: number }) => {
    setLoadingId(item.animeId);
    await toggleFavorite(item.animeId, item.title, item.image, item.totalEpisodes);
    setLoadingId(null);
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex flex-col items-center justify-center rounded-xl bg-bg-card p-12 text-center">
          <User size={48} className="mb-4 text-text-muted" />
          <h1 className="mb-2 text-xl font-bold text-text-primary">Войдите в аккаунт</h1>
          <p className="mb-6 text-sm text-text-muted">
            Чтобы управлять списками, избранным и синхронизировать данные между устройствами
          </p>
          <Link
            href="/auth"
            className="flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
          >
            <LogIn size={16} />
            Войти или зарегистрироваться
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Profile Header */}
      <div className="mb-8 flex items-center gap-4 rounded-xl bg-bg-card p-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/20">
          <User size={28} className="text-accent" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-text-primary">{user.username}</h1>
          <p className="text-sm text-text-muted">{user.email}</p>
        </div>
        <button
          onClick={logout}
          className="ml-auto flex items-center gap-2 rounded-lg border border-red-500/30 px-4 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10"
        >
          <LogOut size={16} />
          Выйти
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {(Object.entries(STATUS_CONFIG) as [WatchStatus, (typeof STATUS_CONFIG)[WatchStatus]][]).map(
          ([status, cfg]) => (
            <Link
              key={status}
              href={`/profile?tab=${status}`}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition-colors ${
                tab === status
                  ? "bg-accent/20 text-accent-light"
                  : "bg-bg-card text-text-secondary hover:bg-bg-hover"
              }`}
            >
              {cfg.icon}
              {cfg.label}
              <span className="ml-1 text-xs text-text-muted">
                {stats[status]}
              </span>
            </Link>
          )
        )}
        <Link
          href="/profile?tab=favorites"
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition-colors ${
            tab === "favorites"
              ? "bg-accent/20 text-accent-light"
              : "bg-bg-card text-text-secondary hover:bg-bg-hover"
          }`}
        >
          <Heart size={14} />
          Избранное
          <span className="ml-1 text-xs text-text-muted">{stats.favorites}</span>
        </Link>
      </div>

      {/* List */}
      {filteredList.length === 0 ? (
        <div className="rounded-xl bg-bg-card p-12 text-center">
          <p className="text-text-muted">Список пуст</p>
          <Link href="/catalog" className="mt-2 inline-block text-sm text-accent hover:underline">
            Перейти в каталог
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredList.map((item) => (
            <div
              key={item.animeId}
              className="flex items-center gap-4 rounded-xl bg-bg-card p-3 transition-colors hover:bg-bg-hover"
            >
              <Link href={`/anime/${item.animeId}`} className="shrink-0">
                <div className="relative h-16 w-12 overflow-hidden rounded-lg">
                  <Image
                    src={item.image || "/placeholder.png"}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
              </Link>

              <div className="min-w-0 flex-1">
                <Link href={`/anime/${item.animeId}`} className="text-sm font-medium text-text-primary hover:text-accent-light">
                  {item.title}
                </Link>
                <div className="mt-1 flex items-center gap-3 text-xs text-text-muted">
                  <span className={STATUS_CONFIG[item.status]?.color}>
                    {STATUS_CONFIG[item.status]?.label}
                  </span>
                  {item.totalEpisodes > 0 && (
                    <span>
                      Эп. {item.currentEpisode} / {item.totalEpisodes}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleToggleFav(item)}
                  disabled={loadingId === item.animeId}
                  className={`rounded-lg p-2 transition-colors disabled:opacity-50 ${
                    item.isFav ? "text-red-400" : "text-text-muted hover:text-text-primary"
                  }`}
                >
                  <Heart size={16} fill={item.isFav ? "currentColor" : "none"} />
                </button>
                <button
                  onClick={() => handleRemove(item.animeId)}
                  disabled={loadingId === item.animeId}
                  className="rounded-lg p-2 text-text-muted transition-colors hover:text-red-400 disabled:opacity-50"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="flex min-h-[50vh] items-center justify-center text-text-muted">Загрузка...</div>}>
      <ProfileContent />
    </Suspense>
  );
}
