---
name: lineage-v1-api
description: Use when calling a Lineage node's HTTP API directly (no SDK) — querying balances, submitting transactions, minting items, reading blocks/supply, or looking up which /v1 endpoint does what.
---

# The Lineage /v1 API

The node HTTP surface. Prefer an SDK (`lineage-sdk-usage`) for anything that
signs; call `/v1` directly for reads, ops, or endpoints an SDK doesn't wrap.
Each node role serves its own host (see `lineage-fundamentals`).

## Common endpoints

- `POST /v1/balances/query` — balances for a list of addresses.
- `POST /v1/transactions` — submit a signed transaction.
- `POST /v1/payments` — node-side payment (also the testnet faucet route).
- `POST /v1/items` — mint an item asset.
- `GET  /v1/supply` — token supply.
- `POST /v1/blockchain-entries/query`, `GET /v1/blocks`, `GET /v1/blocks/latest`,
  `GET /v1/blocks/{num}` — chain reads (storage).
- `GET  /v1/transactions/status`, `POST /v1/transactions/status:query` — status.
- `POST /v1/transactions:serialize` / `:deserialize` — wire encoding helpers.
- `POST /v1/donation-requests` — request funding from a peer.

The authoritative, always-current contract (every path, request/response shape,
and examples) is the OpenAPI document — treat it as the source of truth and read
it before relying on a shape here.

## Sources
- openapi
