import cors from "cors";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { config } from "./config.js";
import {
  issueAppAccessToken,
  requireAuth,
  requireSameUserParam,
} from "./auth.js";
import { verifyGoogleIdToken } from "./google.js";

const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(express.json({ limit: "16kb" }));

if (config.corsOrigins.length > 0) {
  app.use(cors({ origin: config.corsOrigins }));
}

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many login attempts, try again later." },
});

app.use(generalLimiter);

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

const verifyBodySchema = z.object({
  provider: z.literal("google"),
  idToken: z.string().min(20),
});

app.post("/auth/google/verify", authLimiter, async (req, res) => {
  const parsed = verifyBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request payload" });
    return;
  }

  try {
    const user = await verifyGoogleIdToken(
      parsed.data.idToken,
      config.googleAudiences
    );

    const accessToken = issueAppAccessToken(
      user,
      config.jwtSecret,
      config.jwtExpiresIn
    );

    res.json({
      user,
      session: {
        accessToken,
        tokenType: "Bearer",
      },
    });
  } catch {
    res.status(401).json({ error: "Token validation failed" });
  }
});

app.get("/me", requireAuth(config.jwtSecret), (req, res) => {
  res.json({
    user: req.user,
  });
});

app.get(
  "/users/:userId/calendars",
  requireAuth(config.jwtSecret),
  requireSameUserParam("userId"),
  (req, res) => {
    res.json({
      items: [],
      userId: req.user.id,
    });
  }
);

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.listen(config.port, () => {
  // Intentionally minimal startup log, with no tokens or PII.
  console.log(`Auth backend running on :${config.port}`);
});
