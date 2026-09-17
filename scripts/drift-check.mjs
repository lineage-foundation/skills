import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export async function checkDrift(registry, fetchSha) {
  const rows = [];
  for (const s of registry.sources) {
    if (!s.repo) continue; // url-only sources have no commit to compare
    try {
      const latest = await fetchSha(s.repo);
      rows.push({ id: s.id, pin: s.pin, latest, stale: latest !== s.pin });
    } catch (err) {
      rows.push({ id: s.id, pin: s.pin, error: err.message });
    }
  }
  return rows;
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  const registry = JSON.parse(readFileSync(join(root, 'sources/sources.json'), 'utf8'));
  const fetchSha = async (repo) =>
    execFileSync('gh', ['api', `repos/${repo}/commits/HEAD`, '--jq', '.sha'], {
      encoding: 'utf8',
    }).trim();
  const rows = await checkDrift(registry, fetchSha);
  const stale = rows.filter((r) => r.stale);
  const errors = rows.filter((r) => r.error);
  for (const r of stale) console.log(`STALE ${r.id}: pinned ${r.pin.slice(0, 7)} -> latest ${r.latest.slice(0, 7)}`);
  for (const r of errors) console.log(`ERROR ${r.id}: ${r.error}`);
  if (stale.length || errors.length) {
    console.log(`\n${stale.length} source(s) drifted${errors.length ? `, ${errors.length} source(s) failed` : ''}; review skills that cite them.`);
    process.exit(1);
  } else {
    console.log('drift-check: all pins current.');
  }
}
