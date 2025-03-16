import argparse
from use_cases.authorization.add_system_admin import add_system_admin
from repository.mongo.authorization import PermissionsMongoRepo
from responses import ResponseTypes

def create_system_admin(email):
    permissions_repo = PermissionsMongoRepo()
    try:
        response = add_system_admin(permissions_repo, email)
        if response.response_type == ResponseTypes.SUCCESS:
            print(f"System admin permissions granted to {email}")
        else:
            print(response.value)
    except Exception as e:
        print(f"Failed to grant system admin permissions: {e}")

def main():
    parser = argparse.ArgumentParser(description='Create a system admin by email address.')
    parser.add_argument('email', type=str, help='The email address of the user to be granted system admin permissions')
    args = parser.parse_args()
    
    create_system_admin(args.email)

if __name__ == "__main__":
    main()