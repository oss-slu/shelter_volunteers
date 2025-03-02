from dataclasses import dataclass
from typing import List

class ActionTypes:
    CREATE = "create"
    READ = "read"
    WRITE = "write"

@dataclass
class Permission:
    resource: str  # e.g., 'shelter'
    actions: List[str]
    resource_id: str
