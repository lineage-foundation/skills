import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { evalRetrieval } from '../scripts/eval-retrieval.mjs';

function scaffold(queries) {
  const root = mkdtempSync(join(tmpdir(), 'ev-'));
  mkdirSync(join(root, 'skills/demo'), { recursive: true });
  writeFileSync(join(root, 'skills/demo/SKILL.md'), '---\nname: demo\ndescription: Use for the widget flow.\n---\nThe widget uses a sprocket.');
  mkdirSync(join(root, 'evals'), { recursive: true });
  writeFileSync(join(root, 'evals/queries.json'), JSON.stringify({ queries }));
  return root;
}

test('passes when skill exists and contains the facts', () => {
  const root = scaffold([{ question: 'widget?', expectedSkill: 'demo', mustMention: ['sprocket', 'widget'] }]);
  assert.deepEqual(evalRetrieval(root), []);
});

test('fails when expected skill is missing', () => {
  const root = scaffold([{ question: 'x?', expectedSkill: 'nope', mustMention: [] }]);
  assert.ok(evalRetrieval(root).some((e) => /nope/.test(e)));
});

test('fails when a mustMention fact is absent', () => {
  const root = scaffold([{ question: 'widget?', expectedSkill: 'demo', mustMention: ['flux-capacitor'] }]);
  assert.ok(evalRetrieval(root).some((e) => /flux-capacitor/.test(e)));
});

test('fact match respects word boundaries', () => {
  const root = mkdtempSync(join(tmpdir(), 'ev-'));
  mkdirSync(join(root, 'skills/demo'), { recursive: true });
  writeFileSync(
    join(root, 'skills/demo/SKILL.md'),
    '---\nname: demo\ndescription: In my opinion this matters.\n---\nThis is my opinion about spinning widgets.',
  );
  mkdirSync(join(root, 'evals'), { recursive: true });
  writeFileSync(
    join(root, 'evals/queries.json'),
    JSON.stringify({ queries: [{ question: 'q', expectedSkill: 'demo', mustMention: ['pin'] }] }),
  );
  // "pin" is a substring of "opinion"/"spinning" but not a standalone word -> must be reported missing
  assert.ok(evalRetrieval(root).some((e) => /pin/.test(e)));
});

test('missing mustMention is a clear error', () => {
  const root = scaffold([{ question: 'q-no-facts', expectedSkill: 'demo' }]);
  assert.ok(evalRetrieval(root).some((e) => /q-no-facts/.test(e)));
});
