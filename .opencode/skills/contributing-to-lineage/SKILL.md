---
name: contributing-to-lineage
description: Use when working IN the Lineage node codebase (the fleet and prime repos) — finding which crate owns a subsystem, understanding node roles and how a block flows, or getting oriented before a core change. The base for the core-contributor skills.
---

# Contributing to Lineage (core)

Lineage's node is the `fleet` Cargo workspace (Rust) plus the `prime` chain-primitives crate. This skill orients you; the sibling skills cover the dev loop, consensus safety, and DB migrations.

## Crate map

- **fleet** — node binaries, the on-disk DB, the version-upgrade machinery, node wallet.
- **fleet-core** — shared node/consensus machinery: RAFT (`raft.rs`, `active_raft.rs`), the block pipeline, ASERT difficulty, proof-of-work (`miner_pow`), comms, and node configuration/constants.
- **fleet-mempool** — the mempool node and its RAFT group (`mempool_raft.rs`): transaction intake and mining coordination.
- **fleet-miner** — proof-of-work mining.
- **fleet-storage** — the storage node and its RAFT group (`storage_raft.rs`): block persistence and blockchain-entry reads.
- **fleet-api** — the public `/v1` HTTP surface (endpoints are covered by the build-on-Lineage `lineage-v1-api` skill).
- **fleet-user** — the user node: a client-facing node that holds keys and serves `/v1` (payments, item creation).
- **fleet-node-common / fleet-wallet** — shared node helpers and node wallet.
- **fleet-integration** — cross-node integration tests.
- **prime** — chain primitives: crypto, script, transaction/DRUID utils, constants. The rules the whole network agrees on.

## Node roles and block flow

`cargo build --release` produces one binary per node type: **mempool**, **storage**, **miner**, **user**, and **pre_launch** (plus the `upgrade` helper). Three of these are the consensus/mining roles: mempool (accepts transactions, coordinates mining via RAFT), miner (solves proof-of-work), and storage (persists mined blocks, serves reads). A **user** node is client-facing — it holds keys and serves `/v1` (payments, item creation); **pre_launch** is a one-shot bootstrap helper. A block flows: transaction intake at a mempool node -> replicated across the mempool RAFT group -> a mining round produces a block -> the block is committed to storage.

## Where to go next

- Build, test, run a cluster: `core-dev-workflow`.
- Changing RAFT/consensus code without forking the chain: `consensus-safety`.
- Changing the on-disk DB or adding a migration: `db-migrations`.

See `references/crate-map.md` for the one-line crate table.

## Sources
- fleet-workspace
- fleet-readme
