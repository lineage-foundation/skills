import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { listSkills, parseFrontmatter } from '../lib/skills.mjs';

export function evalRetrieval(rootDir) {
  const errors = [];
  const { queries } = JSON.parse(readFileSync(join(rootDir, 'evals/queries.json'), 'utf8'));
  const skills = new Map(
    listSkills(join(rootDir, 'skills')).map((s) => {
      const text = readFileSync(join(rootDir, 'skills', s.relPath), 'utf8');
      const haystack = (s.description + '\n' + parseFrontmatter(text).body).toLowerCase();
      return [s.name, haystack];
    }),
  );
  for (const q of queries) {
    const hay = skills.get(q.expectedSkill);
    if (!hay) {
      errors.push(`"${q.question}": expected skill "${q.expectedSkill}" not found`);
      continue;
    }
    for (const fact of q.mustMention) {
      if (!hay.includes(fact.toLowerCase())) {
        errors.push(`"${q.question}": skill "${q.expectedSkill}" missing fact "${fact}"`);
      }
    }
  }
  return errors;
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  const errors = evalRetrieval(join(dirname(fileURLToPath(import.meta.url)), '..'));
  if (errors.length) {
    console.error(errors.join('\n'));
    process.exit(1);
  }
  console.log('eval-retrieval: ok');
}
