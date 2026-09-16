---
name: lineage-sdk-usage
description: Use when building an app that talks to Lineage in JavaScript/TypeScript, Python, Go, Rust, PHP, or Laravel — installing an SDK, creating a wallet, deriving keypairs, reading balances, or sending one-way token/item payments.
---

# Building on Lineage with an SDK

Pick the SDK for your stack. All are wire-compatible: a wallet (mnemonic)
created in one derives the same addresses and produces the same signatures in
every other, so you can mix languages across a stack. sdk-js is the reference
implementation.

## Install

- JavaScript/TypeScript — `npm install @lineage-foundation/sdk-js`
- Python — `pip install lineage-sdk` (imports as `lineage`)
- Go — `go get github.com/lineage-foundation/sdk-go`
- Rust — `cargo add lineage-sdk`
- PHP — `composer require lineage/php`
- Laravel — `composer require lineage/laravel`

## The flow (every SDK)

1. Create/open a wallet with a config that has a mempool host and a passphrase
   for local key encryption; keep the returned seed phrase safe.
2. Derive a keypair → its address.
3. Read balances (`total.tokens`, `total.items[genesis_hash]`).
4. Send a one-way payment (token or item); change returns to your own keypair;
   the receipt carries the transaction hash.

The SDK holds keys locally and signs before submitting to the mempool. For the
exact method names and signatures in your language, read that SDK's README —
they are consistent in shape but idiomatic per language.

For atomic swaps (item-for-token, item-for-item) see `lineage-two-way-payments`.
To call the node directly, see `lineage-v1-api`.

## Sources
- sdk-js-readme
- sdk-python-readme
- sdk-go-readme
- sdk-rust-readme
- sdk-php-readme
- sdk-laravel-readme
