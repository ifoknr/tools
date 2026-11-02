# Turns an icon into the calm grey-blue family (the same rule as the approved samples):
# dark fills -> graphite, every other colour -> grey-blue, keeping each pixel's lightness order.
import re, sys, colorsys
import numpy as np
from PIL import Image

def map_rgb(r, g, b):
    h, l, s = colorsys.rgb_to_hls(r, g, b)
    if l < 0.2:
        return colorsys.hls_to_rgb(0.69, 0.17 + l * 0.55, 0.04)
    return colorsys.hls_to_rgb(0.62, min(0.55 + l * 0.35, 0.93), 0.28)

def _hex(m):
    t = m.group(2); pre = m.group(1)
    if len(t) == 3: t = ''.join(c * 2 for c in t)
    r, g, b = (int(t[i:i + 2], 16) / 255 for i in (0, 2, 4))
    out = ''.join('%02x' % max(0, min(255, round(x * 255))) for x in map_rgb(r, g, b))
    return pre + out

HEX = re.compile(r'(#|%23)([0-9a-fA-F]{6}|[0-9a-fA-F]{3})(?![0-9a-fA-F])')

def svg_text(s):
    return HEX.sub(_hex, s)

def raster(path):
    im = Image.open(path); mode = im.mode
    rgba = np.asarray(im.convert('RGBA')).astype(np.float64) / 255
    rgb = rgba[..., :3]
    mx = rgb.max(-1); mn = rgb.min(-1); l = (mx + mn) / 2
    dark = l < 0.2
    def hls2rgb(h, L, s):
        q = np.where(L < .5, L * (1 + s), L + s - L * s); p = 2 * L - q
        def ch(t):
            t = t % 1
            return np.where(t < 1/6, p + (q - p) * 6 * t, np.where(t < .5, q, np.where(t < 2/3, p + (q - p) * (2/3 - t) * 6, p)))
        return np.stack([ch(h + 1/3), ch(h), ch(h - 1/3)], -1)
    a = hls2rgb(np.full_like(l, .69), .17 + l * .55, np.full_like(l, .04))
    b = hls2rgb(np.full_like(l, .62), np.minimum(.55 + l * .35, .93), np.full_like(l, .28))
    out = np.where(dark[..., None], a, b)
    res = np.concatenate([out, rgba[..., 3:]], -1)
    img = Image.fromarray((res * 255 + .5).clip(0, 255).astype(np.uint8), 'RGBA')
    if mode != 'RGBA':
        img = img.convert(mode if mode in ('RGB', 'P', 'L') else 'RGB')
    if path.lower().endswith(('.jpg', '.jpeg')):
        img.convert('RGB').save(path, quality=92)
    else:
        img.save(path)

if __name__ == '__main__':
    for p in sys.argv[1:]:
        if p.lower().endswith(('.svg', '.html', '.xml')):
            s = open(p, encoding='utf-8').read(); open(p, 'w', encoding='utf-8').write(svg_text(s))
        else:
            raster(p)
        print('grey:', p)
