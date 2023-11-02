import requests
from responses import ResponseFailure, ResponseSuccess

def get_facility_info_use_case(facility_id):
    try:
        response = requests.get(f"https://api2-qa.gethelp.com/v2/facilities/{facility_id}")
        if response.status_code == 200:
            return ResponseSuccess(response.json())
        else:
            return ResponseFailure(response.json())
    except requests.RequestException as e:
        return ResponseFailure(str(e))