from repository.mongo.user_info_repository import UserInfoRepository


def get_user_info_by_email(email: str, repo: UserInfoRepository):
    return repo.get_by_email(email)