# Application for shelter volunteers to manage their volunteer time

This application is a work in progress. It uses Flask server with a React JS client.

## Project Overview

Homeless shelters rely on volunteers' help. When inclement weather strikes, homeless shelters get filled with people that need a place to stay, and volunteers' help becomes even more important. There are many people willing to volunteer, but knowing which shelter lacks help is a challenge. The purpose of this application is to simplify the process of scheduling work shifts for volunteers, and to give homeless shelters visibility into their upcoming staffing. The application allows volunteers to select shelters and times when they want to work, see which shelters (and which times) urgently need help, and cancel/reschedule their shifts.

## Getting Started

### Preferred option
To run this application, you will need to:
1. [Configure a database connection through MongoDB Atlas](#configure-a-dababase-connection-through-mongodb-atlas)
1. Configure and run the server side
1. Configure and run the client side

#### Configure a dababase connection through MongoDB Atlas
Sign in to MongoDB atlas. You can sign up for free account or use your Google Login to sign in. Follow the prompts to create an account/sign in.

Once you are signed in, click on create new cluster. 

![cluster](docs/1create_cluster.png)
Select the free tier and click on Create Deployment.
![free](docs/2free_tier.png)
In the Connection security screen, pick a username and password you will use to connect to the database. You'll be able to change these later, if needed. Click "Close".
![security](docs/3connection_security.png)

From the left side menu select Network Access.
![network access](docs/network_access.png)
This will open another page, allowing you to edit the IP addresses of incoming connections. To allow connections from anywhere, select "Allow access from anywhere"
![access_from_anywhere](docs/access_from_anywhere.png)
Click on "Confirm" to save your changes.

Now, get the information you will need for configuring the server connection to the database. From the Clusters menu on the left side, click on Connect button next to your cluster name.
![connect](docs/connect.png)
Select the "Drivers" option
![drivers](docs/drivers.png)
This will open up another page, showing the string you will need for your cluster connection. Copy this string, excluding the username and password, as shown in the screenshot below.
![name](docs/cluster_name.png)

Save this string somewhere, you will need it when you configure the server side application.

#### Configure and run the server side
From the server directory, create and activate a python virtual environment (instructions will vary based on your operating system, so look this up online). Install the required dependencies with `pip install -r requirements.txt`. If you are on a mac, you might need to use `pip3` instead of `pip`.

Create a .env.pre-production file in the server directory. In this file, add the following configuration strings (remove the angle brackets):
```
MONGODB_HOST=<The string you saved from your mongodb atlas connection configuration.>
MONGODB_USERNAME=<The username you created when configuring mongodb cluster>
MONGODB_PASSWORD=<The password associated with the username>
GOOGLE_CLIENT_ID=<Copy the value of REACT_APP_GOOGLE_CLIENT_ID from client_app/src/config.js>
JWT_SECRET=<make up some fairly long alphanumeric string>
```
Do NOT commit this file to the repository, because it contains your private information.

Start the server with: bash run_dev_server.sh

#### Configure and run the client side
Navigate to the client_app directory and install dependencies with `npm install`
. Once the dependencies are installed, you can start the client-side application with `npm run start`.
### Docker option
To run the code using one command with Docker Compose, please follow the below instructions:

1. Install Docker on your computer if you do not have one (https://www.docker.com/get-started/)

2. Open the Docker app to start the docker engine (if you are on windows, open services.msc using run command and make sure the docker desktop service is running)

3. Open terminal or shell and run the below command in the the cloned repository
    * Case 1: If you do not want to see changes reflected when the code changes (demo purpose).
    <br><code>docker-compose up</code>
    * Case 2: If you want to see changes reflected when the code changes (development purpose).
    <br><code>docker compose up --watch</code>

4. For development purposes, use developer@slu.edu as the username and any password, to bypass authentication. This only works when server is running in DEBUG mode and DEV_USER and DEV_CONFIG configurations are enabled.

## Contributing

To get started contributing to the project, see the [contributing guide](CONTRIBUTING.md).
This document also includes guidelines for reporting bugs and proposing new features.
