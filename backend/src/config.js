import "dotenv/config";

function parseIntWithDefault(value, fallback) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseCsv(value) {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function required(name, value) {
  if (!value || !value.trim()) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value.trim();
}

const googleAudiences = parseCsv(process.env.GOOGLE_OAUTH_AUDIENCES);

if (googleAudiences.length === 0) {
  throw new Error(
    "Missing GOOGLE_OAUTH_AUDIENCES. Provide at least one Google OAuth client ID."
  );
}

export const config = {
  port: parseIntWithDefault(process.env.PORT, 4000),
  jwtSecret: required("APP_JWT_SECRET", process.env.APP_JWT_SECRET),
  jwtExpiresIn: (process.env.JWT_EXPIRES_IN ?? "1h").trim(),
  googleAudiences,
  corsOrigins: parseCsv(process.env.CORS_ORIGINS),
};
