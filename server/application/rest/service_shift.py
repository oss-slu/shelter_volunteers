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
    shift creation requests here
    """
    data = request.get_json()
    new_shift = ServiceShift.from_dict(data)
    response = shift_add_use_case(repo, new_shift)
    return jsonify(response)
@service_shift_bp.route('/service_shift/shelter_id/<int:shelter_id>',
                         methods=['GET'])
def retrieve_service_shifts(shelter_id):
    """
    based on ID, fetch the shifts, need to double check here 
    """
    shifts = shift_add_use_case(repo, shelter_id)
    return jsonify(shifts)
