from urllib import request, error
from responses import ResponseFailure, ResponseSuccess, ResponseTypes
import json

def get_facility_info_use_case(facility_id):
    try:
        url = f"https://api2-qa.gethelp.com/v2/facilities/{facility_id}"
        with request.urlopen(url) as response:
            if response.status == 200:
                data = json.loads(response.read().decode())
                return ResponseSuccess(data)
            else:
                return ResponseFailure(ResponseTypes.NOT_FOUND, 'Facility info could not be retrieved')
    except error.URLError as e:
        return ResponseFailure(ResponseTypes.SYSTEM_ERROR, str(e))

