# M³ Lead OS (n8n)

Turns every CompanySite intake (`POST /api/lead`) into a triage pipeline: score → hot alert → optional CRM row → 48h “did you reply?” nudge.

CompanySite already emails you + the lead via Resend. **n8n does not replace that.** It stops leads from dying in your inbox.

## What ships in-repo

| Piece | Path |
|---|---|
| Optional CF → n8n forward | `functions/_lib/n8n-sink.ts` (called from `functions/api/lead.ts`) |
| Importable workflow | `n8n/m3-lead-os.json` |
| Tests | `tests/functions/n8n-sink.test.ts` |

## Setup (≈15 min)

### 1. Import the workflow

1. Open n8n (Cloud or self-host).
2. **Workflows → Import from File** → `CompanySite/n8n/m3-lead-os.json`.
3. Open **Lead Webhook** → set path `m3-leads` (already set) → **Activate**.
4. Copy the **Production** webhook URL (not Test).

### 2. Optional shared secret

In n8n env (or workflow static data):

- `M3_WEBHOOK_SECRET` = a long random string

In Cloudflare Pages → CompanySite → Settings → Environment variables (Production):

- `N8N_LEAD_WEBHOOK_URL` = the Production webhook URL from step 1
- `N8N_LEAD_WEBHOOK_SECRET` = same string as `M3_WEBHOOK_SECRET`

Redeploy Pages (or wait for next git deploy) so the Worker picks up the vars.

### 3. Wire alert channels (you)

After **Normalize + draft** / **Hot lead?**, add nodes you already use:

- **Gmail / Outlook / Email** → `subject` + `text` to yourself  
- **Discord / Slack** → HTTP Request with `{{$json.text}}`  
- **Google Sheets** → append: `receivedAt`, name, email, businessType, score, hot, URL, UTMs, id  
- After **Reminder copy** → email yourself `reminderSubject` / `reminderText`

Hot branch: same nodes, louder subject (🔥) or Twilio SMS.

### 4. Smoke test

```bash
curl -sS -X POST "https://m3mm.net/api/lead" \
  -H "Content-Type: application/json" \
  -H "Origin: https://m3mm.net" \
  -d "{\"name\":\"n8n smoke\",\"email\":\"you@example.com\",\"businessType\":\"Test\",\"frustration\":\"Need a real site that books jobs instead of DMs at midnight.\",\"source\":\"n8n-smoke\",\"intent\":\"website review\",\"honeypot\":\"\"}"
```

Expect: Resend still works · n8n execution appears · Cloudflare log line includes `"n8n":{"ok":true,...}` (or `skipped` if env unset).

## Payload shape (what n8n receives)

```json
{
  "event": "m3.lead.received",
  "id": "lead_xxxxxxxx",
  "score": 75,
  "hot": true,
  "triage": "HOT — reply within a few hours if you can.",
  "lead": {
    "name": "...",
    "email": "...",
    "businessType": "...",
    "currentUrl": "...",
    "frustration": "...",
    "source": "hero",
    "intent": "...",
    "utm_source": "tiktok"
  },
  "ip": "...",
  "receivedAt": "ISO-8601",
  "replyHint": "Hey … suggested short reply …"
}
```

## Dark launch

With `N8N_LEAD_WEBHOOK_URL` unset, `/api/lead` behaves exactly as before (Resend + Cockpit sink only). Safe to merge before n8n is ready.
