class RoleTypes:
    SYSTEM_ADMIN = "system admin"
    SHELTER_ADMIN = "shelter admin"
    VOLUNTEER = "volunteer"

@dataclass
class Role:
    role_type: RoleTypes
    permissions: List[Permission]
