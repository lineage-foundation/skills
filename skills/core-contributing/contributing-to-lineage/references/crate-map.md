# fleet / prime crate map

| Crate | Responsibility |
|---|---|
| fleet | Node binaries, on-disk DB, version-upgrade machinery, node wallet |
| fleet-core | Shared consensus/node machinery: RAFT, block pipeline, ASERT, PoW, comms, config/constants |
| fleet-mempool | Mempool node + RAFT group (`mempool_raft.rs`): intake, mining coordination |
| fleet-miner | Proof-of-work mining |
| fleet-storage | Storage node + RAFT group (`storage_raft.rs`): block persistence, reads |
| fleet-api | Public `/v1` HTTP surface |
| fleet-node-common | Shared node helpers |
| fleet-user | User/auth |
| fleet-wallet | Node wallet |
| fleet-integration | Cross-node integration tests |
| prime | Chain primitives: crypto, script, tx/DRUID utils, constants |
