"use client";

import { useEffect, useRef } from "react";
import { useStore } from "@/store/useStore";
import { getProfile } from "@/lib/auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const token = useStore((s) => s.token);
  const setUser = useStore((s) => s.setUser);
  const logout = useStore((s) => s.logout);
  const loadWatchlist = useStore((s) => s.loadWatchlist);
  const didRun = useRef(false);

  useEffect(() => {
    if (!token || didRun.current) return;
    didRun.current = true;

    getProfile(token)
      .then((user) => {
        setUser(user);
        loadWatchlist();
      })
      .catch(() => {
        logout();
      });
  }, [token, setUser, logout, loadWatchlist]);

  return <>{children}</>;
}
