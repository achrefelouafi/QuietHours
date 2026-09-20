/* ═══════════════════════════════════════════════════════════════
   engine/palette.js — every colour the room is allowed to use.
   These ARE the inks: the quantiser snaps each rendered pixel to
   the nearest one, so a new colour has to be added here to exist.
   Values were sampled from docs/reference.png; the blues and the
   olive came later, from docs/reference4.jpg, for the booth, and
   the beige and the sages from docs/sofas.jpg, for its lounge.
   ═══════════════════════════════════════════════════════════════ */
QH.M = {
  // ── navies: the room and nearly all the furniture ──
  outside:  [5, 11, 20],
  ink:      [8, 16, 26],      // outlines, deepest shadow
  wallB:    [11, 21, 33],     // the back wall
  navyDk:   [13, 25, 39],     // floor, furniture sides
  floor:    [17, 30, 45],
  wall:     [19, 34, 52],     // the left wall
  navy:     [22, 39, 57],     // most furniture tops
  navyLt:   [27, 45, 65],     // cushions, rails, the night sky
  slate:    [34, 57, 78],     // trim, screens
  steel:    [43, 70, 94],     // wall tops, door frame
  sky:      [57, 87, 110],    // screen text, rain

  // ── greys ──
  greyDk:   [38, 40, 46],
  grey:     [68, 70, 75],
  greyMid:  [90, 97, 103],    // between grey and greyLt, so shaded porcelain dithers to grey rather than to the sage or the sky
  greyLt:   [111, 124, 131],
  silver:   [160, 167, 163],
  cream:    [231, 229, 203],
  beige:    [198, 166, 124],  // the lounge's cream armchair, where the light is on it

  // ── oranges: everything the lamp touches ──
  rustDk:   [59, 36, 31],
  rust:     [87, 45, 32],
  rustLt:   [108, 53, 32],
  orangeDk: [134, 65, 34],
  orange:   [158, 80, 37],
  orangeLt: [191, 98, 35],
  bright:   [231, 130, 35],
  amber:    [233, 174, 89],
  glow:     [250, 220, 160],

  // ── greens ──
  leafDk:   [24, 60, 60],
  leaf:     [32, 82, 78],
  leafLt:   [48, 104, 90],
  olive:    [90, 92, 46],     // the booth's olive things
  oliveLt:  [126, 122, 62],
  sageDk:   [46, 66, 48],     // the lounge's green armchair
  sage:     [64, 90, 66],
  sageLt:   [82, 118, 76],

  // ── blues: the booth's neon, its screen, its arcade ──
  blueDk:   [26, 56, 122],    // the neon's wash on the walls
  blue:     [40, 98, 200],
  blueLt:   [88, 154, 255],   // the tubes
  cyan:     [156, 208, 255],  // their cores
  ice:      [228, 238, 250],  // the sponsor's mark

  // ── wood ──
  woodDk:   [45, 34, 38],
  wood:     [72, 54, 46],
  woodLt:   [109, 70, 48],
  tan:      [141, 117, 97],
};
