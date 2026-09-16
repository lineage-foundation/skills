---
name: lineage-two-way-payments
description: Use when implementing a two-way (DRUID) atomic swap on Lineage — trading an item for tokens or item-for-item between two parties via the valence relay, or debugging why a swap does not settle.
---

# Two-way (DRUID) payments

A two-way payment is an atomic swap: two parties each contribute one half of a
trade and both halves settle together, or neither does. The halves are linked
by a DRUID and matched server-side in the mempool's DRUID pool. Offers are
relayed off-chain through **valence**.

## Key facts (do not fight these)

- **A DRUID half is an ordinary P2PKH transaction.** `druid_info` is UNSIGNED
  routing metadata — it never enters any signable preimage. So the normal
  one-way signer is reused unchanged; two-way adds no new crypto.
- **Construction omits `version` and `genesis_hash`; submission adds them**
  (`version: 2`, `fees: null`, `druid_info.genesis_hash: null`). Missing the
  submit-time `version: 2` is the classic "swap never settles" bug.
- **valence `/messages` carries plaintext offers**, mailboxed by address, with
  auth headers: `address`, `public_key`, and `signature = ed25519(utf8(address))`
  (the raw address, unhashed).

## The handshake

1. **Initiator** `make_2way_payment`: builds its half, persists it locally
   (encrypted), and POSTs the offer to the counterparty's valence mailbox.
   Returns a DRUID and the encrypted half.
2. **Counterparty** fetches pending offers (GET its mailbox), then `accept`:
   builds the matching half, submits it to the initiator's mempool host, and
   flips the offer status to `accepted` on valence.
3. **Initiator** fetches again; on seeing `accepted`, it submits its own half.
   Both halves now settle in one block.

`fetch_pending` does double duty by role: with no saved half it discovers
incoming offers; with your saved half it checks for `accepted` and settles.

Verify with balances after ~1 block: each party holds what the other sent.
Method names differ per language — check your SDK's README/two-way section.

## Sources
- sdk-js-2way
- valence-readme
- sdk-js-readme
