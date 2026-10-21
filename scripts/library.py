"""Builds site/app/library.json, the data of the tools library (the Telegram Mini App), from
Awesome Android Root's list of root apps and modules (MIT, github.com/awesome-android-root).

    python3 scripts/library.py --src <checkout>/docs/apps-and-modules --out site/app/library.json

With GITHUB_TOKEN set, each GitHub project also gets its stars and latest release (version,
date, APK), read with GraphQL a hundred projects at a time. Standard library only.
"""

import argparse
import json
import os
import re
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

SOURCE = {
    "name": "Awesome Android Root",
    "url": "https://github.com/awesome-android-root/awesome-android-root",
    "site": "https://awesome-android-root.xyz",
    "license": "MIT",
    "copyright": "Copyright (c) 2024 Awesome Android Root",
}

# File, emoji, English and Arabic names, in the order the list shows them.
CATEGORIES = [
    ("root-management", "🛠️", "Root management", "إدارة الروت"),
    ("system", "⚙️", "System", "النظام"),
    ("performance", "⚡", "Performance & battery", "الأداء والبطارية"),
    ("privacy", "🕵️", "Privacy", "الخصوصية"),
    ("security", "🔐", "Security", "الحماية"),
    ("ad-blocking", "🚫", "Ad blocking", "حجب الإعلانات"),
    ("app-modifications", "🧩", "App mods", "تعديل التطبيقات"),
    ("debloating", "🧹", "Debloating", "حذف تطبيقات النظام"),
    ("file-management", "🗂️", "Files", "إدارة الملفات"),
    ("backup", "💾", "Backup & restore", "النسخ الاحتياطي"),
    ("customization", "🎨", "Customization", "التخصيص"),
    ("audio", "🎵", "Audio", "الصوت"),
    ("networking", "🌐", "Networking", "الشبكات"),
    ("gaming", "🎮", "Gaming", "الألعاب"),
    ("development", "🧑‍💻", "Development", "التطوير والأتمتة"),
    ("utilities", "🧰", "Utilities", "أدوات عامة"),
]

# - **[⭐ Name](url)** - Description. `FOSS` `[M]` | [🌱](f-droid) [▶️](play)
ENTRY = re.compile(r"^\s*[-*]\s+\*\*\[(?P<star>⭐\s*)?(?P<name>[^\]]+)\]\((?P<url>[^)\s]+)\)\*\*\s*(?:[-–—:]\s*)?(?P<rest>.*)$")
TAG = re.compile(r"`(FOSS|Proprietary|\[(?:M|K|A|LSP)\])`")
LINK = re.compile(r"\[([^\]]*)\]\(([^)\s]+)\)")
GITHUB = re.compile(r"^https://github\.com/([A-Za-z0-9-]+)/([A-Za-z0-9._-]+?)(?:\.git)?/?(?:[#?].*)?$")
ROOTS = {"[M]": "magisk", "[K]": "kernelsu", "[A]": "apatch", "[LSP]": "lsposed"}
STORES = {"f-droid.org": "fdroid", "play.google.com": "play", "apt.izzysoft.de": "izzy"}


def slug(text: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return s or "item"


def plain(text: str) -> str:
    """Markdown of a description, as plain text."""
    text = LINK.sub(lambda m: m.group(1), text)
    text = re.sub(r"`([^`]*)`", r"\1", text)
    text = re.sub(r"\*\*?([^*]+)\*\*?", r"\1", text)
    return re.sub(r"\s+", " ", text).strip()


def parse_entry(line: str):
    m = ENTRY.match(line)
    if not m:
        return None
    url = m.group("url").strip()
    if not url.startswith("https://"):
        return None  # a link to another page of the list, not an app
    rest = m.group("rest")
    stores_part = ""
    if " | " in rest:
        rest, stores_part = rest.split(" | ", 1)
    tags = TAG.findall(rest)
    desc = plain(TAG.sub("", rest)).rstrip(" .") + "."
    item = {
        "n": plain(m.group("name")),
        "u": url,
        "d": desc if desc != "." else "",
    }
    if m.group("star"):
        item["star"] = 1
    if "FOSS" in tags:
        item["foss"] = 1
    elif "Proprietary" in tags:
        item["foss"] = 0
    roots = [ROOTS[t] for t in tags if t in ROOTS]
    if roots:
        item["root"] = roots
    stores = {}
    for _, link in LINK.findall(stores_part):
        host = link.split("/")[2] if link.count("/") >= 2 else ""
        key = STORES.get(host)
        if key and key not in stores:
            stores[key] = link
    if stores:
        item["stores"] = stores
    gh = GITHUB.match(url)
    if gh and gh.group(2) not in ("releases", "issues"):
        item["gh"] = f"{gh.group(1)}/{gh.group(2)}"
    return item


def parse_category(text: str):
    """[(section, [items])] of one category file. Sub-sections are named "Section › Sub"."""
    sections = []
    h2 = h3 = None
    in_front = False
    for i, line in enumerate(text.splitlines()):
        if i == 0 and line.strip() == "---":
            in_front = True
            continue
        if in_front:
            if line.strip() == "---":
                in_front = False
            continue
        if line.startswith("## "):
            h2, h3 = plain(line[3:]), None
            continue
        if line.startswith("### "):
            h3 = plain(line[4:])
            continue
        item = parse_entry(line)
        if item is None or h2 is None:
            continue
        name = f"{h2} › {h3}" if h3 else h2
        if not sections or sections[-1][0] != name:
            sections.append((name, []))
        sections[-1][1].append(item)
    return sections


def build(src: Path):
    categories, items, seen = [], [], {}
    for key, emoji, en, ar in CATEGORIES:
        path = src / f"{key}.md"
        if not path.exists():
            print(f"warning: {path} is missing", file=sys.stderr)
            continue
        section_names = []
        count = 0
        for section, entries in parse_category(path.read_text(encoding="utf-8")):
            section_names.append(section)
            for item in entries:
                base = slug(item["n"])
                n = seen.get(base, 0)
                seen[base] = n + 1
                item["id"] = base if n == 0 else f"{base}-{n + 1}"
                item["c"] = key
                item["s"] = len(section_names) - 1
                items.append(item)
                count += 1
        categories.append({"id": key, "emoji": emoji, "en": en, "ar": ar, "sections": section_names, "count": count})
    return categories, items


QUERY_REPO = """r%d: repository(owner: %s, name: %s) {
  stargazerCount isArchived pushedAt
  latestRelease { tagName publishedAt releaseAssets(first: 30) { nodes { name size downloadUrl } } }
}"""


def _graphql(token: str, query: str):
    req = urllib.request.Request(
        "https://api.github.com/graphql",
        data=json.dumps({"query": query}).encode(),
        headers={"Authorization": f"bearer {token}", "User-Agent": "ifoknr-tools-library"},
    )
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.load(r)


def pick_apk(assets):
    """The APK most people want: a universal or arm64 build, never a debug one."""
    apks = [a for a in assets if a["name"].lower().endswith(".apk") and "debug" not in a["name"].lower()]
    if not apks:
        return None
    def score(a):
        n = a["name"].lower()
        return (("universal" in n or "arm64" in n) * 2 + ("release" in n), -abs(a["size"]))
    return max(apks, key=score)


def round_stars(n: int) -> int:
    """Stars to two figures, so a star more or less does not make a new file every day."""
    if n < 100:
        return n
    digits = len(str(n)) - 2
    return round(n, -digits)


def enrich(items, token: str, batch: int = 100, ask=_graphql):
    """Adds stars and the latest release of every GitHub project. A failed batch is skipped."""
    repos = sorted({i["gh"] for i in items if "gh" in i})
    found = {}
    for start in range(0, len(repos), batch):
        chunk = repos[start:start + batch]
        parts = [QUERY_REPO % (n, json.dumps(r.split("/")[0]), json.dumps(r.split("/")[1])) for n, r in enumerate(chunk)]
        try:
            data = (ask(token, "{" + "\n".join(parts) + "}") or {}).get("data") or {}
        except Exception as e:  # network or rate limit: keep what we have
            print(f"warning: GitHub batch {start} failed: {e}", file=sys.stderr)
            continue
        for n, repo in enumerate(chunk):
            info = data.get(f"r{n}")
            if info:
                found[repo] = info
    for item in items:
        info = found.get(item.get("gh"))
        if not info:
            continue
        item["stars"] = round_stars(info.get("stargazerCount", 0))
        if info.get("isArchived"):
            item["archived"] = 1
        rel = info.get("latestRelease")
        if rel:
            r = {"v": rel["tagName"], "t": (rel.get("publishedAt") or "")[:10]}
            apk = pick_apk(rel.get("releaseAssets", {}).get("nodes", []))
            if apk:
                r["apk"], r["size"] = apk["downloadUrl"], apk["size"]
            item["rel"] = r
    return len(found)


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    p.add_argument("--src", required=True, type=Path, help="docs/apps-and-modules of the list")
    p.add_argument("--out", required=True, type=Path)
    args = p.parse_args(argv)
    categories, items = build(args.src)
    if len(items) < 100:
        raise SystemExit(f"only {len(items)} entries were read: the list's format may have changed")
    token = os.environ.get("GITHUB_TOKEN", "").strip()
    enriched = enrich(items, token) if token else 0
    data = {
        "updated": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "source": SOURCE,
        "categories": categories,
        "items": items,
    }
    old = None
    if args.out.exists():
        try:
            old = json.loads(args.out.read_text(encoding="utf-8"))
        except ValueError:
            pass
    # The date alone does not make a new file (and a new image).
    if old and {**old, "updated": ""} == {**data, "updated": ""}:
        print(f"{len(items)} entries, no change")
        return
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"{len(items)} entries in {len(categories)} categories, {enriched} GitHub projects read")


if __name__ == "__main__":
    main()
