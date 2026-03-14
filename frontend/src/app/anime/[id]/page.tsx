import Image from "next/image";
import Link from "next/link";
import { Star, Calendar, Film, Clock, Play, Eye, Users } from "lucide-react";
import { getAnimeByUrl, getRatingColor, getSeasonName, formatViews, fixUrl, type AnimeDetail } from "@/lib/yummyanime";
import { WatchlistButton } from "@/components/WatchlistButton";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  try {
    const anime = await getAnimeByUrl(id);
    return {
      title: `${anime.title} — AnimeSite`,
      description: anime.description?.slice(0, 160),
    };
  } catch {
    return { title: "Аниме — AnimeSite" };
  }
}

export default async function AnimePage({ params }: PageProps) {
  const { id } = await params;
  let anime: AnimeDetail;

  try {
    anime = await getAnimeByUrl(id, true);
  } catch {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold">Аниме не найдено</h1>
          <p className="mb-4 text-text-muted">Тайтл не найден или произошла ошибка.</p>
          <Link href="/catalog" className="text-accent hover:underline">Вернуться в каталог</Link>
        </div>
      </div>
    );
  }

  const score = anime.rating.average;
  const totalEpisodes = anime.episodes?.count || 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Poster */}
        <div className="shrink-0">
          <div className="relative mx-auto w-64 overflow-hidden rounded-xl shadow-2xl shadow-accent/10 lg:mx-0">
            <Image
              src={fixUrl(anime.poster?.huge || anime.poster?.big)}
              alt={anime.title}
              width={256}
              height={360}
              className="w-full object-cover"
              priority
            />
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <Link
              href={`/watch/${anime.anime_id}`}
              className="flex items-center justify-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
            >
              <Play size={16} />
              Смотреть
            </Link>

            <WatchlistButton
              animeId={anime.anime_id}
              title={anime.title}
              image={fixUrl(anime.poster?.big)}
              totalEpisodes={totalEpisodes}
            />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1">
          <h1 className="mb-1 text-3xl font-extrabold text-text-primary">{anime.title}</h1>
          {anime.other_titles && anime.other_titles.length > 0 && (
            <p className="mb-4 text-sm text-text-muted">{anime.other_titles.join(" / ")}</p>
          )}

          {/* Score & badges */}
          <div className="mb-6 flex flex-wrap items-center gap-3">
            {score > 0 && (
              <div className="flex items-center gap-2 rounded-lg bg-bg-card px-4 py-2">
                <Star size={18} className="fill-yellow-400 text-yellow-400" />
                <span className={`text-lg font-bold ${getRatingColor(score)}`}>{score.toFixed(2)}</span>
                <span className="text-xs text-text-muted">({anime.rating.counters})</span>
              </div>
            )}
            <div className="flex items-center gap-1 rounded-lg bg-bg-card px-3 py-2 text-sm text-text-muted">
              <Eye size={14} />
              {formatViews(anime.views)}
            </div>
            <span className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              anime.anime_status.alias === "ongoing" ? "bg-green-500/20 text-green-400" :
              anime.anime_status.alias === "announcement" ? "bg-blue-500/20 text-blue-400" :
              "bg-gray-500/20 text-gray-400"
            }`}>
              {anime.anime_status.title}
            </span>
            {anime.min_age && (
              <span className="rounded-lg bg-gray-500/20 px-3 py-1.5 text-sm text-gray-400">
                {anime.min_age.title_long}
              </span>
            )}
          </div>

          {/* Metadata grid */}
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <InfoBlock icon={<Film size={16} />} label="Тип" value={anime.type.name} />
            <InfoBlock
              icon={<Clock size={16} />}
              label="Эпизоды"
              value={anime.episodes ? `${anime.episodes.aired} / ${anime.episodes.count || "?"}` : "—"}
            />
            <InfoBlock icon={<Calendar size={16} />} label="Год" value={`${anime.year}`} />
            <InfoBlock icon={<Clock size={16} />} label="Длительность" value={anime.duration ? `${anime.duration} мин.` : "—"} />
          </div>

          {/* Season */}
          {anime.season > 0 && (
            <div className="mb-4">
              <span className="rounded-full border border-border px-3 py-1 text-xs text-text-secondary">
                {getSeasonName(anime.season)} {anime.year}
              </span>
            </div>
          )}

          {/* Genres */}
          {anime.genres && anime.genres.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-2 text-sm font-semibold text-text-muted">Жанры</h3>
              <div className="flex flex-wrap gap-2">
                {anime.genres.map((g) => (
                  <Link
                    key={g.value}
                    href={`/catalog?genres=${g.href}`}
                    className="rounded-full border border-border px-3 py-1 text-xs text-text-secondary transition-colors hover:border-accent hover:text-accent-light"
                  >
                    {g.title}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Studios */}
          {anime.studios && anime.studios.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-text-muted">
                <Users size={14} />
                Студия
              </h3>
              <div className="flex flex-wrap gap-2">
                {anime.studios.map((s) => (
                  <span key={s.id} className="text-sm text-text-secondary">{s.title}</span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {anime.description && (
            <div className="mb-6">
              <h3 className="mb-2 text-sm font-semibold text-text-muted">Описание</h3>
              <p className="text-sm leading-relaxed text-text-secondary">{anime.description}</p>
            </div>
          )}

          {/* External ratings */}
          {(anime.rating.shikimori_rating ?? anime.rating.myanimelist_rating ?? anime.rating.kp_rating) ? (
            <div className="mb-6 flex flex-wrap gap-3">
              {(anime.rating.shikimori_rating ?? 0) > 0 && (
                <span className="rounded-lg bg-bg-card px-3 py-1.5 text-xs text-text-muted">Shikimori: {anime.rating.shikimori_rating}</span>
              )}
              {(anime.rating.myanimelist_rating ?? 0) > 0 && (
                <span className="rounded-lg bg-bg-card px-3 py-1.5 text-xs text-text-muted">MAL: {anime.rating.myanimelist_rating}</span>
              )}
              {(anime.rating.kp_rating ?? 0) > 0 && (
                <span className="rounded-lg bg-bg-card px-3 py-1.5 text-xs text-text-muted">КиноПоиск: {anime.rating.kp_rating}</span>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* Screenshots */}
      {anime.random_screenshots && anime.random_screenshots.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-bold text-text-primary">Скриншоты</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {anime.random_screenshots.slice(0, 8).map((ss) => (
              <div key={ss.id} className="overflow-hidden rounded-lg">
                <Image src={fixUrl(ss.sizes?.full || ss.sizes?.small)} alt={`Скриншот`} width={320} height={180} className="h-full w-full object-cover transition-transform hover:scale-105" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Watch button at bottom */}
      <div className="mt-8 text-center">
        <Link
          href={`/watch/${anime.anime_id}`}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
        >
          <Play size={18} />
          Перейти к просмотру
        </Link>
      </div>
    </div>
  );
}

function InfoBlock({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg bg-bg-card p-3">
      <div className="mb-1 flex items-center gap-1.5 text-text-muted">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <div className="text-sm font-medium text-text-primary">{value}</div>
    </div>
  );
}
