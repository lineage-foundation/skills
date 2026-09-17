# Lineage skills

Skills that make an AI coding agent expert in Lineage. Each skill lives under
`skills/<track>/<name>/SKILL.md`; load the one that matches your task.

## Skills

- **consensus-safety** — Use before changing RAFT or consensus-replicated code in Lineage (mempool_raft, the block pipeline, intake, mining coordination, or node config that affects quorum) — to avoid changes that stall mining or fork the chain.
- **contributing-to-lineage** — Use when working IN the Lineage node codebase (the fleet and prime repos) — finding which crate owns a subsystem, understanding node roles and how a block flows, or getting oriented before a core change. The base for the core-contributor skills.
- **core-dev-workflow** — Use when building/testing the Lineage node codebase itself (cargo, the fleet-integration suite) or operating a cluster. For an SDK/app-side dev loop against a local or testnet chain, see lineage-dev-node.
- **db-migrations** — Use when changing Lineage's on-disk database — adding or altering a column family, or migrating an older node or mainnet DB forward. Covers the DB_COLS_BC versioning scheme and the fleet upgrade machinery.
- **lineage-cli** — Use when interacting with Lineage from the terminal — the `lineage` CLI for checking balances/supply, sending payments, managing a wallet, reading blocks, or submitting transactions without writing SDK code.
- **lineage-dev-node** — Use when you (building an app/client on Lineage) need a chain to develop against — a local fleet stack via Docker or the public testnet. For running the node codebase's own build/test suite, see core-dev-workflow.
- **lineage-fundamentals** — Use whenever a task involves Lineage — the blockchain, its nodes, tokens/items, addresses, the /v1 API, or which repo owns what. The base layer every other Lineage skill builds on.
- **lineage-sdk-usage** — Use when building an app that talks to Lineage in JavaScript/TypeScript, Python, Go, Rust, PHP, or Laravel — installing an SDK, creating a wallet, deriving keypairs, reading balances, or sending one-way token/item payments.
- **lineage-two-way-payments** — Use when implementing a two-way (DRUID) atomic swap on Lineage — trading an item for tokens or item-for-item between two parties via the valence relay, or debugging why a swap does not settle.
- **lineage-v1-api** — Use when calling a Lineage node's HTTP API directly (no SDK) — querying balances, submitting transactions, minting items, reading blocks/supply, or looking up which /v1 endpoint does what.
- **lineage-wallet-recovery** — Use when a user asks how to back up, recover, or move a Lineage wallet — what the seed phrase vs the passphrase does, how addresses are derived, and how to re-derive the same wallet on another machine.

## This repo

- `npm run build` — regenerate tool adapters from `skills/`
- `npm run validate` — check frontmatter and sources
- `npm test` — unit tests
- `npm run eval` — deterministic retrieval/fact check
