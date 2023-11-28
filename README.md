# Application for shelter volunteers to manage their volunteer time

This application is a work in progress. It uses Flask server with a React JS client.


To run the code, please follow the below instructions:

1. Install Docker on your computer if you do not have one (https://www.docker.com/get-started/)
2. Open the Docker app to start the docker engine (if you are on windows, open services.msc using run command and make sure the docker desktop service is running)
3. Open terminal or shell and cd to the cloned repository's <code>docker_files</code> folder
4. Run the below commands in the same order  
<code>docker build -t volunteer-db-image .</code>  
<code>docker-compose up</code>
5. Start up the Flask server using instructions in the <code>server</code> directory
6. Run the client, using the instructions in the <code>client_app</code> directory
7. For development purposes, use developer@slu.edu as the username and any password, to bypass authentication. This only works when server is running in DEBUG mode and DEV_USER and DEV_CONFIG configurations are enabled.
