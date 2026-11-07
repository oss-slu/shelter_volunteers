"""
Seed the shelters collection with mock St. Louis-area shelters.

The shelters are fictional (made-up names on real streets) and exist so the
landing page map and the volunteer flows have realistic data to show in
development and demos. The script is idempotent: each shelter is upserted by
name, so running it again does not create duplicates.

Usage (from server/):

    python scripts/seed_stl_shelters.py            # insert / update mocks
    python scripts/seed_stl_shelters.py --remove   # delete the mocks again

The database is chosen the same way as the Flask app (FLASK_ENV + .env files).
"""

import argparse
import json
import sys
from pathlib import Path

_SERVER_DIR = Path(__file__).resolve().parent.parent
if str(_SERVER_DIR) not in sys.path:
    sys.path.insert(0, str(_SERVER_DIR))

# pylint: disable=wrong-import-position
from config.mongodb_config import get_db
from domains.shelter.shelter import Shelter

DATA_FILE = Path(__file__).resolve().parent / "data" / "stl_mock_shelters.json"


def load_mock_shelters():
    """Load and validate the mock shelters, returning them as dicts."""
    with DATA_FILE.open(encoding="utf-8") as handle:
        raw = json.load(handle)
    shelters = []
    for item in raw:
        shelter = Shelter.from_dict(item).to_dict()
        shelter.pop("_id", None)
        shelters.append(shelter)
    return shelters


def seed(collection, shelters):
    """Upsert each shelter by name. Returns (inserted, updated) counts."""
    inserted = updated = 0
    for shelter in shelters:
        result = collection.update_one(
            {"name": shelter["name"]}, {"$set": shelter}, upsert=True
        )
        if result.upserted_id is not None:
            inserted += 1
        elif result.modified_count:
            updated += 1
    return inserted, updated


def remove(collection, shelters):
    """Delete the mock shelters by name. Returns the deleted count."""
    names = [shelter["name"] for shelter in shelters]
    return collection.delete_many({"name": {"$in": names}}).deleted_count


def main():
    parser = argparse.ArgumentParser(description=__doc__.split("\n\n", maxsplit=1)[0])
    parser.add_argument(
        "--remove",
        action="store_true",
        help="Delete the mock St. Louis shelters instead of seeding them.",
    )
    args = parser.parse_args()

    shelters = load_mock_shelters()
    collection = get_db().shelters

    if args.remove:
        deleted = remove(collection, shelters)
        print(f"Removed {deleted} mock St. Louis shelter(s).")
        return

    inserted, updated = seed(collection, shelters)
    unchanged = len(shelters) - inserted - updated
    print(
        f"Mock St. Louis shelters: {inserted} inserted, {updated} updated, "
        f"{unchanged} unchanged."
    )


if __name__ == "__main__":
    main()
