from permissions.domains.permission import UserPermission

class PermissionsManager:
    def __init__(self, permissions_repo):
        self.permissions_repo = permissions_repo

    def add_shelter_admin(self, shelter_id: str,  admin_email: str):
        """
        Add a shelter admin to the system
        """
        user_permission = self.get_user_permission(user_email)
        if user_permission == None:
            user_permission = UserPermission({'email': admin_email})
            self.permissions_repo.add(user_permission)
            return {'success': True, 'message': 'User added as admin for this shelter'}
        if self.user_has_permission(user_permission, Resources.SHELTER, ActionTypes.WRITE, shelter_id)
            return {'success': True, 'message': 'This user is already an admin for this shelter'}
        # add shelter_admin role to the user
        admin_role = Role({'role_type': RoleTypes.SHELTER_ADMIN})
        admin_role.permissions.append(Permission(
            {'resource': Resources.SHELTER, 
            'actions': [ActionTypes.WRITE], 
            'resource_id': shelter_id}))
        self.permissions_repo.update(user_permission)

    def add_system_admin(self, user_email: str):
        """
        Add a system admin to the system
        """
        user_permission = self.get_user_permission(user_email)
        if user_permission == None:
            user_permission = UserPermission({'email': user_email})
            admin_role = Role({'role_type': RoleTypes.SYSTEM_ADMIN})
            user_permission.roles.append(admin_role)
            self.permissions_repo.add(user_permission)
            return {'success': True, 'message': 'User added as system admin'}
        if self.user_has_permission(user_permission, Resources.SYSTEM, ActionTypes.WRITE)
            return {'success': True, 'message': 'This user is already a system admin'}

    def get_user_permissions(self, user_email):
        userPermission = permissions_repo.get_user_permissions(user_email)
        return userPermission
    
    def user_has_permission(self, userPermission: UserPermission, resource_type: str, action_type: str, resource_id=None):
        if userPermission == None:
            return false

        # check if this user already has shelter_admin role for this shelter
        for role in userPermission.roles:
            # system admin can do anything
            if role.role_type == RoleTypes.SYSTEM_ADMIN:
                return true
            # check permissions associated with the role and see if they match
            # the requested resource type and resource id
            else:
                for p in role.permissions:
                    if p.resource == resource_type and p.resource_id == resource_id:
                        for a in p.actions:
                            if a == action_type:
                                return true 
        return false

def add_preauthorized_user(email: str, role_ids: List[str]) -> UserPermission:
    """Add a pre-authorized user with specified roles."""
    # Validate email format
    if not self._is_valid_email(email):
        raise ValueError('Invalid email format')
    
    # Check if user already exists
    existing_user = self.find_user_by_email(email)
    if existing_user:
        raise ValueError('User already pre-authorized')

    # Validate all role IDs exist
    if not self._validate_roles(role_ids):
        raise ValueError('One or more invalid role IDs')

    user_permission = UserPermission(
        id=str(uuid4()),
        email=email.lower(),
        roles=role_ids,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )

    self._save_user_permission(user_permission)
    return user_permission

    def has_permission(self, email: str, resource: str, action: str) -> bool:
        """Check if user has specific permission."""
        user_permission = self.find_user_by_email(email)
        if not user_permission:
            return False

        roles = self._get_roles_by_ids(user_permission.roles)
        return any(
            any(
                permission.resource == resource and action in permission.actions
                for permission in role.permissions
            )
            for role in roles
        )

    def get_user_permissions(self, email: str) -> Set[Permission]:
        """Get all permissions for a user."""
        user_permission = self.find_user_by_email(email)
        if not user_permission:
            return set()

        roles = self._get_roles_by_ids(user_permission.roles)
        permissions = set()
        
        for role in roles:
            for permission in role.permissions:
                permissions.add(permission)

        return permissions
