# Setting up a brand

Read this when `my-brand.json` does not exist yet. It runs once, ever.

**Do not ask design questions.** Do not ask about fonts by name, line heights,
letter spacing, or hex codes unless she offers them. Offer three doors and let
her pick whichever is easiest.

Open with something like:

> Before we make anything, let's set your look. Three ways to do it, pick whichever
> is easiest:
>
> 1. I show you some styles and you pick one
> 2. You show me a few pictures you love and I match them
> 3. You already know your colours and fonts and you tell me
>
> Which sounds easier?

---

## Door 1: show her styles

Show the six images in `brand/gallery/`. Same photo, same words, six looks:

| Preset | Reads as |
|---|---|
| `starseed` | condensed serif, cream, hot pink |
| `ancient-soft` | high-contrast serif, warm stone, oxblood. quiet and old |
| `bold-electric` | heavy caps, near black, acid green. loud |
| `clean-modern` | one sans, white, electric blue. nothing decorative |
| `earth-warm` | humanist serif, clay, terracotta. grounded |
| `night-cosmic` | deep indigo, silver, lilac. late and dreamy |

She picks one. Copy that preset to `my-brand.json`, set `name` and `wordmark`
to her brand, and go.

She can also start from one and move: "that one but green" is a normal answer.
Change `palette.accent` and show her the same slide again.

## Door 2: she shows you what she likes

She drops in two or three images: carousels she loves, her own brand photos,
her website, a Pinterest save.

**Measure the colours, do not guess them.** Save the images somewhere and run:

```
node scripts/palette-from.cjs <image> [<image> ...]
```

It reports a suggested background, text and accent, plus the standout colour
and how much of each picture it covers. Use those numbers as the starting
palette. Then look at the images yourself and pull out the rest:

- three colours: background, text, accent
- type character: high-contrast serif, condensed serif, soft serif, humanist
  serif, geometric sans, heavy display. Map it to the nearest tested face in
  `templates/fonts.cjs`
- where the text sits: top, centre, bottom
- a thin frame, or none
- how dark it goes behind the text: light, medium, heavy
- sentence case or all caps

Two things to say out loud, once, so she is not surprised later:

> I can match the feeling of a font, not the exact font. If yours is a paid one
> I will get you the closest free match.

> I am reading the colours off the pictures, so we may still want one round of
> "warmer" or "deeper" to land it.

Then write `my-brand.json`, render ONE slide, and show her. Adjust until she
says yes. Two rounds is normal.

## Door 3: she knows her brand

She has a brand kit. Take the three hex codes and the font names, write the
file, validate, show her one slide anyway.

---

## Always, whichever door

1. Write `my-brand.json` at the repo root.
2. Run `node scripts/check-brand.cjs`. If it errors, fix it before rendering
   ten slides with a palette that cannot be read.
3. Render one test slide and show it. Never go straight to a full carousel.
4. Tell her it is saved and she will not be asked again.

## The file

```json
{
  "name": "The Moon Room",
  "wordmark": "The Moon Room",
  "fonts": {
    "hero": "Cormorant Garamond",
    "heroStretch": "normal",
    "accent": "Lora",
    "meta": "Montserrat"
  },
  "palette": {
    "bg": "#F4EFE8",
    "ink": "#221B2E",
    "accent": "#8B6FB0",
    "light": "#FBF8F4"
  },
  "frame": true,
  "scrim": "medium",
  "textPosition": "top",
  "case": "sentence",
  "defaultSize": "1080x1350"
}
```

`wordmark` is typed normally. The spacing you see on the slide is applied for
her, so "The Moon Room" is correct and "T H E  M O O N  R O O M" is not.

`ink` is text on plain slides. `light` is text over photos, and should be
near-white whatever the rest of the palette does.
