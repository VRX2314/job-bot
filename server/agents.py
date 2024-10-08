from prompts import (
    evaluator_prompt_v1,
    condenser_prompt_v1,
    condenser_evaluator_hybrid_prompt_v1
)

from langsmith import Client
import json

client = Client()

# TODO: Refactor in Langgraph for dynamic graph workflows.
class Agent:
    def __init__(self, model_instance):
        self.model = model_instance
        self.system_prompt = "You are a helpful assistant."

    def generate_response(self, prompt: str):
        messages = [("system", self.system_prompt), ("human", prompt)]
        response = self.model.invoke(messages)

        return response

# For locally hosted SLMs to reduce overall token payload.
class CondenserAgent(Agent):
    def __init__(self, model_instance):
        super().__init__(model_instance)
        self.system_prompt = condenser_prompt_v1()


class EvaluatorAgent(Agent):
    def __init__(self, model_instance, resume):
        super().__init__(model_instance)
        self.system_prompt = evaluator_prompt_v1(resume=resume)


class HybridAgent(Agent):
    def __init__(self, model_instance, resume):
        super().__init__(model_instance)
        self.system_prompt = condenser_evaluator_hybrid_prompt_v1(resume=resume)


class CondenserEvaluatorGraph:
    api_calls = 0

    def __init__(
        self, condenser: CondenserAgent, evaluator: EvaluatorAgent, hybrid: HybridAgent
    ):
        self.condenser = condenser
        self.evaluator = evaluator
        self.hybrid = hybrid

    def execute_graph(self, condenser_prompt: str) -> dict:
        condensed_information = self.condenser.generate_response(condenser_prompt)
        CondenserEvaluatorGraph.api_calls += 1

        evaluated_information = self.evaluator.generate_response(
            condensed_information.content
        )
        CondenserEvaluatorGraph.api_calls += 1

        try:
            evaluated_json = {
                "response_condenser": condensed_information.content,
                "metadata_condenser": json.loads(
                    json.dumps(condensed_information.response_metadata, indent=2)
                ),
                "response_evaluator": json.loads(evaluated_information.content),
                "metadata_evaluator": json.loads(
                    json.dumps(evaluated_information.response_metadata, indent=2)
                ),
                "api_calls": CondenserEvaluatorGraph.api_calls,
            }  # TODO Give Camel Case names

        except Exception as e:
            print("PARSER ERROR\n")
            print(e)

        return json.dumps(evaluated_json, indent=2)

    def execute_hybrid_graph(self, prompt: str) -> dict:
        evaluated_information = self.hybrid.generate_response(prompt)
        CondenserEvaluatorGraph.api_calls += 1
        evaluated_json = {}

        try:
            evaluated_json = {
                "response_evaluator": json.loads(evaluated_information.content),
                "metadata_evaluator": json.loads(
                    json.dumps(evaluated_information.response_metadata, indent=2)
                ),
                "api_calls": CondenserEvaluatorGraph.api_calls,
            }  # Give Camel Case names

        except Exception as e:
            print("PARSER ERROR\n")
            print(e)

        return evaluated_json # Type: Dict
