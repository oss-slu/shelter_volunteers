"""
Use case: list a volunteer's waitlist entries with shift details.
"""


def list_user_waitlist_with_shifts(waitlist_repo, shifts_repo, volunteer_id: str):
    """
    Return (entries, shifts, position_by_shift) for a volunteer.

    - entries: WaitlistEntry objects belonging to the volunteer
    - shifts: ServiceShift objects in the same order as entries
    - position_by_shift: dict mapping shift_id -> 1-indexed position in queue
    """
    entries = waitlist_repo.list_for_user(volunteer_id) or []
    if not entries:
        return [], [], {}

    shift_ids = [e.service_shift_id for e in entries]
    shifts = shifts_repo.get_shifts(shift_ids) if shift_ids else []
    shifts_by_id = {str(s.get_id()): s for s in shifts}

    aligned_shifts = []
    aligned_entries = []
    position_by_shift = {}

    for entry in entries:
        shift = shifts_by_id.get(str(entry.service_shift_id))
        if not shift:
            continue
        aligned_entries.append(entry)
        aligned_shifts.append(shift)
        queue = waitlist_repo.list_for_shift(entry.service_shift_id) or []
        for idx, queued in enumerate(queue):
            if queued.volunteer_id == volunteer_id:
                position_by_shift[entry.service_shift_id] = idx + 1
                break

    return aligned_entries, aligned_shifts, position_by_shift
