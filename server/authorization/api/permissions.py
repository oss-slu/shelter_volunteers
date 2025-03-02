from flask import Flask, request, jsonify
from authorization.use_cases.add_permission import PermissionManager
from authorization.auth import get_user_id_from_token

app = Flask(__name__)
permission_manager = PermissionManager()

@app.route('/user_permission', methods=['GET', 'POST'])
def permission():
    user_id = get_user_id_from_token(request.headers.get('Authorization'))
    if request.method == 'GET':
        permissions = permission_manager.get_all_permissions()
        return jsonify(permissions), 200

    if request.method == 'POST':
        data = request.get_json()
        shelter_id = data.get('shelter_id')
        user_email = data.get('user_email')
        permission_response = permission_manager.add_shelter_admin(shelter_id, user_email)
        return jsonify(permission_response), 200

if __name__ == '__main__':
    app.run(debug=True)