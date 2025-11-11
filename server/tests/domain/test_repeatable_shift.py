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
