"""
This module contains the use case for getting
user_info from its email field.
"""
from repository.mongo.user_info_repository import UserInfoRepository


def get_user_info_by_email(email: str, repo: UserInfoRepository):
    return repo.get_by_email(email)
