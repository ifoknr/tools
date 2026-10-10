import os

import pytest

from ifoknr_bot.storage import Store, StoreError, clean_name, human_size


def test_paths_outside_the_store_are_refused(tmp_path):
    store = Store(tmp_path / "files")
    (tmp_path / "secret.txt").write_text("x")
    for rel in ("..", "../secret.txt", "a/../../secret.txt", "a/../.."):
        with pytest.raises(StoreError) as e:
            store.resolve(rel)
        assert e.value.key == "outside"
    # A leading slash means the store root, not the filesystem root.
    assert store.resolve("/etc") == (tmp_path / "files" / "etc").resolve()


def test_symlinks_out_of_the_store_are_refused(tmp_path):
    store = Store(tmp_path / "files")
    os.symlink(tmp_path, tmp_path / "files" / "escape")
    with pytest.raises(StoreError):
        store.resolve("escape")
    with pytest.raises(StoreError):
        store.resolve("escape/secret.txt")


def test_names_are_cleaned():
    assert clean_name('a<b>:c"d|e?f*g') == "a_b__c_d_e_f_g"
    assert clean_name("  report.pdf  ") == "report.pdf"
    assert clean_name("dir/evil") == "dir_evil"
    long = "x" * 300 + ".zip"
    assert len(clean_name(long)) == 120 and clean_name(long).endswith(".zip")
    for bad in ("", "  ", ".", "..", "..."):
        with pytest.raises(StoreError):
            clean_name(bad)


def test_a_taken_name_gets_a_number(tmp_path):
    store = Store(tmp_path)
    first = store.unique_path("docs", "a.pdf")
    first.write_text("1")
    second = store.unique_path("docs", "a.pdf")
    assert second.name == "a (2).pdf"
    second.write_text("2")
    assert store.unique_path("docs", "a.pdf").name == "a (3).pdf"
    (tmp_path / "docs" / "README").write_text("r")
    assert store.unique_path("docs", "README").name == "README (2)"


def test_listing_puts_folders_first_and_hides_dot_files(tmp_path):
    store = Store(tmp_path)
    (tmp_path / "b.txt").write_text("b")
    (tmp_path / "A.txt").write_text("a")
    (tmp_path / "zdir").mkdir()
    (tmp_path / ".x.part").write_text("partial")
    assert [e.name for e in store.list("")] == ["zdir", "A.txt", "b.txt"]
    assert store.list("")[0].rel == "zdir"


def test_mkdir_delete_and_the_root_is_kept(tmp_path):
    store = Store(tmp_path)
    assert store.mkdir("", "Papers") == "Papers"
    with pytest.raises(StoreError) as e:
        store.mkdir("", "Papers")
    assert e.value.key == "exists"
    (tmp_path / "Papers" / "a.txt").write_text("a")
    store.delete("Papers")
    assert not (tmp_path / "Papers").exists()
    with pytest.raises(StoreError):
        store.delete("")
    with pytest.raises(StoreError) as e:
        store.delete("nothing")
    assert e.value.key == "not_found"


def test_human_size():
    assert human_size(512) == "512 B"
    assert human_size(1536) == "1.5 KB"
    assert human_size(20 * 1024 * 1024) == "20.0 MB"


def test_reserved_names_are_not_handed_out_twice(tmp_path):
    store = Store(tmp_path)
    first = store.reserve("", "a.zip")
    second = store.reserve("", "a.zip")
    assert (first.name, second.name) == ("a.zip", "a (2).zip")
    store.release(first)
    assert store.reserve("", "a.zip").name == "a.zip"
