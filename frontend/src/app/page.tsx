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
          className="flex items-center gap-1 text-sm font-semibold text-accent transition-colors hover:text-accent-hover"
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
        <CalendarDays size={22} className="text-accent" />
        <h2 className="text-xl font-bold text-text-primary">Расписание</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.slice(0, 6).map((item) => (
          <Link
            key={item.anime_id}
            href={`/anime/${item.anime_url}`}
            className="flex items-center gap-3 rounded-2xl border border-border bg-bg-card p-3 transition-colors hover:bg-bg-hover"
          >
            <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-xl">
              <Image src={fixUrl(item.poster?.medium)} alt={item.title} fill className="object-cover" sizes="48px" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-text-primary">{item.title}</div>
              <div className="text-xs text-text-muted">
                Эп. {item.episodes.aired} / {item.episodes.count || "?"}
              </div>
              {item.episodes.next_date > 0 && (
                <div className="text-xs font-semibold text-accent">
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
      <section className="mb-12 overflow-hidden rounded-3xl bg-gradient-to-br from-[#fce8f5] via-[#f5d8f0] to-[#e8f0fc] p-8 md:p-12">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div>
            <h1 className="mb-3 text-3xl font-bold leading-tight text-text-primary md:text-5xl">
              Романтика,
              <br />
              магия и <em className="not-italic text-accent">мечты</em>
            </h1>
            <p className="mb-6 max-w-xl text-[13px] leading-relaxed text-text-secondary">
              Погрузись в мир трогательных историй о любви,
              дружбе и волшебных приключениях. Большой каталог аниме с русской озвучкой.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/catalog" className="pastel-btn">
                Смотреть аниме 🌸
              </Link>
              <Link href="/catalog?status=ongoing" className="pastel-btn-outline">
                Онгоинги
              </Link>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 max-md:hidden">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#fce8f5] text-4xl">🌸</div>
            <div className="flex flex-col gap-3">
              <div className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[#e8f0fc] text-2xl">✨</div>
              <div className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[#fdf5e8] text-2xl">🦋</div>
            </div>
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#e8fcf0] text-4xl">🌙</div>
          </div>
        </div>
      </section>

      <div className="space-y-12">
        {feed.top_carousel?.items && (
          <AnimeSection
            title={`Топ сезона ${feed.top_carousel.year}`}
            icon={<Sparkles size={22} className="text-accent-light" />}
            animes={feed.top_carousel.items}
            href="/catalog?sort=top"
          />
        )}

        <AnimeSection
          title="Новинки"
          icon={<Clock size={22} className="text-accent" />}
          animes={feed.new}
          href="/catalog?sort=year"
        />

        <AnimeSection
          title="Рекомендации"
          icon={<TrendingUp size={22} className="text-accent-light" />}
          animes={feed.recommends}
          href="/catalog?sort=rating"
        />

        <ScheduleSection items={feed.schedule} />

        {feed.announcements && feed.announcements.length > 0 && (
          <AnimeSection
            title="Анонсы"
            icon={<CalendarDays size={22} className="text-accent" />}
            animes={feed.announcements}
            href="/catalog?status=announcement"
          />
        )}
      </div>
    </div>
  );
}
