# Security Specification — STAI Al-Furqan Makassar Portal & CMS

## 1. Data Invariants

1. **Public Institutional Read / Admin-Only Content Mutation**: Public university catalog collections (`site_settings`, `programs`, `agenda`, `testimonials`) are readable by all visitors; `posts` only expose `status == 'published'` documents publicly; `notifications` only expose `active == true` broadcasts publicly. Only verified administrators (`email_verified == true`) can create, edit, or delete CMS content.
2. **Zero Email Spoofing**: Bootstrapped admin access (`fathurelgani@gmail.com`) strictly requires `request.auth.token.email_verified == true`.
3. **Strict Schema & Size Bounds**: Every string field enforces exact `minLength`/`maxLength` limits matching `firebase-blueprint.json`; every write enforces `keys().hasAll(...)` and `keys().hasOnly(...)` to block shadow fields.
4. **Temporal & Identity Integrity**: Every creation requires `createdAt == request.time` and `authorId == request.auth.uid` (or `updatedBy`/`actorId`/`addedBy == request.auth.uid`). Every update enforces immutable `createdAt`/`authorId` and `updatedAt == request.time`.
5. **Path Variable Hardening**: Every single-document target (`get`, `create`, `update`, `delete`) validates `isValidId(id)` (`^[a-zA-Z0-9_\-]+$`, max 128 chars).
6. **Zero Unauthenticated Analytics Writes**: `analytics_events` requires verified authentication with `actorId == request.auth.uid`, and `analytics_daily` is restricted strictly to verified admins.
7. **PII Isolation**: No visitor emails, phone numbers, or personal profiles are exposed publicly; the `admins` collection stores only display names, roles, and audit metadata and is strictly restricted to verified admins.

## 2. The "Dirty Dozen" Adversarial Payloads

1. **Unauthenticated CMS Post Creation**: Anonymous request attempts `create` on `/posts/hack-1`. Expected: `PERMISSION_DENIED`.
2. **Email Spoof Admin Escalation**: Authenticated user with `email: "fathurelgani@gmail.com"` and `email_verified: false` attempts `update` on `/site_settings/main`. Expected: `PERMISSION_DENIED`.
3. **Shadow Field Injection on Program**: Verified admin sends valid `AcademicProgram` payload plus extra ghost field `isSuperVerified: true`. Expected: `PERMISSION_DENIED`.
4. **ID Poisoning Attack**: Verified admin attempts `create` on `/posts/../../admin$poison` or a 200-char ID. Expected: `PERMISSION_DENIED`.
5. **Identity Spoofing on Post**: Verified admin attempts `create` on `/posts/post-1` with `authorId: "other-user-uid"`. Expected: `PERMISSION_DENIED`.
6. **Client Timestamp Forgery**: Verified admin attempts `create` on `/agenda/evt-1` with `createdAt` set to a past client date instead of `request.time`. Expected: `PERMISSION_DENIED`.
7. **Immutable Field Tampering**: Verified admin updates `/posts/post-1` and attempts to overwrite `createdAt` or `authorId`. Expected: `PERMISSION_DENIED`.
8. **Value Poisoning (Oversized Payload)**: Verified admin attempts `update` on `/posts/post-1` with a 15,000-character `content` string (exceeding `maxLength: 12000`). Expected: `PERMISSION_DENIED`.
9. **Draft Post Scraping by Public Visitor**: Unauthenticated user attempts `get` on `/posts/draft-secret` where `status == "draft"`. Expected: `PERMISSION_DENIED`.
10. **Non-Admin Self-Promotion**: Verified regular user attempts `create` on `/admins/{theirUid}` with `role: "super_admin"`. Expected: `PERMISSION_DENIED`.
11. **Analytics Event Forgery**: Verified regular user attempts `create` on `/analytics_events/ev-1` with `actorId: "victim-uid"`. Expected: `PERMISSION_DENIED`.
12. **Terminal State Bypass on Completed Agenda**: Non-admin attempts `update` on `/agenda/evt-done` where `status == "completed"`. Expected: `PERMISSION_DENIED`.
