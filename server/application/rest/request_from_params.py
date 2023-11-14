"""
This module contains functions to build request objects based
on parameters passed along with the http request
"""

from requests.work_shift_list import build_work_shift_list_request
def list_shift_request(params):
    """
    Creates a WorkShiftList request object (either valid or invalid)
    based on the parameters passed along with the request
    Valid parameters start with filter_
    """
    qrystr_params = {
        "filters": {},
    }
    for arg, values in params.items():
        if arg.startswith("filter_"):
            qrystr_params["filters"][arg.replace("filter_", "")] = values

    # generate a request object
    request_object = build_work_shift_list_request(
        filters=qrystr_params["filters"]
    )
    return request_object
