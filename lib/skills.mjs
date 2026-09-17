import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

export function parseFrontmatter(text) {
  text = text.replace(/\r\n/g, '\n');
  if (!text.startsWith('---')) return { attrs: {}, body: text };
  const end = text.indexOf('\n---', 3);
  if (end === -1) throw new Error('Unterminated frontmatter block');
  const raw = text.slice(3, end).trim();
  const body = text.slice(text.indexOf('\n', end + 1) + 1);
  const attrs = {};
  for (const line of raw.split('\n')) {
    const m = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if (v === '|' || v === '>' || v === '|-' || v === '>-')
      throw new Error(`Unsupported YAML block scalar for "${m[1]}"; use a single-line value`);
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    attrs[m[1]] = v;
  }
  return { attrs, body };
}

export function listSkills(rootDir) {
  const out = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      const p = join(dir, entry);
      if (statSync(p).isDirectory()) walk(p);
      else if (entry === 'SKILL.md') {
        const { attrs } = parseFrontmatter(readFileSync(p, 'utf8'));
        out.push({
          name: attrs.name,
          description: attrs.description,
          dir,
          relPath: relative(rootDir, p).split(sep).join('/'),
        });
      }
    }
  };
  walk(rootDir);
  return out;
}
