# MS-CAR: website demo

Static site, no build step.

| Page | File |
|---|---|
| Home | `index.html` (+ `js/home.js`) |
| Car details | `car.html?id=<car id>` (+ `js/car.js`) |
| Sell your car | `sell.html` (+ `js/sell.js`) |

Shared: `css/style.css`, `js/common.js` (header, menu, contact details, map, car cards).
All content (business details, cars, brands, social tiles) lives in **`js/data.js`**.

## Preview
```
python -m http.server 8080
```
Open http://localhost:8080. Use a local server, not a double-click on the file, so the video caching works.

## Hero / reel videos
`tools/encode-hero.ps1` turns a source clip into the adaptive, seamless-loop hero set in `assets/video/`.
```
.\tools\encode-hero.ps1 -Source source\clip.mp4 -Duration 12 -Renditions 720,480
.\tools\encode-hero.ps1 -Source source\clip.mp4 -Duration 12 -FocusX 0.4 -Renditions mobile -PosterName hero-poster-portrait.jpg -PosterSize 720:1280
```
Phones play a portrait crop of the same video (`-FocusX` sets where the crop sits). Rename the output `hero-mobile.*` to `hero-portrait.*`.
Options: `-Sharpen 0.8 -RateScale 1.8` for soft sources (e.g. Facebook downloads).
After re-encoding, bump `CACHE` in `js/home.js` so browsers fetch the new files.

## Demo limitations
- Cars are edited in `js/data.js`; the planned admin panel will replace this.
- The Sell-your-car form hands off to WhatsApp; there is no backend yet.
