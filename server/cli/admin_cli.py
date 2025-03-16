"""
This script is used to create system and shelter admins from the command line.
"""
import argparse
from use_cases.authorization.add_system_admin import add_system_admin
from use_cases.authorization.add_shelter_admin import add_shelter_admin
from repository.mongo.authorization import PermissionsMongoRepo
from responses import ResponseTypes

def create_system_admin(email):
    permissions_repo = PermissionsMongoRepo()
    response = add_system_admin(permissions_repo, email)
    if response.response_type == ResponseTypes.SUCCESS:
        print(f"System admin permissions granted to {email}")
    else:
        print(response.value)


def create_shelter_admin(email, shelter_id):
    permissions_repo = PermissionsMongoRepo()
    response = add_shelter_admin(permissions_repo, shelter_id, email)
    if response.response_type == ResponseTypes.SUCCESS:
        print(f"Shelter admin permissions granted to {email} for shelter {shelter_id}")
    else:
        print(response.value)

def main():
    parser = argparse.ArgumentParser(
        description='Create a system admin or shelter admin by email address.'
        )
    subparsers = parser.add_subparsers(
        dest='admin_type',
        required=True, help='Type of admin to create'
        )

    system_admin_parser = subparsers.add_parser(
        'system',
        help='Create a system admin'
        )
    system_admin_parser.add_argument(
        'email',
        type=str,
        help='The email address of the user to be granted system admin permissions'
        )

    shelter_admin_parser = subparsers.add_parser(
        'shelter',
        help='Create a shelter admin'
        )
    shelter_admin_parser.add_argument(
        'email',
        type=str,
        help='The email address of the user to be granted shelter admin permissions'
        )
    shelter_admin_parser.add_argument(
        'shelter_id',
        type=str, help='The ID of the shelter'
        )

    args = parser.parse_args()

    if args.admin_type == 'system':
        create_system_admin(args.email)
    elif args.admin_type == 'shelter':
        create_shelter_admin(args.email, args.shelter_id)

if __name__ == "__main__":
    main()
