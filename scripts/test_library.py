"""python3 -m unittest discover -s scripts"""

import json
import tempfile
import unittest
from pathlib import Path

import library

SAMPLE = """---
title: "Root"
---

# Root Managers, Zygisk & Root Hiding

> [!TIP]
> New to rooting? Read the [Complete Rooting Guide](/rooting-guides/) first.

## Root Managers

- **[⭐ Magisk](https://github.com/topjohnwu/Magisk)** - Manage Magisk modules and root permissions. `FOSS`
- **[AdClose](https://github.com/Xposed-Modules-Repo/com.close.hook.ads/)** - Blocks ad SDKs. `Proprietary` `[LSP]`
- **[See also](root-management.md)** - another page of the list.

### Play Integrity

- **[MMRL](https://github.com/DerGoogler/MMRL)** - Manage your [modules](https://x.y) repository. `FOSS` `[M]` `[K]` `[A]` | [🌱](https://f-droid.org/packages/com.dergoogler.mmrl) [▶️](https://play.google.com/store/apps/details?id=com.dergoogler.mmrl)
- **[Magisk](https://gitlab.com/other/magisk)** - A second entry with the same name. `FOSS`
"""


class Parse(unittest.TestCase):
    def test_entries_sections_tags_and_stores(self):
        sections = library.parse_category(SAMPLE)
        self.assertEqual([s for s, _ in sections], ["Root Managers", "Root Managers › Play Integrity"])
        magisk, adclose = sections[0][1]
        self.assertEqual(magisk, {"n": "Magisk", "u": "https://github.com/topjohnwu/Magisk", "d": "Manage Magisk modules and root permissions.",
                                  "star": 1, "foss": 1, "gh": "topjohnwu/Magisk"})
        self.assertEqual(adclose["foss"], 0)
        self.assertEqual(adclose["root"], ["lsposed"])
        self.assertEqual(adclose["gh"], "Xposed-Modules-Repo/com.close.hook.ads")
        mmrl = sections[1][1][0]
        self.assertEqual(mmrl["d"], "Manage your modules repository.")
        self.assertEqual(mmrl["root"], ["magisk", "kernelsu", "apatch"])
        self.assertEqual(set(mmrl["stores"]), {"fdroid", "play"})
        self.assertNotIn("gh", sections[1][1][1])

    def test_ids_are_unique(self):
        with tempfile.TemporaryDirectory() as d:
            (Path(d) / "root-management.md").write_text(SAMPLE, encoding="utf-8")
            cats, items = library.build(Path(d))
        self.assertEqual([c["id"] for c in cats], ["root-management"])
        self.assertEqual(cats[0]["count"], 4)
        self.assertEqual([i["id"] for i in items], ["magisk", "adclose", "mmrl", "magisk-2"])
        self.assertEqual(items[2]["s"], 1)


class Enrich(unittest.TestCase):
    def test_stars_and_the_apk_a_person_wants(self):
        items = [{"gh": "a/one"}, {"gh": "b/two"}, {"n": "no github"}]

        def ask(token, query):
            self.assertIn('owner: "a", name: "one"', query)
            return {"data": {
                "r0": {"stargazerCount": 1200, "isArchived": False, "latestRelease": {"tagName": "v2", "publishedAt": "2026-10-01T00:00:00Z",
                       "releaseAssets": {"nodes": [{"name": "app-debug.apk", "size": 9, "downloadUrl": "d"},
                                                   {"name": "app-arm64-v8a-release.apk", "size": 5, "downloadUrl": "good"},
                                                   {"name": "source.zip", "size": 1, "downloadUrl": "z"}]}}},
                "r1": {"stargazerCount": 3, "isArchived": True, "latestRelease": None},
            }}
        self.assertEqual(library.enrich(items, "t", ask=ask), 2)
        self.assertEqual(items[0]["rel"], {"v": "v2", "t": "2026-10-01", "apk": "good", "size": 5})
        self.assertEqual(items[1]["archived"], 1)
        self.assertNotIn("rel", items[1])
        self.assertNotIn("stars", items[2])
        self.assertEqual(items[0]["stars"], 1200)
        self.assertEqual([library.round_stars(n) for n in (7, 99, 1234, 15678)], [7, 99, 1200, 16000])

    def test_a_failed_batch_leaves_the_list(self):
        items = [{"gh": "a/one"}]

        def ask(token, query):
            raise OSError("rate limited")
        self.assertEqual(library.enrich(items, "t", ask=ask), 0)
        self.assertEqual(items, [{"gh": "a/one"}])


class Output(unittest.TestCase):
    def test_too_few_entries_stop_the_build(self):
        with tempfile.TemporaryDirectory() as d:
            (Path(d) / "root-management.md").write_text(SAMPLE, encoding="utf-8")
            with self.assertRaises(SystemExit):
                library.main(["--src", d, "--out", str(Path(d) / "out.json")])


if __name__ == "__main__":
    unittest.main()
