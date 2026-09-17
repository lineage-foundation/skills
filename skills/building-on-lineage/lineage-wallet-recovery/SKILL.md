---
name: lineage-wallet-recovery
description: Use when a user asks how to back up, recover, or move a Lineage wallet — what the seed phrase vs the passphrase does, how addresses are derived, and how to re-derive the same wallet on another machine.
---

# Wallet keys and recovery

## The one thing that matters: the seed phrase

A Lineage wallet is a BIP39 mnemonic (the seed phrase). It is the sole, portable recovery secret — with it you can reconstruct the identical wallet and all its addresses on any machine. Back up the seed phrase; losing it means the funds are unrecoverable.

## Passphrase ≠ recovery secret

The passphrase you pass when opening a wallet only encrypts the local keystore at rest (SHA3-256 → key, NaCl secretbox). It is device-local and is NOT needed to recover from the seed phrase — on a new machine you pick a new local passphrase. (There is a separate optional BIP39 25th-word passphrase in the derivation API, but it defaults to empty and isn't user-exposed; in practice only the mnemonic matters.)

## Derivation

Each address is one hardened child derived off the master key at a depth that IS the address index (0, 1, 2, …); the derived key seeds an ed25519 keypair. There is no `m/44'/…` path string. Re-deriving from the seed phrase is deterministic, so the same mnemonic yields the same address sequence everywhere.

## Recovering on a new machine

Re-initialise the wallet from the seed phrase (the SDK's `fromSeed`-style entry point), then re-derive addresses 0, 1, 2, … To know which derived addresses hold funds you need the set of your used addresses (from chain/UTXO state); recovery walks derivations against that set and stops after a run of empties. Note there are two address versions — recovery should try both so older-scheme funds aren't missed.

## Sources
- sdk-js-keymgmt
