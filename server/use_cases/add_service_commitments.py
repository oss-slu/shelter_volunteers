"""
Module for handling service commitments.
Provides functions to create and retrieve service commitments for users.
"""

def add_service_commitments(commitments_repo, shifts_repo, commitments):
    """
    Creates service commitments for the given user and shifts.

    Args:
        commitments_repo: A repository object that stores 
                        all service commitments
        shifts_repo: A repository object that stores all
                     service shifts
        commitments: A list of ServiceCommitment objects to be added

    Returns:
        list: A list of dictionaries indicating
        the success and service commitment IDs.
    """
    shift_ids = [c.service_shift_id for c in commitments]
    existing_shifts = {s.get_id(): s for s in shifts_repo.get_shifts(shift_ids)}

    valid_commitments = []
    results = []

    for commitment in commitments:
        shift_id = commitment.service_shift_id
        if shift_id not in existing_shifts:
            results.append({
                "service_commitment_id": None,
                "success": False,
                "message": f"cannot commit to non-existing shift {shift_id}"
            })
            continue
        valid_commitments.append(commitment)
        results.append(None) # placeholder to fill

    if not valid_commitments:
        return [r for r in results if r is not None]

    # check for time overlap in valid shift only
    valid_shifts = [existing_shifts[c.service_shift_id] for
        c in valid_commitments]

    if check_time_overlap(valid_shifts):
        return [{
            "service_commitment_id": None,
            "success": False
        }]

    # insert valid commitments
    commitments_as_dict = [c.to_dict() for c in valid_commitments]
    commitments_repo.insert_service_commitments(commitments_as_dict)

    # fill in success results for valid commitments
    idx = 0
    for i in range(len(results)):
        if results[i] is None:
            results[i] = {
                "service_commitment_id": str(commitments_as_dict[idx]["_id"]),
                "success": True
            }
            idx += 1

    return results

def check_time_overlap(shifts):
    """
    Check if the shifts have overlapping times.
    """
    for i in range(len(shifts)):
        for j in range(i + 1, len(shifts)):
            if (shifts[i].shift_start < shifts[j].shift_end and
                shifts[i].shift_end > shifts[j].shift_start):
                return True
    return False

# test cases
if __name__ == "__main__":
    from unittest.mock import Mock

    # valid shift ID (successful case)
    def test_valid_shift_commitment():
        shifts_repo = Mock()
        commitments_repo = Mock()

        valid_shift = Mock()
        valid_shift.get_id.return_value = (
            "mocked-valid-shift-id"
        )
        shifts_repo.get_shifts.return_value = [valid_shift]

        valid_commitment = Mock()
        valid_commitment.service_shift_id = "mocked-valid-shift-id"

        valid_commitment.to_dict.return_value = (
            {"_id": "commitment-id"}
        )

        result = add_service_commitments(commitments_repo, shifts_repo, (
            [valid_commitment])
        )

        assert result[0]["success"] is True
        assert result[0]["service_commitment_id"] == "commitment-id"
        print(f"Valid shift ID -> {result}\n")

    # invalid shift ID (unsuccessful case)
    def test_invalid_shift_commitment():
        shifts_repo = Mock()
        commitments_repo = Mock()

        shifts_repo.get_shifts.return_value = []

        invalid_commitment = Mock()
        invalid_commitment.service_shift_id = "this-id-does-not-exist"

        invalid_commitment.to_dict.return_value = (
            {"_id": "commitment-id"}
        )
        result = add_service_commitments(commitments_repo, shifts_repo, (
            [invalid_commitment])
        )

        assert result[0]["success"] is False
        assert result[0]["message"] == (
            "cannot commit to non-existing shift this-id-does-not-exist"
        )
        print(f"Invalid shift ID -> {result}\n")

    # mixed valid and invalid shift IDs
    def test_mixed_shifts_commitment():
        shifts_repo = Mock()
        commitments_repo = Mock()

        valid_shift = Mock()
        valid_shift.get_id.return_value = (
            "mocked-valid-shift-id"
        )
        shifts_repo.get_shifts.return_value = [valid_shift]

        valid_commitment = Mock()
        valid_commitment.service_shift_id = (
            "mocked-valid-shift-id"
        )
        invalid_commitment = Mock()
        invalid_commitment.service_shift_id = (
            "this-id-does-not-exist"
        )
        valid_commitment.to_dict.return_value = (
            {"_id": "valid-commitment-id"}
        )
        invalid_commitment.to_dict.return_value = (
            {"_id": "invalid-commitment-id"}
        )

        result = add_service_commitments(commitments_repo, shifts_repo, (
            [valid_commitment, invalid_commitment])
        )

        assert result[0]["success"] is True
        assert result[0]["service_commitment_id"] == "valid-commitment-id"
        assert result[1]["success"] is False
        assert result[1]["message"] == (
            "cannot commit to non-existing shift this-id-does-not-exist"
        )
        print(f"Mixed shifts -> {result}\n")

    # run all tests
    test_valid_shift_commitment()
    test_invalid_shift_commitment()
    test_mixed_shifts_commitment()
