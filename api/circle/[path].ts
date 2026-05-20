import type { VercelRequest, VercelResponse } from "@vercel/node";

import healthPatterns from "../../server/vercel-handlers/circle/health-patterns.js";
import personaChat from "../../server/vercel-handlers/circle/persona-chat.js";
import personHealth from "../../server/vercel-handlers/circle/person-health.js";
import recordMemory from "../../server/vercel-handlers/circle/record-memory.js";
import treeData from "../../server/vercel-handlers/circle/tree-data.js";
import treeEdge from "../../server/vercel-handlers/circle/tree-edge.js";
import treePerson from "../../server/vercel-handlers/circle/tree-person.js";
import treePersonDuplicate from "../../server/vercel-handlers/circle/tree-person-duplicate.js";
import treePersonPhoto from "../../server/vercel-handlers/circle/tree-person-photo.js";
import treePosition from "../../server/vercel-handlers/circle/tree-position.js";
import verifyCode from "../../server/vercel-handlers/circle/verify-code.js";

type Handler = (req: VercelRequest, res: VercelResponse) => void | Promise<unknown>;

const ROUTES: Record<string, Handler> = {
  "verify-code": verifyCode,
  "tree-data": treeData,
  "tree-edge": treeEdge,
  "tree-position": treePosition,
  "tree-person": treePerson,
  "tree-person-photo": treePersonPhoto,
  "tree-person-duplicate": treePersonDuplicate,
  "record-memory": recordMemory,
  "persona-chat": personaChat,
  "person-health": personHealth,
  "health-patterns": healthPatterns,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const raw = req.query.path;
  const segment = typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : "";
  const key = (segment ?? "").trim();
  const run = ROUTES[key];
  if (!run) {
    res.setHeader("Content-Type", "application/json");
    return res.status(404).json({ error: "Unknown circle API route." });
  }
  return run(req, res);
}
