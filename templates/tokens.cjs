// Turns a brand file into the numbers the slide template needs.
// Everything a non-designer should never be asked for is derived here.

const SIZES = {
  '1080x1350': { w: 1080, h: 1350, safeTop: 135, safeBottom: 1215 },
  '1080x1920': { w: 1080, h: 1920, safeTop: 200, safeBottom: 1670 },
  '1080x1080': { w: 1080, h: 1080, safeTop: 60,  safeBottom: 1020 },
};

// Scrim strength. Always a gradient behind the text only, never a flat filter
// over the whole photo. This is the rule that keeps photos alive.
const SCRIM = {
  light:  { a: 0.72, b: 0.60, c: 0.24 },
  medium: { a: 0.86, b: 0.72, c: 0.30 },
  heavy:  { a: 0.93, b: 0.84, c: 0.42 },
};

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16));
}

// WCAG relative luminance, used by both the scrim maths and check-brand.
function luminance(hex) {
  const [r, g, b] = hexToRgb(hex).map(v => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}

// Headline size falls as the headline gets longer. This is the single biggest
// thing that stops an untrained user producing an ugly slide.
function headSize(text, size) {
  const n = String(text || '').replace(/\*/g, '').length;
  const base = size.h >= 1900 ? 1.12 : 1;
  const px = n <= 24 ? 104 : n <= 45 ? 88 : n <= 75 ? 72 : n <= 110 ? 60 : n <= 160 ? 52 : 44;
  return Math.round(px * base);
}

// How far down the slide the copy actually reaches, 0..1. A headline alone
// needs a short scrim; a headline plus a list plus a closing line needs a long
// one, or the last lines fall off the dark and stop being readable.
function copyDepth(slide) {
  if (!slide) return 0;
  let w = 0;
  if (slide.kicker) w += 0.6;
  if (slide.head)   w += 1.4;
  if (slide.sub)    w += String(slide.sub).length / 90;
  if (slide.list)   w += slide.list.length * 0.55;
  if (slide.close)  w += 0.9;
  if (slide.cta)    w += 0.9;
  return Math.min(1, w / 6);
}

function scrimGradient(brand, size, slide) {
  const s = SCRIM[brand.scrim || 'medium'];
  const stretch = 1 + copyDepth(slide) * 0.55;
  // Build the scrim from whichever brand colour is actually dark. A dark-
  // background brand has a LIGHT ink, and darkening that gives a grey wash
  // that does not hide anything.
  const p = brand.palette;
  const base = luminance(p.bg) < luminance(p.ink) ? p.bg : p.ink;
  const [r, g, b] = hexToRgb(darken(base));
  const rgba = v => `rgba(${r},${g},${b},${v})`;
  const pos = brand.textPosition || 'top';

  const at = (v, max) => Math.round(Math.min(max, v * stretch)) + '%';

  if (pos === 'bottom') {
    return `linear-gradient(to top, ${rgba(s.a)} 0%, ${rgba(s.b)} ${at(30, 52)}, ${rgba(s.c)} ${at(48, 70)}, transparent ${at(62, 86)})`;
  }
  if (pos === 'center') {
    return `radial-gradient(ellipse 88% ${Math.round(52 * stretch)}% at 50% 50%, ${rgba(s.a)} 0%, ${rgba(s.b)} ${at(42, 60)}, ${rgba(s.c)} ${at(64, 82)}, transparent ${at(82, 96)})`;
  }
  return `linear-gradient(to bottom, ${rgba(s.a)} 0%, ${rgba(s.b)} ${at(28, 50)}, ${rgba(s.c)} ${at(46, 68)}, transparent ${at(60, 84)})`;
}

// A very dark version of a brand colour, so the scrim feels like the same
// world as the palette rather than a generic black wash.
function darken(hex) {
  const [r, g, b] = hexToRgb(hex).map(v => Math.round(v * 0.42));
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

function tokens(brand, sizeKey, slide) {
  const size = SIZES[sizeKey] || SIZES['1080x1350'];
  const p = brand.palette;
  return {
    size,
    pal: { ...p, light: p.light || p.bg },
    fonts: brand.fonts,
    stretch: brand.fonts.heroStretch || 'normal',
    frame: brand.frame !== false,
    pos: brand.textPosition || 'top',
    upper: (brand.case || 'sentence') === 'upper',
    scrim: scrimGradient(brand, size, slide),
    wordmark: brand.wordmark || '',
  };
}

module.exports = { tokens, SIZES, contrast, luminance, headSize, darken, copyDepth };
