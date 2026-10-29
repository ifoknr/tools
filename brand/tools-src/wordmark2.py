# Two-tone tool name drawn as outlines: part one in fill1, part two in fill2.
# usage: wordmark2.py FONT PART1 PART2 OUT.svg FILL1 FILL2
import sys, uharfbuzz as hb
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen
font_path, p1, p2, out, f1, f2 = sys.argv[1:7]
text = p1 + p2
face = hb.Face(open(font_path, 'rb').read()); f = hb.Font(face)
buf = hb.Buffer(); buf.add_str(text); buf.guess_segment_properties(); hb.shape(f, buf, {"kern": True})
tt = TTFont(font_path); gs = tt.getGlyphSet(); order = tt.getGlyphOrder()
upm = tt['head'].unitsPerEm
asc, desc = tt['hhea'].ascent, tt['hhea'].descent
x = 0; parts = []; xmin = 1e9; xmax = -1e9
for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
    name = order[info.codepoint]; gx = x + pos.x_offset
    bp = BoundsPen(gs); gs[name].draw(bp)
    if bp.bounds:
        xmin = min(xmin, gx + bp.bounds[0]); xmax = max(xmax, gx + bp.bounds[2])
        pen = SVGPathPen(gs); gs[name].draw(pen)
        parts.append((gx, f1 if info.cluster < len(p1) else f2, pen.getCommands()))
    x += pos.x_advance
# Height is the font's ascent to descent, so names of different tools line up when shown at one height.
pad = 0.02 * upm
w, h = xmax - xmin + 2 * pad, asc - desc
paths = ''.join(f'<path fill="{c}" transform="translate({gx - xmin + pad:.0f} {asc:.0f}) scale(1 -1)" d="{d}"/>' for gx, c, d in parts)
open(out, 'w').write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.0f} {h:.0f}"><title>{text}</title>{paths}</svg>')
