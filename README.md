# Lineage Skills

A cross-tool skills library that makes an AI coding agent expert in all things Lineage. Installable as a Claude Code plugin and a Codex plugin from one source.

## Skills

This library contains a shared base layer plus two skill tracks:

**Base layer:**
- **lineage-fundamentals** — The UTXO model, addresses, signing, node architecture, the /v1 API, and two-way payments. Use this first; all other skills assume it.

**Building on Lineage:**
- **lineage-sdk-usage** — Installing an SDK (JavaScript, Python, Go, Rust, PHP, Laravel), creating a wallet, deriving keypairs, reading balances, and sending one-way payments.
- **lineage-two-way-payments** — Implementing atomic swaps (DRUID) between two parties via the valence relay.
- **lineage-v1-api** — Calling a Lineage node's HTTP API directly: querying balances, submitting transactions, minting items, reading blocks.
- **lineage-dev-node** — Standing up a local fleet stack with Docker or pointing at the public testnet.

**Core-contributing track:**
- **contributing-to-lineage** — Orientation: the fleet/prime crate map, node roles, and how a block flows.
- **core-dev-workflow** — Build/test loop, the fleet-integration suite, running a local/multi-node stack, and repo conventions.
- **consensus-safety** — Changing RAFT/consensus code without stalling mining or forking the chain.
- **db-migrations** — Versioned column families and the fleet upgrade machinery; never relabel in place.

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

### Cursor

The repo's `.cursor/skills/` directory is auto-discovered when you open the repository in Cursor. Skills are made available automatically in the agent.

### Gemini CLI

The `.gemini/skills/` directory is picked up as workspace skills by the Gemini CLI. Skills are available in tool calls during agent sessions.

### opencode

The `.opencode/skills/` directory is discovered automatically. Skills are available for use within opencode sessions.

### Other agents (AGENTS.md)

Tools that read the `AGENTS.md` index (Codex, Copilot, Aider, Zed, and similar agents) can discover skills from the root `AGENTS.md` file. This index lists all available skills and their descriptions.

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
- Never hand-edit the generated `.claude-plugin/`, `.codex-plugin/`, `.cursor/skills/`, `.gemini/skills/`, `.opencode/skills/`, or `AGENTS.md` — the build owns them.

Then validate and build:

```bash
npm run validate  # Check SKILL.md frontmatter and source ids
npm run build     # Generate .claude-plugin/, .codex-plugin/, per-tool skill adapters (.cursor/, .gemini/, .opencode/), and AGENTS.md
npm test          # Run the test suite
```

All three must pass before committing.

## Drift detection

Sources are pinned to commits. To check if any upstream repositories have moved past their pins:

```bash
npm run drift
```

This command checks each source in `sources/sources.json` and reports any whose upstream repository has commits newer than the pinned commit — i.e., the pin is behind the source's latest default-branch HEAD. A STALE report means the source has moved on since it was pinned, so the skills citing it should be reviewed and the pin updated (re-pinned) if the content still matches.

## Evals

Skills are evaluated for correctness and retrieval fit using a deterministic suite and an optional LLM grader.

### Deterministic retrieval check

```bash
npm run eval
```

This runs a deterministic fact-check on all skills against the golden dataset in `evals/queries.json`. It verifies that the retrieval system correctly identifies the skill that should answer each query. This check runs automatically in CI on every push and must pass before a skill is merged.

### LLM eval (on-demand)

```bash
npm run eval:llm
```

This runs an on-demand Haiku-graded evaluation suite that tests whether skills correctly answer their queries. It requires the `ANTHROPIC_API_KEY` environment variable. The same evaluation is also available via the GitHub Actions workflow `LLM eval` (under Actions > Workflows, use "Run workflow" with `workflow_dispatch`).

### Adding skills to the dataset

When you add a new skill, add entries to `evals/queries.json` with:
- `question`: A question that the skill should answer
- `expectedSkill`: The skill name (must match the directory in `skills/`)
- `mustMention`: An array of required terms or phrases that the skill must include in its answer

This ensures new skills are covered in both the deterministic and LLM evaluation pipelines.
