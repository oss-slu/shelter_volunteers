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
     ```
   * If you do not already have a MongoDB Atlas cluster, follow the [MongoDB Atlas setup guide](docs/mongodb_atlas_setup.md) to create one and capture the connection string.
   * Keep this file local—do not commit it to the repository.

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
