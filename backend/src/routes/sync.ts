import { Router } from "express";

import { requireSupabaseAuth } from "../middleware/auth.js";
import { bootstrapRequestSchema, changesRequestSchema } from "../schemas/syncSchemas.js";
import { bootstrapSync, syncChanges } from "../services/syncService.js";

export const syncRouter = Router();

syncRouter.post("/bootstrap", requireSupabaseAuth, async (request, response) => {
  const parsed = bootstrapRequestSchema.safeParse(request.body);
  if (!parsed.success || !request.user) {
    response.status(400).json({ error: "Invalid bootstrap payload" });
    return;
  }

  try {
    const result = await bootstrapSync(request.user, parsed.data.payload);
    response.json(result);
  } catch (error) {
    const statusCode = (error as Error & { statusCode?: number }).statusCode ?? 500;
    response.status(statusCode).json({ error: (error as Error).message });
  }
});

syncRouter.post("/changes", requireSupabaseAuth, async (request, response) => {
  const parsed = changesRequestSchema.safeParse(request.body);
  if (!parsed.success || !request.user) {
    response.status(400).json({ error: "Invalid sync payload" });
    return;
  }

  try {
    const result = await syncChanges(request.user, parsed.data.changes, parsed.data.cursor ?? null);
    response.json(result);
  } catch (error) {
    response.status(500).json({ error: (error as Error).message });
  }
});
