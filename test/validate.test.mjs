import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { validate } from '../scripts/validate.mjs';

function scaffold({ skillName = 'demo', desc = 'Use when demoing.', sourcesLine = '', srcIds = ['x'] } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'vl-'));
  mkdirSync(join(root, `skills/${skillName}`), { recursive: true });
  writeFileSync(
    join(root, `skills/${skillName}/SKILL.md`),
    `---\nname: ${skillName}\ndescription: ${desc}\n---\nBody.\n\n## Sources\n${sourcesLine}\n`,
  );
  mkdirSync(join(root, 'sources'), { recursive: true });
  writeFileSync(
    join(root, 'sources/sources.json'),
    JSON.stringify({ sources: srcIds.map((id) => ({ id, repo: 'o/r', pin: 'abc' })) }),
  );
  return root;
}

test('clean repo validates', () => {
  assert.deepEqual(validate(scaffold({ sourcesLine: '- x', srcIds: ['x'] })), []);
});

test('name not matching dir is an error', () => {
  const root = scaffold({ sourcesLine: '- x' });
  // rename mismatch: frontmatter name vs dir already match here; force a mismatch
  writeFileSync(join(root, 'skills/demo/SKILL.md'), '---\nname: other\ndescription: d\n---\n## Sources\n- x');
  assert.ok(validate(root).some((e) => /name/.test(e)));
});

test('unknown source id is an error', () => {
  assert.ok(validate(scaffold({ sourcesLine: '- nope', srcIds: ['x'] })).some((e) => /nope/.test(e)));
});

test('missing description is an error', () => {
  assert.ok(validate(scaffold({ desc: '', sourcesLine: '- x' })).some((e) => /description/.test(e)));
});

test('content after Sources is ignored', () => {
  const root = scaffold({ sourcesLine: '- x', srcIds: ['x'] });
  writeFileSync(
    join(root, 'skills/demo/SKILL.md'),
    '---\nname: demo\ndescription: d\n---\n## Sources\n- x\n\n## Notes\n- somethingelse',
  );
  assert.deepEqual(validate(root), []);
});

test('malformed sources.json entry is an error', () => {
  const root = scaffold({ sourcesLine: '- x', srcIds: ['x'] });
  writeFileSync(
    join(root, 'sources/sources.json'),
    JSON.stringify({ sources: [{ id: 'y', repo: 'o/r' }] }),
  );
  assert.ok(validate(root).some((e) => /pin/.test(e)));
});

test('duplicate skill names is an error', () => {
  const root = scaffold({ skillName: 'demo', sourcesLine: '- x', srcIds: ['x'] });
  mkdirSync(join(root, 'skills/demo2'), { recursive: true });
  writeFileSync(
    join(root, 'skills/demo2/SKILL.md'),
    '---\nname: demo\ndescription: d\n---\n## Sources\n- x',
  );
  assert.ok(validate(root).some((e) => /duplicate/.test(e)));
});
