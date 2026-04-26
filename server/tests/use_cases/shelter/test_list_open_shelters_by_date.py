"""
Unit tests for the ``list_open_shelters_by_date`` use case.
"""
from datetime import datetime, timezone
from unittest import mock

from domains.service_shift import ServiceShift
from domains.shelter.shelter import Shelter
from use_cases.shelters.list_open_shelters_by_date import (
    list_open_shelters_by_date,
)


# Fixed "now" used by the tests so date math is deterministic.
# 2026-05-01 00:00:00 UTC in milliseconds.
FIXED_NOW_MS = 1_777_593_600_000


def _shelter(name, shelter_id):
    return Shelter(
        _id=shelter_id,
        name=name,
        address={
            "street1": f"{shelter_id} Main",
            "city": "Anywhere",
            "state": "MA",
            "postal_code": "00000",
        },
    )


def _shift(shelter_id, start_iso_ms, end_iso_ms):
    return ServiceShift(
        _id=f"shift-{shelter_id}-{start_iso_ms}",
        shelter_id=shelter_id,
        shift_start=start_iso_ms,
        shift_end=end_iso_ms,
    )


def _ms(year, month, day, hour=12):
    """Return ms for the given UTC moment without depending on any timezone."""
    return int(
        datetime(year, month, day, hour, tzinfo=timezone.utc).timestamp() * 1000
    )


def test_groups_shelters_by_date_in_descending_order():
    shelter_a = _shelter("Alpha House", "s-a")
    shelter_b = _shelter("Beacon Shelter", "s-b")
    shelter_c = _shelter("Citadel Shelter", "s-c")

    shifts = [
        # Two shifts for shelter A on the same day -> de-duplicated.
        _shift("s-a", _ms(2026, 5, 10, 9), _ms(2026, 5, 10, 12)),
        _shift("s-a", _ms(2026, 5, 10, 14), _ms(2026, 5, 10, 17)),
        # Shelter B on the same day.
        _shift("s-b", _ms(2026, 5, 10, 18), _ms(2026, 5, 10, 21)),
        # Shelter C on a later day -> should appear first.
        _shift("s-c", _ms(2026, 5, 20, 8), _ms(2026, 5, 20, 11)),
        # Shelter A on an earlier day -> should appear last.
        _shift("s-a", _ms(2026, 5, 5, 8), _ms(2026, 5, 5, 11)),
    ]

    shelter_repo = mock.Mock()
    shelter_repo.list.return_value = [shelter_a, shelter_b, shelter_c]
    shifts_repo = mock.Mock()
    shifts_repo.list.return_value = shifts

    result = list_open_shelters_by_date(
        shelter_repo,
        shifts_repo,
        now_provider=lambda: FIXED_NOW_MS,
    )

    # Latest date first.
    assert [entry["date"] for entry in result] == [
        "2026-05-20",
        "2026-05-10",
        "2026-05-05",
    ]
    assert [s.name for s in result[0]["shelters"]] == ["Citadel Shelter"]
    # Same-day shelters are alphabetically sorted and de-duplicated.
    assert [s.name for s in result[1]["shelters"]] == [
        "Alpha House",
        "Beacon Shelter",
    ]
    assert [s.name for s in result[2]["shelters"]] == ["Alpha House"]

    # The use case must filter by "now" by default.
    shifts_repo.list.assert_called_once_with(
        shelter_id=None, filter_start_after=FIXED_NOW_MS
    )


def test_uses_explicit_filter_start_after_when_provided():
    shelter_repo = mock.Mock()
    shelter_repo.list.return_value = []
    shifts_repo = mock.Mock()
    shifts_repo.list.return_value = []

    list_open_shelters_by_date(
        shelter_repo,
        shifts_repo,
        filter_start_after="123456",
        now_provider=lambda: FIXED_NOW_MS,
    )

    shifts_repo.list.assert_called_once_with(
        shelter_id=None, filter_start_after=123456
    )


def test_skips_shifts_whose_shelter_no_longer_exists():
    shelter_a = _shelter("Alpha House", "s-a")
    shifts = [
        _shift("s-a", _ms(2026, 6, 1, 9), _ms(2026, 6, 1, 12)),
        # Orphan shift referencing a deleted shelter.
        _shift("s-deleted", _ms(2026, 6, 2, 9), _ms(2026, 6, 2, 12)),
    ]

    shelter_repo = mock.Mock()
    shelter_repo.list.return_value = [shelter_a]
    shifts_repo = mock.Mock()
    shifts_repo.list.return_value = shifts

    result = list_open_shelters_by_date(
        shelter_repo,
        shifts_repo,
        now_provider=lambda: FIXED_NOW_MS,
    )

    assert [entry["date"] for entry in result] == ["2026-06-01"]
    assert [s.name for s in result[0]["shelters"]] == ["Alpha House"]


def test_tz_offset_buckets_shifts_by_local_day():
    """A shift starting at 02:00 UTC on May 10 falls on May 9 in EST (UTC-5),
    so a tz_offset_minutes=300 (EST) caller should see it grouped under
    2026-05-09."""
    shelter_a = _shelter("Alpha House", "s-a")
    shifts = [_shift("s-a", _ms(2026, 5, 10, 2), _ms(2026, 5, 10, 5))]

    shelter_repo = mock.Mock()
    shelter_repo.list.return_value = [shelter_a]
    shifts_repo = mock.Mock()
    shifts_repo.list.return_value = shifts

    utc_result = list_open_shelters_by_date(
        shelter_repo,
        shifts_repo,
        now_provider=lambda: FIXED_NOW_MS,
    )
    est_result = list_open_shelters_by_date(
        shelter_repo,
        shifts_repo,
        tz_offset_minutes=300,
        now_provider=lambda: FIXED_NOW_MS,
    )

    assert utc_result[0]["date"] == "2026-05-10"
    assert est_result[0]["date"] == "2026-05-09"


def test_returns_empty_list_when_no_upcoming_shifts():
    shelter_repo = mock.Mock()
    shelter_repo.list.return_value = [_shelter("Alpha House", "s-a")]
    shifts_repo = mock.Mock()
    shifts_repo.list.return_value = []

    result = list_open_shelters_by_date(
        shelter_repo,
        shifts_repo,
        now_provider=lambda: FIXED_NOW_MS,
    )

    assert result == []
