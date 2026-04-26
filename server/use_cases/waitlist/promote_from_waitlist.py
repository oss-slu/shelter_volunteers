"""
Use case: promote the next eligible volunteer from a shift's waitlist
into a service commitment.

Called when capacity opens up (a commitment is cancelled or
max_volunteer_count is increased).
"""
from domains.service_commitment import ServiceCommitment
from use_cases.add_service_commitments import check_time_overlap


def promote_from_waitlist(
    waitlist_repo,
    commitments_repo,
    shifts_repo,
    service_shift_id: str,
    max_promotions: int = None,
):
    """
    Promote queued volunteers into commitments while there is capacity.

    Iterates the waitlist in FIFO order. Skips entries whose volunteers
    have a time conflict with another shift they're already committed to.
    Removes entries that can't be promoted because the volunteer is now
    already committed (defensive cleanup).

    Returns a list of dicts describing each promotion:
        [{"volunteer_id": ..., "service_commitment_id": ..., "waitlist_entry_id": ...}]
    """
    promotions = []

    shift = shifts_repo.get_shift(service_shift_id)
    if not shift:
        return promotions

    while True:
        if max_promotions is not None and len(promotions) >= max_promotions:
            break

        existing_commitments = commitments_repo.fetch_service_commitments(
            shift_id=service_shift_id
        ) or []
        if len(existing_commitments) >= shift.max_volunteer_count:
            break

        queue = waitlist_repo.list_for_shift(service_shift_id) or []
        if not queue:
            break

        committed_ids = {c.volunteer_id for c in existing_commitments}

        promoted_in_pass = False
        for entry in queue:
            if entry.volunteer_id in committed_ids:
                waitlist_repo.remove_entry(entry.get_id())
                continue

            user_commitments = commitments_repo.fetch_service_commitments(
                user_id=entry.volunteer_id
            ) or []
            user_shift_ids = [
                str(c.service_shift_id) for c in user_commitments if c.service_shift_id
            ]
            user_shifts = shifts_repo.get_shifts(user_shift_ids) if user_shift_ids else []
            if check_time_overlap(shift, user_shifts):
                continue

            new_commitment = ServiceCommitment(
                volunteer_id=entry.volunteer_id,
                service_shift_id=service_shift_id,
            )
            inserted = commitments_repo.insert_service_commitments(
                [new_commitment.to_dict()]
            )
            if not inserted:
                continue
            commitment_id = str(inserted[0])
            waitlist_repo.remove_entry(entry.get_id())
            promotions.append(
                {
                    "volunteer_id": entry.volunteer_id,
                    "service_commitment_id": commitment_id,
                    "waitlist_entry_id": str(entry.get_id()),
                }
            )
            promoted_in_pass = True
            break

        if not promoted_in_pass:
            break

    return promotions
