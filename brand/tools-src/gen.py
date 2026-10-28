# Many icon ideas in the app's teal-green family, one SVG each.
import math, os, random
T, MINT, EM, DEEP, GREEN, LIME, BG = '#3DD6C4', '#8CF7E6', '#10B981', '#0B3D36', '#5BD97A', '#A3E635', '#0E1116'
BOLT = "M310 64 L150 292 L246 292 L200 448 L364 214 L268 214 Z"
def bolt(s=1, dx=0, dy=0, **a):
    attrs = ' '.join(f'{k.replace("_","-")}="{v}"' for k, v in a.items())
    return f'<path d="{BOLT}" transform="translate({256+dx} {256+dy}) scale({s}) translate(-257 -256)" {attrs}/>'
def blur(i, s): return f'<filter id="{i}" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="{s}"/></filter>'
def lg(i, stops, x2=1, y2=1, x1=0, y1=0):
    return f'<linearGradient id="{i}" x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}">' + ''.join(f'<stop offset="{o}" stop-color="{c}"{"" if op is None else f" stop-opacity=\"{op}\""}/>' for o, c, op in [(s + (None,))[:3] for s in stops]) + '</linearGradient>'
def rg(i, stops, cx=.5, cy=.5, r=.7):
    return f'<radialGradient id="{i}" cx="{cx}" cy="{cy}" r="{r}">' + ''.join(f'<stop offset="{o}" stop-color="{c}"{"" if op is None else f" stop-opacity=\"{op}\""}/>' for o, c, op in [(s + (None,))[:3] for s in stops]) + '</radialGradient>'
def stars(n=8, seed=1, col='#fff'):
    r = random.Random(seed); return ''.join(f'<circle cx="{r.randint(30,482)}" cy="{r.randint(30,482)}" r="{r.uniform(1,2.4):.1f}" fill="{col}" opacity="{r.uniform(.4,.9):.2f}"/>' for _ in range(n))
def icon(defs, body, rim='#fff', rimop=.10):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><defs><clipPath id="c"><rect width="512" height="512" rx="116"/></clipPath>{defs}</defs>'
            f'<g clip-path="url(#c)">{body}</g><rect x="2" y="2" width="508" height="508" rx="114" fill="none" stroke="{rim}" stroke-opacity="{rimop}" stroke-width="3"/></svg>')
I = {}

# 1 crystal prism, green spectrum
cols = ['#e7fff9', '#8CF7E6', '#3DD6C4', '#10B981', '#5BD97A', '#A3E635']
spec = ''.join(f'<path d="M{326+i} {258+3*i} L540 {178+46*i} L540 {224+46*i} Z" fill="{c}"/>' for i, c in enumerate(cols))
I['crystal'] = icon(rg('bg', [(0, '#10221f'), (1, '#04080a')], cy=.45) + lg('a', [(0, '#ffffff'), (1, '#b8fff3')]) + lg('b', [(0, '#3DD6C4'), (1, '#0b6b60')]) + lg('cc', [(0, '#5BD97A'), (1, '#0f6b3a')]) + lg('d', [(0, '#d9fff7'), (1, '#3DD6C4')]) + lg('beam', [(0, '#fff', 0), (1, '#fff')], y2=0) + blur('g', 12) + blur('g2', 4),
    '<rect width="512" height="512" fill="url(#bg)"/>' + stars(7, 3) +
    '<path d="M-10 300 L206 204 L212 218 L-10 318 Z" fill="url(#beam)"/><path d="M-10 300 L206 204 L212 218 L-10 318 Z" fill="#fff" opacity=".6" filter="url(#g2)"/>' +
    f'<g opacity=".95">{spec}</g><g filter="url(#g2)" opacity=".5">{spec}</g>' +
    f'<path d="{BOLT}" fill="{T}" opacity=".55" filter="url(#g)"/>'
    '<path d="M310 64 L150 292 L268 214 Z" fill="url(#a)"/><path d="M150 292 L246 292 L268 214 Z" fill="url(#b)"/><path d="M268 214 L246 292 L364 214 Z" fill="url(#cc)"/><path d="M246 292 L200 448 L364 214 Z" fill="url(#d)"/>'
    f'<path d="{BOLT}" fill="none" stroke="#fff" stroke-opacity=".85" stroke-width="4" stroke-linejoin="round"/>'
    '<path d="M150 292 L268 214 L246 292 L364 214" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="2"/>')

# 2 aurora glass phone
I['aurora'] = icon(blur('bl', 46) + blur('g', 14) + lg('glass', [(0, '#fff', .34), (.5, '#fff', .08), (1, '#fff', .16)]) + lg('edge', [(0, '#fff', .95), (.5, '#fff', .25), (1, '#fff', .7)]) + lg('bo', [(0, '#ffffff'), (1, MINT)], x2=.6),
    '<rect width="512" height="512" fill="#03110f"/><g filter="url(#bl)"><ellipse cx="110" cy="110" rx="190" ry="120" fill="#3DD6C4"/><ellipse cx="440" cy="190" rx="140" ry="170" fill="#06b6d4" opacity=".7"/><ellipse cx="370" cy="440" rx="200" ry="120" fill="#10B981"/><ellipse cx="80" cy="430" rx="130" ry="100" fill="#14f1b0" opacity=".6"/><ellipse cx="256" cy="270" rx="120" ry="120" fill="#03110f" opacity=".6"/></g>' + stars(4, 5) +
    '<g transform="rotate(-10 256 262)"><rect x="150" y="80" width="212" height="364" rx="52" fill="url(#glass)"/><rect x="150" y="80" width="212" height="364" rx="52" fill="none" stroke="url(#edge)" stroke-width="7"/><rect x="226" y="104" width="60" height="11" rx="5.5" fill="#fff" opacity=".6"/></g>' +
    bolt(.62, 2, 8, fill='#d8fffa', opacity='.8', filter='url(#g)') + bolt(.62, 2, 8, fill='url(#bo)', stroke='#fff', stroke_width=7, stroke_linejoin='round'))

# 3 synthwave in green
grid = ''.join(f'<line x1="0" y1="{y}" x2="512" y2="{y}"/>' for y in (338, 364, 400, 450)) + ''.join(f'<line x1="{256+k*30}" y1="318" x2="{256+k*106}" y2="512"/>' for k in range(-3, 4))
I['synthwave'] = icon(lg('sky', [(0, '#001a17'), (.62, '#073b33'), (.62, '#020c0b'), (1, '#000605')], x2=0) + lg('sun', [(0, '#eaffb0'), (.5, '#5BD97A'), (1, '#0fb5a0')], x2=0) + lg('bo', [(0, '#fff'), (1, '#c7fff6')], x2=0) + blur('g', 10) + blur('g3', 28) + '<clipPath id="sc"><circle cx="256" cy="250" r="150"/></clipPath>',
    '<rect width="512" height="512" fill="url(#sky)"/><circle cx="256" cy="250" r="170" fill="#3DD6C4" opacity=".4" filter="url(#g3)"/>'
    '<g clip-path="url(#sc)"><rect x="100" y="100" width="312" height="220" fill="url(#sun)"/><g fill="#073b33"><rect x="100" y="219" width="312" height="5"/><rect x="100" y="246" width="312" height="7"/><rect x="100" y="268" width="312" height="10"/><rect x="100" y="292" width="312" height="13"/></g></g>'
    f'<g stroke="#3DD6C4" stroke-width="3" opacity=".9"><line x1="0" y1="318" x2="512" y2="318" stroke-width="4" stroke="#8CF7E6"/>{grid}</g>' +
    bolt(1.02, 0, 0, fill='#3DD6C4', opacity='.9', filter='url(#g)') + bolt(1.02, 0, 0, fill='url(#bo)', stroke='#f0fffc', stroke_width=5, stroke_linejoin='round'))

# 4 black hole, emerald disk
I['blackhole'] = icon(rg('bg', [(0, '#06201b'), (.6, '#030a09'), (1, '#010303')]) + lg('disk', [(0, '#10B981', 0), (.2, '#10B981'), (.5, '#eafff9'), (.8, '#3DD6C4'), (1, '#10B981', 0)], y2=0) + lg('halo', [(0, '#c9fff4'), (1, '#10B981')], x2=0) + lg('bo', [(0, '#fff'), (1, MINT)], x2=.5) + blur('b6', 6) + blur('b18', 18),
    '<rect width="512" height="512" fill="url(#bg)"/>' + stars(7, 9) +
    '<circle cx="256" cy="262" r="128" fill="none" stroke="url(#halo)" stroke-width="22" opacity=".55" filter="url(#b18)"/><circle cx="256" cy="262" r="118" fill="none" stroke="url(#halo)" stroke-width="7"/>'
    '<ellipse cx="256" cy="268" rx="236" ry="52" fill="none" stroke="url(#disk)" stroke-width="26" opacity=".6" filter="url(#b6)"/><ellipse cx="256" cy="268" rx="236" ry="52" fill="none" stroke="url(#disk)" stroke-width="12"/>'
    '<circle cx="256" cy="262" r="112" fill="#000"/>' + bolt(.56, 4, 6, fill=T, opacity='.8', filter='url(#b18)') + bolt(.56, 4, 6, fill='url(#bo)', stroke='#f0fffc', stroke_width=6, stroke_linejoin='round') +
    '<path d="M20 268 A236 52 0 0 0 492 268" fill="none" stroke="#10B981" stroke-width="40" opacity=".5" filter="url(#b18)"/><path d="M20 268 A236 52 0 0 0 492 268" fill="none" stroke="url(#disk)" stroke-width="18" stroke-linecap="round"/><path d="M20 268 A236 52 0 0 0 492 268" fill="none" stroke="#f0fffc" stroke-width="3" opacity=".8"/>')

# 5 neon line phone
I['neon'] = icon(blur('g', 9) + blur('g2', 22),
    '<rect width="512" height="512" fill="#05090a"/>'
    f'<g fill="none" stroke="{T}" stroke-width="16" stroke-linejoin="round" filter="url(#g2)" opacity=".8"><rect x="146" y="76" width="220" height="360" rx="50"/></g>'
    f'<g fill="none" stroke="{T}" stroke-width="14" stroke-linejoin="round" filter="url(#g)"><rect x="146" y="76" width="220" height="360" rx="50"/></g>'
    '<rect x="146" y="76" width="220" height="360" rx="50" fill="none" stroke="#dffffa" stroke-width="6"/>'
    '<line x1="228" y1="106" x2="284" y2="106" stroke="#dffffa" stroke-width="8" stroke-linecap="round"/>' +
    bolt(.6, 0, 8, fill='none', stroke=LIME, stroke_width=22, stroke_linejoin='round', filter='url(#g)') + bolt(.6, 0, 8, fill='none', stroke='#f4ffd6', stroke_width=7, stroke_linejoin='round'))

# 6 circuit board
traces = ''
for (x1, y1, x2, y2, x3, y3) in [(150, 292, 90, 292, 60, 262), (200, 448, 200, 490, 0, 0), (364, 214, 430, 214, 460, 184), (310, 64, 310, 20, 0, 0), (246, 292, 246, 360, 196, 410), (268, 214, 268, 150, 330, 110)]:
    pts = f'{x1},{y1} {x2},{y2}' + (f' {x3},{y3}' if x3 else '')
    end = (x3, y3) if x3 else (x2, y2)
    traces += f'<polyline points="{pts}" fill="none" stroke="{T}" stroke-width="7" stroke-linejoin="round" opacity=".85"/><circle cx="{end[0]}" cy="{end[1]}" r="11" fill="#04100e" stroke="{T}" stroke-width="6"/>'
extra = ''.join(f'<polyline points="{a}" fill="none" stroke="#1e5c53" stroke-width="5"/>' for a in ['40,120 120,120 150,90 220,90', '470,330 400,330 370,360 370,430', '60,380 120,380 150,410 150,480', '440,60 440,120 400,150'])
I['circuit'] = icon(rg('bg', [(0, '#0d2a25'), (1, '#030a09')]) + blur('g', 12) + lg('bo', [(0, '#eafffb'), (1, T)], x2=.4),
    '<rect width="512" height="512" fill="url(#bg)"/>' + extra + traces + bolt(.82, 0, 0, fill=T, opacity='.6', filter='url(#g)') + bolt(.82, 0, 0, fill='url(#bo)', stroke='#04100e', stroke_width=8, stroke_linejoin='round'))

# 7 hex shield
hexp = ' '.join(f'{256+190*math.cos(math.radians(a-90)):.0f},{256+190*math.sin(math.radians(a-90)):.0f}' for a in range(0, 360, 60))
hexi = ' '.join(f'{256+160*math.cos(math.radians(a-90)):.0f},{256+160*math.sin(math.radians(a-90)):.0f}' for a in range(0, 360, 60))
I['hexagon'] = icon(lg('bg', [(0, '#123a35'), (1, '#071311')]) + lg('hx', [(0, MINT), (1, EM)]) + blur('g', 16),
    f'<rect width="512" height="512" fill="url(#bg)"/><polygon points="{hexp}" fill="{T}" opacity=".35" filter="url(#g)"/><polygon points="{hexp}" fill="url(#hx)"/><polygon points="{hexi}" fill="#071311"/>' +
    bolt(.62, 0, 0, fill=MINT, opacity='.7', filter='url(#g)') + bolt(.62, 0, 0, fill='#effffc'))

# 8 terminal
I['terminal'] = icon(lg('bg', [(0, '#16201f'), (1, '#090d0e')]) + blur('g', 10),
    '<rect width="512" height="512" fill="url(#bg)"/><rect x="60" y="96" width="392" height="320" rx="34" fill="#0b1112" stroke="#2a3a3a" stroke-width="4"/>'
    '<path d="M60 130 a34 34 0 0 1 34 -34 H418 a34 34 0 0 1 34 34 V146 H60 Z" fill="#1b2627"/>'
    '<circle cx="100" cy="121" r="9" fill="#F2615C"/><circle cx="130" cy="121" r="9" fill="#F0B341"/><circle cx="160" cy="121" r="9" fill="#5BD97A"/>'
    f'<path d="M110 220 L170 262 L110 304" fill="none" stroke="{T}" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>'
    f'<rect x="196" y="300" width="70" height="20" rx="6" fill="{T}"/>' +
    bolt(.52, 100, 14, fill=T, opacity='.6', filter='url(#g)') + bolt(.52, 100, 14, fill='#eafffb'))

# 9 matrix rain
r = random.Random(7); rain = ''
for col in range(14):
    x = 20 + col * 36; y0 = r.randint(-200, 100)
    for k in range(r.randint(6, 12)):
        y = y0 + k * 34; op = (k + 1) / 12
        rain += f'<rect x="{x}" y="{y}" width="14" height="22" rx="3" fill="{GREEN if k%3 else T}" opacity="{op*.7:.2f}"/>'
I['matrix'] = icon(blur('g', 14),
    f'<rect width="512" height="512" fill="#020806"/>{rain}<rect width="512" height="512" fill="#020806" opacity=".35"/>' +
    bolt(.9, 0, 0, fill='#000', stroke='#000', stroke_width=40, stroke_linejoin='round') + bolt(.9, 0, 0, fill=GREEN, filter='url(#g)') + bolt(.9, 0, 0, fill='#effff2'))

# 10 gauge
ticks = ''.join(f'<line x1="{256+150*math.cos(math.radians(a)):.0f}" y1="{290+150*math.sin(math.radians(a)):.0f}" x2="{256+(128 if i%3==0 else 138)*math.cos(math.radians(a)):.0f}" y2="{290+(128 if i%3==0 else 138)*math.sin(math.radians(a)):.0f}" stroke="#cfe" stroke-width="{6 if i%3==0 else 3}" stroke-linecap="round" opacity=".8"/>' for i, a in enumerate(range(150, 391, 20)))
I['gauge'] = icon(lg('bg', [(0, '#132b28'), (1, '#060c0c')]) + lg('arc', [(0, EM), (.6, T), (1, LIME)], y2=0) + blur('g', 12),
    '<rect width="512" height="512" fill="url(#bg)"/>'
    '<path d="M126 365 A170 170 0 1 1 386 365" fill="none" stroke="#18302d" stroke-width="30" stroke-linecap="round"/>'
    '<path d="M126 365 A170 170 0 1 1 386 365" fill="none" stroke="url(#arc)" stroke-width="30" stroke-linecap="round" filter="url(#g)" opacity=".6"/>'
    '<path d="M126 365 A170 170 0 1 1 386 365" fill="none" stroke="url(#arc)" stroke-width="30" stroke-linecap="round"/>' + ticks +
    bolt(.5, 0, 34, fill='#effffc') + '<text x="256" y="455" text-anchor="middle" font-family="Arial" font-weight="700" font-size="40" fill="#8CF7E6" opacity="0">x</text>')

# 11 flat minimal
I['minimal'] = icon(lg('bg', [(0, '#4ee6d2'), (1, '#0f9e8a')]) + blur('sh', 10),
    '<rect width="512" height="512" fill="url(#bg)"/><circle cx="120" cy="90" r="220" fill="#fff" opacity=".08"/>' +
    bolt(.95, 6, 10, fill='#063a33', opacity='.35', filter='url(#sh)') + bolt(.95, 0, 0, fill='#ffffff'))

# 12 emerald gem bolt
I['emerald'] = icon(rg('bg', [(0, '#0f2a24'), (1, '#030807')], cy=.4) + lg('a', [(0, '#eafff6'), (1, '#6ef0c0')]) + lg('b', [(0, '#10B981'), (1, '#04593d')]) + lg('cc', [(0, '#34d399'), (1, '#065f46')]) + lg('d', [(0, '#a7f3d0'), (1, '#059669')]) + blur('g', 20),
    '<rect width="512" height="512" fill="url(#bg)"/>' + stars(6, 12, '#bfffe8') + f'<path d="{BOLT}" fill="#10B981" opacity=".6" filter="url(#g)"/>'
    '<path d="M310 64 L150 292 L268 214 Z" fill="url(#a)"/><path d="M150 292 L246 292 L268 214 Z" fill="url(#b)"/><path d="M268 214 L246 292 L364 214 Z" fill="url(#cc)"/><path d="M246 292 L200 448 L364 214 Z" fill="url(#d)"/>'
    f'<path d="{BOLT}" fill="none" stroke="#eafff6" stroke-opacity=".9" stroke-width="4" stroke-linejoin="round"/><path d="M150 292 L268 214 L246 292 L364 214" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="2"/>'
    '<path d="M300 92 L292 104" stroke="#fff" stroke-width="6" stroke-linecap="round"/><circle cx="300" cy="86" r="5" fill="#fff"/>')

# 13 isometric phone
I['isometric'] = icon(lg('bg', [(0, '#10302b'), (1, '#050c0b')]) + lg('top', [(0, '#1f2a2c'), (1, '#0f1617')]) + lg('scr', [(0, '#3DD6C4'), (1, '#0b6b60')]) + blur('g', 16),
    '<rect width="512" height="512" fill="url(#bg)"/>'
    '<ellipse cx="256" cy="420" rx="170" ry="40" fill="#3DD6C4" opacity=".25" filter="url(#g)"/>'
    '<g transform="translate(256 270) skewY(-18) scale(1 .9) rotate(0)"><rect x="-110" y="-190" width="220" height="360" rx="40" fill="#0a1112" transform="translate(16 16)"/><rect x="-110" y="-190" width="220" height="360" rx="40" fill="url(#top)" stroke="#5ff0dc" stroke-width="5"/><rect x="-90" y="-165" width="180" height="310" rx="24" fill="url(#scr)"/>'
    + bolt(.48, -256, -276, fill='#effffc') + '</g>')

# 14 storm cloud
I['storm'] = icon(lg('bg', [(0, '#0d1f1d'), (1, '#030707')], x2=0) + lg('cl', [(0, '#3a4a4a'), (1, '#1a2324')], x2=0) + blur('g', 14) + blur('g2', 30),
    '<rect width="512" height="512" fill="url(#bg)"/><circle cx="256" cy="330" r="150" fill="#3DD6C4" opacity=".35" filter="url(#g2)"/>'
    + bolt(.75, 10, 90, fill=T, filter='url(#g)') + bolt(.75, 10, 90, fill='#effffc') +
    '<g fill="url(#cl)"><circle cx="170" cy="190" r="70"/><circle cx="260" cy="150" r="95"/><circle cx="350" cy="195" r="70"/><rect x="100" y="190" width="320" height="70" rx="35"/></g>'
    '<path d="M110 230 a40 40 0 0 1 40 -40" stroke="#5a6e6e" stroke-width="5" fill="none" opacity=".6"/>')

# 15 USB plug
I['usb'] = icon(lg('bg', [(0, '#123733'), (1, '#060f0e')]) + lg('pl', [(0, '#e9f2f2'), (1, '#9fb3b3')], y2=0) + blur('g', 14),
    '<rect width="512" height="512" fill="url(#bg)"/>'
    f'<path d="M256 512 V420" stroke="#1f2b2c" stroke-width="40"/><rect x="186" y="300" width="140" height="130" rx="22" fill="#1b2627" stroke="{T}" stroke-width="6"/>'
    '<rect x="206" y="196" width="100" height="108" rx="8" fill="url(#pl)"/><rect x="228" y="222" width="18" height="18" rx="3" fill="#1b2627"/><rect x="266" y="222" width="18" height="18" rx="3" fill="#1b2627"/>'
    + bolt(.36, 0, 108, fill=T, filter='url(#g)') + bolt(.36, 0, 108, fill='#effffc') +
    f'<g fill="none" stroke="{MINT}" stroke-width="8" stroke-linecap="round" opacity=".85"><path d="M180 150 l-30 -40"/><path d="M256 130 v-56"/><path d="M332 150 l30 -40"/></g>')

# 16 orbit
I['orbit'] = icon(rg('bg', [(0, '#0f2c28'), (1, '#030807')]) + blur('g', 12),
    '<rect width="512" height="512" fill="url(#bg)"/>' + stars(8, 21) +
    ''.join(f'<ellipse cx="256" cy="256" rx="210" ry="70" fill="none" stroke="{c}" stroke-width="6" opacity=".9" transform="rotate({a} 256 256)"/>' for a, c in [(30, T), (-30, GREEN), (90, MINT)]) +
    f'<circle cx="256" cy="256" r="96" fill="#071412" stroke="{T}" stroke-width="6"/>' + bolt(.42, 0, 0, fill=T, filter='url(#g)') + bolt(.42, 0, 0, fill='#effffc') +
    f'<circle cx="438" cy="151" r="14" fill="{MINT}"/><circle cx="74" cy="151" r="12" fill="{GREEN}"/><circle cx="256" cy="46" r="12" fill="{T}"/>')

# 17 F monogram
I['monogram'] = icon(lg('bg', [(0, '#16201f'), (1, '#070b0b')]) + lg('f', [(0, MINT), (1, EM)], x2=.3) + blur('g', 14),
    '<rect width="512" height="512" fill="url(#bg)"/>'
    '<path d="M150 90 H390 V160 H232 V230 H350 V300 H232 V422 H150 Z" fill="url(#f)"/>'
    + bolt(.55, 74, 90, fill='#0b1112', stroke='#0b1112', stroke_width=30, stroke_linejoin='round') + bolt(.55, 74, 90, fill=LIME, filter='url(#g)', opacity='.6') + bolt(.55, 74, 90, fill='#f4ffd6'))

# 18 radar rings
I['radar'] = icon(rg('bg', [(0, '#0c2a26'), (1, '#030807')]) + '<linearGradient id="sw" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3DD6C4" stop-opacity="0"/><stop offset="1" stop-color="#3DD6C4" stop-opacity=".55"/></linearGradient>' + blur('g', 12),
    '<rect width="512" height="512" fill="url(#bg)"/>' + ''.join(f'<circle cx="256" cy="256" r="{r}" fill="none" stroke="{T}" stroke-opacity="{o}" stroke-width="4"/>' for r, o in [(80, .7), (140, .45), (200, .3), (260, .18)]) +
    '<path d="M256 256 L456 256 A200 200 0 0 0 397 115 Z" fill="url(#sw)"/>' + f'<circle cx="390" cy="170" r="10" fill="{LIME}"/><circle cx="150" cy="360" r="7" fill="{T}"/>' +
    bolt(.55, 0, 0, fill=T, filter='url(#g)') + bolt(.55, 0, 0, fill='#effffc'))

# 19 progress ring flash
I['progress'] = icon(lg('bg', [(0, '#132826'), (1, '#060c0c')]) + lg('ar', [(0, MINT), (1, EM)]) + blur('g', 12),
    '<rect width="512" height="512" fill="url(#bg)"/><circle cx="256" cy="256" r="170" fill="none" stroke="#1b3532" stroke-width="34"/>'
    f'<circle cx="256" cy="256" r="170" fill="none" stroke="url(#ar)" stroke-width="34" stroke-linecap="round" stroke-dasharray="{2*math.pi*170*.72:.0f} 2000" transform="rotate(-90 256 256)" filter="url(#g)" opacity=".6"/>'
    f'<circle cx="256" cy="256" r="170" fill="none" stroke="url(#ar)" stroke-width="34" stroke-linecap="round" stroke-dasharray="{2*math.pi*170*.72:.0f} 2000" transform="rotate(-90 256 256)"/>'
    '<rect x="196" y="150" width="120" height="212" rx="26" fill="#0b1415" stroke="#effffc" stroke-width="9"/>' + bolt(.3, 0, 6, fill=T))

# 20 liquid chrome
I['chrome'] = icon(rg('bg', [(0, '#13524a'), (1, '#03100e')], cy=.35, r=.8) + lg('ch', [(0, '#ffffff'), (.35, '#b9c8c8'), (.5, '#4f6363'), (.62, '#e8f5f5'), (1, '#7d9696')], x2=.3) + blur('g', 18),
    '<rect width="512" height="512" fill="url(#bg)"/>' + bolt(1, 0, 14, fill='#000', opacity='.45', filter='url(#g)') + bolt(1, 0, 0, fill='url(#ch)', stroke='#ffffff', stroke_width=3, stroke_linejoin='round') +
    f'<path d="M300 90 L182 262" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".8"/><ellipse cx="256" cy="470" rx="150" ry="18" fill="{T}" opacity=".35" filter="url(#g)"/>')

# 21 chip
pins = ''.join(f'<rect x="{150+i*44}" y="{y}" width="16" height="44" rx="4" fill="{T}"/>' for i in range(5) for y in (64, 404)) + ''.join(f'<rect x="{x}" y="{150+i*44}" width="44" height="16" rx="4" fill="{T}"/>' for i in range(5) for x in (64, 404))
I['chip'] = icon(lg('bg', [(0, '#10201e'), (1, '#050909')]) + lg('die', [(0, '#1f3533'), (1, '#0c1918')]) + blur('g', 12),
    '<rect width="512" height="512" fill="url(#bg)"/>' + pins + f'<rect x="108" y="108" width="296" height="296" rx="40" fill="url(#die)" stroke="{T}" stroke-width="6"/><rect x="138" y="138" width="236" height="236" rx="24" fill="none" stroke="{T}" stroke-opacity=".3" stroke-width="3"/>' +
    bolt(.55, 0, 0, fill=T, filter='url(#g)') + bolt(.55, 0, 0, fill='#effffc'))

# 22 paper layers
I['layers'] = icon(blur('sh', 8),
    '<rect width="512" height="512" fill="#062b26"/>' + ''.join(f'<circle cx="{256+dx}" cy="{560+dy}" r="{r}" fill="{c}" filter="url(#sh)"/>' for dx, dy, r, c in [(-120, 0, 330, '#0b4a41'), (140, 30, 300, '#0f6b5e'), (-60, 80, 280, '#16907e'), (90, 120, 250, '#2bb8a4'), (0, 170, 220, '#5fe0cc')]) +
    bolt(.62, 8, -40, fill='#032420', opacity='.5', filter='url(#sh)') + bolt(.62, 0, -50, fill='#ffffff'))

# 23 dark squircle classic (teal take of the current one)
I['classic'] = icon(lg('bg', [(0, '#1d2a2b'), (1, '#0b1011')]) + rg('gl', [(0, T, .35), (1, T, 0)], cx=.3, cy=.2) + lg('ph', [(0, '#172224'), (1, '#0c1213')], x2=0) + lg('bo', [(0, '#effffc'), (.6, MINT), (1, T)], x2=.6) + blur('g', 10),
    '<rect width="512" height="512" fill="url(#bg)"/><rect width="512" height="512" fill="url(#gl)"/>'
    f'<rect x="160" y="86" width="192" height="340" rx="44" fill="url(#ph)" stroke="{T}" stroke-width="14"/><rect x="226" y="112" width="60" height="12" rx="6" fill="{T}"/>' +
    bolt(.6, 0, 4, fill=T, opacity='.6', filter='url(#g)') + bolt(.6, 0, 4, fill='url(#bo)', stroke='#f3fffd', stroke_width=7, stroke_linejoin='round'), rim=T, rimop=.25)

# 24 diagonal split
I['split'] = icon('<clipPath id="half"><path d="M0 512 L512 0 L512 512 Z"/></clipPath>' + lg('t', [(0, MINT), (1, EM)]),
    f'<rect width="512" height="512" fill="#0d1314"/><rect width="512" height="512" fill="url(#t)" clip-path="url(#half)"/>' +
    bolt(.95, 0, 0, fill=T) + f'<g clip-path="url(#half)">{bolt(.95, 0, 0, fill="#0d1314")}</g>')


import re as _re
_fs = open('fs.svg').read(); _fsd = _re.search(r' d="([^"]+)"', _fs).group(1); _fsw, _fsh = map(int, _re.search(r'viewBox="0 0 (\d+) (\d+)"', _fs).groups())

# 25 rocket
I['rocket'] = icon(lg('bg', [(0, '#123230'), (1, '#050b0b')]) + lg('fl', [(0, '#f4ffd6'), (.5, LIME), (1, EM, 0)], x2=0) + blur('g', 12),
    '<rect width="512" height="512" fill="url(#bg)"/>' + stars(9, 31) +
    '<g transform="rotate(35 256 256)"><path d="M216 330 Q256 470 296 330 Z" fill="url(#fl)" filter="url(#g)"/><path d="M226 330 Q256 430 286 330 Z" fill="url(#fl)"/>'
    f'<path d="M256 60 C330 120 330 250 300 340 H212 C182 250 182 120 256 60 Z" fill="#e9f5f4"/><path d="M212 340 L170 380 L190 280 Z" fill="{T}"/><path d="M300 340 L342 380 L322 280 Z" fill="{T}"/>'
    f'<circle cx="256" cy="180" r="34" fill="#0b1415" stroke="{T}" stroke-width="8"/>' + bolt(.13, 0, -76, fill=LIME) + '</g>')

# 26 wrench and bolt
I['tools'] = icon(lg('bg', [(0, '#16302d'), (1, '#060c0c')]) + blur('g', 12),
    '<rect width="512" height="512" fill="url(#bg)"/>'
    '<g transform="rotate(-45 256 256)"><rect x="232" y="150" width="48" height="300" rx="24" fill="#cfdede"/><path d="M196 70 a80 80 0 1 0 120 0 v70 h-40 v-70 h-40 v70 h-40 Z" fill="#cfdede"/></g>' +
    bolt(.72, 0, 0, fill='#0b1415', stroke='#0b1415', stroke_width=34, stroke_linejoin='round') + bolt(.72, 0, 0, fill=T, filter='url(#g)') + bolt(.72, 0, 0, fill=MINT))

# 27 phone cut by the bolt (negative space)
I['cutout'] = icon(lg('bg', [(0, '#0f1617'), (1, '#070a0b')]) + lg('ph', [(0, MINT), (1, EM)]) + '<mask id="m"><rect width="512" height="512" fill="#fff"/>' + bolt(.66, 0, 10, fill='#000') + '</mask>',
    '<rect width="512" height="512" fill="url(#bg)"/>'
    '<rect x="150" y="70" width="212" height="372" rx="48" fill="url(#ph)" mask="url(#m)"/><rect x="226" y="92" width="60" height="11" rx="5.5" fill="#0b1415"/>')

# 28 diamond glass badge
I['diamond'] = icon(rg('bg', [(0, '#0f2d29'), (1, '#030807')]) + lg('dg', [(0, MINT, .9), (1, EM, .6)]) + blur('g', 16),
    '<rect width="512" height="512" fill="url(#bg)"/><rect x="126" y="126" width="260" height="260" rx="46" transform="rotate(45 256 256)" fill="#3DD6C4" opacity=".35" filter="url(#g)"/>'
    '<rect x="126" y="126" width="260" height="260" rx="46" transform="rotate(45 256 256)" fill="url(#dg)"/><rect x="146" y="146" width="220" height="220" rx="36" transform="rotate(45 256 256)" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="4"/>' +
    bolt(.56, 0, 0, fill='#06302a'))

# 29 pulse line
I['pulse'] = icon(lg('bg', [(0, '#10201f'), (1, '#050909')]) + blur('g', 10),
    '<rect width="512" height="512" fill="url(#bg)"/>' + ''.join(f'<line x1="0" y1="{y}" x2="512" y2="{y}" stroke="#1a2e2c" stroke-width="2"/>' for y in range(64, 512, 64)) + ''.join(f'<line x1="{x}" y1="0" x2="{x}" y2="512" stroke="#1a2e2c" stroke-width="2"/>' for x in range(64, 512, 64)) +
    f'<polyline points="20,280 150,280 190,200 230,330 290,110 250,300 330,250 360,280 492,280" fill="none" stroke="{T}" stroke-width="22" stroke-linejoin="round" stroke-linecap="round" filter="url(#g)"/>'
    '<polyline points="20,280 150,280 190,200 230,330 290,110 250,300 330,250 360,280 492,280" fill="none" stroke="#effffc" stroke-width="10" stroke-linejoin="round" stroke-linecap="round"/>')

# 30 FS monogram in Prixma
s = 300 / _fsw
I['fs'] = icon(lg('bg', [(0, '#123a35'), (1, '#060d0c')]) + lg('f', [(0, '#effffc'), (1, MINT)], x2=0) + blur('g', 16),
    '<rect width="512" height="512" fill="url(#bg)"/>' + bolt(1.05, 0, 0, fill=T, opacity='.22') +
    f'<path d="{_fsd}" transform="translate({256-150-10} {256-_fsh*s/2-6}) scale({s:.4f})" fill="url(#f)"/>')

# 31 cube
I['cube'] = icon(lg('bg', [(0, '#132a28'), (1, '#050a0a')]) + blur('g', 16),
    '<rect width="512" height="512" fill="url(#bg)"/><ellipse cx="256" cy="430" rx="160" ry="34" fill="#3DD6C4" opacity=".3" filter="url(#g)"/>'
    f'<path d="M256 80 L420 170 L256 260 L92 170 Z" fill="{MINT}"/><path d="M92 170 L256 260 V440 L92 350 Z" fill="{T}"/><path d="M420 170 L256 260 V440 L420 350 Z" fill="#14907f"/>'
    '<g transform="translate(338 305) skewY(-29) scale(.32) translate(-257 -256)"><path d="' + BOLT + '" fill="#effffc"/></g>'
    '<path d="M256 80 L420 170 L256 260 L92 170 Z M256 260 V440" fill="none" stroke="#effffc" stroke-opacity=".5" stroke-width="3"/>')

# 32 coin badge
I['badge'] = icon(lg('bg', [(0, '#0f1617'), (1, '#070a0b')]) + lg('co', [(0, '#7ff0e0'), (.5, T), (1, '#0c8a79')]) + blur('g', 18),
    '<rect width="512" height="512" fill="url(#bg)"/><circle cx="256" cy="256" r="190" fill="#3DD6C4" opacity=".35" filter="url(#g)"/><circle cx="256" cy="256" r="186" fill="url(#co)"/>'
    '<circle cx="256" cy="256" r="160" fill="none" stroke="#effffc" stroke-opacity=".5" stroke-width="5" stroke-dasharray="4 14"/>' + bolt(.66, 0, 0, fill='#06302a', opacity='.0') + bolt(.66, 4, 8, fill='#063a33', opacity='.4') + bolt(.66, 0, 0, fill='#ffffff'))

# 33 glitch
I['glitch'] = icon('',
    '<rect width="512" height="512" fill="#06090a"/>' + ''.join(f'<rect x="0" y="{y}" width="512" height="2" fill="#fff" opacity=".04"/>' for y in range(0, 512, 6)) +
    bolt(.95, -14, 0, fill=LIME, opacity='.9') + bolt(.95, 14, 0, fill='#00e5ff', opacity='.9') + bolt(.95, 0, 0, fill='#effffc') +
    '<rect x="120" y="200" width="300" height="16" fill="#06090a"/><rect x="150" y="214" width="200" height="6" fill="' + T + '"/><rect x="90" y="330" width="260" height="10" fill="#06090a"/>')

# 34 pixel bolt
px = ['....XXX', '...XXX.', '..XXX..', '.XXXXXX', 'XXXXXX.', '...XXX.', '..XXX..', '.XXX...', '.XX....']
cells = ''.join(f'<rect x="{96+c*46}" y="{50+r*46}" width="42" height="42" rx="6" fill="{T if (r+c)%2 else MINT}"/>' for r, row in enumerate(px) for c, ch in enumerate(row) if ch == 'X')
I['pixel'] = icon(lg('bg', [(0, '#132423'), (1, '#060b0b')]), '<rect width="512" height="512" fill="url(#bg)"/>' + cells)

# 35 lime energy
I['lime'] = icon(rg('bg', [(0, '#1d3a12'), (1, '#050b04')]) + lg('bo', [(0, '#ffffff'), (1, LIME)], x2=.5) + blur('g', 22) + blur('g2', 8),
    '<rect width="512" height="512" fill="url(#bg)"/>' + ''.join(f'<path d="M{256+math.cos(math.radians(a))*120:.0f} {256+math.sin(math.radians(a))*120:.0f} L{256+math.cos(math.radians(a))*260:.0f} {256+math.sin(math.radians(a))*260:.0f}" stroke="{LIME}" stroke-width="5" opacity=".25"/>' for a in range(0, 360, 15)) +
    bolt(.9, 0, 0, fill=LIME, filter='url(#g)') + bolt(.9, 0, 0, fill='url(#bo)', stroke='#f7ffe6', stroke_width=5, stroke_linejoin='round'))

# 36 two-tone teal bolt on light
I['light'] = icon(lg('bg', [(0, '#f4fbfa'), (1, '#d5ecea')]) + blur('sh', 12),
    '<rect width="512" height="512" fill="url(#bg)"/><rect x="150" y="70" width="212" height="372" rx="48" fill="none" stroke="#0f1617" stroke-width="16"/>' +
    bolt(.62, 6, 18, fill='#0b6b60', opacity='.35', filter='url(#sh)') + '<path d="M310 64 L150 292 L246 292 Z" transform="translate(256 266) scale(.62) translate(-257 -256)" fill="' + T + '"/>'
    '<path d="M310 64 L246 292 L268 214 Z M246 292 L200 448 L364 214 L268 214 Z" transform="translate(256 266) scale(.62) translate(-257 -256)" fill="#0f9e8a"/>', rim='#000', rimop=.08)

os.makedirs('svg', exist_ok=True)
for i, (k, v) in enumerate(I.items(), 1):
    open(f'svg/{i:02d}-{k}.svg', 'w').write(v)
print(len(I))
