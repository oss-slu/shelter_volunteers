"""
This module contains the use case for adding shelters.
"""
from domains.shelter.shelter import Shelter

def shelter_add_use_case(repo, shelter: Shelter):
    """
    The function adds a shelter into the chosen database.
    """
    if not isinstance(shelter, Shelter):
        raise TypeError("shelter must be an instance of Shelter")
    
    shelter_dict = shelter.to_dict()
    repo.add(shelter_dict)
    shelter_id = shelter_dict["_id"]
    shelter.set_id(shelter_id)
    return {"id": shelter_id, "success": True,
            "message": "Shelter added successfully"}


