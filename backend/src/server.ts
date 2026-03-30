import express from "express";
import helmet from "helmet";

import { config } from "./config.js";
import { healthRouter } from "./routes/health.js";
import { syncRouter } from "./routes/sync.js";

const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(express.json({ limit: "250kb" }));

app.use("/health", healthRouter);
app.use("/sync", syncRouter);

app.use((_request, response) => {
  response.status(404).json({ error: "Not found" });
});

app.listen(config.port, () => {
  console.log(`Calendario sync backend listening on :${config.port}`);
});
