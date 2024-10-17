import os

from fastapi import FastAPI, Body, File, UploadFile
from typing import Union
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware

from model import LLMCrawler
from pymongo import MongoClient

from langchain_groq import ChatGroq

import json
import asyncio

import pymupdf
import re

from jobspy import scrape_jobs

from temp import temporary_resume
import dotenv


dotenv.load_dotenv()
mongo_uri = os.getenv("MONGODBURI")
app = FastAPI()
db_client = MongoClient(mongo_uri)

# To connect to front end
origins = ["http://localhost:3000", "http://localhost:8000", "https://vrx2314-client--3000.prod1a.defang.dev"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# TODO: Better State Management
resume = """"""

####### For DEV Only #######
resume = temporary_resume()
model = ChatGroq(
        model="llama-3.1-70b-versatile",
        temperature=0,
        max_tokens=None,
        timeout=None,
        max_retries=2,
    )
user = "sas the ass"

############################ LLM Config and Calls ############################
@app.post("/setup-params-groq")
async def set_params_groq(
        api_key: Union[str, None] = Body(...), model_backbone: str = "llama-3.1-70b-versatile"
):
    global model
    api_key = json.loads(api_key)["api_key"]
    model = ChatGroq(
        model=model_backbone,
        temperature=0,
        max_tokens=None,
        timeout=None,
        max_retries=2,
        api_key=api_key,
    )

    return {
        "model": model.model_name,
        "temperature": model.temperature,
        "max_tokens": model.max_tokens,
        "api": api_key,
    }


@app.get("/get-model-params")
async def hybrid_params():
    crawler = LLMCrawler("", "", model, resume)
    return {"prompt": str(crawler.hybrid.system_prompt)}


@app.post("/stream-llm-hybrid")
async def stream_llm_hybrid(query: str, location: str, listings: int = 1):
    crawler = LLMCrawler(query, location, listings, model, resume)

    return StreamingResponse(
        crawler.scrape(hybrid=True), media_type="text/event-stream"
    )

@app.post("/stream-llm-jobspy")
async def stream_llm_jobspy(query: str= "", location: str= "", listings: int = 1):
    # TODO: Add provider support
    # TODO: Test performance on LinkedIn, Glassdoor
    jobs = scrape_jobs(
        site_name=["indeed"],
        search_term=query,
        location=location,
        results_wanted=listings,
        country_indeed=location,
        verbose=0,
    )  # Synchronous Process -> Sub 1-second performance

    crawler = LLMCrawler("", "", listings, model, resume)

    return StreamingResponse(
        crawler.infer(jobs), media_type="text/event-stream"
    )  # Streaming each JSON immediately


@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        with pymupdf.open(stream=contents, filetype="pdf") as doc:
            text = "".join(page.get_text() for page in doc)

        processed_text = re.sub(r'\n{2,}|\s*•\s*|\s*\(\w+\)\s*|\s*-\s*', '', text)

        global resume
        resume = processed_text

        return {"success": file.filename, "text": processed_text}

    except Exception as e:
        return {"error": str(e)}


async def stream_json():
    with open("./temp/hybrid_new.json") as json_data:
        data = json.load(json_data)
        json_data.close()

    for i in data:
        yield json.dumps(i, indent=2)
        await asyncio.sleep(0.5)


@app.get("/stream-test")
async def stream_test():
    # return StreamingResponse(stream_json(), media_type="application/stream+json")
    return StreamingResponse(stream_json(), media_type="text/event-stream")

############################ Data Persistence ############################
@app.get("/mongo-test")
async def mongo_test():
    return db_client.list_database_names()

@app.post("/mongo-insert-job")
async def mongo_insert_job(job_listing: dict):
    db = db_client.job_bot_db
    collection = db.jobs
    result = collection.insert_one(job_listing)

    return {"result": str(result)}

@app.post("/mongo-insert-user-data")
async def mongo_insert_user_data(user_data: dict):
    user_data["user"] = user

    db = db_client.job_bot_db
    collection = db.llm_outs
    result = collection.insert_one(user_data)

    return {"result": str(result)}

@app.get("/mongo-get-jobs")
async def mongo_get_jobs():
    pass