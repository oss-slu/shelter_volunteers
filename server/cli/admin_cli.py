"""
This script is used to create system and shelter admins from the command line.
"""
import argparse
import getpass
import sys

from authentication.local_admin import set_admin_password
from use_cases.authorization.add_system_admin import add_system_admin
from use_cases.authorization.add_shelter_admin import add_shelter_admin
from repository.mongo.authorization import PermissionsMongoRepo

def create_system_admin(email):
    permissions_repo = PermissionsMongoRepo()
    response = add_system_admin(permissions_repo, email)
    print(response.value)


def create_shelter_admin(email, shelter_id):
    permissions_repo = PermissionsMongoRepo()
    response = add_shelter_admin(permissions_repo, shelter_id, email)
    print(response.value)

def set_local_password(email):
    password = getpass.getpass('New admin password (at least 12 characters): ')
    confirmation = getpass.getpass('Confirm admin password: ')
    if password != confirmation:
        raise ValueError('Passwords do not match')
    set_admin_password(email, password)
    print('Local admin password saved.')

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
        help='The email address of the user to be granted system admin '
             'permissions'
        )

    shelter_admin_parser = subparsers.add_parser(
        'shelter',
        help='Create a shelter admin'
        )
    shelter_admin_parser.add_argument(
        'email',
        type=str,
        help='The email address of the user to be granted shelter admin '
             'permissions'
        )
    shelter_admin_parser.add_argument(
        'shelter_id',
        type=str, help='The ID of the shelter'
        )

    password_parser = subparsers.add_parser(
        'set-password',
        help='Set a local password for an existing system or shelter admin'
    )
    password_parser.add_argument('email', help='Existing system or shelter admin email')

    args = parser.parse_args()

    if args.admin_type == 'system':
        create_system_admin(args.email)
    elif args.admin_type == 'shelter':
        create_shelter_admin(args.email, args.shelter_id)
    elif args.admin_type == 'set-password':
        try:
            set_local_password(args.email)
        except ValueError as exc:
            print(str(exc), file=sys.stderr)
            return 1
    return 0

if __name__ == '__main__':
    sys.exit(main())
