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
      <div className="relative overflow-hidden rounded-2xl border border-border bg-bg-card transition-all duration-300 hover:scale-[1.03] hover:shadow-lg hover:shadow-accent-light/20">
        <div className="relative aspect-[3/4] w-full overflow-hidden">
          <Image
            src={fixUrl(anime.poster?.big || anime.poster?.medium)}
            alt={anime.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#3a2840]/70 via-transparent to-transparent" />

          {score > 0 && (
            <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-white/80 px-2 py-1 backdrop-blur-sm">
              <Star size={11} className="fill-accent-light text-accent-light" />
              <span className={`text-xs font-bold ${getRatingColor(score)}`}>
                {score.toFixed(2)}
              </span>
            </div>
          )}

          {anime.anime_status?.alias === "ongoing" && (
            <div className="absolute right-2 top-2 rounded-full bg-accent/90 px-2.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
              Онгоинг
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-3">
            <div className="text-[11px] font-semibold text-white/80">
              {anime.type?.shortname || anime.type?.name || ""} &middot; {anime.year}
            </div>
          </div>
        </div>

        <div className="p-3">
          <h3 className="line-clamp-2 text-[12px] font-bold text-text-primary transition-colors group-hover:text-accent">
            {anime.title}
          </h3>
        </div>
      </div>
    </Link>
  );
}
