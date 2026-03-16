import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AuthProvider } from "@/components/AuthProvider";
import "./globals.css";

const quicksand = Quicksand({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "HanaAnime — Смотреть аниме онлайн",
  description: "Смотрите аниме онлайн бесплатно с русской озвучкой и субтитрами. Большой каталог, удобный плеер, списки просмотра.",
  keywords: ["аниме", "смотреть аниме", "аниме онлайн", "anime"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className={`${quicksand.className} flex min-h-screen flex-col bg-bg-primary text-text-primary antialiased`}>
        <AuthProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
