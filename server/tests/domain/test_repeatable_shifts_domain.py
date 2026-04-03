"""Domain tests for repeatable shift collection behavior."""

from domains.shelter.schedule.repeatable_shift import RepeatableShift
from domains.shelter.schedule.repeatable_shifts import RepeatableShifts


def test_repeatable_shifts_create_deduplicates_exact_duplicates():
    shift_one = RepeatableShift(
        shift_start=100,
        shift_end=200,
        required_volunteer_count=1,
        max_volunteer_count=3,
        shift_name="Morning",
        instructions="Bring gloves",
        instructions_recurring=True,
        id=None,
    )
    shift_two = RepeatableShift(
        shift_start=100,
        shift_end=200,
        required_volunteer_count=1,
        max_volunteer_count=3,
        shift_name="Morning",
        instructions="Bring gloves",
        instructions_recurring=True,
        id="abc123",
    )

    result = RepeatableShifts.create("shelter_1", [shift_one, shift_two])

    assert result.is_success
    assert len(result.value.shifts) == 1
    # Prefer persisted record when deduping.
    assert result.value.shifts[0].id == "abc123"
