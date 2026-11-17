"""Insert fictional demo shelters, shifts and volunteer commitments.

Run from server/: python -m scripts.seed_demo_volunteering
The configured MongoDB database is used; existing records are never overwritten.
"""

from datetime import datetime, timedelta, timezone

from bson import ObjectId

from config.mongodb_config import get_db


VOLUNTEER = "felipealencarlopes@gmail.com"
SHELTER_IDS = [
    ObjectId("65f000000000000000000101"),
    ObjectId("65f000000000000000000102"),
]
SHIFT_IDS = [
    ObjectId("65f000000000000000000201"),
    ObjectId("65f000000000000000000202"),
    ObjectId("65f000000000000000000203"),
    ObjectId("65f000000000000000000204"),
    ObjectId("65f000000000000000000205"),
]
COMMITMENT_IDS = [
    ObjectId("65f000000000000000000301"),
    ObjectId("65f000000000000000000302"),
    ObjectId("65f000000000000000000303"),
]


def demo_documents(now):
    """Return MongoDB documents anchored to the seeding date."""
    shelters = [
        {
            "_id": SHELTER_IDS[0],
            "name": "Demo - River Community Shelter",
            "address": {
                "street1": "100 Example Avenue", "city": "St. Louis",
                "state": "MO", "postal_code": "63101", "country": "USA",
                "coordinates": {"latitude": 38.6318, "longitude": -90.1925},
            },
        },
        {
            "_id": SHELTER_IDS[1],
            "name": "Demo - Neighborhood Welcome Center",
            "address": {
                "street1": "200 Example Street", "city": "St. Louis",
                "state": "MO", "postal_code": "63104", "country": "USA",
                "coordinates": {"latitude": 38.6109, "longitude": -90.2087},
            },
        },
    ]
    shifts = []
    for index, (shelter, days, name) in enumerate([
        (0, -30, "Meal service"),
        (1, -14, "Welcome desk"),
        (0, 2, "Evening meal support"),
        (1, 4, "Supply sorting"),
        (0, 7, "Guest welcome"),
    ]):
        start = now + timedelta(days=days)
        shifts.append({
            "_id": SHIFT_IDS[index],
            "shelter_id": str(SHELTER_IDS[shelter]),
            "shift_start": int(start.timestamp() * 1000),
            "shift_end": int((start + timedelta(hours=4)).timestamp() * 1000),
            "shift_name": name,
            "instructions": "Demo data only; this is not a real volunteer opportunity.",
            "required_volunteer_count": 2,
            "max_volunteer_count": 5,
            "can_sign_up": days > 0,
        })
    commitments = [
        {
            "_id": commitment_id,
            "volunteer_id": VOLUNTEER,
            "service_shift_id": str(SHIFT_IDS[shift_index]),
        }
        for commitment_id, shift_index in zip(COMMITMENT_IDS, (0, 1, 2))
    ]
    return {"shelters": shelters, "service_shifts": shifts, "service_commitments": commitments}


def seed(db, now=None):
    """Insert only missing fixture IDs, stopping if an ID belongs to other data."""
    documents = demo_documents(now or datetime.now(timezone.utc))
    for name, items in documents.items():
        for item in items:
            existing = db[name].find_one({"_id": item["_id"]})
            if existing is not None:
                # Dates are intentionally retained on repeat runs.
                identity_fields = {
                    "shelters": ("name",),
                    "service_shifts": ("shelter_id", "shift_name"),
                    "service_commitments": ("volunteer_id", "service_shift_id"),
                }[name]
                if any(existing.get(field) != item[field] for field in identity_fields):
                    fixture_id = item["_id"]
                    raise ValueError(f"Fixture ID conflict in {name}: {fixture_id}")

    counts = {}
    for name, items in documents.items():
        inserted = 0
        for item in items:
            result = db[name].update_one(
                {"_id": item["_id"]}, {"$setOnInsert": item}, upsert=True
            )
            inserted += result.upserted_id is not None
        counts[name] = inserted
    return counts


def main():
    db = get_db()
    counts = seed(db)
    print(f"Seeded database {db.name}: {counts}")
    shelter_ids = ", ".join(str(item) for item in SHELTER_IDS)
    print(f"Demo shelter IDs: {shelter_ids}")
    print("Existing fixtures were not updated; their dates remain as first created.")


if __name__ == "__main__":
    main()
