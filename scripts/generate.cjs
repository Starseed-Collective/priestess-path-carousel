#!/usr/bin/env node
/*
  Turn a carousel folder into HTML slides.

    node scripts/generate.cjs <carousel-dir> [--size 1080x1920] [--brand <file>]

  <carousel-dir> needs a slides.json. Brand is resolved in this order:
    --brand flag  ->  <carousel-dir>/brand.json  ->  ./my-brand.json
*/
const fs = require('fs');
const path = require('path');
const { slideHtml } = require('../templates/slide.cjs');
const { SIZES } = require('../templates/tokens.cjs');

const args = process.argv.slice(2);
const dir = args.find(a => !a.startsWith('--'));
const flag = n => { const i = args.indexOf('--' + n); return i > -1 ? args[i + 1] : null; };

if (!dir) {
  console.error('Usage: node scripts/generate.cjs <carousel-dir> [--size WxH] [--brand file]');
  process.exit(1);
}
const carousel = path.resolve(dir);
const slidesFile = path.join(carousel, 'slides.json');
if (!fs.existsSync(slidesFile)) {
  console.error(`No slides.json in ${carousel}`);
  process.exit(1);
}

const doc = JSON.parse(fs.readFileSync(slidesFile, 'utf8'));

const brandCandidates = [
  flag('brand'),
  path.join(carousel, 'brand.json'),
  path.join(process.cwd(), 'my-brand.json'),
].filter(Boolean);
const brandPath = brandCandidates.find(p => fs.existsSync(path.resolve(p)));
if (!brandPath) {
  console.error('No brand found. Say "set up my brand" in Claude Code, or pass --brand <file>.');
  console.error('Looked in: ' + brandCandidates.join(', '));
  process.exit(1);
}
const brand = JSON.parse(fs.readFileSync(path.resolve(brandPath), 'utf8'));

const sizeKey = flag('size') || doc.size || brand.defaultSize || '1080x1350';
if (!SIZES[sizeKey]) {
  console.error(`Unknown size "${sizeKey}". Use one of: ${Object.keys(SIZES).join(', ')}`);
  process.exit(1);
}

// Clear stale HTML at this size so a removed slide cannot linger into a render.
fs.readdirSync(carousel)
  .filter(f => f.endsWith(`-${sizeKey}.html`))
  .forEach(f => fs.unlinkSync(path.join(carousel, f)));

let n = 0;
doc.slides.forEach((slide, i) => {
  const id = slide.id || String(i + 1).padStart(2, '0');
  const html = slideHtml({ ...slide, id }, brand, sizeKey);
  fs.writeFileSync(path.join(carousel, `${id}-${sizeKey}.html`), html);
  n++;
});

console.log(`${n} slides at ${sizeKey}  (brand: ${path.basename(brandPath)})`);
console.log(`Next: node scripts/screenshot.cjs ${dir}`);
