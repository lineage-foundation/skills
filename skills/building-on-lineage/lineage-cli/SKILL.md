---
name: lineage-cli
description: Use when interacting with Lineage from the terminal — the `lineage` CLI for checking balances/supply, sending payments, managing a wallet, reading blocks, or submitting transactions without writing SDK code.
---

# The Lineage CLI

`lineage` is the Rust command-line client (crate `lineage-cli`, binary `lineage`). It wraps the same `/v1` API the SDKs use.

## Install

Not on crates.io — install from git:

```bash
cargo install --git https://github.com/lineage-foundation/cli lineage-cli
```

## Configuration

On first run it scaffolds `~/.config/lineage/config.toml` with two profiles: `testnet` (node-side signer, the default) and `local` (local signer, wallet at `~/.lineage/wallet.json`), both pointing at `mempool/storage/miner.lineage.to`. Select with `--profile`, override hosts with `--network testnet|<url>`, and pass an API key via the profile's `api_key`. The wallet passphrase is never prompted — set `LINEAGE_PASSPHRASE` or store it in the OS keyring (service `lineage`).

## Common commands

```bash
lineage supply                      # token supply
lineage balance <addr> [<addr>...]  # balances
lineage blocks [num] [--nums a,b]   # latest / by number / batch
lineage mining                      # the block being mined
lineage --profile local wallet new  # create a local wallet (needs the local profile)
lineage --profile local wallet address
lineage pay <address> <amount> --yes   # pay (writes need --yes)
lineage tx submit|status|serialize|deserialize
lineage donate <target>             # request testnet tokens from a funded peer
lineage tui                         # full-screen dashboard/wallet/send
```

Global flags: `--json --yes --dry-run --profile --network --quiet`.

## Gotchas

- Any `wallet` command needs a local-signer profile (`--profile local`) or it errors "no wallet_path configured".
- Writes (`pay`, `items`, `tx submit`, `donate`) require `--yes` (or `confirm = "auto"`); `pay` also enforces the profile's allowlist/max-amount/daily-cap guardrails.
- Exit codes are stable: 0 ok, 1 runtime error, 2 usage, 3 guardrail-denied, 4 node unreachable.

## Sources
- cli-readme
