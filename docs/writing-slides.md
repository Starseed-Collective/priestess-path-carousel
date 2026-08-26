# Writing the slides

## The shape that works

Ten slides is plenty. Seven is often better.

1. **Hook.** One line. It has to work with no context, because that is how it
   will be seen. Say the thing, do not tease it.
2. **Turn.** Name what she already believes, and complicate it.
3. **Problem.** What is actually in the way. Be specific enough that it stings a little.
4. **Mechanism.** What changes it, plainly. This is where a list earns its place.
5. **Proof or example.** One concrete thing. Not a testimonial wall.
6. **The ask.** One action. Not three.

## Per slide

- One idea. If a slide has two ideas it is two slides.
- Headline under about 12 words. The size shrinks automatically as it grows,
  and past a point it shrinks into unreadable.
- The sub finishes the thought the headline started. It does not repeat it.
- Lists cap at five items. Six is a spreadsheet.

## Fields

| Field | What it is |
|---|---|
| `head` | the headline. the only required field |
| `sub` | the line underneath |
| `kicker` | a small italic line above the headline |
| `list` | array of short lines with accent marks |
| `close` | a line after the list |
| `cta` | the ask, in accent colour, at the end |
| `photo` | leave it out for a plain background slide |
| `crop` | where the photo sits, e.g. `center 30%` |
| `eyebrow` | `false` to hide the wordmark on this slide |
| `headSize` | override the automatic headline size |
| `mode` | `"body"` for a text-heavy slide under a flat wash |
| `body` | array of paragraphs, body mode only |
| `handle` | your @name, centred at the bottom |

## Two kinds of slide

**Statement slides** are the default. A headline over a live photo, with the
shadow behind the words only, so the picture stays a picture.

**Body slides** are for when you have real paragraphs to say. Set
`"mode": "body"` and the photo goes under a flat wash so long copy stays
readable. The picture becomes texture instead of subject. That is the trade,
and it is the right trade when the words are the point.

```json
{ "id": "02", "mode": "body", "photo": "photos/x.jpg",
  "eyebrow": false,
  "body": [
    "First paragraph.",
    "Second paragraph.",
    "Third."
  ],
  "handle": "@yourhandle" }
```

`bodySize` changes the text size, `washOpacity` how much photo shows through
(0.82 by default, lower shows more picture).

Do not use body slides for everything. Two or three in a carousel is plenty,
or the whole set stops feeling like photography.

## Accent words

Put `*stars*` around anything that should be the accent colour.

```
"head": "You are not *behind.*"
```

Use it once per slide. Twice is a highlighter, not an accent.

## Sound like a person

- Short sentences. Then one longer one that carries the weight.
- Say the concrete thing. "Three clients" beats "increased capacity."
- No em dashes. Use a comma, a full stop, or start a new line.
- Read it out loud. If you would not say it out loud, rewrite it.
