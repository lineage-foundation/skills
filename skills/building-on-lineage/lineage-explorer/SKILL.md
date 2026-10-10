---
name: lineage-explorer
description: Use when you need indexed Lineage chain data a node cannot answer — an address's transaction history, the items an address holds, an item's holders and transfer history, or settled two-way trades — or when working on, running or deploying the explorer itself.
---

# The Lineage Explorer

The explorer indexes the chain into Postgres and serves it as a website and a
read-only REST API. Reach for it when a question needs history or a reverse
lookup. A node's `/v1` API answers "what is this balance" and "give me this
block"; it cannot answer "what has this address done", "who holds this item" or
"which trades settled". Testnet: `https://explorer.lineage.to`.

It only reads. To submit a transaction or mint an item use an SDK
(`lineage-sdk-usage`) or `/v1` (`lineage-v1-api`).

## The API

Under `/api/v1`, anonymous, with a soft per-IP rate limit. The OpenAPI 3.1
document at `/api/v1/openapi.json` is the contract; read it before relying on
a shape.

- `GET /status`, `GET /supply` — indexed height and token supply.
- `GET /blocks`, `/blocks/{id}`, `/blocks/{id}/transactions`.
- `GET /transactions`, `/transactions/{hash}`.
- `GET /addresses/{address}`, `/addresses/{address}/transactions`,
  `/addresses/{address}/items`.
- `GET /items?q=` or `?genesis=` (one is required), `/items/{genesis}`,
  `/items/{genesis}/transfers`.
- `GET /trades`, `/trades/{druid}` — settled two-way payments.

`/status` reports the height the indexer has reached, which can trail the chain
tip by a block. Compare it with the node before treating data as missing.

## Words

- The explorer calls a settled two-way (DRUID) payment a **trade**: the page
  is `/trade/{druid}` and the API is `/api/v1/trades`. The SDKs and
  `lineage-two-way-payments` call the same thing a swap. Trade and swap are
  one concept.
- Older links under `/swap/` and `/api/v1/swaps` redirect to the trade URLs.
- A trade is listed once, not once per half. Its `legs` say who gave what to
  whom, derived from the halves' expectations.
- Only settled trades appear. A half still waiting for its counterpart is in
  one mempool node's memory and is not indexed.

## Items as indexed

- An item's id is its **genesis hash**: the hash of the transaction that
  created it. See `lineage-fundamentals` for the on-chain rule.
- The explorer stores that id on every item output, including the creation
  output (where the chain leaves the field empty), so one lookup finds an
  item's whole history.
- Holders are the unspent outputs of an item, summed per address.
- A transfer's outputs include what the sender kept as change. The quantity
  that moved is what went to *other* addresses.
- Metadata is a free-form string chosen by the creator, usually JSON but not
  guaranteed to be. Treat it as untrusted text: never render it as markup or
  follow a URL in it without checking.

## Working on the explorer

The `explorer` repo is a pnpm + Turborepo monorepo: `apps/web` (Next.js site
and API), `apps/indexer` (ingests blocks), `packages/db` (schema, migrations,
queries), `packages/api` (the REST routes).

- **Migrations are applied by the indexer when it starts**, not by the web
  app. They are written to be safe to run again, and a migration that adds a
  column also backfills it for rows already indexed.
- **Merging to `main` deploys.** After CI passes, the Deploy workflow deploys
  the indexer first and the web app second, then smoke-tests the live site.
  The order matters: the web app reads columns the newest migration adds.
- **Only one indexer writes at a time**, guarded by a database lock. During a
  deploy the new indexer waits for the old one to release it.
- The repo's README has local setup and the deployment settings.

## Sources
- explorer-readme
- explorer-api-items
- fleet-item-genesis
