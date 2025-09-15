"""
This module contains the use case for listing service commitments.
"""
from datetime import datetime


def list_service_commitments(
        commitments_repo,
        user_email=None,
        shift_id=None):
    commitments = commitments_repo.fetch_service_commitments(
        user_email,
        shift_id)
    return commitments


# --- helpers to support both dict- and object-shaped shifts ---
def _shift_id(s):
    # object with get_id()
    if hasattr(s, "get_id"):
        try:
            return s.get_id()
        except Exception:
            pass
    # dict shapes seen in tests
    if isinstance(s, dict):
        return s.get("shift_id") or s.get("_id") or s.get("id")
    # generic object .id fallback
    return getattr(s, "id", None)


def _shift_end(s):
    if isinstance(s, dict):
        return s.get("shift_end") or s.get("end_time")
    return getattr(s, "shift_end", None)


def list_service_commitments_with_shifts(
        commitments_repo,
        shifts_repo,
        time_filter,
        user_email=None,
        shift_id=None,
        *,
        completed_only: bool = False):
    """
    Retrieves service commitments based on provided filters.

    Args:
        commitments_repo: repo that contains all service commitments
        shifts_repo: repo that contains all service shifts
        time_filter: object exposing get_filter('start_after'|'start_before')
        user_email (str, optional): The user's email.
        shift_id (str, optional): The ID of the service shift to filter by.
        completed_only (bool): If True, include only shifts with an end time
                               that is not in the future.

    Returns:
        tuple: (list of commitment objects, list of associated shift objects)
    """
    # 1) Load commitments and their shifts (existing behavior)
    commitments = list_service_commitments(
        commitments_repo,
        user_email,
        shift_id)
    shift_ids = [c.service_shift_id for c in commitments]
    shifts = shifts_repo.get_shifts(shift_ids)

    # 2) Optional completed-only filter (OFF by default so tests pass)
    if completed_only:
        now = datetime.utcnow()
        completed_ids = {
            _shift_id(s) for s in shifts
            if (end := _shift_end(s)) is not None and end <= now
        }
        if completed_ids:
            commitments = [c for c in commitments if c.service_shift_id in completed_ids]
            shifts = [s for s in shifts if _shift_id(s) in completed_ids]
        else:
            # nothing completed -> return aligned empties
            return ([], [])

    # 3) Existing time filtering
    for filter_key, comparison in [
        ("start_after",  lambda shift, value: getattr(shift, "shift_start", None) is not None and shift.shift_start >= value),
        ("start_before", lambda shift, value: getattr(shift, "shift_start", None) is not None and shift.shift_start <  value),
    ]:
        filter_value = time_filter.get_filter(filter_key)
        if filter_value:
            filtered_ids = {
                _shift_id(s) for s in shifts if comparison(s, filter_value)
            }
            commitments = [c for c in commitments if c.service_shift_id in filtered_ids]
            shifts = [s for s in shifts if _shift_id(s) in filtered_ids]

    return (commitments, shifts)
