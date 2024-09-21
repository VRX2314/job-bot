from fastapi import FastAPI

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


load_dotenv()

groq_key = os.getenv("GROQ_API_KEY")
langsmith_key = os.getenv("LANGSMITH_API_KEY")

os.system("export LANGCHAIN_TRACING_V2=true")

# model = ChatGroq(
#     model="llama-3.1-70b-versatile",
#     temperature=0,
#     max_tokens=None,
#     timeout=None,
#     max_retries=2,
# )

client = Client()

app = FastAPI()

# To connect to front end
origins = ["http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
    crawler = LLMCrawler(config, model, temporary_resume())

    return StreamingResponse(crawler.scrape(), media_type="text/event-stream")


@app.post("/setup-params-groq")
async def set_params_groq(
    api_key: str = groq_key, model_backbone: str = "llama-3.1-70b-versatile"
):
    global model
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
        "api": model.groq_api_key,
    }


@app.post("/setup-params-ollama")
async def set_params_ollama():
    pass


@app.post("/stream-llm-hybrid")
async def stream_llm_hybrid(query: str, location: str):
    crawler = LLMCrawler(query, location, model, temporary_resume())

    return StreamingResponse(
        crawler.scrape(hybrid=True), media_type="text/event-stream"
    )


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
