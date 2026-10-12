# Contact form backend for amandata.org

Makes the Contact section actually send email instead of opening the
visitor's mail app. Stack: Supabase table + edge function + Resend.
Everything here is free-tier friendly.

## What was built

- `contact-messages.sql` — a `contact_messages` table. Row-level security
  is on with **no public policies**: only the edge function (service_role)
  can read/write it. Visitors submit through the function, which validates.
- `functions/send-contact/index.ts` — the edge function. Validates the
  fields, stores the message, emails it to ata3958@sdsu.edu via Resend,
  marks the row emailed.

## Setup (about 15 minutes, all in the browser)

### 1. Create the table
1. Open the Supabase dashboard for the **amandata-blog** project.
2. SQL Editor -> New query.
3. Paste the contents of `contact-messages.sql` -> Run.

### 2. Get a Resend API key (free)
1. Sign up at https://resend.com with **ata3958@sdsu.edu**.
2. API Keys -> Create API Key -> copy it.
3. Free tier sends 100 emails/day. Without verifying a domain, Resend only
   delivers to your own signup email — which is exactly our recipient, so
   it works as-is.
4. (Optional, nicer) Verify `amandata.org` in Resend (Domains -> Add,
   add the DNS TXT records), then mail can come `from contact@amandata.org`
   instead of `onboarding@resend.dev`.

### 3. Deploy the edge function
1. Supabase dashboard -> Edge Functions -> New function, name it
   `send-contact`.
2. Paste the contents of `functions/send-contact/index.ts` -> Deploy.
3. Open the function -> Secrets -> add `RESEND_API_KEY` = the key from
   step 2. (If you verified the domain, also add
   `CONTACT_FROM` = `contact@amandata.org`.)

### 4. Point the site at it
Tell me when steps 1–3 are done and I'll push the frontend change:
`script.js` will POST the form to
`https://latblgczhvpmvhuewczt.supabase.co/functions/v1/send-contact`
instead of the mailto link. Same fields, same validation, same look —
the status line just says "Sending…" then "Thanks — your message is on
its way."

### Testing
Submit the form on https://amandata.org/ once live. You should get the
email within a minute, and a row appears in `contact_messages` with
`emailed = true`. If email fails but the row saves, the message is still
in the table — nothing is lost.
