---
name: priestess-path-carousel
description: Build on-brand Instagram carousels and story graphics from photos and copy. Use for "make a carousel", "post graphic", "story version", "slides for my launch".
---

# Priestess Path Carousel

Make Instagram carousels that look like one brand made them, because one brand did.

You are working with someone who is not technical and may never have opened a
terminal. Run the commands yourself. Never paste a command and ask them to run
it. Never show a stack trace. If something breaks, fix it and say what you fixed
in one sentence.

## First run only: is it installed?

If `node_modules/` is missing, run `npm install`.

If any render later fails with **"Could not find Chrome"**, that is npm blocking
puppeteer's browser download. Fix it yourself with:

```
npx puppeteer browsers install chrome
```

Say "setting that up for you, one moment." Do not explain npm.

If `node` itself is missing, that is the one thing you cannot fix. Tell them to
download the installer from nodejs.org, double-click it, and come back.

## Step 1: brand (once, ever)

If `my-brand.json` does not exist, run the setup in `brand/setup.md`.
It offers three doors. Let them pick. Do not ask design questions.

If they choose the "show me what you like" door, run
`node scripts/palette-from.cjs <their images>` to measure the palette rather
than eyeballing it. It finds the standout colour even when it covers only a
small part of the frame.

Once it exists, never ask again. Read it and move on.

## Step 2: photos before words

Never guess which photo they mean. If they point loosely ("in my downloads",
"the beach ones", "that one from Tuesday"):

1. List the candidates.
2. Read the top few and show them, so they choose from pictures not filenames.
3. Copy the chosen ones into `<carousel>/photos/` with names that say what they
   are (`hook-beach.jpg`, not `IMG_4123 2.jpeg`).
4. Convert HEIC to JPEG with `sips -s format jpeg`.
5. Check dimensions with `sips -g pixelWidth -g pixelHeight` before choosing crops.

A wrong photo costs a whole round trip. Ask.

## Step 3: write slides.json

Create `my-carousels/<name>/slides.json`. Shape and copy guidance:
`docs/writing-slides.md`. Everything is optional except `head`.

```json
{ "slides": [
  { "id": "01-hook", "photo": "photos/x.jpg", "crop": "center 30%",
    "head": "The line that stops the scroll, with *accent words*",
    "sub": "The thought underneath it.",
    "list": ["one", "two"], "close": "closing line", "cta": "Save this." }
]}
```

`*stars*` make a word the brand accent colour. That is the only markup.
`eyebrow: false` hides the wordmark on that slide. Use it on every slide after
the first, so the brand name is not shouted nine times.

## Step 4: render

```
node scripts/generate.cjs my-carousels/<name>
node scripts/screenshot.cjs my-carousels/<name>
```

Story versions of the same slides:
`node scripts/generate.cjs my-carousels/<name> --size 1080x1920` then screenshot again.

## Step 5: look at every slide before you show anyone

This is the step that makes the difference, and it is the one that gets skipped.

```
node scripts/contact-sheet.cjs my-carousels/<name>
node scripts/screenshot.cjs my-carousels/<name>/output --only _contact-sheet --out my-carousels/<name>/output
```

Read the contact sheet, then read any slide that looks off at full size.
Check against `docs/verify.md`. Fix, re-render, look again. Only then present.

## Step 6: hand it over

Say the folder path out loud and `open` it. "Where is it" is the most common
question and it should never need asking.

Then offer the other size: "want the story versions?"

## When they ask for changes

| They say | You change |
|---|---|
| "my head is cut off" | `crop` Y percent down, e.g. `center 30%` to `center 18%` |
| "move the photo up" | also `crop`. They mean the framing, not the element |
| "too dark" | `scrim` to `light` in my-brand.json, not the photo |
| "text is hard to read" | `scrim` to `heavy` |
| "make it bigger/smaller" | `headSize` on that slide overrides the automatic size |
| "different colour" | `palette.accent` in my-brand.json, then re-render everything |
| "make them stories" | `--size 1080x1920`, which re-lays-out. Never crop a 4:5 |

A style change asked for on one slide applies to every slide, unless they
say otherwise. Partial application is the most common failure.

## Never

- Never present a render you have not looked at.
- Never darken or filter a whole photo to make text readable. The scrim goes
  behind the text only.
- Never hand-write a slide's HTML. Change slides.json and regenerate.
- Never put text in the bottom 250px of a story. Instagram's own buttons sit there.
- Never use em dashes in slide copy.
