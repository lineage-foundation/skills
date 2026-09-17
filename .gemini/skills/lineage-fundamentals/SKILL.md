---
name: lineage-fundamentals
description: Use whenever a task involves Lineage — the blockchain, its nodes, tokens/items, addresses, the /v1 API, or which repo owns what. The base layer every other Lineage skill builds on.
---

# Lineage Fundamentals

Lineage is a Layer-1 blockchain where market policy is programmable. It uses a
UTXO model (Bitcoin-lineage), not an account/EVM model. Read this first; the
task-specific skills below assume it.

## Core model

- **Assets are one of two kinds.** `Token` — the native asset, LNGX, an integer
  amount. `Item` — a distinct on-chain asset identified by a `genesis_hash`,
  with an `amount` and optional `metadata`.
- **Addresses** are `hex(sha3_256(public_key))`. Keys are ed25519. A wallet is a
  BIP39 mnemonic; addresses derive via BIP32.
- **Signing.** You sign a hash over the transaction's outputs plus the previous
  outpoint; you sign exactly what you submit (field order is load-bearing).
- **Nodes are split by role**, each on its own host and HTTP API. `mempool`
  accepts transactions and answers balance queries; `storage` serves blocks and
  blockchain entries; `miner` mines blocks (and on testnet exposes a faucet); a
  `user` node is client-facing (holds keys, serves `/v1`); `pre_launch` is a
  one-shot bootstrap helper. The public API is `/v1` on those hosts.
- **The public API is `/v1`** on those hosts. See `lineage-v1-api`.
- **Two-way (DRUID) payments** are atomic swaps between two parties, routed
  through the **valence** relay. See `lineage-two-way-payments`.

## How to work on Lineage

- Building an app? Use an SDK (`lineage-sdk-usage`) — don't hand-roll signing.
- Need an endpoint the SDK doesn't wrap? Call `/v1` directly (`lineage-v1-api`).
- Need a chain to develop against? `lineage-dev-node`.

See `references/repo-map.md` for which repo owns what, and
`references/glossary.md` for terms.

## Sources
- whitepaper
- fleet-readme
