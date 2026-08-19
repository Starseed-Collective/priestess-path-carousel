# When something breaks

## "Could not find Chrome"

The most common one. npm blocked puppeteer from downloading its browser.

```
npx puppeteer browsers install chrome
```

Takes about ten seconds. Then render again.

## "Puppeteer is not installed"

```
npm install
```

## "node: command not found"

Node is not on this machine. Download the installer from nodejs.org, take the
version it offers you, double-click, restart the terminal, try again. This is
the one step that cannot be done for you.

## The fonts look wrong, everything is Times

A font name in `my-brand.json` is not on Google Fonts, so the browser fell back.
Run `node scripts/check-brand.cjs`, which warns about untested faces.

Rendering needs an internet connection, because fonts load from Google.

## The photo is in the wrong place

Change `crop` on that slide. First value is across, second is down.
`center 30%` means centred horizontally, 30% down. Smaller second number
moves the image down and shows more of the top.

## The text is hard to read

Set `"scrim": "heavy"` in `my-brand.json`. Do not darken the photo itself.

## The whole photo went murky

Set `"scrim": "light"`. The scrim should sit behind the text, not over the picture.

## A slide I deleted is still in the output

`generate.cjs` clears old HTML at that size, but old JPEGs stay. Delete the
`output/` folder and render again.

## It worked yesterday and now everything is Times

Check the internet connection. Fonts load from Google at render time.
