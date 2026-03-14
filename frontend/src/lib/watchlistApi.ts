const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface ServerWatchlistItem {
  id: string;
  userId: string;
  animeId: number;
  title: string;
  image: string;
  status: string;
  isFav: boolean;
  currentEpisode: number;
  totalEpisodes: number;
  createdAt: string;
  updatedAt: string;
}

function authHeaders(token: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchWatchlist(token: string): Promise<ServerWatchlistItem[]> {
  const res = await fetch(`${API_URL}/user/watchlist`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to fetch watchlist");
  return res.json();
}

export async function upsertWatchlistItem(
  token: string,
  data: {
    animeId: number;
    title: string;
    image: string;
    status: string;
    isFav?: boolean;
    currentEpisode?: number;
    totalEpisodes?: number;
  }
): Promise<ServerWatchlistItem> {
  const res = await fetch(`${API_URL}/user/watchlist`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to upsert watchlist item");
  return res.json();
}

export async function deleteWatchlistItem(token: string, animeId: number): Promise<void> {
  const res = await fetch(`${API_URL}/user/watchlist/${animeId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to delete watchlist item");
}

export async function toggleFavoriteApi(
  token: string,
  data: { animeId: number; title: string; image: string; totalEpisodes?: number }
): Promise<ServerWatchlistItem> {
  const res = await fetch(`${API_URL}/user/watchlist/${data.animeId}/fav`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify({
      title: data.title,
      image: data.image,
      totalEpisodes: data.totalEpisodes || 0,
    }),
  });
  if (!res.ok) throw new Error("Failed to toggle favorite");
  return res.json();
}
