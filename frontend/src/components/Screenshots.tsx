"use client"; // Важно! Это делает компонент клиентским

import { useState } from "react";
import Image from "next/image";
import { fixUrl } from "@/lib/yummyanime";

interface Screenshot {
  id: number;
  sizes: {
    full?: string;
    small?: string;
  };
}

export function Screenshots({ screenshotsData }: { screenshotsData: Screenshot[] }) {
  const [screenshots, setScreenshots] = useState(screenshotsData.slice(0, 8) || []);

  if (!screenshots.length) return null;

  return (
    <section className="mt-12">
      <h2 className="mb-4 text-xl font-bold text-text-primary">Скриншоты</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {screenshots.map((ss) => (
          <div key={ss.id} className="overflow-hidden rounded-2xl border border-border">
            <Image
              src={fixUrl(ss.sizes?.full || ss.sizes?.small)}
              alt="Скриншот"
              width={320}
              height={180}
              className="h-full w-full object-cover transition-transform hover:scale-105"
              onError={() => setScreenshots(prev => prev.filter(item => item.id !== ss.id))}
            />
          </div>
        ))}
      </div>
    </section>
  );
}