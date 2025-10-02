"""
Use cases for listing service commitments and their shifts.

`completed_only` (default False):
  When True, include only shifts that have an end time not in the future.
The helpers work with shift dicts (used in tests) and objects that expose:
  .get_id(), .shift_start, .shift_end M
"""
from datetime import datetime


def list_service_commitments(commitments_repo, user_email=None, shift_id=None):
    """Return raw commitments from the repository."""
    commitments = commitments_repo.fetch_service_commitments(user_email, shift_id)
    return commitments

def _shift_id(shift):
    """Return a shift id from either an object or a dict."""
    method = getattr(shift, "get_id", None)
    if callable(method):
        return method()
    if isinstance(shift, dict):
        return shift.get("shift_id") or shift.get("_id") or shift.get("id")
    return getattr(shift, "id", None)


def _shift_end(shift):
    """Return a shift end datetime from either an object or a dict."""
    if isinstance(shift, dict):
        return shift.get("shift_end") or shift.get("end_time")
    return getattr(shift, "shift_end", None)


def _filter_start_after(shift, value):
    start = getattr(shift, "shift_start", None)
    return (start is not None) and (start >= value)


def _filter_start_before(shift, value):
    start = getattr(shift, "shift_start", None)
    return (start is not None) and (start < value)


def list_service_commitments_with_shifts(
    commitments_repo,
    shifts_repo,
    time_filter,
    user_email=None,
    shift_id=None,
    *,
    completed_only: bool = False,
):
    """
    Retrieve service commitments and their shifts, with optional filters.

    Args:
        commitments_repo: repository containing service commitments
        shifts_repo: repository containing service shifts
        time_filter: exposes get_filter('start_after' | 'start_before')
        user_email: optional user email to filter by
        shift_id: optional shift id to filter by
        completed_only: include only shifts with an end time <= now
    Returns:
        (commitments, shifts)
    """
    commitments = list_service_commitments(commitments_repo, user_email, shift_id)
    shift_ids = [c.service_shift_id for c in commitments]
    shifts = shifts_repo.get_shifts(shift_ids)

    if completed_only:
        now = datetime.utcnow()
        completed_ids = {
            _shift_id(s)
            for s in shifts
            if (_shift_end(s) is not None) and (_shift_end(s) <= now)
        }
        if completed_ids:
            commitments = [c for c in commitments if c.service_shift_id in completed_ids]
            shifts = [s for s in shifts if _shift_id(s) in completed_ids]
        else:
            # Nothing completed: return aligned empties
            return ([], [])

    for filter_key, comparison in [
        ("start_after", _filter_start_after),
        ("start_before", _filter_start_before),
    ]:
        filter_value = time_filter.get_filter(filter_key)
        if filter_value:
            filtered_ids = {_shift_id(s) for s in shifts if comparison(s, filter_value)}
            commitments = [c for c in commitments if c.service_shift_id in filtered_ids]
            shifts = [s for s in shifts if _shift_id(s) in filtered_ids]

    return (commitments, shifts)
