"""
This module handles service shift operations.
"""
from flask import Blueprint, request, Response, jsonify
from flask_cors import cross_origin
from use_cases.add_service_shifts import shift_add_use_case
from use_cases.list_service_shifts_use_case import service_shifts_list_use_case
from repository.mongo.service_shifts import ServiceShiftsMongoRepo
from domains.service_shift import ServiceShift
from application.rest.work_shift import HTTP_STATUS_CODES_MAPPING
from responses import ResponseTypes
from serializers.service_shift import ServiceShiftJsonEncoder
import json

service_shift_bp = Blueprint('service_shift', __name__)

@service_shift_bp.route('/service_shift', methods=['GET', 'POST'])
@cross_origin()
def handle_service_shift():
    """
    Handles POST to add service shifts and GET to list all shifts for a shelter.
    """
    repo = ServiceShiftsMongoRepo()

    if request.method == 'GET':
        shelter_id_string = request.args.get('shelter_id')
        filter_start_after_string = request.args.get('filter_start_after')

        # Ensure proper conversion to int, handling empty or invalid cases
        shelter_id = int(shelter_id_string) if shelter_id_string and shelter_id_string.isdigit() else None
        filter_start_after = int(filter_start_after_string) if filter_start_after_string and filter_start_after_string.isdigit() else None

        shifts = service_shifts_list_use_case(repo, shelter_id, filter_start_after)

        return Response(
            json.dumps([shift.to_dict() for shift in shifts], cls=ServiceShiftJsonEncoder),
            mimetype='application/json',
            status=HTTP_STATUS_CODES_MAPPING[ResponseTypes.SUCCESS]
        )

    elif request.method == 'POST':
        shifts_as_dict = request.get_json()

        # Validate that the JSON payload is present
        if not shifts_as_dict:
            return jsonify({'error': 'Invalid JSON payload'}), 400

        # Convert to ServiceShift objects
        try:
            shifts_obj = [ServiceShift.from_dict(shift) for shift in shifts_as_dict]
        except Exception as e:
            return jsonify({'error': f'Invalid data format: {str(e)}'}), 400

        add_response = shift_add_use_case(repo, shifts_obj)
        status_code = HTTP_STATUS_CODES_MAPPING[ResponseTypes.PARAMETER_ERROR]

        if add_response.get('success'):  # Ensure 'success' exists in response
            status_code = HTTP_STATUS_CODES_MAPPING[ResponseTypes.SUCCESS]

        return Response(
            json.dumps(add_response, default=str),
            mimetype='application/json',
            status=status_code
        )

# Ensure ServiceShift class has to_dict() method
class ServiceShift:
    def __init__(self, id, shelter_id, start_time, end_time):
        self.id = id
        self.shelter_id = shelter_id
        self.start_time = start_time
        self.end_time = end_time

    def to_dict(self):
        return {
            'id': self.id,
            'shelter_id': self.shelter_id,
            'start_time': self.start_time,
            'end_time': self.end_time
        }

    @classmethod
    def from_dict(cls, data):
        return cls(
            id=data.get('id'),
            shelter_id=data.get('shelter_id'),
            start_time=data.get('start_time'),
            end_time=data.get('end_time')
        )
