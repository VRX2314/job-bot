from fastapi import FastAPI, Body, File, UploadFile
from typing import Union
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware

from model import LLMCrawler

from langchain_groq import ChatGroq

import json
import asyncio

import pymupdf
import re

from jobspy import scrape_jobs
app = FastAPI()

# To connect to front end
origins = ["http://localhost:3000", "http://localhost:8000", "https://vrx2314-client--3000.prod1a.defang.dev"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

resume = """"""

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

    # if resume == "":
    #     default_resp = {
    #         "job_title": "Invalid Resume",
    #         "company": "Invalid",
    #         "link": "/",
    #         "date": "None",
    #         "response_evaluator": {
    #             "score": 0,
    #             "reasons_match": [""],
    #             "reasons_no_match": [""],
    #             "reasons_match_c": [""],
    #             "reasons_no_match_c": [""]
    #         },
    #         "metadata_evaluator": {
    #             "token_usage": {
    #                 "completion_tokens": 0,
    #                 "prompt_tokens": 0,
    #                 "total_tokens": 0,
    #                 "completion_time": 0,
    #                 "prompt_time": 0,
    #                 "queue_time": 0,
    #                 "total_time": 0
    #             },
    #             "model_name": "none",
    #         },
    #         "api_calls": 0
    #     }
    #
    #     return StreamingResponse(json.dumps(default_resp), media_type="text/event-stream")

    crawler = LLMCrawler("", "", listings, model, resume)

    return StreamingResponse(
        crawler.infer(jobs), media_type="text/event-stream"
    )  # Streaming each JSON immediately


@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        with pymupdf.open(stream=contents, filetype="pdf") as doc:
            text = ""
            for page in doc:
                text += page.get_text()

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
