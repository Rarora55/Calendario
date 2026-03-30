import jwt from "jsonwebtoken";

type SupabaseJwtClaims = {
  sub?: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
};

export function verifySupabaseAccessToken(token: string, secret: string) {
  const decoded = jwt.verify(token, secret) as SupabaseJwtClaims;
  if (!decoded.sub || !decoded.email) {
    throw new Error("Token is missing required claims.");
  }

  return {
    userId: decoded.sub,
    email: decoded.email,
    displayName: decoded.user_metadata?.full_name ?? null,
    avatarUrl: decoded.user_metadata?.avatar_url ?? null,
    provider: "google" as const,
  };
}
