import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runLlmEval } from '../scripts/eval-llm.mjs';

function scaffold() {
  const root = mkdtempSync(join(tmpdir(), 'el-'));
  mkdirSync(join(root, 'skills/demo'), { recursive: true });
  writeFileSync(join(root, 'skills/demo/SKILL.md'), '---\nname: demo\ndescription: d\n---\nThe answer is a sprocket.');
  mkdirSync(join(root, 'evals'), { recursive: true });
  writeFileSync(join(root, 'evals/queries.json'), JSON.stringify({ queries: [{ question: 'what?', expectedSkill: 'demo', mustMention: ['sprocket'] }] }));
  return root;
}

test('reports pass when grader returns PASS', async () => {
  const root = scaffold();
  // first call = answer, second call = grader verdict
  const calls = [];
  const callModel = async ({ prompt }) => { calls.push(prompt); return calls.length === 1 ? 'It is a sprocket.' : 'PASS: mentions sprocket'; };
  const rows = await runLlmEval(root, callModel);
  assert.equal(rows[0].pass, true);
});

test('reports fail when grader does not return PASS', async () => {
  const root = scaffold();
  const callModel = async () => 'FAIL: missing'; // both answer and grader
  const rows = await runLlmEval(root, callModel);
  assert.equal(rows[0].pass, false);
});
