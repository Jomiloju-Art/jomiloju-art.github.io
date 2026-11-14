// Site check: run with `node scripts/check.js`. No installs needed.
// Exits 1 if anything is wrong, so Claude Code's Stop hook won't let a broken site be called "done".
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');
const problems = [];
const fail = (msg) => problems.push(msg);

const html = read('index.html');
const css = read('styles.css');
const js = read('script.js');

// 1. JavaScript has no syntax errors.
try {
  execFileSync(process.execPath, ['--check', path.join(root, 'script.js')], { stdio: 'pipe' });
} catch (e) {
  fail(`script.js has a syntax error:\n${String(e.stderr || e.message).trim()}`);
}

// 2. CSS braces balance (catches a missing } that silently breaks the rest of the file).
const cssNoComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
const opens = (cssNoComments.match(/{/g) || []).length;
const closes = (cssNoComments.match(/}/g) || []).length;
if (opens !== closes) fail(`styles.css has ${opens} "{" but ${closes} "}".`);

// 3. Every local file the page links to exists.
const refs = [...html.matchAll(/\b(?:href|src)="([^"]+)"/g)].map((m) => m[1]);
for (const ref of refs) {
  if (/^(https?:|mailto:|tel:|#|data:)/.test(ref)) continue;
  const file = ref.split(/[?#]/)[0];
  if (!fs.existsSync(path.join(root, file))) fail(`index.html links to "${ref}", which doesn't exist.`);
}
const ogImage = html.match(/property="og:image"\s+content="([^"]+)"/);
if (ogImage) {
  const local = ogImage[1].replace(/^https:\/\/jomiloju-art\.github\.io\//, '');
  if (!/^https?:/.test(local) && !fs.existsSync(path.join(root, local))) fail(`og:image "${ogImage[1]}" points to a missing file.`);
}

// 4. Every #link has a matching id, and ids are unique.
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
if (dupes.length) fail(`Duplicate ids: ${[...new Set(dupes)].join(', ')}`);
for (const m of html.matchAll(/href="#([^"]+)"/g)) {
  if (!ids.includes(m[1])) fail(`Link "#${m[1]}" has no element with id="${m[1]}".`);
}

// 5. Every id the script looks up is on the page.
for (const m of js.matchAll(/getElementById\('([^']+)'\)/g)) {
  if (!ids.includes(m[1])) fail(`script.js looks for id "${m[1]}", which isn't in index.html.`);
}

// 6. Page basics.
if (!/<html[^>]*\blang="/.test(html)) fail('<html> is missing a lang attribute.');
if (!/<title>[^<]+<\/title>/.test(html)) fail('Page has no <title>.');
if (!/name="viewport"/.test(html)) fail('Page has no viewport meta tag (breaks phone layout).');
if (!/name="description"/.test(html)) fail('Page has no meta description.');
for (const m of html.matchAll(/<img\b[^>]*>/g)) {
  if (!/\balt="/.test(m[0])) fail(`Image without alt text: ${m[0].slice(0, 80)}`);
}
for (const m of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) {
  if (!/rel="[^"]*noopener/.test(m[0])) fail(`target="_blank" link without rel="noopener": ${m[0].slice(0, 80)}`);
}

// 7. The owner's decisions (2026-11-12). Changing these needs the owner's OK.
const visibleText = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ');
if (/needle\s*(&amp;|&|and)\s*knead/i.test(html)) fail('Needle & Knead must not appear on the portfolio.');
if (/tel:/i.test(html) || /(\+?234|\b0)[789][01]\d[\s-]?\d{3}[\s-]?\d{4}\b/.test(visibleText)) fail('No phone number on the site: contact is email only.');
if (!/mailto:/.test(html)) fail('The email contact link is missing.');
if (!fs.existsSync(path.join(root, 'Jomiloju_Obafunmi_CV.pdf'))) fail('The CV download file is missing.');

if (problems.length) {
  console.error(`Site check FAILED (${problems.length}):\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log('Site check passed.');
