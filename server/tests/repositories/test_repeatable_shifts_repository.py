import pytest

from domains.shelter.schedule.repeatable_shift import RepeatableShift
from domains.shelter.schedule.repeatable_shifts import RepeatableShifts
from repository.mongo.repeatable_shifts_repository import RepeatableShiftsRepository


@pytest.fixture
def repeatable_shifts_repository(mongo_db):
    return RepeatableShiftsRepository(mongo_db)


@pytest.fixture
def repeatable_shifts1():
    return RepeatableShifts(
        shelter_id="1",
        shifts=[
            RepeatableShift(
                shift_start=100,
                shift_end=200,
                shift_name="Test Shift",
                required_volunteer_count=1,
                max_volunteer_count=5
            ),
            RepeatableShift(
                shift_start=200,
                shift_end=400,
                shift_name="Test Shift 2",
                required_volunteer_count=1,
                max_volunteer_count=5
            )
        ]
    )


def assert_equal(shift1, shift2):
    assert shift1.shift_start == shift2.shift_start
    assert shift1.shift_end == shift2.shift_end
    assert shift1.shift_name == shift2.shift_name
    assert shift1.required_volunteer_count == shift2.required_volunteer_count
    assert shift1.max_volunteer_count == shift2.max_volunteer_count


def test_insert_new_shifts(repeatable_shifts_repository, repeatable_shifts1):
    # Act
    result = repeatable_shifts_repository.save(repeatable_shifts1)

    # Assert
    assert result.is_success
    assert result.value.shelter_id == "1"
    assert len(result.value.shifts) == 2
    assert_equal(result.value.shifts[0], repeatable_shifts1.shifts[0])
    assert_equal(result.value.shifts[1], repeatable_shifts1.shifts[1])
    assert result.value.shifts[0].id is not None
    assert result.value.shifts[1].id is not None


def test_query_inserted_shifts(repeatable_shifts_repository, repeatable_shifts1):
    # Act
    repeatable_shifts_repository.save(repeatable_shifts1)
    result = repeatable_shifts_repository.get_all_for_shelter("1")

    # Assert
    assert result.is_success
    assert len(result.value.shifts) == 2
    assert_equal(result.value.shifts[0], repeatable_shifts1.shifts[0])
    assert_equal(result.value.shifts[1], repeatable_shifts1.shifts[1])
    assert result.value.shifts[0].id is not None
    assert result.value.shifts[1].id is not None


def test_partial_upsert(repeatable_shifts_repository, repeatable_shifts1):
    # Arrange
    initial_result = repeatable_shifts_repository.save(repeatable_shifts1)
    original_shift_1_id = initial_result.value.shifts[0].id
    original_shift_2_id = initial_result.value.shifts[1].id

    # Add a third shift to the existing shifts
    new_shift = RepeatableShift(
        shift_start=500,
        shift_end=600,
        shift_name="Test Shift 3",
        required_volunteer_count=2,
        max_volunteer_count=10
    )
    initial_result.value.shifts.append(new_shift)

    # Act
    updated_result = repeatable_shifts_repository.save(initial_result.value)

    # Assert
    assert updated_result.is_success
    assert len(updated_result.value.shifts) == 3

    # First two shifts should keep their original IDs
    assert updated_result.value.shifts[0].id == original_shift_1_id
    assert updated_result.value.shifts[1].id == original_shift_2_id

    # First two shifts should remain unchanged
    assert_equal(updated_result.value.shifts[0], repeatable_shifts1.shifts[0])
    assert_equal(updated_result.value.shifts[1], repeatable_shifts1.shifts[1])

    # Third shift should have a new ID generated
    assert updated_result.value.shifts[2].id is not None
    assert_equal(updated_result.value.shifts[2], new_shift)


def test_delete_shift_on_save(repeatable_shifts_repository, repeatable_shifts1):
    # Arrange
    initial_result = repeatable_shifts_repository.save(repeatable_shifts1)
    original_shift_1_id = initial_result.value.shifts[0].id

    # Remove the second shift
    updated_shifts = RepeatableShifts(
        shelter_id="1",
        shifts=[initial_result.value.shifts[0]]
    )

    # Act
    save_result = repeatable_shifts_repository.save(updated_shifts)
    query_result = repeatable_shifts_repository.get_all_for_shelter("1")

    # Assert
    assert save_result.is_success
    assert len(save_result.value.shifts) == 1

    assert query_result.is_success
    assert len(query_result.value.shifts) == 1

    # The remaining shift should be the first one with the same ID
    assert query_result.value.shifts[0].id == original_shift_1_id
    assert_equal(query_result.value.shifts[0], repeatable_shifts1.shifts[0])
