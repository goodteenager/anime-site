import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AuthProvider } from "@/components/AuthProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "AnimeSite — Смотреть аниме онлайн",
  description: "Смотрите аниме онлайн бесплатно с русской озвучкой и субтитрами. Большой каталог, удобный плеер, списки просмотра.",
  keywords: ["аниме", "смотреть аниме", "аниме онлайн", "anime"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="flex min-h-screen flex-col bg-bg-primary text-text-primary antialiased">
        <AuthProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
