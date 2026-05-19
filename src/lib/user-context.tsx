"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { SessionUser } from "./auth";

type UserContextValue = {
  user: SessionUser | null;
  loading: boolean;
  isAdmin: boolean;
};

const UserContext = createContext<UserContextValue>({ user: null, loading: true, isAdmin: false });

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((u) => { setUser(u); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, isAdmin: user?.role === "admin" }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
