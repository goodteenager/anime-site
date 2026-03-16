import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-4 text-6xl">🌸</div>
        <h1 className="mb-2 text-6xl font-bold text-accent">404</h1>
        <p className="mb-4 text-lg text-text-secondary">Страница не найдена</p>
        <Link
          href="/"
          className="pastel-btn"
        >
          На главную
        </Link>
      </div>
    </div>
  );
}
