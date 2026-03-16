"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, X } from "lucide-react";
import { useState } from "react";

const TYPES = [
  { value: "tv", label: "ТВ" },
  { value: "movie", label: "Фильм" },
  { value: "ona", label: "ONA" },
  { value: "ova", label: "OVA" },
  { value: "special", label: "Спешл" },
  { value: "shorttv", label: "Короткометражка" },
];

const STATUSES = [
  { value: "ongoing", label: "Онгоинг" },
  { value: "released", label: "Вышел" },
  { value: "announcement", label: "Анонс" },
];

const SORTINGS = [
  { value: "top", label: "Топ" },
  { value: "rating", label: "По рейтингу" },
  { value: "year", label: "По году" },
  { value: "views", label: "По просмотрам" },
  { value: "title", label: "По названию" },
];

const SEASONS = [
  { value: "1", label: "Зима" },
  { value: "2", label: "Весна" },
  { value: "3", label: "Лето" },
  { value: "4", label: "Осень" },
];

interface FilterSelectProps {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (val: string) => void;
}

function FilterSelect({ label, options, value, onChange }: FilterSelectProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 rounded-full border px-4 py-2 text-[13px] font-semibold transition-colors ${
          value
            ? "border-accent bg-accent/10 text-accent"
            : "border-border bg-bg-card text-text-secondary hover:border-accent-light"
        }`}
      >
        <span>{value ? options.find((o) => o.value === value)?.label : label}</span>
        <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-50 mt-1 max-h-60 min-w-[160px] overflow-y-auto rounded-2xl border border-border bg-bg-card py-1 shadow-xl">
            {value && (
              <button
                onClick={() => { onChange(""); setOpen(false); }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-text-muted hover:bg-bg-hover"
              >
                <X size={12} />
                Сбросить
              </button>
            )}
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`w-full px-3 py-2 text-left text-sm transition-colors hover:bg-bg-hover ${
                  value === opt.value ? "font-semibold text-accent" : "text-text-primary"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function Filters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentType = searchParams.get("types") || "";
  const currentStatus = searchParams.get("status") || "";
  const currentSort = searchParams.get("sort") || "";
  const currentSeason = searchParams.get("season") || "";

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("offset");
    router.push(`/catalog?${params.toString()}`);
  };

  const hasFilters = currentType || currentStatus || currentSeason;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <FilterSelect label="Тип" options={TYPES} value={currentType} onChange={(v) => updateParam("types", v)} />
      <FilterSelect label="Статус" options={STATUSES} value={currentStatus} onChange={(v) => updateParam("status", v)} />
      <FilterSelect label="Сезон" options={SEASONS} value={currentSeason} onChange={(v) => updateParam("season", v)} />
      <FilterSelect label="Сортировка" options={SORTINGS} value={currentSort} onChange={(v) => updateParam("sort", v)} />

      {hasFilters && (
        <button
          onClick={() => router.push("/catalog")}
          className="flex items-center gap-1 rounded-full px-3 py-2 text-sm font-semibold text-text-muted transition-colors hover:text-accent"
        >
          <X size={14} />
          Сбросить все
        </button>
      )}
    </div>
  );
}
