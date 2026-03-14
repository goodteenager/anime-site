const BASE_URL = "https://api.yani.tv";

// ─── Types ──────────────────────────────────────────────

export interface Poster {
  small: string;
  medium: string;
  big: string;
  huge: string;
  fullsize: string;
  mega: string;
}

export interface AnimeStatus {
  title: string;
  alias: "released" | "ongoing" | "announcement";
  value: number;
}

export interface AnimeType {
  name: string;
  value: number;
  shortname: string;
  alias: string;
}

export interface AnimeRating {
  counters: number;
  average: number;
  kp_rating?: number;
  myanimelist_rating?: number;
  shikimori_rating?: number;
  worldart_rating?: number;
}

export interface Genre {
  title: string;
  href: string;
  value: number;
  more_titles?: string[];
  group_id?: number;
}

export interface AnimeEpisodes {
  aired: number;
  count: number;
  next_date: number;
  prev_date: number;
}

export interface Video {
  video_id: number;
  iframe_url: string;
  number: string;
  date: number;
  index: number;
  views: number;
  duration: number;
  data: {
    dubbing: string;
    player: string;
    player_id: number;
  };
  skips: {
    opening: { time: number; length: number };
    ending: { time: number; length: number };
  };
}

export interface Anime {
  anime_id: number;
  anime_url: string;
  title: string;
  description: string;
  year: number;
  views: number;
  season: number;
  anime_status: AnimeStatus;
  poster: Poster;
  rating: AnimeRating;
  type: AnimeType;
  min_age: { value: number; title: string; title_long: string };
  remote_ids: {
    shikimori_id: number;
    myanimelist_id: number;
    kp_id: number;
    worldart_id: number;
  };
  top: { global: number; category: number };
  blocked_in: string[];
}

export interface AnimeDetail extends Anime {
  original: string;
  duration: number;
  other_titles: string[];
  creators: { title: string; id: number; url: string }[];
  studios: { title: string; id: number; url: string }[];
  genres: Genre[];
  videos?: Video[];
  translates: { title: string; href: string; value: number }[];
  episodes: AnimeEpisodes;
  comments_count: number;
  reviews_count: number;
  random_screenshots: {
    id: number;
    time: number;
    episode: string;
    sizes: { small: string; full: string };
  }[];
  viewing_order?: {
    title: string;
    anime_id: number;
    anime_url: string;
    description: string;
    year: number;
    poster: Poster;
    type: AnimeType;
  }[];
}

export interface ScheduleItem {
  title: string;
  description: string;
  poster: Poster;
  anime_url: string;
  anime_id: number;
  episodes: AnimeEpisodes;
}

export interface FeedNewVideo {
  title: string;
  date: number;
  description: string;
  ep_title: string;
  player_title: string;
  poster: Poster;
  anime_url: string;
  dub_title: string;
  anime_id: number;
  video_id: number;
}

export interface FeedResponse {
  new: Anime[];
  announcements: Anime[];
  recommends: Anime[];
  new_videos: FeedNewVideo[];
  top_carousel: { season: number; year: number; items: Anime[] };
  schedule: ScheduleItem[];
}

export interface CatalogResponse {
  genres: { genres: Genre[]; groups: { title: string; id: number }[] };
  data: AnimeDetail[];
  types: { type: AnimeType; count: number }[];
}

export interface AnimeFilterParams {
  limit?: number;
  offset?: number;
  sort?: "title" | "year" | "rating" | "rating_counters" | "views" | "top" | "random" | "id";
  sort_forward?: boolean;
  q?: string;
  genres?: string;
  types?: string;
  status?: string;
  from_year?: number;
  to_year?: number;
  season?: string;
}

// ─── Fetch helper ───────────────────────────────────────

const APP_TOKEN = process.env.NEXT_PUBLIC_YUMMY_APP_TOKEN || "";

async function fetchApi<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
  const url = new URL(`${BASE_URL}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });
  }

  const res = await fetch(url.toString(), {
    headers: {
      "X-Application": APP_TOKEN,
      Accept: "image/avif,image/webp",
      Lang: "ru",
    },
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    throw new Error(`YummyAnime API error: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  return json.response !== undefined ? json.response : json;
}

// ─── Feed (homepage) ────────────────────────────────────

export async function getFeed(): Promise<FeedResponse> {
  return fetchApi<FeedResponse>("/feed");
}

// ─── Anime list / filter ────────────────────────────────

export async function getAnimeList(params: AnimeFilterParams = {}): Promise<Anime[]> {
  return fetchApi<Anime[]>("/anime", {
    limit: params.limit || 20,
    offset: params.offset || 0,
    sort: params.sort || "top",
    sort_forward: params.sort_forward,
    q: params.q,
    genres: params.genres,
    types: params.types,
    status: params.status,
    from_year: params.from_year,
    to_year: params.to_year,
    season: params.season,
  });
}

// ─── Anime detail ───────────────────────────────────────

export async function getAnimeByUrl(urlOrId: string | number, needVideos = false): Promise<AnimeDetail> {
  return fetchApi<AnimeDetail>(`/anime/${urlOrId}`, {
    need_videos: needVideos || undefined,
  });
}

// ─── Videos / Episodes ──────────────────────────────────

export async function getAnimeVideos(animeId: number): Promise<Video[]> {
  return fetchApi<Video[]>(`/anime/${animeId}/videos`);
}

// ─── Search ─────────────────────────────────────────────

export async function searchAnime(query: string, limit = 8): Promise<Anime[]> {
  return fetchApi<Anime[]>("/search", { q: query, limit });
}

// ─── Genres ─────────────────────────────────────────────

export async function getGenres(): Promise<{ genres: Genre[]; groups: { title: string; id: number }[] }> {
  return fetchApi("/anime/genres");
}

// ─── Catalog ────────────────────────────────────────────

export async function getCatalog(): Promise<CatalogResponse> {
  return fetchApi<CatalogResponse>("/anime/catalog");
}

// ─── Schedule ───────────────────────────────────────────

export async function getSchedule(): Promise<ScheduleItem[]> {
  return fetchApi<ScheduleItem[]>("/anime/schedule");
}

// ─── Recommendations ────────────────────────────────────

export async function getRecommendations(animeId: number): Promise<Anime[]> {
  return fetchApi<Anime[]>(`/anime/${animeId}/recommendations`);
}

// ─── Helpers ────────────────────────────────────────────

export function fixUrl(url: string | undefined | null): string {
  if (!url) return "";
  if (url.startsWith("//")) return `https:${url}`;
  return url;
}

export function getSeasonName(season: number): string {
  const map: Record<number, string> = { 1: "Зима", 2: "Весна", 3: "Лето", 4: "Осень" };
  return map[season] || "";
}

export function getRatingColor(avg: number): string {
  if (avg >= 8) return "text-rating-green";
  if (avg >= 6) return "text-rating-yellow";
  return "text-rating-red";
}

export function formatViews(views: number): string {
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`;
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)}K`;
  return String(views);
}

export function groupVideosByDubbing(videos: Video[]): Map<string, Video[]> {
  const map = new Map<string, Video[]>();
  for (const v of videos) {
    const key = v.data.dubbing || "Неизвестная озвучка";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(v);
  }
  for (const [, list] of map) {
    list.sort((a, b) => parseFloat(a.number) - parseFloat(b.number));
  }
  return map;
}
