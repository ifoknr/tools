# IFOKNR brand

Fixed by IFOKNR on 28 Oct 2026. Every app, tool, site and post uses these; change them only
when IFOKNR asks.

## IFOKNR (the developer)

| Piece | What it is | File |
|---|---|---|
| Mark | `IF` in the Swamp Ninja lettering on a soft tile: deep violet `#483f77` → `#2a2346`, thin `#cabeff` rim at 35 %, corners about 31 % of the side; letters `#f3eeff` → `#cabeff` → `#edb8cc` with a faint `#f3eeff` edge | `ifoknr-tile.svg` |
| Name | `IFOKNR` in the Swamp Ninja lettering. On dark: `#f3eeff` → `#cabeff` → `#edb8cc` with a faint light edge. On light: `#483f77` → `#605690` → `#7c5263` | `ifoknr-name-dark.svg`, `ifoknr-name-light.svg` |

The mark sits to the left of the name (the name is the same height as the mark or smaller).
On an About page: the mark, then the name, then "Developer" under it.

## Apps and tools

- Names are drawn in the Prixma Bold Italic lettering, small (about the size of the text they replace).
- Each one has a fixed icon on a dark tile with a glow, in its own colours:

| App / tool | Icon | Colours | File |
|---|---|---|---|
| Fastboot Studio (Windows) and Fastboot Studio Mobile | lightning bolt on a circuit board; a simpler drawing (bigger bolt, thicker traces) at 32 px and below | teal `#3DD6C4` | `icons/fastbootstudio.svg`, `icons/fastbootstudio-small.svg` |
| NextSUSFS | kernel chip with a crossed-out eye | blue `#3B82F6` → teal `#2DD4BF` | `icons/nextsusfs.svg` |
| NextZygisk | orbits around a Z core | green `#4ADE80`, `#059669` | `icons/nextzygisk.svg` |
| NextWheel | radar sweep around a steering wheel | mint `#86EFAC`, `#14B8A6` | `icons/nextwheel.svg` |
| NextCore | speed gauge with a bolt | orange `#FDBA74` → pink `#F43F5E` | `icons/nextcore.svg`; launcher layers in `nextcore/` |
| Companion | neon phone with a puzzle piece | light teal `#5EEAD4`, `#B8F5EA` | `icons/companion.svg` |

App icons are never violet: violet is IFOKNR's own colour (mark and name), and it stays violet
whatever the colours of the page around it.

## App pages (planned, not built yet)
Fastboot Studio from v2.9 and Fastboot Studio Mobile's new design follow Material 3 Expressive
in muted colours: dark grey surfaces (`#2a2a2c`, containers `#353537` and `#3d3d40`), tonal fills
in blue `#2e4d9d`, mauve `#4f4053` and slate `#3f455a`, a selected card `#414a6b`, and light
periwinkle `#a8c4ff` for buttons, switches and radios. Stats are slim strips (label and value on
one line), never big tiles. The samples are on the `design-m3-expressive` branch of this repository.

## Rules

- The lettering fonts (Swamp Ninja, Prixma) are personal-use licences: never put a font file in
  a repository, app or site. Text is drawn as outlines (SVG paths, Android vector drawables or
  PNG). `tools-src/` holds the scripts that made every file here; the fonts stay outside.
- Numbers are written in English digits in every language, Arabic included.
- Everything is under IFOKNR's name only.
- A changed picture at the same web address needs a new `?v=` on its link, or browsers and
  Cloudflare keep the old one.
