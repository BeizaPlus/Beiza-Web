import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Resend } from "resend";
import { getSupabaseAdmin } from "../lib/supabaseAdmin";
import { signHealthUnsubscribe } from "../lib/healthUnsubscribe";

/** Cron: advance weekly health question and queue per-recipient send logs. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const cronSecret = process.env.CRON_SECRET;
  const auth = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (cronSecret && auth !== cronSecret) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) return res.status(500).json({ error: "Server configuration missing." });

  const resendKey = process.env.VITE_RESEND_API_KEY ?? process.env.RESEND_API_KEY;
  const fromEmail =
    process.env.VITE_RESEND_FROM_EMAIL ?? process.env.RESEND_FROM_EMAIL ?? "noreply@beizaplus.com";
  const appUrl = process.env.VITE_APP_URL ?? "https://beizaplus.com";

  const { data: circles } = await supabase.from("family_circles").select("id, name");
  let sent = 0;
  let failed = 0;

  for (const circle of circles ?? []) {
    const { data: cadence } = await supabase
      .from("circle_health_cadence")
      .select("current_week_number")
      .eq("circle_id", circle.id)
      .maybeSingle();

    const weekNumber = cadence?.current_week_number ?? 1;
    const slot = ((weekNumber - 1) % 52) + 1;
    const questionId = `wk${String(slot).padStart(2, "0")}`;

    const { data: question } = await supabase
      .from("health_question_bank")
      .select("prompt")
      .eq("id", questionId)
      .eq("retired", false)
      .maybeSingle();

    if (!question) continue;

    await supabase.from("health_question_weeks").upsert(
      {
        circle_id: circle.id,
        week_number: weekNumber,
        question_id: questionId,
        sent_at: new Date().toISOString(),
      },
      { onConflict: "circle_id,week_number" },
    );

    const recipients = await collectRecipients(supabase, circle.id);
    const resend = resendKey ? new Resend(resendKey) : null;

    for (const email of recipients) {
      const { data: optOut } = await supabase
        .from("health_question_opt_outs")
        .select("email")
        .eq("email", email.toLowerCase())
        .maybeSingle();
      if (optOut) continue;

      const { data: existing } = await supabase
        .from("health_question_send_log")
        .select("status")
        .eq("circle_id", circle.id)
        .eq("week_number", weekNumber)
        .eq("email", email.toLowerCase())
        .maybeSingle();

      if (existing?.status === "sent") continue;

      const unsub = `${appUrl}/api/health/unsubscribe?token=${signHealthUnsubscribe(email, circle.id)}`;
      const treeUrl = `${appUrl}/circle/${circle.id}/enter`;

      try {
        if (resend) {
          await resend.emails.send({
            from: fromEmail,
            to: email,
            subject: `This week's family health question — ${circle.name}`,
            html: `<p>${question.prompt}</p><p><a href="${treeUrl}">Open your family circle</a> to answer for your relatives.</p><p style="font-size:12px;color:#888"><a href="${unsub}">Unsubscribe</a> from weekly health questions.</p>`,
          });
        }

        await supabase.from("health_question_send_log").upsert(
          {
            circle_id: circle.id,
            week_number: weekNumber,
            email: email.toLowerCase(),
            status: resend ? "sent" : "pending",
            sent_at: resend ? new Date().toISOString() : null,
            error: resend ? null : "RESEND_API_KEY not set",
          },
          { onConflict: "circle_id,week_number,email" },
        );
        if (resend) sent += 1;
      } catch (err) {
        failed += 1;
        await supabase.from("health_question_send_log").upsert(
          {
            circle_id: circle.id,
            week_number: weekNumber,
            email: email.toLowerCase(),
            status: "failed",
            error: err instanceof Error ? err.message : String(err),
          },
          { onConflict: "circle_id,week_number,email" },
        );
      }
    }

    await supabase.from("circle_health_cadence").upsert({
      circle_id: circle.id,
      current_week_number: weekNumber + 1,
      updated_at: new Date().toISOString(),
    });
  }

  return res.status(200).json({ ok: true, sent, failed, circles: circles?.length ?? 0 });
}

async function collectRecipients(
  supabase: NonNullable<ReturnType<typeof getSupabaseAdmin>>,
  circleId: string,
) {
  const emails = new Set<string>();

  const { data: members } = await supabase
    .from("family_members")
    .select("user_id")
    .eq("circle_id", circleId);

  for (const m of members ?? []) {
    if (!m.user_id) continue;
    const { data: user } = await supabase.auth.admin.getUserById(m.user_id);
    if (user?.user?.email) emails.add(user.user.email.toLowerCase());
  }

  const { data: codeMembers } = await supabase
    .from("circle_members")
    .select("email, user_id")
    .eq("circle_id", circleId);

  for (const cm of codeMembers ?? []) {
    if (cm.email) emails.add(cm.email.toLowerCase());
    else if (cm.user_id) {
      const { data: user } = await supabase.auth.admin.getUserById(cm.user_id);
      if (user?.user?.email) emails.add(user.user.email.toLowerCase());
    }
  }

  return [...emails];
}
