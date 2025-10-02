"""
This module contains supporting functions for parsing URL parameters
and building request objects for the API.
"""
from request.time_filter import build_time_filter
import re

def is_true(request_args, param_name):
    """
    Check if a parameter in the request arguments is set to "true".
    :param request_args: The request arguments dictionary.
    :param param_name: The name of the parameter to check.
    :return: True if the parameter is set to "true", False otherwise.
    """
    return request_args.get(param_name, "").lower() == "true"

def get_time_filters(request_args):
    """
    Extract time filters from the request arguments.
    :param request_args: The request arguments dictionary.
    :return: A dictionary containing the time filters.
    """
    time_filters = {}
    for arg, values in request_args.items():
        if arg.startswith("filter_"):
            time_filters[re.sub("filter_", "", arg)] = values
    # convert time_filters to TimeFilter object
    return build_time_filter(time_filters)
