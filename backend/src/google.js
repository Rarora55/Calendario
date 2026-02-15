import { OAuth2Client } from "google-auth-library";

const GOOGLE_ISSUERS = new Set([
  "accounts.google.com",
  "https://accounts.google.com",
]);

const googleClient = new OAuth2Client();

export async function verifyGoogleIdToken(idToken, audiences) {
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: audiences,
  });

  const payload = ticket.getPayload();
  if (!payload) {
    throw new Error("Google payload not found");
  }

  if (!payload.iss || !GOOGLE_ISSUERS.has(payload.iss)) {
    throw new Error("Invalid token issuer");
  }

  if (!payload.sub || !payload.email) {
    throw new Error("Missing required claims");
  }

  if (!payload.email_verified) {
    throw new Error("Email is not verified");
  }

  return {
    id: payload.sub,
    email: payload.email,
    name: payload.name ?? payload.email,
    picture: payload.picture,
  };
}
