import dataclasses
from typing import List

class ActionTypes:
    CREATE = "create"
    READ = "read"
    WRITE = "write"

@dataclasses.dataclass
class Permission:
    resource: str  # e.g., 'shelter'
    actions: List[str]
    resource_id: str

    @classmethod
    def from_dict(cls, d):
        """
        Creates a Permission instance from a dictionary.
        """
        return cls(**d)

    def to_dict(self):
        """
        Converts the Permission instance into a dictionary.
        """
        return dataclasses.asdict(self)
