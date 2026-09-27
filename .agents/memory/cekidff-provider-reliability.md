---
name: Free Fire UID lookup reliability
description: The public isan Free Fire nickname endpoint can return success for arbitrary input without a nickname, so responses need strict profile validation.
---

Never treat `success: true` or an echoed UID as proof that a Free Fire player exists. A lookup is verified only when the response contains a non-empty nickname and the returned UID matches the requested numeric UID. If providers fail, report the service as unavailable rather than inventing a profile.

**Why:** The public endpoint returned successful responses for zero, text, and arbitrary long IDs while omitting player identity data.

**How to apply:** Validate numeric UID input before calling providers, require nickname plus matching UID, and keep fallback providers behind the same validation.