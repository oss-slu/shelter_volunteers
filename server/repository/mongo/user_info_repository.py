"""
This module contains the repository
class for user_info collection.
"""
from config.mongodb_config import get_db
from domains.user_info import UserInfo


class UserInfoRepository:
    """
    A repository to save and get user_info
    from the MongoDB collection.
    """

    def __init__(self, collection_name="user_info"):
        self.db = get_db()
        self.collection = self.db[collection_name]

    def save(self, user_info: UserInfo):
        self.collection.update_one(
            filter={"email": user_info.email},
            update={"$set": user_info.to_dict()},
            upsert=True
        )

    def get_by_email(self, email: str):
        doc = self.collection.find_one({"email": email})
        if doc is None: return None
        return UserInfo.from_dict(doc)
