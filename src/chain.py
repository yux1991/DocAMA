import abc
import os
from langchain import LLMChain, PromptTemplate
from langchain.chains.conversation.memory import ConversationSummaryBufferMemory
from templates import PROMPT_TEMPLATES
from llm_multiton import LLMMultiton

class AbstractChain(abc.ABC):
    def __init__(self, config):
        self._config = config
        self._chain_name=self._config.chain_name
        self._memory_name=self._config.memory_name
        self._prompt_name=self._config.prompt_name
        self._token_limit = self._config.token_limit
        self._llm_config=self._config.llm_configuration

    @abc.abstractclassmethod
    def _get_instance(self):
        pass

    @abc.abstractclassmethod
    def _clear_memory(self):
        pass

    def get_instance(self):
        return self._get_instance()

    def clear_memory(self):
        return self._clear_memory()

class Chain(AbstractChain):
    def __init__(self, config):
        super().__init__(config)
    
    def _get_instance(self):
        llm = LLMMultiton.get_instance(LLMMultiton.Key(self._llm_config)).get_instance()
        template = PROMPT_TEMPLATES[self._prompt_name]
        prompt = PromptTemplate(
            input_variables=["chat_history", "human_input"], template=template
        )

        if self._chain_name == 'Conversation':
            if self._memory_name == 'ConversationSummaryBuffer':
                self.memory=ConversationSummaryBufferMemory(
                    llm=llm,
                    max_token_limit=self._token_limit,
                    memory_key="chat_history",
                    ai_prefix="Chatbot"
                )

                llm_chain = LLMChain(
                    llm=llm,
                    prompt=prompt,
                    verbose=True,
                    memory=self.memory,
                )
            return llm_chain

    def _clear_memory(self):
        self.memory.clear()