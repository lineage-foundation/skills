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

test('api error in middle query records error row and continues', async () => {
  const root = mkdtempSync(join(tmpdir(), 'el-'));
  mkdirSync(join(root, 'skills/demo'), { recursive: true });
  writeFileSync(join(root, 'skills/demo/SKILL.md'), '---\nname: demo\ndescription: d\n---\nThe answer is a sprocket.');
  mkdirSync(join(root, 'evals'), { recursive: true });
  writeFileSync(join(root, 'evals/queries.json'), JSON.stringify({ queries: [
    { question: 'q1', expectedSkill: 'demo', mustMention: ['sprocket'] },
    { question: 'q2', expectedSkill: 'demo', mustMention: ['sprocket'] },
    { question: 'q3', expectedSkill: 'demo', mustMention: ['sprocket'] },
  ] }));
  let callCount = 0;
  const callModel = async () => {
    callCount++;
    if (callCount === 4) throw new Error('api timeout'); // second query's grader call
    return callCount === 1 ? 'It is a sprocket.' : 'PASS: mentions sprocket';
  };
  const rows = await runLlmEval(root, callModel);
  assert.equal(rows.length, 3, 'should return 3 rows even with error mid-run');
  assert.equal(rows[1].pass, false, 'error row should be fail');
  assert.ok(/api timeout/.test(rows[1].reason), 'error row should mention the error');
  assert.equal(rows[2].pass, true, 'row after error should still be processed');
});
