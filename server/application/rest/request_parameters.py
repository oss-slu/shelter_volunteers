def is_true(request_args, param_name):
    return request_args.get(param_name, "").lower() == "true"