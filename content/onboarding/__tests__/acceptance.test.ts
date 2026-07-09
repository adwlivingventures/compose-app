// BUILD_PROMPT §8 acceptance greps, automated:
//  - the analytics module carries no quiz answer keys, no name, no age
//  - zero hardcoded price strings in components (prices come from offerings;
//    "$1,800+" is the therapy comparator, not our price)

import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '..', '..', '..');

function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
}

function tsxFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...tsxFiles(full));
    else if (/\.tsx?$/.test(entry.name)) out.push(full);
  }
  return out;
}

describe('analytics privacy (CLAUDE.md §7)', () => {
  const ANSWER_KEYS = [
    'relationship',
    'reasons',
    'duration',
    'attribution',
    'bandaidHistory',
    'morningArousal',
    'libido',
    'adrenalineSpike',
    'breathEdge',
    'pelvicCheck',
    'contentFrequency',
    'escalation',
    'spectatoring',
    'partnerImpact',
    'aftermath',
    'avoidance',
    'scripts',
    'spillover',
    'symptoms',
    'goals',
    'goalFreeText',
  ];

  test('the analytics module references no answer keys, no name, no age', () => {
    const source = stripComments(
      fs.readFileSync(path.join(ROOT, 'services', 'analytics.ts'), 'utf8'),
    );
    for (const key of ANSWER_KEYS) {
      expect(source).not.toMatch(new RegExp(`\\b${key}\\b`));
    }
    expect(source).not.toMatch(/\bname\b/);
    expect(source).not.toMatch(/\bage\b/);
    expect(source).not.toMatch(/\banswers?\b/i);
  });
});

describe('no hardcoded prices in components', () => {
  test('components/ and app/onboarding.tsx contain no $X.XX literals in code', () => {
    const files = [
      ...tsxFiles(path.join(ROOT, 'components')),
      path.join(ROOT, 'app', 'onboarding.tsx'),
      path.join(ROOT, 'app', '(tabs)', 'index.tsx'),
    ];
    const offenders: string[] = [];
    for (const file of files) {
      const code = stripComments(fs.readFileSync(file, 'utf8'));
      if (/\$\d+\.\d{2}/.test(code)) offenders.push(path.relative(ROOT, file));
    }
    expect(offenders).toEqual([]);
  });
});
