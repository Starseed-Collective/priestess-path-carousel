#!/usr/bin/env node
/*
  Validate a brand file before anyone renders ten slides with it.

    node scripts/check-brand.cjs [my-brand.json]

  Catches the two failures that produce an unreadable carousel:
  a headline colour that vanishes into the background, and a font name
  that is not really on Google Fonts (which silently falls back to Times).
*/
const fs = require('fs');
const path = require('path');
const { contrast } = require('../templates/tokens.cjs');
const { KNOWN_FONTS } = require('../templates/fonts.cjs');

const file = process.argv[2] || 'my-brand.json';
if (!fs.existsSync(file)) {
  console.error(`No brand file at ${file}. Say "set up my brand" in Claude Code.`);
  process.exit(1);
}
const b = JSON.parse(fs.readFileSync(file, 'utf8'));

const errors = [];
const warns = [];

for (const k of ['name', 'wordmark', 'fonts', 'palette']) {
  if (!b[k]) errors.push(`Missing "${k}".`);
}
if (errors.length) { report(); }

const HEX = /^#[0-9A-Fa-f]{6}$/;
for (const k of ['bg', 'ink', 'accent']) {
  if (!b.palette[k]) errors.push(`palette.${k} is missing.`);
  else if (!HEX.test(b.palette[k])) errors.push(`palette.${k} "${b.palette[k]}" is not a 6-digit hex like #1A2B3C.`);
}
for (const k of ['hero', 'accent']) {
  if (!b.fonts[k]) errors.push(`fonts.${k} is missing.`);
}

if (!errors.length) {
  const { bg, ink, accent } = b.palette;
  const light = b.palette.light || bg;

  const inkC = contrast(ink, bg);
  if (inkC < 4.5) errors.push(`Your text colour ${ink} on ${bg} is too faint (${inkC.toFixed(1)}:1, needs 4.5). Darken the text or lighten the background.`);

  const accC = contrast(accent, bg);
  if (accC < 2.0) errors.push(`Your accent ${accent} disappears on ${bg} (${accC.toFixed(1)}:1). Pick a deeper accent.`);
  else if (accC < 3.0) warns.push(`Accent ${accent} on ${bg} is soft (${accC.toFixed(1)}:1). Fine over photos, weak on plain slides.`);

  // Text over photos sits on a dark scrim, so check it there.
  const onScrim = contrast(light, '#150F0C');
  if (onScrim < 4.5) errors.push(`Your over-photo text ${light} is too dark to read on a photo (${onScrim.toFixed(1)}:1). Use something near-white.`);

  const uniq = new Set([bg.toLowerCase(), ink.toLowerCase(), accent.toLowerCase()]);
  if (uniq.size < 3) errors.push('Background, text and accent must be three different colours.');

  for (const [role, f] of Object.entries(b.fonts)) {
    if (role === 'heroStretch' || !f) continue;
    if (!KNOWN_FONTS.includes(f)) {
      warns.push(`Font "${f}" (${role}) is not one of the tested faces. If it is not on Google Fonts it will silently fall back to Times. Tested: ${KNOWN_FONTS.join(', ')}.`);
    }
  }
}

report();

function report() {
  if (errors.length) {
    console.error(`\nThis brand will not render well:\n`);
    errors.forEach(e => console.error(`  x  ${e}`));
  }
  if (warns.length) {
    console.error(`\nWorth a look:\n`);
    warns.forEach(w => console.error(`  !  ${w}`));
  }
  if (!errors.length) {
    console.log(`\n${path.basename(file)} looks good.${warns.length ? ' (with notes above)' : ''}`);
  }
  process.exit(errors.length ? 1 : 0);
}
