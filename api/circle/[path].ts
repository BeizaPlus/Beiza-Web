import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  DEFER_HEALTH_BILLING,
  DEFER_PERSONA_CHAT,
  respondDeferred,
} from "../lib/deployDeferred.js";

import recordMemory from "../../server/vercel-handlers/circle/record-memory.js";
import treeData from "../../server/vercel-handlers/circle/tree-data.js";
import treeEdge from "../../server/vercel-handlers/circle/tree-edge.js";
import treePerson from "../../server/vercel-handlers/circle/tree-person.js";
import treePersonDuplicate from "../../server/vercel-handlers/circle/tree-person-duplicate.js";
import treePersonPhoto from "../../server/vercel-handlers/circle/tree-person-photo.js";
import treePosition from "../../server/vercel-handlers/circle/tree-position.js";
import verifyCode from "../../server/vercel-handlers/circle/verify-code.js";

// Deferred for ship-now deploy (re-enable in deployDeferred.ts):
// import healthPatterns from "../../server/vercel-handlers/circle/health-patterns.js";
// import personaChat from "../../server/vercel-handlers/circle/persona-chat.js";
// import personHealth from "../../server/vercel-handlers/circle/person-health.js";

type Handler = (req: VercelRequest, res: VercelResponse) => void | Promise<unknown>;

const DEFERRED_ROUTE_LABELS: Record<string, string> = {
  "persona-chat": "AI persona chat",
  "person-health": "Person health records",
  "health-patterns": "Health patterns",
};

const ROUTES: Record<string, Handler> = {
  "verify-code": verifyCode,
  "tree-data": treeData,
  "tree-edge": treeEdge,
  "tree-position": treePosition,
  "tree-person": treePerson,
  "tree-person-photo": treePersonPhoto,
  "tree-person-duplicate": treePersonDuplicate,
  "record-memory": recordMemory,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const raw = req.query.path;
  const segment = typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : "";
  const key = (segment ?? "").trim();

  const deferredLabel = DEFERRED_ROUTE_LABELS[key];
  if (deferredLabel) {
    if (key === "persona-chat" && DEFER_PERSONA_CHAT) {
      return respondDeferred(res, deferredLabel);
    }
    if ((key === "person-health" || key === "health-patterns") && DEFER_HEALTH_BILLING) {
      return respondDeferred(res, deferredLabel);
    }
  }

  const run = ROUTES[key];
  if (!run) {
    res.setHeader("Content-Type", "application/json");
    return res.status(404).json({ error: "Unknown circle API route." });
  }
  return run(req, res);
}
