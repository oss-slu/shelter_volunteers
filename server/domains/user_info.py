"""
This module contains data for
shelter volunteer contact info
and validation.
"""
from __future__ import annotations

import dataclasses
import re
from typing import Literal, Union

email_pattern = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
phone_number_pattern = re.compile(r"^\d{10}$")


@dataclasses.dataclass
class UserInfo:
    """
    Data class for volunteer contact info. For a new
    user, only `create` should be used. Constructor
    should only be used when populating with info
    already known to be acceptable such as after
    being stored and read back from a database. 
    """
    email: str
    first_name: str | None
    last_name: str | None
    phone_number: str | None
    skills: set[str]

    @staticmethod
    def create(email: str, first_name: str, last_name: str, phone_number: str,
               skills: set[str]) -> CreateUserInfoResult:
        errors = {}
        if len(email) == 0:
            errors["email"] = "Email is empty."
        elif not email_pattern.match(email):
            errors["email"] = "Email is empty."

        if len(phone_number) == 0:
            errors["phoneNumber"] = "Phone number is empty."
        elif not phone_number_pattern.match(phone_number):
            errors["phoneNumber"] = "Malformed phone number. 10 digits only, no dashes or spaces."

        if len(first_name) == 0:
            errors["firstName"] = "First name is empty."
        if len(last_name) == 0:
            errors["lastName"] = "Last name is empty."

        if len(errors) == 0:
            data = UserInfo(
                email,
                first_name,
                last_name,
                phone_number,
                skills
            )
            return Success(data)
        else:
            return Failure(errors)

    def to_dict(self):
        return {
            "email": self.email,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "phone_number": self.phone_number,
            "skills": list(self.skills),
        }

    @staticmethod
    def from_dict(d: dict):
        return UserInfo(
            d["email"],
            d["first_name"],
            d["last_name"],
            d["phone_number"],
            d["skills"],
        )


Status = Literal["success", "error"]


@dataclasses.dataclass
class Success:
    data: UserInfo
    status: Literal["success"] = "success"


@dataclasses.dataclass
class Failure:
    errors: dict[str, str]
    status: Literal["error"] = "error"


CreateUserInfoResult = Union[Success, Failure]
