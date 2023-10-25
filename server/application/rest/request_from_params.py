from requests.work_shift_list import build_work_shift_list_request
def list_shift_request(params):
    qrystr_params = {
        "filters": {},
    }
    for arg, values in params.items():
        print(arg, values)

        if arg.startswith("filter_"):
            qrystr_params["filters"][arg.replace("filter_", "")] = values
    print(qrystr_params)

    # generate a request object
    request_object = build_work_shift_list_request(
        filters=qrystr_params["filters"]
    )
    return request_object;
