# AddyVenture Cost and Usage Guardrails

Last reviewed: September 17, 2026

This document separates application-level safety limits from provider billing
controls. Application limits reduce abuse and accidental loops. Provider quotas
or spend controls remain the authoritative protection across server restarts and
multiple backend instances.

## Application defaults

| Action | Short-window limit | Daily guardrail |
| --- | ---: | ---: |
| Public contact submissions | 5 per 15 minutes per IP | 20 successful submissions per IP |
| Booking requests | 5 per hour per account | 10 successful requests per account |
| Cancellation requests | 5 per hour per account | 10 successful requests per account |
| Voucher redemption attempts | 10 per hour per account | 30 attempts per account |
| Admin email replies | 20 per hour per admin | 50 successful replies globally |

The daily values are configurable in `backend/.env`:

```env
MAX_DAILY_CONTACT_SUBMISSIONS_PER_IP=20
MAX_DAILY_BOOKING_REQUESTS_PER_ACCOUNT=10
MAX_DAILY_CANCELLATION_REQUESTS_PER_ACCOUNT=10
MAX_DAILY_VOUCHER_ATTEMPTS_PER_ACCOUNT=30
MAX_DAILY_EMAIL_REPLIES=50
```

Do not raise a value merely to work around repeated test submissions. First
confirm that the traffic is legitimate, inspect the related provider usage, and
record why the production value changed.

When a daily guardrail blocks an action, the server writes only a fixed warning
event. It does not log the user's ID, IP address, email address, booking details,
voucher code, message body, or authentication token.

## Important architecture note

The current Express rate-limit store is process memory. A restart resets its
counters, and several backend instances would each maintain separate counters.
This is appropriate as a first layer for the current single-instance deployment,
but it is not a billing ledger. If AddyVenture later runs several API instances,
move the counters to a shared supported store such as Redis before relying on
them as a cross-instance limit.

## Supabase controls

- Review the organization Usage page weekly during launch and after traffic
  changes. Watch database/disk size, egress, storage, monthly active users, and
  log usage.
- The Free plan does not create overage charges, although services remain
  subject to included quotas and fair-use restrictions.
- If upgrading to Pro, keep the Supabase Spend Cap enabled unless a reviewed
  scaling decision requires overage. The Spend Cap covers only listed usage
  items; compute and some explicitly provisioned add-ons are not covered.
- Check the Upcoming Invoice estimate before and after changing plans, compute,
  storage, domains, backups, or other add-ons.

Official references:

- https://supabase.com/docs/guides/platform/manage-your-usage
- https://supabase.com/docs/guides/platform/cost-control
- https://supabase.com/pricing

## Resend controls

- The Resend Free transactional plan currently includes 100 emails per UTC day
  and 3,000 emails per month. AddyVenture's default global cap of 50 successful
  admin replies per day deliberately leaves headroom.
- Review the Resend Usage and Metrics pages weekly during launch.
- Keep pay-as-you-go disabled unless a reviewed business decision accepts
  overage charges.
- Monitor bounce and spam rates, use verified recipients for testing, and stop
  sending when abnormal delivery behavior appears.
- Use a restricted sending API key where the provider supports it, rotate any
  exposed key immediately, and never place it in frontend variables.

Official references:

- https://resend.com/pricing
- https://resend.com/docs/knowledge-base/account-quotas-and-limits

## Monthly operating check

1. Record current Supabase usage and projected invoice.
2. Record Resend sent-email count and delivery health.
3. Review backend warning logs for repeated guardrail events.
4. Investigate sudden increases before raising a limit or upgrading a plan.
5. Confirm no new paid add-on or pay-as-you-go feature was enabled accidentally.
6. Confirm the website still uses no paid AI/LLM API. Current AI API cost is
   therefore zero.

## Incident response

If usage rises unexpectedly:

1. Do not immediately increase the application limit.
2. Identify the affected endpoint using fixed guardrail events and provider
   usage dashboards without copying personal data into logs.
3. Temporarily disable the affected feature or rotate its credential when
   compromise is suspected.
4. Verify rate limits, CORS, authentication, RLS, and recent deployments.
5. Restore service gradually and document the cause and corrective action.
