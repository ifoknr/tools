"""The owner's file store: a folder on the server, browsed and filled through the bot.

Every path the bot touches goes through Store.resolve, which refuses anything that would
land outside the store (.., absolute paths, symlinks pointing out).
"""

import os
import re
import shutil
import threading
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path, PurePosixPath

# Characters Windows, Android or the shell trip over; also control characters.
_BAD = re.compile(r'[\x00-\x1f<>:"\\|?*]')
MAX_NAME = 120


class StoreError(Exception):
    """A request the store refuses; the message key is in .key."""

    def __init__(self, key: str):
        super().__init__(key)
        self.key = key


@dataclass(frozen=True)
class Entry:
    name: str
    rel: str  # path from the store root, "/" separated, "" for the root
    is_dir: bool
    size: int
    modified: float


def clean_name(name: str) -> str:
    """A safe single file or folder name, or StoreError("bad_name")."""
    name = _BAD.sub("_", (name or "").strip()).strip(". ")
    name = name.replace("/", "_")
    if not name or name in (".", ".."):
        raise StoreError("bad_name")
    if len(name) > MAX_NAME:
        stem, dot, ext = name.rpartition(".")
        if dot and 0 < len(ext) <= 10:
            name = stem[: MAX_NAME - len(ext) - 1] + "." + ext
        else:
            name = name[:MAX_NAME]
    return name


def human_size(size: int) -> str:
    units = ["B", "KB", "MB", "GB", "TB"]
    value = float(size)
    for unit in units:
        if value < 1024 or unit == units[-1]:
            return f"{value:.0f} {unit}" if unit == "B" else f"{value:.1f} {unit}"
        value /= 1024
    return f"{size} B"


class Store:
    def __init__(self, root: Path):
        self.root = Path(root)
        self.root.mkdir(parents=True, exist_ok=True)
        self._real_root = self.root.resolve()
        # Names handed out by reserve() for files still downloading, so two uploads with
        # the same name at the same time do not end up in one file.
        self._reserved = set()
        self._lock = threading.Lock()

    def resolve(self, rel: str) -> Path:
        """The real path of rel inside the store, or StoreError("outside")."""
        parts = [p for p in PurePosixPath((rel or "").replace("\\", "/")).parts if p not in ("", "/", ".")]
        if any(p == ".." for p in parts):
            raise StoreError("outside")
        path = self._real_root.joinpath(*parts) if parts else self._real_root
        real = path.resolve()
        if real != self._real_root and self._real_root not in real.parents:
            raise StoreError("outside")
        return real

    def rel(self, path: Path) -> str:
        real = path.resolve()
        return "" if real == self._real_root else real.relative_to(self._real_root).as_posix()

    def entry(self, rel: str) -> Entry:
        path = self.resolve(rel)
        if not path.exists():
            raise StoreError("not_found")
        st = path.stat()
        return Entry(path.name if rel else "", self.rel(path), path.is_dir(), st.st_size, st.st_mtime)

    def list(self, rel: str = ""):
        """Folders first, then files, each sorted by name. Hidden files are left out."""
        path = self.resolve(rel)
        if not path.is_dir():
            raise StoreError("not_found")
        entries = []
        with os.scandir(path) as it:
            for item in it:
                if item.name.startswith("."):
                    continue
                try:
                    st = item.stat()
                    is_dir = item.is_dir()
                except OSError:
                    continue
                entries.append(Entry(item.name, self.rel(Path(item.path)), is_dir, st.st_size, st.st_mtime))
        entries.sort(key=lambda e: (not e.is_dir, e.name.lower()))
        return entries

    def unique_path(self, folder_rel: str, name: str) -> Path:
        """Where a new file called name goes in folder_rel; "name (2).ext" if taken."""
        folder = self.resolve(folder_rel)
        folder.mkdir(parents=True, exist_ok=True)
        name = clean_name(name)
        candidate = folder / name
        stem, dot, ext = name.rpartition(".")
        if not dot or not stem:
            stem, ext = name, ""
        n = 2
        while candidate.exists() or candidate in self._reserved:
            candidate = folder / (f"{stem} ({n}).{ext}" if ext else f"{stem} ({n})")
            n += 1
        return candidate

    def reserve(self, folder_rel: str, name: str) -> Path:
        """Like unique_path, and keeps the name taken until release()."""
        with self._lock:
            path = self.unique_path(folder_rel, name)
            self._reserved.add(path)
            return path

    def release(self, path: Path) -> None:
        with self._lock:
            self._reserved.discard(path)

    def mkdir(self, folder_rel: str, name: str) -> str:
        path = self.resolve(folder_rel) / clean_name(name)
        if path.exists():
            raise StoreError("exists")
        path.mkdir(parents=True)
        return self.rel(path)

    def delete(self, rel: str) -> None:
        if not rel:
            raise StoreError("outside")  # never the root itself
        path = self.resolve(rel)
        if not path.exists():
            raise StoreError("not_found")
        if path.is_dir():
            shutil.rmtree(path)
        else:
            path.unlink()

    def append_note(self, text: str, when: datetime) -> str:
        path = self.resolve("notes.md")
        with open(path, "a", encoding="utf-8") as f:
            f.write(f"## {when:%Y-%m-%d %H:%M}\n\n{text.strip()}\n\n")
        return self.rel(path)

    def usage(self):
        """(files, bytes) stored, and the disk's (total, used, free)."""
        count = size = 0
        for dirpath, _dirs, files in os.walk(self._real_root):
            for f in files:
                try:
                    size += os.path.getsize(os.path.join(dirpath, f))
                    count += 1
                except OSError:
                    pass
        disk = shutil.disk_usage(self._real_root)
        return count, size, disk
