from config.mongodb_config import get_db
from domains.user_info import UserInfo


class UserInfoRepository:

    def __init__(self, collection_name = "user_info"):
        self.db = get_db()
        self.collection = self.db[collection_name]

    def save(self, user_info: UserInfo):
        self.collection.insert_one(user_info.to_dict())

    def get_by_email(self, email: str):
        doc =  self.collection.find_one({"email": email})
        if doc is None: return None
        return UserInfo.from_dict(doc)