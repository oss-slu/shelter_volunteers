"""Use case for adding schedule templates."""
from repository.mongo.service_shifts import ServiceShiftsMongoRepo
from responses import Response, ResponseTypes

def schedule_add_use_case(shifts_data):
    """Add schedule templates to the schedule collection."""
    repo = ServiceShiftsMongoRepo(collection_name='schedule')
    
    try:
        inserted_ids = []
        for shift in shifts_data:
            #validate that it has a service field
            if 'service' not in shift:
                return Response.failure(
                    ResponseTypes.PARAMETER_ERROR, 
                    "Each shift must have a service field"
                )
            
            result = repo.insert(shift)
            inserted_ids.append(str(result))
        
        return Response.success({"ids": inserted_ids})
        
    except Exception as e:
        return Response.failure(ResponseTypes.INTERNAL_ERROR, str(e))
    