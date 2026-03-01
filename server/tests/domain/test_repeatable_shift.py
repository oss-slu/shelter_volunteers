"""
Tests return values of the create method.
"""

from domains.shelter.schedule.repeatable_shift import RepeatableShift


def test_shift_end_before_start():
    # Act
    result = RepeatableShift.create(
        shift_start=10,
        shift_end=5,
        required_volunteer_count=1,
        max_volunteer_count=5,
    )

    # Assert
    assert not result.is_success


def test_required_volunteers_greater_than_max():
    # Act
    result = RepeatableShift.create(
        shift_start=5,
        shift_end=10,
        required_volunteer_count=10,
        max_volunteer_count=5,
    )

    # Assert
    assert not result.is_success


def test_required_volunteers_less_than_one():
    # Act
    result = RepeatableShift.create(
        shift_start=5,
        shift_end=10,
        required_volunteer_count=0,
        max_volunteer_count=5,
    )

    # Assert
    assert not result.is_success


def test_multiple_errors():
    # Act
    result = RepeatableShift.create(
        shift_start=10,
        shift_end=5,
        required_volunteer_count=10,
        max_volunteer_count=5,
    )

    # Assert
    assert not result.is_success
    assert len(result.keyed_errors) == 2


def test_valid_shift():
    # Act
    result = RepeatableShift.create(
        shift_start=5,
        shift_end=10,
        required_volunteer_count=2,
        max_volunteer_count=5,
        shift_name="Morning Shift",
    )

    # Assert
    assert result.is_success
    shift = result.value
    assert shift.shift_start == 5
    assert shift.shift_end == 10
    assert shift.required_volunteer_count == 2
    assert shift.max_volunteer_count == 5
    assert shift.shift_name == "Morning Shift"


def test_instructions_trimmed_and_switch_is_stored():
    result = RepeatableShift.create(
        shift_start=5,
        shift_end=10,
        required_volunteer_count=2,
        max_volunteer_count=5,
        instructions="  Bring gloves and a badge  ",
        instructions_recurring=True,
    )

    assert result.is_success
    shift = result.value
    assert shift.instructions == "Bring gloves and a badge"
    assert shift.instructions_recurring is True


def test_instructions_recurring_must_be_boolean():
    result = RepeatableShift.create(
        shift_start=5,
        shift_end=10,
        required_volunteer_count=2,
        max_volunteer_count=5,
        instructions_recurring="yes",
    )

    assert not result.is_success
    assert "instructions_recurring" in result.keyed_errors
