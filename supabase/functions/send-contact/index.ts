// Edge function: send-contact
// Receives the amandata.org contact form, stores it in `contact_messages`,
// and emails it to ata3958@sdsu.edu via Resend.
//
// Deploy: Supabase dashboard -> Edge Functions -> New function -> name it
// `send-contact` -> paste this file -> Deploy.
// Secrets: Edge Functions -> send-contact -> Secrets -> add:
//   RESEND_API_KEY = <key from resend.com>
// Optional secret:
//   CONTACT_FROM   = contact@amandata.org   (after verifying the domain in
//                    Resend; defaults to onboarding@resend.dev, which works
//                    on Resend's free tier when sending to your own email)

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const TO_EMAIL = "ata3958@sdsu.edu";
const ALLOWED_ORIGINS = [
  "https://amandata.org",
  "https://www.amandata.org",
  "https://mandyhoami-lab.github.io",
];

function corsHeaders(origin: string | null) {
  const allow = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  const headers = { "Content-Type": "application/json", ...corsHeaders(origin) };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method not allowed" }), { status: 405, headers });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "invalid json" }), { status: 400, headers });
  }

  const name = String(body.name ?? "").trim();
  const company = String(body.company ?? "").trim();
  const email = String(body.email ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const message = String(body.message ?? "").trim();

  if (!name || name.length > 128) {
    return new Response(JSON.stringify({ error: "name is required (max 128 chars)" }), { status: 400, headers });
  }
  if (!EMAIL_RE.test(email) || email.length > 128) {
    return new Response(JSON.stringify({ error: "a valid email is required" }), { status: 400, headers });
  }
  if (!message || message.length > 16384) {
    return new Response(JSON.stringify({ error: "message is required (max 16384 chars)" }), { status: 400, headers });
  }
  if (company.length > 128 || phone.length > 28) {
    return new Response(JSON.stringify({ error: "field too long" }), { status: 400, headers });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: row, error: dbError } = await supabase
    .from("contact_messages")
    .insert({ name, company: company || null, email, phone: phone || null, message })
    .select("id")
    .single();

  if (dbError) {
    console.error("db insert failed", dbError);
    return new Response(JSON.stringify({ error: "could not save message" }), { status: 500, headers });
  }

  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!resendKey) {
    console.error("RESEND_API_KEY secret not set");
    return new Response(JSON.stringify({ error: "email not configured" }), { status: 500, headers });
  }

  const from = Deno.env.get("CONTACT_FROM") || "onboarding@resend.dev";
  const subject = `Website contact from ${name}${company ? ` (${company})` : ""}`;
  const lines = [message, "", `— ${name}`];
  if (company) lines.push(company);
  lines.push(`Email: ${email}`);
  if (phone) lines.push(`Phone: ${phone}`);

  const emailRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: TO_EMAIL,
      reply_to: email,
      subject,
      text: lines.join("\n"),
    }),
  });

  if (!emailRes.ok) {
    const detail = await emailRes.text();
    console.error("resend failed", emailRes.status, detail);
    return new Response(JSON.stringify({ error: "could not send email" }), { status: 502, headers });
  }

  await supabase.from("contact_messages").update({ emailed: true }).eq("id", row.id);

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
});
