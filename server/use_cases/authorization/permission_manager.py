from domains.authorization.user_permission import UserPermission
from domains.authorization.access import Access
from domains.resources import Resources
from responses import ResponseSuccess

class PermissionManager:
    def __init__(self, permissions_repo):
        self.permissions_repo = permissions_repo

    def add_shelter_admin(self, shelter_id: str,  admin_email: str):
        """
        Add a shelter admin to the system
        """
        user_permission = self.permissions_repo.get_user_permissions(
            admin_email
        )
        print(user_permission)
        if user_permission == None:
            user_permission = UserPermission(email=admin_email)
            self.permissions_repo.add(user_permission)
        if self.user_manages(user_permission, Resources.SHELTER, shelter_id):
            return ResponseSuccess({'message': 'This user is already an admin for this shelter'})

        # check if this user is already an admin for some other shelter
        shelter_admin_access = self.find_access(user_permission, Resources.SHELTER)
        if (shelter_admin_access is None):
            shelter_admin_access = Access(resource_type=Resources.SHELTER)
            user_permission.full_access.append(shelter_admin_access)
        # add shelter_admin role to the user for this shelter_id
        shelter_admin_access.resource_ids.append(shelter_id)

        self.permissions_repo.update(user_permission)
        return ResponseSuccess({'message': 'User added as admin for this shelter'})

    def add_system_admin(self, user_email: str):
        """
        Add a system admin to the system
        """
        user_permission = self.permissions_repo.get_user_permissions(user_email)
        create_new_user_permission = False

        if user_permission == None:
            user_permission = UserPermission.from_dict({'email': user_email})
            create_new_user_permission = True
        if self.user_manages(user_permission, Resources.SYSTEM):
            return ResponseSuccess({'message': 'This user is already a system admin'})

        # add system_admin role to the user
        admin_role = Access(resource_type=Resources.SYSTEM)
        user_permission.full_access.append(admin_role)
        if create_new_user_permission:
            self.permissions_repo.add(user_permission)
        else:
            self.permissions_repo.update(user_permission)
        return ResponseSuccess({'message': 'User added as system admin'})


    def get_user_permissions(self, user_email):
        userPermission = self.permissions_repo.get_user_permissions(user_email)
        return ResponseSuccess(userPermission)
    
    def user_has_permission(self, userPermission: UserPermission, resource_type: str, resource_id=None):
        if userPermission == None:
            return False

        if self.user_manages(userPermission, resource_type, resource_id):
            return True

        # check if this user already has shelter_admin role
        for access in userPermission.full_access:
            # system admin can do anything
            if access.resource_type == Resources.SYSTEM:
                return True

        return False

    def find_access(self, user_permission, resource_type: str):
        for access in user_permission.full_access:
            if access.resource_type == resource_type:
                return access
        return None

    def user_manages(self, user_permission: UserPermission, resource_type: str, resource_id=None):
        if user_permission == None:
            return False
        for access in user_permission.full_access:
            if (access.resource_type == resource_type and 
                resource_id is None and 
                access.resource_ids == []):
                return True
            elif access.resource_type == resource_type and resource_id is not None:
                for id in access.resource_ids:
                    if id == resource_id:
                        return True
        return False