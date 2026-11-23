"""Tests for the mock St. Louis shelter seed script."""
from types import SimpleNamespace

from scripts.seed_stl_shelters import load_mock_shelters, remove, seed


class FakeCollection:
    """Minimal stand-in for a pymongo collection keyed by shelter name."""

    def __init__(self):
        self.docs = {}

    def update_one(self, query, update, upsert=False):
        name = query["name"]
        new_doc = update["$set"]
        if name not in self.docs:
            assert upsert
            self.docs[name] = dict(new_doc)
            return SimpleNamespace(upserted_id=name, modified_count=0)
        changed = self.docs[name] != new_doc
        self.docs[name] = dict(new_doc)
        return SimpleNamespace(upserted_id=None, modified_count=int(changed))

    def delete_many(self, query):
        names = query["name"]["$in"]
        deleted = [n for n in names if self.docs.pop(n, None) is not None]
        return SimpleNamespace(deleted_count=len(deleted))


def test_mock_shelters_are_valid_and_in_st_louis_area():
    shelters = load_mock_shelters()
    assert len(shelters) >= 10
    assert len({s["name"] for s in shelters}) == len(shelters)
    for shelter in shelters:
        assert "_id" not in shelter
        coords = shelter["address"]["coordinates"]
        # Rough bounding box around the St. Louis metro area.
        assert 38.4 < coords["latitude"] < 38.9
        assert -90.6 < coords["longitude"] < -90.0


def test_seed_is_idempotent_and_remove_cleans_up():
    shelters = load_mock_shelters()
    collection = FakeCollection()

    assert seed(collection, shelters) == (len(shelters), 0)
    assert seed(collection, shelters) == (0, 0)
    assert len(collection.docs) == len(shelters)

    collection.docs["Unrelated Shelter"] = {"name": "Unrelated Shelter"}
    assert remove(collection, shelters) == len(shelters)
    assert list(collection.docs) == ["Unrelated Shelter"]
