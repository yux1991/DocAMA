import abc
import os
from langchain import HuggingFaceHub
from langchain.llms import OpenAI

class AbstractLLM(abc.ABC):
    def __init__(self, config):
        self._config = config

    @abc.abstractclassmethod
    def _get_llm(self,user_input):
        pass

    def get_llm(self):
        return self._get_llm()

class LLM(AbstractLLM):
    def __init__(self, config):
        super().__init__(config)
    
    def _get_llm(self):
        platform = self._config.platform
        if platform == 'openai':
            return OpenAI(model_name=self._config.model_name, model_kwargs={'temperature':self._config.temperature})
        elif platform == 'hugging-face':
            return HuggingFaceHub(repo_id=self._config.model_name, model_kwargs={'temperature':self._config.temperature})