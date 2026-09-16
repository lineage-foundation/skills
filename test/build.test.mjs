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
  assert.ok(existsSync(join(root, '.claude-plugin/plugin.json')));
  const mkt = JSON.parse(readFileSync(join(root, '.claude-plugin/marketplace.json'), 'utf8'));
  assert.equal(mkt.plugins[0].name, 'lineage');
  const codex = JSON.parse(readFileSync(join(root, '.codex-plugin/plugin.json'), 'utf8'));
  assert.equal(codex.skills, './skills/');
});

test('build is deterministic', () => {
  const root = fixture();
  build(root);
  const a = readFileSync(join(root, '.claude-plugin/plugin.json'), 'utf8');
  build(root);
  const b = readFileSync(join(root, '.claude-plugin/plugin.json'), 'utf8');
  assert.equal(a, b);
});
