# Icons for the other tools in the style of the chosen set, each in its own colours.
import math, os
exec(open('gen.py').read().split("I = {}")[0])
O = {}

# NextSUSFS: kernel chip hiding an eye (hidden at kernel level), blue to teal
A1, A2 = '#3B82F6', '#2DD4BF'
pins = ''.join(f'<rect x="{150+i*44}" y="{y}" width="16" height="44" rx="4" fill="url(#pg)"/>' for i in range(5) for y in (64, 404)) + ''.join(f'<rect x="{x}" y="{150+i*44}" width="44" height="16" rx="4" fill="url(#pg)"/>' for i in range(5) for x in (64, 404))
eye = ('<g transform="translate(256 256)"><path d="M-104 0 Q0 -84 104 0 Q0 84 -104 0 Z" fill="none" stroke="#eef7ff" stroke-width="16" stroke-linejoin="round"/>'
       '<circle r="30" fill="#eef7ff"/><line x1="-96" y1="78" x2="96" y2="-78" stroke="#0a1324" stroke-width="34" stroke-linecap="round"/><line x1="-96" y1="78" x2="96" y2="-78" stroke="#eef7ff" stroke-width="16" stroke-linecap="round"/></g>')
O['nextsusfs'] = icon(lg('bg', [(0, '#0f1b33'), (1, '#050810')]) + lg('die', [(0, '#16264a'), (1, '#0a1324')]) + lg('pg', [(0, A1), (1, A2)]) + blur('g', 14),
    '<rect width="512" height="512" fill="url(#bg)"/>' + pins + f'<rect x="108" y="108" width="296" height="296" rx="40" fill="url(#die)" stroke="url(#pg)" stroke-width="6"/>'
    f'<rect x="138" y="138" width="236" height="236" rx="24" fill="none" stroke="{A2}" stroke-opacity=".3" stroke-width="3"/>'
    f'<g filter="url(#g)" opacity=".7"><circle cx="256" cy="256" r="70" fill="{A1}"/></g>' + eye, rim=A2, rimop=.2)

# NextZygisk: orbits around a Z core (code injected into every app), green
G1, G2, G3 = '#4ADE80', '#059669', '#BBF7D0'
O['nextzygisk'] = icon(rg('bg', [(0, '#0d2b1b'), (1, '#030a06')]) + lg('z', [(0, '#f0fff4'), (1, G1)], x2=0) + blur('g', 12),
    '<rect width="512" height="512" fill="url(#bg)"/>' + stars(8, 41) +
    ''.join(f'<ellipse cx="256" cy="256" rx="210" ry="70" fill="none" stroke="{c}" stroke-width="6" opacity=".9" transform="rotate({a} 256 256)"/>' for a, c in [(30, G1), (-30, G2), (90, G3)]) +
    f'<circle cx="256" cy="256" r="96" fill="#06150d" stroke="{G1}" stroke-width="6"/><circle cx="256" cy="256" r="70" fill="{G1}" opacity=".35" filter="url(#g)"/>'
    '<path d="M214 210 H298 L214 302 H298" fill="none" stroke="url(#z)" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>'
    f'<circle cx="438" cy="151" r="14" fill="{G3}"/><circle cx="74" cy="151" r="12" fill="{G1}"/><circle cx="256" cy="46" r="12" fill="{G2}"/>')

# NextWheel: radar sweep around a steering wheel (it watches which apps see root), mint
M1, M2 = '#86EFAC', '#14B8A6'
O['nextwheel'] = icon(rg('bg', [(0, '#0b2a24'), (1, '#030807')]) + f'<linearGradient id="sw" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="{M1}" stop-opacity="0"/><stop offset="1" stop-color="{M1}" stop-opacity=".5"/></linearGradient>' + blur('g', 12),
    '<rect width="512" height="512" fill="url(#bg)"/>' + ''.join(f'<circle cx="256" cy="256" r="{r}" fill="none" stroke="{M2}" stroke-opacity="{o}" stroke-width="4"/>' for r, o in [(140, .5), (200, .32), (260, .18)]) +
    '<path d="M256 256 L456 256 A200 200 0 0 0 397 115 Z" fill="url(#sw)"/>' + f'<circle cx="390" cy="170" r="10" fill="{M1}"/><circle cx="140" cy="372" r="7" fill="{M2}"/>' +
    f'<g filter="url(#g)" opacity=".7"><circle cx="256" cy="256" r="86" fill="none" stroke="{M1}" stroke-width="20"/></g>'
    '<g transform="translate(256 256)" fill="none" stroke="#f0fff7" stroke-linecap="round"><circle r="86" stroke-width="20"/><circle r="22" fill="#f0fff7" stroke="none"/>'
    '<path d="M-22 0 H-80 M22 0 H80 M0 22 V80" stroke-width="18"/></g>')

# NEXTCORE: speed gauge with a bolt (performance), orange to pink
C1, C2 = '#FDBA74', '#F43F5E'
ticks = ''.join(f'<line x1="{256+150*math.cos(math.radians(a)):.0f}" y1="{290+150*math.sin(math.radians(a)):.0f}" x2="{256+(128 if i%3==0 else 138)*math.cos(math.radians(a)):.0f}" y2="{290+(128 if i%3==0 else 138)*math.sin(math.radians(a)):.0f}" stroke="#ffe8e0" stroke-width="{6 if i%3==0 else 3}" stroke-linecap="round" opacity=".8"/>' for i, a in enumerate(range(150, 391, 20)))
O['nextcore'] = icon(lg('bg', [(0, '#2b1416'), (1, '#0b0607')]) + lg('arc', [(0, C1), (1, C2)], y2=0) + lg('bo', [(0, '#fff'), (1, C1)], x2=0) + blur('g', 12),
    '<rect width="512" height="512" fill="url(#bg)"/>'
    '<path d="M126 365 A170 170 0 1 1 386 365" fill="none" stroke="#3a1c20" stroke-width="30" stroke-linecap="round"/>'
    '<path d="M126 365 A170 170 0 1 1 386 365" fill="none" stroke="url(#arc)" stroke-width="30" stroke-linecap="round" filter="url(#g)" opacity=".6"/>'
    '<path d="M126 365 A170 170 0 1 1 386 365" fill="none" stroke="url(#arc)" stroke-width="30" stroke-linecap="round"/>' + ticks +
    bolt(.5, 0, 34, fill=C2, opacity='.6', filter='url(#g)') + bolt(.5, 0, 34, fill='url(#bo)'), rim=C1, rimop=.15)

# Companion: neon phone with a puzzle piece (the module that fits the phone), light teal
P1, P2 = '#5EEAD4', '#B8F5EA'
puzzle = 'M-46 -46 H-14 A16 16 0 1 1 14 -46 H46 V-14 A16 16 0 1 1 46 14 V46 H-46 Z'
O['companion'] = icon(blur('g', 9) + blur('g2', 22),
    '<rect width="512" height="512" fill="#050a0a"/>'
    f'<rect x="146" y="76" width="220" height="360" rx="50" fill="none" stroke="{P1}" stroke-width="16" filter="url(#g2)" opacity=".8"/>'
    f'<rect x="146" y="76" width="220" height="360" rx="50" fill="none" stroke="{P1}" stroke-width="14" filter="url(#g)"/>'
    f'<rect x="146" y="76" width="220" height="360" rx="50" fill="none" stroke="#effffc" stroke-width="6"/>'
    '<line x1="228" y1="106" x2="284" y2="106" stroke="#effffc" stroke-width="8" stroke-linecap="round"/>'
    f'<g transform="translate(250 268) scale(1.25)"><path d="{puzzle}" fill="none" stroke="{P1}" stroke-width="14" stroke-linejoin="round" filter="url(#g)"/><path d="{puzzle}" fill="{P2}"/></g>')

os.makedirs('tools', exist_ok=True)
for k, v in O.items(): open(f'tools/{k}.svg', 'w').write(v)
