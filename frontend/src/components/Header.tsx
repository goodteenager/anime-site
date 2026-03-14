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
    <header className="sticky top-0 z-50 border-b border-border bg-bg-secondary/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold">
            <span className="text-accent">Anime</span>
            <span className="text-text-primary">Site</span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/catalog" className="text-sm text-text-secondary transition-colors hover:text-text-primary">
              Каталог
            </Link>
            <Link href="/catalog?status=ongoing" className="text-sm text-text-secondary transition-colors hover:text-text-primary">
              Онгоинги
            </Link>
            <Link href="/catalog?sort=rating" className="text-sm text-text-secondary transition-colors hover:text-text-primary">
              Популярное
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary"
            aria-label="Поиск"
          >
            <Search size={20} />
          </button>

          {user ? (
            <div className="hidden items-center gap-3 md:flex">
              <Link
                href="/profile?tab=favorites"
                className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary"
              >
                <Heart size={20} />
              </Link>
              <Link
                href="/profile"
                className="flex items-center gap-2 rounded-lg bg-bg-card px-3 py-2 text-sm transition-colors hover:bg-bg-hover"
              >
                <User size={16} />
                <span>{user.username}</span>
              </Link>
              <button
                onClick={logout}
                className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-bg-hover hover:text-red-400"
                title="Выйти"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link
              href="/auth"
              className="hidden items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover md:flex"
            >
              <LogIn size={16} />
              <span>Войти</span>
            </Link>
          )}

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-bg-hover md:hidden"
            aria-label="Меню"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-border bg-bg-secondary px-4 py-3">
          <div className="mx-auto max-w-2xl">
            <SearchBar onClose={() => setSearchOpen(false)} />
          </div>
        </div>
      )}

      {menuOpen && (
        <div className="border-t border-border bg-bg-secondary p-4 md:hidden">
          <nav className="flex flex-col gap-3">
            <Link href="/catalog" className="rounded-lg px-3 py-2 text-text-secondary hover:bg-bg-hover" onClick={() => setMenuOpen(false)}>
              Каталог
            </Link>
            <Link href="/catalog?status=ongoing" className="rounded-lg px-3 py-2 text-text-secondary hover:bg-bg-hover" onClick={() => setMenuOpen(false)}>
              Онгоинги
            </Link>
            <Link href="/catalog?sort=rating" className="rounded-lg px-3 py-2 text-text-secondary hover:bg-bg-hover" onClick={() => setMenuOpen(false)}>
              Популярное
            </Link>
            {!user && (
              <Link href="/auth" className="rounded-lg bg-accent px-3 py-2 text-center text-white" onClick={() => setMenuOpen(false)}>
                Войти
              </Link>
            )}
            {user && (
              <>
                <Link href="/profile" className="rounded-lg px-3 py-2 text-text-secondary hover:bg-bg-hover" onClick={() => setMenuOpen(false)}>
                  Профиль
                </Link>
                <button
                  onClick={() => { logout(); setMenuOpen(false); }}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-red-400 hover:bg-bg-hover"
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
