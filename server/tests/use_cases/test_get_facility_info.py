import json
from unittest import TestCase, mock
from urllib import request, error
from unittest.mock import MagicMock
from use_cases.get_facility_info import get_facility_info_use_case
from responses import ResponseSuccess, ResponseFailure, ResponseTypes

class TestGetFacilityInfoUseCase(TestCase):

    @mock.patch('use_cases.get_facility_info.request.urlopen')
    def test_get_facility_info_success(self, mock_urlopen):
        facility_id = 'some-facility-id'
        facility_info = {'name': 'Test name', 'city': 'Chicago'}
        mock_http_response = MagicMock()
        mock_http_response.__enter__.return_value = mock_http_response
        mock_http_response.status = 200
        mock_http_response.read.return_value = json.dumps(facility_info).encode('utf-8')
        mock_urlopen.return_value = mock_http_response
        response = get_facility_info_use_case(facility_id)
        self.assertIsInstance(response, ResponseSuccess)

    @mock.patch('use_cases.get_facility_info.request.urlopen')
    def test_get_facility_info_system_error(self, mock_urlopen):
        facility_id = 'some-facility-id'
        mock_urlopen.side_effect = error.URLError('Mocked URLError')
        response = get_facility_info_use_case(facility_id)
        self.assertIsInstance(response, ResponseFailure)
        self.assertEqual(response.value['type'], ResponseTypes.SYSTEM_ERROR) 

    @mock.patch('use_cases.get_facility_info.request.urlopen')
    def test_get_facility_info_failure(self, mock_urlopen):
        facility_id = 'some-facility-id'
        mock_http_response = mock.MagicMock()
        mock_http_response.__enter__.return_value = mock_http_response
        mock_http_response.status = 404
        mock_http_response.read.return_value = b''
        mock_urlopen.return_value = mock_http_response
        response = get_facility_info_use_case(facility_id)
        self.assertIsInstance(response, ResponseFailure)
        self.assertEqual(response.response_type, ResponseTypes.NOT_FOUND)
        self.assertEqual(response.value, {"type": ResponseTypes.NOT_FOUND,
                                          "message": 'Facility info could not be retrieved'})