# Security Review

**Scope:** `A/` (Viziune Urbană Ploiești) and the sibling portfolio project
`D:\Antigravity\portofoliu-tiberiu`

**Date:** 2026-10-09

## Findings

| # | Severity | Project / File | Lines | Finding | Confidence |
|---|----------|----------------|-------|---------|------------|
| 1 | HIGH | `A/.env.local` | 1-7 | The local environment file contains active-looking Supabase service-role, administrator, and Resend credentials. The file is ignored and not tracked, but all values should be rotated if this workspace or any backup may have been exposed. | 10/10 |
| 2 | MEDIUM | `A/src/lib/email.ts` | 43-49, 68, 229-245 | User-controlled values are interpolated into HTML email templates without contextual HTML escaping, allowing crafted submissions to alter administrator or citizen emails. | 9/10 |
| 3 | MEDIUM | `A/src/app/api/public/data/route.ts`; `A/src/lib/db.ts` | 13-36; 61-75 | The unauthenticated, publicly cacheable data endpoint exposes exact association addresses and problem descriptions. These fields may reveal location-sensitive or personal information. | 9/10 |
| 4 | MEDIUM | `A/src/app/api/donation/route.ts`; `A/src/lib/db.ts` | 100-123; 547-571 | Donation persistence failures are treated as success. The endpoint can return HTTP 201 even when the record was not stored, causing silent loss of financial or material donation requests. | 10/10 |
| 5 | MEDIUM | `A/package-lock.json` | 5031-5085, 5401-5424, 5906-5920 | Dependency audit reported vulnerable PostCSS and `source-map-js` versions. The exposure is primarily build-time and direct production exploitability was not confirmed. | 8/10 |

## Clean checks

- `A`: `npm run lint` passed.
- `A`: `npm run build` passed.
- Portfolio: `npm run build` passed.
- Portfolio: `npm audit --omit=dev` reported zero vulnerabilities.
- No tracked `.env.local` file was found in the Viziune Urbană repository.
- Administrative API routes require the signed admin session.
- Admin cookies use `HttpOnly`, `SameSite=Lax`, and `Secure` in production.
- Public intake routes use schema validation, honeypots, and request limits.
- Portfolio email templates escape user-controlled values before HTML interpolation.
- Portfolio deployment configuration includes HSTS, CSP, frame protection, referrer policy, and permissions policy headers.

## Recommended remediation order

1. Rotate all credentials in `A/.env.local` and verify deployment/backup exposure.
2. Add contextual escaping to every dynamic value in `A/src/lib/email.ts`.
3. Remove exact addresses and problem descriptions from the public cached response.
4. Await donation persistence and propagate database failures as an error.
5. Upgrade the affected dependency chain and regenerate the lockfile.
6. Replace in-memory rate limiting with a distributed limiter in production.
