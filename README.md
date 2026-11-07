# Application for shelter volunteers to manage their volunteer time

This application is a work in progress. It uses Flask server with a React JS client. The application is actively being developed and improved.

## Project Overview

Homeless shelters rely on volunteers' help. When inclement weather strikes, homeless shelters get filled with people that need a place to stay, and volunteers' help becomes even more important. There are many people willing to volunteer, but knowing which shelter lacks help is a challenge. The purpose of this application is to simplify the process of scheduling work shifts for volunteers, and to give homeless shelters visibility into their upcoming staffing. The application allows volunteers to select shelters and times when they want to work, see which shelters (and which times) urgently need help, and cancel/reschedule their shifts.

## Getting Started

The first time you want to run this code, you will need to:

1. Clone the repository: <code>git clone https://github.com/oss-slu/shelter_volunteers.git</code>
2. Install server dependencies:
   * <code>cd server</code>
   * <code>python3 -m venv venv</code>
   * Activate virtual environment:
     * On Mac or Linux: <code>source venv/bin/activate</code>
     * On Windows: <code>source ./venv/Scripts/activate</code>
   * <code>pip3 install -r requirements.txt</code>
3. Install client dependencies:
   * <code>cd ../client_app</code>
   * <code>npm install</code>
   * <code>cd ..</code>
4. Configure environment variables:
   * Create <code>server/.env.pre-production</code> and add the following values:
     ```
     MONGODB_HOST=<Atlas connection string without credentials>
     MONGODB_USERNAME=<MongoDB username>
     MONGODB_PASSWORD=<MongoDB password>
     GOOGLE_CLIENT_ID=<Copy the value of REACT_APP_GOOGLE_CLIENT_ID from client_app/src/config.js>
     JWT_SECRET=<Any long random string>
     GETHELP_OAUTH_CLIENT_ID=<GetHelp OAuth client ID>
     GETHELP_OAUTH_CLIENT_SECRET=<GetHelp OAuth client secret>
     ```
   * GetHelp OAuth credentials are only needed for the GetHelp sign-in option, not local admin accounts. Keep them private and configure them on the API server; do not put them in the React client.
   * The GetHelp integration defaults to the existing QA OAuth/API endpoints. For another environment, configure <code>GETHELP_OAUTH_URL</code> and <code>GETHELP_API</code> to the appropriate service URLs.
   * If you do not already have a MongoDB Atlas cluster, follow the [MongoDB Atlas setup guide](docs/mongodb_atlas_setup.md) to create one and capture the connection string.
   * Keep this file local—do not commit it to the repository.

To grant the first system-admin permission, use the exact email address the user will sign in with. From the `server/` directory, with its virtual environment active and `server/.env.pre-production` configured, run:

```bash
FLASK_ENV=pre-production python -m cli.admin_cli system admin@example.com
```

This adds a system-admin permission in MongoDB; it does not create or change the user's GetHelp password. To set or reset a separate local-admin password for an existing system or shelter admin, run:

```bash
FLASK_ENV=pre-production python -m cli.admin_cli set-password admin@example.com
```

Enter and confirm a password of at least 12 characters when prompted. The password is not echoed or placed in shell history; only a salted password hash is stored in MongoDB. Choose **Local admin account** on the admin sign-in page. Passwords are case-sensitive, and the email must match the permission record exactly. Five failed attempts lock that local account until the 15-minute window starting with the first attempt expires; the same command resets its password and lock.

Use HTTPS outside local development and configure additional network-level rate limiting for the login endpoint before public deployment. The per-account lock does not limit traffic across unknown accounts or IP addresses.

Browser sign-in uses an HttpOnly, SameSite=Lax cookie instead of browser local
storage. Sessions last one hour and survive refreshes; existing local-storage
sessions are cleared, so users must sign in again after this change. Cookies
are Secure outside Flask's development/testing configuration, so production
requires HTTPS. The frontend and API must be same-site; configure `CLIENT_URLS`
with exact trusted frontend origins if they are cross-origin. Cookie requests
include a custom header for CSRF protection, so do not allow untrusted origins
in the CORS allow-list. Sign-out clears the browser cookie; issued tokens remain
valid until they expire. Existing non-browser clients may continue using the
Authorization header.

On all subsequent runs, you will need to:

1. Run the Flask API server:
   * <code>cd server</code>
   * Activate virtual environment: <code>source venv/bin/activate</code> (or <code>source ./venv/Scripts/activate</code> on Windows)
   * <code>bash run_dev_server.sh</code>
   * The API is available at <code>http://localhost:5001</code>

2. Run the React client (in a separate terminal):
   * <code>cd client_app</code>
   * <code>npm start</code>
   * The client is available at <code>http://localhost:3000</code>

## Contributing

We welcome contributions of all sizes. Before opening a pull request:

1. Read the [contributing guide](CONTRIBUTING.md) for coding standards, commit conventions, and review expectations.
2. Pick an existing issue or create a new one describing the change you plan to make.
3. Develop your work on a feature branch, add or update tests as needed, and open a pull request when ready.

The contributing guide also covers how to report bugs and propose new features.
