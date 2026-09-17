import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { listSkills, parseFrontmatter } from '../lib/skills.mjs';

const MODEL = 'claude-haiku-4-5-20251001';

export async function runLlmEval(rootDir, callModel) {
  const { queries } = JSON.parse(readFileSync(join(rootDir, 'evals/queries.json'), 'utf8'));
  const skills = new Map(
    listSkills(join(rootDir, 'skills')).map((s) => [s.name, parseFrontmatter(readFileSync(join(rootDir, 'skills', s.relPath), 'utf8')).body]),
  );
  const rows = [];
  for (const q of queries) {
    try {
      const body = skills.get(q.expectedSkill) ?? '';
      const answer = await callModel({ system: `You are a Lineage expert. Answer using only this skill:\n\n${body}`, prompt: q.question });
      const verdict = await callModel({ system: 'You grade answers. Reply "PASS" or "FAIL" then a short reason. PASS only if the answer covers ALL required facts and contradicts none.', prompt: `Question: ${q.question}\nRequired facts: ${q.mustMention.join(', ')}\nAnswer: ${answer}` });
      rows.push({ question: q.question, pass: /^\s*PASS\b/i.test(verdict), reason: verdict.trim().slice(0, 200) });
    } catch (err) {
      rows.push({ question: q.question, pass: false, reason: `eval error: ${err.message}` });
    }
  }
  return rows;
}

async function anthropicCall({ system, prompt }) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({ model: MODEL, max_tokens: 1024, system, messages: [{ role: 'user', content: prompt }] }),
  });
  if (!res.ok) throw new Error(`anthropic ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.content.map((b) => b.text ?? '').join('');
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY is required');
    process.exit(1);
  }
  const rows = await runLlmEval(join(dirname(fileURLToPath(import.meta.url)), '..'), anthropicCall);
  for (const r of rows) console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.question}\n      ${r.reason}`);
  const failed = rows.filter((r) => !r.pass).length;
  console.log(`\n${rows.length - failed}/${rows.length} passed`);
  if (failed) process.exit(1);
}
