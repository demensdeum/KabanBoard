#!/bin/bash

# Start MongoDB in the background
echo "Starting MongoDB..."
mongod --fork --logpath /var/log/mongod.log --bind_ip 127.0.0.1 --dbpath /data/db

# Wait for MongoDB to start
echo "Waiting for MongoDB to become ready..."
until mongosh --eval "print(\"waited for connection\")"
do
    sleep 2
done
echo "MongoDB is ready."

# Start the Node.js Server
echo "Starting Kaban Web Server..."
cd /app/server
node index.js
