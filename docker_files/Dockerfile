# Use the official MongoDB image as the base image
FROM mongo

# Copy your JSON file into the container
COPY volunteers.json /volunteers.json


# Run a script to import data from the JSON file into MongoDB
CMD mongoimport --host mongodb --db volunteers_db --collection shifts --type json --file /volunteers.json --jsonArray
