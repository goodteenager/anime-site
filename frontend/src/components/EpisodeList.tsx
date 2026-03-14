"use client";

import { Play } from "lucide-react";
import type { Video } from "@/lib/yummyanime";

interface EpisodeListProps {
  videos: Video[];
  currentVideoId?: number;
  onSelect: (video: Video) => void;
}

export function EpisodeList({ videos, currentVideoId, onSelect }: EpisodeListProps) {
  const sorted = [...videos].sort((a, b) => parseFloat(a.number) - parseFloat(b.number));

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold text-text-primary">
        Эпизоды ({sorted.length})
      </h3>
      <div className="max-h-[500px] space-y-1 overflow-y-auto pr-2">
        {sorted.map((video) => {
          const isCurrent = currentVideoId === video.video_id;
          return (
            <button
              key={video.video_id}
              onClick={() => onSelect(video)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                isCurrent
                  ? "bg-accent/20 text-accent-light"
                  : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
              }`}
            >
              <Play size={14} className={isCurrent ? "text-accent" : ""} />
              <span className="flex-1 truncate">Эпизод {video.number}</span>
              {isCurrent && (
                <span className="shrink-0 text-xs text-accent">Сейчас</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
