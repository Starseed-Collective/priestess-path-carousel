# Looking at slides before anyone else does

Render, then look. Every slide, every time. This is the whole difference between
graphics that look made and graphics that look generated.

## Faces and bodies

- The top of the head sits roughly a third of the way down, never touching the
  top edge. Headroom is not wasted space, it is what makes a photo look composed.
- No cut-off feet on a full-length shot. Either the whole body or an honest crop
  at the waist. Ankles cut at the frame edge look like a mistake.
- Nothing important behind the text block.

Fix by changing `crop`. A smaller Y percent moves the image down and gives more
headroom: `center 30%` to `center 15%`.

## Where Instagram will cut

- **4:5 feed (1080x1350).** Meta crops to square in some placements. Keep
  headlines and faces between y 135 and y 1215.
- **9:16 story (1080x1920).** Instagram's own buttons cover the bottom 250px and
  the top 200px. Nothing that matters goes there.

## Reading

- The scrim sits behind the text only. The rest of the photo stays bright. If
  the whole image has gone murky, the scrim is too heavy or the photo is wrong.
- Accent colours are mid-tone by nature, so they are the first thing to
  disappear over a bright patch. If an accent word is hard to read, the scrim
  is not reaching far enough down.
- Read it at thumbnail size too. Most people meet a carousel small.

## One brand, not nine

- Same fonts on every slide.
- Same palette on every slide.
- Same frame, or no frame, on every slide.
- The wordmark on slide one, then `eyebrow: false` after that.

Font drift between slides is the most common way a set stops looking professional,
and it usually happens when a change was applied to some slides and not others.

## Then

Only after all of that: show her, say the folder path, and open it.
