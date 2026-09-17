import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { build } from '../scripts/build.mjs';

function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'bd-'));
  mkdirSync(join(root, 'skills/demo'), { recursive: true });
  writeFileSync(
    join(root, 'skills/demo/SKILL.md'),
    '---\nname: demo\ndescription: Use when demoing.\n---\nBody.',
  );
  return root;
}

test('build writes claude + codex manifests', () => {
  const root = fixture();
  build(root);

  const plugin = JSON.parse(readFileSync(join(root, '.claude-plugin/plugin.json'), 'utf8'));
  assert.equal(plugin.version, '0.1.0');
  assert.equal(plugin.author.name, 'Lineage Foundation');
  assert.equal(plugin.author.email, 'info@lineage.foundation');

  const mkt = JSON.parse(readFileSync(join(root, '.claude-plugin/marketplace.json'), 'utf8'));
  assert.equal(mkt.plugins[0].name, 'lineage');
  assert.equal(mkt.plugins[0].version, '0.1.0');

  const codex = JSON.parse(readFileSync(join(root, '.codex-plugin/plugin.json'), 'utf8'));
  assert.equal(codex.skills, './skills/');
  assert.equal(codex.version, '0.1.0');
  assert.equal(codex.author.email, 'info@lineage.foundation');
});

test('build is deterministic', () => {
  const root = fixture();
  build(root);
  const a1 = readFileSync(join(root, '.claude-plugin/plugin.json'), 'utf8');
  const a2 = readFileSync(join(root, '.claude-plugin/marketplace.json'), 'utf8');
  const a3 = readFileSync(join(root, '.codex-plugin/plugin.json'), 'utf8');
  build(root);
  const b1 = readFileSync(join(root, '.claude-plugin/plugin.json'), 'utf8');
  const b2 = readFileSync(join(root, '.claude-plugin/marketplace.json'), 'utf8');
  const b3 = readFileSync(join(root, '.codex-plugin/plugin.json'), 'utf8');
  assert.equal(a1, b1);
  assert.equal(a2, b2);
  assert.equal(a3, b3);
});

function fixtureTwo() {
  const root = mkdtempSync(join(tmpdir(), 'bd2-'));
  mkdirSync(join(root, 'skills/track/alpha/references'), { recursive: true });
  writeFileSync(join(root, 'skills/track/alpha/SKILL.md'), '---\nname: alpha\ndescription: Use for alpha.\n---\nAlpha body.');
  writeFileSync(join(root, 'skills/track/alpha/references/notes.md'), '# alpha notes');
  mkdirSync(join(root, 'skills/beta'), { recursive: true });
  writeFileSync(join(root, 'skills/beta/SKILL.md'), '---\nname: beta\ndescription: Use for beta.\n---\nBeta body.');
  return root;
}

test('build fans out skills to cursor/gemini/opencode with references', () => {
  const root = fixtureTwo();
  build(root);
  for (const tool of ['.cursor', '.gemini', '.opencode']) {
    assert.ok(existsSync(join(root, tool, 'skills/alpha/SKILL.md')), `${tool} alpha`);
    assert.ok(existsSync(join(root, tool, 'skills/alpha/references/notes.md')), `${tool} alpha refs`);
    assert.ok(existsSync(join(root, tool, 'skills/beta/SKILL.md')), `${tool} beta`);
  }
  // copies are byte-identical to source
  assert.equal(
    readFileSync(join(root, '.cursor/skills/alpha/SKILL.md'), 'utf8'),
    readFileSync(join(root, 'skills/track/alpha/SKILL.md'), 'utf8'),
  );
});

test('build writes AGENTS.md listing every skill', () => {
  const root = fixtureTwo();
  build(root);
  const agents = readFileSync(join(root, 'AGENTS.md'), 'utf8');
  assert.match(agents, /\balpha\b/);
  assert.match(agents, /Use for beta\./);
});

test('build removes stale adapter skills when a source skill is gone', () => {
  const root = fixtureTwo();
  build(root);
  assert.ok(existsSync(join(root, '.cursor/skills/beta/SKILL.md')));
  rmSync(join(root, 'skills/beta'), { recursive: true, force: true });
  build(root);
  assert.ok(!existsSync(join(root, '.cursor/skills/beta')), 'stale beta removed');
  assert.ok(existsSync(join(root, '.cursor/skills/alpha/SKILL.md')), 'alpha kept');
});
