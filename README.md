# quiet hours

An isometric room, drawn pixel by pixel in a 2D canvas and snapped to thirty-two inks.
The first room is **room one** — a small flat at night, rain on the window, lit by one desk lamp.

![room one, lamp on](docs/preview.png)

Open `index.html`. No build step, no dependencies, no server.

- click the lamp to switch it off and on (`L`, `Enter` or `Space` also work)
- that's it. The lamp is the only thing in the room you can touch.

The room is built from two pictures in `docs/`: `reference.png` is the whole scene,
`assets.png` is every piece of furniture on its own. Each piece became one file.

---

## Layout

```
index.html              the page, and the list of scripts in load order
src/
  engine/
    core.js             the QH global, maths helpers
    palette.js          every colour the room may use — these are the inks
    inks.js             snap a frame to the palette (Bayer + static grain)
    camera.js           2:1 isometric projection
    draw.js             primitives: box, cyl, beam, disc, wall helpers …
    light.js            per-face shading from point lights, screen-space glow
  assets/               one file per thing in docs/assets.png
  scene/
    room.js             floor slab and the two walls
    roomOne.js          where everything goes, in painter order, plus the lights
  main.js               canvas, frame loop, the lamp click
tools/
  preview.js            render a frame to PNG without a browser
  dev.js                tiny static server, if you want one
```

Plain `<script>` tags, one shared `QH` namespace — so the page works from `file://`
and every file can be read on its own.

---

## The assets

Every function takes a position in **world units** (the room is 14 × 14, walls 8 high,
origin at the far corner; +x runs along the back wall, +y along the left wall, +z up)
and an options object for size and variants. Floor pieces take the far corner of their
footprint; wall pieces take a wall (`'L'` or `'B'`) and a position along it.

| file | what | signature |
|---|---|---|
| `bed.js` | daybed: rail, headboard, pillow, blanket | `bed(x, y, {w, d, rail})` |
| `sofa.js` | two-seater with a throw over one arm | `sofa(x, y, {w, d, face: '-y'│'+y', seats, throw})` |
| `desk.js` | the desk body; `desk.H` is the top height | `desk(x, y, {w, d, pedestal})` |
| `deskLamp.js` | the lamp. Stores its screen geometry in `deskLamp.last` for hit-testing | `deskLamp(x, y, z, {head: [dx, dy, dz]})` |
| `chair.js` | office chair, five-star base | `chair(x, y, {face})` — (x, y) is the seat centre |
| `coffeeTable.js` | low table with a journal and a mug | `coffeeTable(x, y, {w, d, bare})` |
| `rug.js` | woven rug | `rug(x, y, w, d)` |
| `bookshelf.js` | open shelf unit, books, radio, crate, plant and box on top | `bookshelf(x, y, {w, depth, h})` |
| `hifiConsole.js` | console with records and a turntable | `hifiConsole(x, y, {w, d, bare})` |
| `speaker.js` | box speaker, any size | `speaker(x, y, z, {w, d, h, face, rim})` |
| `nightstand.js` | two drawers, a book on top | `nightstand(x, y, {face: '+x'│'+y'})` |
| `chest.js` | storage chest, books on top | `chest(x, y, {w, d, h})` |
| `snakePlant.js` | the big spiky plant | `snakePlant(x, y, z, {r, size, n})` |
| `headphones.js` | headphones on a stand | `headphones(x, y, z, {size})` |
| `monitor.js` | monitor with code on the screen | `monitor(x, y, z, t, {w, h})` |
| `keyboard.js` | keyboard, and `mouse(x, y, z)` | `keyboard(x, y, z, {w, d})` |
| `door.js` | door, frame, plate, handle, mat, hall light | `door(wall, u, {w, h, mat})` |
| `window.js` | night sky, city, rain, frame | `window(wall, u, z, w, h, t)` |
| `clock.js` | wall clock, second hand ticking | `clock(wall, u, z, r, t)` |
| `poster.js` | framed print | `poster(wall, u, z, w, h, {art: 'mountain'│'sun'})` |
| `stripLight.js` | bar of light on the wall | `stripLight(wall, u, z, w)` |
| `wallShelf.js` | one mounted board on brackets; put things on it at `z + wallShelf.T` | `wallShelf(wall, u, z, w, {depth})` |
| `wallCabinet.js` | small open cabinet with a radio in it | `wallCabinet(wall, u, z, w, h, {depth})` |
| `plantShelf.js` | narrow shelf with a trailing plant *(built, not placed)* | `plantShelf(x, y, {w, d, h})` |
| `filingCabinet.js` | three drawers *(built, not placed)* | `filingCabinet(x, y, {w, d, h})` |
| `lowBookcase.js` | low two-cubby unit *(built, not placed)* | `lowBookcase(x, y, {w, d, h})` |
| `props.js` | the small stuff: `mug` `penCup` `photoFrame` `notepad` `book` `bookRow` `smallBox` `crate` `lidBox` `vinyl` `radio` `laptop` `journal` `turntable` `pottedPlant` `spikes` `leaves` `vines` | each `(x, y, z, o)` |

To change how something looks, edit its file. To move it, edit `scene/roomOne.js`.

---

## How it works

There is no 3D engine here, and no WebGL. It's a `2d` canvas context and four ideas.

### 1. Isometric projection

```js
sx = (x - y) * s
sy = (x + y) * s / 2 - z * s
```

A 2:1 diamond grid; `s` is pixels per unit. The camera sits at `+x +y +z`, so every
solid is drawn as three quads — the top, the `+y` face (screen-left) and the `+x` face
(screen-right). `draw.wall.L` and `draw.wall.B` wrap the two wall planes so a poster
can hang on either without knowing which axis it's on.

### 2. Painter ordering

There's no depth buffer. Things are drawn back to front in the order they appear in
`roomOne.js`: floor, rug, walls, then the wall-hung things, then furniture working
outwards from the far corner. Hand-ordering is simpler than sorting for a room this
size, and it never produces a wrong sort you have to debug. Keep the order when you
move something.

### 3. Ink quantisation

The scene paints into an offscreen buffer at a third of the display resolution, in
full colour. Then every pixel is pushed to the nearest of the thirty-two colours in
`palette.js` — a ramp of navies for the room, a ramp of oranges for whatever the lamp
touches, a few greys and greens. A 32k-entry lookup table maps 15-bit RGB to an ink,
so the pass is one table read per pixel.

Before the lookup each pixel gets a light Bayer nudge (so the lamp's falloff breaks
into rings instead of bands) and a static hash grain (so flat navy fills speckle the
way the reference does). Pixel art wants hard edges, so every `box()` also strokes a
one-pixel contour round its silhouette, and can take a warm `rim` along the top edges
that face the light.

### 4. Light

Two layers. First, **per-face shading**: `light.shade()` gives each face a brightness
from its base factor plus every point light's `n · L`, falling off with distance. The
lamp and the strip light are the sources (`light.sources` in `roomOne.js`), so the bed
rail's inner face is lit while the desk pedestal's far end isn't — and when the lamp
goes off, every face falls back to its base. Second, **materials**: surfaces the lamp
recolours (the desk top, the rug, the blanket) pick their colour with
`light.warm(dark, lit)`. Last, a few small **glows** are composited in screen space
with `'lighter'` — the bulb, a pool on the desk, the strip, the monitor, the hall
light under the door. They're small on purpose; the reference recolours surfaces
rather than blooming.

`light.lamp` is a 0..1 that eases toward the switch, so switching the lamp off is
one number changing.

![room one, lamp off](docs/lights-out.png)

---

## tools/preview.js

Renders a frame to PNG without a browser, so you can iterate on an asset fast.
It reads the `<script src>` list from `index.html`, runs those files in order against
a minimal DOM backed by [node-canvas](https://github.com/Automattic/node-canvas), and
writes the frame at 2× nearest-neighbour.

```bash
npm install
node tools/preview.js out.png [seconds] [width] [height] [lamp] [zoom] [panX] [panY]

npm run preview            # docs/preview.png
npm run preview:dark       # docs/lights-out.png
node tools/preview.js look.png 4.2 1100 760 1 2.4 -120 90   # zoomed in on the desk
```

The tool is for development only — `index.html` has no dependency on it and ships alone.

---

## Adding a room

1. Write the assets it needs as files in `src/assets/`, one per thing, using
   `QH.draw` primitives and `QH.M` colours. Keep new colours in the palette or they'll
   snap to a neighbour.
2. Write `src/scene/roomTwo.js` that builds a `QH.scenes.room(w, d, h)` and places
   things in painter order, and registers its light sources.
3. Add both to the script list in `index.html` and point `main.js` at the new scene.

---

## Credit

Made after seeing [a small light, room by room](https://a-small-light-three.vercel.app/),
which does the same trick in daylight on cream paper. The technique is borrowed;
the room, the palette and the code are not.
