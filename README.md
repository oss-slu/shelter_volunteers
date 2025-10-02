# Application for shelter volunteers to manage their volunteer time

This application is a work in progress. It uses Flask server with a React JS client.

## Project Overview

Homeless shelters rely on volunteers' help. When inclement weather strikes, homeless shelters get filled with people that need a place to stay, and volunteers' help becomes even more important. There are many people willing to volunteer, but knowing which shelter lacks help is a challenge. The purpose of this application is to simplify the process of scheduling work shifts for volunteers, and to give homeless shelters visibility into their upcoming staffing. The application allows volunteers to select shelters and times when they want to work, see which shelters (and which times) urgently need help, and cancel/reschedule their shifts.

## Getting Started

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