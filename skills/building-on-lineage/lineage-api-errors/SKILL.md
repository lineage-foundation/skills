---
name: lineage-api-errors
description: Use when a Lineage API/SDK call fails — interpreting error responses, knowing which failures are terminal vs retriable, and handling a stale balance before resubmitting a transaction.
---

# Handling Lineage API errors

## How failures surface

- **SDKs** return a response object with `status: 'success' | 'error' | 'pending' | 'unknown'` and a `reason` string on error (handle `pending`/`unknown` too, not just the binary). There is no built-in retry/backoff — you implement it.
- **The node** returns RFC 9457 `application/problem+json` (`{type, title, status, detail}`) with standard HTTP codes.

## What the codes mean

- **400** — malformed request/transaction. Terminal; fix the request.
- **401** — missing/invalid `x-api-key`, or wrong wallet passphrase. Terminal; fix credentials. (API keys are per-route.)
- **404** — the block/entry doesn't exist yet.
- **422** — the payment couldn't be constructed (e.g. nothing to spend).
- **500** — subsystem error AND mempool transaction rejection are both folded into 500 with a free-text `detail`. Do NOT blindly retry a 500 — parse `detail` (bad signature, double-spend, insufficient funds are terminal).

## Retry guidance

- Terminal: 400, 401, and 500s whose `detail` indicates a bad/rejected transaction.
- Retriable: a stale local balance / running total. Refresh UTXOs via the wallet running-total refresh endpoint, then resubmit — a targeted recovery, not blind retry.
- Common client-side errors before any network call: insufficient funds, uninitialised host, bad/undecryptable keys — these are caught locally.

## Sources
- sdk-js-errors
- fleet-api-errors
