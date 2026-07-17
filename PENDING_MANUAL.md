# Pending manual

- [ ] **What to do:** Give the homepage FAQ one physical-keyboard smoke: Tab to a question and toggle it with Enter/Space.
  **Why blocked on Mike:** Browser checks passed at 375x812 and 1440x900 (pointer toggle, focus ring, answer spacing, and zero FAQ-local overflow), but the automation backend did not invoke the browser's native default action for synthetic Enter/Space events. The component uses native `<details>`/`<summary>` with no custom script.
  **Resumes:** Clears the final physical-keyboard interaction gate; production presence is already confirmed.

- [ ] **What to do:** In Cloudflare Pages dashboard (CompanySite project) set env var `N8N_LEAD_WEBHOOK_URL` = `https://michaelmurillo.app.n8n.cloud/webhook/m3-lead` (optionally `N8N_LEAD_WEBHOOK_SECRET` matching the n8n Header Auth), then redeploy.
  **Why blocked on Mike:** Cloudflare dashboard login. Code side is fully shipped — `functions/api/lead.ts` already calls `sendToN8n` (env-gated no-op until the var exists).
  **Resumes:** Every m3mm.net intake mirrors into the n8n M3 Lead OS workflow automatically.

