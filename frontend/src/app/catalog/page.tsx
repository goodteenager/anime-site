import { Suspense } from "react";
import { getAnimeList, type AnimeFilterParams } from "@/lib/yummyanime";
import { AnimeCard } from "@/components/AnimeCard";
import { Filters } from "@/components/Filters";
import { Pagination } from "@/components/Pagination";
import { AnimeGridSkeleton } from "@/components/AnimeCardSkeleton";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Каталог аниме — AnimeSite",
  description: "Полный каталог аниме с фильтрами по жанру, типу, статусу и году.",
};

interface PageProps {
  searchParams: Promise<{
    offset?: string;
    page?: string;
    q?: string;
    genres?: string;
    types?: string;
    status?: string;
    sort?: string;
    season?: string;
    from_year?: string;
    to_year?: string;
  }>;
}

const ITEMS_PER_PAGE = 20;

async function CatalogContent({ searchParams }: { searchParams: PageProps["searchParams"] }) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const offset = (page - 1) * ITEMS_PER_PAGE;

  const apiParams: AnimeFilterParams = {
    limit: ITEMS_PER_PAGE,
    offset,
    q: params.q,
    genres: params.genres,
    types: params.types,
    status: params.status,
    sort: (params.sort as AnimeFilterParams["sort"]) || "top",
    season: params.season,
    from_year: params.from_year ? Number(params.from_year) : undefined,
    to_year: params.to_year ? Number(params.to_year) : undefined,
  };

  let animes;
  try {
    animes = await getAnimeList(apiParams);
  } catch {
    return (
      <div className="py-12 text-center">
        <p className="text-text-muted">Ошибка загрузки. Попробуйте позже.</p>
      </div>
    );
  }

  if (!animes || !Array.isArray(animes) || animes.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-lg font-medium text-text-primary">Ничего не найдено</p>
        <p className="mt-1 text-sm text-text-muted">Попробуйте изменить параметры поиска</p>
      </div>
    );
  }

  return (
    <>
      <div className="anime-grid">
        {animes.map((anime) => (
          <AnimeCard key={anime.anime_id} anime={anime} />
        ))}
      </div>
      <Pagination currentPage={page} hasMore={animes.length >= ITEMS_PER_PAGE} />
    </>
  );
}

export default async function CatalogPage({ searchParams }: PageProps) {
  const params = await searchParams;
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <h1 className="mb-1 text-2xl font-bold text-text-primary">
          {params.q ? `Результаты: «${params.q}»` : "Каталог аниме"}
        </h1>
        <p className="text-sm text-text-muted">Фильтруй и находи аниме по вкусу</p>
      </div>

      <div className="mb-6">
        <Suspense fallback={null}>
          <Filters />
        </Suspense>
      </div>

      <Suspense fallback={<AnimeGridSkeleton />}>
        <CatalogContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
