"""Use case for adding schedule templates."""
from repository.mongo.service_shifts import ServiceShiftsMongoRepo
from responses import Response, ResponseTypes
from pymongo.errors import PyMongoError

def schedule_add_use_case(shifts_data):
    """Add schedule templates to the schedule collection."""
    repo = ServiceShiftsMongoRepo(collection_name="schedule")
    try:
        inserted_ids = repo.add_service_shifts(shifts_data)
        return Response.success({"ids": inserted_ids})
    except PyMongoError as e:
        return Response.failure(ResponseTypes.INTERNAL_ERROR, str(e))
    