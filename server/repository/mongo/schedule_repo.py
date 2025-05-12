"""Repository for interacting with the schedules
collection using ServiceShift structure."""

from repository.mongo.service_shifts import (
    ServiceShiftsMongoRepo
)

class ScheduleMongoRepo(ServiceShiftsMongoRepo):
    def __init__(self):
        super().__init__("schedule")
