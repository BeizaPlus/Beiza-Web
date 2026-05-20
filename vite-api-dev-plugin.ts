import fs from "node:fs";
import path from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin, ViteDevServer } from "vite";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const API_ROUTES: Record<string, string> = {
  "/api/circle/verify-code": "/api/circle/verify-code.ts",
  "/api/circle/tree-data": "/api/circle/tree-data.ts",
  "/api/circle/tree-edge": "/api/circle/tree-edge.ts",
  "/api/circle/tree-position": "/api/circle/tree-position.ts",
  "/api/circle/tree-person": "/api/circle/tree-person.ts",
  "/api/circle/tree-person-photo": "/api/circle/tree-person-photo.ts",
  "/api/circle/tree-person-duplicate": "/api/circle/tree-person-duplicate.ts",
  "/api/circle/record-memory": "/api/circle/record-memory.ts",
  "/api/recovery-request": "/api/recovery-request.ts",
  "/api/heritage-inquiry": "/api/heritage-inquiry.ts",
  "/api/memory/public": "/api/memory/public.ts",
  "/api/circle/persona-chat": "/api/circle/persona-chat.ts",
};

function loadDevEnv() {
  const envPath = path.resolve(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    if (!line || line.startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i < 0) continue;
    const key = line.slice(0, i).trim();
    const value = line.slice(i + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
  process.env.SUPABASE_URL ??= process.env.VITE_SUPABASE_URL;
  process.env.SUPABASE_SERVICE_ROLE_KEY ??=
    process.env.VITE_SUPABASE_PRIVILEGED_KEY ?? process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (c) => chunks.push(Buffer.from(c)));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function toVercelRequest(req: IncomingMessage, pathname: string, rawBody: string): VercelRequest {
  const url = new URL(req.url ?? pathname, "http://localhost");
  const query: Record<string, string | string[]> = {};
  url.searchParams.forEach((value, key) => {
    const existing = query[key];
    if (existing === undefined) query[key] = value;
    else if (Array.isArray(existing)) existing.push(value);
    else query[key] = [existing, value];
  });

  let body: unknown = rawBody;
  if (rawBody && req.headers["content-type"]?.includes("application/json")) {
    try {
      body = JSON.parse(rawBody);
    } catch {
      body = rawBody;
    }
  }

  return {
    method: req.method,
    url: req.url,
    headers: req.headers as VercelRequest["headers"],
    query,
    body,
  } as VercelRequest;
}

function toVercelResponse(res: ServerResponse): VercelResponse {
  let statusCode = 200;
  const vercelRes = {
    status(code: number) {
      statusCode = code;
      return vercelRes;
    },
    setHeader(name: string, value: string) {
      res.setHeader(name, value);
      return vercelRes;
    },
    json(payload: unknown) {
      if (!res.headersSent) {
        res.statusCode = statusCode;
        res.setHeader("Content-Type", "application/json");
      }
      res.end(JSON.stringify(payload));
      return vercelRes;
    },
    end(payload?: string) {
      if (!res.headersSent) res.statusCode = statusCode;
      res.end(payload);
      return vercelRes;
    },
  };
  return vercelRes as VercelResponse;
}

export function vercelApiDevPlugin(): Plugin {
  return {
    name: "beiza-vercel-api-dev",
    enforce: "pre",
    configureServer(server: ViteDevServer) {
      loadDevEnv();
      const root = process.cwd();

      server.middlewares.use(async (req, res, next) => {
        const pathname = (req.url ?? "").split("?")[0];
        if (!pathname.startsWith("/api/")) return next();

        const moduleRel = API_ROUTES[pathname];
        if (!moduleRel || !req.method) {
          res.statusCode = 404;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "API route not found." }));
          return;
        }

        try {
          const rawBody = req.method === "GET" || req.method === "HEAD" ? "" : await readBody(req);
          const mod = await server.ssrLoadModule(path.resolve(root, moduleRel.slice(1)));
          const handler = mod.default as (req: VercelRequest, res: VercelResponse) => Promise<unknown>;
          const vercelReq = toVercelRequest(req, pathname, rawBody);
          await handler(vercelReq, toVercelResponse(res));
        } catch (err) {
          console.error("[api-dev]", pathname, err);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: err instanceof Error ? err.message : "API error" }));
          }
        }
      });
    },
  };
}
