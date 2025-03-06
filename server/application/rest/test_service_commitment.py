import json
import pytest
from unittest.mock import patch

# If you have a Flask app factory, import it here. For example:
# from server.application.app import create_app

@pytest.fixture
def client():
    """
    Example pytest fixture for creating a test client.
    Adjust this to match how you initialize your Flask/FastAPI app.
    """
    # app = create_app()  # or however you create your app
    # For illustration, pretend we have an 'app':
    from flask import Flask, request, jsonify
    
    app = Flask(__name__)
    
    # Example routes for the sake of demonstration:
    @app.route("/service_commitment", methods=["POST"])
    def add_service_commitment_route():
        """
        This route calls add_service_commitments(...) under the hood.
        We'll be mocking that function in the tests.
        """
        data = request.get_json()
        # Suppose we normally do something like:
        # result = add_service_commitments(data)
        # return jsonify(result), 200
        return jsonify([]), 200
    
    @app.route("/service_commitment", methods=["GET"])
    def list_service_commitment_route():
        """
        This route calls list_service_commitments() under the hood.
        We'll be mocking that in the tests as well.
        """
        # Normally:
        # commitments, shifts = list_service_commitments(...)
        return jsonify([]), 200

    with app.test_client() as test_client:
        yield test_client


@pytest.mark.run(order=1)
@patch("server.application.rest.service_commitments.add_service_commitments")
def test_post_service_commitment(mock_add_service_commitments, client):
    """
    Scenario 1:
      - Mock add_service_commitments to return:
        [
          {
            "service_commitment_id": SOME_ID,
            "success": True
          }
        ]
      - POST to /service_commitment with JSON body and
        "Authorization" & "Content-Type" headers
      - Assert response is 200
      - Assert response JSON matches the mocked data
    """
    # 1) Arrange
    mocked_return = [
        {
            "service_commitment_id": 12345,  # This is your SOME_ID
            "success": True
        }
    ]
    mock_add_service_commitments.return_value = mocked_return

    # The JSON we're sending in the request body:
    request_data = [
        {"service_shift_id": "12345"}
    ]

    # 2) Act
    response = client.post(
        "/service_commitment",
        headers={
            "Authorization": "1234567890-developer-token",
            "Content-Type": "application/json"
        },
        data=json.dumps(request_data)
    )

    # 3) Assert
    assert response.status_code == 200, "Expected a 200 OK from POST /service_commitment"
    assert response.is_json, "Response should be JSON"
    response_json = response.get_json()
    assert response_json == mocked_return, (
        "Response JSON should match mocked add_service_commitments return value"
    )
    # Optionally, assert that mock_add_service_commitments was called with the correct data
    mock_add_service_commitments.assert_called_once_with(request_data)


@pytest.mark.run(order=2)
@patch("server.application.rest.service_commitments.list_service_commitments")
def test_get_service_commitment(mock_list_service_commitments, client):
    """
    Scenario 2:
      - Mock list_service_commitments to return a tuple: (commitments, shifts)
        Where commitments is a list of 2 ServiceCommitment objects
        and shifts is a list of 2 ServiceShift objects
      - GET /service_commitment with appropriate headers
      - Verify 200 status
      - Verify the response JSON contains the 2 ServiceCommitment objects
    """
    # 1) Arrange
    mocked_commitments = [
        {
            "service_commitment_id": 100,
            "service_date": "2025-01-01",
            "description": "Feeding animals"
        },
        {
            "service_commitment_id": 101,
            "service_date": "2025-01-05",
            "description": "Cleaning kennels"
        },
    ]
    mocked_shifts = [
        {
            "service_shift_id": 200,
            "shift_time": "Morning"
        },
        {
            "service_shift_id": 201,
            "shift_time": "Afternoon"
        },
    ]
    
    # Suppose your list_service_commitments returns (commitments, shifts).
    mock_list_service_commitments.return_value = (mocked_commitments, mocked_shifts)

    # 2) Act
    response = client.get(
        "/service_commitment",
        headers={
            "Authorization": "1234567890-developer-token",
            "Content-Type": "application/json"
        }
    )

    # 3) Assert
    assert response.status_code == 200, "Expected a 200 OK from GET /service_commitment"
    assert response.is_json, "Response should be JSON"
    
    response_json = response.get_json()
    
    # Depending on how your endpoint constructs the JSON,
    # you might return something like {"commitments": [...], "shifts": [...]}
    # or you might flatten them. Adjust accordingly. For example:
    #
    #   return jsonify(commitments + shifts), 200
    #
    # Here we assume it might just return the commitments portion.
    # Adjust your assertion to match your actual design.
    
    # If the endpoint just returns the commitments:
    #   e.g. return jsonify(mocked_commitments), 200
    assert response_json == mocked_commitments, (
        "Expected JSON response to match the two mocked ServiceCommitments"
    )
    
    # Or if your endpoint returns an object with two arrays, something like:
    # {
    #   "commitments": [...],
    #   "shifts": [...]
    # }
    #
    # Then you would do something like:
    #
    # assert response_json["commitments"] == mocked_commitments
    # assert response_json["shifts"] == mocked_shifts
    
    # Finally, ensure we actually called the mock once
    mock_list_service_commitments.assert_called_once()

