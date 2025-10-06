"""
This module contains the RESTful route handlers
for user_info in the server application.
"""
import json

from flask import Blueprint, Response, request

from application.rest.token_required import token_required_with_request
from repository.mongo.user_info_repository import UserInfoRepository
from use_cases.user_info.get_user_info_by_email import get_user_info_by_email
from use_cases.user_info.save_user_info import save_user_info

user_info_bp = Blueprint("user_info", __name__)
user_info_repo = UserInfoRepository()


def is_skills_proper_type(skills):
    if not isinstance(skills, list): return False
    if any([not isinstance(s, str) for s in skills]): return False
    return True


@user_info_bp.route("/volunteer/profile", methods=["PATCH"])
@token_required_with_request
def patch_user_info(user_email: str):
    user_info = get_user_info_by_email(user_email, user_info_repo)
    if user_info is None:
        return Response(status=404)

    data = request.get_json()

    # Typecheck skills.
    if "skills" in data and not is_skills_proper_type(data["skills"]):
        return Response("Invalid skills", status=400)

    result = save_user_info(
        email=user_info.email,
        first_name=data.get("first_name") or user_info.first_name,
        last_name=data.get("last_name") or user_info.last_name,
        phone_number=data.get("phone_number") or user_info.phone_number,
        skills=data["skills"] if "skills" in data else user_info.skills,
        repo=user_info_repo
    )

    if result.status == "success":
        body = json.dumps(result.data.to_dict())
        return Response(body, status=200)
    else:
        body = json.dumps({"errors": result.errors})
        return Response(body, status=400)


@user_info_bp.route("/volunteer/profile", methods=["POST"])
@token_required_with_request
def post_user_info(user_email: str):
    data = request.get_json()

    # Ensure all fields.
    keys = ["first_name", "last_name", "phone_number", "skills"]
    if any([k not in data for k in keys]):
        return Response("Missing fields", status=400)

    # Typecheck skills.
    skills = data["skills"]
    if not is_skills_proper_type(skills):
        return Response("Invalid skills", status=400)

    result = save_user_info(
        email=user_email,
        first_name=data["first_name"],
        last_name=data["last_name"],
        phone_number=data["phone_number"],
        skills=skills,
        repo=user_info_repo
    )

    if result.status == "success":
        body = json.dumps(result.data.to_dict())
        return Response(body, status=201)
    else:
        body = json.dumps({"errors": result.errors})
        return Response(body, status=400)


@user_info_bp.route("/volunteer/profile", methods=["GET"])
@token_required_with_request
def get_user_info(user_email: str):
    user_info = get_user_info_by_email(user_email, user_info_repo)
    if user_info is None:
        return Response(status=404)

    response = json.dumps(user_info.to_dict())
    return Response(response, status=200)
