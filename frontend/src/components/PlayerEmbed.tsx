"use client";

interface PlayerEmbedProps {
  src: string;
  title?: string;
}

export function PlayerEmbed({ src, title }: PlayerEmbedProps) {
  const embedUrl = src.startsWith("//") ? `https:${src}` : src;

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-border bg-[#3a2840]" style={{ aspectRatio: "16/9" }}>
      <iframe
        src={embedUrl}
        title={title || "Anime Player"}
        className="absolute inset-0 h-full w-full"
        allowFullScreen
        allow="autoplay; fullscreen"
        frameBorder="0"
      />
    </div>
  );
}
