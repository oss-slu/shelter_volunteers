"""
module for handling the schedule endpoint
"""
from flask import request, jsonify
from application.rest import app
from repository.mongo.service_shifts import ServiceShiftsMongoRepo

#new instance of the repo with the schedule collection
schedule_repo = ServiceShiftsMongoRepo(collection_name='schedule')

@app.route('/schedule', methods=['POST'])
def create_schedule():
    """
    endpoint to create repeatable schedule templates.
    wants a JSON array of service shift objects.
    """
    try:
        #parsing the request body as JSON
        shifts = request.get_json()
        if not shifts or not isinstance(shifts, list):
            return jsonify({'error': 'Expected a list of service shifts'}), 400  
        #going to process every shift
        inserted_ids = []
        for shift in shifts:
            #making sure the shift has required fields
            if 'timestamp' not in shift or 'service' not in shift:
                return jsonify({'error': 'Each shift must have timestamp and service fields'}), 400
            #timestamp here is "milliseconds since midnight" instead of epoch            
            # check this, trying to insert the shift into the schedule collection
            result = schedule_repo.insert(shift)
            inserted_ids.append(str(result))
        #return success with the IDs of created schedules
        return jsonify({'message': 'Schedule created successfully', 'ids': inserted_ids}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    