import type { VercelRequest, VercelResponse } from "@vercel/node";

import products from "../../server/vercel-handlers/shopify/products.js";
import proxy from "../../server/vercel-handlers/shopify/proxy.js";

type Handler = (req: VercelRequest, res: VercelResponse) => void | Promise<unknown>;

const ROUTES: Record<string, Handler> = {
  products,
  proxy,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const raw = req.query.path;
  const segment = typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : "";
  const key = (segment ?? "").trim();
  const run = ROUTES[key];
  if (!run) {
    res.setHeader("Content-Type", "application/json");
    return res.status(404).json({ error: "Unknown Shopify API route." });
  }
  return run(req, res);
}
