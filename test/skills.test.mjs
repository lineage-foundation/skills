import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parseFrontmatter, listSkills } from '../lib/skills.mjs';

test('parseFrontmatter extracts name and description', () => {
  const { attrs, body } = parseFrontmatter(
    '---\nname: demo\ndescription: Use when demoing.\n---\nBody here.\n',
  );
  assert.equal(attrs.name, 'demo');
  assert.equal(attrs.description, 'Use when demoing.');
  assert.equal(body.trim(), 'Body here.');
});

test('parseFrontmatter throws without closing fence', () => {
  assert.throws(() => parseFrontmatter('---\nname: x\nno close\n'));
});

test('listSkills finds nested SKILL.md files', () => {
  const root = mkdtempSync(join(tmpdir(), 'sk-'));
  mkdirSync(join(root, 'a/b'), { recursive: true });
  writeFileSync(join(root, 'a/SKILL.md'), '---\nname: a\ndescription: d1\n---\nx');
  writeFileSync(join(root, 'a/b/SKILL.md'), '---\nname: a-b\ndescription: d2\n---\ny');
  const skills = listSkills(root).sort((x, y) => x.name.localeCompare(y.name));
  assert.deepEqual(skills.map((s) => s.name), ['a', 'a-b']);
  assert.equal(skills[0].relPath, 'a/SKILL.md');
});
