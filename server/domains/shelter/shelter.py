"""
This module handles data converstion from dictionary to class obj or vice versa
"""
import uuid
import dataclasses
from domains.shelter.address import Address

@dataclasses.dataclass

class Shelter:
    """
    Data class for shelter-related data.
    """
    name: str
    address: Address
    _id: uuid.UUID = None

    def get_id(self):
        """Returns the ID of the work shift."""
        return self._id
    def set_id(self, new_id):
        """Sets the ID of the work shift."""
        self._id = new_id

    @classmethod
    def from_dict(cls, d):
        """
        The function is a class method that takes in a dictionary
        and returns an instance of the class.
        
        Validates that the required address fields are present.
        """
        #validating address fields
        if "address" not in d:
            raise ValueError("Missing required field: address")
        address_data = d.get("address", {})
        if not isinstance(address_data, dict):
            raise ValueError("Address must be a dictionary")
        #check required address fields
        required_fields = ["street1", "city", "state"]
        missing_fields = [field for field in required_fields
                          if field not in address_data or not address_data[
                              field]]
        if missing_fields:
            raise ValueError(
                f"Missing required address fields: {', '.join(missing_fields)}")
        #address object then shelter object is created
        address_obj = Address(**address_data)
        shelter_data = d.copy()
        shelter_data["address"] = address_obj
        return cls(**shelter_data)
    def to_dict(self):
        """
        The function takes an object and returns a dictionary
        representation of the object.
        """
        return dataclasses.asdict(self)
