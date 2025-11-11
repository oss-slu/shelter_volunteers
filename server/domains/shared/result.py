"""Result wrapper types used by use-cases and repositories.

This module provides a minimal Result pattern with Success and Failure
dataclasses so callers can return either a successful value or
structured errors.
"""

from dataclasses import dataclass, field
from typing import Generic, Union, TypeVar, Literal, Dict, List

# Use a short conventional TypeVar name to satisfy linters
T = TypeVar("T")


@dataclass
class Success(Generic[T]):
    """Represents a successful result carrying a value."""

    value: T
    is_success: Literal[True] = True


@dataclass
class Failure(Generic[T]):
    """Represents a failed result with keyed and generic errors."""

    keyed_errors: Dict[str, List[str]] = field(default_factory=dict)
    generic_errors: List[str] = field(default_factory=list)
    is_success: Literal[False] = False


Result = Union[Success[T], Failure[T]]
