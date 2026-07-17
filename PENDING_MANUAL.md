# Pending manual

- [ ] **What to do:** Give the homepage FAQ one physical-keyboard smoke: Tab to a question and toggle it with Enter/Space.
  **Why blocked on Mike:** Browser checks passed at 375x812 and 1440x900 (pointer toggle, focus ring, answer spacing, and zero FAQ-local overflow), but the automation backend did not invoke the browser's native default action for synthetic Enter/Space events. The component uses native `<details>`/`<summary>` with no custom script.
  **Resumes:** Clears the final interaction gate before the FAQ changes can be committed and deployed.
