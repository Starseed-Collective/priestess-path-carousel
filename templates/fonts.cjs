// Builds the Google Fonts <link> for whichever faces the brand actually uses.
// Axes are requested generously so heroStretch and italics are available.

const AXES = {
  'Noto Serif Display': 'ital,wdth,wght@0,62.5..100,400..600;1,62.5..100,400..600',
  'Playfair Display':   'ital,wght@0,400..700;1,400..700',
  'Cormorant Garamond': 'ital,wght@0,300..700;1,300..700',
  'Lora':               'ital,wght@0,400..700;1,400..700',
  'Montserrat':         'ital,wght@0,300..700;1,300..700',
  'Inter':              'ital,opsz,wght@0,14..32,300..800;1,14..32,300..800',
  'Anton':              'wght@400',
};

function fontLink(brand) {
  const wanted = [brand.fonts.hero, brand.fonts.accent, brand.fonts.meta]
    .filter(Boolean)
    .filter((f, i, a) => a.indexOf(f) === i);

  const families = wanted.map(f => {
    const axis = AXES[f];
    const name = f.replace(/ /g, '+');
    return axis ? `family=${name}:${axis}` : `family=${name}:wght@400;500;600;700`;
  }).join('&');

  return `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?${families}&display=swap" rel="stylesheet">`;
}

module.exports = { fontLink, KNOWN_FONTS: Object.keys(AXES) };
