from langchain_groq import ChatGroq
import os
from dotenv import load_dotenv
from prompts import evaluator_prompt_v1, condesnor_prompt_v1
from temp import temporary_job, temporary_resume
from langsmith import Client
import json

client = Client()


class Agent:
    def __init__(self, model):
        self.model = model
        self.system_prompt = "You are a helpful assistant."

    def generate_response(self, prompt: str):
        messages = [("system", self.system_prompt), ("human", prompt)]
        response = self.model.invoke(messages)

        return response


class CondensorAgent(Agent):
    def __init__(self, model):
        super().__init__(model)
        self.system_prompt = condesnor_prompt_v1()


class EvaluatorAgent(Agent):
    def __init__(self, model, resume):
        super().__init__(model)
        self.system_prompt = evaluator_prompt_v1(resume=resume)


class CondensorEvaluatorGraph:
    api_calls = 0

    def __init__(self, condensor: CondensorAgent, evaluator: EvaluatorAgent):
        self.condensor = condensor
        self.evaluator = evaluator

    def execute_graph(self, condensor_prompt: str) -> dict:
        condensed_information = self.condensor.generate_response(condensor_prompt)
        CondensorEvaluatorGraph.api_calls += 1

        evaluated_information = self.evaluator.generate_response(
            condensed_information.content
        )
        CondensorEvaluatorGraph.api_calls += 1

        evaluated_json = {
            "response_condensor": condensed_information.content,
            "metadata_condensor": condensed_information.response_metadata,
            "response_evaluator": evaluated_information.content,
            "metadata_evaluator": evaluated_information.response_metadata,
            "api_calls": CondensorEvaluatorGraph.api_calls,
        }

        return json.dumps(evaluated_json, indent=2)


if __name__ == "__main__":
    load_dotenv()

    groq_key = os.getenv("GROQ_API_KEY")
    langsmith_key = os.getenv("LANGSMITH_API_KEY")

    os.system("export LANGCHAIN_TRACING_V2=true")

    model = ChatGroq(
        model="llama-3.1-70b-versatile",
        temperature=0,
        max_tokens=None,
        timeout=None,
        max_retries=2,
    )

    condensor = CondensorAgent(model)
    evaluator = EvaluatorAgent(model, resume=temporary_resume())
    graph = CondensorEvaluatorGraph(condensor, evaluator)

    response = graph.execute_graph(temporary_job())
    print(response)
