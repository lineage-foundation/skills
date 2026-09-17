import { mkdirSync, writeFileSync, rmSync, cpSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { listSkills } from '../lib/skills.mjs';

const AUTHOR = { name: 'Lineage Foundation', email: 'info@lineage.foundation' };
const VERSION = '0.1.0';
const DESCRIPTION =
  'Expertise for building on Lineage: the SDKs, the /v1 API, two-way (DRUID) payments, valence, and running a node to develop against.';
const REPO = 'https://github.com/lineage-foundation/skills';
const NAME_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const writeJson = (path, obj) => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(obj, null, 2) + '\n');
};

// Tools that consume the Agent-Skills SKILL.md standard directly: fan-out a
// byte-identical copy of each source skill dir into <tool>/skills/<name>/.
const ADAPTER_SKILL_ROOTS = ['.cursor/skills', '.gemini/skills', '.opencode/skills'];

function emitAgentSkillDirs(rootDir, skills) {
  for (const rel of ADAPTER_SKILL_ROOTS) {
    const base = join(rootDir, rel);
    rmSync(base, { recursive: true, force: true });
    mkdirSync(base, { recursive: true });
    for (const s of skills) {
      if (!NAME_RE.test(s.name)) throw new Error(`invalid skill name "${s.name}"`);
      const dest = join(base, s.name);
      mkdirSync(dest, { recursive: true });
      cpSync(join(s.dir, 'SKILL.md'), join(dest, 'SKILL.md'));
      const refs = join(s.dir, 'references');
      if (existsSync(refs)) cpSync(refs, join(dest, 'references'), { recursive: true });
    }
  }
}

function emitAgentsMd(rootDir, skills) {
  const lines = [
    '# Lineage skills',
    '',
    'Skills that make an AI coding agent expert in Lineage. Each skill lives under',
    '`skills/<track>/<name>/SKILL.md`; load the one that matches your task.',
    '',
    '## Skills',
    '',
    ...skills.map((s) => `- **${s.name}** — ${s.description}`),
    '',
    '## This repo',
    '',
    '- `npm run build` — regenerate tool adapters from `skills/`',
    '- `npm run validate` — check frontmatter and sources',
    '- `npm test` — unit tests',
    '- `npm run eval` — deterministic retrieval/fact check',
    '',
  ];
  writeFileSync(join(rootDir, 'AGENTS.md'), lines.join('\n'));
}

export function build(rootDir) {
  const skills = listSkills(join(rootDir, 'skills')).sort((a, b) =>
    a.name < b.name ? -1 : a.name > b.name ? 1 : 0,
  );
  const keywords = ['lineage', 'blockchain', 'sdk', 'web3', ...skills.map((s) => s.name)];

  writeJson(join(rootDir, '.claude-plugin/plugin.json'), {
    name: 'lineage',
    description: DESCRIPTION,
    version: VERSION,
    author: AUTHOR,
  });

  writeJson(join(rootDir, '.claude-plugin/marketplace.json'), {
    name: 'lineage',
    description: 'Lineage skills for AI coding agents.',
    owner: AUTHOR,
    plugins: [
      { name: 'lineage', description: DESCRIPTION, version: VERSION, source: './', author: AUTHOR },
    ],
  });

  writeJson(join(rootDir, '.codex-plugin/plugin.json'), {
    name: 'lineage',
    version: VERSION,
    description: DESCRIPTION,
    author: AUTHOR,
    homepage: REPO,
    repository: REPO,
    license: 'MIT',
    keywords,
    skills: './skills/',
  });

  emitAgentSkillDirs(rootDir, skills);
  emitAgentsMd(rootDir, skills);

  return skills;
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  const skills = build(join(dirname(fileURLToPath(import.meta.url)), '..'));
  console.log(`built manifests for ${skills.length} skill(s)`);
}
