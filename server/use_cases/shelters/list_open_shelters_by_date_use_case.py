"""Build a grouped list of open shelters by date."""

import json
from datetime import datetime, timezone

from serializers.shelter import ShelterJsonEncoder


def _date_key_from_timestamp(timestamp_ms):
    shift_datetime = datetime.fromtimestamp(timestamp_ms / 1000, tz=timezone.utc)
    return shift_datetime.strftime("%Y-%m-%d")


def _serialize_shelter(shelter):
    return json.loads(json.dumps(shelter, cls=ShelterJsonEncoder))


def list_open_shelters_by_date_use_case(shelters, service_shifts):
    """Group open shelters by UTC date in descending order.

    The response excludes shift-level details and includes each shelter
    at most once per date.
    """
    shelters_by_id = {str(shelter.get_id()): shelter for shelter in shelters}
    grouped_shelters = {}

    for shift in service_shifts:
        shelter_id = str(shift.shelter_id)
        shelter = shelters_by_id.get(shelter_id)
        if shelter is None:
            continue

        date_key = _date_key_from_timestamp(shift.shift_start)
        if date_key not in grouped_shelters:
            grouped_shelters[date_key] = {}

        grouped_shelters[date_key][shelter_id] = _serialize_shelter(shelter)

    grouped_list = []
    for date_key in sorted(grouped_shelters.keys(), reverse=True):
        shelters_for_date = sorted(
            grouped_shelters[date_key].values(),
            key=lambda shelter: shelter.get("name", ""),
        )
        grouped_list.append({
            "date": date_key,
            "shelters": shelters_for_date,
        })

    return grouped_list
