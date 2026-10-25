"""
Domain class for a waitlist entry.

A WaitlistEntry represents a volunteer queued for a ServiceShift that is
already at capacity. Entries are promoted to ServiceCommitments in FIFO
order (by joined_at) when capacity opens up.
"""

import dataclasses
from typing import Optional


@dataclasses.dataclass
class WaitlistEntry:
    """Data class for a single waitlist entry."""

    volunteer_id: str
    service_shift_id: str
    joined_at: int  # epoch ms; ordering key for FIFO promotion
    _id: Optional[str] = None

    def get_id(self):
        """Returns the ID of the waitlist entry."""
        return self._id

    def set_id(self, new_id):
        """Sets the ID of the waitlist entry."""
        self._id = new_id

    @classmethod
    def from_dict(cls, d):
        """Build a WaitlistEntry from a dict, ignoring unknown keys."""
        valid_keys = {f.name for f in dataclasses.fields(cls)}
        filtered = {k: v for k, v in d.items() if k in valid_keys}
        if "_id" in filtered and filtered["_id"] is not None:
            filtered["_id"] = str(filtered["_id"])
        return cls(**filtered)

    def to_dict(self):
        """Convert the WaitlistEntry to a dict."""
        return dataclasses.asdict(self)
