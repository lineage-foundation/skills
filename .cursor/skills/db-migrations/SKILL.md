---
name: db-migrations
description: Use when changing Lineage's on-disk database — adding or altering a column family, or migrating an older node or mainnet DB forward. Covers the DB_COLS_BC versioning scheme and the fleet upgrade machinery.
---

# DB migrations

The node's blockchain DB uses versioned column families. A wrong migration can make an older DB unreadable or silently misinterpret chain state, so follow the versioning discipline.

## The model

- **`DB_COLS_BC`** (in `fleet-core` constants) is the list of blockchain column families with their versions. It is the chain-migration path.
- The **`fleet/src/upgrade`** machinery applies an upgrade from a prior DB version to the current one.

## The hard rule

**Never relabel a column family in place.** An older-mainnet or older-node DB is migrated *forward* into new or newly-versioned families — an existing family under its existing label is never repurposed to mean something else. Relabeling in place is how you make old data unreadable or misread it.

## Adding a migration

1. Add the new or newly-versioned column family to `DB_COLS_BC` rather than changing an existing one's meaning.
2. Write the upgrade step in `fleet/src/upgrade` that reads the old family and populates the new one.
3. Cover it with an upgrade test — the upgrade module loads a prior-version DB fixture, so a real old DB is exercised, not just a fresh one.

## Sources
- fleet-db-columns
- fleet-upgrade
