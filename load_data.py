import json
from pymongo import MongoClient

# Replace with your MongoDB connection string if using MongoDB Atlas or a remote instance
connection_string = "mongodb://localhost:27017/"

client = MongoClient(connection_string)
db = client["visualization_db"]
collection = db["data_collection"]

# Open the JSON file with the correct encoding
with open("jsondata.json", "r", encoding="utf-8") as file:
    data = json.load(file)
    collection.insert_many(data)

print("Data inserted successfully.")