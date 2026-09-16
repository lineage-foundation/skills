import { readFileSync } from 'node:fs';
import { join, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { listSkills, parseFrontmatter } from '../lib/skills.mjs';

function sourceIdsInBody(body) {
  const idx = body.indexOf('## Sources');
  if (idx === -1) return [];
  let tail = body.slice(idx + '## Sources'.length);
  const next = tail.search(/^##\s/m);
  if (next !== -1) tail = tail.slice(0, next);
  return [...tail.matchAll(/^\s*[-*]\s*([A-Za-z0-9_-]+)/gm)].map((m) => m[1]);
}

export function validate(rootDir) {
  const errors = [];
  const registry = JSON.parse(readFileSync(join(rootDir, 'sources/sources.json'), 'utf8'));
  const knownIds = new Set(registry.sources.map((s) => s.id));
  for (const s of registry.sources) {
    if (!s.id || (!s.repo && !s.url) || !s.pin) {
      errors.push(`sources.json: entry missing id/repo|url/pin: ${JSON.stringify(s)}`);
    }
  }

  const seen = new Set();
  for (const skill of listSkills(join(rootDir, 'skills'))) {
    const dirName = basename(dirname(join(rootDir, 'skills', skill.relPath)));
    if (!skill.name) errors.push(`${skill.relPath}: missing name`);
    else {
      if (skill.name !== dirName) errors.push(`${skill.relPath}: name "${skill.name}" != dir "${dirName}"`);
      if (seen.has(skill.name)) errors.push(`duplicate skill name: ${skill.name}`);
      seen.add(skill.name);
    }
    if (!skill.description) errors.push(`${skill.relPath}: missing description`);
    const body = parseFrontmatter(readFileSync(join(rootDir, 'skills', skill.relPath), 'utf8')).body;
    for (const id of sourceIdsInBody(body)) {
      if (!knownIds.has(id)) errors.push(`${skill.relPath}: unknown source id "${id}"`);
    }
  }
  return errors;
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  const errors = validate(join(dirname(fileURLToPath(import.meta.url)), '..'));
  if (errors.length) {
    console.error(errors.join('\n'));
    process.exit(1);
  }
  console.log('validate: ok');
}
