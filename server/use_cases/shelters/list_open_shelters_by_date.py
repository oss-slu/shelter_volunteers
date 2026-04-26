"""
Use case for listing shelters that have at least one upcoming shift,
grouped by the calendar date the shift starts on, in descending date order.

The grouping is done at the application level (not in the database) because
shift_start is stored as a millisecond Unix epoch and the desired grouping
is by calendar date, optionally shifted by a client-supplied timezone offset.
"""
import time
from datetime import datetime, timezone


def _coerce_optional_int(value, *, default=None, minimum=None, maximum=None):
    """Convert a value to int with optional bounds. Returns ``default`` if
    the value is ``None`` or cannot be parsed."""
    if value is None:
        return default
    try:
        coerced = int(value)
    except (TypeError, ValueError):
        return default
    if minimum is not None and coerced < minimum:
        return default
    if maximum is not None and coerced > maximum:
        return default
    return coerced


def _format_date_key(timestamp_ms, tz_offset_minutes):
    """Return a YYYY-MM-DD key for the given UTC ms timestamp, shifted by
    ``tz_offset_minutes`` minutes WEST of UTC (matching the convention of
    JavaScript's ``Date.prototype.getTimezoneOffset``)."""
    shifted_seconds = (timestamp_ms / 1000.0) - (tz_offset_minutes * 60)
    return datetime.fromtimestamp(shifted_seconds, tz=timezone.utc).strftime(
        "%Y-%m-%d"
    )


def list_open_shelters_by_date(
    shelter_repo,
    shifts_repo,
    filter_start_after=None,
    tz_offset_minutes=0,
    now_provider=None,
):
    """Return shelters with upcoming shifts grouped by date in descending order.

    Args:
        shelter_repo: Repository exposing ``list()`` returning Shelter objects.
        shifts_repo: Repository exposing ``list(shelter_id, filter_start_after)``
            returning ServiceShift objects.
        filter_start_after: Optional epoch milliseconds. Only shifts starting
            strictly after this value are considered. Defaults to "now" so the
            response always represents upcoming activity.
        tz_offset_minutes: Optional integer offset in minutes WEST of UTC, used
            to bucket shifts by the admin's local calendar day. Defaults to 0
            (UTC). Same convention as ``Date.prototype.getTimezoneOffset`` in
            the browser, so the frontend can pass that value directly.
        now_provider: Optional zero-arg callable returning the current epoch
            milliseconds. Injected for deterministic testing.

    Returns:
        list[dict]: ``[{"date": "YYYY-MM-DD", "shelters": [Shelter, ...]}, ...]``
        with the latest date first. Each shelter appears at most once per date,
        sorted alphabetically by name within a date.
    """
    tz_offset_minutes = _coerce_optional_int(
        tz_offset_minutes, default=0, minimum=-14 * 60, maximum=14 * 60
    )

    now_ms = (now_provider or (lambda: int(time.time() * 1000)))()
    effective_start_after = _coerce_optional_int(
        filter_start_after, default=now_ms, minimum=0
    )

    upcoming_shifts = shifts_repo.list(
        shelter_id=None, filter_start_after=effective_start_after
    )
    shelters = shelter_repo.list()

    shelter_map = {str(shelter.get_id()): shelter for shelter in shelters}

    # Map of date_key -> { shelter_id: Shelter } so we de-duplicate per day.
    grouped = {}
    for shift in upcoming_shifts:
        shelter = shelter_map.get(str(shift.shelter_id))
        if shelter is None:
            continue
        date_key = _format_date_key(shift.shift_start, tz_offset_minutes)
        bucket = grouped.setdefault(date_key, {})
        shelter_id = str(shelter.get_id())
        if shelter_id not in bucket:
            bucket[shelter_id] = shelter

    sorted_dates = sorted(grouped.keys(), reverse=True)
    return [
        {
            "date": date_key,
            "shelters": sorted(
                grouped[date_key].values(),
                key=lambda s: (s.name or "").lower(),
            ),
        }
        for date_key in sorted_dates
    ]
