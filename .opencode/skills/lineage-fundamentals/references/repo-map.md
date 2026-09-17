# Lineage repo map

- **fleet** — the node/chain implementation (mempool, storage, miner; RAFT, mining pipeline, DB).
- **prime** — the chain primitives crate vendored into fleet (transaction/DRUID utils).
- **valence** — the relay for two-way (DRUID) payment offers (`/messages`).
- **sdk-js / sdk-python / sdk-go / sdk-rust / sdk-php / sdk-laravel** — official client SDKs; wire-compatible with each other (sdk-js is the reference).
- **cli** — command-line client.
- **mcp** — Model Context Protocol server for Lineage.
- **explorer / block-explorer / block-explorer-backend** — block explorer.
- **platform / website** — web properties; `website/public/openapi.json` is the `/v1` spec.
