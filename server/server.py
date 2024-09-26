from fastapi import FastAPI, Body, File, UploadFile
from typing import Union
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware

from model import LLMCrawler
from temp import temporary_job, temporary_resume

from langsmith import Client
from langchain_groq import ChatGroq

import os
from dotenv import load_dotenv
import json
import asyncio

import pymupdf
import re

load_dotenv()

groq_key = os.getenv("GROQ_API_KEY")
langsmith_key = os.getenv("LANGSMITH_API_KEY")
os.system("export LANGCHAIN_TRACING_V2=true")

resume = """"""

client = Client()

app = FastAPI()

# To connect to front end
origins = ["http://localhost:3000", "http://localhost:8000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = ChatGroq(
    model="llama-3.1-70b-versatile",
    temperature=0,
    max_tokens=None,
    timeout=None,
    max_retries=2,
)


@app.get("/stream-llm")
async def stream_llm():
    config_path = "./config/config.json"
    if os.path.exists(config_path):
        with open(config_path, "r") as file:
            config = json.load(file)
        print("Config loaded:", config)
    else:
        print(f"Config file {config_path} does not exist.")
    crawler = LLMCrawler(config, model, resume)

    return StreamingResponse(crawler.scrape(), media_type="text/event-stream")


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


@app.post("/setup-params-ollama")
async def set_params_ollama():
    pass


@app.post("/stream-llm-hybrid")
async def stream_llm_hybrid(query: str, location: str):
    crawler = LLMCrawler(query, location, model, resume)

    return StreamingResponse(
        crawler.scrape(hybrid=True), media_type="text/event-stream"
    )

@app.get("/get-model-params")
async def hybrid_params():
    crawler = LLMCrawler("", "", model, resume)
    return {"prompt": str(crawler.hybrid.system_prompt)}


async def stream_json():
    with open("./temp/hybrid.json") as json_data:
        data = json.load(json_data)
        json_data.close()

    for i in data:
        yield json.dumps(i, indent=2)
        await asyncio.sleep(0.5)


@app.get("/stream-test")
async def stream_test():
    # return StreamingResponse(stream_json(), media_type="application/stream+json")
    return StreamingResponse(stream_json(), media_type="text/event-stream")

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