"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Volume2, Loader2 } from "lucide-react";
import { getAnimeByUrl, getAnimeVideos, groupVideosByDubbing, type AnimeDetail, type Video } from "@/lib/yummyanime";
import { PlayerEmbed } from "@/components/PlayerEmbed";
import { EpisodeList } from "@/components/EpisodeList";
import { useParams } from "next/navigation";

export default function WatchPage() {
  const params = useParams<{ id: string }>();
  const animeId = Number(params.id);

  const [anime, setAnime] = useState<AnimeDetail | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedDubbing, setSelectedDubbing] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [animeData, videosData] = await Promise.all([
          getAnimeByUrl(animeId),
          getAnimeVideos(animeId),
        ]);
        setAnime(animeData);
        setVideos(Array.isArray(videosData) ? videosData : []);
      } catch {
        setError("Не удалось загрузить данные");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [animeId]);

  const dubbingMap = useMemo(() => groupVideosByDubbing(videos), [videos]);
  const dubbingNames = useMemo(() => Array.from(dubbingMap.keys()), [dubbingMap]);

  useEffect(() => {
    if (dubbingNames.length > 0 && !selectedDubbing) {
      setSelectedDubbing(dubbingNames[0]);
    }
  }, [dubbingNames, selectedDubbing]);

  const currentEpisodes = useMemo(() => dubbingMap.get(selectedDubbing) || [], [dubbingMap, selectedDubbing]);

  useEffect(() => {
    if (currentEpisodes.length > 0 && !selectedVideo) {
      setSelectedVideo(currentEpisodes[0]);
    }
  }, [currentEpisodes, selectedVideo]);

  const currentIndex = currentEpisodes.findIndex((v) => v.video_id === selectedVideo?.video_id);
  const prevVideo = currentIndex > 0 ? currentEpisodes[currentIndex - 1] : null;
  const nextVideo = currentIndex < currentEpisodes.length - 1 ? currentEpisodes[currentIndex + 1] : null;

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 size={32} className="animate-spin text-accent" />
      </div>
    );
  }

  if (error || !anime) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold text-text-primary">{error || "Аниме не найдено"}</h1>
          <Link href="/catalog" className="font-semibold text-accent hover:underline">В каталог</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-4 flex items-center gap-2 text-sm text-text-muted">
        <Link href={`/anime/${anime.anime_url}`} className="font-semibold transition-colors hover:text-accent">
          {anime.title}
        </Link>
        <span>/</span>
        <span className="text-text-secondary">
          {selectedVideo ? `Эпизод ${selectedVideo.number}` : "Просмотр"}
        </span>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex-1">
          {selectedVideo ? (
            <PlayerEmbed
              src={selectedVideo.iframe_url}
              title={`${anime.title} — Эпизод ${selectedVideo.number}`}
            />
          ) : (
            <div className="flex aspect-video items-center justify-center rounded-2xl border border-border bg-bg-card">
              <p className="text-text-muted">
                {videos.length === 0 ? "Видео пока недоступны" : "Выберите эпизод"}
              </p>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {prevVideo && (
                <button
                  onClick={() => setSelectedVideo(prevVideo)}
                  className="pastel-btn-outline"
                >
                  <ChevronLeft size={16} />
                  Эп. {prevVideo.number}
                </button>
              )}
              {nextVideo && (
                <button
                  onClick={() => setSelectedVideo(nextVideo)}
                  className="pastel-btn-outline"
                >
                  Эп. {nextVideo.number}
                  <ChevronRight size={16} />
                </button>
              )}
            </div>

            {selectedVideo && selectedVideo.data.player && (
              <span className="text-xs text-text-muted">Плеер: {selectedVideo.data.player}</span>
            )}
          </div>

          {dubbingNames.length > 1 && (
            <div className="mt-4">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-text-muted">
                <Volume2 size={14} />
                Озвучка
              </h3>
              <div className="flex flex-wrap gap-2">
                {dubbingNames.map((name) => (
                  <button
                    key={name}
                    onClick={() => {
                      setSelectedDubbing(name);
                      const eps = dubbingMap.get(name) || [];
                      setSelectedVideo(eps[0] || null);
                    }}
                    className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                      selectedDubbing === name
                        ? "bg-gradient-to-r from-accent-light to-accent text-white"
                        : "border border-border bg-bg-card text-text-secondary hover:border-accent-light hover:bg-bg-hover"
                    }`}
                  >
                    {name} ({dubbingMap.get(name)?.length || 0})
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="w-full shrink-0 lg:w-72">
          {currentEpisodes.length > 0 && (
            <EpisodeList
              videos={currentEpisodes}
              currentVideoId={selectedVideo?.video_id}
              onSelect={setSelectedVideo}
            />
          )}
        </div>
      </div>
    </div>
  );
}
