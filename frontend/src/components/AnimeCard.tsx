import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { getRatingColor, fixUrl, type Anime } from "@/lib/yummyanime";

interface AnimeCardProps {
  anime: Anime;
}

export function AnimeCard({ anime }: AnimeCardProps) {
  const score = anime.rating?.average || 0;

  return (
    <Link href={`/anime/${anime.anime_url}`} className="group">
      <div className="relative overflow-hidden rounded-xl bg-bg-card transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-accent/10">
        <div className="relative aspect-[3/4] w-full overflow-hidden">
          <Image
            src={fixUrl(anime.poster?.big || anime.poster?.medium)}
            alt={anime.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

          {score > 0 && (
            <div className="absolute left-2 top-2 flex items-center gap-1 rounded-md bg-black/70 px-2 py-1 backdrop-blur-sm">
              <Star size={12} className="fill-yellow-400 text-yellow-400" />
              <span className={`text-xs font-bold ${getRatingColor(score)}`}>
                {score.toFixed(2)}
              </span>
            </div>
          )}

          {anime.anime_status?.alias === "ongoing" && (
            <div className="absolute right-2 top-2 rounded-md bg-green-500/90 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
              Онгоинг
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-3">
            <div className="text-[11px] text-text-muted">
              {anime.type?.shortname || anime.type?.name || ""} &middot; {anime.year}
            </div>
          </div>
        </div>

        <div className="p-3">
          <h3 className="line-clamp-2 text-sm font-medium text-text-primary transition-colors group-hover:text-accent-light">
            {anime.title}
          </h3>
        </div>
      </div>
    </Link>
  );
}
