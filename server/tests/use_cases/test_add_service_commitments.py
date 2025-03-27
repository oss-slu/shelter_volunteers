"""
test_add_service_commitments.py: Tests for the add_service_commitments use case.
"""

from use_cases.add_service_commitments import add_service_commitments

if __name__ == "__main__":
    from unittest.mock import Mock

    # valid shift ID (successful case)
    def test_valid_shift_commitment():
        shifts_repo = Mock()
        commitments_repo = Mock()

        valid_shift = Mock()
        valid_shift.get_id.return_value = "mocked-valid-shift-id"
        shifts_repo.get_shifts.return_value = [valid_shift]

        valid_commitment = Mock()
        valid_commitment.service_shift_id = "mocked-valid-shift-id"
        valid_commitment.to_dict.return_value = {}

        commitments_repo.insert_service_commitments.return_value = [
            {"_id": "commitment-id"}
        ]

        result = add_service_commitments(commitments_repo, shifts_repo, (
            [valid_commitment])
        )

        assert result == [{"service_commitment_id": "commitment-id", "success": True}]
        print(f"Valid shift ID -> {result}\n")

    # invalid shift ID (unsuccessful case)
    def test_invalid_shift_commitment():
        shifts_repo = Mock()
        commitments_repo = Mock()

        shifts_repo.get_shifts.return_value = []

        invalid_commitment = Mock()
        invalid_commitment.service_shift_id = "this-id-does-not-exist"
        invalid_commitment.to_dict.return_value = {}

        result = add_service_commitments(commitments_repo, shifts_repo, [invalid_commitment])

        assert result == [{
            "service_commitment_id": None,
            "success": False,
            "message": "cannot commit to non-existing shift this-id-does-not-exist"
        }]

        commitments_repo.insert_service_commitments.assert_not_called()

        print(f"Invalid shift ID -> {result}\n")

    # mixed valid and invalid shift IDs
    def test_mixed_shifts_commitment():
        shifts_repo = Mock()
        commitments_repo = Mock()

        valid_shift = Mock()
        valid_shift.get_id.return_value = "mocked-valid-shift-id"
        shifts_repo.get_shifts.return_value = [valid_shift]

        valid_commitment = Mock()
        valid_commitment.service_shift_id = "mocked-valid-shift-id"
        valid_commitment.to_dict.return_value = {}

        invalid_commitment = Mock()
        invalid_commitment.service_shift_id = "this-id-does-not-exist"
        invalid_commitment.to_dict.return_value = {}

        commitments_repo.insert_service_commitments.return_value = [
            {"_id": "valid-commitment-id"}
        ]

        result = add_service_commitments(commitments_repo, shifts_repo, (
            [valid_commitment, invalid_commitment])
        )

        assert result == [
            {"service_commitment_id": "valid-commitment-id", "success": True},
            {
                "service_commitment_id": None,
                "success": False,
                "message": "cannot commit to non-existing shift this-id-does-not-exist"
            }
        ]

        commitments_repo.insert_service_commitments.assert_called_once()

        print(f"Mixed shifts -> {result}\n")

    # run all tests
    test_valid_shift_commitment()
    test_invalid_shift_commitment()
    test_mixed_shifts_commitment()
