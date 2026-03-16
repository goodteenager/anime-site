"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LogIn, UserPlus } from "lucide-react";
import { useStore } from "@/store/useStore";
import { login, register } from "@/lib/auth";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { setUser, setToken, loadWatchlist } = useStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = isLogin
        ? await login(email, password)
        : await register(username, email, password);

      setUser(data.user);
      setToken(data.token);
      await loadWatchlist();
      router.push("/profile");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Произошла ошибка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-border bg-bg-card p-8">
          <div className="mb-4 text-center text-4xl">🌸</div>
          <h1 className="mb-6 text-center text-2xl font-bold text-text-primary">
            {isLogin ? "Вход" : "Регистрация"}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="mb-1 block text-sm font-semibold text-text-muted">Имя пользователя</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required={!isLogin}
                  className="w-full rounded-xl border border-border bg-bg-primary px-4 py-2.5 text-sm text-text-primary outline-none transition-colors focus:border-accent"
                  placeholder="username"
                />
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm font-semibold text-text-muted">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-border bg-bg-primary px-4 py-2.5 text-sm text-text-primary outline-none transition-colors focus:border-accent"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-text-muted">Пароль</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full rounded-xl border border-border bg-bg-primary px-4 py-2.5 pr-10 text-sm text-text-primary outline-none transition-colors focus:border-accent"
                  placeholder="Минимум 6 символов"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-accent-light/15 px-4 py-2 text-sm text-accent">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="pastel-btn w-full justify-center disabled:opacity-50"
            >
              {isLogin ? <LogIn size={16} /> : <UserPlus size={16} />}
              {loading ? "Загрузка..." : isLogin ? "Войти" : "Зарегистрироваться"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-text-muted">
            {isLogin ? "Нет аккаунта?" : "Уже есть аккаунт?"}{" "}
            <button
              onClick={() => { setIsLogin(!isLogin); setError(""); }}
              className="font-bold text-accent hover:underline"
            >
              {isLogin ? "Зарегистрироваться" : "Войти"}
            </button>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-text-muted">
          Списки и избранное синхронизируются между устройствами.
        </p>
      </div>
    </div>
  );
}
