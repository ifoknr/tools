# NEXTCORE launcher layers from the gauge design: background, foreground (inside the 66/108 safe zone), white glyph.
import math
exec(open('gen.py').read().split("I = {}")[0])
C1, C2 = '#FDBA74', '#F43F5E'
def gauge(col_arc, col_tick, col_bolt, track=True, glow=True):
    ticks = ''.join(f'<line x1="{256+150*math.cos(math.radians(a)):.0f}" y1="{290+150*math.sin(math.radians(a)):.0f}" x2="{256+(128 if i%3==0 else 138)*math.cos(math.radians(a)):.0f}" y2="{290+(128 if i%3==0 else 138)*math.sin(math.radians(a)):.0f}" stroke="{col_tick}" stroke-width="{6 if i%3==0 else 3}" stroke-linecap="round" opacity=".8"/>' for i, a in enumerate(range(150, 391, 20))) if col_tick else ''
    arc = 'M126 365 A170 170 0 1 1 386 365'
    return ((f'<path d="{arc}" fill="none" stroke="#3a1c20" stroke-width="30" stroke-linecap="round"/>' if track else '') +
            (f'<path d="{arc}" fill="none" stroke="{col_arc}" stroke-width="30" stroke-linecap="round" filter="url(#g)" opacity=".6"/>' if glow else '') +
            f'<path d="{arc}" fill="none" stroke="{col_arc}" stroke-width="30" stroke-linecap="round"/>' + ticks +
            (bolt(.5, 0, 34, fill=C2, opacity='.6', filter='url(#g)') if glow else '') + bolt(.5, 0, 34, fill=col_bolt))
defs = lg('bg', [(0, '#2b1416'), (1, '#0b0607')]) + lg('arc', [(0, C1), (1, C2)], y2=0) + lg('bo', [(0, '#fff'), (1, C1)], x2=0) + blur('g', 12)
sv = lambda d, b: f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><defs>{d}</defs>{b}</svg>'
# centre the gauge (its middle is a bit low) then shrink into the safe zone
inner = lambda s, b: f'<g transform="translate(256 256) scale({s}) translate(-256 -262)">{b}</g>'
open('nc-full.svg', 'w').write(sv(defs, '<rect width="512" height="512" fill="url(#bg)"/>' + gauge('url(#arc)', '#ffe8e0', 'url(#bo)')))
open('nc-bg.svg', 'w').write(sv(defs, '<rect width="512" height="512" fill="url(#bg)"/>'))
open('nc-fg.svg', 'w').write(sv(defs, inner(.6, gauge('url(#arc)', '#ffe8e0', 'url(#bo)'))))
open('nc-mono.svg', 'w').write(sv(defs, inner(.6, gauge('#fff', None, '#fff', track=False, glow=False))))
open('nc-white.svg', 'w').write(sv(defs, inner(.95, gauge('#fff', None, '#fff', track=False, glow=False))))
