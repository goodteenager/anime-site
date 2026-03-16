"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, X, Loader2 } from "lucide-react";
import { searchAnime, fixUrl, type Anime } from "@/lib/yummyanime";

interface SearchBarProps {
  onClose?: () => void;
}

export function SearchBar({ onClose }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 3) {
      setResults([]);
      setShowResults(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchAnime(query.trim());
        setResults(Array.isArray(data) ? data : []);
        setShowResults(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleSelect = () => {
    setShowResults(false);
    setQuery("");
    onClose?.();
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск аниме (мин. 3 символа)..."
          className="w-full rounded-full border border-border bg-bg-card py-2.5 pl-10 pr-10 text-sm text-text-primary placeholder-text-muted outline-none transition-colors focus:border-accent"
        />
        {loading && (
          <Loader2 size={18} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-accent" />
        )}
        {!loading && query && (
          <button
            onClick={() => { setQuery(""); setResults([]); setShowResults(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-accent"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[60vh] overflow-y-auto rounded-2xl border border-border bg-bg-card shadow-xl">
          {results.map((anime) => (
            <Link
              key={anime.anime_id}
              href={`/anime/${anime.anime_url}`}
              onClick={handleSelect}
              className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-bg-hover"
            >
              <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded-xl">
                <Image
                  src={fixUrl(anime.poster?.small || anime.poster?.medium)}
                  alt={anime.title}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-text-primary">
                  {anime.title}
                </div>
                <div className="text-xs text-text-muted">
                  {anime.type.shortname} &middot; {anime.year} &middot; {anime.rating.average > 0 ? anime.rating.average.toFixed(1) : "—"}
                </div>
              </div>
            </Link>
          ))}

          <Link
            href={`/catalog?q=${encodeURIComponent(query)}`}
            onClick={handleSelect}
            className="block border-t border-border px-4 py-3 text-center text-sm font-semibold text-accent transition-colors hover:bg-bg-hover"
          >
            Все результаты &rarr;
          </Link>
        </div>
      )}

      {showResults && results.length === 0 && !loading && query.length >= 3 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-2xl border border-border bg-bg-card p-6 text-center shadow-xl">
          <p className="text-sm text-text-muted">Ничего не найдено</p>
        </div>
      )}
    </div>
  );
}
