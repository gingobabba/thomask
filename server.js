// Self-hosting option: one Node process that serves both the built app and the
// Anthropic proxy. Run `npm run build` first, then `node server.js`.
//
// Env vars:
//   ANTHROPIC_API_KEY  (required)
//   CLAUDE_MODEL       (optional) — defaults to a current public model
//   PORT               (optional) — defaults to 8787

import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json({ limit: "1mb" }));

app.post("/api/claude", async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: { message: "ANTHROPIC_API_KEY is not set." } });
  }
  try {
    const body = { ...req.body, model: process.env.CLAUDE_MODEL || "claude-sonnet-5" };
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err) {
    res.status(500).json({ error: { message: err.message || "Proxy error" } });
  }
});

// Serve the production build.
app.use(express.static(path.join(__dirname, "dist")));
app.get("*", (_req, res) => res.sendFile(path.join(__dirname, "dist", "index.html")));

const port = process.env.PORT || 8787;
app.listen(port, () => console.log(`Thomask's field record running on http://localhost:${port}`));
