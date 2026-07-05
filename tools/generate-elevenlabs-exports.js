/**
 * Generates per-day plain-text exports of the Auditory Anchor scripts for
 * ElevenLabs production.
 *
 * Input:  docs/COMPOSE-Phase-{1,2,3}-Scripts.md (the authored source of truth)
 * Output: docs/elevenlabs/day_N.txt — spoken text only, one file per day,
 *         named to match the audio convention in content/anchors.ts
 *         (day_5.txt → record → day_5.mp3).
 *
 * Cleanup performed: markdown headers, Core Focus lines, bold markers, and
 * backslash escapes are stripped; the wrapping quotation marks around each
 * script are removed; ellipses are preserved verbatim (they are the pause
 * convention — ~2 seconds each).
 *
 * Re-run after any script edit:  node tools/generate-elevenlabs-exports.js
 */

const fs = require('fs');
const path = require('path');

const DOCS = path.join(__dirname, '..', 'docs');
const OUT = path.join(DOCS, 'elevenlabs');
const SOURCES = [1, 2, 3].map((n) => path.join(DOCS, `COMPOSE-Phase-${n}-Scripts.md`));

function cleanLine(line) {
  return line
    .replace(/\\([^\\])/g, '$1') // markdown escapes: \. \! \- etc.
    .replace(/\*\*/g, '')
    .trim();
}

function parseFile(file) {
  const text = fs.readFileSync(file, 'utf8');
  const lines = text.split(/\r?\n/);
  const days = [];
  let current = null;

  for (const raw of lines) {
    const header = raw.match(/^###\s+\*?\*?Day (\d+):/);
    if (header) {
      if (current) days.push(current);
      current = { day: Number(header[1]), body: [] };
      continue;
    }
    if (!current) continue;
    if (/^\s*\*\*Core Focus:\*\*/.test(raw)) continue;
    const cleaned = cleanLine(raw);
    if (cleaned.length) current.body.push(cleaned);
  }
  if (current) days.push(current);
  return days;
}

function finalize(paragraphs) {
  let joined = paragraphs.join('\n\n');
  // Strip the wrapping quotation marks around the spoken script.
  joined = joined.replace(/^["“]/, '').replace(/["”]$/, '');
  return joined.trim() + '\n';
}

fs.mkdirSync(OUT, { recursive: true });

const all = SOURCES.flatMap(parseFile);
const problems = [];

for (const { day, body } of all) {
  if (!body.length) {
    problems.push(`Day ${day}: empty body`);
    continue;
  }
  const out = finalize(body);
  const words = out.split(/\s+/).length;
  // Later-phase scripts are legitimately compact (~75 words); flag only
  // truly broken extractions.
  if (words < 60 || words > 450) problems.push(`Day ${day}: suspicious word count (${words})`);
  fs.writeFileSync(path.join(OUT, `day_${day}.txt`), out, 'utf8');
}

const found = all.map((d) => d.day).sort((a, b) => a - b);
for (let d = 1; d <= 75; d++) {
  if (!found.includes(d)) problems.push(`Day ${d}: MISSING`);
}

console.log(`Wrote ${all.length} files to ${OUT}`);
if (problems.length) {
  console.error('PROBLEMS:');
  for (const p of problems) console.error('  - ' + p);
  process.exit(1);
}
console.log('All 75 days present, all word counts in range.');
