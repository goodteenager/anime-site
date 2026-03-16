"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, Menu, X, User, Heart, LogIn, LogOut } from "lucide-react";
import { useStore } from "@/store/useStore";
import { SearchBar } from "./SearchBar";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const user = useStore((s) => s.user);
  const logout = useStore((s) => s.logout);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg-secondary backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold">
            <span className="text-accent">hana</span>
            <span className="text-accent-light">anime</span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/catalog" className="text-[13px] font-semibold text-text-muted transition-colors hover:text-accent">
              Каталог
            </Link>
            <Link href="/catalog?status=ongoing" className="text-[13px] font-semibold text-text-muted transition-colors hover:text-accent">
              Онгоинги
            </Link>
            <Link href="/catalog?sort=rating" className="text-[13px] font-semibold text-text-muted transition-colors hover:text-accent">
              Популярное
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="rounded-full p-2 text-text-muted transition-colors hover:bg-bg-hover hover:text-accent"
            aria-label="Поиск"
          >
            <Search size={20} />
          </button>

          {user ? (
            <div className="hidden items-center gap-3 md:flex">
              <Link
                href="/profile?tab=favorites"
                className="rounded-full p-2 text-text-muted transition-colors hover:bg-bg-hover hover:text-accent"
              >
                <Heart size={20} />
              </Link>
              <Link
                href="/profile"
                className="flex items-center gap-2 rounded-full bg-bg-hover px-3 py-2 text-sm font-semibold transition-colors hover:bg-border"
              >
                <User size={16} />
                <span>{user.username}</span>
              </Link>
              <button
                onClick={logout}
                className="rounded-full p-2 text-text-muted transition-colors hover:bg-bg-hover hover:text-accent"
                title="Выйти"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link
              href="/auth"
              className="pastel-btn hidden md:inline-flex"
            >
              <LogIn size={16} />
              <span>Войти</span>
            </Link>
          )}

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-full p-2 text-text-muted transition-colors hover:bg-bg-hover md:hidden"
            aria-label="Меню"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-border bg-bg-card px-4 py-3">
          <div className="mx-auto max-w-2xl">
            <SearchBar onClose={() => setSearchOpen(false)} />
          </div>
        </div>
      )}

      {menuOpen && (
        <div className="border-t border-border bg-bg-card p-4 md:hidden">
          <nav className="flex flex-col gap-3">
            <Link href="/catalog" className="rounded-xl px-3 py-2 text-[13px] font-semibold text-text-muted hover:bg-bg-hover hover:text-accent" onClick={() => setMenuOpen(false)}>
              Каталог
            </Link>
            <Link href="/catalog?status=ongoing" className="rounded-xl px-3 py-2 text-[13px] font-semibold text-text-muted hover:bg-bg-hover hover:text-accent" onClick={() => setMenuOpen(false)}>
              Онгоинги
            </Link>
            <Link href="/catalog?sort=rating" className="rounded-xl px-3 py-2 text-[13px] font-semibold text-text-muted hover:bg-bg-hover hover:text-accent" onClick={() => setMenuOpen(false)}>
              Популярное
            </Link>
            {!user && (
              <Link href="/auth" className="pastel-btn justify-center" onClick={() => setMenuOpen(false)}>
                Войти
              </Link>
            )}
            {user && (
              <>
                <Link href="/profile" className="rounded-xl px-3 py-2 text-[13px] font-semibold text-text-muted hover:bg-bg-hover" onClick={() => setMenuOpen(false)}>
                  Профиль
                </Link>
                <button
                  onClick={() => { logout(); setMenuOpen(false); }}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-semibold text-accent hover:bg-bg-hover"
                >
                  <LogOut size={16} />
                  Выйти
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
