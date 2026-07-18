// Serverless proxy for the Anthropic Messages API (Vercel-style handler).
// Keeps ANTHROPIC_API_KEY server-side; the browser calls /api/claude instead
// of api.anthropic.com directly.
//
// Env vars:
//   ANTHROPIC_API_KEY  (required) — your key
//   CLAUDE_MODEL       (optional) — overrides the model in every request;
//                       defaults to a current public model.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: { message: "Method not allowed" } });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: { message: "ANTHROPIC_API_KEY is not set on the server." } });
    return;
  }

  try {
    // req.body may be a parsed object (Vercel) or need reading (other runtimes).
    let body = req.body;
    if (!body || typeof body === "string") {
      const raw = typeof body === "string" ? body : await readStream(req);
      body = raw ? JSON.parse(raw) : {};
    }

    // Force a model the deploying key can actually access.
    body.model = process.env.CLAUDE_MODEL || "claude-sonnet-5";

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
}

function readStream(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}
