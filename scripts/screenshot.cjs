#!/usr/bin/env node
/*
  Render every *-WxH.html in a folder to JPEG at exactly that size.

    node scripts/screenshot.cjs <dir> [--out <dir>] [--only <substring>]

  If this dies with "Could not find Chrome", run:
    npx puppeteer browsers install chrome
*/
const path = require('path');
const fs = require('fs');

let puppeteer;
try {
  puppeteer = require('puppeteer');
} catch (e) {
  console.error('Puppeteer is not installed. Run:  npm install');
  process.exit(1);
}

const args = process.argv.slice(2);
const dir = args[0] && !args[0].startsWith('--') ? path.resolve(args[0]) : null;
if (!dir || !fs.existsSync(dir)) {
  console.error('Usage: node scripts/screenshot.cjs <dir> [--out <dir>] [--only <substring>]');
  process.exit(1);
}
const flag = n => { const i = args.indexOf('--' + n); return i > -1 ? args[i + 1] : null; };
const outputDir = flag('out') ? path.resolve(flag('out')) : path.join(dir, 'output');
const only = flag('only');

const SIZE_RE = /-(\d{3,4})x(\d{3,4})\.html$/;
const files = fs.readdirSync(dir)
  .filter(f => SIZE_RE.test(f))
  .filter(f => !only || f.includes(only))
  .sort();

if (!files.length) {
  console.error(`No *-WxH.html files in ${dir}${only ? ` matching "${only}"` : ''}. Run generate.cjs first.`);
  process.exit(1);
}
fs.mkdirSync(outputDir, { recursive: true });

(async () => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      protocolTimeout: 60000,
    });
  } catch (e) {
    if (/Could not find Chrome/i.test(e.message)) {
      console.error('Chrome is missing. Fix it with:\n\n  npx puppeteer browsers install chrome\n');
      process.exit(1);
    }
    throw e;
  }

  for (const f of files) {
    const [, w, h] = f.match(SIZE_RE).map(Number);
    const page = await browser.newPage();
    await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
    await page.goto(`file://${path.join(dir, f)}`, { waitUntil: 'load', timeout: 60000 });
    // Webfonts land after load. Wait for them rather than guessing.
    await page.evaluate(() => document.fonts.ready);
    await new Promise(r => setTimeout(r, 600));
    const out = path.join(outputDir, f.replace(/\.html$/, '.jpg'));
    await page.screenshot({ path: out, type: 'jpeg', quality: 92 });
    console.log(`  ${path.basename(out)}  ${w}x${h}`);
    await page.close();
  }
  await browser.close();
  console.log(`\nDone. Your images are in:\n  ${outputDir}`);
})();
