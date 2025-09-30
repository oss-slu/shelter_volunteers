# Docker instructions to run database component individually

* cd to server folder in the repository
    * In mongo_config.json file update 
        - <code> "name": "MONGODB_HOSTNAME"</code> value from  <code>"value": "mongodb" </code> to <code>"value": "localhost" </code>
    * In run_dev_server.sh file update
        - <code>flask run --debug -h 0.0.0.0 -p 5001</code> to <code> flask run --debug </code> --debug </code>
* In the docker-compose file, comment all services other than mongodb and data-importer.
* run <code>docker-compose up</code>

This will create the Mongo DB using Docker with below details:


<b>DB name: </b>volunteers_db  
<b>Collection: </b>shifts (has 3 documents to start with)  
<b>Connection String: </b>mongodb://localhost:27017/ (for pymongo: client = MongoClient('localhost', 27017))