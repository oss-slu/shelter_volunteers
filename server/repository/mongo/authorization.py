"""
This module handles Mongo database interactions with new service_shift
"""
from domains.authorization.user_permission import UserPermission
from config.mongodb_config import get_db

class PermissionsMongoRepo:
    """
    repo class for service shifts MongoDB operations
    """
    def __init__(self):
        """
        database connection
        """
        self.db = get_db()
        self.collection = self.db.permissions

    def add(self, user_permission):
        """
        adds new UserPermission to the database
        returns the new unique ID assigned to the permission
        """
        user_permission_as_dict = user_permission.to_dict()
        user_permission_as_dict.pop('_id', None)
        result = self.db.permissions.insert_one(user_permission_as_dict)
        user_permission.set_id(result.inserted_id)
    def get_user_permissions(self, user_email):
        """
        gets user permissions by email
        """
        user_permission = self.collection.find_one({'email': user_email})
        if user_permission is None:
            return None
        return UserPermission.from_dict(user_permission)

    def update(self, user_permission):
        """
        updates user permission in the database
        """
        user_permission_as_dict = user_permission.to_dict()
        self.collection.update_one(
            {'_id': user_permission.get_id()},
            {'$set': user_permission_as_dict}
        )

    def delete(self, user_permission):
        """
        deletes user permission from the database
        """
        self.collection.delete_one({'_id': user_permission.get_id()})
