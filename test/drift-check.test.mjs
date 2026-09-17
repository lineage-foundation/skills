import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkDrift } from '../scripts/drift-check.mjs';

test('flags sources whose latest SHA differs from pin', async () => {
  const registry = {
    sources: [
      { id: 'a', repo: 'o/a', pin: 'aaa' },
      { id: 'b', repo: 'o/b', pin: 'bbb' },
      { id: 'w', url: 'https://x', pin: '1' },
    ],
  };
  const fetchSha = async (repo) => ({ 'o/a': 'aaa', 'o/b': 'ZZZ' })[repo];
  const rows = await checkDrift(registry, fetchSha);
  assert.equal(rows.find((r) => r.id === 'a').stale, false);
  assert.equal(rows.find((r) => r.id === 'b').stale, true);
  assert.equal(rows.find((r) => r.id === 'w'), undefined); // url-only skipped
});

test('one source failure does not abort the run', async () => {
  const registry = { sources: [{ id: 'a', repo: 'o/a', pin: 'aaa' }, { id: 'b', repo: 'o/b', pin: 'bbb' }] };
  const fetchSha = async (repo) => { if (repo === 'o/a') throw new Error('404'); return 'bbb'; };
  const rows = await checkDrift(registry, fetchSha);
  assert.equal(rows.find((r) => r.id === 'a').error, '404');
  assert.equal(rows.find((r) => r.id === 'b').stale, false);
});
