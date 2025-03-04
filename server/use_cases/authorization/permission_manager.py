from domains.authorization.user_permission import UserPermission
from domains.authorization.role import Role, RoleTypes
from domains.authorization.permission import Permission, ActionTypes
from domains.resources import Resources
from responses import ResponseSuccess

class PermissionManager:
    def __init__(self, permissions_repo):
        self.permissions_repo = permissions_repo

    def add_shelter_admin(self, shelter_id: str,  admin_email: str):
        """
        Add a shelter admin to the system
        """
        user_permission_response = self.get_user_permissions(admin_email)
        user_permission = user_permission_response.value
        if user_permission == None:
            user_permission = UserPermission.from_dict({'email': admin_email})
            self.permissions_repo.add(user_permission)
        if self.user_has_permission(user_permission, Resources.SHELTER, ActionTypes.WRITE, shelter_id):
            return ResponseSuccess({'message': 'This user is already an admin for this shelter'})

        # add shelter_admin role to the user
        admin_role = Role.from_dict({'role_type': RoleTypes.SHELTER_ADMIN})
        admin_role.permissions.append(Permission.from_dict({
            'resource': Resources.SHELTER, 
            'actions': [ActionTypes.WRITE], 
            'resource_id': shelter_id}))
        
        user_permission.roles.append(admin_role)
        self.permissions_repo.update(user_permission)
        return ResponseSuccess({'message': 'User added as admin for this shelter'})

    def add_system_admin(self, user_email: str):
        """
        Add a system admin to the system
        """
        user_permission = self.get_user_permission(user_email)
        create_new_user_permission = False

        if user_permission == None:
            user_permission = UserPermission.from_dict({'email': user_email})
            create_new_user_permission = True
        if self.user_has_permission(user_permission, Resources.SYSTEM, ActionTypes.WRITE):
            return ResponseSuccess({'message': 'This user is already a system admin'})

        # add system_admin role to the user
        admin_role = Role.from_dict({'role_type': RoleTypes.SYSTEM_ADMIN})
        user_permission.roles.append(admin_role)
        if create_new_user_permission:
            self.permissions_repo.add(user_permission)
        else:
            self.permissions_repo.update(user_permission)
        return ResponseSuccess({'message': 'User added as system admin'})


    def get_user_permissions(self, user_email):
        userPermission = self.permissions_repo.get_user_permissions(user_email)
        return ResponseSuccess(userPermission)
    
    def user_has_permission(self, userPermission: UserPermission, resource_type: str, action_type: str, resource_id=None):
        if userPermission == None:
            return False

        # check if this user already has shelter_admin role for this shelter
        for role in userPermission.roles:
            # system admin can do anything
            if role.role_type == RoleTypes.SYSTEM_ADMIN:
                return True
            # check permissions associated with the role and see if they match
            # the requested resource type and resource id
            else:
                for p in role.permissions:
                    if p.resource == resource_type and p.resource_id == resource_id:
                        for a in p.actions:
                            if a == action_type:
                                return true 
        return False
