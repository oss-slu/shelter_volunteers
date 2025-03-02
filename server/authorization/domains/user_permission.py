from dataclasses import dataclass
from typing import List

@dataclass
class UserPermission:
    id: str
    email: str
    roles: List[str]  # Role IDs
