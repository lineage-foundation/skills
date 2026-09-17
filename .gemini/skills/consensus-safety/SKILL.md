---
name: consensus-safety
description: Use before changing RAFT or consensus-replicated code in Lineage (mempool_raft, the block pipeline, intake, mining coordination, or node config that affects quorum) — to avoid changes that stall mining or fork the chain.
---

# Consensus safety

Mempool and storage nodes run RAFT groups. State that is RAFT-replicated must be derived identically on every node, or the group diverges. Before changing consensus code, know which state is replicated and whether your change preserves deterministic ordering.

## Rules

- **Replicated vs local state.** Anything that goes through the RAFT log (intake decisions, the mining round, block selection) must be deterministic across nodes: same inputs, same order, same result. Node-local state (caches, metrics, connection bookkeeping) can differ.
- **Ordering is load-bearing.** Iteration order, map ordering, and tie-breaks that feed replicated decisions must be stable. A change that reorders inputs to a replicated computation can fork the group.
- **A predicate that gates a round is consensus state.** Changing when a round opens or closes changes what every node must agree on.

## Traps we've hit (don't reintroduce)

- **One miner per mempool node.** Multi-mempool mining stalls unless every mempool node has a miner attached — the intake-close predicate depends on it. If you touch intake or round-close, preserve this invariant.
- **`trust_advertised_peer_address` for quorum.** On source-NAT networks (e.g. Railway), a multi-node cluster only forms quorum and mints when peers trust the advertised peer address; the flag lives in node configuration. Don't assume peers are directly addressable.
- **Mid-round eviction/re-selection must stay consensus-safe.** Block-producer re-selection replaced a fragile count-to-5 scheme; any change to mid-round selection must remain deterministic across the group.

## Review lens

If a change alters replicated state, the order of inputs to a replicated computation, or a round-gating predicate, it needs cross-node reasoning and a `fleet-integration` run — not just unit tests.

## Sources
- fleet-mempool-raft
- fleet-core-raft
- fleet-configurations
