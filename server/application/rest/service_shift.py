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
    existing_shifts = repo.get_shifts_for_volunteer(data.get("user_id"))
    
    response = shift_add_use_case(repo, new_shift, existing_shifts)
    return jsonify(response)
"""
need to check here, does this route to the correct id?
"""
@service_shift_bp.route('/service_shift/shelter_id/<int:shelter_id>', methods=['GET'])
def retrieve_service_shifts(shelter_id):
    """based on ID, fetch the shifts"""
    shifts = repo.get_shifts_for_shelter(shelter_id)
    return jsonify(shifts)