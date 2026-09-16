# Lineage Skills

A cross-tool skills library that makes an AI coding agent expert in all things Lineage. Installable as a Claude Code plugin and a Codex plugin from one source.

## Skills

This library contains two skill tracks:

**Base layer:**
- **lineage-fundamentals** — The UTXO model, addresses, signing, node architecture, the /v1 API, and two-way payments. Use this first; all other skills assume it.

**Building on Lineage:**
- **lineage-sdk-usage** — Installing an SDK (JavaScript, Python, Go, Rust, PHP, Laravel), creating a wallet, deriving keypairs, reading balances, and sending one-way payments.
- **lineage-two-way-payments** — Implementing atomic swaps (DRUID) between two parties via the valence relay.
- **lineage-v1-api** — Calling a Lineage node's HTTP API directly: querying balances, submitting transactions, minting items, reading blocks.
- **lineage-dev-node** — Standing up a local fleet stack with Docker or pointing at the public testnet.

## Install

### Claude Code

1. Add the plugin marketplace:
   ```
   /plugin marketplace add lineage-foundation/skills
   ```

2. Install the `lineage` plugin.

3. When you work on a Lineage task, the agent will automatically pull the relevant skill.

### Codex

Use the generated `.codex-plugin/` directory to register the plugin in your Codex instance. See the Codex plugin documentation for the setup steps specific to your environment.

## Authoring a skill

Add a new skill by creating a `SKILL.md` under `skills/` with this structure:

```markdown
---
name: your-skill-name
description: A retrieval-oriented description that explains when to use this skill and what it covers.
---

# Your Skill Name

[Skill content...]

## Sources
- source-id-1
- source-id-2
```

Guidelines:

- The skill name (frontmatter `name`) must match its directory name.
- The `description` field should be specific and action-oriented; the agent uses it to decide when to retrieve the skill.
- All factual claims must cite canonical sources by id in a `## Sources` footer (one id per line).
- Add any new source to `sources/sources.json` with a pinned commit and anchor (see the file for the format).
- Never hand-edit the generated `.claude-plugin/` or `.codex-plugin/` directories — the build owns them.

Then validate and build:

```bash
npm run validate  # Check SKILL.md frontmatter and source ids
npm run build     # Generate .claude-plugin/ and .codex-plugin/ manifests
npm test          # Run the test suite
```

All three must pass before committing.

## Drift detection

Sources are pinned to commits. To check if any pinned commit has moved:

```bash
npm run drift
```

If a source has drifted (the commit exists but the file or content at that commit changed), the command will report it. Review the report and re-pin as needed in `sources/sources.json`.
