#!/usr/bin/env node
/*
  Put every rendered slide on one page, so a whole carousel can be eyeballed
  in a single look before anything gets posted.

    node scripts/contact-sheet.cjs <carousel-dir>

  Writes <carousel-dir>/output/_contact-sheet-1400x<H>.jpg
*/
const fs = require('fs');
const path = require('path');

const dir = process.argv[2];
if (!dir) { console.error('Usage: node scripts/contact-sheet.cjs <carousel-dir>'); process.exit(1); }
const outDir = path.join(path.resolve(dir), 'output');
if (!fs.existsSync(outDir)) { console.error(`No output/ in ${dir}. Render first.`); process.exit(1); }

const shots = fs.readdirSync(outDir).filter(f => /\.jpg$/.test(f) && !f.startsWith('_')).sort();
if (!shots.length) { console.error('No rendered slides found.'); process.exit(1); }

const COLS = 4, CELL = 320, GAP = 18, PAD = 28, LABEL = 30;
const rows = Math.ceil(shots.length / COLS);
const first = shots[0].match(/-(\d{3,4})x(\d{3,4})\.jpg$/);
const ratio = first ? Number(first[2]) / Number(first[1]) : 1.25;
const cellH = Math.round(CELL * ratio);
const W = PAD * 2 + COLS * CELL + (COLS - 1) * GAP;
const H = PAD * 2 + rows * (cellH + LABEL) + (rows - 1) * GAP;

const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:${W}px;height:${H}px;background:#1b1b1f;padding:${PAD}px;
     font-family:-apple-system,Helvetica,sans-serif}
.grid{display:grid;grid-template-columns:repeat(${COLS},${CELL}px);gap:${GAP}px}
figure{width:${CELL}px}
img{width:${CELL}px;height:${cellH}px;object-fit:cover;display:block;
    border:1px solid rgba(255,255,255,.16)}
figcaption{height:${LABEL}px;line-height:${LABEL}px;color:#c9c9d2;font-size:13px;
           overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
</style></head><body><div class="grid">
${shots.map(s => `<figure><img src="${s}"><figcaption>${s.replace(/-\d+x\d+\.jpg$/, '')}</figcaption></figure>`).join('\n')}
</div></body></html>`;

const page = path.join(outDir, `_contact-sheet-${W}x${H}.html`);
fs.writeFileSync(page, html);
console.log(`Contact sheet page written. Now run:\n  node scripts/screenshot.cjs ${path.join(dir,'output')} --only _contact-sheet --out ${path.join(dir,'output')}`);
