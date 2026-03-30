import type { AuthSession } from "@/src/features/shared/types";
import { supabase } from "@/src/lib/supabase";

export interface AuthGateway {
  getCurrentSession(): Promise<AuthSession | null>;
  signInWithGoogle(): Promise<AuthSession>;
  signOut(): Promise<void>;
  onSessionChanged(listener: (session: AuthSession | null) => void): () => void;
}

function mapSupabaseSession(session: any): AuthSession | null {
  if (!session?.user || !session.access_token || !session.refresh_token) {
    return null;
  }

  return {
    identity: {
      userId: session.user.id,
      email: session.user.email ?? "",
      displayName: session.user.user_metadata?.full_name ?? null,
      avatarUrl: session.user.user_metadata?.avatar_url ?? null,
      provider: "google",
    },
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    expiresAt: new Date((session.expires_at ?? 0) * 1000).toISOString(),
  };
}

export const authGateway: AuthGateway = {
  async getCurrentSession() {
    const result = await supabase.auth.getSession();
    return mapSupabaseSession(result.data.session);
  },
  async signInWithGoogle() {
    throw new Error("Interactive Google sign-in is not wired for the current build yet.");
  },
  async signOut() {
    await supabase.auth.signOut();
  },
  onSessionChanged(listener) {
    const subscription = supabase.auth.onAuthStateChange((_event, session) => {
      listener(mapSupabaseSession(session));
    });

    return () => {
      subscription.data.subscription.unsubscribe();
    };
  },
};
