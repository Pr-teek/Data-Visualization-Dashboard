from flask import Flask, render_template, jsonify
from pymongo import MongoClient
import logging

app = Flask(__name__)

# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["visualization_db"]
collection = db["data_collection"]


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/data")
def get_data():
    data = list(collection.find({}, {"_id": 0}))
    logging.info(f"Number of records fetched: {len(data)}")
    return jsonify(data)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    app.run(debug=True)
