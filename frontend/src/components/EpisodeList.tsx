"use client";

import { Play } from "lucide-react";
import type { Video } from "@/lib/yummyanime";

interface EpisodeListProps {
  videos: Video[];
  currentVideoId?: number;
  onSelect: (video: Video) => void;
}

export function EpisodeList({ videos, currentVideoId, onSelect }: EpisodeListProps) {
  // Сортируем и фильтруем дубли по номеру эпизода
  const sorted = [...videos]
    .sort((a, b) => parseFloat(a.number) - parseFloat(b.number))
    .filter((v, i, arr) => arr.findIndex(x => x.number === v.number) === i);

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-bold text-text-primary">
        Эпизоды ({sorted.length})
      </h3>
      <div className="max-h-[500px] space-y-1 overflow-y-auto pr-2">
        {sorted.map((video) => {
          const isCurrent = currentVideoId === video.video_id;
          return (
            <button
              key={`${video.video_id}-${video.number}`} // уникальный ключ
              onClick={() => onSelect(video)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                isCurrent
                  ? "bg-accent/15 font-semibold text-accent"
                  : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
              }`}
            >
              <Play size={14} className={isCurrent ? "text-accent" : ""} />
              <span className="flex-1 truncate">Эпизод {video.number}</span>
              {isCurrent && (
                <span className="shrink-0 text-xs font-bold text-accent-light">Сейчас</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}