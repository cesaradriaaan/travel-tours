# AddyVenture Production Security Checklist

Complete this checklist again when the real frontend and backend domains are
known during deployment.

## Backend environment

- Set `NODE_ENV=production`.
- Set `SUPABASE_URL` and the backend-only `SUPABASE_SECRET_KEY`.
- Set `RESEND_API_KEY` and a verified `RESEND_FROM_EMAIL`.
- Set `ALLOWED_ORIGINS` to exact HTTPS frontend origins separated by commas.
- Do not use `*`, paths, query strings, or trailing application routes in
  `ALLOWED_ORIGINS`.
- Set `TRUST_PROXY_HOPS` to the exact value documented by the backend hosting
  provider. Keep it `0` locally and never configure blanket trust.
- Copy the reviewed `MAX_DAILY_*` usage budgets from `.env.example` into the
  production environment. Do not raise them without checking provider usage.

## Frontend environment

- Set `VITE_API_URL` to the public HTTPS backend URL.
- Set `VITE_SUPABASE_URL` and the frontend publishable/anon key only.
- Confirm no service-role key, Resend key, or backend secret is prefixed with
  `VITE_` or included in the built JavaScript.

## Hosting and transport

- Enforce HTTPS and redirect HTTP to HTTPS at the hosting layer.
- Verify HSTS is returned by the production API over HTTPS.
- Configure the frontend host's security headers after the final image/font/API
  domains are known; do not deploy an untested CSP that breaks the app.
- Confirm API responses include `Cache-Control: no-store` and do not expose
  `X-Powered-By` or ETag identifiers.

## Verification

- Approved frontend origin can call the API.
- An unapproved browser origin receives HTTP 403.
- Missing or malformed JSON gets a controlled JSON error.
- Unknown API routes return JSON 404.
- Login, contact, booking, voucher, cancellation, and admin rate limits work
  with the production proxy configuration.
- Client and admin authorization tests still pass.
- Booking idempotency still produces one booking for a repeated request key.
- Daily contact, booking, cancellation, voucher, and email budgets return a
  controlled HTTP 429 response when reached.
- Logs contain event names/status codes only, not passwords, tokens, request
  bodies, traveler details, or raw provider errors.
- Privacy/account data requests reach the admin messages workflow.

## Secrets

- Run the repository security-check script before each production release.
- Rotate a credential immediately if it is exposed in Git history, logs,
  screenshots, support messages, or frontend build output.
- Keep `.env` files, logs, `node_modules`, and frontend `dist` output untracked.
