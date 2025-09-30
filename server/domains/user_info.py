import dataclasses
from typing import List


@dataclasses.dataclass
class UserInfo:
    email: str
    first_name: str | None
    last_name: str | None
    phone_number: str | None
    skills: set[str]

    def set_first_name(self, first_name: str):
        self.first_name = first_name

    def set_last_name(self, last_name: str):
        self.last_name = last_name

    def set_phone_number(self, phone_number: str):
        self.phone_number = phone_number

    def add_skill(self, skill: str):
        if len(skill) < 5:
            self.skills.add(skill)

    def remove_skill(self, skill: str):
        self.skills.remove(skill)

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
