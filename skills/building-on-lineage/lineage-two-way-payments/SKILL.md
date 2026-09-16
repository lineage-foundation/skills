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
- **The submitted transaction carries `version: 2`; `fees` and
  `druid_info.genesis_hash` are set to `null` at submission.** Where `version`
  is set depends on the SDK — sdk-js bakes the two-way network version into the
  transaction at construction and carries it through unchanged; a client that
  builds its half without it must add it before submitting. The invariant that
  matters is on the wire: the transaction you POST carries `version: 2`. A half
  submitted without it is the classic "swap never settles" bug.
- **valence `/messages` is an opaque per-mailbox relay**, mailboxed by address
  and designed for end-to-end-encrypted payloads it never inspects. Auth
  headers: `address`, `public_key`, and `signature = ed25519(utf8(address))`
  (the raw address, unhashed). The reference sdk-js currently posts the offer
  as unencrypted JSON.

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
