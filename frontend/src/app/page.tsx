import Link from "next/link";
import { ArrowRight, TrendingUp, Sparkles, Clock, CalendarDays } from "lucide-react";
import { getFeed, fixUrl, type Anime, type ScheduleItem } from "@/lib/yummyanime";
import { AnimeCard } from "@/components/AnimeCard";
import Image from "next/image";

function AnimeSection({
  title,
  icon,
  animes,
  href,
}: {
  title: string;
  icon: React.ReactNode;
  animes: Anime[];
  href: string;
}) {
  if (!animes || animes.length === 0) return null;
  return (
    <section>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xl font-bold text-text-primary">
          {icon}
          {title}
        </h2>
        <Link
          href={href}
          className="flex items-center gap-1 text-sm text-text-muted transition-colors hover:text-accent-light"
        >
          Все
          <ArrowRight size={14} />
        </Link>
      </div>
      <div className="anime-grid">
        {animes.slice(0, 10).map((anime) => (
          <AnimeCard key={anime.anime_id} anime={anime} />
        ))}
      </div>
    </section>
  );
}

function ScheduleSection({ items }: { items: ScheduleItem[] }) {
  if (!items || items.length === 0) return null;
  return (
    <section>
      <div className="mb-5 flex items-center gap-2">
        <CalendarDays size={22} className="text-purple-400" />
        <h2 className="text-xl font-bold text-text-primary">Расписание</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.slice(0, 6).map((item) => (
          <Link
            key={item.anime_id}
            href={`/anime/${item.anime_url}`}
            className="flex items-center gap-3 rounded-xl bg-bg-card p-3 transition-colors hover:bg-bg-hover"
          >
            <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-lg">
              <Image src={fixUrl(item.poster?.medium)} alt={item.title} fill className="object-cover" sizes="48px" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-text-primary">{item.title}</div>
              <div className="text-xs text-text-muted">
                Эп. {item.episodes.aired} / {item.episodes.count || "?"}
              </div>
              {item.episodes.next_date > 0 && (
                <div className="text-xs text-accent-light">
                  След: {new Date(item.episodes.next_date * 1000).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let feed: Awaited<ReturnType<typeof getFeed>> | null = null;
  try {
    feed = await getFeed();
  } catch {
    /* handled below */
  }

  if (!feed) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold text-text-primary">Ошибка загрузки</h1>
          <p className="text-text-muted">Не удалось загрузить данные. Проверьте YUMMY_APP_TOKEN в .env.local</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Hero */}
      <section className="mb-12 rounded-2xl bg-gradient-to-br from-accent/20 via-bg-secondary to-bg-primary p-8 md:p-12">
        <h1 className="mb-3 text-3xl font-extrabold tracking-tight text-text-primary md:text-5xl">
          Смотри <span className="text-accent">аниме</span> онлайн
        </h1>
        <p className="mb-6 max-w-xl text-text-secondary">
          Большой каталог аниме с русской озвучкой. Отслеживай прогресс, составляй списки и делись впечатлениями.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/catalog"
            className="rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
          >
            Перейти в каталог
          </Link>
          <Link
            href="/catalog?status=ongoing"
            className="rounded-lg border border-border bg-bg-card px-6 py-3 text-sm font-semibold text-text-secondary transition-colors hover:bg-bg-hover"
          >
            Онгоинги
          </Link>
        </div>
      </section>

      <div className="space-y-12">
        {feed.top_carousel?.items && (
          <AnimeSection
            title={`Топ сезона ${feed.top_carousel.year}`}
            icon={<Sparkles size={22} className="text-yellow-400" />}
            animes={feed.top_carousel.items}
            href="/catalog?sort=top"
          />
        )}

        <AnimeSection
          title="Новинки"
          icon={<Clock size={22} className="text-green-400" />}
          animes={feed.new}
          href="/catalog?sort=year"
        />

        <AnimeSection
          title="Рекомендации"
          icon={<TrendingUp size={22} className="text-orange-400" />}
          animes={feed.recommends}
          href="/catalog?sort=rating"
        />

        <ScheduleSection items={feed.schedule} />

        {feed.announcements && feed.announcements.length > 0 && (
          <AnimeSection
            title="Анонсы"
            icon={<CalendarDays size={22} className="text-blue-400" />}
            animes={feed.announcements}
            href="/catalog?status=announcement"
          />
        )}
      </div>
    </div>
  );
}
