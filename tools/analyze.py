#!/usr/bin/env python3
"""
tools/analyze.py — measure a pixel-art isometric reference.

Extracts the things an AI guesses badly when it only *looks* at a picture:
the pixel scale, the palette (grouped by hue, sorted by value, so it drops
straight into INK[]), the isometric projection and room bounds, the tile and
brick periods, the lights and how they fall off, and a numbered list of
object boxes with their position in world units.

    python tools/analyze.py docs/reference.png
    -> docs/reference.spec.json       everything measured, one file
       docs/reference.native.png      the image at its native pixel resolution
       docs/reference.palette.png     swatch, one row per hue family
       docs/reference.annotated.png   room corners, lights, numbered object boxes

Deterministic, no model calls. Object labels are left null on purpose:
read the annotated PNG, fill them in, and the spec is complete.

Needs numpy, Pillow, opencv-python, scikit-learn.
"""
import argparse
import json
import math
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw
from sklearn.cluster import MiniBatchKMeans


# -- small helpers ----------------------------------------------------------

def load_rgb(path):
    return np.array(Image.open(path).convert('RGB'))


def to_lab(rgb):
    """float32 Lab with L in 0..100, a/b centred on 0."""
    lab = cv2.cvtColor(np.ascontiguousarray(rgb, dtype=np.uint8), cv2.COLOR_RGB2LAB).astype(np.float32)
    lab[..., 0] *= 100 / 255
    lab[..., 1] -= 128
    lab[..., 2] -= 128
    return lab


def hexs(c):
    return '#%02x%02x%02x' % tuple(int(round(float(v))) for v in c)


WARM = {'orange', 'red', 'yellow'}


def hue_family(rgb):
    r, g, b = [float(v) / 255 for v in rgb]
    mx, mn = max(r, g, b), min(r, g, b)
    v = mx
    s = 0.0 if mx == 0 else (mx - mn) / mx
    if mx == mn:
        h = 0.0
    elif mx == r:
        h = (60 * ((g - b) / (mx - mn)) + 360) % 360
    elif mx == g:
        h = 60 * ((b - r) / (mx - mn)) + 120
    else:
        h = 60 * ((r - g) / (mx - mn)) + 240
    if s < 0.15:
        fam = 'neutral'
    elif h < 15 or h >= 345:
        fam = 'red'
    elif h < 45:
        fam = 'orange'
    elif h < 70:
        fam = 'yellow'
    elif h < 170:
        fam = 'green'
    elif h < 200:
        fam = 'cyan'
    elif h < 260:
        fam = 'blue'
    elif h < 300:
        fam = 'purple'
    else:
        fam = 'magenta'
    return fam, round(h, 1), round(s, 3), round(v, 3)


def nearest(lab_px, centres, chunk=40000):
    """Index of the nearest centre for every Lab pixel, chunked to bound memory."""
    out = np.empty(len(lab_px), np.int32)
    for i in range(0, len(lab_px), chunk):
        d = ((lab_px[i:i + chunk, None, :] - centres[None]) ** 2).sum(-1)
        out[i:i + chunk] = d.argmin(1)
    return out


def _autocorr(p):
    p = p.astype(np.float64) - p.mean()
    n = len(p)
    f = np.fft.rfft(p, 2 * n)
    ac = np.fft.irfft(f * np.conj(f))[:n]
    return ac / (ac[0] if ac[0] else 1)


def period_of(profile, min_p=1.5, max_p=16.0, step=0.25):
    """Dominant period of a 1-D profile by comb-filtering its autocorrelation.

    score = mean(ac at k*s) - mean(ac at (k+1/2)*s); this rejects the
    half-period and multiple-of-period aliases a plain argmax falls for.
    """
    ac = _autocorr(profile)
    n = len(ac)
    lags = np.arange(n)
    best, best_score = None, -1.0
    for s in np.arange(min_p, max_p + 1e-9, step):
        ks = np.arange(1, 9) * s
        ks = ks[ks < n - 1]
        if len(ks) < 3:
            break
        on = np.interp(ks, lags, ac).mean()
        off = np.interp(ks - s / 2, lags, ac).mean()
        score = on - off
        if score > best_score:
            best_score, best = score, float(s)
    return best, float(best_score)


# -- 1. pixel scale ---------------------------------------------------------

ASSUMED_CANVAS_W = 400   # when there is no grid, treat the image as roughly this many art pixels wide


def detect_pixel_scale(rgb, forced=None):
    """How many source pixels make one art pixel. 1.0 means no upscale.

    True pixel art upscaled by an integer has a periodic edge-energy profile.
    AI-generated "pixel look" images usually don't: the blocks are soft and
    unevenly sized. Then the scale is a choice, not a measurement — we assume
    a ~400px-wide canvas and say so; pass --scale to override.
    """
    g = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY).astype(np.float32)
    gx = np.abs(np.diff(g, axis=1)).sum(axis=0)  # energy on each column boundary
    gy = np.abs(np.diff(g, axis=0)).sum(axis=1)
    if forced:
        return dict(scale=float(forced), scale_x=float(forced), scale_y=float(forced), confidence=None,
                    phase=[0.0, 0.0], method='forced (--scale)')
    sx, cx = period_of(gx)
    sy, cy = period_of(gy)
    conf = float(max(cx, cy))
    if conf < 0.15:
        s = max(1.0, round(rgb.shape[1] / ASSUMED_CANVAS_W))
        return dict(scale=s, scale_x=s, scale_y=s, confidence=round(conf, 3), phase=[0.0, 0.0],
                    method='assumed: no pixel grid found (soft/AI image); ~%dpx canvas' % ASSUMED_CANVAS_W)
    s = (sx + sy) / 2 if abs(sx - sy) <= 0.5 else (sx if cx >= cy else sy)

    def phase(prof, s):
        best, bo = -1.0, 0.0
        for o in np.arange(0, s, 0.25):
            idx = np.round(np.arange(o, len(prof), s)).astype(int)
            idx = idx[idx < len(prof)]
            v = prof[idx].mean()
            if v > best:
                best, bo = v, float(o)
        return bo

    return dict(scale=round(float(s), 3), scale_x=round(float(sx), 3), scale_y=round(float(sy), 3),
                confidence=round(conf, 3), phase=[phase(gx, s), phase(gy, s)], method='measured: periodic edge grid')


def to_native(rgb, ps):
    """Resample to one sample per art pixel, averaging the centre half of each block."""
    s = ps['scale']
    if s <= 1.25:
        return rgb.copy()
    H, W = rgb.shape[:2]
    ox, oy = ps['phase']

    def centres(n, o):
        c = np.arange(o + 1 - s / 2, n, s)
        return c[(c > -s / 2) & (c < n)]

    cx, cy = centres(W, ox), centres(H, oy)
    r = max(1, int(s / 4))
    x0 = np.clip(np.round(cx - r).astype(int), 0, W - 1)
    x1 = np.clip(np.round(cx + r).astype(int) + 1, 1, W)
    y0 = np.clip(np.round(cy - r).astype(int), 0, H - 1)
    y1 = np.clip(np.round(cy + r).astype(int) + 1, 1, H)
    ii = np.pad(rgb.astype(np.float64), ((1, 0), (1, 0), (0, 0))).cumsum(0).cumsum(1)
    tot = (ii[y1[:, None], x1[None, :]] - ii[y0[:, None], x1[None, :]]
           - ii[y1[:, None], x0[None, :]] + ii[y0[:, None], x0[None, :]])
    area = ((y1 - y0)[:, None] * (x1 - x0)[None, :])[..., None]
    return np.clip(tot / area + 0.5, 0, 255).astype(np.uint8)


# -- 2. palette -------------------------------------------------------------

def extract_palette(native, k=48, merge_de=7.0, min_cov=0.0004, seed=0):
    """k-means in Lab, merge near-duplicates, drop dust, group by hue family.

    Returns (palette list, ink index map HxW, Lab centres in ink order).
    """
    H, W = native.shape[:2]
    lab = to_lab(native).reshape(-1, 3)
    n = len(lab)
    rng = np.random.default_rng(seed)
    samp = lab[rng.choice(n, min(n, 80000), replace=False)]
    km = MiniBatchKMeans(n_clusters=min(k, len(samp)), n_init=3, random_state=seed, batch_size=4096).fit(samp)
    labels = km.predict(lab)
    centres = km.cluster_centers_
    counts = np.bincount(labels, minlength=len(centres)).astype(np.float64)

    kept = []  # [centre, count], biggest first, merged when within merge_de
    for ci in np.argsort(-counts):
        c, cnt = centres[ci], counts[ci]
        if cnt == 0:
            continue
        for kj, (kc, kcnt) in enumerate(kept):
            if np.linalg.norm(kc - c) < merge_de:
                kept[kj][0] = (kc * kcnt + c * cnt) / (kcnt + cnt)
                kept[kj][1] = kcnt + cnt
                break
        else:
            kept.append([c.copy(), cnt])
    cent = np.array([kc for kc, kcnt in kept if kcnt / n >= min_cov], np.float32)
    idx = nearest(lab, cent)

    ys, xs = np.mgrid[0:H, 0:W]
    ys, xs = ys.ravel(), xs.ravel()
    rgbf = native.reshape(-1, 3).astype(np.float64)
    entries = []
    for i in range(len(cent)):
        m = idx == i
        cnt = int(m.sum())
        if cnt == 0:
            continue
        mean_rgb = rgbf[m].mean(0)
        fam, h, s, v = hue_family(mean_rgb)
        L = float(to_lab(mean_rgb.reshape(1, 1, 3))[0, 0, 0])
        entries.append(dict(
            rgb=[int(round(c)) for c in mean_rgb], hex=hexs(mean_rgb), family=fam,
            hue=h, sat=s, val=v, L=round(L, 1), coverage=round(cnt / n, 5),
            centroid=[round(float(xs[m].mean() / W), 3), round(float(ys[m].mean() / H), 3)],
            bbox=[int(xs[m].min()), int(ys[m].min()), int(xs[m].max()), int(ys[m].max())],
            _old=i,
        ))
    fam_cov = {}
    for e in entries:
        fam_cov[e['family']] = fam_cov.get(e['family'], 0) + e['coverage']
    fams = sorted(fam_cov, key=lambda f: -fam_cov[f])
    entries.sort(key=lambda e: (fams.index(e['family']), e['L']))
    remap = np.zeros(len(cent), np.int32)
    for new, e in enumerate(entries):
        remap[e.pop('_old')] = new
        e['ink'] = new
    inks = remap[idx].reshape(H, W)
    cent_ordered = np.array([to_lab(np.array(e['rgb']).reshape(1, 1, 3))[0, 0] for e in entries], np.float32)
    return entries, inks, cent_ordered


def palette_js(pal):
    lines = ['const INK = [']
    for e in pal:
        r, g, b = e['rgb']
        lines.append('  [%3d, %3d, %3d],  // %2d %-8s %5.1f%%' % (r, g, b, e['ink'], e['family'], e['coverage'] * 100))
    lines.append('];')
    return '\n'.join(lines)


def draw_swatch(pal, path):
    fams = []
    for e in pal:
        if e['family'] not in fams:
            fams.append(e['family'])
    row_h, pad, W = 64, 8, 960
    img = Image.new('RGB', (W, row_h * len(fams) + pad), (12, 12, 14))
    d = ImageDraw.Draw(img)
    for r, fam in enumerate(fams):
        row = [e for e in pal if e['family'] == fam]
        weights = [max(0.02, math.sqrt(e['coverage'])) for e in row]
        total = sum(weights)
        x = pad
        y = pad + r * row_h
        d.text((x, y), fam, fill=(160, 160, 160))
        for e, w in zip(row, weights):
            bw = max(30, int((W - 2 * pad) * w / total) - 2)
            d.rectangle([x, y + 12, x + bw, y + row_h - 14], fill=tuple(e['rgb']))
            d.text((x + 2, y + row_h - 13), '%d %s' % (e['ink'], e['hex']), fill=(200, 200, 200))
            x += bw + 2
            if x > W - 30:
                break
    img.save(path)


# -- 3. room geometry + projection ------------------------------------------

def hough_angles(native):
    g = cv2.cvtColor(native, cv2.COLOR_RGB2GRAY)
    e = cv2.Canny(g, 40, 120)
    lines = cv2.HoughLinesP(e, 1, np.pi / 360, 15, minLineLength=max(6, native.shape[1] // 40), maxLineGap=2)
    if lines is None:
        return []
    hist = np.zeros(180)
    for x1, y1, x2, y2 in lines[:, 0]:
        a = int(round(math.degrees(math.atan2(y2 - y1, x2 - x1)))) % 180
        hist[a] += math.hypot(x2 - x1, y2 - y1)
    tot = hist.sum() or 1
    peaks = [(a, hist[a]) for a in range(180)
             if hist[a] >= hist[(a - 1) % 180] and hist[a] >= hist[(a + 1) % 180] and hist[a] > 0.03 * tot]
    peaks.sort(key=lambda p: -p[1])
    return [dict(angle_deg=a, weight=round(w / tot, 3)) for a, w in peaks[:6]]


def silhouette_hull(rgb, tol=6):
    """Convex hull (Nx2 int) of everything a border flood-fill doesn't reach."""
    H, W = rgb.shape[:2]
    lab8 = cv2.cvtColor(rgb, cv2.COLOR_RGB2LAB)
    fm = np.zeros((H + 2, W + 2), np.uint8)
    for sx, sy in [(0, 0), (W - 1, 0), (0, H - 1), (W - 1, H - 1), (W // 2, 0), (W // 2, H - 1), (0, H // 2), (W - 1, H // 2)]:
        if fm[sy + 1, sx + 1] == 0:
            cv2.floodFill(lab8.copy(), fm, (sx, sy), 0, (tol, tol, tol), (tol, tol, tol), 4 | cv2.FLOODFILL_MASK_ONLY | (1 << 8))
    inside = (fm[1:-1, 1:-1] == 0).astype(np.uint8)
    # drop specks but keep the thin slab lines that define the silhouette
    n, cc, st, _ = cv2.connectedComponentsWithStats(inside, 8)
    keep = np.zeros(n, bool)
    for i in range(1, n):
        keep[i] = st[i, cv2.CC_STAT_AREA] >= 12 or max(st[i, cv2.CC_STAT_WIDTH], st[i, cv2.CC_STAT_HEIGHT]) >= 8
    inside = keep[cc].astype(np.uint8)
    pts = cv2.findNonZero(inside)
    if pts is None or len(pts) < 100:
        raise SystemExit('no room found: the whole image is one colour?')
    return cv2.convexHull(pts).reshape(-1, 2)


def room_geometry(native, inks, cent, source=None, ps=None):
    """Silhouette of the room and the isometric frame derived from it.

    Screen y is down. Corners: T top of the far wall edge, LT/LB top and
    bottom of the left silhouette edge, RT/RB the same on the right, N the
    near floor corner. F = LB + RB - N is the far floor corner and the world
    origin. World: +x runs F->RB (screen right-down), +y runs F->LB
    (left-down), +z up.
    """
    H, W = native.shape[:2]
    border = np.concatenate([inks[0], inks[-1], inks[:, 0], inks[:, -1]])
    bg = int(np.bincount(border).argmax())
    # "outside" is what a flood from the border reaches within a small colour
    # tolerance. It may leak into a wall painted in the background colour, but
    # the slab edges always survive, and an isometric room silhouette is
    # convex — so the room is the convex hull of everything the flood missed.
    # The hull is found on the source image when there is one: at native
    # resolution the 1px slab edges that define the silhouette can vanish.
    if source is not None and ps and ps['scale'] > 1.25:
        sc = ps['scale']
        off = np.array(ps['phase']) + 1 - sc / 2   # source x of native sample 0
        hull = np.round((silhouette_hull(source) - off) / sc).astype(np.int32)
        hull = np.clip(hull, [0, 0], [W - 1, H - 1])
    else:
        hull = silhouette_hull(native)
    room = np.zeros((H, W), np.uint8)
    cv2.fillConvexPoly(room, hull.reshape(-1, 1, 2), 1)
    room = room.astype(bool)

    hx, hy = hull[:, 0], hull[:, 1]
    minx, maxx, miny, maxy = hx.min(), hx.max(), hy.min(), hy.max()
    tol = max(2, int(0.015 * (maxx - minx)))   # the side edges are vertical give or take rounding

    def pt(x, y):
        return [int(x), int(y)]

    N = pt(np.median(hx[hy >= maxy - tol]), maxy)
    T = pt(np.median(hx[hy <= miny + tol]), miny)
    lcol = hy[hx <= minx + tol]
    rcol = hy[hx >= maxx - tol]
    LT, LB = pt(minx, lcol.min()), pt(minx, lcol.max())
    RT, RB = pt(maxx, rcol.min()), pt(maxx, rcol.max())
    F = pt(LB[0] + RB[0] - N[0], LB[1] + RB[1] - N[1])

    # projection ratio th/tw from the two near floor edges
    def slope(a, b):
        dx = b[0] - a[0]
        return abs((b[1] - a[1]) / dx) if dx else None
    slopes = [s for s in (slope(LB, N), slope(N, RB)) if s]
    ratio = float(np.mean(slopes)) if slopes else 0.5
    angle = math.degrees(math.atan(ratio))
    named = min([(0.5, '2:1 (pixel isometric)'), (math.tan(math.radians(30)), 'true isometric 30 deg'),
                 (1.0, '1:1 (45 deg, military)')], key=lambda p: abs(p[0] - ratio))[1]

    def poly(*pts):
        return np.array(pts, np.int32)

    return dict(
        bg_ink=bg, room=room, corners=dict(T=T, LT=LT, LB=LB, N=N, RB=RB, RT=RT, F=F),
        ratio=ratio, angle_deg=angle, named=named,
        floor_poly=poly(F, RB, N, LB), left_poly=poly(LT, T, F, LB), right_poly=poly(T, RT, RB, F),
        wall_height_px=int(F[1] - T[1]),
    )


def region_mask(poly, shape, erode=3):
    m = np.zeros(shape[:2], np.uint8)
    cv2.fillPoly(m, [poly], 1)
    if erode:
        m = cv2.erode(m, np.ones((erode * 2 + 1, erode * 2 + 1), np.uint8))
    return m.astype(bool)


def line_period(grad, mask, u, max_p):
    """Period of lines parallel to unit vector u inside mask, in px, measured
    perpendicular to the lines. Uses gradient energy projected on the normal."""
    ys, xs = np.nonzero(mask)
    if len(xs) < 50:
        return None, 0.0
    nx, ny = -u[1], u[0]
    d = xs * nx + ys * ny
    d -= d.min()
    hist = np.bincount(np.round(d).astype(int), weights=grad[ys, xs])
    if len(hist) < 3 * max_p:
        max_p = max(4, len(hist) // 3)
    return period_of(hist, 3.0, max_p, 0.5)


def unit(a, b):
    v = np.array([b[0] - a[0], b[1] - a[1]], np.float64)
    n = np.linalg.norm(v)
    return v / n if n else v


SEAM_CONFIDENCE = 0.2   # comb score below this is furniture edges, not a grid


def surface_inks(inks, cent, mask, max_de=14.0):
    """Inks that are shades of a region's dominant ink: the surface itself,
    its texture and its contour lines, as opposed to things standing on it."""
    cnt = np.bincount(inks[mask], minlength=len(cent))
    dom = int(cnt.argmax())
    return sorted(int(i) for i in range(len(cent)) if np.linalg.norm(cent[i] - cent[dom]) < max_de and cnt[i])


def projection(native, inks, cent, geo):
    """Tile size from floor seams, room size in tiles, wall height in th units."""
    c = geo['corners']
    L = to_lab(native)[..., 0]
    gx = cv2.Sobel(L, cv2.CV_32F, 1, 0, ksize=3)
    gy = cv2.Sobel(L, cv2.CV_32F, 0, 1, ksize=3)
    grad = np.hypot(gx, gy)
    floor = region_mask(geo['floor_poly'], native.shape, 4)
    # only the floor's own pixels: furniture edges would otherwise dominate
    bare = floor & np.isin(inks, surface_inks(inks, cent, floor))
    bare = cv2.erode(bare.astype(np.uint8), np.ones((3, 3), np.uint8)).astype(bool)
    ux = unit(c['F'], c['RB'])   # +x direction on screen
    uy = unit(c['F'], c['LB'])   # +y direction on screen
    W = native.shape[1]
    px, sx = line_period(grad, bare, uy, W / 6)   # x=const seams run parallel to +y
    py, sy = line_period(grad, bare, ux, W / 6)
    r = geo['ratio']
    out = dict(ratio_th_over_tw=round(r, 4), angle_deg=round(geo['angle_deg'], 2), named=geo['named'],
               floor_seam_period_px=dict(x_lines=px, x_score=round(sx, 3), y_lines=py, y_score=round(sy, 3)))
    good = [p for p, s in ((px, sx), (py, sy)) if p and s > SEAM_CONFIDENCE]
    if good:
        p = float(np.mean(good))
        tw = p * math.sqrt(1 + r * r) / (2 * r)
        th = tw * r
        diag = tw * math.sqrt(1 + r * r)
        out.update(tw=round(tw, 2), th=round(th, 2),
                   room_tiles=dict(x=round(float(np.linalg.norm(np.subtract(c['RB'], c['F']))) / diag, 2),
                                   y=round(float(np.linalg.norm(np.subtract(c['LB'], c['F']))) / diag, 2)),
                   wall_height_th=round(geo['wall_height_px'] / th, 2))
    else:
        out.update(tw=None, th=None, room_tiles=None, wall_height_th=None,
                   note='no periodic floor seams found; pick tw yourself and divide the silhouette by it')
    out['wall_height_px'] = geo['wall_height_px']
    return out


# -- 4. lights --------------------------------------------------------------

def find_lights(native, inks, pal, room, max_lights=6):
    L = to_lab(native)[..., 0]
    H, W = L.shape
    sigma = max(2.0, W * 0.02)
    Lb = cv2.GaussianBlur(L, (0, 0), sigma)
    Lb[~room] = 0
    base = float(np.median(L[room]))
    k = int(sigma * 2) | 1
    dil = cv2.dilate(Lb, np.ones((k, k), np.uint8))
    cand = np.argwhere((Lb >= dil) & (Lb > base + 6) & room)
    cand = sorted(cand.tolist(), key=lambda p: -Lb[p[0], p[1]])
    peaks = []
    for y, x in cand:
        if all(math.hypot(x - qx, y - qy) > 2.5 * sigma for qy, qx in peaks):
            peaks.append((y, x))
        if len(peaks) >= max_lights:
            break
    lights = []
    for n, (y, x) in enumerate(peaks, 1):
        target = (Lb[y, x] + base) / 2
        radii, levels = [], []
        for t in np.linspace(0, 2 * np.pi, 16, endpoint=False):
            seen = set()
            for r in range(1, int(W * 0.5)):
                px, py = int(round(x + r * math.cos(t))), int(round(y + r * math.sin(t)))
                if not (0 <= px < W and 0 <= py < H) or not room[py, px]:
                    break
                seen.add(int(L[py, px] // 4))
                if Lb[py, px] < target:
                    radii.append(r)
                    break
            levels.append(len(seen))
        radius = float(np.median(radii)) if radii else None
        rr = int(radius or sigma * 2)
        yy, xx = np.mgrid[max(0, y - rr):min(H, y + rr + 1), max(0, x - rr):min(W, x + rr + 1)]
        disc = (yy - y) ** 2 + (xx - x) ** 2 <= rr * rr
        ink_counts = np.bincount(inks[yy[disc], xx[disc]], minlength=len(pal))
        top = np.argsort(-ink_counts)[:5]
        col = native[max(0, y - 2):y + 3, max(0, x - 2):x + 3].reshape(-1, 3).mean(0)
        fam = hue_family(col)[0]
        lv = float(np.mean(levels))
        core = float(np.mean(L[yy[disc], xx[disc]] > L[y, x] - 8))
        lights.append(dict(
            id='L%d' % n, at=[int(x), int(y)], at_norm=[round(x / W, 3), round(y / H, 3)],
            peak_L=round(float(L[y, x]), 1), blurred_peak_L=round(float(Lb[y, x]), 1), room_median_L=round(base, 1),
            colour=hexs(col), family=fam, warm=fam in WARM,
            falloff_radius_px=radius, falloff_radius_norm=round(radius / W, 3) if radius else None,
            distinct_levels_along_ray=round(lv, 1),
            falloff_style='smooth gradient (halo)' if lv >= 8 else 'stepped / flat (surfaces recoloured)',
            core_share=round(core, 3),
            likely='light source' if core < 0.25 and fam in WARM | {'yellow', 'neutral'} else 'bright object',
            inks_in_falloff=[dict(ink=int(i), share=round(float(ink_counts[i] / max(1, ink_counts.sum())), 3))
                             for i in top if ink_counts[i]],
        ))
    return lights


# -- 5. regions: floor + walls ----------------------------------------------

def region_stats(native, inks, pal, geo):
    c = geo['corners']
    L = to_lab(native)[..., 0]
    gx = cv2.Sobel(L, cv2.CV_32F, 1, 0, ksize=3)
    gy = cv2.Sobel(L, cv2.CV_32F, 0, 1, ksize=3)
    grad = np.hypot(gx, gy)
    ux, uy, uz = unit(c['F'], c['RB']), unit(c['F'], c['LB']), np.array([0.0, 1.0])
    W = native.shape[1]
    specs = [('floor', geo['floor_poly'], [('x_lines', uy), ('y_lines', ux)]),
             ('left_wall', geo['left_poly'], [('vertical', uz), ('courses', uy)]),
             ('right_wall', geo['right_poly'], [('vertical', uz), ('courses', ux)])]
    out = {}
    for name, poly, dirs in specs:
        m = region_mask(poly, native.shape, 3)
        if m.sum() < 100:
            out[name] = dict(note='region too small to measure')
            continue
        cnt = np.bincount(inks[m], minlength=len(pal)).astype(float)
        share = cnt / cnt.sum()
        top = np.argsort(-share)[:6]
        periods = {}
        for dname, u in dirs:
            p, s = line_period(grad, m, u, W / 6)
            periods[dname] = dict(period_px=p, score=round(s, 3), confident=bool(p and s > 0.12))
        sel = m[:-1, :-1]
        a, b = inks[:-1, :-1][sel], inks[1:, 1:][sel]
        cd, dd = inks[:-1, 1:][sel], inks[1:, :-1][sel]
        checker = float(np.mean((a == b) & (cd == dd) & (a != cd))) if len(a) else 0.0
        out[name] = dict(
            area_px=int(m.sum()),
            inks=[dict(ink=int(i), share=round(float(share[i]), 3), hex=pal[i]['hex']) for i in top if share[i] >= 0.01],
            distinct_inks_over_1pct=int((share >= 0.01).sum()),
            mean_L=round(float(L[m].mean()), 1),
            periods=periods,
            checkerboard_dither=round(checker, 4),
        )
    return out


# -- 6. objects -------------------------------------------------------------

def find_objects(native, inks, pal, cent, geo, proj, max_objects=60, de_thresh=10.0):
    """Anything that stands out from the local background.

    The background is a wide median of the image, so wall texture and floor
    grain (small, everywhere) are absorbed while objects (large deviations,
    local) survive. A big flat object leaves a ring; its bbox is still right.
    """
    H, W = native.shape[:2]
    c = geo['corners']
    structural = {geo['bg_ink']}
    for poly in (geo['floor_poly'], geo['left_poly'], geo['right_poly']):
        m = region_mask(poly, native.shape, 3)
        if m.sum() >= 100:
            structural.update(surface_inks(inks, cent, m))
    lab8 = cv2.cvtColor(native, cv2.COLOR_RGB2LAB)
    k = max(9, (W // 12) | 1)
    med = cv2.medianBlur(lab8, k).astype(np.float32)
    lab = lab8.astype(np.float32)
    de = np.sqrt(((lab[..., 0] - med[..., 0]) * 100 / 255) ** 2
                 + (lab[..., 1] - med[..., 1]) ** 2 + (lab[..., 2] - med[..., 2]) ** 2)
    m = (de > de_thresh) & geo['room']
    m = cv2.morphologyEx(m.astype(np.uint8), cv2.MORPH_OPEN, np.ones((2, 2), np.uint8))
    num, cc, stats, _ = cv2.connectedComponentsWithStats(m, 8)
    min_area = max(12, int(H * W * 0.0002))
    room_area = int(geo['room'].sum())
    ry, rx = np.nonzero(geo['room'])
    room_w, room_h = rx.max() - rx.min() + 1, ry.max() - ry.min() + 1
    tw, th = proj.get('tw'), proj.get('th')
    F = c['F']

    # components: (mask, x, y, w, h, area). Big ones are also split by hue
    # family so a rug touching a lit desk yields both, not one blob.
    fam_of = np.array([{'orange': 0, 'red': 0, 'yellow': 0, 'green': 1, 'neutral': 2}.get(e['family'], 3) for e in pal])
    comps = []
    for i in sorted(range(1, num), key=lambda i: -stats[i, cv2.CC_STAT_AREA]):
        x, y, w, h, area = [int(v) for v in stats[i]]
        if area < min_area:
            continue
        if w > 0.6 * room_w and h > 0.6 * room_h:
            continue    # the silhouette edge itself, not an object
        comp = cc == i
        comps.append((comp, x, y, w, h, area))
        if area > 0.05 * room_area:
            fams = fam_of[inks] * comp
            for f in range(4):
                sub = ((fams == f) & comp).astype(np.uint8)
                if not sub.any():
                    continue
                n2, cc2, st2, _ = cv2.connectedComponentsWithStats(sub, 8)
                for j in range(1, n2):
                    x2, y2, w2, h2, a2 = [int(v) for v in st2[j]]
                    if a2 >= min_area and a2 < 0.9 * area:
                        comps.append((cc2 == j, x2, y2, w2, h2, a2))
    comps.sort(key=lambda t: -t[5])

    objs = []
    for comp, x, y, w, h, area in comps[:max_objects]:
        cnt = np.bincount(inks[comp], minlength=len(pal)).astype(float)
        share = cnt / cnt.sum()
        top = [dict(ink=int(j), share=round(float(share[j]), 3), hex=pal[j]['hex'])
               for j in np.argsort(-share)[:4] if share[j] >= 0.03]
        bx, by = x + w / 2, y + h - 1
        on_floor = cv2.pointPolygonTest(geo['floor_poly'], (float(bx), float(by)), False) >= 0
        placement = dict(surface='floor' if on_floor else ('left_wall' if bx < F[0] else 'right_wall'))
        if tw:
            u, v = (bx - F[0]) / tw, (by - F[1]) / th
            if on_floor:
                placement.update(x=round((u + v) / 2, 2), y=round((v - u) / 2, 2), z=0)
            elif placement['surface'] == 'left_wall':
                yv = -u
                placement.update(x=0, y=round(yv, 2), z_th=round(yv - v, 2))
            else:
                placement.update(x=round(u, 2), y=0, z_th=round(u - v, 2))
            placement.update(width_tiles=round(w / tw / 2, 2), height_th=round(h / th, 2))
        objs.append(dict(
            id=len(objs) + 1, label=None,
            bbox=[x, y, x + w - 1, y + h - 1],
            bbox_norm=[round(x / W, 3), round(y / H, 3), round((x + w) / W, 3), round((y + h) / H, 3)],
            size_px=[w, h], area_px=area, fill=round(area / (w * h), 2),
            inks=top,
            warm_share=round(float(sum(share[j] for j in range(len(pal)) if pal[j]['family'] in WARM)), 3),
            placement=placement,
        ))
    # nesting: books inside a shelf, a mug on a desk — keep both, say which holds which
    for o in objs:
        x0, y0, x1, y1 = o['bbox']
        a = (x1 - x0 + 1) * (y1 - y0 + 1)
        best = None
        for p in objs:
            if p is o or p['area_px'] <= o['area_px']:
                continue
            px0, py0, px1, py1 = p['bbox']
            ix = max(0, min(x1, px1) - max(x0, px0) + 1)
            iy = max(0, min(y1, py1) - max(y0, py0) + 1)
            if ix * iy >= 0.7 * a and (best is None or p['area_px'] < best['area_px']):
                best = p
        o['inside_of'] = best['id'] if best else None
    return objs, sorted(structural)


# -- 7. annotated overlay ---------------------------------------------------

def draw_annotated(native, geo, lights, objs, path):
    H, W = native.shape[:2]
    U = max(1, 1200 // W)
    img = Image.fromarray(native).resize((W * U, H * U), Image.NEAREST)
    d = ImageDraw.Draw(img)

    def P(p):
        return (p[0] * U + U // 2, p[1] * U + U // 2)

    for poly, col in ((geo['floor_poly'], (0, 220, 255)), (geo['left_poly'], (0, 160, 255)),
                      (geo['right_poly'], (0, 160, 255))):
        d.polygon([P(p) for p in poly], outline=col)
    for k, p in geo['corners'].items():
        x, y = P(p)
        d.ellipse([x - 4, y - 4, x + 4, y + 4], fill=(0, 255, 180))
        d.text((x + 6, y - 6), k, fill=(0, 255, 180))
    for o in objs:
        x0, y0, x1, y1 = o['bbox']
        d.rectangle([x0 * U, y0 * U, (x1 + 1) * U, (y1 + 1) * U], outline=(255, 80, 200))
        d.rectangle([x0 * U, y0 * U, x0 * U + 20, y0 * U + 11], fill=(255, 80, 200))
        d.text((x0 * U + 2, y0 * U), str(o['id']), fill=(0, 0, 0))
    for l in lights:
        x, y = P(l['at'])
        r = (l['falloff_radius_px'] or 4) * U
        d.ellipse([x - r, y - r, x + r, y + r], outline=(255, 230, 0))
        d.ellipse([x - 3, y - 3, x + 3, y + 3], fill=(255, 230, 0))
        d.text((x + 6, y + 4), l['id'], fill=(255, 230, 0))
    img.save(path)


# -- main -------------------------------------------------------------------

def analyze(path, out_dir=None, k=48, merge_de=7.0, scale=None):
    path = Path(path)
    out_dir = Path(out_dir) if out_dir else path.parent
    out_dir.mkdir(parents=True, exist_ok=True)
    stem = out_dir / path.stem
    rgb = load_rgb(path)
    ps = detect_pixel_scale(rgb, scale)
    native = to_native(rgb, ps)
    pal, inks, cent = extract_palette(native, k=k, merge_de=merge_de)
    geo = room_geometry(native, inks, cent, rgb, ps)
    proj = projection(native, inks, cent, geo)
    proj['hough_angle_peaks'] = hough_angles(native)
    lights = find_lights(native, inks, pal, geo['room'])
    regions = region_stats(native, inks, pal, geo)
    objs, structural = find_objects(native, inks, pal, cent, geo, proj)

    spec = dict(
        source=str(path), source_size=[int(rgb.shape[1]), int(rgb.shape[0])],
        pixel_scale=ps, native_size=[int(native.shape[1]), int(native.shape[0])],
        palette=pal, palette_js=palette_js(pal),
        projection=proj,
        room=dict(corners=geo['corners'], bg_ink=geo['bg_ink'], structural_inks=structural,
                  world='origin F (far floor corner); +x -> RB, +y -> LB, +z up; '
                        'z_th is z in th units (multiply by th/tz for world z)'),
        lights=lights, regions=regions, objects=objs,
        notes=[
            'All px are native art pixels (source px / pixel_scale.scale).',
            'palette[].ink is the index to use; families are ordered by coverage, inks by L within a family.',
            'objects[].label is null: read the annotated PNG and fill them in.',
            'placement.width_tiles is the screen width in tile widths (2*tw), not a footprint; '
            'height_th the screen height in th units.',
        ],
    )
    Image.fromarray(native).save(f'{stem}.native.png')
    draw_swatch(pal, f'{stem}.palette.png')
    draw_annotated(native, geo, lights, objs, f'{stem}.annotated.png')
    with open(f'{stem}.spec.json', 'w', encoding='utf-8') as f:
        json.dump(spec, f, indent=1)
    return spec, stem


def summary(spec):
    ps, pr = spec['pixel_scale'], spec['projection']
    fams = {}
    for e in spec['palette']:
        fams.setdefault(e['family'], []).append(e)
    lines = [
        'source %dx%d -> native %dx%d  (pixel scale %.2f, %s)'
        % (*spec['source_size'], *spec['native_size'], ps['scale'], ps['method']),
        'palette: %d inks - %s' % (len(spec['palette']), ', '.join('%s x%d' % (f, len(v)) for f, v in fams.items())),
        'projection: %s, th/tw = %.3f (%.1f deg)' % (pr['named'], pr['ratio_th_over_tw'], pr['angle_deg']),
    ]
    if pr.get('tw'):
        lines.append('tiles: tw=%.1f th=%.1f px; room %.1f x %.1f tiles, walls %.1f th high'
                     % (pr['tw'], pr['th'], pr['room_tiles']['x'], pr['room_tiles']['y'], pr['wall_height_th']))
    else:
        lines.append('tiles: no periodic floor seams found (silhouette still measured)')
    for l in spec['lights']:
        lines.append('%s at %s  L=%.0f  %s  r=%s px  %s  (%s)'
                     % (l['id'], l['at'], l['peak_L'], l['colour'], l['falloff_radius_px'], l['falloff_style'], l['likely']))
    for r, v in spec['regions'].items():
        if 'inks' in v:
            per = ', '.join('%s=%s' % (k, p['period_px']) for k, p in v['periods'].items() if p['confident']) or 'no pattern'
            lines.append('%s: %d inks, mean L %.0f, dither %.1f%%, periods: %s'
                         % (r, v['distinct_inks_over_1pct'], v['mean_L'], v['checkerboard_dither'] * 100, per))
    lines.append('objects: %d boxes (labels null - see annotated png)' % len(spec['objects']))
    return '\n'.join(lines)


if __name__ == '__main__':
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('image')
    ap.add_argument('--out', help='output directory (default: next to the image)')
    ap.add_argument('--k', type=int, default=48, help='k-means clusters before merging (default 48)')
    ap.add_argument('--merge', type=float, default=7.0, help='merge inks closer than this Lab distance (default 7)')
    ap.add_argument('--scale', type=float, help='source px per art px; overrides detection')
    a = ap.parse_args()
    spec, stem = analyze(a.image, a.out, a.k, a.merge, a.scale)
    print(summary(spec))
    print('-> %s.spec.json / .native.png / .palette.png / .annotated.png' % stem)
