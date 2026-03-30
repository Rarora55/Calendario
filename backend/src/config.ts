import "dotenv/config";

function required(name: string, value: string | undefined) {
  if (!value?.trim()) {
    throw new Error(`Missing required env var: ${name}`);
  }

  return value.trim();
}

function parsePort(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const config = {
  port: parsePort(process.env.PORT, 4000),
  databaseUrl: required("DATABASE_URL", process.env.DATABASE_URL),
  directUrl: required("DIRECT_URL", process.env.DIRECT_URL),
  supabaseJwtSecret: required("SUPABASE_JWT_SECRET", process.env.SUPABASE_JWT_SECRET),
};
