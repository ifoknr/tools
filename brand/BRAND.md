# IFOKNR brand

Fixed by IFOKNR on 28 Oct 2026, updated 30 Oct 2026 (grey icons, a new mark for the site) and
9 Nov 2026 (glass icons for the Fastboot Studio apps).
Every app, tool, site and post uses these; change them only when IFOKNR asks.

## IFOKNR (the developer)

| Piece | What it is | File |
|---|---|---|
| Mark | `IF` in the Swamp Ninja lettering on a soft tile: deep violet `#483f77` → `#2a2346`, thin `#cabeff` rim at 35 %, corners about 31 % of the side; letters `#f3eeff` → `#cabeff` → `#edb8cc` with a faint `#f3eeff` edge | `ifoknr-tile.svg` |
| Name | `IFOKNR` in the Swamp Ninja lettering. On dark: `#f3eeff` → `#cabeff` → `#edb8cc` with a faint light edge. On light: `#483f77` → `#605690` → `#7c5263` | `ifoknr-name-dark.svg`, `ifoknr-name-light.svg` |

The mark sits to the left of the name (the name is the same height as the mark or smaller).
On an About page: the mark, then the name, then "Developer" under it.
The tools library (/app) is the one exception: IFOKNR's picture (`site/app/ifoknr.webp`) in a glass hexagon
stands in for the mark, and the rail at the top shows the library's own icon (`site/app/icon.svg`).

The violet mark and name above stay in the apps and tools (About pages, signatures) until IFOKNR
says otherwise. **ifoknr.com uses a new mark and name** (since 30 Oct 2026):

| Piece | What it is | File |
|---|---|---|
| Site mark | `IF` in the Audiowide lettering on a graphite tile `#353537` with a thin `#4a4a4f` rim, letters `#f2f1f5`. On light: tile `#e6e4ea`, rim `#c6c5cd`, letters `#1b1b1f` | `site/ifoknr-mark-dark.svg`, `site/ifoknr-mark-light.svg` |
| Site name | `IFOKNR` in the Audiowide lettering. On dark: silver `#ffffff` → `#a3a5b3`. On light: graphite `#47474f` → `#1b1b1f` | `site/ifoknr-name-dark.svg`, `site/ifoknr-name-light.svg` |

## Apps and tools

- Names are drawn in the Prixma Bold Italic lettering, small (about the size of the text they replace).
- Each one has a fixed icon on a dark tile. **Since 30 Oct 2026 every icon is grey**: the same
  drawing, with a graphite tile and calm grey-blue lines (the colour of Fastboot Studio's icon).
  The launcher icon, the in-app icon, the WebUI, the site and the Telegram bot all use it.

| App / tool | Icon | File |
|---|---|---|
| Fastboot Studio (Windows) and Fastboot Studio Mobile | lightning bolt on a circuit board; a simpler drawing (bigger bolt, thicker traces) at 32 px and below | `icons/fastbootstudio.svg`, `icons/fastbootstudio-small.svg` |
| NextSUSFS | kernel chip with a crossed-out eye | `icons/nextsusfs.svg` |
| NextZygisk | orbits around a Z core | `icons/nextzygisk.svg` |
| NextWheel | radar sweep around a steering wheel | `icons/nextwheel.svg` |
| NextCore | speed gauge with a bolt | `icons/nextcore.svg`; launcher layers in `nextcore/` (`mono.svg` and `white.svg` stay one colour) |
| Companion | phone with a puzzle piece | `icons/companion.svg` |

**Since 9 Nov 2026 the three Fastboot Studio apps have glass icons** (the grey drawings above stay
for the root tools). One family: a glass object on a glass tile, with a white glyph in the dark
version and a blue one (`#5b8cff` → `#1f4bd8`) in the light version. No core, no ball behind it.

| App | Glass icon | Dark (launcher, dark theme) | Light (light theme) |
|---|---|---|---|
| Fastboot Studio (Windows) | a screen with the bolt | `icons/glass/fastbootstudio-dark.svg` | `icons/glass/fastbootstudio-light.svg` |
| Fastboot Studio Mobile | a phone with the bolt | `icons/glass/mobile-dark.svg` | `icons/glass/mobile-light.svg` |
| Companion | a chip with the puzzle piece | `icons/glass/companion-dark.svg` | `icons/glass/companion-light.svg` |

Dark: grey glass, tile `#4a4a4f` → `#2c2c2f` with soft `#aab4cc` and `#7d879f` glows, a white veil and
rim over the object. Light: frosted glass, tile `#f1f3f8` → `#d9dfea` with white and `#b9c6e6` glows.
A launcher icon that cannot follow the theme uses the dark one.

`tools-src/greyify.py` turns a coloured drawing into the grey family. A colour darker than 20 %
lightness becomes graphite (HLS 0.69, 0.17 + 0.55·L, 0.04). Every other colour becomes grey-blue
(HLS 0.62, min(0.55 + 0.35·L, 0.93), 0.28). Each pixel keeps its lightness order. The coloured
originals (28 Oct) are in this repository's history.

App icons are never violet: violet is IFOKNR's own colour in the apps (mark and name).

## App pages and the site
Fastboot Studio (v2.8.0), Fastboot Studio Mobile (v1.1.0), the Companion WebUI (v2.5.2),
ifoknr.com and its library (`/app`) follow Material 3 Expressive in muted colours:
- dark grey surfaces `#2a2a2c` (page `#202022`), containers `#303033`, `#38383b` and `#434347`;
- tonal fills in blue-slate `#343b50`, mauve `#4f4053` and slate `#3f455a`, a selected item `#414a6b`;
- light periwinkle `#a8c4ff` (dark text `#152c5e`) for buttons, switches and radios;
- light theme: page `#f4f3f7`, surface `#faf9fd`, blue `#2e4d9d`.

The phone's status and navigation bars match the page: `#2A2A2C` dark, `#FAF9FD` light. A blue
block with white text is never used. Stats are slim strips (label and value on one line), never
big tiles.

## Rules

- The lettering fonts (Swamp Ninja, Prixma) are personal-use licences: never put a font file in
  a repository, app or site. Text is drawn as outlines (SVG paths, Android vector drawables or
  PNG). `tools-src/` holds the scripts that made every file here; the fonts stay outside.
- Numbers are written in English digits in every language, Arabic included.
- Everything is under IFOKNR's name only.
- A changed picture at the same web address needs a new `?v=` on its link, or browsers and
  Cloudflare keep the old one.
