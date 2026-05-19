import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

type RecoveryBody = {
  deceased_name?: string;
  deceased_contact?: string;
  requester_relation?: string;
  requester_email?: string;
  message?: string;
  document_base64?: string;
  document_filename?: string;
  document_content_type?: string;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error("[recovery-request] Missing Supabase env");
    return res.status(500).json({
      error: "Server configuration missing. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    });
  }

  const body = (typeof req.body === "string" ? JSON.parse(req.body) : req.body) as RecoveryBody;

  const deceasedName = body.deceased_name?.trim();
  const deceasedContact = body.deceased_contact?.trim();
  const requesterRelation = body.requester_relation?.trim();
  const requesterEmail = body.requester_email?.trim();

  if (!deceasedName || !deceasedContact || !requesterRelation || !requesterEmail) {
    return res.status(400).json({
      error: "Name, contact, relationship, and your email are required.",
    });
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let documentUrl: string | null = null;

  if (body.document_base64 && body.document_filename) {
    const buffer = Buffer.from(body.document_base64, "base64");
    const safeName = body.document_filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from("recovery-documents")
      .upload(path, buffer, {
        contentType: body.document_content_type ?? "application/octet-stream",
        upsert: false,
      });

    if (uploadError) {
      console.error("[recovery-request] upload:", uploadError);
    } else {
      const { data: publicUrl } = supabase.storage.from("recovery-documents").getPublicUrl(path);
      documentUrl = publicUrl.publicUrl;
    }
  }

  const { error } = await supabase.from("recovery_requests").insert({
    deceased_name: deceasedName,
    deceased_contact: deceasedContact,
    requester_relation: requesterRelation,
    requester_email: requesterEmail,
    document_url: documentUrl,
    message: body.message?.trim() || null,
    status: "pending",
  });

  if (error) {
    console.error("[recovery-request] insert:", error);
    return res.status(500).json({ error: "Could not save your request. Please try again." });
  }

  res.setHeader("Access-Control-Allow-Origin", "*");
  return res.status(200).json({ ok: true });
}
