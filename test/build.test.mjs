import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
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
