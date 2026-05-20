import fs from "node:fs";
import path from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin, ViteDevServer } from "vite";
import type { VercelRequest, VercelResponse } from "@vercel/node";

/** Static API entry files (relative to project root, leading slash stripped when resolving). */
const API_STATIC_ROUTES: Record<string, string> = {
  "/api/recovery-request": "api/recovery-request.ts",
  "/api/heritage-inquiry": "api/heritage-inquiry.ts",
  "/api/memory/public": "api/memory/public.ts",
  "/api/stripe/webhook": "api/stripe/webhook.ts",
  "/api/cron/weekly-health-send": "api/cron/weekly-health-send.ts",
  "/api/health/unsubscribe": "api/health/unsubscribe.ts",
};

type ResolvedRoute = { moduleRel: string; pathParam?: string };

function resolveApiRoute(pathname: string): ResolvedRoute | null {
  if (API_STATIC_ROUTES[pathname]) {
    return { moduleRel: API_STATIC_ROUTES[pathname] };
  }
  const circlePrefix = "/api/circle/";
  if (pathname.startsWith(circlePrefix)) {
    const rest = pathname.slice(circlePrefix.length).split("/")[0];
    if (!rest) return null;
    return { moduleRel: "api/circle/[path].ts", pathParam: rest };
  }
  const stripePrefix = "/api/stripe/";
  if (pathname.startsWith(stripePrefix)) {
    const rest = pathname.slice(stripePrefix.length).split("/")[0];
    if (!rest || rest === "webhook") return null;
    return { moduleRel: "api/stripe/[path].ts", pathParam: rest };
  }
  const shopifyPrefix = "/api/shopify/";
  if (pathname.startsWith(shopifyPrefix)) {
    const rest = pathname.slice(shopifyPrefix.length).split("/")[0];
    if (!rest) return null;
    return { moduleRel: "api/shopify/[path].ts", pathParam: rest };
  }
  return null;
}

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

function toVercelRequest(
  req: IncomingMessage,
  pathname: string,
  rawBody: string,
  pathParam?: string,
): VercelRequest {
  const url = new URL(req.url ?? pathname, "http://localhost");
  const query: Record<string, string | string[]> = {};
  url.searchParams.forEach((value, key) => {
    const existing = query[key];
    if (existing === undefined) query[key] = value;
    else if (Array.isArray(existing)) existing.push(value);
    else query[key] = [existing, value];
  });
  if (pathParam !== undefined) {
    query.path = pathParam;
  }

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

        const resolved = resolveApiRoute(pathname);
        if (!resolved || !req.method) {
          res.statusCode = 404;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "API route not found." }));
          return;
        }

        try {
          const rawBody = req.method === "GET" || req.method === "HEAD" ? "" : await readBody(req);
          const mod = await server.ssrLoadModule(path.resolve(root, resolved.moduleRel));
          const handler = mod.default as (req: VercelRequest, res: VercelResponse) => Promise<unknown>;
          const vercelReq = toVercelRequest(req, pathname, rawBody, resolved.pathParam);
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
