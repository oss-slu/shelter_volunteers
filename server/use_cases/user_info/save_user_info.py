from domains.user_info import UserInfo
from repository.mongo.user_info_repository import UserInfoRepository


def save_user_info(user_info: UserInfo, repo: UserInfoRepository):
    repo.save(user_info)