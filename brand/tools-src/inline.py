# Inline <svg> of TEXT as outlines that takes the text colour (currentColor) and is 1em tall
# (font ascent to descent), so it sits where the text was. usage: inline.py FONT "TEXT" OUT CLASS
import sys, uharfbuzz as hb
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
font_path, text, out, cls = sys.argv[1:5]
data = open(font_path, 'rb').read()
face = hb.Face(data); f = hb.Font(face)
buf = hb.Buffer(); buf.add_str(text); buf.guess_segment_properties()
hb.shape(f, buf, {"kern": True, "liga": True})
tt = TTFont(font_path); gs = tt.getGlyphSet(); order = tt.getGlyphOrder()
hh = tt['hhea']; asc, desc = hh.ascent, hh.descent
x = 0; d = []
for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
    pen = SVGPathPen(gs, ntos=lambda v: str(round(v)))
    gs[order[info.codepoint]].draw(TransformPen(pen, (1, 0, 0, -1, x + pos.x_offset, asc - pos.y_offset)))
    d.append(pen.getCommands()); x += pos.x_advance
h = asc - desc
w = x + round(h * 0.12)  # room for the italic overhang
svg = (f'<svg class="{cls}" viewBox="0 0 {w} {h}" style="width:{w/h:.3f}em" role="img" aria-label="{text}">'
       f'<path fill="currentColor" d="{"".join(d)}"/></svg>')
open(out, 'w').write(svg); print(out, len(svg), round(w/h,3))
