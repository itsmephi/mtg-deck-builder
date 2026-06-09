"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

// Auth is optional and additive. `status` lets the UI avoid flicker between the
// initial session check and the resolved state. When Supabase isn't configured
// the provider resolves straight to `signedOut` and sign-in is a no-op, so the
// app behaves exactly as the local-only pre-v2.0.0 build.

export type AuthStatus = "loading" | "signedIn" | "signedOut";

interface AuthContextType {
  status: AuthStatus;
  user: User | null;
  /** True when a Supabase project is configured (sign-in is possible). */
  authEnabled: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>(
    isSupabaseConfigured ? "loading" : "signedOut",
  );
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!supabase) return;

    // Resolve the current session once on mount...
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setStatus(data.session?.user ? "signedIn" : "signedOut");
    });

    // ...then track every change (sign-in redirect, token refresh, sign-out).
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setStatus(session?.user ? "signedIn" : "signedOut");
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        status,
        user,
        authEnabled: isSupabaseConfigured,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
