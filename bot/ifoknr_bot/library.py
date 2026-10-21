"""The owner's files in the tools library (the Mini App at SITE_URL/app/).

Telegram keeps the files: an entry holds the file_id, so the bot sends a file again without
storing it, at any size Telegram allowed when it was sent. library.json (DATA_DIR) is the full
list; public/private.json has the same entries without the file_id, for the site to show
(the site serves DATA_DIR/public at /app/live/).
"""

import json
import os
import re
import secrets
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from pathlib import Path

# The same categories as the site's library (scripts/library.py), plus none.
CATEGORIES = [
    ("root-management", "🛠️", "إدارة الروت", "Root management"),
    ("system", "⚙️", "النظام", "System"),
    ("performance", "⚡", "الأداء والبطارية", "Performance & battery"),
    ("privacy", "🕵️", "الخصوصية", "Privacy"),
    ("security", "🔐", "الحماية", "Security"),
    ("ad-blocking", "🚫", "حجب الإعلانات", "Ad blocking"),
    ("app-modifications", "🧩", "تعديل التطبيقات", "App mods"),
    ("debloating", "🧹", "حذف تطبيقات النظام", "Debloating"),
    ("file-management", "🗂️", "إدارة الملفات", "Files"),
    ("backup", "💾", "النسخ الاحتياطي", "Backup & restore"),
    ("customization", "🎨", "التخصيص", "Customization"),
    ("audio", "🎵", "الصوت", "Audio"),
    ("networking", "🌐", "الشبكات", "Networking"),
    ("gaming", "🎮", "الألعاب", "Gaming"),
    ("development", "🧑‍💻", "التطوير والأتمتة", "Development"),
    ("utilities", "🧰", "أدوات عامة", "Utilities"),
]
CATEGORY_IDS = {c[0] for c in CATEGORIES}
ID = re.compile(r"^[a-f0-9]{6,12}$")
MAX_NAME = 80
MAX_NOTE = 600


@dataclass
class Entry:
    id: str
    name: str
    file_id: str
    file_name: str = ""
    size: int = 0
    c: str = ""          # category id, or ""
    note: str = ""
    v: str = ""          # version, optional
    sha256: str = ""     # when the bot could read the file
    t: str = field(default_factory=lambda: datetime.now(timezone.utc).strftime("%Y-%m-%d"))

    @property
    def ext(self) -> str:
        suffix = Path(self.file_name).suffix.lower().lstrip(".")
        return suffix if suffix.isalnum() and len(suffix) <= 8 else ""

    def public(self) -> dict:
        out = {"id": self.id, "name": self.name, "t": self.t}
        for key in ("c", "note", "v", "sha256"):
            if getattr(self, key):
                out[key] = getattr(self, key)
        if self.size:
            out["size"] = self.size
        if self.ext:
            out["ext"] = self.ext
        return out


def clean_name(text: str, limit: int = MAX_NAME) -> str:
    """One line, no control characters, at most limit characters."""
    text = re.sub(r"[\x00-\x1f\x7f]+", " ", text or "")
    return re.sub(r"\s+", " ", text).strip()[:limit]


def clean_note(text: str) -> str:
    text = re.sub(r"[\x00-\x09\x0b-\x1f\x7f]+", " ", text or "")
    return re.sub(r"\n{3,}", "\n\n", text).strip()[:MAX_NOTE]


class Library:
    def __init__(self, path: Path, public_dir: Path):
        self.path = Path(path)
        self.public_file = Path(public_dir) / "private.json"
        self.entries: list[Entry] = []
        self.bot = ""  # the bot's username: the site's "send it to me" button opens this bot
        self._load()

    def _load(self):
        try:
            raw = json.loads(self.path.read_text(encoding="utf-8"))
        except FileNotFoundError:
            return
        except ValueError:
            raise RuntimeError(f"{self.path} is not valid JSON; fix or remove it")
        known = set(Entry.__dataclass_fields__)
        self.entries = [Entry(**{k: v for k, v in e.items() if k in known}) for e in raw.get("items", [])]

    @staticmethod
    def _write(path: Path, data: dict, mode: int):
        path.parent.mkdir(parents=True, exist_ok=True)
        tmp = path.with_name("." + path.name + ".tmp")
        tmp.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
        os.chmod(tmp, mode)
        os.replace(tmp, path)

    def save(self):
        # The full list holds the file ids: the bot's only. The public one is read by the site's
        # web server, which runs as another user.
        self._write(self.path, {"items": [asdict(e) for e in self.entries]}, 0o600)
        self.public_file.parent.mkdir(parents=True, exist_ok=True)
        os.chmod(self.public_file.parent, 0o755)
        public = {"items": [e.public() for e in self.entries]}
        if self.bot:
            public["bot"] = self.bot
        self._write(self.public_file, public, 0o644)

    def get(self, entry_id: str):
        if not entry_id or not ID.match(entry_id):
            return None
        return next((e for e in self.entries if e.id == entry_id), None)

    def add(self, name: str, file_id: str, file_name: str = "", size: int = 0, c: str = "", sha256: str = "") -> Entry:
        name = clean_name(name)
        if not name:
            raise ValueError("empty name")
        if c and c not in CATEGORY_IDS:
            raise ValueError(f"unknown category {c!r}")
        taken = {e.id for e in self.entries}
        new_id = secrets.token_hex(3)
        while new_id in taken:
            new_id = secrets.token_hex(3)
        entry = Entry(id=new_id, name=name, file_id=file_id, file_name=file_name, size=size or 0, c=c, sha256=sha256)
        self.entries.insert(0, entry)  # newest first
        self.save()
        return entry

    def update(self, entry_id: str, **changes) -> Entry:
        entry = self.get(entry_id)
        if entry is None:
            raise KeyError(entry_id)
        if "name" in changes:
            changes["name"] = clean_name(changes["name"]) or entry.name
        if "note" in changes:
            changes["note"] = clean_note(changes["note"])
        if "v" in changes:
            changes["v"] = clean_name(changes["v"], 32)
        if "c" in changes and changes["c"] and changes["c"] not in CATEGORY_IDS:
            raise ValueError(f"unknown category {changes['c']!r}")
        for key, value in changes.items():
            setattr(entry, key, value)
        self.save()
        return entry

    def remove(self, entry_id: str) -> bool:
        entry = self.get(entry_id)
        if entry is None:
            return False
        self.entries.remove(entry)
        self.save()
        return True


def category_name(cat_id: str, lang: str) -> str:
    for cid, emoji, ar, en in CATEGORIES:
        if cid == cat_id:
            return f"{emoji} {ar if lang == 'ar' else en}"
    return ""
