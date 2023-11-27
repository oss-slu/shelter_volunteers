"""
This module contains the use case for get facility information.
"""
import os

from urllib import request, error
from responses import ResponseFailure, ResponseSuccess, ResponseTypes
import json

def get_facility_info_use_case(facility_id):
    try:
        gethelp_api = os.environ["GETHELP_API"]
        url = gethelp_api + f"v2/facilities/{facility_id}"
        with request.urlopen(url) as response:
            if response.status == 200:
                data = json.loads(response.read().decode())
                return ResponseSuccess(data)
            else:
                return ResponseFailure(ResponseTypes.NOT_FOUND,
                                    "Facility info could not be retrieved")
    except error.URLError as e:
        return ResponseFailure(ResponseTypes.SYSTEM_ERROR, str(e))

