---
name: NovaMail provider behavior
description: External behavior and reliability constraints for the NovaMail temporary-mail API
---

NovaMail's public API uses the `nm_sess`/`nm_sess.sig` cookie pair for mailbox sessions. When a bot process restores a saved session, the first inbox request should also send the saved mailbox as the `restore` query hint; otherwise the service may assign a different mailbox after a restart or instance change.

**Why:** The provider is session-backed and serverless; cookie persistence alone was not sufficient to guarantee mailbox identity during a process restore.

**How to apply:** Keep the provider adapter responsible for cookie serialization and one-time restore hints. Treat a response with HTTP 500 and an error mentioning upstream 429/busy as a rate-limit condition, back off polling, and surface a readable retry message instead of silently reporting an empty inbox.