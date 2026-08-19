#!/usr/bin/env node
/*
  Render the same slide in every preset, so someone choosing a style is
  comparing styles and not comparing copy.

    node scripts/build-gallery.cjs        (then screenshot brand/gallery)
*/
const fs = require('fs');
const path = require('path');
const { slideHtml } = require('../templates/slide.cjs');

const presetDir = path.join(__dirname, '..', 'brand', 'presets');
const outDir = path.join(__dirname, '..', 'brand', 'gallery');
fs.mkdirSync(outDir, { recursive: true });

// One neutral slide. Same words every time.
const SAMPLE = {
  photo: path.join('..', '..', 'examples', 'demo-carousel', 'photos', '02-stone.jpg'),
  crop: 'center 30%',
  head: 'This is your *headline.*',
  sub: 'And this is the line underneath it, where the thought finishes.',
};

const files = fs.readdirSync(presetDir).filter(f => f.endsWith('.json')).sort();
files.forEach(f => {
  const brand = JSON.parse(fs.readFileSync(path.join(presetDir, f), 'utf8'));
  const html = slideHtml({ ...SAMPLE, id: brand.preset }, brand, '1080x1350');
  fs.writeFileSync(path.join(outDir, `${brand.preset}-1080x1350.html`), html);
});
console.log(`${files.length} gallery slides. Now:\n  node scripts/screenshot.cjs brand/gallery`);
