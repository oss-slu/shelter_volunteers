# Application for shelter volunteers to manage their volunteer time

This application is a work in progress. It uses Flask server with a React JS client.


## To run the code using one command with Docker Compose, please follow the below instructions:

1. Install Docker on your computer if you do not have one (https://www.docker.com/get-started/)
2. Open the Docker app to start the docker engine (if you are on windows, open services.msc using run command and make sure the docker desktop service is running)
3. Open terminal or shell and run the below command in the the cloned repository 
<code>docker-compose up</code>
4. For development purposes, use developer@slu.edu as the username and any password, to bypass authentication. This only works when server is running in DEBUG mode and DEV_USER and DEV_CONFIG configurations are enabled.

## To run each component separately, please follow the below instructions:

1. Install Docker on your computer if you do not have one (https://www.docker.com/get-started/)
2. Open the Docker app to start the docker engine (if you are on windows, open services.msc using run command and make sure the docker desktop service is running)
3. Open terminal or shell and cd to the <code>database</code> folder in the <code>docker_files</code> folder
4. Run the below commands in the same order  
<code>docker build -t volunteer-db-image .</code>  
<code>docker-compose up</code>
5. Cd to the <code>server</code> directory and use the following instructions to start up the Flask server
  The first time you want to run this code, you will need to:
    Create a virtual environment: <code>python3 -m venv venv</code>
    Activate virtual environment: 
      * On Mac or Linux: <code>source venv/bin/activate</code>
      * On Windows: <code>source ./venv/Scripts/activate</code>
    Install dependencies into the virtual environment: <code>pip3 install -r requirements.txt</code>

    On all subsequent runs, you will need to:
      Activate virtual environment: <code>source venv/bin/activate</code>
      Run the development server:
        * On Mac or Linux: <code>bash run_dev_server.sh</code>
        * On Windows: <code>source ./venv/Scripts/activate</code>
6. Cd to the <code>client_app</code> directory and use the following instructions to run the client
  Install the dependencies of the project: <code>npm install</code>
  Run the app in the development mode: <code>npm start</code>
    + Open [http://localhost:3000](http://localhost:3000) to view it in your browser
    + The page will reload when you make changes
    + You may also see any lint errors in the console  
7. For development purposes, use developer@slu.edu as the username and any password, to bypass authentication. This only works when server is running in DEBUG mode and DEV_USER and DEV_CONFIG configurations are enabled.