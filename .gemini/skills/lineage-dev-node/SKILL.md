---
name: lineage-dev-node
description: Use when you (building an app/client on Lineage) need a chain to develop against — a local fleet stack via Docker or the public testnet. For running the node codebase's own build/test suite, see core-dev-workflow.
---

# A chain to develop against

Two options: the public testnet (fastest) or a local stack (full control).

## Public testnet

Point your SDK/config at these hosts:

- mempool — `https://mempool.lineage.to`
- storage — `https://storage.lineage.to`
- miner — `https://miner.lineage.to`
- valence — `https://valence.lineage.to`

**Fund a test wallet.** There is no public faucet. Generate an address, then either send it to the team to be seeded, or — if you run your own node — request tokens from a funded peer with `POST /v1/donation-requests`. Poll the balance until they land.

## Local stack

Run a full mempool / storage / miner stack with Docker Compose from the `fleet`
repo, then use its local hosts as your SDK base URLs — the `/v1` API surface is
identical to testnet. See the fleet README for the compose setup and ports.

## Sources
- fleet-readme
