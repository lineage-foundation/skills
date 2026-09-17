# Lineage skills

Skills that make an AI coding agent expert in Lineage. Each skill lives under
`skills/<track>/<name>/SKILL.md`; load the one that matches your task.

## Skills

- **consensus-safety** — Use before changing RAFT or consensus-replicated code in Lineage (mempool_raft, the block pipeline, intake, mining coordination, or node config that affects quorum) — to avoid changes that stall mining or fork the chain.
- **contributing-to-lineage** — Use when working IN the Lineage node codebase (the fleet and prime repos) — finding which crate owns a subsystem, understanding node roles and how a block flows, or getting oriented before a core change. The base for the core-contributor skills.
- **core-dev-workflow** — Use when building, testing, or running the Lineage node (the fleet workspace) — cargo build/test, the fleet-integration suite, standing up a local multi-node stack, operating a cluster, or following the repo's contribution conventions.
- **db-migrations** — Use when changing Lineage's on-disk database — adding or altering a column family, or migrating an older node or mainnet DB forward. Covers the DB_COLS_BC versioning scheme and the fleet upgrade machinery.
- **lineage-dev-node** — Use when you need a Lineage chain to develop against — standing up a local fleet stack with Docker, or pointing at the public testnet and funding a test wallet with LNGX from the faucet.
- **lineage-fundamentals** — Use whenever a task involves Lineage — the blockchain, its nodes, tokens/items, addresses, the /v1 API, or which repo owns what. The base layer every other Lineage skill builds on.
- **lineage-sdk-usage** — Use when building an app that talks to Lineage in JavaScript/TypeScript, Python, Go, Rust, PHP, or Laravel — installing an SDK, creating a wallet, deriving keypairs, reading balances, or sending one-way token/item payments.
- **lineage-two-way-payments** — Use when implementing a two-way (DRUID) atomic swap on Lineage — trading an item for tokens or item-for-item between two parties via the valence relay, or debugging why a swap does not settle.
- **lineage-v1-api** — Use when calling a Lineage node's HTTP API directly (no SDK) — querying balances, submitting transactions, minting items, reading blocks/supply, or looking up which /v1 endpoint does what.

## This repo

- `npm run build` — regenerate tool adapters from `skills/`
- `npm run validate` — check frontmatter and sources
- `npm test` — unit tests
- `npm run eval` — deterministic retrieval/fact check
