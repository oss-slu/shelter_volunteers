# Docker instructions

* cd to docker_files folder in the repository
* Run <code>docker build -t volunteer-db-image .</code>
* run <code>docker-compose up</code>

This will create the Mongo DB using Docker with below details:


<b>DB name: </b>volunteers_db  
<b>Collection: </b>shifts (has 3 documents to start with)  
<b>Connection String: </b>mongodb://localhost:27017/ (for pymongo: client = MongoClient('localhost', 27017))


