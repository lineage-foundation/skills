---
name: core-dev-workflow
description: Use when building, testing, or running the Lineage node (the fleet workspace) — cargo build/test, the fleet-integration suite, standing up a local multi-node stack, operating a cluster, or following the repo's contribution conventions.
---

# Core dev workflow

## Build & test

- Build the workspace: `cargo build`. Build one crate: `cargo build -p fleet-mempool`.
- Test everything: `cargo test`. One crate: `cargo test -p fleet-core`.
- **Integration tests** live in the `fleet-integration` crate — they spin up multiple node roles and exercise cross-node behaviour (quorum formation, mining, block commit). Run them before shipping anything that touches consensus, intake, or the block pipeline.

## A chain to develop against

Stand up a local mempool/storage/miner stack with Docker Compose from the fleet repo (see the README for the compose setup and ports), then point your client or tests at the local hosts — the `/v1` API is identical to testnet. For an SDK-side dev loop, see the build-on-Lineage `lineage-dev-node` skill.

## Operating a cluster

Production runs the same binaries multi-node (e.g. Railway + Docker). Two operational facts bite first-timers, both rooted in consensus (see `consensus-safety` for the why):

- Quorum on source-NAT networks depends on the `trust_advertised_peer_address` node-config flag — without it a multi-node cluster may never form quorum or mint.
- Every mempool node must run with a miner, or mining stalls.

## Conventions

- Rust 2021, a single Cargo workspace (the vendored prime crate is still edition 2018). Follow the existing crate boundaries; don't restructure across crates without cause.
- PRs branch off `main`, stay scoped, and run the relevant crate tests plus `fleet-integration` for consensus-adjacent work.
- No AI-authorship signals in commits or PRs — no "Generated with", no Co-Authored-By trailers. Repo work reads as hand-written.

## Sources
- fleet-readme
- fleet-integration
- fleet-configurations
