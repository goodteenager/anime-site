"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  hasMore: boolean;
  basePath?: string;
}

export function Pagination({ currentPage, hasMore, basePath = "/catalog" }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`${basePath}?${params.toString()}`);
  };

  return (
    <div className="flex items-center justify-center gap-2 py-8">
      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage <= 1}
        className="pastel-btn-outline disabled:cursor-not-allowed disabled:opacity-30"
      >
        <ChevronLeft size={16} />
        Назад
      </button>

      <span className="rounded-full bg-accent/15 px-5 py-2.5 text-sm font-bold text-accent">
        {currentPage}
      </span>

      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={!hasMore}
        className="pastel-btn-outline disabled:cursor-not-allowed disabled:opacity-30"
      >
        Далее
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
