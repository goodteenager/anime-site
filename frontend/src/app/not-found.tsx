import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center">
        <h1 className="mb-2 text-6xl font-extrabold text-accent">404</h1>
        <p className="mb-4 text-lg text-text-secondary">Страница не найдена</p>
        <Link
          href="/"
          className="rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
        >
          На главную
        </Link>
      </div>
    </div>
  );
}
