"""
This module contains supporting functions for parsing URL parameters
"""
def is_true(request_args, param_name):
    """
    Check if a parameter in the request arguments is set to "true".
    :param request_args: The request arguments dictionary.
    :param param_name: The name of the parameter to check.
    :return: True if the parameter is set to "true", False otherwise.
    """
    return request_args.get(param_name, "").lower() == "true"
