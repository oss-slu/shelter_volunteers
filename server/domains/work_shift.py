import uuid
import dataclasses


@dataclasses.dataclass
class WorkShift:
    code: uuid.UUID
    worker: str
    shelter: str
    start_time: int  # number of milliseconds since the Epoch in UTC
    end_time: int

    @classmethod
    def from_dict(self, d):
        return self(**d)

    def to_dict(self):
        return dataclasses.asdict(self)
