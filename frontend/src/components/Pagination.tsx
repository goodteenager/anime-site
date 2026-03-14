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
        className="flex items-center gap-1 rounded-lg border border-border px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-bg-hover disabled:cursor-not-allowed disabled:opacity-30"
      >
        <ChevronLeft size={16} />
        Назад
      </button>

      <span className="rounded-lg bg-accent/20 px-4 py-2 text-sm font-medium text-accent-light">
        {currentPage}
      </span>

      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={!hasMore}
        className="flex items-center gap-1 rounded-lg border border-border px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-bg-hover disabled:cursor-not-allowed disabled:opacity-30"
      >
        Далее
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
