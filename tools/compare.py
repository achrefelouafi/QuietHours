#!/usr/bin/env python3
"""
tools/compare.py — score a render against a reference, region by region.

"Doesn't match" is not actionable. This is:

    python tools/compare.py docs/preview.png docs/reference.png
    python tools/compare.py docs/preview.png docs/reference.png --spec docs/reference.spec.json --diff diff.png

Both images are brought to the reference's native pixel resolution, cropped
to the room silhouette, and the render is quantised to the reference palette.
Then, per 12x8 grid cell: luminance, warmth, edge density and ink count are
compared, and the worst cells are named in plain words. A palette table shows
which inks the render never uses. A headline score (0-100) is printed last so
an edit can be judged as better or worse in one number.

The score is a heuristic for iterating, not a truth. Read the breakdown.
"""
import argparse
import json
import sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw

sys.path.insert(0, str(Path(__file__).parent))
from analyze import (WARM, detect_pixel_scale, extract_palette, load_rgb, nearest,  # noqa: E402
                     room_geometry, to_lab, to_native)


def room_crop(native, inks, cent, source=None, ps=None):
    geo = room_geometry(native, inks, cent, source, ps)
    ys, xs = np.nonzero(geo['room'])
    box = (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)
    return box, geo['room']


def crop(a, box):
    x0, y0, x1, y1 = box
    return a[y0:y1, x0:x1]


def cell_name(r, c, rows, cols):
    v = ['top', 'upper', 'lower', 'bottom'][min(3, r * 4 // rows)]
    h = ['left', 'centre-left', 'centre-right', 'right'][min(3, c * 4 // cols)]
    return '%s %s (r%d c%d)' % (v, h, r, c)


def grid_maps(L, inks, room, warm_inks, rows, cols, n_inks):
    H, W = L.shape
    edges = cv2.Canny(np.clip(L * 2.55, 0, 255).astype(np.uint8), 40, 120) > 0
    lum = np.full((rows, cols), np.nan)
    warm = np.full((rows, cols), np.nan)
    edge = np.full((rows, cols), np.nan)
    ncol = np.full((rows, cols), np.nan)
    for r in range(rows):
        for c in range(cols):
            y0, y1 = H * r // rows, H * (r + 1) // rows
            x0, x1 = W * c // cols, W * (c + 1) // cols
            m = room[y0:y1, x0:x1]
            if m.mean() < 0.5:
                continue
            lum[r, c] = L[y0:y1, x0:x1][m].mean()
            ik = inks[y0:y1, x0:x1][m]
            warm[r, c] = np.isin(ik, warm_inks).mean()
            edge[r, c] = edges[y0:y1, x0:x1][m].mean()
            share = np.bincount(ik, minlength=n_inks) / len(ik)
            ncol[r, c] = (share >= 0.02).sum()
    return dict(lum=lum, warm=warm, edge=edge, inks=ncol)


def ssim(a, b, sigma=1.5):
    a = a.astype(np.float64)
    b = b.astype(np.float64)
    C1, C2 = (0.01 * 100) ** 2, (0.03 * 100) ** 2
    mu_a = cv2.GaussianBlur(a, (0, 0), sigma)
    mu_b = cv2.GaussianBlur(b, (0, 0), sigma)
    saa = cv2.GaussianBlur(a * a, (0, 0), sigma) - mu_a ** 2
    sbb = cv2.GaussianBlur(b * b, (0, 0), sigma) - mu_b ** 2
    sab = cv2.GaussianBlur(a * b, (0, 0), sigma) - mu_a * mu_b
    s = ((2 * mu_a * mu_b + C1) * (2 * sab + C2)) / ((mu_a ** 2 + mu_b ** 2 + C1) * (saa + sbb + C2))
    return float(s.mean())


def worst(diff, rows, cols, k, unit, fmt='%+.0f'):
    out = []
    flat = [(abs(diff[r, c]), r, c) for r in range(rows) for c in range(cols) if not np.isnan(diff[r, c])]
    for _, r, c in sorted(flat, reverse=True)[:k]:
        out.append(dict(cell=[r, c], where=cell_name(r, c, rows, cols), delta=round(float(diff[r, c]), 3),
                        text='%s: render %s %s' % (cell_name(r, c, rows, cols), fmt % diff[r, c], unit)))
    return out


def compare(render_path, ref_path, spec_path=None, rows=8, cols=12, diff_png=None):
    ref_rgb = load_rgb(ref_path)
    ren_rgb = load_rgb(render_path)
    ref_ps = detect_pixel_scale(ref_rgb)
    ren_ps = detect_pixel_scale(ren_rgb)
    ref = to_native(ref_rgb, ref_ps)
    ren = to_native(ren_rgb, ren_ps)

    if spec_path:
        spec = json.load(open(spec_path, encoding='utf-8'))
        pal = spec['palette']
        cent = np.array([to_lab(np.array(e['rgb']).reshape(1, 1, 3))[0, 0] for e in pal], np.float32)
        ref_inks = nearest(to_lab(ref).reshape(-1, 3), cent).reshape(ref.shape[:2])
    else:
        pal, ref_inks, cent = extract_palette(ref)
    n_inks = len(pal)
    warm_inks = [e['ink'] for e in pal if e['family'] in WARM]

    ref_box, ref_room = room_crop(ref, ref_inks, cent, ref_rgb, ref_ps)
    ren_lab_full = to_lab(ren)
    ren_inks_full = nearest(ren_lab_full.reshape(-1, 3), cent).reshape(ren.shape[:2])
    ren_box, ren_room = room_crop(ren, ren_inks_full, cent, ren_rgb, ren_ps)

    # bring the render's room onto the reference's room, pixel for pixel
    ref_c = crop(ref, ref_box)
    room_c = crop(ref_room, ref_box)
    H, W = ref_c.shape[:2]
    ren_c = cv2.resize(crop(ren, ren_box), (W, H), interpolation=cv2.INTER_AREA)
    ren_room_c = cv2.resize(crop(ren_room, ren_box).astype(np.uint8), (W, H), interpolation=cv2.INTER_NEAREST) > 0
    both = room_c & ren_room_c

    ref_lab, ren_lab = to_lab(ref_c), to_lab(ren_c)
    ref_i = nearest(ref_lab.reshape(-1, 3), cent).reshape(H, W)
    ren_i = nearest(ren_lab.reshape(-1, 3), cent).reshape(H, W)
    d_ren = np.sqrt(((ren_lab.reshape(-1, 3) - cent[ren_i.ravel()]) ** 2).sum(1)).reshape(H, W)

    # palette coverage inside the room
    ref_share = np.bincount(ref_i[room_c], minlength=n_inks) / room_c.sum()
    ren_share = np.bincount(ren_i[ren_room_c], minlength=n_inks) / max(1, ren_room_c.sum())
    palette_rows = []
    for e in pal:
        i = e['ink']
        flag = ''
        if ref_share[i] >= 0.003 and ren_share[i] < 0.0005:
            flag = 'UNUSED'
        elif ref_share[i] >= 0.003 and ren_share[i] < 0.35 * ref_share[i]:
            flag = 'under'
        elif ren_share[i] >= 0.01 and ren_share[i] > 3 * ref_share[i]:
            flag = 'OVER'
        palette_rows.append(dict(ink=i, hex=e['hex'], family=e['family'], ref=round(float(ref_share[i]), 4),
                                 render=round(float(ren_share[i]), 4), flag=flag))
    palette_l1 = float(np.abs(ref_share - ren_share).sum())
    off_palette = dict(mean_de=round(float(d_ren[ren_room_c].mean()), 2),
                       share_over_10=round(float((d_ren[ren_room_c] > 10).mean()), 3))

    # region maps
    gr = grid_maps(ref_lab[..., 0], ref_i, room_c, warm_inks, rows, cols, n_inks)
    gn = grid_maps(ren_lab[..., 0], ren_i, ren_room_c, warm_inks, rows, cols, n_inks)
    d = {k: gn[k] - gr[k] for k in gr}
    valid = ~np.isnan(d['lum'])
    mean_abs = {k: float(np.nanmean(np.abs(v))) for k, v in d.items()}

    ssim_l = ssim(ref_lab[..., 0] * both, ren_lab[..., 0] * both)

    scores = dict(
        palette=round(100 * max(0.0, 1 - palette_l1 / 2), 1),
        luminance=round(100 * max(0.0, 1 - mean_abs['lum'] / 25), 1),
        warmth=round(100 * max(0.0, 1 - mean_abs['warm'] / 0.5), 1),
        edges=round(100 * max(0.0, 1 - mean_abs['edge'] / 0.15), 1),
        structure=round(100 * max(0.0, ssim_l), 1),
    )
    weights = dict(palette=0.25, luminance=0.25, warmth=0.15, edges=0.15, structure=0.2)
    overall = round(sum(scores[k] * w for k, w in weights.items()), 1)

    report = dict(
        render=str(render_path), reference=str(ref_path),
        reference_native=[int(ref.shape[1]), int(ref.shape[0])], render_native=[int(ren.shape[1]), int(ren.shape[0])],
        reference_pixel_scale=ref_ps['scale'], render_pixel_scale=ren_ps['scale'],
        room_px=dict(reference=[int(W), int(H)],
                     render=[int(ren_box[2] - ren_box[0]), int(ren_box[3] - ren_box[1])]),
        overall=overall, scores=scores,
        palette=dict(coverage_l1=round(palette_l1, 3), off_palette=off_palette, rows=palette_rows,
                     unused=[r['ink'] for r in palette_rows if r['flag'] == 'UNUSED'],
                     under=[r['ink'] for r in palette_rows if r['flag'] == 'under'],
                     over=[r['ink'] for r in palette_rows if r['flag'] == 'OVER']),
        global_stats=dict(
            mean_L=dict(reference=round(float(ref_lab[..., 0][room_c].mean()), 1), render=round(float(ren_lab[..., 0][ren_room_c].mean()), 1)),
            warm_share=dict(reference=round(float(np.isin(ref_i[room_c], warm_inks).mean()), 3), render=round(float(np.isin(ren_i[ren_room_c], warm_inks).mean()), 3)),
            edge_density=dict(reference=round(float(np.nanmean(gr['edge'])), 3), render=round(float(np.nanmean(gn['edge'])), 3)),
            inks_per_cell=dict(reference=round(float(np.nanmean(gr['inks'])), 1), render=round(float(np.nanmean(gn['inks'])), 1)),
        ),
        regions=dict(
            luminance=worst(d['lum'], rows, cols, 6, 'L (brighter if +)'),
            warmth=worst(d['warm'], rows, cols, 4, 'warm share', '%+.2f'),
            edges=worst(d['edge'], rows, cols, 4, 'edge density', '%+.3f'),
            inks=worst(d['inks'], rows, cols, 4, 'inks in cell', '%+.0f'),
        ),
        grid=dict(rows=rows, cols=cols, cells_compared=int(valid.sum())),
    )
    if diff_png:
        draw_diff(ref_c, ren_c, ref_lab[..., 0], ren_lab[..., 0], both, d['lum'], rows, cols, diff_png)
    return report


def draw_diff(ref_c, ren_c, Lr, Ln, both, dlum, rows, cols, path):
    H, W = ref_c.shape[:2]
    U = max(1, 420 // W)
    dl = np.where(both, Ln - Lr, 0)
    heat = np.zeros((H, W, 3), np.uint8)
    pos = np.clip(dl / 30, 0, 1)
    neg = np.clip(-dl / 30, 0, 1)
    heat[..., 0] = (pos * 255).astype(np.uint8)
    heat[..., 2] = (neg * 255).astype(np.uint8)
    heat[..., 1] = (np.minimum(pos, neg) * 0).astype(np.uint8)
    heat[~both] = 30
    panels = [Image.fromarray(a).resize((W * U, H * U), Image.NEAREST) for a in (ref_c, ren_c, heat)]
    img = Image.new('RGB', (W * U * 3 + 8, H * U + 14), (12, 12, 14))
    d = ImageDraw.Draw(img)
    for i, (p, t) in enumerate(zip(panels, ('reference', 'render', 'render - reference L (red +, blue -)'))):
        img.paste(p, (i * (W * U + 4), 14))
        d.text((i * (W * U + 4) + 2, 1), t, fill=(200, 200, 200))
    ox = 2 * (W * U + 4)
    for r in range(rows):
        for c in range(cols):
            x0, y0 = ox + W * U * c // cols, 14 + H * U * r // rows
            x1, y1 = ox + W * U * (c + 1) // cols, 14 + H * U * (r + 1) // rows
            d.rectangle([x0, y0, x1, y1], outline=(60, 60, 60))
            if not np.isnan(dlum[r, c]):
                d.text((x0 + 2, y0 + 1), '%+.0f' % dlum[r, c], fill=(230, 230, 230))
    img.save(path)


def summary(rep):
    s = rep['scores']
    g = rep['global_stats']
    lines = [
        'overall %.0f/100   palette %.0f  luminance %.0f  warmth %.0f  edges %.0f  structure %.0f'
        % (rep['overall'], s['palette'], s['luminance'], s['warmth'], s['edges'], s['structure']),
        'native: reference %dx%d (scale %.2f), render %dx%d (scale %.2f); room %s vs %s px'
        % (*rep['reference_native'], rep['reference_pixel_scale'], *rep['render_native'], rep['render_pixel_scale'],
           rep['room_px']['reference'], rep['room_px']['render']),
        'global: mean L %.0f vs %.0f   warm %.1f%% vs %.1f%%   edges %.3f vs %.3f   inks/cell %.1f vs %.1f   (reference vs render)'
        % (g['mean_L']['reference'], g['mean_L']['render'], g['warm_share']['reference'] * 100, g['warm_share']['render'] * 100,
           g['edge_density']['reference'], g['edge_density']['render'], g['inks_per_cell']['reference'], g['inks_per_cell']['render']),
        'off-palette: render pixels are on average %.1f Lab from the nearest reference ink (%.0f%% further than 10)'
        % (rep['palette']['off_palette']['mean_de'], rep['palette']['off_palette']['share_over_10'] * 100),
        '',
        'palette  ink  hex      family   ref%  render%',
    ]
    for r in rep['palette']['rows']:
        if r['ref'] >= 0.002 or r['render'] >= 0.002:
            lines.append('        %3d  %s  %-8s %5.1f  %5.1f  %s' % (r['ink'], r['hex'], r['family'], r['ref'] * 100, r['render'] * 100, r['flag']))
    for k, title in (('luminance', 'luminance'), ('warmth', 'warmth'), ('edges', 'edge density'), ('inks', 'ink count')):
        lines.append('')
        lines.append('worst %s cells:' % title)
        lines += ['  ' + w['text'] for w in rep['regions'][k]]
    return '\n'.join(lines)


if __name__ == '__main__':
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('render')
    ap.add_argument('reference')
    ap.add_argument('--spec', help='reference .spec.json from analyze.py (reuses its palette)')
    ap.add_argument('--out', help='write the full report as JSON here')
    ap.add_argument('--diff', help='write a side-by-side + luminance heatmap PNG here')
    ap.add_argument('--grid', default='12x8', help='cols x rows (default 12x8)')
    a = ap.parse_args()
    cols, rows = [int(v) for v in a.grid.lower().split('x')]
    rep = compare(a.render, a.reference, a.spec, rows, cols, a.diff)
    print(summary(rep))
    if a.out:
        with open(a.out, 'w', encoding='utf-8') as f:
            json.dump(rep, f, indent=1)
        print('-> %s' % a.out)
