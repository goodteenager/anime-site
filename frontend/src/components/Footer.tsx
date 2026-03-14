import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-bg-secondary">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <Link href="/" className="text-lg font-bold">
              <span className="text-accent">Anime</span>
              <span className="text-text-primary">Site</span>
            </Link>
            <p className="mt-2 text-sm text-text-muted">
              Смотри аниме онлайн бесплатно с русской озвучкой и субтитрами.
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-text-primary">Навигация</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/catalog" className="text-sm text-text-muted transition-colors hover:text-text-primary">
                Каталог
              </Link>
              <Link href="/catalog?status=ongoing" className="text-sm text-text-muted transition-colors hover:text-text-primary">
                Онгоинги
              </Link>
              <Link href="/catalog?sort=rating" className="text-sm text-text-muted transition-colors hover:text-text-primary">
                Популярное
              </Link>
            </nav>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-text-primary">Информация</h3>
            <nav className="flex flex-col gap-2">
              <span className="text-sm text-text-muted">Данные и видео: YummyAnime API</span>
            </nav>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-4 text-center text-xs text-text-muted">
          &copy; {new Date().getFullYear()} AnimeSite. Все права защищены.
        </div>
      </div>
    </footer>
  );
}
