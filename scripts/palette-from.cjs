#!/usr/bin/env node
/*
  Pull a real palette out of an image, instead of guessing at it.

    node scripts/palette-from.cjs <image> [<image> ...]

  Prints the dominant colours plus a suggested bg / ink / accent, so brand
  setup from someone's own pictures is measured rather than eyeballed.
*/
const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');

const files = process.argv.slice(2).filter(f => fs.existsSync(f));
if (!files.length) {
  console.error('Usage: node scripts/palette-from.cjs <image> [<image> ...]');
  process.exit(1);
}

const lum = ([r, g, b]) => {
  const f = v => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const hex = ([r, g, b]) => '#' + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase();
// Ratio-based saturation flatters near-blacks: a 40/56 split reads as "29%
// saturated" while looking like charcoal. Absolute chroma is what the eye
// actually calls colourful.
const chroma = ([r, g, b]) => Math.max(r, g, b) - Math.min(r, g, b);
const sat = ([r, g, b]) => { const mx = Math.max(r, g, b), mn = Math.min(r, g, b); return mx === 0 ? 0 : (mx - mn) / mx; };

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const all = [];
  const standouts = [];

  for (const f of files) {
    const b64 = fs.readFileSync(path.resolve(f)).toString('base64');
    const ext = path.extname(f).slice(1).toLowerCase().replace('jpg', 'jpeg');
    const res = await page.evaluate(async (src) => {
      const img = new Image();
      img.src = src;
      await img.decode();
      const c = document.createElement('canvas');
      c.width = 160; c.height = Math.round(160 * img.height / img.width);
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0, c.width, c.height);
      const d = ctx.getImageData(0, 0, c.width, c.height).data;
      // 16 levels per channel. Coarser than this and a bright dress averages
      // into the wall behind it, which is how you end up recommending grey.
      const map = {};
      for (let i = 0; i < d.length; i += 4) {
        const k = [d[i] >> 4, d[i + 1] >> 4, d[i + 2] >> 4].join(',');
        (map[k] = map[k] || { n: 0, r: 0, g: 0, b: 0 });
        map[k].n++; map[k].r += d[i]; map[k].g += d[i + 1]; map[k].b += d[i + 2];
      }
      const buckets = Object.values(map)
        .sort((a, b) => b.n - a.n).slice(0, 60)
        .map(v => ({ n: v.n, rgb: [v.r / v.n, v.g / v.n, v.b / v.n] }));

      // A bright dress or a painted wall spreads across dozens of small
      // buckets, so counting buckets misses it entirely. Average the genuinely
      // colourful pixels directly instead, and report how much of the frame
      // they cover.
      let cr = 0, cg = 0, cb = 0, cn = 0, px = 0;
      for (let i = 0; i < d.length; i += 4) {
        px++;
        const mx = Math.max(d[i], d[i + 1], d[i + 2]);
        const mn = Math.min(d[i], d[i + 1], d[i + 2]);
        if (mx - mn >= 90 && mx > 40 && mx < 250) {
          cr += d[i]; cg += d[i + 1]; cb += d[i + 2]; cn++;
        }
      }
      const standout = cn / px > 0.004
        ? { rgb: [cr / cn, cg / cn, cb / cn], share: cn / px }
        : null;

      return { buckets, standout };
    }, `data:image/${ext};base64,${b64}`);

    console.log(`\n${path.basename(f)}`);
    res.buckets.slice(0, 5).forEach(b => console.log(`  ${hex(b.rgb)}  ${String(Math.round(b.n)).padStart(5)} px`));
    if (res.standout) {
      console.log(`  standout colour: ${hex(res.standout.rgb)}  (${(res.standout.share * 100).toFixed(1)}% of the picture)`);
      standouts.push(res.standout);
    }
    all.push(...res.buckets);
  }
  await browser.close();

  // Background and text want to be calm, so prefer low-saturation extremes.
  const calm = all.filter(c => chroma(c.rgb) < 34);
  const pool = calm.length >= 4 ? calm : all;
  const lightest = [...pool].sort((a, b) => lum(b.rgb) - lum(a.rgb))[0];
  const darkest  = [...pool].sort((a, b) => lum(a.rgb) - lum(b.rgb))[0];

  // The accent is the colour someone would point at, which is never the most
  // common one. Score saturation heavily and let area only break ties.
  let accent = null;
  if (standouts.length) {
    // Average the standout colour across every picture she gave, weighted by
    // how much of each frame it covered.
    const w = standouts.reduce((s, c) => s + c.share, 0);
    accent = { rgb: [0, 1, 2].map(i => standouts.reduce((s, c) => s + c.rgb[i] * c.share, 0) / w) };
  } else {
    accent = all.filter(c => { const l = lum(c.rgb); return l > 0.02 && l < 0.78 && chroma(c.rgb) >= 45; })
                .sort((a, b) => chroma(b.rgb) - chroma(a.rgb))[0] || null;
  }

  console.log(`\nSuggested brand colours:`);
  console.log(`  bg      ${hex(lightest.rgb)}   (lightest calm tone)`);
  console.log(`  ink     ${hex(darkest.rgb)}   (darkest calm tone)`);
  if (accent) {
    console.log(`  accent  ${hex(accent.rgb)}   (chroma ${Math.round(chroma(accent.rgb))}, the colour that stands out)`);
  } else {
    console.log(`  accent  none found. These pictures are all neutral, so pick an accent by hand.`);
  }
  console.log(`\nThese are a starting point. Show one slide and adjust.`);
})();
