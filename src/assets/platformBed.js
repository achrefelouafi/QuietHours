/* ═══════════════════════════════════════════════════════════════
   assets/platformBed.js — the double bed: a low wooden platform
   with a ledge, a bookcase headboard along the wall side, a lower
   block at the near end with a trailing plant on it, four pillows,
   grey sheet at the head, orange duvet over the rest.

   platformBed(x, y, o)
     footprint x..x+w (6.9) by y..y+d (6.3); the headboard runs
     down the x side (against the left wall), the foot is at +x.
     platformBed.H is the mattress top.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { box, poly, stroke, beam, rgb } = QH.draw;
  const { rnd } = QH;
  const light = QH.light, A = QH.assets;

  const PH = 0.45, MH = 0.5;                                         // platform, mattress
  const H = PH + MH;

  const platformBed = (x, y, o = {}) => {
    const w = o.w || 6.9, d = o.d || 6.3;
    const HB = 0.8, PILLAR = 1.3, HBH = 3.3, PLH = 2.2;               // headboard depth, near block width, heights
    const wood = light.warm(M.rustLt, M.orange), woodTop = light.warm(M.orange, M.orangeLt);
    const woodDk = light.warm(M.rust, M.rustLt), rim = light.warm(M.orange, M.amber);
    const W = { colTop: woodTop, colLeft: woodDk, colRight: wood, left: 0.9, right: 0.72 };
    // the platform is a step darker than the headboard, so the duvet reads against it
    const PL = { colTop: light.warm(M.rustLt, M.orangeDk), colLeft: light.warm(M.rustDk, M.rust), colRight: light.warm(M.rust, M.rustLt), left: 0.9, right: 0.75, rim: light.warm(M.rustLt, M.orange) };

    /** A pillow: a box with a puffed, lighter middle and a crease across it. */
    const pillow = (px, py, pz, pw, pd, ph, col, top) => {
      box(px, py, pz, pw, pd, ph, col, { colTop: top, top: 1, left: 0.82, right: 0.62 });
      const zt = pz + ph + 0.01, lt = QH.mix(top, M.cream, 0.18);
      poly([[px + pw * 0.18, py + pd * 0.14, zt], [px + pw * 0.82, py + pd * 0.14, zt], [px + pw * 0.82, py + pd * 0.86, zt], [px + pw * 0.18, py + pd * 0.86, zt]], rgb(lt));
      stroke([[px + pw * 0.5, py + pd * 0.1, zt], [px + pw * 0.5, py + pd * 0.9, zt]], rgb(QH.mix(col, M.ink, 0.35)));
    };

    /* ── headboard: a bookcase open toward the bed ── */
    const hl = d - PILLAR;                                          // length of the tall part
    box(x, y, 0, 0.25, hl, HBH, wood, W);                            // back panel
    box(x, y, 0, HB, hl, 1.55, wood, W);                             // the solid part behind the pillows
    box(x, y, 1.55, HB, hl, 0.12, wood, { ...W, top: 0.7 });          // compartment floor
    const zc = 1.67;
    if (!o.bare) {
      A.bookRow(x + 0.3, y + 0.35, zc, hl * 0.42, { along: 'y', depth: 0.45, seed: o.seed || 71, hMin: 0.75, hMax: 1.05,
                                                   cols: [M.navy, M.slate, light.warm(M.rustLt, M.orange), M.cream, M.greyDk] });
      A.ball(x + 0.45, y + hl * 0.62, zc, 0.17, M.greyDk);
      A.book(x + 0.25, y + hl - 0.95, zc, 0.5, 0.6, M.navy, { h: 0.1 });
      A.book(x + 0.28, y + hl - 0.92, zc + 0.1, 0.45, 0.55, light.warm(M.rustLt, M.orange), { h: 0.08 });
    }
    box(x, y, 0, HB, 0.15, HBH, wood, W);                            // far end panel
    box(x, y, HBH - 0.4, HB, hl, 0.4, wood, { ...W, rim });           // top board

    // the lower block at the near end, and the plant that trails off it
    box(x, y + hl, 0, HB, PILLAR, PLH, wood, { ...W, rim });
    if (!o.bare) {
      A.pottedPlant(x + 0.42, y + hl + PILLAR * 0.45, PLH, { r: 0.24, ph: 0.32, kind: 'leafy', size: 0.75, n: 8, seed: 43 });
      A.vines(x + 0.6, y + hl + PILLAR * 0.7, PLH + 0.25, 1.4, 4, 44);
      A.vines(x + 0.7, y + hl + PILLAR * 0.3, PLH + 0.2, 0.9, 2, 46);
    }

    /* ── platform, then the mattress on it ── */
    for (const [lx, ly] of [[x + HB, y + d - 0.3], [x + w - 0.3, y + d - 0.3], [x + w - 0.3, y + 0.1]]) box(lx, ly, 0, 0.25, 0.25, 0.12, M.ink, { edge: false });
    box(x + HB, y + 0.1, 0.12, w - HB, d - 0.1, PH - 0.12, M.rust, PL);

    const mx = x + HB, my = y + 0.3, mw = w - HB - 0.45, md = d - 1.15;   // mattress footprint: a ledge at +y and at the foot
    const split = mx + 1.9;                                          // where the duvet starts
    box(mx, my, PH, split - mx, md, MH, M.grey, { colTop: M.greyLt, top: 0.95, left: 0.85, right: 0.7 });

    // the duvet hangs a little over the +y side and the foot
    const dv = light.warm(M.rustLt, M.orangeDk), dvTop = light.warm(M.orangeDk, M.orangeLt);
    box(split, my - 0.08, PH - 0.05, mx + mw - split + 0.1, md + 0.16, MH + 0.1, dv,
        { colTop: dvTop, colLeft: light.warm(M.rust, M.orangeDk), left: 0.9, right: 0.7, rim: light.warm(M.orange, M.bright) });
    // the turned-back fold, and the crease running down the middle
    const zt = PH + MH + 0.06;
    poly([[split, my - 0.06, zt], [split + 0.55, my - 0.06, zt], [split + 0.55, my + md + 0.06, zt], [split, my + md + 0.06, zt]], rgb(light.warm(M.orangeDk, M.bright)));
    stroke([[split + 0.55, my - 0.06, zt], [split + 0.55, my + md + 0.06, zt]], rgb(light.warm(M.rust, M.orangeDk)));
    const R = rnd(73);
    for (let i = 0; i < 6; i++) {
      const cx = split + 0.9 + R() * (mx + mw - split - 1.2), cy = my + 0.3 + R() * (md - 0.6);
      beam([cx, cy, zt], [cx + 0.35 + R() * 0.4, cy + 0.1, zt], 0.03, light.warm(M.rust, M.orange), 1);
    }

    /* ── pillows: two rows, the back row leaning on the headboard ── */
    const pw = md / 2 - 0.25, pz = PH + MH;
    const or = light.warm(M.rustLt, M.orange), orT = light.warm(M.orangeDk, M.orangeLt);
    pillow(mx + 0.05, my + 0.15, pz, 0.7, pw, 0.55, or, orT);
    pillow(mx + 0.05, my + md / 2 + 0.1, pz, 0.7, pw, 0.55, M.greyDk, M.grey);
    pillow(mx + 0.7, my + 0.35, pz, 0.85, pw, 0.42, M.greyDk, M.grey);
    pillow(mx + 0.7, my + md / 2 + 0.3, pz, 0.85, pw, 0.42, or, orT);
  };
  platformBed.H = H;
  QH.assets.platformBed = platformBed;
})(QH);
