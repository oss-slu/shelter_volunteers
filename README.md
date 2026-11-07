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

### Development demo data

The app uses MongoDB, so its seed script is Python/PyMongo rather than SQL. It inserts two fictional shelters, five shifts (two past, three upcoming), and three commitments for `felipealencarlopes@gmail.com` (two past, one upcoming). The fictional addresses and opportunities are not real.

From `server/`, activate the virtual environment and configure your **development database**, then run:

```bash
FLASK_ENV=development python -m scripts.seed_demo_volunteering
```

By default this uses local MongoDB (`localhost:27017`, database `volunteers_db`); check your environment and `.env.development` before running. The script writes to the configured database. It inserts only its reserved fixture IDs, does not overwrite existing records, and stops if those IDs conflict with unrelated data. Reruns preserve existing fixture dates, so future shifts eventually become past shifts. No existing volunteer profile is replaced.

To grant a shelter admin access, use a real shelter ID from the app or the first demo shelter ID shown by the seed command:

```bash
FLASK_ENV=development python -m cli.admin_cli shelter shelter-admin@example.com 65f000000000000000000101
FLASK_ENV=development python -m cli.admin_cli set-password shelter-admin@example.com
```

Use the same `FLASK_ENV` and database for the seed, CLI, and server. For an Atlas-backed pre-production database, substitute `pre-production` only when intentionally working in that database. The password prompt is private; the account has shelter permissions, not system-admin permissions. Select **Local admin account** to sign in.

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

### Deploying to Vercel

The root `vercel.json` configures one Vercel project with two services: the
React app at `/` and the Flask API at `/api/*`. The backend adapts the `/api`
prefix to its existing routes; local development and Docker URLs are unchanged.
Vercel Services is a beta feature; see the [Vercel Services documentation](https://vercel.com/docs/services).

1. Import the Git repository into Vercel as a **single project** and leave the
   project root at the repository root. Push the deployment changes to the branch
   you want Vercel to deploy. Each service builds from its own directory.
   Keep Vercel's **Automatically expose System Environment Variables** setting
   enabled so the backend can detect Vercel at runtime.
2. In Vercel project settings, add the following environment variables for the
   environments you will deploy (Preview and/or Production):
   - `MONGODB_HOST`: Atlas cluster hostname only.
   - `MONGODB_USERNAME` and `MONGODB_PASSWORD`: Atlas database-user credentials.
     The existing URI builder requires percent-encoding reserved characters in
     these credentials.
   - `JWT_SECRET`: a long random secret; do not commit it.
   - `GOOGLE_CLIENT_ID`: the Google OAuth client ID used by the React app.
   - `MONGODB_DATABASE`: optional; defaults to `volunteers_db`.
   - `GETHELP_OAUTH_CLIENT_ID` and `GETHELP_OAUTH_CLIENT_SECRET`: optional,
     only for GetHelp sign-in; configure its service URLs as documented above.
     `GETHELP_API` is also used for facility information.
3. Configure Atlas network access for Vercel's outbound connections. Dynamic
   Vercel egress means an individual local IP rule will not suffice; follow
   your organization's network/security requirements rather than assuming a
   static IP. Add the deployed frontend origin to Google OAuth's authorized
   JavaScript origins. Preview domains also need appropriate OAuth settings.
4. Deploy and check `/api/health`, a React dashboard URL on refresh, sign-in,
   and a MongoDB-backed endpoint. `/api/health` alone does not test MongoDB.
   Provision admin accounts and seed data deliberately using the local CLI;
   deployments do not seed or modify data automatically. Preview deployments
   using the same Atlas database can read and modify the same data; use a
   separate database and credentials if isolation is needed.

The Flask function uses Atlas mode (`FLASK_ENV=pre-production`) and
`FLASK_CONFIG=production` on Vercel. These values are the defaults; conflicting
values or missing required secrets cause startup to fail. The in-process
reminder scheduler is **disabled on Vercel**: automated reminder emails will
not run there until a separately secured scheduling solution is configured.
It remains enabled for local and existing server deployments. Vercel Hobby
cron jobs cannot run every 10 minutes.

## Contributing

We welcome contributions of all sizes. Before opening a pull request:

1. Read the [contributing guide](CONTRIBUTING.md) for coding standards, commit conventions, and review expectations.
2. Pick an existing issue or create a new one describing the change you plan to make.
3. Develop your work on a feature branch, add or update tests as needed, and open a pull request when ready.

The contributing guide also covers how to report bugs and propose new features.
