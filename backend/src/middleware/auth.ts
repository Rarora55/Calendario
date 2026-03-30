import type { NextFunction, Request, Response } from "express";

import { config } from "../config.js";
import { verifySupabaseAccessToken } from "../lib/supabaseAuth.js";

export function requireSupabaseAuth(request: Request, response: Response, next: NextFunction) {
  const authorization = request.header("authorization") ?? "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);

  if (!match?.[1]) {
    response.status(401).json({ error: "Missing bearer token" });
    return;
  }

  try {
    request.user = verifySupabaseAccessToken(match[1], config.supabaseJwtSecret);
    next();
  } catch {
    response.status(401).json({ error: "Invalid Supabase token" });
  }
}
