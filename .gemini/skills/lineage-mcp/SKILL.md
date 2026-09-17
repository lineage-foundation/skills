---
name: lineage-mcp
description: Use when an agent should read or act on Lineage through the Model Context Protocol — running or connecting to the Lineage MCP server and knowing which MCP tools it exposes.
---

# The Lineage MCP server

`lineage-mcp` is a Python MCP server that exposes Lineage (via the SDK and a block-explorer client) as MCP tools over Streamable HTTP.

## Run it

```bash
uv venv -p 3.11 .venv && source .venv/bin/activate
uv sync --extra dev && uv pip install -e .
uv run uvicorn lineage_mcp.server:app --host 0.0.0.0 --port 8000
```

It serves HTTP (not stdio) — connect a client to `<url>/mcp`. A distroless Docker image is provided.

## Configuration (env)

`LINEAGE_PASSPHRASE` (required), `LINEAGE_MEMPOOL_HOST`, `LINEAGE_STORAGE_HOST`, `LINEAGE_VALENCE_HOST`, `LINEAGE_EXPLORER_URL`, optional `LINEAGE_API_KEY` (sent as `x-api-key`), and `LINEAGE_SEED_PHRASE` (only needed for spending — see below).

## Tools

Reads: `health`, `version`, `get-latest-block`, `get-block`, `get-transaction`, `get-address-balance`, `get-supply`, `get-entry-by-hash`, `fetch-transactions`, and paginated `list-blocks` / `list-transactions` / `list-block-transactions` / `list-address-transactions` / `search-items`, plus `get-status`. Read tools query the explorer first and can cross-check on-chain when called with `verify`.

Wallet: `generate-seed-phrase`, `generate-keypair` (offline; deterministic when given a seed phrase), and `transfer-funds` — which spends and therefore requires a server-side `LINEAGE_SEED_PHRASE`, returning an error if it isn't set.

## Gotchas

- HTTP transport, not stdio — the usual `command`/`args` desktop-config snippet doesn't apply; use an HTTP MCP connector.
- `transfer-funds` uses a live server-side spending key — treat that deployment as sensitive.

## Sources
- mcp-readme
