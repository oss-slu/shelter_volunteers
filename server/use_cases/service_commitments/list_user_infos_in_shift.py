"""
This module contains the use case for getting
emails and contact info for all volunteers in a shift.
"""
from typing import List

from domains.user_info import UserInfo
from repository.mongo.service_commitments import MongoRepoCommitments
from repository.mongo.user_info_repository import UserInfoRepository


def list_user_infos_in_shift(
        shift_id: str,
        commitments_repo: MongoRepoCommitments,
        user_info_repo: UserInfoRepository
) -> List[UserInfo]:
    commitments = commitments_repo.fetch_service_commitments(shift_id=shift_id)
    emails = [commitment.volunteer_id for commitment in commitments]
    user_infos = user_info_repo.get_multiple_by_emails(emails)
    user_infos = {
        ui.email: ui for ui in user_infos
    }
    for email in emails:
        if email not in user_infos:
            user_infos[email] = UserInfo(email, None, None, None, set())

    return list(user_infos.values())
