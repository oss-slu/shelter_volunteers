from domains.user_info import UserInfo
from repository.mongo.user_info_repository import UserInfoRepository
from typing import List


def save_user_info(
        email: str,
        first_name: str,
        last_name: str,
        phone_number: str,
        skills: List[str],
        repo: UserInfoRepository):
    result = UserInfo.create(
        email=email, first_name=first_name, last_name=last_name,
        phone_number=phone_number, skills=set(skills))

    if result.status == "success":
        repo.save(result.data)

    return result
