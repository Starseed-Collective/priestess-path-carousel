// One slide, one function. Photo slides and solid slides share the same copy
// stack so nothing can drift between them.

const { fontLink } = require('./fonts.cjs');
const { tokens, headSize } = require('./tokens.cjs');

function hexA(hex, a) {
  const h = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16));
  return `rgba(${r},${g},${b},${a})`;
}

// *starred words* become the accent colour, in italic. This is the only markup
// a user ever has to learn.
function mark(text, accent) {
  if (text == null) return '';
  return String(text)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    // Typewriter quotes are the fastest way to make a slide look unfinished.
    .replace(/(\w)'(\w)/g, '$1\u2019$2')
    .replace(/'(\d\ds)/g, '\u2019$1')
    .replace(/(^|[\s(\[])"/g, '$1\u201c').replace(/"/g, '\u201d')
    .replace(/(^|[\s(\[])'/g, '$1\u2018').replace(/'/g, '\u2019')
    .replace(/\.\.\./g, '\u2026')
    .replace(/\*([^*]+)\*/g, `<em style="color:${accent}">$1</em>`)
    .replace(/\n/g, '<br>');
}

function slideHtml(slide, brand, sizeKey) {
  const t = tokens(brand, sizeKey, slide);
  const { size, pal } = t;
  const photo = slide.photo;
  const onPhoto = Boolean(photo);

  // Two modes. "statement" is a headline over a live photo with the scrim
  // behind the words only. "body" is for slides that carry real paragraphs:
  // a flat wash across the whole frame so long copy stays readable, at the
  // cost of the photo becoming texture rather than subject.
  const body = slide.mode === 'body';
  const text = body ? (pal.washText || pal.light)
             : onPhoto ? pal.light : pal.ink;
  const hs = slide.headSize || headSize(slide.head, size);

  const justify = t.pos === 'bottom' ? 'flex-end' : t.pos === 'center' ? 'center' : 'flex-start';
  const padY = t.pos === 'bottom'
    ? `0 ${size.w * 0.083}px ${size.h - size.safeBottom + 40}px`
    : `${size.safeTop + 40}px ${size.w * 0.083}px 0`;
  const pad = t.pos === 'center' ? `0 ${size.w * 0.083}px` : padY;

  const shadow = body ? 'text-shadow:0 1px 6px rgba(0,0,0,.28);'
    : onPhoto ? 'text-shadow:0 2px 10px rgba(0,0,0,.55), 0 1px 3px rgba(0,0,0,.7);'
    : '';
  // Accent colours sit in a mid-tone band, so on photos they get a hairline
  // dark edge. Without this an accent word disappears over a bright patch.
  const accentEdge = onPhoto
    ? `-webkit-text-stroke:1.4px rgba(0,0,0,.62);paint-order:stroke fill;` +
      `text-shadow:0 1px 2px rgba(0,0,0,.95), 0 2px 9px rgba(0,0,0,.75), 0 3px 20px rgba(0,0,0,.5);`
    : '';

  const parts = [];
  if (slide.eyebrow !== false && t.wordmark) {
    parts.push(`<div class="eyebrow">${mark(t.wordmark, pal.accent)}</div>`);
  }
  if (slide.kicker) parts.push(`<div class="kicker">${mark(slide.kicker, pal.accent)}</div>`);
  if (slide.head)   parts.push(`<div class="head">${mark(slide.head, pal.accent)}</div>`);
  if (slide.sub)    parts.push(`<div class="sub">${mark(slide.sub, pal.accent)}</div>`);
  if (slide.list && slide.list.length) {
    parts.push(`<div class="list">` + slide.list
      .map(i => `<span class="dot">&#10022;</span>${mark(i, pal.accent)}`)
      .join('<br>') + `</div>`);
  }
  if (slide.body && slide.body.length) {
    parts.push(`<div class="body">` +
      slide.body.map(pgh => `<p>${mark(pgh, pal.accent)}</p>`).join('') + `</div>`);
  }
  if (slide.close) parts.push(`<div class="close">${mark(slide.close, pal.accent)}</div>`);
  if (slide.cta)   parts.push(`<div class="cta">${mark(slide.cta, pal.accent)}</div>`);

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<title>${(slide.id || 'slide')}</title>
${fontLink(brand)}
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{width:${size.w}px;height:${size.h}px;position:relative;overflow:hidden;
       background:${pal.bg};-webkit-font-smoothing:antialiased}
  .bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;
      object-position:${slide.crop || 'center 35%'}}
  .scrim{position:absolute;inset:0;background:${body
    ? hexA(pal.wash || pal.ink, slide.washOpacity != null ? slide.washOpacity : 0.82)
    : t.scrim}}
  .frame{position:absolute;inset:${Math.round(size.w * 0.035)}px;
         border:1.5px solid ${onPhoto ? 'rgba(255,255,255,.34)' : pal.ink + '40'};
         border-radius:6px;pointer-events:none}
  .wrap{position:absolute;inset:0;display:flex;flex-direction:column;
        justify-content:${justify};padding:${pad};
        ${t.pos === 'center' ? 'align-items:center;text-align:center;' : 'align-items:flex-start;'}}
  .eyebrow{font-family:'${t.fonts.meta || t.fonts.accent}',serif;font-weight:500;
           font-size:26px;letter-spacing:.22em;word-spacing:.5em;text-transform:uppercase;
           color:${text};opacity:.88;margin-bottom:26px;${shadow}}
  .kicker{font-family:'${t.fonts.accent}',serif;font-style:italic;font-weight:500;
          font-size:${Math.round(hs * 0.46)}px;color:${text};line-height:1.3;
          margin-bottom:16px;${shadow}}
  .head{font-family:'${t.fonts.hero}',serif;font-stretch:${t.stretch};font-weight:600;
        font-size:${hs}px;line-height:1.06;color:${text};
        ${t.upper ? 'text-transform:uppercase;letter-spacing:.01em;' : ''}${shadow}}
  .head em{font-style:italic;font-weight:600;${accentEdge}}
  .sub{font-family:'${t.fonts.accent}',serif;font-size:${Math.round(hs * 0.44)}px;
       line-height:1.42;color:${text};margin-top:${Math.round(hs * 0.28)}px;
       opacity:.97;${shadow}}
  .sub em{font-style:italic;${accentEdge}}
  .list{font-family:'${t.fonts.accent}',serif;font-style:italic;
        font-size:${Math.round(hs * 0.42)}px;line-height:1.62;color:${text};
        margin-top:${Math.round(hs * 0.26)}px;${shadow}}
  .list .dot{color:${pal.accent};font-style:normal;margin-right:14px;${accentEdge}}
  .close{font-family:'${t.fonts.accent}',serif;font-size:${Math.round(hs * 0.44)}px;
         line-height:1.4;color:${text};margin-top:${Math.round(hs * 0.26)}px;${shadow}}
  .close em{font-style:italic;${accentEdge}}
  .body{font-family:'${t.fonts.hero}',serif;font-stretch:${t.stretch};font-weight:400;
        font-size:${slide.bodySize || 46}px;line-height:1.26;color:${text};
        max-width:${Math.round(size.w * 0.80)}px;${shadow}}
  .body p + p{margin-top:${Math.round((slide.bodySize || 46) * 0.95)}px}
  .body em{font-style:italic;${accentEdge}}
  .handle{position:absolute;left:0;right:0;bottom:${Math.round(size.h * 0.055)}px;
          text-align:center;font-family:'${t.fonts.hero}',serif;font-size:32px;
          color:${text};opacity:.92;${shadow}}
  .cta{font-family:'${t.fonts.hero}',serif;font-stretch:${t.stretch};font-style:italic;
       font-weight:600;font-size:${Math.round(hs * 0.62)}px;line-height:1.12;
       color:${pal.accent};margin-top:${Math.round(hs * 0.34)}px;${shadow}${accentEdge}}
  ${slide.css || ''}
</style></head>
<body>
  ${onPhoto ? `<img class="bg" src="${photo}" alt="">` : ''}
  ${onPhoto ? `<div class="scrim"></div>` : ''}
  ${t.frame ? `<div class="frame"></div>` : ''}
  <div class="wrap">${parts.join('\n    ')}</div>
  ${slide.handle ? `<div class="handle">${mark(slide.handle, pal.accent)}</div>` : ''}
</body></html>`;
}

module.exports = { slideHtml, mark };
