from __future__ import annotations

import dataclasses
import re
from typing import List, Literal, Union

email_pattern = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
phone_number_pattern = re.compile(r'^\d{10}$')


@dataclasses.dataclass
class UserInfo:
    email: str
    first_name: str
    last_name: str
    phone_number: str
    skills: set[str]

    @staticmethod
    def create(email: str, first_name: str, last_name: str, phone_number: str,
               skills: set[str]) -> CreateUserInfoResult:
        errors = []
        if len(email) == 0:
            errors.append("Email is empty.")
        elif not email_pattern.match(email):
            errors.append("Malformed email.")

        if len(phone_number) == 0:
            errors.append("Phone number is empty.")
        elif not phone_number_pattern.match(phone_number):
            errors.append("Malformed phone number. Numbers only, no dashes.")

        if len(first_name) == 0:
            errors.append("First name is empty.")
        if len(last_name) == 0:
            errors.append("Last name is empty.")

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
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'phone_number': self.phone_number,
            'skills': list(self.skills),
        }

    @staticmethod
    def from_dict(d: dict):
        return UserInfo(
            d['email'],
            d['first_name'],
            d['last_name'],
            d['phone_number'],
            d['skills'],
        )


Status = Literal["success", "error"]


@dataclasses.dataclass
class Success:
    data: UserInfo
    status: Literal["success"] = "success"


@dataclasses.dataclass
class Failure:
    errors: list[str]
    status: Literal["error"] = "error"


CreateUserInfoResult = Union[Success, Failure]
