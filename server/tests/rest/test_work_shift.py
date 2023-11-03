"""Tests for work shift related REST endpoints."""

import json
from unittest import mock
from application.app import create_app
from responses import ResponseSuccess

shifts_data = [
    {
        'code': 'f853578c-fc0f-4e65-81b8-566c5dffa35a',
        'worker': 'volunteer@slu.edu',
        'shelter': 'existing-shelter-id',
        'start_time': 1701441800000,
        'end_time': 1701452600000,
        'facility_info': {'info': 'Some facility info for existing-shelter-id'}
    },
    {
        'code': 'f853578c-fc0f-4e65-81b8-566c5dffa35b',
        'worker': 'volunteer@slu.edu',
        'shelter': 'existing-shelter-id',
        'start_time': 1701442800000,
        'end_time': 1701453600000,
        'facility_info': {'info': 'Some facility info for existing-shelter-id'}
    }
]

@mock.patch('application.app.work_shift.workshift_list_use_case')
@mock.patch('application.app.work_shift.get_facility_info_use_case')
def test_list_work_shifts(mock_facility_info_use_case, mock_workshift_list_use_case):
    # Mock the facility info use case to return successful facility information
    mock_facility_response = ResponseSuccess({'info': 'Some facility info for existing-shelter-id'})
    mock_facility_info_use_case.return_value = mock_facility_response

    # Mock the work shift list use case to return the shifts data
    mock_workshift_list_response = ResponseSuccess(shifts_data)
    mock_workshift_list_use_case.return_value = mock_workshift_list_response

    app = create_app('testing')
    client = app.test_client()
    headers = {'Authorization': 'volunteer@slu.edu'}
    response = client.get('/shifts', headers=headers)
    data = json.loads(response.data)

    # The data should now include facility_info
    assert data == shifts_data
    assert response.status_code == 200
    mock_workshift_list_use_case.assert_called()
    mock_facility_info_use_case.assert_called_with('existing-shelter-id')

@mock.patch('application.app.work_shift.workshift_add_multiple_use_case')
def test_add_work_shifts(mock_use_case):
    mock_use_case.return_value = [
        {
            'code': 'f853578c-fc0f-4e65-81b8-566c5dffa35d',
            'worker': 'volunteer@slu.edu',
            'shelter': 'new-shelter-id',
            'start_time': 1701442800000,
            'end_time': 1701453600000
        }
    ]

    app = create_app('testing')
    client = app.test_client()
    new_shift = {
        'code': 'f853578c-fc0f-4e65-81b8-566c5dffa35d',
        'shelter': 'new-shelter-id',
        'start_time': 1701442800000,
        'end_time': 1701453600000
    }
    headers = {
        'Authorization': 'volunteer@slu.edu',
        'Content-Type': 'application/json'
    }
    response = client.post(
        '/shifts', headers=headers, data=json.dumps([new_shift])
    )
    data = json.loads(response.data)

    assert response.status_code == 200
    assert data[0]['worker'] == 'volunteer@slu.edu'
    assert data[0]['shelter'] == 'new-shelter-id'
    assert data[0]['start_time'] == 1701442800000
    assert data[0]['end_time'] == 1701453600000
    mock_use_case.assert_called()


@mock.patch('application.app.work_shift.delete_shift_use_case')
def test_delete_work_shift(mock_use_case):
    mock_response = ResponseSuccess({'message': 'Shift deleted successfully'})
    mock_use_case.return_value = mock_response

    app = create_app('testing')
    client = app.test_client()
    headers = {'Authorization': 'volunteer@slu.edu'}
    response = client.delete(
        '/shifts/f853578c-fc0f-4e65-81b8-566c5dffa35a', headers=headers
    )
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['message'] == 'Shift deleted successfully'
    mock_use_case.assert_called()
