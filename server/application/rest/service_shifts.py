"""
This module handles service shift operations.
"""
from flask import Blueprint, request, jsonify
from server.use_cases.add_service_shifts import shift_add_use_case
from server.repository.mongorepo import MongoRepo
from server.domains.service_shift import ServiceShift

service_shift_bp = Blueprint('service_shift', __name__)

repo = MongoRepo()

@service_shift_bp.route('/service_shift', methods=['POST'])
def create_service_shift():
    """
    handles POST request for creating a new service shift
    """
    data = request.get_json()
    new_shift = ServiceShift.from_dict(data)
    result = shift_add_use_case(repo, new_shift)
    #trying to get test case to return in this format
    return jsonify({
        'service_shift_id': str(result.get('_id')),
        'success': 'true'
    })
@service_shift_bp.route('/service_shift/shelter_id/<int:shelter_id>',
                         methods=['GET'])
def get_service_shifts(new_shift =None, existing_shifts=None,
                        shelter_id=shelter_id):
    """
    based on ID, fetch the shifts, need to double check here 
    """
    shelter_id = request.args.get('shelter_id')
    if not shelter_id:
        return jsonify({'success': 'false', 'message':
                        'shelter_id is required'}), 400
    shelter_id = int(shelter_id)
    shifts = shift_add_use_case(repo, new_shift=None, shelter_id=shelter_id)
    return jsonify(shifts)
