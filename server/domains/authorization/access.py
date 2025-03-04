import dataclasses
from typing import List

@dataclasses.dataclass
class Access:
    # one of the values from domains.resources.Resources
    resource_type: str 
    # List of resource IDs
    resource_ids: List[str] = dataclasses.field(default_factory=list) 

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
