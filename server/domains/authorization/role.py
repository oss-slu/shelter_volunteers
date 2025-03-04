import dataclasses
from typing import List
from domains.authorization.permission import Permission

class RoleTypes:
    SYSTEM_ADMIN = "system admin"
    SHELTER_ADMIN = "shelter admin"
    VOLUNTEER = "volunteer"

@dataclasses.dataclass
class Role:
    role_type: RoleTypes
    permissions: List[Permission] = dataclasses.field(default_factory=list)

    @classmethod
    def from_dict(cls, d):
        """
        Creates a Role instance from a dictionary.
        """
        return cls(**d)

    def to_dict(self):
        """
        Converts the Role instance into a dictionary.
        """
        return dataclasses.asdict(self)
