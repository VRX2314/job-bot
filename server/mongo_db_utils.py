import dotenv
import os
from  pymongo import MongoClient

dotenv.load_dotenv()
mongo_uri = os.getenv("MONGODBURI")

db_client = MongoClient(mongo_uri)

def mongo_insert_job(job_listing: dict):
    db = db_client.job_bot_db
    collection = db.jobs
    result = collection.insert_one(job_listing)

    return {"result": str(result)}