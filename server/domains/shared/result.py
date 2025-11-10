from dataclasses import dataclass, field
from typing import Generic, Union, TypeVar, Literal

ValueType = TypeVar("ValueType")


@dataclass
class Success(Generic[ValueType]):
    value: ValueType
    is_success: Literal[True] = True


@dataclass
class Failure(Generic[ValueType]):
    keyed_errors: dict[str, list[str]] = field(default_factory=dict)
    generic_errors: list[str] = field(default_factory=list)
    is_success: Literal[False] = False


Result = Union[Success[ValueType], Failure[ValueType]]
