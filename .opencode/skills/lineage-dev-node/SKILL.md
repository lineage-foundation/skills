---
name: lineage-dev-node
description: Use when you need a Lineage chain to develop against — standing up a local fleet stack with Docker, or pointing at the public testnet and funding a test wallet with LNGX from the faucet.
---

# A chain to develop against

Two options: the public testnet (fastest) or a local stack (full control).

## Public testnet

Point your SDK/config at these hosts:

- mempool — `https://mempool.lineage.to`
- storage — `https://storage.lineage.to`
- miner — `https://miner.lineage.to`
- valence — `https://valence.lineage.to`

**Fund a test wallet from the faucet:** `POST https://miner.lineage.to/v1/payments`
with `{"kind":"address","address":"<addr>","amount":<n>,"passphrase":""}`. The
tokens land after the next block; poll the balance until they appear.

## Local stack

Run a full mempool / storage / miner stack with Docker Compose from the `fleet`
repo, then use its local hosts as your SDK base URLs — the `/v1` API surface is
identical to testnet. See the fleet README for the compose setup and ports.

## Sources
- fleet-readme
